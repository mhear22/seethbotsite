/**
 * Tests for useTheme composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useTheme, THEME_PRESETS } from '../../composables/useTheme'

// Mock useAuth
vi.mock('../../composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: { value: false }
  })
}))

/**
 * Helper to mount a composable within a proper Vue component context.
 * Required because useTheme uses onMounted.
 */
function withSetup<T>(composable: () => T) {
  let result: T
  const app = createApp(
    defineComponent({
      setup() {
        result = composable()
        return () => {}
      },
    })
  )
  const root = document.createElement('div')
  document.body.appendChild(root)
  app.mount(root)
  return { result: result!, app, root }
}

describe('useTheme', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    // Clean up any custom style elements from prior tests
    const styleEl = document.getElementById('custom-theme-styles')
    if (styleEl) styleEl.remove()
    // Reset inline styles on documentElement and body
    document.documentElement.style.cssText = ''
    document.body.style.cssText = ''
  })

  describe('initialization', () => {
    it('should initialize with default settings when no localStorage', () => {
      const instance = withSetup(() => useTheme())
      const { settings } = instance.result

      expect(settings.value.currentPreset).toBe('light')
      expect(settings.value.customCSS).toBe('')
      expect(settings.value.useCustomColors).toBe(false)
      expect(settings.value.customColors).toEqual({
        primary: '#ff6b9d',
        secondary: '#ff8a80',
        accent: '#ffb6c1',
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        text: '#666666',
        cardBackground: 'rgba(255, 255, 255, 0.95)'
      })

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })

    it('should load settings from localStorage', () => {
      const saved = {
        currentPreset: 'ocean',
        customColors: {
          primary: '#111111',
          secondary: '#222222',
          accent: '#333333',
          background: '#444444',
          text: '#555555',
          cardBackground: '#666666'
        },
        options: {
          darkMode: false,
          highContrast: false,
          reduceMotion: false,
          soundsEnabled: true,
          notificationSoundsEnabled: true,
          musicEnabled: true,
          soundVolume: 0.5
        },
        customCSS: '.test { color: red; }',
        useCustomColors: true
      }
      localStorage.setItem('themeSettings', JSON.stringify(saved))

      const instance = withSetup(() => useTheme())
      const { settings } = instance.result

      expect(settings.value.currentPreset).toBe('ocean')
      expect(settings.value.customColors.primary).toBe('#111111')
      expect(settings.value.customCSS).toBe('.test { color: red; }')
      expect(settings.value.useCustomColors).toBe(true)

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })
  })

  describe('currentColors', () => {
    it('should return preset colors by default', () => {
      const instance = withSetup(() => useTheme())
      const { currentColors } = instance.result
      const lightPreset = THEME_PRESETS.find(p => p.id === 'light')!

      expect(currentColors.value.primary).toBe(lightPreset.colors.primary)
      expect(currentColors.value.secondary).toBe(lightPreset.colors.secondary)
      expect(currentColors.value.accent).toBe(lightPreset.colors.accent)

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })

    it('should return custom colors when useCustomColors is true', () => {
      const saved = {
        currentPreset: 'light',
        customColors: {
          primary: '#aaaaaa',
          secondary: '#bbbbbb',
          accent: '#cccccc',
          background: '#dddddd',
          text: '#eeeeee',
          cardBackground: '#ffffff'
        },
        options: {
          darkMode: false,
          highContrast: false,
          reduceMotion: false,
          soundsEnabled: true,
          notificationSoundsEnabled: true,
          musicEnabled: true,
          soundVolume: 0.5
        },
        customCSS: '',
        useCustomColors: true
      }
      localStorage.setItem('themeSettings', JSON.stringify(saved))

      const instance = withSetup(() => useTheme())
      const { currentColors } = instance.result

      expect(currentColors.value.primary).toBe('#aaaaaa')
      expect(currentColors.value.secondary).toBe('#bbbbbb')

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })
  })

  describe('setPreset', () => {
    it('should change preset and apply theme', () => {
      const instance = withSetup(() => useTheme())
      const { settings, setPreset } = instance.result

      setPreset('ocean')

      expect(settings.value.currentPreset).toBe('ocean')
      // Should save to localStorage
      const stored = JSON.parse(localStorage.getItem('themeSettings')!)
      expect(stored.currentPreset).toBe('ocean')

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })

    it('should set useCustomColors to false', () => {
      const saved = {
        currentPreset: 'light',
        customColors: {
          primary: '#aaaaaa',
          secondary: '#bbbbbb',
          accent: '#cccccc',
          background: '#dddddd',
          text: '#eeeeee',
          cardBackground: '#ffffff'
        },
        options: {
          darkMode: false,
          highContrast: false,
          reduceMotion: false,
          soundsEnabled: true,
          notificationSoundsEnabled: true,
          musicEnabled: true,
          soundVolume: 0.5
        },
        customCSS: '',
        useCustomColors: true
      }
      localStorage.setItem('themeSettings', JSON.stringify(saved))

      const instance = withSetup(() => useTheme())
      const { settings, setPreset } = instance.result

      expect(settings.value.useCustomColors).toBe(true)

      setPreset('forest')

      expect(settings.value.useCustomColors).toBe(false)
      expect(settings.value.currentPreset).toBe('forest')

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })
  })

  describe('updateCustomColor', () => {
    it('should set useCustomColors to true', () => {
      const instance = withSetup(() => useTheme())
      const { settings, updateCustomColor } = instance.result

      expect(settings.value.useCustomColors).toBe(false)

      updateCustomColor('primary', '#ff0000')

      expect(settings.value.useCustomColors).toBe(true)
      expect(settings.value.customColors.primary).toBe('#ff0000')

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })
  })

  describe('setCustomColors', () => {
    it('should set all custom colors at once', () => {
      const instance = withSetup(() => useTheme())
      const { settings, setCustomColors } = instance.result

      const newColors = {
        primary: '#110000',
        secondary: '#220000',
        accent: '#330000',
        background: '#440000',
        text: '#550000',
        cardBackground: '#660000'
      }

      setCustomColors(newColors)

      expect(settings.value.customColors).toEqual(newColors)
      expect(settings.value.useCustomColors).toBe(true)

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })
  })

  describe('updateCustomCSS', () => {
    it('should create style element with custom CSS', () => {
      const instance = withSetup(() => useTheme())
      const { updateCustomCSS } = instance.result

      updateCustomCSS('.my-class { color: blue; }')

      const styleEl = document.getElementById('custom-theme-styles')
      expect(styleEl).not.toBeNull()
      expect(styleEl!.textContent).toBe('.my-class { color: blue; }')

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })

    it('should remove style element when CSS is empty', () => {
      const instance = withSetup(() => useTheme())
      const { updateCustomCSS } = instance.result

      // First create the style element
      updateCustomCSS('.my-class { color: blue; }')
      expect(document.getElementById('custom-theme-styles')).not.toBeNull()

      // Then clear it
      updateCustomCSS('')

      expect(document.getElementById('custom-theme-styles')).toBeNull()

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })
  })

  describe('resetToPreset', () => {
    it('should reset to the given preset and clear customCSS', () => {
      const instance = withSetup(() => useTheme())
      const { settings, updateCustomCSS, resetToPreset } = instance.result

      updateCustomCSS('.test { color: red; }')
      expect(settings.value.customCSS).toBe('.test { color: red; }')

      resetToPreset('forest')

      expect(settings.value.currentPreset).toBe('forest')
      expect(settings.value.customCSS).toBe('')
      expect(settings.value.useCustomColors).toBe(false)

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })
  })

  describe('exportTheme', () => {
    it('should return a JSON string of the current settings', () => {
      const instance = withSetup(() => useTheme())
      const { settings, exportTheme } = instance.result

      const exported = exportTheme()
      const parsed = JSON.parse(exported)

      expect(parsed.currentPreset).toBe(settings.value.currentPreset)
      expect(parsed.customColors).toEqual(settings.value.customColors)
      expect(parsed.customCSS).toBe(settings.value.customCSS)
      expect(parsed.useCustomColors).toBe(settings.value.useCustomColors)

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })
  })

  describe('importTheme', () => {
    it('should apply a valid theme JSON', () => {
      const instance = withSetup(() => useTheme())
      const { settings, importTheme } = instance.result

      const themeToImport = {
        currentPreset: 'sunset',
        customColors: {
          primary: '#aa0000',
          secondary: '#bb0000',
          accent: '#cc0000',
          background: '#dd0000',
          text: '#ee0000',
          cardBackground: '#ff0000'
        },
        options: {
          darkMode: false,
          highContrast: false,
          reduceMotion: false,
          soundsEnabled: true,
          notificationSoundsEnabled: true,
          musicEnabled: true,
          soundVolume: 0.5
        },
        customCSS: '.imported { font-size: 20px; }',
        useCustomColors: true
      }

      const result = importTheme(JSON.stringify(themeToImport))

      expect(result).toBe(true)
      expect(settings.value.currentPreset).toBe('sunset')
      expect(settings.value.customColors.primary).toBe('#aa0000')
      expect(settings.value.customCSS).toBe('.imported { font-size: 20px; }')

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })

    it('should return false for invalid JSON', () => {
      const instance = withSetup(() => useTheme())
      const { importTheme } = instance.result

      const result = importTheme('not valid json {{{')

      expect(result).toBe(false)

      instance.app.unmount()
      if (instance.root.parentNode) instance.root.parentNode.removeChild(instance.root)
    })
  })

  describe('presets', () => {
    it('should have 6 presets', () => {
      expect(THEME_PRESETS).toHaveLength(6)
    })

    it('should include expected preset ids', () => {
      const ids = THEME_PRESETS.map(p => p.id)
      expect(ids).toContain('light')
      expect(ids).toContain('dark')
      expect(ids).toContain('forest')
      expect(ids).toContain('ocean')
      expect(ids).toContain('sunset')
      expect(ids).toContain('cyberpunk')
    })
  })
})
