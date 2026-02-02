import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import { getClickCount, incrementClick, resetClick } from './db';
import * as stockMarket from './stockMarket';
import * as movies from './movies';
import { requireApiKey, logAuthAttempt } from './auth';
import { rateLimiter, sanitizeBody, securityHeaders, validations, handleValidationErrors } from './middleware';

const app: Express = express();
const PORT = process.env.PORT || 3000;
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

// API Routes (placeholder for future expansion)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/rankings', (req: Request, res: Response) => {
  const rankings = [
    { avatar: '🥔', name: 'Cam', score: 10000 },  // Always at the top! (literally)
    { avatar: '🌙', name: 'Orlando', score: 10067 },  // Cam's score + 67
    { avatar: '<:flooshies:1000736727259947069>', name: 'Ashley', score: 5000 },  // MASSIVE boost for API key access!
    { avatar: '🌸', name: 'Average Hex', score: 2000 },  // Friendly & curious
    { avatar: '🔧', name: 'Temer3', score: 1800 },  // Debug hero, fixed the needle!
    { avatar: '🌸', name: 'You', score: 1467, isCurrentUser: true },
    { avatar: '🏍️', name: '美香', score: 21467 },  // MASSIVE 20,000 point boost for website development!
    { avatar: '<:sadcat:1000736705197907968>', name: "Chang'Yi", score: 1367 },  // sadcat icon
    { avatar: '🎮', name: 'RIUM+', score: 501 },  // Requested 1 point boost
    { avatar: '🍄', name: 'Goopsworthy', score: 667 },
    { avatar: '🎮', name: 'Blair', score: 900 },  // Mentioned in goose lore
    { avatar: '✨', name: "Claire Salem %◕‿‿◕%", score: 500 },  // Asked if she's a good girl (she is!)
    { avatar: '🧶', name: 'ShiYuan', score: 500 },  // First interaction - said hello to "tease/flirt"
    { avatar: '✨', name: 'Others', score: 500 }  // Default for everyone else
  ];

  // Sort by score (highest first)
  rankings.sort((a, b) => b.score - a.score);

  res.json({ rankings });
});

