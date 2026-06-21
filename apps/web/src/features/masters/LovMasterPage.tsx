import { FormEvent, useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders } from './masterApi';
import type { LovPageConfig } from './masterPageConfig';

export function LovMasterPage({ config }: { config: LovPageConfig }) {
  const { t, languageHeader } = useI18n();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadItems();
  }, [config.apiPath]);

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(config.apiPath, { headers: authHeaders(languageHeader) });
      if (!res.ok) {
        setError(t(config.loadFailedKey));
        return;
      }
      const data = await res.json();
      setItems(data.data.items ?? []);
    } catch {
      setError(t(config.loadFailedKey));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch(config.apiPath, {
      method: 'POST',
      headers: authHeaders(languageHeader),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      setError(t(config.createFailedKey));
      return;
    }
    setName('');
    await loadItems();
  }

  async function onDelete(id: string) {
    const res = await fetch(`${config.apiPath}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(languageHeader),
    });
    if (!res.ok) {
      setError(t(config.createFailedKey));
      return;
    }
    await loadItems();
  }

  return (
    <div className="master-page">
      <h1>{t(config.titleKey)}</h1>
      <section className="platform-card">
        <form className="master-form" onSubmit={onSubmit}>
          <input
            placeholder={t('masters.lov.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit">{t('common.create')}</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>
      <section className="platform-card">
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : (
          <table className="tenant-table">
            <thead>
              <tr>
                <th>{t('masters.lov.name')}</th>
                <th>{t('platform.tenants.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={String(row.id)}>
                  <td>{String(row[config.nameField] ?? '')}</td>
                  <td>{row.active === false ? t('common.inactive') : t('common.active')}</td>
                  <td>
                    {row.active !== false && (
                      <button type="button" onClick={() => void onDelete(String(row.id))}>
                        {t('common.delete')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
