import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { notificationsAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Send, Smartphone } from 'lucide-react';
import Breadcrumbs from '../../components/ui/Breadcrumb';

const Container = styled.div`
  max-width: 1000px;
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
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 2rem;
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.5rem;
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

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  resize: vertical;
  min-height: 90px;

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

const HelpText = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight};
`;

const TestButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.primary};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryLight};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

  tbody tr:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  });
};

const TARGET_TYPES = [
  { value: 'all', label: 'All users' },
  { value: 'year_level', label: 'Year level' },
  { value: 'course_code', label: 'Course code (paid buyers)' }
];

const YEAR_LEVELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

function NotificationsConsole() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [targetValue, setTargetValue] = useState(YEAR_LEVELS[0]);
  const [cheatsheetId, setCheatsheetId] = useState('');

  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Reset the value field to a sensible default whenever the target
    // type changes, so switching from year_level to course_code doesn't
    // leave a stale "Year 1" sitting in a course-code field.
    if (targetType === 'year_level') setTargetValue(YEAR_LEVELS[0]);
    else if (targetType === 'course_code') setTargetValue('');
  }, [targetType]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await notificationsAPI.getHistory();
      setHistory(response.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch notification history:', error);
      toast.error('Failed to load notification history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const validate = () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required');
      return false;
    }
    if (targetType !== 'all' && !targetValue.trim()) {
      toast.error('This target type needs a value');
      return false;
    }
    return true;
  };

  const buildPayload = () => {
    const target = { type: targetType };
    if (targetType !== 'all') target.value = targetValue.trim();

    const data = {};
    if (cheatsheetId.trim()) data.cheatsheet_id = Number(cheatsheetId.trim());

    return { target, data };
  };

  const handleSendTest = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required');
      return;
    }

    setTesting(true);
    try {
      const response = await notificationsAPI.sendTest(title, body);
      const { sent_count, failed_count } = response.data;
      if (sent_count === 0) {
        toast.error('No registered devices on your own account to test with');
      } else {
        toast.success(`Test sent to ${sent_count} device(s)`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send test notification');
    } finally {
      setTesting(false);
    }
  };

  const handleSend = async () => {
    if (!validate()) return;

    if (targetType === 'all') {
      const confirmed = window.confirm(
        'This sends to every registered device across every user. Send a test to yourself first if you haven’t already. Continue?'
      );
      if (!confirmed) return;
    }

    setSending(true);
    try {
      const { target, data } = buildPayload();
      const response = await notificationsAPI.send(title, body, target, data);
      const { sent_count, failed_count } = response.data;
      toast.success(`Sent to ${sent_count} device(s)${failed_count ? `, ${failed_count} failed` : ''}`);
      setTitle('');
      setBody('');
      setCheatsheetId('');
      fetchHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <Container>
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Notifications' }]} />
      <Header>
        <Title>Push Notifications</Title>
        <Subtitle>Compose and send a push notification to registered devices.</Subtitle>
      </Header>

      <Card>
        <CardTitle>Compose</CardTitle>
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormGroup>
            <Label>Title *</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="CSS324 Midterm is in 3 days"
              maxLength={100}
            />
          </FormGroup>

          <FormGroup>
            <Label>Body *</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Check out this cheat sheet before the exam."
              maxLength={300}
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Audience</Label>
              <Select aria-label="Target type" value={targetType} onChange={(e) => setTargetType(e.target.value)}>
                {TARGET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </FormGroup>

            {targetType === 'year_level' && (
              <FormGroup>
                <Label>Year level</Label>
                <Select aria-label="Target value" value={targetValue} onChange={(e) => setTargetValue(e.target.value)}>
                  {YEAR_LEVELS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Select>
              </FormGroup>
            )}

            {targetType === 'course_code' && (
              <FormGroup>
                <Label>Course code</Label>
                <Input
                  type="text"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value.toUpperCase())}
                  placeholder="CSS324"
                />
              </FormGroup>
            )}
          </FormRow>

          <FormGroup>
            <Label>Cheat sheet ID (optional)</Label>
            <Input
              type="number"
              value={cheatsheetId}
              onChange={(e) => setCheatsheetId(e.target.value)}
              placeholder="Deep-links the notification to a specific cheat sheet"
            />
            <HelpText>Leave blank for a plain announcement with no deep link.</HelpText>
          </FormGroup>

          <ButtonRow>
            <TestButton type="button" onClick={handleSendTest} disabled={testing || sending}>
              <Smartphone size={18} />
              {testing ? 'Sending test…' : 'Send Test to Myself'}
            </TestButton>
            <SendButton type="button" onClick={handleSend} disabled={testing || sending}>
              <Send size={18} />
              {sending ? 'Sending…' : 'Send'}
            </SendButton>
          </ButtonRow>
        </Form>
      </Card>

      <CardTitle>History</CardTitle>
      {loadingHistory ? (
        <LoadingSpinner />
      ) : history.length === 0 ? (
        <EmptyState>No notifications sent yet.</EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Sent</th>
                <th>Title</th>
                <th>Audience</th>
                <th>Delivered</th>
                <th>Failed</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {history.map((log) => (
                <tr key={log.log_id}>
                  <td>{formatDateTime(log.sent_at)}</td>
                  <td>{log.title}</td>
                  <td>{log.target_description}</td>
                  <td>{log.sent_count}</td>
                  <td>{log.failed_count}</td>
                  <td>{log.admin_name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default NotificationsConsole;
