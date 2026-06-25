import type {
  ApprovalSummary,
  EmployeeAnalysisReportRow,
  ManagerSalesKpis,
} from '@synchem-sfa/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Alert, Badge, Card, Col, Progress, Row, Spin, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { BarChartCard } from '../../components/ui/BarChartCard';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { StatCard } from '../../components/ui/StatCard';
import { SalesInsightsSection } from './SalesInsightsSection';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';
import { countHealth, pctHealth } from '../../lib/dashboard-health';
import { usePermission } from '../../hooks/usePermission';

interface SummaryResponse { data: ApprovalSummary; }
interface KpisResponse { data: ManagerSalesKpis; }
interface AnalysisResponse {
  data: { summary: unknown; items: EmployeeAnalysisReportRow[] };
}

function formatInr(n: number) {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}

function pctColor(pct: number) {
  if (pct >= 80) return '#52c41a';
  if (pct >= 60) return '#faad14';
  return '#ff4d4f';
}

function TeamMemberCard({ row }: { row: EmployeeAnalysisReportRow }) {
  const pob = Math.round(row.pobAchievementPct);
  const cov = Math.round(row.coveragePct);

  let statusText = 'On Track';
  let statusColor: 'success' | 'warning' | 'error' = 'success';
  if (row.amountTarget > 0 && (pob < 60 || cov < 60)) {
    statusText = 'Needs Attention';
    statusColor = 'error';
  } else if (row.amountTarget > 0 && (pob < 80 || cov < 80)) {
    statusText = 'At Risk';
    statusColor = 'warning';
  } else if (row.amountTarget === 0) {
    statusText = 'No Target';
    statusColor = 'warning';
  }

  return (
    <Link to={`/app/report/employeeTargetAchievement?empId=${row.empId}`} style={{ display: 'block' }}>
      <Card
        size="small"
        hoverable
        style={{ minWidth: 200, borderRadius: 10 }}
        styles={{ body: { padding: '12px 14px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Typography.Text strong style={{ fontSize: 13 }}>
            {row.employeeName.split(' ')[0]}
          </Typography.Text>
          <Badge status={statusColor} text={<span style={{ fontSize: 11 }}>{statusText}</span>} />
        </div>
        {row.headQuarterName && (
          <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
            {row.headQuarterName}
          </Typography.Text>
        )}
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>Coverage</span>
          <Progress
            percent={cov}
            size="small"
            strokeColor={pctColor(cov)}
            format={(p) => <span style={{ fontSize: 11 }}>{p}%</span>}
          />
        </div>
        <div>
          <span style={{ fontSize: 11, color: '#64748b' }}>POB</span>
          <Progress
            percent={pob}
            size="small"
            strokeColor={pctColor(pob)}
            format={(p) => <span style={{ fontSize: 11 }}>{p}%</span>}
          />
        </div>
        {row.amountTarget > 0 && (
          <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
            {formatInr(row.actualAmount)} / {formatInr(row.amountTarget)}
          </Typography.Text>
        )}
      </Card>
    </Link>
  );
}

export function ManagerDashboardHome({
  titleKey,
}: {
  titleKey: 'dashboard.management' | 'dashboard.manager' | 'dashboard.fieldStaff' | 'dashboard.default';
}) {
  const { t, languageHeader } = useI18n();
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? (JSON.parse(employeeRaw) as { firstName?: string }) : null;

  const canViewDcr = usePermission('APP01', 'view');
  const canViewRtp = usePermission('TRN02', 'view');
  const canViewWeekly = usePermission('APP04', 'view');
  const canViewLeave = usePermission('TRN10', 'view');
  const canViewExpense = usePermission('TRN21', 'view');
  const canViewDoctor = usePermission('MAS11', 'view');
  const canViewSummary =
    canViewDcr || canViewRtp || canViewWeekly || canViewLeave || canViewExpense || canViewDoctor;
  const canViewSalesKpis = usePermission('REP20', 'view');
  const canViewAnalysis = usePermission('REP04', 'view');

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const salesKpisQuery = useQuery({
    queryKey: ['manager-sales-kpis'],
    queryFn: () =>
      fetchApi<KpisResponse>('/api/v1/reports/manager-kpis', languageHeader).then((r) => r.data),
    enabled: canViewSalesKpis,
  });

  const summaryQuery = useQuery({
    queryKey: ['approval-summary'],
    queryFn: () =>
      fetchApi<SummaryResponse>('/api/v1/approvals/summary', languageHeader).then((r) => r.data),
    enabled: canViewSummary,
  });

  const analysisQuery = useQuery({
    queryKey: ['mgr-employee-analysis', month, year],
    queryFn: () =>
      fetchApi<AnalysisResponse>(
        `/api/v1/reports/employee-analysis?month=${month}&year=${year}`,
        languageHeader,
      ).then((r) => r.data),
    enabled: canViewAnalysis,
  });

  const kpis = salesKpisQuery.data;
  const summary = summaryQuery.data;
  const teamItems = analysisQuery.data?.items ?? [];

  const welcome = employee?.firstName
    ? `${employee.firstName}, ${t('shell.welcomeManager')}`
    : t('shell.welcomeManager');

  const teamBarData = teamItems
    .filter((r) => r.amountTarget > 0)
    .sort((a, b) => b.pobAchievementPct - a.pobAchievementPct)
    .map((r) => ({ name: r.employeeName.split(' ')[0], value: Math.round(r.pobAchievementPct) }));

  const pendingQueues = [
    { count: summary?.dcr ?? 0, title: t('approval.dcr.title'), to: '/app/approvals?type=DCR', show: canViewDcr },
    { count: summary?.rtp ?? 0, title: t('approval.rtp.title'), to: '/app/approvals?type=RTP', show: canViewRtp },
    { count: summary?.weeklyPlan ?? 0, title: t('approval.weekly.title'), to: '/app/approvals?type=WEEKLY_PLAN', show: canViewWeekly },
    { count: summary?.leave ?? 0, title: t('approval.leave.title'), to: '/app/approvals?type=LEAVE', show: canViewLeave },
    { count: summary?.expense ?? 0, title: t('approval.expense.title'), to: '/app/approvals?type=EXPENSE', show: canViewExpense },
    { count: summary?.doctor ?? 0, title: t('approval.doctor.title'), to: '/app/approvals?type=DOCTOR', show: canViewDoctor },
  ].filter((item) => item.show && item.count > 0);

  return (
    <PageLayout title={t(titleKey)} subtitle={welcome}>
      {canViewSalesKpis ? (
        <PageSection title={t('dashboard.mgr.salesKpis')}>
          <Spin spinning={salesKpisQuery.isLoading}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8}>
                <StatCard
                  title={t('dashboard.mgr.pobAchievement')}
                  info={t('dashboard.mgr.statHelp.pobAchievement')}
                  value={Math.round(kpis?.pobAchievementPct ?? 0)}
                  suffix="%"
                  to="/app/report/employeeTargetAchievement"
                  health={kpis ? pctHealth(kpis.pobAchievementPct) : undefined}
                />
              </Col>
              <Col xs={12} sm={8}>
                <StatCard
                  title={t('dashboard.mgr.coverage')}
                  info={t('dashboard.mgr.statHelp.coverage')}
                  value={Math.round(kpis?.coveragePct ?? 0)}
                  suffix="%"
                  to="/app/report/visit-summary"
                  health={kpis ? pctHealth(kpis.coveragePct) : undefined}
                />
              </Col>
              <Col xs={12} sm={8}>
                <StatCard
                  title={t('dashboard.mgr.missedCalls')}
                  info={t('dashboard.mgr.statHelp.missedCalls')}
                  value={kpis?.missedCallCount ?? 0}
                  to="/app/report/missedCallReport"
                  health={kpis ? countHealth(kpis.missedCallCount) : undefined}
                />
              </Col>
            </Row>
            {kpis ? (
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
                {formatInr(kpis.pobApprovedAmount)} / {formatInr(kpis.amountTarget)} target
                &nbsp;·&nbsp;
                {kpis.doctorVisits}/{kpis.plannedDoctorCalls} {t('report.plannedCalls').toLowerCase()}
              </Typography.Text>
            ) : null}
          </Spin>
        </PageSection>
      ) : null}

      <SalesInsightsSection enabled={canViewSalesKpis} />

      {canViewAnalysis && teamItems.length > 0 ? (
        <>
          <PageSection title={t('dashboard.mgr.teamCards')}>
            <Spin spinning={analysisQuery.isLoading}>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                {teamItems.map((row) => (
                  <div key={row.empId} style={{ flexShrink: 0, width: 210 }}>
                    <TeamMemberCard row={row} />
                  </div>
                ))}
              </div>
            </Spin>
          </PageSection>

          {teamBarData.length > 0 && (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={14}>
                <BarChartCard
                  title={t('dashboard.mgr.teamChart')}
                  data={teamBarData}
                  loading={analysisQuery.isLoading}
                  height={Math.max(180, teamBarData.length * 32)}
                />
              </Col>
              <Col xs={24} lg={10}>
                {canViewSummary ? (
                  <PageSection title={t('approval.pendingSummary')}>
                    <Spin spinning={summaryQuery.isLoading}>
                      {(summary?.total ?? 0) > 0 ? (
                        <div>
                          <div style={{ marginBottom: 12 }}>
                            <Tag color="red" style={{ fontSize: 14, padding: '4px 10px' }}>
                              {summary?.total} pending
                            </Tag>
                            <Link to="/app/approvals" style={{ marginLeft: 8, fontSize: 13 }}>
                              Go to approvals →
                            </Link>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {pendingQueues.map((item) => (
                              <Link key={item.to} to={item.to} className="pending-queue-links__item">
                                {item.title}
                                <Tag color="volcano" style={{ marginLeft: 6 }}>
                                  {item.count}
                                </Tag>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Alert type="success" showIcon message={t('approval.noPending')} />
                      )}
                    </Spin>
                  </PageSection>
                ) : null}
              </Col>
            </Row>
          )}
        </>
      ) : (
        canViewSummary ? (
          <PageSection title={t('approval.pendingSummary')}>
            <Spin spinning={summaryQuery.isLoading}>
              {(summary?.total ?? 0) > 0 ? (
                <>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <StatCard
                        title={t('approval.totalPending')}
                        info={t('approval.statHelp.total')}
                        value={summary?.total ?? 0}
                        to="/app/approvals"
                      />
                    </Col>
                  </Row>
                  <div className="pending-queue-links">
                    {pendingQueues.map((item) => (
                      <Link key={item.to} to={item.to} className="pending-queue-links__item">
                        {item.title} ({item.count})
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Alert type="success" showIcon message={t('approval.noPending')} />
              )}
            </Spin>
          </PageSection>
        ) : null
      )}
    </PageLayout>
  );
}
