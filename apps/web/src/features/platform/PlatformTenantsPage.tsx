import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('platform_token');
        navigate('/platform/login');
        return;
      }
      const data = await res.json();
      setCompanies(data.data.items ?? []);
    } catch {
      setError('Failed to load tenants');
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
      },
      body: JSON.stringify({ compCode, compName }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Unable to create tenant');
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
        <h1>Tenant Management</h1>
        <div>
          <Link to="/login" className="muted-link">
            Tenant login
          </Link>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="platform-card">
        <h2>Create tenant</h2>
        <form className="inline-form" onSubmit={createTenant}>
          <input
            placeholder="Comp code (e.g. ACME)"
            value={compCode}
            onChange={(e) => setCompCode(e.target.value.toUpperCase())}
          />
          <input
            placeholder="Company name"
            value={compName}
            onChange={(e) => setCompName(e.target.value)}
          />
          <button type="submit">Create</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="platform-card">
        <h2>Existing tenants</h2>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <table className="tenant-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Timezone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.compCode}>
                  <td>{company.compCode}</td>
                  <td>{company.compName}</td>
                  <td>{company.timezone}</td>
                  <td>{company.active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
