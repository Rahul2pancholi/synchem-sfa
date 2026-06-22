import { ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { sfaTheme } from '../theme/sfa-theme';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={sfaTheme}>{children}</ConfigProvider>
    </QueryClientProvider>
  );
}
