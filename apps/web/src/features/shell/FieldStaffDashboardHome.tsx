import type { FieldStaffKpis } from '@synchem-sfa/shared-types';
import type { MessageKey } from '@synchem-sfa/shared-i18n';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Col, Progress, Row, Space, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { FieldStaffImprovementSection } from './FieldStaffImprovementSection';
import { PageLayout } from '../../components/ui/PageLayout';
import { PageSection } from '../../components/ui/PageSection';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';
import { usePermission } from '../../hooks/usePermission';

interface KpisResponse { data: FieldStaffKpis; }

function formatInr(n: number) {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n.toFixed(0)}`;
}

function pctStroke(pct: number) {
  if (pct >= 80) return '#52c41a';
  if (pct >= 60) return '#faad14';
  return '#ff4d4f';
}

function rtpTodayLabel(
  workType: string | null | undefined,
  hasPlan: boolean,
  t: (key: MessageKey) => string,
): { text: string; color: string } {
  if (!hasPlan) return { text: t('dashboard.fs.rtpNone'), color: 'default' };
  if (workType === 'LEAVE') return { text: 'Leave Day', color: 'orange' };
  if (workType === 'HOLIDAY') return { text: 'Holiday', color: 'purple' };
  return { text: t('dashboard.fs.rtpField'), color: 'cyan' };
}

export function FieldStaffDashboardHome() {
  const { t, languageHeader } = useI18n();
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? (JSON.parse(employeeRaw) as { firstName?: string }) : null;

  const canDcr = usePermission('TRN03', 'view');
  const canPob = usePermission('TRN04', 'view');
  const canRtp = usePermission('TRN01', 'view');
  const canWeekly = usePermission('TRN24', 'view');
  const canInsights = canDcr || canPob;

  const kpisQuery = useQuery({
    queryKey: ['field-staff-kpis'],
    queryFn: () =>
      fetchApi<KpisResponse>('/api/v1/reports/field-staff-kpis', languageHeader).then((r) => r.data),
  });

  const kpis = kpisQuery.data;
  const today = dayjs().format('ddd, DD MMM YYYY');
  const hqSuffix = kpis?.headQuarterName ? ` · ${kpis.headQuarterName}` : '';
  const welcome = employee?.firstName
    ? `Hi, ${employee.firstName}${hqSuffix}`
    : `Welcome${hqSuffix}`;

  const rtpStatus = rtpTodayLabel(kpis?.rtpWorkTypeToday, kpis?.rtpHasPlanToday ?? false, t);
  const pobPct = Math.round(kpis?.pobAchievementPct ?? 0);
  const covPct = Math.round(kpis?.coveragePct ?? 0);
  const pendingCount = kpis?.pendingSubmitCount ?? 0;
  const hasTarget = (kpis?.amountTarget ?? 0) > 0;

  return (
    <PageLayout title={t('dashboard.fieldStaff')} subtitle={welcome}>
      {pendingCount > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`${pendingCount} pending item(s) to submit`}
          action={
            canDcr ? (
              <Link to="/app/dcrRecord">
                <Button size="small" type="link">Submit now</Button>
              </Link>
            ) : undefined
          }
          style={{ marginBottom: 0 }}
        />
      )}

      <PageSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Typography.Text strong style={{ fontSize: 15 }}>
            {today}
          </Typography.Text>
          <Space>
            <Tag color={rtpStatus.color} style={{ fontSize: 13, padding: '3px 10px' }}>
              {rtpStatus.text}
            </Tag>
            {(kpis?.weeklyDoctorsToday ?? 0) > 0 && (
              <Tag color="blue" style={{ fontSize: 13, padding: '3px 10px' }}>
                {kpis?.weeklyDoctorsToday} doctors today
              </Tag>
            )}
          </Space>
        </div>

        <Row gutter={[12, 12]}>
          {canDcr && (
            <Col xs={12} sm={6}>
              <Link to="/app/dcrRecord">
                <Button block size="large" type="primary" style={{ height: 56, fontWeight: 600, borderRadius: 10 }}>
                  📋 DCR
                </Button>
              </Link>
            </Col>
          )}
          {canPob && (
            <Col xs={12} sm={6}>
              <Link to="/app/pob/add">
                <Button block size="large" style={{ height: 56, fontWeight: 600, borderRadius: 10 }}>
                  🛒 POB
                </Button>
              </Link>
            </Col>
          )}
          {canRtp && (
            <Col xs={12} sm={6}>
              <Link to="/app/monthlyRTP">
                <Button block size="large" style={{ height: 56, fontWeight: 600, borderRadius: 10 }}>
                  📅 Tour Plan
                </Button>
              </Link>
            </Col>
          )}
          {canWeekly && (
            <Col xs={12} sm={6}>
              <Link to="/app/weeklyPlan">
                <Button block size="large" style={{ height: 56, fontWeight: 600, borderRadius: 10 }}>
                  📆 Weekly
                </Button>
              </Link>
            </Col>
          )}
        </Row>
      </PageSection>

      <PageSection title={t('dashboard.fs.monthProgress')}>
        <Spin spinning={kpisQuery.isLoading}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card size="small" style={{ borderRadius: 10 }} variant="borderless" className="stat-card">
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  {t('dashboard.fs.coverage')}
                </Typography.Text>
                <Progress
                  percent={covPct}
                  strokeColor={pctStroke(covPct)}
                  size={['100%', 16]}
                  style={{ marginTop: 8 }}
                  format={(p) => (
                    <span style={{ fontSize: 14, fontWeight: 700, color: pctStroke(covPct) }}>
                      {p}%
                    </span>
                  )}
                />
                {kpis && (
                  <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    {kpis.doctorVisits} of {kpis.plannedDoctorCalls} planned visits done
                  </Typography.Text>
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" style={{ borderRadius: 10 }} variant="borderless" className="stat-card">
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  {t('dashboard.fs.pobAchievement')}
                </Typography.Text>
                <Progress
                  percent={pobPct}
                  strokeColor={pctStroke(pobPct)}
                  size={['100%', 16]}
                  style={{ marginTop: 8 }}
                  format={(p) => (
                    <span style={{ fontSize: 14, fontWeight: 700, color: pctStroke(pobPct) }}>
                      {p}%
                    </span>
                  )}
                />
                {kpis && hasTarget ? (
                  <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    {formatInr(kpis.pobApprovedAmount)} of {formatInr(kpis.amountTarget)} target
                  </Typography.Text>
                ) : (
                  <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    {t('dashboard.noTarget')}
                  </Typography.Text>
                )}
              </Card>
            </Col>
          </Row>

          {(kpis?.missedCallCount ?? 0) > 0 && (
            <div style={{ marginTop: 16 }}>
              <Alert
                type={(kpis?.missedCallCount ?? 0) >= 5 ? 'error' : 'warning'}
                showIcon
                message={`${kpis?.missedCallCount} missed call(s) this month`}
                action={
                  <Link to="/app/report/missedCallReport">
                    <Button size="small" type="link">{t('dashboard.viewReport')}</Button>
                  </Link>
                }
              />
            </div>
          )}
        </Spin>
      </PageSection>

      <FieldStaffImprovementSection enabled={canInsights} />
    </PageLayout>
  );
}
