<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

interface RouteData {
  title: string
  icon: string
  path: string
}

const routes = ref<RouteData[]>([
  { title: 'Home', icon: '🌸', path: '/' },
  { title: 'Girl Mode', icon: '💕', path: '/girl' },
  { title: 'Gender', icon: '🔮', path: '/gender' },
  { title: 'About', icon: 'ℹ️', path: '/about' },
  { title: 'Rankings', icon: '👻', path: '/rankings' },
  { title: 'Cats', icon: '🐱', path: '/cats' }
])

const route = useRoute()

const scrollToTop = () => {
  window.scrollTo(0, 0)
}
</script>

<template>
  <div class="router-nav">
    <RouterLink
      v-for="routeData in routes"
      :key="routeData.path"
      :to="routeData.path"
      class="router-link"
      :class="{ active: route.path === routeData.path }"
      :title="routeData.title"
      @click="scrollToTop"
    >
      {{ routeData.icon }} {{ routeData.title }}
    </RouterLink>
  </div>
</template>
