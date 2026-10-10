import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, CheckCircle2, X } from 'lucide-react';
import { useSupportWatch } from '../context/SupportWatchContext';

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Card = styled.div`
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 2500;
  width: 360px;
  max-width: calc(100vw - 2rem);
  padding: 1rem 1rem 0.875rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-left: 4px solid ${props => props.$resolved ? props.theme.colors.success : props.theme.colors.primary};
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  animation: ${slideIn} 0.25s ease-out;

  @media (max-width: 768px) {
    right: 1rem;
    left: 1rem;
    bottom: 1rem;
    width: auto;
    max-width: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.semibold};

  > svg {
    flex-shrink: 0;
    color: ${props => props.$resolved ? props.theme.colors.success : props.theme.colors.primary};
  }

  span { flex: 1; }
`;

const CloseButton = styled.button`
  display: flex;
  padding: 0.25rem;
  border: none;
  background: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
`;

const Body = styled.p`
  margin: 0.4rem 0 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.45rem 0.9rem;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  border: 1px solid ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$primary ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$primary ? 'white' : props.theme.colors.textSecondary};

  &:hover {
    background: ${props => props.$primary ? props.theme.colors.primaryHover : props.theme.colors.backgroundSecondary};
  }
`;

// Global popup for support-chat activity, shown on whatever page the user is
// on. Driven by SupportWatchProvider.
const SupportReplyNotice = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notice, dismissNotice } = useSupportWatch();

  if (!notice) return null;

  const resolved = notice.kind === 'resolved';
  const openTicket = () => {
    dismissNotice();
    navigate(notice.ticketId ? `/support?ticket=${notice.ticketId}` : '/support');
  };

  return (
    <Card $resolved={resolved} role="status" aria-live="polite">
      <Header $resolved={resolved}>
        {resolved ? <CheckCircle2 size={18} /> : <MessageCircle size={18} />}
        <span>
          {resolved
            ? t('supportWatch.resolvedTitle', { id: notice.ticketId })
            : t('supportWatch.replyTitle', { id: notice.ticketId })}
        </span>
        <CloseButton type="button" onClick={dismissNotice} aria-label={t('common.close')}>
          <X size={16} />
        </CloseButton>
      </Header>
      <Body>{resolved ? t('supportWatch.resolvedBody') : (notice.text || t('supportWatch.replyFallback'))}</Body>
      <Actions>
        <Button type="button" onClick={dismissNotice}>
          {resolved ? t('supportWatch.ok') : t('supportWatch.later')}
        </Button>
        <Button type="button" $primary onClick={openTicket}>
          {resolved ? t('supportWatch.viewTicket') : t('supportWatch.openChat')}
        </Button>
      </Actions>
    </Card>
  );
};

export default SupportReplyNotice;
