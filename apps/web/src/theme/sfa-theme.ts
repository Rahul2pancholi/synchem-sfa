import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

const sharedTokens: ThemeConfig['token'] = {
  colorPrimary: '#0891b2',
  colorInfo: '#0891b2',
  colorSuccess: '#059669',
  colorWarning: '#d97706',
  colorError: '#dc2626',
  borderRadius: 10,
  borderRadiusLG: 12,
  fontFamily:
    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSize: 14,
  controlHeight: 40,
  controlHeightLG: 44,
};

const sharedComponents: ThemeConfig['components'] = {
  Menu: {
    darkItemBg: '#0f172a',
    darkSubMenuItemBg: '#1e293b',
    itemHeight: 44,
  },
  Card: { paddingLG: 20 },
  Button: { controlHeight: 40, paddingInline: 16 },
};

/** Synchem SFA — clean, modern, mobile-friendly Ant Design theme. */
export const sfaTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...sharedTokens,
    colorBgLayout: '#f1f5f9',
    colorBgContainer: '#ffffff',
    colorBorderSecondary: '#e2e8f0',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
  },
  components: {
    ...sharedComponents,
    Layout: { siderBg: '#0f172a', headerBg: '#ffffff', bodyBg: '#f1f5f9' },
    Table: { headerBg: '#f8fafc', rowHoverBg: '#f0fdfa' },
  },
};

export const sfaDarkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...sharedTokens,
    colorPrimary: '#22d3ee',
    colorInfo: '#22d3ee',
    colorBgLayout: '#0f172a',
    colorBgContainer: '#1e293b',
    colorBorderSecondary: '#334155',
    colorText: '#f1f5f9',
    colorTextSecondary: '#94a3b8',
  },
  components: {
    ...sharedComponents,
    Layout: { siderBg: '#020617', headerBg: '#1e293b', bodyBg: '#0f172a' },
    Table: { headerBg: '#1e293b', rowHoverBg: '#0e7490' },
  },
};
