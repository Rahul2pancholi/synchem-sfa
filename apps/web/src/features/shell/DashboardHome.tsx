import { Card, Typography } from 'antd';
import { useI18n } from '../../i18n/I18nProvider';

export function DashboardHome({
  titleKey,
}: {
  titleKey: 'dashboard.management' | 'dashboard.manager' | 'dashboard.fieldStaff' | 'dashboard.default';
}) {
  const { t } = useI18n();
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? JSON.parse(employeeRaw) : null;

  return (
    <Card>
      <Typography.Title level={4}>{t(titleKey)}</Typography.Title>
      <Typography.Paragraph>
        {employee?.firstName ? `${employee.firstName}, ` : ''}
        {t('shell.welcomePhase0')}
      </Typography.Paragraph>
    </Card>
  );
}
