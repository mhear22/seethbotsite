import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './config/i18n'
import './styles.css'
import './theme-base.css'
import { useAuthStore } from './stores/useAuthStore'

// Font Awesome integration
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChild, faBaby, faUser } from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(faChild, faBaby, faUser)

// Unregister any existing Service Workers to prevent caching issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then(() => {
        console.log('[PWA] Service Worker unregistered')
      })
    }
  })
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)
app.use(router)

// Register Font Awesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

// Initialize auth BEFORE mounting to prevent race conditions
const initAuth = async () => {
  try {
    const authStore = useAuthStore()
    await authStore.init()
    console.log('[Auth] Auth store initialized')
  } catch (error) {
    console.error('[Auth] Failed to initialize auth store:', error)
  }
}

// Initialize auth before mounting to ensure auth state is ready
initAuth().then(() => {
  app.mount('#app')
  console.log('[App] Mounted with auth state ready')
})
