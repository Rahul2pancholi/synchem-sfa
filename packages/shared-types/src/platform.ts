import { z } from 'zod';

export const CreateCompanyRequestSchema = z.object({
  compCode: z.string().min(2).max(10),
  compName: z.string().min(1),
  industryType: z.string().default('SYN'),
  timezone: z.string().default('Asia/Kolkata'),
  locale: z.string().default('en-IN'),
});

export type CreateCompanyRequest = z.infer<typeof CreateCompanyRequestSchema>;

export const PlatformTokenRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type PlatformTokenRequest = z.infer<typeof PlatformTokenRequestSchema>;

export interface CompanySummary {
  compCode: string;
  compName: string;
  industryType: string;
  timezone: string;
  locale: string;
  active: boolean;
}

export const UpdateCompanyRequestSchema = z.object({
  compName: z.string().min(1).optional(),
  active: z.boolean().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

export type UpdateCompanyRequest = z.infer<typeof UpdateCompanyRequestSchema>;
