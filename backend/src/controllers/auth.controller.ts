import { Router, Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  validateTokenAndGetUser,
  logoutUser,
  getUserSessions,
  deleteSession,
  deleteAllSessions,
  updateUserDisplayName,
  changeUserPassword,
  deleteUserAccount,
  cleanupExpiredSessions,
  refreshToken
} from '../users';
import { extractApiKey } from '../auth';

const router = Router();

/**
 * Helper to extract user from JWT token
 */
function getUserFromToken(req: Request): { user: any; session: any } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return validateTokenAndGetUser(token);
}

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
router.get('/auth/me', (req: Request, res: Response) => {
  try {
    const result = getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json(result);
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
router.post('/auth/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = authHeader.substring(7);
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
router.get('/auth/sessions', (req: Request, res: Response) => {
  try {
    const result = getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sessions = getUserSessions(result.user.id);
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
router.delete('/auth/sessions/:id', (req: Request, res: Response) => {
  try {
    const result = getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const success = deleteSession(sessionId, result.user.id);

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
router.delete('/auth/sessions/all', (req: Request, res: Response) => {
  try {
    const result = getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const count = deleteAllSessions(result.user.id);
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
router.patch('/auth/profile', (req: Request, res: Response) => {
  try {
    const result = getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { displayName } = req.body;

    if (!displayName || typeof displayName !== 'string') {
      return res.status(400).json({ error: 'Display name is required' });
    }

    const user = updateUserDisplayName(result.user.id, displayName);
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
router.patch('/auth/password', async (req: Request, res: Response) => {
  try {
    const result = getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    await changeUserPassword(result.user.id, oldPassword, newPassword);
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
router.delete('/auth/account', async (req: Request, res: Response) => {
  try {
    const result = getUserFromToken(req);

    if (!result) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    await deleteUserAccount(result.user.id, password);
    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Invalid password') {
      return res.status(401).json({ error: error.message });
    }
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
