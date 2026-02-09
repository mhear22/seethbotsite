import { Router, Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  validateTokenAndGetUser,
  logoutUser,
  getUserSessions,
  deleteSession,
  deleteAllSessions,
  updateUserField,
  updateUserPrivacy,
  getUserById,
  changeUserPassword,
  deleteUserAccount,
  refreshToken,
  getUserThemePreferences,
  updateUserThemePreferences
} from '../users';
import { extractApiKey } from '../auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Creates a new user account with email and password. Returns user info and JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: User's password (minimum 8 characters)
 *               displayName:
 *                 type: string
 *                 description: Optional display name
 *               deviceName:
 *                 type: string
 *                 description: Device name for session tracking
 *               deviceType:
 *                 type: string
 *                 description: Device type (e.g., mobile, desktop, tablet)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     display_name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Bad request - invalid input or email already registered
 */
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName, deviceName, deviceType } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Register user
    const result = await registerUser(email, password, displayName);

    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    if (error.message === 'Email already registered') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login with email and password
 *     description: Authenticates a user and returns user info with JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               deviceName:
 *                 type: string
 *                 description: Device name for session tracking
 *               deviceType:
 *                 type: string
 *                 description: Device type (e.g., mobile, desktop, tablet)
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     display_name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, deviceName, deviceType } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Login user
    const result = await loginUser(email, password, deviceName, deviceType);

    res.json({ success: true, ...result });
  } catch (error: any) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Get a new JWT token using an existing valid token. Useful for extending sessions without re-login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Current valid JWT token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     display_name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: New JWT authentication token
 *       401:
 *         description: Invalid or expired token
 */
