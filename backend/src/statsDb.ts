import { Prisma } from '@prisma/client';
import prisma from './lib/prisma';

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

export async function recordStat(params: RecordStatParams): Promise<void> {
  await prisma.gameStat.create({
    data: {
      user_id: parseInt(params.userId),
      game_type: params.gameType,
      stat_type: params.statType,
      value: params.value,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
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

export async function updateHighScore(params: UpdateHighScoreParams): Promise<boolean> {
  const userId = parseInt(params.userId);

  // Check if user already has a high score
  const existing = await prisma.highScore.findFirst({
    where: {
      user_id: userId,
      game_type: params.gameType,
    },
  });

  if (existing) {
    // Only update if new score is higher
    if (params.score > existing.score) {
      await prisma.highScore.update({
        where: { id: existing.id },
        data: {
          score: params.score,
          details: params.details ? JSON.stringify(params.details) : null,
          updated_at: new Date(),
        },
      });
      return true;
    }
    return false;
  } else {
    // Insert new high score
    await prisma.highScore.create({
      data: {
        user_id: userId,
        user_name: params.userName || null,
        game_type: params.gameType,
        score: params.score,
        details: params.details ? JSON.stringify(params.details) : null,
      },
    });
    return true;
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

export async function getStatsHistory(params: GetStatsHistoryParams): Promise<any[]> {
  const userId = parseInt(params.userId);

  const where: any = { user_id: userId };

  if (params.gameType) {
    where.game_type = params.gameType;
  }

  if (params.statType) {
    where.stat_type = params.statType;
  }

  const rows = await prisma.gameStat.findMany({
    where,
    orderBy: { recorded_at: 'desc' },
    take: params.limit || 100,
    skip: params.offset || 0,
  });

  return rows.map((row) => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
  }));
}

/**
 * Get aggregated stats for a user
 */
export interface GetUserStatsParams {
  userId: string;
  gameType?: 'clicker' | 'fishing';
}

export async function getUserStats(params: GetUserStatsParams): Promise<any> {
  const userId = parseInt(params.userId);

  const where: any = { user_id: userId };

  if (params.gameType) {
    where.game_type = params.gameType;
  }

  // Get total clicks
  const totalClicksResult = await prisma.gameStat.count({
    where: {
      ...where,
      stat_type: 'click',
    },
  });

  // Get total fish caught
  const totalFishResult = await prisma.gameStat.aggregate({
    where: {
      ...where,
      stat_type: 'fish_caught',
    },
    _sum: {
      value: true,
    },
  });

  // Get best score from high scores
  let highScore: number | null = null;
  if (params.gameType) {
    const score = await prisma.highScore.findFirst({
      where: {
        user_id: userId,
        game_type: params.gameType,
      },
    });
    highScore = score?.score ?? null;
  } else {
    // Get best across all games
    const best = await prisma.highScore.aggregate({
      where: { user_id: userId },
      _max: {
        score: true,
      },
    });
    highScore = best._max.score ?? null;
  }

  // Get total sessions (using Prisma's $queryRaw for DATE() function)
  const sessionsResult = await prisma.$queryRaw<{ sessions: number }[]>`
    SELECT COUNT(DISTINCT DATE(recorded_at)) as sessions
    FROM "GameStat"
    WHERE user_id = ${userId}
    ${params.gameType ? Prisma.sql`AND game_type = ${params.gameType}` : Prisma.sql``}
  `;
  const totalSessions = sessionsResult[0]?.sessions || 0;

  return {
    totalClicks: totalClicksResult || 0,
    totalFishCaught: totalFishResult._sum.value || 0,
    highScore,
    totalSessions: totalSessions || 0,
  };
}

/**
 * Get leaderboard for a game type
 */
export interface GetLeaderboardParams {
  gameType: 'clicker' | 'fishing';
  limit?: number;
}

export async function getLeaderboard(params: GetLeaderboardParams): Promise<any[]> {
  const rows = await prisma.highScore.findMany({
    where: {
      game_type: params.gameType,
    },
    orderBy: { score: 'desc' },
    take: params.limit || 10,
  });

  return rows.map((row, index) => ({
    rank: index + 1,
    userId: row.user_id,
    userName: row.user_name,
    gameType: row.game_type,
    score: row.score,
    recordedAt: row.recorded_at,
    updatedAt: row.updated_at,
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

export async function getGlobalStats(params: GetGlobalStatsParams): Promise<any> {
  const where: any = {};

  if (params.gameType) {
    where.game_type = params.gameType;
  }

  if (params.statType) {
    where.stat_type = params.statType;
  }

  // Add time range filter
  if (params.timeRange) {
    const timeMap: Record<string, Date> = {
      hour: new Date(Date.now() - 60 * 60 * 1000),
      day: new Date(Date.now() - 24 * 60 * 60 * 1000),
      week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    };
    where.recorded_at = {
      gte: timeMap[params.timeRange],
    };
  }

  // Get total count/value
  let totalCount = 0;
  if (params.statType === 'fish_caught') {
    const result = await prisma.gameStat.aggregate({
      where,
      _sum: {
        value: true,
      },
    });
    totalCount = result._sum.value || 0;
  } else {
    const result = await prisma.gameStat.count({ where });
    totalCount = result;
  }

  // Get unique users
  const uniqueUsersResult = await prisma.gameStat.aggregate({
    where,
    _count: {
      user_id: true,
    },
  });

  // For actual distinct count, we need a different approach
  const distinctUsers = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(DISTINCT user_id) as count
    FROM "GameStat"
    WHERE 1=1
    ${params.gameType ? Prisma.sql`AND game_type = ${params.gameType}` : Prisma.sql``}
    ${params.statType ? Prisma.sql`AND stat_type = ${params.statType}` : Prisma.sql``}
    ${params.timeRange ? getTimeRangeCondition(params.timeRange) : Prisma.sql``}
  `;

  return {
    total: totalCount,
    uniqueUsers: Number(distinctUsers[0]?.count || 0),
    timeRange: params.timeRange || 'all',
  };
}

/**
 * Daily Challenges Functions
 */

export interface DailyChallenge {
  id: number;
  userId: number;
  challengeType: string;
  description: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  completed: boolean;
  date: string;
  createdAt: Date;
  completedAt?: Date | null;
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
  { type: 'clicker_score', description: 'Score {target} points in clicker', statType: 'score' },
];

/**
 * Generate random daily challenges for a user
 */
export async function generateDailyChallenges(userId: string): Promise<DailyChallenge[]> {
  const numericUserId = parseInt(userId);
  const today = getTodayDate();
  const challenges: DailyChallenge[] = [];

  // Generate 3 random challenges
  for (let i = 0; i < 3; i++) {
    const template = CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)];
    const targetValue = Math.floor(Math.random() * 10 + 1) * 10; // 10, 20, 30... 100

    try {
      const description = template.description.replace('{target}', targetValue.toString());

      const challenge = await prisma.dailyChallenge.create({
        data: {
          user_id: numericUserId,
          challenge_type: template.type,
          description,
          target_value: targetValue,
          current_value: 0,
          progress: 0,
          completed: false,
          date: today,
        },
      });

      challenges.push({
        id: challenge.id,
        userId: challenge.user_id,
        challengeType: challenge.challenge_type,
        description: challenge.description,
        targetValue: challenge.target_value,
        currentValue: challenge.current_value,
        progress: challenge.progress,
        completed: challenge.completed,
        date: challenge.date,
        createdAt: challenge.created_at,
        completedAt: challenge.completed_at,
      });
    } catch (error: any) {
      // If duplicate (UNIQUE constraint), skip
      if (!error.message.includes('Unique constraint')) {
        console.error('Error generating challenge:', error);
      }
    }
  }

  return challenges;
}

/**
 * Get or create daily challenges for a user
 */
export async function getDailyChallenges(userId: string): Promise<DailyChallenge[]> {
  const numericUserId = parseInt(userId);
  const today = getTodayDate();

  // Try to get existing challenges
  const existing = await prisma.dailyChallenge.findMany({
    where: {
      user_id: numericUserId,
      date: today,
    },
  });

  if (existing.length > 0) {
    return existing.map((row) => ({
      id: row.id,
      userId: row.user_id,
      challengeType: row.challenge_type,
      description: row.description,
      targetValue: row.target_value,
      currentValue: row.current_value,
      progress: row.progress,
      completed: row.completed,
      date: row.date,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    }));
  }

  // No challenges for today, generate new ones
  return generateDailyChallenges(userId);
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
  userId: string,
  gameType: 'clicker' | 'fishing',
  statType: string,
  value: number
): Promise<void> {
  const numericUserId = parseInt(userId);
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
  const challenge = await prisma.dailyChallenge.findFirst({
    where: {
      user_id: numericUserId,
      date: today,
      challenge_type: challengeType,
      completed: false,
    },
  });

  if (!challenge) return;

  // Update progress
  const newValue = challenge.current_value + value;
  const progress = Math.min((newValue / challenge.target_value) * 100, 100);
  const completed = newValue >= challenge.target_value;

  await prisma.dailyChallenge.update({
    where: { id: challenge.id },
    data: {
      current_value: newValue,
      progress,
      completed,
      completed_at: completed ? new Date() : null,
    },
  });
}

/**
 * Complete a challenge manually (for testing/cheat mode)
 */
export async function completeChallenge(userId: string, challengeId: number): Promise<boolean> {
  const numericUserId = parseInt(userId);
  const today = getTodayDate();

  const result = await prisma.dailyChallenge.updateMany({
    where: {
      id: challengeId,
      user_id: numericUserId,
      date: today,
    },
    data: {
      completed: true,
      current_value: 0, // Will be set to target_value
      progress: 100,
      completed_at: new Date(),
    },
  });

  return result.count > 0;
}

/**
 * Achievement System
 */

export interface Achievement {
  id: number;
  userId: number;
  achievementId: string;
  achievementName: string;
  description: string;
  icon: string | null;
  unlockedAt: Date;
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
    condition: (stats) => stats.totalClicks >= 1,
  },
  {
    id: 'hundred_clicks',
    name: 'Clicker Apprentice',
    description: 'Click 100 times in the clicker game',
    icon: '🖱️',
    condition: (stats) => stats.totalClicks >= 100,
  },
  {
    id: 'thousand_clicks',
    name: 'Clicker Master',
    description: 'Click 1,000 times in the clicker game',
    icon: '🏆',
    condition: (stats) => stats.totalClicks >= 1000,
  },
  {
    id: 'first_fish',
    name: "Fisherman's Luck",
    description: 'Catch your first fish',
    icon: '🎣',
    condition: (stats) => stats.totalFishCaught >= 1,
  },
  {
    id: 'ten_fish',
    name: 'Skilled Angler',
    description: 'Catch 10 fish',
    icon: '🐟',
    condition: (stats) => stats.totalFishCaught >= 10,
  },
  {
    id: 'fifty_fish',
    name: 'Fishing Champion',
    description: 'Catch 50 fish',
    icon: '🦈',
    condition: (stats) => stats.totalFishCaught >= 50,
  },
  {
    id: 'clicker_score_100',
    name: 'Clicker Scorer',
    description: 'Score 100 points in the clicker game',
    icon: '🍄',
    condition: (stats) => stats.highScore >= 100,
  },
  {
    id: 'clicker_score_1000',
    name: 'Clicker Pro',
    description: 'Score 1,000 points in the clicker game',
    icon: '🌟',
    condition: (stats) => stats.highScore >= 1000,
  },
  {
    id: 'fishing_score_100',
    name: 'Fishing Scorer',
    description: 'Score 100 points in the fishing game',
    icon: '🎯',
    condition: (stats) => stats.highScore >= 100,
  },
  {
    id: 'fishing_score_500',
    name: 'Fishing Pro',
    description: 'Score 500 points in the fishing game',
    icon: '🌊',
    condition: (stats) => stats.highScore >= 500,
  },
  {
    id: 'first_challenge',
    name: 'Challenge Accepted',
    description: 'Complete your first daily challenge',
    icon: '🎯',
    condition: () => false, // This requires special checking
  },
  {
    id: 'dedicated_player',
    name: 'Dedicated Player',
    description: 'Play on 3 different days',
    icon: '📅',
    condition: (stats) => stats.totalSessions >= 3,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play on 7 different days',
    icon: '🎖️',
    condition: (stats) => stats.totalSessions >= 7,
  },
];

/**
 * Get all unlocked achievements for a user
 */
export async function getAchievements(userId: string): Promise<Achievement[]> {
  const numericUserId = parseInt(userId);

  const rows = await prisma.achievement.findMany({
    where: {
      user_id: numericUserId,
    },
    orderBy: {
      unlocked_at: 'desc',
    },
  });

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    achievementId: row.achievement_id,
    achievementName: row.achievement_name,
    description: row.description,
    icon: row.icon,
    unlockedAt: row.unlocked_at,
  }));
}

/**
 * Get available achievements (both unlocked and locked)
 */
export async function getAllAchievements(
  userId: string
): Promise<Array<{ template: AchievementTemplate; unlocked: boolean; unlockedAt?: Date }>> {
  const unlocked = await getAchievements(userId);
  const unlockedIds = new Set(unlocked.map((a) => a.achievementId));

  return ACHIEVEMENT_TEMPLATES.map((template) => ({
    template,
    unlocked: unlockedIds.has(template.id),
    unlockedAt: unlocked.find((a) => a.achievementId === template.id)?.unlockedAt,
  }));
}

/**
 * Unlock an achievement
 */
export async function unlockAchievement(
  userId: string,
  achievementTemplate: AchievementTemplate
): Promise<boolean> {
  const numericUserId = parseInt(userId);

  try {
    await prisma.achievement.create({
      data: {
        user_id: numericUserId,
        achievement_id: achievementTemplate.id,
        achievement_name: achievementTemplate.name,
        description: achievementTemplate.description,
        icon: achievementTemplate.icon,
      },
    });

    return true;
  } catch (error: any) {
    // Already unlocked
    if (error.message.includes('Unique constraint')) {
      return false;
    }
    throw error;
  }
}

/**
 * Check and unlock achievements based on user stats
 */
export async function checkAchievements(userId: string): Promise<string[]> {
  // Get user stats
  const userStats = await getUserStats({ userId });

  // Check each achievement template
  const newUnlocks: string[] = [];

  for (const template of ACHIEVEMENT_TEMPLATES) {
    // Skip special achievements that need different checking
    if (template.id === 'first_challenge') {
      // Check if user completed at least one daily challenge
      const completed = await prisma.dailyChallenge.count({
        where: {
          user_id: parseInt(userId),
          completed: true,
        },
      });

      if (completed >= 1) {
        if (await unlockAchievement(userId, template)) {
          newUnlocks.push(template.name);
        }
      }
      continue;
    }

    // Check condition
    if (template.condition(userStats)) {
      if (await unlockAchievement(userId, template)) {
        newUnlocks.push(template.name);
      }
    }
  }

  return newUnlocks;
}

/**
 * Get achievement progress (for UI display)
 */
export async function getAchievementProgress(userId: string): Promise<any> {
  const allAchievements = await getAllAchievements(userId);
  const unlocked = allAchievements.filter((a) => a.unlocked);

  return {
    total: allAchievements.length,
    unlocked: unlocked.length,
    locked: allAchievements.length - unlocked.length,
    percentage: Math.round((unlocked.length / allAchievements.length) * 100),
  };
}

/**
 * Helper function to get time range SQL condition
 */
function getTimeRangeCondition(timeRange: 'hour' | 'day' | 'week' | 'month') {
  const timeMap: Record<string, string> = {
    hour: "AND recorded_at >= datetime('now', '-1 hour')",
    day: "AND recorded_at >= datetime('now', '-1 day')",
    week: "AND recorded_at >= datetime('now', '-7 days')",
    month: "AND recorded_at >= datetime('now', '-1 month')",
  };
  return Prisma.sql([timeMap[timeRange]]);
}
