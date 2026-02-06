import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'activity_feed.db');

/**
 * Initialize the activity feed database
 */
export function initActivityFeedDB(): Database.Database {
  const db = new Database(DB_PATH);

  // Create activity_feed table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_feed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      user_name TEXT,
      user_avatar TEXT,
      activity_type TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata TEXT,
      points_change INTEGER DEFAULT 0,
      game_type TEXT,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON activity_feed(activity_type);
    CREATE INDEX IF NOT EXISTS idx_activity_feed_time ON activity_feed(recorded_at DESC);
  `);

  return db;
}

let dbInstance: Database.Database | null = null;

export function getActivityFeedDB(): Database.Database {
  if (!dbInstance) {
    dbInstance = initActivityFeedDB();
  }
  return dbInstance;
}

/**
 * Activity types enum
 */
export enum ActivityType {
  POINTS_EARNED = 'points_earned',
  POINTS_BULK = 'points_bulk',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  HIGH_SCORE = 'high_score',
  CHALLENGE_COMPLETED = 'challenge_completed',
  GAME_PLAYED = 'game_played',
  RANKING_CHANGE = 'ranking_change',
  SESSION_END = 'session_end'
}

/**
 * Record an activity event
 */
export interface RecordActivityParams {
  userId: string;
  userName?: string;
  userAvatar?: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  pointsChange?: number;
  gameType?: 'clicker' | 'fishing';
}

export function recordActivity(params: RecordActivityParams): number {
  const db = getActivityFeedDB();

  const stmt = db.prepare(`
    INSERT INTO activity_feed (user_id, user_name, user_avatar, activity_type, description, metadata, points_change, game_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    params.userId,
    params.userName || 'Anonymous',
    params.userAvatar || '👤',
    params.activityType,
    params.description,
    params.metadata ? JSON.stringify(params.metadata) : null,
    params.pointsChange || 0,
    params.gameType || null
  );

  // Keep only the last 1000 activities per user to prevent database bloat
  cleanupOldActivities(params.userId);

  return result.lastInsertRowid as number;
}

/**
 * Get activity feed for a user (their own activities + friends)
 */
export interface GetActivityFeedParams {
  userId?: string; // Optional: if provided, filter for this user
  limit?: number;
  offset?: number;
  activityType?: ActivityType;
  gameType?: 'clicker' | 'fishing';
}

export function getActivityFeed(params: GetActivityFeedParams): any[] {
  const db = getActivityFeedDB();

  let query = 'SELECT * FROM activity_feed WHERE 1=1';
  const queryParams: any[] = [];

  if (params.userId) {
    query += ' AND user_id = ?';
    queryParams.push(params.userId);
  }

  if (params.activityType) {
    query += ' AND activity_type = ?';
    queryParams.push(params.activityType);
  }

  if (params.gameType) {
    query += ' AND game_type = ?';
    queryParams.push(params.gameType);
  }

  query += ' ORDER BY recorded_at DESC LIMIT ? OFFSET ?';
  queryParams.push(params.limit || 50, params.offset || 0);

  const rows = db.prepare(query).all(...queryParams);

  return rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userAvatar: row.user_avatar,
    activityType: row.activity_type,
    description: row.description,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    pointsChange: row.points_change,
    gameType: row.game_type,
    recordedAt: row.recorded_at
  }));
}

/**
 * Get recent activity across all users (for global feed)
 */
export function getGlobalActivity(params: { limit?: number; offset?: number }): any[] {
  const db = getActivityFeedDB();

  const query = `
    SELECT * FROM activity_feed
    ORDER BY recorded_at DESC
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(query).all(params.limit || 50, params.offset || 0);

  return rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userAvatar: row.user_avatar,
    activityType: row.activity_type,
    description: row.description,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    pointsChange: row.points_change,
    gameType: row.game_type,
    recordedAt: row.recorded_at
  }));
}

/**
 * Get activity statistics for a user
 */
export function getUserActivityStats(userId: string): {
  totalActivities: number;
  pointsEarned: number;
  achievementsUnlocked: number;
  gamesPlayed: number;
} {
  const db = getActivityFeedDB();

  const totalActivities = db.prepare(`
    SELECT COUNT(*) as count FROM activity_feed
    WHERE user_id = ?
  `).get(userId) as { count: number };

  const pointsEarned = db.prepare(`
    SELECT SUM(points_change) as total FROM activity_feed
    WHERE user_id = ? AND points_change > 0
  `).get(userId) as { total: number | null };

  const achievementsUnlocked = db.prepare(`
    SELECT COUNT(*) as count FROM activity_feed
    WHERE user_id = ? AND activity_type = ?
  `).get(userId, ActivityType.ACHIEVEMENT_UNLOCKED) as { count: number };

  const gamesPlayed = db.prepare(`
    SELECT COUNT(DISTINCT metadata->>'$.sessionId') as count FROM activity_feed
    WHERE user_id = ? AND activity_type = ?
  `).get(userId, ActivityType.GAME_PLAYED) as { count: number | null };

  return {
    totalActivities: totalActivities.count || 0,
    pointsEarned: pointsEarned?.total || 0,
    achievementsUnlocked: achievementsUnlocked.count || 0,
    gamesPlayed: gamesPlayed?.count || 0
  };
}

/**
 * Clean up old activities (keep only last N per user)
 */
function cleanupOldActivities(userId: string, keepCount: number = 1000): void {
  const db = getActivityFeedDB();

  // Get count of activities for this user
  const count = db.prepare(`
    SELECT COUNT(*) as count FROM activity_feed
    WHERE user_id = ?
  `).get(userId) as { count: number };

  if (count.count > keepCount) {
    // Delete old activities beyond the keep limit
    const deleteStmt = db.prepare(`
      DELETE FROM activity_feed
      WHERE id IN (
        SELECT id FROM activity_feed
        WHERE user_id = ?
        ORDER BY recorded_at ASC
        LIMIT ?
      )
    `);

    deleteStmt.run(userId, count.count - keepCount);
  }
}

/**
 * Delete old activities globally (cleanup job)
 */
export function cleanupOldGlobalActivities(daysOld: number = 30): number {
  const db = getActivityFeedDB();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const deleteStmt = db.prepare(`
    DELETE FROM activity_feed
    WHERE recorded_at < ?
  `);

  const result = deleteStmt.run(cutoffDate.toISOString());
  return result.changes;
}
