/**
 * Tests for StocksRepository
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

import { stocksRepository } from '../../repositories/stocks.repository'

describe('StocksRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStocks', () => {
    it('should return stocks array', async () => {
      const stocks = [{ name: 'AAPL', price: 150 }, { name: 'GOOG', price: 2800 }]
      mockGET.mockResolvedValue({ data: { stocks }, error: null })

      const result = await stocksRepository.getStocks()

      expect(mockGET).toHaveBeenCalledWith('/stocks', {})
      expect(result).toEqual(stocks)
    })

    it('should throw on error', async () => {
      mockGET.mockResolvedValue({ data: null, error: { error: 'Market closed' } })

      await expect(stocksRepository.getStocks()).rejects.toThrow('Market closed')
    })
  })

  describe('getPortfolio', () => {
    it('should pass userId in path', async () => {
      const mockData = { holdings: [{ stockName: 'AAPL', shares: 10 }], cash: 5000 }
      mockGET.mockResolvedValue({ data: mockData, error: null })

      const result = await stocksRepository.getPortfolio('user123')

      expect(mockGET).toHaveBeenCalledWith('/portfolio/{userId}', {
        params: { path: { userId: 'user123' } },
      })
      expect(result).toEqual(mockData)
    })

    it('should throw on error', async () => {
      mockGET.mockResolvedValue({ data: null, error: { error: 'User not found' } })

      await expect(stocksRepository.getPortfolio('unknown')).rejects.toThrow('User not found')
    })
  })

  describe('buyStock', () => {
    it('should send correct body', async () => {
      const mockData = { success: true, portfolio: { cash: 3500 } }
      mockPOST.mockResolvedValue({ data: mockData, error: null })

      const result = await stocksRepository.buyStock('user123', 'AAPL', 5)

      expect(mockPOST).toHaveBeenCalledWith('/stocks/buy', {
        body: { userId: 'user123', stockName: 'AAPL', shares: 5 },
      })
      expect(result).toEqual(mockData)
    })
  })

  describe('sellStock', () => {
    it('should send correct body', async () => {
      const mockData = { success: true, portfolio: { cash: 6500 } }
      mockPOST.mockResolvedValue({ data: mockData, error: null })

      const result = await stocksRepository.sellStock('user123', 'GOOG', 2)

      expect(mockPOST).toHaveBeenCalledWith('/stocks/sell', {
        body: { userId: 'user123', stockName: 'GOOG', shares: 2 },
      })
      expect(result).toEqual(mockData)
    })
  })
})
