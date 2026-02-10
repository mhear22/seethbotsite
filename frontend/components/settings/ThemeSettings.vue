<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '../../composables/useTheme'
import { useAudio } from '../../composables/useAudio'

const {
  settings,
  currentColors,
  presets,
  setPreset,
  updateCustomColor,
  setCustomColors,
  updateOption,
  isLoading,
  error
} = useTheme()

const {
  playButtonClick,
  playAchievement,
  playSuccess,
  playError,
  playGooseHonk,
  playGameAction,
  playPanelToggle,
  soundVolume,
  updateSoundPreferences
} = useAudio()

const isPreviewing = ref(false)

// Color picker handlers
const handleColorChange = async (colorKey: keyof typeof currentColors.value, value: string) => {
  await updateCustomColor(colorKey, value)
}

// Option toggle handlers
const handleOptionToggle = async (optionKey: 'darkMode' | 'highContrast' | 'reduceMotion' | 'soundsEnabled' | 'notificationSoundsEnabled' | 'musicEnabled', value: boolean) => {
  await updateOption(optionKey, value)
}

// Sound volume handler
const handleVolumeChange = async (volume: number) => {
  await updateOption('soundVolume', volume)
  updateSoundPreferences({ soundVolume: volume })
}

// Sound preview handlers
const previewSound = async (type: string) => {
  if (isPreviewing.value) return

  isPreviewing.value = true
  try {
    switch (type) {
      case 'click':
        playButtonClick()
        break
      case 'achievement':
        playAchievement()
        break
      case 'success':
        playSuccess()
        break
      case 'error':
        playError()
        break
      case 'goose':
        playGooseHonk()
        break
      case 'game':
        playGameAction()
        break
      case 'panel':
        playPanelToggle()
        break
    }
  } finally {
    setTimeout(() => {
      isPreviewing.value = false
    }, 500)
  }
}
</script>

