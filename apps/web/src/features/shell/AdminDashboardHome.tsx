import type { ApprovalSummary, EmployeeAnalysisReportRow, EmployeeAnalysisTotals, ManagerSalesKpis } from '@synchem-sfa/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Badge, Col, DatePicker, Progress, Row, Spin, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChartCard } from '../../components/ui/BarChartCard';
import { DonutChartCard } from '../../components/ui/DonutChartCard';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { StatCard } from '../../components/ui/StatCard';
import { SalesInsightsSection } from '../approvals/SalesInsightsSection';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';
import { countHealth, pctHealth } from '../../lib/dashboard-health';
import { usePermission } from '../../hooks/usePermission';

interface KpisResponse { data: ManagerSalesKpis; }
interface SummaryResponse { data: ApprovalSummary; }
interface AnalysisResponse {
  data: { summary: EmployeeAnalysisTotals; items: EmployeeAnalysisReportRow[] };
}

function formatInr(n: number) {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n.toFixed(0)}`;
}

function pctColor(pct: number) {
  if (pct >= 80) return '#52c41a';
  if (pct >= 60) return '#faad14';
  return '#ff4d4f';
}

function buildQueryString(month: number, year: number) {
  return `month=${month}&year=${year}`;
}

export function AdminDashboardHome() {
  const { t, languageHeader } = useI18n();
  const now = dayjs();
  const [period, setPeriod] = useState(now);
  const month = period.month() + 1;
  const year = period.year();
  const qs = buildQueryString(month, year);

  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? (JSON.parse(employeeRaw) as { firstName?: string }) : null;

  const canViewKpis = usePermission('REP20', 'view');
  const canViewAnalysis = usePermission('REP04', 'view');
  const canViewApprovals = usePermission('APP00', 'view');

  const kpisQuery = useQuery({
    queryKey: ['admin-kpis', month, year],
    queryFn: () =>
      fetchApi<KpisResponse>(`/api/v1/reports/manager-kpis?${qs}`, languageHeader).then((r) => r.data),
    enabled: canViewKpis,
  });

  const analysisQuery = useQuery({
    queryKey: ['admin-employee-analysis', month, year],
    queryFn: () =>
      fetchApi<AnalysisResponse>(`/api/v1/reports/employee-analysis?${qs}`, languageHeader).then((r) => r.data),
    enabled: canViewAnalysis,
  });

  const summaryQuery = useQuery({
    queryKey: ['approval-summary'],
    queryFn: () =>
      fetchApi<SummaryResponse>('/api/v1/approvals/summary', languageHeader).then((r) => r.data),
    enabled: canViewApprovals,
  });

  const kpis = kpisQuery.data;
  const analysis = analysisQuery.data;
  const summary = summaryQuery.data;

  const greeting = employee?.firstName
    ? `Welcome back, ${employee.firstName}`
    : 'Company Dashboard';

  const pobBarData = (analysis?.items ?? [])
    .filter((r) => r.amountTarget > 0)
    .slice(0, 15)
    .sort((a, b) => b.pobAchievementPct - a.pobAchievementPct)
    .map((r) => ({ name: r.employeeName.split(' ')[0], value: Math.round(r.pobAchievementPct) }));

  const coverageBarData = (analysis?.items ?? [])
    .filter((r) => r.plannedDoctorCalls > 0)
    .slice(0, 15)
    .sort((a, b) => b.coveragePct - a.coveragePct)
    .map((r) => ({ name: r.employeeName.split(' ')[0], value: Math.round(r.coveragePct) }));

  const approvalDonutData = [
    { name: 'DCR', value: summary?.dcr ?? 0, color: '#0891b2' },
    { name: 'Tour Plan', value: summary?.rtp ?? 0, color: '#7c3aed' },
    { name: 'Weekly', value: summary?.weeklyPlan ?? 0, color: '#0d9488' },
    { name: 'Leave', value: summary?.leave ?? 0, color: '#d97706' },
    { name: 'Expense', value: summary?.expense ?? 0, color: '#dc2626' },
    { name: 'Doctor', value: summary?.doctor ?? 0, color: '#059669' },
  ];

  const tableColumns = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      key: 'name',
      render: (name: string, row: EmployeeAnalysisReportRow) => (
        <Link to={`/app/report/employeeTargetAchievement?empId=${row.empId}`}>
          <Typography.Text strong>{name}</Typography.Text>
        </Link>
      ),
    },
    {
      title: 'HQ',
      dataIndex: 'headQuarterName',
      key: 'hq',
      render: (v: string | null) => v ?? '—',
      responsive: ['md'] as ('md')[],
    },
    {
      title: 'Coverage',
      dataIndex: 'coveragePct',
      key: 'coverage',
      sorter: (a: EmployeeAnalysisReportRow, b: EmployeeAnalysisReportRow) => a.coveragePct - b.coveragePct,
      render: (pct: number) => (
        <Progress
          percent={Math.round(pct)}
          size="small"
          strokeColor={pctColor(pct)}
          format={(p) => `${p}%`}
          style={{ minWidth: 100 }}
        />
      ),
    },
    {
      title: 'POB Achiev.',
      dataIndex: 'pobAchievementPct',
      key: 'pob',
      sorter: (a: EmployeeAnalysisReportRow, b: EmployeeAnalysisReportRow) => a.pobAchievementPct - b.pobAchievementPct,
      render: (pct: number, row: EmployeeAnalysisReportRow) =>
        row.amountTarget > 0 ? (
          <Progress
            percent={Math.round(pct)}
            size="small"
            strokeColor={pctColor(pct)}
            format={(p) => `${p}%`}
            style={{ minWidth: 100 }}
          />
        ) : (
          <Tag color="default">No target</Tag>
        ),
    },
    {
      title: 'Visits',
      dataIndex: 'doctorVisits',
      key: 'visits',
      responsive: ['lg'] as ('lg')[],
      render: (v: number, row: EmployeeAnalysisReportRow) =>
        `${v} / ${row.plannedDoctorCalls}`,
    },
    {
      title: 'Amount',
      key: 'amount',
      responsive: ['lg'] as ('lg')[],
      render: (_: unknown, row: EmployeeAnalysisReportRow) =>
        row.amountTarget > 0
          ? `${formatInr(row.actualAmount)} / ${formatInr(row.amountTarget)}`
          : '—',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, row: EmployeeAnalysisReportRow) => {
        const pct = row.pobAchievementPct;
        if (row.amountTarget === 0) return <Badge status="default" text="No target" />;
        if (pct >= 80) return <Badge status="success" text="On Track" />;
        if (pct >= 60) return <Badge status="warning" text="At Risk" />;
        return <Badge status="error" text="Needs Attention" />;
      },
    },
  ];

  return (
    <PageLayout
      title={t('dashboard.admin.title')}
      subtitle={greeting}
      extra={
        <DatePicker
          picker="month"
          value={period}
          onChange={(d) => d && setPeriod(d)}
          format="MMM YYYY"
          allowClear={false}
          style={{ width: 130 }}
        />
      }
    >
      {canViewKpis && (
        <PageSection>
          <Spin spinning={kpisQuery.isLoading}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6}>
                <StatCard
                  title={t('dashboard.admin.avgPob')}
                  info={t('dashboard.admin.statHelp.avgPob')}
                  value={Math.round(kpis?.pobAchievementPct ?? 0)}
                  suffix="%"
                  to="/app/report/employeeTargetAchievement"
                  health={kpis ? pctHealth(kpis.pobAchievementPct) : undefined}
                />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <StatCard
                  title={t('dashboard.admin.avgCoverage')}
                  info={t('dashboard.admin.statHelp.avgCoverage')}
                  value={Math.round(kpis?.coveragePct ?? 0)}
                  suffix="%"
                  to="/app/report/visit-summary"
                  health={kpis ? pctHealth(kpis.coveragePct) : undefined}
                />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <StatCard
                  title={t('dashboard.mgr.missedCalls')}
                  info={t('dashboard.mgr.statHelp.missedCalls')}
                  value={kpis?.missedCallCount ?? 0}
                  to="/app/report/missedCallReport"
                  health={kpis ? countHealth(kpis.missedCallCount) : undefined}
                />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <StatCard
                  title="Pending Approvals"
                  info="Total items pending your approval across all queues."
                  value={summary?.total ?? 0}
                  to="/app/approvals"
                  health={summaryQuery.data ? countHealth(summary?.total ?? 0, 1, 10) : undefined}
                />
              </Col>
            </Row>
            {kpis && (
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
                Total POB: {formatInr(kpis.pobApprovedAmount)} / {formatInr(kpis.amountTarget)} target
                &nbsp;·&nbsp;
                {kpis.doctorVisits} doctor visits / {kpis.plannedDoctorCalls} planned
              </Typography.Text>
            )}
          </Spin>
        </PageSection>
      )}

      <SalesInsightsSection enabled={canViewKpis} />

      {canViewAnalysis && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <BarChartCard
                title={t('dashboard.admin.pobChart')}
                data={pobBarData}
                loading={analysisQuery.isLoading}
                height={Math.max(200, pobBarData.length * 28)}
              />
            </Col>
            <Col xs={24} lg={12}>
              <BarChartCard
                title={t('dashboard.admin.coverageChart')}
                data={coverageBarData}
                loading={analysisQuery.isLoading}
                height={Math.max(200, coverageBarData.length * 28)}
              />
            </Col>
          </Row>

          <PageSection title={t('dashboard.admin.teamPerformance')}>
            <Spin spinning={analysisQuery.isLoading}>
              <Table
                rowKey="empId"
                dataSource={analysis?.items ?? []}
                columns={tableColumns}
                size="small"
                pagination={{ pageSize: 20, hideOnSinglePage: true }}
                scroll={{ x: 640 }}
                rowClassName={(row) => {
                  if (row.amountTarget === 0) return '';
                  if (row.pobAchievementPct < 60) return 'row-error';
                  if (row.pobAchievementPct < 80) return 'row-warning';
                  return '';
                }}
              />
            </Spin>
          </PageSection>
        </>
      )}

      {canViewApprovals && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={10} lg={8}>
            <DonutChartCard
              title={t('dashboard.admin.approvalBreakdown')}
              data={approvalDonutData}
              loading={summaryQuery.isLoading}
            />
          </Col>
        </Row>
      )}
    </PageLayout>
  );
}
