import { z } from 'zod';

export const CreateStateRequestSchema = z.object({
  stateName: z.string().min(1).max(100),
});

export const CreateCityRequestSchema = z.object({
  stateId: z.string().uuid(),
  cityName: z.string().min(1).max(100),
  active: z.boolean().default(true),
});

export const CreateHeadQuarterRequestSchema = z.object({
  hqName: z.string().min(1).max(100),
  stateId: z.string().uuid().nullable().optional(),
  active: z.boolean().default(true),
});

export const CreateRouteRequestSchema = z.object({
  headQuarterId: z.string().uuid(),
  routeName: z.string().min(1).max(100),
  active: z.boolean().default(true),
});

export const CreateBrandRequestSchema = z.object({
  brandName: z.string().min(1).max(100),
  active: z.boolean().default(true),
});

export const CreateProductRequestSchema = z.object({
  productName: z.string().min(1).max(255),
  productCode: z.string().min(1).max(50).optional(),
  brandId: z.string().uuid().nullable().optional(),
  divisionId: z.string().uuid().nullable().optional(),
  active: z.boolean().default(true),
});

export const CreateDoctorRequestSchema = z.object({
  doctorName: z.string().min(1).max(255),
  routeId: z.string().uuid().nullable().optional(),
  specialistId: z.string().uuid().nullable().optional(),
  qualificationId: z.string().uuid().nullable().optional(),
  mobileNo: z.string().max(20).optional(),
  active: z.boolean().default(true),
});

export const CreateRetailerRequestSchema = z.object({
  retailerName: z.string().min(1).max(255),
  routeId: z.string().uuid().nullable().optional(),
  active: z.boolean().default(true),
});

export const CreateStockistRequestSchema = z.object({
  stockistName: z.string().min(1).max(255),
  routeId: z.string().uuid().nullable().optional(),
  active: z.boolean().default(true),
});

export const CreateLovRequestSchema = z.object({
  name: z.string().min(1).max(100),
  active: z.boolean().default(true),
});

export const CreateHolidayRequestSchema = z.object({
  holidayName: z.string().min(1).max(100),
  holidayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  active: z.boolean().default(true),
});

export const BulkImportRequestSchema = z.object({
  rows: z.array(z.record(z.string())).min(1).max(5000),
});

export type BulkImportRequest = z.infer<typeof BulkImportRequestSchema>;
