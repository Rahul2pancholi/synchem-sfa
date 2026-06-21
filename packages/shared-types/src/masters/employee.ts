import { z } from 'zod';

export const CreateEmployeeRequestSchema = z.object({
  userName: z.string().min(2).max(100),
  password: z.string().min(8).max(15),
  employeeCode: z.string().max(20).optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  mobileNo: z.string().max(20).optional(),
  roleId: z.string().uuid(),
  hierarchyId: z.string().uuid().nullable().optional(),
  headQuarterId: z.string().uuid().nullable().optional(),
  reportingManagerId: z.string().uuid().nullable().optional(),
  active: z.boolean().default(true),
});

export const UpdateEmployeeRequestSchema = CreateEmployeeRequestSchema.omit({ password: true })
  .extend({
    password: z.string().min(8).max(15).optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type CreateEmployeeRequest = z.infer<typeof CreateEmployeeRequestSchema>;
export type UpdateEmployeeRequest = z.infer<typeof UpdateEmployeeRequestSchema>;

export interface EmployeeSummary {
  id: string;
  userName: string;
  employeeCode: string | null;
  firstName: string;
  lastName: string | null;
  email: string | null;
  mobileNo: string | null;
  roleId: string;
  roleName: string;
  roleType: string;
  hierarchyId: string | null;
  hierarchyCode: string | null;
  headQuarterId: string | null;
  headQuarterName: string | null;
  reportingManagerId: string | null;
  reportingManagerName: string | null;
  active: boolean;
}

export interface RoleSummary {
  id: string;
  roleName: string;
  roleType: string;
}
