import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { paymentsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const PaymentWatchContext = createContext();

export const usePaymentWatch = () => {
  const context = useContext(PaymentWatchContext);
  if (!context) {
    throw new Error('usePaymentWatch must be used within a PaymentWatchProvider');
  }
  return context;
};

const STORAGE_KEY = 'pcs_pending_payment';
const POLL_INTERVAL_MS = 4000;
// A manual PromptPay approval can happen hours after checkout (whenever an
// admin is next available), unlike Stripe's near-instant webhook — so this
// keeps polling for a long time before assuming the order was abandoned.
const MAX_WATCH_AGE_MS = 48 * 60 * 60 * 1000;

function readStoredPending() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.type || !parsed?.id || !parsed?.startedAt) return null;
    if (Date.now() - parsed.startedAt > MAX_WATCH_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// Tracks a single in-flight PromptPay payment (single item or cart bundle)
// independently of which page is mounted, and persists it to localStorage —
// so approval is caught even if the buyer closes the QR modal, navigates
// elsewhere in the app, or reloads/reopens the tab while waiting on a
// manual admin approval, not just while they're staring at the QR code.
export const PaymentWatchProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [pending, setPending] = useState(readStoredPending);
  const [paidOrder, setPaidOrder] = useState(null);
  // The order (if any) whose QR/status UI is currently on-screen inline on
  // a page — lets the global fallback overlay stay out of the way and avoid
  // showing a duplicate confirmation when the buyer is already looking at it.
  const [activeLocalOrder, setActiveLocalOrder] = useState(null);
  // The watched order (if any) that closed without being paid, with why:
  // 'expired' (its Stripe QR timed out) or 'rejected' (an admin turned it
  // down). A page showing its receipt says so, then calls clearEndedOrder.
  const [endedOrder, setEndedOrder] = useState(null);

  const startWatching = useCallback((type, id) => {
    const record = { type, id, startedAt: Date.now() };
    setPaidOrder(null);
    setEndedOrder(null);
    setPending(record);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); } catch {}
  }, []);

  const acknowledgePaid = useCallback(() => {
    setPaidOrder(null);
  }, []);

  const clearEndedOrder = useCallback(() => {
    setEndedOrder(null);
  }, []);

  const registerActiveLocalOrder = useCallback((type, id) => {
    setActiveLocalOrder(type && id ? { type, id } : null);
  }, []);

  useEffect(() => {
    if (!pending || !isAuthenticated || paidOrder) return undefined;

    let cancelled = false;
    // Only while this order's receipt is on screen does the server also ask
    // Stripe whether the QR expired; otherwise it relies on the webhook.
    const verifyQr = activeLocalOrder?.type === pending.type
      && String(activeLocalOrder.id) === String(pending.id);
    const check = async () => {
      try {
        const res = pending.type === 'bundle'
          ? await paymentsAPI.getBundleStatus(pending.id, { verifyQr })
          : await paymentsAPI.getPaymentStatus(pending.id, { verifyQr });
        if (cancelled) return;
        if (res.data.status === 'paid') {
          setPaidOrder(pending);
          setPending(null);
          try { localStorage.removeItem(STORAGE_KEY); } catch {}
        } else if (res.data.status === 'failed') {
          setEndedOrder({ ...pending, reason: res.data.qr_status === 'expired' ? 'expired' : 'rejected' });
          setPending(null);
          try { localStorage.removeItem(STORAGE_KEY); } catch {}
        }
      } catch (err) {
        // A 404 means this order can never resolve for the signed-in user
        // (wrong account, or it's gone) — stop watching it. Anything else
        // is a transient hiccup; the next tick retries.
        if (!cancelled && err.response?.status === 404) {
          setPending(null);
          try { localStorage.removeItem(STORAGE_KEY); } catch {}
        }
      }
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pending, isAuthenticated, paidOrder, activeLocalOrder]);

  // Logging out mid-watch (or never having been logged in) means nothing
  // will ever resolve — drop it rather than keep polling with no token.
  // Gated on authLoading: AuthContext's own session check is still async on
  // first mount/reload, during which isAuthenticated briefly reads `false`
  // even for an already-logged-in buyer — without this gate, that transient
  // state would wipe a still-pending order before auth ever gets a chance
  // to resolve, breaking the exact "reopened the tab later" case this
  // watcher exists for.
  useEffect(() => {
    if (!authLoading && !isAuthenticated && pending) {
      setPending(null);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }, [authLoading, isAuthenticated, pending]);

  const value = {
    pending,
    paidOrder,
    activeLocalOrder,
    startWatching,
    acknowledgePaid,
    registerActiveLocalOrder,
    endedOrder,
    clearEndedOrder,
  };

  return (
    <PaymentWatchContext.Provider value={value}>
      {children}
    </PaymentWatchContext.Provider>
  );
};
