import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { campaignLinksAPI, cheatSheetsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Trash2, X, Copy, Search } from 'lucide-react';
import { copyTextToClipboard } from '../../utils/clipboard';
import Breadcrumbs from '../../components/ui/Breadcrumb';

const Container = styled.div`
  max-width: 1000px;
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
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const HelpBanner = styled.div`
  background: ${props => props.theme.colors.primaryLight};
  border: 1px solid ${props => props.theme.colors.primary}40;
  border-radius: ${props => props.theme.radius.md};
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  line-height: 1.5;
`;

const PickerWrapper = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  box-shadow: ${props => props.theme.shadows.md};
  max-height: 320px;
  overflow-y: auto;
  z-index: 10;
`;

const SearchResultItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  cursor: pointer;
  color: ${props => props.theme.colors.text};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const SearchResultTitle = styled.div`
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const SearchResultMeta = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const SelectedSheetBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SelectedSheetInfo = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};

  strong {
    font-weight: ${props => props.theme.typography.weights.semibold};
  }
`;

const ChangeButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.sm};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const TableContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
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
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.typography.sizes.sm};
  }

  tbody tr {
    transition: background ${props => props.theme.transitions.fast};

    &:hover {
      background: ${props => props.theme.colors.backgroundSecondary};
    }
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
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: ${props => props.$variant === 'danger' ? props.theme.colors.error : props.theme.colors.primary};
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
    opacity: 0.8;
    transform: translateY(-2px);
  }
`;

const SlugText = styled.code`
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textTertiary};
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.lg};
`;

// Modal styles
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
  max-width: 480px;
  width: 100%;
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
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
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
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const HelpText = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.5rem;
  line-height: 1.5;
`;

