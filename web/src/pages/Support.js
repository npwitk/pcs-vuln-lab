import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StreamChatProvider, useStreamChatClient } from '../context/StreamChatContext';
import { useSupportWatch } from '../context/SupportWatchContext';
import { supportAPI } from '../services/api';
import { HelpCircle, Lightbulb, Bug, CreditCard, Download, RotateCcw, UserCircle, Star, Copyright, MoreHorizontal } from 'lucide-react';
import { Chat, Channel, Window, ChannelHeader, MessageList, MessageComposer, Thread } from 'stream-chat-react';
// Loaded here (not globally in App.js) so anonymous/non-chat pages never
// ship this 354KB stylesheet — only this lazy-loaded route pulls it in.
import 'stream-chat-react/dist/css/index.css';
import '../styles/streamTheme.css';
import usePageMeta from '../hooks/usePageMeta';

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
  font-size: ${props => props.theme.typography.sizes['3xl']};
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.textSecondary};
`;

const Section = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes['2xl']};
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.semibold};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
`;

const TypePills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TypePill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: 1.5px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.$active ? '#fff' : props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.$active ? '#fff' : props.theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const ShowAllButton = styled.button`
  align-self: center;
  margin-top: 0.25rem;
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  border: 1.5px solid ${props => props.theme.colors.border};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const TICKET_TYPES = [
  { value: 'QA', label: 'Question', Icon: HelpCircle },
  { value: 'feedback', label: 'Feedback', Icon: Lightbulb },
  { value: 'bug', label: 'Bug report', Icon: Bug },
  { value: 'payment', label: 'Payment', Icon: CreditCard },
  { value: 'download', label: 'Download', Icon: Download },
  { value: 'refund', label: 'Refund', Icon: RotateCcw },
  { value: 'account', label: 'Account', Icon: UserCircle },
  { value: 'content_quality', label: 'Content quality', Icon: Star },
  { value: 'copyright', label: 'Copyright', Icon: Copyright },
  { value: 'other', label: 'Other', Icon: MoreHorizontal },
];

const RECENT_TICKET_LIMIT = 5;

const TextArea = styled.textarea`
  padding: 0.875rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-family: inherit;
  min-height: 150px;
  resize: vertical;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const Button = styled.button`
  background: ${props => props.$danger ? props.theme.colors.error : props.$secondary ? 'transparent' : props.theme.colors.primary};
  color: ${props => props.$secondary ? props.theme.colors.primary : 'white'};
  border: ${props => props.$secondary ? `1px solid ${props.theme.colors.primary}` : 'none'};
  padding: 0.875rem 1.5rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.base};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  align-self: flex-start;
  box-shadow: ${props => props.$secondary ? 'none' : props.theme.shadows.sm};

  &:hover {
    background: ${props => props.$danger ? '#FF2D20' : props.$secondary ? props.theme.colors.primaryLight : props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${props => props.theme.colors.textTertiary};
    border-color: transparent;
    color: white;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Alert = styled.div`
  padding: 1rem;
  border-radius: ${props => props.theme.radius.md};
  margin-bottom: 1rem;
  background: ${props => props.$error ? props.theme.colors.error + '20' : props.theme.colors.success + '20'};
  color: ${props => props.$error ? props.theme.colors.error : props.theme.colors.success};
  border: 1px solid ${props => props.$error ? props.theme.colors.error : props.theme.colors.success};
`;

const TicketsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TicketCard = styled.div`
  border-radius: 8px;
  border-left: 4px solid ${props =>
    props.$status === 'open' ? '#3498db' :
    props.$status === 'resolved' ? '#2ecc71' :
    '#95a5a6'};
  border: 1px solid ${props => props.theme.colors.border};
  border-left: 4px solid ${props =>
    props.$status === 'open' ? '#3498db' :
    props.$status === 'resolved' ? '#2ecc71' :
    '#95a5a6'};
  overflow: hidden;
