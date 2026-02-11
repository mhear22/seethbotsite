import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prisma';

const JWT_SECRET = process.env.SEETHBOT_JWT_SECRET || 'change-this-in-production-secret-key';
const JWT_EXPIRY = process.env.SEETHBOT_JWT_EXPIRY || '30d';

/**
 * User interface
 */
export interface User {
  id: number;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  status: string | null;
  show_email: boolean;
  show_joined_date: boolean;
  discord_id: string | null;
  discord_username: string | null;
  discord_discriminator: string | null;
  discord_avatar: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Session interface
 */
export interface Session {
  id: number;
  user_id: number;
  device_name: string | null;
  device_type: string | null;
  token: string;
  expires_at: Date;
  created_at: Date;
  last_used_at: Date;
}

/**
 * Theme preferences interface
 */
export interface ThemePreferences {
  preset: string;
  customColors: {
    primary: string;
    background: string;
    text: string;
    accent: string;
    cardBackground: string;
  };
  options: {
    darkMode: boolean;
    highContrast: boolean;
    reduceMotion: boolean;
  };
}

/**
 * Helper function to convert Prisma user to User interface
 */
function toUser(prismaUser: any): User {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    display_name: prismaUser.display_name,
    avatar_url: prismaUser.avatar_url,
    banner_url: prismaUser.banner_url,
    bio: prismaUser.bio,
    status: prismaUser.status,
    show_email: prismaUser.show_email === 1,
    show_joined_date: prismaUser.show_joined_date === 1,
    discord_id: prismaUser.discord_id,
    discord_username: prismaUser.discord_username,
    discord_discriminator: prismaUser.discord_discriminator,
    discord_avatar: prismaUser.discord_avatar,
    created_at: prismaUser.created_at,
    updated_at: prismaUser.updated_at
  };
}

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: User; token: string }> {
  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing && !existing.is_deleted) {
    throw new Error('Email already registered');
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Insert user
  const user = await prisma.user.create({
    data: {
      email,
      password_hash: passwordHash,
      display_name: displayName || null
    }
  });

  // Create session
  const token = generateJWT(user.id);
  await createSession(user.id, token);

  return { user: toUser(user), token };
}

/**
 * Login a user
 */
export async function loginUser(
  email: string,
  password: string,
  deviceName?: string,
  deviceType?: string
): Promise<{ user: User; token: string }> {
  // Get user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || user.is_deleted) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  // Create session
  const token = generateJWT(user.id);
  await createSession(user.id, token, deviceName, deviceType);

  return { user: toUser(user), token };
}

/**
 * Validate a JWT token and return the user
 */
export async function validateTokenAndGetUser(token: string): Promise<{ user: User; session: Session } | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // Get session and update last_used_at
    const session = await prisma.session.findUnique({
      where: { token }
    });

    if (!session || new Date(session.expires_at) < new Date()) {
      return null;
    }

    // Only update last_used_at if 5+ minutes have passed
    const lastUsed = new Date(session.last_used_at).getTime();
    if (Date.now() - lastUsed > 5 * 60 * 1000) {
      await prisma.session.update({
        where: { id: session.id },
        data: { last_used_at: new Date() }
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user_id }
    });

    if (!user || user.is_deleted) {
      return null;
    }

    return { user: toUser(user), session: toSession(session) };
  } catch (error) {
    return null;
  }
}

/**
 * Logout a user (invalidate session)
 */
export async function logoutUser(token: string): Promise<boolean> {
  const result = await prisma.session.deleteMany({
    where: { token }
  });
  return result.count > 0;
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: number): Promise<Session[]> {
  const sessions = await prisma.session.findMany({
    where: {
      user_id: userId,
      expires_at: { gt: new Date() }
    },
    orderBy: { last_used_at: 'desc' }
  });
  return sessions.map(toSession);
}

/**
 * Delete a session (logout from specific device)
 */
export async function deleteSession(sessionId: number, userId: number): Promise<boolean> {
  const result = await prisma.session.deleteMany({
    where: {
      id: sessionId,
      user_id: userId
    }
  });
  return result.count > 0;
}

/**
 * Delete all sessions for a user (logout from all devices)
 */
export async function deleteAllSessions(userId: number): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { user_id: userId }
  });
  return result.count;
}

/**
 * Helper function to convert Prisma session to Session interface
 */
