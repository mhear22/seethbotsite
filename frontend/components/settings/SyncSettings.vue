<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSync } from '../../composables/useSync'
import { useAuth } from '../../composables/useAuth'
import SyncStatus from './sync/SyncStatus.vue'
import DevicesList from './sync/DevicesList.vue'
import ConflictResolution from './sync/ConflictResolution.vue'

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
  clearConflicts,
  initSync,
  cleanupSync
} = useSync()

// Local state
const syncInProgress = ref(false)
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
  { value: 'last-write-wins', label: 'Last Write Wins', description: 'Always use the most recent change' },
  { value: 'user-prompted', label: 'Ask Me', description: 'Prompt to resolve each conflict' },
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
const updateConflictResolution = (resolution: 'last-write-wins' | 'user-prompted' | 'merge') => {
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

  if (!result.success) {
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
 * Refresh connected devices
 */
const refreshDevices = async () => {
  await fetchConnectedDevices()
}

// Lifecycle
onMounted(() => {
  if (isAuthenticated.value) {
    initSync()
    refreshDevices()
  }
})

onUnmounted(() => {
  cleanupSync()
})
</script>

<template>
  <div v-if="isAuthenticated" class="sync-settings">
    <!-- Status Section -->
    <SyncStatus
      :status-summary="statusSummary"
      :status="status"
      :sync-error="syncError"
      :is-online="isOnline"
      :sync-in-progress="syncInProgress"
      @sync-now="handleSyncNow"
      @refresh-devices="refreshDevices"
    />

    <!-- Settings Section -->
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
          :value="settings.syncFrequency"
          @change="updateSyncFrequency(Number(($event.target as HTMLSelectElement).value))"
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
          @change="updateConflictResolution($event.target.value as 'last-write-wins' | 'user-prompted' | 'merge')"
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

    <!-- Connected Devices Section -->
    <div class="settings-section">
      <h2 class="section-title">📱 Connected Devices</h2>
      <DevicesList :devices="status.connectedDevices" />
    </div>

    <!-- Conflicts Section -->
    <ConflictResolution
      :conflicts="conflicts"
      @resolve="resolveConflict"
      @clear="clearConflicts"
    />

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
}
</style>
