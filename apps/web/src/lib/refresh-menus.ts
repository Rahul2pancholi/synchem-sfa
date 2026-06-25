import { fetchApi } from './api-client';
import { saveMenuListToStorage, savePermissionMenuListToStorage } from './menu-permissions';
import { notifyMenuListUpdated } from '../hooks/usePermission';

interface MyMenusResponse {
  data: { menuList: string; permissionMenuList?: string };
}

export async function refreshMenusFromApi(
  languageHeader: Record<string, string>,
): Promise<boolean> {
  try {
    const res = await fetchApi<MyMenusResponse>('/api/v1/menus/me', languageHeader);
    if (!res.data?.menuList) return false;
    saveMenuListToStorage(res.data.menuList);
    if (res.data.permissionMenuList) {
      savePermissionMenuListToStorage(res.data.permissionMenuList);
    }
    notifyMenuListUpdated();
    return true;
  } catch {
    return false;
  }
}
