<script setup lang="ts">
import { useRouter } from 'vue-router'
import GenderPicker from './GenderPicker.vue'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="page gender-page">
    <GenderPicker @back="goBack" />
  </div>
</template>
