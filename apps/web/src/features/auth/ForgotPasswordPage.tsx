import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

type Step = 'request' | 'verify' | 'reset' | 'done';

export function ForgotPasswordPage() {
  const { t, languageHeader } = useI18n();
  const [step, setStep] = useState<Step>('request');
  const [userName, setUserName] = useState('');
  const [compCode, setCompCode] = useState('SYN');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...languageHeader },
        body: JSON.stringify({ userName, compCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? t('auth.forgot.otpRequestFailed'));
        return;
      }
      setMessage(t('auth.forgot.otpSent'));
      setStep('verify');
    } catch {
      setError(t('auth.login.apiError'));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...languageHeader },
        body: JSON.stringify({ userName, compCode, otp }),
      });
      if (!res.ok) {
        setError(t('auth.forgot.otpInvalid'));
        return;
      }
      setStep('reset');
    } catch {
      setError(t('auth.login.apiError'));
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...languageHeader },
        body: JSON.stringify({ userName, compCode, otp, newPassword }),
      });
      if (!res.ok) {
        setError(t('auth.forgot.resetFailed'));
        return;
      }
      setMessage(t('auth.forgot.passwordUpdated'));
      setStep('done');
    } catch {
      setError(t('auth.login.apiError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card">
        <LanguageSwitcher className="language-switcher top-right" />
        <h1>{t('auth.forgot.title')}</h1>
        <p className="subtitle">{t('auth.forgot.policy')}</p>

        {step === 'request' && (
          <>
            <label>
              {t('auth.forgot.userName')}
              <input value={userName} onChange={(e) => setUserName(e.target.value)} />
            </label>
            <label>
              {t('auth.forgot.compCode')}
              <input value={compCode} onChange={(e) => setCompCode(e.target.value)} />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="button" disabled={loading} onClick={requestOtp}>
              {loading ? t('auth.forgot.sendingOtp') : t('auth.forgot.sendOtp')}
            </button>
          </>
        )}

        {step === 'verify' && (
          <>
            {message && <p className="success">{message}</p>}
            <label>
              {t('auth.forgot.otp')}
              <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="button" disabled={loading} onClick={verifyOtp}>
              {loading ? t('auth.forgot.verifyingOtp') : t('auth.forgot.verifyOtp')}
            </button>
          </>
        )}

        {step === 'reset' && (
          <>
            <label>
              {t('auth.forgot.newPassword')}
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="button" disabled={loading} onClick={resetPassword}>
              {loading ? t('auth.forgot.savingPassword') : t('auth.forgot.resetPassword')}
            </button>
          </>
        )}

        {step === 'done' && (
          <>
            <p className="success">{message}</p>
            <Link to="/login">{t('common.backToLogin')}</Link>
          </>
        )}

        {step !== 'done' && (
          <p className="link-row">
            <Link to="/login">{t('common.backToLogin')}</Link>
          </p>
        )}
      </form>
    </div>
  );
}
