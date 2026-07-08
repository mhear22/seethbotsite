import type { Server } from 'http';
import { setupMultiplayerWebSocket } from '../../controllers/multiplayer.controller';
import { multiplayerApiRouter } from './multiplayer.api';

export { multiplayerApiRouter };

export function setupMechWebSockets(server: Server): void {
  setupMultiplayerWebSocket(server);
}
