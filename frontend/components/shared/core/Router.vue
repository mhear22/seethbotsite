<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../../../stores/useAppStore'
import { useKeyboardShortcuts } from '../../../composables/useKeyboardShortcuts'
import KeyboardShortcutsHelp from '../../shared/ui/KeyboardShortcutsHelp.vue'
import PageTicker from '../../shared/ui/PageTicker.vue'

// Brand icon rotation (Ticket #92)
const brandRotation = ref(0)
const brandClicking = ref(false)

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  const scrollPercent = scrollTop / maxScroll
  brandRotation.value = scrollPercent * 360
}

interface RouteData {
  title: string
  icon: string
  path: string
}

interface DropdownData {
  title: string
  icon: string
  routes: RouteData[]
}

// Organized navigation structure with dropdowns
const mainRoutes = ref<RouteData[]>([
  { title: 'Home', icon: '🌸', path: '/' }
])

// Quick navigation for mobile bottom nav (Ticket #110)
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
      { title: 'Clocks', icon: '🌍', path: '/clocks' },
      { title: 'Countdowns', icon: '⏰', path: '/countdowns' },
      { title: 'Favorites', icon: '⭐', path: '/favorites' },
      { title: 'Patch Notes', icon: '📝', path: '/patch-notes' },
      { title: 'About', icon: 'ℹ️', path: '/about' },
      { title: 'Settings', icon: '⚙️', path: '/settings' },
      { title: 'API Docs', icon: '📚', path: '/api-docs' },
      { title: 'Account', icon: '🔐', path: '/auth' }
    ]
  }
])

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const mobileMenuOpen = ref(false)
const openDropdown = ref<string | null>(null)
const showKeyboardHelp = ref(false)

// Keyboard shortcuts (Ticket #128)
const { shortcuts, registerShortcut, isHelpOpen, toggleHelp } = useKeyboardShortcuts()
showKeyboardHelp.value = isHelpOpen

// Breadcrumb navigation (Ticket #126)
const breadcrumbs = computed(() => {
  const crumbPath: Array<{ title: string; path: string }> = []
  const pathSegments = route.path.split('/').filter(Boolean)

  // Always add Home
  crumbPath.push({ title: 'Home', path: '/' })

  // Add each segment
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const title = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // Find matching route title from dropdowns or main routes
    let routeTitle = title
    const allRoutes = [
      ...mainRoutes.value,
      ...dropdowns.value.flatMap(d => d.routes)
    ]
    const matchingRoute = allRoutes.find(r => r.path === currentPath)
    if (matchingRoute) {
      routeTitle = matchingRoute.title
    }

    crumbPath.push({ title: routeTitle, path: currentPath })
  })

  // Limit breadcrumbs to prevent overcrowding
  if (crumbPath.length > 4) {
    const first = crumbPath[0]
    const last = crumbPath[crumbPath.length - 1]
    const prev = crumbPath[crumbPath.length - 2]
    crumbPath.splice(1, crumbPath.length - 3, { title: '...', path: prev.path })
  }

  return crumbPath
})

// Build info (Ticket #56)
const buildInfo = ref<{ buildCount: number; buildTime: string } | null>(null)
const timeAgo = ref('')

// Load build info on mount
const loadBuildInfo = async () => {
  try {
    const response = await fetch('/api/version')
    const data = await response.json()
    buildInfo.value = {
      buildCount: data.buildCount || 1,
      buildTime: data.buildTime
    }
    updateTimeAgo()
    // Update time ago every minute
    setInterval(updateTimeAgo, 60000)
  } catch (error) {
    console.warn('Could not load build info:', error)
  }
}

const updateTimeAgo = () => {
  if (!buildInfo.value) return
  const buildDate = new Date(buildInfo.value.buildTime)
  const now = new Date()
  const diffMs = now.getTime() - buildDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) {
    timeAgo.value = 'just now'
  } else if (diffMins < 60) {
    timeAgo.value = `${diffMins}m ago`
  } else if (diffHours < 24) {
    timeAgo.value = `${diffHours}h ago`
  } else {
    timeAgo.value = `${diffDays}d ago`
  }
}

// Load build info when component mounts
loadBuildInfo()

