import { z } from 'zod';

export const TokenRequestSchema = z.object({
  grant_type: z.literal('password'),
  username: z.string().min(1),
  password: z.string().min(1),
});

export type TokenRequest = z.infer<typeof TokenRequestSchema>;

export const RoleTypeSchema = z.enum(['AD', 'MAN', 'FS']);
export type RoleType = z.infer<typeof RoleTypeSchema>;

export interface JwtPayload {
  sub: string;
  empId: string;
  fullName: string;
  compCode: string;
  industryType: string;
  roleType: RoleType;
  companyName: string;
}

export interface TenantContext {
  compCode: string;
  empId: string;
  roleType: RoleType;
  userName: string;
}
