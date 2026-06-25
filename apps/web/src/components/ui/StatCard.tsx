import { InfoCircleOutlined } from '@ant-design/icons';
import { Card, Statistic, Tooltip } from 'antd';
import type { ReactNode, MouseEvent } from 'react';
import { Link } from 'react-router-dom';

function stopNav(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function StatTitle({ title, info }: { title: ReactNode; info?: string }) {
  if (!info) return <>{title}</>;

  return (
    <span className="stat-card__title">
      <span className="stat-card__title-text">{title}</span>
      <Tooltip title={info} trigger={['hover', 'focus', 'click']}>
        <button
          type="button"
          className="stat-card__info"
          aria-label={info}
          onClick={stopNav}
          onMouseDown={stopNav}
        >
          <InfoCircleOutlined />
        </button>
      </Tooltip>
    </span>
  );
}

export function StatCard({
  title,
  value,
  to,
  suffix,
  info,
  health,
}: {
  title: ReactNode;
  value: number | string;
  to?: string;
  suffix?: ReactNode;
  /** Simple-language help shown on info icon hover / tap */
  info?: string;
  /** Traffic-light border when KPI has a clear good/warn/bad state */
  health?: 'success' | 'warning' | 'error';
}) {
  const card = (
    <Card
      className={health ? `stat-card stat-card--${health}` : 'stat-card'}
      hoverable={Boolean(to)}
      variant="borderless"
    >
      <Statistic title={<StatTitle title={title} info={info} />} value={value} suffix={suffix} />
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
