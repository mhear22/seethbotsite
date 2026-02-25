<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../../../stores/useAppStore'
import { useKeyboardShortcuts } from '../../../composables/useKeyboardShortcuts'
import { mechNavRoutes } from '../../../features/mech/navigation'
import { dataCenterNavRoutes } from '../../../features/datacenter/navigation'
import KeyboardShortcutsHelp from '../../shared/ui/KeyboardShortcutsHelp.vue'
import PageTicker from '../../shared/ui/PageTicker.vue'

interface RouteData { title: string; icon: string; path: string }
interface DropdownData { title: string; icon: string; routes: RouteData[] }

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()
const { shortcuts, registerShortcut, isHelpOpen, toggleHelp } = useKeyboardShortcuts()

// Simple scroll to top function
const scrollToTop = () => {
  window.scrollTo(0, 0)
}

const brandRotation = ref(0)
const brandClicking = ref(false)

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  brandRotation.value = (scrollTop / maxScroll) * 360
}

const mainRoutes = ref<RouteData[]>([{ title: 'Home', icon: '🌸', path: '/' }])
const quickNavItems = ref<RouteData[]>([
  { title: 'Home', icon: '🌸', path: '/' },
  { title: 'Movies', icon: '🎬', path: '/movies' },
  { title: 'Rankings', icon: '👻', path: '/rankings' },
  { title: 'Messages', icon: '💬', path: '/messages' },
  { title: 'Tickets', icon: '🎫', path: '/tickets' },
  { title: 'Stocks', icon: '📈', path: '/stocks' }
])

const dropdowns = ref<DropdownData[]>([
  {
    title: 'Fun & Games',
    icon: '🎮',
    routes: [
      { title: 'Idle Clicker', icon: '🖱️', path: '/clicker' },
      { title: 'Fishing', icon: '🎣', path: '/fishing' },
      { title: 'Stats', icon: '📊', path: '/stats' },
      { title: 'Character Tinder', icon: '🎭', path: '/character-tinder' },
      { title: 'Girl Mode', icon: '💕', path: '/girl' },
      { title: 'Phrenology', icon: '🧠', path: '/gender' },
      { title: 'Cats', icon: '🐱', path: '/cats' },
      { title: 'Keanu', icon: '🥋', path: '/keanu' },
      { title: 'Orbital Mechanics', icon: '🌌', path: '/orbital' },
      ...mechNavRoutes,
      ...dataCenterNavRoutes,
      { title: 'Stock Market', icon: '📈', path: '/stocks' },
      { title: 'Shop', icon: '🛍️', path: '/shop' },
      { title: 'Music', icon: '🎵', path: '/music' }
    ]
  },
  {
    title: 'Community',
    icon: '👥',
    routes: [
      { title: 'Messages', icon: '💬', path: '/messages' },
      { title: 'Mold', icon: '🍄', path: '/mold' },
      { title: 'Rankings', icon: '👻', path: '/rankings' },
      { title: 'Movie Night', icon: '🎬', path: '/movies' },
      { title: 'Tickets', icon: '🎫', path: '/tickets' },
      { title: 'Moldbot Opinions', icon: '🤖', path: '/opinion' },
      { title: 'Analytics', icon: '📊', path: '/analytics' }
    ]
  },
  {
    title: 'Tools',
    icon: '🛠️',
    routes: [
      { title: 'Search', icon: '🔍', path: '/search' },
      { title: 'Clocks', icon: '🌍', path: '/clocks' },
      { title: 'Countdowns', icon: '⏰', path: '/countdowns' },
      { title: 'Favorites', icon: '⭐', path: '/favorites' },
      { title: 'Patch Notes', icon: '📝', path: '/patch-notes' },
      { title: 'About', icon: 'ℹ️', path: '/about' },
      { title: 'Settings', icon: '⚙️', path: '/settings' },
      { title: 'API Docs', icon: '📚', path: '/api-docs' },
      { title: 'Account', icon: '🔐', path: '/auth' },
      { title: 'Solar Calculator', icon: '☀️', path: '/solar' },
      { title: 'Home Loan Calculator', icon: '🏠', path: '/home-loan' }
    ]
  }
])

const mobileMenuOpen = ref(false)
const openDropdown = ref<string | null>(null)
const showKeyboardHelp = ref(isHelpOpen.value)
const buildInfo = ref<{ buildCount: number; buildTime: string } | null>(null)
const timeAgo = ref('')

