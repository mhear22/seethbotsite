<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/useAppStore'
import GenderPicker from '../shared/ui/GenderPicker.vue'

const router = useRouter()
const appStore = useAppStore()

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="page gender-page">
    <GenderPicker :dark-mode="appStore.darkMode" @back="goBack" />
  </div>
</template>
