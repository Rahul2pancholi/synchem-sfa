import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Form, Input, InputNumber, Select, Space, Spin, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ExpenseStatementSummary } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import { StatusTag } from '../transactions/StatusTag';

interface ListResponse {
  data: { items: ExpenseStatementSummary[] };
}

interface ExpenseHeadOption {
  id: string;
  headName: string;
}

export function ExpenseStatementPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const now = new Date();

  const listQuery = useQuery({
    queryKey: ['expense-statements'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse>('/api/v1/expense-statements', languageHeader);
      return res.data.items;
    },
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
    { title: t('monthly.expense.month'), dataIndex: 'claimMonth', key: 'claimMonth' },
    { title: t('monthly.expense.year'), dataIndex: 'claimYear', key: 'claimYear' },
    { title: t('monthly.expense.total'), dataIndex: 'totalAmount', key: 'totalAmount' },
    { title: t('txn.common.status'), key: 'status', render: (_, row) => <StatusTag status={row.approveStatus} /> },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, row) =>
        row.approveStatus === 'DRAFT' || row.approveStatus === 'REJECTED' ? (
          <Button size="small" loading={submitMutation.isPending} onClick={() => submitMutation.mutate(row.id)}>
            {t('monthly.expense.submit')}
          </Button>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('monthly.expense.title')}
      </Typography.Title>

      <Card title={t('monthly.expense.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            claimMonth: now.getMonth() + 1,
            claimYear: now.getFullYear(),
            lines: [{ description: t('monthly.expense.fixedAllowance'), amount: 9000 }],
          }}
          onFinish={(values) => {
            createMutation.mutate({
              claimMonth: values.claimMonth,
              claimYear: values.claimYear,
              lines: values.lines,
            });
          }}
        >
          <Space>
            <Form.Item name="claimMonth" label={t('monthly.expense.month')} rules={[{ required: true }]}>
              <InputNumber min={1} max={12} />
            </Form.Item>
            <Form.Item name="claimYear" label={t('monthly.expense.year')} rules={[{ required: true }]}>
              <InputNumber min={2020} max={2100} />
            </Form.Item>
          </Space>

          <Form.List name="lines">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item {...rest} name={[name, 'expenseHeadId']} label={t('monthly.expense.head')}>
                      <Select
                        allowClear
                        style={{ width: 180 }}
                        options={(headsQuery.data ?? []).map((h) => ({ value: h.id, label: h.headName }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, 'description']}
                      label={t('monthly.expense.description')}
                      rules={[{ required: true }]}
                    >
                      <Input style={{ width: 220 }} />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, 'amount']}
                      label={t('monthly.expense.amount')}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} style={{ width: 120 }} />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    ) : null}
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
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
      </Card>

      <Card title={t('monthly.expense.listTitle')}>
        <Spin spinning={listQuery.isLoading}>
          <Table rowKey="id" columns={columns} dataSource={listQuery.data ?? []} />
        </Spin>
      </Card>
    </Space>
  );
}
