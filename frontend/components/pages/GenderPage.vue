<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/useAppStore'
import PhrenologyPicker from '../shared/ui/PhrenologyPicker.vue'

const router = useRouter()
const appStore = useAppStore()

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="page phrenology-page">
    <PhrenologyPicker :dark-mode="appStore.darkMode" @back="goBack" />
  </div>
</template>
