import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
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
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!res.ok) {
        setError('Invalid username, password, or company code');
        return;
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('roleType', data.roleType);
      localStorage.setItem('compCode', data.compCode);
      localStorage.setItem('employeeObj', data.employeeObj);
      navigate('/app');
    } catch {
      setError('Unable to connect to API. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Synchem SFA</h1>
        <p className="subtitle">Pharma Sales Force Automation</p>
        <label>
          User Name
          <input value={userName} onChange={(e) => setUserName(e.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          Company Code
          <input value={compCode} onChange={(e) => setCompCode(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
