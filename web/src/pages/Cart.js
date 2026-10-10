import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';
import EmptyState, { EmptyStateButton } from '../components/EmptyState';
import { cartAPI, paymentsAPI, discountCodesAPI } from '../services/api';
import PaymentSuccessCheck from '../components/PaymentSuccessCheck';
import PaymentReceipt, { ReceiptOverlay, PayLaterButton } from '../components/payment/PaymentReceipt';
import Collapsible from '../components/Collapsible';
import { usePaymentWatch } from '../context/PaymentWatchContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CartIcon, TrashIcon } from '../components/Icons';
import LoadingSpinner from '../components/LoadingSpinner';
import usePageMeta from '../hooks/usePageMeta';
import { baht } from '../utils/money';

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

// How long a removed item takes to fold away.
const REMOVE_MS = 320;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const popIn = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const noMotion = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};

  @media (max-width: 768px) {
    padding: 1.25rem 1rem 2rem;
  }
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
  font-size: ${props => props.theme.typography.sizes['3xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
`;

const ItemCount = styled.span`
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.medium};
  color: ${props => props.theme.colors.textSecondary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const CartItems = styled.div`
  display: flex;
  flex-direction: column;
`;

// Each item in its own Collapsible, so removing one folds the list closed
// instead of snapping. The gap is padding inside the fold, not a flex gap,
// so it collapses along with the item.
const ItemSlot = styled.div`
  padding-bottom: 0.875rem;
`;

const CartItem = styled.article`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => props.theme.colors.surface};
  animation: ${fadeUp} 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: ${props => Math.min(props.$index, 6) * 50}ms;
  transition: border-color ${props => props.theme.transitions.fast}, box-shadow ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary}66;
    box-shadow: ${props => props.theme.shadows.sm};
  }

  ${noMotion}

  @media (max-width: 560px) {
    align-items: flex-start;
    gap: 0.875rem;
  }
`;

const Thumb = styled(Link)`
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  border-radius: ${props => props.theme.radius.md};
  overflow: hidden;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.borderLight};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 560px) {
    width: 72px;
    height: 72px;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const CourseCode = styled.span`
  align-self: flex-start;
  padding: 0.2rem 0.65rem;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  letter-spacing: 0.02em;
`;

const ItemTitle = styled(Link)`
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  line-height: 1.35;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:hover { color: ${props => props.theme.colors.primary}; }
`;

const ItemPrice = styled.div`
  flex-shrink: 0;
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  font-variant-numeric: tabular-nums;

  @media (max-width: 560px) {
    font-size: ${props => props.theme.typography.sizes.base};
    color: ${props => props.theme.colors.primary};
  }
`;

const ItemSide = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 560px) {
    flex-direction: column-reverse;
    align-items: flex-end;
    gap: 0.25rem;
  }
`;

const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: background ${props => props.theme.transitions.fast}, color ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.error}1A;
    color: ${props => props.theme.colors.error};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const Summary = styled.aside`
  position: sticky;
  top: 5rem;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.md};
  animation: ${fadeUp} 360ms cubic-bezier(0.2, 0.8, 0.2, 1) 80ms both;
  ${noMotion}

  @media (max-width: 968px) {
    position: static;
  }
`;

const SummaryTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 0.5rem 0;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};

  span:last-child { font-variant-numeric: tabular-nums; }
`;

const SavingRow = styled(Row)`
  color: ${props => props.theme.colors.success};
  font-weight: ${props => props.theme.typography.weights.semibold};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

// Re-keyed on every change, so a new amount fades in rather than snapping.
const Amount = styled.span`
  display: inline-block;
  font-size: ${props => props.theme.typography.sizes['2xl']};
  font-variant-numeric: tabular-nums;
  animation: ${fadeUp} 240ms ease-out both;
  ${noMotion}
`;

const Callout = styled.div`
  margin: 0.75rem 0;
  padding: 0.75rem 0.875rem;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.success}1F;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
  line-height: 1.5;

  strong { color: ${props => props.theme.colors.success}; }
`;

const CodeRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0 0.25rem;
`;

const CodeInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.65rem 0.8rem;
  border: 1.5px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 16px;
  text-transform: uppercase;
  outline: none;

  &:focus { border-color: ${props => props.theme.colors.primary}; }
  &:disabled { opacity: 0.6; }
  &::placeholder { text-transform: none; }
`;

const ApplyButton = styled.button`
  padding: 0.65rem 1rem;
  border: 1.5px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radius.md};
  background: transparent;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  white-space: nowrap;

  &:hover:not(:disabled) { background: ${props => props.theme.colors.primary}; color: white; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const CodeError = styled.div`
  margin-top: 0.4rem;
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.sizes.sm};
  animation: ${fadeIn} 200ms ease-out;
`;

const AppliedCode = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 1rem 0 0.25rem;
  padding: 0.65rem 0.8rem;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.success}1F;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
  animation: ${fadeIn} 200ms ease-out;

  button {
    border: none;
    background: none;
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.sizes.sm};
    text-decoration: underline;
    cursor: pointer;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: ${props => props.$size || 16}px;
  height: ${props => props.$size || 16}px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  vertical-align: -3px;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  margin-top: 1.25rem;
  padding: 0.95rem 1.5rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: background ${props => props.theme.transitions.fast}, transform ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.7; cursor: default; }
`;

const Note = styled.p`
  margin-top: 0.75rem;
  text-align: center;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

// ---------------------------------------------------------------------------
// Payment dialog: the sheets drop into a cart, then a receipt with the QR
// prints out of it, and gets a PAID stamp when the money lands.
// ---------------------------------------------------------------------------

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  animation: ${fadeIn} 200ms ease-out;
  ${noMotion}
`;

const Dialog = styled.div`
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 1.75rem 1.5rem 1.5rem;
  border-radius: ${props => props.theme.radius.xl};
  background: ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.xl};
  text-align: center;
  animation: ${popIn} 320ms cubic-bezier(0.2, 0.9, 0.3, 1.05) both;
  ${noMotion}

  h2 {
    font-size: ${props => props.theme.typography.sizes.xl};
    font-weight: ${props => props.theme.typography.weights.bold};
    color: ${props => props.theme.colors.text};
  }
`;

const Muted = styled.p`
  margin-top: 0.5rem;
  color: ${props => props.theme.colors.textSecondary};
`;

// --- The cart scene ---------------------------------------------------------

const DROP_START_MS = 250;
const DROP_EACH_MS = 240;
const DROP_MS = 700;
const MAX_DROPPED = 4;
// How long the scene needs to finish for `count` sheets.
const sceneMs = (count) => DROP_START_MS + (Math.min(count, MAX_DROPPED) - 1) * DROP_EACH_MS + DROP_MS + 200;

const dropIn = keyframes`
  0% { opacity: 0; transform: translate(var(--x), -24px) rotate(var(--r)) scale(1); }
  15% { opacity: 1; }
  65% { opacity: 1; transform: translate(0, 118px) rotate(0deg) scale(0.55); }
  100% { opacity: 0; transform: translate(0, 138px) rotate(0deg) scale(0.35); }
`;

const bump = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  40% { transform: translateY(5px) scale(1.06, 0.94); }
`;

const Scene = styled.div`
  position: relative;
  height: 250px;
  margin: 0 auto;
  width: 240px;
`;

const Falling = styled.div`
  --x: ${props => props.$x}px;
  --r: ${props => props.$r}deg;
  position: absolute;
  top: 0;
  left: calc(50% - 34px);
  width: 68px;
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
  background: ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: ${dropIn} ${DROP_MS}ms cubic-bezier(0.5, 0, 0.6, 1) ${props => DROP_START_MS + props.$i * DROP_EACH_MS}ms both;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }

  span {
    font-size: 0.7rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0;
  }
`;

const CartMark = styled.div`
  position: absolute;
  left: calc(50% - 44px);
  bottom: 4px;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.primary};
  box-shadow: ${props => props.theme.shadows.lg};
  /* Bumps once as each sheet lands. */
  animation: ${bump} ${DROP_EACH_MS}ms ease-out ${DROP_START_MS + DROP_MS * 0.65}ms ${props => props.$count} both;
  ${noMotion}
