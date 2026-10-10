import React, { useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Download, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { sellerAPI } from '../../services/api';
import usePageMeta from '../../hooks/usePageMeta';
import { baht } from '../../utils/money';
import BankLogo, { localizedBankName } from '../../components/BankLogo';
import { seriesColor, chromeColors } from '../../components/seller/chartPalette';

// ---------------------------------------------------------------------------
// Layout

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: 600px) {
    padding: 1.25rem 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${props => props.theme.typography.sizes['3xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};

  @media (max-width: 600px) {
    font-size: ${props => props.theme.typography.sizes['2xl']};
  }
`;

const Subtitle = styled.p`
  margin: 0.25rem 0 0;
  color: ${props => props.theme.colors.textSecondary};
`;

const CrossLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Top = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: stretch;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1.25rem 1.5rem;
  min-width: 0;

  @media (max-width: 600px) {
    padding: 1.125rem 1rem;
  }
`;

const CardLabel = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const CardHeading = styled.h2`
  margin: 0 0 0.75rem;
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
`;

// The payout card stretches to match "Paid to" beside it; the breakdown
// is pinned to its bottom so any spare height sits above it, not below.
const HeroCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

// The one number this page leads with.
const Hero = styled.div`
  margin: 0.25rem 0 0.375rem;
  font-size: 3rem;
  line-height: 1.1;
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  letter-spacing: -0.02em;

  @media (max-width: 600px) {
    font-size: 2.5rem;
  }
`;

const HeroMeta = styled.div`
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const TONES = {
  light: { good: '#1F7A36' },
  dark: { good: '#4ADE74' },
};

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.1875rem 0.5625rem 0.1875rem 0.4375rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  white-space: nowrap;
  ${props => {
    if (props.$issued) {
      const c = TONES[props.theme.mode === 'dark' ? 'dark' : 'light'].good;
      return `color: ${c}; background: color-mix(in srgb, ${c} 12%, transparent);`;
    }
    return `color: ${props.theme.colors.textSecondary}; background: ${props.theme.colors.backgroundSecondary}; border: 1px solid ${props.theme.colors.borderLight};`;
  }}
`;

// The breakdown: one line per step from sales to payout.
const Breakdown = styled.dl`
  margin: auto 0 0;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight};
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.5rem 1rem;
  font-size: ${props => props.theme.typography.sizes.sm};

  dt {
    color: ${props => props.theme.colors.textSecondary};
  }
  dd {
    margin: 0;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: ${props => props.theme.colors.text};
  }
  small {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const TotalTerm = styled.dt`
  padding-top: 0.625rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text} !important;
  font-weight: ${props => props.theme.typography.weights.semibold};
`;

const TotalValue = styled.dd`
  padding-top: 0.625rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const BankRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

// The bank's name inside the hero sentence, with its logo just before it.
const InlineBank = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.medium};
  white-space: nowrap;
`;

const BankName = styled.div`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
`;

const BankDetail = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const SmallLink = styled(Link)`
  display: inline-block;
  margin-top: 0.875rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Note = styled.p`
  margin: 0.875rem 0 0;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

// Month table under the chart: one line per month, the selected one
// highlighted. Phones wrap the status under the month.
const MONTHS_PREVIEW = 4;

const MonthTable = styled.div`
  margin-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight};
`;

const MonthRow = styled.button`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 9rem 11rem 8rem;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.625rem 0.5rem;
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  border-radius: 0;
  background: ${props => props.$active ? props.theme.colors.backgroundSecondary : 'transparent'};
  font: inherit;
  font-size: ${props => props.theme.typography.sizes.sm};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas: "name amount" "sales status";
    row-gap: 0.25rem;
  }
`;

const MonthName = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.medium};
  white-space: nowrap;

  @media (max-width: 700px) { grid-area: name; }
`;

const MonthSales = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;

  @media (max-width: 700px) { grid-area: sales; font-size: ${props => props.theme.typography.sizes.xs}; }
