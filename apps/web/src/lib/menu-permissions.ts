import type { LegacyMenuItem } from '@synchem-sfa/shared-types';

export type PermissionAction = 'view' | 'add' | 'edit' | 'delete' | 'preview' | 'print';

const ACTION_KEY: Record<PermissionAction, keyof LegacyMenuItem> = {
  view: 'CanView',
  add: 'CanAdd',
  edit: 'CanEdit',
  delete: 'CanDelete',
  preview: 'CanPreview',
  print: 'CanPrint',
};

const EMPTY_MENUS: LegacyMenuItem[] = [];

export function loadMenuListFromStorage(): LegacyMenuItem[] {
  const raw = localStorage.getItem('permissionMenuList') ?? localStorage.getItem('menuList');
  if (!raw) return EMPTY_MENUS;
  try {
    return JSON.parse(raw) as LegacyMenuItem[];
  } catch {
    return EMPTY_MENUS;
  }
}

export function loadNavMenuListFromStorage(): LegacyMenuItem[] {
  const raw = localStorage.getItem('menuList');
  if (!raw) return EMPTY_MENUS;
  try {
    return JSON.parse(raw) as LegacyMenuItem[];
  } catch {
    return EMPTY_MENUS;
  }
}

export function flattenMenuList(items: LegacyMenuItem[]): LegacyMenuItem[] {
  const result: LegacyMenuItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.ChildMenus?.length) {
      result.push(...flattenMenuList(item.ChildMenus));
    }
  }
  return result;
}

export function findMenuByCode(menuCode: string): LegacyMenuItem | undefined {
  return flattenMenuList(loadMenuListFromStorage()).find((item) => item.MenuCode === menuCode);
}

export function hasMenuPermission(menuCode: string, action: PermissionAction): boolean {
  const menu = findMenuByCode(menuCode);
  if (!menu) return false;
  return Boolean(menu[ACTION_KEY[action]]);
}

export function saveMenuListToStorage(menuListJson: string) {
  localStorage.setItem('menuList', menuListJson);
}

export function savePermissionMenuListToStorage(permissionMenuListJson: string) {
  localStorage.setItem('permissionMenuList', permissionMenuListJson);
}
