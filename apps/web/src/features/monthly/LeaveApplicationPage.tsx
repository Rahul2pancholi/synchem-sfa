import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, DatePicker, Form, Input, Select, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { LeaveApplicationSummary, LeaveBalanceSummary } from '@synchem-sfa/shared-types';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import { StatusTag } from '../transactions/StatusTag';

interface ListResponse {
  data: { items: LeaveApplicationSummary[] };
}

interface BalanceResponse {
  data: { items: LeaveBalanceSummary[] };
}

interface LeavePolicySummary {
  leaveType: string;
  annualQuota: number;
}

interface PolicyResponse {
  data: { items: LeavePolicySummary[] };
}

export function LeaveApplicationPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['leave-applications'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse>('/api/v1/leave-applications', languageHeader);
      return res.data.items;
    },
  });

  const balanceQuery = useQuery({
    queryKey: ['leave-balances'],
    queryFn: async () => {
      const res = await fetchApi<BalanceResponse>('/api/v1/leave-balances', languageHeader);
      return res.data.items;
    },
  });

  const policiesQuery = useQuery({
    queryKey: ['leave-policies'],
    queryFn: async () => {
      const res = await fetchApi<PolicyResponse>('/api/v1/leave-policies', languageHeader);
      return res.data.items;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetchApi('/api/v1/leave-applications', languageHeader, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      message.success(t('monthly.leave.createSuccess'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['leave-applications'] });
      await queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    },
    onError: () => message.error(t('monthly.leave.createFailed')),
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/v1/leave-applications/${id}/submit`, {
        method: 'POST',
        headers: authHeaders(languageHeader),
      }).then((res) => {
        if (!res.ok) throw new Error('submit failed');
      }),
    onSuccess: async () => {
      message.success(t('monthly.leave.submitSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['leave-applications'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const columns: ColumnsType<LeaveApplicationSummary> = [
    { title: t('monthly.leave.type'), dataIndex: 'leaveType', key: 'leaveType' },
    { title: t('monthly.leave.fromDate'), dataIndex: 'fromDate', key: 'fromDate' },
    { title: t('monthly.leave.toDate'), dataIndex: 'toDate', key: 'toDate' },
    { title: t('monthly.leave.days'), dataIndex: 'totalDays', key: 'totalDays' },
    { title: t('txn.common.status'), key: 'status', render: (_, row) => <StatusTag status={row.approveStatus} /> },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, row) =>
        row.approveStatus === 'DRAFT' || row.approveStatus === 'REJECTED' ? (
          <Button size="small" loading={submitMutation.isPending} onClick={() => submitMutation.mutate(row.id)}>
            {t('monthly.leave.submit')}
          </Button>
        ) : null,
    },
  ];

  return (
    <PageLayout title={t('monthly.leave.title')}>
      <PageSection title={t('monthly.leave.balanceTitle')}>
        <Spin spinning={balanceQuery.isLoading}>
          <ResponsiveTable
            rowKey="leaveType"
            pagination={false}
            dataSource={balanceQuery.data ?? []}
            columns={[
              { title: t('monthly.leave.type'), dataIndex: 'leaveType' },
              { title: t('monthly.leave.balance'), dataIndex: 'balance' },
              { title: t('monthly.leave.quota'), dataIndex: 'annualQuota' },
            ]}
          />
        </Spin>
      </PageSection>

      <PageSection title={t('monthly.leave.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            createMutation.mutate({
              leaveType: values.leaveType,
              fromDate: values.fromDate.format('YYYY-MM-DD'),
              toDate: values.toDate.format('YYYY-MM-DD'),
              reason: values.reason,
            });
          }}
        >
          <div className="form-grid">
            <Form.Item name="leaveType" label={t('monthly.leave.type')} rules={[{ required: true }]}>
              <Select
                loading={policiesQuery.isLoading}
                options={(policiesQuery.data ?? []).map((p) => ({ value: p.leaveType, label: p.leaveType }))}
              />
            </Form.Item>
            <Form.Item name="fromDate" label={t('monthly.leave.fromDate')} rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>
            <Form.Item name="toDate" label={t('monthly.leave.toDate')} rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>
          </div>
          <Form.Item name="reason" label={t('monthly.leave.reason')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              {t('common.create')}
            </Button>
          </Form.Item>
        </Form>
      </PageSection>

      <PageSection title={t('monthly.leave.listTitle')}>
        <Spin spinning={listQuery.isLoading}>
          <ResponsiveTable rowKey="id" columns={columns} dataSource={listQuery.data ?? []} />
        </Spin>
      </PageSection>
    </PageLayout>
  );
}
