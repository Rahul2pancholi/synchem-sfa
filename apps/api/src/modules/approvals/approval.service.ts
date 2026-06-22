import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  apiSuccess,
  ApprovalDecisionRequestSchema,
  ApprovalEntityTypeSchema,
  APPROVAL_ENTITY_CONFIG,
  type ApprovalEntityType,
  type ApprovalPendingItem,
  type ApprovalSummary,
  type JwtPayload,
} from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import { MenusService } from '../menus/menus.service';

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly menusService: MenusService,
  ) {}

  async submitForApproval(
    compCode: string,
    entityType: ApprovalEntityType,
    entityId: string,
    submittedBy: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await this.assertEntitySubmittable(tx, compCode, entityType, entityId);
      await this.setEntityStatus(tx, compCode, entityType, entityId, 'SUBMITTED');

      await tx.approvalQueueItem.create({
        data: {
          compCode,
          entityType,
          entityId,
          submittedBy,
          status: 'PENDING',
        },
      });
    });
  }

  async listPending(
    compCode: string,
    user: JwtPayload,
    entityType?: ApprovalEntityType,
  ) {
    const parsedType = entityType
      ? ApprovalEntityTypeSchema.safeParse(entityType)
      : null;
    if (entityType && !parsedType?.success) {
      throw new BadRequestException('Invalid entity type');
    }

    if (parsedType?.success) {
      await this.assertPermission(user, parsedType.data, 'view');
    } else if (user.roleType === 'FS') {
      throw new ForbiddenException('Not authorized to view approvals');
    }

    const teamIds = await this.resolveVisibleSubmitterIds(compCode, user);
    const rows = await this.prisma.approvalQueueItem.findMany({
      where: {
        compCode,
        status: 'PENDING',
        ...(parsedType?.success ? { entityType: parsedType.data } : {}),
        ...(teamIds ? { submittedBy: { in: teamIds } } : {}),
      },
      orderBy: { submittedAt: 'desc' },
    });

    const submitterIds = [...new Set(rows.map((row) => row.submittedBy))];
    const employees = await this.prisma.employee.findMany({
      where: { compCode, id: { in: submitterIds } },
      select: { id: true, firstName: true, lastName: true, userName: true },
    });
    const employeeById = new Map(employees.map((e) => [e.id, e]));

    const items: ApprovalPendingItem[] = [];
    for (const row of rows) {
      const submitter = employeeById.get(row.submittedBy);
      items.push({
        id: row.id,
        entityType: row.entityType as ApprovalEntityType,
        entityId: row.entityId,
        status: row.status,
        submittedAt: row.submittedAt.toISOString(),
        submittedBy: row.submittedBy,
        submitterName: submitter
          ? `${submitter.firstName} ${submitter.lastName ?? ''}`.trim()
          : 'Unknown',
        submitterUserName: submitter?.userName ?? '',
        summary: await this.buildSummary(compCode, row.entityType as ApprovalEntityType, row.entityId),
        remarks: row.remarks,
      });
    }

    return apiSuccess({ items });
  }

  async getSummary(compCode: string, user: JwtPayload) {
    if (user.roleType === 'FS') {
      throw new ForbiddenException('Not authorized to view approval summary');
    }

    const teamIds = await this.resolveVisibleSubmitterIds(compCode, user);
    const rows = await this.prisma.approvalQueueItem.groupBy({
      by: ['entityType'],
      where: {
        compCode,
        status: 'PENDING',
        ...(teamIds ? { submittedBy: { in: teamIds } } : {}),
      },
      _count: { _all: true },
    });

    const summary: ApprovalSummary = {
      dcr: 0,
      rtp: 0,
      weeklyPlan: 0,
      leave: 0,
      expense: 0,
      total: 0,
    };
    for (const row of rows) {
      if (row.entityType === 'DCR') summary.dcr = row._count._all;
      if (row.entityType === 'RTP') summary.rtp = row._count._all;
      if (row.entityType === 'WEEKLY_PLAN') summary.weeklyPlan = row._count._all;
      if (row.entityType === 'LEAVE') summary.leave = row._count._all;
      if (row.entityType === 'EXPENSE') summary.expense = row._count._all;
      summary.total += row._count._all;
    }

    return apiSuccess(summary);
  }

  async approve(compCode: string, queueId: string, user: JwtPayload, body: unknown) {
    const parsed = ApprovalDecisionRequestSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    await this.decide(compCode, queueId, user, 'APPROVED', parsed.data.remarks);
    return apiSuccess({ id: queueId, status: 'APPROVED' });
  }

  async reject(compCode: string, queueId: string, user: JwtPayload, body: unknown) {
    const parsed = ApprovalDecisionRequestSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    await this.decide(compCode, queueId, user, 'REJECTED', parsed.data.remarks);
    return apiSuccess({ id: queueId, status: 'REJECTED' });
  }

  private async decide(
    compCode: string,
    queueId: string,
    user: JwtPayload,
    decision: 'APPROVED' | 'REJECTED',
    remarks?: string,
  ) {
    const queueItem = await this.prisma.approvalQueueItem.findFirst({
      where: { id: queueId, compCode, status: 'PENDING' },
    });
    if (!queueItem) throw new NotFoundException('Approval item not found');

    const teamIds = await this.resolveVisibleSubmitterIds(compCode, user);
    if (teamIds && !teamIds.includes(queueItem.submittedBy)) {
      throw new BadRequestException('Not authorized to act on this approval');
    }

    await this.assertPermission(
      user,
      queueItem.entityType as ApprovalEntityType,
      'edit',
    );

    const entityStatus = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';

    await this.prisma.$transaction(async (tx) => {
      await tx.approvalQueueItem.update({
        where: { id: queueId },
        data: {
          status: decision,
          approverId: user.empId!,
          decidedAt: new Date(),
          remarks,
        },
      });
      await this.setEntityStatus(
        tx,
        compCode,
        queueItem.entityType as ApprovalEntityType,
        queueItem.entityId,
        entityStatus,
      );

      if (decision === 'APPROVED' && queueItem.entityType === 'LEAVE') {
        await this.deductLeaveBalance(tx, compCode, queueItem.entityId);
      }
    });

    this.logger.log({
      module: 'approvals',
      action: decision.toLowerCase(),
      compCode,
      queueId,
      entityType: queueItem.entityType,
      approverId: user.empId,
    });
  }

  private async resolveVisibleSubmitterIds(
    compCode: string,
    user: JwtPayload,
  ): Promise<string[] | null> {
    if (user.roleType === 'AD') return null;

    if (user.roleType === 'MAN') {
      const reports = await this.prisma.employee.findMany({
        where: { compCode, reportingManagerId: user.empId!, active: true },
        select: { id: true },
      });
      return reports.map((row) => row.id);
    }

    return [];
  }

  private async assertPermission(
    user: JwtPayload,
    entityType: ApprovalEntityType,
    action: 'view' | 'edit',
  ) {
    if (!user.compCode || !user.roleId) {
      throw new ForbiddenException('Tenant context required');
    }

    const menuCode = APPROVAL_ENTITY_CONFIG[entityType].menuCode;
    const allowed = await this.menusService.hasPermission(
      user.compCode,
      user.roleId,
      menuCode,
      action,
    );

    if (!allowed) {
      throw new ForbiddenException(`Missing permission: ${menuCode}.${action}`);
    }
  }

  private async buildSummary(
    compCode: string,
    entityType: ApprovalEntityType,
    entityId: string,
  ): Promise<string> {
    if (entityType === 'DCR') {
      const row = await this.prisma.dailyCallReport.findFirst({ where: { compCode, id: entityId } });
      return row ? `DCR ${row.workDate.toISOString().slice(0, 10)}` : entityId;
    }
    if (entityType === 'RTP') {
      const row = await this.prisma.tourProgramme.findFirst({ where: { compCode, id: entityId } });
      return row ? `RTP ${row.planMonth}/${row.planYear}` : entityId;
    }
    if (entityType === 'WEEKLY_PLAN') {
      const row = await this.prisma.weeklyPlan.findFirst({ where: { compCode, id: entityId } });
      return row ? `Weekly ${row.weekStartDate.toISOString().slice(0, 10)}` : entityId;
    }
    if (entityType === 'LEAVE') {
      const row = await this.prisma.leaveApplication.findFirst({ where: { compCode, id: entityId } });
      return row
        ? `Leave ${row.leaveType} ${row.fromDate.toISOString().slice(0, 10)}`
        : entityId;
    }
    const row = await this.prisma.expenseStatement.findFirst({ where: { compCode, id: entityId } });
    return row ? `Expense ${row.claimMonth}/${row.claimYear}` : entityId;
  }

  private async assertEntitySubmittable(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    compCode: string,
    entityType: ApprovalEntityType,
    entityId: string,
  ) {
    const status = await this.getEntityStatus(tx, compCode, entityType, entityId);
    if (!status) throw new NotFoundException('Entity not found');
    if (status !== 'DRAFT' && status !== 'REJECTED') {
      throw new BadRequestException('Entity cannot be submitted in current status');
    }
  }

  private async getEntityStatus(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    compCode: string,
    entityType: ApprovalEntityType,
    entityId: string,
  ): Promise<string | null> {
    if (entityType === 'DCR') {
      const row = await tx.dailyCallReport.findFirst({ where: { compCode, id: entityId } });
      return row?.approveStatus ?? null;
    }
    if (entityType === 'RTP') {
      const row = await tx.tourProgramme.findFirst({ where: { compCode, id: entityId } });
      return row?.approveStatus ?? null;
    }
    if (entityType === 'WEEKLY_PLAN') {
      const row = await tx.weeklyPlan.findFirst({ where: { compCode, id: entityId } });
      return row?.approveStatus ?? null;
    }
    if (entityType === 'LEAVE') {
      const row = await tx.leaveApplication.findFirst({ where: { compCode, id: entityId } });
      return row?.approveStatus ?? null;
    }
    const row = await tx.expenseStatement.findFirst({ where: { compCode, id: entityId } });
    return row?.approveStatus ?? null;
  }

  private async setEntityStatus(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    compCode: string,
    entityType: ApprovalEntityType,
    entityId: string,
    approveStatus: string,
  ) {
    const data = {
      approveStatus,
      ...(approveStatus === 'SUBMITTED' ? { submittedAt: new Date() } : {}),
    };

    if (entityType === 'DCR') {
      await tx.dailyCallReport.updateMany({
        where: { compCode, id: entityId },
        data: { ...data, version: { increment: 1 } },
      });
      return;
    }
    if (entityType === 'RTP') {
      await tx.tourProgramme.updateMany({
        where: { compCode, id: entityId },
        data: { ...data, version: { increment: 1 } },
      });
      return;
    }
    if (entityType === 'WEEKLY_PLAN') {
      await tx.weeklyPlan.updateMany({
        where: { compCode, id: entityId },
        data: { ...data, version: { increment: 1 } },
      });
      return;
    }
    if (entityType === 'LEAVE') {
      await tx.leaveApplication.updateMany({
        where: { compCode, id: entityId },
        data: { ...data, version: { increment: 1 } },
      });
      return;
    }
    await tx.expenseStatement.updateMany({
      where: { compCode, id: entityId },
      data: { ...data, version: { increment: 1 } },
    });
  }

  private async deductLeaveBalance(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    compCode: string,
    leaveId: string,
  ) {
    const leave = await tx.leaveApplication.findFirst({ where: { compCode, id: leaveId } });
    if (!leave) return;

    const policyYear = leave.fromDate.getFullYear();
    const balanceRow = await tx.leaveBalance.findFirst({
      where: {
        compCode,
        empId: leave.empId,
        leaveType: leave.leaveType,
        policyYear,
      },
    });

    if (!balanceRow) return;

    await tx.leaveBalance.update({
      where: { id: balanceRow.id },
      data: { balance: Math.max(0, balanceRow.balance - leave.totalDays) },
    });
  }
}
