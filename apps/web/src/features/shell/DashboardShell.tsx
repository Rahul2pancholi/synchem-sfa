import { Outlet } from 'react-router-dom';

interface LegacyMenuItem {
  MenuId: string;
  MenuCode: string;
  MenuName: string;
  MenuUrl: string | null;
  MenuBehaviour: 'FOLDER' | 'FILE';
  ChildMenus: LegacyMenuItem[] | null;
}

function flattenMenus(items: LegacyMenuItem[], depth = 0): Array<{ item: LegacyMenuItem; depth: number }> {
  const rows: Array<{ item: LegacyMenuItem; depth: number }> = [];

  for (const item of items) {
    rows.push({ item, depth });
    if (item.ChildMenus?.length) {
      rows.push(...flattenMenus(item.ChildMenus, depth + 1));
    }
  }

  return rows;
}

export function DashboardShell() {
  const compCode = localStorage.getItem('compCode') ?? '';
  const compName = localStorage.getItem('compName') ?? compCode;
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? JSON.parse(employeeRaw) : null;
  const menuRaw = localStorage.getItem('menuList');
  const menus: LegacyMenuItem[] = menuRaw ? JSON.parse(menuRaw) : [];
  const navItems = flattenMenus(menus);

  function logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Synchem SFA</div>
        <div className="tenant">{compName}</div>
        <div className="tenant-code">{compCode}</div>
        <nav>
          {navItems.length === 0 ? (
            <div className="nav-item muted">No menus assigned</div>
          ) : (
            navItems.map(({ item, depth }) => (
              <div
                key={item.MenuId}
                className={`nav-item ${item.MenuBehaviour === 'FILE' ? 'file' : 'folder'}`}
                style={{ paddingLeft: `${12 + depth * 14}px` }}
              >
                {item.MenuName}
              </div>
            ))
          )}
        </nav>
      </aside>
      <main className="content">
        <header>
          <div>
            <h2>{compName}</h2>
            <p className="header-user">
              {employee?.firstName} {employee?.lastName ?? ''} · {employee?.roleName}
            </p>
          </div>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
