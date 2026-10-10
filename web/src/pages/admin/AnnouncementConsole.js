import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Megaphone } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: ${props => props.theme.typography.sizes['3xl']};
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.25rem;
`;

const Form = styled.div`
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
  gap: 1.25rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  min-height: 90px;
  resize: vertical;
  font-family: inherit;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
`;

const HelpText = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: ${props => props.theme.colors.primary};
    cursor: pointer;
    flex-shrink: 0;
  }

  label {
    font-size: ${props => props.theme.typography.sizes.base};
    color: ${props => props.theme.colors.text};
    cursor: pointer;
  }
`;

const SaveButton = styled.button`
  align-self: flex-start;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  background: ${props => props.theme.colors.primary};
  color: white;
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PREVIEW_COLORS = {
  info: '#3B82F6',
  success: '#10B981',
  warning: '#FFA500',
  error: '#EF4444',
};

const PreviewBanner = styled.div`
  background: ${props => PREVIEW_COLORS[props.$type] || PREVIEW_COLORS.info};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: ${props => props.theme.radius.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PreviewTitle = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const PreviewMessage = styled.p`
  margin: 0;
  opacity: 0.95;
`;

const PreviewLink = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1.25rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.sm};
  border: 1px solid rgba(255, 255, 255, 0.3);
  white-space: nowrap;
`;

const EMPTY_ANNOUNCEMENT = {
  enabled: false,
  type: 'info',
  title: '',
  message: '',
  link: '',
  linkText: '',
  startDate: '',
  endDate: '',
};

// Admin-facing replacement for what used to be a static
// client/public/announcement.json file — same shape, now backed by
// site_settings ('announcement' key) via GET/PATCH /api/admin/settings, and
// read publicly by AnnouncementBanner.js through GET /api/settings/announcement.
const AnnouncementConsole = () => {
  const [form, setForm] = useState(EMPTY_ANNOUNCEMENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await adminAPI.getSettings();
        setForm({ ...EMPTY_ANNOUNCEMENT, ...(response.data.announcement || {}) });
      } catch (error) {
        console.error('Failed to load announcement settings:', error);
        toast.error('Failed to load current announcement');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setField = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (form.enabled && !form.message.trim()) {
      toast.error('Message is required when the announcement is enabled');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        enabled: form.enabled,
        type: form.type || 'info',
        title: form.title.trim() || undefined,
        message: form.message.trim(),
        link: form.link.trim() || undefined,
        linkText: form.linkText.trim() || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      const response = await adminAPI.updateSettings({ announcement: payload });
      setForm({ ...EMPTY_ANNOUNCEMENT, ...(response.data.announcement || {}) });
      toast.success('Announcement saved');
    } catch (error) {
      console.error('Failed to save announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Container><Subtitle>Loading...</Subtitle></Container>;
  }

  return (
    <Container>
      <Header>
        <Title><Megaphone size={28} /> Announcement Banner</Title>
        <Subtitle>Controls the banner shown at the top of the homepage. Visible to every visitor, logged in or not.</Subtitle>
      </Header>

      <Card>
        <SectionTitle>Preview</SectionTitle>
        {form.enabled ? (
          <PreviewBanner $type={form.type}>
            <div>
              {form.title && <PreviewTitle>{form.title}</PreviewTitle>}
              <PreviewMessage>{form.message || 'Your message will appear here...'}</PreviewMessage>
            </div>
            {form.link && <PreviewLink>{form.linkText || 'Learn More'}</PreviewLink>}
          </PreviewBanner>
        ) : (
          <HelpText>Announcement is currently disabled — nothing shows on the homepage.</HelpText>
        )}
      </Card>

      <Card>
        <SectionTitle>Settings</SectionTitle>
        <Form>
          <ToggleRow>
            <input
              type="checkbox"
              id="announcement-enabled"
              checked={form.enabled}
              onChange={(e) => setForm(prev => ({ ...prev, enabled: e.target.checked }))}
            />
            <label htmlFor="announcement-enabled">
              {form.enabled ? 'Announcement enabled' : 'Announcement disabled'}
            </label>
          </ToggleRow>

          <FormRow>
            <FormGroup>
              <Label>Type</Label>
              <Select value={form.type} onChange={setField('type')}>
                <option value="info">Info (blue)</option>
                <option value="success">Success (green)</option>
                <option value="warning">Warning (orange)</option>
                <option value="error">Error (red)</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Title (optional)</Label>
              <Input type="text" value={form.title} onChange={setField('title')} placeholder="e.g. Mock Exams Available" />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Message <span style={{ color: 'red' }}>*</span></Label>
            <TextArea value={form.message} onChange={setField('message')} placeholder="What do you want visitors to see?" />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Link URL (optional)</Label>
              <Input type="text" value={form.link} onChange={setField('link')} placeholder="/mock-exams" />
            </FormGroup>
            <FormGroup>
              <Label>Link Button Text (optional)</Label>
              <Input type="text" value={form.linkText} onChange={setField('linkText')} placeholder="Learn More" />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Start Date (optional)</Label>
              <Input type="date" value={form.startDate} onChange={setField('startDate')} />
              <HelpText>Banner stays hidden before this date.</HelpText>
            </FormGroup>
            <FormGroup>
              <Label>End Date (optional)</Label>
              <Input type="date" value={form.endDate} onChange={setField('endDate')} />
              <HelpText>Banner stops showing after this date (end of day).</HelpText>
            </FormGroup>
          </FormRow>

          <SaveButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Announcement'}
          </SaveButton>
        </Form>
      </Card>
    </Container>
  );
};

export default AnnouncementConsole;
