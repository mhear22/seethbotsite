<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import WorldClock, { type ClockData } from './WorldClock.vue'

interface Props {
  clocks: ClockData[]
  showSeconds?: boolean
}

defineProps<Props>()

const currentTime = ref(new Date())
let updateInterval: number | null = null

onMounted(() => {
  // Update clocks every second
  updateInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<template>
  <div class="world-clock-list">
    <WorldClock
      v-for="clock in clocks"
      :key="clock.timezone"
      :clock="clock"
      :show-seconds="showSeconds"
    />
  </div>
</template>

<style scoped>
.world-clock-list {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

@media (max-width: 768px) {
  .world-clock-list {
    grid-template-columns: 1fr;
  }
}
</style>
