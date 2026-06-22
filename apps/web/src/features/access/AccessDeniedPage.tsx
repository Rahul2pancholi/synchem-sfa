import { Link } from 'react-router-dom';
import { Button, Result } from 'antd';
import { ROLE_DASHBOARD_ROUTES } from '@synchem-sfa/shared-types';
import type { ReactNode } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { useI18n } from '../../i18n/I18nProvider';

export function AccessDeniedPage() {
  const { t } = useI18n();
  const roleType = localStorage.getItem('roleType') ?? 'AD';
  const home = ROLE_DASHBOARD_ROUTES[roleType as keyof typeof ROLE_DASHBOARD_ROUTES] ?? '/app';

  return (
    <Result
      status="403"
      title={t('access.denied.title')}
      subTitle={t('access.denied.message')}
      extra={
        <Link to={home}>
          <Button type="primary">{t('access.denied.back')}</Button>
        </Link>
      }
    />
  );
}

export function RequireMenuView({ menuCode, children }: { menuCode: string; children: ReactNode }) {
  const allowed = usePermission(menuCode, 'view');
  if (!allowed) return <AccessDeniedPage />;
  return <>{children}</>;
}
