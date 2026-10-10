import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { purchasesAPI, paymentsAPI, downloadTransferAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { meshGradient } from '../utils/meshGradient';
import ExpandableText from '../components/ExpandableText';
import { Gift, Search, Download, QrCode, ShieldCheck, RefreshCw, Sparkles, Send, ChevronRight } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import { formatExamTypes } from '../utils/examTypes';
import PaymentReceipt, { ReceiptOverlay, PayLaterButton } from '../components/payment/PaymentReceipt';
import { usePaymentWatch } from '../context/PaymentWatchContext';
import { baht } from '../utils/money';

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
  margin-bottom: 1.25rem;
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.85rem;
  color: ${props => props.theme.colors.textTertiary};
  pointer-events: none;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.base};
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const ResultCount = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.75rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: transform 0.18s, box-shadow 0.18s;
  ${props => props.$updated && `
    border-color: #f59e0b;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
  `}

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.$updated
      ? '0 0 0 2px rgba(245, 158, 11, 0.4), 0 8px 24px rgba(245, 158, 11, 0.15)'
      : props.theme.shadows.lg};
  }
`;

// Cover and title open the sheet's detail page, so the action bar only needs
// Download and Transfer code.
const CoverButton = styled.button`
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
`;

const CoverImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
`;

const CoverPlaceholder = styled.div`
  width: 100%;
  height: 160px;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: ${props => props.theme.typography.weights.bold};
  color: white;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.25);
`;


const UpdateBadge = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  background: #f59e0b;
  color: white;
  font-size: 0.65rem;
  font-weight: ${props => props.theme.typography.weights.bold};
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.45);
`;

const CardBody = styled.div`
  padding: 1rem 1rem 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const PillRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const CourseCode = styled.span`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const ExamTypePill = styled.span`
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.medium};
`;

const StatusPill = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  background: ${props => {
    switch (props.$status) {
      case 'paid': return props.theme.colors.success;
      case 'pending': return props.theme.colors.warning;
      case 'failed': return props.theme.colors.error;
      default: return props.theme.colors.textTertiary;
    }
  }};
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const GiftPill = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
`;

const CardTitle = styled.h3`
  cursor: pointer;
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

// Seller's note for the update the buyer hasn't downloaded yet.
const WhatsNewCallout = styled.div`
  margin-top: 0.4rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid rgba(245, 158, 11, 0.45);
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)'};
  font-size: ${props => props.theme.typography.sizes.xs};
  line-height: 1.5;
  color: ${props => props.theme.colors.text};

  .whats-new-title {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.25rem;
    font-weight: ${props => props.theme.typography.weights.bold};
    color: #d97706;
  }
`;

const CardMeta = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: auto;
  padding-top: 0.5rem;
`;

const ActionBar = styled.div`
  display: flex;
  border-top: 1px solid ${props => props.theme.colors.border};
  margin-top: 0.75rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.7rem 0.5rem;
  border: none;
  background: ${props => props.$primary
    ? props.disabled ? props.theme.colors.textTertiary : props.theme.colors.primary
    : 'transparent'};
  color: ${props => props.$primary ? 'white' : props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.15s, color 0.15s;
  border-right: ${props => props.$primary ? `1px solid ${props.theme.colors.border}` : 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;

  &:disabled:not([data-primary]) {
    color: ${props => props.theme.colors.textTertiary};
  }

  &:hover:not(:disabled) {
    background: ${props => props.$primary
      ? props.theme.colors.primaryHover
      : props.theme.colors.backgroundSecondary};
    color: ${props => props.$primary ? 'white' : props.theme.colors.text};
  }
`;

// The Download button while the file arrives: a pale track that fills in
// its full colour, with the percentage on top.
const indeterminate = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
`;

const DownloadProgress = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 0.5rem;
  background: ${props => (props.$update ? '#f59e0b' : props.theme.colors.primary)}4D;
  border-right: 1px solid ${props => props.theme.colors.border};
`;

const ProgressFill = styled.span`
  position: absolute;
  inset: 0 auto 0 0;
  background: ${props => (props.$update ? 'linear-gradient(135deg, #f59e0b, #d97706)' : props.theme.colors.primary)};
  transition: width 200ms linear;

  ${props => props.$indeterminate && css`
    /* No bytes yet (the watermark is being added): a sweeping sliver. */
    width: 40% !important;
    animation: ${indeterminate} 1.1s ease-in-out infinite;
  `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`;

