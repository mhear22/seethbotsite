import { Router, Request, Response } from 'express';
import multer from 'multer';
import { validateTokenAndGetUser } from '../users';
import {
  getProfileByUserId,
  upsertProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar
} from '../services/profile.service';

const router = Router();

// Configure multer for memory storage (for avatar uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

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
 * Helper to require authentication
 */
function requireAuth(req: Request, res: Response): { user: any; session: any } | null {
  const result = getUserFromToken(req);
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
 * /api/profiles/me:
 *   get:
 *     tags: [Profiles]
 *     summary: Get my profile
 *     description: Returns the authenticated user's profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     display_name:
 *                       type: string
 *                       nullable: true
 *                     bio:
 *                       type: string
 *                       nullable: true
 *                     avatar_url:
 *                       type: string
 *                       nullable: true
 *                     profile_banner_url:
 *                       type: string
 *                       nullable: true
 *                     status_message:
 *                       type: string
 *                       nullable: true
 *                     location:
 *                       type: string
 *                       nullable: true
 *                     website:
 *                       type: string
 *                       nullable: true
 *                     social_links:
 *                       type: object
 *                       nullable: true
 *                     is_public:
 *                       type: boolean
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get('/me', async (req: Request, res: Response) => {
  const authResult = requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;
  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Profile not found'
    });
  }

  // Parse social_links JSON if present
  const responseData = {
    ...profile,
    social_links: profile.social_links ? JSON.parse(profile.social_links) : null
  };

  res.json({ profile: responseData });
});

/**
 * @openapi
 * /api/profiles/{id}:
 *   get:
 *     tags: [Profiles]
 *     summary: Get public profile
 *     description: Returns a user's public profile by user ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *       404:
 *         description: Profile not found or private
 */
router.get('/:id', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Invalid user ID'
    });
  }

  const profile = await getProfileByUserId(userId);

  if (!profile) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Profile not found'
    });
  }

  // Check if profile is public
  if (!profile.is_public) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Profile is private'
    });
  }

  // Parse social_links JSON if present
  const responseData = {
    ...profile,
    social_links: profile.social_links ? JSON.parse(profile.social_links) : null
  };

  res.json({ profile: responseData });
});

/**
 * @openapi
 * /api/profiles/me:
 *   put:
 *     tags: [Profiles]
 *     summary: Update my profile
 *     description: Creates or updates the authenticated user's profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: string
 *                 nullable: true
 *               bio:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 500
 *               profile_banner_url:
 *                 type: string
 *                 nullable: true
 *               status_message:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 140
 *               location:
 *                 type: string
 *                 nullable: true
 *               website:
 *                 type: string
 *                 nullable: true
 *               social_links:
 *                 type: object
 *                 nullable: true
 *               is_public:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.put('/me', async (req: Request, res: Response) => {
  const authResult = requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;
  const profileData = req.body;

  // Validate bio length
  if (profileData.bio && profileData.bio.length > 500) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Bio must be 500 characters or less'
    });
  }

  // Validate status_message length
  if (profileData.status_message && profileData.status_message.length > 140) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Status message must be 140 characters or less'
    });
  }

  // Stringify social_links if it's an object
  if (profileData.social_links && typeof profileData.social_links === 'object') {
    profileData.social_links = JSON.stringify(profileData.social_links);
  }

  const updatedProfile = await upsertProfile(user.id, profileData);

  // Parse social_links JSON if present
  const responseData = {
    ...updatedProfile,
    social_links: updatedProfile.social_links ? JSON.parse(updatedProfile.social_links) : null
  };

  res.json({ profile: responseData });
});

/**
 * @openapi
 * /api/profiles/me:
 *   patch:
 *     tags: [Profiles]
 *     summary: Partially update my profile
 *     description: Updates specific fields of the authenticated user's profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: string
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *               profile_banner_url:
 *                 type: string
 *               status_message:
 *                 type: string
 *                 maxLength: 140
 *               location:
 *                 type: string
 *               website:
 *                 type: string
 *               social_links:
 *                 type: object
 *               is_public:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.patch('/me', async (req: Request, res: Response) => {
  const authResult = requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;
  const updates = req.body;

  // Validate bio length
  if (updates.bio && updates.bio.length > 500) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Bio must be 500 characters or less'
    });
  }

  // Validate status_message length
  if (updates.status_message && updates.status_message.length > 140) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Status message must be 140 characters or less'
    });
  }

  // Stringify social_links if it's an object
  if (updates.social_links && typeof updates.social_links === 'object') {
    updates.social_links = JSON.stringify(updates.social_links);
  }

  const updatedProfile = await updateProfile(user.id, updates);

  if (!updatedProfile) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Profile not found'
    });
  }

  // Parse social_links JSON if present
  const responseData = {
    ...updatedProfile,
    social_links: updatedProfile.social_links ? JSON.parse(updatedProfile.social_links) : null
  };

  res.json({ profile: responseData });
});

/**
 * @openapi
 * /api/profiles/avatar:
 *   post:
 *     tags: [Profiles]
 *     summary: Upload avatar
 *     description: Uploads an avatar image for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatar_url:
 *                   type: string
 *       400:
 *         description: Bad request (invalid file)
 *       401:
 *         description: Unauthorized
 */
router.post('/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
  const authResult = requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;

  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'No file uploaded'
    });
  }

  try {
    const avatarUrl = await uploadAvatar(user.id, {
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname
    });

    // Update profile with new avatar URL
    const updatedProfile = await upsertProfile(user.id, { avatar_url: avatarUrl });

    res.json({
      avatar_url: avatarUrl,
      profile: updatedProfile
    });
  } catch (error: any) {
    res.status(400).json({
      error: 'Bad request',
      message: error.message
    });
  }
});

/**
 * @openapi
 * /api/profiles/avatar:
 *   delete:
 *     tags: [Profiles]
 *     summary: Delete avatar
 *     description: Removes the authenticated user's avatar image
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.delete('/avatar', async (req: Request, res: Response) => {
  const authResult = requireAuth(req, res);
  if (!authResult) return;

  const { user } = authResult;

  try {
    await deleteAvatar(user.id);

    res.json({
      message: 'Avatar deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
