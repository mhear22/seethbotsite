<script setup lang="ts">
import { onMounted, watch, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import MainApp from './components/shared/core/MainApp.vue'
import KeyboardShortcutsHelp from './components/modals/KeyboardShortcutsHelp.vue'
import { useAppStore } from './stores/useAppStore'
import { useAuthStore } from './stores/useAuthStore'
import { useTheme } from './composables/useTheme'
import { useAuth } from './composables/useAuth'
import { useSync } from './composables/useSync'
import { useKeyboardShortcuts, type Shortcut } from './composables/useKeyboardShortcuts'
import { useSwipeGestures } from './composables/useSwipeGestures'
import { useAudio } from './composables/useAudio'
import SwipeIndicator from './components/shared/SwipeIndicator.vue'

// Stores
const appStore = useAppStore()
const authStore = useAuthStore()

// Router
const route = useRoute()

// Keyboard shortcuts
const keyboardShortcuts = useKeyboardShortcuts()
const showKeyboardHelp = ref(false)

// Swipe gestures (Ticket #129)
const swipeGestures = useSwipeGestures()
const swipeDirection = ref<string | null>(null)
const swipeProgress = ref(0)

// Memory leak fix: Store interval/timeout IDs for cleanup
let heartSpawnTimeout: ReturnType<typeof setTimeout> | null = null
let rankingsInterval: ReturnType<typeof setInterval> | null = null

// Initialize theme (applies automatically via useTheme onMounted)
useTheme()

// Initialize audio manager (Ticket #192)
useAudio()

// Sync
const { isAuthenticated } = useAuth()
const { initSync, cleanupSync } = useSync()

// Sync route path with store currentRoute
watch(() => route.path, (newPath) => {
  const routeName = newPath.replace(/^\//, '') || 'home'
  appStore.currentRoute = routeName
}, { immediate: true })

// Lifecycle
onMounted(() => {
  document.body.classList.toggle('dark', appStore.darkMode)

  // Only spawn hearts if not in performance mode (Ticket #perf) - MEMORY LEAK FIX
  const spawnHeart = () => {
    if (!appStore.performanceMode) {
      appStore.createHeart()
    }
    heartSpawnTimeout = setTimeout(spawnHeart, appStore.heartSpawnRate)
  }
  spawnHeart()

  // Initialize mold visual effects (Ticket #32) - only if mold mode is enabled (Ticket #112) and not in performance mode
  if (appStore.moldMode && !appStore.performanceMode) {
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

  // Refresh rankings every 30 seconds - MEMORY LEAK FIX
  rankingsInterval = setInterval(appStore.loadRankings, 30000)

  // Check auth state on mount (Ticket #197)
  // This ensures the auth store is properly initialized
  if (authStore.isInitialized) {
    console.log('[Auth] Already initialized, validating token...')
    authStore.validateToken()
  }

  // Initialize account sync (Ticket #177) - only if authenticated
  if (isAuthenticated.value) {
    initSync()
  }

  // Watch authentication state to initialize/cleanup sync
  watch(isAuthenticated, (newValue) => {
    if (newValue) {
      initSync()
    } else {
      cleanupSync()
    }
  })

  // Initialize keyboard shortcuts (Ticket #128)
  const shortcuts: Shortcut[] = [
    // Search / Command palette
    {
      key: 'k',
      ctrl: true,
      meta: true, // Cmd on Mac
      description: 'Open search / command palette',
      category: 'modals',
      action: () => {
        appStore.toggleSearchModal()
      }
    },
    // Show keyboard shortcuts help
    {
      key: '/',
      ctrl: true,
      meta: true, // Cmd on Mac
      description: 'Show keyboard shortcuts help',
      category: 'modals',
      action: () => {
        showKeyboardHelp.value = true
      }
    },
    // Toggle favorites panel
    {
      key: 'f',
      ctrl: true,
      meta: true, // Cmd on Mac
      description: 'Toggle favorites panel',
      category: 'panels',
      action: () => {
        appStore.togglePanel('favorites')
      }
    },
    // Toggle breadcrumb
    {
      key: 'b',
      ctrl: true,
      meta: true, // Cmd on Mac
      description: 'Toggle breadcrumb',
      category: 'navigation',
      action: () => {
        appStore.toggleBreadcrumb()
      }
    },
    // Toggle rankings panel
    {
      key: 'r',
      ctrl: true,
      meta: true, // Cmd on Mac
      description: 'Toggle rankings panel',
      category: 'panels',
      action: () => {
        appStore.togglePanel('rankings')
      }
    },
    // Escape: Close modals and panels
    {
      key: 'Escape',
      description: 'Close modals / panels',
      category: 'modals',
      action: () => {
        // Close help modal if open
        if (showKeyboardHelp.value) {
          showKeyboardHelp.value = false
          return
        }
        // Close search modal
        if (appStore.searchModalOpen) {
          appStore.toggleSearchModal()
          return
        }
        // Close confirmation modal
        if (appStore.confirmationOpen) {
          appStore.closeConfirmation()
          return
        }
        // Close Mika modal
        if (appStore.mikaModalOpen) {
          appStore.closeMikaModal()
          return
        }
      }
    },
    // Arrow navigation
    {
      key: 'ArrowLeft',
      description: 'Navigate to previous item',
      category: 'navigation',
      action: () => {
        // Emit event for components to handle
        window.dispatchEvent(new CustomEvent('keyboard-navigate', { detail: { direction: 'left' } }))
      }
    },
    {
      key: 'ArrowRight',
      description: 'Navigate to next item',
      category: 'navigation',
      action: () => {
        window.dispatchEvent(new CustomEvent('keyboard-navigate', { detail: { direction: 'right' } }))
      }
    },
    {
      key: 'ArrowUp',
      description: 'Navigate up',
      category: 'navigation',
      action: () => {
        window.dispatchEvent(new CustomEvent('keyboard-navigate', { detail: { direction: 'up' } }))
      }
    },
    {
      key: 'ArrowDown',
      description: 'Navigate down',
      category: 'navigation',
      action: () => {
        window.dispatchEvent(new CustomEvent('keyboard-navigate', { detail: { direction: 'down' } }))
      }
    },
    // Toggle theme
    {
      key: 'd',
      ctrl: true,
      meta: true, // Cmd on Mac
      description: 'Toggle dark/darker mode',
      category: 'actions',
      action: () => {
        appStore.toggleDarkMode()
      }
    },
    // Toggle music
    {
      key: 'm',
      ctrl: true,
      meta: true, // Cmd on Mac
      description: 'Toggle music',
      category: 'actions',
      action: () => {
        appStore.toggleMusic()
      }
    },
    // Next quote
    {
      key: 'n',
      ctrl: true,
      meta: true, // Cmd on Mac
      description: 'Next quote',
      category: 'actions',
      action: () => {
        appStore.nextQuote()
      }
    }
  ]

  // Register all shortcuts
  shortcuts.forEach(shortcut => {
    keyboardShortcuts.registerShortcut(shortcut)
  })

  // Initialize swipe gestures visual feedback (Ticket #129)
  window.addEventListener('swipe-progress', handleSwipeProgress)
  window.addEventListener('swipe-detected', handleSwipeDetected)
  window.addEventListener('swipe-up', handleSwipeUp)
  window.addEventListener('swipe-down', handleSwipeDown)
})

// Handle swipe progress for visual feedback
const handleSwipeProgress = (event: CustomEvent) => {
  const { deltaX, deltaY } = event.detail
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)

  // Determine direction based on which axis has more movement
  if (absX > absY) {
    swipeDirection.value = deltaX > 0 ? 'right' : 'left'
    swipeProgress.value = Math.min(absX / swipeGestures.sensitivity.value, 1)
  } else {
    swipeDirection.value = deltaY > 0 ? 'down' : 'up'
    swipeProgress.value = Math.min(absY / swipeGestures.sensitivity.value, 1)
  }
}

// Handle swipe detected event
const handleSwipeDetected = (event: CustomEvent) => {
  const { direction } = event.detail
  swipeDirection.value = direction
  swipeProgress.value = 1

  // Clear visual feedback after animation
  setTimeout(() => {
    swipeDirection.value = null
    swipeProgress.value = 0
  }, 300)
}

// Handle swipe up event (open panel)
const handleSwipeUp = (event: CustomEvent) => {
  // Logic to open next panel can be handled by appStore
  // This is a placeholder for panel management
  console.log('Swipe up detected - open panel')
}

// Handle swipe down event (close panel)
const handleSwipeDown = (event: CustomEvent) => {
  // Logic to close current panel can be handled by appStore
  // This is a placeholder for panel management
  console.log('Swipe down detected - close panel')
}

// Cleanup sync on unmount
onUnmounted(() => {
  if (isAuthenticated.value) {
    cleanupSync()
  }

  // Cleanup swipe gesture event listeners
  window.removeEventListener('swipe-progress', handleSwipeProgress)
  window.removeEventListener('swipe-detected', handleSwipeDetected)
  window.removeEventListener('swipe-up', handleSwipeUp)
  window.removeEventListener('swipe-down', handleSwipeDown)

  // MEMORY LEAK FIX: Clear intervals and timeouts
  if (heartSpawnTimeout) {
    clearTimeout(heartSpawnTimeout)
    heartSpawnTimeout = null
  }
  if (rankingsInterval) {
    clearInterval(rankingsInterval)
    rankingsInterval = null
  }
})
</script>

<template>
  <MainApp />
  <KeyboardShortcutsHelp :is-open="showKeyboardHelp" @close="showKeyboardHelp = false" />
  <SwipeIndicator v-if="swipeGestures.settings.visualFeedback" :direction="swipeDirection" :progress="swipeProgress" />
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
