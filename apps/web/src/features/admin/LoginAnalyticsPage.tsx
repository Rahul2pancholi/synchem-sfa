import type { LoginAnalyticsResponse } from '@synchem-sfa/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Button, Col, InputNumber, Row, Space, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { ResponsiveTable } from '../../components/ui/ResponsiveTable';
import { StatCard } from '../../components/ui/StatCard';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';

interface AnalyticsApiResponse {
  data: LoginAnalyticsResponse;
}

function formatBreakdown(record: Record<string, number>) {
  return Object.entries(record)
    .map(([key, count]) => `${key}: ${count}`)
    .join(' · ') || '—';
}

export function LoginAnalyticsPage() {
  const { t, languageHeader } = useI18n();
  const [days, setDays] = useState(30);
  const [appliedDays, setAppliedDays] = useState(30);

  const analyticsQuery = useQuery({
    queryKey: ['login-analytics', appliedDays],
    queryFn: async () => {
      const res = await fetchApi<AnalyticsApiResponse>(
        `/api/v1/security/login-analytics?days=${appliedDays}`,
        languageHeader,
      );
      return res.data;
    },
  });

  const data = analyticsQuery.data;
  const summary = data?.summary;

  return (
    <PageLayout
      title={t('security.loginAnalytics.title')}
      subtitle={t('security.loginAnalytics.subtitle')}
    >
      <PageSection>
        <Space wrap>
          <InputNumber
            min={1}
            max={365}
            value={days}
            onChange={(v) => setDays(v ?? 30)}
            addonBefore={t('security.loginAnalytics.periodDays')}
          />
          <Button type="primary" onClick={() => setAppliedDays(days)}>
            {t('security.loginAnalytics.apply')}
          </Button>
        </Space>
      </PageSection>

      {analyticsQuery.isLoading ? (
        <Spin />
      ) : summary ? (
        <>
          <PageSection>
            <Row gutter={[16, 16]}>
              <Col xs={12} md={8} lg={4}>
                <StatCard label={t('security.loginAnalytics.totalLogins')} value={summary.totalLogins} />
              </Col>
              <Col xs={12} md={8} lg={4}>
                <StatCard label={t('security.loginAnalytics.failedLogins')} value={summary.failedLogins} />
              </Col>
              <Col xs={12} md={8} lg={4}>
                <StatCard label={t('security.loginAnalytics.uniqueUsers')} value={summary.uniqueUsers} />
              </Col>
              <Col xs={12} md={8} lg={4}>
                <StatCard label={t('security.loginAnalytics.uniqueDevices')} value={summary.uniqueDevices} />
              </Col>
              <Col xs={12} md={8} lg={4}>
                <StatCard label={t('security.loginAnalytics.activeSessions')} value={summary.activeSessions} />
              </Col>
              <Col xs={12} md={8} lg={4}>
                <StatCard
                  label={t('security.loginAnalytics.multiDeviceUsers')}
                  value={summary.multiDeviceUsers}
                />
              </Col>
            </Row>
            <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
              {t('security.loginAnalytics.channelBreakdown')}: {formatBreakdown(summary.channelBreakdown)}
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {t('security.loginAnalytics.deviceBreakdown')}: {formatBreakdown(summary.deviceTypeBreakdown)}
            </Typography.Paragraph>
          </PageSection>

          <PageSection title={t('security.loginAnalytics.usersTitle')}>
            <ResponsiveTable
              rowKey="empId"
              dataSource={data?.users ?? []}
              columns={[
                {
                  title: t('security.loginAnalytics.col.employee'),
                  dataIndex: 'employeeName',
                  key: 'employeeName',
                },
                {
                  title: t('security.loginAnalytics.col.userName'),
                  dataIndex: 'userName',
                  key: 'userName',
                },
                {
                  title: t('security.loginAnalytics.col.logins'),
                  dataIndex: 'loginCount',
                  key: 'loginCount',
                },
                {
                  title: t('security.loginAnalytics.col.failed'),
                  dataIndex: 'failedCount',
                  key: 'failedCount',
                },
                {
                  title: t('security.loginAnalytics.col.devices'),
                  dataIndex: 'distinctDevices',
                  key: 'distinctDevices',
                },
                {
                  title: t('security.loginAnalytics.col.ips'),
                  dataIndex: 'distinctIps',
                  key: 'distinctIps',
                },
                {
                  title: t('security.loginAnalytics.col.sessions'),
                  dataIndex: 'activeSessions',
                  key: 'activeSessions',
                },
                {
                  title: t('security.loginAnalytics.col.lastLogin'),
                  dataIndex: 'lastLoginAt',
                  key: 'lastLoginAt',
                  render: (v: string | null) => (v ? dayjs(v).format('DD-MM-YYYY HH:mm') : '—'),
                },
                {
                  title: t('security.loginAnalytics.col.multiDevice'),
                  dataIndex: 'multiDeviceFlag',
                  key: 'multiDeviceFlag',
                  render: (flag: boolean) =>
                    flag ? (
                      <Tag color="orange">{t('security.loginAnalytics.yes')}</Tag>
                    ) : (
                      t('security.loginAnalytics.no')
                    ),
                },
              ]}
            />
          </PageSection>

          <PageSection title={t('security.loginAnalytics.recentTitle')}>
            <ResponsiveTable
              rowKey="id"
              dataSource={data?.recentEvents ?? []}
              columns={[
                {
                  title: t('security.loginAnalytics.col.time'),
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (v: string) => dayjs(v).format('DD-MM-YYYY HH:mm'),
                },
                {
                  title: t('security.loginAnalytics.col.employee'),
                  key: 'employee',
                  render: (_: unknown, row) => row.employeeName ?? row.userName ?? '—',
                },
                {
                  title: t('security.loginAnalytics.col.status'),
                  dataIndex: 'loginStatus',
                  key: 'loginStatus',
                  render: (status: string) => (
                    <Tag color={status === 'SUCCESS' ? 'green' : 'red'}>
                      {status === 'SUCCESS'
                        ? t('security.loginAnalytics.status.success')
                        : t('security.loginAnalytics.status.failed')}
                    </Tag>
                  ),
                },
                {
                  title: t('security.loginAnalytics.col.channel'),
                  dataIndex: 'channel',
                  key: 'channel',
                },
                {
                  title: t('security.loginAnalytics.col.device'),
                  dataIndex: 'deviceType',
                  key: 'deviceType',
                },
                {
                  title: t('security.loginAnalytics.col.os'),
                  dataIndex: 'osName',
                  key: 'osName',
                },
                {
                  title: t('security.loginAnalytics.col.browser'),
                  dataIndex: 'browserName',
                  key: 'browserName',
                },
                {
                  title: t('security.loginAnalytics.col.ip'),
                  dataIndex: 'ipAddress',
                  key: 'ipAddress',
                },
              ]}
            />
          </PageSection>
        </>
      ) : null}
    </PageLayout>
  );
}
