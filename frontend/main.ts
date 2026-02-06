import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles.css'

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

app.mount('#app')
