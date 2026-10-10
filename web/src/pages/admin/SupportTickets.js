import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { StreamChatProvider, useStreamChatClient } from '../../context/StreamChatContext';
import toast from 'react-hot-toast';
import { Chat, Channel, Window, ChannelHeader, MessageList, MessageComposer, Thread } from 'stream-chat-react';
// Loaded here (not globally in App.js) so this 354KB stylesheet only ships
// to this lazy-loaded admin route.
import 'stream-chat-react/dist/css/index.css';
import '../../styles/streamTheme.css';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.text};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: 0.9rem;
  cursor: pointer;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};

  th {
    text-align: left;
    padding: 1rem;
    background: ${props => props.theme.colors.backgroundSecondary};
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    border-bottom: 2px solid ${props => props.theme.colors.border};
    font-size: 0.9rem;
  }

  td {
    padding: 1rem;
    border-top: 1px solid ${props => props.theme.colors.borderLight};
    color: ${props => props.theme.colors.text};
    vertical-align: middle;
  }

  tbody tr {
    cursor: pointer;
    transition: background ${props => props.theme.transitions.fast};

    &:hover {
      background: ${props => props.theme.colors.backgroundSecondary};
    }
  }
`;

const Badge = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  background: ${props => {
    switch (props.$variant) {
      case 'open': return '#3498db';
      case 'resolved': return '#2ecc71';
      case 'closed': return '#95a5a6';
      default: return '#ddd';
    }
  }};
  color: white;
`;

const TypeBadge = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #131D4F;
  color: white;
  display: inline-block;
  text-transform: uppercase;
`;

const UnreadDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #e74c3c;
  border-radius: 50%;
  margin-right: 0.4rem;
  vertical-align: middle;
  flex-shrink: 0;
`;

const SubText = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textSecondary};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  border: 1px solid ${props => props.theme.colors.border};
`;

// Conversation view
const ConversationContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.md};
  display: flex;
  flex-direction: column;
  height: calc(100vh - 220px);
  min-height: 500px;
`;

const ConversationHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.lg} ${props => props.theme.radius.lg} 0 0;
`;

const ConversationTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ConversationActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isUser ? 'flex-start' : 'flex-end'};
  max-width: 70%;
  align-self: ${props => props.$isUser ? 'flex-start' : 'flex-end'};
  margin-top: ${props => props.$grouped ? '2px' : '0.875rem'};
`;

const BubbleLabel = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.25rem;
  font-weight: 600;
