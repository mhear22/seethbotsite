import apiClient from '../utils/apiClient'
import type {
  Achievement,
  AchievementDisplay,
  AchievementProgress,
  AchievementsResponse,
  AllAchievementsResponse,
  AchievementProgressResponse,
  CheckAchievementsResponse
} from './types/achievements.types'

// Helper to get user ID from localStorage
const getUserId = (): string => {
  let id = localStorage.getItem('stats-user-id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('stats-user-id', id)
  }
  return id
}

export const achievementsRepository = {
  /**
   * Get unlocked achievements for the current user
   */
  async getAchievements(): Promise<Achievement[]> {
    const response = await apiClient.GET('/achievements', {
      headers: {
        'X-User-Id': getUserId()
      }
    })
    return (response as AchievementsResponse).achievements
  },

  /**
   * Get all achievements (both unlocked and locked)
   */
  async getAllAchievements(): Promise<AchievementDisplay[]> {
    const response = await apiClient.GET('/achievements/all', {
      headers: {
        'X-User-Id': getUserId()
      }
    })
    return (response as AllAchievementsResponse).achievements
  },

  /**
   * Get achievement progress for the current user
   */
  async getAchievementProgress(): Promise<AchievementProgress> {
    const response = await apiClient.GET('/achievements/progress', {
      headers: {
        'X-User-Id': getUserId()
      }
    })
    return (response as AchievementProgressResponse).progress
  },

  /**
   * Check and unlock achievements based on current stats
   */
  async checkAchievements(): Promise<CheckAchievementsResponse> {
    const response = await apiClient.POST('/achievements/check', {
      headers: {
        'X-User-Id': getUserId()
      },
      body: {}
    })
    return response as CheckAchievementsResponse
  }
}
