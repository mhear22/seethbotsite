import { ref } from 'vue'

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
      const response = await fetch('/api/rankings')
      const data = await response.json()
      rankings.value = data
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
