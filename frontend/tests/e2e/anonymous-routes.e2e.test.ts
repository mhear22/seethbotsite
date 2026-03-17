import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, isNavigationFailure, NavigationFailureType } from 'vue-router'
import { createAppRouter, routes } from '../../router'

const staticRoutes = routes
  .filter(route => route.path.startsWith('/'))
  .filter(route => !route.path.includes(':'))
const staticPaths = new Set(staticRoutes.map(route => route.path))

const directHandoffPaths = new Set(
  staticRoutes
    .filter(route => Boolean(route.beforeEnter))
    .map(route => route.path)
)

function getRedirectPath(route: { redirect?: unknown }) {
  if (!route.redirect || typeof route.redirect === 'function') {
    return null
  }

  if (typeof route.redirect === 'string') {
    return route.redirect
  }

  if (
    typeof route.redirect === 'object' &&
    route.redirect !== null &&
    'path' in route.redirect &&
    typeof route.redirect.path === 'string'
  ) {
    return route.redirect.path
  }

  return null
}

const redirectToHandoffPaths = new Set(
  staticRoutes
    .filter(route => Boolean(route.redirect))
    .map(route => ({ path: route.path, target: getRedirectPath(route) }))
    .filter(({ target }) => Boolean(target) && directHandoffPaths.has(target as string))
    .map(({ path }) => path)
)

const handoffPaths = new Set([
  ...directHandoffPaths,
  ...redirectToHandoffPaths
])

const anonymousStaticPaths = [...staticPaths]
  .filter(path => !handoffPaths.has(path))
  .sort((a, b) => a.localeCompare(b))

function createSamplePath(path: string): string {
  return path
    .replace(/:pathMatch\(\.\*\)\*/g, 'sample/nested')
    .replace(/:([A-Za-z0-9_]+)\([^)]*\)\*/g, 'sample')
    .replace(/:([A-Za-z0-9_]+)\?/g, 'sample')
    .replace(/:([A-Za-z0-9_]+)/g, 'sample')
}

const routeVisitSamples = routes.map((route, index) => ({
  index,
  pathPattern: route.path,
  samplePath: createSamplePath(route.path),
  hasBeforeEnter: Boolean(route.beforeEnter),
  redirectPath: getRedirectPath(route)
}))

function suppressJsdomNavigationErrors() {
  const originalConsoleError = console.error

  return vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const firstArg = args[0]
    const message = firstArg instanceof Error ? firstArg.message : String(firstArg ?? '')
    if (message.includes('Not implemented: navigation (except hash changes)')) {
      return
    }

    originalConsoleError(...args)
  })
}

describe('Anonymous route access (e2e-style)', () => {
  it('allows visiting every existing static SPA page', async () => {
    const router = createAppRouter(createMemoryHistory())

    for (const path of anonymousStaticPaths) {
      const navigationResult = await router.push(path)
      const isAborted = isNavigationFailure(navigationResult, NavigationFailureType.aborted)
      expect(
        isAborted,
        `Unexpected aborted navigation for "${path}".`
      ).toBe(false)

      if (path === '/login') {
        expect(router.currentRoute.value.path).toBe('/auth')
        expect(router.currentRoute.value.query.mode).toBe('login')
        continue
      }

      if (path === '/register') {
        expect(router.currentRoute.value.path).toBe('/auth')
        expect(router.currentRoute.value.query.mode).toBe('register')
        continue
      }

      const isDuplicate = isNavigationFailure(navigationResult, NavigationFailureType.duplicated)
      if (!isDuplicate) {
        expect(
          navigationResult,
          `Expected successful navigation for "${path}".`
        ).toBeUndefined()
      }

      expect(router.currentRoute.value.path).toBe(path)
    }
  })

  it('aborts navigation for handoff routes (external app transfer)', async () => {
    expect(handoffPaths.size).toBeGreaterThan(0)

    const router = createAppRouter(createMemoryHistory())
    const consoleErrorSpy = suppressJsdomNavigationErrors()

    try {
      for (const path of handoffPaths) {
        const navigationResult = await router.push(path)
        expect(
          isNavigationFailure(navigationResult, NavigationFailureType.aborted),
          `Expected "${path}" to abort SPA navigation for handoff.`
        ).toBe(true)
      }
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })

  it('aborts for dynamic datacenter handoff paths', async () => {
    const hasDynamicDataCenterHandoff = routes.some(
      route => route.path === '/datacenter/:pathMatch(.*)*' && Boolean(route.beforeEnter)
    )

    if (!hasDynamicDataCenterHandoff) {
      return
    }

    const router = createAppRouter(createMemoryHistory())
    const consoleErrorSpy = suppressJsdomNavigationErrors()

    try {
      const navigationResult = await router.push('/datacenter/subsystem/power')

      expect(
        isNavigationFailure(navigationResult, NavigationFailureType.aborted),
        'Expected dynamic datacenter path to handoff and abort SPA navigation.'
      ).toBe(true)
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })

  it('accounts for every static route entry', () => {
    const accounted = new Set([
      ...anonymousStaticPaths,
      ...handoffPaths
    ])
    expect([...accounted].sort((a, b) => a.localeCompare(b))).toEqual(
      [...staticPaths].sort((a, b) => a.localeCompare(b))
    )
  })

  it('covers every registered route with a visit assertion', async () => {
    const router = createAppRouter(createMemoryHistory())
    const consoleErrorSpy = suppressJsdomNavigationErrors()

    try {
      for (const sample of routeVisitSamples) {
        const navigationResult = await router.push(sample.samplePath)
        const redirectsToHandoff = Boolean(
          sample.redirectPath && handoffPaths.has(sample.redirectPath)
        )
        const shouldAbort = sample.hasBeforeEnter || redirectsToHandoff
        const context = `[route #${sample.index}] pattern="${sample.pathPattern}" sample="${sample.samplePath}"`

        if (shouldAbort) {
          expect(
            isNavigationFailure(navigationResult, NavigationFailureType.aborted),
            `${context} expected handoff abort.`
          ).toBe(true)
          continue
        }

        if (sample.pathPattern === '/login') {
          expect(router.currentRoute.value.path, context).toBe('/auth')
          expect(router.currentRoute.value.query.mode, context).toBe('login')
          continue
        }

        if (sample.pathPattern === '/register') {
          expect(router.currentRoute.value.path, context).toBe('/auth')
          expect(router.currentRoute.value.query.mode, context).toBe('register')
          continue
        }

        const isAborted = isNavigationFailure(navigationResult, NavigationFailureType.aborted)
        expect(isAborted, `${context} unexpected aborted navigation.`).toBe(false)

        const isDuplicate = isNavigationFailure(navigationResult, NavigationFailureType.duplicated)
        if (!isDuplicate) {
          expect(navigationResult, `${context} expected successful navigation.`).toBeUndefined()
        }

        const expectedPath = sample.samplePath
        expect(router.currentRoute.value.path, context).toBe(expectedPath)
      }
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })
})
