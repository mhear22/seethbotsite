import { Router, Request, Response } from 'express';
import {
  linkDiscordAccount,
  unlinkDiscordAccount,
  getUserByDiscordId
} from '../users';
import { requireAuth } from '../middleware/auth';
import {
  getDiscordAuthUrl,
  exchangeCodeForToken,
  getDiscordUser,
  getDiscordAvatarUrl,
  generateStateToken,
  isDiscordConfigured
} from '../utils/discord';

const router = Router();

/**
 * In-memory state storage for OAuth flow
 * In production, this should be stored in Redis or a database
 * with proper TTL expiration
 */
const stateStore = new Map<string, { userId: number; expiresAt: number }>();

/**
 * Clean up expired states
 */
function cleanupExpiredStates() {
  const now = Date.now();
  for (const [state, data] of stateStore.entries()) {
    if (data.expiresAt < now) {
      stateStore.delete(state);
    }
  }
}

// Clean up expired states every 5 minutes
setInterval(cleanupExpiredStates, 5 * 60 * 1000);

/**
 * @openapi
 * /api/discord/configured:
 *   get:
 *     tags: [Discord]
 *     summary: Check if Discord integration is configured
 *     description: Returns whether Discord OAuth credentials are properly configured.
 *     responses:
 *       200:
 *         description: Configuration status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 configured:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get('/discord/configured', (req: Request, res: Response) => {
  const configured = isDiscordConfigured();
  res.json({
    configured,
    message: configured ? 'Discord integration is configured' : 'Discord integration is not configured'
  });
});

/**
 * @openapi
 * /api/discord/link/start:
 *   get:
 *     tags: [Discord]
 *     summary: Start Discord account linking
 *     description: Generates a Discord OAuth authorization URL for linking accounts. Requires JWT token.
 *     responses:
 *       200:
 *         description: Authorization URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authorizationUrl:
 *                   type: string
 *                   description: URL to redirect user to for Discord authorization
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Discord not configured
 */
