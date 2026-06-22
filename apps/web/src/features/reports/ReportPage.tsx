import { useQuery } from '@tanstack/react-query';
import { InputNumber, Space, Spin } from 'antd';
import { useMemo, useState } from 'react';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { ReportExportButton } from '../../components/ui/ReportExportButton';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';
import { reportCsvFilename, type CsvColumn } from '../../lib/export-csv';

type ReportKey = 'dcr-summary' | 'expense-summary' | 'employee-pob';

const REPORT_CONFIG: Record<
  ReportKey,
  { titleKey: 'report.dcrSummary' | 'report.expenseSummary' | 'report.employeePob'; slug: string }
> = {
  'dcr-summary': { titleKey: 'report.dcrSummary', slug: 'dcr-summary' },
  'expense-summary': { titleKey: 'report.expenseSummary', slug: 'expense-summary' },
  'employee-pob': { titleKey: 'report.employeePob', slug: 'employee-pob' },
};

export function ReportPage({ reportKey }: { reportKey: ReportKey }) {
  const { t, languageHeader } = useI18n();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const config = REPORT_CONFIG[reportKey];

  const reportQuery = useQuery({
    queryKey: ['report', reportKey, month, year],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: Record<string, unknown>[] } }>(
        `/api/v1/reports/${reportKey}?month=${month}&year=${year}`,
        languageHeader,
      );
      return res.data.items;
    },
  });

  const rows = reportQuery.data ?? [];

  const exportColumns: CsvColumn<Record<string, unknown>>[] = useMemo(() => {
    if (reportKey === 'dcr-summary') {
      return [
        { header: t('report.employee'), value: (row) => String(row.employeeName ?? '') },
        { header: t('report.employeeCode'), value: (row) => String(row.employeeCode ?? '') },
        { header: t('report.totalDcrs'), value: (row) => Number(row.totalDcrs ?? 0) },
        { header: t('report.approvedDcrs'), value: (row) => Number(row.approvedDcrs ?? 0) },
        { header: t('report.doctorVisits'), value: (row) => Number(row.totalDoctorVisits ?? 0) },
        { header: t('report.retailerVisits'), value: (row) => Number(row.totalRetailerVisits ?? 0) },
        { header: t('report.plannedCalls'), value: (row) => Number(row.plannedDoctorCalls ?? 0) },
        { header: t('report.coveragePct'), value: (row) => Number(row.coveragePct ?? 0) },
      ];
    }
    if (reportKey === 'expense-summary') {
      return [
        { header: t('report.employee'), value: (row) => String(row.employeeName ?? '') },
        { header: t('monthly.expense.month'), value: (row) => Number(row.claimMonth ?? 0) },
        { header: t('monthly.expense.year'), value: (row) => Number(row.claimYear ?? 0) },
        { header: t('monthly.expense.total'), value: (row) => Number(row.totalAmount ?? 0) },
        { header: t('txn.common.status'), value: (row) => String(row.approveStatus ?? '') },
      ];
    }
    return [
      { header: t('report.employee'), value: (row) => String(row.employeeName ?? '') },
      { header: t('report.orderCount'), value: (row) => Number(row.orderCount ?? 0) },
      { header: t('monthly.expense.total'), value: (row) => Number(row.totalAmount ?? 0) },
    ];
  }, [reportKey, t]);

  const columns =
    reportKey === 'dcr-summary'
      ? [
          { title: t('report.employee'), dataIndex: 'employeeName', key: 'employeeName' },
          { title: t('report.employeeCode'), dataIndex: 'employeeCode', key: 'employeeCode' },
          { title: t('report.totalDcrs'), dataIndex: 'totalDcrs', key: 'totalDcrs' },
          { title: t('report.approvedDcrs'), dataIndex: 'approvedDcrs', key: 'approvedDcrs' },
          { title: t('report.doctorVisits'), dataIndex: 'totalDoctorVisits', key: 'totalDoctorVisits' },
          { title: t('report.retailerVisits'), dataIndex: 'totalRetailerVisits', key: 'totalRetailerVisits' },
          { title: t('report.plannedCalls'), dataIndex: 'plannedDoctorCalls', key: 'plannedDoctorCalls' },
          {
            title: t('report.coveragePct'),
            dataIndex: 'coveragePct',
            key: 'coveragePct',
            render: (v: number) => `${v ?? 0}%`,
          },
        ]
      : reportKey === 'expense-summary'
        ? [
            { title: t('report.employee'), dataIndex: 'employeeName', key: 'employeeName' },
            { title: t('monthly.expense.month'), dataIndex: 'claimMonth', key: 'claimMonth' },
            { title: t('monthly.expense.year'), dataIndex: 'claimYear', key: 'claimYear' },
            { title: t('monthly.expense.total'), dataIndex: 'totalAmount', key: 'totalAmount' },
            { title: t('txn.common.status'), dataIndex: 'approveStatus', key: 'approveStatus' },
          ]
        : [
            { title: t('report.employee'), dataIndex: 'employeeName', key: 'employeeName' },
            { title: t('report.orderCount'), dataIndex: 'orderCount', key: 'orderCount' },
            { title: t('monthly.expense.total'), dataIndex: 'totalAmount', key: 'totalAmount' },
          ];

  return (
    <PageLayout title={t(config.titleKey)}>
      <PageSection>
        <Space wrap style={{ marginBottom: 16 }}>
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
          <ReportExportButton
            filename={reportCsvFilename(config.slug, month, year)}
            columns={exportColumns}
            rows={rows}
            loading={reportQuery.isLoading}
          />
        </Space>
        <Spin spinning={reportQuery.isLoading}>
          <ResponsiveTable
            rowKey={(row) => String(row.empId ?? row.id ?? Math.random())}
            columns={columns}
            dataSource={rows}
          />
        </Spin>
      </PageSection>
    </PageLayout>
  );
}
