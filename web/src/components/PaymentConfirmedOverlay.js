import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePaymentWatch } from '../context/PaymentWatchContext';
import PaymentSuccessCheck from './PaymentSuccessCheck';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background};
  animation: ${fadeIn} 0.25s ease-out;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h2`
  margin-top: 1rem;
  color: ${props => props.theme.colors.text};
`;

const Subtitle = styled.p`
  margin-top: 0.5rem;
  color: ${props => props.theme.colors.textSecondary};
`;

// Mounted once at the app root. Shows the same success-checkmark animation
// used by the checkout QR modals whenever a payment gets confirmed while
// the buyer isn't looking at that modal — e.g. a manual PromptPay approval
// that lands after they've navigated away, closed it, or reopened the tab.
// Stays silent if a page is already showing the matching order inline
// (see PaymentWatchContext's activeLocalOrder) to avoid a duplicate popup.
const PaymentConfirmedOverlay = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { paidOrder, activeLocalOrder, acknowledgePaid } = usePaymentWatch();

  const isHandledLocally = paidOrder && activeLocalOrder
    && activeLocalOrder.type === paidOrder.type
    && String(activeLocalOrder.id) === String(paidOrder.id);

  const shouldShow = Boolean(paidOrder) && !isHandledLocally;

  useEffect(() => {
    if (!shouldShow) return undefined;
    const timeout = setTimeout(() => {
      acknowledgePaid();
      navigate('/my-purchases');
    }, 1800);
    return () => clearTimeout(timeout);
  }, [shouldShow, acknowledgePaid, navigate]);

  if (!shouldShow) return null;

  return (
    <Overlay>
      <Card>
        <PaymentSuccessCheck size={112} />
        <Title>{t('cart.paymentConfirmed.title')}</Title>
        <Subtitle>{t('cart.paymentConfirmed.redirecting')}</Subtitle>
      </Card>
    </Overlay>
  );
};

export default PaymentConfirmedOverlay;
