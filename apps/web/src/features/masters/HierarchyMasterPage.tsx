import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, InputNumber, Select, Spin, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { HierarchySummary, HierarchyTreeNode } from '@synchem-sfa/shared-types';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import { ReportingHierarchyTree } from './ReportingHierarchyTree';

interface ListResponse {
  data: { items: HierarchySummary[] };
}

interface TreeResponse {
  data: { tree: HierarchyTreeNode[] };
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
      return data.data.tree ?? [];
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
    <PageLayout title={t('masters.hierarchy.title')}>
      <PageSection title={t('masters.hierarchy.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          className="form-grid"
          initialValues={{ hierarchyType: 'MR', hierarchyLevel: 4 }}
          onFinish={(values) =>
            createMutation.mutate({
              ...values,
              hierarchyCode: String(values.hierarchyCode).toUpperCase(),
              reportingHierarchyId: values.reportingHierarchyId || null,
            })
          }
        >
          <Form.Item name="hierarchyCode" label={t('masters.hierarchy.code')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="hierarchyType" label={t('masters.hierarchy.type')} rules={[{ required: true }]}>
            <Select options={['AD', 'RM', 'ZM', 'MR'].map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="hierarchyLevel" label={t('masters.hierarchy.level')} rules={[{ required: true }]}>
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reportingHierarchyId" label={t('masters.hierarchy.parent')}>
            <Select
              allowClear
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
        </Form>
      </PageSection>

      <PageSection title={t('masters.hierarchy.reportingTree')}>
        {treeQuery.isLoading ? <Spin /> : <ReportingHierarchyTree tree={treeQuery.data ?? []} />}
      </PageSection>

      <PageSection>
        {listQuery.isLoading ? (
          <Spin />
        ) : (
          <ResponsiveTable rowKey="id" columns={columns} dataSource={listQuery.data ?? []} />
        )}
      </PageSection>
    </PageLayout>
  );
}
