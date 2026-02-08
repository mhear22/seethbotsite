import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles.css'
import './theme-base.css'
import { useAuthStore } from './stores/useAuthStore'

// Accessibility testing with axe-core (Ticket #148)
if (import.meta.env.DEV) {
  import('@axe-core/vue').then(({ default: axe }) => {
    console.log('[Accessibility] Axe DevTools enabled')
  }).catch((error) => {
    console.warn('[Accessibility] Failed to load axe-core:', error)
  })
}

// Font Awesome integration
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChild, faBaby, faUser } from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(faChild, faBaby, faUser)

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration)
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error)
      })
  })
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Register Font Awesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

// Initialize auth store on app load
app.mount('#app')

// Initialize auth after mounting
const initAuth = () => {
  try {
    const authStore = useAuthStore()
    authStore.initAuth()
    console.log('[Auth] Auth store initialized')
  } catch (error) {
    console.error('[Auth] Failed to initialize auth store:', error)
  }
}

// Initialize auth on app load
initAuth()
