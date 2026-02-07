<script setup lang="ts">
import { computed } from 'vue'
import { useFavorites } from '../../../composables/useFavorites'

interface Props {
  type: 'cat' | 'ranking' | 'ticket' | 'quote'
  data: any
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const { isFavorite, toggleFavorite } = useFavorites()

const favorited = computed(() => isFavorite(props.type, props.data))

const sizeClasses = {
  small: {
    btn: 'w-8 h-8 text-sm',
    icon: 'text-lg'
  },
  medium: {
    btn: 'w-10 h-10 text-base',
    icon: 'text-xl'
  },
  large: {
    btn: 'w-12 h-12 text-lg',
    icon: 'text-2xl'
  }
}

const handleClick = (e: Event) => {
  e.stopPropagation()
  toggleFavorite(props.type, props.data)
}
</script>

<template>
  <button
    @click="handleClick"
    :class="['favorite-button', sizeClasses[size].btn, { favorited }]"
    :aria-label="favorited ? 'Remove from favorites' : 'Add to favorites'"
    :aria-pressed="favorited"
    :title="favorited ? 'Remove from favorites' : 'Add to favorites'"
  >
    <span :class="['favorite-icon', sizeClasses[size].icon]" aria-hidden="true">⭐</span>
  </button>
</template>

<style scoped>
.favorite-button {
  border-radius: 50%;
  border: 2px solid #cbd5e0;
  background: rgba(255, 255, 255, 0.95);
  color: #cbd5e0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.favorite-button:hover {
  transform: scale(1.1);
  border-color: #f6d365;
  color: #f6d365;
}

.favorite-button.favorited {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-color: #f6d365;
  color: white;
  box-shadow: 0 4px 12px rgba(246, 211, 101, 0.4);
}

.favorite-button.favorited:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(246, 211, 101, 0.5);
}

.dark .favorite-button {
  background: rgba(45, 55, 72, 0.95);
  border-color: #4a5568;
  color: #718096;
}

.dark .favorite-button:hover {
  border-color: #f6d365;
  color: #f6d365;
}

.dark .favorite-button.favorited {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-color: #f6d365;
}

.favorite-icon {
  line-height: 1;
}
</style>
