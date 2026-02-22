/**
 * Test setup for Vitest
 */

import { vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Initialize Pinia for all tests
beforeEach(() => {
  setActivePinia(createPinia())
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value != null ? value.toString() : ''
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value != null ? value.toString() : ''
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Default fetch mock for tests that don't explicitly mock fetch.
if (!vi.isMockFunction(globalThis.fetch)) {
  const defaultFetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url

    if (url.includes('thecatapi.com')) {
      return {
        ok: true,
        json: async () => [{ url: 'https://cdn2.thecatapi.com/images/test.jpg' }],
      } as Response
    }

    if (url.includes('api.adviceslip.com')) {
      return {
        ok: true,
        json: async () => ({ slip: { advice: 'Default advice' } }),
      } as Response
    }

    return {
      ok: true,
      json: async () => ({}),
    } as Response
  })

  globalThis.fetch = defaultFetch as typeof fetch
}
