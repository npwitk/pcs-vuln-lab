import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import toast from 'react-hot-toast';
import { CheckCircle2, Zap, AlertTriangle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import Collapsible from '../Collapsible';
import { baht } from '../../utils/money';

// Pending payments on the admin dashboard, one card per order: a cart
// checkout's sheets together (approved or rejected as one, at its bundle
// price), or a single sheet. Static-QR orders need a person to check the
// transfer; Stripe orders confirm themselves and are only shown for context.

const FOLD_MS = 320;
const CONFIRM_WINDOW_MS = 4000;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const Summary = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};

  strong { color: ${props => props.theme.colors.text}; }
`;

const Filters = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const Filter = styled.button`
  padding: 0.35rem 0.8rem;
  border-radius: ${props => props.theme.radius.full};
  border: 1.5px solid ${props => (props.$active ? props.theme.colors.primary : props.theme.colors.border)};
  background: ${props => (props.$active ? props.theme.colors.primary : 'transparent')};
  color: ${props => (props.$active ? 'white' : props.theme.colors.textSecondary)};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;

  &:hover { border-color: ${props => props.theme.colors.primary}; }
`;

const Slot = styled.div`
  padding-bottom: 0.75rem;
`;

const Card = styled.article`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem 1.5rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => props.theme.colors.surface};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Buyer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.75rem;
  min-width: 0;

  img, .initial {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
    object-fit: cover;
  }

  .initial {
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.theme.colors.primary};
    color: white;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .who { min-width: 0; }

  .name {
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.text};
  }

  .meta {
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.sizes.xs};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Badges = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-left: auto;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  white-space: nowrap;

  ${props => ({
    needs: css`background: ${props.theme.colors.warning}26; color: ${props.theme.colors.warning};`,
    auto: css`background: ${props.theme.colors.success}1F; color: ${props.theme.colors.success};`,
  }[props.$tone])}
`;

const Items = styled.dl`
  margin: 0;
  font-size: ${props => props.theme.typography.sizes.sm};

  div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.2rem 0;
  }

  dt {
    min-width: 0;
    color: ${props => props.theme.colors.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    strong { margin-right: 0.35rem; }
  }

  dd {
    margin: 0;
    flex-shrink: 0;
    color: ${props => props.theme.colors.textSecondary};
    font-variant-numeric: tabular-nums;
  }
`;

const DiscountLine = styled.div`
  && dt, && dd { color: ${props => props.theme.colors.success}; }
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 190px;

  @media (max-width: 768px) {
    align-items: stretch;
    min-width: 0;
  }
`;

const Total = styled.div`
  text-align: right;

  .label {
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.sizes.xs};
  }

  .amount {
    font-size: ${props => props.theme.typography.sizes['2xl']};
    font-weight: ${props => props.theme.typography.weights.bold};
    color: ${props => props.theme.colors.text};
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: stretch;
    > * { flex: 1; }
  }
`;

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;

  ${props => (props.$variant === 'approve' ? css`
    border: none;
    background: ${props.$confirming ? props.theme.colors.success : props.theme.colors.primary};
    color: white;
    &:hover:not(:disabled) { filter: brightness(1.05); }
  ` : css`
    border: 1.5px solid ${props.theme.colors.border};
    background: transparent;
    color: ${props.$variant === 'reject' ? props.theme.colors.error : props.theme.colors.textSecondary};
    &:hover:not(:disabled) { border-color: currentColor; }
  `)}

  &:disabled { opacity: 0.6; cursor: default; }
`;

const RejectBox = styled.div`
  grid-column: 1 / -1;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px dashed ${props => props.theme.colors.border};

  input {
    flex: 1;
    min-width: 200px;
    padding: 0.55rem 0.75rem;
    border: 1.5px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.radius.md};
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.typography.sizes.sm};
    outline: none;

    &:focus { border-color: ${props => props.theme.colors.error}; }
  }
`;

