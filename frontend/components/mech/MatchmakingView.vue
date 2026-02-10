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
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
}

.matchmaking-card {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border: 2px solid #475569;
  border-radius: 16px;
  padding: 3rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.matchmaking-header h2 {
  font-size: 2rem;
  color: #e2e8f0;
  margin: 0 0 2rem 0;
  font-weight: 700;
}

.spinner-container {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
}

.spinner {
  width: 80px;
  height: 80px;
  border: 6px solid #334155;
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.queue-info {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.queue-position {
  font-size: 1.1rem;
  color: #93c5fd;
  margin: 0.5rem 0;
  font-weight: 600;
}

.queue-time {
  font-size: 0.95rem;
  color: #cbd5e1;
  margin: 0.5rem 0;
}

.status-messages {
  margin: 1.5rem 0;
  min-height: 2rem;
}

.status-messages p {
  font-size: 1.05rem;
  color: #cbd5e1;
  margin: 0.5rem 0;
}

.error-message {
  color: #f87171 !important;
  font-weight: 600;
}

.cancel-button {
  margin-top: 2rem;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #e2e8f0;
  background: linear-gradient(145deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background: linear-gradient(145deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.cancel-button:active {
  transform: translateY(0);
}
</style>
