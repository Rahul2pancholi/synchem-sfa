import { Typography } from 'antd';
import type { ReactNode } from 'react';

export function PageLayout({
  title,
  subtitle,
  extra,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="page-layout">
      <header className="page-layout__header">
        <div className="page-layout__titles">
          <Typography.Title level={3} className="page-layout__title">
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Text type="secondary" className="page-layout__subtitle">
              {subtitle}
            </Typography.Text>
          ) : null}
        </div>
        {extra ? <div className="page-layout__extra">{extra}</div> : null}
      </header>
      <div className="page-layout__body">{children}</div>
    </div>
  );
}
