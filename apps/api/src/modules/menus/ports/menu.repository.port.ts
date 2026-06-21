export interface MenuPermissionRecord {
  menuId: string;
  menuCode: string;
  menuName: string;
  menuUrl: string | null;
  menuType: string | null;
  parentMenuId: string | null;
  sortOrder: number;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPreview: boolean;
  canPrint: boolean;
}

export interface MenuRepositoryPort {
  findMenusForRole(compCode: string, roleId: string): Promise<MenuPermissionRecord[]>;
}

export const MENU_REPOSITORY = Symbol('MENU_REPOSITORY');
