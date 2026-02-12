<template>
  <div class="fishing-stats">
    <div class="stats-panel">
      <div class="stat-item">
        <span class="stat-label">Score:</span>
        <span class="stat-value">{{ score }}</span>
      </div>

      <div class="stat-item combo" v-if="comboCount > 1">
        <span class="stat-label">Combo:</span>
        <span class="stat-value combo-value">
          {{ comboCount }}x
          <span class="multiplier">{{ comboMultiplier.toFixed(1) }}x</span>
        </span>
      </div>

      <div class="stat-item" v-if="maxCombo > 1">
        <span class="stat-label">Max Combo:</span>
        <span class="stat-value">{{ maxCombo }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">Fish Caught:</span>
        <span class="stat-value">{{ caughtFish.length }}</span>
      </div>
    </div>

    <div class="fish-list" v-if="caughtFish.length > 0">
      <div class="fish-list-header">Recent Catches:</div>
      <div class="fish-items">
        <div
          v-for="(fish, index) in recentCatches"
          :key="index"
          class="fish-item"
        >
          {{ fish }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  score: number
  caughtFish: string[]
  comboCount: number
  comboMultiplier: number
  maxCombo: number
}

const props = defineProps<Props>()

const recentCatches = computed(() => {
  return props.caughtFish.slice(-5).reverse()
})
</script>

<style scoped>
.fishing-stats {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 10px;
  min-width: 250px;
  font-family: 'Courier New', monospace;
}

.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
}

.stat-item.combo {
  border: 2px solid #ffd700;
  padding: 8px;
  border-radius: 5px;
  background: rgba(255, 215, 0, 0.1);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.stat-label {
  font-weight: bold;
  color: #aaa;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #4ecdc4;
}

.combo-value {
  color: #ffd700;
}

.multiplier {
  font-size: 14px;
  color: #ff6b6b;
  margin-left: 8px;
}

.fish-list {
  border-top: 1px solid #444;
  padding-top: 15px;
}

.fish-list-header {
  font-weight: bold;
  margin-bottom: 10px;
  color: #4ecdc4;
}

.fish-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fish-item {
  padding: 6px 10px;
  background: rgba(78, 205, 196, 0.1);
  border-left: 3px solid #4ecdc4;
  border-radius: 3px;
  font-size: 14px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .fishing-stats {
    top: 10px;
    right: 10px;
    min-width: 200px;
    padding: 15px;
  }

  .stat-item {
    font-size: 14px;
  }

  .stat-value {
    font-size: 16px;
  }

  .fish-item {
    font-size: 12px;
  }
}
</style>
