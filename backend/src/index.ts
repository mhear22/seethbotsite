import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { logAuthAttempt } from './auth';
import { rateLimiter, securityHeaders } from './middleware';

// Import controllers
import healthController from './controllers/health.controller';
import rankingsController from './controllers/rankings.controller';
import stocksController from './controllers/stocks.controller';
import clicksController from './controllers/clicks.controller';
import moviesController from './controllers/movies.controller';
import genderController from './controllers/gender.controller';
import quotesController from './controllers/quotes.controller';
import pointsController from './controllers/points.controller';
import versionController from './controllers/version.controller';
import ticketsController from './controllers/tickets.controller';
import authController from './controllers/auth.controller';
import holidaysController from './controllers/holidays.controller';
import birdsoundsController from './controllers/birdsounds.controller';
import shopController from './controllers/shop.controller';
import charactersController from './controllers/characters.controller';
import patchNotesController from './controllers/patch-notes.controller';
import miningController from './controllers/mining.controller';
import statsController from './controllers/stats.controller';
import challengesController from './controllers/challenges.controller';
import achievementsController from './controllers/achievements.controller';
import archiveController from './controllers/archive.controller';
import messagesController from './controllers/messages.controller';
import fartsController from './controllers/farts.controller';
import analyticsController from './controllers/analytics.controller';
import syncController from './controllers/sync.controller';
import searchController from './controllers/search.controller';
import reactionsController from './controllers/reactions.controller';
import profilesController from './controllers/profiles.controller';
import favoritesController from './controllers/favorites.controller';
import themesController from './controllers/themes.controller';
import discordController from './controllers/discord.controller';
import dataCenterRunsController from './controllers/datacenter-runs.controller';
import subscriptionController from './controllers/subscription.controller';
import { setupWebSocketServer } from './controllers/presence.controller';
import { multiplayerApiRouter, setupMechWebSockets } from './modules/mech';
import { createServer } from 'http';

const app: Express = express();
const PORT = process.env.PORT || 3001;
// In production Docker: __dirname is /app/backend/dist, webdist is at /app/backend/webdist
// In development: __dirname is /backend/src, webdist is at /backend/webdist
const SERVE_ROOT = process.env.SERVE_ROOT || path.join(__dirname, '..', 'webdist');
const MECH_SERVE_ROOT = process.env.MECH_SERVE_ROOT || path.join(__dirname, '..', 'mech-webdist');
const TICKETS_SERVE_ROOT = process.env.TICKETS_SERVE_ROOT || path.join(__dirname, '..', 'tickets-webdist');
const DATACENTER_SERVE_ROOT = process.env.DATACENTER_SERVE_ROOT || path.join(__dirname, '..', 'datacenter-webdist');

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(securityHeaders);

// Rate limiting - applies to all API routes
// IMPORTANT: Limit is extremely high because this is a real-time multiplayer game.
// Players send frequent game state updates, battle actions, position data, etc.
// during active gameplay. Lower limits would break the core game experience.
app.use('/api/', rateLimiter(10000, 60 * 1000)); // 10,000 requests per minute

// Log authentication attempts
app.use('/api/', logAuthAttempt);

// Cache control middleware for static files
app.use((req: Request, res: Response, next: NextFunction) => {
  const urlPath = req.path;

  // Skip cache headers for API routes
  if (urlPath.startsWith('/api')) {
    return next();
  }

  // Never cache index.html - always revalidate to get latest asset references
  if (urlPath === '/' || urlPath === '/index.html' || urlPath.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  // Long-term cache for hashed assets (Vite generates files like index-DL4ebBic.js)
  else if (/\.(js|css)$/.test(urlPath) && /-[a-zA-Z0-9]{8,}\.(js|css)$/.test(urlPath)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Moderate cache for other static assets (images, fonts, manifest, etc.)
  else if (/\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot|webp|json)$/.test(urlPath)) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }

  next();
});

