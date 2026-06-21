import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROLE_DASHBOARD_ROUTES } from '@synchem-sfa/shared-types';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

export function LoginPage() {
  const navigate = useNavigate();
  const { t, languageHeader } = useI18n();
  const [userName, setUserName] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [compCode, setCompCode] = useState('SYN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const body = new URLSearchParams({
      grant_type: 'password',
      username: `${userName},${compCode}`,
      password,
    });

    try {
      const res = await fetch('/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...languageHeader,
        },
        body,
      });

      if (!res.ok) {
        setError(t('auth.login.invalidCredentials'));
        return;
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('roleType', data.roleType);
      localStorage.setItem('compCode', data.compCode);
      localStorage.setItem('compName', data.compName);
      localStorage.setItem('employeeObj', data.employeeObj);
      localStorage.setItem('menuList', data.menuList ?? '[]');
      localStorage.setItem('configurationSetting', data.configurationSetting ?? '{}');

      const home = ROLE_DASHBOARD_ROUTES[data.roleType] ?? '/app';
      navigate(home);
    } catch {
      setError(t('auth.login.apiError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <LanguageSwitcher className="language-switcher top-right" />
        <h1>{t('auth.login.title')}</h1>
        <p className="subtitle">{t('auth.login.subtitle')}</p>
        <label>
          {t('auth.login.userName')}
          <input value={userName} onChange={(e) => setUserName(e.target.value)} />
        </label>
        <label>
          {t('auth.login.password')}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          {t('auth.login.compCode')}
          <input value={compCode} onChange={(e) => setCompCode(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? t('common.signingIn') : t('common.signIn')}
        </button>
        <p className="link-row">
          <Link to="/forgot-password">{t('auth.login.forgotPassword')}</Link>
        </p>
      </form>
    </div>
  );
}
