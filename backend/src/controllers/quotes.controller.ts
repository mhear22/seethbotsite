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

// Advice/wisdom collection
const adviceQuotes = [
  "Embrace the chaos, you can't control everything anyway.",
  "Progress is progress, even if it's in the wrong direction.",
  "Trust the process, but also trust your gut.",
  "Sometimes the best strategy is no strategy at all.",
  "Pivot early, pivot often.",
  "Every mistake is just data for the next attempt.",
  "If you're not having fun, you're doing it wrong.",
  "The RNG giveth, and the RNG taketh away.",
  "Regret nothing, it all made you who you are.",
  "That's the game, baby - play it or leave it.",
  "Keep moving forward, even if it's sideways.",
  "Sometimes 'terrible idea' is just 'brave idea' in disguise.",
  "Stay curious, keep asking questions.",
  "You're not the problem, but you can be the solution.",
  "Famous last words are just regular words until they're not.",
  "Embrace the vibe, it's yours.",
  "Professional streamer, serious business, but don't forget to play.",
  "That's the spirit - keep it alive.",
  "The content people want is the content you make with heart.",
  "Never gonna happen until you make it happen."
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
      totalQuotes: northernlionQuotes.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating quote:', error);
    // Fallback quote
    res.json({
      quote: 'Stay curious, keep asking questions.',
      source: 'fallback',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @openapi
 * /api/advice:
 *   get:
 *     tags: [Quotes]
 *     summary: Get random advice
 *     description: Returns a random piece of advice from the adviceslip.com API (ticket #52)
 *     responses:
 *       200:
 *         description: Advice retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 advice:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     advice:
 *                       type: string
 *                 source:
 *                   type: string
 *                   example: adviceslip-api
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/advice', async (req: Request, res: Response) => {
  try {
    // Fetch advice from adviceslip.com API
    const response = await fetch('https://api.adviceslip.com/advice');
    if (!response.ok) {
      throw new Error(`Advice slip API returned ${response.status}`);
    }
    const data = await response.json() as { slip: { id: string; advice: string } };

    res.json({
      advice: data.slip,
      source: 'adviceslip-api',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching advice from adviceslip.com:', error);
    // Fallback to local advice quotes
    try {
      const randomIndex = Math.floor(Math.random() * adviceQuotes.length);
      const advice = adviceQuotes[randomIndex];

      res.json({
        advice: {
          id: `fallback-${randomIndex}`,
          advice: advice
        },
        source: 'advice-db-fallback',
        index: randomIndex,
        totalAdvice: adviceQuotes.length,
        timestamp: new Date().toISOString()
      });
    } catch (fallbackError) {
      console.error('Error using fallback advice:', fallbackError);
      res.json({
        advice: {
          id: 'fallback-0',
          advice: 'Keep going, you\'re doing better than you think.'
        },
        source: 'final-fallback',
        timestamp: new Date().toISOString()
      });
    }
  }
});

export default router;
