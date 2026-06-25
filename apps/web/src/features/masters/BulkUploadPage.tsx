import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Input, Space, Typography, message } from 'antd';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders } from '../../lib/api-client';
import { parseCsv } from '../../lib/parse-csv';
import type { BulkUploadConfig } from './masterPageConfig';

export function BulkUploadPage({ config, embedded = false }: { config: BulkUploadConfig; embedded?: boolean }) {
  const { t, languageHeader } = useI18n();
  const [csvText, setCsvText] = useState('');
  const [result, setResult] = useState<{ created: number; skipped: number; total: number } | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (rows: Record<string, string>[]) =>
      fetch(config.apiPath, {
        method: 'POST',
        headers: authHeaders(languageHeader),
        body: JSON.stringify({ rows }),
      }).then(async (res) => {
        if (!res.ok) throw new Error(t(config.loadFailedKey));
        return res.json() as Promise<{ data: { created: number; skipped: number; total: number } }>;
      }),
    onSuccess: (data) => {
      setResult(data.data);
      setCsvText('');
      message.success(t('masters.bulk.result').replace('{created}', String(data.data.created)).replace('{skipped}', String(data.data.skipped)).replace('{total}', String(data.data.total)));
    },
    onError: () => message.error(t(config.loadFailedKey)),
  });

  function onUpload() {
    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      message.warning(t('masters.bulk.empty'));
      return;
    }
    uploadMutation.mutate(rows);
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {!embedded ? (
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t(config.titleKey)}
        </Typography.Title>
      ) : null}
      <Card>
        <Typography.Paragraph type="secondary">
          {t('masters.bulk.hint')}: <code>{config.columnsHint}</code>
        </Typography.Paragraph>
        <Input.TextArea rows={12} value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder={config.columnsHint} />
        <Button type="primary" style={{ marginTop: 16 }} onClick={onUpload} loading={uploadMutation.isPending}>
          {t('masters.bulk.upload')}
        </Button>
        {result && (
          <Alert
            style={{ marginTop: 16 }}
            type="success"
            showIcon
            message={t('masters.bulk.result')
              .replace('{created}', String(result.created))
              .replace('{skipped}', String(result.skipped))
              .replace('{total}', String(result.total))}
          />
        )}
      </Card>
    </Space>
  );
}
