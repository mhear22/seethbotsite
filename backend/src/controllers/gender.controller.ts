import { Router, Request, Response } from 'express';
import { sanitizeBody, validations, handleValidationErrors } from '../middleware';

const router = Router();

// Gender detection database (mock implementation)
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

/**
 * @openapi
 * /api/gender:
 *   post:
 *     tags: [Gender]
 *     summary: Detect gender from name
 *     description: Attempts to detect gender from a given name. Text is sanitized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Emily
 *               country:
 *                 type: integer
 *                 minimum: 0
 *                 example: 0
 *                 description: Optional country code
 *     responses:
 *       200:
 *         description: Gender detection result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gender:
 *                   type: string
 *                   enum: [male, female, unisex, not_found]
 *                   example: female
 *                 probability:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 1
 *                   example: 0.99
 *                 name:
 *                   type: string
 *                   example: Emily
 *                 country:
 *                   type: integer
 *                   example: 0
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/gender',
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

export default router;
