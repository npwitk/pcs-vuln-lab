import React from 'react';
import styled, { useTheme } from 'styled-components';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

const formatDateLabel = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ChartTooltip = ({ active, payload, label, theme }) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0].payload;

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
        {formatDateLabel(label)}
      </div>
      <div style={{ color: theme.colors.text, fontWeight: theme.typography.weights.semibold }}>
        {point.cumulative_users} total user{point.cumulative_users === 1 ? '' : 's'}
      </div>
      <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.sizes.sm }}>
        {point.new_users > 0 ? `+${point.new_users} that day` : 'No signups that day'}
      </div>
    </div>
  );
};

const UserSignupsChart = ({ data }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return <EmptyState>No signups yet — the chart will fill in once users start joining.</EmptyState>;
  }

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid stroke={theme.colors.borderLight} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tick={{ fill: theme.colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: theme.colors.border }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: theme.colors.textSecondary, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            content={(props) => <ChartTooltip {...props} theme={theme} />}
            cursor={{ stroke: theme.colors.primary, strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Line
            type="monotone"
            dataKey="cumulative_users"
            stroke={theme.colors.primary}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default UserSignupsChart;
