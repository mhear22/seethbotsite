/**
 * Tests for achievements repository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGET = vi.fn()
const mockPOST = vi.fn()
vi.mock('../../repositories/../utils/apiClient', () => ({
  default: { GET: (...args: any[]) => mockGET(...args), POST: (...args: any[]) => mockPOST(...args) }
}))

import { achievementsRepository } from '../../repositories/achievements.repository'

describe('achievementsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('getAchievements', () => {
    it('should send X-User-Id header', async () => {
      localStorage.setItem('stats-user-id', 'test-user-123')
      mockGET.mockResolvedValue({ achievements: [] })

      await achievementsRepository.getAchievements()

      expect(mockGET).toHaveBeenCalledWith('/achievements', {
        headers: {
          'X-User-Id': 'test-user-123'
        }
      })
    })

    it('should return achievements from response', async () => {
      localStorage.setItem('stats-user-id', 'test-user-123')
      const mockAchievements = [
        { id: 'ach1', name: 'First Click', description: 'Click once' },
        { id: 'ach2', name: 'Ten Clicks', description: 'Click 10 times' }
      ]
      mockGET.mockResolvedValue({ achievements: mockAchievements })

      const result = await achievementsRepository.getAchievements()

      expect(result).toEqual(mockAchievements)
    })
  })

  describe('getAllAchievements', () => {
    it('should call correct endpoint with X-User-Id header', async () => {
      localStorage.setItem('stats-user-id', 'test-user-456')
      mockGET.mockResolvedValue({ achievements: [] })

      await achievementsRepository.getAllAchievements()

      expect(mockGET).toHaveBeenCalledWith('/achievements/all', {
        headers: {
          'X-User-Id': 'test-user-456'
        }
      })
    })

    it('should return achievements array from response', async () => {
      localStorage.setItem('stats-user-id', 'test-user-456')
      const mockAllAchievements = [
        { id: 'ach1', name: 'First Click', unlocked: true },
        { id: 'ach2', name: 'Ten Clicks', unlocked: false }
      ]
      mockGET.mockResolvedValue({ achievements: mockAllAchievements })

      const result = await achievementsRepository.getAllAchievements()

      expect(result).toEqual(mockAllAchievements)
    })
  })

  describe('getAchievementProgress', () => {
    it('should return progress from response', async () => {
      localStorage.setItem('stats-user-id', 'test-user-789')
      const mockProgress = { total: 10, unlocked: 3, percentage: 30 }
      mockGET.mockResolvedValue({ progress: mockProgress })

      const result = await achievementsRepository.getAchievementProgress()

      expect(result).toEqual(mockProgress)
      expect(mockGET).toHaveBeenCalledWith('/achievements/progress', {
        headers: {
          'X-User-Id': 'test-user-789'
        }
      })
    })
  })

  describe('checkAchievements', () => {
    it('should call POST with empty body and X-User-Id header', async () => {
      localStorage.setItem('stats-user-id', 'test-user-check')
      const mockResponse = { newAchievements: [], checked: true }
      mockPOST.mockResolvedValue(mockResponse)

      const result = await achievementsRepository.checkAchievements()

      expect(mockPOST).toHaveBeenCalledWith('/achievements/check', {
        headers: {
          'X-User-Id': 'test-user-check'
        },
        body: {}
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getUserId', () => {
    it('should generate and save ID if not in localStorage', async () => {
      mockGET.mockResolvedValue({ achievements: [] })

      await achievementsRepository.getAchievements()

      // Verify a user ID was generated and stored
      const storedId = localStorage.getItem('stats-user-id')
      expect(storedId).toBeTruthy()
      expect(storedId).toMatch(/^user_/)

      // Verify the generated ID was used in the request
      expect(mockGET).toHaveBeenCalledWith('/achievements', {
        headers: {
          'X-User-Id': storedId
        }
      })
    })

    it('should reuse existing ID from localStorage', async () => {
      localStorage.setItem('stats-user-id', 'existing-user-id')
      mockGET.mockResolvedValue({ achievements: [] })

      await achievementsRepository.getAchievements()
      await achievementsRepository.getAllAchievements()

      // Both calls should use the same stored ID
      expect(mockGET).toHaveBeenNthCalledWith(1, '/achievements', {
        headers: { 'X-User-Id': 'existing-user-id' }
      })
      expect(mockGET).toHaveBeenNthCalledWith(2, '/achievements/all', {
        headers: { 'X-User-Id': 'existing-user-id' }
      })
    })
  })
})
