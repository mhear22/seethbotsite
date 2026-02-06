/**
 * Tests for MoviesRepository
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

import { moviesRepository } from '../../repositories/movies.repository'

describe('MoviesRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMovies', () => {
    it('should return movies array', async () => {
      const movies = [{ id: 1, title: 'Movie A' }, { id: 2, title: 'Movie B' }]
      mockGET.mockResolvedValue({ data: { movies }, error: null })

      const result = await moviesRepository.getMovies()

      expect(mockGET).toHaveBeenCalledWith('/movies', {})
      expect(result).toEqual(movies)
    })

    it('should return empty array when no movies', async () => {
      mockGET.mockResolvedValue({ data: {}, error: null })

      const result = await moviesRepository.getMovies()

      expect(result).toEqual([])
    })

    it('should throw on error', async () => {
      mockGET.mockResolvedValue({ data: null, error: { error: 'Database error' } })

      await expect(moviesRepository.getMovies()).rejects.toThrow('Database error')
    })
  })

  describe('getVotingRound', () => {
    it('should return round', async () => {
      const round = { id: 1, status: 'active', movies: [1, 2, 3] }
      mockGET.mockResolvedValue({ data: { round }, error: null })

      const result = await moviesRepository.getVotingRound()

      expect(mockGET).toHaveBeenCalledWith('/movies/voting-round', {})
      expect(result).toEqual(round)
    })

    it('should return null when no round', async () => {
      mockGET.mockResolvedValue({ data: {}, error: null })

      const result = await moviesRepository.getVotingRound()

      expect(result).toBeNull()
    })
  })

  describe('startVotingRound', () => {
    it('should call correct endpoint', async () => {
      const mockData = { round: { id: 1, status: 'active' } }
      mockPOST.mockResolvedValue({ data: mockData, error: null })

      const result = await moviesRepository.startVotingRound()

      expect(mockPOST).toHaveBeenCalledWith('/movies/voting-round/start', {})
      expect(result).toEqual(mockData)
    })
  })

  describe('endVotingRound', () => {
    it('should call correct endpoint', async () => {
      const mockData = { round: { id: 1, status: 'ended' } }
      mockPOST.mockResolvedValue({ data: mockData, error: null })

      const result = await moviesRepository.endVotingRound()

      expect(mockPOST).toHaveBeenCalledWith('/movies/voting-round/end', {})
      expect(result).toEqual(mockData)
    })
  })

  describe('resetVotingRound', () => {
    it('should call correct endpoint', async () => {
      const mockData = { success: true }
      mockPOST.mockResolvedValue({ data: mockData, error: null })

      const result = await moviesRepository.resetVotingRound()

      expect(mockPOST).toHaveBeenCalledWith('/movies/voting-round/reset', {})
      expect(result).toEqual(mockData)
    })
  })

  describe('getVotes', () => {
    it('should return votes array', async () => {
      const votes = [{ userId: 'u1', rankings: [1, 2] }, { userId: 'u2', rankings: [2, 1] }]
      mockGET.mockResolvedValue({ data: { votes }, error: null })

      const result = await moviesRepository.getVotes()

      expect(mockGET).toHaveBeenCalledWith('/movies/votes', {})
      expect(result).toEqual(votes)
    })
  })

  describe('getVote', () => {
    it('should return null on error', async () => {
      mockGET.mockResolvedValue({ data: null, error: { error: 'Not found' } })

      const result = await moviesRepository.getVote('user123')

      expect(mockGET).toHaveBeenCalledWith('/movies/vote/{userId}', {
        params: { path: { userId: 'user123' } },
      })
      expect(result).toBeNull()
    })
  })

  describe('submitVote', () => {
    it('should send userId and rankings in body', async () => {
      const mockData = { success: true }
      mockPOST.mockResolvedValue({ data: mockData, error: null })

      const result = await moviesRepository.submitVote('user123', [3, 1, 2])

      expect(mockPOST).toHaveBeenCalledWith('/movies/vote', {
        body: { userId: 'user123', rankings: [3, 1, 2] },
      })
      expect(result).toEqual(mockData)
    })
  })

  describe('deleteVote', () => {
    it('should send userId in path', async () => {
      const mockData = { success: true }
      mockDELETE.mockResolvedValue({ data: mockData, error: null })

      const result = await moviesRepository.deleteVote('user123')

      expect(mockDELETE).toHaveBeenCalledWith('/movies/vote/{userId}', {
        params: { path: { userId: 'user123' } },
      })
      expect(result).toEqual(mockData)
    })
  })
})
