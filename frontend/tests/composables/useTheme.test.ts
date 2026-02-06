/**
 * Tests for useTheme composable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTheme, THEME_PRESETS } from '../../composables/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
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
      const { settings } = useTheme()

      expect(settings.value.currentPreset).toBe('default')
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
        customCSS: '.test { color: red; }',
        useCustomColors: true
      }
      localStorage.setItem('themeSettings', JSON.stringify(saved))

      const { settings } = useTheme()

      expect(settings.value.currentPreset).toBe('ocean')
      expect(settings.value.customColors.primary).toBe('#111111')
      expect(settings.value.customCSS).toBe('.test { color: red; }')
      expect(settings.value.useCustomColors).toBe(true)
    })
  })

  describe('currentColors', () => {
    it('should return preset colors by default', () => {
      const { currentColors } = useTheme()
      const defaultPreset = THEME_PRESETS.find(p => p.id === 'default')!

      expect(currentColors.value.primary).toBe(defaultPreset.colors.primary)
      expect(currentColors.value.secondary).toBe(defaultPreset.colors.secondary)
      expect(currentColors.value.accent).toBe(defaultPreset.colors.accent)
    })

    it('should return custom colors when useCustomColors is true', () => {
      const saved = {
        currentPreset: 'default',
        customColors: {
          primary: '#aaaaaa',
          secondary: '#bbbbbb',
          accent: '#cccccc',
          background: '#dddddd',
          text: '#eeeeee',
          cardBackground: '#ffffff'
        },
        customCSS: '',
        useCustomColors: true
      }
      localStorage.setItem('themeSettings', JSON.stringify(saved))

      const { currentColors } = useTheme()

      expect(currentColors.value.primary).toBe('#aaaaaa')
      expect(currentColors.value.secondary).toBe('#bbbbbb')
    })
  })

  describe('setPreset', () => {
    it('should change preset and apply theme', () => {
      const { settings, setPreset } = useTheme()

      setPreset('ocean')

      expect(settings.value.currentPreset).toBe('ocean')
      // Should save to localStorage
      const stored = JSON.parse(localStorage.getItem('themeSettings')!)
      expect(stored.currentPreset).toBe('ocean')
    })

    it('should set useCustomColors to false', () => {
      const saved = {
        currentPreset: 'default',
        customColors: {
          primary: '#aaaaaa',
          secondary: '#bbbbbb',
          accent: '#cccccc',
          background: '#dddddd',
          text: '#eeeeee',
          cardBackground: '#ffffff'
        },
        customCSS: '',
        useCustomColors: true
      }
      localStorage.setItem('themeSettings', JSON.stringify(saved))

      const { settings, setPreset } = useTheme()

      expect(settings.value.useCustomColors).toBe(true)

      setPreset('lavender')

      expect(settings.value.useCustomColors).toBe(false)
      expect(settings.value.currentPreset).toBe('lavender')
    })
  })

  describe('updateCustomColor', () => {
    it('should set useCustomColors to true', () => {
      const { settings, updateCustomColor } = useTheme()

      expect(settings.value.useCustomColors).toBe(false)

      updateCustomColor('primary', '#ff0000')

      expect(settings.value.useCustomColors).toBe(true)
      expect(settings.value.customColors.primary).toBe('#ff0000')
    })
  })

  describe('setCustomColors', () => {
    it('should set all custom colors at once', () => {
      const { settings, setCustomColors } = useTheme()

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
    })
  })

  describe('updateCustomCSS', () => {
    it('should create style element with custom CSS', () => {
      const { updateCustomCSS } = useTheme()

      updateCustomCSS('.my-class { color: blue; }')

      const styleEl = document.getElementById('custom-theme-styles')
      expect(styleEl).not.toBeNull()
      expect(styleEl!.textContent).toBe('.my-class { color: blue; }')
    })

    it('should remove style element when CSS is empty', () => {
      const { updateCustomCSS } = useTheme()

      // First create the style element
      updateCustomCSS('.my-class { color: blue; }')
      expect(document.getElementById('custom-theme-styles')).not.toBeNull()

      // Then clear it
      updateCustomCSS('')

      expect(document.getElementById('custom-theme-styles')).toBeNull()
    })
  })

  describe('resetToPreset', () => {
    it('should reset to the given preset and clear customCSS', () => {
      const { settings, updateCustomCSS, resetToPreset } = useTheme()

      updateCustomCSS('.test { color: red; }')
      expect(settings.value.customCSS).toBe('.test { color: red; }')

      resetToPreset('mint')

      expect(settings.value.currentPreset).toBe('mint')
      expect(settings.value.customCSS).toBe('')
      expect(settings.value.useCustomColors).toBe(false)
    })
  })

  describe('exportTheme', () => {
    it('should return a JSON string of the current settings', () => {
      const { settings, exportTheme } = useTheme()

      const exported = exportTheme()
      const parsed = JSON.parse(exported)

      expect(parsed.currentPreset).toBe(settings.value.currentPreset)
      expect(parsed.customColors).toEqual(settings.value.customColors)
      expect(parsed.customCSS).toBe(settings.value.customCSS)
      expect(parsed.useCustomColors).toBe(settings.value.useCustomColors)
    })
  })

  describe('importTheme', () => {
    it('should apply a valid theme JSON', () => {
      const { settings, importTheme } = useTheme()

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
        customCSS: '.imported { font-size: 20px; }',
        useCustomColors: true
      }

      const result = importTheme(JSON.stringify(themeToImport))

      expect(result).toBe(true)
      expect(settings.value.currentPreset).toBe('sunset')
      expect(settings.value.customColors.primary).toBe('#aa0000')
      expect(settings.value.customCSS).toBe('.imported { font-size: 20px; }')
    })

    it('should return false for invalid JSON', () => {
      const { importTheme } = useTheme()

      const result = importTheme('not valid json {{{')

      expect(result).toBe(false)
    })
  })

  describe('presets', () => {
    it('should have 8 presets', () => {
      expect(THEME_PRESETS).toHaveLength(8)
    })

    it('should include expected preset ids', () => {
      const ids = THEME_PRESETS.map(p => p.id)
      expect(ids).toContain('default')
      expect(ids).toContain('ocean')
      expect(ids).toContain('lavender')
      expect(ids).toContain('mint')
      expect(ids).toContain('sunset')
      expect(ids).toContain('neon')
      expect(ids).toContain('midnight')
      expect(ids).toContain('forest')
    })
  })
})
