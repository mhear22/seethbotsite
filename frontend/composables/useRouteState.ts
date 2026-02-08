import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * Storage type for route state
 */
export type StorageType = 'session' | 'local' | 'memory'

/**
 * Route state options
 */
export interface RouteStateOptions<T> {
  defaultValue?: T
  storage?: StorageType
  storageKey?: string
  persistAcrossReloads?: boolean
}

const SESSION_KEY_PREFIX = 'route_state_'

/**
 * In-memory route state storage
 */
const memoryStorage = new Map<string, any>()

/**
 * Composable for managing route state and query parameters
 */
export function useRouteState() {
  const router = useRouter()
  const route = useRoute()

  /**
   * Get a query parameter value
   */
  function getQueryParam(param: string): string | null {
    const value = route.query[param]
    return value as string | null
  }

  /**
   * Get a query parameter with default value
   */
  function getQueryParamWithDefault(param: string, defaultValue: string): string {
    return getQueryParam(param) || defaultValue
  }

  /**
   * Get a numeric query parameter
   */
  function getNumericQueryParam(param: string): number | null {
    const value = getQueryParam(param)
    return value ? parseInt(value, 10) : null
  }

  /**
   * Get a numeric query parameter with default value
   */
  function getNumericQueryParamWithDefault(param: string, defaultValue: number): number {
    const value = getNumericQueryParam(param)
    return value !== null ? value : defaultValue
  }

  /**
   * Get a boolean query parameter
   */
  function getBooleanQueryParam(param: string): boolean {
    const value = getQueryParam(param)
    return value === 'true' || value === '1' || value === 'yes'
  }

  /**
   * Get an array query parameter (comma-separated)
   */
  function getArrayQueryParam(param: string): string[] {
    const value = getQueryParam(param)
    return value ? value.split(',').map(item => item.trim()) : []
  }

  /**
   * Set a query parameter
   */
  function setQueryParam(param: string, value: string | number | boolean) {
    const query = { ...route.query }
    query[param] = String(value)
    router.push({ query })
  }

  /**
   * Set multiple query parameters
   */
  function setQueryParams(params: Record<string, string | number | boolean>) {
    const query = { ...route.query }
    Object.entries(params).forEach(([key, value]) => {
      query[key] = String(value)
    })
    router.push({ query })
  }

  /**
   * Remove a query parameter
   */
  function removeQueryParam(param: string) {
    const query = { ...route.query }
    delete query[param]
    router.push({ query })
  }

  /**
   * Remove multiple query parameters
   */
  function removeQueryParams(params: string[]) {
    const query = { ...route.query }
    params.forEach(param => {
      delete query[param]
    })
    router.push({ query })
  }

  /**
   * Clear all query parameters
   */
  function clearQueryParams() {
    router.push({ query: {} })
  }

  /**
   * Store state for current route
   */
  function setRouteState<T>(key: string, value: T, options?: RouteStateOptions<T>) {
    const storage = options?.storage || 'memory'
    const storageKey = options?.storageKey || `${SESSION_KEY_PREFIX}${key}`

    switch (storage) {
      case 'session':
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(value))
        } catch (e) {
          console.warn('Failed to save to sessionStorage:', e)
        }
        break

      case 'local':
        try {
          localStorage.setItem(storageKey, JSON.stringify(value))
        } catch (e) {
          console.warn('Failed to save to localStorage:', e)
        }
        break

      case 'memory':
      default:
        memoryStorage.set(storageKey, value)
        break
    }
  }

  /**
   * Get state for current route
   */
  function getRouteState<T>(key: string, defaultValue: T, options?: RouteStateOptions<T>): T {
    const storage = options?.storage || 'memory'
    const storageKey = options?.storageKey || `${SESSION_KEY_PREFIX}${key}`

    switch (storage) {
      case 'session':
        try {
          const item = sessionStorage.getItem(storageKey)
          return item ? JSON.parse(item) : defaultValue
        } catch (e) {
          console.warn('Failed to read from sessionStorage:', e)
          return defaultValue
        }

      case 'local':
        try {
          const item = localStorage.getItem(storageKey)
          return item ? JSON.parse(item) : defaultValue
        } catch (e) {
          console.warn('Failed to read from localStorage:', e)
          return defaultValue
        }

      case 'memory':
      default:
        return memoryStorage.get(storageKey) ?? defaultValue
    }
  }

  /**
   * Clear state for a key
   */
  function clearRouteState(key: string, storage: StorageType = 'memory') {
    const storageKey = `${SESSION_KEY_PREFIX}${key}`

    switch (storage) {
      case 'session':
        sessionStorage.removeItem(storageKey)
        break

      case 'local':
        localStorage.removeItem(storageKey)
        break

      case 'memory':
        memoryStorage.delete(storageKey)
        break
    }
  }

  /**
   * Clear all route state
   */
  function clearAllRouteState() {
    // Clear memory storage
    memoryStorage.clear()

    // Clear sessionStorage for route state
    try {
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith(SESSION_KEY_PREFIX)) {
          sessionStorage.removeItem(key)
        }
      })
    } catch (e) {
      console.warn('Failed to clear sessionStorage:', e)
    }

    // Clear localStorage for route state
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(SESSION_KEY_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (e) {
      console.warn('Failed to clear localStorage:', e)
    }
  }

  /**
   * Create a reactive route state
   */
  function createRouteState<T>(key: string, options?: RouteStateOptions<T>) {
    const defaultValue = options?.defaultValue as T
    const state = ref<T>(getRouteState(key, defaultValue, options))

    // Watch for changes and persist them
    watch(
      state,
      (newValue) => {
        setRouteState(key, newValue, options)
      },
      { deep: true }
    )

    return state
  }

  /**
   * Sync route state to query parameters
   */
  function syncRouteStateToQuery(state: Record<string, any>) {
    const query = { ...route.query }

    Object.entries(state).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query[key] = String(value)
      } else {
        delete query[key]
      }
    })

    router.push({ query })
  }

  /**
   * Sync query parameters to route state
   */
  function syncQueryToRouteState(keys: string[]): Record<string, any> {
    const state: Record<string, any> = {}

    keys.forEach(key => {
      const value = getQueryParam(key)
      if (value !== null) {
        state[key] = value
      }
    })

    return state
  }

  /**
   * Get all query parameters as an object
   */
  const allQueryParams = computed(() => {
    return { ...route.query }
  })

  /**
   * Check if query parameter exists
   */
  function hasQueryParam(param: string): boolean {
    return param in route.query
  }

  /**
   * Clear route state on logout
   */
  function clearRouteStateOnLogout() {
    clearAllRouteState()
    clearQueryParams()
  }

  return {
    // Query parameter methods
    getQueryParam,
    getQueryParamWithDefault,
    getNumericQueryParam,
    getNumericQueryParamWithDefault,
    getBooleanQueryParam,
    getArrayQueryParam,
    setQueryParam,
    setQueryParams,
    removeQueryParam,
    removeQueryParams,
    clearQueryParams,
    allQueryParams,
    hasQueryParam,

    // Route state methods
    setRouteState,
    getRouteState,
    clearRouteState,
    clearAllRouteState,
    createRouteState,

    // Sync methods
    syncRouteStateToQuery,
    syncQueryToRouteState,

    // Utility methods
    clearRouteStateOnLogout
  }
}
