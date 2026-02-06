import { ref, computed, watch } from 'vue'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  cardBackground: string
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
  customCSS: string
  useCustomColors: boolean
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Default Cute',
    id: 'default',
    colors: {
      primary: '#ff6b9d',
      secondary: '#ff8a80',
      accent: '#ffb6c1',
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      text: '#666666',
      cardBackground: 'rgba(255, 255, 255, 0.95)'
    },
    description: 'The classic cute theme with soft pinks and warm gradients',
    icon: '💖'
  },
  {
    name: 'Ocean Blue',
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
    name: 'Lavender Dream',
    id: 'lavender',
    colors: {
      primary: '#9333ea',
      secondary: '#c084fc',
      accent: '#e879f9',
      background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
      text: '#581c87',
      cardBackground: 'rgba(255, 255, 255, 0.95)'
    },
    description: 'Mystical purple theme with soft lavender tones',
    icon: '💜'
  },
  {
    name: 'Mint Fresh',
    id: 'mint',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#6ee7b7',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      text: '#064e3b',
      cardBackground: 'rgba(255, 255, 255, 0.95)'
    },
    description: 'Refreshing mint greens for a clean look',
    icon: '🌿'
  },
  {
    name: 'Sunset Glow',
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
    name: 'Cyber Neon',
    id: 'neon',
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
  },
  {
    name: 'Midnight Gold',
    id: 'midnight',
    colors: {
      primary: '#ffd700',
      secondary: '#ffb700',
      accent: '#ffed4e',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
      text: '#e5e5e5',
      cardBackground: 'rgba(26, 26, 46, 0.95)'
    },
    description: 'Elegant dark theme with gold accents',
    icon: '✨'
  },
  {
    name: 'Forest Serenity',
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

// Custom style element ID
const CUSTOM_STYLE_ID = 'custom-theme-styles'

export function useTheme() {
  // Load theme settings from localStorage
  const savedSettings = localStorage.getItem('themeSettings')
  const initialSettings: ThemeSettings = savedSettings ? JSON.parse(savedSettings) : {
    currentPreset: 'default',
    customColors: DEFAULT_CUSTOM_COLORS,
    customCSS: '',
    useCustomColors: false
  }

  const settings = ref<ThemeSettings>(initialSettings)

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

    // Set CSS custom properties (variables)
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

    if (settings.value.customCSS) {
      applyCustomCSS(settings.value.customCSS)
    } else {
      removeCustomCSS()
    }
  }

  // Change preset
  const setPreset = (presetId: string) => {
    settings.value.currentPreset = presetId
    settings.value.useCustomColors = false
    saveSettings()
    applyTheme()
  }

  // Update custom color
  const updateCustomColor = (colorKey: keyof ThemeColors, value: string) => {
    settings.value.customColors[colorKey] = value
    settings.value.useCustomColors = true
    saveSettings()
    applyTheme()
  }

  // Set all custom colors at once
  const setCustomColors = (colors: ThemeColors) => {
    settings.value.customColors = { ...colors }
    settings.value.useCustomColors = true
    saveSettings()
    applyTheme()
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
      const imported = JSON.parse(themeJson) as ThemeSettings
      // Validate the imported theme
      if (imported.customColors && typeof imported.customColors === 'object') {
        settings.value = imported
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

  // Initialize theme on mount
  applyTheme()

  return {
    // State
    settings,
    currentColors,
    currentPreset,
    presets: THEME_PRESETS,

    // Actions
    setPreset,
    updateCustomColor,
    setCustomColors,
    updateCustomCSS,
    resetToPreset,
    applyTheme,
    exportTheme,
    importTheme,

    // Preset list
    allPresets: THEME_PRESETS
  }
}
