import type { MonthlyCoveredDoctorReportRow, MonthlyCoveredDoctorTotals } from '@synchem-sfa/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, InputNumber, Row, Select, Space, Spin, Tag } from 'antd';
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

interface MonthlyCoveredDoctorResponse {
  data: {
    summary: MonthlyCoveredDoctorTotals;
    items: MonthlyCoveredDoctorReportRow[];
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

export function MonthlyCoveredDoctorReportPage() {
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
    queryKey: ['report', 'monthly-covered-doctors', applied.month, applied.year, empId, headQuarterId],
    queryFn: async () => {
      const qs = buildQueryString({
        month: applied.month,
        year: applied.year,
        empId,
        headQuarterId,
      });
      const res = await fetchApi<MonthlyCoveredDoctorResponse>(
        `/api/v1/reports/monthly-covered-doctors?${qs}`,
        languageHeader,
      );
      return res.data;
    },
  });

  const summary = reportQuery.data?.summary;
  const items = reportQuery.data?.items ?? [];

  const exportColumns = useMemo(
    () => [
      { header: t('report.employee'), value: (row: MonthlyCoveredDoctorReportRow) => row.employeeName },
      { header: t('report.employeeCode'), value: (row: MonthlyCoveredDoctorReportRow) => row.employeeCode },
      { header: t('report.headQuarter'), value: (row: MonthlyCoveredDoctorReportRow) => row.headQuarterName },
      { header: t('report.doctorName'), value: (row: MonthlyCoveredDoctorReportRow) => row.doctorName },
      { header: t('report.routeName'), value: (row: MonthlyCoveredDoctorReportRow) => row.routeName },
      { header: t('report.visitCount'), value: (row: MonthlyCoveredDoctorReportRow) => row.visitCount },
      { header: t('report.firstVisitDate'), value: (row: MonthlyCoveredDoctorReportRow) => row.firstVisitDate },
      { header: t('report.lastVisitDate'), value: (row: MonthlyCoveredDoctorReportRow) => row.lastVisitDate },
      {
        header: t('report.wasPlanned'),
        value: (row: MonthlyCoveredDoctorReportRow) => (row.wasPlanned ? t('common.yes') : t('common.no')),
      },
    ],
    [t],
  );

  return (
    <PageLayout title={t('report.monthlyCoveredDoctor')}>
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
            filename={reportCsvFilename('monthly-covered-doctors', applied.month, applied.year)}
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
              <Col xs={12} md={6}>
                <StatCard title={t('report.coveredDoctors')} value={summary.coveredDoctors} />
              </Col>
              <Col xs={12} md={6}>
                <StatCard title={t('report.plannedDoctors')} value={summary.plannedDoctors} />
              </Col>
              <Col xs={12} md={6}>
                <StatCard title={t('report.coveragePct')} value={`${summary.coveragePct}%`} />
              </Col>
              <Col xs={12} md={6}>
                <StatCard title={t('report.totalVisits')} value={summary.totalVisits} />
              </Col>
            </Row>
          </PageSection>

          <PageSection title={t('report.monthlyCoveredDoctor')}>
            <ResponsiveTable
              rowKey={(row) => `${row.empId}-${row.doctorId}`}
              dataSource={items}
              columns={[
                { title: t('report.employee'), dataIndex: 'employeeName', key: 'employeeName' },
                { title: t('report.employeeCode'), dataIndex: 'employeeCode', key: 'employeeCode' },
                { title: t('report.headQuarter'), dataIndex: 'headQuarterName', key: 'headQuarterName' },
                { title: t('report.doctorName'), dataIndex: 'doctorName', key: 'doctorName' },
                { title: t('report.routeName'), dataIndex: 'routeName', key: 'routeName' },
                { title: t('report.visitCount'), dataIndex: 'visitCount', key: 'visitCount' },
                {
                  title: t('report.firstVisitDate'),
                  dataIndex: 'firstVisitDate',
                  key: 'firstVisitDate',
                  render: (v: string) => dayjs(v).format('DD-MM-YYYY'),
                },
                {
                  title: t('report.lastVisitDate'),
                  dataIndex: 'lastVisitDate',
                  key: 'lastVisitDate',
                  render: (v: string) => dayjs(v).format('DD-MM-YYYY'),
                },
                {
                  title: t('report.wasPlanned'),
                  dataIndex: 'wasPlanned',
                  key: 'wasPlanned',
                  render: (v: boolean) => (
                    <Tag color={v ? 'success' : 'default'}>{v ? t('common.yes') : t('common.no')}</Tag>
                  ),
                },
              ]}
            />
          </PageSection>
        </>
      ) : null}
    </PageLayout>
  );
}