router.get('/discord/link/start', requireAuth, (req: Request, res: Response) => {
  try {
    if (!isDiscordConfigured()) {
      return res.status(500).json({
        error: 'Discord integration not configured',
        message: 'Please set DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, and DISCORD_CALLBACK_URL environment variables'
      });
    }

    // Generate state token
    const state = generateStateToken();

    // Store state with user ID (expires in 10 minutes)
    stateStore.set(state, {
      userId: req.user!.id,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Generate authorization URL
    const authorizationUrl = getDiscordAuthUrl(state);

    res.json({
      success: true,
      authorizationUrl,
      state
    });
  } catch (error: any) {
    console.error('Error starting Discord link:', error);
    res.status(500).json({ error: 'Failed to start Discord linking process' });
  }
});

/**
 * @openapi
 * /api/discord/callback:
 *   get:
 *     tags: [Discord]
 *     summary: Discord OAuth callback
 *     description: Handles the OAuth callback from Discord. Links the Discord account to the user.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth authorization code from Discord
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *       - in: query
 *         name: error
 *         required: false
 *         schema:
 *           type: string
 *         description: Error code if authorization was denied
 *     responses:
 *       200:
 *         description: Discord account linked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     discord_id:
 *                       type: string
 *                     discord_username:
 *                       type: string
 *       400:
 *         description: Invalid state or authorization error
 *       500:
 *         description: Failed to link Discord account
 */
router.get('/discord/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    // Check for authorization error
    if (error) {
      return res.status(400).json({
        error: 'Authorization denied',
        message: `Discord authorization failed: ${error}`
      });
    }

    // Validate state
    if (!state || typeof state !== 'string') {
      return res.status(400).json({
        error: 'Invalid state',
        message: 'State parameter is missing'
      });
    }

    // Get stored state data
    const stateData = stateStore.get(state);
    if (!stateData) {
      return res.status(400).json({
        error: 'Invalid state',
        message: 'State has expired or is invalid'
      });
    }

    // Clean up used state
    stateStore.delete(state);

    // Check if state has expired
    if (Date.now() > stateData.expiresAt) {
      return res.status(400).json({
        error: 'Expired state',
        message: 'Authorization session has expired'
      });
    }

    // Validate authorization code
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Invalid authorization code',
        message: 'Authorization code is required'
      });
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Get Discord user information
    const discordUser = await getDiscordUser(tokenData.access_token);

    // Link Discord account to user
    const user = await linkDiscordAccount(stateData.userId, {
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar
    });

    res.json({
      success: true,
      message: 'Discord account linked successfully',
      user: {
        id: user.id,
        discord_id: user.discord_id,
        discord_username: user.discord_username,
        discord_discriminator: user.discord_discriminator,
        discord_avatar: user.discord_avatar
      }
    });
  } catch (error: any) {
    console.error('Error in Discord callback:', error);

    if (error.message === 'This Discord account is already linked to another user') {
      return res.status(400).json({
        error: 'Account already linked',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to link Discord account',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * @openapi
 * /api/discord/unlink:
 *   post:
 *     tags: [Discord]
 *     summary: Unlink Discord account
 *     description: Removes the Discord account link from the authenticated user. Requires JWT token.
 *     responses:
 *       200:
 *         description: Discord account unlinked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Not authenticated
 */
router.post('/discord/unlink', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await unlinkDiscordAccount(req.user!.id);

    res.json({
      success: true,
      message: 'Discord account unlinked successfully',
      user: {
        id: user.id,
        discord_id: user.discord_id,
        discord_username: user.discord_username
      }
    });
  } catch (error: any) {
    console.error('Error unlinking Discord account:', error);
    res.status(500).json({ error: 'Failed to unlink Discord account' });
  }
});

/**
 * @openapi
 * /api/discord/avatar:
 *   get:
 *     tags: [Discord]
 *     summary: Get Discord avatar URL
 *     description: Returns the full Discord avatar URL for the authenticated user. Requires JWT token.
 *     responses:
 *       200:
 *         description: Discord avatar URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 avatarUrl:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: Not authenticated or Discord not linked
 */
router.get('/discord/avatar', requireAuth, (req: Request, res: Response) => {
  try {
    const user = req.user!;

    if (!user.discord_id || !user.discord_avatar) {
      return res.status(400).json({
        error: 'Discord not linked',
        message: 'No Discord account linked or no avatar available'
      });
    }

    const avatarUrl = getDiscordAvatarUrl(user.discord_id, user.discord_avatar);

    res.json({
      success: true,
      avatarUrl
    });
  } catch (error: any) {
    console.error('Error getting Discord avatar:', error);
    res.status(500).json({ error: 'Failed to get Discord avatar' });
  }
});

/**
 * @openapi
 * /api/discord/sync-avatar:
 *   post:
 *     tags: [Discord]
 *     summary: Sync Discord avatar to profile
 *     description: Updates the user's profile avatar with their Discord avatar. Requires JWT token.
 *     responses:
 *       200:
 *         description: Avatar synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     avatar_url:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Discord not linked
 */
router.post('/discord/sync-avatar', requireAuth, async (req: Request, res: Response) => {
  try {
    const { updateUserField } = await import('../users');
    const user = req.user!;

    if (!user.discord_id || !user.discord_avatar) {
      return res.status(400).json({
        error: 'Discord not linked',
        message: 'No Discord account linked or no avatar available'
      });
    }

    const avatarUrl = getDiscordAvatarUrl(user.discord_id, user.discord_avatar);

    // Update user's avatar URL
    const updatedUser = updateUserField(user.id, 'avatar_url', avatarUrl);

    res.json({
      success: true,
      message: 'Discord avatar synced to profile',
      user: {
        id: updatedUser.id,
        avatar_url: updatedUser.avatar_url
      }
    });
  } catch (error: any) {
    console.error('Error syncing Discord avatar:', error);
    res.status(500).json({ error: 'Failed to sync Discord avatar' });
  }
});

export default router;
