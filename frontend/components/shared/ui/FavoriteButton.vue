<script setup lang="ts">
import { ref } from 'vue'
import { useFavoritesStore } from '../../../stores/useFavoritesStore'
import { useAudio } from '@/composables/useAudio'

const props = defineProps<{
  itemType: 'page' | 'panel' | 'feature'
  itemId: string
  displayName: string
  size?: 'small' | 'medium' | 'large'
}>()

const emit = defineEmits<{
  toggle: [favorited: boolean]
}>()

const favoritesStore = useFavoritesStore()
const { playClick, playSuccess } = useAudio()
const isProcessing = ref(false)

const isFavorited = () => favoritesStore.isFavorited(props.itemType, props.itemId)

const toggleFavorite = async () => {
  if (isProcessing.value) return

  isProcessing.value = true
  const wasFavorited = isFavorited()
  const success = await favoritesStore.toggleFavorite(
    props.itemType,
    props.itemId,
    props.displayName
  )

  if (success) {
    emit('toggle', !wasFavorited)
    // Play success sound when favoriting
    playSuccess()
  } else {
    // Play click sound even on failure for feedback
    playClick()
  }

  isProcessing.value = false
}
</script>

<template>
  <button
    class="favorite-button"
    :class="[
      { 'is-favorited': isFavorited() },
      { 'is-processing': isProcessing },
      `size-${size || 'medium'}`
    ]"
    @click="toggleFavorite"
    :aria-label="isFavorited() ? 'Remove from favorites' : 'Add to favorites'"
    :aria-pressed="isFavorited()"
    :disabled="isProcessing"
  >
    <span class="favorite-icon" aria-hidden="true">★</span>
    <span v-if="size === 'large'" class="favorite-text">
      {{ isFavorited() ? 'Favorited' : 'Favorite' }}
    </span>
  </button>
</template>

<style scoped>
.favorite-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.favorite-button:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
  color: #4a5568;
}

.favorite-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.favorite-button.is-favorited {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.favorite-button.is-favorited:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  border-color: #5a67d8;
}

.favorite-button.is-processing {
  opacity: 0.7;
}

.favorite-icon {
  font-size: 16px;
  line-height: 1;
}

.favorite-text {
  font-size: 14px;
}

/* Small size */
.favorite-button.size-small {
  padding: 4px 8px;
  font-size: 12px;
}

.favorite-button.size-small .favorite-icon {
  font-size: 14px;
}

.favorite-button.size-small .favorite-text {
  font-size: 12px;
}

/* Large size */
.favorite-button.size-large {
  padding: 8px 16px;
  font-size: 16px;
}

.favorite-button.size-large .favorite-icon {
  font-size: 18px;
}

.favorite-button.size-large .favorite-text {
  font-size: 16px;
}
</style>
