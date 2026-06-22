import { BadRequestException, ConflictException } from '@nestjs/common';
import { AccessControlService } from './access-control.service';

describe('AccessControlService', () => {
  const prisma = {
    role: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    employee: { count: jest.fn() },
    menu: { findMany: jest.fn() },
    roleMenuPermission: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: typeof prisma) => Promise<void>) => fn(prisma)),
  };

  let service: AccessControlService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AccessControlService(prisma as never);
  });

  it('creates a role', async () => {
    prisma.role.create.mockResolvedValue({
      id: 'r1',
      roleName: 'RM',
      roleType: 'MAN',
      active: true,
    });

    const result = await service.createRole('SYN', {
      roleName: 'RM',
      roleType: 'MAN',
      active: true,
    });

    expect(result.data.roleName).toBe('RM');
  });

  it('rejects duplicate role name', async () => {
    prisma.role.create.mockRejectedValue(new Error('unique'));
    await expect(
      service.createRole('SYN', { roleName: 'MR', roleType: 'FS', active: true }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('blocks deactivating ADMIN role', async () => {
    prisma.role.findFirst.mockResolvedValue({ id: 'r1', roleName: 'ADMIN', roleType: 'AD' });
    prisma.employee.count.mockResolvedValue(0);

    await expect(service.deactivateRole('SYN', 'r1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('saves permissions in a transaction', async () => {
    prisma.role.findFirst
      .mockResolvedValueOnce({ id: 'r1', roleName: 'MR', roleType: 'FS' })
      .mockResolvedValueOnce({ id: 'admin-id', roleName: 'ADMIN', roleType: 'AD' });
    prisma.menu.findMany.mockImplementation(({ where }: { where: Record<string, unknown> }) => {
      if (where.menuCode) {
        return Promise.resolve([]);
      }
      return Promise.resolve([
        { id: '11111111-1111-1111-1111-111111111111', menuCode: 'TRN03' },
      ]);
    });

    const result = await service.saveRolePermissions(
      'SYN',
      'r1',
      {
        permissions: [
          {
            menuId: '11111111-1111-1111-1111-111111111111',
            canView: true,
            canAdd: true,
            canEdit: true,
            canDelete: false,
            canPreview: true,
            canPrint: false,
          },
        ],
      },
      { compCode: 'SYN', roleId: 'r2', empId: 'e1', sub: 'x', actorType: 'tenant' },
    );

    expect(result.data.saved).toBe(true);
    expect(prisma.roleMenuPermission.deleteMany).toHaveBeenCalled();
    expect(prisma.roleMenuPermission.create).toHaveBeenCalled();
  });
});
