import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const DB_PATH = path.join(__dirname, '..', 'data', 'users.db');
const JWT_SECRET = process.env.SEETHBOT_JWT_SECRET || 'change-this-in-production-secret-key';
const JWT_EXPIRY = process.env.SEETHBOT_JWT_EXPIRY || '30d';

/**
 * Initialize the users database
 */
export function initUsersDB(): Database.Database {
  const db = new Database(DB_PATH);

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add is_deleted column if it doesn't exist (for soft deletes)
  try {
    db.exec(`ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT 0`);
  } catch (err) {
    // Column already exists, ignore the error
  }

  // Create sessions table for device tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      device_name TEXT,
      device_type TEXT,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create index for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  `);

  return db;
}

let dbInstance: Database.Database | null = null;

export function getUsersDB(): Database.Database {
  if (!dbInstance) {
    dbInstance = initUsersDB();
  }
  return dbInstance;
}

/**
 * User interface
 */
export interface User {
  id: number;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
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
  expires_at: string;
  created_at: string;
  last_used_at: string;
}

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: User; token: string }> {
  const db = getUsersDB();

  // Check if email already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ? AND is_deleted = 0').get(email);
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Insert user
  const stmt = db.prepare(`
    INSERT INTO users (email, password_hash, display_name)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(email, passwordHash, displayName || null);

  const user = db.prepare('SELECT id, email, display_name, created_at, updated_at FROM users WHERE id = ? AND is_deleted = 0').get(result.lastInsertRowid) as User;

  // Create session
  const token = generateJWT(user.id);
  createSession(user.id, token);

  return { user, token };
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
  const db = getUsersDB();

  // Get user by email
  const userWithHash = db.prepare('SELECT * FROM users WHERE email = ? AND is_deleted = 0').get(email) as any;

  if (!userWithHash) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const validPassword = await bcrypt.compare(password, userWithHash.password_hash);

  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  const user: User = {
    id: userWithHash.id,
    email: userWithHash.email,
    display_name: userWithHash.display_name,
    created_at: userWithHash.created_at,
    updated_at: userWithHash.updated_at
  };

  // Create session
  const token = generateJWT(user.id);
  createSession(user.id, token, deviceName, deviceType);

  return { user, token };
}

/**
 * Validate a JWT token and return the user
 */
export function validateTokenAndGetUser(token: string): { user: User; session: Session } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const db = getUsersDB();

    // Get session and update last_used_at
    const session = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP').get(token) as Session | undefined;

    if (!session) {
      return null;
    }

    // Update last used time
    db.prepare('UPDATE sessions SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?').run(session.id);

    // Get user
    const user = db.prepare('SELECT id, email, display_name, created_at, updated_at FROM users WHERE id = ? AND is_deleted = 0').get(session.user_id) as User;

    if (!user) {
      return null;
    }

    return { user, session };
  } catch (error) {
    return null;
  }
}

/**
 * Logout a user (invalidate session)
 */
export function logoutUser(token: string): boolean {
  const db = getUsersDB();
  const result = db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  return result.changes > 0;
}

/**
 * Get all sessions for a user
 */
export function getUserSessions(userId: number): Session[] {
  const db = getUsersDB();
  return db.prepare('SELECT * FROM sessions WHERE user_id = ? AND expires_at > CURRENT_TIMESTAMP ORDER BY last_used_at DESC').all(userId) as Session[];
}

/**
 * Delete a session (logout from specific device)
 */
export function deleteSession(sessionId: number, userId: number): boolean {
  const db = getUsersDB();
  const result = db.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?').run(sessionId, userId);
  return result.changes > 0;
}

/**
 * Delete all sessions for a user (logout from all devices)
 */
export function deleteAllSessions(userId: number): number {
  const db = getUsersDB();
  const result = db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
  return result.changes;
}

/**
 * Generate a JWT token
 */
function generateJWT(userId: number): string {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY } as any
  );
}

/**
 * Create a session in the database
 */
function createSession(
  userId: number,
  token: string,
  deviceName?: string,
  deviceType?: string
): void {
  const db = getUsersDB();

  // Calculate expiry date
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // 30 days

  db.prepare(`
    INSERT INTO sessions (user_id, token, device_name, device_type, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, token, deviceName || null, deviceType || null, expiryDate.toISOString());
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): number {
  const db = getUsersDB();
  const result = db.prepare('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP').run();
  return result.changes;
}

/**
 * Update user display name
 */
export function updateUserDisplayName(userId: number, displayName: string): User {
  const db = getUsersDB();
  db.prepare('UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_deleted = 0').run(displayName, userId);
  const user = db.prepare('SELECT id, email, display_name, created_at, updated_at FROM users WHERE id = ? AND is_deleted = 0').get(userId) as User;
  return user;
}

/**
 * Change user password
 */
export async function changeUserPassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
  const db = getUsersDB();

  // Get current password hash
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ? AND is_deleted = 0').get(userId) as { password_hash: string } | undefined;

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
  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(passwordHash, userId);

  // Invalidate all sessions (force re-login on all devices)
  deleteAllSessions(userId);
}

/**
 * Delete user account
 */
export async function deleteUserAccount(userId: number, password: string): Promise<void> {
  const db = getUsersDB();

  // Verify password
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ? AND is_deleted = 0').get(userId) as { password_hash: string } | undefined;

  if (!user) {
    throw new Error('User not found');
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw new Error('Invalid password');
  }

  // Soft delete user and anonymize email to free it up for re-registration
  db.prepare("UPDATE users SET is_deleted = 1, email = 'deleted_' || id || '@deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(userId);

  // Still hard-delete sessions (ephemeral security tokens)
  deleteAllSessions(userId);
}
