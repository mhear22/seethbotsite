import { Router, Request, Response } from 'express';
import { sanitizeBody, validations, handleValidationErrors } from '../middleware';

const router = Router();

// Mock phrenology properties (baseless/fun attributes)
const phrenologyProperties = [
  { name: 'Cranial Bumpiness', value: () => (Math.random() * 10).toFixed(1) + '/10' },
  { name: 'Astral Compatibility', value: () => ['High', 'Medium', 'Low', 'Cosmic'][Math.floor(Math.random() * 4)] },
  { name: 'Vibe Alignment', value: () => ['Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Balanced'][Math.floor(Math.random() * 4)] },
  { name: 'Aura Color', value: () => ['Royal Blue', 'Fuchsia', 'Chartreuse', 'Mint', 'Lavender'][Math.floor(Math.random() * 5)] },
  { name: 'Destiny Score', value: () => (Math.random() * 100).toFixed(0) + '%' },
  { name: 'Soul Type', value: () => ['Old', 'Young', 'Ancient', 'Newborn'][Math.floor(Math.random() * 4)] },
  { name: 'Luck Coefficient', value: () => (Math.random() * 2 - 1).toFixed(2) },
  { name: 'Zodiac Override', value: () => ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'][Math.floor(Math.random() * 12)] },
  { name: 'Fortune Level', value: () => ['Blessed', 'Average', 'Challenged', 'Transcendent'][Math.floor(Math.random() * 4)] },
  { name: 'Spirit Animal', value: () => ['Phoenix', 'Wolf', 'Otter', 'Owl', 'Dolphin', 'Eagle', 'Bear'][Math.floor(Math.random() * 7)] }
];

/**
 * Fetch data from genderize.io API
 */
async function fetchGender(name: string) {
  try {
    const response = await fetch(`https://api.genderize.io?name=${encodeURIComponent(name)}`);
    const data = await response.json() as any;
    return {
      gender: data.gender || 'unknown',
      probability: data.probability || 0,
      count: data.count || 0
    };
  } catch (error) {
    console.error('Error fetching gender:', error);
    return { gender: 'unknown', probability: 0, count: 0 };
  }
}

/**
 * Fetch data from agify.io API
 */
async function fetchAge(name: string) {
  try {
    const response = await fetch(`https://api.agify.io?name=${encodeURIComponent(name)}`);
    const data = await response.json() as any;
    return {
      age: data.age || null,
      count: data.count || 0
    };
  } catch (error) {
    console.error('Error fetching age:', error);
    return { age: null, count: 0 };
  }
}

/**
 * Fetch data from nationalize.io API
 */
async function fetchNationality(name: string) {
  try {
    const response = await fetch(`https://api.nationalize.io?name=${encodeURIComponent(name)}`);
    const data = await response.json() as any;
    return {
      countries: data.country || [],
      count: data.count || 0
    };
  } catch (error) {
    console.error('Error fetching nationality:', error);
    return { countries: [], count: 0 };
  }
}

/**
 * Get 2 random phrenology properties
 */
function getRandomPhrenologyProperties(count: number = 2) {
  const shuffled = [...phrenologyProperties].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(prop => ({
    name: prop.name,
    value: prop.value()
  }));
}

/**
 * @openapi
 * /api/phrenology:
 *   post:
 *     tags: [Phrenology]
 *     summary: Predict properties from name (phrenology)
 *     description: Uses genderize.io, agify.io, and nationalize.io APIs to predict gender, age, and nationality from a given name. Also includes 2 baselessly attributed random properties.
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
 *     responses:
 *       200:
 *         description: Phrenology prediction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: Emily
 *                 gender:
 *                   type: string
 *                   enum: [male, female, unknown]
 *                   example: female
 *                 genderProbability:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 1
 *                   example: 0.99
 *                 genderCount:
 *                   type: integer
 *                   example: 12345
 *                 age:
 *                   type: integer
 *                   nullable: true
 *                   example: 28
 *                 ageCount:
 *                   type: integer
 *                   example: 5432
 *                 nationalities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       country_id:
 *                         type: string
 *                         example: US
 *                       probability:
 *                         type: number
 *                         example: 0.5
 *                 nationalityCount:
 *                   type: integer
 *                   example: 321
 *                 phrenology:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Cranial Bumpiness
 *                       value:
 *                         type: string
 *                         example: 7.5/10
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/phrenology',
  validations.detectGender,
  handleValidationErrors,
  sanitizeBody(['name']),
  async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Fetch data from all APIs in parallel
      const [genderData, ageData, nationalityData] = await Promise.all([
        fetchGender(name),
        fetchAge(name),
        fetchNationality(name)
      ]);

      // Get 2 random phrenology properties
      const phrenologyProps = getRandomPhrenologyProperties(2);

      res.json({
        name: name,
        gender: genderData.gender,
        genderProbability: genderData.probability,
        genderCount: genderData.count,
        age: ageData.age,
        ageCount: ageData.count,
        nationalities: nationalityData.countries.slice(0, 3), // Top 3 countries
        nationalityCount: nationalityData.count,
        phrenology: phrenologyProps
      });
    } catch (error) {
      console.error('Error in phrenology prediction:', error);
      res.status(500).json({ error: 'Failed to predict phrenology properties' });
    }
  }
);

/**
 * @openapi
 * /api/gender:
 *   post:
 *     tags: [Gender]
 *     summary: Detect gender from name (deprecated)
 *     description: Attempts to detect gender from a given name. This endpoint is deprecated in favor of /api/phrenology.
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
  async (req: Request, res: Response) => {
    try {
      const { name, country } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Use the new genderize.io API
      const genderData = await fetchGender(name);

      res.json({
        gender: genderData.gender === 'unknown' ? 'not_found' : genderData.gender,
        probability: genderData.probability,
        name: name,
        country: country || 0
      });
    } catch (error) {
      console.error('Error detecting gender:', error);
      res.status(500).json({ error: 'Failed to detect gender' });
    }
  }
);

export default router;