router.post('/auth/refresh', (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Refresh token
    const newToken = refreshToken(token);

    if (!newToken) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Validate new token to get user info
    const result = validateTokenAndGetUser(newToken);

    if (!result) {
      return res.status(500).json({ error: 'Failed to create session' });
    }

    res.json({ success: true, user: result.user, token: newToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user info
 *     description: Returns the authenticated user's information. Requires JWT token.
 *     responses:
 *       200:
 *         description: User info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     display_name:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                 session:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     device_name:
 *                       type: string
 *                     device_type:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     last_used_at:
 *                       type: string
 *       401:
 *         description: Not authenticated
 */
router.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  try {
    res.json({ user: req.user, session: req.session });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout current session
 *     description: Invalidates the current JWT token. Requires JWT token.
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */
router.post('/auth/logout', requireAuth, (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization!.substring(7);
    const success = logoutUser(token);

    if (success) {
      res.json({ message: 'Logged out successfully' });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

/**
 * @openapi
 * /api/auth/sessions:
 *   get:
 *     tags: [Authentication]
 *     summary: Get all sessions for current user
 *     description: Returns all active sessions for the authenticated user. Requires JWT token.
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       device_name:
 *                         type: string
 *                       device_type:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                       last_used_at:
 *                         type: string
 *       401:
 *         description: Not authenticated
 */
router.get('/auth/sessions', requireAuth, (req: Request, res: Response) => {
  try {
    const sessions = getUserSessions(req.user!.id);
    res.json({ sessions });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

/**
 * @openapi
 * /api/auth/sessions/{id}:
 *   delete:
 *     tags: [Authentication]
 *     summary: Delete a specific session
 *     description: Logs out from a specific device. Requires JWT token.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Session not found
 */
router.delete('/auth/sessions/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const success = deleteSession(sessionId, req.user!.id);

    if (success) {
      res.json({ message: 'Session deleted successfully' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

/**
 * @openapi
 * /api/auth/sessions/all:
 *   delete:
 *     tags: [Authentication]
 *     summary: Delete all sessions
 *     description: Logs out from all devices. Requires JWT token.
 *     responses:
 *       200:
 *         description: All sessions deleted successfully
 *       401:
 *         description: Not authenticated
 */
router.delete('/auth/sessions/all', requireAuth, (req: Request, res: Response) => {
  try {
    const count = deleteAllSessions(req.user!.id);
    res.json({ message: 'Logged out from all devices', count });
  } catch (error) {
    console.error('Error deleting all sessions:', error);
    res.status(500).json({ error: 'Failed to delete all sessions' });
  }
});

/**
 * @openapi
 * /api/auth/profile:
 *   patch:
 *     tags: [Authentication]
 *     summary: Update user profile
 *     description: Updates the authenticated user's display name. Requires JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Not authenticated
 */
router.patch('/auth/profile', requireAuth, (req: Request, res: Response) => {
  try {
    const { displayName } = req.body;

    if (!displayName || typeof displayName !== 'string') {
      return res.status(400).json({ error: 'Display name is required' });
    }

    const user = updateUserField(req.user!.id, 'display_name', displayName);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * @openapi
 * /api/auth/password:
 *   patch:
 *     tags: [Authentication]
 *     summary: Change user password
 *     description: Changes the authenticated user's password. Requires JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Not authenticated or invalid old password
 */
router.patch('/auth/password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    await changeUserPassword(req.user!.id, oldPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully. Please login again on all devices.' });
  } catch (error: any) {
    if (error.message === 'Invalid current password') {
      return res.status(401).json({ error: error.message });
    }
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

/**
 * @openapi
 * /api/auth/account:
 *   delete:
 *     tags: [Authentication]
 *     summary: Delete user account
 *     description: Permanently deletes the user account. Requires JWT token and password confirmation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Not authenticated or invalid password
 */
router.delete('/auth/account', requireAuth, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    await deleteUserAccount(req.user!.id, password);
    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Invalid password') {
      return res.status(401).json({ error: error.message });
    }
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

/**
 * @openapi
 * /api/auth/avatar:
 *   patch:
 *     tags: [Authentication]
 *     summary: Update user avatar
 *     description: Updates the authenticated user's avatar URL. Requires JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatarUrl:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       401:
 *         description: Not authenticated
 */
router.patch('/auth/avatar', requireAuth, (req: Request, res: Response) => {
  try {
    const { avatarUrl } = req.body;

    const user = updateUserField(req.user!.id, 'avatar_url', avatarUrl || null);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

/**
 * @openapi
 * /api/auth/banner:
 *   patch:
 *     tags: [Authentication]
 *     summary: Update user banner
 *     description: Updates the authenticated user's banner URL. Requires JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bannerUrl:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *       401:
 *         description: Not authenticated
 */
router.patch('/auth/banner', requireAuth, (req: Request, res: Response) => {
  try {
    const { bannerUrl } = req.body;

    const user = updateUserField(req.user!.id, 'banner_url', bannerUrl || null);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

/**
 * @openapi
 * /api/auth/bio:
 *   patch:
 *     tags: [Authentication]
 *     summary: Update user bio
 *     description: Updates the authenticated user's bio. Requires JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Bio updated successfully
 *       401:
 *         description: Not authenticated
 */
router.patch('/auth/bio', requireAuth, (req: Request, res: Response) => {
  try {
    const { bio } = req.body;

    const user = updateUserField(req.user!.id, 'bio', bio || null);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({ error: 'Failed to update bio' });
  }
});

/**
 * @openapi
 * /api/auth/status:
 *   patch:
 *     tags: [Authentication]
 *     summary: Update user status
 *     description: Updates the authenticated user's status message. Requires JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Not authenticated
 */
router.patch('/auth/status', requireAuth, (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const user = updateUserField(req.user!.id, 'status', status || null);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

/**
 * @openapi
 * /api/auth/privacy:
 *   patch:
 *     tags: [Authentication]
 *     summary: Update user privacy settings
 *     description: Updates the authenticated user's privacy settings. Requires JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               showEmail:
 *                 type: boolean
 *               showJoinedDate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 *       401:
 *         description: Not authenticated
 */
router.patch('/auth/privacy', requireAuth, (req: Request, res: Response) => {
  try {
    const { showEmail, showJoinedDate } = req.body;

    const user = updateUserPrivacy(
      req.user!.id,
      typeof showEmail === 'boolean' ? showEmail : true,
      typeof showJoinedDate === 'boolean' ? showJoinedDate : true
    );
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating privacy:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

/**
 * @openapi
 * /api/profile/{id}:
 *   get:
 *     tags: [Authentication]
 *     summary: Get user profile by ID
 *     description: Returns public profile information for a user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/profile/:id', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user profile (exclude email if user has privacy settings)
    const profileUser: any = { ...user };
    if (!profileUser.show_email) {
      delete profileUser.email;
    }

    res.json({ success: true, user: profileUser });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * @openapi
 * /api/auth/theme:
 *   get:
 *     tags: [Authentication]
 *     summary: Get user's theme preferences
 *     description: Returns the authenticated user's theme preferences. Requires JWT token.
 *     responses:
 *       200:
 *         description: Theme preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     preset:
 *                       type: string
 *                     customColors:
 *                       type: object
 *                       properties:
 *                         primary:
 *                           type: string
 *                         background:
 *                           type: string
 *                         text:
 *                           type: string
 *                         accent:
 *                           type: string
 *                         cardBackground:
 *                           type: string
 *                     options:
 *                       type: object
 *                       properties:
 *                         darkMode:
 *                           type: boolean
 *                         highContrast:
 *                           type: boolean
 *                         reduceMotion:
 *                           type: boolean
 *       401:
 *         description: Not authenticated
 */
router.get('/auth/theme', requireAuth, (req: Request, res: Response) => {
  try {
    const preferences = getUserThemePreferences(req.user!.id);
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Error getting theme preferences:', error);
    res.status(500).json({ error: 'Failed to get theme preferences' });
  }
});

/**
 * @openapi
 * /api/auth/theme:
 *   put:
 *     tags: [Authentication]
 *     summary: Update user's theme preferences
 *     description: Updates the authenticated user's theme preferences. Requires JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [preset, customColors, options]
 *             properties:
 *               preset:
 *                 type: string
 *                 description: Theme preset name (e.g., "dark", "light")
 *               customColors:
 *                 type: object
 *                 required: [primary, background, text, accent, cardBackground]
 *                 properties:
 *                   primary:
 *                     type: string
 *                     description: Hex color code (#RRGGBB)
 *                   background:
 *                     type: string
 *                     description: Hex color code (#RRGGBB)
 *                   text:
 *                     type: string
 *                     description: Hex color code (#RRGGBB)
 *                   accent:
 *                     type: string
 *                     description: Hex color code (#RRGGBB)
 *                   cardBackground:
 *                     type: string
 *                     description: Hex color code (#RRGGBB)
 *               options:
 *                 type: object
 *                 required: [darkMode, highContrast, reduceMotion]
 *                 properties:
 *                   darkMode:
 *                     type: boolean
 *                   highContrast:
 *                     type: boolean
 *                   reduceMotion:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Theme preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 preferences:
 *                   type: object
 *       400:
 *         description: Invalid theme preferences
 *       401:
 *         description: Not authenticated
 */
router.put('/auth/theme', requireAuth, (req: Request, res: Response) => {
  try {
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({ error: 'Theme preferences are required' });
    }

    const updatedPreferences = updateUserThemePreferences(req.user!.id, preferences);
    res.json({ success: true, preferences: updatedPreferences });
  } catch (error: any) {
    if (error.message === 'Invalid theme preferences') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error updating theme preferences:', error);
    res.status(500).json({ error: 'Failed to update theme preferences' });
  }
});

export default router;
