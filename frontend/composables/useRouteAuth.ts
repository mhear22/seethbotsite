import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from './useAuth'

/**
 * Route metadata for protected routes
 */
export interface RouteMeta {
  requiresAuth?: boolean
  requiresAdmin?: boolean
  redirectPath?: string
}

/**
 * Protected route configuration
 */
export interface ProtectedRouteConfig {
  path: string
  requiresAuth: boolean
  requiresAdmin?: boolean
  redirectPath?: string
}

// Default protected routes configuration
const defaultProtectedRoutes: ProtectedRouteConfig[] = [
  {
    path: '/settings',
    requiresAuth: true,
    redirectPath: '/auth?returnTo=/settings'
  },
  {
    path: '/messages',
    requiresAuth: true,
    redirectPath: '/auth?returnTo=/messages'
  },
  {
    path: '/favorites',
    requiresAuth: true,
    redirectPath: '/auth?returnTo=/favorites'
  }
]

/**
 * Composable for route-based authentication and authorization
 */
export function useRouteAuth(customProtectedRoutes?: ProtectedRouteConfig[]) {
  const router = useRouter()
  const route = useRoute()
  const { isAuthenticated, user } = useAuth()

  const protectedRoutes = computed(() => customProtectedRoutes || defaultProtectedRoutes)

  /**
   * Check if a route requires authentication
   */
  function isProtectedRoute(path: string): boolean {
    return protectedRoutes.value.some(r => path.startsWith(r.path))
  }

  /**
   * Check if current route is protected
   */
  const isCurrentRouteProtected = computed(() => {
    return isProtectedRoute(route.path)
  })

  /**
   * Check if user can access a route
   */
  function canAccessRoute(path: string): boolean {
    const routeConfig = protectedRoutes.value.find(r => path.startsWith(r.path))

    if (!routeConfig) {
      return true // No restrictions
    }

    if (routeConfig.requiresAuth && !isAuthenticated.value) {
      return false
    }

    if (routeConfig.requiresAdmin) {
      // Add admin check logic when user roles are implemented
      return false
    }

    return true
  }

  /**
   * Get the redirect target for login
   */
  function getRedirectTarget(path?: string): string {
    const targetPath = path || route.path
    return route.query.returnTo as string || targetPath || '/'
  }

  /**
   * Require authentication - redirect to login if not authenticated
   */
  function requireAuth(redirectPath?: string): boolean {
    if (!isAuthenticated.value) {
      const target = redirectPath || getRedirectTarget()
      router.push({
        path: '/auth',
        query: { returnTo: target }
      })
      return false
    }
    return true
  }

  /**
   * Require admin access - redirect if not admin
   */
  function requireAdmin(): boolean {
    if (!isAuthenticated.value) {
      router.push({
        path: '/auth',
        query: { returnTo: route.path }
      })
      return false
    }

    // Add admin role check when implemented
    return true
  }

  /**
   * Handle authentication redirect in navigation guard
   */
  function handleAuthRedirect(to: any, from: any, next: Function) {
    if (isProtectedRoute(to.path) && !isAuthenticated.value) {
      next({
        path: '/auth',
        query: { returnTo: to.fullPath }
      })
    } else {
      next()
    }
  }

  /**
   * Redirect to login page with return URL
   */
  function redirectToLogin(returnPath?: string) {
    router.push({
      path: '/auth',
      query: { returnTo: returnPath || route.fullPath }
    })
  }

  /**
   * Redirect after successful login
   */
  function redirectAfterLogin() {
    const returnTo = getRedirectTarget()
    router.push(returnTo)
  }

  /**
   * Check if current route should show login prompt
   */
  const shouldShowLoginPrompt = computed(() => {
    return isCurrentRouteProtected.value && !isAuthenticated.value
  })

  return {
    // State
    isCurrentRouteProtected,
    shouldShowLoginPrompt,

    // Route checks
    isProtectedRoute,
    canAccessRoute,

    // Redirects
    getRedirectTarget,
    redirectToLogin,
    redirectAfterLogin,

    // Navigation guard helpers
    requireAuth,
    requireAdmin,
    handleAuthRedirect
  }
}