`;

const MonthStatus = styled.span`
  @media (max-width: 700px) { grid-area: status; justify-self: end; }
`;

const MonthAmount = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  text-align: right;

  @media (max-width: 700px) { grid-area: amount; }
`;

const ShowAll = styled.button`
  margin-top: 0.625rem;
  padding: 0.25rem 0;
  border: none;
  background: none;
  font: inherit;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
`;

const StatementHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const StatementTitle = styled.h2`
  margin: 0 0.5rem;
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  min-width: 9rem;
  text-align: center;
`;

const DownloadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4375rem 0.875rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font: inherit;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatementSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.75rem;

  b {
    color: ${props => props.theme.colors.text};
    font-variant-numeric: tabular-nums;
  }
`;

// Desktop: the full table. Phones: a compact list with the payout on the
// right and the breakdown on a small line underneath, so the one number
// that matters is never scrolled off-screen.
const TableScroll = styled.div`
  overflow-x: auto;

  @media (max-width: 700px) {
    display: none;
  }
`;

const TxList = styled.ul`
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 700px) {
    display: block;
  }
`;

const TxItem = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.125rem 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const TxTitle = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.medium};
  overflow-wrap: anywhere;
`;

const TxPayout = styled.span`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-variant-numeric: tabular-nums;
  text-align: right;
`;

const TxSub = styled.span`
  grid-column: 1 / -1;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  font-variant-numeric: tabular-nums;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${props => props.theme.typography.sizes.sm};

  th, td {
    padding: 0.625rem 0.5rem;
    border-bottom: 1px solid ${props => props.theme.colors.borderLight};
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  th:nth-child(-n+2), td:nth-child(-n+2) {
    text-align: left;
  }
  th {
    font-weight: ${props => props.theme.typography.weights.medium};
    color: ${props => props.theme.colors.textSecondary};
  }
  td {
    color: ${props => props.theme.colors.text};
  }
  td.muted {
    color: ${props => props.theme.colors.textSecondary};
  }
  td.sheet {
    white-space: normal;
    min-width: 12rem;
  }
  td.sheet small {
    display: block;
    color: ${props => props.theme.colors.textSecondary};
  }
  td.payout {
    font-weight: ${props => props.theme.typography.weights.semibold};
  }
`;

const Caption = styled.p`
  margin: 0.75rem 0 0;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textTertiary};
`;

const Empty = styled.div`
  padding: 2rem 0.5rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const Bone = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.sm};
  height: ${props => props.$h || 14}px;
  width: ${props => props.$w || '100%'};
  margin: ${props => props.$m || 0};
`;

// ---------------------------------------------------------------------------

