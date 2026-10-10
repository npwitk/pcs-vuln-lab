import React, { useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { CheckCircle2, Clock, X, XCircle } from 'lucide-react';
import PromptPayLogo from '../PromptPayLogo';
import { baht } from '../../utils/money';

// The PromptPay payment receipt: a slip that "prints" out, listing what's
// being paid for and the total, with the square QR and a live "waiting"
// state, and a PAID stamp when the payment lands. If the order closes unpaid
// (its QR expired, or an admin rejected it) the QR fades under an EXPIRED or
// CANCELLED stamp instead. Used by the cart's checkout and by My Library's
// "Pay with QR".

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.55); }
  70% { box-shadow: 0 0 0 8px rgba(52, 199, 89, 0); }
  100% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0); }
`;

const shimmer = keyframes`
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
`;

const noMotion = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`;

// --- Overlay ----------------------------------------------------------------

// The dim backdrop is what scrolls on short screens, not the content box:
// a scrolling box clips everything drawn outside it, including the
// receipt's shadow.
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  animation: ${fadeIn} 200ms ease-out;
  ${noMotion}
`;

// No card, no clipping: holds the receipt (or the cart's scene) and the
// "pay later" link under it. margin: auto centres it while still letting a
// tall receipt scroll from the top.
const Stage = styled.div`
  position: relative;
  width: 100%;
  max-width: 380px;
  margin: auto;
  padding: 0.5rem 0 1rem;
  text-align: center;
`;

// Full-screen dim with the payment content centred. Escape and a click
// outside call onClose (pass nothing while it can't be closed).
export function ReceiptOverlay({ onClose, label, children }) {
  useEffect(() => {
    if (!onClose) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <Backdrop onClick={() => onClose && onClose()}>
      <Stage role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        {children}
      </Stage>
    </Backdrop>
  );
}

export const PayLaterButton = styled.button`
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  animation: ${fadeIn} 300ms ease-out 700ms both;

  &:hover { color: white; }
`;

// --- The receipt ------------------------------------------------------------

// Printing reveals the slip top to bottom. The clip only exists while it
// runs ("backwards" fill: afterwards the slip has no clip-path at all).
const PRINT_MS = 700;
const printOut = keyframes`
  from { clip-path: inset(0 0 100% 0); transform: translateY(-24px); }
  to { clip-path: inset(0 0 -14px 0); transform: translateY(0); }
`;

// The shadow fades in only once the slip has printed. Safari can paint a
// filter on an element whose clip-path is animating as a black box, so the
// two never overlap: this wrapper has no filter at all until then.
const shadowIn = keyframes`
  from { filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0)); }
  to { filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.28)); }
`;

const ReceiptShadow = styled.div`
  margin-bottom: 20px;
  animation: ${shadowIn} 400ms ease-out ${PRINT_MS}ms forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    /* drop-shadow, not box-shadow: it follows the torn edge. */
    filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.28));
  }
`;

const Receipt = styled.section`
  position: relative;
  padding: 1.5rem 1.25rem 1.25rem;
  border-radius: ${props => props.theme.radius.lg} ${props => props.theme.radius.lg} 0 0;
  background: ${props => props.theme.colors.surface};
  animation: ${printOut} ${PRINT_MS}ms cubic-bezier(0.25, 0.8, 0.25, 1) backwards;
  ${noMotion}

  /* Torn zigzag edge along the bottom. */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -12px;
    height: 12px;
    background:
      linear-gradient(135deg, ${props => props.theme.colors.surface} 50%, transparent 50%) 0 0 / 16px 12px repeat-x,
      linear-gradient(225deg, ${props => props.theme.colors.surface} 50%, transparent 50%) 0 0 / 16px 12px repeat-x;
  }
`;

const Logo = styled(PromptPayLogo)`
  margin: 0 auto;
`;

const ReceiptTitle = styled.h2`
  margin-top: 0.75rem;
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
`;

const Perforation = styled.hr`
  margin: 1rem 0;
  border: none;
  border-top: 2px dashed ${props => props.theme.colors.border};
