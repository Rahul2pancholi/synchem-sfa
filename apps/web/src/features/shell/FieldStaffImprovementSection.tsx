import type { FieldStaffSalesInsights, SalesInsightCard } from '@synchem-sfa/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Space, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { PageSection } from '../../components/ui/PageSection';
import { useI18n } from '../../i18n/I18nProvider';
import type { MessageKey } from '@synchem-sfa/shared-i18n';
import { fetchApi } from '../../lib/api-client';

interface InsightsResponse {
  data: FieldStaffSalesInsights;
}

function interpolate(template: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function formatInsightMessage(t: (key: MessageKey) => string, card: SalesInsightCard) {
  return interpolate(t(card.messageKey as MessageKey), card.params);
}

function alertType(severity: SalesInsightCard['severity']) {
  if (severity === 'critical') return 'error' as const;
  if (severity === 'warning') return 'warning' as const;
  return 'info' as const;
}

export function FieldStaffImprovementSection({ enabled }: { enabled: boolean }) {
  const { t, languageHeader } = useI18n();

  const query = useQuery({
    queryKey: ['sales-insights-field-staff'],
    queryFn: async () => {
      const res = await fetchApi<InsightsResponse>('/api/v1/sales-insights/field-staff', languageHeader);
      return res.data;
    },
    enabled,
  });

  if (!enabled) return null;

  return (
    <PageSection title={t('salesInsights.fsTitle')}>
      <Spin spinning={query.isLoading}>
        {query.data?.insights.length ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {query.data.insights.map((card) => (
              <Alert
                key={`${card.ruleId}-${card.messageKey}-${JSON.stringify(card.params)}`}
                type={alertType(card.severity)}
                showIcon
                message={formatInsightMessage(t, card)}
                action={
                  card.actionPath ? (
                    <Link to={card.actionPath}>
                      <Button size="small" type="link">
                        {t('salesInsights.viewReport')}
                      </Button>
                    </Link>
                  ) : undefined
                }
              />
            ))}
          </Space>
        ) : (
          <Alert type="success" showIcon message={t('salesInsights.fsEmpty')} />
        )}
      </Spin>
    </PageSection>
  );
}
