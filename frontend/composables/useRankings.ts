import { ref } from 'vue'
import { generalRepository } from '../repositories/general.repository'

export interface RankingItem {
  name: string
  score: number
  avatar: string
  isCurrentUser?: boolean
}

export function useRankings() {
  const rankings = ref<RankingItem[]>([])
  const loading = ref(false)

  const loadRankings = async () => {
    try {
      loading.value = true
      rankings.value = await generalRepository.getRankings()
    } catch (err) {
      console.error('Failed to load rankings:', err)
    } finally {
      loading.value = false
    }
  }

  const getTrendClass = (index: number) => {
    const trends = ['trend-up', 'trend-down', 'trend-same']
    return trends[index % trends.length]
  }

  return {
    rankings,
    loading,
    loadRankings,
    getTrendClass
  }
}
