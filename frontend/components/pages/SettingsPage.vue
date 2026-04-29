<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import { useAudio } from '../../composables/useAudio'
import ThemeSwitcher from '../settings/ThemeSwitcher.vue'
import ThemeSettings from '../settings/ThemeSettings.vue'
import SyncSettings from '../settings/SyncSettings.vue'
import DiscordSettings from '../settings/DiscordSettings.vue'
import AccessibilitySettings from '../settings/AccessibilitySettings.vue'
import LanguageSettings from '../settings/LanguageSettings.vue'
import VolumeSlider from '../settings/VolumeSlider.vue'

const appStore = useAppStore()
const audio = useAudio()

// Volume settings (uses useAudio composable)
const volume = ref(audio.volume.value)

// Watch for volume changes in useAudio and update local ref
watch(() => audio.volume.value, (newVolume) => {
  volume.value = newVolume
})

// Update audio when slider changes
watch(volume, (newVolume) => {
  audio.setVolume(newVolume)
  // Update all currently playing audio elements
  const audioIds = ['newMusic', 'fartSound', 'buttonSound', 'gooseHonk']
  audioIds.forEach(id => {
    const el = document.getElementById(id) as HTMLAudioElement
    if (el) el.volume = newVolume
  })
})

// Mold settings (local, not yet in store)
const moldGrowthRate = ref(parseFloat(localStorage.getItem('moldGrowthRate') || '1'))
const maxMoldCircles = ref(parseInt(localStorage.getItem('maxMoldCircles') || '27'))
const moldSpawnRate = ref(parseInt(localStorage.getItem('moldSpawnRate') || '15'))
const showMold = ref(localStorage.getItem('showMold') !== 'false')
const swipeEnabled = ref(localStorage.getItem('swipeEnabled') === 'true')
const settingsSaved = ref(false)

// Persist heart settings to localStorage when store values change
watch([() => appStore.showHearts, () => appStore.maxHearts, () => appStore.heartSpawnRate], () => {
  localStorage.setItem('showHearts', appStore.showHearts.toString())
  localStorage.setItem('maxHearts', appStore.maxHearts.toString())
  localStorage.setItem('heartSpawnRate', appStore.heartSpawnRate.toString())
})

// Save all settings to localStorage
const saveSettings = () => {
  localStorage.setItem('maxHearts', appStore.maxHearts.toString())
  localStorage.setItem('heartSpawnRate', appStore.heartSpawnRate.toString())
  localStorage.setItem('showHearts', appStore.showHearts.toString())
  localStorage.setItem('moldGrowthRate', moldGrowthRate.value.toString())
  localStorage.setItem('maxMoldCircles', maxMoldCircles.value.toString())
  localStorage.setItem('moldSpawnRate', moldSpawnRate.value.toString())
  localStorage.setItem('showMold', showMold.value.toString())

  localStorage.setItem('swipeEnabled', swipeEnabled.value.toString())

  settingsSaved.value = true
  settingsSaved.value = true
  setTimeout(() => {
    settingsSaved.value = false
  }, 2000)
}

// Reset to defaults
const resetToDefaults = () => {
  appStore.maxHearts = 20
  appStore.heartSpawnRate = 125
  appStore.showHearts = true
  moldGrowthRate.value = 1
  maxMoldCircles.value = 27
  moldSpawnRate.value = 15
  showMold.value = true
  swipeEnabled.value = true
  saveSettings()
}
</script>

