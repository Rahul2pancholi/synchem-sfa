import { Typography } from 'antd';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { useI18n } from '../../i18n/I18nProvider';

export function DashboardHome({
  titleKey,
}: {
  titleKey: 'dashboard.management' | 'dashboard.manager' | 'dashboard.fieldStaff' | 'dashboard.default';
}) {
  const { t } = useI18n();
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? JSON.parse(employeeRaw) : null;
  const welcome = employee?.firstName
    ? `${employee.firstName}, ${t('shell.welcomePhase0')}`
    : t('shell.welcomePhase0');

  return (
    <PageLayout title={t(titleKey)} subtitle={welcome}>
      <PageSection>
        <Typography.Paragraph style={{ margin: 0 }}>{t('shell.welcomePhase0')}</Typography.Paragraph>
      </PageSection>
    </PageLayout>
  );
}
