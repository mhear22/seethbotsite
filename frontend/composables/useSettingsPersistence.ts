/**
 * Settings Persistence Composable
 *
 * Handles localStorage sync and settings validation.
 * Separated from auth store for better modularity and testability.
 */

import { ref, watch } from 'vue'

export interface Settings {
  darkMode: boolean
  darkerMode: boolean
  chaosMode: boolean
  moldMode: boolean
  performanceMode: boolean
  showHearts: boolean
  maxHearts: number
  heartSpawnRate: number
  musicPlaying: boolean
  isMuted: boolean
  currentQuoteIndex: number
  showBreadcrumb: boolean
}

export type SettingsKey = keyof Settings

/**
 * Composable for settings persistence
 */
export const useSettingsPersistence = () => {
  const settings = ref<Settings>({
    darkMode: localStorage.getItem('darkMode') === 'true',
    darkerMode: localStorage.getItem('darkerMode') === 'true',
    chaosMode: localStorage.getItem('chaosMode') === 'true',
    moldMode: localStorage.getItem('moldMode') === 'true',
    performanceMode: localStorage.getItem('performanceMode') !== 'false',
    showHearts: localStorage.getItem('showHearts') !== 'false',
    maxHearts: parseInt(localStorage.getItem('maxHearts') || '20'),
    heartSpawnRate: parseInt(localStorage.getItem('heartSpawnRate') || '125'),
    musicPlaying: false,
    isMuted: false,
    currentQuoteIndex: parseInt(localStorage.getItem('currentQuoteIndex') || '0'),
    showBreadcrumb: localStorage.getItem('showBreadcrumb') !== 'false'
  })

  /**
   * Save a single setting to localStorage
   */
  const saveSetting = <K extends SettingsKey>(key: K, value: Settings[K]): void => {
    settings.value[key] = value

    if (typeof value === 'boolean') {
      localStorage.setItem(key, value.toString())
    } else if (typeof value === 'number') {
      localStorage.setItem(key, value.toString())
    } else {
      localStorage.setItem(key, String(value))
    }
  }

  /**
   * Save multiple settings at once
   */
  const saveSettings = (newSettings: Partial<Settings>): boolean => {
    try {
      Object.entries(newSettings).forEach(([key, value]) => {
        if (key in settings.value) {
          saveSetting(key as SettingsKey, value as Settings[SettingsKey])
        }
      })
      return true
    } catch (error) {
      console.error('Failed to save settings:', error)
      return false
    }
  }

  /**
   * Load a single setting from localStorage
   */
  const loadSetting = <K extends SettingsKey>(key: K): Settings[K] | null => {
    const value = localStorage.getItem(key)
    if (value === null) return null

    // Type conversion based on default value type
    const defaultValue = settings.value[key]
    if (typeof defaultValue === 'boolean') {
      return (value === 'true') as Settings[K]
    } else if (typeof defaultValue === 'number') {
      return parseInt(value) as Settings[K]
    }

    return value as Settings[K]
  }

  /**
   * Load all settings from localStorage
   */
  const loadAllSettings = (): Settings => {
    const loadedSettings: Partial<Settings> = {}

    Object.keys(settings.value).forEach((key) => {
      const value = loadSetting(key as SettingsKey)
      if (value !== null) {
        loadedSettings[key as SettingsKey] = value
      }
    })

    return { ...settings.value, ...loadedSettings }
  }

  /**
   * Reset all settings to defaults
   */
  const resetSettings = (): void => {
    const defaults: Settings = {
      darkMode: false,
      darkerMode: false,
      chaosMode: false,
      moldMode: false,
      performanceMode: true,
      showHearts: true,
      maxHearts: 20,
      heartSpawnRate: 125,
      musicPlaying: false,
      isMuted: false,
      currentQuoteIndex: 0,
      showBreadcrumb: true
    }

    Object.entries(defaults).forEach(([key, value]) => {
      saveSetting(key as SettingsKey, value as Settings[SettingsKey])
    })

    settings.value = defaults
  }

  /**
   * Validate a setting value
   */
  const validateSetting = <K extends SettingsKey>(
    key: K,
    value: Settings[K]
  ): { valid: boolean; error?: string } => {
    // Boolean settings validation
    if (typeof settings.value[key] === 'boolean') {
      if (typeof value !== 'boolean') {
        return { valid: false, error: `${key} must be a boolean` }
      }
      return { valid: true }
    }

    // Number settings validation
    if (typeof settings.value[key] === 'number') {
      if (typeof value !== 'number') {
        return { valid: false, error: `${key} must be a number` }
      }

      // Specific validations
      if (key === 'maxHearts') {
        if (value < 1 || value > 100) {
          return { valid: false, error: 'maxHearts must be between 1 and 100' }
        }
      }

      if (key === 'heartSpawnRate') {
        if (value < 50 || value > 5000) {
          return { valid: false, error: 'heartSpawnRate must be between 50 and 5000' }
        }
      }

      if (key === 'currentQuoteIndex') {
        if (value < 0) {
          return { valid: false, error: 'currentQuoteIndex must be non-negative' }
        }
      }

      return { valid: true }
    }

    return { valid: true }
  }

  /**
   * Export settings as JSON
   */
  const exportSettings = (): string => {
    return JSON.stringify(settings.value, null, 2)
  }

  /**
   * Import settings from JSON
   */
  const importSettings = (json: string): { success: boolean; error?: string } => {
    try {
      const imported = JSON.parse(json)

      // Validate all settings
      for (const [key, value] of Object.entries(imported)) {
        if (key in settings.value) {
          const validation = validateSetting(key as SettingsKey, value as Settings[SettingsKey])
          if (!validation.valid) {
            return { success: false, error: validation.error }
          }
        }
      }

      saveSettings(imported)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Invalid JSON format' }
    }
  }

  /**
   * Watch settings for changes and auto-save
   */
  const watchSettings = () => {
    watch(
      settings,
      (newSettings) => {
        Object.entries(newSettings).forEach(([key, value]) => {
          const typedKey = key as SettingsKey
          const currentValue = localStorage.getItem(key)

          let serializedValue: string
          if (typeof value === 'boolean') {
            serializedValue = value.toString()
          } else if (typeof value === 'number') {
            serializedValue = value.toString()
          } else {
            serializedValue = String(value)
          }

          if (currentValue !== serializedValue) {
            localStorage.setItem(key, serializedValue)
          }
        })
      },
      { deep: true }
    )
  }

  return {
    // State
    settings,

    // Actions
    saveSetting,
    saveSettings,
    loadSetting,
    loadAllSettings,
    resetSettings,
    validateSetting,
    exportSettings,
    importSettings,
    watchSettings
  }
}
