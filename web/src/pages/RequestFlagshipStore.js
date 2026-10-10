import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Store } from 'lucide-react';
import { storesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2.5rem;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 2rem;
  font-size: ${props => props.theme.typography.sizes.base};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};

  span {
    color: ${props => props.theme.colors.error};
  }
`;

const Input = styled.input`
  padding: 0.875rem;
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

  &:disabled {
    background: ${props => props.theme.colors.backgroundSecondary};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const TextArea = styled.textarea`
  padding: 0.875rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const HelpText = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const SlugPreview = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-family: monospace;

  strong {
    color: ${props => props.theme.colors.primary};
    font-weight: ${props => props.theme.typography.weights.semibold};
  }
`;

const Button = styled.button`
  padding: 0.875rem 2rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => props.theme.colors.primary};
  color: white;
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:disabled {
    background: ${props => props.theme.colors.textTertiary};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const MemberRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const RemoveMemberButton = styled.button`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.error};
    color: ${props => props.theme.colors.error};
  }
`;

const AddMemberButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  align-self: flex-start;
  padding: 0.5rem 0.875rem;
  border: 1px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const StatusCard = styled.div`
  padding: 1.5rem;
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => {
    if (props.status === 'pending') return props.theme.colors.warning + '20';
    if (props.status === 'approved') return props.theme.colors.success + '20';
    if (props.status === 'rejected') return props.theme.colors.error + '20';
    return props.theme.colors.backgroundSecondary;
  }};
  border: 1px solid ${props => {
    if (props.status === 'pending') return props.theme.colors.warning;
    if (props.status === 'approved') return props.theme.colors.success;
    if (props.status === 'rejected') return props.theme.colors.error;
    return props.theme.colors.border;
  }};
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

