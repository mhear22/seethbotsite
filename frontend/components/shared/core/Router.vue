<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAppStore } from '../../../stores/useAppStore'

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

const dropdowns = ref<DropdownData[]>([
  {
    title: 'Fun & Games',
    icon: '🎮',
    routes: [
      { title: 'Idle Clicker', icon: '🖱️', path: '/clicker' },
      { title: 'Girl Mode', icon: '💕', path: '/girl' },
      { title: 'Gender', icon: '🔮', path: '/gender' },
      { title: 'Cats', icon: '🐱', path: '/cats' },
      { title: 'Stock Market', icon: '📈', path: '/stocks' },
      { title: 'Music', icon: '🎵', path: '/music' }
    ]
  },
  {
    title: 'Community',
    icon: '👥',
    routes: [
      { title: 'Mold', icon: '🍄', path: '/mold' },
      { title: 'Rankings', icon: '👻', path: '/rankings' },
      { title: 'Movie Night', icon: '🎬', path: '/movies' },
      { title: 'Tickets', icon: '🎫', path: '/tickets' },
      { title: 'Moldbot Opinions', icon: '🤖', path: '/opinion' }
    ]
  },
  {
    title: 'Tools',
    icon: '🛠️',
    routes: [
      { title: 'Clocks', icon: '🌍', path: '/clocks' },
      { title: 'Countdowns', icon: '⏰', path: '/countdowns' },
      { title: 'About', icon: 'ℹ️', path: '/about' },
      { title: 'API Docs', icon: '📚', path: '/api-docs' },
      { title: 'Account', icon: '🔐', path: '/auth' }
    ]
  }
])

const route = useRoute()
const appStore = useAppStore()
const mobileMenuOpen = ref(false)
const openDropdown = ref<string | null>(null)

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
        <span class="brand-icon">🌸</span>
        <span class="brand-text">Mold</span>
      </div>

      <div class="nav-controls-wrapper">
        <div class="nav-controls-chevron">
          <span class="chevron-icon">▲</span>
        </div>
        <div class="nav-controls">
          <button @click="appStore.toggleDarkMode" class="control-btn" :class="{ active: appStore.darkMode }" title="Toggle dark mode">
            {{ appStore.darkMode ? '🌙' : '☀️' }}
          </button>
          <button @click="appStore.toggleMusic" class="control-btn" :class="{ active: appStore.musicPlaying }" title="Toggle music">
            {{ appStore.musicPlaying ? '🔊' : '🔇' }}
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
          <button @click="appStore.togglePanel('digitalGoose')" class="control-btn" :class="{ active: appStore.panels.digitalGoose }" title="Toggle goose">
            🦆
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
</template>

<style scoped>
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
  z-index: 198;
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
}
</style>
