export interface StatsHistoryEntry {
  id: number
  userId: string
  gameType: 'clicker' | 'fishing'
  statType: 'click' | 'fish_caught' | 'score' | 'session_end'
  value: number
  metadata: Record<string, any> | null
  recordedAt: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string | null
  gameType: string
  score: number
  recordedAt: string
  updatedAt: string
}

export interface UserStats {
  userId: string
  gameType: string
  totalClicks: number
  totalFishCaught: number
  highScore: number | null
  totalSessions: number
}

export interface GlobalStats {
  total: number
  uniqueUsers: number
  timeRange: string
}

export interface GameStats {
  clicker: UserStats
  fishing: UserStats
}

export interface HighScoreResponse {
  success: boolean
  isNewRecord: boolean
  score: number
  message: string
}
