<script setup lang="ts">
import { inject } from 'vue'
import RankingsPanel from './RankingsPanel.vue'

const rankings = inject('rankings')
</script>

<template>
  <div class="page rankings-page">
    <RankingsPanel :rankings="rankings" />
  </div>
</template>
