import { Router } from 'express';
import {
  getAchievements,
  getAllAchievements,
  checkAchievements,
  getAchievementProgress
} from '../statsDb';

const router = Router();

/**
 * GET /api/achievements
 * Get unlocked achievements for the current user
 */
router.get('/', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const achievements = getAchievements(userId);

    res.json({
      success: true,
      achievements,
      count: achievements.length
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

/**
 * GET /api/achievements/all
 * Get all achievements (both unlocked and locked)
 */
router.get('/all', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const allAchievements = getAllAchievements(userId);

    res.json({
      success: true,
      achievements: allAchievements
    });
  } catch (error) {
    console.error('Error getting all achievements:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

/**
 * GET /api/achievements/progress
 * Get achievement progress for the current user
 */
router.get('/progress', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const progress = getAchievementProgress(userId);

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error getting achievement progress:', error);
    res.status(500).json({ error: 'Failed to get achievement progress' });
  }
});

/**
 * POST /api/achievements/check
 * Check and unlock achievements based on current stats
 * This can be called automatically when stats are recorded
 */
router.post('/check', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const newUnlocks = checkAchievements(userId);

    res.json({
      success: true,
      newUnlocks,
      message: newUnlocks.length > 0
        ? `Unlocked ${newUnlocks.length} new achievement(s)!`
        : 'No new achievements unlocked'
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

export default router;