// Add scroll listener for brand icon rotation (Ticket #92)
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Initial rotation

  // Register keyboard shortcuts (Ticket #128)
  registerShortcut({
    key: '?',
    description: 'Show keyboard shortcuts help',
    action: () => {
      toggleHelp()
      showKeyboardHelp.value = isHelpOpen.value
    }
  })

  // Search shortcut (Ticket #139)
  registerShortcut({
    key: 'k',
    ctrl: true,
    description: 'Open search',
    action: () => {
      appStore.toggleSearchModal()
    }
  })

  // Navigation shortcuts
  registerShortcut({
    key: 'h',
    description: 'Go to Home',
    action: () => {
      router.push('/')
    }
  })

  registerShortcut({
    key: 't',
    description: 'Go to Tickets',
    action: () => {
      router.push('/tickets')
    }
  })

  registerShortcut({
    key: 'm',
    description: 'Go to Movies',
    action: () => {
      router.push('/movies')
    }
  })

  registerShortcut({
    key: 'r',
    description: 'Go to Rankings',
    action: () => {
      router.push('/rankings')
    }
  })

  registerShortcut({
    key: 's',
    description: 'Go to Stocks',
    action: () => {
      router.push('/stocks')
    }
  })

  registerShortcut({
    key: 'k',
    description: 'Go to Clicker',
    action: () => {
      router.push('/clicker')
    }
  })

  registerShortcut({
    key: 'f',
    description: 'Go to Fishing',
    action: () => {
      router.push('/fishing')
    }
  })

  registerShortcut({
    key: 'g',
    description: 'Go to Stats',
    action: () => {
      router.push('/stats')
    }
  })

  registerShortcut({
    key: 'o',
    description: 'Go to Shop',
    action: () => {
      router.push('/shop')
    }
  })

  registerShortcut({
    key: ',',
    description: 'Go to Settings',
    action: () => {
      router.push('/settings')
    }
  })

  // Toggle shortcuts
  registerShortcut({
    key: 'd',
    description: 'Toggle dark mode',
    action: () => {
      appStore.toggleDarkMode()
    }
  })

  registerShortcut({
    key: 'u',
    description: 'Toggle music',
    action: () => {
      appStore.toggleMusic()
    }
  })

  registerShortcut({
    key: 'z',
    description: 'Toggle chaos mode',
    action: () => {
      appStore.toggleChaosMode()
    }
  })

  registerShortcut({
    key: 'q',
    description: 'Toggle mold mode',
    action: () => {
      appStore.toggleMoldMode()
    }
  })

  // Panel shortcuts (number keys - standard for panel toggles)
  registerShortcut({
    key: '1',
    description: 'Toggle mold meter',
    action: () => {
      appStore.togglePanel('tachometer')
    }
  })

  registerShortcut({
    key: '2',
    description: 'Toggle rankings panel',
    action: () => {
      appStore.togglePanel('rankings')
    }
  })

  registerShortcut({
    key: '3',
    description: 'Toggle cat panel',
    action: () => {
      appStore.togglePanel('cat')
    }
  })

  registerShortcut({
    key: '4',
    description: 'Toggle feed panel',
    action: () => {
      appStore.togglePanel('feed')
    }
  })

  registerShortcut({
    key: '5',
    description: 'Toggle goose',
    action: () => {
      appStore.togglePanel('digitalGoose')
    }
  })

  registerShortcut({
    key: '6',
    description: 'Toggle GPU mining',
    action: () => {
      appStore.togglePanel('mining')
    }
  })

  registerShortcut({
    key: '7',
    description: 'Toggle coolness panel',
    action: () => {
      appStore.togglePanel('coolnessPanel')
    }
  })

  // Panel shortcuts (letter keys - quick access)
  registerShortcut({
    key: 'c',
    description: 'Toggle cat panel',
    action: () => {
      appStore.togglePanel('cat')
    }
  })

  registerShortcut({
    key: 'p',
    description: 'Toggle GPU mining',
    action: () => {
      appStore.togglePanel('mining')
    }
  })

  registerShortcut({
    key: 'g',
    shift: true,
    description: 'Toggle goose',
    action: () => {
      appStore.togglePanel('digitalGoose')
    }
  })

  // Escape to close
  registerShortcut({
    key: 'Escape',
    description: 'Close modal/menu',
    action: () => {
      if (showKeyboardHelp.value) {
        toggleHelp()
        showKeyboardHelp.value = false
      }
      if (mobileMenuOpen.value) {
        closeMobileMenu()
      }
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const scrollToTop = () => {
  window.scrollTo(0, 0)
}

const handleBrandIconClick = () => {
  brandClicking.value = true
  setTimeout(() => {
    brandClicking.value = false
  }, 400)
  scrollToTop()
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  scrollToTop()
}

const toggleDropdown = (dropdownTitle: string) => {
  if (openDropdown.value === dropdownTitle) {
    openDropdown.value = null
  } else {
    openDropdown.value = dropdownTitle
  }
}

const isDropdownOpen = (dropdownTitle: string) => {
  return openDropdown.value === dropdownTitle
}

const closeDropdowns = () => {
  openDropdown.value = null
}

// Handle clicking outside to close mobile menu
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const navLinks = document.querySelector('.nav-links')
  const menuToggle = document.querySelector('.mobile-menu-toggle')

  if (mobileMenuOpen.value &&
      navLinks &&
      menuToggle &&
      !navLinks.contains(target) &&
      !menuToggle.contains(target)) {
    closeMobileMenu()
  }
}

// Add click listener for outside clicks on mobile
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<template>
  <nav class="router-nav" @mouseleave="closeDropdowns">
    <!-- Mobile menu backdrop -->
    <div
      v-if="mobileMenuOpen"
      class="mobile-menu-backdrop"
      @click="closeMobileMenu"
    ></div>

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
        <span class="build-indicator" v-if="buildInfo" :title="`Build #${buildInfo.buildCount} deployed ${timeAgo}`">
          #{{ buildInfo.buildCount }} ({{ timeAgo }})
        </span>
        <!-- Keyboard shortcuts help button (Ticket #128) -->
        <button
          class="keyboard-help-btn"
          @click="toggleHelp(); showKeyboardHelp = isHelpOpen"
          title="Keyboard shortcuts (?)"
        >⌨️</button>
      </div>

      <div class="nav-controls-wrapper">
        <div class="nav-controls-chevron">
          <span class="chevron-icon">▲</span>
        </div>
        <div class="nav-controls">
          <button @click="appStore.toggleSearchModal" class="control-btn search-btn" :class="{ active: appStore.searchModalOpen }" title="Search (Ctrl+K)">
             🔍
          </button>
          <button @click="appStore.toggleDarkMode" class="control-btn" :class="{ active: appStore.darkMode }" :title="appStore.darkerMode ? 'Midnight mode (click for light)' : (appStore.darkMode ? 'Dark mode (click for midnight)' : 'Light mode (click for dark)')">
            {{ appStore.darkerMode ? '🌑' : (appStore.darkMode ? '🌙' : '☀️') }}
          </button>
          <button @click="appStore.toggleLanguage" class="control-btn" :class="{ active: appStore.isAustralian }" :title="appStore.isAustralian ? 'Australian English (click for US)' : 'US English (click for Australian)'">
            {{ appStore.isAustralian ? '🇦🇺' : '🇺🇸' }}
          </button>
          <button @click="appStore.toggleMute" class="control-btn" :class="{ active: !appStore.isMuted }" title="Toggle mute">
            {{ appStore.isMuted ? '🔇' : '🔊' }}
          </button>
          <button @click="appStore.togglePanel('tachometer')" class="control-btn" :class="{ active: appStore.panels.tachometer }" title="Toggle mold meter">
             🍄
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
          <button @click="appStore.toggleMoldMode" class="control-btn" :class="{ active: appStore.moldMode }" title="Toggle mold mode">
             🦠
          </button>
          <button @click="appStore.togglePanel('digitalGoose')" class="control-btn" :class="{ active: appStore.panels.digitalGoose }" title="Toggle goose">
             🦆
          </button>
          <button @click="appStore.togglePanel('mining')" class="control-btn" :class="{ active: appStore.panels.mining }" title="Toggle GPU mining">
             ⛏️
          </button>
          <button @click="appStore.toggleChaosMode" class="control-btn chaos-btn" :class="{ active: appStore.chaosMode }" title="Toggle chaos mode">
             🌀
          </button>
        </div>
      </div>

      <button class="mobile-menu-toggle" @click="toggleMobileMenu" :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'">
        <span class="hamburger-icon" :class="{ open: mobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
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
          :title="routeData.title"
          @click="closeMobileMenu"
        >
          <span class="link-icon">{{ routeData.icon }}</span>
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
            @click="toggleDropdown(dropdown.title)"
          >
            <span class="link-icon">{{ dropdown.icon }}</span>
            <span class="link-text">{{ dropdown.title }}</span>
            <span class="dropdown-arrow">▼</span>
          </button>

          <div class="dropdown-menu">
            <RouterLink
              v-for="routeData in dropdown.routes"
              :key="routeData.path"
              :to="routeData.path"
              class="dropdown-item"
              :class="{ active: route.path === routeData.path }"
              :title="routeData.title"
              @click="closeMobileMenu"
            >
              <span class="link-icon">{{ routeData.icon }}</span>
              <span class="link-text">{{ routeData.title }}</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Page Ticker (Ticket #155) -->
  <PageTicker />

  <!-- Mobile Bottom Navigation (Ticket #110) -->
  <nav class="mobile-bottom-nav">
    <RouterLink
      v-for="item in quickNavItems"
      :key="item.path"
      :to="item.path"
      class="mobile-nav-item"
      :class="{ active: route.path === item.path }"
      :title="item.title"
    >
      <span class="mobile-nav-icon">{{ item.icon }}</span>
      <span class="mobile-nav-label">{{ item.title }}</span>
    </RouterLink>
  </nav>

  <!-- Breadcrumb Navigation (Ticket #126) -->
  <nav v-if="route.path !== '/'" class="breadcrumbs" aria-label="Breadcrumb navigation">
    <RouterLink to="/" class="breadcrumb-item">Home</RouterLink>
    <template v-for="(crumb, index) in breadcrumbs.slice(1)" :key="crumb.path">
      <span class="breadcrumb-separator">/</span>
      <RouterLink v-if="index !== breadcrumbs.length - 2" :to="crumb.path" class="breadcrumb-item">{{ crumb.title }}</RouterLink>
      <span v-else class="breadcrumb-item breadcrumb-current">{{ crumb.title }}</span>
    </template>
  </nav>

  <!-- Keyboard Shortcuts Help Modal (Ticket #128) -->
  <KeyboardShortcutsHelp
    :is-open="showKeyboardHelp"
    :shortcuts="shortcuts"
    @close="() => { toggleHelp(); showKeyboardHelp = false }"
  />
</template>

<style scoped>
/* Brand Icon */
.brand-icon {
  display: inline-block;
  transition: transform 0.1s linear;
  font-size: 1.5rem;
}

/* Keyboard Help Button */
.keyboard-help-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  margin-left: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.keyboard-help-btn:hover {
  opacity: 1;
  background: rgba(255, 182, 193, 0.15);
  transform: scale(1.1);
}

.dark .keyboard-help-btn:hover {
  background: rgba(255, 182, 193, 0.1);
}

/* Dropdown Container */
.dropdown {
  position: relative;
  display: inline-block;
}

/* Dropdown Button */
.dropdown-btn {
  color: #666;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
}

.dark .dropdown-btn {
  color: #aaa;
}

.dropdown-btn:hover {
  background: rgba(255, 182, 193, 0.15);
  color: #ff91a4;
}

.dark .dropdown-btn:hover {
  background: rgba(255, 182, 193, 0.1);
  color: #ffb6c1;
}

.dropdown-btn.active {
  color: #ff91a4;
  background: rgba(255, 182, 193, 0.2);
}

.dark .dropdown-btn.active {
  color: #ffb6c1;
  background: rgba(255, 182, 193, 0.15);
}

/* Dropdown Arrow */
.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.2s ease;
  margin-left: 2px;
}

.dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  padding: 8px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 182, 193, 0.2);
}

.dark .dropdown-menu {
  background: rgba(40, 44, 52, 0.98);
  border-color: rgba(255, 182, 193, 0.1);
}

.dropdown.open .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* Dropdown Items */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #666;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.15s ease;
  cursor: pointer;
}

.dark .dropdown-item {
  color: #aaa;
}

.dropdown-item:hover {
  background: rgba(255, 182, 193, 0.15);
  color: #ff91a4;
  transform: translateX(4px);
}

.dark .dropdown-item:hover {
  background: rgba(255, 182, 193, 0.1);
  color: #ffb6c1;
}

.dropdown-item.active {
  background: rgba(255, 182, 193, 0.2);
  color: #ff91a4;
  font-weight: 600;
}

.dark .dropdown-item.active {
  background: rgba(255, 182, 193, 0.15);
  color: #ffb6c1;
}

.dropdown-item .link-icon {
  font-size: 16px;
}

/* Mobile Menu Backdrop */
.mobile-menu-backdrop {
  position: fixed;
  top: 56px;
  left: 0;
  width: 100%;
  height: calc(100vh - 56px);
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .dropdown {
    width: 100%;
    display: block;
  }

  .dropdown-btn {
    width: 100%;
    justify-content: space-between;
    border-radius: 0;
    padding: 16px 1.5rem;
    border-bottom: 1px solid rgba(255, 182, 193, 0.1);
    position: relative;
  }

  .dark .dropdown-btn {
    border-bottom: 1px solid rgba(255, 182, 193, 0.08);
  }

  .dropdown-menu {
    position: static;
    width: 100%;
    min-width: 100%;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    border-radius: 0;
    padding: 0;
    background: rgba(248, 248, 248, 0.98);
    display: none;
    border: none;
    border-left: 3px solid #ff91a4;
  }

  .dark .dropdown-menu {
    background: rgba(30, 30, 30, 0.98);
    border-left-color: #ffb6c1;
  }

  .dropdown.open .dropdown-menu {
    display: block;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-item {
    width: 100%;
    padding: 12px 1.5rem 12px 2rem;
    border-bottom: 1px solid rgba(255, 182, 193, 0.05);
    font-size: 15px;
  }

  .dropdown-item:last-child {
    border-bottom: none;
  }

  .dropdown-item:hover {
    transform: none;
    background: rgba(255, 182, 193, 0.15);
  }

  .dark .dropdown-item:hover {
    background: rgba(255, 182, 193, 0.1);
  }

  .dropdown-btn.active::after {
    display: none;
  }

  .dropdown-btn.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #ff91a4;
  }

  .dark .dropdown-btn.active::before {
    background: #ffb6c1;
  }

  .dropdown-item .link-icon {
    font-size: 18px;
  }

  .dropdown-btn.active {
    border-bottom: 1px solid transparent;
  }

  .dark .dropdown-btn.active {
    border-bottom: 1px solid transparent;
  }
}

/* Build Indicator (Ticket #56) */
.build-indicator {
  font-size: 11px;
  font-weight: 600;
  color: #999;
  margin-left: 8px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.dark .build-indicator {
  color: #777;
  background: rgba(255, 255, 255, 0.1);
}

.build-indicator:hover {
  color: #666;
  background: rgba(0, 0, 0, 0.08);
}

.dark .build-indicator:hover {
  color: #999;
  background: rgba(255, 255, 255, 0.15);
}

/* Chaos Mode Styles (Ticket #88) */
.chaos-btn.active {
  animation: chaos-spin 1s linear infinite;
}

@keyframes chaos-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Global chaos mode effects */
body.chaos {
  animation: chaos-shake 0.5s ease-in-out infinite;
}

@keyframes chaos-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px) rotate(-1deg); }
  75% { transform: translateX(2px) rotate(1deg); }
}

body.chaos .brand-icon {
  animation: chaos-rainbow 2s linear infinite;
}

@keyframes chaos-rainbow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

body.chaos .control-btn {
  animation: chaos-bounce 0.5s ease-in-out infinite alternate;
}

body.chaos .control-btn:nth-child(odd) {
  animation-delay: 0.25s;
}

@keyframes chaos-bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-3px); }
}

