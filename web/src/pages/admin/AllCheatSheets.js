import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Gift, X, Search } from 'lucide-react';
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
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const FilterSection = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 1.5rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  min-width: 250px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  cursor: pointer;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TableContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  th {
    text-align: left;
    padding: 1rem;
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.typography.sizes.sm};
    border-bottom: 2px solid ${props => props.theme.colors.border};
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid ${props => props.theme.colors.borderLight};
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.sizes.sm};
  }

  tbody tr {
    transition: background ${props => props.theme.transitions.fast};

    &:hover {
      background: ${props => props.theme.colors.backgroundTertiary};
    }
  }
`;

const CheatSheetTitle = styled(Link)`
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.weights.medium};

  &:hover {
    color: ${props => props.theme.colors.primary};
    text-decoration: underline;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.$checked ? props.theme.colors.success : props.theme.colors.textTertiary};
    transition: 0.3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
      transform: ${props => props.$checked ? 'translateX(26px)' : 'translateX(0)'};
    }
  }

  &:hover span {
    box-shadow: 0 0 1px ${props => props.theme.colors.primary};
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  background: ${props => {
    switch(props.$status) {
      case 'approved': return props.theme.colors.success;
      case 'pending': return props.theme.colors.warning;
      case 'rejected': return props.theme.colors.error;
      default: return props.theme.colors.textTertiary;
    }
  }};
  color: white;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textTertiary};
  font-size: ${props => props.theme.typography.sizes.lg};
`;

const Stats = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};

  span {
    font-weight: ${props => props.theme.typography.weights.semibold};
  }
`;

const ActionButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: ${props => props.theme.radius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const UserList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.background};
`;

const UserItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: background ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarFallback = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
`;

const UserEmail = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

