<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value?: number
  clicked?: boolean
  exploded?: boolean
}>(), {
  value: 77,
  clicked: false,
  exploded: false
})

const emit = defineEmits<{
  fart: []
}>()

const needleAngle = computed(() => {
  const clampedValue = Math.max(0, Math.min(100, props.value))
  return 225 + (clampedValue * 0.9)
})

const needleStyle = computed(() => {
  return {
    transform: `rotate(${needleAngle.value}deg)`
  }
})

const onFart = () => {
  emit('fart')
}
</script>

<template>
  <div class="tachometer">
    <div class="tachometer-dial">
      <div class="tachometer-ticks">
        <div class="tick"></div>
        <div class="tick major"></div>
        <div class="tick"></div>
        <div class="tick major"></div>
        <div class="tick"></div>
      </div>
      <div class="tachometer-needle" :style="needleStyle"></div>
      <div class="tachometer-label">🍄 MOLD METER</div>
      <div class="tachometer-value">{{ value }}%</div>
    </div>
    <button class="fart-btn" @click="onFart" :class="{ exploded: exploded }" :disabled="clicked">💨 Fart!</button>
  </div>
</template>
