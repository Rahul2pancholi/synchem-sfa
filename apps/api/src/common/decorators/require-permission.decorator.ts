import { SetMetadata } from '@nestjs/common';

export type PermissionAction = 'view' | 'add' | 'edit' | 'delete';

export const PERMISSION_KEY = 'permission';

export interface RequiredPermission {
  menuCode: string;
  action: PermissionAction;
}

export const RequirePermission = (menuCode: string, action: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, { menuCode, action } satisfies RequiredPermission);
