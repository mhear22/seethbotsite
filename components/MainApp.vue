<script setup lang="ts">
import QuoteSection from './QuoteSection.vue'
import RankingsPanel from './RankingsPanel.vue'
import CatPanel from './CatPanel.vue'
import Tachometer from './Tachometer.vue'
import GirlModePage from './GirlModePage.vue'
import FeedPanel from './FeedPanel.vue'
import MikaModal from './MikaModal.vue'
import ClickCounter from './ClickCounter.vue'
import GenderPicker from './GenderPicker.vue'
import DigitalGoose from './DigitalGoose.vue'

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
}

defineProps<{
  darkMode?: boolean
  musicPlaying?: boolean
  currentRoute?: string
  currentQuote: string
  currentCatImage: string
  tachValue?: number
  fartClicked?: boolean
  fartExploded?: boolean
  rankings: RankingItem[]
  panels?: PanelState
  mikaModalOpen?: boolean
  confirmationOpen?: boolean
}>()

const emit = defineEmits<{
  'toggle-dark-mode': []
  'toggle-music': []
  'toggle-panel': [panelName: keyof PanelState]
  'route-change': [route: string]
  'mika-close': []
  'close-confirmation': []
  'next-quote': []
  'new-cat': []
  fart: []
  'turn-me': []
}>()

const toggleDarkMode = () => {
  emit('toggle-dark-mode')
}

const toggleMusic = () => {
  emit('toggle-music')
}

const togglePanel = (panelName: keyof PanelState) => {
  emit('toggle-panel', panelName)
}

const onRouteChange = (route: string) => {
  emit('route-change', route)
}

const nextQuote = () => {
  emit('next-quote')
}

const nextCat = () => {
  emit('new-cat')
}

const onFart = () => {
  emit('fart')
}

const onTurnMe = () => {
  emit('turn-me')
}

const closeMikaModal = () => {
  emit('mika-close')
}

const closeConfirmation = () => {
  emit('close-confirmation')
}

const goToGirlMode = () => {
  console.log('Going to girl mode...')
  emit('close-confirmation')
  setTimeout(() => {
    emit('route-change', 'girl')
    console.log('Route change emitted: girl')
  }, 100)
}

const getTrendClass = (index: number) => {
  const trends = ['trend-up', 'trend-down', 'trend-same']
  return trends[index % trends.length]
}
</script>

<template>
  <div class="main-app" :class="{ dark: darkMode }">
    <!-- Header Controls -->
    <div class="header-controls">
      <button @click="toggleDarkMode" class="control-btn" :class="{ active: darkMode }">
        {{ darkMode ? '🌙' : '☀️' }}
      </button>
      <button @click="toggleMusic" class="control-btn" :class="{ active: musicPlaying }">
        {{ musicPlaying ? '🔊' : '🔇' }}
      </button>
      <button @click="togglePanel('rankings')" class="control-btn" :class="{ active: panels?.rankings }">
        👻
      </button>
      <button @click="togglePanel('cat')" class="control-btn" :class="{ active: panels?.cat }">
        🐱
      </button>
      <button @click="togglePanel('feed')" class="control-btn" :class="{ active: panels?.feed }">
        📰
      </button>
    </div>

    <!-- Route-specific content -->
    <div class="content-area">
      <!-- Home Page -->
      <div v-if="currentRoute === 'home'" class="page home-page">
        <QuoteSection :current-quote="currentQuote" @next-quote="nextQuote" />
        <Tachometer :value="tachValue" @fart="onFart" />
        <ClickCounter />
      </div>

      <!-- Girl Mode Page -->
      <GirlModePage v-else-if="currentRoute === 'girl'" @back="onRouteChange('home')" />

      <!-- Gender Page -->
      <div v-else-if="currentRoute === 'gender'" class="page gender-page">
        <GenderPicker @back="onRouteChange('home')" />
      </div>

      <!-- About Page -->
      <div v-else-if="currentRoute === 'about'" class="page about-page">
        <h1>About</h1>
        <p>This is Mika's cool website! ✨</p>
      </div>

      <!-- Rankings Page -->
      <div v-else-if="currentRoute === 'rankings'" class="page rankings-page">
        <RankingsPanel :rankings="rankings" />
      </div>

      <!-- Cats Page -->
      <div v-else-if="currentRoute === 'cats'" class="page cats-page">
        <CatPanel :cat-image="currentCatImage" :loading="false" @new-cat="nextCat" />
      </div>
    </div>

    <!-- Digital Goose (Cycle Complete) -->
    <DigitalGoose v-if="panels?.digitalGoose ?? true" />

    <!-- Floating Panels -->
    <RankingsPanel
      v-if="panels?.rankings && currentRoute === 'home'"
      :rankings="rankings"
      :is-open="panels.rankings"
      @toggle="togglePanel('rankings')"
      class="floating-panel rankings-panel"
    />
    <CatPanel
      v-if="panels?.cat && currentRoute === 'home'"
      :cat-image="currentCatImage"
      :loading="false"
      :is-open="panels.cat"
      @toggle="togglePanel('cat')"
      @new-cat="nextCat"
      class="floating-panel cat-panel"
    />
    <FeedPanel
      v-if="panels?.feed"
      :is-open="panels.feed"
      class="floating-panel feed-panel"
      @toggle="togglePanel('feed')"
    />

    <!-- Modals -->
    <MikaModal
      v-if="mikaModalOpen"
      :is-open="mikaModalOpen"
      @close="closeMikaModal"
    />
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
</style>
