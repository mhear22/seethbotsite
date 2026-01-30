<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface ClickData {
  count: number
  timestamp: string
}

const props = withDefaults(defineProps<{
  apiUrl?: string
}>(), {
  apiUrl: '/api/clicks'
})

const count = ref(0)
const loading = ref(false)
const isClicking = ref(false)
const lastUpdate = ref<Date | null>(null)

const fetchCount = async () => {
  try {
    const response = await fetch(props.apiUrl)
    const data = await response.json() as ClickData
    count.value = data.count
    lastUpdate.value = new Date(data.timestamp)
  } catch (error) {
    console.error('Error fetching click count:', error)
  }
}

const incrementClick = async () => {
  if (loading.value) return

  loading.value = true
  isClicking.value = true

  try {
    const response = await fetch(`${props.apiUrl}/increment`, {
      method: 'POST'
    })
    const data = await response.json() as ClickData
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
  fetchCount()
  const interval = setInterval(() => fetchCount(), 5000)
  onBeforeUnmount(() => clearInterval(interval))
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
