/**
 * Tests for useQuote composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetQuote = vi.fn()

vi.mock('../../repositories/general.repository', () => ({
  generalRepository: {
    getQuote: (...args: any[]) => mockGetQuote(...args),
  },
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

import { useQuote } from '../../composables/useQuote'

describe('useQuote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetQuote.mockResolvedValue({ text: 'Default' })
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ slip: { advice: 'Default advice' } }),
    } as Response)
  })

  it('should initialize with loading quote text', () => {
    mockGetQuote.mockReturnValue(new Promise(() => {})) // never resolves
    mockFetch.mockReturnValue(new Promise(() => {}))

    const { currentQuote, error } = useQuote()

    expect(currentQuote.value).toBe('Loading quote...')
    expect(error.value).toBe(null)
  })

  it('should fetch and display quote successfully', async () => {
    const mockQuote = { text: 'Test quote' }
    const mockAdvice = { slip: { advice: 'Test advice' } }

    mockGetQuote.mockResolvedValue(mockQuote)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockAdvice,
    } as Response)

    const { currentQuote, loading, error } = useQuote()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(currentQuote.value).toBe('Test quote\n\n💡 Test advice')
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('should fall back to local quotes when both sources fail', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetQuote.mockRejectedValue(new Error('API error'))
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { currentQuote, loading, error } = useQuote()

    await new Promise(resolve => setTimeout(resolve, 0))

    // Resilient by design (Ticket #31): failures never surface as errors,
    // the user always gets a local fallback quote + advice instead.
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
    expect(currentQuote.value).toMatch(/^.+\n\n💡 .+$/)

    consoleErrorSpy.mockRestore()
  })

  it('should handle missing advice', async () => {
    const mockQuote = { text: 'Test quote' }
    const mockAdvice = { slip: null }

    mockGetQuote.mockResolvedValue(mockQuote)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockAdvice,
    } as Response)

    const { currentQuote } = useQuote()

    await new Promise(resolve => setTimeout(resolve, 0))

    // Missing advice is backfilled from the local fallback advice list
    expect(currentQuote.value).toMatch(/^Test quote\n\n💡 .+$/)
  })

  it('should fetch new quote when fetchRandomQuote is called', async () => {
    const mockAdvice = { slip: { advice: 'Advice' } }

    mockGetQuote.mockResolvedValueOnce({ text: 'Quote 1' }).mockResolvedValueOnce({ text: 'Quote 2' })
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockAdvice,
    } as Response)

    const { currentQuote, fetchRandomQuote } = useQuote()

    await new Promise(resolve => setTimeout(resolve, 0))
    const firstQuote = currentQuote.value

    fetchRandomQuote()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockGetQuote).toHaveBeenCalledTimes(2)
    expect(currentQuote.value).not.toBe(firstQuote)
  })
})
