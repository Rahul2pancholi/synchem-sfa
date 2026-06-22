import { z } from 'zod';

export const ReportFilterSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  empId: z.string().uuid().optional(),
});

export type ReportFilter = z.infer<typeof ReportFilterSchema>;

export interface DcrSummaryReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  totalDcrs: number;
  approvedDcrs: number;
  pendingDcrs: number;
  totalDoctorVisits: number;
}

export interface ExpenseSummaryReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  claimMonth: number;
  claimYear: number;
  totalAmount: number;
  approveStatus: string;
}

export interface EmployeePobReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  orderCount: number;
  totalAmount: number;
}