`;

const Lines = styled.dl`
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8rem;
  text-align: left;
  color: ${props => props.theme.colors.textSecondary};

  div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.2rem 0;
  }

  dt {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  dd { margin: 0; flex-shrink: 0; }
`;

const SavingLine = styled.div`
  && { color: ${props => props.theme.colors.success}; }
`;

const TotalLine = styled.div`
  && {
    margin-top: 0.4rem;
    padding-top: 0.5rem;
    border-top: 1px solid ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
    font-size: 1.05rem;
    font-weight: 700;
  }
`;

// The QR is square; a white tile so it scans the same in either theme.
const QRTile = styled.div`
  position: relative;
  width: 220px;
  height: 220px;
  max-width: 100%;
  margin: 0 auto;
  padding: 10px;
  border-radius: ${props => props.theme.radius.md};
  background: #FFFFFF;
`;

const QRPlaceholder = styled.div`
  position: absolute;
  inset: 10px;
  border-radius: 6px;
  background: linear-gradient(90deg, #F2F2F4 25%, #E6E6EA 50%, #F2F2F4 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.2s linear infinite;
  opacity: ${props => (props.$hidden ? 0 : 1)};
  transition: opacity 250ms ease;
`;

const QRImage = styled.img`
  position: relative;
  display: block;
  width: 200px;
  height: 200px;
  max-width: 100%;
  opacity: ${props => (!props.$loaded ? 0 : props.$ended ? 0.15 : 1)};
  filter: ${props => (props.$ended ? 'grayscale(1)' : 'none')};
  transition: opacity 350ms ease 150ms;
  ${noMotion}
`;

const stampIn = keyframes`
  0% { opacity: 0; transform: translate(-50%, -50%) rotate(-12deg) scale(2.4); }
  55% { opacity: 1; transform: translate(-50%, -50%) rotate(-12deg) scale(0.9); }
  75% { transform: translate(-50%, -50%) rotate(-12deg) scale(1.04); }
  100% { opacity: 1; transform: translate(-50%, -50%) rotate(-12deg) scale(1); }
`;

// Speckled ink: fractal noise turned into an alpha mask, so the stamp prints
// mostly solid with small gaps, like a rubber stamp on paper.
const INK_TEXTURE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>"
  + "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='7'/>"
  + "<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  6 0 0 0 -1.6'/></filter>"
  + "<rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

// A rubber PAID stamp over the QR: tilted, big letters, double rim.
const PaidStamp = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-12deg);
  animation: ${stampIn} 480ms cubic-bezier(0.3, 1.3, 0.5, 1) both;
  ${noMotion}
`;

// A faint wash under the ink so the letters read over the QR's black modules.
const StampWash = styled.span`
  position: absolute;
  inset: -8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.55);
`;

const StampInk = styled.span`
  position: relative;
  display: block;
  padding: 0.15rem 1.1rem 0.2rem;
  border: 5px solid currentColor;
  border-radius: 12px;
  outline: 2px solid currentColor;
  outline-offset: 4px;
  color: ${props => (props.$ended ? '#6E6E73' : '#177A36')};
  /* Sized to the word so it stays within the QR: PAID, EXPIRED, CANCELLED. */
  font-size: ${props => (props.$letters <= 4 ? '3.4rem' : props.$letters <= 7 ? '1.9rem' : '1.45rem')};
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: 0.1em;
  white-space: nowrap;
  -webkit-mask-image: ${INK_TEXTURE};
  mask-image: ${INK_TEXTURE};
  -webkit-mask-size: 160px 160px;
  mask-size: 160px 160px;
`;

const Waiting = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.875rem;
  color: ${props => (props.$paid ? props.theme.colors.success : props.theme.colors.textSecondary)};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
`;

const LiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme.colors.success};
  animation: ${pulse} 1.8s ease-out infinite;
  ${noMotion}
`;

const EndedAction = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.primary};
  color: #fff;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  animation: ${fadeIn} 300ms ease-out;

  &:hover { filter: brightness(1.08); }
  &:disabled { opacity: 0.6; cursor: default; }
`;

const Hint = styled.p`
  margin-top: 0.4rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.xs};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  z-index: 1;
  display: inline-flex;
  padding: 0.4rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;

  &:hover { background: ${props => props.theme.colors.backgroundSecondary}; color: ${props => props.theme.colors.text}; }
