<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface BirdSound {
  commonName: string
  sciName: string
  location: string
  mediaUrl: string
  thumbnailUrl: string
  behaviors: string
  rating: string
  speciesCode: string
}

const currentBirdSound = ref<BirdSound | null>(null)
const birdSoundLoading = ref(false)
const birdSoundError = ref<string | null>(null)
const audioPlayer = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const volume = ref(0.3) // Default to 30% volume for relaxing background music

const fetchBirdSound = async () => {
  birdSoundLoading.value = true
  birdSoundError.value = null

  try {
    const response = await fetch('/api/birdsounds/random')
    const data = await response.json()

    if (response.ok) {
      currentBirdSound.value = data
      // Auto-play when a new bird sound is fetched
      if (audioPlayer.value && data.mediaUrl) {
        audioPlayer.value.src = data.mediaUrl
        audioPlayer.value.volume = volume.value
        await audioPlayer.value.play()
        isPlaying.value = true
      }
    } else {
      birdSoundError.value = data.error || 'Failed to fetch bird sound'
      console.error('Bird sounds API error:', data)
    }
  } catch (error) {
    birdSoundError.value = 'Failed to connect to bird sounds API'
    console.error('Error fetching bird sound:', error)
  } finally {
    birdSoundLoading.value = false
  }
}

const togglePlayPause = () => {
  if (!audioPlayer.value || !currentBirdSound.value?.mediaUrl) {
    return
  }

  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  } else {
    audioPlayer.value.play()
    isPlaying.value = true
  }
}

const stopSound = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
    isPlaying.value = false
  }
}

const handleVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  volume.value = parseFloat(target.value)
  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value
  }
}

const handleAudioEnded = () => {
  isPlaying.value = false
  // Auto-fetch next bird sound when current one ends
  setTimeout(() => {
    fetchBirdSound()
  }, 1000)
}

onMounted(() => {
  // Initialize audio player
  if (typeof window !== 'undefined') {
    audioPlayer.value = new Audio()
    audioPlayer.value.addEventListener('ended', handleAudioEnded)
    // Fetch initial bird sound
    fetchBirdSound()
  }
})

onUnmounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.removeEventListener('ended', handleAudioEnded)
    stopSound()
  }
})
</script>

<template>
  <div class="bird-sounds-section">
    <h2>🐦 Relaxing Bird Sounds</h2>
    <p class="bird-sounds-subtitle">Enjoy the calming sounds of nature while viewing the world clocks</p>

    <div v-if="birdSoundLoading && !currentBirdSound" class="bird-sounds-loading">
      <span class="loading-spinner">🐣</span>
      <p>Finding a bird song...</p>
    </div>

    <div v-else-if="birdSoundError" class="bird-sounds-error" role="alert" aria-live="assertive">
      <span class="error-icon" aria-hidden="true">🪹</span>
      <p>{{ birdSoundError }}</p>
      <button class="retry-button" @click="fetchBirdSound">🔄 Try Again</button>
    </div>

    <div v-else-if="currentBirdSound" class="bird-sounds-player">
      <div class="bird-info">
        <h3 class="bird-name">{{ currentBirdSound.commonName }}</h3>
        <p class="bird-scientific"><em>{{ currentBirdSound.sciName }}</em></p>
        <p class="bird-location">📍 {{ currentBirdSound.location }}</p>
        <p class="bird-behavior">🎵 {{ currentBirdSound.behaviors }}</p>
        <p class="bird-rating">⭐ Rating: {{ currentBirdSound.rating }}/5</p>
      </div>

      <div class="bird-controls">
        <div class="control-buttons">
          <button
            class="control-button"
            :class="{ active: isPlaying }"
            @click="togglePlayPause"
            :disabled="!currentBirdSound.mediaUrl"
          >
            {{ isPlaying ? '⏸️ Pause' : '▶️ Play' }}
          </button>

          <button
            class="control-button stop-button"
            @click="stopSound"
          >
            ⏹️ Stop
          </button>

          <button
            class="control-button"
            @click="fetchBirdSound"
            :disabled="birdSoundLoading"
          >
            {{ birdSoundLoading ? '🐣...' : '🎲 Next Bird' }}
          </button>
        </div>

        <div class="volume-control">
          <label for="volume">🔊 Volume:</label>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            v-model.number="volume"
            @input="handleVolumeChange"
            class="volume-slider"
          />
          <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bird-sounds-section {
  max-width: 900px;
  margin: 40px auto 0;
  padding: 25px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.bird-sounds-section h2 {
  text-align: center;
  color: #ff6b9d;
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.bird-sounds-subtitle {
  text-align: center;
  color: #666;
  margin: 0 0 25px 0;
  font-size: 1rem;
  font-style: italic;
}

.bird-sounds-loading,
.bird-sounds-error {
  text-align: center;
  padding: 40px 20px;
}

.bird-sounds-loading .loading-spinner,
.bird-sounds-error .error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.bird-sounds-loading p,
.bird-sounds-error p {
  color: #666;
  font-size: 1.1rem;
  margin: 0 0 15px 0;
}

.retry-button {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 157, 0.3);
}

.bird-sounds-player {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.bird-info {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #fff5f8 0%, #fff 100%);
  border-radius: 15px;
  border: 2px solid #ffb6c1;
}

.bird-name {
  font-size: 1.8rem;
  color: #ff6b9d;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.bird-scientific {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 10px 0;
}

.bird-location,
.bird-behavior,
.bird-rating {
  font-size: 0.95rem;
  color: #555;
  margin: 5px 0;
}

.bird-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.control-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-width: 120px;
}

.control-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.control-button.active {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
}

.control-button.stop-button {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.volume-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.volume-control label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.volume-slider {
  width: 150px;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #ff6b9d;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.volume-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #ff6b9d;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.volume-value {
  font-weight: bold;
  color: #ff6b9d;
  min-width: 45px;
  text-align: right;
}

@media (max-width: 768px) {
  .bird-sounds-section {
    margin: 30px 10px 0;
    padding: 20px 15px;
  }

  .bird-sounds-player {
    gap: 20px;
  }

  .bird-info {
    padding: 15px;
  }

  .bird-name {
    font-size: 1.5rem;
  }

  .bird-scientific {
    font-size: 1rem;
  }

  .control-buttons {
    gap: 10px;
  }

  .control-button {
    padding: 12px 20px;
    font-size: 0.9rem;
    min-width: 100px;
  }

  .volume-control {
    padding: 12px;
  }

  .volume-slider {
    width: 120px;
  }
}

.dark .bird-sounds-section {
  background: rgba(40, 44, 52, 0.95);
}

.dark .bird-sounds-subtitle {
  color: #a0a0a0;
}

.dark .bird-sounds-loading p,
.dark .bird-sounds-error p {
  color: #a0a0a0;
}

.dark .bird-info {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(40, 44, 52, 1) 100%);
  border-color: rgba(255, 182, 193, 0.3);
}

.dark .bird-name {
  color: #ffb6c1;
}

.dark .bird-scientific {
  color: #999;
}

.dark .bird-location,
.dark .bird-behavior,
.dark .bird-rating {
  color: #a0a0a0;
}

.dark .volume-control {
  background: rgba(0, 0, 0, 0.2);
}

.dark .volume-control label {
  color: #e2e8f0;
}

.dark .volume-value {
  color: #ffb6c1;
}
</style>
