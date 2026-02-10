import { ref } from 'vue'

// Sound file mappings
const SOUND_FILES = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  panelOpen: '/sounds/panel.mp3',
  honk: '/sounds/goose-honk.mp3',
  pointsEarned: '/sounds/points.mp3',
  notification: '/sounds/notification.mp3'
} as const

// Sound configuration for variety
const SOUND_CONFIG = {
  click: { volume: 0.5, rate: 1.0 + (Math.random() * 0.1 - 0.05) },
  success: { volume: 0.5, rate: 1.2 },
  error: { volume: 0.5, startTime: 0.5, rate: 1.0 },
  panelOpen: { volume: 0.5, rate: 0.8 },
  honk: { volume: 0.5, rate: 1.0 },
  pointsEarned: { volume: 0.5, rate: 1.3 },
  notification: { volume: 0.5, rate: 1.1 }
} as const

// Local storage keys
const STORAGE_KEYS = {
  VOLUME: 'audioVolume',
  MUTED: 'audioMuted',
  CATEGORY_CLICK: 'audioCategoryClick',
  CATEGORY_NOTIFICATION: 'audioCategoryNotification',
  CATEGORY_ACHIEVEMENT: 'audioCategoryAchievement',
  CATEGORY_UI: 'audioCategoryUI',
  CATEGORY_GOOSE: 'audioCategoryGoose'
}

// Sound category type
type SoundCategory = 'click' | 'notification' | 'achievement' | 'ui' | 'goose'

// Load preferences from localStorage
const loadPreferences = () => {
  try {
    const volume = localStorage.getItem(STORAGE_KEYS.VOLUME)
    const muted = localStorage.getItem(STORAGE_KEYS.MUTED)
    const click = localStorage.getItem(STORAGE_KEYS.CATEGORY_CLICK)
    const notification = localStorage.getItem(STORAGE_KEYS.CATEGORY_NOTIFICATION)
    const achievement = localStorage.getItem(STORAGE_KEYS.CATEGORY_ACHIEVEMENT)
    const ui = localStorage.getItem(STORAGE_KEYS.CATEGORY_UI)
    const goose = localStorage.getItem(STORAGE_KEYS.CATEGORY_GOOSE)
    return {
      volume: volume ? parseInt(volume, 10) : 50,
      muted: muted === 'true',
      categoryToggles: {
        click: click !== 'false',
        notification: notification !== 'false',
        achievement: achievement !== 'false',
        ui: ui !== 'false',
        goose: goose !== 'false'
      }
    }
  } catch {
    // Fallback if localStorage is not available
    return {
      volume: 50,
      muted: false,
      categoryToggles: {
        click: true,
        notification: true,
        achievement: true,
        ui: true,
        goose: true
      }
    }
  }
}

