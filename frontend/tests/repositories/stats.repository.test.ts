/**
 * Tests for stats repository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPost = vi.fn()
vi.mock('../../repositories/../utils/apiClient', () => ({
  default: { post: (...args: any[]) => mockPost(...args) }
}))

import { statsRepository } from '../../repositories/stats.repository'

describe('statsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('recordStat', () => {
    it('should send correct endpoint and params', async () => {
      const params = {
        userId: 'user-abc',
        gameType: 'clicker' as const,
        statType: 'click' as const,
        value: 5
      }
      mockPost.mockResolvedValue({ data: { success: true, message: 'Recorded' } })

      const result = await statsRepository.recordStat(params)

      expect(mockPost).toHaveBeenCalledWith('/stats/record', params, {
        headers: {
          'X-User-Id': 'user-abc'
        }
      })
      expect(result).toEqual({ success: true, message: 'Recorded' })
    })

    it('should include X-User-Id header from params.userId', async () => {
      const params = {
        userId: 'specific-user-id',
        gameType: 'fishing' as const,
        statType: 'fish_caught' as const,
        value: 1
      }
      mockPost.mockResolvedValue({ data: { success: true, message: 'OK' } })

      await statsRepository.recordStat(params)

      expect(mockPost).toHaveBeenCalledWith(
        '/stats/record',
        params,
        expect.objectContaining({
          headers: { 'X-User-Id': 'specific-user-id' }
        })
      )
    })
  })

  describe('updateHighScore', () => {
    it('should send correct data', async () => {
      const params = {
        userId: 'user-hs',
        gameType: 'clicker' as const,
        score: 9999
      }
      mockPost.mockResolvedValue({
        data: { success: true, isNewRecord: true, score: 9999, message: 'New record!' }
      })

      const result = await statsRepository.updateHighScore(params)

      expect(mockPost).toHaveBeenCalledWith('/stats/highscore', params, {
        headers: { 'X-User-Id': 'user-hs' }
      })
      expect(result).toEqual({
        success: true,
        isNewRecord: true,
        score: 9999,
        message: 'New record!'
      })
    })
  })

  describe('getStatsHistory', () => {
    it('should return history', async () => {
      const params = {
        userId: 'user-hist',
        gameType: 'clicker' as const,
        limit: 10
      }
      const mockHistory = { history: [{ id: 1, value: 5 }, { id: 2, value: 10 }] }
      mockPost.mockResolvedValue({ data: mockHistory })

      const result = await statsRepository.getStatsHistory(params)

      expect(mockPost).toHaveBeenCalledWith('/stats/history', params, {
        headers: { 'X-User-Id': 'user-hist' }
      })
      expect(result).toEqual(mockHistory)
    })
  })

  describe('getUserStats', () => {
    it('should return user stats', async () => {
      const params = {
        userId: 'user-stats',
        gameType: 'fishing' as const
      }
      const mockUserStats = {
        userId: 'user-stats',
        gameType: 'fishing',
        totalClicks: 0,
        totalFishCaught: 42,
        highScore: 100,
        totalSessions: 5
      }
      mockPost.mockResolvedValue({ data: mockUserStats })

      const result = await statsRepository.getUserStats(params)

      expect(mockPost).toHaveBeenCalledWith('/stats/user', params, {
        headers: { 'X-User-Id': 'user-stats' }
      })
      expect(result).toEqual(mockUserStats)
    })
  })

  describe('getLeaderboard', () => {
    it('should add userId to request body', async () => {
      localStorage.setItem('stats-user-id', 'leaderboard-user')
      const params = {
        gameType: 'clicker' as const,
        limit: 10
      }
      mockPost.mockResolvedValue({
        data: { gameType: 'clicker', leaderboard: [] }
      })

      await statsRepository.getLeaderboard(params)

      // The repository spreads params and adds userId
      expect(mockPost).toHaveBeenCalledWith(
        '/stats/leaderboard',
        { ...params, userId: 'leaderboard-user' },
        { headers: { 'X-User-Id': 'leaderboard-user' } }
      )
    })
  })

  describe('getGlobalStats', () => {
    it('should work without params', async () => {
      localStorage.setItem('stats-user-id', 'global-user')
      mockPost.mockResolvedValue({
        data: { total: 5000, uniqueUsers: 100, timeRange: 'all' }
      })

      const result = await statsRepository.getGlobalStats()

      expect(mockPost).toHaveBeenCalledWith('/stats/global', {}, {
        headers: { 'X-User-Id': 'global-user' }
      })
      expect(result).toEqual({ total: 5000, uniqueUsers: 100, timeRange: 'all' })
    })

    it('should pass params when provided', async () => {
      localStorage.setItem('stats-user-id', 'global-user-2')
      const params = { gameType: 'fishing' as const, timeRange: 'week' as const }
      mockPost.mockResolvedValue({
        data: { total: 200, uniqueUsers: 15, timeRange: 'week' }
      })

      await statsRepository.getGlobalStats(params)

      expect(mockPost).toHaveBeenCalledWith('/stats/global', params, {
        headers: { 'X-User-Id': 'global-user-2' }
      })
    })
  })

  describe('getUserId helper', () => {
    it('should generate ID if not in localStorage', async () => {
      mockPost.mockResolvedValue({ data: { total: 0, uniqueUsers: 0, timeRange: 'all' } })

      await statsRepository.getGlobalStats()

      const storedId = localStorage.getItem('stats-user-id')
      expect(storedId).toBeTruthy()
      expect(storedId).toMatch(/^user_/)
    })
  })
})
