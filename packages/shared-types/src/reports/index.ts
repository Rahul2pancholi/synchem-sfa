import { z } from 'zod';

export const ReportFilterSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  empId: z.string().uuid().optional(),
});

export const SalesSummaryFilterSchema = ReportFilterSchema.extend({
  headQuarterId: z.string().uuid().optional(),
  divisionId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
});

export const TargetAchievementFilterSchema = ReportFilterSchema.extend({
  headQuarterId: z.string().uuid().optional(),
});

export const VisitSummaryFilterSchema = TargetAchievementFilterSchema;

export const MissedCallsFilterSchema = VisitSummaryFilterSchema;

export type ReportFilter = z.infer<typeof ReportFilterSchema>;
export type SalesSummaryFilter = z.infer<typeof SalesSummaryFilterSchema>;
export type TargetAchievementFilter = z.infer<typeof TargetAchievementFilterSchema>;
export type VisitSummaryFilter = z.infer<typeof VisitSummaryFilterSchema>;
export type MissedCallsFilter = z.infer<typeof MissedCallsFilterSchema>;

export interface DcrSummaryReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  totalDcrs: number;
  approvedDcrs: number;
  pendingDcrs: number;
  totalDoctorVisits: number;
  totalRetailerVisits: number;
  approvedDoctorVisits: number;
  plannedDoctorCalls: number;
  coveragePct: number;
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

export interface SalesSummaryTotals {
  orderCount: number;
  totalQty: number;
  totalAmount: number;
  approvedOrderCount: number;
  approvedAmount: number;
}

export interface SalesSummaryReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  headQuarterId: string | null;
  headQuarterName: string | null;
  orderCount: number;
  totalQty: number;
  totalAmount: number;
  approvedAmount: number;
}

export interface TargetAchievementTotals {
  amountTarget: number;
  actualAmount: number;
  achievementPct: number;
  callTarget: number;
  actualCalls: number;
  callAchievementPct: number;
}

export interface TargetAchievementReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  headQuarterName: string | null;
  amountTarget: number;
  actualAmount: number;
  achievementPct: number;
  gapAmount: number;
  callTarget: number | null;
  actualCalls: number;
  callAchievementPct: number | null;
  pobTarget: number | null;
  actualPobCount: number;
}

export interface VisitSummaryTotals {
  doctorVisits: number;
  retailerVisits: number;
  totalVisits: number;
  plannedDoctorCalls: number;
  coveragePct: number;
}

export interface VisitSummaryReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  headQuarterName: string | null;
  doctorVisits: number;
  retailerVisits: number;
  totalVisits: number;
  plannedDoctorCalls: number;
  coveragePct: number;
}

export interface MissedCallsTotals {
  missedCallCount: number;
  uniqueDoctors: number;
  uniqueEmployees: number;
}

export interface MissedCallsReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  headQuarterName: string | null;
  doctorId: string;
  doctorName: string;
  plannedDate: string;
}

export interface ManagerSalesKpis {
  month: number;
  year: number;
  pobApprovedAmount: number;
  amountTarget: number;
  pobAchievementPct: number;
  doctorVisits: number;
  plannedDoctorCalls: number;
  coveragePct: number;
  missedCallCount: number;
}

export interface FieldStaffKpis {
  month: number;
  year: number;
  headQuarterName: string | null;
  pobApprovedAmount: number;
  amountTarget: number;
  pobAchievementPct: number;
  doctorVisits: number;
  plannedDoctorCalls: number;
  coveragePct: number;
  missedCallCount: number;
  rtpWorkTypeToday: string | null;
  rtpHasPlanToday: boolean;
  weeklyDoctorsToday: number;
  pendingSubmitCount: number;
}
