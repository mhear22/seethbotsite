import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

interface Opinion {
  id: string;
  text: string;
  type: 'random' | 'build';
  createdAt: string;
}

interface RankingsSnapshot {
  id: string;
  timestamp: string;
  rankings: {
    avatar: string;
    name: string;
    score: number;
    isCurrentUser?: boolean;
  }[];
}

// Storage files
const OPINIONS_FILE = path.join(__dirname, '..', 'opinions-archive.json');
const RANKINGS_FILE = path.join(__dirname, '..', 'rankings-archive.json');

let opinionsCache: Opinion[] = [];
let rankingsCache: RankingsSnapshot[] = [];

// Load opinions from file
const loadOpinions = (): Opinion[] => {
  try {
    if (fs.existsSync(OPINIONS_FILE)) {
      const data = fs.readFileSync(OPINIONS_FILE, 'utf-8');
      opinionsCache = JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load opinions archive:', error);
  }
  return opinionsCache;
};

// Save opinions to file
const saveOpinions = (): void => {
  try {
    fs.writeFileSync(OPINIONS_FILE, JSON.stringify(opinionsCache, null, 2));
  } catch (error) {
    console.error('Failed to save opinions archive:', error);
  }
};

// Load rankings snapshots from file
const loadRankings = (): RankingsSnapshot[] => {
  try {
    if (fs.existsSync(RANKINGS_FILE)) {
      const data = fs.readFileSync(RANKINGS_FILE, 'utf-8');
      rankingsCache = JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load rankings archive:', error);
  }
  return rankingsCache;
};

// Save rankings snapshots to file
const saveRankings = (): void => {
  try {
    fs.writeFileSync(RANKINGS_FILE, JSON.stringify(rankingsCache, null, 2));
  } catch (error) {
    console.error('Failed to save rankings archive:', error);
  }
};

// Initialize on startup
loadOpinions();
loadRankings();

/**
 * @openapi
 * /api/archive/opinions:
 *   get:
 *     tags: [Archive]
 *     summary: Get archived opinions
 *     description: Returns all archived opinions sorted by creation date (newest first)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of opinions to return
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [random, build, all]
 *           default: all
 *         description: Filter by opinion type
 *     responses:
 *       200:
 *         description: Opinions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 opinions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       text:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [random, build]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 */
router.get('/archive/opinions', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const typeFilter = req.query.type as string || 'all';

  let opinions = loadOpinions();

  // Filter by type if specified
  if (typeFilter !== 'all') {
    opinions = opinions.filter(o => o.type === typeFilter);
  }

  // Sort by createdAt descending and limit
  const sorted = opinions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  res.json({
    opinions: sorted,
    total: opinions.length
  });
});

/**
 * @openapi
 * /api/archive/opinions:
 *   post:
 *     tags: [Archive]
 *     summary: Save an opinion to the archive
 *     description: Archives an opinion (random or build opinion)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - type
 *             properties:
 *               text:
 *                 type: string
 *                 description: The opinion text
 *               type:
 *                 type: string
 *                 enum: [random, build]
 *                 description: Type of opinion
 *     responses:
 *       201:
 *         description: Opinion archived successfully
 */
router.post('/archive/opinions', (req: Request, res: Response) => {
  const { text, type } = req.body;

  if (!text || !type || (type !== 'random' && type !== 'build')) {
    return res.status(400).json({
      error: 'Missing or invalid fields: text (required), type (required: random or build)'
    });
  }

  const opinion: Opinion = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text,
    type,
    createdAt: new Date().toISOString()
  };

  opinionsCache.push(opinion);
  saveOpinions();

  // Keep only the last 100 opinions to prevent file bloat
  if (opinionsCache.length > 100) {
    opinionsCache = opinionsCache
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 100);
    saveOpinions();
  }

  res.status(201).json(opinion);
});

/**
 * @openapi
 * /api/archive/rankings:
 *   get:
 *     tags: [Archive]
 *     summary: Get archived rankings snapshots
 *     description: Returns all archived rankings snapshots sorted by timestamp (newest first)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Maximum number of snapshots to return
 *     responses:
 *       200:
 *         description: Rankings snapshots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 snapshots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       rankings:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             avatar:
 *                               type: string
 *                             name:
 *                               type: string
 *                             score:
 *                               type: integer
 *                             isCurrentUser:
 *                               type: boolean
 *                 total:
 *                   type: integer
 */
router.get('/archive/rankings', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 30;

  const snapshots = loadRankings();

  // Sort by timestamp descending and limit
  const sorted = snapshots
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  res.json({
    snapshots: sorted,
    total: snapshots.length
  });
});

/**
 * @openapi
 * /api/archive/rankings:
 *   post:
 *     tags: [Archive]
 *     summary: Save a rankings snapshot to the archive
 *     description: Archives a current rankings snapshot
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rankings
 *             properties:
 *               rankings:
 *                 type: array
 *                 description: Current leaderboard rankings
 *                 items:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       type: string
 *                     name:
 *                       type: string
 *                     score:
 *                       type: integer
 *                     isCurrentUser:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Rankings snapshot archived successfully
 */
router.post('/archive/rankings', (req: Request, res: Response) => {
  const { rankings } = req.body;

  if (!rankings || !Array.isArray(rankings)) {
    return res.status(400).json({
      error: 'Missing or invalid field: rankings (required array)'
    });
  }

  const snapshot: RankingsSnapshot = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    rankings: rankings.map((r: any) => ({
      avatar: r.avatar || '',
      name: r.name || 'Unknown',
      score: r.score || 0,
      isCurrentUser: r.isCurrentUser || false
    }))
  };

  rankingsCache.push(snapshot);
  saveRankings();

  // Keep only the last 50 snapshots to prevent file bloat
  if (rankingsCache.length > 50) {
    rankingsCache = rankingsCache
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
    saveRankings();
  }

  res.status(201).json(snapshot);
});

/**
 * @openapi
 * /api/archive/stats:
 *   get:
 *     tags: [Archive]
 *     summary: Get archive statistics
 *     description: Returns statistics about archived data
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 opinions:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     random:
 *                       type: integer
 *                     build:
 *                       type: integer
 *                 rankings:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 */
router.get('/archive/stats', (req: Request, res: Response) => {
  const opinions = loadOpinions();
  const rankings = loadRankings();

  res.json({
    opinions: {
      total: opinions.length,
      random: opinions.filter(o => o.type === 'random').length,
      build: opinions.filter(o => o.type === 'build').length
    },
    rankings: {
      total: rankings.length
    }
  });
});

export default router;
