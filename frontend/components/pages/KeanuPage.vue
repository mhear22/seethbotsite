<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '../../stores/useAppStore'

const appStore = useAppStore()

interface KeanuImage {
  url: string
  loading: boolean
}

const keanuImages = ref<KeanuImage[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const getKeanuImage = () => {
  const width = 700
  const height = 350
  const url = `https://placekeanu.com/${width}/${height}`

  return {
    url,
    loading: true
  }
}

const loadKeanuImages = () => {
  loading.value = true
  error.value = null

  try {
    // Load 6 random Keanu images
    const images = Array.from({ length: 6 }, () => getKeanuImage())
    keanuImages.value = images
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load Keanu images'
    console.error('Error loading Keanu images:', err)
  } finally {
    loading.value = false
  }
}

const refreshImage = (index: number) => {
  keanuImages.value[index] = getKeanuImage()
}

const refreshAllImages = () => {
  loadKeanuImages()
}

onMounted(() => {
  loadKeanuImages()
})
</script>

<template>
  <div class="keanu-page" :class="{ dark: appStore.darkMode }">
    <div class="keanu-header">
      <h1>🥋 Keanu</h1>
      <p class="subtitle">For when you need a little more Keanu in your life</p>
      <button
        @click="refreshAllImages"
        class="refresh-button"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : '🔄 Refresh All' }}
      </button>
    </div>

    <div class="keanu-container">
      <div v-if="loading && keanuImages.length === 0" class="loading-message">
        Loading Keanu images...
      </div>
      <div v-else-if="error" class="error-message">{{ error }}</div>

      <div
        v-for="(keanu, index) in keanuImages"
        :key="index"
        class="keanu-card"
      >
        <div class="keanu-image-wrapper">
          <img
            :src="keanu.url"
            :alt="'Keanu Reeves ' + (index + 1)"
            class="keanu-image"
            @load="keanu.loading = false"
            @error="refreshImage(index)"
          />
          <div v-if="keanu.loading" class="keanu-image-loading">
            Loading Keanu...
          </div>
        </div>

        <button
          @click="refreshImage(index)"
          class="refresh-single-button"
        >
          🔄
        </button>
      </div>
    </div>

    <div class="footer-note">
      <p>🎬 Images provided by <a href="https://placekeanu.com/" target="_blank">PlaceKeanu.com</a></p>
      <p>💡 Click refresh to get new Keanu images!</p>
    </div>
  </div>
</template>

<style scoped>
.keanu-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  transition: background 0.5s ease;
}

.keanu-page.dark {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #5b21b6 100%);
}

.keanu-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.keanu-header h1 {
  font-size: 2.5rem;
  color: #ff6b9d;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #ff6b9d, #ff8a80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 20px 0;
}

.dark .subtitle {
  color: #a0a0a0;
}

.refresh-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.refresh-button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.keanu-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1rem;
  color: #666;
}

.dark .loading-message,
.dark .error-message {
  color: #a0a0a0;
}

.error-message {
  color: #f56565;
}

.dark .error-message {
  color: #fc8181;
}

.keanu-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dark .keanu-card {
  background: rgba(40, 44, 52, 0.95);
}

.keanu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
}

.keanu-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 1;
  background: linear-gradient(135deg, #e0e7ff 0%, #c3dafe 100%);
  border-radius: 15px;
  overflow: hidden;
}

.keanu-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

.keanu-image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-weight: bold;
  font-size: 1rem;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.refresh-single-button {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  align-self: center;
}

.refresh-single-button:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(72, 187, 120, 0.4);
}

.footer-note {
  text-align: center;
  margin-top: 60px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.dark .footer-note {
  background: rgba(40, 44, 52, 0.8);
}

.footer-note p {
  color: #666;
  font-size: 0.9rem;
  margin: 5px 0;
}

.dark .footer-note p {
  color: #a0a0a0;
}

.footer-note a {
  color: #3182ce;
  text-decoration: none;
  font-weight: 600;
}

.footer-note a:hover {
  text-decoration: underline;
}

.dark .footer-note a {
  color: #63b3ed;
}

@media (max-width: 768px) {
  .keanu-header h1 {
    font-size: 2rem;
  }

  .keanu-container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .keanu-card {
    padding: 15px;
  }
}
</style>
