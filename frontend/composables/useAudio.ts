import { ref } from 'vue'

export function useAudio() {
  const playSound = (elementId: string, options?: { volume?: number; startTime?: number }) => {
    const audio = document.getElementById(elementId) as HTMLAudioElement
    if (!audio) return

    // Pause and reset the audio to start fresh
    audio.pause()
    audio.currentTime = options?.startTime ?? 0

    if (options?.volume !== undefined) {
      audio.volume = Math.min(Math.max(options.volume, 0), 1.0)
    }

    audio.play()
  }

  const playFart = (volume?: number) => {
    playSound('fartSound', { volume: volume })
  }

  const toggleMusic = (playing: boolean) => {
    const music = document.getElementById('newMusic') as HTMLAudioElement
    if (!music) return

    if (playing) {
      music.play()
    } else {
      music.pause()
    }
  }

  return {
    playSound,
    playFart,
    toggleMusic
  }
}
