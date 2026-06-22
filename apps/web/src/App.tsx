import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { RequireMenuView } from './features/access/AccessDeniedPage';
import { RoleMasterPage } from './features/access/RoleMasterPage';
import { RoleSettingPage } from './features/access/RoleSettingPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { LoginPage } from './features/auth/LoginPage';
import { PlatformLoginPage } from './features/platform/PlatformLoginPage';
import { PlatformTenantsPage } from './features/platform/PlatformTenantsPage';
import { DashboardShell } from './features/shell/DashboardShell';
import { DashboardHome } from './features/shell/DashboardHome';
import { FieldStaffDashboardHome } from './features/shell/FieldStaffDashboardHome';
import { DoctorCreationRequestPage } from './features/masters/DoctorCreationRequestPage';
import { HierarchyMasterPage } from './features/masters/HierarchyMasterPage';
import { EmployeeMasterPage } from './features/masters/EmployeeMasterPage';
import { BulkPageByKey, LovPageByKey, MasterPageByKey } from './features/masters/MasterPageRouter';
import { DcrPage } from './features/transactions/DcrPage';
import { PobPage } from './features/transactions/PobPage';
import { RtpPage } from './features/transactions/RtpPage';
import { WeeklyPlanPage } from './features/transactions/WeeklyPlanPage';
import { ApprovalQueuePage } from './features/approvals/ApprovalQueuePage';
import { ManagerDashboardHome } from './features/approvals/ManagerDashboardHome';
import { LeaveApplicationPage } from './features/monthly/LeaveApplicationPage';
import { ExpenseStatementPage } from './features/monthly/ExpenseStatementPage';
import { LeavePolicyPage } from './features/monthly/LeavePolicyPage';
import { ReportPage } from './features/reports/ReportPage';
import { SalesSummaryReportPage } from './features/reports/SalesSummaryReportPage';
import { TargetAchievementReportPage } from './features/reports/TargetAchievementReportPage';
import { VisitSummaryReportPage } from './features/reports/VisitSummaryReportPage';
import { MissedCallsReportPage } from './features/reports/MissedCallsReportPage';
import { MonthlyCoveredDoctorReportPage } from './features/reports/MonthlyCoveredDoctorReportPage';
import { RtpSummaryReportPage } from './features/reports/RtpSummaryReportPage';
import { DoctorReportPage } from './features/reports/DoctorReportPage';
import { EmployeeAttendanceReportPage } from './features/reports/EmployeeAttendanceReportPage';
import { EmployeeAnalysisReportPage } from './features/reports/EmployeeAnalysisReportPage';
import { InsightsChatConfigPage } from './features/admin/InsightsChatConfigPage';
import { LoginAnalyticsPage } from './features/admin/LoginAnalyticsPage';

