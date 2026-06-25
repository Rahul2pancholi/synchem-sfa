import type { ApprovalEntityDetail, ApprovalEntityType, ApprovalPendingItem } from '@synchem-sfa/shared-types';
import type { MessageKey } from '@synchem-sfa/shared-i18n';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Descriptions, Input, Modal, Space, Spin, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { PageSection } from '../../components/ui/PageSection';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, fetchApi } from '../../lib/api-client';

interface ListResponse {
  data: { items: ApprovalPendingItem[] };
}

interface DetailResponse {
  data: ApprovalEntityDetail;
}

const DETAIL_LABEL_KEYS: Record<string, MessageKey> = {
  doctorName: 'approval.detail.doctorName',
  routeName: 'approval.detail.routeName',
  specialistName: 'approval.detail.specialistName',
  qualificationName: 'approval.detail.qualificationName',
  mobileNo: 'approval.detail.mobileNo',
  claimMonth: 'approval.detail.claimMonth',
  claimYear: 'approval.detail.claimYear',
  totalAmount: 'approval.detail.totalAmount',
};

const DETAIL_ENTITY_TYPES = new Set<ApprovalEntityType>(['EXPENSE', 'DOCTOR']);

export function ApprovalQueuePanel({ entityType }: { entityType: ApprovalEntityType }) {
  const { t, languageHeader } = useI18n();
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [detailEntityId, setDetailEntityId] = useState<string | null>(null);

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

  const detailQuery = useQuery({
    queryKey: ['approval-detail', entityType, detailEntityId],
    queryFn: async () => {
      const res = await fetchApi<DetailResponse>(
        `/api/v1/approvals/entities/${entityType}/${detailEntityId}`,
        languageHeader,
      );
      return res.data;
    },
    enabled: detailEntityId !== null && DETAIL_ENTITY_TYPES.has(entityType),
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
      setDetailEntityId(null);
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
      setDetailEntityId(null);
      await queryClient.invalidateQueries({ queryKey: ['approvals'] });
      await queryClient.invalidateQueries({ queryKey: ['approval-summary'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const columns: ColumnsType<ApprovalPendingItem> = [
    { title: t('approval.submitter'), dataIndex: 'submitterName', key: 'submitterName' },
    {
      title: t('approval.reportingManager'),
      dataIndex: 'reportingManagerName',
      key: 'reportingManagerName',
      render: (value: string) => value || '—',
    },
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
          {DETAIL_ENTITY_TYPES.has(entityType) ? (
            <Button onClick={() => setDetailEntityId(row.entityId)}>{t('approval.viewDetail')}</Button>
          ) : null}
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

  const detail = detailQuery.data;

  return (
    <>
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
        title={t('approval.detailTitle')}
        open={detailEntityId !== null}
        onCancel={() => setDetailEntityId(null)}
        footer={null}
        width={640}
      >
        <Spin spinning={detailQuery.isLoading}>
          {detail ? (
            <>
              <Descriptions column={1} size="small" bordered>
                {detail.attributes.map((attr) => (
                  <Descriptions.Item
                    key={attr.key}
                    label={t(DETAIL_LABEL_KEYS[attr.key] ?? 'approval.summary')}
                  >
                    {attr.key === 'totalAmount' ? `₹${Number(attr.value).toLocaleString('en-IN')}` : attr.value}
                  </Descriptions.Item>
                ))}
              </Descriptions>
              {detail.lines?.length ? (
                <Table
                  style={{ marginTop: 16 }}
                  size="small"
                  rowKey={(_, i) => String(i)}
                  pagination={false}
                  columns={[
                    { title: t('monthly.expense.description'), dataIndex: 'description' },
                    {
                      title: t('approval.detail.amount'),
                      dataIndex: 'amount',
                      render: (v: number) => `₹${v.toLocaleString('en-IN')}`,
                    },
                  ]}
                  dataSource={detail.lines}
                />
              ) : null}
            </>
          ) : null}
        </Spin>
      </Modal>

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
    </>
  );
}
