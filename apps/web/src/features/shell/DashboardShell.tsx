import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Space, theme } from 'antd';
import type { MenuProps } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
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

export function DashboardShell() {
  const { t } = useI18n();
  const location = useLocation();
  const { token } = theme.useToken();
  const compCode = localStorage.getItem('compCode') ?? '';
  const compName = localStorage.getItem('compName') ?? compCode;
  const employeeRaw = localStorage.getItem('employeeObj');
  const employee = employeeRaw ? JSON.parse(employeeRaw) : null;
  const menuRaw = localStorage.getItem('menuList');
  const menus: LegacyMenuItem[] = menuRaw ? JSON.parse(menuRaw) : [];
  const menuItems = toMenuItems(menus);

  function logout() {
    const language = localStorage.getItem('appLanguage');
    localStorage.clear();
    if (language) localStorage.setItem('appLanguage', language);
    window.location.href = '/login';
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={260} theme="dark" style={{ background: '#001529' }}>
        <div style={{ padding: '16px 16px 8px' }}>
          <Typography.Text strong style={{ color: '#fff', fontSize: 16 }}>
            {t('shell.brand')}
          </Typography.Text>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, margin: '4px 0 0', fontSize: 12 }}>
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
            selectedKeys={[location.pathname]}
            defaultOpenKeys={menus.map((m) => m.MenuCode)}
            items={menuItems}
            style={{ borderInlineEnd: 0 }}
          />
        )}
      </Sider>
      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {compName}
            </Typography.Title>
            <Typography.Text type="secondary">
              {employee?.firstName} {employee?.lastName ?? ''} · {employee?.roleName}
            </Typography.Text>
          </div>
          <Space>
            <LanguageSwitcher />
            <Button icon={<LogoutOutlined />} onClick={logout}>
              {t('common.logout')}
            </Button>
          </Space>
        </Header>
        <Content style={{ padding: 24, background: '#f5f5f5', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
