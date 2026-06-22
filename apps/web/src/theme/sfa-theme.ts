import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

/** Synchem SFA — clean, modern, mobile-friendly Ant Design theme. */
export const sfaTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#0891b2',
    colorInfo: '#0891b2',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorBgLayout: '#f1f5f9',
    colorBgContainer: '#ffffff',
    colorBorderSecondary: '#e2e8f0',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    borderRadius: 10,
    borderRadiusLG: 12,
    fontFamily:
      "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    controlHeight: 40,
    controlHeightLG: 44,
  },
  components: {
    Layout: {
      siderBg: '#0f172a',
      headerBg: '#ffffff',
      bodyBg: '#f1f5f9',
    },
    Menu: {
      darkItemBg: '#0f172a',
      darkSubMenuItemBg: '#1e293b',
      itemHeight: 44,
    },
    Card: {
      paddingLG: 20,
    },
    Table: {
      headerBg: '#f8fafc',
      rowHoverBg: '#f0fdfa',
    },
    Button: {
      controlHeight: 40,
      paddingInline: 16,
    },
  },
};
