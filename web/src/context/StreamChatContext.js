import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { connectStream } from '../services/streamConnection';

const StreamChatContext = createContext(null);

// Hands Support.js / admin/SupportTickets.js the shared Stream client. The
// connection itself lives in services/streamConnection.js and outlives this
// provider (SupportWatchProvider keeps using it to catch replies after the
// user leaves the support page); it's torn down on logout.
export const StreamChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setClient(null);
      return;
    }

    let cancelled = false;
    connectStream(user)
      .then(streamClient => {
        if (!cancelled) setClient(streamClient);
      })
      .catch(err => console.error('Stream Chat connection failed:', err));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.user_id]);

  return (
    <StreamChatContext.Provider value={{ client }}>
      {children}
    </StreamChatContext.Provider>
  );
};

export const useStreamChatClient = () => {
  const context = useContext(StreamChatContext);
  if (!context) {
    throw new Error('useStreamChatClient must be used within StreamChatProvider');
  }
  return context;
};
