import type { SalesSummaryReportRow, SalesSummaryTotals } from '@synchem-sfa/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, InputNumber, Row, Select, Space, Spin } from 'antd';
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

interface SalesSummaryResponse {
  data: {
    summary: SalesSummaryTotals;
    items: SalesSummaryReportRow[];
  };
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string | null;
  employeeCode: string | null;
}

interface HeadQuarterOption {
  id: string;
  hqName: string;
}

interface ProductOption {
  id: string;
  productName: string;
  divisionId: string | null;
  divisionName: string | null;
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

export function SalesSummaryReportPage() {
  const { t, languageHeader } = useI18n();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [empId, setEmpId] = useState<string | undefined>();
  const [headQuarterId, setHeadQuarterId] = useState<string | undefined>();
  const [divisionId, setDivisionId] = useState<string | undefined>();
  const [productId, setProductId] = useState<string | undefined>();
  const [applied, setApplied] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });

  const canFilterEmployees = usePermission('MAS07', 'view');
  const canFilterHq = usePermission('MAS20103', 'view');
  const canFilterProducts = usePermission('MAS05', 'view');

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

  const productsQuery = useQuery({
    queryKey: ['report-filter-products'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: ProductOption[] } }>(
        '/api/v1/products?pageSize=200',
        languageHeader,
      );
      return res.data.items;
    },
    enabled: canFilterProducts,
  });

  const divisionOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of productsQuery.data ?? []) {
      if (product.divisionId && product.divisionName) {
        map.set(product.divisionId, product.divisionName);
      }
    }
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [productsQuery.data]);

  const filteredProducts = useMemo(() => {
    const items = productsQuery.data ?? [];
    if (!divisionId) return items;
    return items.filter((p) => p.divisionId === divisionId);
  }, [productsQuery.data, divisionId]);

  const reportQuery = useQuery({
    queryKey: [
      'report',
      'sales-summary',
      applied.month,
      applied.year,
      empId,
      headQuarterId,
      divisionId,
      productId,
    ],
    queryFn: async () => {
      const qs = buildQueryString({
        month: applied.month,
        year: applied.year,
        empId,
        headQuarterId,
        divisionId,
        productId,
      });
      const res = await fetchApi<SalesSummaryResponse>(`/api/v1/reports/sales-summary?${qs}`, languageHeader);
      return res.data;
    },
  });

  const summary = reportQuery.data?.summary;
  const items = reportQuery.data?.items ?? [];

  const exportColumns = useMemo(
    () => [
      { header: t('report.employee'), value: (row: SalesSummaryReportRow) => row.employeeName },
      { header: t('report.employeeCode'), value: (row: SalesSummaryReportRow) => row.employeeCode },
      { header: t('report.headQuarter'), value: (row: SalesSummaryReportRow) => row.headQuarterName },
      { header: t('report.orderCount'), value: (row: SalesSummaryReportRow) => row.orderCount },
      { header: t('report.totalQty'), value: (row: SalesSummaryReportRow) => row.totalQty },
      { header: t('report.totalAmount'), value: (row: SalesSummaryReportRow) => row.totalAmount.toFixed(2) },
      {
        header: t('report.approvedAmount'),
        value: (row: SalesSummaryReportRow) => row.approvedAmount.toFixed(2),
      },
    ],
    [t],
  );

  const columns = [
    { title: t('report.employee'), dataIndex: 'employeeName', key: 'employeeName' },
    { title: t('report.employeeCode'), dataIndex: 'employeeCode', key: 'employeeCode' },
    { title: t('report.headQuarter'), dataIndex: 'headQuarterName', key: 'headQuarterName' },
    { title: t('report.orderCount'), dataIndex: 'orderCount', key: 'orderCount' },
    { title: t('report.totalQty'), dataIndex: 'totalQty', key: 'totalQty' },
    {
      title: t('report.totalAmount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => v.toFixed(2),
    },
    {
      title: t('report.approvedAmount'),
      dataIndex: 'approvedAmount',
      key: 'approvedAmount',
      render: (v: number) => v.toFixed(2),
    },
  ];

  return (
    <PageLayout title={t('report.salesSummary')}>
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
          {canFilterProducts ? (
            <>
              <Select
                allowClear
                placeholder={t('report.allDivisions')}
                value={divisionId}
                onChange={(value) => {
                  setDivisionId(value);
                  setProductId(undefined);
                }}
                showSearch
                optionFilterProp="label"
                options={divisionOptions}
              />
              <Select
                allowClear
                placeholder={t('report.allProducts')}
                value={productId}
                onChange={setProductId}
                showSearch
                optionFilterProp="label"
                loading={productsQuery.isLoading}
                options={filteredProducts.map((p) => ({ value: p.id, label: p.productName }))}
              />
            </>
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
            filename={reportCsvFilename('sales-summary', applied.month, applied.year)}
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
              <StatCard title={t('report.orderCount')} value={summary?.orderCount ?? 0} />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard title={t('report.approvedOrders')} value={summary?.approvedOrderCount ?? 0} />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard title={t('report.totalQty')} value={summary?.totalQty ?? 0} />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard title={t('report.totalAmount')} value={summary?.totalAmount ?? 0} />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard title={t('report.approvedAmount')} value={summary?.approvedAmount ?? 0} />
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
