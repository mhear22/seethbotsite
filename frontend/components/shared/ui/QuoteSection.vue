<script setup lang="ts">
defineProps<{
  currentQuote: string
}>()

const emit = defineEmits<{
  'next-quote': []
}>()

const nextQuote = () => {
  emit('next-quote')
}
</script>

<template>
  <div class="quote-section">
    <div class="quote-text" @click="nextQuote">"{{ currentQuote }}"</div>
  </div>
</template>
