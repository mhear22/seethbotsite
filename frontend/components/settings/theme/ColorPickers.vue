<script setup lang="ts">
import { useTheme } from '../../../composables/useTheme'

const {
  currentColors,
  updateCustomColor
} = useTheme()

/**
 * Handle color change
 */
const handleColorChange = async (colorKey: keyof typeof currentColors.value, value: string) => {
  await updateCustomColor(colorKey, value)
}
</script>

<template>
  <section class="color-pickers-section">
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
</template>

<style scoped>
.color-pickers-section {
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

/* Responsive */
@media (max-width: 768px) {
  .color-pickers {
    grid-template-columns: 1fr;
  }
}
</style>
