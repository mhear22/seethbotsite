<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  direction: string | null
  progress: number
}

const props = defineProps<Props>()

// Determine indicator position and arrow based on direction
const indicatorStyle = computed(() => {
  if (!props.direction || props.progress <= 0) {
    return {
      opacity: 0,
      transform: 'scale(0)'
    }
  }

  const baseStyle = {
    opacity: Math.min(props.progress, 1)
  }

  switch (props.direction) {
    case 'left':
      return {
        ...baseStyle,
        right: '20px',
        top: '50%',
        transform: `translateY(-50%) scale(${Math.min(props.progress, 1)})`
      }
    case 'right':
      return {
        ...baseStyle,
        left: '20px',
        top: '50%',
        transform: `translateY(-50%) scale(${Math.min(props.progress, 1)})`
      }
    case 'up':
      return {
        ...baseStyle,
        bottom: '20px',
        left: '50%',
        transform: `translateX(-50%) scale(${Math.min(props.progress, 1)})`
      }
    case 'down':
      return {
        ...baseStyle,
        top: '20px',
        left: '50%',
        transform: `translateX(-50%) scale(${Math.min(props.progress, 1)})`
      }
    default:
      return {
        ...baseStyle,
        opacity: 0,
        transform: 'scale(0)'
      }
  }
})

// Determine arrow character and rotation based on direction
const arrowStyle = computed(() => {
  let rotation = 0

  switch (props.direction) {
    case 'left':
      rotation = 180
      break
    case 'right':
      rotation = 0
      break
    case 'up':
      rotation = -90
      break
    case 'down':
      rotation = 90
      break
  }

  return {
    transform: `rotate(${rotation}deg)`
  }
})
</script>

<template>
  <div v-if="direction && progress > 0" class="swipe-indicator" :style="indicatorStyle">
    <div class="swipe-arrow" :style="arrowStyle">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 4L12 20M12 4L5 11M12 4L19 11"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <div class="swipe-label">{{ direction }}</div>
  </div>
</template>

<style scoped>
.swipe-indicator {
  position: fixed;
  z-index: 10000;
  background: rgba(255, 107, 157, 0.9);
  color: white;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: 0 4px 16px rgba(255, 107, 157, 0.4);
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease, right 0.15s ease, left 0.15s ease,
              top 0.15s ease, bottom 0.15s ease;
  backdrop-filter: blur(4px);
}

.swipe-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
}

.swipe-arrow svg {
  width: 100%;
  height: 100%;
  color: white;
}

.swipe-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Animation for when swipe is complete */
.swipe-indicator[style*="opacity: 1"] {
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Dark mode adjustments */
:global(body.dark) .swipe-indicator {
  background: rgba(255, 107, 157, 0.8);
  box-shadow: 0 4px 16px rgba(255, 107, 157, 0.6);
}

/* Reduce motion support */
:global(body.reduce-motion) .swipe-indicator {
  transition: none;
  animation: none;
}
</style>