// Serve static files from the Vue.js app
app.use(express.static(SERVE_ROOT));
app.use('/mech', express.static(MECH_SERVE_ROOT));
app.use('/tickets', express.static(TICKETS_SERVE_ROOT));
app.use('/datacenter', express.static(DATACENTER_SERVE_ROOT));

// Serve avatars from backend/public
app.use('/avatars', express.static(path.join(__dirname, '..', 'public', 'avatars')));

// Mount API controllers
app.use('/api', healthController);
app.use('/api', rankingsController);
app.use('/api', stocksController);
app.use('/api', clicksController);
app.use('/api', moviesController);
app.use('/api', genderController);
app.use('/api', quotesController);
app.use('/api', versionController);
app.use('/api/points', pointsController);
app.use('/api', ticketsController);
app.use('/api', authController);
app.use('/api', holidaysController);
app.use('/api', birdsoundsController);
app.use('/api/shop', shopController);
app.use('/api', charactersController);
app.use('/api', patchNotesController);
app.use('/api', miningController);
app.use('/api/stats', statsController);
app.use('/api/challenges', challengesController);
app.use('/api/achievements', achievementsController);
app.use('/api', archiveController);
app.use('/api/farts', fartsController);
app.use('/api', messagesController);
app.use('/api', analyticsController);
app.use('/api', syncController);
app.use('/api/search', searchController);
app.use('/api/reactions', reactionsController);
app.use('/api/profiles', profilesController);
app.use('/api/favorites', favoritesController);
app.use('/api/themes', themesController);
app.use('/api', discordController);
app.use('/api', dataCenterRunsController);
app.use('/api/subscriptions', subscriptionController);

// Mech multiplayer API routes (canonical + legacy compatibility alias)
app.use('/api/mech/multiplayer', multiplayerApiRouter);
app.use('/api/multiplayer', multiplayerApiRouter);

// Serve raw OpenAPI JSON spec for type generation
app.get('/api/openapi.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  //customCss: '.swagger-ui .topbar { display: none }',
  //customSiteTitle: 'Seethbot API Docs'
}));

// Mech SPA fallback
app.get('/mech', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(MECH_SERVE_ROOT, 'index.html'));
});

app.get('/mech/*', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(MECH_SERVE_ROOT, 'index.html'));
});

// Tickets SPA fallback
app.get('/tickets', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(TICKETS_SERVE_ROOT, 'index.html'));
});

app.get('/tickets/*', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(TICKETS_SERVE_ROOT, 'index.html'));
});

// Data Center SPA fallback
app.get('/datacenter', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(DATACENTER_SERVE_ROOT, 'index.html'));
});

app.get('/datacenter/*', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(DATACENTER_SERVE_ROOT, 'index.html'));
});

// Vue.js SPA fallback - all other routes serve index.html
app.get('*', (req: Request, res: Response) => {
  // Ensure index.html is never cached
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(SERVE_ROOT, 'index.html'));
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // Include stack trace and error details in development mode
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const server = createServer(app);

// Setup WebSocket server for user presence BEFORE server starts listening
setupWebSocketServer(server);

// Setup multiplayer WebSocket server
setupMechWebSockets(server);

// Note: Prisma client is initialized automatically, no need for separate DB initialization

server.listen(PORT, () => {
  console.log(`🌸 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${SERVE_ROOT}`);
  console.log(`🤖 Serving mech app from: ${MECH_SERVE_ROOT} at /mech`);
  console.log(`🎫 Serving tickets app from: ${TICKETS_SERVE_ROOT} at /tickets`);
  console.log(`🖥️  Serving data center app from: ${DATACENTER_SERVE_ROOT} at /datacenter`);
  console.log(`✨ Ready to serve the Vue.js app!`);
  console.log(`🔒 Security: API key authentication enabled for destructive endpoints`);
  console.log(`⚡ Rate limiting: 10,000 requests per minute per IP (high for real-time gameplay)`);
  console.log(`🔗 WebSocket server listening on /ws`);
  console.log(`🎮 Multiplayer WebSocket server listening on /ws/mech/multiplayer (and /ws/multiplayer legacy)`);
});

export default app;
