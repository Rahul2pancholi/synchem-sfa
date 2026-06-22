import { useQuery } from '@tanstack/react-query';
import { InputNumber, Space, Spin } from 'antd';
import { useState } from 'react';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';

type ReportKey = 'dcr-summary' | 'expense-summary' | 'employee-pob';

const REPORT_CONFIG: Record<
  ReportKey,
  { titleKey: 'report.dcrSummary' | 'report.expenseSummary' | 'report.employeePob' }
> = {
  'dcr-summary': { titleKey: 'report.dcrSummary' },
  'expense-summary': { titleKey: 'report.expenseSummary' },
  'employee-pob': { titleKey: 'report.employeePob' },
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

  const columns =
    reportKey === 'dcr-summary'
      ? [
          { title: t('report.employee'), dataIndex: 'employeeName', key: 'employeeName' },
          { title: t('report.employeeCode'), dataIndex: 'employeeCode', key: 'employeeCode' },
          { title: t('report.totalDcrs'), dataIndex: 'totalDcrs', key: 'totalDcrs' },
          { title: t('report.approvedDcrs'), dataIndex: 'approvedDcrs', key: 'approvedDcrs' },
          { title: t('report.pendingDcrs'), dataIndex: 'pendingDcrs', key: 'pendingDcrs' },
          { title: t('report.doctorVisits'), dataIndex: 'totalDoctorVisits', key: 'totalDoctorVisits' },
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
        </Space>
        <Spin spinning={reportQuery.isLoading}>
          <ResponsiveTable
            rowKey={(row) => String(row.empId ?? row.id ?? Math.random())}
            columns={columns}
            dataSource={reportQuery.data ?? []}
          />
        </Spin>
      </PageSection>
    </PageLayout>
  );
}
