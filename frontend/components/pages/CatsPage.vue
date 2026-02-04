<script setup lang="ts">
import { useAppStore } from '../../stores/useAppStore'
import CatPanel from '../panels/CatPanel.vue'

const appStore = useAppStore()
</script>

<template>
  <div class="page cats-page">
    <div class="cats-container">
      <CatPanel :cat-image="appStore.catImage" :loading="appStore.catLoading" @new-cat="appStore.nextCat" :centered="true" />
    </div>
  </div>
</template>

<style scoped>
.cats-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px 40px;
}

.cats-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
}
</style>
