import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/HomePage.vue'
import GirlMode from '../components/GirlModePage.vue'
import Gender from '../components/GenderPage.vue'
import About from '../components/AboutPage.vue'
import Rankings from '../components/RankingsPage.vue'
import Cats from '../components/CatsPage.vue'
import StockMarket from '../components/StockMarket.vue'
import MoviePage from '../components/MoviePage.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
