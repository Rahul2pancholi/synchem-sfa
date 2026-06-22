import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, DatePicker, Form, InputNumber, Select, Space, Spin, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PobSummary } from '@synchem-sfa/shared-types';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';
import { StatusTag } from './StatusTag';

interface ListResponse {
  data: { items: PobSummary[] };
}

interface ProductOption {
  id: string;
  productName: string;
  divisionId: string | null;
  divisionName: string | null;
  brandName: string | null;
}

interface PartyOption {
  id: string;
  name: string;
}

interface PobLineForm {
  productId?: string;
  qty?: number;
  rate?: number;
}

function lineAmount(line: PobLineForm | undefined) {
  return (line?.qty ?? 0) * (line?.rate ?? 0);
}

export function PobPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [divisionFilter, setDivisionFilter] = useState<string | undefined>();
  const [partySearch, setPartySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const partyType = Form.useWatch('partyType', form) ?? 'DOCTOR';
  const watchedLines = (Form.useWatch('lines', form) ?? []) as PobLineForm[];

  const listQuery = useQuery({
    queryKey: ['personal-orders'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse>('/api/v1/personal-orders', languageHeader);
      return res.data.items;
    },
  });

  const partyQuery = useQuery({
    queryKey: ['pob-party-options', partyType, partySearch],
    queryFn: async () => {
      const params = new URLSearchParams({ partyType });
      if (partySearch.trim()) params.set('search', partySearch.trim());
      const res = await fetchApi<{ data: { items: PartyOption[] } }>(
        `/api/v1/personal-orders/party-options?${params.toString()}`,
        languageHeader,
      );
      return res.data.items;
    },
  });

  const productsQuery = useQuery({
    queryKey: ['pob-product-options', divisionFilter, productSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productSearch.trim()) params.set('search', productSearch.trim());
      if (divisionFilter) params.set('divisionId', divisionFilter);
      const res = await fetchApi<{ data: { items: ProductOption[] } }>(
        `/api/v1/personal-orders/product-options?${params.toString()}`,
        languageHeader,
      );
      return res.data.items;
    },
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

  const grandTotal = watchedLines.reduce((sum, line) => sum + lineAmount(line), 0);

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetchApi('/api/v1/personal-orders', languageHeader, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      message.success(t('common.create'));
      form.resetFields();
      form.setFieldsValue({
        partyType: 'DOCTOR',
        orderDate: dayjs(),
        lines: [{ qty: 1, rate: 0 }],
      });
      setPartySearch('');
      setProductSearch('');
      await queryClient.invalidateQueries({ queryKey: ['personal-orders'] });
    },
    onError: () => message.error(t('txn.pob.createFailed')),
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) =>
      fetchApi(`/api/v1/personal-orders/${id}/submit`, languageHeader, { method: 'POST' }),
    onSuccess: async () => {
      message.success(t('txn.pob.submitSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['personal-orders'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const partyTypeLabel = (value: string) =>
    value === 'RETAILER' ? t('txn.common.retailer') : t('txn.common.doctor');

  const columns: ColumnsType<PobSummary> = [
    {
      title: t('txn.pob.orderDate'),
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (value: string) => dayjs(value).format('DD-MM-YYYY'),
    },
    {
      title: t('txn.pob.partyType'),
      dataIndex: 'partyType',
      key: 'partyType',
      render: (value: string) => partyTypeLabel(value),
    },
    { title: t('txn.pob.qty'), dataIndex: 'lineCount', key: 'lineCount' },
    {
      title: t('txn.pob.amount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => v.toFixed(2),
    },
    { title: t('txn.common.status'), key: 'status', render: (_, row) => <StatusTag status={row.approveStatus} /> },
    {
      title: t('common.actions'),
      key: 'actions',
      fixed: 'right',
      render: (_, row) =>
        row.approveStatus === 'DRAFT' || row.approveStatus === 'REJECTED' ? (
          <Button size="small" loading={submitMutation.isPending} onClick={() => submitMutation.mutate(row.id)}>
            {t('txn.pob.submit')}
          </Button>
        ) : null,
    },
  ];

  return (
    <PageLayout title={t('txn.pob.title')}>
      <PageSection title={t('txn.pob.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            partyType: 'DOCTOR',
            orderDate: dayjs(),
            lines: [{ qty: 1, rate: 0 }],
          }}
          onFinish={(values) => {
            createMutation.mutate({
              partyType: values.partyType,
              partyId: values.partyId,
              orderDate: values.orderDate.format('YYYY-MM-DD'),
              lines: (values.lines as PobLineForm[]).map((line) => ({
                productId: line.productId,
                qty: line.qty,
                rate: line.rate,
              })),
            });
          }}
        >
          <div className="form-grid">
            <Form.Item name="partyType" label={t('txn.pob.partyType')} rules={[{ required: true }]}>
              <Select
                onChange={() => {
                  form.setFieldValue('partyId', undefined);
                  setPartySearch('');
                }}
                options={[
                  { value: 'DOCTOR', label: t('txn.common.doctor') },
                  { value: 'RETAILER', label: t('txn.common.retailer') },
                ]}
              />
            </Form.Item>
            <Form.Item name="partyId" label={t('txn.pob.party')} rules={[{ required: true }]}>
              <Select
                showSearch
                filterOption={false}
                onSearch={setPartySearch}
                loading={partyQuery.isLoading}
                options={(partyQuery.data ?? []).map((p) => ({ value: p.id, label: p.name }))}
                placeholder={t('txn.pob.searchParty')}
              />
            </Form.Item>
            <Form.Item name="orderDate" label={t('txn.pob.orderDate')} rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>
            <Form.Item label={t('txn.pob.division')}>
              <Select
                allowClear
                placeholder={t('txn.pob.allDivisions')}
                value={divisionFilter}
                onChange={setDivisionFilter}
                options={divisionOptions}
              />
            </Form.Item>
          </div>

          <Typography.Text strong>{t('txn.pob.lines')}</Typography.Text>
          <Form.List name="lines">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => {
                  const currentLine = watchedLines[name] as PobLineForm | undefined;
                  return (
                    <div key={key} className="form-grid" style={{ marginTop: 12 }}>
                      <Form.Item
                        {...rest}
                        name={[name, 'productId']}
                        label={t('txn.pob.product')}
                        rules={[{ required: true }]}
                      >
                        <Select
                          showSearch
                          filterOption={false}
                          onSearch={setProductSearch}
                          loading={productsQuery.isLoading}
                          options={(productsQuery.data ?? []).map((p) => ({
                            value: p.id,
                            label: p.brandName ? `${p.productName} (${p.brandName})` : p.productName,
                          }))}
                          placeholder={t('txn.pob.searchProduct')}
                        />
                      </Form.Item>
                      <Form.Item
                        {...rest}
                        name={[name, 'qty']}
                        label={t('txn.pob.qty')}
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        {...rest}
                        name={[name, 'rate']}
                        label={t('txn.pob.rate')}
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label={t('txn.pob.lineAmount')}>
                        <InputNumber
                          readOnly
                          value={lineAmount(currentLine)}
                          precision={2}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <Form.Item label=" ">
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            aria-label={t('txn.pob.removeLine')}
                            onClick={() => remove(name)}
                          >
                            {t('txn.pob.removeLine')}
                          </Button>
                        </Form.Item>
                      ) : null}
                    </div>
                  );
                })}
                <Form.Item style={{ marginTop: 8 }}>
                  <Button type="dashed" onClick={() => add({ qty: 1, rate: 0 })} icon={<PlusOutlined />}>
                    {t('txn.common.addLine')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Space style={{ marginBottom: 16 }}>
            <Typography.Text>
              {t('txn.pob.grandTotal')}: <Typography.Text strong>{grandTotal.toFixed(2)}</Typography.Text>
            </Typography.Text>
          </Space>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              {t('common.create')}
            </Button>
          </Form.Item>
        </Form>
      </PageSection>

      <PageSection title={t('txn.pob.listTitle')}>
        {listQuery.isLoading ? (
          <Spin />
        ) : (
          <ResponsiveTable rowKey="id" columns={columns} dataSource={listQuery.data ?? []} />
        )}
      </PageSection>
    </PageLayout>
  );
}
