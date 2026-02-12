<template>
  <div>
    <!-- Header Stats -->
    <div class="fishing-header">
      <h1>🎣 Fishing Mini Game</h1>
      <div class="stats-row">
        <div class="score-display">
          <span class="score-label">Score:</span>
          <span class="score-value">{{ score }}</span>
        </div>
        <div v-if="comboCount > 1" class="combo-display">
          <span class="combo-label">Combo:</span>
          <span class="combo-value">{{ comboCount }}x</span>
          <span class="combo-multiplier">({{ comboMultiplier.toFixed(2) }}x pts)</span>
        </div>
        <div class="max-combo-display">
          <span class="max-combo-label">Max Combo:</span>
          <span class="max-combo-value">{{ maxCombo }}x</span>
        </div>
      </div>
    </div>

    <!-- Waiting Indicator -->
    <div v-if="showWaiting" class="waiting-indicator">
      <div class="waiting-text">Waiting for bite...</div>
      <div class="waiting-spinner">🎣</div>
    </div>

    <!-- Struggle Overlay -->
    <div v-if="isStruggling" class="struggle-overlay">
      <div class="struggle-container">
        <div class="struggle-header">
          <h3>🎣 REEL IT IN!</h3>
          <div class="struggle-timer">
            Time: {{ struggleTimeRemaining.toFixed(1) }}s
          </div>
        </div>

        <div class="struggle-bar-container">
          <div class="struggle-bar">
            <div
              class="struggle-progress"
              :style="{ width: `${struggleProgress}%` }"
            ></div>
            <div class="struggle-target" style="left: 100%"></div>
          </div>
        </div>

        <div class="struggle-instructions">
          <div class="press-counter">
            {{ currentPresses }} / {{ requiredPresses }} presses
          </div>
          <div class="key-hint">
            Press <kbd>SPACE</kbd> rapidly!
          </div>
        </div>

        <div class="fish-strength">
          Fish Strength: {{ fishStrength }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  score: number
  comboCount: number
  comboMultiplier: number
  maxCombo: number
  showWaiting: boolean
  isStruggling: boolean
  struggleProgress: number
  struggleTimeRemaining: number
  currentPresses: number
  requiredPresses: number
  fishStrength: number
}>()
</script>

<style scoped>
.fishing-header {
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.fishing-header h1 {
  margin: 0 0 16px 0;
  color: white;
  font-size: 32px;
  text-align: center;
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.score-display,
.combo-display,
.max-combo-display {
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-label,
.combo-label,
.max-combo-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
}

.score-value,
.combo-value,
.max-combo-value {
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.combo-multiplier {
  color: #fcd34d;
  font-size: 14px;
  font-weight: 600;
}

.waiting-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.waiting-text {
  font-size: 24px;
  font-weight: 700;
  color: #0ea5e9;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.waiting-spinner {
  font-size: 48px;
  animation: bob 1.5s ease-in-out infinite;
}

@keyframes bob {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.struggle-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.struggle-container {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
}

.struggle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.struggle-header h3 {
  margin: 0;
  color: #0ea5e9;
  font-size: 28px;
}

.struggle-timer {
  font-size: 20px;
  font-weight: 700;
  color: #dc2626;
}

.struggle-bar-container {
  margin-bottom: 24px;
}

.struggle-bar {
  position: relative;
  height: 40px;
  background: #e5e7eb;
  border-radius: 20px;
  overflow: hidden;
}

.struggle-progress {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9 0%, #06b6d4 100%);
  transition: width 0.1s;
  border-radius: 20px;
}

.struggle-target {
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  background: #22c55e;
}

.struggle-instructions {
  text-align: center;
  margin-bottom: 16px;
}

.press-counter {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.key-hint {
  font-size: 16px;
  color: #64748b;
}

.key-hint kbd {
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 6px;
  border: 2px solid #cbd5e0;
  font-weight: 700;
  color: #1e293b;
  margin: 0 4px;
}

.fish-strength {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
}

/* Dark mode */
.dark .struggle-container {
  background: #1e293b;
}

.dark .struggle-header h3 {
  color: #38bdf8;
}

.dark .struggle-bar {
  background: #334155;
}

.dark .press-counter {
  color: #f1f5f9;
}

.dark .key-hint {
  color: #cbd5e0;
}

.dark .key-hint kbd {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.dark .fish-strength {
  color: #cbd5e0;
}
</style>
