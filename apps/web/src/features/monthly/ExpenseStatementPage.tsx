import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, DatePicker, Descriptions, Form, Input, InputNumber, Modal, Select, Spin, message } from 'antd';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { ExpenseStatementSummary } from '@synchem-sfa/shared-types';
import { useState } from 'react';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import { StatusTag } from '../transactions/StatusTag';

interface ListResponse {
  data: { items: ExpenseStatementSummary[] };
}

interface DetailResponse {
  data: {
    id: string;
    claimMonth: number;
    claimYear: number;
    totalAmount: number;
    approveStatus: string;
    lines: Array<{ description: string; amount: number }>;
  };
}

interface ExpenseHeadOption {
  id: string;
  headName: string;
}

function isDraft(status: string) {
  return status === 'DRAFT' || status === 'REJECTED';
}

export function ExpenseStatementPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [detailId, setDetailId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ['expense-statements'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse>('/api/v1/expense-statements', languageHeader);
      return res.data.items;
    },
  });

  const detailQuery = useQuery({
    queryKey: ['expense-statement', detailId],
    queryFn: async () => {
      const res = await fetchApi<DetailResponse>(`/api/v1/expense-statements/${detailId}`, languageHeader);
      return res.data;
    },
    enabled: detailId !== null,
  });

  const headsQuery = useQuery({
    queryKey: ['expense-heads-options'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: ExpenseHeadOption[] } }>(
        '/api/v1/expense-heads?pageSize=100',
        languageHeader,
      );
      return res.data.items;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetchApi('/api/v1/expense-statements', languageHeader, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      message.success(t('monthly.expense.createSuccess'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['expense-statements'] });
    },
    onError: () => message.error(t('monthly.expense.createFailed')),
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/v1/expense-statements/${id}/submit`, {
        method: 'POST',
        headers: authHeaders(languageHeader),
      }).then((res) => {
        if (!res.ok) throw new Error('submit failed');
      }),
    onSuccess: async () => {
      message.success(t('monthly.expense.submitSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['expense-statements'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const columns: ColumnsType<ExpenseStatementSummary> = [
    {
      title: t('monthly.expense.month'),
      key: 'claimMonth',
      render: (_, row) => dayjs(`${row.claimYear}-${row.claimMonth}-01`).format('MMM YYYY'),
    },
    {
      title: t('monthly.expense.total'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => `₹${Number(v).toLocaleString('en-IN')}`,
    },
    { title: t('txn.common.status'), key: 'status', render: (_, row) => <StatusTag status={row.approveStatus} /> },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, row) => (
        <>
          <Button size="small" type="link" onClick={() => setDetailId(row.id)}>
            {t('approval.viewDetail')}
          </Button>
          {isDraft(row.approveStatus) ? (
            <Button size="small" loading={submitMutation.isPending} onClick={() => submitMutation.mutate(row.id)}>
              {t('monthly.expense.submit')}
            </Button>
          ) : null}
        </>
      ),
    },
  ];

  return (
    <PageLayout title={t('monthly.expense.title')}>
      <PageSection title={t('monthly.expense.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ claimPeriod: dayjs(), lines: [{}] }}
          onFinish={(values) => {
            const period = values.claimPeriod as dayjs.Dayjs;
            createMutation.mutate({
              claimMonth: period.month() + 1,
              claimYear: period.year(),
              lines: values.lines,
            });
          }}
        >
          <Form.Item name="claimPeriod" label={t('monthly.expense.month')} rules={[{ required: true }]}>
            <DatePicker picker="month" format="MMM YYYY" style={{ width: '100%' }} />
          </Form.Item>

          <Form.List name="lines">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <div key={key} className="form-grid" style={{ marginBottom: 8 }}>
                    <Form.Item {...rest} name={[name, 'expenseHeadId']} label={t('monthly.expense.head')}>
                      <Select
                        allowClear
                        loading={headsQuery.isLoading}
                        options={(headsQuery.data ?? []).map((h) => ({ value: h.id, label: h.headName }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, 'description']}
                      label={t('monthly.expense.description')}
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, 'amount']}
                      label={t('monthly.expense.amount')}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <Button type="text" icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                    ) : null}
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                    {t('monthly.expense.addLine')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
            {t('common.create')}
          </Button>
        </Form>
      </PageSection>

      <PageSection title={t('monthly.expense.listTitle')}>
        <Spin spinning={listQuery.isLoading}>
          <ResponsiveTable
            rowKey="id"
            columns={columns}
            dataSource={listQuery.data ?? []}
            locale={{ emptyText: t('approval.empty') }}
          />
        </Spin>
      </PageSection>

      <Modal
        title={t('approval.detailTitle')}
        open={detailId !== null}
        onCancel={() => setDetailId(null)}
        footer={null}
      >
        <Spin spinning={detailQuery.isLoading}>
          {detailQuery.data ? (
            <>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label={t('approval.detail.claimMonth')}>
                  {detailQuery.data.claimMonth}
                </Descriptions.Item>
                <Descriptions.Item label={t('approval.detail.claimYear')}>
                  {detailQuery.data.claimYear}
                </Descriptions.Item>
                <Descriptions.Item label={t('approval.detail.totalAmount')}>
                  ₹{detailQuery.data.totalAmount.toLocaleString('en-IN')}
                </Descriptions.Item>
              </Descriptions>
              <div style={{ marginTop: 16 }}>
                <ResponsiveTable
                  rowKey={(_, i) => String(i)}
                  pagination={false}
                  columns={[
                  { title: t('monthly.expense.description'), dataIndex: 'description' },
                  {
                    title: t('approval.detail.amount'),
                    dataIndex: 'amount',
                    render: (v: number) => `₹${v.toLocaleString('en-IN')}`,
                  },
                ]}
                dataSource={detailQuery.data.lines}
              />
              </div>
            </>
          ) : null}
        </Spin>
      </Modal>
    </PageLayout>
  );
}