`;

const BubbleText = styled.div`
  background: ${props => props.$isUser ? props.theme.colors.backgroundSecondary : props.theme.colors.primary + '20'};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.$isUser ? props.theme.colors.border : props.theme.colors.primary + '40'};
  padding: 0.625rem 1rem;
  border-radius: ${props => {
    const tl = props.$isUser ? (props.$grouped ? '16px' : '4px') : '16px';
    const tr = props.$isUser ? '16px' : (props.$grouped ? '16px' : '4px');
    return `${tl} ${tr} 16px 16px`;
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

const LegacyNotice = styled.div`
  padding: 0.75rem 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.85rem;
  font-style: italic;
  text-align: center;
  background: ${props => props.theme.colors.backgroundSecondary};
`;

const LiveChatWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;

  .str-chat {
    height: 100%;
    width: 100%;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
`;

// Live (Stream-backed) ticket conversation. The admin/staff viewer must be
// joined as a channel member (server-side, via adminAPI.joinTicketChannel)
// before this mounts — see handleOpenTicket.
const LiveTicketChat = ({ channelId }) => {
  const { client } = useStreamChatClient();
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (!client || !channelId) return;
    let cancelled = false;
    const ch = client.channel('support', channelId);
    ch.watch().then(() => {
      if (!cancelled) setChannel(ch);
    });
    return () => {
      cancelled = true;
    };
  }, [client, channelId]);

  if (!client || !channel) {
    return <LoadingText>Connecting to live chat...</LoadingText>;
  }

  return (
    <LiveChatWrapper>
      <Chat client={client}>
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageComposer />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </LiveChatWrapper>
  );
};

const SupportTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [activeTicket, setActiveTicket] = useState(null);
  const [legacyMessages, setLegacyMessages] = useState([]);
  const [legacyMessagesLoading, setLegacyMessagesLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      const response = await adminAPI.getAllTickets(params);
      setTickets(response.data.tickets || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenTicket = async (ticket) => {
    setActiveTicket(ticket);
    setLegacyMessages([]);

    // Clears the dashboard's unread indicator regardless of legacy/live —
    // this Postgres flag isn't touched by Stream, so keep updating it here.
    adminAPI.markTicketRead(ticket.ticket_id).catch(err =>
      console.error('Failed to mark ticket read:', err)
    );
    setTickets(prev => prev.map(t =>
      t.ticket_id === ticket.ticket_id ? { ...t, has_unread_user_msg: false } : t
    ));

    if (ticket.stream_channel_id) {
      try {
        await adminAPI.joinTicketChannel(ticket.ticket_id);
      } catch (err) {
        console.error('Failed to join ticket channel:', err);
        toast.error('Failed to open live chat for this ticket');
      }
      return;
    }

    // An open ticket without a channel may just be one whose live chat
    // failed to set up at submit time; joining retries that server-side.
    if (ticket.ticket_status === 'open') {
      try {
        const { data } = await adminAPI.joinTicketChannel(ticket.ticket_id);
        if (data?.stream_channel_id) {
          const upgraded = { ...ticket, stream_channel_id: data.stream_channel_id };
          setActiveTicket(upgraded);
          setTickets(prev => prev.map(t => (t.ticket_id === ticket.ticket_id ? upgraded : t)));
          return;
        }
      } catch {
        // 409 = genuinely legacy; fall through to the read-only history.
      }
    }

    setLegacyMessagesLoading(true);
    try {
      const response = await adminAPI.getTicketMessages(ticket.ticket_id);
      setLegacyMessages(response.data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLegacyMessagesLoading(false);
    }
  };

  const handleBackToList = () => {
    setActiveTicket(null);
    setLegacyMessages([]);
    fetchTickets();
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await adminAPI.updateTicketStatus(ticketId, newStatus);
      toast.success('Status updated');
      setActiveTicket(prev => prev ? { ...prev, ticket_status: newStatus } : prev);
      setTickets(prev => prev.map(t =>
        t.ticket_id === ticketId ? { ...t, ticket_status: newStatus } : t
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update ticket status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
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

  if (activeTicket) {
    return (
      <Container>
        <BackButton onClick={handleBackToList}>
          &#8592; Back to all tickets
        </BackButton>

        <ConversationContainer>
          <ConversationHeader>
            <ConversationTitle>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                Ticket #{activeTicket.ticket_id}
              </span>
              <TypeBadge>{activeTicket.ticket_type}</TypeBadge>
              <div>
                <div style={{ fontWeight: 600 }}>{activeTicket.user_name}</div>
                <SubText>{activeTicket.user_email}</SubText>
              </div>
            </ConversationTitle>
            <ConversationActions>
              <FilterLabel>Status:</FilterLabel>
              <Select
                aria-label="Ticket status"
                value={activeTicket.ticket_status}
                onChange={(e) => handleStatusChange(activeTicket.ticket_id, e.target.value)}
              >
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>
            </ConversationActions>
          </ConversationHeader>

          {activeTicket.stream_channel_id ? (
            <LiveTicketChat channelId={activeTicket.stream_channel_id} />
          ) : (
            <>
              <MessagesArea>
                {legacyMessagesLoading ? (
                  <LoadingText>Loading messages...</LoadingText>
                ) : legacyMessages.length === 0 ? (
                  <LoadingText>No messages yet.</LoadingText>
                ) : (
                  legacyMessages.map((msg, index) => {
                    const isUser = msg.sender_role === 'user';
                    const grouped = isGroupedWithPrev(legacyMessages, index);
                    const lastInGroup = isLastInGroup(legacyMessages, index);
                    return (
                      <MessageBubble key={msg.message_id} $isUser={isUser} $grouped={grouped}>
                        {!grouped && (
                          <BubbleLabel>
                            {isUser ? msg.sender_name : 'Support Team'}
                          </BubbleLabel>
                        )}
                        <BubbleText $isUser={isUser} $grouped={grouped}>{msg.message_text}</BubbleText>
                        {lastInGroup && (
                          <BubbleTime>{formatFullDate(msg.created_at)}</BubbleTime>
                        )}
                      </MessageBubble>
                    );
                  })
                )}
              </MessagesArea>
              <LegacyNotice>
                This ticket predates live chat support. It's read-only — status changes are still tracked, but no new replies can be sent.
              </LegacyNotice>
            </>
          )}
        </ConversationContainer>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate('/admin')}>
        &#8592; Back to dashboard
      </BackButton>
      <Title>Support Tickets</Title>

      <FilterRow>
        <FilterLabel>Status:</FilterLabel>
        <Select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>
        <FilterLabel style={{ marginLeft: '0.5rem' }}>Type:</FilterLabel>
        <Select aria-label="Filter by type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="QA">QA</option>
          <option value="feedback">Feedback</option>
          <option value="bug">Bug</option>
          <option value="copyright">Copyright</option>
          <option value="payment">Payment</option>
          <option value="download">Download</option>
          <option value="account">Account</option>
          <option value="content_quality">Content Quality</option>
          <option value="refund">Refund</option>
          <option value="other">Other</option>
        </Select>
      </FilterRow>

      {loading ? (
        <LoadingText>Loading tickets...</LoadingText>
      ) : tickets.length === 0 ? (
        <EmptyState>No support tickets found</EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>User</th>
              <th>Type</th>
              <th>Status</th>
              <th>Last Activity</th>
              <th style={{ width: 80 }}>Messages</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.ticket_id} onClick={() => handleOpenTicket(ticket)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {ticket.has_unread_user_msg && <UnreadDot title="New message from user" />}
                    #{ticket.ticket_id}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{ticket.user_name}</div>
                  <SubText>{ticket.user_email}</SubText>
                </td>
                <td><TypeBadge>{ticket.ticket_type}</TypeBadge></td>
                <td><Badge $variant={ticket.ticket_status}>{ticket.ticket_status}</Badge></td>
                <td>{formatDate(ticket.last_message_at || ticket.submitted_date)}</td>
                <td style={{ textAlign: 'center' }}>{ticket.message_count || 1}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

const SupportTickets = () => (
  <StreamChatProvider>
    <SupportTicketsPage />
  </StreamChatProvider>
);

export default SupportTickets;
