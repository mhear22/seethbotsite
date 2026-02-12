<script setup lang="ts">
import { useTheme } from '../../composables/useTheme'
import { useAudio } from '../../composables/useAudio'
import PresetSelector from './theme/PresetSelector.vue'
import ColorPickers from './theme/ColorPickers.vue'
import ThemeOptions from './theme/ThemeOptions.vue'

const {
  settings,
  currentColors,
  isLoading,
  error
} = useTheme()

const {
  muted,
  volume,
  categoryToggles,
  muteAll,
  unmuteAll,
  playHonk,
  previewClickSound,
  previewNotificationSound,
  previewAchievementSound,
  previewUISound
} = useAudio()

const previewHonkSound = () => {
  playHonk()
}

// Sound settings handlers
const handleVolumeChange = (value: number) => {
  volume.value = value
}

const handleMuteToggle = () => {
  if (muted.value) {
    unmuteAll()
  } else {
    muteAll()
  }
}

const handleCategoryToggle = (category: keyof typeof categoryToggles.value) => {
  categoryToggles.value[category] = !categoryToggles.value[category]
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
    <PresetSelector />

    <!-- Color Pickers -->
    <ColorPickers />

    <!-- Options Toggles -->
    <ThemeOptions />

    <!-- Sound Settings -->
    <section class="settings-section">
      <h3 class="section-title">🔊 Sound Settings</h3>
      <p class="section-desc">Customize your sound preferences</p>

      <!-- Master Volume -->
      <div class="volume-control">
        <label for="volume-slider" class="volume-label">
          Master Volume
          <span class="volume-value">{{ volume }}%</span>
        </label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="100"
          :value="volume"
          @input="handleVolumeChange(Number(($event.target as HTMLInputElement).value))"
          class="volume-slider"
          aria-label="Master volume"
          :disabled="muted"
        />
      </div>

      <!-- Mute All Toggle -->
      <div class="mute-toggle">
        <label class="option-label">
          <input
            type="checkbox"
            :checked="muted"
            @change="handleMuteToggle"
            class="option-checkbox"
            aria-label="Mute all sounds"
          />
          <span class="option-text">
            Mute All Sounds
            <span class="option-desc">Disable all audio in the app</span>
          </span>
        </label>
      </div>

      <!-- Sound Categories -->
      <div class="sound-categories">
        <h4 class="categories-title">Sound Categories</h4>

        <div class="category-item">
          <label class="category-label">
            <input
              type="checkbox"
              :checked="categoryToggles.click"
              @change="handleCategoryToggle('click')"
              class="category-checkbox"
              aria-label="Toggle click sounds"
              :disabled="muted"
            />
            <span class="category-text">
              Click Sounds
              <span class="category-desc">Button clicks, game actions</span>
            </span>
          </label>
          <button
            @click="previewClickSound"
            class="preview-btn"
            :disabled="muted || !categoryToggles.click"
            aria-label="Preview click sound"
          >
            🔊 Preview
          </button>
        </div>

        <div class="category-item">
          <label class="category-label">
            <input
              type="checkbox"
              :checked="categoryToggles.notification"
              @change="handleCategoryToggle('notification')"
              class="category-checkbox"
              aria-label="Toggle notification sounds"
              :disabled="muted"
            />
            <span class="category-text">
              Notification Sounds
              <span class="category-desc">Success, errors, purchases</span>
            </span>
          </label>
          <button
            @click="previewNotificationSound"
            class="preview-btn"
            :disabled="muted || !categoryToggles.notification"
            aria-label="Preview notification sound"
          >
            🔊 Preview
          </button>
        </div>

        <div class="category-item">
          <label class="category-label">
            <input
              type="checkbox"
              :checked="categoryToggles.achievement"
              @change="handleCategoryToggle('achievement')"
              class="category-checkbox"
              aria-label="Toggle achievement sounds"
              :disabled="muted"
            />
            <span class="category-text">
              Achievement Sounds
              <span class="category-desc">Level ups, milestones, unlocks</span>
            </span>
          </label>
          <button
            @click="previewAchievementSound"
            class="preview-btn"
            :disabled="muted || !categoryToggles.achievement"
            aria-label="Preview achievement sound"
          >
            🔊 Preview
          </button>
        </div>

        <div class="category-item">
          <label class="category-label">
            <input
              type="checkbox"
              :checked="categoryToggles.ui"
              @change="handleCategoryToggle('ui')"
              class="category-checkbox"
              aria-label="Toggle UI sounds"
              :disabled="muted"
            />
            <span class="category-text">
              UI Sounds
              <span class="category-desc">Panel toggles, menu sounds</span>
            </span>
          </label>
          <button
            @click="previewUISound"
            class="preview-btn"
            :disabled="muted || !categoryToggles.ui"
            aria-label="Preview UI sound"
          >
            🔊 Preview
          </button>
        </div>

        <div class="category-item">
          <label class="category-label">
            <input
              type="checkbox"
              :checked="categoryToggles.goose"
              @change="handleCategoryToggle('goose')"
              class="category-checkbox"
              aria-label="Toggle goose honk sounds"
              :disabled="muted"
            />
            <span class="category-text">
              Goose Honk Sounds
              <span class="category-desc">Fun goose effects</span>
            </span>
          </label>
          <button
            @click="previewHonkSound"
            class="preview-btn"
            :disabled="muted || !categoryToggles.goose"
            aria-label="Preview goose honk sound"
          >
            🔊 Preview
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

/* Sound Settings */
.volume-control {
  background: var(--color-background, linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%));
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.volume-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 1rem;
}

.volume-value {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  color: var(--color-primary, #ff6b9d);
  font-weight: 700;
}

.volume-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  appearance: none;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary, #ff6b9d);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.volume-slider::-webkit-slider-thumb:active {
  transform: scale(1.2);
}

.volume-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mute-toggle {
  background: var(--color-background, linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%));
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
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

.sound-categories {
  margin-top: 1.5rem;
}

.categories-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text, #333);
}

.category-item {
  background: var(--color-background, linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%));
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.category-label {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
  flex: 1;
}

.category-checkbox {
  width: 20px;
  height: 20px;
  margin-top: 0.25rem;
  cursor: pointer;
  accent-color: var(--color-primary, #ff6b9d);
}

.category-checkbox:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.category-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.category-desc {
  font-size: 0.85rem;
  color: var(--color-text, #666);
  font-weight: normal;
}

.preview-btn {
  padding: 0.5rem 1rem;
  background: var(--color-primary, #ff6b9d);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: var(--color-accent, #ffb6c1);
}

.preview-btn:active:not(:disabled) {
  transform: translateY(0);
}

.preview-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-text, #999);
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
