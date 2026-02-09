/**
 * Game Settings Composable
 * Manages configurable game settings with localStorage persistence
 */

import { ref, watch } from 'vue'

export interface GameSettings {
  mouseSensitivity: number
  movementSpeed: number
  invertMouseX: boolean
  invertMouseY: boolean
  keyBindings: {
    forward: string
    backward: string
    left: string
    right: string
    jump: string
    dash: string
  }
}

const DEFAULT_SETTINGS: GameSettings = {
  mouseSensitivity: 6.0, // Multiplier for mouse sensitivity (6.0 = default, 2x faster)
  movementSpeed: 10.0, // Multiplier for movement speed (10.0 = default, slower)
  invertMouseX: false,
  invertMouseY: false,
  keyBindings: {
    forward: 'KeyW',
    backward: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    jump: 'Space',
    dash: 'ShiftLeft'
  }
}

const STORAGE_KEY = 'mech-game-settings'

// Load settings from localStorage
function loadSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        mouseSensitivity: parsed.mouseSensitivity ?? DEFAULT_SETTINGS.mouseSensitivity,
        movementSpeed: parsed.movementSpeed ?? DEFAULT_SETTINGS.movementSpeed,
        invertMouseX: parsed.invertMouseX ?? DEFAULT_SETTINGS.invertMouseX,
        invertMouseY: parsed.invertMouseY ?? DEFAULT_SETTINGS.invertMouseY,
        keyBindings: parsed.keyBindings ?? DEFAULT_SETTINGS.keyBindings,
      }
    }
  } catch (error) {
    console.error('Failed to load game settings:', error)
  }
  return { ...DEFAULT_SETTINGS }
}

// Save settings to localStorage
function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save game settings:', error)
  }
}

// Shared reactive state
const settings = ref<GameSettings>(loadSettings())

// Watch for changes and auto-save
watch(settings, (newSettings) => {
  saveSettings(newSettings)
}, { deep: true })

export function useGameSettings() {
  const updateSettings = (updates: Partial<GameSettings>) => {
    settings.value = { ...settings.value, ...updates }
  }

  const resetToDefaults = () => {
    settings.value = { ...DEFAULT_SETTINGS }
  }

  return {
    settings,
    updateSettings,
    resetToDefaults,
  }
}
