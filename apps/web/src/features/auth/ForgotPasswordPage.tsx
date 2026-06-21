import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

const PASSWORD_POLICY_MESSAGE =
  'Password must be 8–15 characters and include a number and special character (!@#$%^&*).';

type Step = 'request' | 'verify' | 'reset' | 'done';

export function ForgotPasswordPage() {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, compCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Unable to request OTP');
        return;
      }
      setMessage(data.data.message);
      setStep('verify');
    } catch {
      setError('Unable to connect to API');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, compCode, otp }),
      });
      if (!res.ok) {
        setError('Invalid or expired OTP');
        return;
      }
      setStep('reset');
    } catch {
      setError('Unable to connect to API');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, compCode, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? PASSWORD_POLICY_MESSAGE);
        return;
      }
      setMessage(data.data.message);
      setStep('done');
    } catch {
      setError('Unable to connect to API');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card">
        <h1>Forgot Password</h1>
        <p className="subtitle">{PASSWORD_POLICY_MESSAGE}</p>

        {step === 'request' && (
          <>
            <label>
              User Name
              <input value={userName} onChange={(e) => setUserName(e.target.value)} />
            </label>
            <label>
              Company Code
              <input value={compCode} onChange={(e) => setCompCode(e.target.value)} />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="button" disabled={loading} onClick={requestOtp}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </>
        )}

        {step === 'verify' && (
          <>
            {message && <p className="success">{message}</p>}
            <label>
              OTP
              <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="button" disabled={loading} onClick={verifyOtp}>
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
          </>
        )}

        {step === 'reset' && (
          <>
            <label>
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="button" disabled={loading} onClick={resetPassword}>
              {loading ? 'Saving…' : 'Reset Password'}
            </button>
          </>
        )}

        {step === 'done' && (
          <>
            <p className="success">{message}</p>
            <Link to="/login">Back to login</Link>
          </>
        )}

        {step !== 'done' && (
          <p className="link-row">
            <Link to="/login">Back to login</Link>
          </p>
        )}
      </form>
    </div>
  );
}
