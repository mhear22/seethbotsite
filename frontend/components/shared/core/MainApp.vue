<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RankingsPanel from '../../panels/RankingsPanel.vue'
import CatPanel from '../../panels/CatPanel.vue'
import FavoritesPanel from '../../panels/FavoritesPanel.vue'
import FeedContent from '../ui/FeedContent.vue'
import TachometerContent from '../../panels/TachometerContent.vue'
import ModalContainer from '../modals/ModalContainer.vue'
import MikaModal from '../modals/MikaModal.vue'
import DigitalGoose from '../../panels/DigitalGoose.vue'
import MiningPanel from '../../panels/MiningPanel.vue'
import TorchEffect from '../ui/TorchEffect.vue'
import ActiveUsers from '../ui/ActiveUsers.vue'
import Router from './Router.vue'
import SearchModal from '../ui/SearchModal.vue'
import MobileFAB from '../ui/MobileFAB.vue'
import SkipLink from '../ui/SkipLink.vue'
import KeyboardShortcutsHelp from '../ui/KeyboardShortcutsHelp.vue'
import Breadcrumb from '../Breadcrumb.vue'
import { useAppStore } from '../../../stores/useAppStore'
import { useKeyboardShortcuts } from '../../../composables/useKeyboardShortcuts'

export interface RankingItem {
  name: string
  score: number
  avatar: string
  isCurrentUser?: boolean
}

export interface PanelState {
  rankings: boolean
  cat: boolean
  feed: boolean
  digitalGoose: boolean
}

// Modal item interface (local definition)
interface ModalItem {
  id: string
  title: string
  icon: string
  isOpen: boolean
  position?: 'left' | 'right'
}

// Store
const appStore = useAppStore()

// Router
const router = useRouter()
const route = useRoute()

// Keyboard shortcuts
const { shortcuts, isHelpOpen, toggleHelp, registerShortcut } = useKeyboardShortcuts()

// Modal items for left dock (Tachometer)
const leftModals = computed<ModalItem[]>(() => {
  // Hide mold meter in performance mode
  if (appStore.performanceMode) return []

  return [
    {
      id: 'tachometer',
      title: 'Mold Meter',
      icon: '🍄',
      isOpen: appStore.panels.tachometer,
      position: 'left'
    }
  ]
})

// Modal items for right dock (Feed and Active Users)
const rightModals = computed<ModalItem[]>(() => {
  // Hide all right dock panels in performance mode
  if (appStore.performanceMode) return []

  return [
    {
      id: 'feed',
      title: 'Live Feeds',
      icon: '📰',
      isOpen: appStore.panels.feed,
      position: 'right'
    },
    {
      id: 'activeUsers',
      title: 'Active Users',
      icon: '👥',
      isOpen: appStore.panels.activeUsers,
      position: 'right'
    }
  ]
})

// Route sync
const onRouteChange = (routeName: string) => {
  appStore.onRouteChange(routeName)
}

// Check if we're on a full-screen route (like mech battle)
const isFullScreenRoute = computed(() => {
  return route.name === 'mech-builder' || route.name === 'mech-battle'
})

const goToGirlMode = () => {
  console.log('Going to girl mode...')
  appStore.closeConfirmation()
  setTimeout(() => {
    router.push('/girl')
  }, 100)
}

// Keyboard shortcuts
const handleGlobalKeydown = (e: KeyboardEvent) => {
  // Open search with Ctrl/Cmd + K
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    appStore.toggleSearchModal()
  }
}

