export function DashboardHome({ title }: { title: string }) {
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? JSON.parse(employeeRaw) : null;

  return (
    <section className="welcome">
      <h3>{title}</h3>
      <p>
        Welcome, <strong>{employee?.firstName ?? 'User'}</strong>. Phase 0 shell is ready — masters
        start in Phase 1.
      </p>
    </section>
  );
}
