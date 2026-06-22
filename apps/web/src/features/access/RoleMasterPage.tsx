import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RoleDetailSummary } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';

interface RoleListResponse {
  data: { items: RoleDetailSummary[] };
}

export function RoleMasterPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ['roles-admin'],
    queryFn: async () => {
      const res = await fetchApi<RoleListResponse>('/api/v1/roles', languageHeader);
      return res.data.items;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetchApi('/api/v1/roles', languageHeader, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: async () => {
      message.success(t('common.create'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['roles-admin'] });
    },
    onError: () => message.error(t('access.role.createFailed')),
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/v1/roles/${id}`, { method: 'DELETE', headers: authHeaders(languageHeader) }).then(
        (res) => {
          if (!res.ok) throw new Error('failed');
        },
      ),
    onSuccess: async () => {
      message.success(t('common.delete'));
      await queryClient.invalidateQueries({ queryKey: ['roles-admin'] });
    },
    onError: () => message.error(t('access.role.deactivateFailed')),
  });

  const columns: ColumnsType<RoleDetailSummary> = [
    { title: t('access.role.roleName'), dataIndex: 'roleName', key: 'roleName' },
    { title: t('access.role.roleType'), dataIndex: 'roleType', key: 'roleType' },
    { title: t('access.role.employeeCount'), dataIndex: 'employeeCount', key: 'employeeCount' },
    {
      title: t('access.role.active'),
      key: 'active',
      render: (_, row) => (
        <Tag color={row.active ? 'success' : 'default'}>
          {row.active ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, row) =>
        row.active && row.roleName !== 'ADMIN' ? (
          <Button danger size="small" onClick={() => deactivateMutation.mutate(row.id)}>
            {t('common.delete')}
          </Button>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('access.role.title')}
      </Typography.Title>

      <Card title={t('access.role.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ roleType: 'FS', active: true }}
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item name="roleName" label={t('access.role.roleName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleType" label={t('access.role.roleType')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'AD', label: 'AD — Admin' },
                { value: 'MAN', label: 'MAN — Manager' },
                { value: 'FS', label: 'FS — Field Staff' },
              ]}
            />
          </Form.Item>
          <Form.Item name="active" label={t('access.role.active')} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
            {t('common.create')}
          </Button>
        </Form>
      </Card>

      <Card>
        {rolesQuery.isLoading ? (
          <Spin />
        ) : (
          <Table rowKey="id" columns={columns} dataSource={rolesQuery.data ?? []} pagination={false} />
        )}
      </Card>
    </Space>
  );
}
