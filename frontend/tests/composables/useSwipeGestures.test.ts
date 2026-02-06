/**
 * Tests for useSwipeGestures composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'

// Mock vue-router
const mockPush = vi.fn()
const mockRoutePath = ref('/')

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useRoute: () => ({
    path: mockRoutePath.value
  })
}))

// Mock useAppStore
const mockToggleDarkMode = vi.fn()
const mockToggleMusic = vi.fn()
const mockTogglePanel = vi.fn()

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => ({
    toggleDarkMode: mockToggleDarkMode,
    toggleMusic: mockToggleMusic,
    togglePanel: mockTogglePanel
  })
}))

// We need to mock onMounted / onUnmounted since we are not inside a component setup
// The composable calls onMounted and onUnmounted at the top level
const mountedCallbacks: Array<() => void> = []
const unmountedCallbacks: Array<() => void> = []

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual as any,
    onMounted: (cb: () => void) => { mountedCallbacks.push(cb) },
    onUnmounted: (cb: () => void) => { unmountedCallbacks.push(cb) }
  }
})

import { useSwipeGestures } from '../../composables/useSwipeGestures'

describe('useSwipeGestures', () => {
  let originalInnerWidth: number

  beforeEach(() => {
    vi.useFakeTimers()
    mockPush.mockClear()
    mockToggleDarkMode.mockClear()
    mockToggleMusic.mockClear()
    mockTogglePanel.mockClear()
    mockRoutePath.value = '/'
    mountedCallbacks.length = 0
    unmountedCallbacks.length = 0

    originalInnerWidth = window.innerWidth
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    })
  })

  const setMobile = () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    })
  }

  const setDesktop = () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })
  }

  describe('isEnabled', () => {
    it('should be true on mobile with enabledOnMobile', () => {
      setMobile()
      const { isEnabled, isMobile } = useSwipeGestures({ enabledOnMobile: true })

      expect(isMobile.value).toBe(true)
      expect(isEnabled.value).toBe(true)
    })

    it('should be false on desktop with enabledOnMobile only', () => {
      setDesktop()
      const { isEnabled, isMobile } = useSwipeGestures({
        enabledOnMobile: true,
        enabledOnDesktop: false
      })

      expect(isMobile.value).toBe(false)
      expect(isEnabled.value).toBe(false)
    })
  })

  describe('manualSwipe', () => {
    it('should do nothing when disabled', () => {
      setDesktop()
      const { manualSwipe } = useSwipeGestures({
        enabledOnMobile: true,
        enabledOnDesktop: false
      })

      manualSwipe('left')

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should navigate to next page on horizontal swipe left', () => {
      setMobile()
      mockRoutePath.value = '/'

      const { manualSwipe } = useSwipeGestures({ enabledOnMobile: true })

      manualSwipe('left')

      // From '/' (index 0), swiping left navigates to 'next' which is '/movies' (index 1)
      expect(mockPush).toHaveBeenCalledWith('/movies')
    })

    it('should navigate to previous page on horizontal swipe right', () => {
      setMobile()
      mockRoutePath.value = '/movies'

      const { manualSwipe } = useSwipeGestures({ enabledOnMobile: true })

      manualSwipe('right')

      // From '/movies' (index 1), swiping right navigates to 'prev' which is '/' (index 0)
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('visual feedback', () => {
    it('should show feedback with correct direction', () => {
      setMobile()
      mockRoutePath.value = '/'

      const { manualSwipe, swipeFeedback } = useSwipeGestures({ enabledOnMobile: true })

      manualSwipe('left')

      expect(swipeFeedback.value.visible).toBe(true)
      expect(swipeFeedback.value.direction).toBe('left')
    })

    it('should hide feedback after 1 second timeout', () => {
      setMobile()
      mockRoutePath.value = '/'

      const { manualSwipe, swipeFeedback } = useSwipeGestures({ enabledOnMobile: true })

      manualSwipe('left')
      expect(swipeFeedback.value.visible).toBe(true)

      vi.advanceTimersByTime(1000)

      expect(swipeFeedback.value.visible).toBe(false)
    })
  })

  describe('touch listeners', () => {
    it('should register touchstart and touchend listeners on mount and remove on unmount', () => {
      setMobile()

      const addSpy = vi.spyOn(document, 'addEventListener')
      const removeSpy = vi.spyOn(document, 'removeEventListener')

      useSwipeGestures({ enabledOnMobile: true })

      // Trigger the onMounted callbacks that were captured by our mock
      mountedCallbacks.forEach(cb => cb())

      expect(addSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true })
      expect(addSpy).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: true })

      // Trigger the onUnmounted callbacks
      unmountedCallbacks.forEach(cb => cb())

      expect(removeSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))
      expect(removeSpy).toHaveBeenCalledWith('touchend', expect.any(Function))

      addSpy.mockRestore()
      removeSpy.mockRestore()
    })
  })
})
