import { vi } from 'vitest'

export function createMockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: { value: { path: '/', name: 'home', params: {}, query: {} } },
    resolve: vi.fn(),
    addRoute: vi.fn(),
    removeRoute: vi.fn(),
    hasRoute: vi.fn(),
    getRoutes: vi.fn(() => []),
    isReady: vi.fn(() => Promise.resolve()),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    install: vi.fn(),
  }
}

export function createMockRoute(path = '/', name = 'home') {
  return {
    path,
    name,
    params: {},
    query: {},
    hash: '',
    fullPath: path,
    matched: [],
    redirectedFrom: undefined,
    meta: {},
  }
}
