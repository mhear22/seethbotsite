<script setup lang="ts">
import { ref } from 'vue'

interface RouteData {
  title: string
  icon: string
}

interface Routes {
  [key: string]: RouteData
}

defineProps<{
  currentRoute?: string
}>()

const emit = defineEmits<{
  'route-change': [route: string]
}>()

const routes = ref<Routes>({
  home: { title: 'Home', icon: '🌸' },
  girl: { title: 'Girl Mode', icon: '💕' },
  gender: { title: 'Gender', icon: '🔮' },
  about: { title: 'About', icon: 'ℹ️' },
  rankings: { title: 'Rankings', icon: '👻' },
  cats: { title: 'Cats', icon: '🐱' }
})

const navigate = (route: string) => {
  emit('route-change', route)
  window.scrollTo(0, 0)
}
</script>

<template>
  <div class="router-nav">
    <button
      v-for="(routeData, routeName) in routes"
      :key="routeName"
      :class="{ active: currentRoute === routeName }"
      @click="navigate(routeName)"
      class="router-link"
      :title="routeData.title"
    >
      {{ routeData.icon }} {{ routeData.title }}
    </button>
  </div>
</template>
