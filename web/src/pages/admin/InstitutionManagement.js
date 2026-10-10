import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { institutionsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { resolveLogoUrl } from '../../utils/resolveLogoUrl';
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

const LogoCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: ${props => props.theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

const SubText = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
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

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

// Native color picker swatch beside the hex text field; both edit the same
// brand_color value.
const ColorInputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: stretch;

  ${Input} {
    flex: 1;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    text-transform: uppercase;
  }
`;

const ColorSwatchInput = styled.input`
  width: 48px;
  flex-shrink: 0;
  padding: 0.25rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.background};
  cursor: pointer;

  &::-webkit-color-swatch-wrapper { padding: 0; }
  &::-webkit-color-swatch {
    border: none;
    border-radius: ${props => props.theme.radius.sm};
  }
`;

const BrandColorDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 0.375rem;
  border-radius: 50%;
  vertical-align: middle;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
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

const EMPTY_FORM = {
  name: '',
  short_name: '',
  email_domain: '',
  logo_filename: '',
  website_url: '',
  brand_color: '',
};

const HEX_COLOR = /^#?[0-9a-fA-F]{6}$/;

function InstitutionManagement() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const response = await institutionsAPI.adminGetAll();
      setInstitutions(response.data.institutions || []);
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingInstitution(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (institution) => {
    setEditingInstitution(institution);
    setFormData({
      name: institution.name,
      short_name: institution.short_name,
      email_domain: institution.email_domain,
      logo_filename: institution.logo_filename || '',
      website_url: institution.website_url || '',
      brand_color: institution.brand_color || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInstitution(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.short_name || !formData.email_domain) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.brand_color.trim() && !HEX_COLOR.test(formData.brand_color.trim())) {
      toast.error('Brand color must be a hex color like #AE5C2A');
      return;
    }

    setSubmitting(true);
    try {
      if (editingInstitution) {
        await institutionsAPI.update(editingInstitution.institution_id, formData);
        toast.success('Institution updated successfully');
      } else {
        await institutionsAPI.create(formData);
        toast.success('Institution created successfully');
      }
      closeModal();
      fetchInstitutions();
    } catch (error) {
      console.error('Failed to save institution:', error);
      toast.error(error.response?.data?.message || 'Failed to save institution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (institutionId, currentStatus) => {
    try {
      await institutionsAPI.toggleActive(institutionId);
      setInstitutions(prev => prev.map(inst =>
        inst.institution_id === institutionId
          ? { ...inst, is_active: !currentStatus }
          : inst
      ));
      toast.success(`Institution ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file || !editingInstitution) return;

    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const response = await institutionsAPI.uploadLogo(editingInstitution.institution_id, fd);
      const newLogoUrl = response.data.logo_filename;

      setFormData(prev => ({ ...prev, logo_filename: newLogoUrl }));
      setInstitutions(prev => prev.map(inst =>
        inst.institution_id === editingInstitution.institution_id
          ? { ...inst, logo_filename: newLogoUrl }
          : inst
      ));
      toast.success('Logo updated');
    } catch (error) {
      console.error('Failed to upload logo:', error);
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDelete = async (institution) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${institution.name}"?`);
    if (!confirmed) return;

    try {
      await institutionsAPI.delete(institution.institution_id);
      setInstitutions(prev => prev.filter(inst => inst.institution_id !== institution.institution_id));
      toast.success('Institution deleted successfully');
    } catch (error) {
      console.error('Failed to delete institution:', error);
      toast.error(error.response?.data?.message || 'Failed to delete institution');
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
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Institutions' }]} />
      <Header>
        <HeaderLeft>
          <Title>Institution Management</Title>
          <Subtitle>Add and manage institutions that can access the marketplace</Subtitle>
        </HeaderLeft>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <AddButton onClick={openAddModal}>
            <Plus size={18} />
            Add Institution
          </AddButton>
        </div>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Logo</th>
              <th>Institution</th>
              <th>Email Domain</th>
              <th>Website</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {institutions.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <EmptyState>
                    No institutions found. Click "Add Institution" to create one.
                  </EmptyState>
                </td>
              </tr>
            ) : (
              institutions.map(institution => (
                <tr key={institution.institution_id}>
                  <td>
                    <LogoCircle>
                      {institution.logo_filename
                        ? <img src={resolveLogoUrl(institution.logo_filename)} alt={institution.short_name} />
                        : institution.short_name?.slice(0, 3)
                      }
                    </LogoCircle>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {institution.brand_color && (
                        <BrandColorDot style={{ background: institution.brand_color }} title={institution.brand_color} />
                      )}
                      {institution.short_name}
                    </div>
                    <SubText>{institution.name}</SubText>
                    <SubText>{institution.user_count} user(s) &middot; {institution.cheatsheet_count} cheat sheet(s)</SubText>
                  </td>
                  <td>{institution.email_domain}</td>
                  <td>
                    {institution.website_url ? (
                      <a href={institution.website_url} target="_blank" rel="noopener noreferrer">
                        Visit
                      </a>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                  <td>
                    <ToggleSwitch $checked={institution.is_active}>
                      <input
                        type="checkbox"
                        checked={institution.is_active}
                        onChange={() => handleToggleActive(institution.institution_id, institution.is_active)}
                      />
                      <span />
                    </ToggleSwitch>
                  </td>
                  <td>
                    <ActionButtons>
                      <ActionButton onClick={() => openEditModal(institution)} title="Edit">
                        <Edit2 size={16} />
                      </ActionButton>
                      <ActionButton
                        $variant="danger"
                        onClick={() => handleDelete(institution)}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingInstitution ? 'Edit Institution' : 'Add New Institution'}</ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <Label>Full Name *</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Sirindhorn International Institute of Technology"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Short Name *</Label>
                  <Input
                    type="text"
                    name="short_name"
                    value={formData.short_name}
                    onChange={handleInputChange}
                    placeholder="e.g., SIIT"
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Email Domain *</Label>
                <Input
                  type="text"
                  name="email_domain"
                  value={formData.email_domain}
                  onChange={handleInputChange}
                  placeholder="e.g., g.siit.tu.ac.th"
                  required
                />
                <HelpText>
                  Students with an email ending in this domain will be linked to this institution. Don't include the "@".
                </HelpText>
              </FormGroup>

              <FormGroup>
                <Label>Logo (Optional)</Label>
                {editingInstitution ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <LogoCircle style={{ width: 56, height: 56 }}>
                        {formData.logo_filename
                          ? <img src={resolveLogoUrl(formData.logo_filename)} alt={formData.short_name} />
                          : formData.short_name?.slice(0, 3)
                        }
                      </LogoCircle>
                      <label htmlFor="logo-upload">
                        <SubmitButton as="span" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <Upload size={16} />
                          {uploadingLogo ? 'Uploading...' : 'Upload logo'}
                        </SubmitButton>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          disabled={uploadingLogo}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                    <HelpText>Resized to a 200x200 square automatically. Uploading replaces the current logo right away.</HelpText>
                  </>
                ) : (
                  <HelpText>Save the institution first, then edit it to upload a logo.</HelpText>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Website URL (Optional)</Label>
                <Input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  placeholder="e.g., https://www.siit.tu.ac.th"
                />
              </FormGroup>

              <FormGroup>
                <Label>Brand Color (Optional)</Label>
                <ColorInputRow>
                  <ColorSwatchInput
                    type="color"
                    aria-label="Pick brand color"
                    value={HEX_COLOR.test(formData.brand_color) ? `#${formData.brand_color.replace(/^#/, '')}` : '#AE5C2A'}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value.toUpperCase() }))}
                  />
                  <Input
                    type="text"
                    name="brand_color"
                    value={formData.brand_color}
                    onChange={handleInputChange}
                    placeholder="#AE5C2A"
                    maxLength={7}
                  />
                </ColorInputRow>
                <HelpText>Background of the banner shown when someone from another institution browses this one. Leave empty to use the site color.</HelpText>
              </FormGroup>

              <SubmitButton type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (editingInstitution ? 'Update Institution' : 'Create Institution')}
              </SubmitButton>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default InstitutionManagement;
