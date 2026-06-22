import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  apiSuccess,
  CreateLeaveApplicationSchema,
  UpsertLeavePolicySchema,
} from '@synchem-sfa/shared-types';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import { ApprovalService } from '../approvals/approval.service';

function countInclusiveDays(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalService,
  ) {}

  async listApplications(compCode: string, empId: string) {
    const rows = await this.prisma.leaveApplication.findMany({
      where: { compCode, empId },
      orderBy: { fromDate: 'desc' },
    });
    return apiSuccess({
      items: rows.map((row) => ({
        id: row.id,
        leaveType: row.leaveType,
        fromDate: row.fromDate.toISOString().slice(0, 10),
        toDate: row.toDate.toISOString().slice(0, 10),
        totalDays: row.totalDays,
        reason: row.reason,
        balanceBefore: row.balanceBefore,
        approveStatus: row.approveStatus,
      })),
    });
  }

  async listBalances(compCode: string, empId: string, year?: number) {
    const policyYear = year ?? new Date().getFullYear();
    const rows = await this.prisma.leaveBalance.findMany({
      where: { compCode, empId, policyYear },
    });
    const policies = await this.prisma.leavePolicy.findMany({
      where: { compCode, active: true },
    });
    const policyByType = new Map(policies.map((p) => [p.leaveType, p]));

    return apiSuccess({
      items: rows.map((row) => ({
        leaveType: row.leaveType,
        policyYear: row.policyYear,
        balance: row.balance,
        annualQuota: policyByType.get(row.leaveType)?.annualQuota ?? 0,
      })),
    });
  }

  async createApplication(compCode: string, empId: string, body: unknown) {
    const parsed = CreateLeaveApplicationSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const fromDate = new Date(parsed.data.fromDate);
    const toDate = new Date(parsed.data.toDate);
    if (toDate < fromDate) {
      throw new BadRequestException('To date must be on or after from date');
    }

    const totalDays = countInclusiveDays(fromDate, toDate);
    const policyYear = fromDate.getFullYear();

    const created = await this.prisma.leaveApplication.create({
      data: {
        compCode,
        empId,
        leaveType: parsed.data.leaveType,
        fromDate,
        toDate,
        totalDays,
        reason: parsed.data.reason,
        approveStatus: 'DRAFT',
      },
    });

    await this.ensureBalance(compCode, empId, parsed.data.leaveType, policyYear);

    return apiSuccess({ id: created.id }, 201);
  }

  async submitApplication(compCode: string, empId: string, id: string) {
    const leave = await this.assertLeave(compCode, empId, id);
    const policyYear = leave.fromDate.getFullYear();

    const balanceRow = await this.prisma.leaveBalance.findFirst({
      where: {
        compCode,
        empId,
        leaveType: leave.leaveType,
        policyYear,
      },
    });

    if (!balanceRow || balanceRow.balance < leave.totalDays) {
      throw new BadRequestException('Insufficient leave balance');
    }

    await this.prisma.leaveApplication.update({
      where: { id },
      data: { balanceBefore: balanceRow.balance },
    });

    await this.approvals.submitForApproval(compCode, 'LEAVE', id, empId);
    return apiSuccess({ id, approveStatus: 'SUBMITTED' });
  }

  async listPolicies(compCode: string) {
    const rows = await this.prisma.leavePolicy.findMany({
      where: { compCode },
      orderBy: { leaveType: 'asc' },
    });
    return apiSuccess({
      items: rows.map((row) => ({
        id: row.id,
        leaveType: row.leaveType,
        annualQuota: row.annualQuota,
        carryForwardLimit: row.carryForwardLimit,
        active: row.active,
      })),
    });
  }

  async upsertPolicy(compCode: string, body: unknown) {
    const parsed = UpsertLeavePolicySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const row = await this.prisma.leavePolicy.upsert({
      where: {
        compCode_leaveType: { compCode, leaveType: parsed.data.leaveType },
      },
      update: {
        annualQuota: parsed.data.annualQuota,
        carryForwardLimit: parsed.data.carryForwardLimit,
        active: parsed.data.active,
      },
      create: {
        compCode,
        leaveType: parsed.data.leaveType,
        annualQuota: parsed.data.annualQuota,
        carryForwardLimit: parsed.data.carryForwardLimit,
        active: parsed.data.active,
      },
    });

    return apiSuccess({
      id: row.id,
      leaveType: row.leaveType,
      annualQuota: row.annualQuota,
      carryForwardLimit: row.carryForwardLimit,
      active: row.active,
    });
  }

  private async assertLeave(compCode: string, empId: string, id: string) {
    const row = await this.prisma.leaveApplication.findFirst({
      where: { compCode, empId, id },
    });
    if (!row) throw new NotFoundException('Leave application not found');
    return row;
  }

  private async ensureBalance(
    compCode: string,
    empId: string,
    leaveType: string,
    policyYear: number,
  ) {
    const existing = await this.prisma.leaveBalance.findFirst({
      where: { compCode, empId, leaveType, policyYear },
    });
    if (existing) return;

    const policy = await this.prisma.leavePolicy.findFirst({
      where: { compCode, leaveType, active: true },
    });
    if (!policy) {
      throw new ConflictException(`Leave policy not configured for ${leaveType}`);
    }

    await this.prisma.leaveBalance.create({
      data: {
        compCode,
        empId,
        leaveType,
        policyYear,
        balance: policy.annualQuota,
      },
    });
  }
}
