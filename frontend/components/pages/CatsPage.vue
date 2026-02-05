<script setup lang="ts">
import { useAppStore } from '../../stores/useAppStore'
import CatPanel from '../panels/CatPanel.vue'

const appStore = useAppStore()
</script>

<template>
  <div class="page cats-page">
    <div class="page-header">
      <h1>🐱 Cats</h1>
      <p class="subtitle">Click to get a random cat!</p>
    </div>
    <div class="cats-container">
      <CatPanel :cat-image="appStore.catImage" :loading="appStore.catLoading" @new-cat="appStore.nextCat" :centered="true" />
    </div>
  </div>
</template>

<style scoped>
.cats-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px 40px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header h1 {
  font-size: 2.5rem;
  color: #ff6b9d;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #ff6b9d, #ff8a80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.cats-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: center;
}
</style>
