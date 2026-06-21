import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Empty, Form, Input, Space, Spin, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import type { LovPageConfig } from './masterPageConfig';

interface ListResponse {
  data: { items: Record<string, unknown>[] };
}

export function LovMasterPage({ config }: { config: LovPageConfig }) {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['lov-list', config.apiPath],
    queryFn: async () => {
      const data = await fetchApi<ListResponse>(config.apiPath, languageHeader);
      return data.data.items ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) =>
      fetch(config.apiPath, {
        method: 'POST',
        headers: authHeaders(languageHeader),
        body: JSON.stringify({ name }),
      }).then((res) => {
        if (!res.ok) throw new Error(t(config.createFailedKey));
      }),
    onSuccess: async () => {
      message.success(t('common.create'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['lov-list', config.apiPath] });
    },
    onError: () => message.error(t(config.createFailedKey)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`${config.apiPath}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(languageHeader),
      }).then((res) => {
        if (!res.ok) throw new Error(t(config.createFailedKey));
      }),
    onSuccess: async () => {
      message.success(t('common.delete'));
      await queryClient.invalidateQueries({ queryKey: ['lov-list', config.apiPath] });
    },
    onError: () => message.error(t(config.createFailedKey)),
  });

  const columns: ColumnsType<Record<string, unknown>> = [
    { title: t('masters.lov.name'), dataIndex: config.nameField, key: config.nameField },
    {
      title: t('platform.tenants.status'),
      key: 'active',
      render: (_: unknown, row) => (
        <Tag color={row.active === false ? 'default' : 'success'}>
          {row.active === false ? t('common.inactive') : t('common.active')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, row) =>
        row.active !== false ? (
          <Button danger size="small" onClick={() => deleteMutation.mutate(String(row.id))}>
            {t('common.delete')}
          </Button>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t(config.titleKey)}
      </Typography.Title>
      <Card>
        <Form form={form} layout="inline" onFinish={(v) => createMutation.mutate(v.name)}>
          <Form.Item name="name" rules={[{ required: true }]}>
            <Input placeholder={t('masters.lov.name')} style={{ minWidth: 240 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              {t('common.create')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Card>
        {listQuery.isLoading ? (
          <Spin />
        ) : (
          <Table rowKey="id" columns={columns} dataSource={listQuery.data ?? []} pagination={{ pageSize: 20 }} />
        )}
      </Card>
    </Space>
  );
}
