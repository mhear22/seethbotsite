import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import '@frontend/styles.css'
import '@frontend/theme-base.css'

createApp(App)
  .use(createPinia())
  .mount('#app')
