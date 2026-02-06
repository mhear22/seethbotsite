import {
  recordActivity,
  ActivityType,
  RecordActivityParams
} from '../activityFeedDb';

/**
 * Activity Feed Service
 *
 * This service integrates with other parts of the system to automatically
 * record activities for the activity feed.
 */

// User data cache for avatars
const USER_AVATARS: Record<string, string> = {
  'cam': '🥔',
  'orlando': '🌙',
  'ashley': '<:flooshies:1000736727259947069>',
  'averagehex': '🌸',
  'temer3': '🔧',
  'changyi': '<:sadcat:1000736705197907968>',
  'goose': '🪿',
  'rium': '🎮',
  'goopsworthy': '🍄',
  'blair': '🎮',
  'claire': '✨',
  'shiyuan': '🧶',
  'meixiang': '🏍️'
};

/**
 * Get user avatar or default
 */
function getUserAvatar(userId: string): string {
  return USER_AVATARS[userId] || '👤';
}

/**
 * Record when a user earns points
 */
export function recordPointsEarned(params: {
  userId: string;
  userName?: string;
  points: number;
  reason: string;
}): void {
  const recordParams: RecordActivityParams = {
    userId: params.userId,
    userName: params.userName,
    userAvatar: getUserAvatar(params.userId),
    activityType: ActivityType.POINTS_EARNED,
    description: `Earned ${params.points} points: ${params.reason}`,
    pointsChange: params.points,
    metadata: {
      reason: params.reason
    }
  };

  recordActivity(recordParams);
}

/**
 * Record when a user earns bulk points (e.g., from idle clicker)
 */
export function recordPointsBulk(params: {
  userId: string;
  userName?: string;
  points: number;
  source: string;
}): void {
  const recordParams: RecordActivityParams = {
    userId: params.userId,
    userName: params.userName,
    userAvatar: getUserAvatar(params.userId),
    activityType: ActivityType.POINTS_BULK,
    description: `Earned ${params.points} points from ${params.source}`,
    pointsChange: params.points,
    metadata: {
      source: params.source
    }
  };

  recordActivity(recordParams);
}

/**
 * Record when a user unlocks an achievement
 */
export function recordAchievementUnlocked(params: {
  userId: string;
  userName?: string;
  achievementName: string;
  achievementDescription: string;
  icon: string;
}): void {
  const recordParams: RecordActivityParams = {
    userId: params.userId,
    userName: params.userName,
    userAvatar: getUserAvatar(params.userId),
    activityType: ActivityType.ACHIEVEMENT_UNLOCKED,
    description: `Unlocked achievement: ${params.achievementName}`,
    metadata: {
      achievementName: params.achievementName,
      achievementDescription: params.achievementDescription,
      icon: params.icon
    }
  };

  recordActivity(recordParams);
}

/**
 * Record when a user sets a high score
 */
export function recordHighScore(params: {
  userId: string;
  userName?: string;
  gameType: 'clicker' | 'fishing';
  score: number;
  previousScore?: number;
}): void {
  const gameEmoji = params.gameType === 'clicker' ? '🍄' : '🎣';
  const isNew = !params.previousScore || params.score > params.previousScore;

  const recordParams: RecordActivityParams = {
    userId: params.userId,
    userName: params.userName,
    userAvatar: getUserAvatar(params.userId),
    activityType: ActivityType.HIGH_SCORE,
    description: isNew
      ? `New ${params.gameType} high score: ${params.score} points! ${gameEmoji}`
      : `${params.gameType} score: ${params.score} points ${gameEmoji}`,
    gameType: params.gameType,
    metadata: {
      score: params.score,
      previousScore: params.previousScore,
      isNewRecord: isNew
    }
  };

  recordActivity(recordParams);
}

/**
 * Record when a user completes a daily challenge
 */
