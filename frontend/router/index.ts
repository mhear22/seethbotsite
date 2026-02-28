import { createRouter, createWebHistory } from 'vue-router'
import { mechRoutes } from '../features/mech/routes'
import { ticketsRoutes } from '../features/tickets/routes'
import { dataCenterRoutes } from '../features/datacenter/routes'

// Public routes that don't require subscription
const PUBLIC_ROUTES = ['/', '/shop', '/auth', '/login', '/register']

// Cache for subscription status
let subscriptionCache: {
  isActive: boolean;
  timestamp: number;
} | null = null

const CACHE_DURATION = 60000 // 1 minute cache

async function checkSubscription(): Promise<boolean> {
  const token = localStorage.getItem('token')
  if (!token) return false

  // Check cache
  if (subscriptionCache && Date.now() - subscriptionCache.timestamp < CACHE_DURATION) {
    return subscriptionCache.isActive
  }

  try {
    const response = await fetch('/api/subscriptions/status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      subscriptionCache = {
        isActive: data.subscription?.isActive || false,
        timestamp: Date.now()
      }
      return subscriptionCache.isActive
    }
  } catch (err) {
    console.error('Error checking subscription:', err)
  }

  return false
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../components/pages/HomePage.vue'),
    meta: { public: true }
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
  ...ticketsRoutes,
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
    component: () => import('../components/pages/ShopPage.vue'),
    meta: { public: true }
  },
  {
    path: '/api-docs',
    name: 'api-docs',
    component: () => import('../components/pages/ApiDocsPage.vue')
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../components/pages/AuthPage.vue'),
    meta: { public: true }
  },
  {
    path: '/login',
    redirect: { path: '/auth', query: { mode: 'login' } },
    meta: { public: true }
  },
  {
    path: '/register',
    redirect: { path: '/auth', query: { mode: 'register' } },
    meta: { public: true }
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
  ...mechRoutes,
  ...dataCenterRoutes,
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
  },
  {
    path: '/vibe-coding',
    name: 'vibe-coding',
    component: () => import('../components/pages/VibeCodingPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for subscription paywall
router.beforeEach(async (to, from, next) => {
  // Allow public routes
  if (to.meta.public || PUBLIC_ROUTES.includes(to.path)) {
    return next()
  }

  // Check if logged in
  const token = localStorage.getItem('token')
  if (!token) {
    return next({
      path: '/auth',
      query: { redirect: to.fullPath, message: 'login-required' }
    })
  }

  // Check subscription status
  const hasSubscription = await checkSubscription()
  if (!hasSubscription) {
    return next({
      path: '/shop',
      query: { message: 'subscription-required', redirect: to.fullPath }
    })
  }

  next()
})

// Clear subscription cache on login/logout
window.addEventListener('storage', (e) => {
  if (e.key === 'token') {
    subscriptionCache = null
  }
})

export default router
