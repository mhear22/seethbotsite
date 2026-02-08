<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}>(), {
  position: 'top',
  delay: 200
})

const isVisible = ref(false)
const showTimeout = ref<number | null>(null)
const hideTimeout = ref<number | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const tooltipPosition = ref({ top: 0, left: 0 })

// Computed classes for positioning
const tooltipClasses = computed(() => {
  return {
    [`tooltip-${props.position}`]: true,
    'tooltip-visible': isVisible.value
  }
})

// Calculate tooltip position based on wrapper element
const calculatePosition = () => {
  if (!wrapperRef.value || !tooltipRef.value) return

  const wrapperRect = wrapperRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()

  let top = 0
  let left = 0

  switch (props.position) {
    case 'top':
      left = wrapperRect.left + (wrapperRect.width / 2) - (tooltipRect.width / 2)
      top = wrapperRect.top - tooltipRect.height - 8
      break
    case 'bottom':
      left = wrapperRect.left + (wrapperRect.width / 2) - (tooltipRect.width / 2)
      top = wrapperRect.bottom + 8
      break
    case 'left':
      left = wrapperRect.left - tooltipRect.width - 8
      top = wrapperRect.top + (wrapperRect.height / 2) - (tooltipRect.height / 2)
      break
    case 'right':
      left = wrapperRect.right + 8
      top = wrapperRect.top + (wrapperRect.height / 2) - (tooltipRect.height / 2)
      break
  }

  // Ensure tooltip stays within viewport
  const padding = 10
  const maxTop = window.innerHeight - tooltipRect.height - padding
  const maxLeft = window.innerWidth - tooltipRect.width - padding

  top = Math.max(padding, Math.min(top, maxTop))
  left = Math.max(padding, Math.min(left, maxLeft))

  tooltipPosition.value = { top, left }
}

// Show tooltip with delay
const show = async () => {
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
    hideTimeout.value = null
  }
  if (!showTimeout.value) {
    showTimeout.value = setTimeout(async () => {
      isVisible.value = true
      showTimeout.value = null
      await nextTick()
      calculatePosition()
    }, props.delay) as unknown as number
  }
}

// Hide tooltip with small delay
const hide = () => {
  if (showTimeout.value) {
    clearTimeout(showTimeout.value)
    showTimeout.value = null
  }
  if (!hideTimeout.value && isVisible.value) {
    hideTimeout.value = setTimeout(() => {
      isVisible.value = false
      hideTimeout.value = null
    }, 100) as unknown as number
  }
}

// Recalculate position when visibility changes
watch(isVisible, async (visible) => {
  if (visible) {
    await nextTick()
    calculatePosition()
  }
})

// Handle keyboard focus for accessibility
const handleFocus = () => {
  show()
}

const handleBlur = () => {
  hide()
}

// Handle mouse events
const handleMouseEnter = () => {
  show()
}

const handleMouseLeave = () => {
  hide()
}

// Handle scroll to reposition tooltip
const handleScroll = () => {
  if (isVisible.value) {
    calculatePosition()
  }
}

// Cleanup timeouts on unmount
onMounted(() => {
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleScroll)
})

onUnmounted(() => {
  if (showTimeout.value) {
    clearTimeout(showTimeout.value)
  }
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
  }
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleScroll)
})
</script>

<template>
  <div
    ref="wrapperRef"
    class="tooltip-wrapper"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocus"
    @focusout="handleBlur"
  >
    <slot></slot>

    <Teleport to="body">
      <div
        v-if="isVisible"
        ref="tooltipRef"
        class="tooltip"
        :class="tooltipClasses"
        :style="{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }"
        role="tooltip"
        :aria-hidden="!isVisible"
      >
        {{ text }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tooltip-wrapper {
  display: inline-flex;
  position: relative;
}

.tooltip {
  position: fixed;
  z-index: 9999;
  background: #2d3748;
  color: #f7fafc;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Quicksand', sans-serif;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  animation: tooltipFadeIn 0.2s ease;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Dark mode */
.dark .tooltip {
  background: #f7fafc;
  color: #2d3748;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

/* Chaos theme */
.chaos .tooltip {
  animation: chaosPulse 0.5s ease-in-out infinite;
  background: #ff0080;
  color: white;
}

@keyframes chaosPulse {
  0%, 100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.05);
  }
}
</style>
