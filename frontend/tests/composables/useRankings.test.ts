/**
 * Tests for useRankings composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetRankings = vi.fn()

vi.mock('../../repositories/general.repository', () => ({
  generalRepository: {
    getRankings: (...args: any[]) => mockGetRankings(...args),
  },
}))

import { useRankings } from '../../composables/useRankings'

describe('useRankings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRankings.mockResolvedValue([])
  })

  it('initializes with empty rankings and loading false', () => {
    const { rankings, loading } = useRankings()

    expect(rankings.value).toEqual([])
    expect(loading.value).toBe(false)
  })

  it('loadRankings sets loading true then false', async () => {
    let resolvePromise: (value: any) => void
    mockGetRankings.mockReturnValue(
      new Promise(resolve => {
        resolvePromise = resolve
      })
    )

    const { loading, loadRankings } = useRankings()

    const loadPromise = loadRankings()

    // loading should be true while fetching
    expect(loading.value).toBe(true)

    // Resolve the promise
    resolvePromise!([])
    await loadPromise

    // loading should be false after completion
    expect(loading.value).toBe(false)
  })

  it('loadRankings sets rankings from API', async () => {
    const mockData = [
      { name: 'Alice', score: 100, avatar: 'alice.png' },
      { name: 'Bob', score: 80, avatar: 'bob.png' },
      { name: 'Charlie', score: 60, avatar: 'charlie.png' },
    ]
    mockGetRankings.mockResolvedValue(mockData)

    const { rankings, loadRankings } = useRankings()

    await loadRankings()

    expect(rankings.value).toEqual(mockData)
    expect(rankings.value).toHaveLength(3)
    expect(rankings.value[0].name).toBe('Alice')
  })

  it('loadRankings handles error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetRankings.mockRejectedValue(new Error('API error'))

    const { rankings, loading, loadRankings } = useRankings()

    await loadRankings()

    // Rankings should remain empty on error
    expect(rankings.value).toEqual([])
    // Loading should be set to false in the finally block
    expect(loading.value).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load rankings:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('getTrendClass returns correct trend class for each index', () => {
    const { getTrendClass } = useRankings()

    // The trends array is ['trend-up', 'trend-down', 'trend-same']
    // getTrendClass returns trends[index % 3]
    expect(getTrendClass(0)).toBe('trend-up')
    expect(getTrendClass(1)).toBe('trend-down')
    expect(getTrendClass(2)).toBe('trend-same')

    // Verify cycling for indices beyond 2
    expect(getTrendClass(3)).toBe('trend-up')
    expect(getTrendClass(4)).toBe('trend-down')
    expect(getTrendClass(5)).toBe('trend-same')
  })
})
