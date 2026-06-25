import { defaultTenantFeatures } from '@synchem-sfa/shared-types';
import { MenusService } from './menus.service';
import type { MenuPermissionRecord } from './ports/menu.repository.port';

describe('MenusService', () => {
  const dashboardMenus: MenuPermissionRecord[] = [
    {
      menuId: '1',
      menuCode: 'DSH',
      menuName: 'Dashboard',
      menuUrl: null,
      menuType: 'T',
      parentMenuId: null,
      sortOrder: 10,
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canPreview: true,
      canPrint: true,
    },
    {
      menuId: '2',
      menuCode: 'DSH03',
      menuName: 'Management Dashboard',
      menuUrl: '#/app/management/dashboard',
      menuType: 'T',
      parentMenuId: '1',
      sortOrder: 11,
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canPreview: true,
      canPrint: true,
    },
  ];

  const txnMenus: MenuPermissionRecord[] = [
    {
      menuId: '1',
      menuCode: 'TRN',
      menuName: 'Transaction',
      menuUrl: null,
      menuType: 'T',
      parentMenuId: null,
      sortOrder: 30,
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canPreview: true,
      canPrint: true,
    },
    {
      menuId: '2',
      menuCode: 'TRN03',
      menuName: 'Daily Visit Report',
      menuUrl: '#/app/dcrRecord',
      menuType: 'T',
      parentMenuId: '1',
      sortOrder: 33,
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canPreview: true,
      canPrint: true,
    },
    {
      menuId: '3',
      menuCode: 'TRN09',
      menuName: 'Leave Application',
      menuUrl: '#/app/leaveApplication',
      menuType: 'T',
      parentMenuId: '1',
      sortOrder: 35,
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canPreview: true,
      canPrint: true,
    },
  ];

  const tenantFeaturesFull = {
    getFeatureState: jest.fn().mockResolvedValue(defaultTenantFeatures()),
  };

  it('builds nested menu tree for role', async () => {
    const menuRepo = {
      findMenusForRole: jest.fn().mockResolvedValue(dashboardMenus),
      findAllPermissionsForRole: jest.fn(),
    };
    const service = new MenusService(menuRepo, tenantFeaturesFull as never);

    const result = await service.getMenuTree('SYN', 'role-1');

    expect(result.data).toHaveLength(1);
    expect(result.data[0].menuCode).toBe('DSH');
    expect(result.data[0].childMenus?.[0].menuCode).toBe('DSH03');
  });

  it('excludes menus disabled by tenant feature flags', async () => {
    const menuRepo = {
      findMenusForRole: jest.fn().mockResolvedValue(txnMenus),
      findAllPermissionsForRole: jest.fn(),
    };
    const tenantFeatures = {
      getFeatureState: jest.fn().mockResolvedValue({
        ...defaultTenantFeatures(),
        field_visits: false,
        leave_hr: false,
      }),
    };
    const service = new MenusService(menuRepo, tenantFeatures as never);

    const result = await service.getMenuTree('SYN', 'role-1');

    expect(result.data).toHaveLength(0);
  });

  it('includes nav-hidden permission menus in permissionMenuList', async () => {
    const approvalMenus: MenuPermissionRecord[] = [
      {
        menuId: '1',
        menuCode: 'APP',
        menuName: 'Approvals',
        menuUrl: null,
        menuType: 'T',
        parentMenuId: null,
        sortOrder: 35,
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canPreview: true,
        canPrint: true,
      },
      {
        menuId: '2',
        menuCode: 'APP00',
        menuName: 'Pending Approvals',
        menuUrl: '#/app/approvals',
        menuType: 'T',
        parentMenuId: '1',
        sortOrder: 35,
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canPreview: true,
        canPrint: true,
      },
      {
        menuId: '3',
        menuCode: 'APP01',
        menuName: 'DCR Approval',
        menuUrl: null,
        menuType: 'T',
        parentMenuId: null,
        sortOrder: 903,
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canPreview: true,
        canPrint: true,
      },
    ];

    const menuRepo = {
      findMenusForRole: jest.fn().mockResolvedValue(approvalMenus),
      findAllPermissionsForRole: jest.fn(),
    };
    const service = new MenusService(menuRepo, tenantFeaturesFull as never);

    const tree = await service.getMenuTree('SYN', 'role-1');
    expect(tree.data.map((node) => node.menuCode)).toEqual(['APP']);
    expect(tree.data[0].childMenus?.map((node) => node.menuCode)).toEqual(['APP00']);

    const legacyJson = await service.getPermissionMenuListJson('SYN', 'role-1');
    const legacy = JSON.parse(legacyJson) as Array<{ MenuCode: string }>;
    const codes = legacy.map((node) => node.MenuCode);
    expect(codes).toContain('APP01');
  });

  it('denies permission when feature pack is off', async () => {
    const menuRepo = {
      findMenusForRole: jest.fn(),
      findAllPermissionsForRole: jest.fn().mockResolvedValue(txnMenus),
    };
    const tenantFeatures = {
      getFeatureState: jest.fn().mockResolvedValue({
        ...defaultTenantFeatures(),
        leave_hr: false,
      }),
    };
    const service = new MenusService(menuRepo, tenantFeatures as never);

    await expect(service.hasPermission('SYN', 'role-1', 'TRN09', 'view')).resolves.toBe(false);
  });
});
