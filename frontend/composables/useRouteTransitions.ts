import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Transition types for route navigation
 */
export type TransitionType = 'fade' | 'slide-left' | 'slide-right' | 'scale' | 'fade-slide' | 'none'

/**
 * Transition configuration per route
 */
export interface RouteTransitionConfig {
  path: string
  transition?: TransitionType
  duration?: number
  animate?: boolean
}

// Default route transition configurations
const defaultRouteTransitions: RouteTransitionConfig[] = [
  {
    path: '/',
    transition: 'fade',
    animate: true
  },
  {
    path: '/clicker',
    transition: 'scale',
    animate: true
  },
  {
    path: '/fishing',
    transition: 'scale',
    animate: true
  }
]

/**
 * Composable for handling route transitions and animations
 */
export function useRouteTransitions(customTransitions?: RouteTransitionConfig[]) {
  const route = useRoute()

  const transitions = computed(() => customTransitions || defaultRouteTransitions)

  /**
   * Get transition name for a route
   */
  function getTransitionName(path?: string): TransitionType {
    const targetPath = path || route.path
    const config = transitions.value.find(t => targetPath.startsWith(t.path))
    return config?.transition || 'fade'
  }

  /**
   * Get transition name for current route (for template use)
   */
  const currentTransitionName = computed(() => getTransitionName())

  /**
   * Check if animation is enabled for a route
   */
  function shouldAnimate(path?: string): boolean {
    const targetPath = path || route.path
    const config = transitions.value.find(t => targetPath.startsWith(t.path))
    return config?.animate !== false // Default to true
  }

  /**
   * Check if animation is enabled for current route
   */
  const currentShouldAnimate = computed(() => shouldAnimate())

  /**
   * Get transition duration in milliseconds
   */
  function getTransitionDuration(path?: string): number {
    const targetPath = path || route.path
    const config = transitions.value.find(t => targetPath.startsWith(t.path))
    return config?.duration || 300
  }

  /**
   * Get transition duration for current route
   */
  const currentTransitionDuration = computed(() => getTransitionDuration())

  /**
   * Handle transition enter animation
   */
  function handleTransitionEnter(el: Element, done: () => void) {
    if (!currentShouldAnimate.value) {
      done()
      return
    }

    const element = el as HTMLElement
    const duration = currentTransitionDuration.value

    // Apply transition based on type
    const transitionName = currentTransitionName.value

    switch (transitionName) {
      case 'fade':
        element.style.transition = `opacity ${duration}ms ease-in-out`
        element.style.opacity = '0'
        requestAnimationFrame(() => {
          element.style.opacity = '1'
          setTimeout(done, duration)
        })
        break

      case 'scale':
        element.style.transition = `transform ${duration}ms ease-out`
        element.style.transform = 'scale(0.95)'
        element.style.opacity = '0'
        requestAnimationFrame(() => {
          element.style.transform = 'scale(1)'
          element.style.opacity = '1'
          setTimeout(done, duration)
        })
        break

      case 'slide-left':
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`
        element.style.transform = 'translateX(20px)'
        element.style.opacity = '0'
        requestAnimationFrame(() => {
          element.style.transform = 'translateX(0)'
          element.style.opacity = '1'
          setTimeout(done, duration)
        })
        break

      case 'slide-right':
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`
        element.style.transform = 'translateX(-20px)'
        element.style.opacity = '0'
        requestAnimationFrame(() => {
          element.style.transform = 'translateX(0)'
          element.style.opacity = '1'
          setTimeout(done, duration)
        })
        break

      case 'fade-slide':
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-in-out`
        element.style.transform = 'translateY(10px)'
        element.style.opacity = '0'
        requestAnimationFrame(() => {
          element.style.transform = 'translateY(0)'
          element.style.opacity = '1'
          setTimeout(done, duration)
        })
        break

      default:
        done()
    }
  }

  /**
   * Handle transition leave animation
   */
  function handleTransitionLeave(el: Element, done: () => void) {
    if (!currentShouldAnimate.value) {
      done()
      return
    }

    const element = el as HTMLElement
    const duration = currentTransitionDuration.value
    const transitionName = currentTransitionName.value

    switch (transitionName) {
      case 'fade':
        element.style.transition = `opacity ${duration}ms ease-in-out`
        element.style.opacity = '1'
        requestAnimationFrame(() => {
          element.style.opacity = '0'
          setTimeout(done, duration)
        })
        break

      case 'scale':
        element.style.transition = `transform ${duration}ms ease-in`
        element.style.transform = 'scale(1)'
        element.style.opacity = '1'
        requestAnimationFrame(() => {
          element.style.transform = 'scale(0.95)'
          element.style.opacity = '0'
          setTimeout(done, duration)
        })
        break

      case 'slide-left':
        element.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`
        element.style.transform = 'translateX(0)'
        element.style.opacity = '1'
        requestAnimationFrame(() => {
          element.style.transform = 'translateX(-20px)'
          element.style.opacity = '0'
          setTimeout(done, duration)
        })
        break

      case 'slide-right':
        element.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`
        element.style.transform = 'translateX(0)'
        element.style.opacity = '1'
        requestAnimationFrame(() => {
          element.style.transform = 'translateX(20px)'
          element.style.opacity = '0'
          setTimeout(done, duration)
        })
        break

      case 'fade-slide':
        element.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in-out`
        element.style.transform = 'translateY(0)'
        element.style.opacity = '1'
        requestAnimationFrame(() => {
          element.style.transform = 'translateY(-10px)'
          element.style.opacity = '0'
          setTimeout(done, duration)
        })
        break

      default:
        done()
    }
  }

  /**
   * Get CSS class for transition name
   */
  const transitionClass = computed(() => {
    const name = currentTransitionName.value
    return name !== 'none' ? name : ''
  })

  return {
    // State
    currentTransitionName,
    currentTransitionDuration,
    currentShouldAnimate,
    transitionClass,

    // Methods
    getTransitionName,
    shouldAnimate,
    getTransitionDuration,
    handleTransitionEnter,
    handleTransitionLeave
  }
}
