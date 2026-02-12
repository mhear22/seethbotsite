import prisma from './lib/prisma';

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

export async function recordActivity(params: RecordActivityParams): Promise<number> {
  const userId = parseInt(params.userId, 10);
  if (isNaN(userId)) {
    throw new Error(`Invalid userId: ${params.userId}`);
  }

  const activity = await prisma.activity.create({
    data: {
      user_id: userId,
      user_name: params.userName || 'Anonymous',
      user_avatar: params.userAvatar || '👤',
      activity_type: params.activityType,
      description: params.description,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      points_change: params.pointsChange || 0,
      game_type: params.gameType || null,
    },
  });

  // Keep only the last 1000 activities per user to prevent database bloat
  await cleanupOldActivities(params.userId);

  return activity.id;
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

export async function getActivityFeed(params: GetActivityFeedParams): Promise<any[]> {
  const where: any = {};

  if (params.userId) {
    const userId = parseInt(params.userId, 10);
    if (!isNaN(userId)) {
      where.user_id = userId;
    }
  }

  if (params.activityType) {
    where.activity_type = params.activityType;
  }

  if (params.gameType) {
    where.game_type = params.gameType;
  }

  const rows = await prisma.activity.findMany({
    where,
    orderBy: {
      recorded_at: 'desc',
    },
    take: params.limit || 50,
    skip: params.offset || 0,
  });

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id.toString(),
    userName: row.user_name,
    userAvatar: row.user_avatar,
    activityType: row.activity_type,
    description: row.description,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    pointsChange: row.points_change,
    gameType: row.game_type,
    recordedAt: row.recorded_at,
  }));
}

/**
 * Get recent activity across all users (for global feed)
 */
export async function getGlobalActivity(params: { limit?: number; offset?: number }): Promise<any[]> {
  const rows = await prisma.activity.findMany({
    orderBy: {
      recorded_at: 'desc',
    },
    take: params.limit || 50,
    skip: params.offset || 0,
  });

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id.toString(),
    userName: row.user_name,
    userAvatar: row.user_avatar,
    activityType: row.activity_type,
    description: row.description,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    pointsChange: row.points_change,
    gameType: row.game_type,
    recordedAt: row.recorded_at,
  }));
}

/**
 * Get activity statistics for a user
 */
export async function getUserActivityStats(userId: string): Promise<{
  totalActivities: number;
  pointsEarned: number;
  achievementsUnlocked: number;
  gamesPlayed: number;
}> {
  const numericUserId = parseInt(userId, 10);
  if (isNaN(numericUserId)) {
    return {
      totalActivities: 0,
      pointsEarned: 0,
      achievementsUnlocked: 0,
      gamesPlayed: 0,
    };
  }

  const totalActivities = await prisma.activity.count({
    where: { user_id: numericUserId },
  });

  const pointsResult = await prisma.activity.aggregate({
    where: {
      user_id: numericUserId,
      points_change: { gt: 0 },
    },
    _sum: {
      points_change: true,
    },
  });

  const achievementsUnlocked = await prisma.activity.count({
    where: {
      user_id: numericUserId,
      activity_type: ActivityType.ACHIEVEMENT_UNLOCKED,
    },
  });

  // For gamesPlayed, we need to count distinct sessionId from metadata
  // This requires raw query since Prisma doesn't support JSON path extraction directly
  const gamesPlayedResult = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(DISTINCT (metadata->>'sessionId')) as count
    FROM "Activity"
    WHERE user_id = ${numericUserId} AND activity_type = ${ActivityType.GAME_PLAYED}
  `;

  return {
    totalActivities: totalActivities || 0,
    pointsEarned: pointsResult._sum.points_change || 0,
    achievementsUnlocked: achievementsUnlocked || 0,
    gamesPlayed: Number(gamesPlayedResult[0]?.count || 0),
  };
}

/**
 * Clean up old activities (keep only last N per user)
 */
async function cleanupOldActivities(userId: string, keepCount: number = 1000): Promise<void> {
  const numericUserId = parseInt(userId, 10);
  if (isNaN(numericUserId)) {
    return;
  }

  // Get count of activities for this user
  const count = await prisma.activity.count({
    where: { user_id: numericUserId },
  });

  if (count > keepCount) {
    // Get the IDs of activities to keep (most recent ones)
    const activitiesToKeep = await prisma.activity.findMany({
      where: { user_id: numericUserId },
      orderBy: { recorded_at: 'desc' },
      take: keepCount,
      select: { id: true },
    });

    const idsToKeep = activitiesToKeep.map((a) => a.id);

    // Delete activities that are not in the keep list
    await prisma.activity.deleteMany({
      where: {
        user_id: numericUserId,
        id: { notIn: idsToKeep },
      },
    });
  }
}

/**
 * Delete old activities globally (cleanup job)
 */
export async function cleanupOldGlobalActivities(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.activity.deleteMany({
    where: {
      recorded_at: { lt: cutoffDate },
    },
  });

  return result.count;
}
