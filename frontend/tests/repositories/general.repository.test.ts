/**
 * Tests for GeneralRepository
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

import { generalRepository } from '../../repositories/general.repository'

describe('GeneralRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getHealth', () => {
    it('should return data on success', async () => {
      const mockData = { status: 'ok', uptime: 12345 }
      mockGET.mockResolvedValue({ data: mockData, error: null })

      const result = await generalRepository.getHealth()

      expect(mockGET).toHaveBeenCalledWith('/health', {})
      expect(result).toEqual(mockData)
    })

    it('should throw on error', async () => {
      mockGET.mockResolvedValue({ data: null, error: { error: 'Service unavailable' } })

      await expect(generalRepository.getHealth()).rejects.toThrow('Service unavailable')
    })
  })

  describe('getRankings', () => {
    it('should return rankings array', async () => {
      const rankings = [{ userId: 'u1', score: 100 }, { userId: 'u2', score: 50 }]
      mockGET.mockResolvedValue({ data: { rankings }, error: null })

      const result = await generalRepository.getRankings()

      expect(mockGET).toHaveBeenCalledWith('/rankings', {})
      expect(result).toEqual(rankings)
    })

    it('should return empty array when no rankings', async () => {
      mockGET.mockResolvedValue({ data: {}, error: null })

      const result = await generalRepository.getRankings()

      expect(result).toEqual([])
    })
  })

  describe('getQuote', () => {
    it('should return quote data', async () => {
      const quote = { text: 'To be or not to be', author: 'Shakespeare' }
      mockGET.mockResolvedValue({ data: { quote }, error: null })

      const result = await generalRepository.getQuote()

      expect(mockGET).toHaveBeenCalledWith('/quote', {})
      expect(result).toEqual(quote)
    })
  })

  describe('detectGender', () => {
    it('should send name and country in body', async () => {
      const mockData = { gender: 'male', probability: 0.95 }
      mockPOST.mockResolvedValue({ data: mockData, error: null })

      const result = await generalRepository.detectGender('Alex', 1)

      expect(mockPOST).toHaveBeenCalledWith('/gender', {
        body: { name: 'Alex', country: 1 },
      })
      expect(result).toEqual(mockData)
    })

    it('should throw on error', async () => {
      mockPOST.mockResolvedValue({ data: null, error: { error: 'Invalid name' } })

      await expect(generalRepository.detectGender('', undefined)).rejects.toThrow('Invalid name')
    })
  })

  describe('analyzePhrenology', () => {
    it('should send name in body', async () => {
      const mockData = { name: 'John', gender: 'male', age: 30 }
      mockPOST.mockResolvedValue({ data: mockData, error: null })

      const result = await generalRepository.analyzePhrenology('John')

      expect(mockPOST).toHaveBeenCalledWith('/phrenology', {
        body: { name: 'John' },
      })
      expect(result).toEqual(mockData)
    })
  })
})
