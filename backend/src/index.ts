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

const app: Express = express();
const PORT = process.env.PORT || 3001;
// In production Docker: __dirname is /app/backend/dist, webdist is at /app/backend/webdist
// In development: __dirname is /backend/src, webdist is at /backend/webdist
const SERVE_ROOT = process.env.SERVE_ROOT || path.join(__dirname, '..', 'webdist');

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(securityHeaders);

// Rate limiting - applies to all API routes
app.use('/api/', rateLimiter(100, 60 * 1000)); // 100 requests per minute

// Log authentication attempts
app.use('/api/', logAuthAttempt);

// Serve static files from the Vue.js app
app.use(express.static(SERVE_ROOT));

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

// Vue.js SPA fallback - all other routes serve index.html
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(SERVE_ROOT, 'index.html'));
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌸 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${SERVE_ROOT}`);
  console.log(`✨ Ready to serve the Vue.js app!`);
  console.log(`🔒 Security: API key authentication enabled for destructive endpoints`);
  console.log(`⚡ Rate limiting: 100 requests per minute per IP`);
});

export default app;
