import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { bundleDiscountsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
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
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
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

const EMPTY_FORM = { min_items: '', discount_percentage: '' };

function BundleDiscountManagement() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const response = await bundleDiscountsAPI.adminGetAll();
      setTiers(response.data.bundle_discounts || []);
    } catch (error) {
      console.error('Failed to fetch bundle discounts:', error);
      toast.error('Failed to load bundle discount tiers');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTier(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (tier) => {
    setEditingTier(tier);
    setFormData({
      min_items: String(tier.min_items),
      discount_percentage: String(tier.discount_percentage),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTier(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const minItems = parseInt(formData.min_items);
    const discountPercentage = parseFloat(formData.discount_percentage);

    if (isNaN(minItems) || minItems < 2) {
      toast.error('Minimum items must be at least 2');
      return;
    }
    if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
      toast.error('Discount percentage must be between 0 and 100');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { min_items: minItems, discount_percentage: discountPercentage };
      if (editingTier) {
        await bundleDiscountsAPI.update(editingTier.discount_id, payload);
        toast.success('Bundle discount tier updated');
      } else {
        await bundleDiscountsAPI.create(payload);
        toast.success('Bundle discount tier created');
      }
      closeModal();
      fetchTiers();
    } catch (error) {
      console.error('Failed to save bundle discount tier:', error);
      toast.error(error.response?.data?.message || 'Failed to save bundle discount tier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (tier) => {
    try {
      await bundleDiscountsAPI.toggleActive(tier.discount_id);
      setTiers(prev => prev.map(t =>
        t.discount_id === tier.discount_id ? { ...t, is_active: !t.is_active } : t
      ));
      toast.success(`Tier ${tier.is_active ? 'deactivated' : 'activated'}`);
    } catch (error) {
      console.error('Failed to toggle bundle discount tier:', error);
      toast.error('Failed to update tier');
    }
  };

  const handleDelete = async (tier) => {
    const confirmed = window.confirm(
      `Delete the ${tier.min_items}+ item tier (${tier.discount_percentage}% off)? This can't be undone.`
    );
    if (!confirmed) return;

    try {
      await bundleDiscountsAPI.delete(tier.discount_id);
      setTiers(prev => prev.filter(t => t.discount_id !== tier.discount_id));
      toast.success('Bundle discount tier deleted');
    } catch (error) {
      console.error('Failed to delete bundle discount tier:', error);
      toast.error(error.response?.data?.message || 'Failed to delete tier');
    }
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
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Bundle Discounts' }]} />
      <Header>
        <HeaderLeft>
          <Title>Bundle Discounts</Title>
          <Subtitle>Buy N+ cheat sheets in one checkout, get a percentage off automatically</Subtitle>
        </HeaderLeft>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <AddButton onClick={openAddModal}>
            <Plus size={18} />
            Add Tier
          </AddButton>
        </div>
      </Header>

      <HelpBanner>
        The highest tier whose "Min Items" is met wins — e.g. with tiers at 2+/10% and 5+/20%, a
        5-item cart gets 20%, not both stacked. Only <strong>active</strong> tiers are ever applied
        at checkout or shown in the cart. The cart's "add one more to save up to X%" message always
        reflects the best active tier here.
      </HelpBanner>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Min Items</th>
              <th>Discount</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tiers.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <EmptyState>
                    No bundle discount tiers yet. Click "Add Tier" to create one.
                  </EmptyState>
                </td>
              </tr>
            ) : (
              tiers.map(tier => (
                <tr key={tier.discount_id}>
                  <td style={{ fontWeight: 600 }}>{tier.min_items}+ items</td>
                  <td>{parseFloat(tier.discount_percentage)}%</td>
                  <td>
                    <ToggleSwitch $checked={tier.is_active}>
                      <input
                        type="checkbox"
                        checked={tier.is_active}
                        onChange={() => handleToggleActive(tier)}
                      />
                      <span />
                    </ToggleSwitch>
                  </td>
                  <td>
                    <ActionButtons>
                      <ActionButton onClick={() => openEditModal(tier)} title="Edit">
                        <Edit2 size={16} />
                      </ActionButton>
                      <ActionButton
                        $variant="danger"
                        onClick={() => handleDelete(tier)}
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

      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingTier ? 'Edit Tier' : 'Add Bundle Discount Tier'}</ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Minimum Items *</Label>
                <Input
                  type="number"
                  name="min_items"
                  min="2"
                  step="1"
                  value={formData.min_items}
                  onChange={handleInputChange}
                  placeholder="e.g. 2"
                  required
                />
                <HelpText>
                  A cart with at least this many items qualifies. Must be 2 or more — a single-item
                  cart never goes through bundle pricing.
                </HelpText>
              </FormGroup>

              <FormGroup>
                <Label>Discount Percentage *</Label>
                <Input
                  type="number"
                  name="discount_percentage"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  placeholder="e.g. 10"
                  required
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (editingTier ? 'Update Tier' : 'Create Tier')}
              </SubmitButton>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default BundleDiscountManagement;
