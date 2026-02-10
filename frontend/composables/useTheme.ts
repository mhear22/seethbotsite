import { ref, computed, watch, onMounted } from 'vue'
import { themeRepository } from '../repositories/theme.repository'
import { useAuth } from './useAuth'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  cardBackground: string
}

export interface ThemeOptions {
  darkMode: boolean
  highContrast: boolean
  reduceMotion: boolean
  soundsEnabled: boolean
  notificationSoundsEnabled: boolean
  musicEnabled: boolean
  soundVolume: number
}

export interface ThemePreset {
  name: string
  id: string
  colors: ThemeColors
  description: string
  icon: string
}

export interface ThemeSettings {
  currentPreset: string
  customColors: ThemeColors
  options: ThemeOptions
  customCSS: string
  useCustomColors: boolean
}

// Theme presets as specified in the ticket requirements
export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Light',
    id: 'light',
    colors: {
      primary: '#ff6b9d',
      secondary: '#ff8a80',
      accent: '#ffb6c1',
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      text: '#666666',
      cardBackground: 'rgba(255, 255, 255, 0.95)'
    },
    description: 'Light and bright theme with warm colors',
    icon: '☀️'
  },
  {
    name: 'Dark',
    id: 'dark',
    colors: {
      primary: '#ec4899',
      secondary: '#f97316',
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      text: '#e5e5e5',
      cardBackground: 'rgba(26, 26, 46, 0.95)'
    },
    description: 'Dark theme with rich colors',
    icon: '🌙'
  },
  {
    name: 'Forest',
    id: 'forest',
    colors: {
      primary: '#2d6a4f',
      secondary: '#40916c',
      accent: '#95d5b2',
      background: 'linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 100%)',
      text: '#1b4332',
      cardBackground: 'rgba(255, 255, 255, 0.95)'
    },
    description: 'Peaceful forest greens for a nature-inspired theme',
    icon: '🌲'
  },
  {
    name: 'Ocean',
    id: 'ocean',
    colors: {
      primary: '#00a8cc',
      secondary: '#4facfe',
      accent: '#64f4c7',
      background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
      text: '#37474f',
      cardBackground: 'rgba(255, 255, 255, 0.95)'
    },
    description: 'Fresh ocean vibes with cool blues and teals',
    icon: '🌊'
  },
  {
    name: 'Sunset',
    id: 'sunset',
    colors: {
      primary: '#f59e0b',
      secondary: '#fb923c',
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      text: '#78350f',
      cardBackground: 'rgba(255, 255, 255, 0.95)'
    },
    description: 'Warm sunset colors in oranges and ambers',
    icon: '🌅'
  },
  {
    name: 'Cyberpunk',
    id: 'cyberpunk',
    colors: {
      primary: '#ff00ff',
      secondary: '#00ffff',
      accent: '#ffff00',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      text: '#00ffcc',
      cardBackground: 'rgba(26, 26, 46, 0.95)'
    },
    description: 'Vibrant neon colors for a futuristic cyberpunk look',
    icon: '🤖'
  }
]

// Default colors for custom theme
const DEFAULT_CUSTOM_COLORS: ThemeColors = {
  primary: '#ff6b9d',
  secondary: '#ff8a80',
  accent: '#ffb6c1',
  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  text: '#666666',
  cardBackground: 'rgba(255, 255, 255, 0.95)'
}

// Default options
const DEFAULT_OPTIONS: ThemeOptions = {
  darkMode: false,
  highContrast: false,
  reduceMotion: false,
  soundsEnabled: true,
  notificationSoundsEnabled: true,
  musicEnabled: true,
  soundVolume: 0.5
}

// Custom style element ID
const CUSTOM_STYLE_ID = 'custom-theme-styles'

