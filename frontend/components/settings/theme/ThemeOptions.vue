<script setup lang="ts">
import { useTheme } from '../../../composables/useTheme'

const {
  settings,
  updateOption
} = useTheme()

/**
 * Handle option toggle
 */
const handleOptionToggle = async (optionKey: 'darkMode' | 'highContrast' | 'reduceMotion', value: boolean) => {
  await updateOption(optionKey, value)
}
</script>

<template>
  <section class="options-section">
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
</template>

<style scoped>
.options-section {
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
</style>
