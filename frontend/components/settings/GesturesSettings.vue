<script setup lang="ts">
import { useSwipeGestures } from '../../composables/useSwipeGestures'

const swipeGestures = useSwipeGestures()
const { settings, updateSettings } = swipeGestures

// Toggle enable/disable
const handleEnabledToggle = (enabled: boolean) => {
  updateSettings({ enabled })
}

// Update sensitivity
const handleSensitivityChange = (sensitivity: number) => {
  updateSettings({ sensitivity })
}

// Toggle haptic feedback
const handleHapticToggle = (hapticFeedback: boolean) => {
  updateSettings({ hapticFeedback })
}

// Toggle visual feedback
const handleVisualToggle = (visualFeedback: boolean) => {
  updateSettings({ visualFeedback })
}
</script>

<template>
  <div class="gestures-settings">
    <h2 class="settings-title">👆 Swipe Gestures</h2>
    <p class="settings-desc">Configure mobile swipe gestures for navigation</p>

    <!-- Enable/Disable Gestures -->
    <section class="settings-section">
      <h3 class="section-title">General Settings</h3>

      <div class="option-item">
        <label class="option-label">
          <input
            type="checkbox"
            :checked="settings.enabled"
            @change="handleEnabledToggle(($event.target as HTMLInputElement).checked)"
            class="option-checkbox"
            aria-label="Enable swipe gestures"
          />
          <span class="option-text">
            Enable Swipe Gestures
            <span class="option-desc">Allow swipe navigation on touch devices</span>
          </span>
        </label>
      </div>
    </section>

    <!-- Sensitivity Slider -->
    <section class="settings-section">
      <h3 class="section-title">Sensitivity</h3>
      <p class="section-desc">Adjust the minimum distance required to trigger a swipe</p>

      <div class="sensitivity-control">
        <div class="sensitivity-header">
          <span class="sensitivity-label">Swipe Distance: {{ settings.sensitivity }}px</span>
        </div>
        <input
          type="range"
          :min="20"
          :max="150"
          :step="10"
          :value="settings.sensitivity"
          @input="handleSensitivityChange(parseInt(($event.target as HTMLInputElement).value))"
          class="sensitivity-slider"
          aria-label="Swipe sensitivity"
          :disabled="!settings.enabled"
        />
        <div class="sensitivity-labels">
          <span class="label-min">More Sensitive (20px)</span>
          <span class="label-max">Less Sensitive (150px)</span>
        </div>
      </div>
    </section>

    <!-- Feedback Options -->
    <section class="settings-section">
      <h3 class="section-title">Feedback Options</h3>

      <div class="options-list">
        <div class="option-item">
          <label class="option-label">
            <input
              type="checkbox"
              :checked="settings.hapticFeedback"
              @change="handleHapticToggle(($event.target as HTMLInputElement).checked)"
              class="option-checkbox"
              aria-label="Enable haptic feedback"
              :disabled="!settings.enabled"
            />
            <span class="option-text">
              Haptic Feedback
              <span class="option-desc">Vibrate when swipe is detected (on supported devices)</span>
            </span>
          </label>
        </div>

        <div class="option-item">
          <label class="option-label">
            <input
              type="checkbox"
              :checked="settings.visualFeedback"
              @change="handleVisualToggle(($event.target as HTMLInputElement).checked)"
              class="option-checkbox"
              aria-label="Enable visual feedback"
              :disabled="!settings.enabled"
            />
            <span class="option-text">
              Visual Feedback
              <span class="option-desc">Show visual indicator during swipe gesture</span>
            </span>
          </label>
        </div>
      </div>
    </section>

    <!-- Gesture Reference -->
    <section class="settings-section">
      <h3 class="section-title">Gesture Reference</h3>
      <p class="section-desc">Learn the available swipe gestures</p>

      <div class="gesture-reference">
        <div class="gesture-item">
          <div class="gesture-icon swipe-left">
            <span class="arrow">←</span>
          </div>
          <div class="gesture-info">
            <strong>Swipe Left</strong>
            <span class="gesture-desc">Navigate to next page</span>
          </div>
        </div>

        <div class="gesture-item">
          <div class="gesture-icon swipe-right">
            <span class="arrow">→</span>
          </div>
          <div class="gesture-info">
            <strong>Swipe Right</strong>
            <span class="gesture-desc">Navigate to previous page</span>
          </div>
        </div>

        <div class="gesture-item">
          <div class="gesture-icon swipe-up">
            <span class="arrow">↑</span>
          </div>
          <div class="gesture-info">
            <strong>Swipe Up</strong>
            <span class="gesture-desc">Open next panel</span>
          </div>
        </div>

        <div class="gesture-item">
          <div class="gesture-icon swipe-down">
            <span class="arrow">↓</span>
          </div>
          <div class="gesture-info">
            <strong>Swipe Down</strong>
            <span class="gesture-desc">Close current panel</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Device Support Notice -->
    <section class="settings-section info-section">
      <div class="info-banner">
        <span class="info-icon">ℹ️</span>
        <div class="info-content">
          <strong>Touch Device Required</strong>
          <span class="info-desc">
            Swipe gestures are designed for touch devices (mobile, tablet). On desktop,
            consider using keyboard shortcuts instead.
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.gestures-settings {
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

/* Options */
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

.option-checkbox:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Sensitivity Slider */
.sensitivity-control {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sensitivity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sensitivity-label {
  font-weight: 600;
  color: var(--color-text, #333);
  font-size: 1.1rem;
}

.sensitivity-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-primary, #ff6b9d) 0%, var(--color-accent, #ffb6c1) 100%);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.sensitivity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: 2px solid var(--color-primary, #ff6b9d);
  transition: transform 0.2s ease;
}

.sensitivity-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.sensitivity-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: 2px solid var(--color-primary, #ff6b9d);
  transition: transform 0.2s ease;
}

.sensitivity-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sensitivity-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text, #666);
}

/* Gesture Reference */
.gesture-reference {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.gesture-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--color-background, linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%));
  border-radius: 12px;
  padding: 1rem;
}

.gesture-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--color-primary, #ff6b9d);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.arrow {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
}

.gesture-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.gesture-info strong {
  color: var(--color-text, #333);
  font-size: 1rem;
}

.gesture-desc {
  font-size: 0.85rem;
  color: var(--color-text, #666);
}

/* Info Banner */
.info-section {
  background: var(--color-background, linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%));
}

.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 107, 157, 0.1);
  border-radius: 12px;
  border-left: 4px solid var(--color-primary, #ff6b9d);
}

.info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-content strong {
  color: var(--color-text, #333);
}

.info-desc {
  font-size: 0.9rem;
  color: var(--color-text, #666);
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .gestures-settings {
    padding: 1rem;
  }

  .settings-title {
    font-size: 1.5rem;
  }

  .gesture-reference {
    grid-template-columns: 1fr;
  }

  .sensitivity-labels {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
