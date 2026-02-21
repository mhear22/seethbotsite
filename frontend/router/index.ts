import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../components/pages/HomePage.vue')
  },
  {
    path: '/fishing',
    name: 'fishing',
    component: () => import('../components/pages/FishingPage.vue')
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('../components/pages/StatsPage.vue')
  },
  {
    path: '/character-tinder',
    name: 'character-tinder',
    component: () => import('../components/pages/CharacterTinderPage.vue')
  },
  {
    path: '/girl',
    name: 'girl',
    component: () => import('../components/pages/GirlModePage.vue')
  },
  {
    path: '/gender',
    name: 'phrenology',
    component: () => import('../components/pages/GenderPage.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../components/pages/AboutPage.vue')
  },
  {
    path: '/rankings',
    name: 'rankings',
    component: () => import('../components/pages/RankingsPage.vue')
  },
  {
    path: '/cats',
    name: 'cats',
    component: () => import('../components/pages/CatsPage.vue')
  },
  {
    path: '/stocks',
    name: 'stocks',
    component: () => import('../components/pages/StockMarket.vue')
  },
  {
    path: '/movies',
    name: 'movies',
    component: () => import('../components/pages/MoviePage.vue')
  },
  {
    path: '/countdowns',
    name: 'countdowns',
    component: () => import('../components/pages/CountdownPage.vue')
  },
  {
    path: '/tickets',
    name: 'tickets',
    component: () => import('../components/pages/TicketsPage.vue')
  },
  {
    path: '/clocks',
    name: 'clocks',
    component: () => import('../components/pages/ClocksPage.vue')
  },
  {
    path: '/music',
    name: 'music',
    component: () => import('../components/pages/MusicPage.vue')
  },
  {
    path: '/opinion',
    name: 'opinion',
    component: () => import('../components/pages/OpinionPage.vue')
  },
  {
    path: '/mold',
    name: 'mold',
    component: () => import('../components/pages/MoldPage.vue')
  },
  {
    path: '/clicker',
    name: 'clicker',
    component: () => import('../components/pages/ClickerPage.vue')
  },
  {
    path: '/shop',
    name: 'shop',
    component: () => import('../components/pages/ShopPage.vue')
  },
  {
    path: '/api-docs',
    name: 'api-docs',
    component: () => import('../components/pages/ApiDocsPage.vue')
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../components/pages/AuthPage.vue')
  },
  {
    path: '/login',
    redirect: { path: '/auth', query: { mode: 'login' } }
  },
  {
    path: '/register',
    redirect: { path: '/auth', query: { mode: 'register' } }
  },
  {
    path: '/wordcloud',
    name: 'wordcloud',
    component: () => import('../components/pages/WordCloudPage.vue')
  },
  {
    path: '/keanu',
    name: 'keanu',
    component: () => import('../components/pages/KeanuPage.vue')
  },
  {
    path: '/patch-notes',
    name: 'patch-notes',
    component: () => import('../components/pages/PatchNotesPage.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../components/pages/SettingsPage.vue')
  },
  {
    path: '/car',
    name: 'car',
    component: () => import('../components/pages/CarPage.vue')
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('../components/pages/FavoritesPage.vue')
  },
  {
    path: '/challenges',
    name: 'challenges',
    component: () => import('../components/pages/DailyChallenges.vue')
  },
  {
    path: '/archive',
    name: 'archive',
    component: () => import('../components/pages/ArchiveHistoryPage.vue')
  },
  {
    path: '/messages',
    name: 'messages',
    component: () => import('../components/pages/MessagesPage.vue')
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('../components/pages/AnalyticsPage.vue')
  },
  {
    path: '/solar',
    name: 'solar',
    component: () => import('../components/pages/SolarPanelPage.vue')
  },
  {
    path: '/solar/battery',
    name: 'solar-battery',
    component: () => import('../components/pages/BatteryCalculatorPage.vue')
  },
  {
    path: '/mech-builder',
    name: 'mech-builder',
    component: () => import('../components/pages/MechBuilderPage.vue')
  },
  {
    path: '/mech-battle',
    name: 'mech-battle',
    component: () => import('../components/pages/MechBattlePage.vue')
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../components/pages/SearchPage.vue')
  },
  {
    path: '/orbital',
    name: 'orbital',
    component: () => import('../components/pages/OrbitalMechanicsPage.vue')
  },
  {
    path: '/home-loan',
    name: 'home-loan',
    component: () => import('../components/pages/HomeLoanPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
