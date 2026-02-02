import { Router, Request, Response } from 'express';

const router = Router();

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

/**
 * @openapi
 * /api/quote:
 *   get:
 *     tags: [Quotes]
 *     summary: Get a random Northernlion quote
 *     description: Returns a random quote from the Northernlion quote database
 *     responses:
 *       200:
 *         description: Random quote retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quote:
 *                   type: string
 *                   example: "It's gonna be a long one."
 *                 source:
 *                   type: string
 *                   example: northernlion-db
 *                 index:
 *                   type: integer
 *                   example: 5
 *                 totalQuotes:
 *                   type: integer
 *                   example: 48
 */
router.get('/quote', async (req: Request, res: Response) => {
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

export default router;
