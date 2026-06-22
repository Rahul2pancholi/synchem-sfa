import type { DcrSummary, FieldStaffKpis, PobSummary } from '@synchem-sfa/shared-types';
import type { MessageKey } from '@synchem-sfa/shared-i18n';
import { useQuery } from '@tanstack/react-query';
import { Col, Row, Spin, Button, Space, Typography } from 'antd';
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

interface KpisResponse {
  data: FieldStaffKpis;
}

function isDraft(status: string) {
  return status === 'DRAFT' || status === 'REJECTED';
}

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function rtpTodayLabel(
  workType: string | null | undefined,
  hasPlan: boolean,
  t: (key: MessageKey) => string,
) {
  if (!hasPlan) return t('dashboard.fs.rtpNone');
  if (workType === 'LEAVE' || workType === 'HOLIDAY') return t('dashboard.fs.rtpLeave');
  return t('dashboard.fs.rtpField');
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

  const kpisQuery = useQuery({
    queryKey: ['field-staff-kpis'],
    queryFn: async () => {
      const res = await fetchApi<KpisResponse>('/api/v1/reports/field-staff-kpis', languageHeader);
      return res.data;
    },
  });

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

  const kpis = kpisQuery.data;
  const dcrItems = dcrQuery.data ?? [];
  const pobItems = pobQuery.data ?? [];
  const dcrToday = canDcr ? dcrItems.filter((row) => row.workDate === today).length : 0;
  const dcrDraft = canDcr ? dcrItems.filter((row) => isDraft(row.approveStatus)).length : 0;
  const pobDraft = canPob ? pobItems.filter((row) => isDraft(row.approveStatus)).length : 0;
  const loading =
    kpisQuery.isLoading || (canDcr && dcrQuery.isLoading) || (canPob && pobQuery.isLoading);

  const hqSuffix = kpis?.headQuarterName ? ` · ${kpis.headQuarterName}` : '';
  const welcome = employee?.firstName
    ? `${employee.firstName}, ${t('dashboard.fs.subtitle')}${hqSuffix}`
    : `${t('dashboard.fs.subtitle')}${hqSuffix}`;

  return (
    <PageLayout title={t('dashboard.fieldStaff')} subtitle={welcome}>
      <PageSection title={t('dashboard.fs.todayPlan')}>
        <Spin spinning={kpisQuery.isLoading}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard
                title={t('dashboard.fs.rtpToday')}
                info={t('dashboard.fs.statHelp.rtpToday')}
                value={rtpTodayLabel(kpis?.rtpWorkTypeToday, kpis?.rtpHasPlanToday ?? false, t)}
                to={canRtp ? '/app/monthlyRTP' : undefined}
              />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard
                title={t('dashboard.fs.weeklyDoctorsToday')}
                info={t('dashboard.fs.statHelp.weeklyDoctorsToday')}
                value={kpis?.weeklyDoctorsToday ?? 0}
                to={canWeekly ? '/app/weeklyPlan' : undefined}
              />
            </Col>
            {canLoadStats ? (
              <Col xs={12} sm={12} md={8} lg={6}>
                <StatCard
                  title={t('dashboard.fs.pendingSubmit')}
                  info={t('dashboard.fs.statHelp.pendingSubmit')}
                  value={kpis?.pendingSubmitCount ?? 0}
                />
              </Col>
            ) : null}
          </Row>
        </Spin>
      </PageSection>

      <PageSection title={t('dashboard.fs.salesKpis')}>
        <Spin spinning={kpisQuery.isLoading}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard
                title={t('dashboard.fs.pobMtd')}
                info={t('dashboard.fs.statHelp.pobMtd')}
                value={formatInr(kpis?.pobApprovedAmount ?? 0)}
                to={canPob ? '/app/pob/add' : undefined}
              />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard
                title={t('dashboard.fs.pobAchievement')}
                info={t('dashboard.fs.statHelp.pobAchievement')}
                value={`${kpis?.pobAchievementPct ?? 0}%`}
              />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard
                title={t('dashboard.fs.coverage')}
                info={t('dashboard.fs.statHelp.coverage')}
                value={`${kpis?.coveragePct ?? 0}%`}
              />
            </Col>
            <Col xs={12} sm={12} md={8} lg={6}>
              <StatCard
                title={t('dashboard.fs.missedCalls')}
                info={t('dashboard.fs.statHelp.missedCalls')}
                value={kpis?.missedCallCount ?? 0}
              />
            </Col>
          </Row>
        </Spin>
      </PageSection>

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
              <Button size="large" type="primary">
                {t('txn.dcr.title')}
              </Button>
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
        {kpis?.amountTarget ? (
          <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
            {t('dashboard.fs.pobAchievement')}: {formatInr(kpis.pobApprovedAmount)} /{' '}
            {formatInr(kpis.amountTarget)}
          </Typography.Paragraph>
        ) : null}
      </PageSection>
    </PageLayout>
  );
}
