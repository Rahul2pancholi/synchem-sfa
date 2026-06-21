import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function PlatformLoginPage() {
  const navigate = useNavigate();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('Invalid platform credentials');
        return;
      }

      const data = await res.json();
      localStorage.setItem('platform_token', data.access_token);
      navigate('/platform/tenants');
    } catch {
      setError('Unable to connect to API');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Platform Admin</h1>
        <p className="subtitle">Super admin tenant management</p>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
