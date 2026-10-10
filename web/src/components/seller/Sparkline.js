import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, YAxis } from 'recharts';

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;

const Figure = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 3.5rem;
`;

const Total = styled.span`
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
`;

const Trend = styled.span`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
`;

/**
 * The last 30 days of sales for one sheet: a tiny line (no axes, no
 * tooltip) plus the number it summarises, so the value never depends on
 * reading the line. The arrow compares the latest 15 days with the 15 before.
 */
export default function Sparkline({ values, color, totalLabel, trendLabels }) {
  const data = values.map((v, i) => ({ i, v }));
  const total = values.reduce((a, b) => a + b, 0);
  const half = Math.floor(values.length / 2);
  const before = values.slice(0, half).reduce((a, b) => a + b, 0);
  const after = values.slice(half).reduce((a, b) => a + b, 0);
  const trend = total === 0 ? null : after > before ? 'up' : after < before ? 'down' : 'flat';

  return (
    <Wrap>
      <LineChart width={88} height={28} data={data} margin={{ top: 3, right: 2, bottom: 3, left: 2 }} aria-hidden="true">
        <YAxis hide domain={[0, (max) => Math.max(1, max)]} />
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
      <Figure>
        <Total>{totalLabel(total)}</Total>
        {trend && <Trend>{trendLabels[trend]}</Trend>}
      </Figure>
    </Wrap>
  );
}
