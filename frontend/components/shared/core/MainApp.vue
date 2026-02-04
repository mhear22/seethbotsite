<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RankingsPanel from '../../panels/RankingsPanel.vue'
import CatPanel from '../../panels/CatPanel.vue'
import FeedContent from '../ui/FeedContent.vue'
import TachometerContent from '../../panels/TachometerContent.vue'
import ModalContainer from '../modals/ModalContainer.vue'
import MikaModal from '../modals/MikaModal.vue'
import DigitalGoose from '../../panels/DigitalGoose.vue'
import Router from './Router.vue'
import AppFooter from './AppFooter.vue'
import { useAppStore } from '../../../stores/useAppStore'

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

// Modal items for left dock (Tachometer)
const leftModals = computed<ModalItem[]>(() => [
  {
    id: 'tachometer',
    title: 'Mold Meter',
    icon: '🍄',
    isOpen: appStore.panels.tachometer,
    position: 'left'
  }
])

// Modal items for right dock (Feed)
const rightModals = computed<ModalItem[]>(() => [
  {
    id: 'feed',
    title: 'Live Feeds',
    icon: '📰',
    isOpen: appStore.panels.feed,
    position: 'right'
  }
])

// Route sync
const onRouteChange = (routeName: string) => {
  appStore.onRouteChange(routeName)
}

const goToGirlMode = () => {
  console.log('Going to girl mode...')
  appStore.closeConfirmation()
  setTimeout(() => {
    router.push('/girl')
  }, 100)
}
</script>

<template>
  <div class="main-app" :class="{ dark: appStore.darkMode, 'centered': appStore.currentRoute === 'home' }">
    <Router />
    <router-view />

    <!-- Digital Goose (Independent - not in modal container per ticket requirements) -->
    <DigitalGoose v-if="appStore.panels.digitalGoose" />

    <!-- Left Dock - Tachometer (Mold Meter with Fart button) -->
    <ModalContainer
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

    <!-- Right Dock - Feed -->
    <ModalContainer
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
    </ModalContainer>

    <!-- Floating Panels (Bottom Left - Rankings and Cats) -->
    <RankingsPanel
      v-if="appStore.panels.rankings && appStore.currentRoute === 'home'"
      :rankings="appStore.rankings"
      :current-route="appStore.currentRoute"
      :is-open="appStore.panels.rankings"
      @toggle="appStore.togglePanel('rankings')"
      class="floating-panel rankings-panel"
    />
    <CatPanel
      v-if="appStore.panels.cat && appStore.currentRoute === 'home'"
      :cat-image="appStore.catImage"
      :loading="appStore.catLoading"
      :is-open="appStore.panels.cat"
      @toggle="appStore.togglePanel('cat')"
      @new-cat="appStore.nextCat"
      class="floating-panel cat-panel"
    />

    <!-- Modals -->
    <MikaModal
      v-if="appStore.mikaModalOpen"
      :is-open="appStore.mikaModalOpen"
      @close="appStore.closeMikaModal"
    />

    <!-- Footer -->
    <AppFooter />
  </div>

  <!-- Audio elements -->
  <audio id="newMusic" loop>
    <source src="/newMusic.mp3" type="audio/mpeg">
  </audio>
  <audio id="fartSound">
    <source src="/fart-with-reverb.mp3" type="audio/mpeg">
  </audio>
</template>

<style scoped>
/* Main App Container */
.main-app {
  min-height: 100vh;
  width: 100%;
  padding-top: 80px;
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
</style>
