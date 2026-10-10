import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supportAPI } from '../services/api';
import { connectStream, disconnectStream } from '../services/streamConnection';
import { useAuth } from './AuthContext';

const SupportWatchContext = createContext();

export const useSupportWatch = () => {
  const context = useContext(SupportWatchContext);
  if (!context) {
    throw new Error('useSupportWatch must be used within a SupportWatchProvider');
  }
  return context;
};

const REFETCH_ON_FOCUS_AFTER_MS = 60 * 1000;
const dismissedKey = channelId => `pcs_support_notice_dismissed_${channelId}`;

// Watches the user's open live-chat tickets from any page, so a reply sent
// from the admin side (usually right after a Telegram ping) isn't missed just
// because the user already left /support. Only connects to Stream when the
// user actually has an open live ticket; everyone else never loads it.
//
// `notice` drives SupportReplyNotice: { kind: 'reply' | 'resolved', ticketId,
// channelId, text?, messageId? }.
export const SupportWatchProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [unreadByChannel, setUnreadByChannel] = useState({});
  const [notice, setNotice] = useState(null);
  const [ticketsVersion, setTicketsVersion] = useState(0);
  const lastFetchRef = useRef(0);
  const viewingChannelRef = useRef(null);
  const ticketsRef = useRef([]);
  ticketsRef.current = tickets;

  const refreshTickets = useCallback(async () => {
    lastFetchRef.current = Date.now();
    try {
      const res = await supportAPI.getMyTickets();
      setTickets(res.data.tickets || []);
    } catch {
      // Best-effort; the next focus or navigation retries.
    }
  }, []);

  // The Support page reports which live conversation is expanded, so we
  // don't pop up a notice for a reply the user is already looking at.
  const setViewingChannel = useCallback((channelId) => {
    viewingChannelRef.current = channelId;
    if (channelId) {
      setNotice(prev => (prev?.channelId === channelId ? null : prev));
    }
  }, []);

  const dismissNotice = useCallback(() => {
    setNotice(prev => {
      if (prev?.kind === 'reply' && prev.messageId) {
        try { localStorage.setItem(dismissedKey(prev.channelId), prev.messageId); } catch {}
      }
      return null;
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setTickets([]);
      setUnreadByChannel({});
      setNotice(null);
      disconnectStream();
      return undefined;
    }

    refreshTickets();
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetchRef.current > REFETCH_ON_FOCUS_AFTER_MS) {
        refreshTickets();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isAuthenticated, user?.user_id, refreshTickets]);

  const watchedKey = useMemo(() => tickets
    .filter(t => t.stream_channel_id && t.ticket_status === 'open')
    .map(t => t.stream_channel_id)
    .sort()
    .join(','), [tickets]);

  useEffect(() => {
    if (!isAuthenticated || !user || !watchedKey) return undefined;

    const channelIds = watchedKey.split(',');
    const ticketIdFor = channelId => ticketsRef.current.find(t => t.stream_channel_id === channelId)?.ticket_id;
    let cancelled = false;
    let subscriptions = [];

    const showReply = (channelId, message) => {
      if (viewingChannelRef.current === channelId) return;
      setNotice({
        kind: 'reply',
        ticketId: ticketIdFor(channelId),
        channelId,
        text: message?.text || '',
        messageId: message?.id,
      });
    };

    (async () => {
      try {
        const client = await connectStream(user);
        if (cancelled) return;
        const channels = await client.queryChannels(
          { type: 'support', id: { $in: channelIds } },
          {},
          { watch: true, state: true }
        );
        if (cancelled) return;

        const counts = {};
        channels.forEach(ch => { counts[ch.id] = ch.countUnread(); });
        setUnreadByChannel(counts);

        // A reply that arrived while the user was offline or on another tab.
        const waiting = channels.find(ch => counts[ch.id] > 0);
        if (waiting) {
          const latest = [...waiting.state.messages].reverse().find(m => m.user?.id !== client.userID);
          let dismissed = null;
          try { dismissed = localStorage.getItem(dismissedKey(waiting.id)); } catch {}
          if (latest && latest.id !== dismissed) showReply(waiting.id, latest);
        }

        const isWatched = e => e.channel_type === 'support' && channelIds.includes(e.channel_id);

        subscriptions = [
          client.on('message.new', e => {
            if (!isWatched(e) || e.user?.id === client.userID) return;
            setUnreadByChannel(prev => ({ ...prev, [e.channel_id]: (prev[e.channel_id] || 0) + 1 }));
            showReply(e.channel_id, e.message);
          }),
          client.on('message.read', e => {
            if (!isWatched(e) || e.user?.id !== client.userID) return;
            setUnreadByChannel(prev => ({ ...prev, [e.channel_id]: 0 }));
          }),
          // Resolving a ticket freezes its channel (server/routes/support.js).
          client.on('channel.updated', e => {
            if (!isWatched(e) || !e.channel?.frozen) return;
            const channelId = e.channel_id;
            if (viewingChannelRef.current !== channelId) {
              setNotice({ kind: 'resolved', ticketId: ticketIdFor(channelId), channelId });
            }
            setTicketsVersion(v => v + 1);
            refreshTickets();
          }),
        ];
      } catch (err) {
        console.error('Support reply watcher failed:', err);
      }
    })();

    return () => {
      cancelled = true;
      subscriptions.forEach(s => s.unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedKey, isAuthenticated, user?.user_id]);

  const value = useMemo(() => ({
    notice,
    dismissNotice,
    unreadByChannel,
    ticketsVersion,
    refreshTickets,
    setViewingChannel,
  }), [notice, dismissNotice, unreadByChannel, ticketsVersion, refreshTickets, setViewingChannel]);

  return (
    <SupportWatchContext.Provider value={value}>
      {children}
    </SupportWatchContext.Provider>
  );
};
