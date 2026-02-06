/**
 * Tests for TicketsRepository
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

import { ticketsRepository } from '../../repositories/tickets.repository'

describe('TicketsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTickets', () => {
    it('should return tickets array', async () => {
      const tickets = [{ id: 1, title: 'Bug report' }, { id: 2, title: 'Feature request' }]
      mockGET.mockResolvedValue({ data: { tickets }, error: null })

      const result = await ticketsRepository.getTickets()

      expect(mockGET).toHaveBeenCalledWith('/tickets', {
        params: { query: { status: undefined, type: undefined, priority: undefined } },
      })
      expect(result).toEqual(tickets)
    })

    it('should pass filter params', async () => {
      const tickets = [{ id: 1, title: 'Bug report' }]
      mockGET.mockResolvedValue({ data: { tickets }, error: null })

      const result = await ticketsRepository.getTickets('pending', 'bug', 'high')

      expect(mockGET).toHaveBeenCalledWith('/tickets', {
        params: { query: { status: 'pending', type: 'bug', priority: 'high' } },
      })
      expect(result).toEqual(tickets)
    })

    it('should throw on error', async () => {
      mockGET.mockResolvedValue({ data: null, error: { error: 'Database error' } })

      await expect(ticketsRepository.getTickets()).rejects.toThrow('Database error')
    })
  })

  describe('createTicket', () => {
    it('should send title, description, and creator_id in body', async () => {
      const ticket = { id: 1, title: 'New bug', description: 'Details', creator_id: 'user1' }
      mockPOST.mockResolvedValue({ data: { ticket }, error: null })

      await ticketsRepository.createTicket('New bug', 'Details', 'user1')

      expect(mockPOST).toHaveBeenCalledWith('/tickets', {
        body: { title: 'New bug', description: 'Details', creator_id: 'user1' },
      })
    })

    it('should return ticket', async () => {
      const ticket = { id: 1, title: 'New bug', description: 'Details' }
      mockPOST.mockResolvedValue({ data: { ticket }, error: null })

      const result = await ticketsRepository.createTicket('New bug', 'Details')

      expect(result).toEqual(ticket)
    })
  })

  describe('updateTicket', () => {
    it('should send id in path and updates in body', async () => {
      const updates = { status: 'completed' as const, response: 'Fixed' }
      const ticket = { id: 5, title: 'Bug', status: 'completed' }
      mockPATCH.mockResolvedValue({ data: { ticket }, error: null })

      const result = await ticketsRepository.updateTicket(5, updates)

      expect(mockPATCH).toHaveBeenCalledWith('/tickets/{id}', {
        params: { path: { id: 5 } },
        body: updates,
      })
      expect(result).toEqual(ticket)
    })
  })

  describe('deleteTicket', () => {
    it('should send id in path', async () => {
      const mockData = { success: true }
      mockDELETE.mockResolvedValue({ data: mockData, error: null })

      const result = await ticketsRepository.deleteTicket(3)

      expect(mockDELETE).toHaveBeenCalledWith('/tickets/{id}', {
        params: { path: { id: 3 } },
        headers: undefined,
        body: undefined,
      })
      expect(result).toEqual(mockData)
    })

    it('should include creatorId header when provided', async () => {
      const mockData = { success: true }
      mockDELETE.mockResolvedValue({ data: mockData, error: null })

      await ticketsRepository.deleteTicket(3, 'creator1')

      expect(mockDELETE).toHaveBeenCalledWith('/tickets/{id}', {
        params: { path: { id: 3 } },
        headers: { 'X-Creator-ID': 'creator1' },
        body: { creator_id: 'creator1' },
      })
    })
  })

  describe('getIgnoreMode', () => {
    it('should return boolean', async () => {
      mockGET.mockResolvedValue({ data: { ignoreMode: true }, error: null })

      const result = await ticketsRepository.getIgnoreMode()

      expect(mockGET).toHaveBeenCalledWith('/tickets/settings/ignore-mode', {})
      expect(result).toBe(true)
    })
  })

  describe('setIgnoreMode', () => {
    it('should send ignoreMode in body', async () => {
      mockPATCH.mockResolvedValue({ data: { ignoreMode: false }, error: null })

      const result = await ticketsRepository.setIgnoreMode(false)

      expect(mockPATCH).toHaveBeenCalledWith('/tickets/settings/ignore-mode', {
        body: { ignoreMode: false },
      })
      expect(result).toBe(false)
    })
  })

  describe('getLastCollection', () => {
    it('should return timestamp', async () => {
      const timestamp = '2025-01-15T12:00:00Z'
      mockGET.mockResolvedValue({ data: { lastCollection: timestamp }, error: null })

      const result = await ticketsRepository.getLastCollection()

      expect(mockGET).toHaveBeenCalledWith('/tickets/settings/last-collection', {})
      expect(result).toBe(timestamp)
    })
  })

  describe('setLastCollection', () => {
    it('should send timestamp in body', async () => {
      const timestamp = '2025-01-16T08:30:00Z'
      mockPATCH.mockResolvedValue({ data: { lastCollection: timestamp }, error: null })

      const result = await ticketsRepository.setLastCollection(timestamp)

      expect(mockPATCH).toHaveBeenCalledWith('/tickets/settings/last-collection', {
        body: { lastCollection: timestamp },
      })
      expect(result).toBe(timestamp)
    })
  })
})
