<script setup lang="ts">
import { useAppStore } from '../stores/useAppStore'
import RankingsPanel from './RankingsPanel.vue'

const appStore = useAppStore()
</script>

<template>
  <div class="page rankings-page">
    <RankingsPanel 
      :rankings="appStore.rankings" 
      :current-route="appStore.currentRoute"
    />
  </div>
</template>