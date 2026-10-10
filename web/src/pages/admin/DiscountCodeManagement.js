import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { discountCodesAPI, adminAPI, cheatSheetsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, X, Copy, Gift, Send } from 'lucide-react';
import Breadcrumbs from '../../components/ui/Breadcrumb';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const TableWrapper = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border: 1px solid ${props => props.theme.colors.border};
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textSecondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 1rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  vertical-align: middle;
`;

const BADGE_COLORS = {
  items: { background: '#EFF6FF', color: '#1D4ED8' },
  cheatsheet: { background: '#F5F3FF', color: '#7C3AED' },
  cart: { background: '#F0FDF4', color: '#16A34A' },
};

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  background: ${props => (BADGE_COLORS[props.$type] || BADGE_COLORS.cart).background};
  color: ${props => (BADGE_COLORS[props.$type] || BADGE_COLORS.cart).color};
`;

const Toggle = styled.button`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background ${props => props.theme.transitions.fast};
  background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.borderLight};

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: left ${props => props.theme.transitions.fast};
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ExpiredToggle = styled.button`
  display: block;
  margin: 0.75rem auto 0;
  padding: 0.25rem 0.5rem;
  border: none;
  background: none;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  cursor: pointer;

  &:hover { color: ${props => props.theme.colors.primary}; text-decoration: underline; }
`;

// Same rule as checkout (discountCodeService.validateCode): past valid_until.
const isExpired = (code, now = new Date()) => !!code.valid_until && new Date(code.valid_until) < now;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2rem;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes['2xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  padding: 0.25rem;
  border-radius: ${props => props.theme.radius.sm};
  &:hover { color: ${props => props.theme.colors.text}; }
`;

const ModeTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ModeTab = styled.button`
  flex: 1;
  padding: 0.625rem;
  border-radius: ${props => props.theme.radius.md};
  border: 1px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primaryLight : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.sm};
  cursor: pointer;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.375rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.background};
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.background};
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const HelpText = styled.p`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background ${props => props.theme.transitions.fast};
  &:hover { background: ${props => props.theme.colors.primaryHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const GeneratedList = styled.textarea`
  width: 100%;
  min-height: 160px;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-family: monospace;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.background};
  box-sizing: border-box;
`;

const CopyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding: 0.625rem 1rem;
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
  cursor: pointer;
  &:hover { border-color: ${props => props.theme.colors.primary}; color: ${props => props.theme.colors.primary}; }
`;

const RecipientWrapper = styled.div`
  position: relative;
`;

const RecipientDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  box-shadow: ${props => props.theme.shadows.md};
  z-index: 20;
  max-height: 220px;
  overflow-y: auto;
`;

const SuggestionItem = styled.button`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const SuggestionName = styled.span`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const SuggestionEmail = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.xs};
`;

const RecipientChip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid ${props => props.theme.colors.primary};
  background: ${props => props.theme.colors.primaryLight};
  border-radius: ${props => props.theme.radius.md};
`;

const RecipientChipInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const RecipientChipClear = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  flex-shrink: 0;
  &:hover { color: ${props => props.theme.colors.text}; }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-family: inherit;
  color: ${props => props.theme.colors.text};
  background: ${props => props.theme.colors.background};
  box-sizing: border-box;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  margin-bottom: 1rem;
`;

const GiftBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  background: #FDF2F8;
  color: #DB2777;
  margin-bottom: 0.25rem;
`;

const ResendLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.sizes.xs};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  &:hover { text-decoration: underline; }
  &:disabled { opacity: 0.5; cursor: not-allowed; text-decoration: none; }
