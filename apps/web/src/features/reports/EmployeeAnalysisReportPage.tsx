import type { EmployeeAnalysisReportRow, EmployeeAnalysisTotals } from '@synchem-sfa/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, InputNumber, Progress, Row, Select, Space, Spin } from 'antd';
import { useMemo, useState } from 'react';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { ReportExportButton } from '../../components/ui/ReportExportButton';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { StatCard } from '../../components/ui/StatCard';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';
import { reportCsvFilename } from '../../lib/export-csv';
import { usePermission } from '../../hooks/usePermission';

interface EmployeeAnalysisResponse {
  data: {
    summary: EmployeeAnalysisTotals;
    items: EmployeeAnalysisReportRow[];
  };
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string | null;
}

interface HeadQuarterOption {
  id: string;
  hqName: string;
}

function buildQueryString(filters: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

function pctColor(pct: number) {
  if (pct >= 100) return 'var(--sfa-success, #16a34a)';
  if (pct >= 75) return 'var(--sfa-primary, #0891b2)';
  return 'var(--sfa-warning, #d97706)';
}

export function EmployeeAnalysisReportPage() {
  const { t, languageHeader } = useI18n();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [empId, setEmpId] = useState<string | undefined>();
  const [headQuarterId, setHeadQuarterId] = useState<string | undefined>();
  const [applied, setApplied] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });

  const canFilterEmployees = usePermission('MAS07', 'view');
  const canFilterHq = usePermission('MAS20103', 'view');

  const employeesQuery = useQuery({
    queryKey: ['report-filter-employees'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: EmployeeOption[] } }>(
        '/api/v1/employees?pageSize=200',
        languageHeader,
      );
      return res.data.items;
    },
    enabled: canFilterEmployees,
  });

  const hqQuery = useQuery({
    queryKey: ['report-filter-hq'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: HeadQuarterOption[] } }>(
        '/api/v1/head-quarters?pageSize=200',
        languageHeader,
      );
      return res.data.items;
    },
    enabled: canFilterHq,
  });

  const reportQuery = useQuery({
    queryKey: ['report', 'employee-analysis', applied.month, applied.year, empId, headQuarterId],
    queryFn: async () => {
      const qs = buildQueryString({
        month: applied.month,
        year: applied.year,
        empId,
        headQuarterId,
      });
      const res = await fetchApi<EmployeeAnalysisResponse>(
        `/api/v1/reports/employee-analysis?${qs}`,
        languageHeader,
      );
      return res.data;
    },
  });

  const summary = reportQuery.data?.summary;
  const items = reportQuery.data?.items ?? [];

  const exportColumns = useMemo(
    () => [
      { header: t('report.employee'), value: (row: EmployeeAnalysisReportRow) => row.employeeName },
      { header: t('report.employeeCode'), value: (row: EmployeeAnalysisReportRow) => row.employeeCode },
      { header: t('report.headQuarter'), value: (row: EmployeeAnalysisReportRow) => row.headQuarterName },
      { header: t('report.fieldDays'), value: (row: EmployeeAnalysisReportRow) => row.fieldDays },
      { header: t('report.doctorVisits'), value: (row: EmployeeAnalysisReportRow) => row.doctorVisits },
      { header: t('report.plannedCalls'), value: (row: EmployeeAnalysisReportRow) => row.plannedDoctorCalls },
      { header: t('report.coveragePct'), value: (row: EmployeeAnalysisReportRow) => row.coveragePct },
      { header: t('report.callAchievementPct'), value: (row: EmployeeAnalysisReportRow) => row.callAchievementPct },
      { header: t('report.achievementPct'), value: (row: EmployeeAnalysisReportRow) => row.pobAchievementPct },
      { header: t('report.actualAmount'), value: (row: EmployeeAnalysisReportRow) => row.actualAmount.toFixed(2) },
    ],
    [t],
  );

  const columns = [
    { title: t('report.employee'), dataIndex: 'employeeName', key: 'employeeName' },
    { title: t('report.employeeCode'), dataIndex: 'employeeCode', key: 'employeeCode' },
    { title: t('report.headQuarter'), dataIndex: 'headQuarterName', key: 'headQuarterName' },
    { title: t('report.fieldDays'), dataIndex: 'fieldDays', key: 'fieldDays' },
    { title: t('report.doctorVisits'), dataIndex: 'doctorVisits', key: 'doctorVisits' },
    { title: t('report.plannedCalls'), dataIndex: 'plannedDoctorCalls', key: 'plannedDoctorCalls' },
    {
      title: t('report.coveragePct'),
      dataIndex: 'coveragePct',
      key: 'coveragePct',
      render: (v: number) => `${v}%`,
    },
    {
      title: t('report.callAchievementPct'),
      dataIndex: 'callAchievementPct',
      key: 'callAchievementPct',
      render: (v: number | null) =>
        v === null ? (
          '—'
        ) : (
          <Progress percent={Math.min(v, 100)} size="small" format={() => `${v}%`} strokeColor={pctColor(v)} />
        ),
    },
    {
      title: t('report.achievementPct'),
      dataIndex: 'pobAchievementPct',
      key: 'pobAchievementPct',
      render: (v: number) => (
        <Progress percent={Math.min(v, 100)} size="small" format={() => `${v}%`} strokeColor={pctColor(v)} />
      ),
    },
    {
      title: t('report.actualAmount'),
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      render: (v: number) => v.toFixed(2),
    },
  ];

  return (
    <PageLayout title={t('report.employeeAnalysis')}>
      <PageSection>
        <Space wrap>
          <InputNumber min={1} max={12} value={month} onChange={(v) => setMonth(v ?? 1)} addonBefore={t('monthly.expense.month')} />
          <InputNumber min={2020} max={2100} value={year} onChange={(v) => setYear(v ?? now.getFullYear())} addonBefore={t('monthly.expense.year')} />
          {canFilterEmployees ? (
            <Select
              allowClear
              placeholder={t('report.allEmployees')}
              style={{ minWidth: 200 }}
              value={empId}
              onChange={setEmpId}
              options={(employeesQuery.data ?? []).map((e) => ({
                value: e.id,
                label: `${e.firstName} ${e.lastName ?? ''}`.trim(),
              }))}
            />
          ) : null}
          {canFilterHq ? (
            <Select
              allowClear
              placeholder={t('report.allHeadQuarters')}
              style={{ minWidth: 200 }}
              value={headQuarterId}
              onChange={setHeadQuarterId}
              options={(hqQuery.data ?? []).map((hq) => ({ value: hq.id, label: hq.hqName }))}
            />
          ) : null}
          <Button type="primary" onClick={() => setApplied({ month, year })}>
            {t('report.generate')}
          </Button>
          <ReportExportButton
            filename={reportCsvFilename('employee-analysis', applied.month, applied.year)}
            columns={exportColumns}
            rows={items}
            loading={reportQuery.isFetching}
          />
        </Space>
      </PageSection>

      {reportQuery.isLoading ? (
        <Spin />
      ) : summary ? (
        <>
          <PageSection title={t('report.summaryTotals')}>
            <Row gutter={[16, 16]}>
              <Col xs={12} md={6}>
                <StatCard title={t('report.totalEmployees')} value={summary.totalEmployees} />
              </Col>
              <Col xs={12} md={6}>
                <StatCard title={t('report.avgCallAchievementPct')} value={`${summary.avgCallAchievementPct}%`} />
              </Col>
              <Col xs={12} md={6}>
                <StatCard title={t('report.avgPobAchievementPct')} value={`${summary.avgPobAchievementPct}%`} />
              </Col>
              <Col xs={12} md={6}>
                <StatCard title={t('report.avgCoveragePct')} value={`${summary.avgCoveragePct}%`} />
              </Col>
            </Row>
          </PageSection>

          <PageSection title={t('report.breakdownByEmployee')}>
            <ResponsiveTable rowKey="empId" columns={columns} dataSource={items} />
          </PageSection>
        </>
      ) : null}
    </PageLayout>
  );
}