const updateTimeAgo = () => {
  if (!buildInfo.value) return
  const now = Date.now()
  const buildDate = new Date(buildInfo.value.buildTime).getTime()
  const diffMins = Math.floor((now - buildDate) / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  timeAgo.value = diffMins < 1 ? 'just now' : diffMins < 60 ? `${diffMins}m ago` : diffHours < 24 ? `${diffHours}h ago` : `${diffDays}d ago`
}

const loadBuildInfo = async () => {
  try {
    const response = await fetch('/api/version')
    const data = await response.json()
    buildInfo.value = { buildCount: data.buildCount || 1, buildTime: data.buildTime }
    updateTimeAgo()
    setInterval(updateTimeAgo, 60000)
  } catch (error) { console.warn('Could not load build info:', error) }
}

loadBuildInfo()

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()

  // Keyboard shortcuts configuration
  const shortcutsConfig = [
    { key: '?', description: 'Show keyboard shortcuts help', action: () => { toggleHelp(); showKeyboardHelp.value = isHelpOpen.value } },
    { key: 'k', ctrl: true, description: 'Open search', action: () => appStore.toggleSearchModal() },
    { key: 'h', description: 'Go to Home', action: () => navigate('/') },
    { key: 't', description: 'Go to Tickets', action: () => navigate('/tickets') },
    { key: 'm', description: 'Go to Movies', action: () => navigate('/movies') },
    { key: 'r', description: 'Go to Rankings', action: () => navigate('/rankings') },
    { key: 's', description: 'Go to Stocks', action: () => navigate('/stocks') },
    { key: 'k', description: 'Go to Clicker', action: () => navigate('/clicker') },
    { key: 'f', description: 'Go to Fishing', action: () => navigate('/fishing') },
    { key: 'y', description: 'Go to Data Center', action: () => navigate('/datacenter') },
    { key: 'g', description: 'Go to Stats', action: () => navigate('/stats') },
    { key: 'o', description: 'Go to Shop', action: () => navigate('/shop') },
    { key: ',', description: 'Go to Settings', action: () => navigate('/settings') },
    { key: 'd', description: 'Toggle dark mode', action: () => appStore.toggleDarkMode() },
    { key: 'u', description: 'Toggle music', action: () => appStore.toggleMusic() },
    { key: 'z', description: 'Toggle chaos mode', action: () => appStore.toggleChaosMode() },
    { key: 'q', description: 'Toggle mold mode', action: () => appStore.toggleMoldMode() },
    { key: '1', description: 'Toggle mold meter', action: () => appStore.togglePanel('tachometer') },
    { key: '2', description: 'Toggle rankings panel', action: () => appStore.togglePanel('rankings') },
    { key: '3', description: 'Toggle cat panel', action: () => appStore.togglePanel('cat') },
    { key: '4', description: 'Toggle feed panel', action: () => appStore.togglePanel('feed') },
    { key: '5', description: 'Toggle goose', action: () => appStore.togglePanel('digitalGoose') },
    { key: '6', description: 'Toggle GPU mining', action: () => appStore.togglePanel('mining') },
    { key: '7', description: 'Toggle coolness panel', action: () => appStore.togglePanel('coolnessPanel') },
    { key: 'c', description: 'Toggle cat panel', action: () => appStore.togglePanel('cat') },
    { key: 'p', description: 'Toggle GPU mining', action: () => appStore.togglePanel('mining') },
    { key: 'g', shift: true, description: 'Toggle goose', action: () => appStore.togglePanel('digitalGoose') },
    { key: 'Escape', description: 'Close modal/menu', action: () => { if (showKeyboardHelp.value) { toggleHelp(); showKeyboardHelp.value = false } if (mobileMenuOpen.value) closeMobileMenu() } }
  ]

  shortcutsConfig.forEach(config => registerShortcut(config))
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Helper function for navigation shortcuts
const navigate = (path: string) => {
  router.push(path)
}

// Brand icon click handler
const handleBrandIconClick = () => {
  brandClicking.value = true
  setTimeout(() => { brandClicking.value = false }, 400)
  scrollToTop()
}

// Mobile menu handlers
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  scrollToTop()
}

// Dropdown handlers
const toggleDropdown = (dropdownTitle: string) => {
  openDropdown.value = openDropdown.value === dropdownTitle ? null : dropdownTitle
}

const isDropdownOpen = (dropdownTitle: string) => {
  return openDropdown.value === dropdownTitle
}

const closeDropdowns = () => {
  openDropdown.value = null
}

// Keyboard navigation for dropdowns
const handleDropdownKeydown = (e: KeyboardEvent, dropdownTitle: string) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggleDropdown(dropdownTitle)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    closeDropdowns()
  }
}