`;

const TicketCardHeader = styled.div`
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  background: ${props => props.theme.colors.backgroundSecondary || '#f9f9f9'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const TicketMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex: 1;
`;

const TicketType = styled.span`
  background: #131D4F;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const TicketStatus = styled.span`
  background: ${props =>
    props.$status === 'open' ? '#3498db' :
    props.$status === 'resolved' ? '#2ecc71' :
    '#95a5a6'};
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const NewReplyBadge = styled.span`
  background: #e74c3c;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const TicketDate = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.8rem;
`;

const ChevronIcon = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  transition: transform 0.2s;
  transform: ${props => props.$open ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

// Chat conversation area
const ConversationPanel = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
`;

const MessagesArea = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 400px;
  overflow-y: auto;
  overflow-anchor: none;
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  max-width: 75%;
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  margin-top: ${props => props.$grouped ? '2px' : '0.75rem'};
`;

const BubbleLabel = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.2rem;
  font-weight: 600;
`;

const BubbleText = styled.div`
  background: ${props => props.$isUser ? props.theme.colors.primary + '15' : '#f0f0f0'};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.$isUser ? props.theme.colors.primary + '30' : props.theme.colors.border};
  padding: 0.6rem 1rem;
  border-radius: ${props => {
    const tl = props.$isUser ? '16px' : (props.$grouped ? '16px' : '4px');
    const tr = props.$isUser ? (props.$grouped ? '16px' : '4px') : '16px';
    const br = '16px';
    const bl = '16px';
    return `${tl} ${tr} ${br} ${bl}`;
  }};
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const BubbleTime = styled.span`
  font-size: 0.7rem;
  color: ${props => props.theme.colors.textTertiary || '#aaa'};
  margin-top: 0.2rem;
  margin-bottom: 0.1rem;
`;

const ClosedNotice = styled.div`
  padding: 0.75rem 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.85rem;
  font-style: italic;
  text-align: center;
  background: ${props => props.theme.colors.backgroundSecondary};
`;

const LoadingMessages = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
`;

const LiveChatWrapper = styled.div`
  height: 480px;

  .str-chat {
    height: 100%;
  }
`;

const NoTickets = styled.div`
  text-align: center;
  padding: 2rem;
  color: #999;
  font-style: italic;
`;

// Live (Stream-backed) ticket conversation. Mounted only for tickets that
// have a stream_channel_id — legacy tickets never reach this component.
const LiveTicketChat = ({ channelId, ticketStatus }) => {
  const { client } = useStreamChatClient();
  const { setViewingChannel } = useSupportWatch();
  const [channel, setChannel] = useState(null);
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    if (!client || !channelId) return;
    let cancelled = false;
    const ch = client.channel('support', channelId);
    ch.watch().then(() => {
      if (cancelled) return;
      setChannel(ch);
      setFrozen(!!ch.data?.frozen);
    });
    // Resolving a ticket freezes its channel; reflect that without a reload.
    const sub = ch.on('channel.updated', e => setFrozen(!!e.channel?.frozen));
    return () => {
      cancelled = true;
      sub.unsubscribe();
    };
  }, [client, channelId]);

  // Tell the global watcher this conversation is on screen so it doesn't
  // also pop up a notice for replies the user is already reading.
  useEffect(() => {
    setViewingChannel(channelId);
    return () => setViewingChannel(null);
  }, [channelId, setViewingChannel]);

  const resolved = frozen || (ticketStatus && ticketStatus !== 'open');

  if (!client || !channel) {
    return <LoadingMessages>Connecting to live chat...</LoadingMessages>;
  }

  return (
    <LiveChatWrapper>
      <Chat client={client}>
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            {resolved && (
              <ClosedNotice>
                The support team has marked this ticket as resolved, so this chat may no longer be monitored.
                If you still need help, please submit a new ticket above.
              </ClosedNotice>
            )}
            {/* A frozen channel rejects new messages, so hide the composer. If
                freezing failed, keep it: the notice above still warns them. */}
            {!frozen && <MessageComposer />}
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </LiveChatWrapper>
  );
};

const SupportPage = () => {
  usePageMeta('Support & Help');
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const { unreadByChannel, ticketsVersion, refreshTickets } = useSupportWatch();
  // A link can pre-fill a new ticket, e.g. Payouts' "Request a change" to
  // bank details: /support?type=account&message=... Only known ticket types
  // are accepted; anything else falls back to QA.
  const [ticketType, setTicketType] = useState(() => {
    const requested = searchParams.get('type');
    return TICKET_TYPES.some(t => t.value === requested) ? requested : 'QA';
  });
  const [message, setMessage] = useState(() => (searchParams.get('message') || '').slice(0, 2000));
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Legacy (pre-Stream) ticket conversation state — read-only, no reply UI
  const [openTicketId, setOpenTicketId] = useState(null);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [legacyMessages, setLegacyMessages] = useState({});
  const [legacyMessagesLoading, setLegacyMessagesLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ticketsVersion bumps when the watcher sees a ticket get resolved.
  useEffect(() => {
    if (isAuthenticated) fetchTickets();
  }, [isAuthenticated, ticketsVersion]);

  // /support?ticket=12 (from the reply popup) opens that conversation.
  const linkedTicketId = parseInt(searchParams.get('ticket'), 10) || null;
  useEffect(() => {
    if (!linkedTicketId || !tickets.some(t => t.ticket_id === linkedTicketId)) return;
    setOpenTicketId(linkedTicketId);
    if (tickets.findIndex(t => t.ticket_id === linkedTicketId) >= RECENT_TICKET_LIMIT) setShowAllTickets(true);
    setTimeout(() => {
      document.getElementById(`ticket-${linkedTicketId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [linkedTicketId, tickets]);

  const fetchTickets = async () => {
    try {
      const response = await supportAPI.getMyTickets();
      setTickets(response.data.tickets || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  };

  const loadLegacyMessages = useCallback(async (ticketId, markRead) => {
    try {
      const response = await supportAPI.getTicketMessages(ticketId);
      setLegacyMessages(prev => ({ ...prev, [ticketId]: response.data.messages || [] }));
      if (markRead) {
        await supportAPI.markAsRead(ticketId);
        setTickets(prev => prev.map(t =>
          t.ticket_id === ticketId ? { ...t, has_unread_admin_reply: false } : t
        ));
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  const handleToggleConversation = async (ticket) => {
    if (openTicketId === ticket.ticket_id) {
      setOpenTicketId(null);
      return;
    }

    setOpenTicketId(ticket.ticket_id);

    // Live (Stream-backed) tickets don't need the legacy message fetch —
    // LiveTicketChat handles everything via the Stream client. The Stream
    // webhook does set has_unread_admin_reply on them now, so still clear it.
    if (ticket.stream_channel_id) {
      if (ticket.has_unread_admin_reply) {
        supportAPI.markAsRead(ticket.ticket_id).catch(err => console.error('Failed to mark ticket read:', err));
        setTickets(prev => prev.map(t =>
          t.ticket_id === ticket.ticket_id ? { ...t, has_unread_admin_reply: false } : t
        ));
      }
      return;
    }

    setLegacyMessagesLoading(true);
    await loadLegacyMessages(ticket.ticket_id, ticket.has_unread_admin_reply);
    setLegacyMessagesLoading(false);
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await supportAPI.submitTicket({ ticket_type: ticketType, message });
      setSuccess('Support ticket submitted successfully!');
      setMessage('');
      setTicketType('QA');
      fetchTickets();
      // Start watching the new ticket for replies once the user leaves.
      refreshTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit support ticket');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const isGroupedWithPrev = (msgs, index) => {
    if (index === 0) return false;
    const prev = msgs[index - 1];
    const curr = msgs[index];
    if (prev.sender_role !== curr.sender_role) return false;
    return new Date(curr.created_at) - new Date(prev.created_at) <= 60000;
  };

  const isLastInGroup = (msgs, index) => {
    if (index === msgs.length - 1) return true;
    const next = msgs[index + 1];
    const curr = msgs[index];
    if (next.sender_role !== curr.sender_role) return true;
    return new Date(next.created_at) - new Date(curr.created_at) > 60000;
  };

  const getPlaceholderText = () => {
    switch (ticketType) {
      case 'QA': return 'Ask your question here. Be as specific as possible...';
      case 'feedback': return 'Share your feedback or suggestions to help us improve...';
      case 'bug': return 'Describe the bug: What happened? What did you expect? Steps to reproduce...';
      case 'copyright': return 'Report copyright infringement. Please include:\n- URL of the infringing content\n- Proof of ownership\n- Your contact information';
      case 'payment': return 'Describe your payment issue. Include order ID if available...';
      case 'download': return 'Describe the download problem. Which cheat sheet? What error did you see?';
      case 'account': return 'Describe the issue with your account...';
      case 'content_quality': return 'Report content quality concerns. Include the cheat sheet title and describe the issue...';
      case 'refund': return 'Request a refund. Include order ID, purchase date, and reason...';
      case 'other': return 'Describe your request or issue in detail...';
      default: return 'Describe your question, feedback, or issue in detail...';
    }
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <Header>
          <Title>Support</Title>
          <Subtitle>Please login to access support</Subtitle>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Support & Help</Title>
        <Subtitle>Ask a question, report a problem, or follow up on a ticket</Subtitle>
      </Header>

      {error && <Alert $error>{error}</Alert>}
      {success && <Alert>{success}</Alert>}

      <Section>
        <SectionTitle>Submit Support Ticket</SectionTitle>
        <Form onSubmit={handleSubmitTicket}>
          <FormGroup>
            <Label id="ticketTypeLabel">What do you need help with?</Label>
            <TypePills role="radiogroup" aria-labelledby="ticketTypeLabel">
              {TICKET_TYPES.map(({ value, label, Icon }) => (
                <TypePill
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={ticketType === value}
                  $active={ticketType === value}
                  onClick={() => setTicketType(value)}
                >
                  <Icon size={15} />
                  {label}
                </TypePill>
              ))}
            </TypePills>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="message">Message</Label>
            <TextArea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={getPlaceholderText()}
              required
            />
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </Form>
      </Section>

      <Section>
        <SectionTitle>My Tickets</SectionTitle>
        {tickets.length === 0 ? (
          <NoTickets>No support tickets yet</NoTickets>
        ) : (
          <TicketsList>
            {(showAllTickets ? tickets : tickets.slice(0, RECENT_TICKET_LIMIT)).map((ticket) => {
              const isOpen = openTicketId === ticket.ticket_id;
              const ticketMessages = legacyMessages[ticket.ticket_id] || [];

              return (
                <TicketCard key={ticket.ticket_id} id={`ticket-${ticket.ticket_id}`} $status={ticket.ticket_status}>
                  <TicketCardHeader onClick={() => handleToggleConversation(ticket)}>
                    <TicketMeta>
                      <TicketType>{ticket.ticket_type}</TicketType>
                      <TicketStatus $status={ticket.ticket_status}>{ticket.ticket_status}</TicketStatus>
                      {(ticket.has_unread_admin_reply || unreadByChannel[ticket.stream_channel_id] > 0) && (
                        <NewReplyBadge>New reply</NewReplyBadge>
                      )}
                      <TicketDate>#{ticket.ticket_id} &middot; {formatDate(ticket.submitted_date)}</TicketDate>
                    </TicketMeta>
                    <ChevronIcon $open={isOpen}>&#9660;</ChevronIcon>
                  </TicketCardHeader>

                  {isOpen && (
                    <ConversationPanel>
                      {ticket.stream_channel_id ? (
                        <LiveTicketChat channelId={ticket.stream_channel_id} ticketStatus={ticket.ticket_status} />
                      ) : (
                        <>
                          <MessagesArea>
                            {legacyMessagesLoading ? (
                              <LoadingMessages>Loading messages...</LoadingMessages>
                            ) : ticketMessages.length === 0 ? (
                              <LoadingMessages>No messages yet.</LoadingMessages>
                            ) : (
                              ticketMessages.map((msg, index) => {
                                const isFromUser = msg.sender_role === 'user';
                                const grouped = isGroupedWithPrev(ticketMessages, index);
                                const lastInGroup = isLastInGroup(ticketMessages, index);
                                return (
                                  <MessageBubble key={msg.message_id} $isUser={isFromUser} $grouped={grouped}>
                                    {!grouped && (
                                      <BubbleLabel>
                                        {isFromUser ? 'You' : 'Support Team'}
                                      </BubbleLabel>
                                    )}
                                    <BubbleText $isUser={isFromUser} $grouped={grouped}>
                                      {msg.message_text}
                                    </BubbleText>
                                    {lastInGroup && (
                                      <BubbleTime>{formatTime(msg.created_at)}</BubbleTime>
                                    )}
                                  </MessageBubble>
                                );
                              })
                            )}
                          </MessagesArea>
                          <ClosedNotice>
                            This is an older ticket from before live chat support. It's read-only — please submit a new ticket if you need further help.
                          </ClosedNotice>
                        </>
                      )}
                    </ConversationPanel>
                  )}
                </TicketCard>
              );
            })}
            {tickets.length > RECENT_TICKET_LIMIT && (
              <ShowAllButton type="button" onClick={() => setShowAllTickets(v => !v)}>
                {showAllTickets ? 'Show recent only' : `Show all tickets (${tickets.length})`}
              </ShowAllButton>
            )}
          </TicketsList>
        )}
      </Section>

    </Container>
  );
};

const Support = () => (
  <StreamChatProvider>
    <SupportPage />
  </StreamChatProvider>
);

export default Support;
