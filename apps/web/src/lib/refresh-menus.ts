import { fetchApi } from './api-client';
import { saveMenuListToStorage } from './menu-permissions';
import { notifyMenuListUpdated } from '../hooks/usePermission';

interface MyMenusResponse {
  data: { menuList: string };
}

export async function refreshMenusFromApi(
  languageHeader: Record<string, string>,
): Promise<boolean> {
  try {
    const res = await fetchApi<MyMenusResponse>('/api/v1/menus/me', languageHeader);
    if (!res.data?.menuList) return false;
    saveMenuListToStorage(res.data.menuList);
    notifyMenuListUpdated();
    return true;
  } catch {
    return false;
  }
}
