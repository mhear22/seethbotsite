/**
 * Swipe Gestures Composable
 * Provides touch gesture functionality for mobile navigation
 */

import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export interface SwipeSettings {
  enabled: boolean
  sensitivity: number // minimum distance in pixels to trigger a swipe
  hapticFeedback: boolean
  visualFeedback: boolean
}

export interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down'
  deltaX: number
  deltaY: number
  velocity: number
}

export function useSwipeGestures(settings?: Partial<SwipeSettings>) {
  const router = useRouter()
  const isEnabled = ref(localStorage.getItem('swipeEnabled') === 'true')
  const sensitivity = ref(settings?.sensitivity ?? 50)
  const hapticFeedback = ref(settings?.hapticFeedback ?? true)
  const visualFeedback = ref(settings?.visualFeedback ?? true)

  // Touch tracking
  const touchStart = ref({ x: 0, y: 0 })
  const touchEnd = ref({ x: 0, y: 0 })
  const currentSwipe = ref<SwipeEvent | null>(null)
  const isSwiping = ref(false)

  // Route order for navigation (next/previous)
  const routeOrder = [
    'home',
    'fishing',
    'stats',
    'character-tinder',
    'girl',
    'phrenology',
    'about',
    'rankings',
    'cats',
    'stocks',
    'movies',
    'countdowns',
    'tickets',
    'clocks',
    'music',
    'opinion',
    'mold',
    'clicker',
    'shop',
    'wordcloud',
    'keanu',
    'patch-notes',
    'settings',
    'car',
    'favorites',
    'challenges',
    'archive',
    'messages',
    'analytics',
    'solar',
    'solar-battery',
    'mech-builder',
    'mech-battle',
    'search'
  ]

  // Calculate current route index
  const currentRouteIndex = computed(() => {
    return routeOrder.indexOf(router.currentRoute.value.name as string)
  })

  // Handle touch start
  const handleTouchStart = (event: TouchEvent) => {
    if (!isEnabled.value) return

    touchStart.value = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    }
    isSwiping.value = false
  }

  // Handle touch move
  const handleTouchMove = (event: TouchEvent) => {
    if (!isEnabled.value) return

    touchEnd.value = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    }

    const deltaX = touchEnd.value.x - touchStart.value.x
    const deltaY = touchEnd.value.y - touchStart.value.y

    // Check if movement exceeds threshold to determine if we're swiping
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      isSwiping.value = true
    }

    // Emit swipe progress event for visual feedback
    if (isSwiping.value && visualFeedback.value) {
      window.dispatchEvent(new CustomEvent('swipe-progress', {
        detail: { deltaX, deltaY }
      }))
    }
  }

  // Handle touch end
  const handleTouchEnd = (event: TouchEvent) => {
    if (!isEnabled.value) return

    const deltaX = touchEnd.value.x - touchStart.value.x
    const deltaY = touchEnd.value.y - touchStart.value.y

    // Calculate velocity (distance / time, using a fixed duration assumption)
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Determine primary direction
    let direction: 'left' | 'right' | 'up' | 'down' | null = null
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) >= sensitivity.value) {
        direction = deltaX > 0 ? 'right' : 'left'
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) >= sensitivity.value) {
        direction = deltaY > 0 ? 'down' : 'up'
      }
    }

    if (direction) {
      const swipeEvent: SwipeEvent = {
        direction,
        deltaX,
        deltaY,
        velocity
      }

      currentSwipe.value = swipeEvent

      // Emit swipe detected event
      window.dispatchEvent(new CustomEvent('swipe-detected', {
        detail: swipeEvent
      }))

      // Provide haptic feedback on supported devices
      if (hapticFeedback.value && 'vibrate' in navigator) {
        navigator.vibrate(50)
      }

      // Handle navigation based on direction
      handleSwipeNavigation(direction)
    }

    isSwiping.value = false
    currentSwipe.value = null
  }

  // Handle swipe navigation
  const handleSwipeNavigation = (direction: 'left' | 'right' | 'up' | 'down') => {
    const currentIndex = currentRouteIndex.value

    switch (direction) {
      case 'left':
        // Navigate to next page
        if (currentIndex >= 0 && currentIndex < routeOrder.length - 1) {
          router.push({ name: routeOrder[currentIndex + 1] })
        }
        break

      case 'right':
        // Navigate to previous page
        if (currentIndex > 0) {
          router.push({ name: routeOrder[currentIndex - 1] })
        } else {
          // Go back to home if we're already at the start
          router.push({ name: 'home' })
        }
        break

      case 'up':
        // Open next panel or trigger panel action
        window.dispatchEvent(new CustomEvent('swipe-up', {
          detail: { direction: 'up' }
        }))
        break

      case 'down':
        // Close current panel or trigger close action
        window.dispatchEvent(new CustomEvent('swipe-down', {
          detail: { direction: 'down' }
        }))
        break
    }
  }

  // Update settings
  const updateSettings = (newSettings: Partial<SwipeSettings>) => {
    if (newSettings.enabled !== undefined) {
      isEnabled.value = newSettings.enabled
      localStorage.setItem('swipeEnabled', newSettings.enabled.toString())
    }
    if (newSettings.sensitivity !== undefined) {
      sensitivity.value = newSettings.sensitivity
      localStorage.setItem('swipeSensitivity', newSettings.sensitivity.toString())
    }
    if (newSettings.hapticFeedback !== undefined) {
      hapticFeedback.value = newSettings.hapticFeedback
      localStorage.setItem('swipeHaptic', newSettings.hapticFeedback.toString())
    }
    if (newSettings.visualFeedback !== undefined) {
      visualFeedback.value = newSettings.visualFeedback
      localStorage.setItem('swipeVisual', newSettings.visualFeedback.toString())
    }
  }

  // Load settings from localStorage
  const loadSettings = () => {
    const savedEnabled = localStorage.getItem('swipeEnabled')
    const savedSensitivity = localStorage.getItem('swipeSensitivity')
    const savedHaptic = localStorage.getItem('swipeHaptic')
    const savedVisual = localStorage.getItem('swipeVisual')

    if (savedEnabled !== null) isEnabled.value = savedEnabled === 'true'
    if (savedSensitivity !== null) sensitivity.value = parseInt(savedSensitivity, 10)
    if (savedHaptic !== null) hapticFeedback.value = savedHaptic === 'true'
    if (savedVisual !== null) visualFeedback.value = savedVisual === 'true'
  }

  // Get current settings
  const getSettings = computed((): SwipeSettings => ({
    enabled: isEnabled.value,
    sensitivity: sensitivity.value,
    hapticFeedback: hapticFeedback.value,
    visualFeedback: visualFeedback.value
  }))

  // Setup event listeners
  onMounted(() => {
    loadSettings()
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
  })

  // Cleanup event listeners
  onUnmounted(() => {
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
  })

  return {
    isEnabled,
    sensitivity,
    hapticFeedback,
    visualFeedback,
    isSwiping,
    currentSwipe,
    settings: getSettings,
    updateSettings
  }
}
