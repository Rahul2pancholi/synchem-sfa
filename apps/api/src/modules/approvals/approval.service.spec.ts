import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { PrismaService } from '../../infrastructure/persistence/prisma.module';
import { MenusService } from '../menus/menus.service';
import type { JwtPayload } from '@synchem-sfa/shared-types';

describe('ApprovalService', () => {
  const prisma = {
    approvalQueueItem: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      groupBy: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    employee: { findMany: jest.fn() },
    dailyCallReport: { findFirst: jest.fn(), updateMany: jest.fn() },
    tourProgramme: { findFirst: jest.fn(), updateMany: jest.fn() },
    weeklyPlan: { findFirst: jest.fn(), updateMany: jest.fn() },
    $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => fn(prisma)),
  } as unknown as PrismaService;

  const menusService = {
    hasPermission: jest.fn().mockResolvedValue(true),
  } as unknown as MenusService;

  const service = new ApprovalService(prisma, menusService);

  const adminUser: JwtPayload = {
    sub: 'admin',
    actorType: 'tenant',
    compCode: 'SYN',
    empId: 'admin-id',
    roleId: 'role-ad',
    roleType: 'AD',
    fullName: 'Admin User',
  };

  it('returns empty pending list for admin', async () => {
    prisma.approvalQueueItem.findMany = jest.fn().mockResolvedValue([]);
    prisma.employee.findMany = jest.fn().mockResolvedValue([]);

    const result = await service.listPending('SYN', adminUser);
    expect(result.data.items).toEqual([]);
  });

  it('blocks field staff from approval summary', async () => {
    const fsUser: JwtPayload = { ...adminUser, roleType: 'FS', empId: 'mr-id' };
    await expect(service.getSummary('SYN', fsUser)).rejects.toThrow(ForbiddenException);
  });

  it('rejects invalid entity type filter', async () => {
    await expect(service.listPending('SYN', adminUser, 'INVALID' as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('approves a pending queue item', async () => {
    prisma.approvalQueueItem.findFirst = jest.fn().mockResolvedValue({
      id: 'queue-1',
      compCode: 'SYN',
      entityType: 'DCR',
      entityId: 'dcr-1',
      submittedBy: 'mr-id',
      status: 'PENDING',
    });
    prisma.approvalQueueItem.update = jest.fn().mockResolvedValue({});
    prisma.dailyCallReport.updateMany = jest.fn().mockResolvedValue({ count: 1 });

    const result = await service.approve('SYN', 'queue-1', adminUser, { remarks: 'OK' });
    expect(result.data.status).toBe('APPROVED');
    expect(prisma.approvalQueueItem.update).toHaveBeenCalled();
  });
});
