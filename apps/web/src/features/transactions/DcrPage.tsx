import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, DatePicker, Empty, Form, Select, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DcrSummary } from '@synchem-sfa/shared-types';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';
import { StatusTag } from './StatusTag';

interface ListResponse {
  data: { items: DcrSummary[] };
}

interface DoctorOption {
  id: string;
  doctorName: string;
}

export function DcrPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['daily-call-reports'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse>('/api/v1/daily-call-reports', languageHeader);
      return res.data.items;
    },
  });

  const doctorsQuery = useQuery({
    queryKey: ['doctors-options'],
    queryFn: async () => {
      const res = await fetchApi<{ data: { items: DoctorOption[] } }>(
        '/api/v1/doctors?pageSize=200',
        languageHeader,
      );
      return res.data.items;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      fetchApi('/api/v1/daily-call-reports', languageHeader, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      message.success(t('common.create'));
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ['daily-call-reports'] });
    },
    onError: () => message.error(t('txn.dcr.createFailed')),
  });

  const submitMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/v1/daily-call-reports/${id}/submit`, {
        method: 'POST',
        headers: authHeaders(languageHeader),
      }).then((res) => {
        if (!res.ok) throw new Error('submit failed');
      }),
    onSuccess: async () => {
      message.success(t('txn.dcr.submitSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['daily-call-reports'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const columns: ColumnsType<DcrSummary> = [
    { title: t('txn.dcr.workDate'), dataIndex: 'workDate', key: 'workDate' },
    { title: t('txn.common.status'), key: 'status', render: (_, row) => <StatusTag status={row.approveStatus} /> },
    { title: t('txn.dcr.doctors'), dataIndex: 'doctorVisitCount', key: 'doctorVisitCount' },
    {
      title: t('common.actions'),
      key: 'actions',
      fixed: 'right',
      render: (_, row) =>
        row.approveStatus === 'DRAFT' || row.approveStatus === 'REJECTED' ? (
          <Button loading={submitMutation.isPending} onClick={() => submitMutation.mutate(row.id)}>
            {t('txn.dcr.submit')}
          </Button>
        ) : null,
    },
  ];

  return (
    <PageLayout title={t('txn.dcr.title')}>
      <PageSection title={t('txn.dcr.createTitle')}>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            createMutation.mutate({
              workDate: values.workDate.format('YYYY-MM-DD'),
              doctorIds: values.doctorIds ?? [],
            });
          }}
        >
          <div className="form-grid">
            <Form.Item name="workDate" label={t('txn.dcr.workDate')} rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>
            <Form.Item name="doctorIds" label={t('txn.common.doctor')}>
              <Select
                mode="multiple"
                allowClear
                loading={doctorsQuery.isLoading}
                options={(doctorsQuery.data ?? []).map((d) => ({ value: d.id, label: d.doctorName }))}
              />
            </Form.Item>
          </div>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              {t('common.create')}
            </Button>
          </Form.Item>
        </Form>
      </PageSection>

      <PageSection>
        {listQuery.isLoading ? (
          <Spin />
        ) : (
          <ResponsiveTable
            rowKey="id"
            columns={columns}
            dataSource={listQuery.data ?? []}
            locale={{ emptyText: <Empty /> }}
          />
        )}
      </PageSection>
    </PageLayout>
  );
}