export function recordChallengeCompleted(params: {
  userId: string;
  userName?: string;
  challengeType: string;
  description: string;
  targetValue: number;
  finalValue: number;
}): void {
  const recordParams: RecordActivityParams = {
    userId: params.userId,
    userName: params.userName,
    userAvatar: getUserAvatar(params.userId),
    activityType: ActivityType.CHALLENGE_COMPLETED,
    description: `Completed daily challenge: ${params.description}`,
    metadata: {
      challengeType: params.challengeType,
      description: params.description,
      targetValue: params.targetValue,
      finalValue: params.finalValue
    }
  };

  recordActivity(recordParams);
}

/**
 * Record when a user plays a game
 */
export function recordGamePlayed(params: {
  userId: string;
  userName?: string;
  gameType: 'clicker' | 'fishing';
  score?: number;
  clicks?: number;
  fishCaught?: number;
  sessionId?: string;
}): void {
  const gameEmoji = params.gameType === 'clicker' ? '🍄' : '🎣';
  const gameTitle = params.gameType === 'clicker' ? 'Clicker' : 'Fishing';

  let description = `Played ${gameTitle} ${gameEmoji}`;

  if (params.score !== undefined) {
    description += ` - Score: ${params.score}`;
  }
  if (params.clicks !== undefined) {
    description += ` - Clicks: ${params.clicks}`;
  }
  if (params.fishCaught !== undefined) {
    description += ` - Fish: ${params.fishCaught}`;
  }

  const recordParams: RecordActivityParams = {
    userId: params.userId,
    userName: params.userName,
    userAvatar: getUserAvatar(params.userId),
    activityType: ActivityType.GAME_PLAYED,
    description,
    gameType: params.gameType,
    metadata: {
      score: params.score,
      clicks: params.clicks,
      fishCaught: params.fishCaught,
      sessionId: params.sessionId
    }
  };

  recordActivity(recordParams);
}

/**
 * Record when a user's ranking changes
 */
export function recordRankingChange(params: {
  userId: string;
  userName?: string;
  previousRank?: number;
  newRank: number;
  points: number;
}): void {
  const changeType = params.previousRank
    ? (params.newRank < params.previousRank ? 'climbed' : 'fell')
    : 'ranked';

  let description = '';

  if (params.previousRank) {
    const diff = params.previousRank - params.newRank;
    description = diff > 0
      ? `Climbed ${diff} positions to rank #${params.newRank}! 📈`
      : `Fell ${Math.abs(diff)} positions to rank #${params.newRank} 📉`;
  } else {
    description = `Ranked #${params.newRank} with ${params.points} points! 🏆`;
  }

  const recordParams: RecordActivityParams = {
    userId: params.userId,
    userName: params.userName,
    userAvatar: getUserAvatar(params.userId),
    activityType: ActivityType.RANKING_CHANGE,
    description,
    metadata: {
      previousRank: params.previousRank,
      newRank: params.newRank,
      points: params.points
    }
  };

  recordActivity(recordParams);
}

/**
 * Record when a user ends a session
 */
export function recordSessionEnd(params: {
  userId: string;
  userName?: string;
  gameType: 'clicker' | 'fishing';
  totalClicks?: number;
  totalScore?: number;
  sessionDuration?: number; // in seconds
}): void {
  const gameEmoji = params.gameType === 'clicker' ? '🍄' : '🎣';
  const gameTitle = params.gameType === 'clicker' ? 'Clicker' : 'Fishing';

  let description = `Finished ${gameTitle} session ${gameEmoji}`;

  if (params.totalClicks !== undefined) {
    description += ` - ${params.totalClicks} clicks`;
  }
  if (params.totalScore !== undefined) {
    description += ` - ${params.totalScore} points`;
  }
  if (params.sessionDuration !== undefined) {
    const minutes = Math.floor(params.sessionDuration / 60);
    const seconds = params.sessionDuration % 60;
    description += ` - ${minutes}m ${seconds}s`;
  }

  const recordParams: RecordActivityParams = {
    userId: params.userId,
    userName: params.userName,
    userAvatar: getUserAvatar(params.userId),
    activityType: ActivityType.SESSION_END,
    description,
    gameType: params.gameType,
    metadata: {
      totalClicks: params.totalClicks,
      totalScore: params.totalScore,
      sessionDuration: params.sessionDuration
    }
  };

  recordActivity(recordParams);
}
