<template>
  <div class="matchmaking-view">
    <div class="matchmaking-card">
      <!-- Header -->
      <div class="matchmaking-header">
        <h2>{{ statusText }}</h2>
      </div>

      <!-- Loading Animation -->
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>

      <!-- Queue Info -->
      <div class="queue-info" v-if="queuePosition > 0">
        <p class="queue-position">Position in queue: {{ queuePosition }}</p>
        <p class="queue-time" v-if="estimatedWait > 0">
          Estimated wait: {{ formatTime(estimatedWait) }}
        </p>
      </div>

      <!-- Status Messages -->
      <div class="status-messages">
        <p v-if="status === 'searching'">Searching for an opponent...</p>
        <p v-if="status === 'found'">Match found! Preparing battle...</p>
        <p v-if="status === 'error'" class="error-message">{{ errorMessage }}</p>
      </div>

      <!-- Cancel Button -->
      <button
        v-if="status === 'searching' || status === 'queued'"
        @click="cancelMatchmaking"
        class="cancel-button"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  status: 'queued' | 'searching' | 'found' | 'error';
  queuePosition?: number;
  estimatedWait?: number; // in seconds
  errorMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  queuePosition: 0,
  estimatedWait: 0,
  errorMessage: ''
});

const emit = defineEmits<{
  cancel: [];
}>();

const statusText = computed(() => {
  switch (props.status) {
    case 'queued':
      return 'Queued for Matchmaking';
    case 'searching':
      return 'Searching for Match';
    case 'found':
      return 'Match Found!';
    case 'error':
      return 'Error';
    default:
      return 'Matchmaking';
  }
});

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function cancelMatchmaking() {
  emit('cancel');
}
</script>

<style scoped>
.matchmaking-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mech-overlay);
  backdrop-filter: var(--mech-blur);
  z-index: 1000;
  font-family: var(--mech-font);
}

.matchmaking-card {
  background: var(--mech-surface);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-lg);
  padding: 3rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: var(--mech-shadow-lg);
}

.matchmaking-header h2 {
  font-size: 2rem;
  color: var(--mech-text);
  margin: 0 0 2rem 0;
  font-weight: 700;
  letter-spacing: var(--mech-tracking-wide);
}

.spinner-container {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
}

.spinner {
  width: 80px;
  height: 80px;
  border: 6px solid var(--mech-border);
  border-top-color: var(--mech-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  box-shadow: var(--mech-shadow-accent);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.queue-info {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--mech-surface-2);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-md);
}

.queue-position {
  font-size: 1.1rem;
  color: var(--mech-accent);
  margin: 0.5rem 0;
  font-weight: 600;
}

.queue-time {
  font-size: 0.95rem;
  color: var(--mech-text-dim);
  margin: 0.5rem 0;
}

.status-messages {
  margin: 1.5rem 0;
  min-height: 2rem;
}

.status-messages p {
  font-size: 1.05rem;
  color: var(--mech-text-dim);
  margin: 0.5rem 0;
}

.error-message {
  color: var(--mech-danger) !important;
  font-weight: 600;
}

.cancel-button {
  margin-top: 2rem;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: var(--mech-tracking-wide);
  color: #fff;
  background: var(--mech-danger-grad);
  border: none;
  border-radius: var(--mech-radius-md);
  cursor: pointer;
  transition: all var(--mech-transition);
}

.cancel-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px var(--mech-danger-glow);
}

.cancel-button:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 3px;
}

.cancel-button:active {
  transform: translateY(0);
}
</style>
