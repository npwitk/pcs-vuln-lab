import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Star, Eye, ShoppingCart, Sparkles, MoreHorizontal, Pencil, ExternalLink, EyeOff, Search,
  CheckCircle2, Clock, XCircle, CalendarClock, AlertTriangle, Plus,
} from 'lucide-react';
import { sellerAPI } from '../../services/api';
import usePageMeta from '../../hooks/usePageMeta';
import { meshGradient } from '../../utils/meshGradient';
import { formatExamTypes } from '../../utils/examTypes';
import { baht } from '../../utils/money';
import SalesTrendChart, { Segmented, SegmentButton } from '../../components/seller/SalesTrendChart';
import Sparkline from '../../components/seller/Sparkline';
import SponsorDialog from '../../components/seller/SponsorDialog';
import { assignSlots, seriesColor, mutedColor } from '../../components/seller/chartPalette';

const RANGES = [7, 30, 90];
const SPARK_DAYS = 30;
const CHIPS = ['all', 'active', 'hidden', 'pending', 'rejected', 'sponsored'];

// ---------------------------------------------------------------------------
// Layout

const Container = styled.div`
  max-width: 1200px;
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const UploadButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5625rem 1rem;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.primary};
  color: #fff;
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.sm};
  text-decoration: none;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    color: #fff;
  }
`;

// KPI row: one stat tile per headline number for the selected range.
const Kpis = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Kpi = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 0.875rem 1rem;
  min-width: 0;
`;

const KpiLabel = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const KpiValue = styled.div`
  margin-top: 0.125rem;
  font-size: ${props => props.theme.typography.sizes['2xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const KpiDelta = styled.div`
  margin-top: 0.125rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};

  b {
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.$dir === 'up'
      ? (props.theme.mode === 'dark' ? '#30D158' : '#1F7A36')
      : props.$dir === 'down'
        ? (props.theme.mode === 'dark' ? '#FF6961' : '#C4000F')
        : props.theme.colors.textSecondary};
  }
`;

// Revenue here is before commission; the payout lives on the Payouts page.
const KpiNote = styled.div`
  margin-top: 0.25rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textTertiary};

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    font-weight: ${props => props.theme.typography.weights.medium};
  }
`;

const Attention = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-left: 3px solid ${props => props.theme.colors.warning};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font: inherit;
  font-size: ${props => props.theme.typography.sizes.sm};
  text-align: left;
  cursor: pointer;

  svg {
    flex-shrink: 0;
    color: ${props => props.theme.mode === 'dark' ? props.theme.colors.warning : props.theme.colors.warningText};
  }

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Chips = styled.div`
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
`;

const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: ${props => props.theme.radius.full};
  border: 1px solid ${props => props.$active ? props.theme.colors.text : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.text : props.theme.colors.surface};
  color: ${props => props.$active ? props.theme.colors.surface : props.theme.colors.textSecondary};
  font: inherit;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;

  span {
    opacity: 0.7;
    font-variant-numeric: tabular-nums;
  }
`;

const ListTools = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 600px) {
    width: 100%;

    > label {
      flex: 1;
      min-width: 0;
    }
    input {
      width: 100%;
    }
  }
`;

const SearchBox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0 0.625rem;
  height: 34px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textTertiary};

  input {
    border: none;
    outline: none;
    background: none;
    font: inherit;
    font-size: ${props => props.theme.typography.sizes.sm};
    color: ${props => props.theme.colors.text};
    width: 11rem;
  }

  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SortSelect = styled.select`
  height: 34px;
  padding: 0 0.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font: inherit;
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const List = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
`;

// One sheet. Desktop: a single aligned row; phones: a stacked card, with
// price/status/stats (Meta) on one wrapping line and the sparkline below.
const Row = styled.div`
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 84px 150px 170px 172px 36px;
  grid-template-areas: "thumb main price status stats spark menu";
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;

  & + & {
    border-top: 1px solid ${props => props.theme.colors.borderLight};
  }

  @media (max-width: 1024px) {
    grid-template-columns: 56px minmax(0, 1fr) 36px;
    grid-template-areas:
      "thumb main menu"
      "thumb meta meta"
      "thumb spark spark";
    row-gap: 0.5rem;
    align-items: start;
  }
