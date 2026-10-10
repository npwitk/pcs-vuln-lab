import React, { useState } from 'react';
import styled from 'styled-components';
import { adminAPI, cheatSheetsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Gift, X } from 'lucide-react';

const Container = styled.div`
  max-width: 1200px;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 1.5rem;
  border-radius: ${props => props.theme.radius.xl};
  box-shadow: ${props => props.theme.shadows.md};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.xl};
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.semibold};
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const Results = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.background};
`;

const ResultItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: background ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  ${props => props.$selected && `
    background: ${props.theme.colors.primaryLight};
    border-color: ${props.theme.colors.primary};
  `}

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
  background: ${props => props.theme.colors.backgroundSecondary};
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
  flex-shrink: 0;
`;

const ResultDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultName = styled.div`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultMeta = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const SelectedCard = styled.div`
  background: ${props => props.theme.colors.primaryLight};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
`;

const ClearButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: ${props => props.theme.colors.textSecondary};
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const PreviewSection = styled(Section)`
  grid-column: 1 / -1;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Arrow = styled.div`
  font-size: 2rem;
  color: ${props => props.theme.colors.primary};
  text-align: center;

  @media (max-width: 768px) {
    transform: rotate(90deg);
  }
`;

const Button = styled.button`
  padding: 0.875rem 2rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const GiveawayManagement = () => {
  const [userSearch, setUserSearch] = useState('');
  const [cheatSheetSearch, setCheatSheetSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [cheatSheets, setCheatSheets] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCheatSheet, setSelectedCheatSheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState({ users: false, cheatSheets: false });

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }

    setSearching(prev => ({ ...prev, users: true }));
    try {
      const response = await adminAPI.getAllUsers({ search: query, limit: 20, offset: 0 });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(prev => ({ ...prev, users: false }));
    }
  };

  const searchCheatSheets = async (query) => {
    if (!query || query.length < 2) {
      setCheatSheets([]);
      return;
    }

    setSearching(prev => ({ ...prev, cheatSheets: true }));
    try {
      const response = await cheatSheetsAPI.getAll({ search: query });
      setCheatSheets(response.data.cheat_sheets || []);
    } catch (error) {
      console.error('Failed to search cheat sheets:', error);
      toast.error('Failed to search cheat sheets');
    } finally {
      setSearching(prev => ({ ...prev, cheatSheets: false }));
    }
  };

  const handleUserSearchChange = (e) => {
    const value = e.target.value;
    setUserSearch(value);
    searchUsers(value);
  };

  const handleCheatSheetSearchChange = (e) => {
    const value = e.target.value;
    setCheatSheetSearch(value);
    searchCheatSheets(value);
  };

  const handleGiveAccess = async () => {
    if (!selectedUser || !selectedCheatSheet) {
      toast.error('Please select both a user and a cheat sheet');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.giveCheatSheetAccess(selectedUser.user_id, selectedCheatSheet.cheatsheet_id);
      toast.success(
        `Successfully granted ${selectedUser.name} access to "${selectedCheatSheet.title}"`,
        { duration: 5000 }
      );

      // Reset selections
      setSelectedUser(null);
      setSelectedCheatSheet(null);
      setUserSearch('');
      setCheatSheetSearch('');
      setUsers([]);
      setCheatSheets([]);
    } catch (error) {
      console.error('Failed to grant access:', error);
      toast.error(error.response?.data?.message || 'Failed to grant access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Giveaway Management</Title>
        <Subtitle>Grant free access to cheat sheets for users</Subtitle>
      </Header>

      <Grid>
        {/* User Selection */}
        <Section>
          <SectionTitle>
            1. Select User
          </SectionTitle>

          {selectedUser ? (
            <SelectedCard>
              <ClearButton onClick={() => setSelectedUser(null)}>
                <X size={18} />
              </ClearButton>
              {selectedUser.avatar_url ? (
                <Avatar src={selectedUser.avatar_url} alt={selectedUser.name} />
              ) : (
                <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
              )}
              <ResultDetails>
                <ResultName>{selectedUser.name}</ResultName>
                <ResultMeta>{selectedUser.email}</ResultMeta>
              </ResultDetails>
            </SelectedCard>
          ) : (
            <>
              <SearchBox>
                <SearchIcon size={18} />
                <SearchInput
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={handleUserSearchChange}
                />
              </SearchBox>

              <Results>
                {searching.users ? (
                  <EmptyState>Searching...</EmptyState>
                ) : users.length > 0 ? (
                  users.map(user => (
                    <ResultItem
                      key={user.user_id}
                      onClick={() => {
                        setSelectedUser(user);
                        setUserSearch('');
                        setUsers([]);
                      }}
                    >
                      {user.avatar_url ? (
                        <Avatar src={user.avatar_url} alt={user.name} />
                      ) : (
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      )}
                      <ResultDetails>
                        <ResultName>{user.name}</ResultName>
                        <ResultMeta>{user.email}</ResultMeta>
                      </ResultDetails>
                    </ResultItem>
                  ))
                ) : userSearch.length >= 2 ? (
                  <EmptyState>No users found</EmptyState>
                ) : (
                  <EmptyState>Type at least 2 characters to search</EmptyState>
                )}
              </Results>
            </>
          )}
        </Section>

        {/* Cheat Sheet Selection */}
        <Section>
          <SectionTitle>
            2. Select Cheat Sheet
          </SectionTitle>

          {selectedCheatSheet ? (
            <SelectedCard>
              <ClearButton onClick={() => setSelectedCheatSheet(null)}>
                <X size={18} />
              </ClearButton>
              <ResultDetails>
                <ResultName>{selectedCheatSheet.title}</ResultName>
                <ResultMeta>{selectedCheatSheet.course_code} • {selectedCheatSheet.price} ฿</ResultMeta>
              </ResultDetails>
            </SelectedCard>
          ) : (
            <>
              <SearchBox>
                <SearchIcon size={18} />
                <SearchInput
                  type="text"
                  placeholder="Search by title or course code..."
                  value={cheatSheetSearch}
                  onChange={handleCheatSheetSearchChange}
                />
              </SearchBox>

              <Results>
                {searching.cheatSheets ? (
                  <EmptyState>Searching...</EmptyState>
                ) : cheatSheets.length > 0 ? (
                  cheatSheets.map(sheet => (
                    <ResultItem
                      key={sheet.cheatsheet_id}
                      onClick={() => {
                        setSelectedCheatSheet(sheet);
                        setCheatSheetSearch('');
                        setCheatSheets([]);
                      }}
                    >
                      <ResultDetails>
                        <ResultName>{sheet.title}</ResultName>
                        <ResultMeta>{sheet.course_code} • {parseFloat(sheet.price || 0).toFixed(2)} ฿</ResultMeta>
                      </ResultDetails>
                    </ResultItem>
                  ))
                ) : cheatSheetSearch.length >= 2 ? (
                  <EmptyState>No cheat sheets found</EmptyState>
                ) : (
                  <EmptyState>Type at least 2 characters to search</EmptyState>
                )}
              </Results>
            </>
          )}
        </Section>
      </Grid>

      {/* Preview & Confirm */}
      {(selectedUser || selectedCheatSheet) && (
        <PreviewSection>
          <SectionTitle>3. Confirm & Grant Access</SectionTitle>

          <PreviewGrid>
            <SelectedCard style={{ minHeight: '80px' }}>
              {selectedUser ? (
                <>
                  {selectedUser.avatar_url ? (
                    <Avatar src={selectedUser.avatar_url} alt={selectedUser.name} />
                  ) : (
                    <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                  )}
                  <ResultDetails>
                    <ResultName>{selectedUser.name}</ResultName>
                    <ResultMeta>{selectedUser.email}</ResultMeta>
                  </ResultDetails>
                </>
              ) : (
                <EmptyState>Select a user</EmptyState>
              )}
            </SelectedCard>

            <Arrow>→</Arrow>

            <SelectedCard style={{ minHeight: '80px' }}>
              {selectedCheatSheet ? (
                <ResultDetails>
                  <ResultName>{selectedCheatSheet.title}</ResultName>
                  <ResultMeta>{selectedCheatSheet.course_code}</ResultMeta>
                </ResultDetails>
              ) : (
                <EmptyState>Select a cheat sheet</EmptyState>
              )}
            </SelectedCard>
          </PreviewGrid>

          <Button
            onClick={handleGiveAccess}
            disabled={!selectedUser || !selectedCheatSheet || loading}
          >
            <Gift size={20} />
            {loading ? 'Granting Access...' : 'Grant Free Access'}
          </Button>
        </PreviewSection>
      )}
    </Container>
  );
};

export default GiveawayManagement;
