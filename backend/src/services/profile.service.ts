import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'users.db');
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
  created_at: string;
  updated_at: string;
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
export async function initProfilesDB(): Promise<Database.Database> {
  const db = new Database(DB_PATH);

  // Ensure avatars directory exists
  await ensureAvatarDir();

  // Read and execute the migration
  const migrationPath = path.join(__dirname, '..', 'migrations', 'add_profiles.sql');
  try {
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    db.exec(migrationSQL);
    console.log('[Profile] Database initialized successfully');
  } catch (error) {
    console.error('[Profile] Failed to initialize database:', error);
    throw error;
  }

  return db;
}

let dbInstance: Database.Database | null = null;
let initPromise: Promise<Database.Database> | null = null;

export async function getProfilesDB(): Promise<Database.Database> {
  if (!dbInstance) {
    if (!initPromise) {
      initPromise = initProfilesDB().then(db => {
        dbInstance = db;
        return db;
      });
    }
    await initPromise;
  }
  return dbInstance!;
}

// Synchronous version for immediate access (must be called after initialization)
export function getProfilesDBSync(): Database.Database {
  if (!dbInstance) {
    throw new Error('Profiles database not initialized. Call getProfilesDB() first.');
  }
  return dbInstance;
}

/**
 * Get profile by user ID
 */
export async function getProfileByUserId(userId: number): Promise<Profile | null> {
  const db = await getProfilesDB();
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId) as Profile | undefined;
  return profile || null;
}

/**
 * Get profile by profile ID
 */
export async function getProfileById(profileId: number): Promise<Profile | null> {
  const db = await getProfilesDB();
  const profile = db.prepare('SELECT * FROM user_profiles WHERE id = ?').get(profileId) as Profile | undefined;
  return profile || null;
}

/**
 * Create or update profile for a user
 */
export async function upsertProfile(userId: number, profileData: Partial<Profile>): Promise<Profile> {
  const db = await getProfilesDB();

  const existingProfile = await getProfileByUserId(userId);

  const data = {
    user_id: userId,
    display_name: profileData.display_name || null,
    bio: profileData.bio || null,
    avatar_url: profileData.avatar_url || null,
    profile_banner_url: profileData.profile_banner_url || null,
    status_message: profileData.status_message || null,
    location: profileData.location || null,
    website: profileData.website || null,
    social_links: profileData.social_links ? JSON.stringify(profileData.social_links) : null,
    is_public: profileData.is_public !== undefined ? (profileData.is_public ? 1 : 0) : 1
  };

  if (existingProfile) {
    // Update existing profile
    db.prepare(`
      UPDATE user_profiles
      SET display_name = ?, bio = ?, avatar_url = ?, profile_banner_url = ?,
          status_message = ?, location = ?, website = ?, social_links = ?, is_public = ?
      WHERE id = ?
    `).run(
      data.display_name,
      data.bio,
      data.avatar_url,
      data.profile_banner_url,
      data.status_message,
      data.location,
      data.website,
      data.social_links,
      data.is_public,
      existingProfile.id
    );

    return (await getProfileById(existingProfile.id))!;
  } else {
    // Create new profile
    const result = db.prepare(`
      INSERT INTO user_profiles
      (user_id, display_name, bio, avatar_url, profile_banner_url, status_message, location, website, social_links, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.user_id,
      data.display_name,
      data.bio,
      data.avatar_url,
      data.profile_banner_url,
      data.status_message,
      data.location,
      data.website,
      data.social_links,
      data.is_public
    );

    return (await getProfileById(result.lastInsertRowid as number))!;
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
  const db = await getProfilesDB();
  db.prepare('UPDATE user_profiles SET avatar_url = NULL WHERE user_id = ?').run(userId);
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
  const db = await getProfilesDB();
  const result = db.prepare('DELETE FROM user_profiles WHERE user_id = ?').run(userId);
  return result.changes > 0;
}

/**
 * Get public profiles (for search/browsing)
 */
export async function getPublicProfiles(limit: number = 50, offset: number = 0): Promise<Profile[]> {
  const db = await getProfilesDB();
  const profiles = db.prepare(`
    SELECT * FROM user_profiles
    WHERE is_public = 1
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset) as Profile[];
  return profiles;
}

export default {
  getProfileByUserId,
  getProfileById,
  upsertProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
  deleteAvatar,
  getPublicProfiles
};
