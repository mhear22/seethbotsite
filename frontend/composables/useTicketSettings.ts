import { ref, onMounted, type Ref } from 'vue'
import { useTicketsStore } from '../stores/useTicketsStore'

const CREATOR_ID_KEY = 'seethbot-creator-id'
const IGNORE_MODE_KEY = 'tickets-ignore-mode'

export function useTicketSettings() {
  const ticketsStore = useTicketsStore()
  const creatorId: Ref<string> = ref('')

  /**
   * Initialize creator ID from localStorage or generate new one
   */
  const initCreatorId = () => {
    let id = localStorage.getItem(CREATOR_ID_KEY)
    if (!id) {
      id = `creator-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem(CREATOR_ID_KEY, id)
    }
    creatorId.value = id
  }

  /**
   * Toggle ignore mode
   */
  const toggleIgnoreMode = async () => {
    const newValue = !ticketsStore.ignoreMode

    // Save to localStorage for quick UI response
    localStorage.setItem(IGNORE_MODE_KEY, String(newValue))
    ticketsStore.ignoreMode = newValue

    // Sync with backend (don't wait for it to succeed for UI)
    try {
      await fetch('/api/tickets/settings/ignore-mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ignoreMode: newValue })
      })
    } catch (err) {
      console.error('Failed to sync ignore mode with backend:', err)
      // UI already updated, so no action needed
    }
  }

  /**
   * Load ignore mode from backend
   */
  const loadIgnoreMode = async () => {
    try {
      const response = await fetch('/api/tickets/settings/ignore-mode')
      if (response.ok) {
        const data = await response.json()
        ticketsStore.ignoreMode = data.ignoreMode
        localStorage.setItem(IGNORE_MODE_KEY, String(data.ignoreMode))
      }
    } catch (err) {
      // Fallback to localStorage if backend fails
      console.warn('Failed to load ignore mode from backend, using localStorage')
      const savedIgnoreMode = localStorage.getItem(IGNORE_MODE_KEY)
      if (savedIgnoreMode) {
        ticketsStore.ignoreMode = savedIgnoreMode === 'true'
      }
    }
  }

  /**
   * Load last collection timestamp
   */
  const loadLastCollection = async () => {
    try {
      const response = await fetch('/api/tickets/settings/last-collection')
      if (response.ok) {
        const data = await response.json()
        ticketsStore.lastCollection = data.lastCollection
      }
    } catch (err) {
      console.warn('Failed to load last collection from backend:', err)
    }
  }

  /**
   * Load estimated wait time
   */
  const loadEstimatedWaitTime = async () => {
    try {
      const response = await fetch('/api/tickets/estimated-wait-time')
      if (response.ok) {
        const data = await response.json()
        if (data.estimatedWaitTimeMinutes !== null) {
          ticketsStore.estimatedWaitTime = {
            minutes: data.estimatedWaitTimeMinutes,
            sampleSize: data.sampleSize
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load estimated wait time from backend:', err)
    }
  }

  /**
   * Load all ticket settings
   */
  const loadSettings = async () => {
    await Promise.all([
      loadIgnoreMode(),
      loadLastCollection(),
      loadEstimatedWaitTime()
    ])
  }

  // Initialize creator ID on mount
  onMounted(() => {
    initCreatorId()
  })

  return {
    creatorId,
    initCreatorId,
    toggleIgnoreMode,
    loadIgnoreMode,
    loadLastCollection,
    loadEstimatedWaitTime,
    loadSettings
  }
}
