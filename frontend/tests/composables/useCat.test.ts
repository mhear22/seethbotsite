/**
 * Tests for useCat composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, createApp } from 'vue'
import { useCat } from '../../composables/useCat'

/**
 * Helper to mount a composable within a proper Vue component context.
 * Required because useCat uses onMounted.
 */
function withSetup<T>(composable: () => T) {
  let result: T
  const app = createApp(
    defineComponent({
      setup() {
        result = composable()
        return () => {}
      },
    })
  )
  const root = document.createElement('div')
  app.mount(root)
  return { result: result!, app, root }
}

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useCat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: prevent auto-fetch from resolving immediately to avoid interference
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ url: 'https://cdn2.thecatapi.com/images/default.jpg' }],
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with empty catImage and loading true', () => {
    // Make fetch hang so we can inspect initial state
    mockFetch.mockReturnValue(new Promise(() => {}))

    const { result, app } = withSetup(() => useCat())

    expect(result.catImage.value).toBe('')
    expect(result.catLoading.value).toBe(true)

    app.unmount()
  })

  it('fetchNewCat sets image URL on success', async () => {
    const expectedUrl = 'https://cdn2.thecatapi.com/images/abc123.jpg'
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ url: expectedUrl }],
    })

    const { result, app } = withSetup(() => useCat())

    // Wait for the onMounted fetch to resolve
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(result.catImage.value).toBe(expectedUrl)

    app.unmount()
  })

  it('fetchNewCat sets loading false after success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ url: 'https://cdn2.thecatapi.com/images/test.jpg' }],
    })

    const { result, app } = withSetup(() => useCat())

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(result.catLoading.value).toBe(false)

    app.unmount()
  })

  it('fetchNewCat handles API error (non-ok response)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    })

    const { result, app } = withSetup(() => useCat())

    await new Promise(resolve => setTimeout(resolve, 0))

    // catImage should remain empty on error
    expect(result.catImage.value).toBe('')
    // loading should be set to false in the finally block
    expect(result.catLoading.value).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch cat:', 500)

    consoleSpy.mockRestore()
    app.unmount()
  })

  it('fetchNewCat handles network error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result, app } = withSetup(() => useCat())

    await new Promise(resolve => setTimeout(resolve, 0))

    // catImage should remain empty on network error
    expect(result.catImage.value).toBe('')
    // loading should be set to false in the finally block
    expect(result.catLoading.value).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching cat:', expect.any(Error))

    consoleSpy.mockRestore()
    app.unmount()
  })

  it('fetchNewCat handles empty response data', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    })

    const { result, app } = withSetup(() => useCat())

    await new Promise(resolve => setTimeout(resolve, 0))

    // catImage should remain empty when data array is empty
    expect(result.catImage.value).toBe('')
    expect(result.catLoading.value).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('Invalid cat API response:', [])

    consoleSpy.mockRestore()
    app.unmount()
  })
})
