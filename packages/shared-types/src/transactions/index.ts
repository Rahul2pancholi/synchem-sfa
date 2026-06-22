import { z } from 'zod';

export const ApproveStatusSchema = z.enum(['DRAFT', 'SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);

export const CreateDcrRequestSchema = z.object({
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  headQuarterId: z.string().uuid().optional(),
  routeId: z.string().uuid().optional(),
  doctorIds: z.array(z.string().uuid()).optional(),
  retailerIds: z.array(z.string().uuid()).optional(),
});

export const CreateTourProgrammeRequestSchema = z.object({
  planMonth: z.number().int().min(1).max(12),
  planYear: z.number().int().min(2020).max(2100),
  days: z
    .array(
      z.object({
        dayOfMonth: z.number().int().min(1).max(31),
        routeId: z.string().uuid().nullable().optional(),
        workType: z.enum(['FIELD', 'MEETING', 'HOLIDAY', 'LEAVE']).default('FIELD'),
      }),
    )
    .optional(),
});

export const CreateWeeklyPlanRequestSchema = z.object({
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entries: z
    .array(
      z.object({
        planDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        doctorId: z.string().uuid().nullable().optional(),
        notes: z.string().max(255).optional(),
      }),
    )
    .optional(),
});

export const CreatePobRequestSchema = z.object({
  partyType: z.enum(['DOCTOR', 'RETAILER']),
  partyId: z.string().uuid(),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dcrId: z.string().uuid().optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().uuid(),
        qty: z.number().int().positive(),
        rate: z.number().nonnegative(),
      }),
    )
    .min(1),
});

export const PushTokenRequestSchema = z.object({
  pushToken: z.string().min(1).max(500),
});

export type CreateDcrRequest = z.infer<typeof CreateDcrRequestSchema>;
export type CreateTourProgrammeRequest = z.infer<typeof CreateTourProgrammeRequestSchema>;
export type CreateWeeklyPlanRequest = z.infer<typeof CreateWeeklyPlanRequestSchema>;
export type CreatePobRequest = z.infer<typeof CreatePobRequestSchema>;

export interface DcrSummary {
  id: string;
  workDate: string;
  approveStatus: string;
  routeId: string | null;
  headQuarterId: string | null;
  doctorVisitCount: number;
  retailerVisitCount: number;
}

export interface TourProgrammeSummary {
  id: string;
  planMonth: number;
  planYear: number;
  approveStatus: string;
  dayCount: number;
}

export interface WeeklyPlanSummary {
  id: string;
  weekStartDate: string;
  approveStatus: string;
  entryCount: number;
}

export interface PobSummary {
  id: string;
  partyType: string;
  partyId: string;
  orderDate: string;
  totalAmount: number;
  approveStatus: string;
  lineCount: number;
}
