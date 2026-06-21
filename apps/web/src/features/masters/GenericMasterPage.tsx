import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  DatePicker,
  Empty,
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
import dayjs from 'dayjs';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import type { FormField, MasterPageConfig } from './masterPageConfig';

interface OptionRow {
  id: string;
  [key: string]: unknown;
}

interface ListResponse {
  data: { items: Record<string, unknown>[] };
}

export function GenericMasterPage({ config }: { config: MasterPageConfig }) {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const optionFields = config.formFields.filter((f) => f.type === 'select' && f.optionsFrom);

  const optionsQuery = useQuery({
    queryKey: ['master-options', config.apiPath, optionFields.map((f) => f.optionsFrom)],
    queryFn: async () => {
      const entries = await Promise.all(
        optionFields.map(async (field) => {
          const data = await fetchApi<ListResponse>(field.optionsFrom!, languageHeader);
          return [field.name, data.data.items ?? []] as const;
        }),
      );
      return Object.fromEntries(entries) as Record<string, OptionRow[]>;
    },
    enabled: optionFields.length > 0,
  });

  const listQuery = useQuery({
    queryKey: ['master-list', config.apiPath],
    queryFn: async () => {
      const data = await fetchApi<ListResponse>(config.apiPath, languageHeader);
      return data.data.items ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetch(config.apiPath, {
        method: 'POST',
        headers: authHeaders(languageHeader),
        body: JSON.stringify(body),
      }).then(async (res) => {
        if (!res.ok) throw new Error(t(config.createFailedKey));
        return res.json();
      }),
    onSuccess: async () => {
      message.success(t('common.create'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['master-list', config.apiPath] });
    },
    onError: () => message.error(t(config.createFailedKey)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`${config.apiPath}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(languageHeader),
      }).then((res) => {
        if (!res.ok) throw new Error(t(config.deleteFailedKey ?? config.createFailedKey));
      }),
    onSuccess: async () => {
      message.success(t('common.delete'));
      await queryClient.invalidateQueries({ queryKey: ['master-list', config.apiPath] });
    },
    onError: () => message.error(t(config.deleteFailedKey ?? config.createFailedKey)),
  });

  function renderFormItem(field: FormField) {
    if (field.type === 'select') {
      const rows = optionsQuery.data?.[field.name] ?? [];
      return (
        <Form.Item key={field.name} name={field.name} label={t(field.labelKey)} rules={field.required ? [{ required: true }] : []}>
          <Select
            allowClear
            placeholder={t('masters.employee.none')}
            options={rows.map((row) => ({
              value: row.id,
              label: String(row[field.optionLabelKey ?? 'name']),
            }))}
          />
        </Form.Item>
      );
    }

    if (field.type === 'date') {
      return (
        <Form.Item key={field.name} name={field.name} label={t(field.labelKey)} rules={[{ required: !!field.required }]}>
          <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
        </Form.Item>
      );
    }

    return (
      <Form.Item key={field.name} name={field.name} label={t(field.labelKey)} rules={field.required ? [{ required: true }] : []}>
        <Input type={field.type === 'number' ? 'number' : 'text'} />
      </Form.Item>
    );
  }

  const columns: ColumnsType<Record<string, unknown>> = [
    ...config.columns.map((col) => ({
      title: t(col.labelKey),
      dataIndex: col.key,
      key: col.key,
      render: (value: unknown) => {
        if (col.key.endsWith('Date') && typeof value === 'string') return value.slice(0, 10);
        return value == null ? '' : String(value);
      },
    })),
    {
      title: t('platform.tenants.status'),
      key: 'active',
      render: (_: unknown, row) => (
        <Tag color={row.active === false ? 'default' : 'success'}>
          {row.active === false ? t('common.inactive') : t('common.active')}
        </Tag>
      ),
    },
  ];

  if (config.canDelete) {
    columns.push({
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, row) =>
        row.active !== false ? (
          <Button danger size="small" onClick={() => deleteMutation.mutate(String(row.id))}>
            {t('common.delete')}
          </Button>
        ) : null,
    });
  }

  async function onFinish(values: Record<string, unknown>) {
    const body: Record<string, unknown> = {};
    for (const field of config.formFields) {
      const value = values[field.name];
      if (value == null || value === '') continue;
      if (field.type === 'date' && dayjs.isDayjs(value)) {
        body[field.name] = value.format('YYYY-MM-DD');
      } else {
        body[field.name] = value;
      }
    }
    createMutation.mutate(body);
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t(config.titleKey)}
      </Typography.Title>

      <Card title={t(config.createTitleKey)}>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 720 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {config.formFields.map(renderFormItem)}
          </div>
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
        ) : listQuery.isError ? (
          <Empty description={t(config.loadFailedKey)} />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={listQuery.data ?? []}
            pagination={{ pageSize: 20 }}
            locale={{ emptyText: <Empty description={t(config.loadFailedKey)} /> }}
          />
        )}
      </Card>
    </Space>
  );
}
