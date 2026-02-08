<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MainApp from './components/shared/core/MainApp.vue'
import { useAppStore } from './stores/useAppStore'
import { useAuthStore } from './stores/useAuthStore'
import { useTheme } from './composables/useTheme'

// Stores
const appStore = useAppStore()
const authStore = useAuthStore()

// Router
const route = useRoute()

// Initialize theme
const { applyTheme } = useTheme()

// Sync route path with store currentRoute
watch(() => route.path, (newPath) => {
  const routeName = newPath.replace(/^\//, '') || 'home'
  appStore.currentRoute = routeName
}, { immediate: true })

// Lifecycle
onMounted(() => {
  document.body.classList.toggle('dark', appStore.darkMode)
  const spawnHeart = () => {
    appStore.createHeart()
    setTimeout(spawnHeart, appStore.heartSpawnRate)
  }
  spawnHeart()

  // Initialize mold visual effects (Ticket #32) - only if mold mode is enabled (Ticket #112)
  if (appStore.moldMode) {
    appStore.initMoldCircles()
    appStore.startMoldSpawner()
  }

  // Update mold effects based on current level (Ticket #74)
  appStore.updateMoldEffects()

  // Watch mold level changes and update effects
  watch(() => appStore.tachValue, () => {
    appStore.updateMoldEffects()
  })

  // Load initial rankings from API
  appStore.loadRankings()

  // Preload advice slips for quotes (Ticket #52)
  appStore.preloadAdvice()

  // Riddle answer for Orlando 🍆
  console.log('🩺 Riddle Answer: The surgeon is his mother.')

  // Refresh rankings every 30 seconds
  setInterval(appStore.loadRankings, 30000)

  // Check auth state on mount (Ticket #197)
  // This ensures the auth store is properly initialized
  if (authStore.isInitialized) {
    console.log('[Auth] Already initialized, validating token...')
    authStore.validateToken()
  }
})
</script>

<template>
  <MainApp />
</template>

<style>
/* Heart animation for background */
.heart {
  position: fixed;
  top: -50px;
  animation: fall linear forwards;
  pointer-events: none;
  z-index: 9999;
}

@keyframes fall {
  to {
    transform: translateY(calc(100vh + 100px)) rotate(360deg);
  }
}

/* Mold visual effects (Ticket #32) */
.mold-circle {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  opacity: 0.95;
  filter: blur(2px);
  transition: width 0.1s linear, height 0.1s linear;
}
</style>
