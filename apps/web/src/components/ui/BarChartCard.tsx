import { Card, Spin } from 'antd';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const HEALTH_COLORS = {
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  default: '#0891b2',
};

function barColor(value: number, goodMin = 80, warnMin = 60): string {
  if (value >= goodMin) return HEALTH_COLORS.success;
  if (value >= warnMin) return HEALTH_COLORS.warning;
  return HEALTH_COLORS.error;
}

interface BarChartItem {
  name: string;
  value: number;
}

interface BarChartCardProps {
  title: string;
  data: BarChartItem[];
  loading?: boolean;
  unit?: string;
  goodMin?: number;
  warnMin?: number;
  height?: number;
  coloredBars?: boolean;
  singleColor?: string;
}

export function BarChartCard({
  title,
  data,
  loading = false,
  unit = '%',
  goodMin = 80,
  warnMin = 60,
  height = 240,
  coloredBars = true,
  singleColor,
}: BarChartCardProps) {
  const truncate = (name: string) => (name.length > 12 ? `${name.slice(0, 11)}…` : name);

  return (
    <Card title={title} className="page-section" style={{ height: '100%' }}>
      <Spin spinning={loading}>
        {data.length === 0 ? (
          <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            No data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}${unit}`}
                tick={{ fontSize: 11 }}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 12 }}
                tickFormatter={truncate}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value}${unit}`, title]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {data.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={singleColor ?? (coloredBars ? barColor(entry.value, goodMin, warnMin) : HEALTH_COLORS.default)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Spin>
    </Card>
  );
}
