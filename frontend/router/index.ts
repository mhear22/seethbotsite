import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/pages/HomePage.vue'
import GirlMode from '../components/pages/GirlModePage.vue'
import Gender from '../components/pages/GenderPage.vue'
import About from '../components/pages/AboutPage.vue'
import Rankings from '../components/pages/RankingsPage.vue'
import Cats from '../components/pages/CatsPage.vue'
import StockMarket from '../components/pages/StockMarket.vue'
import MoviePage from '../components/pages/MoviePage.vue'
import CountdownPage from '../components/pages/CountdownPage.vue'
import TicketsPage from '../components/pages/TicketsPage.vue'
import ClocksPage from '../components/pages/ClocksPage.vue'
import MusicPage from '../components/pages/MusicPage.vue'
import OpinionPage from '../components/pages/OpinionPage.vue'
import MoldPage from '../components/pages/MoldPage.vue'
import ClickerPage from '../components/pages/ClickerPage.vue'
import ShopPage from '../components/pages/ShopPage.vue'
import ApiDocsPage from '../components/pages/ApiDocsPage.vue'
import AuthPage from '../components/pages/AuthPage.vue'
import Login from '../components/auth/Login.vue'
import Register from '../components/auth/Register.vue'
import FishingPage from '../components/pages/FishingPage.vue'
import StatsPage from '../components/pages/StatsPage.vue'
import CharacterTinderPage from '../components/pages/CharacterTinderPage.vue'
import WordCloudPage from '../components/pages/WordCloudPage.vue'
import KeanuPage from '../components/pages/KeanuPage.vue'
import PatchNotesPage from '../components/pages/PatchNotesPage.vue'
import SettingsPage from '../components/pages/SettingsPage.vue'
import CarPage from '../components/pages/CarPage.vue'
import FavoritesPage from '../components/pages/FavoritesPage.vue'
import DailyChallenges from '../components/pages/DailyChallenges.vue'
import ArchiveHistoryPage from '../components/pages/ArchiveHistoryPage.vue'
import MessagesPage from '../components/pages/MessagesPage.vue'
import AnalyticsPage from '../components/pages/AnalyticsPage.vue'
import SolarPanelPage from '../components/pages/SolarPanelPage.vue'
import BatteryCalculatorPage from '../components/pages/BatteryCalculatorPage.vue'
import MechBuilderPage from '../components/pages/MechBuilderPage.vue'
import MechBattlePage from '../components/pages/MechBattlePage.vue'
import SearchPage from '../components/pages/SearchPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/fishing',
    name: 'fishing',
    component: FishingPage
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatsPage
  },
  {
    path: '/character-tinder',
    name: 'character-tinder',
    component: CharacterTinderPage
  },
  {
    path: '/girl',
    name: 'girl',
    component: GirlMode
  },
  {
    path: '/gender',
    name: 'phrenology',
    component: Gender
  },
  {
    path: '/about',
    name: 'about',
    component: About
  },
  {
    path: '/rankings',
    name: 'rankings',
    component: Rankings
  },
  {
    path: '/cats',
    name: 'cats',
    component: Cats
  },
  {
    path: '/stocks',
    name: 'stocks',
    component: StockMarket
  },
  {
    path: '/movies',
    name: 'movies',
    component: MoviePage
  },
  {
    path: '/countdowns',
    name: 'countdowns',
    component: CountdownPage
  },
  {
    path: '/tickets',
    name: 'tickets',
    component: TicketsPage
  },
  {
    path: '/clocks',
    name: 'clocks',
    component: ClocksPage
  },
  {
    path: '/music',
    name: 'music',
    component: MusicPage
  },
  {
    path: '/opinion',
    name: 'opinion',
    component: OpinionPage
  },
  {
    path: '/mold',
    name: 'mold',
    component: MoldPage
  },
  {
    path: '/clicker',
    name: 'clicker',
    component: ClickerPage
  },
  {
    path: '/shop',
    name: 'shop',
    component: ShopPage
  },
  {
    path: '/api-docs',
    name: 'api-docs',
    component: ApiDocsPage
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthPage
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/wordcloud',
    name: 'wordcloud',
    component: WordCloudPage
  },
  {
    path: '/keanu',
    name: 'keanu',
    component: KeanuPage
  },
  {
    path: '/patch-notes',
    name: 'patch-notes',
    component: PatchNotesPage
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsPage
  },
  {
    path: '/car',
    name: 'car',
    component: CarPage
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: FavoritesPage
  },
  {
    path: '/challenges',
    name: 'challenges',
    component: DailyChallenges
  },
  {
    path: '/archive',
    name: 'archive',
    component: ArchiveHistoryPage
  },
  {
    path: '/messages',
    name: 'messages',
    component: MessagesPage
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: AnalyticsPage
  },
  {
    path: '/solar',
    name: 'solar',
    component: SolarPanelPage
  },
  {
    path: '/solar/battery',
    name: 'solar-battery',
    component: BatteryCalculatorPage
  },
  {
    path: '/mech-builder',
    name: 'mech-builder',
    component: MechBuilderPage
  },
  {
    path: '/mech-battle',
    name: 'mech-battle',
    component: MechBattlePage
  },
  {
    path: '/search',
    name: 'search',
    component: SearchPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
