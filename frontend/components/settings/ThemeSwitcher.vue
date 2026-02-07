<script setup lang="ts">
import { useTheme } from '../../composables/useTheme'

const { presets, currentPreset, setPreset } = useTheme()
</script>

<template>
  <div class="theme-switcher">
    <h3 class="theme-section-title">🎨 Theme</h3>
    <p class="theme-section-desc">Choose your favorite color theme</p>

    <div class="theme-grid" role="radiogroup" aria-label="Theme selection">
      <button
        v-for="preset in presets"
        :key="preset.id"
        @click="setPreset(preset.id)"
        class="theme-card"
        :class="{ active: currentPreset?.id === preset.id }"
        :aria-label="`Select ${preset.name} theme: ${preset.description}`"
        :aria-pressed="currentPreset?.id === preset.id"
        role="radio"
      >
        <div class="theme-icon" aria-hidden="true">{{ preset.icon }}</div>
        <div class="theme-preview" aria-hidden="true">
          <div class="color-swatch" :style="{ background: preset.colors.primary }"></div>
          <div class="color-swatch" :style="{ background: preset.colors.secondary }"></div>
          <div class="color-swatch" :style="{ background: preset.colors.accent }"></div>
        </div>
        <div class="theme-name">{{ preset.name }}</div>
        <div class="theme-desc">{{ preset.description }}</div>
        <div v-if="currentPreset?.id === preset.id" class="selected-badge" aria-hidden="true">
          ✓ Selected
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.theme-switcher {
  margin-bottom: 2rem;
}

.theme-section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--theme-primary);
}

.theme-section-desc {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 1.5rem;
}

.dark .theme-section-desc {
  color: #a0aec0;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.theme-card {
  position: relative;
  background: var(--theme-card-bg);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: var(--theme-primary);
}

.theme-card.active {
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.2);
}

.theme-icon {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 0.75rem;
}

.theme-preview {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.color-swatch {
  flex: 1;
  height: 24px;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.theme-card:hover .color-swatch {
  transform: scale(1.05);
}

.theme-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--theme-primary);
  margin-bottom: 0.25rem;
  text-align: center;
}

.theme-desc {
  font-size: 0.75rem;
  color: #718096;
  text-align: center;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dark .theme-desc {
  color: #a0aec0;
}

.selected-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--theme-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .theme-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .theme-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .theme-name {
    font-size: 0.9rem;
  }

  .theme-desc {
    font-size: 0.7rem;
  }
}
</style>
