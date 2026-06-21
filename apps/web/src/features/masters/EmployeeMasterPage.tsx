import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { EmployeeSummary, RoleSummary } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';

interface EmployeeListResponse {
  data: { items: EmployeeSummary[] };
}

interface RoleListResponse {
  data: { items: RoleSummary[] };
}

export function EmployeeMasterPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const data = await fetchApi<EmployeeListResponse>('/api/v1/employees?pageSize=100', languageHeader);
      return data.data.items;
    },
  });

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const data = await fetchApi<RoleListResponse>('/api/v1/roles', languageHeader);
      return data.data.items;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetch('/api/v1/employees', {
        method: 'POST',
        headers: authHeaders(languageHeader),
        body: JSON.stringify(body),
      }).then((res) => {
        if (!res.ok) throw new Error(t('masters.employee.createFailed'));
      }),
    onSuccess: async () => {
      message.success(t('common.create'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: () => message.error(t('masters.employee.createFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/v1/employees/${id}`, { method: 'DELETE', headers: authHeaders(languageHeader) }).then((res) => {
        if (!res.ok) throw new Error(t('masters.employee.deleteFailed'));
      }),
    onSuccess: async () => {
      message.success(t('common.delete'));
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: () => message.error(t('masters.employee.deleteFailed')),
  });

  const columns: ColumnsType<EmployeeSummary> = [
    { title: t('masters.employee.userName'), dataIndex: 'userName', key: 'userName' },
    {
      title: t('masters.employee.firstName'),
      key: 'name',
      render: (_, row) => `${row.firstName} ${row.lastName ?? ''}`.trim(),
    },
    { title: t('masters.employee.role'), dataIndex: 'roleName', key: 'roleName' },
    {
      title: t('masters.employee.reportingManager'),
      dataIndex: 'reportingManagerName',
      key: 'reportingManagerName',
      render: (v) => v ?? t('masters.employee.none'),
    },
    {
      title: t('platform.tenants.status'),
      key: 'active',
      render: (_, row) => (
        <Tag color={row.active ? 'success' : 'default'}>{row.active ? t('common.active') : t('common.inactive')}</Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, row) =>
        row.active && row.userName !== 'admin' ? (
          <Button danger size="small" onClick={() => deleteMutation.mutate(row.id)}>
            {t('common.delete')}
          </Button>
        ) : null,
    },
  ];

  const roles = rolesQuery.data ?? [];
  const managers = (employeesQuery.data ?? []).filter((e) => e.active);

  useEffect(() => {
    if (roles.length > 0 && !form.getFieldValue('roleId')) {
      form.setFieldValue('roleId', roles[0].id);
    }
  }, [roles, form]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('masters.employee.title')}
      </Typography.Title>

      <Card title={t('masters.employee.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ roleId: roles[0]?.id }}
          onFinish={(values) =>
            createMutation.mutate({
              ...values,
              reportingManagerId: values.reportingManagerId || null,
            })
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <Form.Item name="userName" label={t('masters.employee.userName')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label={t('masters.employee.password')} rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item name="employeeCode" label={t('masters.employee.employeeCode')}>
              <Input />
            </Form.Item>
            <Form.Item name="firstName" label={t('masters.employee.firstName')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="lastName" label={t('masters.employee.lastName')}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label={t('masters.employee.email')}>
              <Input />
            </Form.Item>
            <Form.Item name="mobileNo" label={t('masters.employee.mobile')}>
              <Input />
            </Form.Item>
            <Form.Item name="roleId" label={t('masters.employee.role')} rules={[{ required: true }]}>
              <Select options={roles.map((r) => ({ value: r.id, label: `${r.roleName} (${r.roleType})` }))} />
            </Form.Item>
            <Form.Item name="reportingManagerId" label={t('masters.employee.reportingManager')}>
              <Select
                allowClear
                placeholder={t('masters.employee.none')}
                options={managers.map((m) => ({
                  value: m.id,
                  label: `${m.firstName} ${m.lastName ?? ''} (${m.userName})`,
                }))}
              />
            </Form.Item>
          </div>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
            {t('common.create')}
          </Button>
        </Form>
      </Card>

      <Card>
        {employeesQuery.isLoading ? (
          <Spin />
        ) : (
          <Table rowKey="id" columns={columns} dataSource={employeesQuery.data ?? []} pagination={{ pageSize: 20 }} />
        )}
      </Card>
    </Space>
  );
}
