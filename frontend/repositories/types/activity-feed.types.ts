export interface ActivityItem {
  id: number
  userId: string
  userName: string
  userAvatar: string
  activityType: string
  description: string
  metadata: Record<string, any> | null
  pointsChange: number
  gameType: 'clicker' | 'fishing' | null
  recordedAt: string
}

export interface ActivityFeedResponse {
  activities: ActivityItem[]
  count: number
  timestamp: string
}

export interface UserActivityFeedResponse {
  activities: ActivityItem[]
  count: number
  timestamp: string
}

export interface UserActivityStats {
  totalActivities: number
  pointsEarned: number
  achievementsUnlocked: number
  gamesPlayed: number
}

export interface UserActivityStatsResponse {
  success: boolean
  stats: UserActivityStats
  timestamp: string
}

export interface ActivityTypesResponse {
  types: string[]
}