// Register all keyboard shortcuts
const registerAllShortcuts = () => {
  // Navigation shortcuts
  registerShortcut({
    key: 'h',
    description: 'Go to Home',
    action: () => router.push('/')
  })

  registerShortcut({
    key: 'a',
    description: 'Go to About',
    action: () => router.push('/about')
  })

  registerShortcut({
    key: 's',
    description: 'Go to Settings',
    action: () => router.push('/settings')
  })

  registerShortcut({
    key: 'p',
    description: 'Go to Shop',
    action: () => router.push('/shop')
  })

  // Panel toggles
  registerShortcut({
    key: 'g',
    description: 'Toggle Digital Goose',
    action: () => appStore.togglePanel('digitalGoose')
  })

  registerShortcut({
    key: 'r',
    description: 'Toggle Rankings',
    action: () => {
      // Only allow on home page
      if (route.path === '/') {
        appStore.togglePanel('rankings')
      }
    }
  })

  registerShortcut({
    key: 'c',
    description: 'Toggle Cat Panel',
    action: () => {
      // Only allow on home page
      if (route.path === '/') {
        appStore.togglePanel('cat')
      }
    }
  })

  registerShortcut({
    key: 'f',
    description: 'Toggle Feed',
    action: () => appStore.togglePanel('feed')
  })

  registerShortcut({
    key: 'v',
    description: 'Toggle Favorites',
    action: () => {
      if (appStore.isAuthenticated) {
        appStore.togglePanel('favorites')
      }
    }
  })

  // Actions
  registerShortcut({
    key: '/',
    description: 'Open Search',
    action: () => appStore.toggleSearchModal()
  })

  registerShortcut({
    key: 'n',
    description: 'Create New Ticket',
    action: () => router.push('/tickets')
  })

  // Help
  registerShortcut({
    key: '?',
    description: 'Show Keyboard Shortcuts Help',
    action: () => toggleHelp()
  })

  // Esc - Close modals/panels (handled by browser default, but we can add specific handling if needed)
  registerShortcut({
    key: 'Escape',
    description: 'Close Modals / Panels',
    action: () => {
      if (isHelpOpen.value) {
        toggleHelp()
      } else if (appStore.searchModalOpen) {
        appStore.toggleSearchModal()
      } else if (appStore.mikaModalOpen) {
        appStore.closeMikaModal()
      } else if (appStore.panels.feed) {
        appStore.togglePanel('feed')
      } else if (appStore.panels.activeUsers) {
        appStore.togglePanel('activeUsers')
      } else if (route.path === '/' && appStore.panels.rankings) {
        appStore.togglePanel('rankings')
      } else if (route.path === '/' && appStore.panels.cat) {
        appStore.togglePanel('cat')
      } else if (appStore.panels.digitalGoose) {
        appStore.togglePanel('digitalGoose')
      } else if (appStore.panels.favorites) {
        appStore.togglePanel('favorites')
      }
    }
  })
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
  registerAllShortcuts()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div class="main-app" :class="{ dark: appStore.darkMode, 'centered': appStore.currentRoute === 'home', 'fullscreen': isFullScreenRoute }">
    <!-- Skip link for keyboard accessibility (Ticket #193) -->
    <SkipLink v-if="!isFullScreenRoute" />

    <Router v-if="!isFullScreenRoute" />

    <!-- Breadcrumb Navigation (Ticket #126) -->
    <Breadcrumb v-if="!isFullScreenRoute" />

    <main class="content-wrapper" id="main-content">
      <router-view />
    </main>

    <!-- Digital Goose (Independent - not in modal container per ticket requirements) -->
    <DigitalGoose v-if="appStore.panels.digitalGoose && !isFullScreenRoute" />

    <!-- Favorites Panel (Ticket #127) -->
    <FavoritesPanel
      v-if="appStore.panels.favorites && appStore.isAuthenticated && !isFullScreenRoute"
      :is-open="appStore.panels.favorites"
      @toggle="appStore.togglePanel('favorites')"
      class="floating-panel favorites-panel"
    />

    <!-- Left Dock - Tachometer (Mold Meter with Fart button) -->
    <ModalContainer
      v-if="!isFullScreenRoute"
      :modals="leftModals"
      @toggle="appStore.togglePanel"
    >
      <template #modal-tachometer="{ modal, isOpen }">
        <TachometerContent
          v-if="isOpen"
          :value="appStore.tachValue"
          :clicked="false"
          :exploded="false"
          @fart="appStore.onFart"
        />
      </template>
    </ModalContainer>

    <!-- Right Dock - Feed and Active Users -->
    <ModalContainer
      v-if="!isFullScreenRoute"
      :modals="rightModals"
      @toggle="appStore.togglePanel"
    >
      <template #modal-feed="{ modal, isOpen }">
        <FeedContent
          v-if="isOpen"
          :is-open="isOpen"
          @toggle="appStore.togglePanel('feed')"
        />
      </template>
      <template #modal-activeUsers="{ modal, isOpen }">
        <ActiveUsers
          v-if="isOpen"
          :is-open="isOpen"
          @toggle="appStore.togglePanel('activeUsers')"
        />
      </template>
    </ModalContainer>

    <!-- Floating Panels (Bottom Left - Rankings and Cats) -->
    <RankingsPanel
      v-if="appStore.panels.rankings && appStore.currentRoute === 'home' && !isFullScreenRoute"
      :rankings="appStore.rankings"
      :current-route="appStore.currentRoute"
      :is-open="appStore.panels.rankings"
      @toggle="appStore.togglePanel('rankings')"
      class="floating-panel rankings-panel"
    />
    <CatPanel
      v-if="appStore.panels.cat && appStore.currentRoute === 'home' && !isFullScreenRoute"
      :cat-image="appStore.catImage"
      :loading="appStore.catLoading"
      :is-open="appStore.panels.cat"
      @toggle="appStore.togglePanel('cat')"
      @new-cat="appStore.nextCat"
      class="floating-panel cat-panel"
    />

    <!-- Mining Panel - Shows on stock market route -->
    <MiningPanel
      v-if="appStore.panels.mining && appStore.currentRoute === 'stocks' && !isFullScreenRoute"
      class="floating-panel mining-panel"
    />

    <!-- Modals -->
    <MikaModal
      v-if="appStore.mikaModalOpen && !isFullScreenRoute"
      :is-open="appStore.mikaModalOpen"
      @close="appStore.closeMikaModal"
    />

    <!-- Torch Effect for Darker Mode (Ticket #109) -->
    <TorchEffect v-if="!isFullScreenRoute" />

    <!-- Mobile FAB for mode toggles -->
    <MobileFAB v-if="!isFullScreenRoute" />

    <!-- Search Modal (Ticket #139) -->
    <SearchModal
      v-if="!isFullScreenRoute"
      :is-open="appStore.searchModalOpen"
      @close="appStore.toggleSearchModal"
    />

    <!-- Keyboard Shortcuts Help Modal (Ticket #128) -->
    <KeyboardShortcutsHelp
      v-if="!isFullScreenRoute"
      :shortcuts="shortcuts"
      :is-open="isHelpOpen"
      @close="toggleHelp"
    />
  </div>

  <!-- Audio elements -->
  <audio id="newMusic">
    <source src="/sounds/newMusic.mp3" type="audio/mpeg">
  </audio>
  <audio id="fartSound">
    <source src="/sounds/fart-with-reverb.mp3" type="audio/mpeg">
  </audio>
  <audio id="buttonSound">
    <source src="/sounds/button-sound.mp3" type="audio/mpeg">
  </audio>
  <audio id="gooseHonk">
    <source src="/sounds/goose-honk.mp3" type="audio/mpeg">
  </audio>
</template>

<style scoped>
/* Main App Container */
.main-app {
  min-height: 100vh;
  width: 100%;
  padding-top: 80px;
}

/* Full-screen mode - remove all padding */
.main-app.fullscreen {
  padding-top: 0;
  min-height: 100vh;
}

/* Center content on home page */
.main-app.centered {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* All other pages allow natural scrolling */
.main-app:not(.centered) {
  display: block;
}

/* Content wrapper for pages */
.content-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Full-screen mode - remove content wrapper constraints */
.main-app.fullscreen .content-wrapper {
  max-width: 100%;
  padding: 0;
  margin: 0;
}

/* Don't constrain on home page */
.main-app.centered .content-wrapper {
  max-width: 100%;
  padding: 0;
}

/* Full-screen routes (mech battle, etc.) - remove all constraints */
.main-app:has(.mech-battle-page) {
  padding-top: 0;
}

.main-app:has(.mech-battle-page) .content-wrapper {
  max-width: 100%;
  padding: 0;
  margin: 0;
}

/* Hide navbar on full-screen routes */
.main-app:has(.mech-battle-page) ~ * {
  display: none;
}
</style>