`;

const Thumb = styled(Link)`
  grid-area: thumb;
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.radius.md};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.6875rem;
  font-weight: ${props => props.theme.typography.weights.bold};
  text-decoration: none;
  border: 1px solid ${props => props.theme.colors.borderLight};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Main = styled.div`
  grid-area: main;
  min-width: 0;
`;

const SheetTitle = styled(Link)`
  display: block;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const SheetMeta = styled.div`
  margin-top: 0.125rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.div`
  display: contents;

  @media (max-width: 1024px) {
    grid-area: meta;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }
`;

const Price = styled.div`
  grid-area: price;
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
`;

const StatusCell = styled.div`
  grid-area: status;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  min-width: 0;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
`;

const STATUS_TONE = {
  active: 'good',
  preorder: 'neutral',
  hidden: 'neutral',
  pending: 'warning',
  rejected: 'critical',
};
const TONES = {
  light: { good: '#1F7A36', warning: '#B84A00', critical: '#C4000F' },
  dark: { good: '#4ADE74', warning: '#FFB340', critical: '#FF6961' },
};

// Status pill: tinted fill, icon + label (never colour alone).
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
    const mode = props.theme.mode === 'dark' ? 'dark' : 'light';
    const color = TONES[mode][props.$tone];
    return color
      ? `color: ${color}; background: color-mix(in srgb, ${color} 12%, transparent);`
      : `color: ${props.theme.colors.textSecondary}; background: ${props.theme.colors.backgroundSecondary}; border: 1px solid ${props.theme.colors.borderLight};`;
  }}
`;

const SponsoredTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.primary};
  white-space: nowrap;
`;

const Reason = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Stats = styled.div`
  grid-area: stats;
  display: flex;
  gap: 0.875rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
  }
`;

const Spark = styled.div`
  grid-area: spark;
`;

const MenuWrap = styled.div`
  grid-area: menu;
  position: relative;
  justify-self: end;
`;

const MenuButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.$open ? props.theme.colors.backgroundSecondary : 'transparent'};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
    color: ${props => props.theme.colors.text};
  }
`;

const Menu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 0.25rem);
  z-index: 20;
  min-width: 200px;
  padding: 0.375rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: none;
  border-radius: ${props => props.theme.radius.sm};
  background: none;
  font: inherit;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  text-align: left;
  cursor: pointer;

  svg {
    color: ${props => props.theme.colors.textSecondary};
  }

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const Empty = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

const Bone = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.sm};
  height: ${props => props.$h || 14}px;
  width: ${props => props.$w || '100%'};
`;

// ---------------------------------------------------------------------------

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

function deriveStatus(cs) {
  if (cs.approval_status === 'rejected') return 'rejected';
  if (cs.approval_status === 'pending') return 'pending';
  if (!cs.is_active) return 'hidden';
  if (cs.release_at && new Date(cs.release_at) > new Date()) return 'preorder';
  return 'active';
}

const STATUS_ICON = { active: CheckCircle2, preorder: CalendarClock, hidden: EyeOff, pending: Clock, rejected: XCircle };

