<script setup lang="ts">
import { useTheme } from '../../../composables/useTheme'

interface Preset {
  id: string
  name: string
  description: string
  icon: string
  colors: {
    primary: string
    background: string
    accent: string
  }
}

const {
  settings,
  presets,
  setPreset
} = useTheme()

/**
 * Handle preset selection
 */
const handlePresetSelect = (presetId: string) => {
  setPreset(presetId)
}
</script>

<template>
  <section class="preset-selector">
    <h3 class="section-title">Theme Presets</h3>
    <div class="preset-grid" role="radiogroup" aria-label="Theme presets">
      <button
        v-for="preset in presets"
        :key="preset.id"
        @click="handlePresetSelect(preset.id)"
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
</template>

<style scoped>
.preset-selector {
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

/* Responsive */
@media (max-width: 768px) {
  .preset-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

/* Reduce motion support */
.reduce-motion * {
  animation-duration: 0s !important;
  transition-duration: 0s !important;
}
</style>