function toSession(prismaSession: any): Session {
  return {
    id: prismaSession.id,
    user_id: prismaSession.user_id,
    device_name: prismaSession.device_name,
    device_type: prismaSession.device_type,
    token: prismaSession.token,
    expires_at: prismaSession.expires_at,
    created_at: prismaSession.created_at,
    last_used_at: prismaSession.last_used_at
  };
}

/**
 * Generate a JWT token
 */
function generateJWT(userId: number): string {
  // Add timestamp to make each token unique
  const payload = {
    userId,
    ts: Date.now() // timestamp to ensure uniqueness
  };

  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY } as any
  );
}

/**
 * Create a session in the database
 */
async function createSession(
  userId: number,
  token: string,
  deviceName?: string,
  deviceType?: string
): Promise<void> {
  // Calculate expiry date
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // 30 days

  await prisma.session.create({
    data: {
      user_id: userId,
      token,
      device_name: deviceName || null,
      device_type: deviceType || null,
      expires_at: expiryDate
    }
  });
}

/**
 * Refresh a user's session token
 * Invalidates the old token and creates a new one
 *
 * @param oldToken - The old JWT token to invalidate
 * @returns The new token, or null if the old token was invalid
 */
export async function refreshToken(oldToken: string): Promise<string | null> {
  const result = await validateTokenAndGetUser(oldToken);

  if (!result) {
    return null;
  }

  // Invalidate old token
  await logoutUser(oldToken);

  // Generate new token
  const newToken = generateJWT(result.user.id);

  // Create new session (convert null to undefined for optional parameters)
  await createSession(
    result.user.id,
    newToken,
    result.session.device_name || undefined,
    result.session.device_type || undefined
  );

  return newToken;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expires_at: { lte: new Date() }
    }
  });
  return result.count;
}

const UPDATABLE_USER_FIELDS = ['display_name', 'avatar_url', 'banner_url', 'bio', 'status'] as const;
type UpdatableUserField = typeof UPDATABLE_USER_FIELDS[number];

export async function updateUserField(userId: number, field: UpdatableUserField, value: string | null): Promise<User> {
  const user = await prisma.user.update({
    where: { id: userId, is_deleted: false },
    data: {
      [field]: value,
      updated_at: new Date()
    }
  });
  return toUser(user);
}

/**
 * Update user privacy settings
 */
export async function updateUserPrivacy(userId: number, showEmail: boolean, showJoinedDate: boolean): Promise<User> {
  const user = await prisma.user.update({
    where: { id: userId, is_deleted: false },
    data: {
      show_email: showEmail ? 1 : 0,
      show_joined_date: showJoinedDate ? 1 : 0,
      updated_at: new Date()
    }
  });
  return toUser(user);
}

/**
 * Get user by ID (for viewing other profiles)
 */
export async function getUserById(userId: number): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId, is_deleted: false }
  });
  return user ? toUser(user) : null;
}

/**
 * Change user password
 */
export async function changeUserPassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
  // Get current password hash
  const user = await prisma.user.findUnique({
    where: { id: userId, is_deleted: false },
    select: { password_hash: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify old password
  const validPassword = await bcrypt.compare(oldPassword, user.password_hash);

  if (!validPassword) {
    throw new Error('Invalid current password');
  }

  // Hash new password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password_hash: passwordHash, updated_at: new Date() }
  });

  // Invalidate all sessions (force re-login on all devices)
  await deleteAllSessions(userId);
}

/**
 * Delete user account
 */
