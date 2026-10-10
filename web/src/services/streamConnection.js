import { supportAPI } from './api';

// One Stream Chat connection per logged-in session, shared by the support
// pages (via StreamChatProvider) and the app-wide SupportWatchProvider.
// StreamChat.getInstance() is a singleton, so two independent connect /
// disconnect lifecycles would trample each other; everything goes through
// here instead. stream-chat is imported lazily so it stays out of the main
// bundle for visitors who never touch support chat.
let clientPromise = null;
let connectedUserId = null;

export function connectStream(user) {
  if (clientPromise && connectedUserId === user.user_id) return clientPromise;
  if (clientPromise) disconnectStream();

  connectedUserId = user.user_id;
  const promise = (async () => {
    const [{ StreamChat }, { data }] = await Promise.all([
      import('stream-chat'),
      supportAPI.getStreamToken(),
    ]);
    const client = StreamChat.getInstance(data.apiKey);
    if (client.userID !== data.streamUserId) {
      if (client.userID) await client.disconnectUser();
      await client.connectUser({ id: data.streamUserId, name: user.name }, data.token);
    }
    return client;
  })();

  clientPromise = promise;
  promise.catch(() => {
    if (clientPromise === promise) {
      clientPromise = null;
      connectedUserId = null;
    }
  });
  return promise;
}

export async function disconnectStream() {
  const promise = clientPromise;
  clientPromise = null;
  connectedUserId = null;
  if (!promise) return;
  try {
    const client = await promise;
    await client.disconnectUser();
  } catch {
    // Connection never came up; nothing to tear down.
  }
}
