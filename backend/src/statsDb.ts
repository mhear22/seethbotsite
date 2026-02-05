import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'game_stats.db');

/**
 * Initialize the game stats database
 */
export function initStatsDB(): Database.Database {
  const db = new Database(DB_PATH);

  // Create game_stats table for time-series data
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      game_type TEXT NOT NULL,
      stat_type TEXT NOT NULL,
      value REAL NOT NULL,
      metadata TEXT,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create high_scores table for best scores
  db.exec(`
    CREATE TABLE IF NOT EXISTS high_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      user_name TEXT,
      game_type TEXT NOT NULL,
      score INTEGER NOT NULL,
      details TEXT,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create daily_challenges table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      challenge_type TEXT NOT NULL,
      description TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      current_value INTEGER DEFAULT 0,
      progress REAL DEFAULT 0,
      completed BOOLEAN DEFAULT 0,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      UNIQUE(user_id, challenge_type, date)
    )
  `);

  // Create achievements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      achievement_name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, achievement_id)
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_game_stats_user ON game_stats(user_id);
    CREATE INDEX IF NOT EXISTS idx_game_stats_type ON game_stats(game_type, stat_type);
    CREATE INDEX IF NOT EXISTS idx_game_stats_time ON game_stats(recorded_at);
    CREATE INDEX IF NOT EXISTS idx_high_scores_user ON high_scores(user_id);
    CREATE INDEX IF NOT EXISTS idx_high_scores_game ON high_scores(game_type);
    CREATE INDEX IF NOT EXISTS idx_daily_challenges_user ON daily_challenges(user_id);
    CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date);
    CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
  `);

  return db;
}

let dbInstance: Database.Database | null = null;

export function getStatsDB(): Database.Database {
  if (!dbInstance) {
    dbInstance = initStatsDB();
  }
  return dbInstance;
}

/**
 * Record a game stat event
 */
export interface RecordStatParams {
  userId: string;
  userName?: string;
  gameType: 'clicker' | 'fishing';
  statType: 'click' | 'fish_caught' | 'score' | 'session_end';
  value: number;
  metadata?: Record<string, any>;
}

export function recordStat(params: RecordStatParams): void {
  const db = getStatsDB();

  const stmt = db.prepare(`
    INSERT INTO game_stats (user_id, game_type, stat_type, value, metadata)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    params.userId,
    params.gameType,
    params.statType,
    params.value,
    params.metadata ? JSON.stringify(params.metadata) : null
  );
}

/**
 * Update high score for a user in a game
 */
export interface UpdateHighScoreParams {
  userId: string;
  userName?: string;
  gameType: 'clicker' | 'fishing';
  score: number;
  details?: Record<string, any>;
}

