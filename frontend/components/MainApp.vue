<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RankingsPanel from './RankingsPanel.vue'
import CatPanel from './CatPanel.vue'
import FeedPanel from './FeedPanel.vue'
import MikaModal from './MikaModal.vue'
import DigitalGoose from './DigitalGoose.vue'
import Router from './Router.vue'
import AppFooter from './AppFooter.vue'
import { useAppStore } from '../stores/useAppStore'

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

// Store
const appStore = useAppStore()

// Router
const router = useRouter()
const route = useRoute()

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

    <!-- Digital Goose (Cycle Complete) -->
    <DigitalGoose v-if="appStore.panels.digitalGoose" />

    <!-- Floating Panels -->
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
    <FeedPanel
      v-if="appStore.panels.feed"
      :is-open="appStore.panels.feed"
      class="floating-panel feed-panel"
      @toggle="appStore.togglePanel('feed')"
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
/* Bottom Left Coolness Panel */
.coolness-panel-bottom-left {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(40, 44, 52, 0.95);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-width: 300px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .coolness-panel-bottom-left {
  background: rgba(20, 24, 32, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.coolness-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
  color: #e2e8f0;
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.coolness-panel-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coolness-item {
  display: grid;
  grid-template-columns: 24px 24px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 13px;
  transition: background 0.2s;
}

.coolness-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.coolness-item.is-current-user {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.rank {
  color: #a0aec0;
  font-weight: bold;
}

.avatar {
  font-size: 16px;
}

.name {
  color: #e2e8f0;
  font-weight: 500;
}

.score {
  color: #48bb78;
  font-weight: bold;
  font-size: 12px;
}

.dark .score {
  color: #68d391;
}

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