const SubmitButton = styled.button`
  padding: 0.875rem 2rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function buildShareUrl(campaign) {
  return `${window.location.origin}/cheatsheet/${campaign.cheatsheet_id}?src=${encodeURIComponent(campaign.source_slug)}`;
}

function CampaignManagement() {
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchDebounceRef = useRef(null);

  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [label, setLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = useCallback(async (cheatsheetId) => {
    try {
      setLoadingCampaigns(true);
      const response = await campaignLinksAPI.adminGetAll(cheatsheetId);
      setCampaigns(response.data.campaign_links || []);
    } catch (error) {
      console.error('Failed to fetch campaign links:', error);
      toast.error('Failed to load campaign links');
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSheet) {
      fetchCampaigns(selectedSheet.cheatsheet_id);
    }
  }, [selectedSheet, fetchCampaigns]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(true);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await cheatSheetsAPI.getAll({ search: value.trim(), limit: 8 });
        setSearchResults(response.data.cheat_sheets || []);
      } catch (error) {
        console.error('Cheat sheet search failed:', error);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const selectSheet = (sheet) => {
    setSelectedSheet(sheet);
    setShowResults(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const changeSheet = () => {
    setSelectedSheet(null);
    setCampaigns([]);
  };

  const openAddModal = () => {
    setLabel('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setLabel('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim()) {
      toast.error('Campaign label is required');
      return;
    }

    setSubmitting(true);
    try {
      await campaignLinksAPI.create({ cheatsheet_id: selectedSheet.cheatsheet_id, label: label.trim() });
      toast.success('Campaign link created');
      closeModal();
      fetchCampaigns(selectedSheet.cheatsheet_id);
    } catch (error) {
      console.error('Failed to create campaign link:', error);
      toast.error(error.response?.data?.message || 'Failed to create campaign link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (campaign) => {
    try {
      await campaignLinksAPI.toggleActive(campaign.campaign_id);
      setCampaigns(prev => prev.map(c =>
        c.campaign_id === campaign.campaign_id ? { ...c, is_active: !c.is_active } : c
      ));
      toast.success(`Campaign ${campaign.is_active ? 'deactivated' : 'activated'}`);
    } catch (error) {
      console.error('Failed to toggle campaign link:', error);
      toast.error('Failed to update campaign');
    }
  };

  const handleDelete = async (campaign) => {
    const confirmed = window.confirm(`Delete the "${campaign.label}" campaign? This can't be undone.`);
    if (!confirmed) return;

    try {
      await campaignLinksAPI.delete(campaign.campaign_id);
      setCampaigns(prev => prev.filter(c => c.campaign_id !== campaign.campaign_id));
      toast.success('Campaign link deleted');
    } catch (error) {
      console.error('Failed to delete campaign link:', error);
      toast.error(error.response?.data?.message || 'Failed to delete campaign');
    }
  };

  const handleCopyLink = async (campaign) => {
    const copied = await copyTextToClipboard(buildShareUrl(campaign));
    if (copied) {
      toast.success('Link copied!');
    } else {
      toast.error('Could not copy the link — please try again');
    }
  };

  return (
    <Container>
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Campaign Links' }]} />
      <Header>
        <HeaderLeft>
          <Title>Campaign Links</Title>
          <Subtitle>Generate named, trackable promotional share links for a cheat sheet</Subtitle>
        </HeaderLeft>
      </Header>

      <HelpBanner>
        Each campaign gets its own <code>?src=</code> tag so you can see exactly which promotion
        drove which clicks. This is separate from the automatic per-user tags regular sharers get —
        use this when you're the one promoting a sheet somewhere specific (a social post, a group
        chat, an ad) and want to measure it.
      </HelpBanner>

      <PickerWrapper>
        <SearchInputWrapper>
          <SearchIcon size={16} />
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
            placeholder="Search cheat sheet by title or course code..."
          />
        </SearchInputWrapper>
        {showResults && searchQuery.trim() && (
          <SearchResults>
            {searching ? (
              <SearchResultItem as="div">Searching...</SearchResultItem>
            ) : searchResults.length === 0 ? (
              <SearchResultItem as="div">No matches found</SearchResultItem>
            ) : (
              searchResults.map(sheet => (
                <SearchResultItem key={sheet.cheatsheet_id} onClick={() => selectSheet(sheet)}>
                  <SearchResultTitle>{sheet.title}</SearchResultTitle>
                  <SearchResultMeta>{sheet.course_code}</SearchResultMeta>
                </SearchResultItem>
              ))
            )}
          </SearchResults>
        )}
      </PickerWrapper>

      {selectedSheet && (
        <SelectedSheetBar>
          <SelectedSheetInfo>
            Campaigns for <strong>{selectedSheet.title}</strong> ({selectedSheet.course_code})
          </SelectedSheetInfo>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ChangeButton onClick={changeSheet}>Change</ChangeButton>
            <AddButton onClick={openAddModal}>
              <Plus size={16} />
              Add Campaign
            </AddButton>
          </div>
        </SelectedSheetBar>
      )}

      {!selectedSheet ? (
        <EmptyState>Search for a cheat sheet above to manage its campaign links.</EmptyState>
      ) : loadingCampaigns ? (
        <LoadingSpinner />
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Label</th>
                <th>Source</th>
                <th>Clicks</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <EmptyState>No campaigns yet for this sheet. Click "Add Campaign" to create one.</EmptyState>
                  </td>
                </tr>
              ) : (
                campaigns.map(campaign => (
                  <tr key={campaign.campaign_id}>
                    <td style={{ fontWeight: 600 }}>{campaign.label}</td>
                    <td><SlugText>{campaign.source_slug}</SlugText></td>
                    <td>{campaign.click_count}</td>
                    <td>
                      <ToggleSwitch $checked={campaign.is_active}>
                        <input
                          type="checkbox"
                          checked={campaign.is_active}
                          onChange={() => handleToggleActive(campaign)}
                        />
                        <span />
                      </ToggleSwitch>
                    </td>
                    <td>
                      <ActionButtons>
                        <ActionButton onClick={() => handleCopyLink(campaign)} title="Copy link">
                          <Copy size={16} />
                        </ActionButton>
                        <ActionButton
                          $variant="danger"
                          onClick={() => handleDelete(campaign)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </ActionButton>
                      </ActionButtons>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {showModal && selectedSheet && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Add Campaign</ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Campaign Label *</Label>
                <Input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. instagram_bio, spring2026_promo"
                  autoFocus
                  required
                />
                <HelpText>
                  Turned into the link's <code>?src=</code> tag automatically. Must be unique for
                  this cheat sheet.
                </HelpText>
              </FormGroup>

              <SubmitButton type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Campaign'}
              </SubmitButton>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default CampaignManagement;
