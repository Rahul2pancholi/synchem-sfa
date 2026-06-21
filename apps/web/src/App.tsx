import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardShell } from './features/shell/DashboardShell';

export function App() {
  const token = localStorage.getItem('access_token');

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app/*"
        element={token ? <DashboardShell /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={token ? '/app' : '/login'} replace />} />
    </Routes>
  );
}
