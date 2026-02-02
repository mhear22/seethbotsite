import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @openapi
 * /api/rankings:
 *   get:
 *     tags: [Rankings]
 *     summary: Get user rankings and leaderboard
 *     description: Returns the current leaderboard with user rankings sorted by score
 *     responses:
 *       200:
 *         description: User rankings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rankings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       avatar:
 *                         type: string
 *                         example: 🥔
 *                       name:
 *                         type: string
 *                         example: Cam
 *                       score:
 *                         type: integer
 *                         example: 10000
 *                       isCurrentUser:
 *                         type: boolean
 *                         example: false
 */
router.get('/rankings', (req: Request, res: Response) => {
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

export default router;
