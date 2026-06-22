import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Select, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import { StatusTag } from '../transactions/StatusTag';

interface DoctorRequestRow {
  id: string;
  doctorName: string;
  routeName: string | null;
  specialistName: string | null;
  mobileNo: string | null;
  approveStatus: string;
}

interface ListResponse {
  data: { items: DoctorRequestRow[] };
}

interface OptionRow {
  id: string;
  routeName?: string;
  specialistName?: string;
  name?: string;
}

function isDraft(status: string) {
  return status === 'DRAFT' || status === 'REJECTED';
}

export function DoctorCreationRequestPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['doctor-requests'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse>('/api/v1/doctor-requests', languageHeader);
      return res.data.items;
    },
  });

  const routesQuery = useQuery({
    queryKey: ['routes-options'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: OptionRow[] } }>('/api/v1/routes', languageHeader);
      return res.data.items;
    },
  });

  const specialistsQuery = useQuery({
    queryKey: ['specialists-options'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: OptionRow[] } }>(
        '/api/v1/specialists',
        languageHeader,
      );
      return res.data.items;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetchApi('/api/v1/doctor-requests', languageHeader, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      message.success(t('doctorRequest.createSuccess'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['doctor-requests'] });
    },
    onError: () => message.error(t('doctorRequest.createFailed')),
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/v1/doctor-requests/${id}/submit`, {
        method: 'POST',
        headers: authHeaders(languageHeader),
      }).then((res) => {
        if (!res.ok) throw new Error('submit failed');
      }),
    onSuccess: async () => {
      message.success(t('doctorRequest.submitSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['doctor-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['approval-summary'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const columns: ColumnsType<DoctorRequestRow> = [
    { title: t('masters.doctor.name'), dataIndex: 'doctorName', key: 'doctorName' },
    { title: t('doctorRequest.route'), dataIndex: 'routeName', key: 'routeName' },
    { title: t('doctorRequest.specialist'), dataIndex: 'specialistName', key: 'specialistName' },
    { title: t('doctorRequest.mobile'), dataIndex: 'mobileNo', key: 'mobileNo' },
    {
      title: t('txn.common.status'),
      key: 'status',
      render: (_, row) => <StatusTag status={row.approveStatus} />,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, row) =>
        isDraft(row.approveStatus) ? (
          <Button size="small" loading={submitMutation.isPending} onClick={() => submitMutation.mutate(row.id)}>
            {t('doctorRequest.submit')}
          </Button>
        ) : null,
    },
  ];

  return (
    <PageLayout title={t('doctorRequest.title')} subtitle={t('doctorRequest.subtitle')}>
      <PageSection title={t('doctorRequest.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          className="form-grid"
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item name="doctorName" label={t('masters.doctor.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="routeId" label={t('doctorRequest.route')}>
            <Select
              allowClear
              loading={routesQuery.isLoading}
              options={(routesQuery.data ?? []).map((r) => ({
                value: r.id,
                label: r.routeName ?? r.name,
              }))}
            />
          </Form.Item>
          <Form.Item name="specialistId" label={t('doctorRequest.specialist')}>
            <Select
              allowClear
              loading={specialistsQuery.isLoading}
              options={(specialistsQuery.data ?? []).map((s) => ({
                value: s.id,
                label: s.specialistName ?? s.name,
              }))}
            />
          </Form.Item>
          <Form.Item name="mobileNo" label={t('doctorRequest.mobile')}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              {t('common.create')}
            </Button>
          </Form.Item>
        </Form>
      </PageSection>

      <PageSection title={t('doctorRequest.listTitle')}>
        <Spin spinning={listQuery.isLoading}>
          <ResponsiveTable
            rowKey="id"
            columns={columns}
            dataSource={listQuery.data ?? []}
            locale={{ emptyText: t('approval.empty') }}
          />
        </Spin>
      </PageSection>
    </PageLayout>
  );
}
