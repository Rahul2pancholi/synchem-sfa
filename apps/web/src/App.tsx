import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { LoginPage } from './features/auth/LoginPage';
import { PlatformLoginPage } from './features/platform/PlatformLoginPage';
import { PlatformTenantsPage } from './features/platform/PlatformTenantsPage';
import { DashboardShell } from './features/shell/DashboardShell';
import { DashboardHome } from './features/shell/DashboardHome';

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
        <Route path="*" element={<DashboardHome titleKey="dashboard.default" />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