<template>
  <div class="theme-settings">
    <h2 class="settings-title">🎨 Theme Customization</h2>
    <p class="settings-desc">Customize your theme colors and preferences</p>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-indicator">
      <span class="spinner"></span>
      Saving theme preferences...
    </div>

    <!-- Preset Selector -->
    <section class="settings-section">
      <h3 class="section-title">Theme Presets</h3>
      <div class="preset-grid" role="radiogroup" aria-label="Theme presets">
        <button
          v-for="preset in presets"
          :key="preset.id"
          @click="setPreset(preset.id)"
          class="preset-card"
          :class="{ active: settings.currentPreset === preset.id }"
          :aria-label="`Select ${preset.name} theme`"
          :aria-pressed="settings.currentPreset === preset.id"
          role="radio"
        >
          <div class="preset-icon" aria-hidden="true">{{ preset.icon }}</div>
          <div class="preset-name">{{ preset.name }}</div>
          <div class="preset-desc">{{ preset.description }}</div>
          <div class="color-preview">
            <div class="color-dot" :style="{ background: preset.colors.primary }"></div>
            <div class="color-dot" :style="{ background: preset.colors.background }"></div>
            <div class="color-dot" :style="{ background: preset.colors.accent }"></div>
          </div>
          <div v-if="settings.currentPreset === preset.id" class="selected-badge" aria-hidden="true">
            ✓
          </div>
        </button>
      </div>
    </section>

    <!-- Color Pickers -->
    <section class="settings-section">
      <h3 class="section-title">Custom Colors</h3>
      <p class="section-desc">Customize individual colors (overrides preset)</p>

      <div class="color-pickers">
        <div class="color-input-group">
          <label for="color-primary" class="color-label">
            Primary Color
            <input
              id="color-primary"
              type="color"
              :value="currentColors.primary"
              @input="handleColorChange('primary', ($event.target as HTMLInputElement).value)"
              class="color-input"
              aria-label="Primary color picker"
            />
            <span class="color-hex">{{ currentColors.primary }}</span>
          </label>
          <div class="color-swatch" :style="{ background: currentColors.primary }"></div>
        </div>

        <div class="color-input-group">
          <label for="color-background" class="color-label">
            Background
            <input
              id="color-background"
              type="color"
              :value="currentColors.background.startsWith('linear') ? '#ffffff' : currentColors.background"
              @input="handleColorChange('background', ($event.target as HTMLInputElement).value)"
              class="color-input"
              aria-label="Background color picker"
            />
            <span class="color-hex">{{ currentColors.background }}</span>
          </label>
          <div class="color-swatch" :style="{ background: currentColors.background }"></div>
        </div>

        <div class="color-input-group">
          <label for="color-text" class="color-label">
            Text Color
            <input
              id="color-text"
              type="color"
              :value="currentColors.text"
              @input="handleColorChange('text', ($event.target as HTMLInputElement).value)"
              class="color-input"
              aria-label="Text color picker"
            />
            <span class="color-hex">{{ currentColors.text }}</span>
          </label>
          <div class="color-swatch" :style="{ background: currentColors.text }"></div>
        </div>

        <div class="color-input-group">
          <label for="color-accent" class="color-label">
            Accent Color
            <input
              id="color-accent"
              type="color"
              :value="currentColors.accent"
              @input="handleColorChange('accent', ($event.target as HTMLInputElement).value)"
              class="color-input"
              aria-label="Accent color picker"
            />
            <span class="color-hex">{{ currentColors.accent }}</span>
          </label>
          <div class="color-swatch" :style="{ background: currentColors.accent }"></div>
        </div>

        <div class="color-input-group">
          <label for="color-card-bg" class="color-label">
            Card Background
            <input
              id="color-card-bg"
              type="color"
              :value="currentColors.cardBackground.startsWith('rgba') ? '#ffffff' : currentColors.cardBackground"
              @input="handleColorChange('cardBackground', ($event.target as HTMLInputElement).value)"
              class="color-input"
              aria-label="Card background color picker"
            />
            <span class="color-hex">{{ currentColors.cardBackground }}</span>
          </label>
          <div class="color-swatch" :style="{ background: currentColors.cardBackground }"></div>
        </div>
      </div>
    </section>

    <!-- Options Toggles -->
    <section class="settings-section">
      <h3 class="section-title">Display Options</h3>

      <div class="options-list">
        <div class="option-item">
          <label class="option-label">
            <input
              type="checkbox"
              :checked="settings.options.darkMode"
              @change="handleOptionToggle('darkMode', ($event.target as HTMLInputElement).checked)"
              class="option-checkbox"
              aria-label="Toggle dark mode"
            />
            <span class="option-text">
              Dark Mode
              <span class="option-desc">Use darker colors for the theme</span>
            </span>
          </label>
        </div>

        <div class="option-item">
          <label class="option-label">
            <input
              type="checkbox"
              :checked="settings.options.highContrast"
              @change="handleOptionToggle('highContrast', ($event.target as HTMLInputElement).checked)"
              class="option-checkbox"
              aria-label="Toggle high contrast mode"
            />
            <span class="option-text">
              High Contrast
              <span class="option-desc">Increase color contrast for better readability</span>
            </span>
          </label>
        </div>

        <div class="option-item">
          <label class="option-label">
            <input
              type="checkbox"
              :checked="settings.options.reduceMotion"
              @change="handleOptionToggle('reduceMotion', ($event.target as HTMLInputElement).checked)"
              class="option-checkbox"
              aria-label="Toggle reduced motion"
            />
            <span class="option-text">
              Reduce Motion
              <span class="option-desc">Minimize animations for accessibility</span>
            </span>
          </label>
        </div>
      </div>
    </section>

    <!-- Sound Settings -->
    <section class="settings-section">
      <h3 class="section-title">🔊 Sound Settings</h3>
      <p class="section-desc">Configure sound effects and audio preferences</p>

      <div class="options-list">
        <div class="option-item">
          <label class="option-label">
            <input
              type="checkbox"
              :checked="settings.options.soundsEnabled"
              @change="handleOptionToggle('soundsEnabled', ($event.target as HTMLInputElement).checked)"
              class="option-checkbox"
              aria-label="Toggle all sounds"
            />
            <span class="option-text">
              Sound Effects
              <span class="option-desc">Enable click, achievement, and game sounds</span>
            </span>
          </label>
        </div>

        <div class="option-item">
          <label class="option-label">
            <input
              type="checkbox"
              :checked="settings.options.notificationSoundsEnabled"
              @change="handleOptionToggle('notificationSoundsEnabled', ($event.target as HTMLInputElement).checked)"
              class="option-checkbox"
              aria-label="Toggle notification sounds"
            />
            <span class="option-text">
              Notification Sounds
              <span class="option-desc">Play sounds for messages and alerts</span>
            </span>
          </label>
        </div>

        <div class="option-item">
          <label class="option-label">
            <input
              type="checkbox"
              :checked="settings.options.musicEnabled"
              @change="handleOptionToggle('musicEnabled', ($event.target as HTMLInputElement).checked)"
              class="option-checkbox"
              aria-label="Toggle background music"
            />
            <span class="option-text">
              Background Music
              <span class="option-desc">Enable background music playback</span>
            </span>
          </label>
        </div>

        <div class="volume-control">
          <label class="volume-label">
            <span class="volume-text">
              Master Volume
              <span class="volume-value">{{ Math.round((settings.options.soundVolume || 0.5) * 100) }}%</span>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="settings.options.soundVolume || 0.5"
              @input="handleVolumeChange(parseFloat(($event.target as HTMLInputElement).value))"
              class="volume-slider"
              aria-label="Adjust master volume"
            />
          </label>
        </div>
      </div>

      <!-- Sound Preview -->
      <div class="sound-preview-section">
        <h4 class="preview-title">Preview Sounds</h4>
        <div class="preview-buttons">
          <button
            @click="previewSound('click')"
            class="preview-btn"
            :disabled="isPreviewing || !settings.options.soundsEnabled"
            aria-label="Preview button click sound"
          >
            🔘 Click
          </button>
          <button
            @click="previewSound('achievement')"
            class="preview-btn"
            :disabled="isPreviewing || !settings.options.soundsEnabled"
            aria-label="Preview achievement sound"
          >
            🏆 Achievement
          </button>
          <button
            @click="previewSound('success')"
            class="preview-btn"
            :disabled="isPreviewing || !settings.options.soundsEnabled"
            aria-label="Preview success sound"
          >
            ✅ Success
          </button>
          <button
            @click="previewSound('error')"
            class="preview-btn"
            :disabled="isPreviewing || !settings.options.soundsEnabled"
            aria-label="Preview error sound"
          >
            ❌ Error
          </button>
          <button
            @click="previewSound('goose')"
            class="preview-btn"
            :disabled="isPreviewing || !settings.options.soundsEnabled"
            aria-label="Preview goose honk sound"
          >
            🪿 Goose
          </button>
          <button
            @click="previewSound('game')"
            class="preview-btn"
            :disabled="isPreviewing || !settings.options.soundsEnabled"
            aria-label="Preview game action sound"
          >
            🎮 Game
          </button>
          <button
            @click="previewSound('panel')"
            class="preview-btn"
            :disabled="isPreviewing || !settings.options.soundsEnabled"
            aria-label="Preview panel toggle sound"
          >
            📁 Panel
          </button>
        </div>
      </div>
    </section>

    <!-- Live Preview -->
    <section class="settings-section preview-section">
      <h3 class="section-title">Live Preview</h3>
      <div class="preview-card">
        <div class="preview-header" :style="{ background: currentColors.primary }">
          <div class="preview-title">Sample Card</div>
        </div>
        <div class="preview-body" :style="{ background: currentColors.cardBackground }">
          <div class="preview-content" :style="{ color: currentColors.text }">
            <p>This is a preview of how your theme will look.</p>
            <p>The colors shown reflect your current settings.</p>
            <button class="preview-button" :style="{ background: currentColors.accent, color: currentColors.text }">
              Sample Button
            </button>
          </div>
        </div>
        <div class="preview-footer" :style="{ background: currentColors.accent }">
          <span class="preview-text" :style="{ color: currentColors.text }">Accent Color Example</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.theme-settings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--color-primary, #ff6b9d);
}

