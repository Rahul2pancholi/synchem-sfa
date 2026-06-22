import { Card } from 'antd';
import type { ReactNode } from 'react';

export function PageSection({
  title,
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`page-section ${className ?? ''}`.trim()} title={title} variant="borderless">
      {children}
    </Card>
  );
}
