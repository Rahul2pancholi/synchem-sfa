import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, DatePicker, Form, InputNumber, Select, Space, Spin, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TourProgrammeSummary } from '@synchem-sfa/shared-types';
import dayjs from 'dayjs';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import { StatusTag } from './StatusTag';

interface ListResponse {
  data: { items: TourProgrammeSummary[] };
}

const WORK_TYPE_OPTIONS = [
  { value: 'FIELD', label: 'Field Work' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'HOLIDAY', label: 'Holiday' },
  { value: 'LEAVE', label: 'Leave' },
];

function formatMonth(month: number, year: number) {
  return dayjs(`${year}-${month}-01`).format('MMM YYYY');
}

export function RtpPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['tour-programmes'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse>('/api/v1/tour-programmes', languageHeader);
      return res.data.items;
    },
  });

  const routesQuery = useQuery({
    queryKey: ['routes-options'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: Array<{ id: string; routeName: string }> } }>(
        '/api/v1/routes?pageSize=200',
        languageHeader,
      );
      return res.data.items;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetchApi('/api/v1/tour-programmes', languageHeader, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      message.success(t('common.create'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['tour-programmes'] });
    },
    onError: () => message.error(t('txn.rtp.createFailed')),
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/v1/tour-programmes/${id}/submit`, {
        method: 'POST',
        headers: authHeaders(languageHeader),
      }).then((res) => {
        if (!res.ok) throw new Error('submit failed');
      }),
    onSuccess: async () => {
      message.success(t('txn.rtp.submitSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['tour-programmes'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const columns: ColumnsType<TourProgrammeSummary> = [
    {
      title: t('txn.rtp.month'),
      key: 'month',
      render: (_, row) => formatMonth(row.planMonth, row.planYear),
    },
    { title: t('txn.rtp.dayOfMonth'), dataIndex: 'dayCount', key: 'dayCount' },
    { title: t('txn.common.status'), key: 'status', render: (_, row) => <StatusTag status={row.approveStatus} /> },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, row) =>
        row.approveStatus === 'DRAFT' ? (
          <Button size="small" loading={submitMutation.isPending} onClick={() => submitMutation.mutate(row.id)}>
            {t('txn.rtp.submit')}
          </Button>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('txn.rtp.title')}
      </Typography.Title>

      <Card title={t('txn.rtp.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ planPeriod: dayjs(), workType: 'FIELD' }}
          onFinish={(values) => {
            const period = values.planPeriod as dayjs.Dayjs;
            createMutation.mutate({
              planMonth: period.month() + 1,
              planYear: period.year(),
              days: [
                {
                  dayOfMonth: values.dayOfMonth,
                  routeId: values.routeId || null,
                  workType: values.workType,
                },
              ],
            });
          }}
        >
          <Form.Item name="planPeriod" label={t('txn.rtp.month')} rules={[{ required: true }]}>
            <DatePicker picker="month" format="MMM YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dayOfMonth" label={t('txn.rtp.dayOfMonth')} rules={[{ required: true }]}>
            <InputNumber min={1} max={31} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="workType" label={t('txn.rtp.workType')}>
            <Select options={WORK_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="routeId" label={t('txn.rtp.route')}>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              loading={routesQuery.isLoading}
              options={(routesQuery.data ?? []).map((r) => ({ value: r.id, label: r.routeName }))}
            />
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