const ProgressLabel = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: white;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
`;

const UpdateActionButton = styled.button`
  flex: 1;
  padding: 0.7rem 0.5rem;
  border: none;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: filter 0.15s;
  border-right: 1px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }
`;

// An unpaid cart checkout: its sheets grouped as one card, paid together
// (the server refuses paying one of them alone; they share a bundle price).
const BundleCard = styled.article`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.25rem 1.5rem;
  padding: 1.25rem 1.5rem;
  border: 1.5px solid ${props => props.theme.colors.warning}66;
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => props.theme.colors.surface};

  /* Phones: covers beside the title, price and button full width below. */
  @media (max-width: 768px) {
    grid-template-columns: auto 1fr;
    gap: 1rem;
    padding: 1.125rem;
  }
`;

const CoverFan = styled.div`
  position: relative;
  width: ${props => 72 + (props.$count - 1) * 26}px;
  height: 96px;
  flex-shrink: 0;
`;

const FanCover = styled.div`
  position: absolute;
  top: 0;
  left: ${props => props.$i * 26}px;
  width: 72px;
  height: 96px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.md};
  transform: rotate(${props => (props.$i - (props.$count - 1) / 2) * 5}deg);
  background: ${props => props.theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const BundleInfo = styled.div`
  min-width: 0;

  h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: ${props => props.theme.typography.sizes.base};
    font-weight: ${props => props.theme.typography.weights.bold};
    color: ${props => props.theme.colors.text};
    margin-bottom: 0.4rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.sizes.sm};
    line-height: 1.6;
  }

  li {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong { color: ${props => props.theme.colors.text}; font-weight: ${props => props.theme.typography.weights.semibold}; }
`;

const BundlePay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  text-align: right;

  @media (max-width: 768px) {
    grid-column: 1 / -1;
    align-items: stretch;
    text-align: left;
  }
`;

const BundlePrice = styled.div`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  font-variant-numeric: tabular-nums;

  s {
    margin-right: 0.5rem;
    font-size: ${props => props.theme.typography.sizes.sm};
    font-weight: ${props => props.theme.typography.weights.medium};
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const BundleSaving = styled.span`
  color: ${props => props.theme.colors.success};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
`;

// The order card's pay button: a rounded rectangle, not the full-bleed
// action-bar button the sheet cards use.
const PayButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.7rem 1.1rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.65;
    cursor: default;
  }
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionHeader = styled.div`
  margin-bottom: 1rem;

  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: ${props => props.theme.typography.sizes.xl};
    font-weight: ${props => props.theme.typography.weights.bold};
    color: ${props => props.theme.colors.text};

    span {
      color: ${props => props.theme.colors.textSecondary};
      font-weight: ${props => props.theme.typography.weights.medium};
    }
  }

  p {
    margin: 0.25rem 0 0;
    font-size: ${props => props.theme.typography.sizes.sm};
    color: ${props => props.theme.colors.textSecondary};
  }
`;

// Updated sheets sit at the top in a tinted panel so they can't be missed.
const UpdatesPanel = styled(Section)`
  padding: 1.25rem;
  border: 1.5px solid #f59e0b;
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => props.theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)'};

  h2 svg { color: #f59e0b; }
`;

const InactiveOrders = styled.details`
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => props.theme.colors.surface};

  summary {
    padding: 1rem 1.25rem;
    cursor: pointer;
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.textSecondary};
  }

  summary + p {
    margin: 0;
    padding: 0 1.25rem 0.75rem;
    font-size: ${props => props.theme.typography.sizes.sm};
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const InactiveRow = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1.25rem;
  border: none;
  border-top: 1px solid ${props => props.theme.colors.border};
  background: none;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  text-align: left;
  cursor: pointer;

  &:hover { background: ${props => props.theme.colors.backgroundSecondary}; }

  .title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${props => props.theme.colors.text};
  }

  .meta { white-space: nowrap; }

  @media (max-width: 540px) {
    .meta { display: none; }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};

  h2 {
    font-size: ${props => props.theme.typography.sizes['2xl']};
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.typography.weights.semibold};
  }

  p {
    margin-bottom: 2rem;
    font-size: ${props => props.theme.typography.sizes.base};
  }
`;

const BrowseButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.base};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const UsageNotice = styled.div`
  display: flex;
  gap: 0.6rem;
  max-width: 360px;
  flex-shrink: 0;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 152, 0, 0.1)'
    : 'rgba(255, 152, 0, 0.08)'};
  border: 1px solid ${props => props.theme.colors.warning};
  color: ${props => props.theme.colors.textSecondary};
  padding: 0.75rem 0.9rem;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.xs};
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: ${props => props.theme.colors.warning};
  }

  strong {
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.typography.weights.semibold};
  }

  margin-bottom: 1.25rem;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const ModalButton = styled.button`
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.base};
  cursor: pointer;
  margin-top: 1.5rem;
  transition: background 0.15s;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const SecondaryModalButton = styled(ModalButton)`
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border: 1.5px solid ${props => props.theme.colors.border};
  margin-top: 0.75rem;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const TransferSheetInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const TransferSheetCourseCode = styled.span`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-transform: uppercase;
