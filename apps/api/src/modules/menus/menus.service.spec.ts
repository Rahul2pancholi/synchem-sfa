import { MenusService } from './menus.service';
import type { MenuPermissionRecord } from './ports/menu.repository.port';

describe('MenusService', () => {
  const flatMenus: MenuPermissionRecord[] = [
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

  it('builds nested menu tree for role', async () => {
    const menuRepo = {
      findMenusForRole: jest.fn().mockResolvedValue(flatMenus),
    };
    const service = new MenusService(menuRepo);

    const result = await service.getMenuTree('SYN', 'role-1');

    expect(result.data).toHaveLength(1);
    expect(result.data[0].menuCode).toBe('DSH');
    expect(result.data[0].childMenus?.[0].menuCode).toBe('DSH03');
  });
});
