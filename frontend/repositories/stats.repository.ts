import apiClient from '../utils/apiClient'

export interface RecordStatParams {
  userId: string
  userName?: string
  gameType: 'clicker' | 'fishing'
  statType: 'click' | 'fish_caught' | 'score' | 'session_end'
  value: number
  metadata?: Record<string, any>
}

export interface UpdateHighScoreParams {
  userId: string
  userName?: string
  gameType: 'clicker' | 'fishing'
  score: number
  details?: Record<string, any>
}

export interface GetStatsHistoryParams {
  userId: string
  gameType?: 'clicker' | 'fishing'
  statType?: string
  limit?: number
  offset?: number
}

export interface GetUserStatsParams {
  userId: string
  gameType?: 'clicker' | 'fishing'
}

export interface GetLeaderboardParams {
  gameType: 'clicker' | 'fishing'
  limit?: number
}

export interface GetGlobalStatsParams {
  gameType?: 'clicker' | 'fishing'
  statType?: string
  timeRange?: 'hour' | 'day' | 'week' | 'month'
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

// Helper to get user ID from localStorage
const getUserId = (): string => {
  let id = localStorage.getItem('stats-user-id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('stats-user-id', id)
  }
  return id
}

// Helper to get user name from localStorage
const getUserName = (): string | undefined => {
  return localStorage.getItem('user-name') || undefined
}

export const statsRepository = {
  async recordStat(params: RecordStatParams): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/stats/record', params, {
      headers: {
        'X-User-Id': params.userId || getUserId()
      }
    })
    return response.data
  },

  async updateHighScore(params: UpdateHighScoreParams): Promise<{ success: boolean; isNewRecord: boolean; score: number; message: string }> {
    const response = await apiClient.post('/stats/highscore', params, {
      headers: {
        'X-User-Id': params.userId || getUserId()
      }
    })
    return response.data
  },

  async getStatsHistory(params: GetStatsHistoryParams): Promise<{ history: Array<any> }> {
    const response = await apiClient.post('/stats/history', params, {
      headers: {
        'X-User-Id': params.userId || getUserId()
      }
    })
    return response.data
  },

  async getUserStats(params: GetUserStatsParams): Promise<UserStats> {
    const response = await apiClient.post('/stats/user', params, {
      headers: {
        'X-User-Id': params.userId || getUserId()
      }
    })
    return response.data
  },

  async getLeaderboard(params: GetLeaderboardParams): Promise<{ gameType: string; leaderboard: LeaderboardEntry[] }> {
    const userId = getUserId()
    const response = await apiClient.post('/stats/leaderboard', { ...params, userId }, {
      headers: {
        'X-User-Id': userId
      }
    })
    return response.data
  },

  async getGlobalStats(params?: GetGlobalStatsParams): Promise<GlobalStats> {
    const userId = getUserId()
    const response = await apiClient.post('/stats/global', params || {}, {
      headers: {
        'X-User-Id': userId
      }
    })
    return response.data
  }
}
