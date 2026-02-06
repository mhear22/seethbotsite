/**
 * Tests for activity-feed repository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { activityFeedRepository } from '../../repositories/activity-feed.repository'

describe('activityFeedRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mockFetchSuccess(data: any) {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data)
    })
  }

  function mockFetchFailure(status = 500) {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status
    })
  }

  describe('getGlobalActivity', () => {
    it('should fetch with correct base URL', async () => {
      const mockData = { activities: [], total: 0 }
      mockFetchSuccess(mockData)

      const result = await activityFeedRepository.getGlobalActivity()

      expect(global.fetch).toHaveBeenCalledWith('/api/activity-feed?')
      expect(result).toEqual(mockData)
    })

    it('should pass limit and offset params', async () => {
      mockFetchSuccess({ activities: [], total: 0 })

      await activityFeedRepository.getGlobalActivity({ limit: 20, offset: 10 })

      const calledUrl = (global.fetch as any).mock.calls[0][0] as string
      expect(calledUrl).toContain('limit=20')
      expect(calledUrl).toContain('offset=10')
    })
  })

  describe('getUserActivity', () => {
    it('should include userId in URL', async () => {
      mockFetchSuccess({ activities: [], total: 0 })

      await activityFeedRepository.getUserActivity('user-abc')

      const calledUrl = (global.fetch as any).mock.calls[0][0] as string
      expect(calledUrl).toContain('/api/activity-feed/user/user-abc')
    })

    it('should pass query params', async () => {
      mockFetchSuccess({ activities: [], total: 0 })

      await activityFeedRepository.getUserActivity('user-abc', {
        limit: 5,
        offset: 0,
        type: 'click',
        gameType: 'clicker'
      })

      const calledUrl = (global.fetch as any).mock.calls[0][0] as string
      expect(calledUrl).toContain('limit=5')
      expect(calledUrl).toContain('type=click')
      expect(calledUrl).toContain('gameType=clicker')
    })
  })

  describe('getUserActivityStats', () => {
    it('should fetch correct URL with userId', async () => {
      const mockStats = { totalActions: 100, breakdown: {} }
      mockFetchSuccess(mockStats)

      const result = await activityFeedRepository.getUserActivityStats('user-xyz')

      expect(global.fetch).toHaveBeenCalledWith('/api/activity-feed/stats/user-xyz')
      expect(result).toEqual(mockStats)
    })
  })

  describe('getActivityTypes', () => {
    it('should fetch correct URL', async () => {
      const mockTypes = { types: ['click', 'fish_caught', 'score'] }
      mockFetchSuccess(mockTypes)

      const result = await activityFeedRepository.getActivityTypes()

      expect(global.fetch).toHaveBeenCalledWith('/api/activity-feed/types')
      expect(result).toEqual(mockTypes)
    })
  })

  describe('error handling', () => {
    it('should throw error on non-ok response for getGlobalActivity', async () => {
      mockFetchFailure(500)

      await expect(activityFeedRepository.getGlobalActivity()).rejects.toThrow(
        'Failed to fetch activity feed'
      )
    })

    it('should throw error on non-ok response for getUserActivity', async () => {
      mockFetchFailure(404)

      await expect(activityFeedRepository.getUserActivity('user-abc')).rejects.toThrow(
        'Failed to fetch user activity feed'
      )
    })

    it('should throw error on non-ok response for getUserActivityStats', async () => {
      mockFetchFailure(500)

      await expect(activityFeedRepository.getUserActivityStats('user-abc')).rejects.toThrow(
        'Failed to fetch user activity stats'
      )
    })

    it('should throw error on non-ok response for getActivityTypes', async () => {
      mockFetchFailure(500)

      await expect(activityFeedRepository.getActivityTypes()).rejects.toThrow(
        'Failed to fetch activity types'
      )
    })
  })
})