// Handle clicking outside to close mobile menu
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const navLinks = document.querySelector('.nav-links')
  const menuToggle = document.querySelector('.mobile-menu-toggle')

  if (mobileMenuOpen.value && navLinks && menuToggle && !navLinks.contains(target) && !menuToggle.contains(target)) {
    closeMobileMenu()
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<template>
  <nav class="router-nav" @mouseleave="closeDropdowns">
    <!-- Mobile menu backdrop -->
    <div v-if="mobileMenuOpen" class="mobile-menu-backdrop" @click="closeMobileMenu"></div>

    <div class="nav-container">
      <div class="nav-brand">
        <span
          class="brand-icon"
          :class="{ clicking: brandClicking }"
          :style="{ transform: `rotate(${brandRotation}deg)` }"
          @click="handleBrandIconClick"
          title="Click to scroll to top"
        >🌸</span>
        <span class="brand-text">Mold</span>
        <font-awesome-icon :icon="['fas', 'child']" size="lg" class="fa-child-icon" title="Font Awesome - Child Icon" />
        <span class="build-indicator" v-if="buildInfo" :title="`Build #${buildInfo.buildCount} deployed ${timeAgo}`">
          #{{ buildInfo.buildCount }} ({{ timeAgo }})
        </span>
      </div>

      <div class="nav-controls-wrapper">
        <div class="nav-controls-chevron">
          <span class="chevron-icon">▲</span>
        </div>
        <div class="nav-controls">
          <button
            @click="appStore.toggleSearchModal"
            class="control-btn search-btn"
            :class="{ active: appStore.searchModalOpen }"
            :aria-label="appStore.searchModalOpen ? 'Close search' : 'Open search (Ctrl+K)'"
            :aria-pressed="appStore.searchModalOpen"
            title="Search (Ctrl+K)"
          >
            🔍
          </button>
          <button
            @click="appStore.toggleDarkMode"
            class="control-btn"
            :class="{ active: appStore.darkMode }"
            :aria-label="appStore.darkerMode ? 'Switch to light mode' : (appStore.darkMode ? 'Switch to midnight mode' : 'Switch to dark mode')"
            title="Toggle theme (Ctrl+D)"
          >
            {{ appStore.darkerMode ? '🌑' : (appStore.darkMode ? '🌙' : '☀️') }}
          </button>
          <button
            @click="appStore.toggleLanguage"
            class="control-btn"
            :class="{ active: appStore.isAustralian }"
            :aria-label="appStore.isAustralian ? 'Switch to US English' : 'Switch to Australian English'"
          >
            {{ appStore.isAustralian ? '🇦🇺' : '🇺🇸' }}
          </button>
          <button
            @click="appStore.toggleMute"
            class="control-btn"
            :class="{ active: !appStore.isMuted }"
            :aria-label="appStore.isMuted ? 'Unmute sound' : 'Mute sound'"
          >
            {{ appStore.isMuted ? '🔇' : '🔊' }}
          </button>
          <button @click="appStore.togglePanel('tachometer')" class="control-btn" :class="{ active: appStore.panels.tachometer }" :aria-label="appStore.panels.tachometer ? 'Hide mold meter' : 'Show mold meter'" :aria-pressed="appStore.panels.tachometer" title="Toggle mold meter">🍄</button>
          <button @click="appStore.togglePanel('rankings')" class="control-btn" :class="{ active: appStore.panels.rankings }" :aria-label="appStore.panels.rankings ? 'Hide rankings' : 'Show rankings'" :aria-pressed="appStore.panels.rankings" title="Toggle rankings (Ctrl+R)">👻</button>
          <button @click="appStore.togglePanel('cat')" class="control-btn" :class="{ active: appStore.panels.cat }" :aria-label="appStore.panels.cat ? 'Hide cat panel' : 'Show cat panel'" :aria-pressed="appStore.panels.cat" title="Toggle cats (Ctrl+C)">🐱</button>
          <button @click="appStore.togglePanel('feed')" class="control-btn" :class="{ active: appStore.panels.feed }" :aria-label="appStore.panels.feed ? 'Hide feed' : 'Show feed'" :aria-pressed="appStore.panels.feed" title="Toggle feed">📰</button>
          <button @click="appStore.toggleMoldMode" class="control-btn" :class="{ active: appStore.moldMode }" :aria-label="appStore.moldMode ? 'Disable mold mode' : 'Enable mold mode'" :aria-pressed="appStore.moldMode" title="Toggle mold mode (Ctrl+Q)">🦠</button>
          <button @click="appStore.togglePanel('digitalGoose')" class="control-btn" :class="{ active: appStore.panels.digitalGoose }" :aria-label="appStore.panels.digitalGoose ? 'Hide goose' : 'Show goose'" :aria-pressed="appStore.panels.digitalGoose" title="Toggle goose (Ctrl+G)">🦆</button>
          <button @click="appStore.togglePanel('mining')" class="control-btn" :class="{ active: appStore.panels.mining }" :aria-label="appStore.panels.mining ? 'Hide GPU mining' : 'Show GPU mining'" :aria-pressed="appStore.panels.mining" title="Toggle GPU mining (Ctrl+P)">⛏️</button>
          <button @click="appStore.togglePerformanceMode" class="control-btn perf-btn" :class="{ active: appStore.performanceMode }" :aria-label="appStore.performanceMode ? 'Disable performance mode' : 'Enable performance mode'" :aria-pressed="appStore.performanceMode" title="Toggle performance mode (disables animations)">🚀</button>
          <button @click="appStore.toggleChaosMode" class="control-btn chaos-btn" :class="{ active: appStore.chaosMode }" :aria-label="appStore.chaosMode ? 'Disable chaos mode' : 'Enable chaos mode'" :aria-pressed="appStore.chaosMode" title="Toggle chaos mode (Ctrl+Z)">🌀</button>
        </div>
      </div>

      <button class="mobile-menu-toggle" @click="toggleMobileMenu" :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'">
        <span class="hamburger-icon" :class="{ open: mobileMenuOpen }">
          <span></span><span></span><span></span>
        </span>
      </button>

      <div class="nav-links" :class="{ open: mobileMenuOpen }">
        <!-- Main Routes -->
        <RouterLink
          v-for="routeData in mainRoutes"
          :key="routeData.path"
          :to="routeData.path"
          class="router-link"
          :class="{ active: route.path === routeData.path }"
          :aria-current="route.path === routeData.path ? 'page' : undefined"
          :title="routeData.title"
          @click="closeMobileMenu"
        >
          <span class="link-icon" aria-hidden="true">{{ routeData.icon }}</span>
          <span class="link-text">{{ routeData.title }}</span>
        </RouterLink>

        <!-- Dropdown Menus -->
        <div
          v-for="dropdown in dropdowns"
          :key="dropdown.title"
          class="dropdown"
          :class="{ open: isDropdownOpen(dropdown.title) }"
          @mouseenter="toggleDropdown(dropdown.title)"
        >
          <button
            class="dropdown-btn"
            :class="{ active: dropdown.routes.some(r => route.path === r.path) }"
            :aria-expanded="isDropdownOpen(dropdown.title)"
            :aria-haspopup="true"
            @click="toggleDropdown(dropdown.title)"
            @keydown="handleDropdownKeydown($event, dropdown.title)"
          >
            <span class="link-icon" aria-hidden="true">{{ dropdown.icon }}</span>
            <span class="link-text">{{ dropdown.title }}</span>
            <span class="dropdown-arrow" aria-hidden="true">▼</span>
          </button>

          <div class="dropdown-menu" role="menu">
            <RouterLink
              v-for="routeData in dropdown.routes"
              :key="routeData.path"
              :to="routeData.path"
              class="dropdown-item"
              :class="{ active: route.path === routeData.path }"
              :aria-current="route.path === routeData.path ? 'page' : undefined"
              role="menuitem"
              :title="routeData.title"
              @click="closeMobileMenu"
            >
              <span class="link-icon" aria-hidden="true">{{ routeData.icon }}</span>
              <span class="link-text">{{ routeData.title }}</span>
            </RouterLink>
          </div>
        </div>
      </div>
      <!-- Page Ticker (Ticket #155) -->
      <PageTicker />
    </div>
  </nav>

  <!-- Mobile Bottom Navigation (Ticket #110) -->
  <nav class="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
    <RouterLink
      v-for="item in quickNavItems"
      :key="item.path"
      :to="item.path"
      class="mobile-nav-item"
      :class="{ active: route.path === item.path }"
      :aria-current="route.path === item.path ? 'page' : undefined"
      :title="item.title"
    >
      <span class="mobile-nav-icon" aria-hidden="true">{{ item.icon }}</span>
      <span class="mobile-nav-label">{{ item.title }}</span>
    </RouterLink>
  </nav>

  <!-- Keyboard Shortcuts Help Modal (Ticket #128) -->
  <KeyboardShortcutsHelp
    :is-open="showKeyboardHelp"
    :shortcuts="shortcuts"
    @close="() => { toggleHelp(); showKeyboardHelp = false }"
  />
</template>

<style scoped src="./Router.css"></style>