function RequireTenantToken({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('access_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function guarded(menuCode: string, element: ReactNode) {
  return <RequireMenuView menuCode={menuCode}>{element}</RequireMenuView>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/platform/login" element={<PlatformLoginPage />} />
      <Route path="/platform/tenants" element={<PlatformTenantsPage />} />
      <Route
        path="/app/*"
        element={
          <RequireTenantToken>
            <DashboardShell />
          </RequireTenantToken>
        }
      >
        <Route path="management/dashboard" element={guarded('DSH03', <ManagerDashboardHome titleKey="dashboard.management" />)} />
        <Route path="manager/dashboard" element={guarded('DSH02', <ManagerDashboardHome titleKey="dashboard.manager" />)} />
        <Route path="fieldStaff/dashboard" element={guarded('DSH01', <FieldStaffDashboardHome />)} />
        <Route path="hierachy" element={guarded('MAS06', <HierarchyMasterPage />)} />
        <Route path="employees" element={guarded('MAS07', <EmployeeMasterPage />)} />
        <Route path="city" element={guarded('MAS20102', <MasterPageByKey pageKey="city" />)} />
        <Route path="headQuarter" element={guarded('MAS20103', <MasterPageByKey pageKey="headQuarter" />)} />
        <Route path="route" element={guarded('MAS20104', <MasterPageByKey pageKey="route" />)} />
        <Route path="brand" element={guarded('MAS19', <MasterPageByKey pageKey="brand" />)} />
        <Route path="product" element={guarded('MAS05', <MasterPageByKey pageKey="product" />)} />
        <Route path="doctor" element={guarded('MAS09', <MasterPageByKey pageKey="doctor" />)} />
        <Route path="retailer" element={guarded('MAS03', <MasterPageByKey pageKey="retailer" />)} />
        <Route path="stockist" element={guarded('MAS04', <MasterPageByKey pageKey="stockist" />)} />
        <Route path="holiday" element={guarded('MAS20204', <MasterPageByKey pageKey="holiday" />)} />
        <Route path="designation" element={guarded('MAS20201', <LovPageByKey pageKey="designation" />)} />
        <Route path="dosage" element={guarded('MAS20202', <LovPageByKey pageKey="dosage" />)} />
        <Route path="division" element={guarded('MAS20206', <LovPageByKey pageKey="division" />)} />
        <Route path="specialist" element={guarded('MAS20209', <LovPageByKey pageKey="specialist" />)} />
        <Route path="qualification" element={guarded('MAS20208', <LovPageByKey pageKey="qualification" />)} />
        <Route path="expenseHead" element={guarded('MAS20203', <LovPageByKey pageKey="expenseHead" />)} />
        <Route path="expenseTemplate" element={guarded('MAS08', <LovPageByKey pageKey="expenseTemplate" />)} />
        <Route path="bulkCityUpload" element={guarded('MASBLK01', <BulkPageByKey pageKey="bulkCityUpload" />)} />
        <Route path="bulkHQUpload" element={guarded('MASBLK02', <BulkPageByKey pageKey="bulkHQUpload" />)} />
        <Route path="bulkRouteUpload" element={guarded('MASBLK03', <BulkPageByKey pageKey="bulkRouteUpload" />)} />
        <Route path="bulkDoctorUpload" element={guarded('MASBLK04', <BulkPageByKey pageKey="bulkDoctorUpload" />)} />
        <Route path="bulkRetailerUpload" element={guarded('MASBLK05', <BulkPageByKey pageKey="bulkRetailerUpload" />)} />
        <Route path="bulkStockistUpload" element={guarded('MASBLK06', <BulkPageByKey pageKey="bulkStockistUpload" />)} />
        <Route path="bulkProductUpload" element={guarded('MASBLK07', <BulkPageByKey pageKey="bulkProductUpload" />)} />
        <Route path="monthlyRTP" element={guarded('TRN01', <RtpPage />)} />
        <Route path="weeklyPlan" element={guarded('TRN24', <WeeklyPlanPage />)} />
        <Route path="dcrRecord" element={guarded('TRN03', <DcrPage />)} />
        <Route path="dcrRecord/approval/admin" element={guarded('APP01', <ApprovalQueuePage entityType="DCR" titleKey="approval.dcr.title" />)} />
        <Route path="monthlyRTP/approval" element={guarded('TRN02', <ApprovalQueuePage entityType="RTP" titleKey="approval.rtp.title" />)} />
        <Route path="pendingWeeklyPlan" element={guarded('APP04', <ApprovalQueuePage entityType="WEEKLY_PLAN" titleKey="approval.weekly.title" />)} />
        <Route path="leaveApplication" element={guarded('TRN09', <LeaveApplicationPage />)} />
        <Route path="leave/approval" element={guarded('TRN10', <ApprovalQueuePage entityType="LEAVE" titleKey="approval.leave.title" />)} />
        <Route path="doctor-creation-request" element={guarded('MAS10', <DoctorCreationRequestPage />)} />
        <Route path="doctor-approval" element={guarded('MAS11', <ApprovalQueuePage entityType="DOCTOR" titleKey="approval.doctor.title" />)} />
        <Route path="expenseStatement" element={guarded('TRN20', <ExpenseStatementPage />)} />
        <Route path="expenseStatement/approval" element={guarded('TRN21', <ApprovalQueuePage entityType="EXPENSE" titleKey="approval.expense.title" />)} />
        <Route path="leavePolicy" element={guarded('SET03', <LeavePolicyPage />)} />
        <Route path="report/dcr-summary" element={guarded('REP01', <ReportPage reportKey="dcr-summary" />)} />
        <Route path="report/monthlyExpenseSummary" element={guarded('REP05', <ReportPage reportKey="expense-summary" />)} />
        <Route path="report/employee-pob" element={guarded('REP12', <ReportPage reportKey="employee-pob" />)} />
        <Route path="report/salesSummary" element={guarded('REP41712', <SalesSummaryReportPage />)} />
        <Route path="report/employeeTargetAchievement" element={guarded('REP20', <TargetAchievementReportPage />)} />
        <Route path="report/visit-summary" element={guarded('REP02', <VisitSummaryReportPage />)} />
        <Route path="report/rtp-summary" element={guarded('REP10', <RtpSummaryReportPage />)} />
        <Route path="report/missedCallReport" element={guarded('REP22', <MissedCallsReportPage />)} />
        <Route path="report/monthlyCoveredDoctor" element={guarded('REP23', <MonthlyCoveredDoctorReportPage />)} />
        <Route path="report/doctors" element={guarded('REP18', <DoctorReportPage />)} />
        <Route path="report/employee-attendance" element={guarded('REP13', <EmployeeAttendanceReportPage />)} />
        <Route path="report/employee-analysis" element={guarded('REP04', <EmployeeAnalysisReportPage />)} />
        <Route path="pob/add" element={guarded('TRN04', <PobPage />)} />
        <Route path="roleMaster" element={guarded('ADM01', <RoleMasterPage />)} />
        <Route path="roleSetting" element={guarded('ADM04', <RoleSettingPage />)} />
        <Route path="insightsChatConfig" element={guarded('ADM05', <InsightsChatConfigPage />)} />
        <Route path="security/loginAnalytics" element={guarded('ADM06', <LoginAnalyticsPage />)} />
        <Route path="*" element={<DashboardHome titleKey="dashboard.default" />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
