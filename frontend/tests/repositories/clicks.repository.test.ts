/**
 * Tests for ClicksRepository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGET = vi.fn()
const mockPOST = vi.fn()
const mockPATCH = vi.fn()
const mockDELETE = vi.fn()

vi.mock('../../utils/apiClient', () => ({
  apiClient: { GET: (...args: any[]) => mockGET(...args), POST: (...args: any[]) => mockPOST(...args), PATCH: (...args: any[]) => mockPATCH(...args), DELETE: (...args: any[]) => mockDELETE(...args) },
  default: { GET: (...args: any[]) => mockGET(...args), POST: (...args: any[]) => mockPOST(...args), PATCH: (...args: any[]) => mockPATCH(...args), DELETE: (...args: any[]) => mockDELETE(...args) }
}))

import { clicksRepository } from '../../repositories/clicks.repository'

describe('ClicksRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCount', () => {
    it('should return data on success', async () => {
      const mockData = { count: 42 }
      mockGET.mockResolvedValue({ data: mockData, error: null })

      const result = await clicksRepository.getCount()

      expect(mockGET).toHaveBeenCalledWith('/clicks', {})
      expect(result).toEqual(mockData)
    })

    it('should throw on error', async () => {
      mockGET.mockResolvedValue({ data: null, error: { error: 'Server error' } })

      await expect(clicksRepository.getCount()).rejects.toThrow('Server error')
    })
  })

  describe('increment', () => {
    it('should return data on success', async () => {
      const mockData = { count: 43 }
      mockPOST.mockResolvedValue({ data: mockData, error: null })

      const result = await clicksRepository.increment()

      expect(mockPOST).toHaveBeenCalledWith('/clicks/increment', {})
      expect(result).toEqual(mockData)
    })

    it('should throw on error', async () => {
      mockPOST.mockResolvedValue({ data: null, error: { error: 'Failed' } })

      await expect(clicksRepository.increment()).rejects.toThrow('Failed')
    })
  })

  describe('reset', () => {
    it('should return data on success', async () => {
      const mockData = { count: 0 }
      mockPOST.mockResolvedValue({ data: mockData, error: null })

      const result = await clicksRepository.reset()

      expect(mockPOST).toHaveBeenCalledWith('/clicks/reset', {})
      expect(result).toEqual(mockData)
    })
  })

  describe('addPoints', () => {
    it('should send userId and clicks in body', async () => {
      const mockData = { success: true }
      mockPOST.mockResolvedValue({ data: mockData, error: null })

      const result = await clicksRepository.addPoints('user123', 10)

      expect(mockPOST).toHaveBeenCalledWith('/clicks/add-points', {
        body: { userId: 'user123', clicks: 10 },
      })
      expect(result).toEqual(mockData)
    })
  })
})
