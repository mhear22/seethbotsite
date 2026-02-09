import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'users.db');

/**
 * Initialize the reactions database tables
 */
export function initReactionsDB(): Database.Database {
  const db = new Database(DB_PATH);

  // Create reactions table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      target_type TEXT NOT NULL CHECK(target_type IN ('message', 'post', 'comment')),
      target_id INTEGER NOT NULL,
      emoji TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, target_type, target_id, emoji)
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);
    CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_reactions_emoji ON reactions(emoji);
  `);

  return db;
}

let dbInstance: Database.Database | null = null;

/**
 * Get the reactions database instance
 */
export function getReactionsDB(): Database.Database {
  if (!dbInstance) {
    dbInstance = initReactionsDB();
  }
  return dbInstance;
}

/**
 * Reaction interface
 */
export interface Reaction {
  id: number;
  user_id: number;
  target_type: 'message' | 'post' | 'comment';
  target_id: number;
  emoji: string;
  created_at: string;
}

/**
 * Aggregated reaction count interface
 */
export interface ReactionCount {
  emoji: string;
  count: number;
  user_ids: number[];
}

/**
 * Add or remove a reaction
 * If the user already reacted with this emoji, it removes the reaction (toggle)
 * Otherwise, it adds the reaction
 */
export function toggleReaction(
  userId: number,
  targetType: 'message' | 'post' | 'comment',
  targetId: number,
  emoji: string
): { added: boolean; removed: boolean } {
  const db = getReactionsDB();

  // Check if reaction already exists
  const existingReaction = db.prepare(
    'SELECT id FROM reactions WHERE user_id = ? AND target_type = ? AND target_id = ? AND emoji = ?'
  ).get(userId, targetType, targetId, emoji) as { id: number } | undefined;

  if (existingReaction) {
    // Remove the reaction (toggle off)
    db.prepare(
      'DELETE FROM reactions WHERE id = ?'
    ).run(existingReaction.id);
    return { added: false, removed: true };
  } else {
    // Add the reaction
    db.prepare(
      'INSERT INTO reactions (user_id, target_type, target_id, emoji) VALUES (?, ?, ?, ?)'
    ).run(userId, targetType, targetId, emoji);
    return { added: true, removed: false };
  }
}

/**
 * Add a reaction (force add, don't toggle)
 */
export function addReaction(
  userId: number,
  targetType: 'message' | 'post' | 'comment',
  targetId: number,
  emoji: string
): Reaction | null {
  const db = getReactionsDB();

  try {
    const result = db.prepare(
      'INSERT INTO reactions (user_id, target_type, target_id, emoji) VALUES (?, ?, ?, ?)'
    ).run(userId, targetType, targetId, emoji);

    const reaction = db.prepare(
      'SELECT * FROM reactions WHERE id = ?'
    ).get(result.lastInsertRowid) as Reaction;

    return reaction;
  } catch (error) {
    // Reaction already exists (UNIQUE constraint)
    return null;
  }
}

/**
 * Remove a specific reaction by ID
 */
export function removeReactionById(reactionId: number, userId: number): boolean {
  const db = getReactionsDB();

  const result = db.prepare(
    'DELETE FROM reactions WHERE id = ? AND user_id = ?'
  ).run(reactionId, userId);

  return result.changes > 0;
}

/**
 * Remove a reaction by user, target, and emoji
 */
export function removeReaction(
  userId: number,
  targetType: 'message' | 'post' | 'comment',
  targetId: number,
  emoji: string
): boolean {
  const db = getReactionsDB();

  const result = db.prepare(
    'DELETE FROM reactions WHERE user_id = ? AND target_type = ? AND target_id = ? AND emoji = ?'
  ).run(userId, targetType, targetId, emoji);

  return result.changes > 0;
}

/**
 * Get all reactions for a target
 */
export function getReactionsForTarget(
  targetType: 'message' | 'post' | 'comment',
  targetId: number
): Reaction[] {
  const db = getReactionsDB();

  const reactions = db.prepare(
    'SELECT * FROM reactions WHERE target_type = ? AND target_id = ? ORDER BY created_at ASC'
  ).all(targetType, targetId) as Reaction[];

  return reactions;
}

/**
 * Get aggregated reaction counts for a target
 * Returns array of { emoji, count, user_ids }
 */
export function getReactionCountsForTarget(
  targetType: 'message' | 'post' | 'comment',
  targetId: number
): ReactionCount[] {
  const db = getReactionsDB();

  const counts = db.prepare(`
    SELECT
      emoji,
      COUNT(*) as count,
      GROUP_CONCAT(user_id) as user_ids
    FROM reactions
    WHERE target_type = ? AND target_id = ?
    GROUP BY emoji
    ORDER BY count DESC
  `).all(targetType, targetId) as any[];

  return counts.map(c => ({
    emoji: c.emoji,
    count: c.count,
    user_ids: c.user_ids ? c.user_ids.split(',').map((id: string) => parseInt(id)) : []
  }));
}

/**
 * Check if a user has reacted to a target with a specific emoji
 */
export function hasUserReacted(
  userId: number,
  targetType: 'message' | 'post' | 'comment',
  targetId: number,
  emoji: string
): boolean {
  const db = getReactionsDB();

  const result = db.prepare(
    'SELECT COUNT(*) as count FROM reactions WHERE user_id = ? AND target_type = ? AND target_id = ? AND emoji = ?'
  ).get(userId, targetType, targetId, emoji) as { count: number };

  return result.count > 0;
}

/**
 * Get all reactions by a user
 */
export function getReactionsByUser(userId: number): Reaction[] {
  const db = getReactionsDB();

  const reactions = db.prepare(
    'SELECT * FROM reactions WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId) as Reaction[];

  return reactions;
}