export function useTheme() {
  const { isAuthenticated } = useAuth()

  // Load theme settings from localStorage
  const savedSettings = localStorage.getItem('themeSettings')
  const initialSettings: ThemeSettings = savedSettings ? {
    ...{
      currentPreset: 'light',
      customColors: DEFAULT_CUSTOM_COLORS,
      options: DEFAULT_OPTIONS,
      customCSS: '',
      useCustomColors: false
    },
    ...JSON.parse(savedSettings)
  } : {
    currentPreset: 'light',
    customColors: DEFAULT_CUSTOM_COLORS,
    options: DEFAULT_OPTIONS,
    customCSS: '',
    useCustomColors: false
  }

  const settings = ref<ThemeSettings>(initialSettings)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Current colors based on settings
  const currentColors = computed<ThemeColors>(() => {
    if (settings.value.useCustomColors) {
      return settings.value.customColors
    }
    const preset = THEME_PRESETS.find(p => p.id === settings.value.currentPreset)
    return preset?.colors || DEFAULT_CUSTOM_COLORS
  })

  // Current preset info
  const currentPreset = computed<ThemePreset | undefined>(() => {
    return THEME_PRESETS.find(p => p.id === settings.value.currentPreset)
  })

  // Apply theme colors to CSS variables
  const applyThemeColors = (colors: ThemeColors) => {
    const root = document.documentElement

    // Set CSS custom properties (variables) as required by the ticket
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-background', colors.background)
    root.style.setProperty('--color-text', colors.text)
    root.style.setProperty('--color-accent', colors.accent)
    root.style.setProperty('--color-card-bg', colors.cardBackground)

    // Also set legacy theme variables for compatibility
    root.style.setProperty('--theme-primary', colors.primary)
    root.style.setProperty('--theme-secondary', colors.secondary)
    root.style.setProperty('--theme-accent', colors.accent)
    root.style.setProperty('--theme-background', colors.background)
    root.style.setProperty('--theme-text', colors.text)
    root.style.setProperty('--theme-card-bg', colors.cardBackground)

    // Update body background
    document.body.style.background = colors.background

    // Update text colors
    document.body.style.color = colors.text

    // Apply high contrast if enabled
    if (settings.value.options.highContrast) {
      root.style.setProperty('--color-text', '#000000')
      document.body.style.color = '#000000'
    }
  }

  // Apply motion preferences
  const applyMotionPreferences = () => {
    const body = document.body
    if (settings.value.options.reduceMotion) {
      body.classList.add('reduce-motion')
      body.style.setProperty('--animation-duration', '0s')
    } else {
      body.classList.remove('reduce-motion')
      body.style.removeProperty('--animation-duration')
    }
  }

  // Apply sound preferences
  const applySoundPreferences = () => {
    // Store sound preferences in localStorage for useAudio composable
    const soundPrefs = {
      soundsEnabled: settings.value.options.soundsEnabled,
      notificationSoundsEnabled: settings.value.options.notificationSoundsEnabled,
      musicEnabled: settings.value.options.musicEnabled,
      soundVolume: settings.value.options.soundVolume
    }
    localStorage.setItem('soundPreferences', JSON.stringify(soundPrefs))
  }

  // Apply custom CSS
  const applyCustomCSS = (css: string) => {
    let styleEl = document.getElementById(CUSTOM_STYLE_ID) as HTMLStyleElement

    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = CUSTOM_STYLE_ID
      document.head.appendChild(styleEl)
    }

    styleEl.textContent = css
  }

  // Remove custom CSS
  const removeCustomCSS = () => {
    const styleEl = document.getElementById(CUSTOM_STYLE_ID)
    if (styleEl) {
      styleEl.remove()
    }
  }

  // Apply complete theme
  const applyTheme = () => {
    applyThemeColors(currentColors.value)
    applyMotionPreferences()
    applySoundPreferences()

    if (settings.value.customCSS) {
      applyCustomCSS(settings.value.customCSS)
    } else {
      removeCustomCSS()
    }
  }

  // Load theme from backend
  const loadThemeFromBackend = async () => {
    if (!isAuthenticated.value) {
      return
    }

    try {
      isLoading.value = true
      error.value = null
      const preferences = await themeRepository.getThemePreferences()

      // Map backend preferences to local settings
      settings.value = {
        currentPreset: preferences.preset,
        customColors: {
          primary: preferences.customColors.primary,
          secondary: preferences.customColors.primary, // Map primary to secondary
          accent: preferences.customColors.accent,
          background: preferences.customColors.background,
          text: preferences.customColors.text,
          cardBackground: preferences.customColors.cardBackground
        },
        options: {
          darkMode: preferences.options.darkMode,
          highContrast: preferences.options.highContrast,
          reduceMotion: preferences.options.reduceMotion,
          soundsEnabled: preferences.options.soundsEnabled ?? DEFAULT_OPTIONS.soundsEnabled,
          notificationSoundsEnabled: preferences.options.notificationSoundsEnabled ?? DEFAULT_OPTIONS.notificationSoundsEnabled,
          musicEnabled: preferences.options.musicEnabled ?? DEFAULT_OPTIONS.musicEnabled,
          soundVolume: preferences.options.soundVolume ?? DEFAULT_OPTIONS.soundVolume
        },
        customCSS: '',
        useCustomColors: false
      }

      applyTheme()
    } catch (err) {
      console.error('Failed to load theme from backend:', err)
      error.value = 'Failed to load theme preferences'
    } finally {
      isLoading.value = false
    }
  }

  // Save theme to backend
  const saveThemeToBackend = async () => {
    if (!isAuthenticated.value) {
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const preferences = {
        preset: settings.value.currentPreset,
        customColors: {
          primary: settings.value.customColors.primary,
          background: settings.value.customColors.background,
          text: settings.value.customColors.text,
          accent: settings.value.customColors.accent,
          cardBackground: settings.value.customColors.cardBackground
        },
        options: {
          darkMode: settings.value.options.darkMode,
          highContrast: settings.value.options.highContrast,
          reduceMotion: settings.value.options.reduceMotion,
          soundsEnabled: settings.value.options.soundsEnabled,
          notificationSoundsEnabled: settings.value.options.notificationSoundsEnabled,
          musicEnabled: settings.value.options.musicEnabled,
          soundVolume: settings.value.options.soundVolume
        }
      }

      await themeRepository.updateThemePreferences(preferences)
    } catch (err) {
      console.error('Failed to save theme to backend:', err)
      error.value = 'Failed to save theme preferences'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Change preset
  const setPreset = async (presetId: string) => {
    settings.value.currentPreset = presetId
    settings.value.useCustomColors = false
    saveSettings()
    applyTheme()

    // Save to backend if authenticated
    if (isAuthenticated.value) {
      try {
        await saveThemeToBackend()
      } catch (err) {
        console.error('Failed to sync theme to backend:', err)
      }
    }
  }

  // Update custom color
  const updateCustomColor = async (colorKey: keyof ThemeColors, value: string) => {
    settings.value.customColors[colorKey] = value
    settings.value.useCustomColors = true
    saveSettings()
    applyTheme()

    // Save to backend if authenticated
    if (isAuthenticated.value) {
      try {
        await saveThemeToBackend()
      } catch (err) {
        console.error('Failed to sync theme to backend:', err)
      }
    }
  }

  // Set all custom colors at once
  const setCustomColors = async (colors: ThemeColors) => {
    settings.value.customColors = { ...colors }
    settings.value.useCustomColors = true
    saveSettings()
    applyTheme()

    // Save to backend if authenticated
    if (isAuthenticated.value) {
      try {
        await saveThemeToBackend()
      } catch (err) {
        console.error('Failed to sync theme to backend:', err)
      }
    }
  }

  // Update options (darkMode, highContrast, reduceMotion)
  const updateOption = async (optionKey: keyof ThemeOptions, value: boolean) => {
    settings.value.options[optionKey] = value
    saveSettings()
    applyTheme()

    // Save to backend if authenticated
    if (isAuthenticated.value) {
      try {
        await saveThemeToBackend()
      } catch (err) {
        console.error('Failed to sync theme to backend:', err)
      }
    }
  }

  // Update custom CSS
  const updateCustomCSS = (css: string) => {
    settings.value.customCSS = css
    saveSettings()
    if (css) {
      applyCustomCSS(css)
    } else {
      removeCustomCSS()
    }
  }

  // Reset to preset
  const resetToPreset = (presetId: string) => {
    setPreset(presetId)
    settings.value.customCSS = ''
    saveSettings()
  }

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('themeSettings', JSON.stringify(settings.value))
  }

  // Export current theme
  const exportTheme = () => {
    return JSON.stringify(settings.value, null, 2)
  }

  // Import theme
  const importTheme = (themeJson: string) => {
    try {
      const imported = JSON.parse(themeJson) as Partial<ThemeSettings>
      // Validate the imported theme
      if (imported.customColors && typeof imported.customColors === 'object') {
        // Merge with current settings to preserve options if not provided
        settings.value = {
          currentPreset: imported.currentPreset || settings.value.currentPreset,
          customColors: imported.customColors,
          options: imported.options || settings.value.options,
          customCSS: imported.customCSS || '',
          useCustomColors: imported.useCustomColors ?? settings.value.useCustomColors
        }
        saveSettings()
        applyTheme()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  // Watch for settings changes and auto-apply
  watch(() => settings.value, () => {
    // Save to localStorage automatically
    localStorage.setItem('themeSettings', JSON.stringify(settings.value))
  }, { deep: true })

  // Initialize theme on mount and load from backend if authenticated
  onMounted(async () => {
    applyTheme()

    // Load theme from backend if user is authenticated
    if (isAuthenticated.value) {
      await loadThemeFromBackend()
    }
  })

  return {
    // State
    settings,
    currentColors,
    currentPreset,
    presets: THEME_PRESETS,
    isLoading,
    error,

    // Actions
    setPreset,
    updateCustomColor,
    setCustomColors,
    updateOption,
    updateCustomCSS,
    resetToPreset,
    applyTheme,
    exportTheme,
    importTheme,
    loadThemeFromBackend,
    saveThemeToBackend,

    // Preset list
    allPresets: THEME_PRESETS
  }
}