// Save preferences to localStorage
const savePreferences = (volume: number, muted: boolean, categoryToggles?: Record<SoundCategory, boolean>) => {
  try {
    localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString())
    localStorage.setItem(STORAGE_KEYS.MUTED, muted.toString())
    if (categoryToggles) {
      localStorage.setItem(STORAGE_KEYS.CATEGORY_CLICK, categoryToggles.click.toString())
      localStorage.setItem(STORAGE_KEYS.CATEGORY_NOTIFICATION, categoryToggles.notification.toString())
      localStorage.setItem(STORAGE_KEYS.CATEGORY_ACHIEVEMENT, categoryToggles.achievement.toString())
      localStorage.setItem(STORAGE_KEYS.CATEGORY_UI, categoryToggles.ui.toString())
      localStorage.setItem(STORAGE_KEYS.CATEGORY_GOOSE, categoryToggles.goose.toString())
    }
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Preload audio files
const preloadSounds = () => {
  Object.values(SOUND_FILES).forEach(src => {
    // Find the sound name from the source
    const soundName = Object.entries(SOUND_FILES).find(([_, soundSrc]) => soundSrc === src)?.[0]
    
    // Create and store audio element if not already cached
    if (soundName && !audioElements.has(soundName)) {
      const audio = new Audio(src)
      audio.preload = 'auto'
      audioElements.set(soundName, audio)
      // Force load the audio file
      audio.load()
    }
  })
}

// Reactive state - use refs to make it reactive
const volume = ref<number>(50)
const muted = ref<boolean>(false)
const audioElements = new Map<string, HTMLAudioElement>()
let isInitialized = false

// Category toggles state
const categoryToggles = ref<Record<SoundCategory, boolean>>({
  click: true,
  notification: true,
  achievement: true,
  ui: true,
  goose: true
})

// Initialize audio manager
const initialize = () => {
  if (isInitialized) return

  const preferences = loadPreferences()
  volume.value = preferences.volume
  muted.value = preferences.muted
  categoryToggles.value = preferences.categoryToggles
  preloadSounds()
  isInitialized = true
}

// Get or create audio element for a sound
const getAudioElement = (soundName: keyof typeof SOUND_FILES): HTMLAudioElement | null => {
  const src = SOUND_FILES[soundName]
  if (!src) return null

  // Check if we already have an audio element for this sound
  if (audioElements.has(soundName)) {
    const audio = audioElements.get(soundName)!
    // Reset audio to start fresh
    audio.pause()
    audio.currentTime = 0
    return audio
  }

  // Create new audio element
  const audio = new Audio(src)
  audio.preload = 'auto'
  audioElements.set(soundName, audio)
  return audio
}

// Sound category mappings
const SOUND_CATEGORIES: Record<keyof typeof SOUND_FILES, SoundCategory> = {
  click: 'click',
  success: 'achievement',
  error: 'notification',
  panelOpen: 'ui',
  honk: 'goose',
  pointsEarned: 'achievement',
  notification: 'notification'
}

// Play a sound by name
const playSound = (soundName: keyof typeof SOUND_FILES, options?: { volume?: number; rate?: number }) => {
  if (muted.value) return

  // Check if the sound category is enabled
  const category = SOUND_CATEGORIES[soundName]
  if (category && !categoryToggles.value[category]) {
    return
  }

  const config = SOUND_CONFIG[soundName]
  const audio = getAudioElement(soundName)
  if (!audio) return

  // Set volume (0-1, from the current volume preference or override)
  const volumeValue = options?.volume ?? (volume.value / 100)
  audio.volume = Math.max(0, Math.min(1, volumeValue))

  // Set playback rate
  const rate = options?.rate ?? config.rate
  if (audio.playbackRate !== undefined) {
    audio.playbackRate = Math.max(0.5, Math.min(2.0, rate))
  }

  // Set start time if specified
  if (config.startTime !== undefined) {
    audio.currentTime = config.startTime
  }

  // Play the sound
  audio.play().catch(err => {
    console.log('Audio play failed (user may not have interacted yet):', err)
  })
}

// Set volume (0-100)
const setVolume = (newVolume: number) => {
  const clampedVolume = Math.max(0, Math.min(100, newVolume))
  volume.value = clampedVolume
  savePreferences(clampedVolume, muted.value, categoryToggles.value)
}

// Toggle mute state
const toggleMute = () => {
  muted.value = !muted.value
  savePreferences(volume.value, muted.value, categoryToggles.value)

  // Pause all currently playing sounds if muting
  if (muted.value) {
    audioElements.forEach(audio => {
      audio.pause()
    })
  }
}

// Mute all sounds
const muteAll = () => {
  muted.value = true
  savePreferences(volume.value, muted.value, categoryToggles.value)

  // Pause all currently playing sounds
  audioElements.forEach(audio => {
    audio.pause()
  })
}

// Unmute all sounds
const unmuteAll = () => {
  muted.value = false
  savePreferences(volume.value, muted.value, categoryToggles.value)
}

// Sound effect functions
const playClick = () => {
  playSound('click', { rate: SOUND_CONFIG.click.rate })
}

const playSuccess = () => {
  playSound('success', { rate: SOUND_CONFIG.success.rate })
}

const playError = () => {
  playSound('error', { rate: SOUND_CONFIG.error.rate })
}

const playPanelOpen = () => {
  playSound('panelOpen', { rate: SOUND_CONFIG.panelOpen.rate })
}

const playHonk = () => {
  playSound('honk', { rate: SOUND_CONFIG.honk.rate })
}

const playPointsEarned = () => {
  playSound('pointsEarned', { rate: SOUND_CONFIG.pointsEarned.rate })
}

const playNotification = () => {
  playSound('notification', { rate: SOUND_CONFIG.notification.rate })
}

// Preview functions for sound categories
const previewClickSound = () => {
  playClick()
}

const previewNotificationSound = () => {
  playNotification()
}

const previewAchievementSound = () => {
  playSuccess()
}

const previewUISound = () => {
  playPanelOpen()
}

// Audio manager composable
export const useAudio = () => {
  // Initialize on first use
  initialize()

  return {
    // State
    volume,
    muted,
    categoryToggles,

    // Core functions
    playSound,
    setVolume,
    toggleMute,
    muteAll,
    unmuteAll,

    // Sound effect functions
    playClick,
    playSuccess,
    playError,
    playPanelOpen,
    playHonk,
    playPointsEarned,
    playNotification,

    // Preview functions
    previewClickSound,
    previewNotificationSound,
    previewAchievementSound,
    previewUISound
  }
}

// Export types for type safety
export type SoundName = keyof typeof SOUND_FILES

// Export for testing
export const _resetAudioManager = () => {
  isInitialized = false
  audioElements.clear()
  volume.value = 50
  muted.value = false
}
