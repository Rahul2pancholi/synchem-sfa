import { BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';

describe('TransactionsService', () => {
  const prisma = {
    dailyCallReport: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    dcrDoctorVisit: { create: jest.fn() },
    dcrRetailerVisit: { create: jest.fn() },
    approvalQueueItem: { create: jest.fn() },
    tourProgramme: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    tourProgrammeDay: { create: jest.fn() },
    weeklyPlan: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    weeklyPlanEntry: { create: jest.fn() },
    personalOrderBooking: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    personalOrderLine: { create: jest.fn() },
    employee: { update: jest.fn() },
    $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => fn(prisma)),
  } as unknown as PrismaService;

  const approvals = {
    submitForApproval: jest.fn().mockResolvedValue(undefined),
  } as unknown as import('../approvals/approval.service').ApprovalService;

  const service = new TransactionsService(prisma, approvals);

  it('rejects invalid DCR payload', async () => {
    await expect(service.createDcr('SYN', 'emp-1', {})).rejects.toThrow(BadRequestException);
  });

  it('lists empty DCRs', async () => {
    const result = await service.listDcrs('SYN', 'emp-1');
    expect(result.data.items).toEqual([]);
  });

  it('saves push token', async () => {
    const result = await service.savePushToken(
      { empId: 'emp-1', compCode: 'SYN', sub: 'mr1', actorType: 'tenant', roleType: 'FS', roleId: 'r1' },
      { pushToken: 'ExponentPushToken[test]' },
    );
    expect(result.data.saved).toBe(true);
    expect(prisma.employee.update).toHaveBeenCalled();
  });
});
