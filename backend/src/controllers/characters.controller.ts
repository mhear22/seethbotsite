import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @openapi
 * /api/characters:
 *   get:
 *     tags: [Characters]
 *     summary: Get all characters sorted by ELO rating
 *     responses:
 *       200:
 *         description: List of all characters
 */
router.get('/characters', async (req: Request, res: Response) => {
  try {
    const characters = await prisma.character.findMany({
      where: { is_deleted: false },
      orderBy: { elo_rating: 'desc' }
    });

    res.json({ characters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

/**
 * @openapi
 * /api/characters/random-pair:
 *   get:
 *     tags: [Characters]
 *     summary: Get two random characters for comparison
 *     responses:
 *       200:
 *         description: Two random characters
 */
router.get('/characters/random-pair', async (req: Request, res: Response) => {
  try {
    // Get all character IDs
    const allIds = await prisma.character.findMany({
      where: { is_deleted: false },
      select: { id: true }
    });

    if (allIds.length < 2) {
      return res.json({ characters: [] });
    }

    // Get two random distinct IDs
    const shuffled = allIds.sort(() => Math.random() - 0.5);
    const pairIds = [shuffled[0].id, shuffled[1].id];

    // Fetch the two characters
    const characters = await prisma.character.findMany({
      where: {
        id: { in: pairIds },
        is_deleted: false
      }
    });

    res.json({ characters });
  } catch (error) {
    console.error('Error fetching random pair:', error);
    res.status(500).json({ error: 'Failed to fetch random pair' });
  }
});

/**
 * @openapi
 * /api/characters:
 *   post:
 *     tags: [Characters]
 *     summary: Create a new character
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Character created successfully
 */
router.post('/characters', async (req: Request, res: Response) => {
  try {
    const { name, image_url } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newCharacter = await prisma.character.create({
      data: {
        name: name.trim(),
        image_url: image_url || null
      }
    });

    res.status(201).json({ character: newCharacter });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

/**
 * @openapi
 * /api/characters/vote:
 *   post:
 *     tags: [Characters]
 *     summary: Vote for a character and update ELO ratings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [winner_id, loser_id]
 *             properties:
 *               winner_id:
 *                 type: integer
 *               loser_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: ELO ratings updated successfully
 */
router.post('/characters/vote', async (req: Request, res: Response) => {
  try {
    const { winner_id, loser_id } = req.body;

    if (!winner_id || !loser_id) {
      return res.status(400).json({ error: 'Both winner_id and loser_id are required' });
    }

    if (winner_id === loser_id) {
      return res.status(400).json({ error: 'Winner and loser must be different characters' });
    }

    // Get current ELO ratings
    const winner = await prisma.character.findFirst({
      where: { id: Number(winner_id), is_deleted: false }
    });
    const loser = await prisma.character.findFirst({
      where: { id: Number(loser_id), is_deleted: false }
    });

    if (!winner || !loser) {
      return res.status(404).json({ error: 'One or both characters not found' });
    }

    // Calculate ELO rating (K-factor of 32 for new ratings)
    const K = 32;
    const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo_rating - winner.elo_rating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winner.elo_rating - loser.elo_rating) / 400));

    const newWinnerElo = Math.round(winner.elo_rating + K * (1 - expectedWinner));
    const newLoserElo = Math.round(loser.elo_rating + K * (0 - expectedLoser));

    // Update both characters
    const [updatedWinner, updatedLoser] = await prisma.$transaction([
      prisma.character.update({
        where: { id: winner.id },
        data: {
          elo_rating: newWinnerElo,
          wins: { increment: 1 },
          updated_at: new Date()
        }
      }),
      prisma.character.update({
        where: { id: loser.id },
        data: {
          elo_rating: newLoserElo,
          losses: { increment: 1 },
          updated_at: new Date()
        }
      })
    ]);

    // Record the match
    await prisma.characterMatch.create({
      data: {
        character_id: winner.id,
        opponent_id: loser.id,
        winner_id: winner.id,
        voter_id: req.body.voter_id || 0
      }
    });

    res.json({
      winner: updatedWinner,
      loser: updatedLoser,
      elo_change_winner: newWinnerElo - winner.elo_rating,
      elo_change_loser: newLoserElo - loser.elo_rating
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

/**
 * @openapi
 * /api/characters/{id}:
 *   delete:
 *     tags: [Characters]
 *     summary: Delete a character
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Character deleted successfully
 */
router.delete('/characters/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.character.update({
      where: { id: Number(id) },
      data: {
        is_deleted: true,
        updated_at: new Date()
      }
    });

    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

export default router;
