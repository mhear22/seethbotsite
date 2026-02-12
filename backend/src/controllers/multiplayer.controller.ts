/**
 * Multiplayer WebSocket controller
 * Handles WebSocket connections for multiplayer mech battle
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { gameServer } from '../services/GameServer';
import { ClientMessage } from '../shared/types/NetworkMessages';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SEETHBOT_JWT_SECRET || 'change-this-in-production-secret-key';

/**
 * Setup multiplayer WebSocket server
 */
export function setupMultiplayerWebSocket(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade requests
  server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
    // Only handle /ws/multiplayer path
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    if (pathname !== '/ws/multiplayer') {
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

      ws.on('close', () => {
        clearInterval(pingInterval);
      });
    });
  });

  console.log('[Multiplayer] WebSocket server initialized for /ws/multiplayer');

  return wss;
}

/**
 * Get game server statistics endpoint
 */
export function getGameStats(req: any, res: any) {
  const stats = gameServer.getStats();
  res.json(stats);
}
