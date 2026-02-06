import { Router, Request, Response } from 'express';

const router = Router();

// In-memory analytics storage
interface PageView {
  path: string;
  userId?: string;
  timestamp: number;
}

interface UserSession {
  userId: string;
  lastSeen: number;
}

// Page views storage
const pageViews: PageView[] = [];

// User sessions storage for active user tracking
const userSessions: Map<string, UserSession> = new Map();

// Active user timeout (15 minutes)
const ACTIVE_USER_TIMEOUT = 15 * 60 * 1000;

// Cleanup old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, session] of userSessions.entries()) {
    if (now - session.lastSeen > ACTIVE_USER_TIMEOUT) {
      userSessions.delete(userId);
    }
  }
}, 60000); // Check every minute

/**
 * Record a page view
 */
const recordPageView = (path: string, userId?: string) => {
  const view: PageView = {
    path,
    userId,
    timestamp: Date.now()
  };
  pageViews.push(view);

  // Track user session
  if (userId) {
    userSessions.set(userId, {
      userId,
      lastSeen: Date.now()
    });
  }
};

/**
 * Get total page views (clicks)
 */
const getTotalClicks = (): number => {
  return pageViews.length;
};

/**
 * Get active users (sessions within timeout)
 */
const getActiveUsers = (): number => {
  const now = Date.now();
  let activeCount = 0;

  for (const session of userSessions.values()) {
    if (now - session.lastSeen <= ACTIVE_USER_TIMEOUT) {
      activeCount++;
    }
  }

  return activeCount;
};

/**
 * Get top pages by view count
 */
const getTopPages = (limit: number = 10): Array<{ path: string; views: number }> => {
  const pageCounts = new Map<string, number>();

  for (const view of pageViews) {
    const count = pageCounts.get(view.path) || 0;
    pageCounts.set(view.path, count + 1);
  }

  const sortedPages = Array.from(pageCounts.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  return sortedPages;
};

/**
 * @openapi
 * /api/analytics/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Get analytics summary
 *     description: Returns overall analytics stats including total clicks and active users
 *     responses:
 *       200:
 *         description: Analytics summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalClicks:
 *                   type: integer
 *                   description: Total page views recorded
 *                 activeUsers:
 *                   type: integer
 *                   description: Number of currently active users (within 15 minutes)
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: When the summary was generated
 */
router.get('/analytics/summary', (req: Request, res: Response) => {
  try {
    const summary = {
      totalClicks: getTotalClicks(),
      activeUsers: getActiveUsers(),
      timestamp: new Date().toISOString()
    };

    res.json(summary);
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.status(500).json({ error: 'Failed to get analytics summary' });
  }
});

/**
 * @openapi
 * /api/analytics/top-pages:
 *   get:
 *     tags: [Analytics]
 *     summary: Get top pages by views
 *     description: Returns the most visited pages with their view counts
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of pages to return
 *     responses:
 *       200:
 *         description: Top pages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                         description: The page path
 *                       views:
 *                         type: integer
 *                         description: Number of views for this page
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.get('/analytics/top-pages', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const topPages = getTopPages(limit);

    res.json({
      pages: topPages,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting top pages:', error);
    res.status(500).json({ error: 'Failed to get top pages' });
  }
});

/**
 * @openapi
 * /api/analytics/track:
 *   post:
 *     tags: [Analytics]
 *     summary: Record a page view
 *     description: Records a page view for analytics tracking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *             properties:
 *               path:
 *                 type: string
 *                 description: The page path that was viewed
 *               userId:
 *                 type: string
 *                 description: User ID (optional, for session tracking)
 *     responses:
 *       200:
 *         description: Page view recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/analytics/track', (req: Request, res: Response) => {
  try {
    const { path, userId } = req.body;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'path is required' });
    }

    recordPageView(path, userId);

    res.json({
      success: true,
      message: 'Page view recorded successfully'
    });
  } catch (error) {
    console.error('Error recording page view:', error);
    res.status(500).json({ error: 'Failed to record page view' });
  }
});

// Export functions for use in middleware
export { recordPageView };

export default router;
