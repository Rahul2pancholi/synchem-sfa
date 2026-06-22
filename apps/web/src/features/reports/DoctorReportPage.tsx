import type { DoctorReportRow, DoctorReportTotals } from '@synchem-sfa/shared-types';
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

interface DoctorReportResponse {
  data: {
    summary: DoctorReportTotals;
    items: DoctorReportRow[];
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

interface RouteOption {
  id: string;
  routeName: string;
  headQuarterId: string;
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

export function DoctorReportPage() {
  const { t, languageHeader } = useI18n();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [empId, setEmpId] = useState<string | undefined>();
  const [headQuarterId, setHeadQuarterId] = useState<string | undefined>();
  const [routeId, setRouteId] = useState<string | undefined>();
  const [applied, setApplied] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });

  const canFilterEmployees = usePermission('MAS07', 'view');
  const canFilterHq = usePermission('MAS20103', 'view');
  const canFilterRoutes = usePermission('MAS20104', 'view');

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

  const routesQuery = useQuery({
    queryKey: ['report-filter-routes'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: RouteOption[] } }>(
        '/api/v1/routes?pageSize=500',
        languageHeader,
      );
      return res.data.items;
    },
    enabled: canFilterRoutes,
  });

  const routeOptions = useMemo(() => {
    const routes = routesQuery.data ?? [];
    if (!headQuarterId) return routes;
    return routes.filter((route) => route.headQuarterId === headQuarterId);
  }, [routesQuery.data, headQuarterId]);

  const reportQuery = useQuery({
    queryKey: ['report', 'doctor-report', applied.month, applied.year, empId, headQuarterId, routeId],
    queryFn: async () => {
      const qs = buildQueryString({
        month: applied.month,
        year: applied.year,
        empId,
        headQuarterId,
        routeId,
      });
      const res = await fetchApi<DoctorReportResponse>(`/api/v1/reports/doctor-report?${qs}`, languageHeader);
      return res.data;
    },
  });

  const summary = reportQuery.data?.summary;
  const items = reportQuery.data?.items ?? [];

  const exportColumns = useMemo(
    () => [
      { header: t('report.doctorName'), value: (row: DoctorReportRow) => row.doctorName },
      { header: t('report.routeName'), value: (row: DoctorReportRow) => row.routeName },
      { header: t('report.headQuarter'), value: (row: DoctorReportRow) => row.headQuarterName },
      { header: t('report.specialistName'), value: (row: DoctorReportRow) => row.specialistName },
      { header: t('report.mobileNo'), value: (row: DoctorReportRow) => row.mobileNo },
      { header: t('txn.common.status'), value: (row: DoctorReportRow) => row.approveStatus },
      { header: t('report.visitCount'), value: (row: DoctorReportRow) => row.visitCount },
      { header: t('report.lastVisitDate'), value: (row: DoctorReportRow) => row.lastVisitDate },
    ],
    [t],
  );

  return (
    <PageLayout title={t('report.doctorReport')}>
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
              onChange={(value) => {
                setHeadQuarterId(value);
                setRouteId(undefined);
              }}
              options={(hqQuery.data ?? []).map((hq) => ({ value: hq.id, label: hq.hqName }))}
            />
          ) : null}
          {canFilterRoutes ? (
            <Select
              allowClear
              placeholder={t('report.allRoutes')}
              style={{ minWidth: 200 }}
              value={routeId}
              onChange={setRouteId}
              options={routeOptions.map((route) => ({ value: route.id, label: route.routeName }))}
            />
          ) : null}
          <Button type="primary" onClick={() => setApplied({ month, year })}>
            {t('report.generate')}
          </Button>
          <ReportExportButton
            filename={reportCsvFilename('doctor-report', applied.month, applied.year)}
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
                <StatCard label={t('report.totalDoctors')} value={summary.totalDoctors} />
              </Col>
              <Col xs={12} md={6}>
                <StatCard label={t('report.visitedInPeriod')} value={summary.visitedInPeriod} />
              </Col>
              <Col xs={12} md={6}>
                <StatCard label={t('report.totalVisits')} value={summary.totalVisits} />
              </Col>
              <Col xs={12} md={6}>
                <StatCard label={t('report.neverVisited')} value={summary.neverVisited} />
              </Col>
            </Row>
          </PageSection>

          <PageSection title={t('report.doctorReport')}>
            <ResponsiveTable
              rowKey={(row) => row.doctorId}
              dataSource={items}
              columns={[
                { title: t('report.doctorName'), dataIndex: 'doctorName', key: 'doctorName' },
                { title: t('report.routeName'), dataIndex: 'routeName', key: 'routeName' },
                { title: t('report.headQuarter'), dataIndex: 'headQuarterName', key: 'headQuarterName' },
                { title: t('report.specialistName'), dataIndex: 'specialistName', key: 'specialistName' },
                { title: t('report.mobileNo'), dataIndex: 'mobileNo', key: 'mobileNo' },
                {
                  title: t('txn.common.status'),
                  dataIndex: 'approveStatus',
                  key: 'approveStatus',
                  render: (status: string) => <StatusTag status={status} />,
                },
                { title: t('report.visitCount'), dataIndex: 'visitCount', key: 'visitCount' },
                {
                  title: t('report.lastVisitDate'),
                  dataIndex: 'lastVisitDate',
                  key: 'lastVisitDate',
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