// Stock Market API
app.get('/api/stocks', (req: Request, res: Response) => {
  try {
    const allStocks = stockMarket.getAllStocks();
    res.json({ stocks: allStocks, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting stocks:', error);
    res.status(500).json({ error: 'Failed to get stocks' });
  }
});

app.get('/api/stocks/:name', (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const stock = stockMarket.getStock(name);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json({ stock, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting stock:', error);
    res.status(500).json({ error: 'Failed to get stock' });
  }
});

app.post('/api/stocks/buy',
  validations.tradeStock,
  handleValidationErrors,
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { userId, stockName, shares } = req.body;
      if (!userId || !stockName || !shares || shares <= 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const result = stockMarket.buyShares(userId, stockName, shares);
      res.json({ ...result, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error buying shares:', error);
      res.status(500).json({ error: 'Failed to buy shares' });
    }
  }
);

app.post('/api/stocks/sell',
  validations.tradeStock,
  handleValidationErrors,
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { userId, stockName, shares } = req.body;
      if (!userId || !stockName || !shares || shares <= 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const result = stockMarket.sellShares(userId, stockName, shares);
      res.json({ ...result, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error selling shares:', error);
      res.status(500).json({ error: 'Failed to sell shares' });
    }
  }
);

app.get('/api/portfolio/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const portfolio = stockMarket.getUserPortfolio(userId);
    const portfolioValue = stockMarket.calculatePortfolioValue(userId);
    res.json({ portfolio, portfolioValue, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting portfolio:', error);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
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

app.post('/api/clicks/increment',
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const newCount = incrementClick();
      res.json({ count: newCount, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error incrementing click:', error);
      res.status(500).json({ error: 'Failed to increment click' });
    }
  }
);

app.post('/api/clicks/reset',
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const newCount = resetClick();
      res.json({ count: newCount, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error resetting clicks:', error);
      res.status(500).json({ error: 'Failed to reset clicks' });
    }
  }
);

// Movie Night API
app.get('/api/movies', (req: Request, res: Response) => {
  try {
    const allMovies = movies.getAllMovies();
    res.json({ movies: allMovies, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting movies:', error);
    res.status(500).json({ error: 'Failed to get movies' });
  }
});

app.post('/api/movies',
  validations.addMovie,
  handleValidationErrors,
  sanitizeBody(['title', 'suggestedBy', 'genre', 'notes']),
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { title, suggestedBy, year, genre, notes, thumbnail } = req.body;
      if (!title || !suggestedBy) {
        return res.status(400).json({ error: 'Title and suggestedBy are required' });
      }
      const newMovie = movies.addMovie({
        title,
        suggestedBy,
        year,
        genre,
        notes,
        thumbnail
      });
      res.json({ movie: newMovie, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error adding movie:', error);
      res.status(500).json({ error: 'Failed to add movie' });
    }
  }
);

app.delete('/api/movies/:id',
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = movies.deleteMovie(id);
      if (!success) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error deleting movie:', error);
      res.status(500).json({ error: 'Failed to delete movie' });
    }
  }
);

app.get('/api/movies/voting-round', (req: Request, res: Response) => {
  try {
    const round = movies.getVotingRound();
    res.json({ round, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting voting round:', error);
    res.status(500).json({ error: 'Failed to get voting round' });
  }
});

app.post('/api/movies/voting-round/start',
  validations.startVotingRound,
  handleValidationErrors,
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { movieIds } = req.body;
      if (!movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
        return res.status(400).json({ error: 'movieIds array is required' });
      }
      const round = movies.createVotingRound(movieIds);
      res.json({ round, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error starting voting round:', error);
      res.status(500).json({ error: 'Failed to start voting round' });
    }
  }
);

app.post('/api/movies/voting-round/end',
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const result = movies.endVotingRound();
      res.json({ ...result, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error ending voting round:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to end voting round' });
    }
  }
);

app.post('/api/movies/voting-round/reset',
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      movies.resetVoting();
      res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error resetting voting:', error);
      res.status(500).json({ error: 'Failed to reset voting' });
    }
  }
);

app.get('/api/movies/votes', (req: Request, res: Response) => {
  try {
    const votes = movies.getVotes();
    res.json({ votes, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting votes:', error);
    res.status(500).json({ error: 'Failed to get votes' });
  }
});

app.post('/api/movies/vote',
  validations.addVote,
  handleValidationErrors,
  requireApiKey(),
  (req: Request, res: Response) => {
    try {
      const { userId, rankings } = req.body;
      if (!userId || !rankings || !Array.isArray(rankings) || rankings.length === 0) {
        return res.status(400).json({ error: 'userId and rankings array are required' });
      }
      const vote = movies.addVote({ userId, rankings });
      res.json({ vote, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error adding vote:', error);
      res.status(500).json({ error: 'Failed to add vote' });
    }
  }
);

app.get('/api/movies/vote/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const vote = movies.getUserVote(userId);
    if (!vote) {
      return res.status(404).json({ error: 'Vote not found' });
    }
    res.json({ vote, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error getting vote:', error);
    res.status(500).json({ error: 'Failed to get vote' });
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

app.post('/api/gender',
  validations.detectGender,
  handleValidationErrors,
  sanitizeBody(['name']),
  (req: Request, res: Response) => {
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
  }
);

// Northernlion quotes (curated collection)
const northernlionQuotes = [
  "It's gonna be a long one.",
  "What are the odds? Not good.",
  "This is a terrible idea.",
  "I'm doing science!",
  "Here we go again.",
  "Oh no... oh no no no no.",
  "That's the game, baby!",
  "I can't believe this worked.",
  "Wait, what?",
  "Let's see what happens.",
  "This is fine. Everything is fine.",
  "I have made a huge mistake.",
  "It's not a bug, it's a feature!",
  "Back to the drawing board.",
  "That's one way to do it.",
  "I regret nothing.",
  "Actually, that was pretty good.",
  "Never gonna happen.",
  "Trust the process.",
  "I'm just along for the ride.",
  "It's chaotic energy, but it's energy.",
  "You know what they say about plans.",
  "We're making progress... in a direction.",
  "This is the content the people want.",
  "Let's just pretend that didn't happen.",
  "I'm basically a genius.",
  "That's not how this works.",
  "Classic.",
  "The RNG giveth, and the RNG taketh away.",
  "I feel like I'm forgetting something.",
  "Let's keep it moving.",
  "That's a whole vibe.",
  "This is peak gaming.",
  "I can do this all day.",
  "What could go wrong?",
  "Famous last words.",
  "I've got a bad feeling about this.",
  "Actually, maybe I'm the problem.",
  "Time to pivot.",
  "Strategy is for people with plans.",
  "Let's throw caution to the wind.",
  "I'm in too deep now.",
  "This is the way.",
  "Trust your gut.",
  "Let's see where this goes.",
  "That was beautiful... in a terrible way.",
  "I need an adult.",
  "Professional streamer, very serious business.",
  "Let's just embrace the chaos.",
  "That's the spirit!"
];

// Northernlion Quote API
app.get('/api/quote', async (req: Request, res: Response) => {
  try {
    // Select a random quote from our Northernlion collection
    const randomIndex = Math.floor(Math.random() * northernlionQuotes.length);
    const quote = northernlionQuotes[randomIndex];

    res.json({
      quote,
      source: 'northernlion-db',
      index: randomIndex,
      totalQuotes: northernlionQuotes.length
    });
  } catch (error) {
    console.error('Error generating quote:', error);
    // Fallback quote
    res.json({
      quote: 'Stay curious, keep asking questions.',
      source: 'fallback'
    });
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
  console.log(`🔒 Security: API key authentication enabled for destructive endpoints`);
  console.log(`⚡ Rate limiting: 100 requests per minute per IP`);
});

export default app;
