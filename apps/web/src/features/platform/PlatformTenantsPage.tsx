import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

interface Company {
  compCode: string;
  compName: string;
  industryType: string;
  timezone: string;
  locale: string;
  active: boolean;
}

export function PlatformTenantsPage() {
  const navigate = useNavigate();
  const { t, languageHeader } = useI18n();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [compCode, setCompCode] = useState('');
  const [compName, setCompName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('platform_token');

  useEffect(() => {
    if (!token) {
      navigate('/platform/login');
      return;
    }

    void loadCompanies();
  }, [token, navigate]);

  async function loadCompanies() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/platform/companies', {
        headers: { Authorization: `Bearer ${token}`, ...languageHeader },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('platform_token');
        navigate('/platform/login');
        return;
      }
      const data = await res.json();
      setCompanies(data.data.items ?? []);
    } catch {
      setError(t('platform.tenants.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function createTenant(e: FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/v1/platform/companies', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...languageHeader,
      },
      body: JSON.stringify({ compCode, compName }),
    });

    if (!res.ok) {
      setError(t('platform.tenants.createFailed'));
      return;
    }

    setCompCode('');
    setCompName('');
    await loadCompanies();
  }

  function logout() {
    localStorage.removeItem('platform_token');
    navigate('/platform/login');
  }

  return (
    <div className="platform-page">
      <header className="platform-header">
        <h1>{t('platform.tenants.title')}</h1>
        <div className="header-actions">
          <LanguageSwitcher />
          <Link to="/login" className="muted-link">
            {t('platform.tenants.tenantLogin')}
          </Link>
          <button type="button" onClick={logout}>
            {t('common.logout')}
          </button>
        </div>
      </header>

      <section className="platform-card">
        <h2>{t('platform.tenants.createTitle')}</h2>
        <form className="inline-form" onSubmit={createTenant}>
          <input
            placeholder={t('platform.tenants.compCodePlaceholder')}
            value={compCode}
            onChange={(e) => setCompCode(e.target.value.toUpperCase())}
          />
          <input
            placeholder={t('platform.tenants.compNamePlaceholder')}
            value={compName}
            onChange={(e) => setCompName(e.target.value)}
          />
          <button type="submit">{t('common.create')}</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="platform-card">
        <h2>{t('platform.tenants.existingTitle')}</h2>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : (
          <table className="tenant-table">
            <thead>
              <tr>
                <th>{t('platform.tenants.code')}</th>
                <th>{t('platform.tenants.name')}</th>
                <th>{t('platform.tenants.timezone')}</th>
                <th>{t('platform.tenants.status')}</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.compCode}>
                  <td>{company.compCode}</td>
                  <td>{company.compName}</td>
                  <td>{company.timezone}</td>
                  <td>{company.active ? t('platform.tenants.active') : t('platform.tenants.inactive')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
