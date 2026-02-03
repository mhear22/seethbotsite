<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { clicksRepository } from '../repositories/clicks.repository'
import { usePolling } from '../composables/usePolling'

interface ClickData {
  count: number
  timestamp: string
}

const props = withDefaults(defineProps<{
  initialInterval?: number
  maxInterval?: number
  backoffMultiplier?: number
}>(), {
  initialInterval: 1000,
  maxInterval: 30000,
  backoffMultiplier: 2
})

const count = ref(0)
const loading = ref(false)
const isClicking = ref(false)
const lastUpdate = ref<Date | null>(null)

// Use adaptive polling
const { data: clickData, currentInterval } = usePolling(
  () => clicksRepository.getCount(),
  {
    mode: 'adaptive',
    initialInterval: props.initialInterval,
    maxInterval: props.maxInterval,
    backoffMultiplier: props.backoffMultiplier,
    isUnchanged: (prev, next) => prev?.count === next?.count
  }
)

// Update local state when polling data changes
watch(clickData, (newData) => {
  if (newData) {
    count.value = newData.count
    lastUpdate.value = new Date(newData.timestamp)
  }
})

const incrementClick = async () => {
  if (loading.value) return

  loading.value = true
  isClicking.value = true

  try {
    const data = await clicksRepository.increment()
    count.value = data.count
    lastUpdate.value = new Date(data.timestamp)

    setTimeout(() => {
      isClicking.value = false
    }, 100)
  } catch (error) {
    console.error('Error incrementing click:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 1000) return 'just now'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return date.toLocaleTimeString()
}

onMounted(() => {
  // Initial load happens automatically via usePolling
})
</script>

<template>
  <div class="click-counter">
    <div class="counter-header">
      <h3>🖱️ Click Counter</h3>
    </div>
    <div class="counter-content">
      <div class="click-count">{{ count }}</div>
      <button
        class="click-btn"
        @click="incrementClick"
        :disabled="loading"
        :class="{ clicking: isClicking }"
      >
        {{ loading ? '...' : 'CLICK ME!' }}
      </button>
      <div class="click-info">
        <span v-if="lastUpdate">Last click: {{ formatTime(lastUpdate) }}</span>
      </div>
    </div>
  </div>
</template>
