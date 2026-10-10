import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { storesAPI } from '../../services/api';
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

const OverrideGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
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

const CreatePanelToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radius.md};
  background: transparent;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
  }
`;

const CreatePanel = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

const SearchResultsBox = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  max-height: 220px;
  overflow-y: auto;
  margin-top: 0.5rem;
`;

const SearchResultItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const SelectedChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.5rem 0.375rem 0.75rem;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.borderLight};
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
`;

const OwnerTag = styled.span`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-transform: uppercase;
`;

const ChipRemove = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;

  &:hover {
    color: ${props => props.theme.colors.error};
  }
`;

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const StoresSection = styled.div`
  margin-bottom: 2.5rem;
`;

const SectionHeading = styled.h2`
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const StoresList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const StoreRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  flex-wrap: wrap;
`;

const StoreRowName = styled.div`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
`;

const StoreRowMeta = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ManageLink = styled(Link)`
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  text-decoration: none;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const FlagshipStoreRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [adminNotes, setAdminNotes] = useState({});
  const [nameOverrides, setNameOverrides] = useState({});
  const [slugOverrides, setSlugOverrides] = useState({});
  const [processing, setProcessing] = useState({});

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createSlug, setCreateSlug] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creating, setCreating] = useState(false);

  const [allStores, setAllStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);

  useEffect(() => {
    if (!showCreatePanel) return undefined;
    const handle = setTimeout(async () => {
      try {
        const response = await storesAPI.searchEligibleMembers(memberSearch);
        setSearchResults(response.data.users);
      } catch (error) {
        console.error('Failed to search eligible members:', error);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [memberSearch, showCreatePanel]);

  const handleCreateNameChange = (value) => {
    setCreateName(value);
    setCreateSlug(prev => (prev === slugify(createName) ? slugify(value) : prev));
  };

  const addMember = (user) => {
    if (selectedMembers.some(m => m.user_id === user.user_id)) return;
    setSelectedMembers(prev => [...prev, user]);
  };

  const removeMember = (userId) => {
    setSelectedMembers(prev => prev.filter(m => m.user_id !== userId));
  };

  const resetCreatePanel = () => {
    setCreateName('');
    setCreateSlug('');
    setMemberSearch('');
    setSearchResults([]);
    setSelectedMembers([]);
  };

  const handleCreateStore = async () => {
    if (!createName.trim()) {
      toast.error('Please provide a store name');
      return;
    }
    if (createSlug.length < 3) {
      toast.error('Slug must be at least 3 characters');
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }
    if (!window.confirm(
      `Create "${createName.trim()}" with ${selectedMembers.length} member(s)? ` +
      `${selectedMembers[0].name} will be the store's owner.`
    )) {
      return;
    }

    try {
      setCreating(true);
      await storesAPI.adminCreate({
        name: createName.trim(),
        slug: createSlug,
        member_user_ids: selectedMembers.map(m => m.user_id),
      });
      toast.success('Flagship store created!');
      setShowCreatePanel(false);
      resetCreatePanel();
      fetchAllStores();
    } catch (error) {
      console.error('Failed to create flagship store:', error);
      toast.error(error.response?.data?.message || 'Failed to create store');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  useEffect(() => {
    fetchAllStores();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await storesAPI.getAllRequests({ status: filter });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch flagship store requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStores = async () => {
    try {
      setLoadingStores(true);
      const response = await storesAPI.adminGetAllStores();
      setAllStores(response.data.stores);
    } catch (error) {
      console.error('Failed to fetch flagship stores:', error);
    } finally {
      setLoadingStores(false);
    }
  };

  const clearDrafts = (requestId) => {
    setAdminNotes(prev => { const next = { ...prev }; delete next[requestId]; return next; });
    setNameOverrides(prev => { const next = { ...prev }; delete next[requestId]; return next; });
    setSlugOverrides(prev => { const next = { ...prev }; delete next[requestId]; return next; });
  };

  const handleApprove = async (request) => {
    const notes = adminNotes[request.request_id] || '';
    const name = (nameOverrides[request.request_id] || '').trim();
    const slug = (slugOverrides[request.request_id] || '').trim();

    if (!window.confirm(`Approve "${name || request.proposed_name}"? This creates the store immediately.`)) {
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [request.request_id]: true }));
      await storesAPI.approveRequest(request.request_id, {
        admin_notes: notes || undefined,
        name: name || undefined,
        slug: slug || undefined,
      });
      toast.success('Flagship store approved and created!');
      fetchRequests();
      fetchAllStores();
      clearDrafts(request.request_id);
    } catch (error) {
      console.error('Failed to approve flagship store request:', error);
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
    if (!window.confirm('Are you sure you want to reject this flagship store request?')) {
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [request.request_id]: true }));
      await storesAPI.rejectRequest(request.request_id, notes);
      toast.success('Request rejected');
      fetchRequests();
      clearDrafts(request.request_id);
    } catch (error) {
      console.error('Failed to reject flagship store request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessing(prev => ({ ...prev, [request.request_id]: false }));
    }
  };

  return (
    <Container>
      <Header>
        <Title>Flagship Store Requests</Title>
        <Subtitle>Review and manage flagship store requests (beta)</Subtitle>
      </Header>

      <CreatePanelToggle onClick={() => setShowCreatePanel(prev => !prev)}>
        {showCreatePanel ? <X size={16} /> : <Plus size={16} />}
        {showCreatePanel ? 'Cancel' : 'Create a Store Directly'}
      </CreatePanelToggle>

      {showCreatePanel && (
        <CreatePanel>
          <Label>Store Name</Label>
          <FormRow>
            <Input
              type="text"
              placeholder="e.g. Study Squad"
              value={createName}
              onChange={(e) => handleCreateNameChange(e.target.value)}
            />
          </FormRow>

          <Label>Slug</Label>
          <FormRow>
            <Input
              type="text"
              placeholder="study-squad"
              value={createSlug}
              onChange={(e) => setCreateSlug(slugify(e.target.value))}
            />
          </FormRow>

          <Label>Members</Label>
          <FormRow>
            <Input
              type="text"
              placeholder="Search sellers by name or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <SearchResultsBox>
                {searchResults
                  .filter(u => !selectedMembers.some(m => m.user_id === u.user_id))
                  .map(user => (
                    <SearchResultItem key={user.user_id} type="button" onClick={() => addMember(user)}>
                      <span>{user.name} ({user.email})</span>
                      <Plus size={14} />
                    </SearchResultItem>
                  ))}
              </SearchResultsBox>
            )}

            {selectedMembers.length > 0 && (
              <SelectedChips>
                {selectedMembers.map((member, index) => (
                  <Chip key={member.user_id}>
                    {index === 0 && <OwnerTag>Owner</OwnerTag>}
                    {member.name}
                    <ChipRemove type="button" onClick={() => removeMember(member.user_id)} aria-label={`Remove ${member.name}`}>
                      <X size={14} />
                    </ChipRemove>
                  </Chip>
                ))}
              </SelectedChips>
            )}
          </FormRow>

          <ButtonGroup>
            <Button $variant="approve" onClick={handleCreateStore} disabled={creating}>
              {creating ? 'Creating...' : 'Create Store'}
            </Button>
          </ButtonGroup>
        </CreatePanel>
      )}

      <StoresSection>
        <SectionHeading>Existing Stores</SectionHeading>
        {loadingStores ? (
          <LoadingState>Loading stores...</LoadingState>
        ) : allStores.length === 0 ? (
          <EmptyState>
            <EmptyText>No flagship stores yet</EmptyText>
          </EmptyState>
        ) : (
          <StoresList>
            {allStores.map(store => (
              <StoreRow key={store.store_id}>
                <div>
                  <StoreRowName>{store.name}</StoreRowName>
                  <StoreRowMeta>
                    /store/{store.slug} · {store.member_count} member{store.member_count === '1' ? '' : 's'}
                    {!store.is_active && ' · inactive'}
                  </StoreRowMeta>
                </div>
                <ManageLink to={`/store-management/${store.slug}`}>Manage Banner/Icon</ManageLink>
              </StoreRow>
            ))}
          </StoresList>
        )}
      </StoresSection>

      <FilterTabs>
        <Tab $active={filter === 'pending'} onClick={() => setFilter('pending')}>Pending</Tab>
        <Tab $active={filter === 'approved'} onClick={() => setFilter('approved')}>Approved</Tab>
        <Tab $active={filter === 'rejected'} onClick={() => setFilter('rejected')}>Rejected</Tab>
      </FilterTabs>

      {loading ? (
        <LoadingState>Loading requests...</LoadingState>
      ) : requests.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🏪</EmptyIcon>
          <EmptyText>No {filter} flagship store requests found</EmptyText>
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
                  <Label>Proposed Slug</Label>
                  <Value>/store/{request.proposed_slug}</Value>
                </InfoItem>

                <InfoItem>
                  <Label>Co-members</Label>
                  <Value>
                    {request.co_members?.length
                      ? request.co_members.map(m => `${m.name} (${m.email})`).join(', ')
                      : 'None'}
                  </Value>
                </InfoItem>

                <InfoItem>
                  <Label>Submitted At</Label>
                  <Value>{new Date(request.submitted_at).toLocaleString()}</Value>
                </InfoItem>
              </InfoGrid>

              {request.reason && (
                <>
                  <Label>Why they want a flagship store:</Label>
                  <ReasonBox>
                    <ReasonText>{request.reason}</ReasonText>
                  </ReasonBox>
                </>
              )}

              {request.status === 'pending' ? (
                <ActionSection>
                  <Label>Adjust name/slug before approving (optional — defaults to what was requested):</Label>
                  <OverrideGrid>
                    <Input
                      type="text"
                      placeholder={request.proposed_name}
                      value={nameOverrides[request.request_id] || ''}
                      onChange={(e) => setNameOverrides(prev => ({ ...prev, [request.request_id]: e.target.value }))}
                    />
                    <Input
                      type="text"
                      placeholder={request.proposed_slug}
                      value={slugOverrides[request.request_id] || ''}
                      onChange={(e) => setSlugOverrides(prev => ({ ...prev, [request.request_id]: e.target.value }))}
                    />
                  </OverrideGrid>

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

export default FlagshipStoreRequests;
