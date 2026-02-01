<script setup lang="ts">
import { inject } from 'vue'
import CatPanel from './CatPanel.vue'

const catImage = inject('catImage')
const catLoading = inject('catLoading')
const nextCat = inject('nextCat') as () => void
</script>

<template>
  <div class="page cats-page">
    <CatPanel :cat-image="catImage" :loading="catLoading" @new-cat="nextCat" />
  </div>
</template>
