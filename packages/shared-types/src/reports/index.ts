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

export const MonthlyCoveredDoctorFilterSchema = VisitSummaryFilterSchema;

export const RtpSummaryFilterSchema = VisitSummaryFilterSchema;

export const DoctorReportFilterSchema = ReportFilterSchema.extend({
  headQuarterId: z.string().uuid().optional(),
  routeId: z.string().uuid().optional(),
});

export const EmployeeAttendanceFilterSchema = VisitSummaryFilterSchema;

export const EmployeeAnalysisFilterSchema = VisitSummaryFilterSchema;

export type ReportFilter = z.infer<typeof ReportFilterSchema>;
export type SalesSummaryFilter = z.infer<typeof SalesSummaryFilterSchema>;
export type TargetAchievementFilter = z.infer<typeof TargetAchievementFilterSchema>;
export type VisitSummaryFilter = z.infer<typeof VisitSummaryFilterSchema>;
export type MissedCallsFilter = z.infer<typeof MissedCallsFilterSchema>;
export type MonthlyCoveredDoctorFilter = z.infer<typeof MonthlyCoveredDoctorFilterSchema>;
export type RtpSummaryFilter = z.infer<typeof RtpSummaryFilterSchema>;
export type DoctorReportFilter = z.infer<typeof DoctorReportFilterSchema>;
export type EmployeeAttendanceFilter = z.infer<typeof EmployeeAttendanceFilterSchema>;
export type EmployeeAnalysisFilter = z.infer<typeof EmployeeAnalysisFilterSchema>;

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

export interface MonthlyCoveredDoctorTotals {
  coveredDoctors: number;
  plannedDoctors: number;
  coveragePct: number;
  totalVisits: number;
}

export interface MonthlyCoveredDoctorReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  headQuarterName: string | null;
  doctorId: string;
  doctorName: string;
  routeName: string | null;
  visitCount: number;
  firstVisitDate: string;
  lastVisitDate: string;
  wasPlanned: boolean;
}

export interface RtpSummaryTotals {
  totalSubmitted: number;
  approvedCount: number;
  pendingCount: number;
  draftCount: number;
  notSubmittedCount: number;
}

export interface RtpSummaryReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  headQuarterName: string | null;
  approveStatus: string;
  fieldDays: number;
  totalPlanDays: number;
  submittedAt: string | null;
}

export interface DoctorReportTotals {
  totalDoctors: number;
  visitedInPeriod: number;
  totalVisits: number;
  neverVisited: number;
}

export interface DoctorReportRow {
  doctorId: string;
  doctorName: string;
  routeName: string | null;
  headQuarterName: string | null;
  specialistName: string | null;
  mobileNo: string | null;
  approveStatus: string;
  visitCount: number;
  lastVisitDate: string | null;
}

export interface EmployeeAttendanceTotals {
  totalEmployees: number;
  totalFieldDays: number;
  totalLeaveDays: number;
  holidaysInMonth: number;
}

export interface EmployeeAttendanceReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  headQuarterName: string | null;
  fieldDays: number;
  leaveDays: number;
  holidayDays: number;
  plannedFieldDays: number;
  meetingDays: number;
}

export interface EmployeeAnalysisTotals {
  totalEmployees: number;
  avgCallAchievementPct: number;
  avgPobAchievementPct: number;
  avgCoveragePct: number;
}

export interface EmployeeAnalysisReportRow {
  empId: string;
  employeeName: string;
  employeeCode: string | null;
  headQuarterName: string | null;
  fieldDays: number;
  doctorVisits: number;
  plannedDoctorCalls: number;
  coveragePct: number;
  callTarget: number | null;
  callAchievementPct: number | null;
  amountTarget: number;
  actualAmount: number;
  pobAchievementPct: number;
  pobCount: number;
  pobTarget: number | null;
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
