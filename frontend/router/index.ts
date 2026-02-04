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

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/girl',
    name: 'girl',
    component: GirlMode
  },
  {
    path: '/gender',
    name: 'gender',
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
