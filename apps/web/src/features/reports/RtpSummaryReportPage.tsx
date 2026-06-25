import type { RtpSummaryReportRow, RtpSummaryTotals } from '@synchem-sfa/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, InputNumber, Row, Select, Space, Spin } from 'antd';
import dayjs from 'dayjs';
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
import { StatusTag } from '../transactions/StatusTag';

interface RtpSummaryResponse {
  data: {
    summary: RtpSummaryTotals;
    items: RtpSummaryReportRow[];
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

export function RtpSummaryReportPage() {
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
    queryKey: ['report', 'rtp-summary', applied.month, applied.year, empId, headQuarterId],
    queryFn: async () => {
      const qs = buildQueryString({
        month: applied.month,
        year: applied.year,
        empId,
        headQuarterId,
      });
      const res = await fetchApi<RtpSummaryResponse>(`/api/v1/reports/rtp-summary?${qs}`, languageHeader);
      return res.data;
    },
  });

  const summary = reportQuery.data?.summary;
  const items = reportQuery.data?.items ?? [];

  const exportColumns = useMemo(
    () => [
      { header: t('report.employee'), value: (row: RtpSummaryReportRow) => row.employeeName },
      { header: t('report.employeeCode'), value: (row: RtpSummaryReportRow) => row.employeeCode },
      { header: t('report.headQuarter'), value: (row: RtpSummaryReportRow) => row.headQuarterName },
      { header: t('txn.common.status'), value: (row: RtpSummaryReportRow) => row.approveStatus },
      { header: t('report.fieldDays'), value: (row: RtpSummaryReportRow) => row.fieldDays },
      { header: t('report.totalPlanDays'), value: (row: RtpSummaryReportRow) => row.totalPlanDays },
      { header: t('report.submittedAt'), value: (row: RtpSummaryReportRow) => row.submittedAt },
    ],
    [t],
  );

  return (
    <PageLayout title={t('report.rtpSummary')}>
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
            filename={reportCsvFilename('rtp-summary', applied.month, applied.year)}
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
          <PageSection>
            <Row gutter={[16, 16]}>
              <Col xs={12} md={8} lg={4}>
                <StatCard title={t('report.rtpSubmitted')} value={summary.totalSubmitted} />
              </Col>
              <Col xs={12} md={8} lg={5}>
                <StatCard title={t('report.rtpApproved')} value={summary.approvedCount} />
              </Col>
              <Col xs={12} md={8} lg={5}>
                <StatCard title={t('report.rtpPending')} value={summary.pendingCount} />
              </Col>
              <Col xs={12} md={8} lg={5}>
                <StatCard title={t('report.rtpDraft')} value={summary.draftCount} />
              </Col>
              <Col xs={12} md={8} lg={5}>
                <StatCard title={t('report.rtpNotSubmitted')} value={summary.notSubmittedCount} />
              </Col>
            </Row>
          </PageSection>

          <PageSection title={t('report.rtpSummary')}>
            <ResponsiveTable
              rowKey={(row) => row.empId}
              dataSource={items}
              columns={[
                { title: t('report.employee'), dataIndex: 'employeeName', key: 'employeeName' },
                { title: t('report.employeeCode'), dataIndex: 'employeeCode', key: 'employeeCode' },
                { title: t('report.headQuarter'), dataIndex: 'headQuarterName', key: 'headQuarterName' },
                {
                  title: t('txn.common.status'),
                  dataIndex: 'approveStatus',
                  key: 'approveStatus',
                  render: (status: string) => <StatusTag status={status} />,
                },
                { title: t('report.fieldDays'), dataIndex: 'fieldDays', key: 'fieldDays' },
                { title: t('report.totalPlanDays'), dataIndex: 'totalPlanDays', key: 'totalPlanDays' },
                {
                  title: t('report.submittedAt'),
                  dataIndex: 'submittedAt',
                  key: 'submittedAt',
                  render: (v: string | null) => (v ? dayjs(v).format('DD-MM-YYYY') : '—'),
                },
              ]}
            />
          </PageSection>
        </>
      ) : null}
    </PageLayout>
  );
}
