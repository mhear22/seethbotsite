<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 1,
  step: 0.01
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const containerRef = ref<HTMLElement>()
const sliderRef = ref<HTMLElement>()
const handleRef = ref<HTMLElement>()
const jellyFillRef = ref<HTMLElement>()

const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)

// Jelly physics simulation
const targetPercent = ref(props.modelValue * 100)
const currentPercent = ref(props.modelValue * 100)
const velocity = ref(0)
const compression = ref(1) // 1 = normal, < 1 = compressed, > 1 = stretched

// Animation loop for jelly physics
let animationFrameId: number | null = null

const animate = () => {
  // Spring physics for smooth movement
  const spring = 0.3
  const damping = 0.8
  const diff = targetPercent.value - currentPercent.value

  velocity.value = velocity.value * damping + diff * spring
  currentPercent.value += velocity.value

  // Compression based on velocity (moving fast = stretches, stops = squashes)
  const speed = Math.abs(velocity.value)
  compression.value = 1 + (speed * 0.05)

  // Clamp compression
  compression.value = Math.max(0.7, Math.min(1.3, compression.value))

  // Apply visual transformation
  if (handleRef.value) {
    handleRef.value.style.left = `${currentPercent.value}%`
    handleRef.value.style.transform = `translateX(-50%) scaleX(${compression.value}) scaleY(${1 / compression.value})`
  }

  if (jellyFillRef.value) {
    jellyFillRef.value.style.width = `${currentPercent.value}%`
  }

  // Update model value
  const newValue = (currentPercent.value / 100) * (props.max - props.min) + props.min
  emit('update:modelValue', Math.max(props.min, Math.min(props.max, newValue)))

  animationFrameId = requestAnimationFrame(animate)
}

const handleMouseDown = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  startX.value = clientX
  updateSliderPosition(clientX)

  if ('touches' in e) {
    document.addEventListener('touchmove', handleMouseMove, { passive: false })
    document.addEventListener('touchend', handleMouseUp)
  } else {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
}

const handleMouseMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  updateSliderPosition(clientX)
}

const handleMouseUp = () => {
  isDragging.value = false

  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleMouseMove)
  document.removeEventListener('touchend', handleMouseUp)
}

const updateSliderPosition = (clientX: number) => {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  let percent = ((clientX - rect.left) / rect.width) * 100

  // Clamp to 0-100
  percent = Math.max(0, Math.min(100, percent))

  // Snap to step
  const totalSteps = (props.max - props.min) / props.step
  const stepSize = 100 / totalSteps
  percent = Math.round(percent / stepSize) * stepSize

  targetPercent.value = percent
}

const handleClick = (e: MouseEvent) => {
  if (!containerRef.value) return
  updateSliderPosition(e.clientX)
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  targetPercent.value = (newValue / props.max) * 100
})

const volumeDisplay = computed(() => {
  return Math.round(props.modelValue * 100)
})

onMounted(() => {
  targetPercent.value = (props.modelValue / props.max) * 100
  animationFrameId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div class="volume-slider-container">
    <div class="volume-label">
      <span class="volume-icon">🔊</span>
      <span class="volume-value">{{ volumeDisplay }}%</span>
    </div>

    <div
      ref="containerRef"
      class="slider-track"
      @click="handleClick"
    >
      <!-- Background track -->
      <div class="track-background"></div>

      <!-- Jelly fill with gradient -->
      <div
        ref="jellyFillRef"
        class="jelly-fill"
      >
        <div class="jelly-highlight"></div>
      </div>

      <!-- Jelly handle -->
      <div
        ref="handleRef"
        class="jelly-handle"
        @mousedown="handleMouseDown"
        @touchstart.prevent="handleMouseDown"
      >
        <div class="jelly-blob">
          <div class="jelly-shine"></div>
        </div>
      </div>
    </div>

    <!-- Volume indicators -->
    <div class="volume-indicators">
      <span class="indicator">🔇</span>
      <span class="indicator">🔈</span>
      <span class="indicator">🔊</span>
    </div>
  </div>
</template>

<style scoped>
.volume-slider-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark .volume-slider-container {
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.volume-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.dark .volume-label {
  color: #e2e8f0;
}

.volume-icon {
  font-size: 1.5rem;
}

.volume-value {
  font-size: 1.25rem;
  color: #ff6b9d;
}

.dark .volume-value {
  color: #ffb6c1;
}

.slider-track {
  position: relative;
  width: 100%;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  overflow: visible;
  transition: background 0.3s ease;
}

.dark .slider-track {
  background: #4a5568;
}

.slider-track:hover .track-background {
  background: #cbd5e0;
}

.dark .slider-track:hover .track-background {
  background: #718096;
}

.track-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #e2e8f0;
  border-radius: 12px;
  transition: background 0.3s ease;
}

.dark .track-background {
  background: #4a5568;
}

.jelly-fill {
  position: absolute;
  top: 2px;
  left: 0;
  height: 20px;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 50%, #ffb6c1 100%);
  border-radius: 10px;
  overflow: hidden;
  transition: width 0.05s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.3);
}

.dark .jelly-fill {
  background: linear-gradient(135deg, #ffb6c1 0%, #ff91a4 50%, #e85e90 100%);
  box-shadow: 0 2px 8px rgba(255, 182, 193, 0.3);
}

.jelly-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 10px 10px 0 0;
}

.jelly-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  cursor: grab;
  z-index: 10;
}

.jelly-handle:active {
  cursor: grabbing;
}

.jelly-blob {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, #ffffff 0%, #ff6b9d 50%, #ff4081 100%);
  border-radius: 50%;
  box-shadow:
    0 4px 12px rgba(255, 107, 157, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.4),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.05s ease;
}

.dark .jelly-blob {
  background: radial-gradient(circle at 30% 30%, #ffffff 0%, #ffb6c1 50%, #e85e90 100%);
  box-shadow:
    0 4px 12px rgba(255, 182, 193, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.4),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.jelly-shine {
  position: absolute;
  top: 4px;
  left: 6px;
  width: 10px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transform: rotate(-45deg);
}

.volume-indicators {
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
}

.indicator {
  font-size: 0.9rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.indicator:hover {
  opacity: 1;
}

/* Ripple effect on click */
@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.jelly-handle:active .jelly-blob {
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.9);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .volume-slider-container {
    padding: 0.75rem;
  }

  .slider-track {
    height: 20px;
  }

  .jelly-fill {
    top: 2px;
    height: 16px;
    border-radius: 8px;
  }

  .jelly-highlight {
    border-radius: 8px 8px 0 0;
  }

  .jelly-handle {
    width: 28px;
    height: 28px;
  }
}
</style>
