import { Navigate } from 'react-router-dom';
import { AdminDashboardHome } from './AdminDashboardHome';
import { ManagerDashboardHome } from '../approvals/ManagerDashboardHome';
import { FieldStaffDashboardHome } from './FieldStaffDashboardHome';

export function SmartHomePage() {
  const roleType = localStorage.getItem('roleType');

  if (roleType === 'FS') {
    return <FieldStaffDashboardHome />;
  }

  if (roleType === 'MAN') {
    return <ManagerDashboardHome titleKey="dashboard.manager" />;
  }

  if (roleType === 'AD') {
    return <AdminDashboardHome />;
  }

  return <Navigate to="/login" replace />;
}
