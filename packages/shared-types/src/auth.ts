import { z } from 'zod';

export const TokenRequestSchema = z.object({
  grant_type: z.literal('password'),
  username: z.string().min(1),
  password: z.string().min(1),
});

export type TokenRequest = z.infer<typeof TokenRequestSchema>;

export const RoleTypeSchema = z.enum(['AD', 'MAN', 'FS']);
export type RoleType = z.infer<typeof RoleTypeSchema>;

export type ActorType = 'tenant' | 'platform';

export interface JwtPayload {
  sub: string;
  empId?: string;
  fullName: string;
  compCode?: string;
  industryType?: string;
  roleType?: RoleType;
  companyName?: string;
  roleId?: string;
  actorType: ActorType;
}

export interface TenantContext {
  compCode: string;
  empId: string;
  roleType: RoleType;
  roleId: string;
  userName: string;
}

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({
  userName: z.string().min(1),
  compCode: z.string().min(2).max(10),
});

export const VerifyOtpRequestSchema = z.object({
  userName: z.string().min(1),
  compCode: z.string().min(2).max(10),
  otp: z.string().length(6),
});

export const ResetPasswordRequestSchema = z.object({
  userName: z.string().min(1),
  compCode: z.string().min(2).max(10),
  otp: z.string().length(6),
  newPassword: z
    .string()
    .min(8)
    .max(15)
    .regex(/[0-9]/)
    .regex(/[!@#$%^&*]/),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const ROLE_DASHBOARD_ROUTES: Record<string, string> = {
  AD: '/app/management/dashboard',
  MAN: '/app/manager/dashboard',
  FS: '/app/fieldStaff/dashboard',
};

export const PASSWORD_POLICY_MESSAGE =
  'Password must be 8–15 characters and include a number and special character (!@#$%^&*).';
