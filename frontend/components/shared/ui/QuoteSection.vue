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

// Format quote to handle advice section
const formatQuote = (quote: string) => {
  if (quote.includes('\n\n')) {
    const parts = quote.split('\n\n')
    return `"${parts[0]}"<br><span class="advice-section">${parts[1]}</span>`
  }
  return `"${quote}"`
}
</script>

<template>
  <div class="quote-section">
    <div class="quote-text" @click="nextQuote">
      <span v-html="formatQuote(currentQuote)"></span>
    </div>
  </div>
</template>

<style scoped>
.quote-section {
  padding: 20px;
  text-align: center;
}

.quote-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #4a5568;
  cursor: pointer;
  transition: transform 0.2s;
  user-select: none;
}

.quote-text:hover {
  transform: scale(1.02);
}

.advice-section {
  display: block;
  margin-top: 12px;
  font-size: 1rem;
  color: #805ad5;
  font-weight: 500;
}

.dark .quote-text {
  color: #e2e8f0;
}

.dark .advice-section {
  color: #b794f4;
}
</style>
