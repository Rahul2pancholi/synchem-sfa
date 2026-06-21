import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { authHeaders } from './masterApi';
import type { FormField, MasterPageConfig } from './masterPageConfig';

interface OptionRow {
  id: string;
  [key: string]: unknown;
}

export function GenericMasterPage({ config }: { config: MasterPageConfig }) {
  const { t, languageHeader } = useI18n();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [options, setOptions] = useState<Record<string, OptionRow[]>>({});
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const optionFields = useMemo(
    () => config.formFields.filter((field) => field.type === 'select' && field.optionsFrom),
    [config.formFields],
  );

  useEffect(() => {
    void loadAll();
  }, [config.apiPath]);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const optionLoads = await Promise.all(
        optionFields.map(async (field) => {
          const res = await fetch(field.optionsFrom!, { headers: authHeaders(languageHeader) });
          const data = await res.json();
          return [field.name, data.data.items ?? data.data ?? []] as const;
        }),
      );

      const optionMap: Record<string, OptionRow[]> = {};
      for (const [name, rows] of optionLoads) {
        optionMap[name] = rows as OptionRow[];
      }
      setOptions(optionMap);

      const listRes = await fetch(config.apiPath, { headers: authHeaders(languageHeader) });
      if (!listRes.ok) {
        setError(t(config.loadFailedKey));
        return;
      }
      const listData = await listRes.json();
      setItems(listData.data.items ?? []);
    } catch {
      setError(t(config.loadFailedKey));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const body: Record<string, unknown> = {};
    for (const field of config.formFields) {
      const value = form[field.name]?.trim();
      if (!value && field.required) return;
      if (value) body[field.name] = value;
    }

    const res = await fetch(config.apiPath, {
      method: 'POST',
      headers: authHeaders(languageHeader),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      setError(t(config.createFailedKey));
      return;
    }

    setForm({});
    await loadAll();
  }

  async function onDelete(id: string) {
    if (!config.canDelete) return;
    const res = await fetch(`${config.apiPath}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(languageHeader),
    });
    if (!res.ok) {
      setError(t(config.deleteFailedKey ?? config.createFailedKey));
      return;
    }
    await loadAll();
  }

  function renderField(field: FormField) {
    if (field.type === 'select') {
      const rows = options[field.name] ?? [];
      return (
        <select
          key={field.name}
          value={form[field.name] ?? ''}
          onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
          required={field.required}
        >
          <option value="">{t('masters.employee.none')}</option>
          {rows.map((row) => (
            <option key={row.id} value={row.id}>
              {String(row[field.optionLabelKey ?? 'name'])}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        key={field.name}
        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
        placeholder={t(field.labelKey)}
        value={form[field.name] ?? ''}
        onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
        required={field.required}
      />
    );
  }

  function cellValue(row: Record<string, unknown>, key: string) {
    const value = row[key];
    if (key.endsWith('Date') && typeof value === 'string') {
      return value.slice(0, 10);
    }
    return value == null ? '' : String(value);
  }

  return (
    <div className="master-page">
      <h1>{t(config.titleKey)}</h1>

      <section className="platform-card">
        <h2>{t(config.createTitleKey)}</h2>
        <form className="master-form grid-form" onSubmit={onSubmit}>
          {config.formFields.map(renderField)}
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
                {config.columns.map((col) => (
                  <th key={col.key}>{t(col.labelKey)}</th>
                ))}
                <th>{t('platform.tenants.status')}</th>
                {config.canDelete && <th>{t('common.actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={String(row.id)}>
                  {config.columns.map((col) => (
                    <td key={col.key}>{cellValue(row, col.key)}</td>
                  ))}
                  <td>{row.active === false ? t('common.inactive') : t('common.active')}</td>
                  {config.canDelete && row.active !== false && (
                    <td>
                      <button type="button" onClick={() => void onDelete(String(row.id))}>
                        {t('common.delete')}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
