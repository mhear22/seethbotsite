/**
 * Game Settings Composable
 * Manages configurable game settings with localStorage persistence
 */

import { ref, watch } from 'vue'

export type AIDifficulty = 'tutorial' | 'easy' | 'medium' | 'hard' | 'boss'
export type ShadowQuality = 'off' | 'low' | 'medium' | 'high'
export type RenderScale = 0.5 | 0.75 | 1.0

export interface GraphicsSettings {
  shadowQuality: ShadowQuality
  antialias: boolean
  renderScale: RenderScale
  showFPS: boolean
  /**
   * Reduced motion (Phase 5 polish / a11y). When true, camera screen-shake and
   * FOV kicks (footfall/landing/dash/hit) are suppressed. It rides the existing
   * `graphics` object that BattleScene/StoryWorld already receive, so scenes read
   * it with no new plumbing — see `motionScale()` and the integrator seam note.
   */
  reducedMotion: boolean
}

/**
 * Effect multiplier the scenes should apply to shake/FOV-kick magnitudes:
 * 0 when reduced motion is on, 1 otherwise. INTEGRATOR SEAM (scene-side read):
 * CameraController.triggerShake / triggerFovKick / footstep / landing (and any
 * hit-shake) multiply their intensity by this, sourced from the `graphics`
 * settings the scene is constructed with. Kept as a pure helper so both the
 * settings UI and the scenes agree on the mapping.
 */
export function motionScale(graphics: Pick<GraphicsSettings, 'reducedMotion'>): number {
  return graphics.reducedMotion ? 0 : 1
}

/** OS-level reduced-motion preference, used as the first-run default. Safe in
 *  non-browser/test contexts (returns false when matchMedia is unavailable). */
function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export interface GameSettings {
  mouseSensitivity: number
  movementSpeed: number
  invertMouseX: boolean
  invertMouseY: boolean
  aiDifficulty: AIDifficulty
  graphics: GraphicsSettings
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
  aiDifficulty: 'medium',
  graphics: {
    shadowQuality: 'medium',
    antialias: true,
    renderScale: 1.0,
    showFPS: true,
    // Honour the OS accessibility preference on first run; the user can override
    // it either way in Settings and the choice then persists.
    reducedMotion: prefersReducedMotion(),
  },
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
  // Node/SSR/test contexts have no localStorage — fall back to defaults silently
  // (the module is imported by node-env unit tests for e.g. `motionScale`).
  if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        mouseSensitivity: parsed.mouseSensitivity ?? DEFAULT_SETTINGS.mouseSensitivity,
        movementSpeed: parsed.movementSpeed ?? DEFAULT_SETTINGS.movementSpeed,
        invertMouseX: parsed.invertMouseX ?? DEFAULT_SETTINGS.invertMouseX,
        invertMouseY: parsed.invertMouseY ?? DEFAULT_SETTINGS.invertMouseY,
        aiDifficulty: parsed.aiDifficulty ?? DEFAULT_SETTINGS.aiDifficulty,
        graphics: {
          shadowQuality: parsed.graphics?.shadowQuality ?? DEFAULT_SETTINGS.graphics.shadowQuality,
          antialias: parsed.graphics?.antialias ?? DEFAULT_SETTINGS.graphics.antialias,
          renderScale: parsed.graphics?.renderScale ?? DEFAULT_SETTINGS.graphics.renderScale,
          showFPS: parsed.graphics?.showFPS ?? DEFAULT_SETTINGS.graphics.showFPS,
          reducedMotion: parsed.graphics?.reducedMotion ?? DEFAULT_SETTINGS.graphics.reducedMotion,
        },
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
  if (typeof localStorage === 'undefined') return
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
