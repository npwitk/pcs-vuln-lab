import React, { useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { LINE_LIMIT, seriesColor, mutedColor, chromeColors } from './chartPalette';
import { baht } from '../../utils/money';

const Card = styled.section`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1.25rem 1.25rem 1rem;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const Heading = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
`;

export const Segmented = styled.div`
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.borderLight};
  border-radius: ${props => props.theme.radius.md};
`;

export const SegmentButton = styled.button`
  border: none;
  background: ${props => props.$active ? props.theme.colors.surface : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.text : props.theme.colors.textSecondary};
  box-shadow: ${props => props.$active ? props.theme.shadows.sm : 'none'};
  font: inherit;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.$active ? props.theme.typography.weights.semibold : props.theme.typography.weights.medium};
  padding: 0.3125rem 0.75rem;
  border-radius: ${props => props.theme.radius.sm};
  cursor: pointer;
  white-space: nowrap;
`;

const Controls = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

// Plot plus x-axis band, so the axis labels are inside the fixed height.
const Plot = styled.div`
  width: 100%;
  height: 280px;
`;

const Legend = styled.ul`
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
`;

const LegendItem = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 100%;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: ${props => props.theme.radius.sm};
  background: none;
  font: inherit;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  opacity: ${props => props.$hidden ? 0.45 : 1};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

// Line key: a short stroke in the series colour (dashed for Others).
const Key = styled.span`
  width: 14px;
  height: 0;
  border-top: 2px ${props => props.$dashed ? 'dashed' : 'solid'} ${props => props.$color};
  flex-shrink: 0;
`;

const LegendName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 16rem;
  color: ${props => props.theme.colors.text};
`;

const LegendValue = styled.span`
  font-variant-numeric: tabular-nums;
`;

const Empty = styled.div`
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${props => props.theme.typography.sizes.sm};

  th, td {
    padding: 0.5rem 0.625rem;
    text-align: right;
    border-bottom: 1px solid ${props => props.theme.colors.borderLight};
    font-variant-numeric: tabular-nums;
  }
  th:first-child, td:first-child {
    text-align: left;
  }
  th {
    color: ${props => props.theme.colors.textSecondary};
    font-weight: ${props => props.theme.typography.weights.medium};
  }
  td {
    color: ${props => props.theme.colors.text};
  }
`;

const TableScroll = styled.div`
  max-height: 320px;
  overflow: auto;
`;

const TooltipBox = styled.div`
  background: ${props => props.theme.colors.surfaceElevated || props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  box-shadow: ${props => props.theme.shadows.md};
  padding: 0.625rem 0.75rem;
  min-width: 11rem;
  max-width: 18rem;
`;

const TooltipDate = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.375rem;
`;

const TooltipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  line-height: 1.6;

  strong {
    font-variant-numeric: tabular-nums;
    color: ${props => props.theme.colors.text};
  }
  span {
    color: ${props => props.theme.colors.textSecondary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const METRICS = ['sales', 'earnings', 'views'];

const OTHERS = 'others';

const shortDate = (iso, lang) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' });

/**
 * One line per cheat sheet over the selected range.
 *
 * - The top five sheets by the chosen metric (among those with a colour
 *   slot) get their own line; everything else is summed into a dashed
 *   "Others" line, so the chart never has more than six lines.
 * - Colours come from each sheet's fixed slot (see assignSlots), so switching
 *   metric or range never repaints a sheet.
 * - Legend entries toggle their line and show the range total as text; the
 *   Table view lists every sheet's numbers without needing the chart.
 */
export default function SalesTrendChart({ days, sheets, series, metric, onMetricChange, formatValue, rangeLabel }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const mode = theme.mode === 'dark' ? 'dark' : 'light';
  const chrome = chromeColors(mode);
  const [view, setView] = useState('chart');
  const [hidden, setHidden] = useState(() => new Set());

  const model = useMemo(() => {
    const totals = sheets.map(s => ({
      ...s,
      values: series[s.id]?.[metric] || days.map(() => 0),
    })).map(s => ({ ...s, total: s.values.reduce((a, b) => a + b, 0) }));

    const lines = totals
      .filter(s => s.slot != null && s.total > 0)
      .sort((a, b) => b.total - a.total || a.slot - b.slot)
      .slice(0, LINE_LIMIT);
    const lineIds = new Set(lines.map(l => l.id));
    const rest = totals.filter(s => !lineIds.has(s.id));
    const othersValues = days.map((_, i) => rest.reduce((sum, s) => sum + s.values[i], 0));
    const othersTotal = othersValues.reduce((a, b) => a + b, 0);

    const keys = [
      ...lines.map(l => ({ key: String(l.id), name: l.title, color: seriesColor(mode, l.slot), total: l.total, values: l.values })),
      ...(othersTotal > 0 ? [{
        key: OTHERS,
        name: t('sellerSheets.chart.others', { count: rest.filter(s => s.total > 0).length }),
        color: mutedColor(mode),
        total: othersTotal,
        values: othersValues,
        dashed: true,
      }] : []),
    ];
    const data = days.map((day, i) => {
      const row = { day };
      keys.forEach(k => { row[k.key] = k.values[i]; });
      return row;
    });
    return { keys, data, totals, grand: totals.reduce((a, s) => a + s.total, 0) };
  }, [sheets, series, metric, days, mode, t]);

  const toggle = (key) => setHidden(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const rows = payload
      .filter(p => !hidden.has(p.dataKey))
      .sort((a, b) => b.value - a.value);
    return (
      <TooltipBox>
        <TooltipDate>{shortDate(label, i18n.language)}</TooltipDate>
        {rows.map(p => {
          const k = model.keys.find(key => key.key === p.dataKey);
          return (
            <TooltipRow key={p.dataKey}>
              <Key $color={k?.color} $dashed={k?.dashed} />
              <strong>{formatValue(p.value)}</strong>
              <span>{k?.name}</span>
            </TooltipRow>
          );
        })}
      </TooltipBox>
    );
  };

  const tickEvery = Math.max(1, Math.ceil(days.length / 7));

  return (
    <Card aria-label={t('sellerSheets.chart.title')}>
      <Top>
        <Heading>{t(`sellerSheets.chart.heading.${metric}`, { range: rangeLabel })}</Heading>
        <Controls>
          <Segmented role="tablist" aria-label={t('sellerSheets.chart.metricLabel')}>
            {METRICS.map(m => (
              <SegmentButton key={m} type="button" role="tab" aria-selected={metric === m} $active={metric === m} onClick={() => onMetricChange(m)}>
                {t(`sellerSheets.metrics.${m}`)}
              </SegmentButton>
            ))}
          </Segmented>
          <Segmented role="tablist" aria-label={t('sellerSheets.chart.viewLabel')}>
            {['chart', 'table'].map(v => (
              <SegmentButton key={v} type="button" role="tab" aria-selected={view === v} $active={view === v} onClick={() => setView(v)}>
                {t(`sellerSheets.chart.${v}`)}
              </SegmentButton>
            ))}
          </Segmented>
        </Controls>
      </Top>

      {view === 'table' ? (
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <th>{t('sellerSheets.chart.sheet')}</th>
                <th>{t('sellerSheets.metrics.sales')}</th>
                <th>{t('sellerSheets.metrics.earnings')}</th>
                <th>{t('sellerSheets.metrics.views')}</th>
              </tr>
            </thead>
            <tbody>
              {[...sheets]
                .map(s => ({ s, sum: (m) => (series[s.id]?.[m] || []).reduce((a, b) => a + b, 0) }))
                .sort((a, b) => b.sum(metric) - a.sum(metric))
                .map(({ s, sum }) => (
                  <tr key={s.id}>
                    <td>{s.title}</td>
                    <td>{sum('sales')}</td>
                    <td>{baht(sum('earnings'))}</td>
                    <td>{sum('views')}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </TableScroll>
      ) : model.grand === 0 ? (
        <Empty>{t(`sellerSheets.chart.empty.${metric}`, { range: rangeLabel })}</Empty>
      ) : (
        <>
          <Plot>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={model.data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={chrome.grid} />
                <XAxis
                  dataKey="day"
                  tickFormatter={(d) => shortDate(d, i18n.language)}
                  interval={tickEvery - 1}
                  tick={{ fill: chrome.axis, fontSize: 12 }}
                  axisLine={{ stroke: chrome.grid }}
                  tickLine={false}
                  minTickGap={12}
                />
                <YAxis
                  allowDecimals={metric === 'earnings'}
                  tickFormatter={(v) => formatValue(v, { compact: true })}
                  tick={{ fill: chrome.axis, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={renderTooltip} cursor={{ stroke: chrome.axis, strokeWidth: 1 }} />
                {model.keys.map(k => (
                  <Line
                    key={k.key}
                    type="monotone"
                    dataKey={k.key}
                    name={k.name}
                    stroke={k.color}
                    strokeWidth={2}
                    strokeDasharray={k.dashed ? '5 4' : undefined}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: theme.colors.surface }}
                    hide={hidden.has(k.key)}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Plot>
          <Legend>
            {model.keys.map(k => (
              <li key={k.key}>
                <LegendItem
                  type="button"
                  $hidden={hidden.has(k.key)}
                  aria-pressed={!hidden.has(k.key)}
                  onClick={() => toggle(k.key)}
                  title={k.name}
                >
                  <Key $color={k.color} $dashed={k.dashed} />
                  <LegendName>{k.name}</LegendName>
                  <LegendValue>{formatValue(k.total)}</LegendValue>
                </LegendItem>
              </li>
            ))}
          </Legend>
        </>
      )}
    </Card>
  );
}