<template>
  <div class="settings-page">
    <div class="settings-container">
      <h1 class="settings-title">⚙️ Settings</h1>

      <div class="settings-section">
        <ThemeSettings />
      </div>

      <div class="settings-section">
        <ThemeSwitcher />
      </div>

      <div class="settings-section">
        <h2 class="section-title">🔊 Volume Control</h2>

        <div class="setting-item volume-setting">
          <label class="setting-label">
            <span class="label-text">Master Volume</span>
            <span class="label-desc">Adjust volume for all sounds and music</span>
          </label>
        </div>

        <VolumeSlider v-model="volume" />

        <div class="setting-item">
          <label class="setting-label">
            <span class="label-text">Mute All</span>
            <span class="label-desc">Toggle all sounds on/off</span>
          </label>
          <button
            @click="appStore.toggleMute"
            class="toggle-btn"
            :class="{ active: appStore.isMuted }"
          >
            {{ appStore.isMuted ? '🔴 Muted' : '🟢 Sound On' }}
          </button>
        </div>
      </div>

      <div class="settings-section">
        <SyncSettings />
      </div>

      <div class="settings-section">
        <DiscordSettings />
      </div>

      <div class="settings-section">
        <AccessibilitySettings />
      </div>

      <div class="settings-section">
        <LanguageSettings />
      </div>

      <div class="settings-section">
        <h2 class="section-title">💖 Hearts & Eggs</h2>
      </div>

      <div class="settings-section">
        <h2 class="section-title">🔊 Volume Control</h2>

        <div class="setting-item volume-setting">
          <label class="setting-label">
            <span class="label-text">Master Volume</span>
            <span class="label-desc">Adjust the volume for all sounds and music</span>
          </label>
        </div>

        <VolumeSlider v-model="volume" />

        <div class="setting-item">
          <label class="setting-label">
            <span class="label-text">Mute All</span>
            <span class="label-desc">Toggle all sounds on/off</span>
          </label>
          <button
            @click="appStore.toggleMute"
            class="toggle-btn"
            :class="{ active: appStore.isMuted }"
          >
            {{ appStore.isMuted ? '🔴 Muted' : '🟢 Sound On' }}
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">💖 Hearts & Eggs</h2>

        <div class="setting-item">
          <label class="setting-label">
            <span class="label-text">Show Hearts</span>
            <span class="label-desc">Enable falling hearts on the site</span>
          </label>
          <button
            @click="appStore.showHearts = !appStore.showHearts"
            class="toggle-btn"
            :class="{ active: appStore.showHearts }"
          >
            {{ appStore.showHearts ? '🟢 On' : '🔴 Off' }}
          </button>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <span class="label-text">Max Hearts</span>
            <span class="label-desc">Maximum number of hearts on screen ({{ appStore.maxHearts }})</span>
          </label>
          <div class="range-container">
            <input
              type="range"
              v-model.number="appStore.maxHearts"
              min="5"
              max="100"
              step="1"
              class="range-input"
            />
            <span class="range-value">{{ appStore.maxHearts }}</span>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <span class="label-text">Spawn Rate</span>
            <span class="label-desc">How fast hearts spawn ({{ appStore.heartSpawnRate }}ms)</span>
          </label>
          <div class="range-container">
            <input
              type="range"
              v-model.number="appStore.heartSpawnRate"
              min="50"
              max="1000"
              step="25"
              class="range-input"
            />
            <span class="range-value">{{ appStore.heartSpawnRate }}ms</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">🍄 Mold Effects</h2>

        <div class="setting-item">
          <label class="setting-label">
            <span class="label-text">Show Mold</span>
            <span class="label-desc">Enable mold circle effects</span>
          </label>
          <button
            @click="showMold = !showMold"
            class="toggle-btn"
            :class="{ active: showMold }"
          >
            {{ showMold ? '🟢 On' : '🔴 Off' }}
          </button>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <span class="label-text">Max Mold Circles</span>
            <span class="label-desc">Maximum number of mold circles ({{ maxMoldCircles }})</span>
          </label>
          <div class="range-container">
            <input
              type="range"
              v-model.number="maxMoldCircles"
              min="5"
              max="50"
              step="1"
              class="range-input"
            />
            <span class="range-value">{{ maxMoldCircles }}</span>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <span class="label-text">Mold Growth Rate</span>
            <span class="label-desc">How fast mold grows ({{ moldGrowthRate }}x)</span>
          </label>
          <div class="range-container">
            <input
              type="range"
              v-model.number="moldGrowthRate"
              min="0.2"
              max="3"
              step="0.1"
              class="range-input"
            />
            <span class="range-value">{{ moldGrowthRate }}x</span>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <span class="label-text">Spawn Rate</span>
            <span class="label-desc">Delay between mold spawns ({{ moldSpawnRate }}s)</span>
          </label>
          <div class="range-container">
            <input
              type="range"
              v-model.number="moldSpawnRate"
              min="5"
              max="30"
              step="1"
              class="range-input"
            />
            <span class="range-value">{{ moldSpawnRate }}s</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">📱 Navigation</h2>

        <div class="setting-item">
          <label class="setting-label">
            <span class="label-text">Swipe Navigation</span>
            <span class="label-desc">Swipe left/right to navigate between pages on mobile</span>
          </label>
          <button
            @click="swipeEnabled = !swipeEnabled; localStorage.setItem('swipeEnabled', swipeEnabled.toString())"
            class="toggle-btn"
            :class="{ active: swipeEnabled }"
          >
            {{ swipeEnabled ? '🟢 On' : '🔴 Off' }}
          </button>
        </div>
      </div>

      <div class="settings-actions">
        <button @click="saveSettings" class="save-btn">
          💾 Save Settings
        </button>
        <button @click="resetToDefaults" class="reset-btn">
          🔄 Reset to Defaults
        </button>
      </div>

      <div v-if="settingsSaved" class="saved-message">
        ✅ Settings saved successfully!
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding: 100px 20px 85px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
}

