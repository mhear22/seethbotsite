import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from './useAuth'
import { buildUrl } from '../utils/api'

const API_BASE = '/api'

// Interfaces
interface SyncStatus {
  lastSyncAt: string | null
  isSyncing: boolean
  hasUnsyncedChanges: boolean
  pendingCount: number
  connectedDevices: ConnectedDevice[]
}

interface ConnectedDevice {
  id: number
  deviceName: string | null
  deviceType: string | null
  lastSeenAt: string
  isCurrentDevice: boolean
}

interface SyncConflict {
  id: string
  type: 'settings' | 'data' | 'profile'
  entityType: string
  entityId: string
  localValue: any
  remoteValue: any
  conflictType: 'modified_both' | 'deleted_local' | 'deleted_remote'
  timestamp: string
}

interface SyncSettings {
  autoSync: boolean
  syncFrequency: number // minutes, 0 = manual
  conflictResolution: 'lww' | 'ask' | 'merge'
  notifyOnConflict: boolean
}

interface QueuedOperation {
  id: string
  type: string
  data: any
  timestamp: string
  retries: number
}

// State
const state = ref<SyncStatus>({
  lastSyncAt: null,
  isSyncing: false,
  hasUnsyncedChanges: false,
  pendingCount: 0,
  connectedDevices: []
})

const settings = ref<SyncSettings>({
  autoSync: true,
  syncFrequency: 5, // 5 minutes default
  conflictResolution: 'lww',
  notifyOnConflict: true
})

const conflicts = ref<SyncConflict[]>([])
const offlineQueue = ref<QueuedOperation[]>([])
const isOnline = ref(navigator.onLine)
const syncError = ref<string | null>(null)

let syncInterval: number | null = null
const SETTINGS_KEY = 'sync_settings'
const QUEUE_KEY = 'offline_sync_queue'

/**
 * Load settings from localStorage
 */
const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      settings.value = { ...settings.value, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('Failed to load sync settings:', error)
  }
}

/**
 * Save settings to localStorage
 */
const saveSettings = () => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
  } catch (error) {
    console.error('Failed to save sync settings:', error)
  }
}

/**
 * Load offline queue from localStorage
 */
const loadQueue = () => {
  try {
    const saved = localStorage.getItem(QUEUE_KEY)
    if (saved) {
      offlineQueue.value = JSON.parse(saved)
      state.value.pendingCount = offlineQueue.value.length
      state.value.hasUnsyncedChanges = offlineQueue.value.length > 0
    }
  } catch (error) {
    console.error('Failed to load offline queue:', error)
  }
}

/**
 * Save offline queue to localStorage
 */
const saveQueue = () => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(offlineQueue.value))
    state.value.pendingCount = offlineQueue.value.length
    state.value.hasUnsyncedChanges = offlineQueue.value.length > 0
  } catch (error) {
    console.error('Failed to save offline queue:', error)
  }
}

/**
 * Check online status
 */
const checkOnlineStatus = () => {
  isOnline.value = navigator.onLine

  // If we just came back online, try to sync
  if (isOnline.value && offlineQueue.value.length > 0) {
    syncNow()
  }
}

/**
 * Trigger manual sync
 */
