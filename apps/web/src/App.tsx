import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { RequireMenuView } from './features/access/AccessDeniedPage';
import { RoleMasterPage } from './features/access/RoleMasterPage';
import { RoleSettingPage } from './features/access/RoleSettingPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { LoginPage } from './features/auth/LoginPage';
import { PlatformLoginPage } from './features/platform/PlatformLoginPage';
import { PlatformTenantsPage } from './features/platform/PlatformTenantsPage';
import { PlatformTenantDetailPage } from './features/platform/PlatformTenantDetailPage';
import { DashboardShell } from './features/shell/DashboardShell';
import { SmartHomePage } from './features/shell/SmartHomePage';
import { HelpPage } from './features/shell/HelpPage';
import { DoctorCreationRequestPage } from './features/masters/DoctorCreationRequestPage';
import { HierarchyMasterPage } from './features/masters/HierarchyMasterPage';
import { EmployeeMasterPage } from './features/masters/EmployeeMasterPage';
import { ImportCenterPage } from './features/masters/ImportCenterPage';
import { LovPageByKey, MasterPageByKey } from './features/masters/MasterPageRouter';
import { DcrPage } from './features/transactions/DcrPage';
import { PobPage } from './features/transactions/PobPage';
import { RtpPage } from './features/transactions/RtpPage';
import { WeeklyPlanPage } from './features/transactions/WeeklyPlanPage';
import { PendingApprovalsPage } from './features/approvals/PendingApprovalsPage';
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

function LegacyRedirect({ to }: { to: string }) {
  const location = useLocation();
  const target = location.search ? `${to}${location.search}` : to;
  return <Navigate to={target} replace />;
}

const BULK_ENTITY_REDIRECTS: Record<string, string> = {
  bulkCityUpload: 'bulkCityUpload',
  bulkHQUpload: 'bulkHQUpload',
  bulkRouteUpload: 'bulkRouteUpload',
  bulkDoctorUpload: 'bulkDoctorUpload',
  bulkRetailerUpload: 'bulkRetailerUpload',
  bulkStockistUpload: 'bulkStockistUpload',
  bulkProductUpload: 'bulkProductUpload',
};

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/platform/login" element={<PlatformLoginPage />} />
      <Route path="/platform/tenants" element={<PlatformTenantsPage />} />
      <Route path="/platform/tenants/:compCode" element={<PlatformTenantDetailPage />} />
      <Route
        path="/app/*"
        element={
          <RequireTenantToken>
            <DashboardShell />
          </RequireTenantToken>
        }
      >
        <Route path="home" element={<SmartHomePage />} />
        <Route path="management/dashboard" element={<SmartHomePage />} />
        <Route path="manager/dashboard" element={<SmartHomePage />} />
        <Route path="fieldStaff/dashboard" element={<SmartHomePage />} />
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
        <Route path="import" element={guarded('MASIMP', <ImportCenterPage />)} />
        {Object.entries(BULK_ENTITY_REDIRECTS).map(([path, entity]) => (
          <Route
            key={path}
            path={path}
            element={<LegacyRedirect to={`/app/import?entity=${entity}`} />}
          />
        ))}
        <Route path="monthlyRTP" element={guarded('TRN01', <RtpPage />)} />
        <Route path="weeklyPlan" element={guarded('TRN24', <WeeklyPlanPage />)} />
        <Route path="dcrRecord" element={guarded('TRN03', <DcrPage />)} />
        <Route path="approvals" element={guarded('APP00', <PendingApprovalsPage />)} />
        <Route path="dcrRecord/approval/admin" element={<LegacyRedirect to="/app/approvals?type=DCR" />} />
        <Route path="monthlyRTP/approval" element={<LegacyRedirect to="/app/approvals?type=RTP" />} />
        <Route path="pendingWeeklyPlan" element={<LegacyRedirect to="/app/approvals?type=WEEKLY_PLAN" />} />
        <Route path="leaveApplication" element={guarded('TRN09', <LeaveApplicationPage />)} />
        <Route path="leave/approval" element={<LegacyRedirect to="/app/approvals?type=LEAVE" />} />
        <Route path="doctor-creation-request" element={guarded('MAS10', <DoctorCreationRequestPage />)} />
        <Route path="doctor-approval" element={<LegacyRedirect to="/app/approvals?type=DOCTOR" />} />
        <Route path="expenseStatement" element={guarded('TRN20', <ExpenseStatementPage />)} />
        <Route path="expenseStatement/approval" element={<LegacyRedirect to="/app/approvals?type=EXPENSE" />} />
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
        <Route path="help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/app/home" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
