import { ref } from 'vue'

export function useAudio() {
  // Load sound preferences from localStorage (managed by useTheme)
  const savedSoundPrefs = localStorage.getItem('soundPreferences')
  const soundPrefs = savedSoundPrefs ? JSON.parse(savedSoundPrefs) : {
    soundsEnabled: true,
    notificationSoundsEnabled: true,
    musicEnabled: true,
    soundVolume: 0.5
  }

  const muted = ref(!soundPrefs.soundsEnabled)
  const notificationSoundsEnabled = ref(soundPrefs.notificationSoundsEnabled)
  const musicEnabled = ref(soundPrefs.musicEnabled)
  const soundVolume = ref(soundPrefs.soundVolume)

  const playSound = (elementId: string, options?: { volume?: number; startTime?: number; rate?: number }) => {
    if (muted.value) return

    const audio = document.getElementById(elementId) as HTMLAudioElement
    if (!audio) return

    // Pause and reset the audio to start fresh
    audio.pause()
    audio.currentTime = options?.startTime ?? 0

    // Ensure audio doesn't loop (fix for button sound looping issue)
    audio.loop = false

    // Set volume - use preference volume if no override provided
    const volume = options?.volume ?? soundVolume.value
    audio.volume = Math.min(Math.max(volume, 0), 1.0)

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

    // Use preference volume if no override provided
    const vol = volume ?? soundVolume.value

    // Try to use enhanced fart audio processing if available
    try {
      const { useFartAudio } = await import('./useFartAudio')
      const { playFart: playFartEnhanced } = useFartAudio()
      await playFartEnhanced(vol, forceSimple)
    } catch (error) {
      console.log('Enhanced fart audio not available, using simple playback')
      playSound('fartSound', { volume: vol })
    }
  }

  const toggleMusic = (playing: boolean) => {
    const music = document.getElementById('newMusic') as HTMLAudioElement
    if (!music) return

    if (playing && !muted.value && musicEnabled.value) {
      // Use preference volume
      music.volume = soundVolume.value
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
    // Update preferences in localStorage
    const currentPrefs = JSON.parse(localStorage.getItem('soundPreferences') || '{}')
    currentPrefs.soundsEnabled = true
    localStorage.setItem('soundPreferences', JSON.stringify(currentPrefs))
  }

  // Update sound preferences
  const updateSoundPreferences = (prefs: Partial<typeof soundPrefs>) => {
    if (prefs.soundsEnabled !== undefined) {
      muted.value = !prefs.soundsEnabled
    }
    if (prefs.notificationSoundsEnabled !== undefined) {
      notificationSoundsEnabled.value = prefs.notificationSoundsEnabled
    }
    if (prefs.musicEnabled !== undefined) {
      musicEnabled.value = prefs.musicEnabled
    }
    if (prefs.soundVolume !== undefined) {
      soundVolume.value = prefs.soundVolume
    }

    // Update preferences in localStorage
    const currentPrefs = JSON.parse(localStorage.getItem('soundPreferences') || '{}')
    const newPrefs = { ...currentPrefs, ...soundPrefs, ...prefs }
    localStorage.setItem('soundPreferences', JSON.stringify(newPrefs))
  }

  // Sound effect for button clicks - 50% volume (ticket #172)
  const playButtonClick = () => {
    playSound('buttonSound', { volume: 0.5, rate: 1.0 + (Math.random() * 0.1 - 0.05) })
  }

  // Sound effect for achievements/milestones - 50% volume (ticket #172)
  const playAchievement = () => {
    playSound('buttonSound', { volume: 0.5, startTime: 0, rate: 1.2 })
  }

  // Sound effect for successful actions (purchases, unlocks) - 50% volume (ticket #172)
  const playSuccess = () => {
    playSound('buttonSound', { volume: 0.5, rate: 1.3 })
  }

  // Sound effect for error/failure - 50% volume (ticket #172)
  const playError = () => {
    playSound('fartSound', { volume: 0.5, startTime: 0.5 })
  }

  // Sound effect for goose interaction - 50% volume (ticket #172)
  const playGooseHonk = () => {
    playSound('gooseHonk', { volume: 0.5 })
  }

  // Sound effect for game interactions (clicking, fishing, etc.) - 50% volume (ticket #172)
  const playGameAction = () => {
    // Fixed at 50% volume as per ticket #172
    playSound('buttonSound', { volume: 0.5, rate: 0.9 + Math.random() * 0.2 })
  }

  // Sound effect for panel opening/closing - 50% volume (ticket #172)
  const playPanelToggle = () => {
    playSound('buttonSound', { volume: 0.5, rate: 0.8 })
  }

  // Sound effect for level up - 50% volume (ticket #172)
  const playLevelUp = () => {
    playSound('buttonSound', { volume: 0.5, rate: 1.5 })
    // Play twice for emphasis
    setTimeout(() => {
      playSound('buttonSound', { volume: 0.5, rate: 1.7 })
    }, 100)
  }

  // Sound effect for purchase - 50% volume (ticket #172)
  const playPurchase = () => {
    playSound('buttonSound', { volume: 0.5, rate: 1.1 })
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
    updateSoundPreferences,
    soundVolume,
    muted,
    musicEnabled,
    notificationSoundsEnabled
  }
}