`;

const CartCount = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 22px;
`;

const SceneStatus = styled.p`
  margin-top: 0.75rem;
  color: white;
  font-weight: ${props => props.theme.typography.weights.semibold};
  animation: ${fadeIn} 250ms ease-out;
`;

function CartScene({ items, status }) {
  const shown = items.slice(0, MAX_DROPPED);
  // Fan the cards out above the cart, a little tilted.
  const spread = [-56, 52, -22, 28];
  const tilt = [-12, 10, -6, 8];
  return (
    <>
      <Scene aria-hidden="true">
        {shown.map((item, i) => (
          <Falling key={item.cart_id} $i={i} $x={spread[i] ?? 0} $r={tilt[i] ?? 0}>
            {item.preview_image_path ? <img src={item.preview_image_path} alt="" /> : <span>{item.course_code}</span>}
          </Falling>
        ))}
        <CartMark $count={shown.length}>
          <ShoppingCart size={40} strokeWidth={1.75} />
          <CartCount>{items.length}</CartCount>
        </CartMark>
      </Scene>
      <SceneStatus key={status} role="status">{status}</SceneStatus>
    </>
  );
}

const Cart = () => {
  const { t } = useTranslation();
  usePageMeta(t('cart.title'));
  const [cart, setCart] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  // null, 'order' (creating the order) or 'qr' (getting the QR) while the
  // payment dialog prepares; the QR shows once qrData is set.
  const [checkoutStage, setCheckoutStage] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoaded, setQrLoaded] = useState(false);
  // What's being bought, kept for the cart scene and the receipt after the
  // cart itself is cleared.
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [codeInput, setCodeInput] = useState('');
  const [appliedCode, setAppliedCode] = useState(null);
  const [codePreview, setCodePreview] = useState(null);
  const [codeError, setCodeError] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);
  const [fullyCoveredResult, setFullyCoveredResult] = useState(null);
  const [removingIds, setRemovingIds] = useState(() => new Set());
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCart();
  const { paidOrder, startWatching, acknowledgePaid, registerActiveLocalOrder, endedOrder, clearEndedOrder } = usePaymentWatch();
  // Set when the order on screen closed unpaid: 'expired' or 'rejected'.
  const [qrEnded, setQrEnded] = useState(null);
  const navigate = useNavigate();

  const paymentConfirmed = Boolean(
    paidOrder && paidOrder.type === 'bundle' && String(paidOrder.id) === String(qrData?.bundle_order_id)
  );

  const fetchCart = useCallback(async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data.cart_items);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error(t('cart.toasts.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  const setRemoving = (cartId, removing) => setRemovingIds(prev => {
    const next = new Set(prev);
    if (removing) next.add(cartId);
    else next.delete(cartId);
    return next;
  });

  const undoRemove = async (item, toastId) => {
    toast.dismiss(toastId);
    try {
      await cartAPI.addToCart(item.cheatsheet_id);
      await fetchCart();
      refreshCartCount();
    } catch {
      toast.error(t('cart.toasts.undoFailed'));
    }
  };

  // The item folds away straight away; the list and totals update in place
  // once the server confirms (no reload), and an Undo puts it back. If the
  // delete fails, the item unfolds again.
  const handleRemove = async (item) => {
    setRemoving(item.cart_id, true);
    try {
      // Let the fold finish before the refreshed list drops the item.
      await Promise.all([
        cartAPI.removeFromCart(item.cart_id),
        new Promise(resolve => setTimeout(resolve, REMOVE_MS)),
      ]);
      await fetchCart();
      refreshCartCount();
      setRemoving(item.cart_id, false);
      toast((tt) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {t('cart.toasts.removedItem', { title: item.title })}
          <button
            type="button"
            onClick={() => undoRemove(item, tt.id)}
            style={{ border: 'none', background: 'none', fontWeight: 600, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}
          >
            {t('cart.undo')}
          </button>
        </span>
      ), { duration: 5000 });
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error(t('cart.toasts.removeFailed'));
      setRemoving(item.cart_id, false);
    }
  };

  const handleApplyCode = async () => {
    if (!codeInput.trim()) return;
    setApplyingCode(true);
    setCodeError('');
    try {
      const response = await discountCodesAPI.validate(codeInput.trim());
      setAppliedCode(codeInput.trim().toUpperCase());
      setCodePreview(response.data);
      if (!response.data.will_apply) {
        toast(t('cart.toasts.bundleBiggerInfo'), { icon: 'ℹ️' });
      }
    } catch (error) {
      setAppliedCode(null);
      setCodePreview(null);
      setCodeError(error.response?.data?.error || t('cart.toasts.applyCodeFailed'));
    } finally {
      setApplyingCode(false);
    }
  };

  const handleRemoveCode = () => {
    setAppliedCode(null);
    setCodePreview(null);
    setCodeError('');
    setCodeInput('');
  };

  // Opens the payment dialog straight away with live progress (creating the
  // order, then the QR), rather than waiting on a disabled button.
  // Opens the payment dialog straight away: the sheets drop into a cart
  // while the order and QR are created, then the receipt with the QR prints
  // out. The scene always gets to finish, however fast the server is.
  const handleCheckout = async () => {
    const items = cart.filter(item => !removingIds.has(item.cart_id));
    const subtotal = parseFloat(summary?.subtotal) || 0;
    const sceneDone = new Promise(resolve => setTimeout(resolve, sceneMs(items.length)));
    setCheckoutItems(items);
    setQrData(null);
    setQrLoaded(false);
    setQrEnded(null);
    setCheckoutStage('order');
    setShowQR(true);
    try {
      const checkoutResponse = await cartAPI.checkout(appliedCode);
      const { bundle_order_id, total_amount, fully_covered } = checkoutResponse.data;

      if (fully_covered) {
        // The code covered everything: nothing to pay, no QR.
        await sceneDone;
        setShowQR(false);
        setCheckoutStage(null);
        setFullyCoveredResult({ bundle_order_id, total_amount });
        setCart([]);
        setSummary(null);
        refreshCartCount();
        return;
      }

      setCheckoutStage('qr');
      const [paymentResponse] = await Promise.all([
        paymentsAPI.createBundlePayment(bundle_order_id),
        sceneDone,
      ]);

      setQrData({
        qr_code: paymentResponse.data.bundle.qr_code,
        amount: parseFloat(total_amount),
        subtotal,
        items,
        bundle_order_id,
      });
      setCheckoutStage(null);
      startWatching('bundle', bundle_order_id);
      setCart([]);
      setSummary(null);
      refreshCartCount();
    } catch (error) {
      console.error('Checkout failed:', error);
      setShowQR(false);
      setCheckoutStage(null);
      if (error.response?.status === 409) {
        toast.error(t('cart.toasts.alreadyOwn'));
      } else {
        toast.error(error.response?.data?.message || t('cart.toasts.checkoutFailed'));
      }
    }
  };

  const preparing = checkoutStage !== null;
  const closeQR = () => { if (!preparing && !paymentConfirmed) setShowQR(false); };

  // Payment status is polled centrally by PaymentWatchContext (persisted
  // across navigation/reload, not just while this dialog is mounted). This
  // tells it which order is visible here, so its global overlay stays away.
  useEffect(() => {
    if (!showQR || !qrData?.bundle_order_id) return undefined;
    registerActiveLocalOrder('bundle', qrData.bundle_order_id);
    return () => registerActiveLocalOrder(null, null);
  }, [showQR, qrData, registerActiveLocalOrder]);

  // The order on screen closed unpaid. The receipt says so; an expired
  // order's sheets are back in the cart (the server put them there), so the
  // cart behind the receipt is reloaded, ready to check out again.
  useEffect(() => {
    const bundleId = qrData?.bundle_order_id;
    if (!showQR || !bundleId || endedOrder?.type !== 'bundle' || String(endedOrder.id) !== String(bundleId)) return;
    clearEndedOrder();
    setQrEnded(endedOrder.reason);
    fetchCart();
    refreshCartCount();
  }, [endedOrder, showQR, qrData, clearEndedOrder, fetchCart, refreshCartCount]);

  // Hold the success animation briefly, then go to the library.
  useEffect(() => {
    if (!paymentConfirmed) return undefined;
    const timeout = setTimeout(() => {
      setShowQR(false);
      acknowledgePaid();
      navigate('/my-purchases');
    }, 1800);
    return () => clearTimeout(timeout);
  }, [paymentConfirmed, acknowledgePaid, navigate]);


  if (loading) {
    return <LoadingSpinner text={t('cart.loadingCart')} />;
  }

  const visibleCount = cart.filter(item => !removingIds.has(item.cart_id)).length;

  if (cart.length === 0 && !showQR && !fullyCoveredResult) {
    return (
      <Container>
        <EmptyState
          variant="cart"
          seed="empty-cart"
          title={t('cart.emptyState.title')}
          body={t('cart.emptyState.body')}
          actions={(
            <>
              <EmptyStateButton $primary onClick={() => navigate('/')}>{t('footer.browseCheatSheets')}</EmptyStateButton>
              <EmptyStateButton onClick={() => navigate('/my-purchases')}>{t('cart.emptyState.openLibrary')}</EmptyStateButton>
            </>
          )}
        />
      </Container>
    );
  }

  const codeWins = appliedCode && codePreview?.will_apply;
  const total = codeWins ? codePreview.total_after_discount : summary?.total;

  return (
    <Container>
      <Title>
        <CartIcon size={32} />
        {t('cart.title')}
        {visibleCount > 0 && <ItemCount>{t('cart.itemCount', { count: visibleCount })}</ItemCount>}
      </Title>

      <Grid>
        <CartItems>
          {cart.map((item, index) => (
            <Collapsible key={item.cart_id} open={!removingIds.has(item.cart_id)} duration={REMOVE_MS} bounce={false}>
              <ItemSlot>
                <CartItem $index={index}>
                  <Thumb to={`/cheatsheet/${item.cheatsheet_id}`} tabIndex={-1} aria-hidden="true">
                    {item.preview_image_path && <img src={item.preview_image_path} alt="" loading="lazy" />}
                  </Thumb>
                  <ItemDetails>
                    <CourseCode>{item.course_code}</CourseCode>
                    <ItemTitle to={`/cheatsheet/${item.cheatsheet_id}`}>{item.title}</ItemTitle>
                  </ItemDetails>
                  <ItemSide>
                    <ItemPrice>{baht(item.price)}</ItemPrice>
                    <RemoveButton
                      type="button"
                      onClick={() => handleRemove(item)}
                      disabled={removingIds.has(item.cart_id)}
                      aria-label={t('cart.removeItem', { title: item.title })}
                      title={t('cart.remove')}
                    >
                      <TrashIcon size={18} />
                    </RemoveButton>
                  </ItemSide>
                </CartItem>
              </ItemSlot>
            </Collapsible>
          ))}
        </CartItems>

        {summary && (
          <Summary>
            <SummaryTitle>{t('cart.orderSummary')}</SummaryTitle>

            <Row>
              <span>{t('cart.subtotal', { count: summary.item_count })}</span>
              <span>{baht(summary.subtotal)}</span>
            </Row>

            {/* Codes and the bundle discount never stack server-side — only
                the bigger one applies (discountCodeService.js's
                resolveBestDiscount). Once a code wins, the bundle line isn't
                what's charged, so it's hidden rather than contradicting the
                total. */}
            {summary.is_bundle && summary.discount_amount > 0 && !codeWins && (
              <SavingRow>
                <span>{t('cart.bundleDiscount', { percent: summary.discount_percentage })}</span>
                <span>−{baht(summary.discount_amount)}</span>
              </SavingRow>
            )}
            {codeWins && (
              <SavingRow>
                <span>{appliedCode}</span>
                <span>−{baht(codePreview.discount_amount)}</span>
              </SavingRow>
            )}

            {visibleCount === 1 && summary.max_discount_percentage > 0 && (
              <Callout>
                <strong>{t('cart.bundleDiscountAvailableTitle')}</strong>{' '}
                {t('cart.bundleDiscountAvailableBody', { percent: summary.max_discount_percentage })}
              </Callout>
            )}

            {!appliedCode ? (
              <CodeRow>
                <CodeInput
                  placeholder={t('cart.discountCodePlaceholder')}
                  aria-label={t('cart.discountCodePlaceholder')}
                  value={codeInput}
                  disabled={applyingCode}
                  onChange={(e) => { setCodeInput(e.target.value); setCodeError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
                />
                <ApplyButton type="button" onClick={handleApplyCode} disabled={applyingCode || !codeInput.trim()}>
                  {applyingCode ? <Spinner aria-label={t('cart.checking')} /> : t('cart.apply')}
                </ApplyButton>
              </CodeRow>
            ) : (
              <AppliedCode>
                <span>
                  {codeWins
                    ? t('cart.codeAppliedSaving', { code: appliedCode, amount: parseFloat(codePreview.discount_amount).toFixed(2) })
                    : t('cart.codeAppliedNoBenefit', { code: appliedCode })}
                </span>
                <button type="button" onClick={handleRemoveCode}>{t('cart.remove')}</button>
              </AppliedCode>
            )}
            {codeError && <CodeError role="alert">{codeError}</CodeError>}

            <TotalRow>
              <span>{t('cart.total')}</span>
              <Amount key={total}>{baht(total)}</Amount>
            </TotalRow>

            <PrimaryButton type="button" onClick={handleCheckout} disabled={preparing || visibleCount === 0}>
              {preparing ? <><Spinner />{t('cart.processing')}</> : t('cart.proceedToCheckout')}
            </PrimaryButton>

            {summary.is_bundle && !codeWins && <Note>{t('cart.bundleDiscountAutoApplied')}</Note>}
          </Summary>
        )}
      </Grid>

      {fullyCoveredResult && (
        <Overlay onClick={() => setFullyCoveredResult(null)}>
          <Dialog role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <PaymentSuccessCheck size={80} />
            <h2 style={{ marginTop: '1rem' }}>{t('cart.redeemed.title')}</h2>
            <Muted>{t('cart.redeemed.body')}</Muted>
            <PrimaryButton type="button" onClick={() => { setFullyCoveredResult(null); navigate('/my-purchases'); }}>
              {t('cart.redeemed.goToMyPurchases')}
            </PrimaryButton>
          </Dialog>
        </Overlay>
      )}

      {showQR && (
        <ReceiptOverlay
          label={t('cart.scanToPay.title')}
          onClose={preparing || paymentConfirmed ? undefined : closeQR}
        >
          {preparing || !qrData ? (
            <CartScene
              items={checkoutItems}
              status={checkoutStage === 'order' ? t('cart.preparing.order') : t('cart.preparing.qr')}
            />
          ) : (
            <>
              <PaymentReceipt
                items={qrData.items.map(item => ({ key: item.cart_id, course_code: item.course_code, title: item.title, price: item.price }))}
                subtotal={qrData.subtotal}
                amount={qrData.amount}
                qrCode={qrData.qr_code}
                qrLoaded={qrLoaded}
                onQrLoad={() => setQrLoaded(true)}
                paid={paymentConfirmed}
                onClose={closeQR}
                ended={qrEnded}
                action={qrEnded && {
                  label: t(qrEnded === 'expired' ? 'cart.receipt.backToCart' : 'cart.receipt.close'),
                  onClick: () => setShowQR(false),
                }}
                t={t}
              />
              {!paymentConfirmed && !qrEnded && (
                <PayLaterButton type="button" onClick={() => { setShowQR(false); navigate('/my-purchases'); }}>
                  {t('cart.scanToPay.payLater')}
                </PayLaterButton>
              )}
            </>
          )}
        </ReceiptOverlay>
      )}
    </Container>
  );
};

export default Cart;
