import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  apiSuccess,
  CreateDcrRequestSchema,
  CreatePobRequestSchema,
  CreateTourProgrammeRequestSchema,
  CreateWeeklyPlanRequestSchema,
  PushTokenRequestSchema,
  type JwtPayload,
} from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import { ApprovalService } from '../approvals/approval.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalService,
  ) {}

  // ─── DCR ───────────────────────────────────────────────────────────────────

  async listDcrs(compCode: string, empId: string) {
    const rows = await this.prisma.dailyCallReport.findMany({
      where: { compCode, empId },
      orderBy: { workDate: 'desc' },
      include: { _count: { select: { doctorVisits: true, retailerVisits: true } } },
    });
    return apiSuccess({
      items: rows.map((row) => ({
        id: row.id,
        workDate: row.workDate.toISOString().slice(0, 10),
        approveStatus: row.approveStatus,
        routeId: row.routeId,
        headQuarterId: row.headQuarterId,
        doctorVisitCount: row._count.doctorVisits,
        retailerVisitCount: row._count.retailerVisits,
      })),
    });
  }

  async createDcr(compCode: string, empId: string, body: unknown) {
    const parsed = CreateDcrRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const existing = await this.prisma.dailyCallReport.findFirst({
      where: { compCode, empId, workDate: new Date(parsed.data.workDate) },
    });
    if (existing) throw new ConflictException('DCR already exists for this date');

    const dcr = await this.prisma.$transaction(async (tx) => {
      const created = await tx.dailyCallReport.create({
        data: {
          compCode,
          empId,
          workDate: new Date(parsed.data.workDate),
          headQuarterId: parsed.data.headQuarterId,
          routeId: parsed.data.routeId,
          approveStatus: 'DRAFT',
        },
      });

      for (const [index, doctorId] of (parsed.data.doctorIds ?? []).entries()) {
        await tx.dcrDoctorVisit.create({
          data: { compCode, dcrId: created.id, doctorId, visitOrder: index + 1 },
        });
      }
      for (const [index, retailerId] of (parsed.data.retailerIds ?? []).entries()) {
        await tx.dcrRetailerVisit.create({
          data: { compCode, dcrId: created.id, retailerId, visitOrder: index + 1 },
        });
      }
      return created;
    });

    return apiSuccess({ id: dcr.id }, 201);
  }

  async submitDcr(compCode: string, empId: string, id: string) {
    await this.assertDcr(compCode, empId, id);
    await this.approvals.submitForApproval(compCode, 'DCR', id, empId);
    return apiSuccess({ id, approveStatus: 'SUBMITTED' });
  }

  // ─── Tour Programme ────────────────────────────────────────────────────────

  async listTourProgrammes(compCode: string, empId: string, month?: number, year?: number) {
    const rows = await this.prisma.tourProgramme.findMany({
      where: {
        compCode,
        empId,
        ...(month ? { planMonth: month } : {}),
        ...(year ? { planYear: year } : {}),
      },
      orderBy: [{ planYear: 'desc' }, { planMonth: 'desc' }],
      include: { _count: { select: { days: true } } },
    });
    return apiSuccess({
      items: rows.map((row) => ({
        id: row.id,
        planMonth: row.planMonth,
        planYear: row.planYear,
        approveStatus: row.approveStatus,
        dayCount: row._count.days,
      })),
    });
  }

  async getTourProgramme(compCode: string, empId: string, id: string) {
    const row = await this.prisma.tourProgramme.findFirst({
      where: { id, compCode, empId },
      include: { days: { orderBy: { dayOfMonth: 'asc' } } },
    });
    if (!row) throw new NotFoundException('Tour programme not found');
    return apiSuccess(row);
  }

  async createTourProgramme(compCode: string, empId: string, body: unknown) {
    const parsed = CreateTourProgrammeRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const rtp = await tx.tourProgramme.create({
          data: {
            compCode,
            empId,
            planMonth: parsed.data.planMonth,
            planYear: parsed.data.planYear,
            approveStatus: 'DRAFT',
          },
        });

        for (const day of parsed.data.days ?? []) {
          await tx.tourProgrammeDay.create({
            data: {
              compCode,
              tourProgrammeId: rtp.id,
              dayOfMonth: day.dayOfMonth,
              routeId: day.routeId ?? null,
              workType: day.workType,
            },
          });
        }
        return rtp;
      });
      return apiSuccess({ id: created.id }, 201);
    } catch {
      throw new ConflictException('Tour programme already exists for this month');
    }
  }

  async submitTourProgramme(compCode: string, empId: string, id: string) {
    await this.assertTourProgramme(compCode, empId, id);
    await this.approvals.submitForApproval(compCode, 'RTP', id, empId);
    return apiSuccess({ id, approveStatus: 'SUBMITTED' });
  }

  // ─── Weekly Plan ───────────────────────────────────────────────────────────

  async listWeeklyPlans(compCode: string, empId: string) {
    const rows = await this.prisma.weeklyPlan.findMany({
      where: { compCode, empId },
      orderBy: { weekStartDate: 'desc' },
      include: { _count: { select: { entries: true } } },
    });
    return apiSuccess({
      items: rows.map((row) => ({
        id: row.id,
        weekStartDate: row.weekStartDate.toISOString().slice(0, 10),
        approveStatus: row.approveStatus,
        entryCount: row._count.entries,
      })),
    });
  }

  async createWeeklyPlan(compCode: string, empId: string, body: unknown) {
    const parsed = CreateWeeklyPlanRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const plan = await tx.weeklyPlan.create({
          data: {
            compCode,
            empId,
            weekStartDate: new Date(parsed.data.weekStartDate),
            approveStatus: 'DRAFT',
          },
        });

        for (const entry of parsed.data.entries ?? []) {
          await tx.weeklyPlanEntry.create({
            data: {
              compCode,
              weeklyPlanId: plan.id,
              planDate: new Date(entry.planDate),
              doctorId: entry.doctorId ?? null,
              notes: entry.notes,
            },
          });
        }
        return plan;
      });
      return apiSuccess({ id: created.id }, 201);
    } catch {
      throw new ConflictException('Weekly plan already exists for this week');
    }
  }

  async submitWeeklyPlan(compCode: string, empId: string, id: string) {
    await this.assertWeeklyPlan(compCode, empId, id);
    await this.approvals.submitForApproval(compCode, 'WEEKLY_PLAN', id, empId);
    return apiSuccess({ id, approveStatus: 'SUBMITTED' });
  }

  async listPobs(compCode: string, empId: string) {
    const rows = await this.prisma.personalOrderBooking.findMany({
      where: { compCode, empId },
      orderBy: { orderDate: 'desc' },
      include: { _count: { select: { lines: true } } },
    });
    return apiSuccess({
      items: rows.map((row) => ({
        id: row.id,
        partyType: row.partyType,
        partyId: row.partyId,
        orderDate: row.orderDate.toISOString().slice(0, 10),
        totalAmount: Number(row.totalAmount),
        approveStatus: row.approveStatus,
        lineCount: row._count.lines,
      })),
    });
  }

  async createPob(compCode: string, empId: string, body: unknown) {
    const parsed = CreatePobRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const totalAmount = parsed.data.lines.reduce((sum, line) => sum + line.qty * line.rate, 0);

    const created = await this.prisma.$transaction(async (tx) => {
      const pob = await tx.personalOrderBooking.create({
        data: {
          compCode,
          empId,
          partyType: parsed.data.partyType,
          partyId: parsed.data.partyId,
          orderDate: new Date(parsed.data.orderDate),
          dcrId: parsed.data.dcrId,
          totalAmount,
          approveStatus: 'DRAFT',
        },
      });

      for (const line of parsed.data.lines) {
        await tx.personalOrderLine.create({
          data: {
            compCode,
            pobId: pob.id,
            productId: line.productId,
            qty: line.qty,
            rate: line.rate,
            amount: line.qty * line.rate,
          },
        });
      }
      return pob;
    });

    return apiSuccess({ id: created.id, totalAmount }, 201);
  }

  async submitPob(compCode: string, empId: string, id: string) {
    const pob = await this.assertPob(compCode, empId, id);
    if (pob.approveStatus !== 'DRAFT') {
      throw new BadRequestException('POB cannot be submitted');
    }

    await this.prisma.personalOrderBooking.update({
      where: { id },
      data: { approveStatus: 'SUBMITTED', submittedAt: new Date(), version: { increment: 1 } },
    });

    return apiSuccess({ id, approveStatus: 'SUBMITTED' });
  }

  async listPobPartyOptions(compCode: string, partyType: string, search?: string) {
    const q = search?.trim();
    const take = 50;
    if (partyType === 'RETAILER') {
      const items = await this.prisma.retailer.findMany({
        where: {
          compCode,
          deletedAt: null,
          active: true,
          ...(q ? { retailerName: { contains: q, mode: 'insensitive' } } : {}),
        },
        take,
        orderBy: { retailerName: 'asc' },
        select: { id: true, retailerName: true },
      });
      return apiSuccess({
        items: items.map((row) => ({ id: row.id, name: row.retailerName })),
      });
    }

    const items = await this.prisma.doctor.findMany({
      where: {
        compCode,
        deletedAt: null,
        active: true,
        ...(q ? { doctorName: { contains: q, mode: 'insensitive' } } : {}),
      },
      take,
      orderBy: { doctorName: 'asc' },
      select: { id: true, doctorName: true },
    });
    return apiSuccess({
      items: items.map((row) => ({ id: row.id, name: row.doctorName })),
    });
  }

  async listPobProductOptions(compCode: string, search?: string, divisionId?: string) {
    const q = search?.trim();
    const items = await this.prisma.product.findMany({
      where: {
        compCode,
        deletedAt: null,
        active: true,
        ...(divisionId ? { divisionId } : {}),
        ...(q
          ? {
              OR: [
                { productName: { contains: q, mode: 'insensitive' } },
                { productCode: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      take: 100,
      orderBy: { productName: 'asc' },
      include: {
        brand: { select: { brandName: true } },
        division: { select: { divisionName: true } },
      },
    });
    return apiSuccess({
      items: items.map((row) => ({
        id: row.id,
        productName: row.productName,
        productCode: row.productCode,
        brandName: row.brand?.brandName ?? null,
        divisionId: row.divisionId,
        divisionName: row.division?.divisionName ?? null,
      })),
    });
  }

  // ─── Push token (Phase 3 polish) ───────────────────────────────────────────

  async savePushToken(user: JwtPayload, body: unknown) {
    const parsed = PushTokenRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    await this.prisma.employee.update({
      where: { id: user.empId!, compCode: user.compCode! },
      data: { pushToken: parsed.data.pushToken },
    });

    return apiSuccess({ saved: true });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async assertDcr(compCode: string, empId: string, id: string) {
    const row = await this.prisma.dailyCallReport.findFirst({ where: { id, compCode, empId } });
    if (!row) throw new NotFoundException('DCR not found');
    return row;
  }

  private async assertTourProgramme(compCode: string, empId: string, id: string) {
    const row = await this.prisma.tourProgramme.findFirst({ where: { id, compCode, empId } });
    if (!row) throw new NotFoundException('Tour programme not found');
    return row;
  }

  private async assertWeeklyPlan(compCode: string, empId: string, id: string) {
    const row = await this.prisma.weeklyPlan.findFirst({ where: { id, compCode, empId } });
    if (!row) throw new NotFoundException('Weekly plan not found');
    return row;
  }

  private async assertPob(compCode: string, empId: string, id: string) {
    const row = await this.prisma.personalOrderBooking.findFirst({ where: { id, compCode, empId } });
    if (!row) throw new NotFoundException('POB not found');
    return row;
  }
}
