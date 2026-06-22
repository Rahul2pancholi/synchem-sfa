import type { DcrSummary, PobSummary } from '@synchem-sfa/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Col, Row, Spin, Button, Space } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { StatCard } from '../../components/ui/StatCard';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';
import { usePermission } from '../../hooks/usePermission';

interface ListResponse<T> {
  data: { items: T[] };
}

function isDraft(status: string) {
  return status === 'DRAFT' || status === 'REJECTED';
}

export function FieldStaffDashboardHome() {
  const { t, languageHeader } = useI18n();
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? JSON.parse(employeeRaw) : null;
  const today = dayjs().format('YYYY-MM-DD');

  const canDcr = usePermission('TRN03', 'view');
  const canPob = usePermission('TRN04', 'view');
  const canRtp = usePermission('TRN01', 'view');
  const canWeekly = usePermission('TRN24', 'view');
  const canLoadStats = canDcr || canPob;

  const dcrQuery = useQuery({
    queryKey: ['field-staff-dcr'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse<DcrSummary>>('/api/v1/daily-call-reports', languageHeader);
      return res.data.items;
    },
    enabled: canDcr,
  });

  const pobQuery = useQuery({
    queryKey: ['field-staff-pob'],
    queryFn: async () => {
      const res = await fetchApi<ListResponse<PobSummary>>('/api/v1/personal-orders', languageHeader);
      return res.data.items;
    },
    enabled: canPob,
  });

  const dcrItems = dcrQuery.data ?? [];
  const pobItems = pobQuery.data ?? [];
  const dcrToday = canDcr ? dcrItems.filter((row) => row.workDate === today).length : 0;
  const dcrDraft = canDcr ? dcrItems.filter((row) => isDraft(row.approveStatus)).length : 0;
  const pobDraft = canPob ? pobItems.filter((row) => isDraft(row.approveStatus)).length : 0;
  const loading = (canDcr && dcrQuery.isLoading) || (canPob && pobQuery.isLoading);

  const welcome = employee?.firstName
    ? `${employee.firstName}, ${t('dashboard.fs.subtitle')}`
    : t('dashboard.fs.subtitle');

  return (
    <PageLayout title={t('dashboard.fieldStaff')} subtitle={welcome}>
      {canLoadStats ? (
        <PageSection title={t('dashboard.fs.todayWork')}>
          <Spin spinning={loading}>
            <Row gutter={[16, 16]}>
              {canDcr ? (
                <Col xs={12} sm={12} md={8} lg={6}>
                  <StatCard
                    title={t('dashboard.fs.dcrToday')}
                    info={t('dashboard.fs.statHelp.dcrToday')}
                    value={dcrToday}
                    to="/app/dcrRecord"
                  />
                </Col>
              ) : null}
              {canDcr ? (
                <Col xs={12} sm={12} md={8} lg={6}>
                  <StatCard
                    title={t('dashboard.fs.dcrDraft')}
                    info={t('dashboard.fs.statHelp.dcrDraft')}
                    value={dcrDraft}
                    to="/app/dcrRecord"
                  />
                </Col>
              ) : null}
              {canPob ? (
                <Col xs={12} sm={12} md={8} lg={6}>
                  <StatCard
                    title={t('dashboard.fs.pobDraft')}
                    info={t('dashboard.fs.statHelp.pobDraft')}
                    value={pobDraft}
                    to="/app/pob/add"
                  />
                </Col>
              ) : null}
            </Row>
          </Spin>
        </PageSection>
      ) : null}

      <PageSection title={t('dashboard.fs.quickActions')}>
        <Space wrap size="middle">
          {canDcr ? (
            <Link to="/app/dcrRecord">
              <Button size="large">{t('txn.dcr.title')}</Button>
            </Link>
          ) : null}
          {canPob ? (
            <Link to="/app/pob/add">
              <Button size="large">{t('txn.pob.title')}</Button>
            </Link>
          ) : null}
          {canRtp ? (
            <Link to="/app/monthlyRTP">
              <Button size="large">{t('txn.rtp.title')}</Button>
            </Link>
          ) : null}
          {canWeekly ? (
            <Link to="/app/weeklyPlan">
              <Button size="large">{t('txn.weekly.title')}</Button>
            </Link>
          ) : null}
        </Space>
      </PageSection>
    </PageLayout>
  );
}
