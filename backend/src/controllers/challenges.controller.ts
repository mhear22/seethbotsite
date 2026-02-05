import { Router } from 'express';
import {
  getDailyChallenges,
  completeChallenge,
  updateChallengeProgress,
  type DailyChallenge
} from '../statsDb';

const router = Router();

/**
 * GET /api/challenges
 * Get today's daily challenges for the current user
 */
router.get('/', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const challenges = getDailyChallenges(userId);

    res.json({
      success: true,
      challenges,
      date: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error getting daily challenges:', error);
    res.status(500).json({ error: 'Failed to get daily challenges' });
  }
});

/**
 * POST /api/challenges/:id/complete
 * Complete a challenge (for testing purposes)
 */
router.post('/:id/complete', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const challengeId = parseInt(req.params.id);

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (isNaN(challengeId)) {
      return res.status(400).json({ error: 'Invalid challenge ID' });
    }

    const completed = completeChallenge(userId, challengeId);

    if (completed) {
      res.json({ success: true, message: 'Challenge completed' });
    } else {
      res.status(404).json({ error: 'Challenge not found or already completed' });
    }
  } catch (error) {
    console.error('Error completing challenge:', error);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

/**
 * POST /api/challenges/progress
 * Update challenge progress (called automatically when game stats are recorded)
 */
router.post('/progress', (req, res) => {
  try {
    const { userId, gameType, statType, value } = req.body;

    if (!userId || !gameType || !statType || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    updateChallengeProgress(userId, gameType, statType, value);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({ error: 'Failed to update challenge progress' });
  }
});

export default router;
