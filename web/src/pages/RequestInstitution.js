import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { institutionsAPI } from '../services/api';
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

  &:hover:not(:disabled) {
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

const RequestInstitution = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingRequest, setExistingRequest] = useState(null);
  const [formData, setFormData] = useState({
    proposed_name: '',
    proposed_short_name: '',
    proposed_email_domain: '',
    proposed_website_url: '',
    reason: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      try {
        const response = await institutionsAPI.getMyRequest();
        setExistingRequest(response.data.request);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Failed to fetch institution request:', error);
        }
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.proposed_name.trim()) {
      toast.error('Please provide the institution\'s full name');
      return;
    }
    if (!formData.proposed_short_name.trim()) {
      toast.error('Please provide a short name');
      return;
    }
    if (!formData.proposed_email_domain.trim()) {
      toast.error('Please provide the institution\'s student email domain');
      return;
    }

    setLoading(true);
    try {
      await institutionsAPI.submitRequest({
        proposed_name: formData.proposed_name.trim(),
        proposed_short_name: formData.proposed_short_name.trim(),
        proposed_email_domain: formData.proposed_email_domain.trim(),
        proposed_website_url: formData.proposed_website_url.trim() || undefined,
        reason: formData.reason.trim() || undefined,
      });
      toast.success('Institution request submitted! We will review it soon.');
      navigate('/');
    } catch (error) {
      console.error('Submit institution request error:', error);
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
          <Title>Institution Request</Title>
          <Subtitle>Your request to add a new institution</Subtitle>

          <StatusCard status={existingRequest.status}>
            <div style={{ marginBottom: '1rem' }}>
              <StatusBadge status={existingRequest.status}>{existingRequest.status}</StatusBadge>
            </div>

            <FormGroup>
              <Label>Institution Name</Label>
              <div>{existingRequest.proposed_name}</div>
            </FormGroup>

            <FormGroup>
              <Label>Short Name</Label>
              <div>{existingRequest.proposed_short_name}</div>
            </FormGroup>

            <FormGroup>
              <Label>Email Domain</Label>
              <div>{existingRequest.proposed_email_domain}</div>
            </FormGroup>

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

          {existingRequest.status === 'approved' && (
            <HelpText style={{ marginTop: '1rem', textAlign: 'center' }}>
              Approved! Your institution should now appear in the institution picker.
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
        <Title>Request an Institution</Title>
        <Subtitle>
          Don't see your school in the institution picker? Let us know and we'll consider adding it —
          an admin reviews every request before it goes live.
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Institution Name <span>*</span></Label>
            <Input
              type="text"
              placeholder="e.g. Chulalongkorn University"
              value={formData.proposed_name}
              onChange={handleChange('proposed_name')}
              maxLength={255}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Short Name <span>*</span></Label>
            <Input
              type="text"
              placeholder="e.g. CU"
              value={formData.proposed_short_name}
              onChange={handleChange('proposed_short_name')}
              maxLength={50}
              required
            />
            <HelpText>Shown as the compact label in the institution picker.</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Student Email Domain <span>*</span></Label>
            <Input
              type="text"
              placeholder="e.g. student.chula.ac.th"
              value={formData.proposed_email_domain}
              onChange={handleChange('proposed_email_domain')}
              maxLength={255}
              required
            />
            <HelpText>The domain your institution's students use for their email address (no @, no spaces).</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Website URL</Label>
            <Input
              type="text"
              placeholder="https://... (optional)"
              value={formData.proposed_website_url}
              onChange={handleChange('proposed_website_url')}
              maxLength={500}
            />
          </FormGroup>

          <FormGroup>
            <Label>Anything else we should know?</Label>
            <TextArea
              placeholder="Tell us a bit about your institution and why you'd like it added (optional)"
              value={formData.reason}
              onChange={handleChange('reason')}
            />
          </FormGroup>

          <Button type="submit" disabled={loading}>
            <Building2 size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default RequestInstitution;
