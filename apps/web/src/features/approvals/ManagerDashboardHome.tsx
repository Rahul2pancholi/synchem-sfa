import type { ApprovalSummary } from '@synchem-sfa/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Col, Row, Spin, Typography } from 'antd';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { StatCard } from '../../components/ui/StatCard';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';
import { usePermission } from '../../hooks/usePermission';

interface SummaryResponse {
  data: ApprovalSummary;
}

export function ManagerDashboardHome({
  titleKey,
}: {
  titleKey: 'dashboard.management' | 'dashboard.manager' | 'dashboard.fieldStaff' | 'dashboard.default';
}) {
  const { t, languageHeader } = useI18n();
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? JSON.parse(employeeRaw) : null;
  const canViewDcr = usePermission('APP01', 'view');
  const canViewRtp = usePermission('TRN02', 'view');
  const canViewWeekly = usePermission('APP04', 'view');
  const canViewLeave = usePermission('TRN10', 'view');
  const canViewExpense = usePermission('TRN21', 'view');
  const canViewSummary =
    canViewDcr || canViewRtp || canViewWeekly || canViewLeave || canViewExpense;

  const summaryQuery = useQuery({
    queryKey: ['approval-summary'],
    queryFn: async () => {
      const res = await fetchApi<SummaryResponse>('/api/v1/approvals/summary', languageHeader);
      return res.data;
    },
    enabled: canViewSummary,
  });

  const summary = summaryQuery.data;
  const welcome = employee?.firstName
    ? `${employee.firstName}, ${t('shell.welcomePhase0')}`
    : t('shell.welcomePhase0');

  return (
    <PageLayout title={t(titleKey)} subtitle={welcome}>
      {canViewSummary ? (
        <PageSection title={t('approval.pendingSummary')}>
          <Spin spinning={summaryQuery.isLoading}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard title={t('approval.dcr.title')} value={summary?.dcr ?? 0} to="/app/dcrRecord/approval/admin" />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard title={t('approval.rtp.title')} value={summary?.rtp ?? 0} to="/app/monthlyRTP/approval" />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard title={t('approval.weekly.title')} value={summary?.weeklyPlan ?? 0} to="/app/pendingWeeklyPlan" />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard title={t('approval.leave.title')} value={summary?.leave ?? 0} to="/app/leave/approval" />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard title={t('approval.expense.title')} value={summary?.expense ?? 0} to="/app/expenseStatement/approval" />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard title={t('approval.totalPending')} value={summary?.total ?? 0} />
              </Col>
            </Row>
          </Spin>
        </PageSection>
      ) : (
        <PageSection>
          <Typography.Text type="secondary">{t('shell.welcomePhase0')}</Typography.Text>
        </PageSection>
      )}
    </PageLayout>
  );
}
