<script setup lang="ts">
import { computed, watch, ref } from 'vue'

const props = withDefaults(defineProps<{
  value?: number
  clicked?: boolean
  exploded?: boolean
}>(), {
  value: 50,
  clicked: false,
  exploded: false
})

const emit = defineEmits<{
  fart: []
}>()

// Fart click counter (persisted to localStorage)
const FART_COUNT_KEY = 'fart-click-count'
const fartCount = ref<number>(parseInt(localStorage.getItem(FART_COUNT_KEY) || '0'))

// Update fart count in localStorage and global click count (ticket #53)
const updateFartCount = async () => {
  fartCount.value++
  localStorage.setItem(FART_COUNT_KEY, fartCount.value.toString())

  // Increment global click count on backend
  try {
    await fetch('/api/clicks/increment', {
      method: 'POST'
    })
  } catch (error) {
    console.error('Failed to increment global click count:', error)
    // Don't show error to user, just log it
  }
}

// Call this when fart is clicked
const onFart = () => {
  updateFartCount()
  emit('fart')
}

// Calculate needle angle based on percentage (0-100%)
// Formula: (percentage x 270) - 45
const needleAngle = computed(() => {
  const clampedValue = Math.max(0, Math.min(100, props.value))
  // Formula: (percentage/100 * 270) - 45
  return (clampedValue / 100 * 270) - 45
})

const needleStyle = computed(() => ({
  transform: `rotate(${needleAngle.value}deg)`
}))

// Debug logging for angle verification
watch(() => props.value, (newValue) => {
  const clampedValue = Math.max(0, Math.min(100, newValue))
  const angle = needleAngle.value
  const normalizedAngle = angle >= 360 ? angle - 360 : angle

  console.log(`🍄 Mold Meter Debug:`)
  console.log(`  Value: ${clampedValue}%`)
  console.log(`  Angle: ${angle}° (normalized: ${normalizedAngle}°)`)

  // Log every 10% increment
  if (clampedValue % 10 === 0) {
    console.log(`  ✅ ${clampedValue}% = ${angle}°`)
  }
})
</script>

<template>
  <div class="tachometer-content" role="region" aria-label="Mold meter panel">
    <div class="tachometer-dial" role="img" aria-label="Gauge showing mold level: {{ Math.round(value) }} percent">
      <!-- Ticks around the dial -->
      <div class="tachometer-ticks" aria-hidden="true">
        <div v-for="i in 9" :key="i" class="tick" :class="{ major: i % 3 === 1 }" :style="{ transform: `rotate(${(i - 1) * 45}deg) translate(0, -45px)` }"></div>
      </div>

      <!-- Value labels -->
      <div class="tachometer-labels" aria-hidden="true">
        <span class="label label-0">0%</span>
        <span class="label label-50">50%</span>
        <span class="label label-100">100%</span>
      </div>

      <!-- Needle -->
      <div class="tachometer-needle" :style="needleStyle" aria-hidden="true">
        <div class="needle-body"></div>
        <div class="needle-tip"></div>
      </div>

      <!-- Center cap -->
      <div class="tachometer-cap" aria-hidden="true"></div>

      <!-- Digital readout -->
      <div class="tachometer-value" aria-live="polite" aria-atomic="true">{{ Math.round(value) }}%</div>
    </div>

    <div class="tachometer-title">🍄 MOLD METER</div>

    <div class="fart-count" aria-live="polite">💨 Farts: {{ fartCount }}</div>

    <button class="fart-btn" @click="onFart" :class="{ exploded: exploded }" :disabled="clicked" aria-label="Increment fart count">💨 Fart!</button>
  </div>
</template>

<style scoped>
.tachometer-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0 0 12px 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: -2px;
  overflow: hidden;
}

.dark .tachometer-content {
  background: rgba(40, 44, 52, 0.95);
}

.tachometer-dial {
  position: relative;
  width: 120px;
  height: 120px;
  background: #2d3436;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid #636e72;
}

.tachometer-ticks {
  position: absolute;
  width: 100%;
  height: 100%;
}

.tick {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 10px;
  background: rgba(255, 255, 255, 0.5);
  transform-origin: center;
}

.tick.major {
  width: 3px;
  height: 14px;
  background: #fff;
}

.tachometer-labels {
  position: absolute;
  width: 100%;
  height: 100%;
}

.label {
  position: absolute;
  font-size: 10px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.label-0 {
  bottom: 12px;
  left: 18px;
}

.label-50 {
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.label-100 {
  bottom: 12px;
  right: 18px;
}

.tachometer-needle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  transform-origin: center;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.needle-body {
  position: absolute;
  top: -2px;
  left: -42px;
  width: 42px;
  height: 5px;
  background: linear-gradient(90deg, #ff6b6b, #ee5a5a);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.needle-tip {
  position: absolute;
  top: -3px;
  left: -44px;
  width: 6px;
  height: 6px;
  background: #ff6b6b;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.tachometer-cap {
  position: absolute;
  width: 14px;
  height: 14px;
  background: linear-gradient(145deg, #636e72, #4a5559);
  border-radius: 50%;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  z-index: 2;
}

.tachometer-value {
  position: absolute;
  bottom: 28px;
  font-size: 16px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  color: #00cec9;
  z-index: 5;
}

.tachometer-title {
  font-size: 11px;
  font-weight: bold;
  color: #2d3436;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.dark .tachometer-title {
  color: #e2e8f0;
}

.fart-count {
  font-size: 14px;
  font-weight: 600;
  color: #00b894;
  text-align: center;
  margin-bottom: 4px;
}

.dark .fart-count {
  color: #00cec9;
}

.fart-btn {
  background: linear-gradient(145deg, #00b894, #00a383);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 3px 10px rgba(0, 184, 148, 0.4);
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fart-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 14px rgba(0, 184, 148, 0.5);
}

.fart-btn:active:not(:disabled) {
  transform: translateY(0);
}

.fart-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fart-btn.exploded {
  background: linear-gradient(145deg, #fdcb6e, #f3b739);
  box-shadow: 0 3px 10px rgba(253, 203, 110, 0.6);
}
</style>
