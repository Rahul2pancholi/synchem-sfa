import { FormEvent, useEffect, useState } from 'react';
import type { HierarchySummary } from '@synchem-sfa/shared-types';
import { useI18n } from '../../i18n/I18nProvider';

function authHeaders(languageHeader: Record<string, string>) {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...languageHeader,
  };
}

export function HierarchyMasterPage() {
  const { t, languageHeader } = useI18n();
  const [items, setItems] = useState<HierarchySummary[]>([]);
  const [treeLabel, setTreeLabel] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hierarchyCode, setHierarchyCode] = useState('');
  const [hierarchyType, setHierarchyType] = useState('MR');
  const [hierarchyLevel, setHierarchyLevel] = useState('4');
  const [reportingHierarchyId, setReportingHierarchyId] = useState('');

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [listRes, treeRes] = await Promise.all([
        fetch('/api/v1/hierarchies', { headers: authHeaders(languageHeader) }),
        fetch('/api/v1/hierarchies/reporting', { headers: authHeaders(languageHeader) }),
      ]);

      if (!listRes.ok) {
        setError(t('masters.hierarchy.loadFailed'));
        return;
      }

      const listData = await listRes.json();
      setItems(listData.data.items ?? []);

      if (treeRes.ok) {
        const treeData = await treeRes.json();
        setTreeLabel(formatTree(treeData.data.tree ?? []));
      }
    } catch {
      setError(t('masters.hierarchy.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function createHierarchy(e: FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/v1/hierarchies', {
      method: 'POST',
      headers: authHeaders(languageHeader),
      body: JSON.stringify({
        hierarchyCode,
        hierarchyType,
        hierarchyLevel: Number(hierarchyLevel),
        reportingHierarchyId: reportingHierarchyId || null,
      }),
    });

    if (!res.ok) {
      setError(t('masters.hierarchy.createFailed'));
      return;
    }

    setHierarchyCode('');
    setReportingHierarchyId('');
    await loadData();
  }

  async function deactivate(id: string) {
    const res = await fetch(`/api/v1/hierarchies/${id}`, {
      method: 'DELETE',
      headers: authHeaders(languageHeader),
    });

    if (!res.ok) {
      setError(t('masters.hierarchy.deleteFailed'));
      return;
    }

    await loadData();
  }

  return (
    <div className="master-page">
      <h1>{t('masters.hierarchy.title')}</h1>

      <section className="platform-card">
        <h2>{t('masters.hierarchy.createTitle')}</h2>
        <form className="master-form" onSubmit={createHierarchy}>
          <input
            placeholder={t('masters.hierarchy.code')}
            value={hierarchyCode}
            onChange={(e) => setHierarchyCode(e.target.value.toUpperCase())}
            required
          />
          <select value={hierarchyType} onChange={(e) => setHierarchyType(e.target.value)}>
            <option value="AD">AD</option>
            <option value="RM">RM</option>
            <option value="ZM">ZM</option>
            <option value="MR">MR</option>
          </select>
          <input
            type="number"
            min={1}
            max={10}
            placeholder={t('masters.hierarchy.level')}
            value={hierarchyLevel}
            onChange={(e) => setHierarchyLevel(e.target.value)}
            required
          />
          <select
            value={reportingHierarchyId}
            onChange={(e) => setReportingHierarchyId(e.target.value)}
          >
            <option value="">{t('masters.hierarchy.noParent')}</option>
            {items
              .filter((item) => item.active)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.hierarchyCode} ({item.hierarchyType})
                </option>
              ))}
          </select>
          <button type="submit">{t('common.create')}</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="platform-card">
        <h2>{t('masters.hierarchy.reportingTree')}</h2>
        <pre className="tree-preview">{treeLabel || t('common.loading')}</pre>
      </section>

      <section className="platform-card">
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : (
          <table className="tenant-table">
            <thead>
              <tr>
                <th>{t('masters.hierarchy.code')}</th>
                <th>{t('masters.hierarchy.type')}</th>
                <th>{t('masters.hierarchy.level')}</th>
                <th>{t('masters.hierarchy.parent')}</th>
                <th>{t('platform.tenants.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.hierarchyCode}</td>
                  <td>{item.hierarchyType}</td>
                  <td>{item.hierarchyLevel}</td>
                  <td>{item.parentHierarchyCode ?? t('masters.hierarchy.noParent')}</td>
                  <td>{item.active ? t('common.active') : t('common.inactive')}</td>
                  <td>
                    {item.active && (
                      <button type="button" onClick={() => void deactivate(item.id)}>
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

function formatTree(
  nodes: Array<{ hierarchyCode: string; hierarchyType: string; children?: unknown[] }>,
  depth = 0,
): string {
  return nodes
    .map((node) => {
      const prefix = `${'  '.repeat(depth)}- ${node.hierarchyCode} (${node.hierarchyType})`;
      const children = Array.isArray(node.children)
        ? formatTree(node.children as typeof nodes, depth + 1)
        : '';
      return children ? `${prefix}\n${children}` : prefix;
    })
    .join('\n');
}
