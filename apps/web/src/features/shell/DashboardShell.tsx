import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Grid, Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

const { Header, Sider, Content } = Layout;

interface LegacyMenuItem {
  MenuId: string;
  MenuCode: string;
  MenuName: string;
  MenuUrl: string | null;
  MenuBehaviour: 'FOLDER' | 'FILE';
  ChildMenus: LegacyMenuItem[] | null;
}

function menuHref(menuUrl: string | null): string | null {
  if (!menuUrl) return null;
  return menuUrl.replace(/^#\//, '/');
}

function toMenuItems(items: LegacyMenuItem[]): NonNullable<MenuProps['items']> {
  return items.map((item) => {
    const href = item.MenuBehaviour === 'FILE' ? menuHref(item.MenuUrl) : null;
    const children = item.ChildMenus?.length ? toMenuItems(item.ChildMenus) : undefined;

    if (href) {
      return {
        key: href,
        label: <Link to={href}>{item.MenuName}</Link>,
      };
    }

    return {
      key: item.MenuCode,
      label: item.MenuName,
      children,
    };
  });
}

function findOpenKeysForPath(
  items: LegacyMenuItem[],
  pathname: string,
  trail: string[] = [],
): string[] | null {
  for (const item of items) {
    const href = item.MenuBehaviour === 'FILE' ? menuHref(item.MenuUrl) : null;
    if (href === pathname) return trail;
    if (item.ChildMenus?.length) {
      const nested = findOpenKeysForPath(item.ChildMenus, pathname, [...trail, item.MenuCode]);
      if (nested) return nested;
    }
  }
  return null;
}

function SidebarNav({
  menuItems,
  pathname,
  openKeys,
  onOpenChange,
  onNavigate,
}: {
  menuItems: NonNullable<MenuProps['items']>;
  pathname: string;
  openKeys: string[];
  onOpenChange: (keys: string[]) => void;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();
  const compCode = localStorage.getItem('compCode') ?? '';
  const compName = localStorage.getItem('compName') ?? compCode;

  return (
    <>
      <div className="app-sider__brand">
        <Typography.Text strong className="app-sider__brand-title">
          {t('shell.brand')}
        </Typography.Text>
        <Typography.Paragraph className="app-sider__brand-meta">
          {compName}
          <br />
          {compCode}
        </Typography.Paragraph>
      </div>
      {menuItems.length === 0 ? (
        <Typography.Text type="secondary" style={{ padding: 16, display: 'block' }}>
          {t('shell.noMenus')}
        </Typography.Text>
      ) : (
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          items={menuItems}
          style={{ borderInlineEnd: 0 }}
          onClick={onNavigate}
        />
      )}
    </>
  );
}

function openKeysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((key, i) => key === b[i]);
}

function mergeOpenKeys(prev: string[], pathKeys: string[]): string[] {
  if (pathKeys.length === 0) return prev;
  const merged = Array.from(new Set([...prev, ...pathKeys]));
  return openKeysEqual(merged, prev) ? prev : merged;
}

export function DashboardShell() {
  const { t } = useI18n();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const compCode = localStorage.getItem('compCode') ?? '';
  const compName = localStorage.getItem('compName') ?? compCode;
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? JSON.parse(employeeRaw) : null;
  const menuRaw = localStorage.getItem('menuList') ?? '';
  const menus = useMemo<LegacyMenuItem[]>(
    () => (menuRaw ? JSON.parse(menuRaw) : []),
    [menuRaw],
  );
  const menuItems = useMemo(() => toMenuItems(menus), [menus]);
  const [openKeys, setOpenKeys] = useState<string[]>(() =>
    findOpenKeysForPath(menus, location.pathname) ?? [],
  );

  useEffect(() => {
    const pathKeys = findOpenKeysForPath(menus, location.pathname) ?? [];
    setOpenKeys((prev) => mergeOpenKeys(prev, pathKeys));
  }, [location.pathname, menuRaw, menus]);

  function logout() {
    const language = localStorage.getItem('appLanguage');
    localStorage.clear();
    if (language) localStorage.setItem('appLanguage', language);
    window.location.href = '/login';
  }

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <Layout className="app-layout" hasSider={!isMobile}>
      {!isMobile && (
        <Sider width={260} className="app-sider" breakpoint="lg" collapsedWidth={0}>
          <SidebarNav
            menuItems={menuItems}
            pathname={location.pathname}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
          />
        </Sider>
      )}

      <Layout className="app-layout__main">
        <Header className="app-header">
          <div className="app-header__left">
            {isMobile ? (
              <Button
                type="text"
                aria-label={t('shell.openMenu')}
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
              />
            ) : null}
            <div className="app-header__titles">
              <Typography.Title level={4} className="app-header__title">
                {compName}
              </Typography.Title>
              <span className="app-header__meta">
                {employee?.firstName} {employee?.lastName ?? ''} · {employee?.roleName}
              </span>
            </div>
          </div>
          <div className="app-header__actions">
            <LanguageSwitcher />
            <Button icon={<LogoutOutlined />} onClick={logout}>
              {!isMobile ? t('common.logout') : null}
            </Button>
          </div>
        </Header>

        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>

      {isMobile ? (
        <Drawer
          title={t('shell.brand')}
          placement="left"
          size={280}
          open={drawerOpen}
          onClose={closeDrawer}
          styles={{ body: { padding: 0, background: '#0f172a' } }}
          className="app-drawer"
        >
          <SidebarNav
            menuItems={menuItems}
            pathname={location.pathname}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onNavigate={closeDrawer}
          />
        </Drawer>
      ) : null}
    </Layout>
  );
}
