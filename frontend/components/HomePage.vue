<script setup lang="ts">
import QuoteSection from './QuoteSection.vue'
import { useAppStore } from '../stores/useAppStore'

const appStore = useAppStore()
</script>

<template>
  <div class="page home-page">
    <QuoteSection :current-quote="appStore.currentQuote" @next-quote="appStore.nextQuote" />
  </div>
</template>
