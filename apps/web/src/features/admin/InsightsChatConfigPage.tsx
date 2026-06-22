import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Switch,
  Typography,
  message,
} from 'antd';
import type { InsightsChatConfigPublic } from '@synchem-sfa/shared-types';
import { InsightsModelPresets } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchApi } from '../../lib/api-client';

interface ConfigResponse {
  data: InsightsChatConfigPublic;
}

export function InsightsChatConfigPage() {
  const { t, languageHeader } = useI18n();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const configQuery = useQuery({
    queryKey: ['insights-chat-config'],
    queryFn: async () => {
      const res = await fetchApi<ConfigResponse>(
        '/api/v1/admin/insights-chat-config',
        languageHeader,
      );
      return res.data;
    },
  });

  useEffect(() => {
    if (!configQuery.data) return;
    form.setFieldsValue({
      enabled: configQuery.data.enabled,
      provider: configQuery.data.provider,
      model: configQuery.data.model,
      systemPrompt: configQuery.data.systemPrompt,
      intentPrompt: configQuery.data.intentPrompt,
      narrationPrompt: configQuery.data.narrationPrompt,
      apiKey: '',
    });
  }, [configQuery.data, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) =>
      fetchApi<ConfigResponse>('/api/v1/admin/insights-chat-config', languageHeader, {
        method: 'PUT',
        body: JSON.stringify(values),
      }),
    onSuccess: async () => {
      message.success(t('insights.config.saveSuccess'));
      form.setFieldValue('apiKey', '');
      await queryClient.invalidateQueries({ queryKey: ['insights-chat-config'] });
    },
    onError: () => message.error(t('common.error')),
  });

  const testMutation = useMutation({
    mutationFn: async () =>
      fetchApi<{ data: { ok: boolean; message: string } }>(
        '/api/v1/admin/insights-chat-config/test-connection',
        languageHeader,
        { method: 'POST' },
      ),
    onSuccess: (res) => message.success(res.data.message || t('insights.config.testSuccess')),
    onError: (err: Error) => message.error(err.message || t('common.error')),
  });

  const provider = Form.useWatch('provider', form) ?? configQuery.data?.provider ?? 'openai';
  const modelOptions = (InsightsModelPresets[provider as keyof typeof InsightsModelPresets] ?? []).map(
    (m) => ({ value: m, label: m }),
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('insights.config.title')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {t('insights.config.subtitle')}
        </Typography.Paragraph>
      </div>

      <Alert
        type="info"
        showIcon
        message="Local dev — Docker not required. Save settings here; insights-service reads them from main API."
      />

      <Card>
        <Spin spinning={configQuery.isLoading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              const body = { ...values };
              if (!body.apiKey) delete body.apiKey;
              saveMutation.mutate(body);
            }}
          >
            <Form.Item name="enabled" label={t('insights.config.enabled')} valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="provider" label={t('insights.config.provider')} rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'openai', label: t('insights.config.provider.openai') },
                  { value: 'gemini', label: t('insights.config.provider.gemini') },
                  { value: 'stub', label: t('insights.config.provider.stub') },
                ]}
              />
            </Form.Item>

            <Form.Item name="model" label={t('insights.config.model')} rules={[{ required: true }]}>
              <Input placeholder="gpt-4o-mini" list="insights-model-presets" />
            </Form.Item>
            <datalist id="insights-model-presets">
              {modelOptions.map((o) => (
                <option key={o.value} value={o.value} />
              ))}
            </datalist>

            {configQuery.data?.apiKeyConfigured ? (
              <Form.Item label={t('insights.config.apiKeyHint')}>
                <Typography.Text code>{configQuery.data.apiKeyHint}</Typography.Text>
              </Form.Item>
            ) : null}

            <Form.Item name="apiKey" label={t('insights.config.apiKey')}>
              <Input.Password placeholder={t('insights.config.apiKeyPlaceholder')} autoComplete="new-password" />
            </Form.Item>

            <Form.Item name="systemPrompt" label={t('insights.config.systemPrompt')} rules={[{ required: true }]}>
              <Input.TextArea rows={5} />
            </Form.Item>

            <Form.Item name="intentPrompt" label={t('insights.config.intentPrompt')} rules={[{ required: true }]}>
              <Input.TextArea rows={5} />
            </Form.Item>

            <Form.Item name="narrationPrompt" label={t('insights.config.narrationPrompt')} rules={[{ required: true }]}>
              <Input.TextArea rows={5} />
            </Form.Item>

            <Space>
              <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
                {t('common.save')}
              </Button>
              <Button onClick={() => testMutation.mutate()} loading={testMutation.isPending}>
                {t('insights.config.testConnection')}
              </Button>
            </Space>
          </Form>
        </Spin>
      </Card>
    </Space>
  );
}