function MyCheatSheets() {
  const { t, i18n } = useTranslation();
  usePageMeta(t('sellerSheets.pageTitle'));
  const theme = useTheme();
  const mode = theme.mode === 'dark' ? 'dark' : 'light';
  const navigate = useNavigate();

  const [cheatSheets, setCheatSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perf, setPerf] = useState(null);
  const [feePercent, setFeePercent] = useState(5);
  const [range, setRange] = useState(30);
  const [metric, setMetric] = useState('sales');
  const [chip, setChip] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [openMenu, setOpenMenu] = useState(null);
  const [sponsorTarget, setSponsorTarget] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    sellerAPI.getMyCheatSheets()
      .then(res => setCheatSheets(res.data.cheat_sheets || []))
      .catch(() => toast.error(t('sellerSheets.toasts.loadFailed')))
      .finally(() => setLoading(false));
    sellerAPI.getPerformance()
      .then(res => setPerf(res.data))
      .catch(() => setPerf({ days: [], sheets: {} }));
    sellerAPI.getSponsorshipFee()
      .then(res => setFeePercent(res.data.fee_percent))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the row menu on an outside click or Escape.
  useEffect(() => {
    if (openMenu == null) return undefined;
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null); };
    const onKey = (e) => { if (e.key === 'Escape') setOpenMenu(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  const slots = useMemo(() => assignSlots(cheatSheets), [cheatSheets]);
  const allDays = perf?.days || [];
  const empty = useMemo(() => ({ sales: allDays.map(() => 0), earnings: allDays.map(() => 0), views: allDays.map(() => 0) }), [allDays]);
  const seriesOf = (id) => perf?.sheets?.[id] || empty;

  // The selected range (and the equal period before it, for deltas).
  const days = allDays.slice(-range);
  const rangeSeries = useMemo(() => {
    const out = {};
    cheatSheets.forEach(cs => {
      const s = perf?.sheets?.[cs.cheatsheet_id];
      if (!s) return;
      out[cs.cheatsheet_id] = { sales: s.sales.slice(-range), earnings: s.earnings.slice(-range), views: s.views.slice(-range) };
    });
    return out;
  }, [perf, cheatSheets, range]);

  const kpis = useMemo(() => {
    const total = (m, from, to) => sum(cheatSheets.map(cs => sum((perf?.sheets?.[cs.cheatsheet_id]?.[m] || []).slice(from, to))));
    const n = allDays.length;
    const cur = { sales: total('sales', n - range, n), earnings: total('earnings', n - range, n), views: total('views', n - range, n) };
    const hasPrev = n >= range * 2;
    const prev = hasPrev ? { sales: total('sales', n - 2 * range, n - range), earnings: total('earnings', n - 2 * range, n - range), views: total('views', n - 2 * range, n - range) } : null;
    const conv = (x) => (x.views > 0 ? (x.sales / x.views) * 100 : null);
    return { cur, prev, conv: conv(cur), prevConv: prev ? conv(prev) : null };
  }, [perf, cheatSheets, allDays.length, range]);

  const formatMetric = (v, opts) => (metric === 'earnings' ? baht(v, opts) : Math.round(v).toLocaleString('en-US'));

  const counts = useMemo(() => {
    const c = { all: cheatSheets.length, active: 0, hidden: 0, pending: 0, rejected: 0, sponsored: 0 };
    cheatSheets.forEach(cs => {
      const s = deriveStatus(cs);
      if (s === 'active' || s === 'preorder') c.active += 1;
      if (s === 'hidden') c.hidden += 1;
      if (s === 'pending') c.pending += 1;
      if (s === 'rejected') c.rejected += 1;
      if (cs.is_sponsored) c.sponsored += 1;
    });
    return c;
  }, [cheatSheets]);

  const recentSales = (cs) => sum(seriesOf(cs.cheatsheet_id).sales.slice(-SPARK_DAYS));

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = cheatSheets.filter(cs => {
      const s = deriveStatus(cs);
      if (chip === 'active' && !(s === 'active' || s === 'preorder')) return false;
      if (['hidden', 'pending', 'rejected'].includes(chip) && s !== chip) return false;
      if (chip === 'sponsored' && !cs.is_sponsored) return false;
      if (q && !`${cs.title} ${cs.course_code}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const by = {
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      selling: (a, b) => recentSales(b) - recentSales(a) || b.purchase_count - a.purchase_count,
      viewed: (a, b) => b.view_count - a.view_count,
    };
    return rows.sort(by[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cheatSheets, chip, query, sort, perf]);

  const handleToggleActive = async (cs) => {
    setOpenMenu(null);
    try {
      await sellerAPI.toggleActive(cs.cheatsheet_id);
      setCheatSheets(prev => prev.map(x => x.cheatsheet_id === cs.cheatsheet_id ? { ...x, is_active: !cs.is_active } : x));
      toast.success(cs.is_active ? t('sellerSheets.toasts.hidden') : t('sellerSheets.toasts.shown'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('sellerSheets.toasts.updateFailed'));
    }
  };

  const handleSponsor = async () => {
    const cs = sponsorTarget;
    try {
      await sellerAPI.toggleSponsored(cs.cheatsheet_id);
      setCheatSheets(prev => prev.map(x => (x.cheatsheet_id === cs.cheatsheet_id
        ? { ...x, is_sponsored: !cs.is_sponsored, sponsored_at: cs.is_sponsored ? null : new Date().toISOString() }
        : x)));
      toast.success(cs.is_sponsored ? t('sellerSheets.toasts.unsponsored') : t('sellerSheets.toasts.sponsored'));
      setSponsorTarget(null);
    } catch (error) {
      toast.error(error.response?.data?.message || t('sellerSheets.toasts.updateFailed'));
    }
  };

  const rangeLabel = t('sellerSheets.range.label', { days: range });
  const delta = (cur, prev, { points } = {}) => {
    if (prev == null || cur == null) return null;
    if (points) {
      const d = cur - prev;
      return { dir: d > 0 ? 'up' : d < 0 ? 'down' : 'flat', text: `${d > 0 ? '+' : ''}${d.toFixed(1)} pt` };
    }
    if (prev === 0) return cur === 0 ? { dir: 'flat', text: '0%' } : { dir: 'up', text: t('sellerSheets.kpi.new') };
    const d = ((cur - prev) / prev) * 100;
    return { dir: d > 0.5 ? 'up' : d < -0.5 ? 'down' : 'flat', text: `${d > 0 ? '+' : ''}${Math.round(d)}%` };
  };

  const kpiTiles = [
    { key: 'sales', value: kpis.cur.sales.toLocaleString('en-US'), d: delta(kpis.cur.sales, kpis.prev?.sales) },
    { key: 'earnings', value: baht(kpis.cur.earnings), d: delta(kpis.cur.earnings, kpis.prev?.earnings) },
    { key: 'views', value: kpis.cur.views.toLocaleString('en-US'), d: delta(kpis.cur.views, kpis.prev?.views) },
    {
      key: 'conversion',
      value: kpis.conv == null ? '–' : `${kpis.conv.toFixed(1)}%`,
      d: delta(kpis.conv, kpis.prevConv, { points: true }),
    },
  ];

  const chartSheets = cheatSheets.map(cs => ({ id: cs.cheatsheet_id, title: cs.title, slot: slots[cs.cheatsheet_id] }));
  const attention = counts.rejected + counts.pending > 0;

  return (
    <Container>
      <Header>
        <div>
          <Title>{t('sellerSheets.title')}</Title>
          <Subtitle>{t('sellerSheets.subtitle')}</Subtitle>
        </div>
        <HeaderActions>
          <Segmented role="tablist" aria-label={t('sellerSheets.range.aria')}>
            {RANGES.map(r => (
              <SegmentButton key={r} type="button" role="tab" aria-selected={range === r} $active={range === r} onClick={() => setRange(r)}>
                {t('sellerSheets.range.short', { days: r })}
              </SegmentButton>
            ))}
          </Segmented>
          <UploadButton to="/admin/upload"><Plus size={16} />{t('sellerSheets.upload')}</UploadButton>
        </HeaderActions>
      </Header>

      <Kpis>
        {kpiTiles.map(k => (
          <Kpi key={k.key}>
            <KpiLabel>{t(`sellerSheets.kpi.${k.key}`)}</KpiLabel>
            <KpiValue>{perf ? k.value : <Bone $h={28} $w="60%" />}</KpiValue>
            <KpiDelta $dir={k.d?.dir}>
              {k.d
                ? <><b>{k.d.text}</b> {t('sellerSheets.kpi.vsPrevious', { days: range })}</>
                : rangeLabel}
            </KpiDelta>
            {k.key === 'earnings' && (
              <KpiNote>
                {t('sellerSheets.kpi.revenueNote')} · <Link to="/seller/earnings">{t('sellerSheets.kpi.seePayouts')} →</Link>
              </KpiNote>
            )}
          </Kpi>
        ))}
      </Kpis>

      {attention && (
        <Attention type="button" onClick={() => setChip(counts.rejected > 0 ? 'rejected' : 'pending')}>
          <AlertTriangle size={18} />
          <span>
            {[
              counts.rejected > 0 && t('sellerSheets.attention.rejected', { count: counts.rejected }),
              counts.pending > 0 && t('sellerSheets.attention.pending', { count: counts.pending }),
            ].filter(Boolean).join(' · ')}
          </span>
        </Attention>
      )}

      {perf && (
        <SalesTrendChart
          days={days}
          sheets={chartSheets}
          series={rangeSeries}
          metric={metric}
          onMetricChange={setMetric}
          formatValue={formatMetric}
          rangeLabel={rangeLabel}
        />
      )}

      <Toolbar>
        <Chips role="tablist" aria-label={t('sellerSheets.filters.aria')}>
          {CHIPS.map(c => (
            <Chip key={c} type="button" role="tab" aria-selected={chip === c} $active={chip === c} onClick={() => setChip(c)}>
              {t(`sellerSheets.filters.${c}`)} <span>{counts[c]}</span>
            </Chip>
          ))}
        </Chips>
        <ListTools>
          <SearchBox>
            <Search size={15} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('sellerSheets.search')}
              aria-label={t('sellerSheets.search')}
            />
          </SearchBox>
          <SortSelect value={sort} onChange={(e) => setSort(e.target.value)} aria-label={t('sellerSheets.sort.aria')}>
            <option value="newest">{t('sellerSheets.sort.newest')}</option>
            <option value="selling">{t('sellerSheets.sort.selling')}</option>
            <option value="viewed">{t('sellerSheets.sort.viewed')}</option>
          </SortSelect>
        </ListTools>
      </Toolbar>

      <List>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Row key={i} aria-hidden="true">
              <Bone style={{ gridArea: 'thumb' }} $h={56} $w="56px" />
              <div style={{ gridArea: 'main' }}><Bone $h={16} $w="70%" /><div style={{ height: 6 }} /><Bone $h={12} $w="40%" /></div>
            </Row>
          ))
        ) : visible.length === 0 ? (
          <Empty>
            {cheatSheets.length === 0 ? t('sellerSheets.empty.none') : t('sellerSheets.empty.filtered')}
          </Empty>
        ) : visible.map(cs => {
          const status = deriveStatus(cs);
          const StatusIcon = STATUS_ICON[status];
          const hasImage = cs.preview_image_path && cs.preview_image_path.startsWith('http');
          const examTypes = formatExamTypes(cs);
          const slot = slots[cs.cheatsheet_id];
          return (
            <Row key={cs.cheatsheet_id}>
              <Thumb
                to={`/cheatsheet/${cs.cheatsheet_id}`}
                style={hasImage ? undefined : { background: meshGradient(`sheet-${cs.cheatsheet_id}`) }}
                aria-hidden="true"
                tabIndex={-1}
              >
                {hasImage ? <img src={cs.preview_image_path} alt="" loading="lazy" /> : cs.course_code}
              </Thumb>

              <Main>
                <SheetTitle to={`/cheatsheet/${cs.cheatsheet_id}`} title={cs.title}>{cs.title}</SheetTitle>
                <SheetMeta>{[cs.course_code, examTypes].filter(Boolean).join(' · ')}</SheetMeta>
              </Main>

              <Meta>
                <Price>{parseFloat(cs.price) === 0 ? t('common.free') : `฿${parseFloat(cs.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}</Price>
                <StatusCell>
                  <StatusRow>
                    <Pill $tone={STATUS_TONE[status]}>
                      <StatusIcon size={13} />
                      {status === 'preorder'
                        ? t('sellerSheets.status.preorder', {
                          date: new Date(cs.release_at).toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok' }),
                        })
                        : t(`sellerSheets.status.${status}`)}
                    </Pill>
                    {!!cs.is_sponsored && <SponsoredTag><Sparkles size={12} />{t('sellerSheets.status.sponsored')}</SponsoredTag>}
                  </StatusRow>
                  {status === 'rejected' && cs.rejection_reason && (
                    <Reason title={cs.rejection_reason}>{cs.rejection_reason}</Reason>
                  )}
                </StatusCell>
                <Stats>
                  <span title={t('sellerSheets.stats.rating')}><Star size={14} />{parseFloat(cs.average_rating || 0).toFixed(1)}</span>
                  <span title={t('sellerSheets.stats.views')}><Eye size={14} />{cs.view_count}</span>
                  <span title={t('sellerSheets.stats.sold')}><ShoppingCart size={14} />{cs.purchase_count}</span>
                </Stats>
              </Meta>

              <Spark>
                {perf && (
                  <Sparkline
                    values={seriesOf(cs.cheatsheet_id).sales.slice(-SPARK_DAYS)}
                    color={slot != null ? seriesColor(mode, slot) : mutedColor(mode)}
                    totalLabel={(n) => t('sellerSheets.spark.total', { count: n })}
                    trendLabels={{
                      up: t('sellerSheets.spark.up'),
                      down: t('sellerSheets.spark.down'),
                      flat: t('sellerSheets.spark.flat'),
                    }}
                  />
                )}
              </Spark>

              <MenuWrap ref={openMenu === cs.cheatsheet_id ? menuRef : undefined}>
                <MenuButton
                  type="button"
                  $open={openMenu === cs.cheatsheet_id}
                  aria-haspopup="menu"
                  aria-expanded={openMenu === cs.cheatsheet_id}
                  aria-label={t('sellerSheets.menu.aria', { title: cs.title })}
                  onClick={() => setOpenMenu(openMenu === cs.cheatsheet_id ? null : cs.cheatsheet_id)}
                >
                  <MoreHorizontal size={18} />
                </MenuButton>
                {openMenu === cs.cheatsheet_id && (
                  <Menu role="menu">
                    <MenuItem role="menuitem" type="button" onClick={() => navigate(`/cheatsheet/${cs.cheatsheet_id}/edit`)}>
                      <Pencil size={15} />{t('sellerSheets.menu.edit')}
                    </MenuItem>
                    <MenuItem role="menuitem" type="button" onClick={() => navigate(`/cheatsheet/${cs.cheatsheet_id}`)}>
                      <ExternalLink size={15} />{t('sellerSheets.menu.view')}
                    </MenuItem>
                    <MenuItem role="menuitem" type="button" onClick={() => handleToggleActive(cs)}>
                      {cs.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                      {cs.is_active ? t('sellerSheets.menu.hide') : t('sellerSheets.menu.show')}
                    </MenuItem>
                    <MenuItem role="menuitem" type="button" onClick={() => { setOpenMenu(null); setSponsorTarget(cs); }}>
                      <Sparkles size={15} />
                      {cs.is_sponsored ? t('sellerSheets.menu.unsponsor') : t('sellerSheets.menu.sponsor')}
                    </MenuItem>
                  </Menu>
                )}
              </MenuWrap>
            </Row>
          );
        })}
      </List>

      {sponsorTarget && (
        <SponsorDialog
          sheet={sponsorTarget}
          feePercent={feePercent}
          onConfirm={handleSponsor}
          onClose={() => setSponsorTarget(null)}
        />
      )}
    </Container>
  );
}

export default MyCheatSheets;
