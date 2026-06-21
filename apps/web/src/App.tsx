import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { LoginPage } from './features/auth/LoginPage';
import { PlatformLoginPage } from './features/platform/PlatformLoginPage';
import { PlatformTenantsPage } from './features/platform/PlatformTenantsPage';
import { DashboardShell } from './features/shell/DashboardShell';
import { DashboardHome } from './features/shell/DashboardHome';
import { HierarchyMasterPage } from './features/masters/HierarchyMasterPage';
import { EmployeeMasterPage } from './features/masters/EmployeeMasterPage';
import { BulkPageByKey, LovPageByKey, MasterPageByKey } from './features/masters/MasterPageRouter';

function RequireTenantToken({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('access_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
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
        <Route path="management/dashboard" element={<DashboardHome titleKey="dashboard.management" />} />
        <Route path="manager/dashboard" element={<DashboardHome titleKey="dashboard.manager" />} />
        <Route path="fieldStaff/dashboard" element={<DashboardHome titleKey="dashboard.fieldStaff" />} />
        <Route path="hierachy" element={<HierarchyMasterPage />} />
        <Route path="employees" element={<EmployeeMasterPage />} />
        <Route path="city" element={<MasterPageByKey pageKey="city" />} />
        <Route path="headQuarter" element={<MasterPageByKey pageKey="headQuarter" />} />
        <Route path="route" element={<MasterPageByKey pageKey="route" />} />
        <Route path="brand" element={<MasterPageByKey pageKey="brand" />} />
        <Route path="product" element={<MasterPageByKey pageKey="product" />} />
        <Route path="doctor" element={<MasterPageByKey pageKey="doctor" />} />
        <Route path="retailer" element={<MasterPageByKey pageKey="retailer" />} />
        <Route path="stockist" element={<MasterPageByKey pageKey="stockist" />} />
        <Route path="holiday" element={<MasterPageByKey pageKey="holiday" />} />
        <Route path="designation" element={<LovPageByKey pageKey="designation" />} />
        <Route path="dosage" element={<LovPageByKey pageKey="dosage" />} />
        <Route path="division" element={<LovPageByKey pageKey="division" />} />
        <Route path="specialist" element={<LovPageByKey pageKey="specialist" />} />
        <Route path="qualification" element={<LovPageByKey pageKey="qualification" />} />
        <Route path="expenseHead" element={<LovPageByKey pageKey="expenseHead" />} />
        <Route path="expenseTemplate" element={<LovPageByKey pageKey="expenseTemplate" />} />
        <Route path="bulkCityUpload" element={<BulkPageByKey pageKey="bulkCityUpload" />} />
        <Route path="bulkHQUpload" element={<BulkPageByKey pageKey="bulkHQUpload" />} />
        <Route path="bulkRouteUpload" element={<BulkPageByKey pageKey="bulkRouteUpload" />} />
        <Route path="bulkDoctorUpload" element={<BulkPageByKey pageKey="bulkDoctorUpload" />} />
        <Route path="bulkRetailerUpload" element={<BulkPageByKey pageKey="bulkRetailerUpload" />} />
        <Route path="bulkStockistUpload" element={<BulkPageByKey pageKey="bulkStockistUpload" />} />
        <Route path="bulkProductUpload" element={<BulkPageByKey pageKey="bulkProductUpload" />} />
        <Route path="*" element={<DashboardHome titleKey="dashboard.default" />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
