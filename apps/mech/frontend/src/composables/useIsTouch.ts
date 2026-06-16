/**
 * useIsTouch — reactively reports whether the device is touch-primary.
 *
 * Uses matchMedia('(pointer: coarse)') with an 'ontouchstart' fallback, so the
 * on-screen controls + mobile UI only appear on phones/tablets and the desktop
 * keyboard/mouse experience is left completely untouched. Updates live if the
 * primary pointer changes (e.g. a tablet docking a mouse) and cleans up on
 * unmount.
 */
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useIsTouch(): Ref<boolean> {
  const isTouch = ref(false)

  // SSR/safety guards — only touch window/matchMedia in the browser.
  const hasWindow = typeof window !== 'undefined'
  const mql = hasWindow && window.matchMedia ? window.matchMedia('(pointer: coarse)') : null

  const evaluate = () => {
    // Gate strictly on the PRIMARY pointer being coarse. A touch-capable laptop
    // / 2-in-1 reports pointer:coarse = false (its primary pointer is the mouse),
    // so the touch overlay never mounts there — desktop behaviour is preserved.
    // (We deliberately do NOT use ontouchstart / maxTouchPoints, which are true
    // on those hybrid devices.)
    isTouch.value = mql ? mql.matches : false
  }

  evaluate()

  const onChange = () => evaluate()

  onMounted(() => {
    if (mql) {
      // addEventListener is the modern API; older Safari uses addListener.
      if (mql.addEventListener) mql.addEventListener('change', onChange)
      else if (mql.addListener) mql.addListener(onChange)
    }
    evaluate()
  })

  onUnmounted(() => {
    if (mql) {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange)
      else if (mql.removeListener) mql.removeListener(onChange)
    }
  })

  return isTouch
}
