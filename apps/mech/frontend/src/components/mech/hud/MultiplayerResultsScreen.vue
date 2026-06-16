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
  backdrop-filter: var(--mech-blur);
  font-family: var(--mech-font);
}

.results-screen.victory {
  background: linear-gradient(135deg, rgba(4, 47, 42, 0.95), rgba(6, 78, 59, 0.95));
}

.results-screen.defeat {
  background: linear-gradient(135deg, rgba(42, 13, 13, 0.95), rgba(76, 20, 20, 0.95));
}

.results-content {
  max-width: 900px;
  width: 90%;
  text-align: center;
  padding: var(--mech-space-7);
}

/* Result Title */
.result-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: var(--mech-space-6);
  text-transform: uppercase;
  letter-spacing: var(--mech-tracking-wide);
  animation: titlePulse 2s ease-in-out infinite;
}

.result-title.victory {
  color: var(--mech-success);
  text-shadow: 0 0 40px var(--mech-success-glow);
}

.result-title.defeat {
  color: var(--mech-danger);
  text-shadow: 0 0 40px var(--mech-danger-glow);
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
  background: var(--mech-surface);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-md);
  padding: var(--mech-space-5);
  margin-bottom: var(--mech-space-6);
  display: flex;
  justify-content: center;
  gap: var(--mech-space-7);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: var(--mech-space-1);
}

.summary-label {
  color: var(--mech-text-dim);
  font-size: 0.9rem;
}

.summary-value {
  color: var(--mech-text);
  font-size: 1.2rem;
  font-weight: 700;
}

/* Stats Comparison */
.stats-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--mech-space-6);
  background: var(--mech-surface);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-md);
  padding: var(--mech-space-6);
  margin-bottom: var(--mech-space-6);
}

.stats-column h3 {
  color: var(--mech-text);
  font-size: 1.3rem;
  margin-bottom: var(--mech-space-5);
  letter-spacing: var(--mech-tracking-wide);
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: var(--mech-space-3);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: var(--mech-space-3);
  background: var(--mech-surface-2);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-sm);
}

.stat-label {
  color: var(--mech-text-dim);
  font-size: 0.95rem;
}

.stat-value {
  color: var(--mech-text);
  font-size: 1.1rem;
  font-weight: 700;
}

.stats-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mech-text);
  font-size: 2rem;
  font-weight: 900;
  opacity: 0.35;
}

/* Action Buttons */
.button-group {
  display: flex;
  gap: var(--mech-space-4);
  justify-content: center;
}

.action-btn {
  padding: 15px 40px;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: var(--mech-tracking-wide);
  border: none;
  border-radius: var(--mech-radius-md);
  cursor: pointer;
  transition: all var(--mech-transition);
}

.action-btn:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 3px;
}

.rematch-btn {
  background: var(--mech-accent-grad);
  color: #fff;
}

.rematch-btn:hover {
  box-shadow: 0 8px 24px var(--mech-accent-glow);
  transform: translateY(-2px);
}

.menu-btn {
  background: var(--mech-surface-raised);
  color: var(--mech-text);
  border: 1px solid var(--mech-border-strong);
}

.menu-btn:hover {
  border-color: var(--mech-border-accent);
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
