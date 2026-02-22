import { ref, watch } from 'vue'

export function useAudio() {
  const muted = ref(false)

  // Load volume from localStorage (default to 0.5 = 50%)
  const savedVolume = localStorage.getItem('audioVolume')
  const volume = ref(savedVolume !== null ? parseFloat(savedVolume) : 0.5)

  // Persist volume changes to localStorage
  watch(volume, (newVolume) => {
    localStorage.setItem('audioVolume', newVolume.toString())
  })

  const playSound = (elementId: string, options?: { volume?: number; startTime?: number; rate?: number }) => {
    if (muted.value) return

    const audio = document.getElementById(elementId) as HTMLAudioElement
    if (!audio) return

    // Pause and reset the audio to start fresh
    audio.pause()
    audio.currentTime = options?.startTime ?? 0

    // Ensure audio doesn't loop (fix for button sound looping issue)
    audio.loop = false

    // Set volume (clamp between 0 and 1) - use current volume setting or override
    audio.volume = Math.min(Math.max(options?.volume ?? volume.value, 0), 1.0)

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
    playSound('fartSound', { volume: volume })
  }

  const toggleMusic = (playing: boolean) => {
    const music = document.getElementById('newMusic') as HTMLAudioElement
    if (!music) return

    if (playing && !muted.value) {
      // Set music to current volume setting
      music.volume = volume.value
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

  // Sound effect for button clicks
  const playButtonClick = () => {
    playSound('buttonSound', { volume: volume.value, rate: 1.0 + (Math.random() * 0.1 - 0.05) })
  }

  // Sound effect for achievements/milestones
  const playAchievement = () => {
    playSound('buttonSound', { volume: volume.value, startTime: 0, rate: 1.2 })
  }

  // Sound effect for successful actions (purchases, unlocks)
  const playSuccess = () => {
    playSound('buttonSound', { volume: volume.value, rate: 1.3 })
  }

  // Sound effect for error/failure
  const playError = () => {
    playSound('fartSound', { volume: volume.value, startTime: 0.5 })
  }

  // Sound effect for goose interaction
  const playGooseHonk = () => {
    playSound('gooseHonk', { volume: volume.value })
  }

  // Sound effect for game interactions (clicking, fishing, etc.)
  const playGameAction = () => {
    playSound('buttonSound', { volume: volume.value, rate: 0.9 + Math.random() * 0.2 })
  }

  // Sound effect for panel opening/closing
  const playPanelToggle = () => {
    playSound('buttonSound', { volume: volume.value, rate: 0.8 })
  }

  // Sound effect for level up
  const playLevelUp = () => {
    playSound('buttonSound', { volume: volume.value, rate: 1.5 })
    // Play twice for emphasis
    setTimeout(() => {
      playSound('buttonSound', { volume: volume.value, rate: 1.7 })
    }, 100)
  }

  // Sound effect for purchase
  const playPurchase = () => {
    playSound('buttonSound', { volume: volume.value, rate: 1.1 })
  }

  // Set volume function
  const setVolume = (newVolume: number) => {
    volume.value = Math.min(Math.max(newVolume, 0), 1.0)
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
    volume,
    setVolume
  }
}
