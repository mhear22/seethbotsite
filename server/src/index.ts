import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import { getClickCount, incrementClick, resetClick } from './db';

const app: Express = express();
const PORT = process.env.PORT || 3000;
// In production Docker: __dirname is /app/server/dist, webdist is at /app/server/webdist
// In development: __dirname is /server/src, frontend build is at /dist
const SERVE_ROOT = process.env.SERVE_ROOT || path.join(__dirname, '..', 'webdist');

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
    { avatar: '🥔', name: 'Cam', score: 10000 },  // Always at the top! (literally)
    { avatar: '🌙', name: 'Orlando', score: 10067 },  // Cam's score + 67
    { avatar: '🌸', name: 'You', score: 1467, isCurrentUser: true },
    { avatar: '🏍️', name: '美香', score: 1467 },  // Boosted for Vite migration help!
    { avatar: '<:sadcat:1000736705197907968>', name: "Chang'Yi", score: 1367 },  // sadcat icon
    { avatar: '<:flooshies:1000736727259947069>', name: 'Ashley', score: 967 },  // flooshies icon
    { avatar: '🍄', name: 'Goopsworthy', score: 667 }
  ]);
});

// Click counter API
app.get('/api/clicks', (req: Request, res: Response) => {
  try {
    const count = getClickCount();
    res.json({ count, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting click count:', error);
    res.status(500).json({ error: 'Failed to get click count' });
  }
});

app.post('/api/clicks/increment', (req: Request, res: Response) => {
  try {
    const newCount = incrementClick();
    res.json({ count: newCount, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error incrementing click:', error);
    res.status(500).json({ error: 'Failed to increment click' });
  }
});

app.post('/api/clicks/reset', (req: Request, res: Response) => {
  try {
    const newCount = resetClick();
    res.json({ count: newCount, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error resetting clicks:', error);
    res.status(500).json({ error: 'Failed to reset clicks' });
  }
});

// Gender detection API (mock implementation)
// In production, this would use a proper gender detection library/service
const genderPatterns: { [key: string]: { gender: string; probability: number } } = {
  // Female names
  'mary': { gender: 'female', probability: 0.99 },
  'patricia': { gender: 'female', probability: 0.99 },
  'jennifer': { gender: 'female', probability: 0.99 },
  'linda': { gender: 'female', probability: 0.99 },
  'elizabeth': { gender: 'female', probability: 0.99 },
  'barbara': { gender: 'female', probability: 0.99 },
  'susan': { gender: 'female', probability: 0.99 },
  'jessica': { gender: 'female', probability: 0.99 },
  'sarah': { gender: 'female', probability: 0.99 },
  'karen': { gender: 'female', probability: 0.99 },
  'lisa': { gender: 'female', probability: 0.99 },
  'nancy': { gender: 'female', probability: 0.99 },
  'betty': { gender: 'female', probability: 0.99 },
  'margaret': { gender: 'female', probability: 0.99 },
  'sandra': { gender: 'female', probability: 0.99 },
  'ashley': { gender: 'female', probability: 0.85 },
  'mika': { gender: 'female', probability: 0.95 },
  'emily': { gender: 'female', probability: 0.99 },
  'sophie': { gender: 'female', probability: 0.99 },
  'emma': { gender: 'female', probability: 0.99 },

  // Male names
  'james': { gender: 'male', probability: 0.99 },
  'john': { gender: 'male', probability: 0.99 },
  'robert': { gender: 'male', probability: 0.99 },
  'michael': { gender: 'male', probability: 0.99 },
  'william': { gender: 'male', probability: 0.99 },
  'david': { gender: 'male', probability: 0.99 },
  'richard': { gender: 'male', probability: 0.99 },
  'joseph': { gender: 'male', probability: 0.99 },
  'thomas': { gender: 'male', probability: 0.99 },
  'charles': { gender: 'male', probability: 0.99 },
  'christopher': { gender: 'male', probability: 0.99 },
  'daniel': { gender: 'male', probability: 0.99 },
  'matthew': { gender: 'male', probability: 0.99 },
  'anthony': { gender: 'male', probability: 0.99 },
  'mark': { gender: 'male', probability: 0.99 },
  'donald': { gender: 'male', probability: 0.99 },
  'steven': { gender: 'male', probability: 0.99 },
  'paul': { gender: 'male', probability: 0.99 },
  'andrew': { gender: 'male', probability: 0.99 },
  'orlando': { gender: 'male', probability: 0.99 },

  // Unisex names
  'pat': { gender: 'unisex', probability: 0.5 },
  'alex': { gender: 'unisex', probability: 0.5 },
  'taylor': { gender: 'unisex', probability: 0.5 },
  'jordan': { gender: 'unisex', probability: 0.5 },
  'jamie': { gender: 'unisex', probability: 0.5 },
  'casey': { gender: 'unisex', probability: 0.5 },
  'riley': { gender: 'unisex', probability: 0.5 },
  'morgan': { gender: 'unisex', probability: 0.5 }
};

app.post('/api/gender', (req: Request, res: Response) => {
  try {
    const { name, country } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const normalizedName = name.toLowerCase().trim();

    // Check if name exists in our database
    if (genderPatterns[normalizedName]) {
      const result = genderPatterns[normalizedName];
      res.json({
        gender: result.gender,
        probability: result.probability,
        name: name,
        country: country || 0
      });
    } else {
      // Name not found - could use heuristics here
      // For now, return not_found
      res.json({
        gender: 'not_found',
        probability: 0,
        name: name,
        country: country || 0
      });
    }
  } catch (error) {
    console.error('Error detecting gender:', error);
    res.status(500).json({ error: 'Failed to detect gender' });
  }
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
