<script setup lang="ts">
import { computed } from 'vue'
import { useFavorites } from '../../composables/useFavorites'

const props = defineProps<{
  isOpen?: boolean
  catImage: string
  loading?: boolean
  centered?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  'new-cat': []
}>()

const { toggleFavorite, isFavorite } = useFavorites()

const catData = computed(() => ({
  url: props.catImage
}))

const isFavorited = computed(() => isFavorite('cat', catData.value))

const handleFavorite = (e: Event) => {
  e.stopPropagation()
  toggleFavorite('cat', catData.value)
}

const toggle = () => {
  emit('toggle')
}
</script>

<template>
  <div class="cat-panel" :class="{ collapsed: !isOpen, centered }" role="region" aria-label="Random cats panel">
    <div class="cat-header">
      <h3>🐱 Random Cats</h3>
      <button class="cat-close" @click="toggle" v-if="!centered" aria-label="Close cats panel">✕</button>
    </div>
    <div class="cat-content">
      <div v-if="!loading" class="cat-image-wrapper">
        <img :src="catImage" class="cat-image" alt="Random cat photo" />
        <button
          @click="handleFavorite"
          :class="['favorite-btn', { favorited: isFavorited }]"
          :aria-label="isFavorited ? 'Remove this cat from favorites' : 'Add this cat to favorites'"
          :aria-pressed="isFavorited"
        >
          ⭐
        </button>
      </div>
      <div v-if="loading" class="cat-loading" aria-live="polite">Loading... 🐱</div>
      <button
        class="cute-btn"
        @click="$emit('new-cat')"
        :disabled="loading"
        aria-label="Get a new random cat image"
      >🔄 New Cat</button>

      <div class="cat-game-container" role="complementary" aria-label="Virtual Toy Synth game">
        <iframe
          src="https://itch.io/embed-game/3165293"
          width="100%"
          height="500"
          frameborder="0"
          class="cat-game-iframe"
          allowfullscreen
          title="OTS-01 Virtual Toy Synth game"
        ></iframe>
        <div class="cat-game-fallback">
          <a href="https://bellicapelli.itch.io/ots-01" target="_blank" rel="noopener noreferrer" class="cat-game-link">
            🎮 Play OTS-01 (Virtual Toy Synth)
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cat-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.cat-panel.centered {
  width: 100%;
  max-width: 600px;
}

.cat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.cat-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.cat-close {
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.cat-close:hover {
  background: #e0e0e0;
}

.cat-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.cat-image-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.cat-image {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  min-height: 300px;
}

.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #cbd5e0;
  background: rgba(255, 255, 255, 0.95);
  color: #cbd5e0;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.favorite-btn:hover {
  transform: scale(1.1);
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
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(246, 211, 101, 0.5);
}

.cat-loading {
  font-size: 1.2rem;
  color: #666;
  padding: 40px 20px;
  text-align: center;
}

.cute-btn {
  background: linear-gradient(135deg, #ff6b9d, #ff8a80);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.cute-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 157, 0.4);
}

.cute-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cat-game-container {
  width: 100%;
  margin-top: 20px;
}

.cat-game-iframe {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cat-game-fallback {
  text-align: center;
  margin-top: 10px;
}

.cat-game-link {
  color: #ff6b9d;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.cat-game-link:hover {
  color: #ff8a80;
}
</style>
