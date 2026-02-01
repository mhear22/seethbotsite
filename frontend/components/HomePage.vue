<script setup lang="ts">
import QuoteSection from './QuoteSection.vue'
import Tachometer from './Tachometer.vue'
import ClickCounter from './ClickCounter.vue'
import { useAppStore } from '../stores/useAppStore'

const appStore = useAppStore()
</script>

<template>
  <div class="page home-page">
    <QuoteSection :current-quote="appStore.currentQuote" @next-quote="appStore.nextQuote" />
    <Tachometer :value="appStore.tachValue" :clicked="appStore.fartClicked" :exploded="appStore.fartExploded" @fart="appStore.onFart" />
    <ClickCounter />
  </div>
</template>