export function updateHighScore(params: UpdateHighScoreParams): boolean {
  const db = getStatsDB();

  // Check if user already has a high score
  const existing = db.prepare(`
    SELECT score FROM high_scores
    WHERE user_id = ? AND game_type = ?
  `).get(params.userId, params.gameType) as { score: number } | undefined;

  if (existing) {
    // Only update if new score is higher
    if (params.score > existing.score) {
      const stmt = db.prepare(`
        UPDATE high_scores
        SET score = ?, details = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND game_type = ?
      `);
      const result = stmt.run(params.score, params.details ? JSON.stringify(params.details) : null, params.userId, params.gameType);
      return result.changes > 0;
    }
    return false;
  } else {
    // Insert new high score
    const stmt = db.prepare(`
      INSERT INTO high_scores (user_id, user_name, game_type, score, details)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      params.userId,
      params.userName || null,
      params.gameType,
      params.score,
      params.details ? JSON.stringify(params.details) : null
    );
    return result.changes > 0;
  }
}

/**
 * Get stats history for a user
 */
export interface GetStatsHistoryParams {
  userId: string;
  gameType?: 'clicker' | 'fishing';
  statType?: string;
  limit?: number;
  offset?: number;
}

export function getStatsHistory(params: GetStatsHistoryParams): any[] {
  const db = getStatsDB();

  let query = 'SELECT * FROM game_stats WHERE user_id = ?';
  const queryParams: any[] = [params.userId];

  if (params.gameType) {
    query += ' AND game_type = ?';
    queryParams.push(params.gameType);
  }

  if (params.statType) {
    query += ' AND stat_type = ?';
    queryParams.push(params.statType);
  }

  query += ' ORDER BY recorded_at DESC LIMIT ? OFFSET ?';
  queryParams.push(params.limit || 100, params.offset || 0);

  const rows = db.prepare(query).all(...queryParams);

  return rows.map((row: any) => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null
  }));
}

/**
 * Get aggregated stats for a user
 */
export interface GetUserStatsParams {
  userId: string;
  gameType?: 'clicker' | 'fishing';
}

export function getUserStats(params: GetUserStatsParams): any {
  const db = getStatsDB();

  let whereClause = 'WHERE user_id = ?';
  const queryParams: any[] = [params.userId];

  if (params.gameType) {
    whereClause += ' AND game_type = ?';
    queryParams.push(params.gameType);
  }

  // Get total clicks
  const totalClicks = db.prepare(`
    SELECT COUNT(*) as count FROM game_stats
    ${whereClause} AND stat_type = 'click'
  `).get(...queryParams) as { count: number };

  // Get total fish caught
  const totalFish = db.prepare(`
    SELECT SUM(value) as total FROM game_stats
    ${whereClause} AND stat_type = 'fish_caught'
  `).get(...queryParams) as { total: number | null };

  // Get best score from high scores
  let highScore: number | null = null;
  if (params.gameType) {
    const score = db.prepare(`
      SELECT score FROM high_scores
      WHERE user_id = ? AND game_type = ?
    `).get(params.userId, params.gameType) as { score: number } | undefined;
    highScore = score?.score ?? null;
  } else {
    // Get best across all games
    const best = db.prepare(`
      SELECT MAX(score) as best FROM high_scores
      WHERE user_id = ?
    `).get(params.userId) as { best: number | null };
    highScore = best?.best ?? null;
  }

  // Get total sessions
  const totalSessions = db.prepare(`
    SELECT COUNT(DISTINCT DATE(recorded_at)) as sessions FROM game_stats
    ${whereClause}
  `).get(...queryParams) as { sessions: number };

  return {
    totalClicks: totalClicks.count || 0,
    totalFishCaught: totalFish?.total || 0,
    highScore,
    totalSessions: totalSessions.sessions || 0
  };
}

/**
 * Get leaderboard for a game type
 */
export interface GetLeaderboardParams {
  gameType: 'clicker' | 'fishing';
  limit?: number;
}

export function getLeaderboard(params: GetLeaderboardParams): any[] {
  const db = getStatsDB();

  const query = `
    SELECT
      user_id,
      user_name,
      game_type,
      score,
      recorded_at,
      updated_at
    FROM high_scores
    WHERE game_type = ?
    ORDER BY score DESC
    LIMIT ?
  `;

  const rows = db.prepare(query).all(params.gameType, params.limit || 10);

  return rows.map((row: any, index: number) => ({
    rank: index + 1,
    userId: row.user_id,
    userName: row.user_name,
    gameType: row.game_type,
    score: row.score,
    recordedAt: row.recorded_at,
    updatedAt: row.updated_at
  }));
}

/**
 * Get global stats across all users
 */
export interface GetGlobalStatsParams {
  gameType?: 'clicker' | 'fishing';
  statType?: string;
  timeRange?: 'hour' | 'day' | 'week' | 'month';
}

export function getGlobalStats(params: GetGlobalStatsParams): any {
  const db = getStatsDB();

  let whereClause = 'WHERE 1=1';
  const queryParams: any[] = [];

  if (params.gameType) {
    whereClause += ' AND game_type = ?';
    queryParams.push(params.gameType);
  }

  if (params.statType) {
    whereClause += ' AND stat_type = ?';
    queryParams.push(params.statType);
  }

  // Add time range filter
  if (params.timeRange) {
    const timeMap: Record<string, string> = {
      hour: "datetime('now', '-1 hour')",
      day: "datetime('now', '-1 day')",
      week: "datetime('now', '-7 days')",
      month: "datetime('now', '-1 month')"
    };
    whereClause += ` AND recorded_at >= ${timeMap[params.timeRange]}`;
  }

  // Get total count/value
  let totalCount = 0;
  if (params.statType === 'fish_caught') {
    const result = db.prepare(`
      SELECT SUM(value) as total FROM game_stats
      ${whereClause}
    `).get(...queryParams) as { total: number | null };
    totalCount = result?.total || 0;
  } else {
    const result = db.prepare(`
      SELECT COUNT(*) as total FROM game_stats
      ${whereClause}
    `).get(...queryParams) as { total: number };
    totalCount = result.total;
  }

  // Get unique users
  const uniqueUsers = db.prepare(`
    SELECT COUNT(DISTINCT user_id) as users FROM game_stats
    ${whereClause}
  `).get(...queryParams) as { users: number };

  return {
    total: totalCount,
    uniqueUsers: uniqueUsers.users,
    timeRange: params.timeRange || 'all'
  };
}

/**
 * Daily Challenges Functions
 */

export interface DailyChallenge {
  id: number;
  userId: string;
  challengeType: string;
  description: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  completed: boolean;
  date: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Challenge templates
 */
const CHALLENGE_TEMPLATES = [
  { type: 'clicks', description: 'Click {target} times today', statType: 'click' },
  { type: 'fish_caught', description: 'Catch {target} fish today', statType: 'fish_caught' },
  { type: 'fishing_score', description: 'Score {target} points in fishing', statType: 'score' },
  { type: 'clicker_score', description: 'Score {target} points in clicker', statType: 'score' }
];

/**
 * Generate random daily challenges for a user
 */
export function generateDailyChallenges(userId: string): DailyChallenge[] {
  const db = getStatsDB();
  const today = getTodayDate();
  const challenges: DailyChallenge[] = [];

  // Generate 3 random challenges
  for (let i = 0; i < 3; i++) {
    const template = CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)];
    const targetValue = Math.floor(Math.random() * 10 + 1) * 10; // 10, 20, 30... 100

    try {
      const stmt = db.prepare(`
        INSERT INTO daily_challenges (
          user_id, challenge_type, description, target_value,
          current_value, progress, completed, date
        )
        VALUES (?, ?, ?, ?, 0, 0, 0, ?)
      `);

      const description = template.description.replace('{target}', targetValue.toString());
      const result = stmt.run(
        userId,
        template.type,
        description,
        targetValue,
        today
      );

      challenges.push({
        id: result.lastInsertRowid as number,
        userId,
        challengeType: template.type,
        description,
        targetValue,
        currentValue: 0,
        progress: 0,
        completed: false,
        date: today,
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      // If duplicate (UNIQUE constraint), skip
      if (!error.message.includes('UNIQUE')) {
        console.error('Error generating challenge:', error);
      }
    }
  }

  return challenges;
}

/**
 * Get or create daily challenges for a user
 */
export function getDailyChallenges(userId: string): DailyChallenge[] {
  const db = getStatsDB();
  const today = getTodayDate();

  // Try to get existing challenges
  const existing = db.prepare(`
    SELECT * FROM daily_challenges
    WHERE user_id = ? AND date = ?
  `).all(userId, today) as any[];

  if (existing.length > 0) {
    return existing.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      challengeType: row.challenge_type,
      description: row.description,
      targetValue: row.target_value,
      currentValue: row.current_value,
      progress: row.progress,
      completed: !!row.completed,
      date: row.date,
      createdAt: row.created_at,
      completedAt: row.completed_at
    }));
  }

  // No challenges for today, generate new ones
  return generateDailyChallenges(userId);
}

/**
 * Update challenge progress
 */
export function updateChallengeProgress(userId: string, gameType: 'clicker' | 'fishing', statType: string, value: number): void {
  const db = getStatsDB();
  const today = getTodayDate();

  // Map gameType and statType to challenge_type
  let challengeType = '';
  if (gameType === 'clicker') {
    if (statType === 'click') challengeType = 'clicks';
    else if (statType === 'score') challengeType = 'clicker_score';
  } else if (gameType === 'fishing') {
    if (statType === 'fish_caught') challengeType = 'fish_caught';
    else if (statType === 'score') challengeType = 'fishing_score';
  }

  if (!challengeType) return;

  // Get the challenge
  const challenge = db.prepare(`
    SELECT * FROM daily_challenges
    WHERE user_id = ? AND date = ? AND challenge_type = ? AND completed = 0
  `).get(userId, today, challengeType) as any;

  if (!challenge) return;

  // Update progress
  const newValue = challenge.current_value + value;
  const progress = Math.min((newValue / challenge.target_value) * 100, 100);
  const completed = newValue >= challenge.target_value;

  const stmt = db.prepare(`
    UPDATE daily_challenges
    SET current_value = ?, progress = ?, completed = ?, completed_at = ?
    WHERE id = ?
  `);

  stmt.run(
    newValue,
    progress,
    completed ? 1 : 0,
    completed ? new Date().toISOString() : null,
    challenge.id
  );
}

/**
 * Complete a challenge manually (for testing/cheat mode)
 */
export function completeChallenge(userId: string, challengeId: number): boolean {
  const db = getStatsDB();
  const today = getTodayDate();

  const stmt = db.prepare(`
    UPDATE daily_challenges
    SET completed = 1, current_value = target_value, progress = 100,
        completed_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ? AND date = ?
  `);

  const result = stmt.run(challengeId, userId, today);
  return result.changes > 0;
}

/**
 * Achievement System
 */

export interface Achievement {
  id: number;
  userId: string;
  achievementId: string;
  achievementName: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface AchievementTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: any) => boolean;
}

const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  {
    id: 'first_click',
    name: 'Clicker Novice',
    description: 'Click 1 time in the clicker game',
    icon: '👆',
    condition: (stats) => stats.totalClicks >= 1
  },
  {
    id: 'hundred_clicks',
    name: 'Clicker Apprentice',
    description: 'Click 100 times in the clicker game',
    icon: '🖱️',
    condition: (stats) => stats.totalClicks >= 100
  },
  {
    id: 'thousand_clicks',
    name: 'Clicker Master',
    description: 'Click 1,000 times in the clicker game',
    icon: '🏆',
    condition: (stats) => stats.totalClicks >= 1000
  },
  {
    id: 'first_fish',
    name: 'Fisherman\'s Luck',
    description: 'Catch your first fish',
    icon: '🎣',
    condition: (stats) => stats.totalFishCaught >= 1
  },
  {
    id: 'ten_fish',
    name: 'Skilled Angler',
    description: 'Catch 10 fish',
    icon: '🐟',
    condition: (stats) => stats.totalFishCaught >= 10
  },
  {
    id: 'fifty_fish',
    name: 'Fishing Champion',
    description: 'Catch 50 fish',
    icon: '🦈',
    condition: (stats) => stats.totalFishCaught >= 50
  },
  {
    id: 'clicker_score_100',
    name: 'Clicker Scorer',
    description: 'Score 100 points in the clicker game',
    icon: '🍄',
    condition: (stats) => stats.highScore >= 100
  },
  {
    id: 'clicker_score_1000',
    name: 'Clicker Pro',
    description: 'Score 1,000 points in the clicker game',
    icon: '🌟',
    condition: (stats) => stats.highScore >= 1000
  },
  {
    id: 'fishing_score_100',
    name: 'Fishing Scorer',
    description: 'Score 100 points in the fishing game',
    icon: '🎯',
    condition: (stats) => stats.highScore >= 100
  },
  {
    id: 'fishing_score_500',
    name: 'Fishing Pro',
    description: 'Score 500 points in the fishing game',
    icon: '🌊',
    condition: (stats) => stats.highScore >= 500
  },
  {
    id: 'first_challenge',
    name: 'Challenge Accepted',
    description: 'Complete your first daily challenge',
    icon: '🎯',
    condition: () => false // This requires special checking
  },
  {
    id: 'dedicated_player',
    name: 'Dedicated Player',
    description: 'Play on 3 different days',
    icon: '📅',
    condition: (stats) => stats.totalSessions >= 3
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play on 7 different days',
    icon: '🎖️',
    condition: (stats) => stats.totalSessions >= 7
  }
];

/**
 * Get all unlocked achievements for a user
 */
export function getAchievements(userId: string): Achievement[] {
  const db = getStatsDB();

  const rows = db.prepare(`
    SELECT * FROM achievements
    WHERE user_id = ?
    ORDER BY unlocked_at DESC
  `).all(userId) as any[];

  return rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    achievementId: row.achievement_id,
    achievementName: row.achievement_name,
    description: row.description,
    icon: row.icon,
    unlockedAt: row.unlocked_at
  }));
}

/**
 * Get available achievements (both unlocked and locked)
 */
export function getAllAchievements(userId: string): Array<{ template: AchievementTemplate; unlocked: boolean; unlockedAt?: string }> {
  const unlocked = getAchievements(userId);
  const unlockedIds = new Set(unlocked.map(a => a.achievementId));

  return ACHIEVEMENT_TEMPLATES.map(template => ({
    template,
    unlocked: unlockedIds.has(template.id),
    unlockedAt: unlocked.find(a => a.achievementId === template.id)?.unlockedAt
  }));
}

/**
 * Unlock an achievement
 */
export function unlockAchievement(userId: string, achievementTemplate: AchievementTemplate): boolean {
  const db = getStatsDB();

  try {
    const stmt = db.prepare(`
      INSERT INTO achievements (user_id, achievement_id, achievement_name, description, icon)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      achievementTemplate.id,
      achievementTemplate.name,
      achievementTemplate.description,
      achievementTemplate.icon
    );

    return result.changes > 0;
  } catch (error: any) {
    // Already unlocked
    if (error.message.includes('UNIQUE')) {
      return false;
    }
    throw error;
  }
}

