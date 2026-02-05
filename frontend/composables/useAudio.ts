import { ref } from 'vue'

export function useAudio() {
  const playSound = (elementId: string, options?: { volume?: number; startTime?: number; rate?: number }) => {
    const audio = document.getElementById(elementId) as HTMLAudioElement
    if (!audio) return

    // Pause and reset the audio to start fresh
    audio.pause()
    audio.currentTime = options?.startTime ?? 0

    // Ensure audio doesn't loop (fix for button sound looping issue)
    audio.loop = false

    // Set volume (clamp between 0 and 1) - default to 0.5 (50%) as per ticket #172
    audio.volume = Math.min(Math.max(options?.volume ?? 0.5, 0), 1.0)

    // Set playback rate for variety (if supported)
    if (options?.rate && audio.playbackRate !== undefined) {
      audio.playbackRate = Math.max(0.5, Math.min(2.0, options.rate))
    }

    audio.play().catch(err => {
      console.log('Audio play failed (user may not have interacted yet):', err)
    })
  }

  const playFart = (volume?: number) => {
    playSound('fartSound', { volume: volume })
  }

  const toggleMusic = (playing: boolean) => {
    const music = document.getElementById('newMusic') as HTMLAudioElement
    if (!music) return

    if (playing) {
      // Set music to 50% volume (ticket #172)
      music.volume = 0.5
      music.play().catch(err => console.log('Music play failed:', err))
    } else {
      music.pause()
    }
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
    toggleMusic
  }
}
