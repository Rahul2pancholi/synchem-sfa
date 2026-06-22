import type { ReactNode } from 'react';
import { usePermission } from '../hooks/usePermission';
import type { PermissionAction } from '../lib/menu-permissions';

export function PermissionGate({
  menuCode,
  action,
  children,
  fallback = null,
}: {
  menuCode: string;
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const allowed = usePermission(menuCode, action);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
