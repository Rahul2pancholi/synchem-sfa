export interface MenuPermissions {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPreview: boolean;
  canPrint: boolean;
}

export interface MenuTreeItem extends MenuPermissions {
  menuId: string;
  menuCode: string;
  menuName: string;
  menuUrl: string | null;
  menuType: string | null;
  childMenus: MenuTreeItem[] | null;
}

/** Legacy Salestrip login payload (PascalCase keys). */
export interface LegacyMenuItem {
  MenuId: string;
  MenuCode: string;
  MenuName: string;
  MenuType: string | null;
  MenuLevel: number;
  MenuBehaviour: 'FOLDER' | 'FILE';
  MenuUrl: string | null;
  CanView: boolean;
  CanAdd: boolean;
  CanEdit: boolean;
  CanDelete: boolean;
  CanPreview: boolean;
  CanPrint: boolean;
  ChildMenus: LegacyMenuItem[] | null;
}
