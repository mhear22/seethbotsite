<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSync } from '../../composables/useSync'
import { useAuth } from '../../composables/useAuth'

// Composables
const { isAuthenticated } = useAuth()
const {
  status,
  settings,
  conflicts,
  isOnline,
  syncError,
  statusSummary,
  syncNow,
  handleConflict,
  updateSettings,
  fetchConnectedDevices,
  clearConflicts
} = useSync()

// Local state
const syncInProgress = ref(false)
const showConflictModal = ref(false)
const selectedConflict = ref<any>(null)
const settingsSaved = ref(false)

// Sync frequency options
const syncFrequencyOptions = [
  { value: 0, label: 'Manual' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' }
]

// Conflict resolution options
const conflictResolutionOptions = [
  { value: 'lww', label: 'Last Write Wins', description: 'Always use the most recent change' },
  { value: 'ask', label: 'Ask Me', description: 'Prompt to resolve each conflict' },
  { value: 'merge', label: 'Auto Merge', description: 'Attempt to merge changes automatically' }
]

/**
 * Trigger manual sync
 */
const handleSyncNow = async () => {
  if (syncInProgress.value || !isAuthenticated.value) return

  syncInProgress.value = true
  const result = await syncNow()

  if (!result.success) {
    console.error('Sync failed:', result.error)
  }

  syncInProgress.value = false
}

/**
 * Toggle auto-sync
 */
const toggleAutoSync = async () => {
  updateSettings({ autoSync: !settings.value.autoSync })

  if (settings.value.autoSync) {
    await handleSyncNow()
  }

  showSavedMessage()
}

/**
 * Update sync frequency
 */
const updateSyncFrequency = async (frequency: number) => {
  updateSettings({ syncFrequency: frequency })
  showSavedMessage()
}

/**
 * Update conflict resolution preference
 */
const updateConflictResolution = (resolution: 'lww' | 'ask' | 'merge') => {
  updateSettings({ conflictResolution: resolution })
  showSavedMessage()
}

/**
 * Toggle conflict notifications
 */
const toggleConflictNotifications = () => {
  updateSettings({ notifyOnConflict: !settings.value.notifyOnConflict })
  showSavedMessage()
}

/**
 * Handle conflict resolution
 */
const resolveConflict = async (conflictId: string, resolution: 'local' | 'remote' | 'merge') => {
  const result = await handleConflict(conflictId, resolution)

  if (result.success) {
    showConflictModal.value = false
    selectedConflict.value = null
  } else {
    console.error('Failed to resolve conflict:', result.error)
  }
}

/**
 * Show saved message
 */
const showSavedMessage = () => {
  settingsSaved.value = true
  setTimeout(() => {
    settingsSaved.value = false
  }, 2000)
}

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

/**
 * Refresh connected devices
 */
const refreshDevices = async () => {
  await fetchConnectedDevices()
}

// Lifecycle
onMounted(() => {
  if (isAuthenticated.value) {
    refreshDevices()
  }
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<template>
  <div v-if="isAuthenticated" class="sync-settings">
    <div class="settings-section">
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
          @click="handleSyncNow"
          class="sync-btn"
          :disabled="syncInProgress || !isOnline"
          :class="{ syncing: syncInProgress }"
        >
          <span v-if="syncInProgress" class="spinner"></span>
          {{ syncInProgress ? 'Syncing...' : 'Sync Now' }}
        </button>
        <button
          @click="refreshDevices"
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

    <div class="settings-section">
      <h2 class="section-title">⚙️ Sync Settings</h2>

      <!-- Auto-Sync Toggle -->
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">Auto-Sync</span>
          <span class="label-desc">Automatically sync your data</span>
        </label>
        <button
          @click="toggleAutoSync"
          class="toggle-btn"
          :class="{ active: settings.autoSync }"
        >
          {{ settings.autoSync ? '🟢 On' : '🔴 Off' }}
        </button>
      </div>

      <!-- Sync Frequency -->
      <div class="setting-item" :class="{ disabled: !settings.autoSync }">
        <label class="setting-label">
          <span class="label-text">Sync Frequency</span>
          <span class="label-desc">How often to auto-sync</span>
        </label>
        <select
          v-model="settings.syncFrequency"
          @change="updateSyncFrequency(settings.syncFrequency)"
          :disabled="!settings.autoSync"
          class="select-input"
        >
          <option
            v-for="option in syncFrequencyOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Conflict Resolution -->
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">Conflict Resolution</span>
          <span class="label-desc">How to handle sync conflicts</span>
        </label>
        <select
          :value="settings.conflictResolution"
          @change="updateConflictResolution($event.target.value as 'lww' | 'ask' | 'merge')"
          class="select-input"
        >
          <option
            v-for="option in conflictResolutionOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Conflict Notifications -->
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">Conflict Notifications</span>
          <span class="label-desc">Notify me when conflicts occur</span>
        </label>
        <button
          @click="toggleConflictNotifications"
          class="toggle-btn"
          :class="{ active: settings.notifyOnConflict }"
        >
          {{ settings.notifyOnConflict ? '🟢 On' : '🔴 Off' }}
        </button>
      </div>
    </div>

    <div class="settings-section">
      <h2 class="section-title">📱 Connected Devices</h2>

      <div v-if="status.connectedDevices.length === 0" class="no-devices">
        No connected devices yet
      </div>

      <div v-else class="devices-list">
        <div
          v-for="device in status.connectedDevices"
          :key="device.id"
          class="device-item"
          :class="{ current: device.isCurrentDevice }"
        >
          <div class="device-info">
            <span class="device-icon">
              {{ device.deviceType === 'mobile' ? '📱' : (device.deviceType === 'tablet' ? '📲' : '💻') }}
            </span>
            <div>
              <div class="device-name">
                {{ device.deviceName || 'Unknown Device' }}
                <span v-if="device.isCurrentDevice" class="current-badge">(This device)</span>
              </div>
              <div class="device-last-seen">
                Last seen: {{ formatTimestamp(device.lastSeenAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conflicts Section -->
    <div v-if="conflicts.length > 0" class="settings-section warning">
      <h2 class="section-title">⚠️ Sync Conflicts</h2>

      <div class="conflicts-list">
        <div
          v-for="conflict in conflicts"
          :key="conflict.id"
          class="conflict-item"
        >
          <div class="conflict-header">
            <span class="conflict-type">{{ conflict.type }}</span>
            <span class="conflict-time">{{ formatTimestamp(conflict.timestamp) }}</span>
          </div>
          <div class="conflict-details">
            <div class="conflict-side">
              <strong>Local:</strong> {{ JSON.stringify(conflict.localValue).substring(0, 50) }}...
            </div>
            <div class="conflict-side">
              <strong>Remote:</strong> {{ JSON.stringify(conflict.remoteValue).substring(0, 50) }}...
            </div>
          </div>
          <div class="conflict-actions">
            <button
              @click="resolveConflict(conflict.id, 'local')"
              class="conflict-btn local"
            >
              Keep Local
            </button>
            <button
              @click="resolveConflict(conflict.id, 'remote')"
              class="conflict-btn remote"
            >
              Keep Remote
            </button>
            <button
              @click="resolveConflict(conflict.id, 'merge')"
              class="conflict-btn merge"
            >
              Merge
            </button>
          </div>
        </div>
      </div>

      <button @click="clearConflicts" class="clear-conflicts-btn">
        Dismiss All
      </button>
    </div>

    <!-- Saved Message -->
    <div v-if="settingsSaved" class="saved-message">
      ✅ Settings saved!
    </div>
  </div>

  <div v-else class="auth-required">
    <p>🔐 Please log in to access sync settings</p>
  </div>
</template>

<style scoped>
.sync-settings {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark .settings-section {
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

.status-value.syncing {
  color: #ed8936;
}

.status-value.idle {
  color: #48bb78;
}

.status-value.offline {
  color: #e53e3e;
}

.dark .status-value {
  color: #e2e8f0;
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

/* Setting Items */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 182, 193, 0.1);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.setting-label {
  flex: 1;
  padding-right: 2rem;
}

.label-text {
  display: block;
  font-weight: 600;
  font-size: 1rem;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.dark .label-text {
  color: #e2e8f0;
}

.label-desc {
  display: block;
  font-size: 0.85rem;
  color: #718096;
}

.dark .label-desc {
  color: #a0aec0;
}

/* Toggle Button */
.toggle-btn {
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #2d3748;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark .toggle-btn {
  border-color: #4a5568;
  background: #2d3748;
  color: #e2e8f0;
}

.toggle-btn:hover {
  border-color: #ff6b9d;
  color: #ff6b9d;
}

.toggle-btn.active {
  background: #48bb78;
  border-color: #48bb78;
  color: white;
}

/* Select Input */
.select-input {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #2d3748;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
}

.dark .select-input {
  border-color: #4a5568;
  background: #2d3748;
  color: #e2e8f0;
}

.select-input:hover {
  border-color: #ff6b9d;
}

.select-input:focus {
  outline: none;
  border-color: #ff6b9d;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.2);
}

.select-input:disabled {
  background: #e2e8f0;
  cursor: not-allowed;
}

.dark .select-input:disabled {
  background: #4a5568;
}

/* Connected Devices */
.no-devices {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.dark .no-devices {
  color: #a0aec0;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.device-item.current {
  border: 2px solid #48bb78;
}

.dark .device-item {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
}

.device-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.device-icon {
  font-size: 1.5rem;
}

.device-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.dark .device-name {
  color: #e2e8f0;
}

.current-badge {
  color: #48bb78;
  font-size: 0.85rem;
}

.device-last-seen {
  font-size: 0.85rem;
  color: #718096;
}

.dark .device-last-seen {
  color: #a0aec0;
}

/* Conflicts */
.settings-section.warning {
  border: 2px solid #ed8936;
}

.conflicts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.conflict-item {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fffaf0 0%, #fbd38d 0.2);
  border-radius: 12px;
  border: 1px solid #ed8936;
}

.dark .conflict-item {
  background: rgba(237, 137, 54, 0.1);
  border-color: #ed8936;
}

.conflict-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.conflict-type {
  font-weight: 600;
  color: #ed8936;
  text-transform: capitalize;
}

.conflict-time {
  font-size: 0.85rem;
  color: #718096;
}

.conflict-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.conflict-side {
  font-size: 0.9rem;
  color: #2d3748;
  word-break: break-all;
}

.dark .conflict-side {
  color: #e2e8f0;
}

.conflict-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.conflict-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.conflict-btn.local {
  background: #48bb78;
  color: white;
}

.conflict-btn.local:hover {
  background: #38a169;
}

.conflict-btn.remote {
  background: #4299e1;
  color: white;
}

.conflict-btn.remote:hover {
  background: #3182ce;
}

.conflict-btn.merge {
  background: #9f7aea;
  color: white;
}

.conflict-btn.merge:hover {
  background: #805ad5;
}

.clear-conflicts-btn {
  width: 100%;
  padding: 0.75rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.clear-conflicts-btn:hover {
  background: #c53030;
}

/* Saved Message */
.saved-message {
  text-align: center;
  padding: 1rem;
  background: #48bb78;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Auth Required */
.auth-required {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  color: #718096;
}

.dark .auth-required {
  background: rgba(40, 44, 52, 0.95);
  color: #a0aec0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .settings-section {
    padding: 1.5rem;
  }

  .sync-actions {
    flex-direction: column;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .setting-label {
    padding-right: 0;
  }

  .select-input,
  .toggle-btn {
    width: 100%;
  }

  .conflict-actions {
    flex-direction: column;
  }

  .conflict-btn {
    width: 100%;
  }
}
</style>
