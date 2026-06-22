import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  SyncAppliedChange,
  SyncBootstrapMasters,
  SyncChange,
  SyncPushRequest,
  SyncPushResult,
} from '@synchem-sfa/shared-types';
import { PrismaService } from '../../../infrastructure/persistence/prisma.module';
import type { SyncBatchRecord, SyncRepositoryPort } from '../ports/sync.repository.port';

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && !Number.isNaN(value) ? value : undefined;
}

@Injectable()
export class PrismaSyncRepository implements SyncRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findBatchBySyncId(syncBatchId: string): Promise<SyncBatchRecord | null> {
    const row = await this.prisma.syncBatch.findUnique({ where: { syncBatchId } });
    if (!row?.responseJson) return null;
    return {
      syncBatchId: row.syncBatchId,
      compCode: row.compCode,
      empId: row.empId,
      responseJson: row.responseJson as unknown as SyncPushResult,
    };
  }

  async pushBatch(
    compCode: string,
    empId: string,
    request: SyncPushRequest,
    result: SyncPushResult,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.syncBatch.create({
      data: {
        syncBatchId: request.syncBatchId,
        compCode,
        empId,
        deviceId: request.deviceId,
        requestJson: request as object,
        responseJson: result as object,
        expiresAt,
      },
    });
  }

  async applyChanges(
    compCode: string,
    empId: string,
    changes: SyncChange[],
  ): Promise<{ applied: SyncAppliedChange[]; errors: SyncPushResult['errors'] }> {
    const applied: SyncAppliedChange[] = [];
    const errors: SyncPushResult['errors'] = [];

    const ordered = [...changes].sort((a, b) => {
      const rank = (type: SyncChange['entityType']) => {
        if (type === 'daily_call_report') return 0;
        if (type === 'dcr_doctor_visit' || type === 'dcr_retailer_visit') return 1;
        return 2;
      };
      return rank(a.entityType) - rank(b.entityType);
    });

    await this.prisma.$transaction(async (tx) => {
      for (const change of ordered) {
        try {
          const result = await this.applyOne(tx, compCode, empId, change);
          if (result) applied.push(result);
        } catch (error) {
          errors.push({
            clientId: change.clientId,
            code: 'SYNC_APPLY_FAILED',
            message: error instanceof Error ? error.message : 'Unable to apply change',
          });
        }
      }
    });

    return { applied, errors };
  }

  async pullChanges(
    compCode: string,
    empId: string,
    lastSyncAt: Date | null,
    entityTypes?: SyncChange['entityType'][],
  ): Promise<SyncChange[]> {
    const since = lastSyncAt ?? new Date(0);
    const types = entityTypes ?? ['daily_call_report', 'dcr_doctor_visit', 'dcr_retailer_visit'];
    const changes: SyncChange[] = [];

    if (types.includes('daily_call_report')) {
      const dcrs = await this.prisma.dailyCallReport.findMany({
        where: { compCode, empId, updatedAt: { gt: since } },
      });
      for (const dcr of dcrs) {
        changes.push({
          clientId: dcr.clientId ?? dcr.id,
          serverId: dcr.id,
          entityType: 'daily_call_report',
          operation: 'update',
          version: dcr.version,
          payload: {
            workDate: dcr.workDate.toISOString().slice(0, 10),
            headQuarterId: dcr.headQuarterId,
            routeId: dcr.routeId,
            approveStatus: dcr.approveStatus,
            submittedAt: dcr.submittedAt?.toISOString() ?? null,
          },
        });
      }
    }

    if (types.includes('dcr_doctor_visit')) {
      const visits = await this.prisma.dcrDoctorVisit.findMany({
        where: { compCode, updatedAt: { gt: since }, dcr: { empId } },
      });
      for (const visit of visits) {
        changes.push({
          clientId: visit.clientId ?? visit.id,
          serverId: visit.id,
          entityType: 'dcr_doctor_visit',
          operation: 'update',
          payload: {
            dcrId: visit.dcrId,
            doctorId: visit.doctorId,
            visitOrder: visit.visitOrder,
          },
        });
      }
    }

    if (types.includes('dcr_retailer_visit')) {
      const visits = await this.prisma.dcrRetailerVisit.findMany({
        where: { compCode, updatedAt: { gt: since }, dcr: { empId } },
      });
      for (const visit of visits) {
        changes.push({
          clientId: visit.clientId ?? visit.id,
          serverId: visit.id,
          entityType: 'dcr_retailer_visit',
          operation: 'update',
          payload: {
            dcrId: visit.dcrId,
            retailerId: visit.retailerId,
            visitOrder: visit.visitOrder,
          },
        });
      }
    }

    if (types.includes('gps_check_in')) {
      const pings = await this.prisma.gpsCheckIn.findMany({
        where: { compCode, empId, createdAt: { gt: since } },
      });
      for (const ping of pings) {
        changes.push({
          clientId: ping.clientId,
          serverId: ping.id,
          entityType: 'gps_check_in',
          operation: 'create',
          payload: {
            latitude: Number(ping.latitude),
            longitude: Number(ping.longitude),
            eventType: ping.eventType,
            recordedAt: ping.recordedAt.toISOString(),
          },
        });
      }
    }

    return changes;
  }

  async bootstrapMasters(
    compCode: string,
    headQuarterId: string,
    routeIds?: string[],
  ): Promise<SyncBootstrapMasters> {
    const routes = await this.prisma.route.findMany({
      where: {
        compCode,
        headQuarterId,
        active: true,
        ...(routeIds?.length ? { id: { in: routeIds } } : {}),
      },
      select: { id: true, routeName: true, headQuarterId: true },
    });

    const routeIdList = routes.map((route) => route.id);

    const [doctors, retailers, products] = await Promise.all([
      this.prisma.doctor.findMany({
        where: {
          compCode,
          active: true,
          deletedAt: null,
          ...(routeIdList.length ? { routeId: { in: routeIdList } } : {}),
        },
        select: { id: true, doctorName: true, routeId: true, mobileNo: true },
      }),
      this.prisma.retailer.findMany({
        where: {
          compCode,
          active: true,
          deletedAt: null,
          ...(routeIdList.length ? { routeId: { in: routeIdList } } : {}),
        },
        select: { id: true, retailerName: true, routeId: true },
      }),
      this.prisma.product.findMany({
        where: { compCode, active: true, deletedAt: null },
        select: { id: true, productName: true, productCode: true },
      }),
    ]);

    return {
      doctors,
      retailers,
      routes,
      products: products.map((p) => ({
        id: p.id,
        productName: p.productName,
        productCode: p.productCode ?? '',
      })),
    };
  }

  private async applyOne(
    tx: Prisma.TransactionClient,
    compCode: string,
    empId: string,
    change: SyncChange,
  ): Promise<SyncAppliedChange | null> {
    if (change.entityType === 'daily_call_report') {
      return this.applyDcr(tx, compCode, empId, change);
    }
    if (change.entityType === 'dcr_doctor_visit') {
      return this.applyDoctorVisit(tx, compCode, change);
    }
    if (change.entityType === 'dcr_retailer_visit') {
      return this.applyRetailerVisit(tx, compCode, change);
    }
    if (change.entityType === 'gps_check_in') {
      return this.applyGps(tx, compCode, empId, change);
    }
    return null;
  }

  private async applyDcr(
    tx: Prisma.TransactionClient,
    compCode: string,
    empId: string,
    change: SyncChange,
  ): Promise<SyncAppliedChange> {
    const payload = change.payload;
    const existing = await tx.dailyCallReport.findUnique({
      where: { compCode_clientId: { compCode, clientId: change.clientId } },
    });

    if (change.operation === 'delete') {
      if (!existing) {
        return { clientId: change.clientId, serverId: change.clientId, entityType: change.entityType };
      }
      await tx.dailyCallReport.update({
        where: { id: existing.id },
        data: { approveStatus: 'CANCELLED', version: { increment: 1 } },
      });
      return { clientId: change.clientId, serverId: existing.id, entityType: change.entityType };
    }

    const workDateRaw = asString(payload.workDate);
    if (!workDateRaw) throw new Error('workDate is required');

    const approveStatus = asString(payload.approveStatus) ?? 'DRAFT';
    const submittedAt =
      approveStatus === 'SUBMITTED' ? new Date(asString(payload.submittedAt) ?? Date.now()) : null;

    if (existing) {
      if (change.version && change.version < existing.version) {
        throw new Error('Version conflict');
      }
      const updated = await tx.dailyCallReport.update({
        where: { id: existing.id },
        data: {
          workDate: new Date(workDateRaw),
          headQuarterId: asString(payload.headQuarterId) ?? existing.headQuarterId,
          routeId: asString(payload.routeId) ?? existing.routeId,
          approveStatus,
          submittedAt,
          version: { increment: 1 },
        },
      });
      return { clientId: change.clientId, serverId: updated.id, entityType: change.entityType };
    }

    const created = await tx.dailyCallReport.create({
      data: {
        compCode,
        empId,
        clientId: change.clientId,
        workDate: new Date(workDateRaw),
        headQuarterId: asString(payload.headQuarterId),
        routeId: asString(payload.routeId),
        approveStatus,
        submittedAt,
        version: change.version ?? 1,
      },
    });

    await tx.syncClientMapping.upsert({
      where: {
        compCode_clientId_entityType: {
          compCode,
          clientId: change.clientId,
          entityType: 'daily_call_report',
        },
      },
      create: {
        compCode,
        clientId: change.clientId,
        serverId: created.id,
        entityType: 'daily_call_report',
      },
      update: { serverId: created.id },
    });

    return { clientId: change.clientId, serverId: created.id, entityType: change.entityType };
  }

  private async resolveDcrId(
    tx: Prisma.TransactionClient,
    compCode: string,
    payload: Record<string, unknown>,
  ): Promise<string> {
    const dcrClientId = asString(payload.dcrClientId);
    const dcrId = asString(payload.dcrId);
    if (dcrId) return dcrId;
    if (!dcrClientId) throw new Error('dcrClientId or dcrId is required');

    const mapping = await tx.syncClientMapping.findUnique({
      where: {
        compCode_clientId_entityType: {
          compCode,
          clientId: dcrClientId,
          entityType: 'daily_call_report',
        },
      },
    });
    if (mapping) return mapping.serverId;

    const dcr = await tx.dailyCallReport.findUnique({
      where: { compCode_clientId: { compCode, clientId: dcrClientId } },
    });
    if (!dcr) throw new Error('Parent DCR not found');
    return dcr.id;
  }

  private async applyDoctorVisit(
    tx: Prisma.TransactionClient,
    compCode: string,
    change: SyncChange,
  ): Promise<SyncAppliedChange> {
    const existing = await tx.dcrDoctorVisit.findUnique({
      where: { compCode_clientId: { compCode, clientId: change.clientId } },
    });
    if (existing) {
      return { clientId: change.clientId, serverId: existing.id, entityType: change.entityType };
    }

    const dcrId = await this.resolveDcrId(tx, compCode, change.payload);
    const doctorId = asString(change.payload.doctorId);
    if (!doctorId) throw new Error('doctorId is required');

    const created = await tx.dcrDoctorVisit.create({
      data: {
        compCode,
        dcrId,
        doctorId,
        clientId: change.clientId,
        visitOrder: asNumber(change.payload.visitOrder) ?? 0,
      },
    });

    return { clientId: change.clientId, serverId: created.id, entityType: change.entityType };
  }

  private async applyRetailerVisit(
    tx: Prisma.TransactionClient,
    compCode: string,
    change: SyncChange,
  ): Promise<SyncAppliedChange> {
    const existing = await tx.dcrRetailerVisit.findUnique({
      where: { compCode_clientId: { compCode, clientId: change.clientId } },
    });
    if (existing) {
      return { clientId: change.clientId, serverId: existing.id, entityType: change.entityType };
    }

    const dcrId = await this.resolveDcrId(tx, compCode, change.payload);
    const retailerId = asString(change.payload.retailerId);
    if (!retailerId) throw new Error('retailerId is required');

    const created = await tx.dcrRetailerVisit.create({
      data: {
        compCode,
        dcrId,
        retailerId,
        clientId: change.clientId,
        visitOrder: asNumber(change.payload.visitOrder) ?? 0,
      },
    });

    return { clientId: change.clientId, serverId: created.id, entityType: change.entityType };
  }

  private async applyGps(
    tx: Prisma.TransactionClient,
    compCode: string,
    empId: string,
    change: SyncChange,
  ): Promise<SyncAppliedChange> {
    const existing = await tx.gpsCheckIn.findUnique({ where: { clientId: change.clientId } });
    if (existing) {
      return { clientId: change.clientId, serverId: existing.id, entityType: change.entityType };
    }

    const latitude = asNumber(change.payload.latitude);
    const longitude = asNumber(change.payload.longitude);
    const eventType = asString(change.payload.eventType);
    const recordedAt = asString(change.payload.recordedAt);
    if (latitude === undefined || longitude === undefined || !eventType || !recordedAt) {
      throw new Error('GPS payload incomplete');
    }

    const created = await tx.gpsCheckIn.create({
      data: {
        compCode,
        empId,
        clientId: change.clientId,
        latitude,
        longitude,
        eventType,
        recordedAt: new Date(recordedAt),
      },
    });

    return { clientId: change.clientId, serverId: created.id, entityType: change.entityType };
  }
}