/**
 * Check and unlock achievements based on user stats
 */
export function checkAchievements(userId: string): string[] {
  const db = getStatsDB();

  // Get user stats
  const userStats = getUserStats({ userId });

  // Check each achievement template
  const newUnlocks: string[] = [];

  for (const template of ACHIEVEMENT_TEMPLATES) {
    // Skip special achievements that need different checking
    if (template.id === 'first_challenge') {
      // Check if user completed at least one daily challenge
      const completed = db.prepare(`
        SELECT COUNT(*) as count FROM daily_challenges
        WHERE user_id = ? AND completed = 1
      `).get(userId) as { count: number };

      if (completed.count >= 1) {
        if (unlockAchievement(userId, template)) {
          newUnlocks.push(template.name);
        }
      }
      continue;
    }

    // Check condition
    if (template.condition(userStats)) {
      if (unlockAchievement(userId, template)) {
        newUnlocks.push(template.name);
      }
    }
  }

  return newUnlocks;
}

/**
 * Get achievement progress (for UI display)
 */
export function getAchievementProgress(userId: string): any {
  const allAchievements = getAllAchievements(userId);
  const unlocked = allAchievements.filter(a => a.unlocked);

  return {
    total: allAchievements.length,
    unlocked: unlocked.length,
    locked: allAchievements.length - unlocked.length,
    percentage: Math.round((unlocked.length / allAchievements.length) * 100)
  };
}
