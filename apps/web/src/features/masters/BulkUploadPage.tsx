import { FormEvent, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders, parseCsv } from './masterApi';
import type { BulkUploadConfig } from './masterPageConfig';

export function BulkUploadPage({ config }: { config: BulkUploadConfig }) {
  const { t, languageHeader } = useI18n();
  const [csvText, setCsvText] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setResult('');

    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      setError(t('masters.bulk.empty'));
      return;
    }

    const res = await fetch(config.apiPath, {
      method: 'POST',
      headers: authHeaders(languageHeader),
      body: JSON.stringify({ rows }),
    });

    if (!res.ok) {
      setError(t(config.loadFailedKey));
      return;
    }

    const data = await res.json();
    setResult(
      t('masters.bulk.result')
        .replace('{created}', String(data.data.created))
        .replace('{skipped}', String(data.data.skipped))
        .replace('{total}', String(data.data.total)),
    );
    setCsvText('');
  }

  return (
    <div className="master-page">
      <h1>{t(config.titleKey)}</h1>
      <section className="platform-card">
        <p className="muted">{t('masters.bulk.hint')}: {config.columnsHint}</p>
        <form className="bulk-form" onSubmit={onSubmit}>
          <textarea
            rows={10}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={config.columnsHint}
          />
          <button type="submit">{t('masters.bulk.upload')}</button>
        </form>
        {error && <p className="error">{error}</p>}
        {result && <p className="success">{result}</p>}
      </section>
    </div>
  );
}
