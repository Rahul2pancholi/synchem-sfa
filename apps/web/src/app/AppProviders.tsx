import { ConfigProvider, theme as antTheme } from 'antd';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { sfaTheme, sfaDarkTheme } from '../theme/sfa-theme';
import { ThemeProvider, useTheme } from './ThemeProvider';

function AntdConfigProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const resolvedTheme = theme === 'dark'
    ? { ...sfaDarkTheme, algorithm: antTheme.darkAlgorithm }
    : sfaTheme;
  return <ConfigProvider theme={resolvedTheme}>{children}</ConfigProvider>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AntdConfigProvider>{children}</AntdConfigProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
