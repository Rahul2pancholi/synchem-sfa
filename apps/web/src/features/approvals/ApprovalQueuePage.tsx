import type { ApprovalEntityType, ApprovalPendingItem } from '@synchem-sfa/shared-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Modal, Space, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';

interface ListResponse {
  data: { items: ApprovalPendingItem[] };
}

export function ApprovalQueuePage({
  entityType,
  titleKey,
}: {
  entityType: ApprovalEntityType;
  titleKey:
    | 'approval.dcr.title'
    | 'approval.rtp.title'
    | 'approval.weekly.title'
    | 'approval.leave.title'
    | 'approval.expense.title';
}) {
  const { t, languageHeader } = useI18n();
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');

  const listQuery = useQuery({
    queryKey: ['approvals', entityType],
    queryFn: async () => {
      const res = await fetchApi<ListResponse>(
        `/api/v1/approvals/pending?entityType=${entityType}`,
        languageHeader,
      );
      return res.data.items;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) =>
      fetch(`/api/v1/approvals/${id}/approve`, {
        method: 'POST',
        headers: { ...authHeaders(languageHeader), 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).then((res) => {
        if (!res.ok) throw new Error('approve failed');
      }),
    onSuccess: async () => {
      message.success(t('approval.approveSuccess'));
      await queryClient.invalidateQueries({ queryKey: ['approvals'] });
      await queryClient.invalidateQueries({ queryKey: ['approval-summary'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, remarks: rejectRemarks }: { id: string; remarks: string }) =>
      fetch(`/api/v1/approvals/${id}/reject`, {
        method: 'POST',
        headers: { ...authHeaders(languageHeader), 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: rejectRemarks }),
      }).then((res) => {
        if (!res.ok) throw new Error('reject failed');
      }),
    onSuccess: async () => {
      message.success(t('approval.rejectSuccess'));
      setRejectId(null);
      setRemarks('');
      await queryClient.invalidateQueries({ queryKey: ['approvals'] });
      await queryClient.invalidateQueries({ queryKey: ['approval-summary'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const columns: ColumnsType<ApprovalPendingItem> = [
    { title: t('approval.submitter'), dataIndex: 'submitterName', key: 'submitterName' },
    { title: t('approval.summary'), dataIndex: 'summary', key: 'summary' },
    {
      title: t('approval.submittedAt'),
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (value: string) => value.slice(0, 16).replace('T', ' '),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      fixed: 'right',
      render: (_, row) => (
        <Space wrap>
          <Button
            type="primary"
            loading={approveMutation.isPending}
            onClick={() => approveMutation.mutate(row.id)}
          >
            {t('approval.approve')}
          </Button>
          <Button danger onClick={() => setRejectId(row.id)}>
            {t('approval.reject')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageLayout title={t(titleKey)}>
      <PageSection>
        <Spin spinning={listQuery.isLoading}>
          <ResponsiveTable
            rowKey="id"
            columns={columns}
            dataSource={listQuery.data ?? []}
            locale={{ emptyText: t('approval.empty') }}
          />
        </Spin>
      </PageSection>

      <Modal
        title={t('approval.rejectTitle')}
        open={rejectId !== null}
        onCancel={() => {
          setRejectId(null);
          setRemarks('');
        }}
        onOk={() => {
          if (rejectId) rejectMutation.mutate({ id: rejectId, remarks });
        }}
        confirmLoading={rejectMutation.isPending}
      >
        <Input.TextArea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder={t('approval.remarksPlaceholder')}
        />
      </Modal>
    </PageLayout>
  );
}