const Note = styled.p`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.xs};
`;

const Empty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  border: 1.5px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  color: ${props => props.theme.colors.textSecondary};

  svg { color: ${props => props.theme.colors.success}; }
`;

function timeAgo(value) {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Rows from GET /api/admin/payments/pending -> one entry per order.
export function groupOrders(rows) {
  const orders = new Map();
  for (const row of rows) {
    const key = row.bundle_order_id ? `bundle:${row.bundle_order_id}` : `order:${row.order_id}`;
    if (!orders.has(key)) {
      orders.set(key, {
        key,
        bundleId: row.bundle_order_id || null,
        orderId: row.bundle_order_id ? null : row.order_id,
        buyer: { name: row.user_name, email: row.user_email, avatar: row.user_avatar },
        date: row.purchase_date,
        isStripe: false,
        code: null,
        items: [],
      });
    }
    const order = orders.get(key);
    order.items.push(row);
    order.isStripe = order.isStripe || !!row.is_stripe;
    order.code = order.code || row.discount_code || null;
  }
  return [...orders.values()].map(order => {
    const full = order.items.reduce((sum, r) => sum + (parseFloat(r.original_price ?? r.payment_amount) || 0), 0);
    const total = order.items.reduce((sum, r) => sum + (parseFloat(r.payment_amount) || 0), 0);
    return { ...order, full, total, discount: Math.max(0, full - total) };
  });
}

function OrderCard({ order, busy, onApprove, onReject }) {
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Two taps to approve: the first arms it (showing the amount), the second
  // approves. It disarms on its own after a few seconds.
  const approveClick = () => {
    if (!confirming) {
      setConfirming(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS);
      return;
    }
    clearTimeout(timer.current);
    setConfirming(false);
    onApprove(order);
  };

  const needsYou = !order.isStripe;
  const label = order.bundleId ? `Order · ${order.items.length} sheets` : `Order #${order.orderId}`;

  return (
    <Card>
      <div>
        <Buyer>
          {order.buyer.avatar
            ? <img src={order.buyer.avatar} alt="" loading="lazy" />
            : <span className="initial">{(order.buyer.name || '?').charAt(0).toUpperCase()}</span>}
          <div className="who">
            <div className="name">{order.buyer.name}</div>
            <div className="meta">{order.buyer.email} · {label} · {timeAgo(order.date)}</div>
          </div>
          <Badges>
            {needsYou
              ? <Badge $tone="needs"><AlertTriangle size={12} /> Check the transfer</Badge>
              : <Badge $tone="auto"><Zap size={12} /> Auto-approves when paid</Badge>}
          </Badges>
        </Buyer>

        <Items>
          {order.items.map(item => (
            <div key={item.order_id}>
              <dt><strong>{item.course_code}</strong>{item.cheatsheet_title}</dt>
              <dd>{baht(item.original_price ?? item.payment_amount, { always2: true })}</dd>
            </div>
          ))}
          {order.discount > 0.004 && (
            <DiscountLine>
              <dt>{order.code ? `Code ${order.code}` : 'Bundle discount'}</dt>
              <dd>−{baht(order.discount, { always2: true })}</dd>
            </DiscountLine>
          )}
        </Items>
      </div>

      <Side>
        <Total>
          <div className="label">{needsYou ? 'Transfer to look for' : 'Amount'}</div>
          <div className="amount">{baht(order.total, { always2: true })}</div>
        </Total>
        {!rejecting && (
          <Actions>
            <Btn type="button" $variant="reject" onClick={() => setRejecting(true)} disabled={busy}>Reject</Btn>
            <Btn type="button" $variant="approve" $confirming={confirming} onClick={approveClick} disabled={busy}>
              <CheckCircle2 size={15} />
              {confirming ? `Confirm ${baht(order.total, { always2: true })}` : 'Approve'}
            </Btn>
          </Actions>
        )}
      </Side>

      {!needsYou && (
        <Note>
          <Zap size={12} />
          Stripe unlocks this by itself once paid. Only approve by hand if you can see the payment in Stripe.
        </Note>
      )}

      {rejecting && (
        <RejectBox>
          <input
            autoFocus
            value={reason}
            placeholder="Reason (optional), e.g. no matching transfer"
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onReject(order, reason); if (e.key === 'Escape') setRejecting(false); }}
          />
          <Btn type="button" onClick={() => setRejecting(false)} disabled={busy}>Cancel</Btn>
          <Btn type="button" $variant="reject" onClick={() => onReject(order, reason)} disabled={busy}>
            Reject {order.bundleId ? 'order' : 'payment'}
          </Btn>
        </RejectBox>
      )}
    </Card>
  );
}

