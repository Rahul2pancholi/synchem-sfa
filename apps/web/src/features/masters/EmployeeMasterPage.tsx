import { FormEvent, useEffect, useState } from 'react';
import type { EmployeeSummary, RoleSummary } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';

function authHeaders(languageHeader: Record<string, string>) {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...languageHeader,
  };
}

export function EmployeeMasterPage() {
  const { t, languageHeader } = useI18n();
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [managers, setManagers] = useState<EmployeeSummary[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [roleId, setRoleId] = useState('');
  const [reportingManagerId, setReportingManagerId] = useState('');

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [employeesRes, rolesRes] = await Promise.all([
        fetch('/api/v1/employees?pageSize=100', { headers: authHeaders(languageHeader) }),
        fetch('/api/v1/roles', { headers: authHeaders(languageHeader) }),
      ]);

      if (!employeesRes.ok || !rolesRes.ok) {
        setError(t('masters.employee.loadFailed'));
        return;
      }

      const employeesData = await employeesRes.json();
      const rolesData = await rolesRes.json();
      const list: EmployeeSummary[] = employeesData.data.items ?? [];
      const roleList: RoleSummary[] = rolesData.data.items ?? [];

      setEmployees(list);
      setManagers(list.filter((item) => item.active));
      setRoles(roleList);
      if (!roleId && roleList[0]) {
        setRoleId(roleList[0].id);
      }
    } catch {
      setError(t('masters.employee.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function createEmployee(e: FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/v1/employees', {
      method: 'POST',
      headers: authHeaders(languageHeader),
      body: JSON.stringify({
        userName,
        password,
        employeeCode: employeeCode || undefined,
        firstName,
        lastName: lastName || undefined,
        email: email || undefined,
        mobileNo: mobileNo || undefined,
        roleId,
        reportingManagerId: reportingManagerId || null,
      }),
    });

    if (!res.ok) {
      setError(t('masters.employee.createFailed'));
      return;
    }

    setUserName('');
    setPassword('');
    setEmployeeCode('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setMobileNo('');
    setReportingManagerId('');
    await loadData();
  }

  async function deactivate(id: string) {
    const res = await fetch(`/api/v1/employees/${id}`, {
      method: 'DELETE',
      headers: authHeaders(languageHeader),
    });

    if (!res.ok) {
      setError(t('masters.employee.deleteFailed'));
      return;
    }

    await loadData();
  }

  return (
    <div className="master-page">
      <h1>{t('masters.employee.title')}</h1>

      <section className="platform-card">
        <h2>{t('masters.employee.createTitle')}</h2>
        <form className="master-form grid-form" onSubmit={createEmployee}>
          <input
            placeholder={t('masters.employee.userName')}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t('masters.employee.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            placeholder={t('masters.employee.employeeCode')}
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
          />
          <input
            placeholder={t('masters.employee.firstName')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            placeholder={t('masters.employee.lastName')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            placeholder={t('masters.employee.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder={t('masters.employee.mobile')}
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
          />
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.roleName} ({role.roleType})
              </option>
            ))}
          </select>
          <select
            value={reportingManagerId}
            onChange={(e) => setReportingManagerId(e.target.value)}
          >
            <option value="">{t('masters.employee.none')}</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.firstName} {manager.lastName ?? ''} ({manager.userName})
              </option>
            ))}
          </select>
          <button type="submit">{t('common.create')}</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="platform-card">
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : (
          <table className="tenant-table">
            <thead>
              <tr>
                <th>{t('masters.employee.userName')}</th>
                <th>{t('masters.employee.firstName')}</th>
                <th>{t('masters.employee.role')}</th>
                <th>{t('masters.employee.reportingManager')}</th>
                <th>{t('platform.tenants.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.userName}</td>
                  <td>
                    {employee.firstName} {employee.lastName ?? ''}
                  </td>
                  <td>{employee.roleName}</td>
                  <td>{employee.reportingManagerName ?? t('masters.employee.none')}</td>
                  <td>{employee.active ? t('common.active') : t('common.inactive')}</td>
                  <td>
                    {employee.active && employee.userName !== 'admin' && (
                      <button type="button" onClick={() => void deactivate(employee.id)}>
                        {t('common.delete')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
