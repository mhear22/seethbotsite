import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

interface ConnectedUser {
  socket: WebSocket;
  userId: string;
  userName: string;
  avatar?: string;
  currentPage: string;
  lastSeen: number;
}

interface PresenceMessage {
  type: 'presence_update' | 'user_joined' | 'user_left' | 'heartbeat';
  data?: any;
}

// Store connected users by page
const pageUsers = new Map<string, Map<string, ConnectedUser>>();

// Clean up inactive users every 30 seconds
const CLEANUP_INTERVAL = 30000;
const HEARTBEAT_TIMEOUT = 120000; // 2 minutes

function cleanupInactiveUsers() {
  const now = Date.now();

  for (const [page, users] of pageUsers.entries()) {
    const toRemove: string[] = [];

    for (const [userId, user] of users.entries()) {
      if (now - user.lastSeen > HEARTBEAT_TIMEOUT) {
        toRemove.push(userId);
        console.log(`[Presence] Cleaning up inactive user ${user.userName} from page ${page}`);

        // Notify other users
        broadcastToPage(page, {
          type: 'user_left',
          data: {
            userId: user.userId,
            userName: user.userName,
            avatar: user.avatar
          }
        });

        // Close socket if still open
        if (user.socket.readyState === WebSocket.OPEN) {
          user.socket.close();
        }
      }
    }

    // Remove inactive users
    toRemove.forEach(userId => {
      users.delete(userId);
    });

    // Remove empty pages
    if (users.size === 0) {
      pageUsers.delete(page);
    }
  }
}

// Start cleanup interval
setInterval(cleanupInactiveUsers, CLEANUP_INTERVAL);

// Broadcast message to all users on a page
function broadcastToPage(page: string, message: PresenceMessage, excludeUserId?: string) {
  const users = pageUsers.get(page);

  if (!users) return;

  const messageStr = JSON.stringify(message);

  for (const [userId, user] of users.entries()) {
    if (excludeUserId && userId === excludeUserId) continue;

    if (user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(messageStr);
    }
  }
}

// Get active users for a page
function getActiveUsers(page: string) {
  const users = pageUsers.get(page);

  if (!users) return [];

  return Array.from(users.values()).map(user => ({
    userId: user.userId,
    userName: user.userName,
    avatar: user.avatar
  }));
}

// Setup WebSocket server
export function setupWebSocketServer(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade requests
  server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
    // Only handle /ws path
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    if (pathname !== '/ws' && pathname !== '/presence') {
      return;
    }
    // Parse query parameters
    const url = new URL(request.url || '', `http://${request.headers.host}`);

    const userId = url.searchParams.get('userId');
    const userName = url.searchParams.get('userName');
    const avatar = url.searchParams.get('avatar');
    const page = url.searchParams.get('page') || 'home';

    if (!userId || !userName) {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\nMissing userId or userName');
      socket.destroy();
      return;
    }

    // Handle WebSocket connection
    wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      const now = Date.now();

      // Initialize page users map if needed
      if (!pageUsers.has(page)) {
        pageUsers.set(page, new Map());
      }

      const users = pageUsers.get(page)!;

      // Remove existing connection for this user on this page
      const existingUser = users.get(userId);
      if (existingUser && existingUser.socket.readyState === WebSocket.OPEN) {
        existingUser.socket.close();
      }

      // Create connected user
      const connectedUser: ConnectedUser = {
        socket: ws,
        userId,
        userName,
        avatar: avatar || undefined,
        currentPage: page,
        lastSeen: now
      };

      // Add user to page
      users.set(userId, connectedUser);
      console.log(`[Presence] User ${userName} joined page ${page}`);

      // Send current active users to new user
      const activeUsers = getActiveUsers(page);
      ws.send(JSON.stringify({
        type: 'presence_update',
        data: {
          activeUsers: activeUsers.filter(u => u.userId !== userId)
        }
      }));

      // Notify other users of new join
      broadcastToPage(page, {
        type: 'user_joined',
        data: {
          userId,
          userName,
          avatar
        }
      }, userId);

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: PresenceMessage = JSON.parse(data.toString());

          if (message.type === 'heartbeat') {
            // Update last seen time
            connectedUser.lastSeen = Date.now();

            // If user changed page, update their location
            if (message.data?.page && message.data.page !== connectedUser.currentPage) {
              const newPage = message.data.page;
              console.log(`[Presence] User ${userName} moved from ${connectedUser.currentPage} to ${newPage}`);

              // Remove from old page
              const oldPage = connectedUser.currentPage;
              broadcastToPage(oldPage, {
                type: 'user_left',
                data: {
                  userId,
                  userName,
                  avatar
                }
              }, userId);
              users.delete(userId);
              if (users.size === 0) {
                pageUsers.delete(oldPage);
              }

              // Add to new page
              if (!pageUsers.has(newPage)) {
                pageUsers.set(newPage, new Map());
              }
              const newUsers = pageUsers.get(newPage)!;
              connectedUser.currentPage = newPage;
              newUsers.set(userId, connectedUser);

              // Send current active users to user
              const newPageActiveUsers = getActiveUsers(newPage);
              ws.send(JSON.stringify({
                type: 'presence_update',
                data: {
                  activeUsers: newPageActiveUsers.filter(u => u.userId !== userId)
                }
              }));

              // Notify other users on new page
              broadcastToPage(newPage, {
                type: 'user_joined',
                data: {
                  userId,
                  userName,
                  avatar
                }
              }, userId);

              // Update current page reference in users map
              connectedUser.currentPage = newPage;
            }
          }
        } catch (error) {
          console.error('[Presence] Error handling message:', error);
        }
      });

      // Handle WebSocket close
      ws.on('close', () => {
        console.log(`[Presence] User ${userName} left page ${connectedUser.currentPage}`);
        const finalPage = connectedUser.currentPage;
        users.delete(userId);

        // Remove page if empty
        if (users.size === 0) {
          pageUsers.delete(finalPage);
        }

        // Notify other users
        broadcastToPage(finalPage, {
          type: 'user_left',
          data: {
            userId,
            userName,
            avatar
          }
        }, userId);
      });

      // Handle WebSocket error
      ws.on('error', (error) => {
        console.error('[Presence] WebSocket error:', error);
      });
    });
  });

  console.log('[Presence] WebSocket server initialized');

  return wss;
}

// Export for testing purposes
export { pageUsers };