.settings-desc {
  color: var(--color-text, #666);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c00;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-card-bg, rgba(255, 255, 255, 0.95));
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  color: var(--color-text, #666);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid var(--color-primary, #ff6b9d);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.settings-section {
  background: var(--color-card-bg, rgba(255, 255, 255, 0.95));
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-primary, #ff6b9d);
}

.section-desc {
  color: var(--color-text, #666);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

/* Preset Grid */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.preset-card {
  position: relative;
  background: var(--color-background, linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%));
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.preset-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: var(--color-accent, #ffb6c1);
}

.preset-card.active {
  border-color: var(--color-primary, #ff6b9d);
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.2);
}

.preset-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.preset-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--color-text, #333);
  margin-bottom: 0.25rem;
}

.preset-desc {
  font-size: 0.8rem;
  color: var(--color-text, #666);
  margin-bottom: 0.75rem;
}

.color-preview {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.selected-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--color-primary, #ff6b9d);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

/* Color Pickers */
.color-pickers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.color-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  cursor: pointer;
}

.color-input {
  width: 50px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  background: none;
}

.color-hex {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--color-text, #666);
}

.color-swatch {
  width: 100%;
  height: 60px;
  border-radius: 8px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.color-swatch:hover {
  transform: scale(1.02);
}

/* Options List */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  background: var(--color-background, linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%));
  border-radius: 12px;
  padding: 1rem;
}

.option-label {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
}

.option-checkbox {
  width: 24px;
  height: 24px;
  margin-top: 0.25rem;
  cursor: pointer;
  accent-color: var(--color-primary, #ff6b9d);
}

.option-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-desc {
  font-size: 0.85rem;
  color: var(--color-text, #666);
  font-weight: normal;
}

/* Volume Control */
.volume-control {
  background: var(--color-background, linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%));
  border-radius: 12px;
  padding: 1rem;
}

.volume-label {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
}

.volume-text {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: var(--color-text, #333);
}

.volume-value {
  font-family: 'Courier New', monospace;
  background: var(--color-accent, #ffb6c1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.volume-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--color-accent, #ffb6c1);
  outline: none;
  cursor: pointer;
  appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary, #ff6b9d);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.volume-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary, #ff6b9d);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
}

/* Sound Preview */
.sound-preview-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--color-accent, #ffb6c1);
}

.preview-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-primary, #ff6b9d);
}

.preview-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
}

.preview-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: var(--color-accent, #ffb6c1);
  color: var(--color-text, #333);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.preview-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: var(--color-primary, #ff6b9d);
  color: white;
}

.preview-btn:active:not(:disabled) {
  transform: translateY(0);
}

.preview-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Live Preview */
.preview-section {
  background: var(--color-background, linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%));
}

.preview-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-header {
  padding: 1.5rem;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.preview-body {
  padding: 1.5rem;
}

.preview-content p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.preview-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
}

.preview-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preview-footer {
  padding: 1rem;
  text-align: center;
}

.preview-text {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .theme-settings {
    padding: 1rem;
  }

  .preset-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .color-pickers {
    grid-template-columns: 1fr;
  }

  .settings-title {
    font-size: 1.5rem;
  }
}

/* Reduce motion support */
.reduce-motion * {
  animation-duration: 0s !important;
  transition-duration: 0s !important;
}
</style>
