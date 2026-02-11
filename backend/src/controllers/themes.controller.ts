import { Router, Request, Response } from 'express';
import { validateTokenAndGetUser } from '../users';
import {
  getThemePreferences,
  saveThemePreferences,
  getThemePresets,
  getThemePreset,
  getOrCreateDefaultThemePreferences,
  validateThemeColors
} from '../services/theme.service';

const router = Router();

/**
 * Helper to extract user from JWT token
 */
async function getUserFromToken(req: Request): Promise<{ user: any; session: any } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return validateTokenAndGetUser(token);
}

/**
 * Helper to require authentication
 */
async function requireAuth(req: Request, res: Response): Promise<{ user: any; session: any } | null> {
  const result = await getUserFromToken(req);
  if (!result) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Please authenticate to access this resource'
    });
    return null;
  }
  return result;
}

/**
 * @openapi
 * /api/themes:
 *   get:
 *     tags: [Themes]
 *     summary: Get my theme preferences
 *     description: Returns the authenticated user's theme preferences. Creates default preferences if none exist.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Theme preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     theme_name:
 *                       type: string
 *                       example: "dark"
 *                     primary_color:
 *                       type: string
 *                       example: "#ec4899"
 *                     secondary_color:
 *                       type: string
 *                       example: "#8b5cf6"
 *                     background_color:
 *                       type: string
 *                       example: "#1a1a2e"
 *                     text_color:
 *                       type: string
 *                       example: "#ffffff"
 *                     accent_color:
 *                       type: string
 *                       example: "#f97316"
 *                     custom_settings:
 *                       type: object
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req: Request, res: Response) => {
  const authResult = await requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;

  try {
    const preferences = await getOrCreateDefaultThemePreferences(user.id);

    // Parse custom_settings JSON if present
    const responseData = {
      ...preferences,
      custom_settings: preferences.custom_settings ? JSON.parse(preferences.custom_settings) : null
    };

    res.json({ preferences: responseData });
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @openapi
 * /api/themes:
 *   put:
 *     tags: [Themes]
 *     summary: Update theme preferences
 *     description: Creates or updates the authenticated user's theme preferences
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme_name:
 *                 type: string
 *                 enum: [dark, light, sunset, ocean, forest, neon, custom]
 *                 example: "dark"
 *               primary_color:
 *                 type: string
 *                 pattern: "^#[A-Fa-f0-9]{6}$"
 *                 example: "#ec4899"
 *               secondary_color:
 *                 type: string
 *                 pattern: "^#[A-Fa-f0-9]{6}$"
 *                 example: "#8b5cf6"
 *               background_color:
 *                 type: string
 *                 pattern: "^#[A-Fa-f0-9]{6}$"
 *                 example: "#1a1a2e"
 *               text_color:
 *                 type: string
 *                 pattern: "^#[A-Fa-f0-9]{6}$"
 *                 example: "#ffffff"
 *               accent_color:
 *                 type: string
 *                 pattern: "^#[A-Fa-f0-9]{6}$"
 *                 example: "#f97316"
 *               custom_settings:
 *                 type: object
 *                 nullable: true
 *                 example: {"darkMode": true, "highContrast": false}
 *     responses:
 *       200:
 *         description: Theme preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferences:
 *                   type: object
 *       400:
 *         description: Bad request (invalid colors)
 *       401:
 *         description: Unauthorized
 */
router.put('/', async (req: Request, res: Response) => {
  const authResult = await requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;
  const preferencesData = req.body;

  // Validate colors before saving
  const validation = validateThemeColors(preferencesData);
  if (!validation.valid) {
    return res.status(400).json({
      error: 'Bad request',
      message: validation.errors.join('; ')
    });
  }

  try {
    const updatedPreferences = await saveThemePreferences(user.id, preferencesData);

    // Parse custom_settings JSON if present
    const responseData = {
      ...updatedPreferences,
      custom_settings: updatedPreferences.custom_settings ? JSON.parse(updatedPreferences.custom_settings) : null
    };

    res.json({ preferences: responseData });
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @openapi
 * /api/themes/presets:
 *   get:
 *     tags: [Themes]
 *     summary: List available theme presets
 *     description: Returns all available theme presets that can be applied
 *     responses:
 *       200:
 *         description: Theme presets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 presets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       label:
 *                         type: string
 *                       primary_color:
 *                         type: string
 *                       secondary_color:
 *                         type: string
 *                       background_color:
 *                         type: string
 *                       text_color:
 *                         type: string
 *                       accent_color:
 *                         type: string
 */
router.get('/presets', async (req: Request, res: Response) => {
  try {
    const presets = getThemePresets();
    res.json({ presets });
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @openapi
 * /api/themes/presets/{name}:
 *   get:
 *     tags: [Themes]
 *     summary: Get specific theme preset
 *     description: Returns a specific theme preset by name
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Preset name (dark, light, sunset, ocean, forest, neon)
 *     responses:
 *       200:
 *         description: Theme preset retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preset:
 *                   type: object
 *       404:
 *         description: Preset not found
 */
router.get('/presets/:name', async (req: Request, res: Response) => {
  const presetName = req.params.name;
  const preset = getThemePreset(presetName);

  if (!preset) {
    return res.status(404).json({
      error: 'Not found',
      message: `Theme preset "${presetName}" not found`
    });
  }

  res.json({ preset });
});

export default router;