function AllCheatSheets() {
  const [cheatSheets, setCheatSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');

  // Giveaway modal state
  const [showGiveawayModal, setShowGiveawayModal] = useState(false);
  const [selectedCheatSheet, setSelectedCheatSheet] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [givingAccess, setGivingAccess] = useState(false);

  useEffect(() => {
    fetchCheatSheets();
  }, []);

  const fetchCheatSheets = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllCheatSheets();
      setCheatSheets(response.data.cheat_sheets || []);
    } catch (error) {
      console.error('Failed to fetch cheat sheets:', error);
      toast.error('Failed to load cheat sheets');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (cheatsheetId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await adminAPI.updateCheatSheetStatus(cheatsheetId, newStatus);

      // Update local state
      setCheatSheets(prev => prev.map(cs =>
        cs.cheatsheet_id === cheatsheetId
          ? { ...cs, is_active: newStatus }
          : cs
      ));

      toast.success(`Cheat sheet ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update status');
    }
  };

  const openGiveawayModal = (cheatSheet) => {
    setSelectedCheatSheet(cheatSheet);
    setShowGiveawayModal(true);
    setUserSearchQuery('');
    setUsers([]);
  };

  const closeGiveawayModal = () => {
    setShowGiveawayModal(false);
    setSelectedCheatSheet(null);
    setUserSearchQuery('');
    setUsers([]);
  };

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const response = await adminAPI.getAllUsers({ search: query, limit: 20, offset: 0 });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleUserSearchChange = (e) => {
    const value = e.target.value;
    setUserSearchQuery(value);
    searchUsers(value);
  };

  const handleGiveToUser = async (user) => {
    if (!selectedCheatSheet) return;

    setGivingAccess(true);
    try {
      await adminAPI.giveCheatSheetAccess(user.user_id, selectedCheatSheet.cheatsheet_id);
      toast.success(
        `Successfully granted ${user.name} access to "${selectedCheatSheet.title}"`,
        { duration: 5000 }
      );
      closeGiveawayModal();
    } catch (error) {
      console.error('Failed to grant access:', error);
      toast.error(error.response?.data?.message || 'Failed to grant access');
    } finally {
      setGivingAccess(false);
    }
  };

  const filteredCheatSheets = cheatSheets.filter(cs => {
    const matchesSearch = cs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cs.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cs.creator_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || cs.approval_status === statusFilter;
    const matchesActive = activeFilter === 'all' ||
                         (activeFilter === 'active' && cs.is_active) ||
                         (activeFilter === 'inactive' && !cs.is_active);

    return matchesSearch && matchesStatus && matchesActive;
  });

  const stats = {
    total: cheatSheets.length,
    active: cheatSheets.filter(cs => cs.is_active).length,
    inactive: cheatSheets.filter(cs => !cs.is_active).length,
    approved: cheatSheets.filter(cs => cs.approval_status === 'approved').length,
    pending: cheatSheets.filter(cs => cs.approval_status === 'pending').length,
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container>
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'All Cheat Sheets' }]} />
      <Header>
        <div>
          <Title>All Cheat Sheets</Title>
          <Stats>
            <div>Total: <span>{stats.total}</span></div>
            <div>Active: <span>{stats.active}</span></div>
            <div>Inactive: <span>{stats.inactive}</span></div>
            <div>Approved: <span>{stats.approved}</span></div>
            <div>Pending: <span>{stats.pending}</span></div>
          </Stats>
        </div>
      </Header>

      <FilterSection>
        <FilterGroup>
          <Label>Search</Label>
          <Input
            type="text"
            placeholder="Search by title, course code, or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <Label>Approval Status</Label>
          <Select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <Label>Active Status</Label>
          <Select aria-label="Filter by active status" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </FilterGroup>
      </FilterSection>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Course Code</th>
              <th>Creator</th>
              <th>Price</th>
              <th>Purchases</th>
              <th>Status</th>
              <th>Active</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCheatSheets.length === 0 ? (
              <tr>
                <td colSpan="10">
                  <EmptyState>
                    {searchTerm || statusFilter !== 'all' || activeFilter !== 'all'
                      ? 'No cheat sheets match your filters'
                      : 'No cheat sheets found'}
                  </EmptyState>
                </td>
              </tr>
            ) : (
              filteredCheatSheets.map(cs => (
                <tr key={cs.cheatsheet_id}>
                  <td>{cs.cheatsheet_id}</td>
                  <td>
                    <CheatSheetTitle to={`/cheatsheet/${cs.cheatsheet_id}`}>
                      {cs.title}
                    </CheatSheetTitle>
                  </td>
                  <td>{cs.course_code}</td>
                  <td>{cs.creator_name || 'Unknown'}</td>
                  <td>{parseFloat(cs.price).toFixed(2)} ฿</td>
                  <td>{cs.purchase_count || 0}</td>
                  <td>
                    <Badge $status={cs.approval_status}>
                      {cs.approval_status}
                    </Badge>
                  </td>
                  <td>
                    <ToggleSwitch $checked={cs.is_active}>
                      <input
                        type="checkbox"
                        checked={cs.is_active}
                        onChange={() => handleToggleActive(cs.cheatsheet_id, cs.is_active)}
                      />
                      <span />
                    </ToggleSwitch>
                  </td>
                  <td>
                    {new Date(cs.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td>
                    <ActionButton
                      onClick={() => openGiveawayModal(cs)}
                      title="Give to User"
                    >
                      <Gift size={16} />
                    </ActionButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* Giveaway Modal */}
      {showGiveawayModal && selectedCheatSheet && (
        <ModalOverlay onClick={closeGiveawayModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Give "{selectedCheatSheet.title}" to User</ModalTitle>
              <CloseButton onClick={closeGiveawayModal}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <SearchBox>
              <SearchIcon size={18} />
              <SearchInput
                type="text"
                placeholder="Search by name or email..."
                value={userSearchQuery}
                onChange={handleUserSearchChange}
                autoFocus
              />
            </SearchBox>

            <UserList>
              {searchingUsers ? (
                <EmptyState>Searching...</EmptyState>
              ) : users.length > 0 ? (
                users.map(user => (
                  <UserItem
                    key={user.user_id}
                    onClick={() => handleGiveToUser(user)}
                    style={{ opacity: givingAccess ? 0.5 : 1, cursor: givingAccess ? 'wait' : 'pointer' }}
                  >
                    {user.avatar_url ? (
                      <Avatar src={user.avatar_url} alt={user.name} />
                    ) : (
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    )}
                    <UserDetails>
                      <UserName>{user.name}</UserName>
                      <UserEmail>{user.email}</UserEmail>
                    </UserDetails>
                    <Gift size={16} style={{ opacity: 0.5 }} />
                  </UserItem>
                ))
              ) : userSearchQuery.length >= 2 ? (
                <EmptyState>No users found</EmptyState>
              ) : (
                <EmptyState>Type at least 2 characters to search</EmptyState>
              )}
            </UserList>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default AllCheatSheets;
