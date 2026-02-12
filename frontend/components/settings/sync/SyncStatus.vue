<script setup lang="ts">
interface StatusSummary {
  status: 'syncing' | 'idle' | 'offline'
  pendingChanges: number
  hasConflicts: boolean
  conflictCount: number
}

interface Status {
  lastSyncAt: string | null
  connectedDevices: any[]
}

interface Props {
  statusSummary: StatusSummary
  status: Status
  syncError: string | null
  isOnline: boolean
  syncInProgress: boolean
}

interface Emits {
  (e: 'syncNow'): void
  (e: 'refreshDevices'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Format timestamp
 */
const formatTimestamp = (timestamp: string | null) => {
  if (!timestamp) return 'Never'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return date.toLocaleDateString()
}
</script>

<template>
  <div class="status-section">
    <h2 class="section-title">🔄 Account Sync</h2>

    <!-- Status Summary -->
    <div class="status-summary">
      <div class="status-item">
        <span class="status-label">Status:</span>
        <span class="status-value" :class="statusSummary.status">
          {{ statusSummary.status === 'syncing' ? 'Syncing...' : (statusSummary.status === 'offline' ? 'Offline' : 'Up to date') }}
        </span>
      </div>
      <div class="status-item">
        <span class="status-label">Last Sync:</span>
        <span class="status-value">{{ formatTimestamp(status.lastSyncAt) }}</span>
      </div>
      <div v-if="statusSummary.pendingChanges > 0" class="status-item warning">
        <span class="status-label">Pending Changes:</span>
        <span class="status-value">{{ statusSummary.pendingChanges }}</span>
      </div>
      <div v-if="statusSummary.hasConflicts" class="status-item error">
        <span class="status-label">Conflicts:</span>
        <span class="status-value">{{ statusSummary.conflictCount }}</span>
      </div>
    </div>

    <!-- Sync Now Button -->
    <div class="sync-actions">
      <button
        @click="emit('syncNow')"
        class="sync-btn"
        :disabled="syncInProgress || !isOnline"
        :class="{ syncing: syncInProgress }"
      >
        <span v-if="syncInProgress" class="spinner"></span>
        {{ syncInProgress ? 'Syncing...' : 'Sync Now' }}
      </button>
      <button
        @click="emit('refreshDevices')"
        class="refresh-btn"
      >
        🔄 Refresh Devices
      </button>
    </div>

    <!-- Sync Error -->
    <div v-if="syncError" class="error-message">
      ⚠️ {{ syncError }}
    </div>
  </div>
</template>

<style scoped>
.status-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark .status-section {
  background: rgba(40, 44, 52, 0.95);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #ff6b9d;
}

.dark .section-title {
  color: #ffb6c1;
}

/* Status Summary */
.status-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.dark .status-summary {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-weight: 600;
  color: #4a5568;
}

.dark .status-label {
  color: #a0aec0;
}

.status-value {
  font-weight: 600;
  color: #2d3748;
}

.dark .status-value {
  color: #e2e8f0;
}

.status-value.syncing {
  color: #ed8936;
}

.status-value.idle {
  color: #48bb78;
}

.status-value.offline {
  color: #e53e3e;
}

.status-item.warning .status-value {
  color: #ed8936;
}

.status-item.error .status-value {
  color: #e53e3e;
}

/* Sync Actions */
.sync-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.sync-btn {
  flex: 1;
  padding: 1rem 2rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.sync-btn:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.sync-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.sync-btn.syncing {
  background: #ed8936;
}

.refresh-btn {
  padding: 1rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: #3182ce;
  transform: translateY(-2px);
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  padding: 1rem;
  background: #fed7d7;
  border-left: 4px solid #e53e3e;
  border-radius: 8px;
  color: #c53030;
  margin-top: 1rem;
}

.dark .error-message {
  background: rgba(229, 62, 62, 0.2);
  color: #feb2b2;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .sync-actions {
    flex-direction: column;
  }
}
</style>