export default function PaymentReview({ payments, onChanged }) {
  const orders = useMemo(() => groupOrders(payments), [payments]);
  const needsYou = orders.filter(o => !o.isStripe);
  const [filter, setFilter] = useState('needs');
  const [busyKey, setBusyKey] = useState(null);
  const [done, setDone] = useState(() => new Set());

  const effectiveFilter = filter === 'needs' && needsYou.length === 0 ? 'all' : filter;
  const visible = orders
    .filter(o => (effectiveFilter === 'needs' ? !o.isStripe : effectiveFilter === 'stripe' ? o.isStripe : true))
    .sort((a, b) => Number(a.isStripe) - Number(b.isStripe) || new Date(b.date) - new Date(a.date));
  const waiting = needsYou.reduce((sum, o) => sum + o.total, 0);

  // Fold the card away, then refresh the list and the dashboard stats.
  const finish = (order) => {
    setDone(prev => new Set(prev).add(order.key));
    setTimeout(() => onChanged(), FOLD_MS);
  };

  const approve = async (order) => {
    setBusyKey(order.key);
    try {
      if (order.bundleId) await adminAPI.approveBundle(order.bundleId);
      else await adminAPI.approvePayment(order.orderId);
      toast.success(`Approved ${baht(order.total, { always2: true })} for ${order.buyer.name}`);
      finish(order);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    } finally {
      setBusyKey(null);
    }
  };

  const reject = async (order, reason) => {
    setBusyKey(order.key);
    try {
      if (order.bundleId) await adminAPI.rejectBundle(order.bundleId, reason);
      else await adminAPI.rejectPayment(order.orderId, reason);
      toast.success(`Rejected ${order.buyer.name}'s ${order.bundleId ? 'order' : 'payment'}`);
      finish(order);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <>
      <Header>
        <Summary>
          {needsYou.length > 0
            ? <><strong>{needsYou.length} {needsYou.length === 1 ? 'order needs' : 'orders need'} you</strong> · {baht(waiting, { always2: true })} to check</>
            : 'Nothing needs your approval.'}
          {orders.length > needsYou.length && ` · ${orders.length - needsYou.length} waiting on Stripe`}
        </Summary>
        {orders.length > 0 && (
          <Filters role="radiogroup" aria-label="Show">
            {[['needs', `Needs you (${needsYou.length})`], ['stripe', `Stripe (${orders.length - needsYou.length})`], ['all', `All (${orders.length})`]]
              .map(([value, text]) => (
                <Filter key={value} type="button" role="radio" aria-checked={effectiveFilter === value} $active={effectiveFilter === value} onClick={() => setFilter(value)}>
                  {text}
                </Filter>
              ))}
          </Filters>
        )}
      </Header>

      {visible.length === 0 ? (
        <Empty><CheckCircle2 size={18} /> All caught up. No payments to review.</Empty>
      ) : visible.map(order => (
        <Collapsible key={order.key} open={!done.has(order.key)} duration={FOLD_MS} bounce={false}>
          <Slot>
            <OrderCard order={order} busy={busyKey === order.key} onApprove={approve} onReject={reject} />
          </Slot>
        </Collapsible>
      ))}
    </>
  );
}
