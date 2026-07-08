/**
 * Multiplayer WebSocket controller
 * Handles WebSocket connections for multiplayer mech battle
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { gameServer } from '../services/GameServer';
import { ClientMessage } from '../shared/types/NetworkMessages';
import jwt from 'jsonwebtoken';

if (!process.env.SEETHBOT_JWT_SECRET) {
  throw new Error('CRITICAL: SEETHBOT_JWT_SECRET environment variable must be set. Refusing to start with insecure default.');
}
const JWT_SECRET: string = process.env.SEETHBOT_JWT_SECRET;
const MULTIPLAYER_WS_PATHS = ['/ws/mech/multiplayer', '/ws/multiplayer'] as const;

/**
 * Setup multiplayer WebSocket server
 */
export function setupMultiplayerWebSocket(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade requests
  server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
    // Only handle supported multiplayer WebSocket paths.
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    if (!MULTIPLAYER_WS_PATHS.includes(pathname as typeof MULTIPLAYER_WS_PATHS[number])) {
      return; // Let other handlers deal with it
    }

    console.log('[Multiplayer] WebSocket upgrade request received');

    // Parse query parameters
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      console.warn('[Multiplayer] No token provided');
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\nNo token provided');
      socket.destroy();
      return;
    }

    // Verify JWT token
    let userId: string;
    let userName: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id?.toString() || decoded.userId?.toString();
      userName = decoded.username || decoded.name || 'Unknown';

      if (!userId) {
        throw new Error('Invalid token payload');
      }
    } catch (error) {
      console.warn('[Multiplayer] Invalid token:', error);
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\nInvalid token');
      socket.destroy();
      return;
    }

    console.log(`[Multiplayer] Player ${userName} (${userId}) authenticated`);

    // Handle WebSocket connection
    wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      // Register player with game server
      gameServer.registerPlayer(userId, userName, ws);

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connected',
        playerId: userId,
        playerName: userName
      }));

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: ClientMessage = JSON.parse(data.toString());
          gameServer.handleMessage(userId, message);
        } catch (error) {
          console.error(`[Multiplayer] Error parsing message from ${userName}:`, error);
          ws.send(JSON.stringify({
            type: 'error',
            code: 'INVALID_MESSAGE',
            message: 'Failed to parse message'
          }));
        }
      });

      // Handle WebSocket close
      ws.on('close', () => {
        console.log(`[Multiplayer] Player ${userName} (${userId}) disconnected`);
        gameServer.handleDisconnect(userId);
      });

      // Handle WebSocket error
      ws.on('error', (error: Error) => {
        console.error(`[Multiplayer] WebSocket error for ${userName}:`, error);
        gameServer.handleDisconnect(userId);
      });

      // Send ping periodically to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000); // 30 seconds
      pingInterval.unref?.();

      ws.on('close', () => {
        clearInterval(pingInterval);
      });
    });
  });

  console.log(`[Multiplayer] WebSocket server initialized for ${MULTIPLAYER_WS_PATHS.join(' and ')}`);

  return wss;
}

/**
 * Get game server statistics endpoint
 */
export function getGameStats(req: any, res: any) {
  const stats = gameServer.getStats();
  res.json(stats);
}
