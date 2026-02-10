<script setup lang="ts">
import { computed } from 'vue'
import { useFavorites } from '../../../composables/useFavorites'
import ShortcutBadge from './ShortcutBadge.vue'

defineProps<{
  currentQuote: string
}>()

const emit = defineEmits<{
  'next-quote': []
}>()

const { toggleFavorite, isFavorite } = useFavorites()

const isQuoteFavorite = computed(() => {
  return isFavorite('quote', { text: 'quote' })
})

const nextQuote = () => {
  emit('next-quote')
}

const handleFavorite = (e: Event) => {
  e.stopPropagation()
  toggleFavorite('quote', { text: 'quote' })
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
    <div class="quote-text" @click="nextQuote" title="Click or press Ctrl+N for next quote">
      <span v-html="formatQuote(currentQuote)"></span>
      <ShortcutBadge :shortcut="{ key: 'n', ctrl: true, meta: true }" class="quote-shortcut" />
    </div>
    <button
      @click="handleFavorite"
      :class="['favorite-btn', { favorited: isQuoteFavorite }]"
      :title="isQuoteFavorite ? 'Remove from favorites' : 'Add to favorites'"
    >
      ⭐
    </button>
  </div>
</template>

<style scoped>
.quote-section {
  padding: 20px;
  text-align: center;
  position: relative;
}

.quote-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #4a5568;
  cursor: pointer;
  transition: transform 0.2s;
  user-select: none;
  position: relative;
}

.quote-shortcut {
  margin-left: 12px;
  opacity: 0.6;
  font-size: 10px;
}

.quote-text:hover {
  transform: scale(1.02);
}

.quote-text:hover .quote-shortcut {
  opacity: 1;
}

.favorite-btn {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #cbd5e0;
  background: rgba(255, 255, 255, 0.95);
  color: #cbd5e0;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favorite-btn:hover {
  transform: translateY(-50%) scale(1.1);
  border-color: #f6d365;
  color: #f6d365;
}

.favorite-btn.favorited {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-color: #f6d365;
  color: white;
  box-shadow: 0 4px 12px rgba(246, 211, 101, 0.4);
}

.favorite-btn.favorited:hover {
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 6px 16px rgba(246, 211, 101, 0.5);
}

.dark .quote-section {
  background: rgba(40, 44, 52, 0.95);
}

.dark .favorite-btn {
  background: rgba(45, 55, 72, 0.95);
  border-color: #4a5568;
  color: #718096;
}

.dark .favorite-btn:hover {
  border-color: #f6d365;
  color: #f6d365;
}

.dark .favorite-btn.favorited {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-color: #f6d365;
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
