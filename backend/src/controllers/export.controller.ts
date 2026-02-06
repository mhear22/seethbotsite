import { Router, Request, Response } from 'express';
import {
  getLeaderboard,
  getUserStats,
  getStatsHistory
} from '../statsDb';
import { pointsManager } from '../services/points-manager';

const router = Router();

/**
 * Helper function to convert JSON to CSV
 */
function jsonToCsv(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);

  // Create CSV header
  const csvHeader = headers.join(',');

  // Create CSV rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle null/undefined, strings with commas, quotes, or newlines
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [csvHeader, ...csvRows].join('\n');
}

/**
 * @openapi
 * /api/export/rankings:
 *   get:
 *     tags: [Export]
 *     summary: Export rankings data
 *     description: Exports current rankings data in JSON or CSV format
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         required: false
 *         description: Export format (json or csv)
 *     responses:
 *       200:
 *         description: Rankings data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   rank:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   score:
 *                     type: integer
 *                   isCurrentUser:
 *                     type: boolean
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid format parameter
 *       500:
 *         description: Server error
 */
router.get('/rankings', (req: Request, res: Response) => {
  try {
    const { format = 'json' } = req.query;

    if (format !== 'json' && format !== 'csv') {
      return res.status(400).json({ error: 'Invalid format. Must be "json" or "csv"' });
    }

    // Get rankings data
    const leaderboard = pointsManager.getLeaderboard();

    // Format data for export
    const exportData = leaderboard.rankings.map((item: any, index: number) => ({
      rank: index + 1,
      name: item.name,
      avatar: item.avatar,
      score: item.score,
      isCurrentUser: item.isCurrentUser
    }));

    // Set appropriate headers and send response
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `rankings_${timestamp}`;

    if (format === 'csv') {
      const csv = jsonToCsv(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting rankings:', error);
    res.status(500).json({ error: 'Failed to export rankings' });
  }
});

/**
 * @openapi
 * /api/export/stats:
 *   post:
 *     tags: [Export]
 *     summary: Export user stats data
 *     description: Exports user statistics data in JSON or CSV format
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               gameType:
 *                 type: string
 *                 enum: [clicker, fishing]
 *                 description: Game type filter (optional)
 *     responses:
 *       200:
 *         description: Stats data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/stats', (req: Request, res: Response) => {
  try {
    const { userId, gameType, format = 'json' } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (format !== 'json' && format !== 'csv') {
      return res.status(400).json({ error: 'Invalid format. Must be "json" or "csv"' });
    }

    // Get user stats
    const stats = getUserStats({ userId, gameType });

    // Format data for export
    const exportData = {
      userId,
      gameType: gameType || 'all',
      exportedAt: new Date().toISOString(),
      totalClicks: stats.totalClicks,
      totalFishCaught: stats.totalFishCaught,
      highScore: stats.highScore,
      totalSessions: stats.totalSessions
    };

    // Set appropriate headers and send response
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `stats_${userId}_${timestamp}`;

    if (format === 'csv') {
      // Convert object to array for CSV
      const csvData = [exportData];
      const csv = jsonToCsv(csvData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting stats:', error);
    res.status(500).json({ error: 'Failed to export stats' });
  }
});

/**
 * @openapi
 * /api/export/clicks:
 *   post:
 *     tags: [Export]
 *     summary: Export clicks stats history
 *     description: Exports click statistics history in JSON or CSV format
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               limit:
 *                 type: integer
 *                 default: 100
 *                 description: Maximum number of records to export
 *               format:
 *                 type: string
 *                 enum: [json, csv]
 *                 default: json
 *     responses:
 *       200:
 *         description: Clicks data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/clicks', (req: Request, res: Response) => {
  try {
    const { userId, limit = 100, format = 'json' } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (format !== 'json' && format !== 'csv') {
      return res.status(400).json({ error: 'Invalid format. Must be "json" or "csv"' });
    }

    // Get click stats history
    const history = getStatsHistory({
      userId,
      gameType: 'clicker',
      statType: 'click',
      limit
    });

    // Format data for export
    const exportData = history.map(row => ({
      id: row.id,
      userId: row.user_id,
      gameType: row.game_type,
      statType: row.stat_type,
      value: row.value,
      recordedAt: row.recorded_at
    }));

    // Set appropriate headers and send response
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `clicks_${userId}_${timestamp}`;

    if (format === 'csv') {
      const csv = jsonToCsv(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting clicks:', error);
    res.status(500).json({ error: 'Failed to export clicks' });
  }
});

/**
 * @openapi
 * /api/export/history:
 *   post:
 *     tags: [Export]
 *     summary: Export full stats history
 *     description: Exports complete statistics history in JSON or CSV format
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               gameType:
 *                 type: string
 *                 enum: [clicker, fishing]
 *                 description: Game type filter (optional)
 *               statType:
 *                 type: string
 *                 description: Stat type filter (optional)
 *               limit:
 *                 type: integer
 *                 default: 500
 *                 description: Maximum number of records to export
 *               format:
 *                 type: string
 *                 enum: [json, csv]
 *                 default: json
 *     responses:
 *       200:
 *         description: History data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/history', (req: Request, res: Response) => {
  try {
    const { userId, gameType, statType, limit = 500, format = 'json' } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (format !== 'json' && format !== 'csv') {
      return res.status(400).json({ error: 'Invalid format. Must be "json" or "csv"' });
    }

    // Get stats history
    const history = getStatsHistory({
      userId,
      gameType,
      statType,
      limit
    });

    // Format data for export
    const exportData = history.map(row => ({
      id: row.id,
      userId: row.user_id,
      gameType: row.game_type,
      statType: row.stat_type,
      value: row.value,
      metadata: row.metadata ? JSON.stringify(row.metadata) : null,
      recordedAt: row.recorded_at
    }));

    // Set appropriate headers and send response
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `history_${userId}_${timestamp}`;

    if (format === 'csv') {
      const csv = jsonToCsv(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting history:', error);
    res.status(500).json({ error: 'Failed to export history' });
  }
});

/**
 * @openapi
 * /api/export/leaderboard:
 *   post:
 *     tags: [Export]
 *     summary: Export leaderboard data
 *     description: Exports game leaderboard in JSON or CSV format
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameType
 *             properties:
 *               gameType:
 *                 type: string
 *                 enum: [clicker, fishing]
 *               limit:
 *                 type: integer
 *                 default: 50
 *               format:
 *                 type: string
 *                 enum: [json, csv]
 *                 default: json
 *     responses:
 *       200:
 *         description: Leaderboard data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/leaderboard', (req: Request, res: Response) => {
  try {
    const { gameType, limit = 50, format = 'json' } = req.body;

    if (!gameType || !['clicker', 'fishing'].includes(gameType)) {
      return res.status(400).json({ error: 'Invalid gameType. Must be "clicker" or "fishing"' });
    }

    if (format !== 'json' && format !== 'csv') {
      return res.status(400).json({ error: 'Invalid format. Must be "json" or "csv"' });
    }

    // Get leaderboard
    const leaderboard = getLeaderboard({ gameType, limit });

    // Format data for export
    const exportData = leaderboard.map(entry => ({
      rank: entry.rank,
      userId: entry.userId,
      userName: entry.userName,
      gameType: entry.gameType,
      score: entry.score,
      recordedAt: entry.recordedAt,
      updatedAt: entry.updatedAt
    }));

    // Set appropriate headers and send response
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `leaderboard_${gameType}_${timestamp}`;

    if (format === 'csv') {
      const csv = jsonToCsv(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting leaderboard:', error);
    res.status(500).json({ error: 'Failed to export leaderboard' });
  }
});

export default router;