export async function deleteUserAccount(userId: number, password: string): Promise<void> {
  // Verify password
  const user = await prisma.user.findUnique({
    where: { id: userId, is_deleted: false },
    select: { password_hash: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw new Error('Invalid password');
  }

  // Soft delete user and anonymize email to free it up for re-registration
  await prisma.user.update({
    where: { id: userId },
    data: {
      is_deleted: true,
      email: `deleted_${userId}@deleted`,
      updated_at: new Date()
    }
  });

  // Still hard-delete sessions (ephemeral security tokens)
  await deleteAllSessions(userId);
}

/**
 * Validate hex color format
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Validate theme preferences
 */
function validateThemePreferences(preferences: ThemePreferences): boolean {
  // Validate preset
  if (!preferences.preset || typeof preferences.preset !== 'string') {
    return false;
  }

  // Validate custom colors
  if (!preferences.customColors || typeof preferences.customColors !== 'object') {
    return false;
  }
  const colorKeys = ['primary', 'background', 'text', 'accent', 'cardBackground'];
  for (const key of colorKeys) {
    if (!preferences.customColors[key as keyof typeof preferences.customColors] ||
        typeof preferences.customColors[key as keyof typeof preferences.customColors] !== 'string' ||
        !isValidHexColor(preferences.customColors[key as keyof typeof preferences.customColors])) {
      return false;
    }
  }

  // Validate options
  if (!preferences.options || typeof preferences.options !== 'object') {
    return false;
  }
  const optionKeys = ['darkMode', 'highContrast', 'reduceMotion'];
  for (const key of optionKeys) {
    if (typeof preferences.options[key as keyof typeof preferences.options] !== 'boolean') {
      return false;
    }
  }

  return true;
}

/**
 * Get user's theme preferences
 */
export async function getUserThemePreferences(userId: number): Promise<ThemePreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId, is_deleted: false },
    select: { display_name: true } // Using display_name as a placeholder, we'll use the Profile model instead
  });

  // Try to get from Profile model
  const profile = await prisma.profile.findUnique({
    where: { user_id: userId }
  });

  const preferencesStr = profile?.theme_preferences;

  if (!preferencesStr) {
    // Return default theme preferences
    return {
      preset: 'dark',
      customColors: {
        primary: '#ec4899',
        background: '#1a1a2e',
        text: '#ffffff',
        accent: '#f97316',
        cardBackground: '#16213e'
      },
      options: {
        darkMode: true,
        highContrast: false,
        reduceMotion: false
      }
    };
  }

  try {
    return JSON.parse(preferencesStr) as ThemePreferences;
  } catch (error) {
    // If parsing fails, return default
    return {
      preset: 'dark',
      customColors: {
        primary: '#ec4899',
        background: '#1a1a2e',
        text: '#ffffff',
        accent: '#f97316',
        cardBackground: '#16213e'
      },
      options: {
        darkMode: true,
        highContrast: false,
        reduceMotion: false
      }
    };
  }
}

/**
 * Update user's theme preferences
 */
export async function updateUserThemePreferences(userId: number, preferences: ThemePreferences): Promise<ThemePreferences> {
  // Validate preferences
  if (!validateThemePreferences(preferences)) {
    throw new Error('Invalid theme preferences');
  }

  // Store as JSON string
  const preferencesJson = JSON.stringify(preferences);

  // Update or create profile
  await prisma.profile.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      theme_preferences: preferencesJson
    },
    update: {
      theme_preferences: preferencesJson,
      updated_at: new Date()
    }
  });

  // Return updated preferences
  return getUserThemePreferences(userId);
}

/**
 * Link Discord account to a user
 *
 * @param userId - The user ID to link Discord account to
 * @param discordUser - Discord user information
 * @returns Updated user object
 */
export async function linkDiscordAccount(
  userId: number,
  discordUser: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  }
): Promise<User> {
  // Check if Discord account is already linked to another user
  const existingUser = await prisma.user.findFirst({
    where: {
      discord_id: discordUser.id,
      is_deleted: false
    }
  });

  if (existingUser && existingUser.id !== userId) {
    throw new Error('This Discord account is already linked to another user');
  }

  // Link Discord account
  const user = await prisma.user.update({
    where: { id: userId, is_deleted: false },
    data: {
      discord_id: discordUser.id,
      discord_username: discordUser.username,
      discord_discriminator: discordUser.discriminator,
      discord_avatar: discordUser.avatar,
      updated_at: new Date()
    }
  });

  return toUser(user);
}

/**
 * Unlink Discord account from a user
 *
 * @param userId - The user ID to unlink Discord account from
 * @returns Updated user object
 */
export async function unlinkDiscordAccount(userId: number): Promise<User> {
  const user = await prisma.user.update({
    where: { id: userId, is_deleted: false },
    data: {
      discord_id: null,
      discord_username: null,
      discord_discriminator: null,
      discord_avatar: null,
      updated_at: new Date()
    }
  });

  return toUser(user);
}

/**
 * Get user by Discord ID
 *
 * @param discordId - Discord user ID
 * @returns User object if found, null otherwise
 */
export async function getUserByDiscordId(discordId: string): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: {
      discord_id: discordId,
      is_deleted: false
    }
  });
  return user ? toUser(user) : null;
}
