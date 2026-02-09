import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from './useAuth'
import { buildUrl } from '../utils/api'

const API_BASE = '/api'

// Interfaces matching backend
interface SyncLog {
  id: number
  user_id: number
  device_id: string
  sync_type: 'upload' | 'download'
  status: 'success' | 'partial' | 'failed'
  items_synced: number
  conflicts_found: number
  conflicts_resolved: number
  error_message: string | null
  started_at: string
  completed_at: string | null
}

interface SyncStatusResponse {
  last_sync_time: string | null
  total_devices: number
  recent_syncs: SyncLog[]
  conflicts_pending: number
}

interface SyncConflict {
  id: string
  type: string
  local_version: any
  remote_version: any
  timestamp: string
}

interface SyncSettings {
  autoSync: boolean
  syncFrequency: number // minutes, 0 = manual
  conflictResolution: 'last-write-wins' | 'user-prompted' | 'merge'
  notifyOnConflict: boolean
}

interface QueuedOperation {
  id: string
  type: string
  data: any
  timestamp: string
  retries: number
}

interface Device {
  id: number
  user_id: number
  device_id: string
  device_name: string | null
  device_type: string | null
  platform: string | null
  last_sync: string | null
  created_at: string
  updated_at: string
  isCurrentDevice: boolean
}

// State
interface SyncState {
  lastSyncAt: string | null
  isSyncing: boolean
  hasUnsyncedChanges: boolean
  pendingCount: number
  connectedDevices: Device[]
  recentSyncs: SyncLog[]
  conflictsPending: number
}

const state = ref<SyncState>({
  lastSyncAt: null,
  isSyncing: false,
  hasUnsyncedChanges: false,
  pendingCount: 0,
  connectedDevices: [],
  recentSyncs: [],
  conflictsPending: 0
})

const settings = ref<SyncSettings>({
  autoSync: true,
  syncFrequency: 5, // 5 minutes default
  conflictResolution: 'last-write-wins',
  notifyOnConflict: true
})

const conflicts = ref<SyncConflict[]>([])
const offlineQueue = ref<QueuedOperation[]>([])
const isOnline = ref(navigator.onLine)
const syncError = ref<string | null>(null)

let syncInterval: number | null = null
const SETTINGS_KEY = 'sync_settings'
const QUEUE_KEY = 'offline_sync_queue'
const DEVICE_ID_KEY = 'sync_device_id'

// Get or create device ID for this browser/device
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  return deviceId
}

/**
 * Load settings from localStorage
 */
const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      settings.value = { ...settings.value, ...parsed }
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
 * Trigger manual sync - both upload and download
 */
const syncNow = async (): Promise<{ success: boolean; error?: string }> => {
  const { token } = useAuth()
  const deviceId = getDeviceId()

  if (state.value.isSyncing) {
    return { success: false, error: 'Sync already in progress' }
  }

  if (!isOnline.value) {
    return { success: false, error: 'Offline - changes queued' }
  }

  state.value.isSyncing = true
  syncError.value = null

  try {
    // Step 1: Upload local changes (if any)
    const uploadResponse = await fetch(buildUrl(`${API_BASE}/sync/upload`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        deviceId,
        deviceName: getBrowserName(),
        deviceType: getDeviceType(),
        platform: getPlatform(),
        conflictResolution: settings.value.conflictResolution
      })
    })

    const uploadData = await uploadResponse.json()

    if (!uploadResponse.ok || !uploadData.success) {
      const errorMsg = uploadData.error || 'Upload failed'
      syncError.value = errorMsg
      state.value.isSyncing = false
      return { success: false, error: errorMsg }
    }

    // Check for unresolved conflicts after upload
    if (uploadData.conflicts && uploadData.conflicts.length > 0) {
      conflicts.value = uploadData.conflicts
      if (settings.value.notifyOnConflict) {
        showConflictNotification()
      }
    }

    // Step 2: Download latest server state
    const downloadResponse = await fetch(buildUrl(`${API_BASE}/sync/download`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    const downloadData = await downloadResponse.json()

    if (!downloadResponse.ok || !downloadData.success) {
      const errorMsg = downloadData.error || 'Download failed'
      syncError.value = errorMsg
      state.value.isSyncing = false
      return { success: false, error: errorMsg }
    }

    // Update last sync time
    state.value.lastSyncAt = new Date().toISOString()
    state.value.hasUnsyncedChanges = false

    // Process downloaded data (you would update local state here)
    // For now, we're just tracking the sync status
    if (downloadData.data) {
      // Here you would merge downloaded data with local state
      // This depends on your specific data model
    }

    // Step 3: Fetch sync status
    await fetchSyncStatus()

    return { success: true }
  } catch (error) {
    console.error('Sync error:', error)
    const errorMsg = 'Network error during sync'
    syncError.value = errorMsg

    // Queue operations if sync fails
    // In a full implementation, you'd queue unsaved local changes here

    state.value.isSyncing = false
    return { success: false, error: errorMsg }
  } finally {
    state.value.isSyncing = false
  }
}

