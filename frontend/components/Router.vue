<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAppStore } from '../stores/useAppStore'

interface RouteData {
  title: string
  icon: string
  path: string
}

const routes = ref<RouteData[]>([
  { title: 'Home', icon: '🌸', path: '/' },
  { title: 'Girl Mode', icon: '💕', path: '/girl' },
  { title: 'Gender', icon: '🔮', path: '/gender' },
  { title: 'About', icon: 'ℹ️', path: '/about' },
  { title: 'Rankings', icon: '👻', path: '/rankings' },
  { title: 'Stock Market', icon: '📈', path: '/stocks' },
  { title: 'Cats', icon: '🐱', path: '/cats' },
  { title: 'Movie Night', icon: '🎬', path: '/movies' },
  { title: 'Countdowns', icon: '⏰', path: '/countdowns' }
])

const route = useRoute()
const appStore = useAppStore()
const mobileMenuOpen = ref(false)

const scrollToTop = () => {
  window.scrollTo(0, 0)
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  scrollToTop()
}
</script>

<template>
  <nav class="router-nav">
    <div class="nav-container">
      <div class="nav-brand">
        <span class="brand-icon">🌸</span>
        <span class="brand-text">SeethBot</span>
      </div>

      <div class="nav-controls" style="margin-top: 70px;">
        <button @click="appStore.toggleDarkMode" class="control-btn" :class="{ active: appStore.darkMode }" title="Toggle dark mode">
          {{ appStore.darkMode ? '🌙' : '☀️' }}
        </button>
        <button @click="appStore.toggleMusic" class="control-btn" :class="{ active: appStore.musicPlaying }" title="Toggle music">
          {{ appStore.musicPlaying ? '🔊' : '🔇' }}
        </button>
        <button @click="appStore.togglePanel('rankings')" class="control-btn" :class="{ active: appStore.panels.rankings }" title="Toggle rankings">
          👻
        </button>
        <button @click="appStore.togglePanel('cat')" class="control-btn" :class="{ active: appStore.panels.cat }" title="Toggle cats">
          🐱
        </button>
        <button @click="appStore.togglePanel('feed')" class="control-btn" :class="{ active: appStore.panels.feed }" title="Toggle feed">
          📰
        </button>
        <button @click="appStore.togglePanel('digitalGoose')" class="control-btn" :class="{ active: appStore.panels.digitalGoose }" title="Toggle goose">
          🦆
        </button>
      </div>

      <button class="mobile-menu-toggle" @click="toggleMobileMenu" :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'">
        <span class="hamburger-icon" :class="{ open: mobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <div class="nav-links" :class="{ open: mobileMenuOpen }">
        <RouterLink
          v-for="routeData in routes"
          :key="routeData.path"
          :to="routeData.path"
          class="router-link"
          :class="{ active: route.path === routeData.path }"
          :title="routeData.title"
          @click="closeMobileMenu"
        >
          <span class="link-icon">{{ routeData.icon }}</span>
          <span class="link-text">{{ routeData.title }}</span>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
