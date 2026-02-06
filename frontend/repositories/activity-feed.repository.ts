import type {
  ActivityFeedResponse,
  UserActivityFeedResponse,
  UserActivityStatsResponse,
  ActivityTypesResponse
} from './types/activity-feed.types'

const API_BASE = '/api/activity-feed'

export const activityFeedRepository = {
  /**
   * Get global activity feed
   */
  async getGlobalActivity(params?: { limit?: number; offset?: number }): Promise<ActivityFeedResponse> {
    const queryParams = new URLSearchParams()

    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const response = await fetch(`${API_BASE}?${queryParams.toString()}`)
    if (!response.ok) {
      throw new Error('Failed to fetch activity feed')
    }

    return response.json()
  },

  /**
   * Get activity feed for a specific user
   */
  async getUserActivity(
    userId: string,
    params?: {
      limit?: number
      offset?: number
      type?: string
      gameType?: 'clicker' | 'fishing'
    }
  ): Promise<UserActivityFeedResponse> {
    const queryParams = new URLSearchParams()

    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    if (params?.type) queryParams.append('type', params.type)
    if (params?.gameType) queryParams.append('gameType', params.gameType)

    const response = await fetch(`${API_BASE}/user/${userId}?${queryParams.toString()}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user activity feed')
    }

    return response.json()
  },

  /**
   * Get activity statistics for a user
   */
  async getUserActivityStats(userId: string): Promise<UserActivityStatsResponse> {
    const response = await fetch(`${API_BASE}/stats/${userId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user activity stats')
    }

    return response.json()
  },

  /**
   * Get available activity types
   */
  async getActivityTypes(): Promise<ActivityTypesResponse> {
    const response = await fetch(`${API_BASE}/types`)
    if (!response.ok) {
      throw new Error('Failed to fetch activity types')
    }

    return response.json()
  }
}
