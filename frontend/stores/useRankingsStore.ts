/**
 * Rankings Store
 *
 * Pinia store for global rankings state.
 * Handles fetching and managing rankings data across the application.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generalRepository } from '../repositories/general.repository'

export interface RankingItem {
  name: string
  score: number
  avatar: string
  isCurrentUser?: boolean
}

export const useRankingsStore = defineStore('rankings', () => {
  // State
  const rankings = ref<RankingItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Load rankings from the server
   */
  const loadRankings = async () => {
    loading.value = true
    error.value = null

    try {
      rankings.value = await generalRepository.getRankings()
    } catch (err) {
      console.error('Failed to load rankings:', err)
      error.value = 'Failed to load rankings'
    } finally {
      loading.value = false
    }
  }

  /**
   * Get trend class for styling based on index
   */
  const getTrendClass = (index: number) => {
    const trends = ['trend-up', 'trend-down', 'trend-same']
    return trends[index % trends.length]
  }

  /**
   * Clear rankings state
   */
  const clearRankings = () => {
    rankings.value = []
    error.value = null
  }

  return {
    // State
    rankings,
    loading,
    error,

    // Actions
    loadRankings,
    getTrendClass,
    clearRankings
  }
})
