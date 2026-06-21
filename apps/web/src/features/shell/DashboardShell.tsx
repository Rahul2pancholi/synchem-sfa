import { Link, Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

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

function menuHref(menuUrl: string | null): string | null {
  if (!menuUrl) {
    return null;
  }
  return menuUrl.replace(/^#\//, '/');
}

export function DashboardShell() {
  const { t } = useI18n();
  const compCode = localStorage.getItem('compCode') ?? '';
  const compName = localStorage.getItem('compName') ?? compCode;
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? JSON.parse(employeeRaw) : null;
  const menuRaw = localStorage.getItem('menuList');
  const menus: LegacyMenuItem[] = menuRaw ? JSON.parse(menuRaw) : [];
  const navItems = flattenMenus(menus);

  function logout() {
    const language = localStorage.getItem('appLanguage');
    localStorage.clear();
    if (language) {
      localStorage.setItem('appLanguage', language);
    }
    window.location.href = '/login';
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">{t('shell.brand')}</div>
        <div className="tenant">{compName}</div>
        <div className="tenant-code">{compCode}</div>
        <nav>
          {navItems.length === 0 ? (
            <div className="nav-item muted">{t('shell.noMenus')}</div>
          ) : (
            navItems.map(({ item, depth }) => {
              const href = item.MenuBehaviour === 'FILE' ? menuHref(item.MenuUrl) : null;
              return (
                <div
                  key={item.MenuId}
                  className={`nav-item ${item.MenuBehaviour === 'FILE' ? 'file' : 'folder'}`}
                  style={{ paddingLeft: `${12 + depth * 14}px` }}
                >
                  {href ? <Link to={href}>{item.MenuName}</Link> : item.MenuName}
                </div>
              );
            })
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
          <div className="header-actions">
            <LanguageSwitcher />
            <button type="button" onClick={logout}>
              {t('common.logout')}
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
