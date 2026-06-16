import { createRouter, createWebHistory } from 'vue-router'

const AuthRedirectPage = {
  name: 'AuthRedirectPage',
  mounted() {
    const query = new URLSearchParams(window.location.search)
    const mode = query.get('mode') || 'login'
    window.location.assign(`/auth?mode=${encodeURIComponent(mode)}`)
  },
  template: '<div class="mech-auth-redirect">Redirecting to login...</div>'
}

const routes = [
  {
    path: '/',
    name: 'mech-home',
    component: () => import('./components/pages/HomePage.vue')
  },
  {
    path: '/builder',
    name: 'mech-builder',
    component: () => import('./components/pages/MechBuilderPage.vue')
  },
  {
    path: '/battle',
    name: 'mech-battle',
    component: () => import('./components/pages/MechBattlePage.vue')
  },
  {
    path: '/story',
    name: 'mech-story',
    component: () => import('./components/pages/StoryModePage.vue')
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthRedirectPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
