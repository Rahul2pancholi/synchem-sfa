import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Form, InputNumber, Select, Space, Spin, Switch, Table, Typography, message } from 'antd';
import type { LeavePolicySummary } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';

interface ListResponse {
  data: { items: LeavePolicySummary[] };
}

export function LeavePolicyPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['leave-policies'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse>('/api/v1/leave-policies', languageHeader);
      return res.data.items;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetchApi('/api/v1/leave-policies', languageHeader, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      message.success(t('monthly.policy.saveSuccess'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['leave-policies'] });
    },
    onError: () => message.error(t('common.error')),
  });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('monthly.policy.title')}
      </Typography.Title>

      <Card title={t('monthly.policy.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ active: true, carryForwardLimit: 0 }}
          onFinish={(values) => saveMutation.mutate(values)}
        >
          <Form.Item name="leaveType" label={t('monthly.leave.type')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'CL', label: 'CL' },
                { value: 'SL', label: 'SL' },
                { value: 'PL', label: 'PL' },
              ]}
            />
          </Form.Item>
          <Form.Item name="annualQuota" label={t('monthly.policy.quota')} rules={[{ required: true }]}>
            <InputNumber min={0} max={365} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="carryForwardLimit" label={t('monthly.policy.carryForward')}>
            <InputNumber min={0} max={365} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="active" label={t('monthly.policy.active')} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
            {t('common.save')}
          </Button>
        </Form>
      </Card>

      <Card title={t('monthly.policy.listTitle')}>
        <Spin spinning={listQuery.isLoading}>
          <Table
            rowKey="id"
            dataSource={listQuery.data ?? []}
            columns={[
              { title: t('monthly.leave.type'), dataIndex: 'leaveType' },
              { title: t('monthly.policy.quota'), dataIndex: 'annualQuota' },
              { title: t('monthly.policy.carryForward'), dataIndex: 'carryForwardLimit' },
              {
                title: t('monthly.policy.active'),
                dataIndex: 'active',
                render: (value: boolean) => (value ? t('common.yes') : t('common.no')),
              },
            ]}
          />
        </Spin>
      </Card>
    </Space>
  );
}
