import type { LegacyMenuItem } from '@synchem-sfa/shared-types';
import { getSecureItem, setSecureItem } from './secure-storage';

const MENU_LIST_KEY = 'menuList';

export type PermissionAction = 'view' | 'add' | 'edit' | 'delete' | 'preview' | 'print';

const ACTION_KEY: Record<PermissionAction, keyof LegacyMenuItem> = {
  view: 'CanView',
  add: 'CanAdd',
  edit: 'CanEdit',
  delete: 'CanDelete',
  preview: 'CanPreview',
  print: 'CanPrint',
};

export async function saveMenuList(menuListJson: string) {
  await setSecureItem(MENU_LIST_KEY, menuListJson);
}

export async function loadMenuList(): Promise<LegacyMenuItem[]> {
  const raw = await getSecureItem(MENU_LIST_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LegacyMenuItem[];
  } catch {
    return [];
  }
}

function flattenMenuList(items: LegacyMenuItem[]): LegacyMenuItem[] {
  const result: LegacyMenuItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.ChildMenus?.length) {
      result.push(...flattenMenuList(item.ChildMenus));
    }
  }
  return result;
}

export async function hasMenuPermission(menuCode: string, action: PermissionAction): Promise<boolean> {
  const menus = await loadMenuList();
  const menu = flattenMenuList(menus).find((item) => item.MenuCode === menuCode);
  if (!menu) return false;
  return Boolean(menu[ACTION_KEY[action]]);
}