.dark .settings-page {
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

.settings-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 50%, #ffb6c1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .settings-title {
  background: linear-gradient(135deg, #ffb6c1 0%, #ff91a4 50%, #e85e90 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark .settings-section {
  background: rgba(40, 44, 52, 0.95);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #ff6b9d;
}

.dark .section-title {
  color: #ffb6c1;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 182, 193, 0.1);
}

.dark .setting-item {
  border-bottom-color: rgba(255, 182, 193, 0.08);
}

.setting-item:last-child {
  border-bottom: none;
}

.volume-setting {
  padding-bottom: 0;
}

.setting-label {
  flex: 1;
  padding-right: 2rem;
}

.label-text {
  display: block;
  font-weight: 600;
  font-size: 1rem;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.dark .label-text {
  color: #e2e8f0;
}

.label-desc {
  display: block;
  font-size: 0.85rem;
  color: #718096;
}

.dark .label-desc {
  color: #a0aec0;
}

.toggle-btn {
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #2d3748;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark .toggle-btn {
  border-color: #4a5568;
  background: #2d3748;
  color: #e2e8f0;
}

.toggle-btn:hover {
  border-color: #ff6b9d;
  color: #ff6b9d;
}

.toggle-btn.active {
  background: #48bb78;
  border-color: #48bb78;
  color: white;
}

.range-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 200px;
}

.range-input {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
}

.dark .range-input {
  background: #4a5568;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ff6b9d;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.range-value {
  min-width: 60px;
  text-align: right;
  font-weight: 600;
  color: #ff6b9d;
}

.dark .range-value {
  color: #ffb6c1;
}

.settings-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.save-btn {
  flex: 1;
  padding: 1rem 2rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.reset-btn {
  flex: 1;
  padding: 1rem 2rem;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: #e53e3e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);
}

.saved-message {
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
  background: #48bb78;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .settings-page {
    padding: 80px 15px 85px;
  }

  .settings-title {
    font-size: 2rem;
  }

  .settings-section {
    padding: 1.5rem;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .setting-label {
    padding-right: 0;
  }

  .range-container {
    width: 100%;
  }

  .settings-actions {
    flex-direction: column;
  }
}
</style>