body.chaos .router-link,
body.chaos .dropdown-btn {
  animation: chaos-glow 1.5s ease-in-out infinite alternate;
}

@keyframes chaos-glow {
  0% { text-shadow: 0 0 5px var(--chaos-color-1, #ff0000); }
  100% { text-shadow: 0 0 15px var(--chaos-color-2, #00ff00); }
}

/* Breadcrumb Navigation (Ticket #126) */
.breadcrumbs {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 10px 20px;
  margin: 10px auto 20px;
  max-width: 1200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  overflow-x: auto;
}

.dark .breadcrumbs {
  background: rgba(40, 44, 52, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.breadcrumb-item {
  color: #666;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.dark .breadcrumb-item {
  color: #a0aec0;
}

.breadcrumb-item:hover {
  color: #ff91a4;
  text-decoration: none;
}

.dark .breadcrumb-item:hover {
  color: #ffb6c1;
}

.breadcrumb-current {
  color: #ff91a4;
  font-weight: 600;
}

.dark .breadcrumb-current {
  color: #ffb6c1;
}

.breadcrumb-separator {
  color: #cbd5e0;
  font-size: 12px;
  margin: 0 4px;
}

.dark .breadcrumb-separator {
  color: #4a5568;
}

/* Responsive breadcrumbs */
@media (max-width: 768px) {
  .breadcrumbs {
    padding: 8px 16px;
    margin: 8px 16px 16px;
    font-size: 13px;
    gap: 6px;
  }

  .breadcrumb-separator {
    margin: 0 2px;
  }
}
</style>
