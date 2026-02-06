<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  direction: 'left' | 'right' | 'up' | 'down' | null
  icon: string
  message: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  direction: null,
  icon: '',
  message: ''
})

// Calculate position based on direction
const positionStyle = computed(() => {
  if (!props.direction) return {}

  const baseStyle: Record<string, string> = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '9999'
  }

  switch (props.direction) {
    case 'left':
      return {
        ...baseStyle,
        left: '20%'
      }
    case 'right':
      return {
        ...baseStyle,
        left: '80%'
      }
    case 'up':
      return {
        ...baseStyle,
        top: '30%'
      }
    case 'down':
      return {
        ...baseStyle,
        top: '70%'
      }
    default:
      return baseStyle
  }
})

// Arrow icon based on direction
const arrowIcon = computed(() => {
  switch (props.direction) {
    case 'left':
      return '←'
    case 'right':
      return '→'
    case 'up':
      return '↑'
    case 'down':
      return '↓'
    default:
      return ''
  }
})
</script>

<template>
  <Transition name="swipe-feedback">
    <div
      v-if="visible"
      class="swipe-feedback"
      :style="positionStyle"
    >
      <div class="feedback-content">
        <span class="feedback-arrow">{{ arrowIcon }}</span>
        <span class="feedback-icon">{{ icon }}</span>
        <span class="feedback-message">{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.swipe-feedback {
  pointer-events: none;
  user-select: none;
}

.feedback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 182, 193, 0.3);
  min-width: 120px;
}

.dark .feedback-content {
  background: rgba(40, 44, 52, 0.95);
  border-color: rgba(255, 182, 193, 0.2);
}

.feedback-arrow {
  font-size: 32px;
  font-weight: bold;
  color: #ff91a4;
  animation: arrow-pulse 0.5s ease-in-out infinite alternate;
}

.dark .feedback-arrow {
  color: #ffb6c1;
}

@keyframes arrow-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.feedback-icon {
  font-size: 40px;
  line-height: 1;
  animation: icon-bounce 0.6s ease-out;
}

@keyframes icon-bounce {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.feedback-message {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-align: center;
  white-space: nowrap;
}

.dark .feedback-message {
  color: #ccc;
}

/* Direction-specific animations */
.swipe-feedback[data-direction="left"] .feedback-arrow,
.swipe-feedback[data-direction="right"] .feedback-arrow {
  animation: arrow-slide-horizontal 0.5s ease-in-out infinite alternate;
}

@keyframes arrow-slide-horizontal {
  0% {
    transform: translateX(-5px);
  }
  100% {
    transform: translateX(5px);
  }
}

.swipe-feedback[data-direction="up"] .feedback-arrow,
.swipe-feedback[data-direction="down"] .feedback-arrow {
  animation: arrow-slide-vertical 0.5s ease-in-out infinite alternate;
}

@keyframes arrow-slide-vertical {
  0% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(5px);
  }
}

/* Transition animations */
.swipe-feedback-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.swipe-feedback-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.swipe-feedback-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.swipe-feedback-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.2);
}

/* Mobile-specific adjustments */
@media (max-width: 768px) {
  .feedback-content {
    padding: 12px 20px;
    min-width: 100px;
  }

  .feedback-arrow {
    font-size: 28px;
  }

  .feedback-icon {
    font-size: 36px;
  }

  .feedback-message {
    font-size: 13px;
  }
}
</style>
