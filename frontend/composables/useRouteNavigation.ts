import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  title: string
  path: string
}

/**
 * Route data for navigation
 */
export interface RouteData {
  title: string
  icon: string
  path: string
}

/**
 * Navigation history item
 */
export interface HistoryItem {
  path: string
  title: string
  timestamp: number
}

const MAX_HISTORY_SIZE = 50

/**
 * Composable for custom navigation logic and history tracking
 */
export function useRouteNavigation() {
  const router = useRouter()
  const route = useRoute()

  const navigationHistory = ref<HistoryItem[]>([])
  const hasUnsavedChanges = ref(false)

  /**
   * Track navigation in history
   */
  function addToHistory(path: string, title: string) {
    const item: HistoryItem = {
      path,
      title,
      timestamp: Date.now()
    }

    // Don't add duplicates of the most recent item
    const lastItem = navigationHistory.value[navigationHistory.value.length - 1]
    if (lastItem && lastItem.path === path) {
      return
    }

    navigationHistory.value.push(item)

    // Limit history size
    if (navigationHistory.value.length > MAX_HISTORY_SIZE) {
      navigationHistory.value.shift()
    }
  }

  /**
   * Get breadcrumb items for current route
   */
  const breadcrumbs = computed(() => {
    const crumbPath: BreadcrumbItem[] = []
    const pathSegments = route.path.split('/').filter(Boolean)

    // Always add Home
    crumbPath.push({ title: 'Home', path: '/' })

    // Add each segment
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const title = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      crumbPath.push({ title, path: currentPath })
    })

    // Limit breadcrumbs to prevent overcrowding
    if (crumbPath.length > 4) {
      const first = crumbPath[0]
      const last = crumbPath[crumbPath.length - 1]
      const prev = crumbPath[crumbPath.length - 2]
      crumbPath.splice(1, crumbPath.length - 3, { title: '...', path: prev.path })
    }

    return crumbPath
  })

  /**
   * Check if we can go back in navigation history
   */
  function canGoBack(steps = 1): boolean {
    return navigationHistory.value.length > steps
  }

  /**
   * Check if we can go forward in navigation history
   */
  function canGoForward(): boolean {
    // This would track forward history separately if needed
    return false
  }

  /**
   * Navigate back N steps
   */
  function navigateBack(steps = 1) {
    if (steps < 1) return

    const historyIndex = navigationHistory.value.length - 1 - steps
    if (historyIndex >= 0) {
      const targetPath = navigationHistory.value[historyIndex].path
      router.push(targetPath)
    } else {
      router.push('/')
    }
  }

  /**
   * Navigate forward (placeholder - would need forward history tracking)
   */
  function navigateForward() {
    // Implement forward navigation if forward history is tracked
    router.go(1)
  }

  /**
   * Navigate to a route
   */
  function navigateToRoute(path: string, title?: string) {
    router.push(path)
    if (title) {
      addToHistory(path, title)
    }
  }

  /**
   * Navigate with replace (replace history entry)
   */
  function navigateWithReplace(path: string) {
    router.replace(path)
  }

  /**
   * Navigate with confirmation (for unsaved changes)
   */
  function navigateWithConfirm(path: string, message = 'Unsaved changes. Leave anyway?') {
    if (hasUnsavedChanges.value && !confirm(message)) {
      return
    }
    router.push(path)
  }

  /**
   * Navigate back with confirmation
   */
  function navigateBackWithConfirm(message = 'Unsaved changes. Leave anyway?') {
    if (hasUnsavedChanges.value && !confirm(message)) {
      return
    }
    router.back()
  }

  /**
   * Scroll to top of page
   */
  function scrollToTop() {
    window.scrollTo(0, 0)
  }

  /**
   * Get navigation depth (how deep in the site hierarchy)
   */
  const navigationDepth = computed(() => {
    return route.path.split('/').filter(Boolean).length
  })

  /**
   * Get parent route path
   */
  const parentPath = computed(() => {
    const segments = route.path.split('/').filter(Boolean)
    if (segments.length <= 1) return '/'
    segments.pop()
    return '/' + segments.join('/')
  })

  /**
   * Navigate to parent route
   */
  function navigateToParent() {
    router.push(parentPath.value)
  }

  /**
   * Set unsaved changes flag
   */
  function setUnsavedChanges(value: boolean) {
    hasUnsavedChanges.value = value
  }

  /**
   * Get route title from path
   */
  function getRouteTitle(path: string, allRoutes: RouteData[]): string {
    const matchingRoute = allRoutes.find(r => r.path === path)
    if (matchingRoute) {
      return matchingRoute.title
    }

    // Generate title from path segments
    const segments = path.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Handle before route leave (for unsaved changes)
   */
  function onBeforeRouteLeave(to: any, from: any, next: Function) {
    if (hasUnsavedChanges.value) {
      const answer = confirm('Unsaved changes. Leave anyway?')
      if (answer) {
        hasUnsavedChanges.value = false
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  }

  // Track route changes on mount
  onMounted(() => {
    // Add current route to history on mount
    addToHistory(route.path, route.meta.title as string || 'Home')

    // Add keyboard listener for back/forward
    const handleKeydown = (e: KeyboardEvent) => {
      // Alt+Left for back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateBack()
      }
      // Alt+Right for forward
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault()
        navigateForward()
      }
    }

    window.addEventListener('keydown', handleKeydown)
  })

  return {
    // State
    navigationHistory,
    hasUnsavedChanges,
    breadcrumbs,
    navigationDepth,
    parentPath,

    // Navigation methods
    navigateBack,
    navigateForward,
    navigateToRoute,
    navigateWithReplace,
    navigateWithConfirm,
    navigateBackWithConfirm,
    navigateToParent,
    scrollToTop,

    // Utility methods
    canGoBack,
    canGoForward,
    setUnsavedChanges,
    getRouteTitle,
    onBeforeRouteLeave,
    addToHistory
  }
}
