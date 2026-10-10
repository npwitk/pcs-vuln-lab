import React from 'react';
import styled, { useTheme } from 'styled-components';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const ChartWrapper = styled.div`
  width: 100%;
  height: 320px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const formatBaht = (value) =>
  `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ฿`;

const formatMonthLabel = (month) => {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

const ChartTooltip = ({ active, payload, label, theme }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: theme.colors.surfaceElevated,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        padding: '0.75rem 1rem',
        boxShadow: theme.shadows.md,
      }}
    >
      <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.sizes.sm, marginBottom: '0.25rem' }}>
        {formatMonthLabel(label)}
      </div>
      <div style={{ color: theme.colors.text, fontWeight: theme.typography.weights.semibold }}>
        {formatBaht(payload[0].value)}
      </div>
      <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.sizes.sm }}>
        {payload[0].payload.purchases} purchase{payload[0].payload.purchases === 1 ? '' : 's'}
      </div>
    </div>
  );
};

const RevenueChart = ({ data, emptyMessage = 'No completed purchases yet — the chart will fill in once payments start coming in.' }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid stroke={theme.colors.borderLight} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonthLabel}
            tick={{ fill: theme.colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: theme.colors.border }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: theme.colors.textSecondary, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={70}
            tickFormatter={(value) => `฿${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)}`}
          />
          <Tooltip
            content={(props) => <ChartTooltip {...props} theme={theme} />}
            cursor={{ fill: theme.colors.backgroundSecondary }}
          />
          <Bar dataKey="revenue" fill={theme.colors.primary} radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default RevenueChart;
