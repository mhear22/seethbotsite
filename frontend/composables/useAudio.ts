import { ref, watch } from 'vue'

// Default sound settings
const DEFAULT_VOLUME = 50
const DEFAULT_CATEGORY_TOGGLES = {
  click: true,
  notification: true,
  achievement: true,
  ui: true
}

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('soundSettings')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load sound settings:', error)
  }
  return null
}

// Save settings to localStorage
const saveSettings = (settings: any) => {
  try {
    localStorage.setItem('soundSettings', JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save sound settings:', error)
  }
}

export function useAudio() {
  // Initialize settings from localStorage or defaults
  const savedSettings = loadSettings()
  const muted = ref(savedSettings?.muted ?? false)
  const volume = ref(savedSettings?.volume ?? DEFAULT_VOLUME)
  const categoryToggles = ref(savedSettings?.categories ?? DEFAULT_CATEGORY_TOGGLES)

  // Watch for changes and save to localStorage
  watch([muted, volume, categoryToggles], () => {
    saveSettings({
      muted: muted.value,
      volume: volume.value,
      categories: categoryToggles.value
    })
  }, { deep: true })

  const playSound = (elementId: string, options?: { volume?: number; startTime?: number; rate?: number }) => {
    if (muted.value) return

    const audio = document.getElementById(elementId) as HTMLAudioElement
    if (!audio) return

    // Pause and reset the audio to start fresh
    audio.pause()
    audio.currentTime = options?.startTime ?? 0

    // Ensure audio doesn't loop (fix for button sound looping issue)
    audio.loop = false

    // Set volume based on master volume setting (0-100 -> 0-1)
    const masterVolume = volume.value / 100
    audio.volume = Math.min(Math.max(options?.volume ?? 0.5, 0), 1.0) * masterVolume

    // Set playback rate for variety (if supported)
    if (options?.rate && audio.playbackRate !== undefined) {
      audio.playbackRate = Math.max(0.5, Math.min(2.0, options.rate))
    }

    audio.play().catch(err => {
      console.log('Audio play failed (user may not have interacted yet):', err)
    })
  }

  const playFart = async (volume?: number, forceSimple: boolean = false) => {
    if (muted.value) return

    // Try to use enhanced fart audio processing if available
    try {
      const { useFartAudio } = await import('./useFartAudio')
      const { playFart: playFartEnhanced } = useFartAudio()
      await playFartEnhanced(volume, forceSimple)
    } catch (error) {
      console.log('Enhanced fart audio not available, using simple playback')
      playSound('fartSound', { volume: volume })
    }
  }

  const toggleMusic = (playing: boolean) => {
    const music = document.getElementById('newMusic') as HTMLAudioElement
    if (!music) return

    if (playing && !muted.value) {
      // Set music based on master volume (0-100 -> 0-1)
      music.volume = volume.value / 100
      music.play().catch(err => console.log('Music play failed:', err))
    } else {
      music.pause()
    }
  }

  const muteAll = () => {
    muted.value = true
    // Pause all audio elements
    const audioIds = ['newMusic', 'fartSound', 'buttonSound', 'gooseHonk']
    audioIds.forEach(id => {
      const el = document.getElementById(id) as HTMLAudioElement
      if (el) el.pause()
    })
  }

  const unmuteAll = () => {
    muted.value = false
  }

  // Sound effect for button clicks - checks click category toggle
  const playButtonClick = () => {
    if (!categoryToggles.value.click) return
    playSound('buttonSound', { volume: 0.5, rate: 1.0 + (Math.random() * 0.1 - 0.05) })
  }

  // Sound effect for achievements/milestones - checks achievement category toggle
  const playAchievement = () => {
    if (!categoryToggles.value.achievement) return
    playSound('buttonSound', { volume: 0.5, startTime: 0, rate: 1.2 })
  }

  // Sound effect for successful actions (purchases, unlocks) - checks notification category toggle
  const playSuccess = () => {
    if (!categoryToggles.value.notification) return
    playSound('buttonSound', { volume: 0.5, rate: 1.3 })
  }

  // Sound effect for error/failure - checks notification category toggle
  const playError = () => {
    if (!categoryToggles.value.notification) return
    playSound('fartSound', { volume: 0.5, startTime: 0.5 })
  }

  // Sound effect for goose interaction - checks click category toggle
  const playGooseHonk = () => {
    if (!categoryToggles.value.click) return
    playSound('gooseHonk', { volume: 0.5 })
  }

  // Sound effect for game interactions (clicking, fishing, etc.) - checks click category toggle
  const playGameAction = () => {
    if (!categoryToggles.value.click) return
    playSound('buttonSound', { volume: 0.5, rate: 0.9 + Math.random() * 0.2 })
  }

  // Sound effect for panel opening/closing - checks UI category toggle
  const playPanelToggle = () => {
    if (!categoryToggles.value.ui) return
    playSound('buttonSound', { volume: 0.5, rate: 0.8 })
  }

  // Sound effect for level up - checks achievement category toggle
  const playLevelUp = () => {
    if (!categoryToggles.value.achievement) return
    playSound('buttonSound', { volume: 0.5, rate: 1.5 })
    // Play twice for emphasis
    setTimeout(() => {
      playSound('buttonSound', { volume: 0.5, rate: 1.7 })
    }, 100)
  }

  // Sound effect for purchase - checks notification category toggle
  const playPurchase = () => {
    if (!categoryToggles.value.notification) return
    playSound('buttonSound', { volume: 0.5, rate: 1.1 })
  }

  // Preview functions for testing each category
  const previewClickSound = () => {
    playSound('buttonSound', { volume: 0.5, rate: 1.0 })
  }

  const previewNotificationSound = () => {
    playSound('buttonSound', { volume: 0.5, rate: 1.3 })
  }

  const previewAchievementSound = () => {
    playSound('buttonSound', { volume: 0.5, rate: 1.5 })
  }

  const previewUISound = () => {
    playSound('buttonSound', { volume: 0.5, rate: 0.8 })
  }

  return {
    playSound,
    playFart,
    playButtonClick,
    playAchievement,
    playSuccess,
    playError,
    playGooseHonk,
    playGameAction,
    playPanelToggle,
    playLevelUp,
    playPurchase,
    toggleMusic,
    muteAll,
    unmuteAll,
    // Export settings state
    muted,
    volume,
    categoryToggles,
    // Preview functions
    previewClickSound,
    previewNotificationSound,
    previewAchievementSound,
    previewUISound
  }
}
