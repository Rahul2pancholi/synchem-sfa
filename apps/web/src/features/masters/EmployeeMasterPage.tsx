import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
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
import { PermissionGate } from '../../components/PermissionGate';
import { authHeaders, fetchApi } from '../../lib/api-client';

interface EmployeeListResponse {
  data: { items: EmployeeSummary[] };
}

interface RoleListResponse {
  data: { items: RoleSummary[] };
}

export function EmployeeMasterPage() {
  const { t, languageHeader } = useI18n();
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();
  const [editingEmployee, setEditingEmployee] = useState<EmployeeSummary | null>(null);

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
      const data = await fetchApi<RoleListResponse>('/api/v1/roles/options', languageHeader);
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
      createForm.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: () => message.error(t('masters.employee.createFailed')),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      fetch(`/api/v1/employees/${id}`, {
        method: 'PATCH',
        headers: authHeaders(languageHeader),
        body: JSON.stringify(body),
      }).then((res) => {
        if (!res.ok) throw new Error(t('masters.employee.updateFailed'));
      }),
    onSuccess: async () => {
      message.success(t('common.save'));
      setEditingEmployee(null);
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: () => message.error(t('masters.employee.updateFailed')),
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

  const roles = rolesQuery.data ?? [];
  const managers = (employeesQuery.data ?? []).filter((e) => e.active);

  useEffect(() => {
    if (roles.length > 0 && !createForm.getFieldValue('roleId')) {
      createForm.setFieldValue('roleId', roles[0].id);
    }
  }, [roles, createForm]);

  useEffect(() => {
    if (editingEmployee) {
      editForm.setFieldsValue({
        firstName: editingEmployee.firstName,
        lastName: editingEmployee.lastName ?? '',
        email: editingEmployee.email ?? '',
        mobileNo: editingEmployee.mobileNo ?? '',
        employeeCode: editingEmployee.employeeCode ?? '',
        roleId: editingEmployee.roleId,
        reportingManagerId: editingEmployee.reportingManagerId ?? undefined,
        password: '',
      });
    }
  }, [editingEmployee, editForm]);

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
          <Space size="small">
            <PermissionGate menuCode="MAS07" action="edit">
              <Button size="small" onClick={() => setEditingEmployee(row)}>
                {t('common.edit')}
              </Button>
            </PermissionGate>
            <PermissionGate menuCode="MAS07" action="delete">
              <Popconfirm
                title={t('masters.employee.deleteConfirm')}
                onConfirm={() => deleteMutation.mutate(row.id)}
                okText={t('common.yes')}
                cancelText={t('common.no')}
              >
                <Button danger size="small" loading={deleteMutation.isPending}>
                  {t('common.delete')}
                </Button>
              </Popconfirm>
            </PermissionGate>
          </Space>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('masters.employee.title')}
      </Typography.Title>

      <PermissionGate menuCode="MAS07" action="add">
        <Card title={t('masters.employee.createTitle')}>
          <Form
            form={createForm}
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
      </PermissionGate>

      <Card>
        {employeesQuery.isLoading ? (
          <Spin />
        ) : (
          <Table rowKey="id" columns={columns} dataSource={employeesQuery.data ?? []} pagination={{ pageSize: 20 }} />
        )}
      </Card>

      <Modal
        title={t('masters.employee.editTitle')}
        open={editingEmployee !== null}
        onCancel={() => setEditingEmployee(null)}
        footer={null}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(values) => {
            if (!editingEmployee) return;
            const body: Record<string, unknown> = {
              firstName: values.firstName,
              lastName: values.lastName || null,
              email: values.email || null,
              mobileNo: values.mobileNo || null,
              employeeCode: values.employeeCode || null,
              roleId: values.roleId,
              reportingManagerId: values.reportingManagerId || null,
            };
            if (values.password) body.password = values.password;
            updateMutation.mutate({ id: editingEmployee.id, body });
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <Form.Item name="firstName" label={t('masters.employee.firstName')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="lastName" label={t('masters.employee.lastName')}>
              <Input />
            </Form.Item>
            <Form.Item name="employeeCode" label={t('masters.employee.employeeCode')}>
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
                options={managers
                  .filter((m) => m.id !== editingEmployee?.id)
                  .map((m) => ({
                    value: m.id,
                    label: `${m.firstName} ${m.lastName ?? ''} (${m.userName})`,
                  }))}
              />
            </Form.Item>
            <Form.Item name="password" label={t('masters.employee.newPassword')} extra={t('masters.employee.passwordHint')}>
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </div>
          <Space>
            <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
              {t('common.save')}
            </Button>
            <Button onClick={() => setEditingEmployee(null)}>{t('common.cancel')}</Button>
          </Space>
        </Form>
      </Modal>
    </Space>
  );
}
