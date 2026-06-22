import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, DatePicker, Form, Select, Space, Spin, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { WeeklyPlanSummary } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import { StatusTag } from './StatusTag';

interface ListResponse {
  data: { items: WeeklyPlanSummary[] };
}

interface DoctorOption {
  id: string;
  doctorName: string;
}

export function WeeklyPlanPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['weekly-plans'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse>('/api/v1/weekly-plans', languageHeader);
      return res.data.items;
    },
  });

  const doctorsQuery = useQuery({
    queryKey: ['doctors-options'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: DoctorOption[] } }>(
        '/api/v1/doctors?pageSize=200',
        languageHeader,
      );
      return res.data.items;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetchApi('/api/v1/weekly-plans', languageHeader, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      message.success(t('common.create'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['weekly-plans'] });
    },
    onError: () => message.error(t('txn.weekly.createFailed')),
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/v1/weekly-plans/${id}/submit`, {
        method: 'POST',
        headers: authHeaders(languageHeader),
      }).then((res) => {
        if (!res.ok) throw new Error('submit failed');
      }),
    onSuccess: async () => {
      message.success(t('txn.weekly.submitSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['weekly-plans'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const columns: ColumnsType<WeeklyPlanSummary> = [
    { title: t('txn.weekly.weekStart'), dataIndex: 'weekStartDate', key: 'weekStartDate' },
    { title: t('txn.weekly.planDate'), dataIndex: 'entryCount', key: 'entryCount' },
    { title: t('txn.common.status'), key: 'status', render: (_, row) => <StatusTag status={row.approveStatus} /> },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, row) =>
        row.approveStatus === 'DRAFT' ? (
          <Button size="small" loading={submitMutation.isPending} onClick={() => submitMutation.mutate(row.id)}>
            {t('txn.weekly.submit')}
          </Button>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('txn.weekly.title')}
      </Typography.Title>

      <Card title={t('txn.weekly.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            createMutation.mutate({
              weekStartDate: values.weekStartDate.format('YYYY-MM-DD'),
              entries: [
                {
                  planDate: values.planDate.format('YYYY-MM-DD'),
                  doctorId: values.doctorId ?? null,
                },
              ],
            });
          }}
        >
          <Form.Item name="weekStartDate" label={t('txn.weekly.weekStart')} rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="planDate" label={t('txn.weekly.planDate')} rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="doctorId" label={t('txn.weekly.doctor')}>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              loading={doctorsQuery.isLoading}
              options={(doctorsQuery.data ?? []).map((d) => ({ value: d.id, label: d.doctorName }))}
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
