<template>
  <div class="results-screen" :class="resultClass">
    <div class="results-content">
      <!-- Result Header -->
      <h1 class="result-title" :class="resultClass">
        {{ resultTitle }}
      </h1>

      <!-- Match Summary -->
      <div class="match-summary">
        <div class="summary-item">
          <span class="summary-label">Opponent:</span>
          <span class="summary-value">{{ opponentName }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Match Time:</span>
          <span class="summary-value">{{ formattedTime }}</span>
        </div>
      </div>

      <!-- Stats Comparison -->
      <div class="stats-container">
        <div class="stats-column">
          <h3>Your Stats</h3>
          <div class="stat-list">
            <div class="stat-item">
              <span class="stat-label">Damage Dealt:</span>
              <span class="stat-value">{{ yourStats.damageDealt }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Damage Received:</span>
              <span class="stat-value">{{ yourStats.damageReceived }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Shots Fired:</span>
              <span class="stat-value">{{ yourStats.shotsFired }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Shots Hit:</span>
              <span class="stat-value">{{ yourStats.shotsHit }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Accuracy:</span>
              <span class="stat-value">{{ yourAccuracy }}%</span>
            </div>
          </div>
        </div>

        <div class="stats-divider">VS</div>

        <div class="stats-column">
          <h3>Opponent Stats</h3>
          <div class="stat-list">
            <div class="stat-item">
              <span class="stat-label">Damage Dealt:</span>
              <span class="stat-value">{{ opponentStats.damageDealt }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Damage Received:</span>
              <span class="stat-value">{{ opponentStats.damageReceived }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Shots Fired:</span>
              <span class="stat-value">{{ opponentStats.shotsFired }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Shots Hit:</span>
              <span class="stat-value">{{ opponentStats.shotsHit }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Accuracy:</span>
              <span class="stat-value">{{ opponentAccuracy }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="button-group">
        <button @click="$emit('find-another-match')" class="action-btn rematch-btn">
          Find Another Match
        </button>
        <button @click="$emit('return-to-menu')" class="action-btn menu-btn">
          Return to Menu
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface MatchStats {
  damageDealt: number;
  damageReceived: number;
  shotsHit: number;
  shotsFired: number;
  timeSurvived: number;
}

interface Props {
  result: 'victory' | 'defeat';
  opponentName: string;
  matchTime: number; // seconds
  yourStats: MatchStats;
  opponentStats: MatchStats;
}

const props = defineProps<Props>();

defineEmits<{
  'find-another-match': [];
  'return-to-menu': [];
}>();

const resultTitle = computed(() => {
  return props.result === 'victory' ? 'VICTORY!' : 'DEFEAT';
});

const resultClass = computed(() => {
  return props.result === 'victory' ? 'victory' : 'defeat';
});

const formattedTime = computed(() => {
  const minutes = Math.floor(props.matchTime / 60);
  const seconds = Math.floor(props.matchTime % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const yourAccuracy = computed(() => {
  if (props.yourStats.shotsFired === 0) return 0;
  return Math.round((props.yourStats.shotsHit / props.yourStats.shotsFired) * 100);
});

const opponentAccuracy = computed(() => {
  if (props.opponentStats.shotsFired === 0) return 0;
  return Math.round((props.opponentStats.shotsHit / props.opponentStats.shotsFired) * 100);
});
</script>

<style scoped>
.results-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.results-screen.victory {
  background: linear-gradient(135deg, rgba(6, 95, 70, 0.95), rgba(4, 120, 87, 0.95));
}

.results-screen.defeat {
  background: linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(153, 27, 27, 0.95));
}

.results-content {
  max-width: 900px;
  width: 90%;
  text-align: center;
  padding: 40px;
}

/* Result Title */
.result-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 30px;
  text-transform: uppercase;
  animation: titlePulse 2s ease-in-out infinite;
}

.result-title.victory {
  color: #10b981;
  text-shadow: 0 0 40px rgba(16, 185, 129, 0.8);
}

.result-title.defeat {
  color: #ef4444;
  text-shadow: 0 0 40px rgba(239, 68, 68, 0.8);
}

@keyframes titlePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

/* Match Summary */
.match-summary {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  gap: 40px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.summary-label {
  color: #9ca3af;
  font-size: 0.9rem;
}

.summary-value {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
}

/* Stats Comparison */
.stats-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 30px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
}

.stats-column h3 {
  color: #fff;
  font-size: 1.3rem;
  margin-bottom: 20px;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.stat-label {
  color: #cbd5e1;
  font-size: 0.95rem;
}

.stat-value {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
}

.stats-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2rem;
  font-weight: 900;
  opacity: 0.3;
}

/* Action Buttons */
.button-group {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.action-btn {
  padding: 15px 40px;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rematch-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

.rematch-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
}

.menu-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .result-title {
    font-size: 2.5rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stats-divider {
    transform: rotate(90deg);
  }

  .button-group {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
