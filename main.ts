import { createApp } from 'vue'
import { MainApp } from './components/MainApp.js'
import { Router } from './components/Router.js'

createApp({
  components: {
    MainApp,
    Router
  },
  template: `
    <MainApp />
  `
}).mount('#app')
