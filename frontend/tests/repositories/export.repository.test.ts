/**
 * Tests for export repository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportRepository } from '../../repositories/export.repository'

describe('exportRepository', () => {
  let mockAnchor: {
    href: string
    download: string
    click: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock anchor element for download
    mockAnchor = {
      href: '',
      download: '',
      click: vi.fn()
    }

    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)

    // Mock URL methods
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    window.URL.revokeObjectURL = vi.fn()
  })

  function mockFetchBlobSuccess() {
    const mockBlob = new Blob(['test data'], { type: 'application/json' })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    })
  }

  function mockFetchFailure(status = 500) {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status,
      json: vi.fn().mockResolvedValue({ error: 'Server error' })
    })
  }

  describe('exportRankings', () => {
    it('should fetch with correct URL and format', async () => {
      mockFetchBlobSuccess()

      await exportRepository.exportRankings({ format: 'csv' })

      const calledUrl = (global.fetch as any).mock.calls[0][0] as string
      expect(calledUrl).toContain('/export/rankings')
      expect(calledUrl).toContain('format=csv')
    })

    it('should default to json format', async () => {
      mockFetchBlobSuccess()

      await exportRepository.exportRankings()

      const calledUrl = (global.fetch as any).mock.calls[0][0] as string
      expect(calledUrl).toContain('format=json')
    })

    it('should trigger blob download', async () => {
      mockFetchBlobSuccess()

      await exportRepository.exportRankings({ format: 'json' })

      expect(window.URL.createObjectURL).toHaveBeenCalled()
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockAnchor.click).toHaveBeenCalled()
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
      expect(document.body.appendChild).toHaveBeenCalled()
      expect(document.body.removeChild).toHaveBeenCalled()
    })
  })

  describe('exportStats', () => {
    it('should send POST with correct body', async () => {
      mockFetchBlobSuccess()

      await exportRepository.exportStats({
        userId: 'user-123',
        gameType: 'clicker',
        format: 'csv'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/export/stats'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'user-123', gameType: 'clicker', format: 'csv' })
        })
      )
    })
  })

  describe('exportClicks', () => {
    it('should send correct params', async () => {
      mockFetchBlobSuccess()

      await exportRepository.exportClicks({
        userId: 'user-456',
        limit: 200,
        format: 'json'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/export/clicks'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userId: 'user-456', limit: 200, format: 'json' })
        })
      )
    })

    it('should default limit to 100', async () => {
      mockFetchBlobSuccess()

      await exportRepository.exportClicks({
        userId: 'user-456'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/export/clicks'),
        expect.objectContaining({
          body: JSON.stringify({ userId: 'user-456', limit: 100, format: 'json' })
        })
      )
    })
  })

  describe('exportHistory', () => {
    it('should send correct params', async () => {
      mockFetchBlobSuccess()

      await exportRepository.exportHistory({
        userId: 'user-789',
        gameType: 'fishing',
        statType: 'fish_caught',
        limit: 1000,
        format: 'csv'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/export/history'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'user-789',
            gameType: 'fishing',
            statType: 'fish_caught',
            limit: 1000,
            format: 'csv'
          })
        })
      )
    })
  })

  describe('exportLeaderboard', () => {
    it('should send gameType in body', async () => {
      mockFetchBlobSuccess()

      await exportRepository.exportLeaderboard({
        gameType: 'clicker',
        limit: 25,
        format: 'json'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/export/leaderboard'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ gameType: 'clicker', limit: 25, format: 'json' })
        })
      )
    })
  })

  describe('error handling', () => {
    it('should throw on non-ok response for exportRankings', async () => {
      mockFetchFailure(500)

      await expect(exportRepository.exportRankings()).rejects.toThrow(
        'Server error'
      )
    })

    it('should throw on non-ok response for exportStats', async () => {
      mockFetchFailure(400)

      await expect(
        exportRepository.exportStats({ userId: 'user-1', format: 'json' })
      ).rejects.toThrow('Server error')
    })
  })

  describe('downloadBlob', () => {
    it('should create and click anchor element with correct attributes', async () => {
      mockFetchBlobSuccess()

      await exportRepository.exportRankings({ format: 'csv' })

      // Verify anchor was configured
      expect(mockAnchor.href).toBe('blob:mock-url')
      expect(mockAnchor.download).toContain('rankings_')
      expect(mockAnchor.download).toContain('.csv')
      expect(mockAnchor.click).toHaveBeenCalledTimes(1)

      // Verify cleanup
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor)
      expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor)
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })
})
