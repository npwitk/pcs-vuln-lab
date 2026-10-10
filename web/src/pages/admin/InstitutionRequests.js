import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { institutionsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${props => props.theme.colors.border};
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  margin-bottom: -2px;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const RequestsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const RequestCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  font-size: ${props => props.theme.typography.sizes.xl};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-transform: uppercase;
  background: ${props => {
    if (props.status === 'pending') return props.theme.colors.warning;
    if (props.status === 'approved') return props.theme.colors.success;
    if (props.status === 'rejected') return props.theme.colors.error;
    return props.theme.colors.textTertiary;
  }};
  color: white;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div``;

const Label = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.25rem;
`;

const Value = styled.div`
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
  word-break: break-word;
`;

const ReasonBox = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  padding: 1rem;
  border-radius: ${props => props.theme.radius.md};
  margin-bottom: 1.5rem;
`;

const ReasonText = styled.p`
  color: ${props => props.theme.colors.text};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
  white-space: pre-wrap;
  margin: 0;
`;

const ActionSection = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  padding-top: 1.5rem;
  margin-top: 1.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => {
    if (props.$variant === 'approve') return props.theme.colors.success;
    if (props.$variant === 'reject') return props.theme.colors.error;
    return props.theme.colors.textTertiary;
  }};
  color: white;
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: ${props => props.theme.typography.sizes.lg};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const AdminNotesBox = styled.div`
  background: ${props => props.status === 'approved'
    ? props.theme.colors.success + '20'
    : props.theme.colors.error + '20'};
  padding: 1rem;
  border-radius: ${props => props.theme.radius.md};
  border-left: 4px solid ${props => props.status === 'approved'
    ? props.theme.colors.success
    : props.theme.colors.error};
  margin-bottom: 1.5rem;
`;

const InstitutionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [adminNotes, setAdminNotes] = useState({});
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await institutionsAPI.adminGetAllRequests({ status: filter });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch institution requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const clearDraft = (requestId) => {
    setAdminNotes(prev => { const next = { ...prev }; delete next[requestId]; return next; });
  };

  const handleApprove = async (request) => {
    const notes = adminNotes[request.request_id] || '';

    if (!window.confirm(`Approve "${request.proposed_name}"? This creates the institution immediately.`)) {
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [request.request_id]: true }));
      await institutionsAPI.approveRequest(request.request_id, { admin_notes: notes || undefined });
      toast.success('Institution approved and created!');
      fetchRequests();
      clearDraft(request.request_id);
    } catch (error) {
      console.error('Failed to approve institution request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessing(prev => ({ ...prev, [request.request_id]: false }));
    }
  };

  const handleReject = async (request) => {
    const notes = adminNotes[request.request_id] || '';

    if (!notes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    if (!window.confirm('Are you sure you want to reject this institution request?')) {
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [request.request_id]: true }));
      await institutionsAPI.rejectRequest(request.request_id, notes);
      toast.success('Request rejected');
      fetchRequests();
      clearDraft(request.request_id);
    } catch (error) {
      console.error('Failed to reject institution request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessing(prev => ({ ...prev, [request.request_id]: false }));
    }
  };

  return (
    <Container>
      <Header>
        <Title>Institution Requests</Title>
        <Subtitle>Review and manage requests to add new institutions</Subtitle>
      </Header>

      <FilterTabs>
        <Tab $active={filter === 'pending'} onClick={() => setFilter('pending')}>Pending</Tab>
        <Tab $active={filter === 'approved'} onClick={() => setFilter('approved')}>Approved</Tab>
        <Tab $active={filter === 'rejected'} onClick={() => setFilter('rejected')}>Rejected</Tab>
      </FilterTabs>

      {loading ? (
        <LoadingState>Loading requests...</LoadingState>
      ) : requests.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🏫</EmptyIcon>
          <EmptyText>No {filter} institution requests found</EmptyText>
        </EmptyState>
      ) : (
        <RequestsGrid>
          {requests.map(request => (
            <RequestCard key={request.request_id}>
              <CardHeader>
                <UserInfo>
                  <UserName>{request.requester_name}</UserName>
                  <UserEmail>{request.requester_email}</UserEmail>
                </UserInfo>
                <StatusBadge status={request.status}>{request.status}</StatusBadge>
              </CardHeader>

              <InfoGrid>
                <InfoItem>
                  <Label>Proposed Name</Label>
                  <Value>{request.proposed_name}</Value>
                </InfoItem>

                <InfoItem>
                  <Label>Short Name</Label>
                  <Value>{request.proposed_short_name}</Value>
                </InfoItem>

                <InfoItem>
                  <Label>Email Domain</Label>
                  <Value>{request.proposed_email_domain}</Value>
                </InfoItem>

                {request.proposed_website_url && (
                  <InfoItem>
                    <Label>Website</Label>
                    <Value>{request.proposed_website_url}</Value>
                  </InfoItem>
                )}

                <InfoItem>
                  <Label>Submitted At</Label>
                  <Value>{new Date(request.submitted_at).toLocaleString()}</Value>
                </InfoItem>
              </InfoGrid>

              {request.reason && (
                <>
                  <Label>Why they want this institution added:</Label>
                  <ReasonBox>
                    <ReasonText>{request.reason}</ReasonText>
                  </ReasonBox>
                </>
              )}

              {request.status === 'pending' ? (
                <ActionSection>
                  <Label>Admin Notes (optional for approval, required for rejection):</Label>
                  <TextArea
                    placeholder="Add notes about this request..."
                    value={adminNotes[request.request_id] || ''}
                    onChange={(e) => setAdminNotes(prev => ({ ...prev, [request.request_id]: e.target.value }))}
                  />
                  <ButtonGroup>
                    <Button
                      $variant="approve"
                      onClick={() => handleApprove(request)}
                      disabled={processing[request.request_id]}
                    >
                      {processing[request.request_id] ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      $variant="reject"
                      onClick={() => handleReject(request)}
                      disabled={processing[request.request_id]}
                    >
                      {processing[request.request_id] ? 'Processing...' : 'Reject'}
                    </Button>
                  </ButtonGroup>
                </ActionSection>
              ) : (
                <>
                  {request.admin_notes && (
                    <AdminNotesBox status={request.status}>
                      <Label>Admin Notes:</Label>
                      <ReasonText>{request.admin_notes}</ReasonText>
                    </AdminNotesBox>
                  )}
                  {request.reviewed_at && (
                    <InfoItem>
                      <Label>Reviewed At</Label>
                      <Value>
                        {new Date(request.reviewed_at).toLocaleString()}
                        {request.reviewed_by_name && ` by ${request.reviewed_by_name}`}
                      </Value>
                    </InfoItem>
                  )}
                </>
              )}
            </RequestCard>
          ))}
        </RequestsGrid>
      )}
    </Container>
  );
};

export default InstitutionRequests;