`;

const BLANK_FORM = {
  code: '',
  description: '',
  discount_percentage: 10,
  applies_to: 'cart',
  max_items: 1,
  max_discount_amount: '',
  min_cart_subtotal: '',
  max_uses_total: '',
  max_uses_per_user: 1,
  valid_from: '',
  valid_until: '',
  quantity: 10,
  gift_message: '',
  send_gift_email: true,
};

export default function DiscountCodeManagement() {
  const [codes, setCodes] = useState([]);
  // Expired codes are hidden unless asked for.
  const [showExpired, setShowExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' | 'bulk' | 'gift'
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState(null);
  const [giftResult, setGiftResult] = useState(null); // { code, email_sent }
  const [resendingId, setResendingId] = useState(null);

  // Recipient picker (gift mode only)
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const recipientDebounceRef = useRef(null);
  const recipientWrapperRef = useRef(null);

  // Cheat sheet picker (single/bulk mode, applies_to === 'cheatsheet' only) —
  // mirrors the recipient picker above exactly, just searching cheat sheets
  // instead of users.
  const [cheatSheetQuery, setCheatSheetQuery] = useState('');
  const [cheatSheetOptions, setCheatSheetOptions] = useState([]);
  const [showCheatSheetDropdown, setShowCheatSheetDropdown] = useState(false);
  const [selectedCheatSheet, setSelectedCheatSheet] = useState(null);
  const cheatSheetDebounceRef = useRef(null);
  const cheatSheetWrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (recipientWrapperRef.current && !recipientWrapperRef.current.contains(e.target)) {
        setShowRecipientDropdown(false);
      }
      if (cheatSheetWrapperRef.current && !cheatSheetWrapperRef.current.contains(e.target)) {
        setShowCheatSheetDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const res = await discountCodesAPI.adminGetAll();
      setCodes(res.data.codes || []);
    } catch {
      toast.error('Failed to load discount codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCodes(); }, []);

  useEffect(() => {
    clearTimeout(recipientDebounceRef.current);
    const term = recipientQuery.trim();
    if (term.length < 2) {
      setRecipientOptions([]);
      return;
    }
    recipientDebounceRef.current = setTimeout(() => {
      adminAPI.getAllUsers({ search: term, limit: 8 })
        .then(res => {
          setRecipientOptions(res.data.users || []);
          setShowRecipientDropdown(true);
        })
        .catch(() => setRecipientOptions([]));
    }, 300);
    return () => clearTimeout(recipientDebounceRef.current);
  }, [recipientQuery]);

  useEffect(() => {
    clearTimeout(cheatSheetDebounceRef.current);
    const term = cheatSheetQuery.trim();
    if (term.length < 2) {
      setCheatSheetOptions([]);
      return;
    }
    cheatSheetDebounceRef.current = setTimeout(() => {
      cheatSheetsAPI.getAll({ search: term, limit: 8 })
        .then(res => {
          setCheatSheetOptions(res.data.cheat_sheets || []);
          setShowCheatSheetDropdown(true);
        })
        .catch(() => setCheatSheetOptions([]));
    }, 300);
    return () => clearTimeout(cheatSheetDebounceRef.current);
  }, [cheatSheetQuery]);

  const openAdd = () => {
    setMode('single');
    setForm(BLANK_FORM);
    setGeneratedCodes(null);
    setGiftResult(null);
    setSelectedRecipient(null);
    setRecipientQuery('');
    setSelectedCheatSheet(null);
    setCheatSheetQuery('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setGeneratedCodes(null);
    setGiftResult(null);
    setSelectedRecipient(null);
    setRecipientQuery('');
    setSelectedCheatSheet(null);
    setCheatSheetQuery('');
  };

  const handleSelectRecipient = (userRow) => {
    setSelectedRecipient(userRow);
    setRecipientQuery('');
    setRecipientOptions([]);
    setShowRecipientDropdown(false);
  };

  const handleSelectCheatSheet = (sheetRow) => {
    setSelectedCheatSheet(sheetRow);
    setCheatSheetQuery('');
    setCheatSheetOptions([]);
    setShowCheatSheetDropdown(false);
  };

  const buildPayload = () => ({
    description: form.description || undefined,
    discount_percentage: parseFloat(form.discount_percentage),
    applies_to: form.applies_to,
    max_items: form.applies_to === 'items' ? parseInt(form.max_items, 10) : undefined,
    cheatsheet_id: form.applies_to === 'cheatsheet' ? selectedCheatSheet?.cheatsheet_id : undefined,
    max_discount_amount: form.max_discount_amount !== '' ? parseFloat(form.max_discount_amount) : undefined,
    min_cart_subtotal: form.min_cart_subtotal !== '' ? parseFloat(form.min_cart_subtotal) : undefined,
    max_uses_total: form.max_uses_total !== '' ? parseInt(form.max_uses_total, 10) : undefined,
    max_uses_per_user: parseInt(form.max_uses_per_user, 10) || 1,
    valid_from: form.valid_from || undefined,
    valid_until: form.valid_until || undefined,
  });

  const handleSave = async () => {
    if (!form.discount_percentage || parseFloat(form.discount_percentage) <= 0) {
      toast.error('Discount percentage is required');
      return;
    }
    if (mode === 'single' && form.applies_to === 'items' && (!form.max_items || parseInt(form.max_items, 10) <= 0)) {
      toast.error('Max items is required for item-limited codes');
      return;
    }
    if ((mode === 'single' || mode === 'bulk') && form.applies_to === 'cheatsheet' && !selectedCheatSheet) {
      toast.error('Please pick a cheat sheet');
      return;
    }
    if (mode === 'gift' && !selectedRecipient) {
      toast.error('Please pick who this code is for');
      return;
    }

    setSaving(true);
    try {
      if (mode === 'bulk') {
        const quantity = parseInt(form.quantity, 10);
        if (!quantity || quantity <= 0) {
          toast.error('Quantity must be a positive number');
          setSaving(false);
          return;
        }
        const res = await discountCodesAPI.bulkCreate({ quantity, ...buildPayload() });
        setGeneratedCodes(res.data.codes);
        toast.success(`Generated ${res.data.codes.length} codes`);
        fetchCodes();
      } else if (mode === 'gift') {
        const payload = {
          discount_percentage: parseFloat(form.discount_percentage),
          applies_to: 'cart',
          max_discount_amount: form.max_discount_amount !== '' ? parseFloat(form.max_discount_amount) : undefined,
          max_uses_total: 1,
          max_uses_per_user: 1,
          valid_until: form.valid_until || undefined,
          description: `Gift for ${selectedRecipient.name}`,
          recipient_user_id: selectedRecipient.user_id,
          gift_message: form.gift_message.trim() || undefined,
          send_gift_email: form.send_gift_email,
        };
        const res = await discountCodesAPI.create(payload);
        setGiftResult({ code: res.data.code, email_sent: res.data.email_sent });
        if (form.send_gift_email) {
          toast[res.data.email_sent ? 'success' : 'error'](
            res.data.email_sent
              ? `Code ${res.data.code} created and emailed to ${selectedRecipient.name}`
              : `Code ${res.data.code} created, but the email failed — copy it and send manually`
          );
        } else {
          toast.success(`Code ${res.data.code} created`);
        }
        fetchCodes();
      } else {
        const payload = buildPayload();
        if (form.code.trim()) payload.code = form.code.trim();
        const res = await discountCodesAPI.create(payload);
        toast.success(`Code ${res.data.code} created`);
        closeModal();
        fetchCodes();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save discount code');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (code) => {
    try {
      await discountCodesAPI.update(code.discount_code_id, { is_active: !code.is_active });
      toast.success(`Code ${code.is_active ? 'deactivated' : 'activated'}`);
      fetchCodes();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleResendEmail = async (code) => {
    setResendingId(code.discount_code_id);
    try {
      const res = await discountCodesAPI.resendGiftEmail(code.discount_code_id);
      toast[res.data.email_sent ? 'success' : 'error'](
        res.data.email_sent ? `Resent to ${code.recipient_name}` : 'Resend failed — try again shortly'
      );
      fetchCodes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend email');
    } finally {
      setResendingId(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'));
    toast.success('Copied to clipboard');
  };

  const handleCopyGiftCode = () => {
    navigator.clipboard.writeText(giftResult.code);
    toast.success('Copied to clipboard');
  };

  const describeRule = (code) => {
    if (code.applies_to === 'items') {
      return `${parseFloat(code.discount_percentage)}% off, ${code.max_items} item${code.max_items === 1 ? '' : 's'}`;
    }
    if (code.applies_to === 'cheatsheet') {
      return `${parseFloat(code.discount_percentage)}% off — ${code.cheatsheet_course_code || code.cheatsheet_title || 'one cheat sheet'}`;
    }
    return `${parseFloat(code.discount_percentage)}% off cart`;
  };

  if (loading) return <Container><LoadingSpinner /></Container>;

  const expiredCount = codes.filter(code => isExpired(code)).length;
  const visibleCodes = showExpired ? codes : codes.filter(code => !isExpired(code));

  return (
    <Container>
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Discount Codes' }]} />
      <Header>
        <HeaderLeft>
          <Title>Discount Codes</Title>
          <Subtitle>Create and manage buyer-facing discount codes. The site absorbs the cost — sellers are always paid full price.</Subtitle>
        </HeaderLeft>
        <AddButton onClick={openAdd}>
          <Plus size={18} /> New Discount Code
        </AddButton>
      </Header>

      <TableWrapper>
        {visibleCodes.length === 0 ? (
          <EmptyState>
            {codes.length === 0
              ? 'No discount codes yet. Click "New Discount Code" to get started.'
              : 'No discount codes in use. Every code has expired.'}
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Rule</Th>
                <Th>Recipient</Th>
                <Th>Cap</Th>
                <Th>Usage</Th>
                <Th>Expires</Th>
                <Th>Active</Th>
              </tr>
            </thead>
            <tbody>
              {visibleCodes.map(code => (
                <tr key={code.discount_code_id} style={isExpired(code) ? { opacity: 0.55 } : undefined}>
                  <Td><strong>{code.code}</strong></Td>
                  <Td>
                    <Badge $type={code.applies_to}>{describeRule(code)}</Badge>
                  </Td>
                  <Td>
                    {code.recipient_user_id ? (
                      <div>
                        <GiftBadge><Gift size={11} /> Gift</GiftBadge>
                        <div>{code.recipient_name}</div>
                        <ResendLink
                          onClick={() => handleResendEmail(code)}
                          disabled={resendingId === code.discount_code_id}
                        >
                          <Send size={11} />
                          {code.gift_emailed_at ? 'Resend email' : 'Send email'}
                        </ResendLink>
                      </div>
                    ) : <span style={{ opacity: 0.4 }}>—</span>}
                  </Td>
                  <Td>{code.max_discount_amount ? `฿${parseFloat(code.max_discount_amount).toFixed(2)}` : <span style={{ opacity: 0.4 }}>—</span>}</Td>
                  <Td>{code.uses_count} / {code.max_uses_total ?? '∞'}</Td>
                  <Td>{code.valid_until ? new Date(code.valid_until).toLocaleDateString('en-GB') : <span style={{ opacity: 0.4 }}>—</span>}</Td>
                  <Td><Toggle $active={code.is_active} onClick={() => handleToggleActive(code)} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableWrapper>
      {expiredCount > 0 && (
        <ExpiredToggle type="button" onClick={() => setShowExpired(v => !v)}>
          {showExpired ? 'Hide expired codes' : `Show ${expiredCount} expired ${expiredCount === 1 ? 'code' : 'codes'}`}
        </ExpiredToggle>
      )}

      {showModal && (
        <Overlay onClick={closeModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>New Discount Code</ModalTitle>
              <CloseButton onClick={closeModal}><X size={20} /></CloseButton>
            </ModalHeader>

            {generatedCodes ? (
              <>
                <Label>Generated codes ({generatedCodes.length})</Label>
                <GeneratedList readOnly value={generatedCodes.join('\n')} />
                <CopyButton onClick={handleCopy}><Copy size={14} /> Copy all</CopyButton>
              </>
            ) : giftResult ? (
              <>
                <Label>Gift code</Label>
                <Input readOnly value={giftResult.code} style={{ fontFamily: 'monospace', fontWeight: 700, marginBottom: '0.75rem' }} />
                <HelpText style={{ marginBottom: '1rem' }}>
                  {form.send_gift_email
                    ? (giftResult.email_sent
                        ? `Emailed to ${selectedRecipient?.name}. `
                        : `The email failed to send — `)
                    : ''}
                  Copy the code below to send it yourself if needed.
                </HelpText>
                <CopyButton onClick={handleCopyGiftCode}><Copy size={14} /> Copy code</CopyButton>
                <SaveButton onClick={closeModal} style={{ marginTop: '1rem' }}>Done</SaveButton>
              </>
            ) : (
              <>
                <ModeTabs>
                  <ModeTab type="button" $active={mode === 'single'} onClick={() => setMode('single')}>Single code</ModeTab>
                  <ModeTab type="button" $active={mode === 'bulk'} onClick={() => setMode('bulk')}>Bulk generate</ModeTab>
                  <ModeTab type="button" $active={mode === 'gift'} onClick={() => { setMode('gift'); setForm(f => ({ ...f, discount_percentage: 50 })); }}>
                    <Gift size={14} style={{ verticalAlign: 'text-bottom', marginRight: '0.3rem' }} /> Gift
                  </ModeTab>
                </ModeTabs>

                {mode === 'gift' ? (
                  <>
                    <FormGroup>
                      <Label>Who is this for? *</Label>
                      {selectedRecipient ? (
                        <RecipientChip>
                          <RecipientChipInfo>
                            <SuggestionName>{selectedRecipient.name}</SuggestionName>
                            <SuggestionEmail>{selectedRecipient.email}</SuggestionEmail>
                          </RecipientChipInfo>
                          <RecipientChipClear onClick={() => setSelectedRecipient(null)}><X size={16} /></RecipientChipClear>
                        </RecipientChip>
                      ) : (
                        <RecipientWrapper ref={recipientWrapperRef}>
                          <Input
                            value={recipientQuery}
                            onChange={e => setRecipientQuery(e.target.value)}
                            onFocus={() => recipientOptions.length > 0 && setShowRecipientDropdown(true)}
                            placeholder="Search by name or email…"
                            autoComplete="off"
                          />
                          {showRecipientDropdown && recipientOptions.length > 0 && (
                            <RecipientDropdown>
                              {recipientOptions.map(u => (
                                <SuggestionItem key={u.user_id} type="button" onClick={() => handleSelectRecipient(u)}>
                                  <SuggestionName>{u.name}</SuggestionName>
                                  <SuggestionEmail>{u.email}</SuggestionEmail>
                                </SuggestionItem>
                              ))}
                            </RecipientDropdown>
                          )}
                        </RecipientWrapper>
                      )}
                    </FormGroup>

                    <FormRow>
                      <FormGroup>
                        <Label>Discount % *</Label>
                        <Input
                          type="number" min="1" max="100" step="0.01"
                          value={form.discount_percentage}
                          onChange={e => setForm({ ...form, discount_percentage: e.target.value })}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Max discount amount (฿, optional)</Label>
                        <Input
                          type="number" min="0" step="0.01"
                          value={form.max_discount_amount}
                          onChange={e => setForm({ ...form, max_discount_amount: e.target.value })}
                          placeholder="No cap"
                        />
                      </FormGroup>
                    </FormRow>

                    <FormGroup>
                      <Label>Valid until (optional)</Label>
                      <Input
                        type="date"
                        value={form.valid_until}
                        onChange={e => setForm({ ...form, valid_until: e.target.value })}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Personal message (optional)</Label>
                      <Textarea
                        value={form.gift_message}
                        onChange={e => setForm({ ...form, gift_message: e.target.value })}
                        placeholder="e.g. Sorry about the wait on your order last semester — here's 50% off your next purchase!"
                      />
                      <HelpText>Leave blank to use a friendly default message.</HelpText>
                    </FormGroup>

                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={form.send_gift_email}
                        onChange={e => setForm({ ...form, send_gift_email: e.target.checked })}
                      />
                      Email this code to them now
                    </CheckboxLabel>

                    <SaveButton onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving…' : 'Create Gift Code'}
                    </SaveButton>
                  </>
                ) : (
                  <>
                {mode === 'single' ? (
                  <FormGroup>
                    <Label>Code (leave blank to auto-generate)</Label>
                    <Input
                      value={form.code}
                      onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. WELCOME20"
                    />
                  </FormGroup>
                ) : (
                  <FormGroup>
                    <Label>Quantity of unique codes to generate *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      value={form.quantity}
                      onChange={e => setForm({ ...form, quantity: e.target.value })}
                    />
                    <HelpText>Each generated code is single-use by default (override with Max total uses below).</HelpText>
                  </FormGroup>
                )}

                <FormGroup>
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Giveaway for Facebook followers"
                  />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label>Discount % *</Label>
                    <Input
                      type="number" min="1" max="100" step="0.01"
                      value={form.discount_percentage}
                      onChange={e => setForm({ ...form, discount_percentage: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Applies to *</Label>
                    <Select aria-label="Applies to" value={form.applies_to} onChange={e => setForm({ ...form, applies_to: e.target.value })}>
                      <option value="cart">Whole cart</option>
                      <option value="items">Limited # of items</option>
                      <option value="cheatsheet">One specific cheat sheet</option>
                    </Select>
                  </FormGroup>
                </FormRow>

                {form.applies_to === 'items' && (
                  <FormGroup>
                    <Label>Max items discounted *</Label>
                    <Input
                      type="number" min="1"
                      value={form.max_items}
                      onChange={e => setForm({ ...form, max_items: e.target.value })}
                    />
                    <HelpText>Only the cheapest N items in the cart get the discount — the rest stay full price.</HelpText>
                  </FormGroup>
                )}

                {form.applies_to === 'cheatsheet' && (
                  <FormGroup>
                    <Label>Cheat sheet *</Label>
                    {selectedCheatSheet ? (
                      <RecipientChip>
                        <RecipientChipInfo>
                          <SuggestionName>{selectedCheatSheet.title}</SuggestionName>
                          <SuggestionEmail>
                            {selectedCheatSheet.course_code}
                            {' · '}
                            {parseFloat(selectedCheatSheet.price || 0) === 0 ? 'Free' : `${selectedCheatSheet.price} ฿`}
                          </SuggestionEmail>
                        </RecipientChipInfo>
                        <RecipientChipClear onClick={() => setSelectedCheatSheet(null)}><X size={16} /></RecipientChipClear>
                      </RecipientChip>
                    ) : (
                      <RecipientWrapper ref={cheatSheetWrapperRef}>
                        <Input
                          value={cheatSheetQuery}
                          onChange={e => setCheatSheetQuery(e.target.value)}
                          onFocus={() => cheatSheetOptions.length > 0 && setShowCheatSheetDropdown(true)}
                          placeholder="Search by title or course code…"
                          autoComplete="off"
                        />
                        {showCheatSheetDropdown && cheatSheetOptions.length > 0 && (
                          <RecipientDropdown>
                            {cheatSheetOptions.map(sheet => (
                              <SuggestionItem key={sheet.cheatsheet_id} type="button" onClick={() => handleSelectCheatSheet(sheet)}>
                                <SuggestionName>{sheet.title}</SuggestionName>
                                <SuggestionEmail>
                                  {sheet.course_code}
                                  {' · '}
                                  {parseFloat(sheet.price || 0) === 0 ? 'Free' : `${sheet.price} ฿`}
                                </SuggestionEmail>
                              </SuggestionItem>
                            ))}
                          </RecipientDropdown>
                        )}
                      </RecipientWrapper>
                    )}
                    <HelpText>Only this one cheat sheet is discounted — everything else in the cart stays full price.</HelpText>
                  </FormGroup>
                )}

                <FormRow>
                  <FormGroup>
                    <Label>Max discount amount (฿, optional)</Label>
                    <Input
                      type="number" min="0" step="0.01"
                      value={form.max_discount_amount}
                      onChange={e => setForm({ ...form, max_discount_amount: e.target.value })}
                      placeholder="No cap"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Min cart subtotal (฿, optional)</Label>
                    <Input
                      type="number" min="0" step="0.01"
                      value={form.min_cart_subtotal}
                      onChange={e => setForm({ ...form, min_cart_subtotal: e.target.value })}
                      placeholder="No minimum"
                    />
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <Label>Max total uses (optional)</Label>
                    <Input
                      type="number" min="1"
                      value={form.max_uses_total}
                      onChange={e => setForm({ ...form, max_uses_total: e.target.value })}
                      placeholder={mode === 'bulk' ? '1 (default)' : 'Unlimited'}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Max uses per user</Label>
                    <Input
                      type="number" min="1"
                      value={form.max_uses_per_user}
                      onChange={e => setForm({ ...form, max_uses_per_user: e.target.value })}
                    />
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <Label>Valid from (optional)</Label>
                    <Input
                      type="date"
                      value={form.valid_from}
                      onChange={e => setForm({ ...form, valid_from: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Valid until (optional)</Label>
                    <Input
                      type="date"
                      value={form.valid_until}
                      onChange={e => setForm({ ...form, valid_until: e.target.value })}
                    />
                  </FormGroup>
                </FormRow>

                <SaveButton onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : mode === 'bulk' ? 'Generate Codes' : 'Create Code'}
                </SaveButton>
                  </>
                )}
              </>
            )}
          </Modal>
        </Overlay>
      )}
    </Container>
  );
}