/**
 * Fetch sync status from server
 */
const fetchSyncStatus = async (): Promise<boolean> => {
  const { token } = useAuth()

  try {
    const response = await fetch(buildUrl(`${API_BASE}/sync/status`), {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    if (response.ok) {
      const data = await response.json()

      if (data.success && data.status) {
        state.value.lastSyncAt = data.status.last_sync_time
        state.value.conflictsPending = data.status.conflicts_pending
        state.value.recentSyncs = data.status.recent_syncs || []

        // Get connected devices
        await fetchConnectedDevices()

        return true
      }
    }
  } catch (error) {
    console.error('Failed to fetch sync status:', error)
  }

  return false
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
    const response = await fetch(buildUrl(`${API_BASE}/sync/resolve`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        conflicts: [{ id: conflictId, resolution }]
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      // Remove conflict from list
      conflicts.value = conflicts.value.filter(c => c.id !== conflictId)

      // Re-fetch sync status
      await fetchSyncStatus()

      return { success: true }
    } else {
      return { success: false, error: data.error || 'Failed to resolve conflict' }
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
 * Get connected devices from sync status
 * Since the backend doesn't have a separate devices endpoint,
 * we need to infer devices from sync logs or store them locally
 */
const fetchConnectedDevices = async (): Promise<Device[]> => {
  // The sync status gives us total_devices but not device details
  // We'll create a current device entry and add others as we discover them
  const deviceId = getDeviceId()
  const currentDevice: Device = {
    id: -1, // Placeholder ID
    user_id: 0,
    device_id: deviceId,
    device_name: getBrowserName(),
    device_type: getDeviceType(),
    platform: getPlatform(),
    last_sync: state.value.lastSyncAt,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isCurrentDevice: true
  }

  // For now, we only show the current device
  // In a full implementation, you'd need a backend endpoint to list all devices
  state.value.connectedDevices = [currentDevice]

  return state.value.connectedDevices
}

/**
 * Get browser/device info helpers
 */
const getBrowserName = (): string => {
  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Unknown Browser'
}

const getDeviceType = (): string => {
  const ua = navigator.userAgent
  if (/Mobile|Android|iP(ad|hone)/i.test(ua)) {
    return 'mobile'
  } else if (/Tablet|iPad/i.test(ua)) {
    return 'tablet'
  }
  return 'desktop'
}

const getPlatform = (): string => {
  const platform = navigator.platform
  if (platform.includes('Win')) return 'Windows'
  if (platform.includes('Mac')) return 'macOS'
  if (platform.includes('Linux')) return 'Linux'
  if (/Android|iPhone|iPad/i.test(navigator.userAgent)) return 'Mobile'
  return 'Unknown'
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
const statusSummary = computed(() => {
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

  // Fetch initial sync status
  fetchSyncStatus()

  // Start auto-sync if enabled
  if (settings.value.autoSync) {
    startAutoSync()
  }

  // Perform initial sync if online
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
  return {
    // State
    status: computed(() => state.value),
    settings: computed(() => settings.value),
    conflicts: computed(() => conflicts.value),
    isOnline: computed(() => isOnline.value),
    syncError: computed(() => syncError.value),
    statusSummary,

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
