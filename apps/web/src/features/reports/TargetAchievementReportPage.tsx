import type { TargetAchievementReportRow, TargetAchievementTotals } from '@synchem-sfa/shared-types';
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

interface TargetAchievementResponse {
  data: {
    summary: TargetAchievementTotals;
    items: TargetAchievementReportRow[];
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

export function TargetAchievementReportPage() {
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
    queryKey: ['report', 'target-achievement', applied.month, applied.year, empId, headQuarterId],
    queryFn: async () => {
      const qs = buildQueryString({
        month: applied.month,
        year: applied.year,
        empId,
        headQuarterId,
      });
      const res = await fetchApi<TargetAchievementResponse>(
        `/api/v1/reports/target-achievement?${qs}`,
        languageHeader,
      );
      return res.data;
    },
  });

  const summary = reportQuery.data?.summary;
  const items = reportQuery.data?.items ?? [];

  const exportColumns = useMemo(
    () => [
      { header: t('report.employee'), value: (row: TargetAchievementReportRow) => row.employeeName },
      { header: t('report.employeeCode'), value: (row: TargetAchievementReportRow) => row.employeeCode },
      { header: t('report.headQuarter'), value: (row: TargetAchievementReportRow) => row.headQuarterName },
      { header: t('report.amountTarget'), value: (row: TargetAchievementReportRow) => row.amountTarget.toFixed(2) },
      { header: t('report.actualAmount'), value: (row: TargetAchievementReportRow) => row.actualAmount.toFixed(2) },
      { header: t('report.achievementPct'), value: (row: TargetAchievementReportRow) => row.achievementPct },
      { header: t('report.gapAmount'), value: (row: TargetAchievementReportRow) => row.gapAmount.toFixed(2) },
      { header: t('report.callTarget'), value: (row: TargetAchievementReportRow) => row.callTarget },
      { header: t('report.actualCalls'), value: (row: TargetAchievementReportRow) => row.actualCalls },
      {
        header: t('report.callAchievementPct'),
        value: (row: TargetAchievementReportRow) => row.callAchievementPct,
      },
    ],
    [t],
  );

  const columns = [
    { title: t('report.employee'), dataIndex: 'employeeName', key: 'employeeName' },
    { title: t('report.employeeCode'), dataIndex: 'employeeCode', key: 'employeeCode' },
    { title: t('report.headQuarter'), dataIndex: 'headQuarterName', key: 'headQuarterName' },
    {
      title: t('report.amountTarget'),
      dataIndex: 'amountTarget',
      key: 'amountTarget',
      render: (v: number) => v.toFixed(2),
    },
    {
      title: t('report.actualAmount'),
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      render: (v: number) => v.toFixed(2),
    },
    {
      title: t('report.achievementPct'),
      dataIndex: 'achievementPct',
      key: 'achievementPct',
      render: (v: number) => (
        <Progress
          percent={Math.min(v, 100)}
          size="small"
          format={() => `${v}%`}
          strokeColor={pctColor(v)}
        />
      ),
    },
    {
      title: t('report.gapAmount'),
      dataIndex: 'gapAmount',
      key: 'gapAmount',
      render: (v: number) => v.toFixed(2),
    },
    { title: t('report.callTarget'), dataIndex: 'callTarget', key: 'callTarget' },
    { title: t('report.actualCalls'), dataIndex: 'actualCalls', key: 'actualCalls' },
    {
      title: t('report.callAchievementPct'),
      dataIndex: 'callAchievementPct',
      key: 'callAchievementPct',
      render: (v: number | null) => (v === null ? '—' : `${v}%`),
    },
  ];

  return (
    <PageLayout title={t('report.targetAchievement')}>
      <PageSection>
        <div className="form-grid">
          <InputNumber
            min={1}
            max={12}
            value={month}
            onChange={(v) => setMonth(v ?? month)}
            addonBefore={t('monthly.expense.month')}
          />
          <InputNumber
            min={2020}
            max={2100}
            value={year}
            onChange={(v) => setYear(v ?? year)}
            addonBefore={t('monthly.expense.year')}
          />
          {canFilterEmployees ? (
            <Select
              allowClear
              placeholder={t('report.allEmployees')}
              value={empId}
              onChange={setEmpId}
              showSearch
              optionFilterProp="label"
              loading={employeesQuery.isLoading}
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
              value={headQuarterId}
              onChange={setHeadQuarterId}
              showSearch
              optionFilterProp="label"
              loading={hqQuery.isLoading}
              options={(hqQuery.data ?? []).map((hq) => ({
                value: hq.id,
                label: hq.hqName,
              }))}
            />
          ) : null}
        </div>
        <Space style={{ marginTop: 16 }}>
          <Button
            type="primary"
            onClick={() => setApplied({ month, year })}
            loading={reportQuery.isFetching}
          >
            {t('report.generate')}
          </Button>
          <ReportExportButton
            filename={reportCsvFilename('target-achievement', applied.month, applied.year)}
            columns={exportColumns}
            rows={items}
            loading={reportQuery.isFetching}
          />
        </Space>
      </PageSection>

      <PageSection title={t('report.summaryTotals')}>
        <Spin spinning={reportQuery.isLoading}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard title={t('report.amountTarget')} value={summary?.amountTarget ?? 0} />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard title={t('report.actualAmount')} value={summary?.actualAmount ?? 0} />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard title={t('report.achievementPct')} value={summary?.achievementPct ?? 0} suffix="%" />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard title={t('report.actualCalls')} value={summary?.actualCalls ?? 0} />
            </Col>
          </Row>
        </Spin>
      </PageSection>

      <PageSection title={t('report.breakdownByEmployee')}>
        <Spin spinning={reportQuery.isLoading}>
          <ResponsiveTable rowKey="empId" columns={columns} dataSource={items} />
        </Spin>
      </PageSection>
    </PageLayout>
  );
}
