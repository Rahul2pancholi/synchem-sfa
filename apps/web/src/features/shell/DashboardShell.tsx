const ROLE_HOME: Record<string, string> = {
  AD: 'Management Dashboard',
  MAN: 'Manager Dashboard',
  FS: 'Field Staff Dashboard',
};

export function DashboardShell() {
  const roleType = localStorage.getItem('roleType') ?? 'AD';
  const compCode = localStorage.getItem('compCode') ?? '';
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? JSON.parse(employeeRaw) : null;

  function logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Synchem SFA</div>
        <div className="tenant">{compCode}</div>
        <nav>
          <div className="nav-item active">{ROLE_HOME[roleType] ?? 'Dashboard'}</div>
          <div className="nav-item muted">Master Setup (Phase 1)</div>
          <div className="nav-item muted">Transactions (Phase 2)</div>
          <div className="nav-item muted">Reports (Phase 5)</div>
        </nav>
      </aside>
      <main className="content">
        <header>
          <h2>{ROLE_HOME[roleType] ?? 'Dashboard'}</h2>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </header>
        <section className="welcome">
          <p>
            Welcome, <strong>{employee?.firstName ?? 'User'}</strong> — Phase 0 shell is
            ready. Masters and transactions come in Phase 1–2.
          </p>
        </section>
      </main>
    </div>
  );
}
