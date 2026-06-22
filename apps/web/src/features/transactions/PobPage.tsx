import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, DatePicker, Form, InputNumber, Select, Space, Spin, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PobSummary } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import { StatusTag } from './StatusTag';

interface ListResponse {
  data: { items: PobSummary[] };
}

interface ProductOption {
  id: string;
  productName: string;
}

interface PartyOption {
  id: string;
  name: string;
}

export function PobPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const partyType = Form.useWatch('partyType', form) ?? 'DOCTOR';

  const listQuery = useQuery({
    queryKey: ['personal-orders'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse>('/api/v1/personal-orders', languageHeader);
      return res.data.items;
    },
  });

  const productsQuery = useQuery({
    queryKey: ['products-options'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: ProductOption[] } }>(
        '/api/v1/products?pageSize=200',
        languageHeader,
      );
      return res.data.items;
    },
  });

  const doctorsQuery = useQuery({
    queryKey: ['doctors-options'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: Array<{ id: string; doctorName: string }> } }>(
        '/api/v1/doctors?pageSize=200',
        languageHeader,
      );
      return res.data.items.map((d) => ({ id: d.id, name: d.doctorName }));
    },
  });

  const retailersQuery = useQuery({
    queryKey: ['retailers-options'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: Array<{ id: string; retailerName: string }> } }>(
        '/api/v1/retailers?pageSize=200',
        languageHeader,
      );
      return res.data.items.map((r) => ({ id: r.id, name: r.retailerName }));
    },
  });

  const partyOptions: PartyOption[] =
    partyType === 'RETAILER' ? (retailersQuery.data ?? []) : (doctorsQuery.data ?? []);

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetchApi('/api/v1/personal-orders', languageHeader, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      message.success(t('common.create'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['personal-orders'] });
    },
    onError: () => message.error(t('txn.pob.createFailed')),
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/v1/personal-orders/${id}/submit`, {
        method: 'POST',
        headers: authHeaders(languageHeader),
      }).then((res) => {
        if (!res.ok) throw new Error('submit failed');
      }),
    onSuccess: async () => {
      message.success(t('txn.pob.submitSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['personal-orders'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const columns: ColumnsType<PobSummary> = [
    { title: t('txn.pob.orderDate'), dataIndex: 'orderDate', key: 'orderDate' },
    { title: t('txn.pob.partyType'), dataIndex: 'partyType', key: 'partyType' },
    { title: t('txn.pob.qty'), dataIndex: 'lineCount', key: 'lineCount' },
    {
      title: t('txn.pob.rate'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => v.toFixed(2),
    },
    { title: t('txn.common.status'), key: 'status', render: (_, row) => <StatusTag status={row.approveStatus} /> },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, row) =>
        row.approveStatus === 'DRAFT' ? (
          <Button size="small" loading={submitMutation.isPending} onClick={() => submitMutation.mutate(row.id)}>
            {t('txn.pob.submit')}
          </Button>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('txn.pob.title')}
      </Typography.Title>

      <Card title={t('txn.pob.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ partyType: 'DOCTOR', qty: 1, rate: 0 }}
          onFinish={(values) => {
            createMutation.mutate({
              partyType: values.partyType,
              partyId: values.partyId,
              orderDate: values.orderDate.format('YYYY-MM-DD'),
              lines: [
                {
                  productId: values.productId,
                  qty: values.qty,
                  rate: values.rate,
                },
              ],
            });
          }}
        >
          <Form.Item name="partyType" label={t('txn.pob.partyType')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'DOCTOR', label: t('txn.common.doctor') },
                { value: 'RETAILER', label: t('txn.common.retailer') },
              ]}
            />
          </Form.Item>
          <Form.Item name="partyId" label={t('txn.pob.party')} rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              loading={partyType === 'RETAILER' ? retailersQuery.isLoading : doctorsQuery.isLoading}
              options={partyOptions.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <Form.Item name="orderDate" label={t('txn.pob.orderDate')} rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="productId" label={t('txn.pob.product')} rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              loading={productsQuery.isLoading}
              options={(productsQuery.data ?? []).map((p) => ({ value: p.id, label: p.productName }))}
            />
          </Form.Item>
          <Form.Item name="qty" label={t('txn.pob.qty')} rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="rate" label={t('txn.pob.rate')} rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
            {t('common.create')}
          </Button>
        </Form>
      </Card>

      <Card>
        {listQuery.isLoading ? (
          <Spin />
        ) : (
          <Table rowKey="id" columns={columns} dataSource={listQuery.data ?? []} pagination={{ pageSize: 10 }} />
        )}
      </Card>
    </Space>
  );
}
