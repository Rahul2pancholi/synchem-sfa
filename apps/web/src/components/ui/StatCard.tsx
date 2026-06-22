import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function StatCard({
  title,
  value,
  to,
  suffix,
}: {
  title: ReactNode;
  value: number;
  to?: string;
  suffix?: ReactNode;
}) {
  const card = (
    <Card className="stat-card" hoverable={Boolean(to)} variant="borderless">
      <Statistic title={title} value={value} suffix={suffix} />
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="stat-card-link">
        {card}
      </Link>
    );
  }

  return card;
}
