import type { ApprovalSummary, ManagerSalesKpis } from '@synchem-sfa/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Col, Row, Spin, Typography } from 'antd';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { StatCard } from '../../components/ui/StatCard';
import { SalesInsightsSection } from './SalesInsightsSection';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';
import { usePermission } from '../../hooks/usePermission';

interface SummaryResponse {
  data: ApprovalSummary;
}

interface KpisResponse {
  data: ManagerSalesKpis;
}

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
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
  const canViewSalesKpis = usePermission('REP20', 'view');
  const canViewMissedCalls = usePermission('REP22', 'view');

  const summaryQuery = useQuery({
    queryKey: ['approval-summary'],
    queryFn: async () => {
      const res = await fetchApi<SummaryResponse>('/api/v1/approvals/summary', languageHeader);
      return res.data;
    },
    enabled: canViewSummary,
  });

  const salesKpisQuery = useQuery({
    queryKey: ['manager-sales-kpis'],
    queryFn: async () => {
      const res = await fetchApi<KpisResponse>('/api/v1/reports/manager-kpis', languageHeader);
      return res.data;
    },
    enabled: canViewSalesKpis,
  });

  const summary = summaryQuery.data;
  const kpis = salesKpisQuery.data;
  const welcome = employee?.firstName
    ? `${employee.firstName}, ${t('shell.welcomePhase0')}`
    : t('shell.welcomePhase0');

  return (
    <PageLayout title={t(titleKey)} subtitle={welcome}>
      {canViewSalesKpis ? (
        <PageSection title={t('dashboard.mgr.salesKpis')}>
          <Spin spinning={salesKpisQuery.isLoading}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard
                  title={t('dashboard.mgr.pobMtd')}
                  info={t('dashboard.mgr.statHelp.pobMtd')}
                  value={kpis?.pobApprovedAmount ?? 0}
                  suffix="₹"
                  to="/app/report/salesSummary"
                />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard
                  title={t('dashboard.mgr.pobAchievement')}
                  info={t('dashboard.mgr.statHelp.pobAchievement')}
                  value={kpis?.pobAchievementPct ?? 0}
                  suffix="%"
                  to="/app/report/employeeTargetAchievement"
                />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard
                  title={t('dashboard.mgr.coverage')}
                  info={t('dashboard.mgr.statHelp.coverage')}
                  value={kpis?.coveragePct ?? 0}
                  suffix="%"
                  to="/app/report/visit-summary"
                />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard
                  title={t('dashboard.mgr.doctorVisits')}
                  info={t('dashboard.mgr.statHelp.doctorVisits')}
                  value={kpis?.doctorVisits ?? 0}
                  to="/app/report/visit-summary"
                />
              </Col>
              {canViewMissedCalls ? (
                <Col xs={12} sm={12} md={8} lg={6}>
                  <StatCard
                    title={t('dashboard.mgr.missedCalls')}
                    info={t('dashboard.mgr.statHelp.missedCalls')}
                    value={kpis?.missedCallCount ?? 0}
                    to="/app/report/missedCallReport"
                  />
                </Col>
              ) : null}
            </Row>
            {kpis ? (
              <Typography.Text type="secondary" className="page-caption">
                {formatInr(kpis.pobApprovedAmount)} / {formatInr(kpis.amountTarget)} ·{' '}
                {kpis.doctorVisits}/{kpis.plannedDoctorCalls} {t('report.plannedCalls').toLowerCase()}
              </Typography.Text>
            ) : null}
          </Spin>
        </PageSection>
      ) : null}

      <SalesInsightsSection enabled={canViewSalesKpis} />

      {canViewSummary ? (
        <PageSection title={t('approval.pendingSummary')}>
          <Spin spinning={summaryQuery.isLoading}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard
                  title={t('approval.dcr.title')}
                  info={t('approval.statHelp.dcr')}
                  value={summary?.dcr ?? 0}
                  to="/app/dcrRecord/approval/admin"
                />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard
                  title={t('approval.rtp.title')}
                  info={t('approval.statHelp.rtp')}
                  value={summary?.rtp ?? 0}
                  to="/app/monthlyRTP/approval"
                />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard
                  title={t('approval.weekly.title')}
                  info={t('approval.statHelp.weekly')}
                  value={summary?.weeklyPlan ?? 0}
                  to="/app/pendingWeeklyPlan"
                />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard
                  title={t('approval.leave.title')}
                  info={t('approval.statHelp.leave')}
                  value={summary?.leave ?? 0}
                  to="/app/leave/approval"
                />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard
                  title={t('approval.expense.title')}
                  info={t('approval.statHelp.expense')}
                  value={summary?.expense ?? 0}
                  to="/app/expenseStatement/approval"
                />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard
                  title={t('approval.totalPending')}
                  info={t('approval.statHelp.total')}
                  value={summary?.total ?? 0}
                />
              </Col>
            </Row>
          </Spin>
        </PageSection>
      ) : (
        !canViewSalesKpis ? (
          <PageSection>
            <Typography.Text type="secondary">{t('shell.welcomePhase0')}</Typography.Text>
          </PageSection>
        ) : null
      )}
    </PageLayout>
  );
}