const SLUG_HELP = 'Lowercase letters, numbers, and single hyphens only (3-60 characters) — this becomes your store\'s URL.';

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const RequestFlagshipStore = () => {
  const { canUpload } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingRequest, setExistingRequest] = useState(null);
  const [formData, setFormData] = useState({ proposed_name: '', proposed_slug: '', reason: '' });
  const [coMemberEmails, setCoMemberEmails] = useState(['']);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!canUpload) {
      navigate('/');
      return;
    }

    (async () => {
      try {
        await storesAPI.getMyStore();
        // Already in a store — nothing to request, manage the existing one instead.
        toast.success('You already belong to a flagship store!');
        navigate('/store-management');
        return;
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Failed to check existing store:', error);
        }
      }

      try {
        const response = await storesAPI.getMyRequest();
        setExistingRequest(response.data.request);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Failed to fetch flagship store request:', error);
        }
      } finally {
        setChecking(false);
      }
    })();
  }, [canUpload, navigate]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      proposed_name: name,
      // Only auto-fill the slug while the user hasn't hand-edited it themselves.
      proposed_slug: prev.proposed_slug === slugify(prev.proposed_name) ? slugify(name) : prev.proposed_slug,
    }));
  };

  const handleSlugChange = (e) => {
    setFormData(prev => ({ ...prev, proposed_slug: slugify(e.target.value) }));
  };

  const handleReasonChange = (e) => {
    setFormData(prev => ({ ...prev, reason: e.target.value }));
  };

  const handleMemberEmailChange = (index, value) => {
    setCoMemberEmails(prev => prev.map((email, i) => (i === index ? value : email)));
  };

  const addMemberRow = () => setCoMemberEmails(prev => [...prev, '']);
  const removeMemberRow = (index) => setCoMemberEmails(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.proposed_name.trim()) {
      toast.error('Please provide a store name');
      return;
    }
    if (formData.proposed_slug.length < 3) {
      toast.error('Slug must be at least 3 characters');
      return;
    }

    const emails = coMemberEmails.map(email => email.trim()).filter(Boolean);
    for (const email of emails) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error(`"${email}" doesn't look like a valid email address`);
        return;
      }
    }

    setLoading(true);
    try {
      await storesAPI.submitRequest({
        proposed_name: formData.proposed_name.trim(),
        proposed_slug: formData.proposed_slug,
        reason: formData.reason.trim() || undefined,
        co_member_emails: emails,
      });
      toast.success('Flagship store request submitted! We will review it soon.');
      navigate('/');
    } catch (error) {
      console.error('Submit flagship store request error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <LoadingSpinner />;
  }

  if (existingRequest) {
    return (
      <Container>
        <Card>
          <Title>Flagship Store Request</Title>
          <Subtitle>Your request to open a flagship store</Subtitle>

          <StatusCard status={existingRequest.status}>
            <div style={{ marginBottom: '1rem' }}>
              <StatusBadge status={existingRequest.status}>{existingRequest.status}</StatusBadge>
            </div>

            <FormGroup>
              <Label>Store Name</Label>
              <div>{existingRequest.proposed_name}</div>
            </FormGroup>

            <FormGroup>
              <Label>Slug</Label>
              <div>/store/{existingRequest.proposed_slug}</div>
            </FormGroup>

            {existingRequest.co_members?.length > 0 && (
              <FormGroup>
                <Label>Co-members</Label>
                <div>{existingRequest.co_members.map(m => m.name).join(', ')}</div>
              </FormGroup>
            )}

            {existingRequest.reason && (
              <FormGroup>
                <Label>Reason</Label>
                <div>{existingRequest.reason}</div>
              </FormGroup>
            )}

            <FormGroup>
              <Label>Submitted At</Label>
              <div>{new Date(existingRequest.submitted_at).toLocaleString()}</div>
            </FormGroup>

            {existingRequest.admin_notes && (
              <FormGroup>
                <Label>Admin Notes</Label>
                <div style={{ padding: '0.875rem', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                  {existingRequest.admin_notes}
                </div>
              </FormGroup>
            )}
          </StatusCard>

          {existingRequest.status === 'pending' && (
            <HelpText style={{ marginTop: '1rem', textAlign: 'center' }}>
              Your request is being reviewed. Please wait for admin approval.
            </HelpText>
          )}

          {existingRequest.status === 'approved' && existingRequest.store_slug && (
            <HelpText style={{ marginTop: '1rem', textAlign: 'center' }}>
              Approved! View your store at /store/{existingRequest.store_slug}, or{' '}
              <a href="/store-management">manage its banner and icon</a>.
            </HelpText>
          )}

          {existingRequest.status === 'rejected' && (
            <HelpText style={{ marginTop: '1rem', textAlign: 'center', color: 'red' }}>
              Your request was rejected. You can submit a new one below if you address the concerns above.
            </HelpText>
          )}
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Title>Request a Flagship Store</Title>
        <Subtitle>
          A flagship store groups your and your co-sellers' cheat sheets under one shared brand —
          a name, a page, and your own banner and icon. It's in beta and by request only: an admin
          reviews every request before a store goes live.
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Store Name <span>*</span></Label>
            <Input
              type="text"
              name="proposed_name"
              placeholder="e.g. Study Squad"
              value={formData.proposed_name}
              onChange={handleNameChange}
              maxLength={100}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Slug <span>*</span></Label>
            <Input
              type="text"
              name="proposed_slug"
              placeholder="study-squad"
              value={formData.proposed_slug}
              onChange={handleSlugChange}
              maxLength={60}
              required
            />
            <SlugPreview>Store page: pcs.example.com/store/<strong>{formData.proposed_slug || 'your-slug'}</strong></SlugPreview>
            <HelpText>{SLUG_HELP}</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Co-members</Label>
            {coMemberEmails.map((email, index) => (
              <MemberRow key={index}>
                <Input
                  type="email"
                  placeholder="teammate@g.siit.tu.ac.th"
                  value={email}
                  onChange={(e) => handleMemberEmailChange(index, e.target.value)}
                />
                {coMemberEmails.length > 1 && (
                  <RemoveMemberButton type="button" onClick={() => removeMemberRow(index)} aria-label="Remove co-member">
                    <X size={16} />
                  </RemoveMemberButton>
                )}
              </MemberRow>
            ))}
            <AddMemberButton type="button" onClick={addMemberRow}>
              <Plus size={14} /> Add another co-member
            </AddMemberButton>
            <HelpText>
              Anyone you add must already have an account and already be an approved seller. You're
              added automatically as the store's owner — no need to list yourself.
            </HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Why do you want a flagship store?</Label>
            <TextArea
              name="reason"
              placeholder="Tell us a bit about what you and your co-members are building together (optional)"
              value={formData.reason}
              onChange={handleReasonChange}
            />
          </FormGroup>

          <Button type="submit" disabled={loading}>
            <Store size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default RequestFlagshipStore;
