import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'http';
import { multiplayerApiRouter, setupMechWebSockets } from './modules/mech';

const app: Express = express();
const PORT = process.env.MECH_PORT || 3011;

/**
 * Local security headers middleware.
 *
 * Copied inline so the mech backend has NO code dependency on the main backend.
 * Rate limiting and auth-attempt logging are applied by the main backend before
 * it reverse-proxies traffic here, so they are intentionally omitted.
 */
const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' wss: https:;");
  if (process.env.NODE_ENV === 'production') {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
};

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(securityHeaders);

// Mech multiplayer API routes (canonical + legacy compatibility alias).
// Static file serving + SPA fallback are handled by the main backend.
app.use('/api/mech/multiplayer', multiplayerApiRouter);
app.use('/api/multiplayer', multiplayerApiRouter);

const server = createServer(app);
setupMechWebSockets(server);

// Bind to loopback only: this service is reachable exclusively via the main
// backend's reverse proxy (which applies rate limiting + auth logging). Binding
// 127.0.0.1 enforces that at the OS level rather than relying on port publishing.
server.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`🤖 Mech game server running on http://127.0.0.1:${PORT}`);
  console.log('🎮 Multiplayer WebSocket: /ws/mech/multiplayer (and /ws/multiplayer legacy)');
});

export default app;
