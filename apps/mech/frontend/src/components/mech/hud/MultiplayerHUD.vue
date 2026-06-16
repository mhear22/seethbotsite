<template>
  <div class="multiplayer-hud">
    <!-- Survival wave + score banner (co-op survival only; absent in PvP) -->
    <div v-if="survivalActive" class="survival-banner">
      <div class="survival-wave">WAVE {{ wave }}</div>
      <div class="survival-score">SCORE {{ score }}</div>
      <div v-if="bestWave > 0" class="survival-best">BEST WAVE {{ bestWave }}</div>
    </div>

    <!-- Between-waves: WAVE CLEARED / repairing indicator (survival only) -->
    <div v-if="survivalActive && betweenWaves" class="wave-transition">
      <h2>WAVE {{ wave }} CLEARED</h2>
      <p>Repairing… next wave incoming</p>
    </div>

    <!-- Network Status -->
    <div class="network-status" :class="statusClass">
      <div class="status-indicator">
        <span class="status-dot" :class="statusClass"></span>
        <span class="status-text">{{ statusText }}</span>
      </div>

      <div class="latency-display" :class="latencyClass">
        <span class="latency-icon">📡</span>
        <span class="latency-value">{{ latency }}ms</span>
      </div>
    </div>

    <!-- Match Timer -->
    <div class="match-timer" v-if="matchTime > 0">
      <span class="timer-icon">⏱️</span>
      <span class="timer-value">{{ formattedTime }}</span>
    </div>

    <!-- Opponent Info -->
    <div class="opponent-info" v-if="opponentName">
      <div class="opponent-label">VS</div>
      <div class="opponent-name">{{ opponentName }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  latency: number; // Round-trip time in ms
  matchTime?: number; // Match time in seconds
  opponentName?: string;
  // --- Co-op survival (optional; all absent/false in PvP) ---------------
  /** Whether this is a survival match (shows the wave/score banner). */
  survivalActive?: boolean;
  /** Current survival wave (1-based). */
  wave?: number;
  /** Running survival score. */
  score?: number;
  /** Best survival wave reached (persisted). */
  bestWave?: number;
  /** True during the between-wave repair/staging interval. */
  betweenWaves?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  matchTime: 0,
  opponentName: '',
  survivalActive: false,
  wave: 1,
  score: 0,
  bestWave: 0,
  betweenWaves: false
});

const statusText = computed(() => {
  switch (props.connectionStatus) {
    case 'connected':
      return 'Connected';
    case 'connecting':
      return 'Connecting...';
    case 'disconnected':
      return 'Disconnected';
    case 'error':
      return 'Connection Error';
    default:
      return 'Unknown';
  }
});

const statusClass = computed(() => {
  return `status-${props.connectionStatus}`;
});

const latencyClass = computed(() => {
  if (props.latency < 50) return 'latency-good';
  if (props.latency < 100) return 'latency-ok';
  return 'latency-poor';
});

const formattedTime = computed(() => {
  const minutes = Math.floor(props.matchTime / 60);
  const seconds = Math.floor(props.matchTime % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});
</script>

<style scoped>
.multiplayer-hud {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

/* Network Status */
.network-status {
  background: var(--mech-surface);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-md);
  padding: 12px 16px;
  backdrop-filter: var(--mech-blur);
  box-shadow: var(--mech-shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-dot.status-connected {
  background: var(--mech-success-strong);
  box-shadow: 0 0 10px var(--mech-success-glow);
}

.status-dot.status-connecting {
  background: var(--mech-warn-strong);
  box-shadow: 0 0 10px var(--mech-warn-glow);
}

.status-dot.status-disconnected,
.status-dot.status-error {
  background: var(--mech-danger-strong);
  box-shadow: 0 0 10px var(--mech-danger-glow);
}

.status-text {
  color: var(--mech-text);
  font-size: 0.9rem;
  font-weight: 600;
}

/* Latency Display */
.latency-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--mech-radius-sm);
  background: var(--mech-surface-2);
}

.latency-icon {
  font-size: 1rem;
}

.latency-value {
  font-size: 0.95rem;
  font-weight: 700;
  font-family: var(--mech-font-mono);
}

.latency-display.latency-good {
  border-left: 3px solid var(--mech-success-strong);
}

.latency-display.latency-good .latency-value {
  color: var(--mech-success);
}

.latency-display.latency-ok {
  border-left: 3px solid var(--mech-warn-strong);
}

.latency-display.latency-ok .latency-value {
  color: var(--mech-warn);
}

.latency-display.latency-poor {
  border-left: 3px solid var(--mech-danger-strong);
}

.latency-display.latency-poor .latency-value {
  color: var(--mech-danger);
}

/* Match Timer */
.match-timer {
  background: var(--mech-surface);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-md);
  padding: 12px 16px;
  backdrop-filter: var(--mech-blur);
  box-shadow: var(--mech-shadow-sm);
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.timer-icon {
  font-size: 1.2rem;
}

.timer-value {
  color: var(--mech-accent);
  font-size: 1.2rem;
  font-weight: 700;
  font-family: var(--mech-font-mono);
}

/* Opponent Info */
.opponent-info {
  background: var(--mech-surface);
  border: 1px solid var(--mech-danger-glow);
  border-radius: var(--mech-radius-md);
  padding: 12px 16px;
  backdrop-filter: var(--mech-blur);
  box-shadow: var(--mech-shadow-sm);
  text-align: center;
}

.opponent-label {
  color: var(--mech-danger);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: var(--mech-tracking-caps);
  margin-bottom: 4px;
}

.opponent-name {
  color: var(--mech-text);
  font-size: 1rem;
  font-weight: 600;
}

/* Survival wave + score banner (reuses single-player BattleHUD look) */
.survival-banner {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 22px;
  align-items: baseline;
  padding: 8px 22px;
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  border: 1px solid var(--mech-warn-glow);
  border-radius: var(--mech-radius-sm);
  box-shadow: 0 0 18px var(--mech-warn-glow);
  pointer-events: none;
}

.survival-wave {
  color: var(--mech-warn);
  font-size: 22px;
  font-weight: bold;
  text-shadow: 0 0 12px var(--mech-warn-glow);
  letter-spacing: var(--mech-tracking-wide);
}

.survival-score {
  color: var(--mech-text);
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.9);
}

.survival-best {
  color: var(--mech-text-dim);
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.9);
}

/* Between-wave transition overlay (reuses MechBattlePage look) */
.wave-transition {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  pointer-events: none;
  animation: wave-pulse 1.5s ease-in-out infinite;
}

.wave-transition h2 {
  color: var(--mech-warn);
  font-size: 3rem;
  letter-spacing: var(--mech-tracking-wide);
  text-shadow: 0 0 24px var(--mech-warn-glow);
  margin-bottom: 12px;
}

.wave-transition p {
  color: var(--mech-text);
  font-size: 1.3rem;
}

@keyframes wave-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .multiplayer-hud {
    top: 10px;
    right: 10px;
    gap: 8px;
  }

  .network-status,
  .match-timer,
  .opponent-info {
    padding: 8px 12px;
    min-width: 140px;
  }

  .status-text,
  .latency-value,
  .timer-value {
    font-size: 0.85rem;
  }
}
</style>
