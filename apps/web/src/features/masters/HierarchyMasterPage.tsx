import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { HierarchySummary, HierarchyTreeNode } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';

interface ListResponse {
  data: { items: HierarchySummary[] };
}

interface TreeResponse {
  data: { tree: HierarchyTreeNode[] };
}

function formatTree(nodes: HierarchyTreeNode[], depth = 0): string {
  return nodes
    .map((node) => {
      const line = `${'  '.repeat(depth)}- ${node.hierarchyCode} (${node.hierarchyType})`;
      const children = node.children?.length ? `\n${formatTree(node.children, depth + 1)}` : '';
      return line + children;
    })
    .join('\n');
}

export function HierarchyMasterPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['hierarchies'],
    queryFn: async () => {
      const data = await fetchApi<ListResponse>('/api/v1/hierarchies', languageHeader);
      return data.data.items;
    },
  });

  const treeQuery = useQuery({
    queryKey: ['hierarchies-tree'],
    queryFn: async () => {
      const data = await fetchApi<TreeResponse>('/api/v1/hierarchies/reporting', languageHeader);
      return formatTree(data.data.tree ?? []);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetch('/api/v1/hierarchies', {
        method: 'POST',
        headers: authHeaders(languageHeader),
        body: JSON.stringify(body),
      }).then((res) => {
        if (!res.ok) throw new Error(t('masters.hierarchy.createFailed'));
      }),
    onSuccess: async () => {
      message.success(t('common.create'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['hierarchies'] });
      await queryClient.invalidateQueries({ queryKey: ['hierarchies-tree'] });
    },
    onError: () => message.error(t('masters.hierarchy.createFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/v1/hierarchies/${id}`, { method: 'DELETE', headers: authHeaders(languageHeader) }).then((res) => {
        if (!res.ok) throw new Error(t('masters.hierarchy.deleteFailed'));
      }),
    onSuccess: async () => {
      message.success(t('common.delete'));
      await queryClient.invalidateQueries({ queryKey: ['hierarchies'] });
      await queryClient.invalidateQueries({ queryKey: ['hierarchies-tree'] });
    },
    onError: () => message.error(t('masters.hierarchy.deleteFailed')),
  });

  const columns: ColumnsType<HierarchySummary> = [
    { title: t('masters.hierarchy.code'), dataIndex: 'hierarchyCode', key: 'hierarchyCode' },
    { title: t('masters.hierarchy.type'), dataIndex: 'hierarchyType', key: 'hierarchyType' },
    { title: t('masters.hierarchy.level'), dataIndex: 'hierarchyLevel', key: 'hierarchyLevel' },
    {
      title: t('masters.hierarchy.parent'),
      dataIndex: 'parentHierarchyCode',
      key: 'parentHierarchyCode',
      render: (v) => v ?? t('masters.hierarchy.noParent'),
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
        row.active ? (
          <Button danger size="small" onClick={() => deleteMutation.mutate(row.id)}>
            {t('common.delete')}
          </Button>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('masters.hierarchy.title')}
      </Typography.Title>

      <Card title={t('masters.hierarchy.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ hierarchyType: 'MR', hierarchyLevel: 4 }}
          onFinish={(values) =>
            createMutation.mutate({
              ...values,
              hierarchyCode: String(values.hierarchyCode).toUpperCase(),
              reportingHierarchyId: values.reportingHierarchyId || null,
            })
          }
        >
          <Space wrap style={{ width: '100%' }}>
            <Form.Item name="hierarchyCode" label={t('masters.hierarchy.code')} rules={[{ required: true }]}>
              <Input style={{ width: 180 }} />
            </Form.Item>
            <Form.Item name="hierarchyType" label={t('masters.hierarchy.type')} rules={[{ required: true }]}>
              <Select style={{ width: 120 }} options={['AD', 'RM', 'ZM', 'MR'].map((v) => ({ value: v, label: v }))} />
            </Form.Item>
            <Form.Item name="hierarchyLevel" label={t('masters.hierarchy.level')} rules={[{ required: true }]}>
              <InputNumber min={1} max={10} />
            </Form.Item>
            <Form.Item name="reportingHierarchyId" label={t('masters.hierarchy.parent')}>
              <Select
                allowClear
                style={{ width: 220 }}
                placeholder={t('masters.hierarchy.noParent')}
                options={(listQuery.data ?? [])
                  .filter((item) => item.active)
                  .map((item) => ({
                    value: item.id,
                    label: `${item.hierarchyCode} (${item.hierarchyType})`,
                  }))}
              />
            </Form.Item>
            <Form.Item label=" ">
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                {t('common.create')}
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Card>

      <Card title={t('masters.hierarchy.reportingTree')}>
        {treeQuery.isLoading ? <Spin /> : <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{treeQuery.data || t('common.loading')}</pre>}
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
