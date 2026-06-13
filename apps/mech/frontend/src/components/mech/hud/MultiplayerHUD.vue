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
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(8px);
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
  background: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.status-dot.status-connecting {
  background: #f59e0b;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

.status-dot.status-disconnected,
.status-dot.status-error {
  background: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.status-text {
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Latency Display */
.latency-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
}

.latency-icon {
  font-size: 1rem;
}

.latency-value {
  font-size: 0.95rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.latency-display.latency-good {
  border-left: 3px solid #10b981;
}

.latency-display.latency-good .latency-value {
  color: #10b981;
}

.latency-display.latency-ok {
  border-left: 3px solid #f59e0b;
}

.latency-display.latency-ok .latency-value {
  color: #f59e0b;
}

.latency-display.latency-poor {
  border-left: 3px solid #ef4444;
}

.latency-display.latency-poor .latency-value {
  color: #ef4444;
}

/* Match Timer */
.match-timer {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.timer-icon {
  font-size: 1.2rem;
}

.timer-value {
  color: #60a5fa;
  font-size: 1.2rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

/* Opponent Info */
.opponent-info {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(239, 68, 68, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(8px);
  text-align: center;
}

.opponent-label {
  color: #ef4444;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.opponent-name {
  color: #e2e8f0;
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
  background: rgba(0, 0, 0, 0.55);
  border: 2px solid rgba(245, 158, 11, 0.5);
  border-radius: 8px;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
  pointer-events: none;
}

.survival-wave {
  color: #fbbf24;
  font-size: 22px;
  font-weight: bold;
  text-shadow: 0 0 12px rgba(245, 158, 11, 0.8);
  letter-spacing: 0.05em;
}

.survival-score {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.9);
}

.survival-best {
  color: #9ca3af;
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
  color: #fbbf24;
  font-size: 3rem;
  text-shadow: 0 0 24px rgba(245, 158, 11, 0.8);
  margin-bottom: 12px;
}

.wave-transition p {
  color: #e5e7eb;
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
