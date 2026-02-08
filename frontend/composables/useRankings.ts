/**
 * Rankings Composable
 *
 * Thin wrapper around useRankingsStore Pinia store.
 * Provides backward compatibility while delegating to centralized store.
 * @deprecated Prefer using useRankingsStore directly for new code
 */

import { useRankingsStore } from '../stores/useRankingsStore'

// Re-export types from store
export type { RankingItem } from '../stores/useRankingsStore'

// Export composable that wraps to store
export function useRankings() {
  const rankingsStore = useRankingsStore()

  return {
    rankings: rankingsStore.rankings,
    loading: rankingsStore.loading,
    error: rankingsStore.error,
    loadRankings: rankingsStore.loadRankings,
    getTrendClass: rankingsStore.getTrendClass,
    clearRankings: rankingsStore.clearRankings
  }
}
