import { useCallback, useSyncExternalStore } from 'react';
import type { LegacyMenuItem } from '@synchem-sfa/shared-types';
import {
  findMenuByCode,
  hasMenuPermission,
  type PermissionAction,
} from '../lib/menu-permissions';

const EMPTY_MENUS: LegacyMenuItem[] = [];

let cachedRaw: string | null | undefined;
let cachedSnapshot: LegacyMenuItem[] = EMPTY_MENUS;

function readMenuSnapshot(): LegacyMenuItem[] {
  const raw =
    localStorage.getItem('permissionMenuList') ?? localStorage.getItem('menuList');
  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  cachedRaw = raw;
  if (!raw) {
    cachedSnapshot = EMPTY_MENUS;
    return cachedSnapshot;
  }

  try {
    cachedSnapshot = JSON.parse(raw) as LegacyMenuItem[];
  } catch {
    cachedSnapshot = EMPTY_MENUS;
  }
  return cachedSnapshot;
}

function invalidateMenuSnapshot() {
  cachedRaw = undefined;
}

function subscribe(callback: () => void) {
  const onChange = () => {
    invalidateMenuSnapshot();
    callback();
  };
  window.addEventListener('storage', onChange);
  window.addEventListener('menuListUpdated', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('menuListUpdated', onChange);
  };
}

function getSnapshot() {
  return readMenuSnapshot();
}

function getServerSnapshot() {
  return EMPTY_MENUS;
}

export function usePermission(menuCode: string, action: PermissionAction): boolean {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return hasMenuPermission(menuCode, action);
}

export function useMenuPermissions() {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const can = useCallback(
    (menuCode: string, action: PermissionAction) => hasMenuPermission(menuCode, action),
    [],
  );

  return { can, findMenu: findMenuByCode };
}

export function notifyMenuListUpdated() {
  invalidateMenuSnapshot();
  window.dispatchEvent(new Event('menuListUpdated'));
}
