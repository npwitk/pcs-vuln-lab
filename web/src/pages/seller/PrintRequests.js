import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { printServiceAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Eye, EyeOff } from 'lucide-react';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const PageSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterLabel = styled.label`
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textSecondary};
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.sm};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const RequestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RequestCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const CheatSheetTitle = styled.div`
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.lg};
  color: ${props => props.theme.colors.text};
`;

const CourseCode = styled.span`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  margin-left: 0.5rem;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const STATUS_COLORS = {
  pending_payment:  '#ff9800',
  confirmed:        '#1976d2',
  printing:         '#7b1fa2',
  ready_for_pickup: '#388e3c',
  completed:        '#9e9e9e',
  cancelled:        '#f44336'
};

const StatusBadge = styled.span`
  background: ${props => STATUS_COLORS[props.$status] || '#9e9e9e'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-transform: capitalize;
  white-space: nowrap;
`;

const MethodBadge = styled.span`
  background: ${props => props.$method === 'tu_credit' ? '#0288d1' : '#00897b'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.75rem;
  font-size: ${props => props.theme.typography.sizes.sm};

  strong {
    display: block;
    color: ${props => props.theme.colors.textTertiary};
    font-size: ${props => props.theme.typography.sizes.xs};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.2rem;
  }

  span {
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.typography.weights.medium};
  }
`;

const StudentIdBox = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(2, 136, 209, 0.15)' : '#e1f5fe'};
  border: 1px solid #0288d1;
  border-left: 4px solid #0288d1;
  border-radius: ${props => props.theme.radius.md};
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};

  strong {
    display: block;
    font-size: ${props => props.theme.typography.sizes.xs};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #0288d1;
    margin-bottom: 0.25rem;
  }
`;

const IdCardRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const IdCardValue = styled.span`
  font-family: monospace;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  letter-spacing: 0.05em;
`;

const RevealButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #0288d1;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: opacity 0.15s;

  &:hover { opacity: 0.7; }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => props.$variant === 'cancel'
    ? props.theme.colors.error
    : props.theme.colors.primary};
  color: white;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    opacity: 0.85;
    transform: translateY(-1px);
  }
`;

