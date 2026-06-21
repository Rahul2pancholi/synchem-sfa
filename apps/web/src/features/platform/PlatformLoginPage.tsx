import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

export function PlatformLoginPage() {
  const navigate = useNavigate();
  const { t, languageHeader } = useI18n();
  const [email, setEmail] = useState('superadmin@synchem.co');
  const [password, setPassword] = useState('Platform@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/platform/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...languageHeader },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError(t('platform.login.invalidCredentials'));
        return;
      }

      const data = await res.json();
      localStorage.setItem('platform_token', data.access_token);
      navigate('/platform/tenants');
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
        <h1>{t('platform.login.title')}</h1>
        <p className="subtitle">{t('platform.login.subtitle')}</p>
        <label>
          {t('platform.login.email')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          {t('auth.login.password')}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? t('common.signingIn') : t('common.signIn')}
        </button>
      </form>
    </div>
  );
}
