import { useI18n } from '../../i18n/I18nProvider';

export function DashboardHome({ titleKey }: { titleKey: 'dashboard.management' | 'dashboard.manager' | 'dashboard.fieldStaff' | 'dashboard.default' }) {
  const { t } = useI18n();
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? JSON.parse(employeeRaw) : null;

  return (
    <section className="welcome">
      <h3>{t(titleKey)}</h3>
      <p>
        {employee?.firstName ? `${employee.firstName}, ` : ''}
        {t('shell.welcomePhase0')}
      </p>
    </section>
  );
}