`;

const TransferCodeDisplay = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 0.4rem;
  color: ${props => props.theme.colors.primary};
  margin: 1.25rem 0 0.5rem;
  font-variant-numeric: tabular-nums;
`;

const TransferCountdown = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.$urgent ? props.theme.colors.error : props.theme.colors.textSecondary};
`;


const UPDATE_PIN_DAYS = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

const MyPurchases = () => {
  const { t } = useTranslation();
  usePageMeta(t('myPurchases.title'));
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);
  // 0-1 while the file arrives, or null while the server prepares it (the
  // watermark is added before the first byte is sent).
  const [downloadProgress, setDownloadProgress] = useState(null);
  // The order being paid, shown as a receipt: { kind: 'single' | 'bundle',
  // id, items, subtotal, amount, qrCode }.
  const [payment, setPayment] = useState(null);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [openingPayFor, setOpeningPayFor] = useState(null);
  // One QR refresh at a time per expiry.
  const [restarting, setRestarting] = useState(false);
  const { paidOrder, startWatching, acknowledgePaid, registerActiveLocalOrder, endedOrder, clearEndedOrder } = usePaymentWatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [transferModal, setTransferModal] = useState(null);
  const [generatingTransferFor, setGeneratingTransferFor] = useState(null);
  const [transferSecondsLeft, setTransferSecondsLeft] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPurchases();
  }, []);

  // Live mm:ss countdown while the transfer code modal is open.
  useEffect(() => {
    if (!transferModal) return undefined;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(transferModal.expiresAt).getTime() - Date.now()) / 1000));
      setTransferSecondsLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [transferModal]);

  const fetchPurchases = async () => {
    try {
      const response = await purchasesAPI.getMyPurchases();
      setPurchases(response.data.purchases);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
      toast.error(t('myPurchases.toasts.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // The download's size: the server's exact X-File-Size header (readable
  // once the response starts), else the sheet's listed size as an estimate.
  // Content-Length is deliberately never sent (routes/purchases.js).
  const downloadTotal = (progressEvent, purchase) => {
    if (progressEvent.total) return { bytes: progressEvent.total, exact: true };
    const header = progressEvent.event?.target?.getResponseHeader?.('X-File-Size');
    if (Number(header) > 0) return { bytes: Number(header), exact: true };
    const listedMb = parseFloat(purchase?.file_size_mb);
    return listedMb > 0 ? { bytes: listedMb * 1024 * 1024, exact: false } : null;
  };

  const handleDownload = async (purchase) => {
    const { order_id: orderId, title } = purchase;
    setDownloadingOrderId(orderId);
    setDownloadProgress(null);

    try {
      const onProgress = (progressEvent) => {
        const total = downloadTotal(progressEvent, purchase);
        if (!total || !progressEvent.loaded) return;
        // An estimate never claims to be finished before the file is.
        const cap = total.exact ? 1 : 0.99;
        setDownloadProgress(Math.min(progressEvent.loaded / total.bytes, cap));
      };

      const response = await purchasesAPI.downloadCheatSheet(orderId, onProgress);
      setDownloadProgress(1);
      const studentId = user?.email ? user.email.split('@')[0] : 'unknown';

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title} - ${studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(t('myPurchases.toasts.downloadCompleted'));
      fetchPurchases();
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(error.response?.data?.message || t('myPurchases.toasts.downloadFailed'));
    } finally {
      setDownloadingOrderId(null);
      setDownloadProgress(null);
    }
  };

  const fullPrice = (p) => parseFloat(p.original_price ?? p.payment_amount) || 0;
  const receiptItem = (p) => ({ key: p.order_id, course_code: p.course_code, title: p.title, price: fullPrice(p) });

  const openPayment = (next) => {
    setQrLoaded(false);
    setPayment({ ...next, ended: null });
    startWatching(next.kind, next.id);
  };

  // A stored QR that turns out to have expired closes its order (410): the
  // list is out of date, and a bundle's sheets are back in the cart.
  const handleOrderExpired = (error) => {
    if (error.response?.status !== 410) return false;
    toast.error(error.response.data?.message || t('cart.receipt.expired.body'));
    fetchPurchases();
    return true;
  };

  // A cart checkout's orders share a bundle price and are paid together.
  const payBundle = async (bundleOrderId) => {
    const members = purchases.filter(p => p.bundle_order_id === bundleOrderId && p.payment_status === 'pending');
    setOpeningPayFor(bundleOrderId);
    try {
      const { data } = await paymentsAPI.createBundlePayment(bundleOrderId);
      if (data.bundle.status === 'paid') {
        toast.success(t('myPurchases.toasts.nothingToPay'));
        fetchPurchases();
        return;
      }
      openPayment({
        kind: 'bundle',
        id: bundleOrderId,
        items: members.map(receiptItem),
        subtotal: members.reduce((sum, p) => sum + fullPrice(p), 0),
        amount: parseFloat(data.bundle.total_amount),
        qrCode: data.bundle.qr_code,
      });
    } catch (error) {
      if (handleOrderExpired(error)) return;
      console.error('Failed to open bundle payment:', error);
      toast.error(error.response?.data?.message || t('myPurchases.toasts.qrFetchFailed'));
    } finally {
      setOpeningPayFor(null);
    }
  };

  const handleShowQR = async (purchase) => {
    if (purchase.bundle_order_id) {
      payBundle(purchase.bundle_order_id);
      return;
    }
    setOpeningPayFor(purchase.order_id);
    try {
      const { data } = await paymentsAPI.getQRCode(purchase.order_id);
      openPayment({
        kind: 'single',
        id: purchase.order_id,
        cheatsheetId: purchase.cheatsheet_id,
        items: [receiptItem(purchase)],
        subtotal: fullPrice(purchase),
        amount: parseFloat(data.amount),
        qrCode: data.qr_code,
      });
    } catch (error) {
      // The server says it belongs to a bundle: pay that instead.
      if (error.response?.status === 409 && error.response.data?.bundle_order_id) {
        payBundle(error.response.data.bundle_order_id);
        return;
      }
      if (handleOrderExpired(error)) return;
      console.error('Failed to retrieve QR code:', error);
      toast.error(error.response?.data?.message || t('myPurchases.toasts.qrFetchFailed'));
    } finally {
      setOpeningPayFor(null);
    }
  };

  const paymentConfirmed = Boolean(
    payment && paidOrder && paidOrder.type === payment.kind && String(paidOrder.id) === String(payment.id)
  );

  // Payment status is polled centrally (PaymentWatchContext); this tells it
  // the order is on screen here, so its global overlay stays away.
  useEffect(() => {
    if (!payment) return undefined;
    registerActiveLocalOrder(payment.kind, payment.id);
    return () => registerActiveLocalOrder(null, null);
  }, [payment, registerActiveLocalOrder]);

  // The open order closed unpaid (its QR expired, or it was rejected): the
  // receipt says so, and the list drops it from what's waiting.
  useEffect(() => {
    if (!payment || !endedOrder || endedOrder.type !== payment.kind || String(endedOrder.id) !== String(payment.id)) return;
    clearEndedOrder();
    setPayment(prev => (prev && prev.id === payment.id ? { ...prev, ended: endedOrder.reason } : prev));
    fetchPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endedOrder, payment, clearEndedOrder]);

  // The way on from a closed order: a single sheet gets a new order and QR
  // straight away; a cart order's sheets are back in the cart.
  const endedAction = () => {
    if (!payment?.ended) return null;
    if (payment.ended === 'rejected') return { label: t('cart.receipt.close'), onClick: () => setPayment(null) };
    if (payment.kind === 'bundle') return { label: t('cart.receipt.backToCart'), onClick: () => navigate('/cart') };
    return {
      label: t('cart.receipt.buyAgain'),
      busy: restarting,
      onClick: async () => {
        setRestarting(true);
        try {
          const { data } = await paymentsAPI.createPayment(payment.cheatsheetId);
          openPayment({
            ...payment,
            id: data.purchase.order_id,
            amount: parseFloat(data.purchase.amount),
            qrCode: data.purchase.qr_code,
          });
          fetchPurchases();
        } catch (error) {
          console.error('Failed to start a new order:', error);
          toast.error(error.response?.data?.message || t('myPurchases.toasts.qrFetchFailed'));
        } finally {
          setRestarting(false);
        }
      },
    };
  };

  // Hold the PAID stamp briefly, then close and show the unlocked sheets.
  useEffect(() => {
    if (!paymentConfirmed) return undefined;
    const timeout = setTimeout(() => {
      setPayment(null);
      acknowledgePaid();
      fetchPurchases();
    }, 1800);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentConfirmed, acknowledgePaid]);

  const handleGenerateTransferCode = async ({ order_id: orderId, title, course_code: courseCode }) => {
    setGeneratingTransferFor(orderId);
    try {
      const response = await downloadTransferAPI.generateCode(orderId);
      setTransferModal({
        orderId,
        title,
        courseCode,
        code: response.data.code,
        expiresAt: response.data.expires_at
      });
    } catch (error) {
      console.error('Failed to generate transfer code:', error);
      toast.error(error.response?.data?.message || t('myPurchases.transferCode.generateFailed'));
    } finally {
      setGeneratingTransferFor(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (purchases.length === 0) {
    return (
      <Container>
        <EmptyState>
          <h2>{t('myPurchases.emptyState.title')}</h2>
          <p>{t('myPurchases.emptyState.body')}</p>
          <BrowseButton onClick={() => navigate('/')}>{t('footer.browseCheatSheets')}</BrowseButton>
        </EmptyState>
      </Container>
    );
  }

  const q = searchQuery.toLowerCase();
  const filtered = purchases.filter(p => (
    p.title?.toLowerCase().includes(q) ||
    p.course_code?.toLowerCase().includes(q)
  ));
  const owned = filtered.filter(p => p.payment_status === 'paid');
  // Pin updates at the top for UPDATE_PIN_DAYS after the seller uploads the
  // new file; after that the card just keeps its amber "New Version" button
  // in the main grid. An older API without file_updated_at pins as before.
  const isPinnedUpdate = (p) => p.is_file_updated && !p.is_pre_order && (
    p.file_updated_at === undefined ||
    (p.file_updated_at !== null && Date.now() - new Date(p.file_updated_at).getTime() < UPDATE_PIN_DAYS * DAY_MS)
  );
  const updated = owned.filter(isPinnedUpdate);
  const upToDate = owned.filter(p => !isPinnedUpdate(p));
  const pending = filtered.filter(p => p.payment_status === 'pending');
  const inactive = filtered.filter(p => p.payment_status !== 'paid' && p.payment_status !== 'pending');

  const openDetails = (purchase) => navigate(`/cheatsheet/${purchase.cheatsheet_id}`);
  const formatAmount = (purchase) => (parseFloat(purchase.payment_amount || 0) === 0
    ? t('myPurchases.free')
    : `${parseFloat(purchase.payment_amount).toFixed(2)} ฿`);

  const renderActions = (purchase) => {
    const isDownloading = downloadingOrderId === purchase.order_id;

    if (purchase.is_pre_order) {
      return (
        <ActionButton $primary data-primary disabled title={t('myPurchases.availableOn', { date: new Date(purchase.release_at).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok', dateStyle: 'medium', timeStyle: 'short' }) })}>
          {purchase.payment_method === 'free'
            ? t('myPurchases.unlocksOn', { date: new Date(purchase.release_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short' }) })
            : t('myPurchases.preOrdered')}
        </ActionButton>
      );
    }

    return (
      <>
        {isDownloading ? (
          // The button itself fills up as the file arrives.
          <DownloadProgress
            role="progressbar"
            aria-label={t('myPurchases.downloading')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={downloadProgress == null ? undefined : Math.round(downloadProgress * 100)}
            $update={purchase.is_file_updated}
          >
            <ProgressFill $update={purchase.is_file_updated} $indeterminate={downloadProgress == null} style={{ width: `${Math.round((downloadProgress ?? 0) * 100)}%` }} />
            <ProgressLabel>
              <Download size={14} />
              {downloadProgress == null
                ? t('myPurchases.preparingFile')
                : t('myPurchases.downloadingPercent', { percent: Math.round(downloadProgress * 100) })}
            </ProgressLabel>
          </DownloadProgress>
        ) : purchase.is_file_updated ? (
          <UpdateActionButton onClick={() => handleDownload(purchase)} disabled={!!downloadingOrderId}>
            <Sparkles size={13} />
            {t('myPurchases.newVersion')}
          </UpdateActionButton>
        ) : (
          <ActionButton $primary data-primary onClick={() => handleDownload(purchase)} disabled={!!downloadingOrderId}>
            <Download size={14} />
            {t('common.download')}
          </ActionButton>
        )}
        {purchase.transfer_code_available_at ? (
          <ActionButton
            disabled
            title={t('myPurchases.transferCode.cooldownUntil', {
              time: new Date(purchase.transfer_code_available_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })}
          >
            <Send size={14} /> {t('myPurchases.transferCode.cooldownShort')}
          </ActionButton>
        ) : (
          <ActionButton
            onClick={() => handleGenerateTransferCode(purchase)}
            disabled={generatingTransferFor === purchase.order_id}
            title={t('myPurchases.transferCode.hint')}
          >
            <Send size={14} /> {t('myPurchases.transferCode.button')}
          </ActionButton>
        )}
      </>
    );
  };

  const renderCard = (purchase) => (
    <Card key={purchase.order_id} $updated={purchase.is_file_updated && purchase.payment_status === 'paid'}>
      <CoverButton type="button" onClick={() => openDetails(purchase)} aria-label={purchase.title}>
        {purchase.preview_image_path ? (
          <CoverImage src={purchase.preview_image_path} alt={purchase.title} loading="lazy" />
        ) : (
          <CoverPlaceholder style={{ background: meshGradient(`sheet-${purchase.cheatsheet_id}`) }}>{purchase.course_code}</CoverPlaceholder>
        )}
      </CoverButton>

      {purchase.is_file_updated && purchase.payment_status === 'paid' && (
        <UpdateBadge title={t('myPurchases.updateBadgeTitle')}>
          <RefreshCw size={10} />
          {purchase.current_file_version != null
            ? t('myPurchases.updatedTo', { version: purchase.current_file_version })
            : t('myPurchases.updateBadgeLabel')}
        </UpdateBadge>
      )}

      <CardBody>
        <PillRow>
          <CourseCode>{purchase.course_code}</CourseCode>
          {formatExamTypes(purchase) && <ExamTypePill>{formatExamTypes(purchase)}</ExamTypePill>}
          {purchase.payment_method === 'giveaway' && (
            <GiftPill><Gift size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{t('myPurchases.gift')}</GiftPill>
          )}
        </PillRow>

        <CardTitle onClick={() => openDetails(purchase)}>{purchase.title}</CardTitle>

        {purchase.payment_status === 'paid' && purchase.is_file_updated && purchase.whats_new && (
          <WhatsNewCallout>
            <div className="whats-new-title">
              <Sparkles size={13} />
              {t('myPurchases.whatsNewTitle', { version: purchase.current_file_version })}
            </div>
            <ExpandableText lines={3}>{purchase.whats_new}</ExpandableText>
          </WhatsNewCallout>
        )}

        <CardMeta>
          {new Date(purchase.purchase_date).toLocaleDateString()}
          {' · '}
          {formatAmount(purchase)}
          {purchase.payment_status === 'paid' && (
            <>
              {' · '}
              {t('myPurchases.downloadCount', { count: purchase.download_count || 0 })}
            </>
          )}
        </CardMeta>
      </CardBody>

      <ActionBar>{renderActions(purchase)}</ActionBar>
    </Card>
  );

  // Unpaid orders from one cart checkout are grouped as one card.
  const pendingGroups = [];
  for (const purchase of pending) {
    const group = purchase.bundle_order_id && pendingGroups.find(g => g.bundleId === purchase.bundle_order_id);
    if (group) group.items.push(purchase);
    else pendingGroups.push({ bundleId: purchase.bundle_order_id || null, items: [purchase] });
  }

  // Where an order's saving came from: a discount code (a code and the
  // bundle discount never stack), else the bundle price for several sheets.
  const savingLabel = (items, saving) => {
    const amount = baht(saving);
    const code = items.find(p => p.discount_code)?.discount_code;
    if (code) return t('myPurchases.bundle.savingCode', { code, amount });
    if (items.length > 1) return t('myPurchases.bundle.saving', { amount });
    return t('myPurchases.bundle.savingGeneric', { amount });
  };

  // Every unpaid order as one horizontal card: a single sheet, or a cart
  // checkout's sheets (paid together at the bundle price).
  const renderPendingOrder = ({ bundleId, items }) => {
    const full = items.reduce((sum, p) => sum + fullPrice(p), 0);
    const due = items.reduce((sum, p) => sum + (parseFloat(p.payment_amount) || 0), 0);
    const saving = full - due;
    const fanned = items.slice(0, 4);
    return (
      <BundleCard key={bundleId || items[0].order_id}>
        <CoverFan $count={fanned.length} aria-hidden="true">
          {fanned.map((p, i) => (
            <FanCover
              key={p.order_id}
              $i={i}
              $count={fanned.length}
              style={p.preview_image_path ? undefined : { background: meshGradient(`sheet-${p.cheatsheet_id}`) }}
            >
              {p.preview_image_path ? <img src={p.preview_image_path} alt="" loading="lazy" /> : p.course_code}
            </FanCover>
          ))}
        </CoverFan>
        <BundleInfo>
          <h3>
            {t('myPurchases.bundle.title', { count: items.length })}
            <StatusPill $status="pending">{t('myPurchases.status.pending')}</StatusPill>
          </h3>
          <ul>
            {items.map(p => (
              <li key={p.order_id}>
                {/* Titles often already start with their course code. */}
                {p.title?.startsWith(p.course_code) ? p.title : <><strong>{p.course_code}</strong> {p.title}</>}
              </li>
            ))}
          </ul>
        </BundleInfo>
        <BundlePay>
          <BundlePrice>
            {saving > 0.004 && <s>{baht(full)}</s>}
            {baht(due)}
          </BundlePrice>
          {saving > 0.004 && <BundleSaving>{savingLabel(items, saving)}</BundleSaving>}
          <PayButton
            type="button"
            onClick={() => (bundleId ? payBundle(bundleId) : handleShowQR(items[0]))}
            disabled={openingPayFor === (bundleId || items[0].order_id)}
          >
            <QrCode size={15} /> {t('myPurchases.bundle.pay', { amount: baht(due) })}
          </PayButton>
        </BundlePay>
      </BundleCard>
    );
  };

  return (
    <Container>
      <PageHeader>
        <HeaderRow>
          <div>
            <Title>{t('myPurchases.title')}</Title>
            <Subtitle>{t('myPurchases.subtitle')}</Subtitle>
          </div>
          {purchases.some(p => parseFloat(p.payment_amount || 0) > 0) && (
            <UsageNotice>
              <ShieldCheck size={16} />
              <span><strong>{t('myPurchases.usageNoticeTitle')}</strong> {t('myPurchases.usageNoticeBody')}</span>
            </UsageNotice>
          )}
        </HeaderRow>
        <SearchWrapper>
          <SearchIcon size={16} />
          <SearchBar
            type="text"
            placeholder={t('myPurchases.searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </SearchWrapper>
        {searchQuery && (
          <ResultCount>
            {t('myPurchases.resultCount', { count: filtered.length, query: searchQuery })}
          </ResultCount>
        )}
      </PageHeader>

      {updated.length > 0 && (
        <UpdatesPanel>
          <SectionHeader>
            <h2><RefreshCw size={20} /> {t('myPurchases.sections.updates')} <span>({updated.length})</span></h2>
            <p>{t('myPurchases.sections.updatesHint')}</p>
          </SectionHeader>
          <Grid>{updated.map(renderCard)}</Grid>
        </UpdatesPanel>
      )}

      {pending.length > 0 && (
        <Section>
          <SectionHeader>
            <h2>{t('myPurchases.sections.pending')} <span>({pending.length})</span></h2>
            <p>{t('myPurchases.sections.pendingHint')}</p>
          </SectionHeader>
          <Grid>
            {pendingGroups.map(renderPendingOrder)}
          </Grid>
        </Section>
      )}

      {upToDate.length > 0 && (
        <Section>
          {(updated.length > 0 || pending.length > 0) && (
            <SectionHeader>
              <h2>{t('myPurchases.sections.owned')} <span>({upToDate.length})</span></h2>
            </SectionHeader>
          )}
          <Grid>{upToDate.map(renderCard)}</Grid>
        </Section>
      )}

      {filtered.length === 0 && searchQuery && (
        <EmptyState>
          <h2>{t('myPurchases.noResults.title')}</h2>
          <p>{t('myPurchases.noResults.body', { query: searchQuery })}</p>
        </EmptyState>
      )}

      {inactive.length > 0 && (
        <InactiveOrders>
          <summary>{t('myPurchases.sections.inactive')} ({inactive.length})</summary>
          <p>{t('myPurchases.sections.inactiveHint')}</p>
          {inactive.map(purchase => (
            <InactiveRow key={purchase.order_id} type="button" onClick={() => openDetails(purchase)}>
              <StatusPill $status={purchase.payment_status}>
                {t(`myPurchases.status.${purchase.payment_status}`, purchase.payment_status)}
              </StatusPill>
              <span className="title">{purchase.course_code} · {purchase.title}</span>
              <span className="meta">{new Date(purchase.purchase_date).toLocaleDateString()} · {formatAmount(purchase)}</span>
              <ChevronRight size={16} />
            </InactiveRow>
          ))}
        </InactiveOrders>
      )}

      {payment && (
        <ReceiptOverlay
          label={t('cart.scanToPay.title')}
          onClose={paymentConfirmed ? undefined : () => setPayment(null)}
        >
          <PaymentReceipt
            items={payment.items}
            subtotal={payment.subtotal}
            amount={payment.amount}
            qrCode={payment.qrCode}
            qrLoaded={qrLoaded}
            onQrLoad={() => setQrLoaded(true)}
            paid={paymentConfirmed}
            onClose={() => setPayment(null)}
            ended={payment.ended}
            action={endedAction()}
            t={t}
          />
          {!paymentConfirmed && !payment.ended && (
            <PayLaterButton type="button" onClick={() => setPayment(null)}>
              {t('myPurchases.bundle.payLater')}
            </PayLaterButton>
          )}
        </ReceiptOverlay>
      )}

      {transferModal && (
        <Modal onClick={() => setTransferModal(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>{t('myPurchases.transferCode.modalTitle')}</h2>
            <TransferSheetInfo>
              <TransferSheetCourseCode>{transferModal.courseCode}</TransferSheetCourseCode>
              {transferModal.title}
            </TransferSheetInfo>
            <p style={{ marginTop: '0.75rem', color: '#6E6E73', fontSize: '0.875rem' }}>
              {t('myPurchases.transferCode.modalInstructions')}
            </p>
            <TransferCodeDisplay>
              {transferModal.code.slice(0, 3)} {transferModal.code.slice(3)}
            </TransferCodeDisplay>
            <TransferCountdown $urgent={transferSecondsLeft <= 30}>
              {transferSecondsLeft > 0
                ? t('myPurchases.transferCode.expiresIn', {
                    time: `${String(Math.floor(transferSecondsLeft / 60)).padStart(2, '0')}:${String(transferSecondsLeft % 60).padStart(2, '0')}`
                  })
                : t('myPurchases.transferCode.expired')}
            </TransferCountdown>
            <ModalButton
              onClick={() => handleGenerateTransferCode({ order_id: transferModal.orderId, title: transferModal.title, course_code: transferModal.courseCode })}
              disabled={generatingTransferFor === transferModal.orderId}
            >
              {t('myPurchases.transferCode.regenerate')}
            </ModalButton>
            <SecondaryModalButton onClick={() => setTransferModal(null)}>
              {t('common.close')}
            </SecondaryModalButton>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default MyPurchases;
