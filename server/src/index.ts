import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';

const app: Express = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, '..', '..');
const SERVE_ROOT = process.env.SERVE_ROOT || path.join(__dirname, '..', '..');

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the Vue.js app
app.use(express.static(SERVE_ROOT));

// API Routes (placeholder for future expansion)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/rankings', (req: Request, res: Response) => {
  res.json([
    { avatar: '🌙', name: 'Orlando', score: 3467 },
    { avatar: '🌸', name: 'You', score: 1467, isCurrentUser: true },
    { avatar: '🍄', name: "Chang'Yi", score: 1367 },
    { avatar: '🎵', name: 'Ashley', score: 967 },
    { avatar: '😺', name: '美香', score: 767 },
    { avatar: '🍄', name: 'Goopsworthy', score: 667 }
  ]);
});

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
});

export default app;
