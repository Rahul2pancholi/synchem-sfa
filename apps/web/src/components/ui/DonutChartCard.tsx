import { Card, Spin } from 'antd';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartCardProps {
  title: string;
  data: DonutItem[];
  loading?: boolean;
  height?: number;
}

export function DonutChartCard({ title, data, loading = false, height = 240 }: DonutChartCardProps) {
  const nonZero = data.filter((d) => d.value > 0);

  return (
    <Card title={title} className="page-section" style={{ height: '100%' }}>
      <Spin spinning={loading}>
        {nonZero.length === 0 ? (
          <div
            style={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#52c41a',
              fontWeight: 600,
            }}
          >
            All clear ✓
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={nonZero}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {nonZero.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [value]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend
                iconType="circle"
                iconSize={10}
                formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Spin>
    </Card>
  );
}
