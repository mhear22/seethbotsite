<script setup lang="ts">
/**
 * OfflineIndicator - Global offline status banner (Ticket #31)
 * Shows when the browser is offline and hides when online
 */
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)
const showIndicator = ref(false)
let hideTimeout: ReturnType<typeof setTimeout> | null = null

const updateOnlineStatus = () => {
  const wasOffline = !isOnline.value
  isOnline.value = navigator.onLine

  if (!isOnline.value) {
    // Show indicator when going offline
    showIndicator.value = true
  } else if (wasOffline) {
    // Show "back online" message briefly when reconnecting
    showIndicator.value = true
    if (hideTimeout) clearTimeout(hideTimeout)
    hideTimeout = setTimeout(() => {
      showIndicator.value = false
    }, 3000)
  }
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  // Show if already offline on mount
  if (!navigator.onLine) {
    showIndicator.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  if (hideTimeout) clearTimeout(hideTimeout)
})
</script>

<template>
  <Transition name="slide-down">
    <div v-if="showIndicator" class="offline-indicator" :class="{ 'online': isOnline }">
      <span class="icon">{{ isOnline ? '✅' : '📡' }}</span>
      <span class="message">
        {{ isOnline ? "Back online!" : "You're offline — changes will sync when reconnected" }}
      </span>
    </div>
  </Transition>
</template>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #e53e3e;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.offline-indicator.online {
  background: #48bb78;
}

.icon {
  font-size: 1rem;
}

.message {
  text-align: center;
}

/* Slide down animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
