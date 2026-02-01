<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MainApp from './components/MainApp.vue'
import { useAppStore } from './stores/useAppStore'

// Store
const appStore = useAppStore()

// Router
const route = useRoute()

// Sync route path with store currentRoute
watch(() => route.path, (newPath) => {
  const routeName = newPath.replace(/^\//, '') || 'home'
  appStore.currentRoute = routeName
}, { immediate: true })

// Lifecycle
onMounted(() => {
  document.body.classList.toggle('dark', appStore.darkMode)
  setInterval(appStore.createHeart, 500)

  // Load initial rankings from API
  appStore.loadRankings()

  // Riddle answer for Orlando 🍆
  console.log('🩺 Riddle Answer: The surgeon is his mother.')

  // Refresh rankings every 30 seconds
  setInterval(appStore.loadRankings, 30000)
})
</script>

<template>
  <MainApp />
</template>

<style>
/* Heart animation for background */
.heart {
  position: fixed;
  top: -10vh;
  animation: fall linear forwards;
  pointer-events: none;
  z-index: 9999;
  font-size: 20px;
}

@keyframes fall {
  to {
    transform: translateY(110vh) rotate(360deg);
  }
}
</style>