const locale = (lang) => (lang === 'th' ? 'th-TH' : 'en-GB');
const monthLabel = (year, month, lang) =>
  new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString(locale(lang), { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dayLabel = (iso, lang, opts = { day: 'numeric', month: 'short' }) =>
  new Date(iso).toLocaleDateString(locale(lang), { ...opts, timeZone: 'Asia/Bangkok' });

const shiftMonth = ({ year, month }, delta) => {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
};

// CSV with a BOM so Excel opens Thai titles correctly.
function downloadCsv(statement, t) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ['order_id', 'date', 'cheat_sheet', 'course', 'amount', 'discount_covered', 'commission', 'sponsorship', 'payout']
    .map(k => t(`payouts.csv.${k}`));
  const rows = statement.transactions.map(tx => [
    tx.order_id,
    new Date(tx.paid_at).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' }),
    tx.title,
    tx.course_code,
    tx.amount.toFixed(2),
    tx.discount_covered.toFixed(2),
    tx.commission.toFixed(2),
    tx.sponsorship.toFixed(2),
    tx.payout.toFixed(2),
  ]);
  const tt = statement.totals;
  rows.push([t('payouts.csv.total'), '', '', '', tt.collected.toFixed(2), tt.discount_covered.toFixed(2), tt.commission.toFixed(2), tt.sponsorship.toFixed(2), tt.payout.toFixed(2)]);
  const csv = '﻿' + [header, ...rows].map(r => r.map(esc).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `peanut-payout-${statement.year}-${String(statement.month).padStart(2, '0')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function PayoutBreakdown({ totals, commission, t }) {
  const rateNote = t(`payouts.rate.${commission.source === 'override' ? 'payroll' : commission.source}`);
  return (
    <Breakdown>
      <dt>{t('payouts.breakdown.collected', { count: totals.sales_count })}</dt>
      <dd>{baht(totals.collected, { always2: true })}</dd>
      {totals.discount_covered > 0 && (
        <>
          <dt>{t('payouts.breakdown.discounts')}</dt>
          <dd>+{baht(totals.discount_covered, { always2: true })}</dd>
        </>
      )}
      <dt>
        {t('payouts.breakdown.commission', { percent: totals.commission_percent })} <small>· {rateNote}</small>
      </dt>
      <dd>{baht(-totals.commission, { always2: true })}</dd>
      {totals.sponsorship > 0 && (
        <>
          <dt>{t('payouts.breakdown.sponsorship')}</dt>
          <dd>{baht(-totals.sponsorship, { always2: true })}</dd>
        </>
      )}
      <TotalTerm>{t('payouts.breakdown.payout')}</TotalTerm>
      <TotalValue>{baht(totals.payout, { always2: true })}</TotalValue>
    </Breakdown>
  );
}

function StatusPill({ status, issuedAt, t, lang }) {
  return status === 'issued' ? (
    <Pill $issued>
      <CheckCircle2 size={13} />
      {issuedAt
        ? t('payouts.status.issuedOn', { date: dayLabel(issuedAt, lang, { day: 'numeric', month: 'short', year: 'numeric' }) })
        : t('payouts.status.issued')}
    </Pill>
  ) : (
    <Pill><Clock size={13} />{t('payouts.status.estimated')}</Pill>
  );
}

const ChartBox = styled.div`
  width: 100%;
  height: 200px;

  /* recharts' keyboard layer focuses the chart on click; keep its ring for
     keyboard users only. */
  *:focus:not(:focus-visible) {
    outline: none;
  }
`;

const ChartTip = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  box-shadow: ${props => props.theme.shadows.md};
  padding: 0.5rem 0.75rem;
  font-size: ${props => props.theme.typography.sizes.sm};

  strong {
    display: block;
    color: ${props => props.theme.colors.text};
    font-variant-numeric: tabular-nums;
  }
  span {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

/**
 * Monthly payouts as bars: one series, one colour (slot 1 of the validated
 * chart palette), so no legend. Runs from the first month with sales (at
 * least six months) to now; months without sales are empty bars rather
 * than missing. The current month is drawn lighter, as it's still an
 * estimate. Every value is also in the Monthly history list beside it.
 */
function PayoutBars({ history, current, selected, onSelect, t, lang }) {
  const theme = useTheme();
  const mode = theme.mode === 'dark' ? 'dark' : 'light';
  const chrome = chromeColors(mode);
  const color = seriesColor(mode, 0);

  const data = useMemo(() => {
    const byKey = new Map(history.map(h => [`${h.year}-${h.month}`, h]));
    const earliest = history.reduce((min, h) => {
      const idx = h.year * 12 + h.month;
      return idx < min ? idx : min;
    }, current.year * 12 + current.month);
    const count = Math.max(6, current.year * 12 + current.month - earliest + 1);
    return Array.from({ length: count }, (_, i) => {
      const { year, month } = shiftMonth(current, i - count + 1);
      const h = byKey.get(`${year}-${month}`);
      return {
        key: `${year}-${month}`,
        year,
        month,
        label: new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString(locale(lang), { month: 'short', timeZone: 'UTC' }),
        payout: h ? h.payout : 0,
        sales: h ? h.sales_count : 0,
        isCurrent: year === current.year && month === current.month,
      };
    });
  }, [history, current, lang]);

  const renderTip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <ChartTip>
        <span>{monthLabel(d.year, d.month, lang)}{d.isCurrent ? ` · ${t('payouts.chart.soFar')}` : ''}</span>
        <strong>{baht(d.payout, { always2: true })}</strong>
        <span>{t('payouts.history.sales', { count: d.sales })}</span>
      </ChartTip>
    );
  };

  return (
    <ChartBox>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke={chrome.grid} />
          <XAxis
            dataKey="label"
            tick={{ fill: chrome.axis, fontSize: 12 }}
            axisLine={{ stroke: chrome.grid }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tickFormatter={(v) => baht(v, { compact: true })}
            tick={{ fill: chrome.axis, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
            allowDecimals={false}
          />
          <Tooltip content={renderTip} cursor={{ fill: chrome.grid, opacity: 0.5 }} />
          <Bar
            dataKey="payout"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
            isAnimationActive={false}
            onClick={(d) => onSelect({ year: d.year, month: d.month })}
            style={{ cursor: 'pointer' }}
          >
            {data.map(d => (
              <Cell
                key={d.key}
                fill={color}
                fillOpacity={d.isCurrent ? 0.45 : 1}
                stroke={selected && selected.year === d.year && selected.month === d.month ? theme.colors.text : 'none'}
                strokeWidth={1.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

function MyEarnings() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  usePageMeta(t('payouts.pageTitle'));

  const [overview, setOverview] = useState(null);
  const [selected, setSelected] = useState(null); // { year, month }
  const [statement, setStatement] = useState(null);
  const [statementLoading, setStatementLoading] = useState(false);
  const [showAllMonths, setShowAllMonths] = useState(false);

  useEffect(() => {
    sellerAPI.getPayouts()
      .then(res => {
        setOverview(res.data);
        setSelected({ year: res.data.current.year, month: res.data.current.month });
      })
      .catch(() => toast.error(t('payouts.toasts.loadFailed')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return undefined;
    let cancelled = false;
    setStatementLoading(true);
    sellerAPI.getPayoutStatement(selected.year, selected.month)
      .then(res => { if (!cancelled) setStatement(res.data); })
      .catch(() => { if (!cancelled) toast.error(t('payouts.toasts.statementFailed')); })
      .finally(() => { if (!cancelled) setStatementLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.year, selected?.month]);

  const current = overview?.current;
  const bank = overview?.bank;
  const isCurrent = (m) => current && m.year === current.year && m.month === current.month;
  const atLatest = selected && current && selected.year === current.year && selected.month === current.month;

  const bankRequest = useMemo(() => {
    const message = t('payouts.bank.requestMessage', {
      current: bank ? `${bank.bank_name} ··· ${bank.last4}` : t('payouts.bank.none'),
    });
    return `/support?type=account&message=${encodeURIComponent(message)}`;
  }, [bank, t]);

  const payoutDate = current ? dayLabel(`${current.payout_date}T12:00:00+07:00`, lang, { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <Container>
      <Header>
        <div>
          <Title>{t('payouts.title')}</Title>
          <Subtitle>{t('payouts.subtitle')}</Subtitle>
        </div>
        <CrossLink to="/seller/my-cheatsheets">{t('payouts.toSheets')}<ArrowRight size={15} /></CrossLink>
      </Header>

      <Top>
        <HeroCard aria-live="polite">
          <CardLabel>
            {current ? t('payouts.hero.label', { month: monthLabel(current.year, current.month, lang) }) : ' '}
          </CardLabel>
          {current ? (
            <>
              <Hero>{baht(current.totals.payout, { always2: true })}</Hero>
              <HeroMeta>
                <StatusPill status={current.status} issuedAt={current.commission.issued_at} t={t} lang={lang} />
                <span>
                  {bank ? (() => {
                    // Split around the bank so its logo can sit inline, in
                    // whatever position the language puts it.
                    const [before, after] = t('payouts.hero.paidTo', { date: payoutDate, bank: '\u0000' }).split('\u0000');
                    return (
                      <>
                        {before}
                        <InlineBank>
                          <BankLogo bankName={bank.bank_name} size={18} />
                          {localizedBankName(bank.bank_name, t)} ··· {bank.last4}
                        </InlineBank>
                        {after}
                      </>
                    );
                  })() : t('payouts.hero.paidOn', { date: payoutDate })}
                </span>
              </HeroMeta>
              <PayoutBreakdown totals={current.totals} commission={current.commission} t={t} />
            </>
          ) : (
            <>
              <Bone $h={52} $w="55%" $m="0.5rem 0" />
              <Bone $h={14} $w="70%" />
              <Bone $h={100} $m="1.5rem 0 0" />
            </>
          )}
        </HeroCard>

        <Card>
          <CardHeading>{t('payouts.bank.title')}</CardHeading>
          {overview ? (
            bank ? (
              <BankRow>
                <BankLogo bankName={bank.bank_name} size={40} />
                <div>
                  <BankName>{localizedBankName(bank.bank_name, t)}</BankName>
                  <BankDetail>{bank.account_name}</BankDetail>
                  <BankDetail>··· ··· {bank.last4}</BankDetail>
                </div>
              </BankRow>
            ) : (
              <BankDetail>{t('payouts.bank.none')}</BankDetail>
            )
          ) : (
            <Bone $h={48} />
          )}
          <SmallLink to={bankRequest}>{t('payouts.bank.request')}</SmallLink>
          <Note>{t('payouts.bank.why')}</Note>
          <Note>{t('payouts.schedule')}</Note>
        </Card>
      </Top>

      {/* Monthly payouts: the chart and the same numbers as a compact table
          (its text equivalent), in one full-width card, so nothing sits
          beside it at a different height. */}
      <Card>
        <CardHeading>{t('payouts.chart.title')}</CardHeading>
        {!overview ? (
          <Bone $h={200} />
        ) : overview.history.length === 0 ? (
          <Empty>{t('payouts.history.empty')}</Empty>
        ) : (
          <>
            <PayoutBars
              history={overview.history}
              current={overview.current}
              selected={selected}
              onSelect={setSelected}
              t={t}
              lang={lang}
            />
            <Caption>{t('payouts.chart.caption')}</Caption>
            <MonthTable>
              {(showAllMonths ? overview.history : overview.history.slice(0, MONTHS_PREVIEW)).map(m => {
                const active = selected && selected.year === m.year && selected.month === m.month;
                return (
                  <MonthRow
                    key={`${m.year}-${m.month}`}
                    type="button"
                    $active={active}
                    aria-current={active ? 'true' : undefined}
                    onClick={() => setSelected({ year: m.year, month: m.month })}
                  >
                    <MonthName>{monthLabel(m.year, m.month, lang)}</MonthName>
                    <MonthSales>
                      {isCurrent(m) ? t('payouts.history.soFar', { count: m.sales_count }) : t('payouts.history.sales', { count: m.sales_count })}
                    </MonthSales>
                    <MonthStatus><StatusPill status={m.status} t={t} lang={lang} /></MonthStatus>
                    <MonthAmount>{baht(m.payout, { always2: true })}</MonthAmount>
                  </MonthRow>
                );
              })}
            </MonthTable>
            {overview.history.length > MONTHS_PREVIEW && (
              <ShowAll type="button" onClick={() => setShowAllMonths(v => !v)} aria-expanded={showAllMonths}>
                {showAllMonths
                  ? t('payouts.history.showLess')
                  : t('payouts.history.showAll', { count: overview.history.length })}
              </ShowAll>
            )}
          </>
        )}
      </Card>

      <div>
        <Card>
          <StatementHead>
            <MonthNav>
              <IconButton
                type="button"
                aria-label={t('payouts.statement.previous')}
                disabled={!selected}
                onClick={() => setSelected(s => shiftMonth(s, -1))}
              >
                <ChevronLeft size={16} />
              </IconButton>
              <StatementTitle>{selected ? monthLabel(selected.year, selected.month, lang) : ''}</StatementTitle>
              <IconButton
                type="button"
                aria-label={t('payouts.statement.next')}
                disabled={!selected || atLatest}
                onClick={() => setSelected(s => shiftMonth(s, 1))}
              >
                <ChevronRight size={16} />
              </IconButton>
            </MonthNav>
            <DownloadButton
              type="button"
              disabled={!statement || statement.transactions.length === 0}
              onClick={() => downloadCsv(statement, t)}
            >
              <Download size={15} />{t('payouts.statement.csv')}
            </DownloadButton>
          </StatementHead>

          {statementLoading || !statement ? (
            <>
              <Bone $h={16} $w="60%" $m="0 0 1rem" />
              {[0, 1, 2].map(i => <Bone key={i} $h={18} $m="0 0 0.75rem" />)}
            </>
          ) : (
            <>
              <StatementSummary>
                <span><StatusPill status={statement.status} issuedAt={statement.commission.issued_at} t={t} lang={lang} /></span>
                <span>{t('payouts.statement.sales', { count: statement.totals.sales_count })}</span>
                <span>{t('payouts.statement.commission', { percent: statement.totals.commission_percent })}</span>
                <span>{t('payouts.statement.payout')} <b>{baht(statement.totals.payout, { always2: true })}</b></span>
              </StatementSummary>
              {statement.transactions.length === 0 ? (
                <Empty>{t('payouts.statement.empty')}</Empty>
              ) : (
                <TableScroll>
                  <Table>
                    <thead>
                      <tr>
                        <th>{t('payouts.csv.date')}</th>
                        <th>{t('payouts.csv.cheat_sheet')}</th>
                        <th>{t('payouts.csv.amount')}</th>
                        {statement.totals.discount_covered > 0 && <th>{t('payouts.csv.discount_covered')}</th>}
                        <th>{t('payouts.csv.commission')}</th>
                        {statement.totals.sponsorship > 0 && <th>{t('payouts.csv.sponsorship')}</th>}
                        <th>{t('payouts.csv.payout')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.transactions.map(tx => (
                        <tr key={tx.order_id}>
                          <td className="muted">{dayLabel(tx.paid_at, lang)}</td>
                          <td className="sheet">
                            {tx.title}
                            <small>{tx.course_code} · #{tx.order_id}</small>
                          </td>
                          <td>{baht(tx.amount, { always2: true })}</td>
                          {statement.totals.discount_covered > 0 && (
                            <td className="muted">{tx.discount_covered > 0 ? `+${baht(tx.discount_covered, { always2: true })}` : '–'}</td>
                          )}
                          <td className="muted">{baht(-tx.commission, { always2: true })}</td>
                          {statement.totals.sponsorship > 0 && (
                            <td className="muted">{tx.sponsorship > 0 ? baht(-tx.sponsorship, { always2: true }) : '–'}</td>
                          )}
                          <td className="payout">{baht(tx.payout, { always2: true })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableScroll>
              )}
              {statement.transactions.length > 0 && (
                <TxList>
                  {statement.transactions.map(tx => (
                    <TxItem key={tx.order_id}>
                      <TxTitle>{tx.title}</TxTitle>
                      <TxPayout>{baht(tx.payout, { always2: true })}</TxPayout>
                      <TxSub>{dayLabel(tx.paid_at, lang)} · {tx.course_code} · #{tx.order_id}</TxSub>
                      <TxSub>
                        {[
                          baht(tx.amount, { always2: true }),
                          tx.discount_covered > 0 && t('payouts.mobile.discount', { amount: baht(tx.discount_covered, { always2: true }) }),
                          tx.commission > 0 && t('payouts.mobile.commission', { amount: baht(tx.commission, { always2: true }) }),
                          tx.sponsorship > 0 && t('payouts.mobile.sponsorship', { amount: baht(tx.sponsorship, { always2: true }) }),
                        ].filter(Boolean).join(' · ')}
                      </TxSub>
                    </TxItem>
                  ))}
                </TxList>
              )}
              <Caption>{t('payouts.statement.privacy')}</Caption>
            </>
          )}
        </Card>
      </div>
    </Container>
  );
}

export default MyEarnings;
