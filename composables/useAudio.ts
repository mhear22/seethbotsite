import { ref } from 'vue'

export function useAudio() {
  const playSound = (elementId: string, options?: { volume?: number; startTime?: number }) => {
    const audio = document.getElementById(elementId) as HTMLAudioElement
    if (!audio) return

    if (options?.volume !== undefined) {
      audio.volume = Math.min(Math.max(options.volume, 0), 1.0)
    }

    if (options?.startTime !== undefined) {
      audio.currentTime = options.startTime
    }

    audio.play()
  }

  const playFart = (volume?: number) => {
    const randomValue = volume ?? Math.floor(Math.random() * 100) / 50
    playSound('fartSound', { volume: randomValue })
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