`;

const RECEIPT_LINES = 3;

// items: [{ key, course_code, title, price }]; subtotal is what they'd cost
// at full price, so the difference from `amount` shows as a discount line.
// `ended`: the order closed unpaid, 'expired' or 'rejected'; `action` is the
// way on from there ({ label, onClick, busy }).
export default function PaymentReceipt({
  items, subtotal, amount, qrCode, qrLoaded, onQrLoad, paid, onClose, ended = null, action = null, t,
}) {
  const discount = Math.max(0, (Number(subtotal) || 0) - (Number(amount) || 0));
  const extra = items.length - RECEIPT_LINES;
  const stamp = paid ? t('cart.receipt.paid') : ended ? t(`cart.receipt.${ended}.stamp`) : '';
  return (
    <ReceiptShadow>
      <Receipt aria-labelledby="pay-title">
        {!paid && onClose && (
          <CloseButton type="button" onClick={onClose} aria-label={t('cart.scanToPay.close')}>
            <X size={18} />
          </CloseButton>
        )}
        <Logo width={104} />
        <ReceiptTitle id="pay-title">
          {paid ? t('cart.paymentConfirmed.title') : ended ? t(`cart.receipt.${ended}.title`) : t('cart.scanToPay.title')}
        </ReceiptTitle>

        <Perforation />
        <Lines>
          {items.slice(0, RECEIPT_LINES).map(item => (
            <div key={item.key}>
              <dt>{item.course_code} {item.title}</dt>
              <dd>{baht(item.price, { always2: true })}</dd>
            </div>
          ))}
          {extra > 0 && (
            <div><dt>{t('cart.receipt.more', { count: extra })}</dt><dd /></div>
          )}
          {discount > 0.004 && (
            <SavingLine><dt>{t('cart.receipt.discount')}</dt><dd>−{baht(discount, { always2: true })}</dd></SavingLine>
          )}
          <TotalLine>
            <dt>{t('cart.total')}</dt>
            <dd>{baht(amount, { always2: true })}</dd>
          </TotalLine>
        </Lines>
        <Perforation />

        <QRTile>
          <QRPlaceholder $hidden={qrLoaded} />
          {/* Keyed by the QR, so a replacement fades in afresh. */}
          <QRImage
            key={qrCode}
            src={qrCode}
            alt={t('cart.scanToPay.qrAlt')}
            $loaded={qrLoaded}
            $ended={!!ended}
            onLoad={onQrLoad}
          />
          {(paid || ended) && (
            <PaidStamp aria-hidden="true">
              <StampWash />
              <StampInk $ended={!paid} $letters={stamp.length}>{stamp}</StampInk>
            </PaidStamp>
          )}
        </QRTile>

        {ended ? (
          <>
            <Waiting role="status">
              {ended === 'expired' ? <Clock size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
              {t(`cart.receipt.${ended}.status`)}
            </Waiting>
            <Hint>{t(`cart.receipt.${ended}.body`)}</Hint>
            {action && (
              <EndedAction type="button" onClick={action.onClick} disabled={action.busy}>{action.label}</EndedAction>
            )}
          </>
        ) : (
          <>
            <Waiting role="status" $paid={paid}>
              {paid ? <CheckCircle2 size={16} aria-hidden="true" /> : <LiveDot aria-hidden="true" />}
              {paid ? t('cart.paymentConfirmed.redirecting') : t('cart.scanToPay.waiting')}
            </Waiting>
            {!paid && <Hint>{t('cart.receipt.hint', { amount: baht(amount, { always2: true }) })}</Hint>}
          </>
        )}
      </Receipt>
    </ReceiptShadow>
  );
}
