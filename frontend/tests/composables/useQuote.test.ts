/**
 * Tests for useQuote composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useQuote } from '../../composables/useQuote'

// Mock the general repository
vi.mock('../../repositories/general.repository', () => ({
  generalRepository: {
    getQuote: vi.fn(),
  },
}))

// Mock fetch
global.fetch = vi.fn()

describe('useQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    const { currentQuote, loading, error } = useQuote()

    expect(currentQuote.value).toBe('Loading quote...')
    expect(loading.value).toBe(true)
    expect(error.value).toBe(null)
  })

  it('should fetch and display quote successfully', async () => {
    const mockQuote = { text: 'Test quote' }
    const mockAdvice = { slip: { advice: 'Test advice' } }

    const { generalRepository } = await import('../../repositories/general.repository')
    vi.mocked(generalRepository.getQuote).mockResolvedValue(mockQuote)
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAdvice,
    } as Response)

    const { currentQuote, loading, error, fetchRandomQuote } = useQuote()

    // Wait for the initial fetch
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(currentQuote.value).toBe('Test quote\n\n💡 Test advice')
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('should handle errors gracefully', async () => {
    const { generalRepository } = await import('../../repositories/general.repository')
    vi.mocked(generalRepository.getQuote).mockRejectedValue(new Error('API error'))
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'))

    const { currentQuote, loading, error, fetchRandomQuote } = useQuote()

    // Wait for the initial fetch
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(loading.value).toBe(false)
    expect(error.value).toBe('Failed to load quote')
    expect(currentQuote.value).toBe('Stay curious, keep asking questions.')
  })

  it('should handle missing advice', async () => {
    const mockQuote = { text: 'Test quote' }
    const mockAdvice = { slip: null }

    const { generalRepository } = await import('../../repositories/general.repository')
    vi.mocked(generalRepository.getQuote).mockResolvedValue(mockQuote)
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAdvice,
    } as Response)

    const { currentQuote, fetchRandomQuote } = useQuote()

    // Wait for the initial fetch
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(currentQuote.value).toBe('Test quote')
  })

  it('should fetch new quote when fetchRandomQuote is called', async () => {
    const mockQuote1 = { text: 'Quote 1' }
    const mockQuote2 = { text: 'Quote 2' }
    const mockAdvice = { slip: { advice: 'Advice' } }

    const { generalRepository } = await import('../../repositories/general.repository')
    vi.mocked(generalRepository.getQuote).mockResolvedValueOnce(mockQuote1).mockResolvedValueOnce(mockQuote2)
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAdvice,
    } as Response)

    const { currentQuote, fetchRandomQuote } = useQuote()

    // Wait for initial fetch
    await new Promise(resolve => setTimeout(resolve, 0))
    const firstQuote = currentQuote.value

    // Fetch a new quote
    fetchRandomQuote()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(generalRepository.getQuote).toHaveBeenCalledTimes(2)
    expect(currentQuote.value).not.toBe(firstQuote)
  })
})
