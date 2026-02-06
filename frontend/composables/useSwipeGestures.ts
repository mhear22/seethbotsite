import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/useAppStore'

export interface SwipeAction {
  id: string
  name: string
  icon: string
  action: () => void
}

export interface SwipeConfig {
  threshold: number
  swipeDuration: number
  enabledOnMobile: boolean
  enabledOnDesktop: boolean
  showVisualFeedback: boolean
}

export interface PageRoute {
  path: string
  title: string
}

const DEFAULT_CONFIG: SwipeConfig = {
  threshold: 50, // Minimum pixels to register a swipe
  swipeDuration: 300, // Maximum ms for a valid swipe
  enabledOnMobile: true,
  enabledOnDesktop: false, // Default to mobile-only for better UX
  showVisualFeedback: true
}

// Page navigation order for horizontal swipes
const PAGE_NAVIGATION_ORDER: PageRoute[] = [
  { path: '/', title: 'Home' },
  { path: '/movies', title: 'Movies' },
  { path: '/rankings', title: 'Rankings' },
  { path: '/tickets', title: 'Tickets' },
  { path: '/stocks', title: 'Stocks' },
  { path: '/clicker', title: 'Clicker' },
  { path: '/fishing', title: 'Fishing' },
  { path: '/stats', title: 'Stats' },
  { path: '/cats', title: 'Cats' },
  { path: '/shop', title: 'Shop' }
]

// Quick actions for vertical swipes
const QUICK_ACTIONS: {
  up: SwipeAction[]
  down: SwipeAction[]
} = {
  up: [
    {
      id: 'toggle-dark-mode',
      name: 'Toggle Dark Mode',
      icon: '🌙',
      action: () => {
        const appStore = useAppStore()
        appStore.toggleDarkMode()
      }
    },
    {
      id: 'toggle-music',
      name: 'Toggle Music',
      icon: '🔊',
      action: () => {
        const appStore = useAppStore()
        appStore.toggleMusic()
      }
    }
  ],
  down: [
    {
      id: 'toggle-rankings',
      name: 'Toggle Rankings',
      icon: '👻',
      action: () => {
        const appStore = useAppStore()
        appStore.togglePanel('rankings')
      }
    },
    {
      id: 'toggle-cats',
      name: 'Toggle Cats',
      icon: '🐱',
      action: () => {
        const appStore = useAppStore()
        appStore.togglePanel('cat')
      }
    },
    {
      id: 'toggle-feed',
      name: 'Toggle Feed',
      icon: '📰',
      action: () => {
        const appStore = useAppStore()
        appStore.togglePanel('feed')
      }
    }
  ]
}

export function useSwipeGestures(config: Partial<SwipeConfig> = {}) {
  const router = useRouter()
  const route = useRoute()
  const appStore = useAppStore()

  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const isMobile = computed(() => window.innerWidth < 768)
  const isEnabled = computed(() =>
    (isMobile.value && mergedConfig.enabledOnMobile) ||
    (!isMobile.value && mergedConfig.enabledOnDesktop)
  )

  // Touch state tracking
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchStartTime = ref(0)
  const isTouching = ref(false)

  // Visual feedback state
  const swipeFeedback = ref<{
    visible: boolean
    direction: 'left' | 'right' | 'up' | 'down' | null
    icon: string
    message: string
  }>({
    visible: false,
    direction: null,
    icon: '',
    message: ''
  })

  // Find current page index in navigation order
  const getCurrentPageIndex = (): number => {
    return PAGE_NAVIGATION_ORDER.findIndex(page => page.path === route.path)
  }

  // Get next/previous page
  const getAdjacentPage = (direction: 'next' | 'prev'): PageRoute | null => {
    const currentIndex = getCurrentPageIndex()
    if (currentIndex === -1) return null

    const targetIndex = direction === 'next'
      ? currentIndex + 1
      : currentIndex - 1

    if (targetIndex < 0 || targetIndex >= PAGE_NAVIGATION_ORDER.length) {
      return null
    }

    return PAGE_NAVIGATION_ORDER[targetIndex]
  }

  // Show visual feedback
  const showSwipeFeedback = (direction: 'left' | 'right' | 'up' | 'down', icon: string, message: string) => {
    if (!mergedConfig.showVisualFeedback) return

    swipeFeedback.value = {
      visible: true,
      direction,
      icon,
      message
    }

    setTimeout(() => {
      swipeFeedback.value.visible = false
    }, 1000)
  }

  // Handle horizontal swipe (page navigation)
  const handleHorizontalSwipe = (direction: 'left' | 'right') => {
    const adjacentPage = getAdjacentPage(direction === 'left' ? 'next' : 'prev')

    if (adjacentPage) {
      showSwipeFeedback(
        direction,
        direction === 'left' ? '→' : '←',
        adjacentPage.title
      )
      router.push(adjacentPage.path)
    } else {
      // At edge, show feedback
      showSwipeFeedback(
        direction,
        direction === 'left' ? '↗' : '↖',
        'No more pages'
      )
    }
  }

  // Handle vertical swipe (quick actions)
  const handleVerticalSwipe = (direction: 'up' | 'down') => {
    const actions = QUICK_ACTIONS[direction]

    // Rotate through actions based on route path to give different actions on different pages
    const routeIndex = getCurrentPageIndex() % actions.length
    const action = actions[routeIndex]

    if (action) {
      showSwipeFeedback(
        direction,
        action.icon,
        action.name
      )
      action.action()
    }
  }

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (!isEnabled.value) return

    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
    touchStartTime.value = Date.now()
    isTouching.value = true
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isEnabled.value || !isTouching.value) return

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const touchEndTime = Date.now()

    const deltaX = touchEndX - touchStartX.value
    const deltaY = touchEndY - touchStartY.value
    const deltaTime = touchEndTime - touchStartTime.value

    // Check if swipe duration is within limits
    if (deltaTime > mergedConfig.swipeDuration) {
      isTouching.value = false
      return
    }

    // Check if swipe distance meets threshold
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    if (absDeltaX < mergedConfig.threshold && absDeltaY < mergedConfig.threshold) {
      isTouching.value = false
      return
    }

    // Determine if horizontal or vertical swipe
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        handleHorizontalSwipe('right')
      } else {
        handleHorizontalSwipe('left')
      }
    } else {
      // Vertical swipe
      if (deltaY < 0) {
        handleVerticalSwipe('up')
      } else {
        handleVerticalSwipe('down')
      }
    }

    isTouching.value = false
  }

  // Setup touch event listeners
  const setupTouchListeners = () => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  const removeTouchListeners = () => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchend', handleTouchEnd)
  }

  // Lifecycle hooks
  onMounted(() => {
    setupTouchListeners()
  })

  onUnmounted(() => {
    removeTouchListeners()
  })

  // Expose methods for manual trigger (e.g., from tests)
  const manualSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!isEnabled.value) return

    if (direction === 'left' || direction === 'right') {
      handleHorizontalSwipe(direction)
    } else {
      handleVerticalSwipe(direction)
    }
  }

  return {
    swipeFeedback,
    isEnabled,
    isMobile,
    manualSwipe
  }
}

// Export constants for use in components
export { PAGE_NAVIGATION_ORDER, QUICK_ACTIONS }