const syncNow = async (): Promise<{ success: boolean; error?: string }> => {
  const { token } = useAuth()

  if (state.value.isSyncing) {
    return { success: false, error: 'Sync already in progress' }
  }

  if (!isOnline.value) {
    return { success: false, error: 'Offline - changes queued' }
  }

  state.value.isSyncing = true
  syncError.value = null

  try {
    // First, sync any queued operations
    if (offlineQueue.value.length > 0) {
      const queueResult = await syncOfflineQueue()
      if (!queueResult.success) {
        return queueResult
      }
    }

    // Then perform the sync
    const response = await fetch(buildUrl(`${API_BASE}/sync/sync`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        lastSyncAt: state.value.lastSyncAt,
        conflictResolution: settings.value.conflictResolution
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      state.value.lastSyncAt = data.lastSyncAt || new Date().toISOString()
      state.value.hasUnsyncedChanges = false

      // Check for conflicts
      if (data.conflicts && data.conflicts.length > 0) {
        conflicts.value = data.conflicts
        if (settings.value.notifyOnConflict) {
          showConflictNotification()
        }
      }

      // Update connected devices
      if (data.devices) {
        state.value.connectedDevices = data.devices
      }

      return { success: true }
    } else {
      const errorMsg = data.message || 'Sync failed'
      syncError.value = errorMsg
      return { success: false, error: errorMsg }
    }
  } catch (error) {
    console.error('Sync error:', error)
    const errorMsg = 'Network error during sync'
    syncError.value = errorMsg

    // Queue operations if sync fails
    if (offlineQueue.value.length > 0) {
      return { success: false, error: errorMsg }
    }

    return { success: false, error: errorMsg }
  } finally {
    state.value.isSyncing = false
  }
}

/**
 * Sync offline queue
 */
const syncOfflineQueue = async (): Promise<{ success: boolean; error?: string }> => {
  const { token } = useAuth()

  if (!isOnline.value) {
    return { success: false, error: 'Offline' }
  }

  try {
    const response = await fetch(buildUrl(`${API_BASE}/sync/queue`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        operations: offlineQueue.value
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      // Clear synced operations
      offlineQueue.value = []
      saveQueue()
      return { success: true }
    } else {
      const errorMsg = data.message || 'Queue sync failed'
      syncError.value = errorMsg
      return { success: false, error: errorMsg }
    }
  } catch (error) {
    console.error('Queue sync error:', error)
    const errorMsg = 'Network error during queue sync'
    syncError.value = errorMsg
    return { success: false, error: errorMsg }
  }
}

/**
 * Handle conflict resolution
 */
const handleConflict = async (
  conflictId: string,
  resolution: 'local' | 'remote' | 'merge'
): Promise<{ success: boolean; error?: string }> => {
  const { token } = useAuth()

  try {
    const response = await fetch(buildUrl(`${API_BASE}/sync/conflict/${conflictId}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({ resolution })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      // Remove conflict from list
      conflicts.value = conflicts.value.filter(c => c.id !== conflictId)
      return { success: true }
    } else {
      return { success: false, error: data.message || 'Failed to resolve conflict' }
    }
  } catch (error) {
    console.error('Conflict resolution error:', error)
    return { success: false, error: 'Network error' }
  }
}

/**
 * Queue an operation for offline sync
 */
const queueOperation = (type: string, data: any): void => {
  const operation: QueuedOperation = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    timestamp: new Date().toISOString(),
    retries: 0
  }

  offlineQueue.value.push(operation)
  saveQueue()

  // Try to sync if online
  if (isOnline.value && !state.value.isSyncing) {
    syncNow()
  }
}

/**
 * Start auto-sync based on settings
 */
const startAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval)
  }

  if (settings.value.autoSync && settings.value.syncFrequency > 0) {
    const intervalMs = settings.value.syncFrequency * 60 * 1000
    syncInterval = window.setInterval(() => {
      if (isOnline.value && !state.value.isSyncing) {
        syncNow()
      }
    }, intervalMs)
  }
}

/**
 * Stop auto-sync
 */
const stopAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

/**
 * Update sync settings
 */
const updateSettings = (newSettings: Partial<SyncSettings>) => {
  settings.value = { ...settings.value, ...newSettings }
  saveSettings()

  // Restart auto-sync if settings changed
  if (newSettings.autoSync !== undefined || newSettings.syncFrequency !== undefined) {
    startAutoSync()
  }
}

/**
 * Get connected devices
 */
const fetchConnectedDevices = async (): Promise<ConnectedDevice[]> => {
  const { token } = useAuth()

  try {
    const response = await fetch(buildUrl(`${API_BASE}/sync/devices`), {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      state.value.connectedDevices = data || []
      return state.value.connectedDevices
    }
  } catch (error) {
    console.error('Failed to fetch connected devices:', error)
  }

  return []
}

/**
 * Show conflict notification
 */
const showConflictNotification = () => {
  // This could show a toast, notification, or modal
  // For now, just log it
  console.log('Sync conflicts detected:', conflicts.value.length)
}

/**
 * Clear all conflicts
 */
const clearConflicts = () => {
  conflicts.value = []
}

/**
 * Get sync status summary
 */
const getStatusSummary = computed(() => {
  return {
    status: state.value.isSyncing ? 'syncing' : (isOnline.value ? 'idle' : 'offline'),
    lastSync: state.value.lastSyncAt ? new Date(state.value.lastSyncAt).toLocaleString() : 'Never',
    pendingChanges: state.value.pendingCount,
    hasConflicts: conflicts.value.length > 0,
    conflictCount: conflicts.value.length,
    connectedDevices: state.value.connectedDevices.length
  }
})

/**
 * Initialize sync on mount
 */
const initSync = () => {
  loadSettings()
  loadQueue()
  checkOnlineStatus()

  // Listen for online/offline events
  window.addEventListener('online', checkOnlineStatus)
  window.addEventListener('offline', checkOnlineStatus)

  // Start auto-sync if enabled
  if (settings.value.autoSync) {
    startAutoSync()
  }

  // Fetch initial sync status
  fetchConnectedDevices()

  // Perform initial sync
  if (isOnline.value) {
    syncNow()
  }
}

/**
 * Cleanup sync on unmount
 */
const cleanupSync = () => {
  stopAutoSync()
  window.removeEventListener('online', checkOnlineStatus)
  window.removeEventListener('offline', checkOnlineStatus)
}

// Export composable
export function useSync() {
  // Lifecycle hooks will be called by the component that uses this
  return {
    // State
    status: computed(() => state.value),
    settings: computed(() => settings.value),
    conflicts: computed(() => conflicts.value),
    isOnline: computed(() => isOnline.value),
    syncError: computed(() => syncError.value),
    statusSummary: getStatusSummary,

    // Actions
    syncNow,
    handleConflict,
    queueOperation,
    updateSettings,
    fetchConnectedDevices,
    clearConflicts,

    // Lifecycle
    initSync,
    cleanupSync
  }
}
