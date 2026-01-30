<script setup lang="ts">
import { inject } from 'vue'
import QuoteSection from './QuoteSection.vue'
import Tachometer from './Tachometer.vue'
import ClickCounter from './ClickCounter.vue'

const currentQuote = inject('currentQuote')
const tachValue = inject('tachValue')
const fartClicked = inject('fartClicked')
const fartExploded = inject('fartExploded')
const nextQuote = inject('nextQuote') as () => void
const onFart = inject('onFart') as () => void
</script>

<template>
  <div class="page home-page">
    <QuoteSection :current-quote="currentQuote" @next-quote="nextQuote" />
    <Tachometer :value="tachValue" @fart="onFart" />
    <ClickCounter />
  </div>
</template>
