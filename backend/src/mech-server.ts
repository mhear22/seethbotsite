import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'http';
import { logAuthAttempt } from './auth';
import { rateLimiter, securityHeaders } from './middleware';
import { multiplayerApiRouter, setupMechWebSockets } from './modules/mech';

const app: Express = express();
const PORT = process.env.MECH_PORT || 3011;
const MECH_SERVE_ROOT = process.env.MECH_SERVE_ROOT || path.join(__dirname, '..', 'mech-webdist');

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(securityHeaders);

app.use('/api/', rateLimiter(10000, 60 * 1000));
app.use('/api/', logAuthAttempt);

app.use('/api/mech/multiplayer', multiplayerApiRouter);
app.use('/api/multiplayer', multiplayerApiRouter);

app.use(express.static(MECH_SERVE_ROOT));

app.get('*', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(MECH_SERVE_ROOT, 'index.html'));
});

const server = createServer(app);
setupMechWebSockets(server);

server.listen(PORT, () => {
  console.log(`🤖 Mech app server running on http://localhost:${PORT}`);
  console.log(`📁 Serving mech app from: ${MECH_SERVE_ROOT}`);
  console.log('🎮 Multiplayer WebSocket: /ws/mech/multiplayer (and /ws/multiplayer legacy)');
});