const DateText = styled.span`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textTertiary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  color: ${props => props.theme.colors.textTertiary};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const STATUS_NEXT = {
  pending_payment:  'confirmed',
  confirmed:        'printing',
  printing:         'ready_for_pickup',
  ready_for_pickup: 'completed'
};

const STATUS_NEXT_LABEL = {
  pending_payment:  'Mark as Confirmed',
  confirmed:        'Mark as Printing',
  printing:         'Mark as Ready for Pickup',
  ready_for_pickup: 'Mark as Completed'
};

const STATUSES = ['all', 'pending_payment', 'confirmed', 'printing', 'ready_for_pickup', 'completed', 'cancelled'];

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const PrintRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [revealedIds, setRevealedIds] = useState(new Set());

  const toggleReveal = (requestId) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      next.has(requestId) ? next.delete(requestId) : next.add(requestId);
      return next;
    });
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await printServiceAPI.getSellerRequests(params);
      setRequests(res.data.requests || []);
    } catch {
      toast.error('Failed to load print requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAdvanceStatus = async (requestId, currentStatus) => {
    const nextStatus = STATUS_NEXT[currentStatus];
    if (!nextStatus) return;
    setUpdatingId(requestId);
    try {
      await printServiceAPI.updateRequestStatus(requestId, nextStatus);
      toast.success(`Marked as "${nextStatus.replace(/_/g, ' ')}"`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (requestId) => {
    setUpdatingId(requestId);
    try {
      await printServiceAPI.updateRequestStatus(requestId, 'cancelled');
      toast.success('Request cancelled');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const isFinal = (status) => status === 'completed' || status === 'cancelled';

  return (
    <Container>
      <PageHeader>
        <PageTitle>Print Requests</PageTitle>
        <PageSubtitle>Manage print requests from buyers of your cheat sheets</PageSubtitle>
      </PageHeader>

      <FilterRow>
        <FilterLabel htmlFor="status-filter">Filter by status:</FilterLabel>
        <Select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </option>
          ))}
        </Select>
      </FilterRow>

      {loading ? (
        <LoadingSpinner />
      ) : requests.length === 0 ? (
        <EmptyState>
          {statusFilter === 'all'
            ? 'No print requests yet. Enable the print service on your cheat sheets to start receiving requests.'
            : `No requests with status "${statusFilter.replace(/_/g, ' ')}".`}
        </EmptyState>
      ) : (
        <RequestList>
          {requests.map((req) => (
            <RequestCard key={req.request_id}>
              <CardTop>
                <div>
                  <CheatSheetTitle>
                    {req.cheatsheet_title}
                    <CourseCode>{req.course_code}</CourseCode>
                  </CheatSheetTitle>
                  <DateText>Requested {formatDate(req.created_at)}</DateText>
                </div>
                <BadgeRow>
                  <MethodBadge $method={req.payment_method}>
                    {req.payment_method === 'tu_credit' ? 'TU Credit' : 'PromptPay'}
                  </MethodBadge>
                  <StatusBadge $status={req.status}>
                    {req.status.replace(/_/g, ' ')}
                  </StatusBadge>
                </BadgeRow>
              </CardTop>

              <InfoGrid>
                <InfoItem>
                  <strong>Buyer</strong>
                  <span>{req.buyer_name}</span>
                </InfoItem>
                <InfoItem>
                  <strong>Email</strong>
                  <span>{req.buyer_email}</span>
                </InfoItem>
                <InfoItem>
                  <strong>Pages</strong>
                  <span>{req.page_count}</span>
                </InfoItem>
                <InfoItem>
                  <strong>Total</strong>
                  <span>{parseFloat(req.total_price).toFixed(2)} ฿</span>
                </InfoItem>
              </InfoGrid>

              {req.payment_method === 'tu_credit' && (req.student_id || req.id_card_number) && (
                <StudentIdBox>
                  {req.student_id && (
                    <>
                      <strong>Student ID (use at TU Library printer)</strong>
                      {req.student_id}
                    </>
                  )}
                  {req.id_card_number && (
                    <IdCardRow>
                      <div style={{ flex: 1 }}>
                        <strong style={{ marginBottom: '0.2rem' }}>ID Card Number</strong>
                        <IdCardValue>
                          {revealedIds.has(req.request_id)
                            ? req.id_card_number
                            : '•'.repeat(13)}
                        </IdCardValue>
                      </div>
                      <RevealButton
                        onClick={() => toggleReveal(req.request_id)}
                        title={revealedIds.has(req.request_id) ? 'Hide' : 'Reveal'}
                      >
                        {revealedIds.has(req.request_id)
                          ? <EyeOff size={16} />
                          : <Eye size={16} />}
                      </RevealButton>
                    </IdCardRow>
                  )}
                </StudentIdBox>
              )}

              {req.fulfillment_method === 'assisted_release' && req.safeq_password && (
                <StudentIdBox>
                  <IdCardRow>
                    <div style={{ flex: 1 }}>
                      <strong style={{ marginBottom: '0.2rem' }}>Thammasat Printer Password (assisted release)</strong>
                      <IdCardValue>
                        {revealedIds.has(req.request_id)
                          ? req.safeq_password
                          : '•'.repeat(10)}
                      </IdCardValue>
                    </div>
                    <RevealButton
                      onClick={() => toggleReveal(req.request_id)}
                      title={revealedIds.has(req.request_id) ? 'Hide' : 'Reveal'}
                    >
                      {revealedIds.has(req.request_id)
                        ? <EyeOff size={16} />
                        : <Eye size={16} />}
                    </RevealButton>
                  </IdCardRow>
                </StudentIdBox>
              )}

              {!isFinal(req.status) && (
                <ActionRow>
                  {STATUS_NEXT[req.status] && (
                    <ActionButton
                      disabled={updatingId === req.request_id}
                      onClick={() => handleAdvanceStatus(req.request_id, req.status)}
                    >
                      {updatingId === req.request_id ? 'Updating...' : STATUS_NEXT_LABEL[req.status]}
                    </ActionButton>
                  )}
                  <ActionButton
                    $variant="cancel"
                    disabled={updatingId === req.request_id}
                    onClick={() => handleCancel(req.request_id)}
                  >
                    Cancel
                  </ActionButton>
                </ActionRow>
              )}
            </RequestCard>
          ))}
        </RequestList>
      )}
    </Container>
  );
};

export default PrintRequests;
