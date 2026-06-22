import { z } from 'zod';
import { RoleTypeSchema } from '../auth';

export const CreateRoleRequestSchema = z.object({
  roleName: z.string().min(2).max(100),
  roleType: RoleTypeSchema,
  active: z.boolean().default(true),
});

export const UpdateRoleRequestSchema = CreateRoleRequestSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);

export const RolePermissionEntrySchema = z.object({
  menuId: z.string().uuid(),
  canView: z.boolean(),
  canAdd: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  canPreview: z.boolean(),
  canPrint: z.boolean(),
});

export const SaveRolePermissionsRequestSchema = z.object({
  permissions: z.array(RolePermissionEntrySchema).min(1),
});

export type CreateRoleRequest = z.infer<typeof CreateRoleRequestSchema>;
export type UpdateRoleRequest = z.infer<typeof UpdateRoleRequestSchema>;
export type RolePermissionEntry = z.infer<typeof RolePermissionEntrySchema>;

export interface RoleDetailSummary {
  id: string;
  roleName: string;
  roleType: string;
  active: boolean;
  employeeCount?: number;
}

export interface RolePermissionRow {
  menuId: string;
  menuCode: string;
  menuName: string;
  menuUrl: string | null;
  parentMenuId: string | null;
  sortOrder: number;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPreview: boolean;
  canPrint: boolean;
}
