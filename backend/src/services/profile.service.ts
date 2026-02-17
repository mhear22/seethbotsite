import { prisma } from '../lib/prisma';
import fs from 'fs/promises';
import crypto from 'crypto';
import path from 'path';

const AVATAR_DIR = path.join(__dirname, '..', '..', 'public', 'avatars');
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Profile interface
 */
export interface Profile {
  id: number;
  user_id: number;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  profile_banner_url: string | null;
  status_message: string | null;
  location: string | null;
  website: string | null;
  social_links: string | null;
  is_public: boolean;
  theme_preferences: string | null;
  custom_colors: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Social links interface
 */
export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  discord?: string;
  youtube?: string;
  instagram?: string;
}

/**
 * Ensure avatars directory exists
 */
async function ensureAvatarDir(): Promise<void> {
  try {
    await fs.mkdir(AVATAR_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create avatars directory:', error);
  }
}

/**
 * Initialize profile database table
 */
export async function initProfilesDB(): Promise<void> {
  await ensureAvatarDir();
  console.log('[Profile] Database initialized successfully');
}

/**
 * Get profile by user ID
 */
export async function getProfileByUserId(userId: number): Promise<Profile | null> {
  return prisma.profile.findUnique({
    where: { user_id: userId }
  });
}

/**
 * Get profile by profile ID
 */
export async function getProfileById(profileId: number): Promise<Profile | null> {
  return prisma.profile.findUnique({
    where: { id: profileId }
  });
}

/**
 * Create or update profile for a user
 */
export async function upsertProfile(userId: number, profileData: Partial<Profile>): Promise<Profile> {
  const data: any = {
    user_id: userId,
    display_name: profileData.display_name ?? undefined,
    bio: profileData.bio ?? undefined,
    avatar_url: profileData.avatar_url ?? undefined,
    profile_banner_url: profileData.profile_banner_url ?? undefined,
    status_message: profileData.status_message ?? undefined,
    location: profileData.location ?? undefined,
    website: profileData.website ?? undefined,
    social_links: profileData.social_links ? JSON.stringify(profileData.social_links) : undefined,
    is_public: profileData.is_public ?? undefined,
    theme_preferences: profileData.theme_preferences ?? undefined,
    custom_colors: profileData.custom_colors ?? undefined
  };

  // Remove undefined values
  Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

  const existingProfile = await getProfileByUserId(userId);

  if (existingProfile) {
    return prisma.profile.update({
      where: { id: existingProfile.id },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
  } else {
    return prisma.profile.create({
      data
    });
  }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
  userId: number,
  file: { buffer: Buffer; mimetype: string; originalname: string }
): Promise<string> {
  // Validate file type
  if (!ALLOWED_AVATAR_TYPES.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
  }

  // Validate file size
  if (file.buffer.length > MAX_AVATAR_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  await ensureAvatarDir();

  // Generate unique filename
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${userId}-${crypto.randomBytes(16).toString('hex')}${ext}`;
  const filePath = path.join(AVATAR_DIR, filename);

  // Save file
  await fs.writeFile(filePath, file.buffer);

  // Return URL
  return `/avatars/${filename}`;
}

/**
 * Delete avatar
 */
export async function deleteAvatar(userId: number): Promise<void> {
  const profile = await getProfileByUserId(userId);
  if (!profile || !profile.avatar_url) {
    return; // No avatar to delete
  }

  // Remove file
  const filename = path.basename(profile.avatar_url);
  const filePath = path.join(AVATAR_DIR, filename);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('[Profile] Failed to delete avatar file:', error);
  }

  // Update profile
  await prisma.profile.update({
    where: { user_id: userId },
    data: { avatar_url: null }
  });
}

/**
 * Update profile field(s)
 */
export async function updateProfile(userId: number, updates: Partial<Profile>): Promise<Profile | null> {
  const existingProfile = await getProfileByUserId(userId);
  if (!existingProfile) {
    return null;
  }

  return upsertProfile(userId, { ...existingProfile, ...updates });
}

/**
 * Delete profile (cascade delete will handle this)
 */
export async function deleteProfile(userId: number): Promise<boolean> {
  const result = await prisma.profile.deleteMany({
    where: { user_id: userId }
  });
  return result.count > 0;
}

/**
 * Get public profiles (for search/browsing)
 */
export async function getPublicProfiles(limit: number = 50, offset: number = 0): Promise<Profile[]> {
  return prisma.profile.findMany({
    where: { is_public: true },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: offset
  });
}

export default {
  initProfilesDB,
  getProfileByUserId,
  getProfileById,
  upsertProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
  deleteAvatar,
  getPublicProfiles
};
