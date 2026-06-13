import { ref } from 'vue'

const STORAGE_KEY = 'fishing-muted-v1'

export type FishingSound = 'bite' | 'press' | 'catch' | 'escape' | 'cast'

/**
 * Tiny WebAudio blip engine for the fishing game. No assets required - we
 * synthesize short tones with an oscillator + gain envelope. Respects a
 * persisted mute toggle.
 */
export function useFishingAudio() {
  const muted = ref(false)
  try {
    muted.value = localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    // ignore
  }

  let ctx: AudioContext | null = null

  const ensureCtx = (): AudioContext | null => {
    if (typeof window === 'undefined') return null
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    if (!ctx) ctx = new AC()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    return ctx
  }

  const blip = (
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.18,
    sweepTo?: number
  ) => {
    const ac = ensureCtx()
    if (!ac) return
    const now = ac.currentTime
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    if (sweepTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), now + duration)
    }
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(now)
    osc.stop(now + duration + 0.02)
  }

  const play = (sound: FishingSound) => {
    if (muted.value) return
    switch (sound) {
      case 'bite':
        // urgent two-tone alert
        blip(660, 0.09, 'square', 0.16)
        setTimeout(() => blip(880, 0.12, 'square', 0.16), 90)
        break
      case 'press':
        blip(420 + Math.random() * 80, 0.05, 'triangle', 0.12)
        break
      case 'catch':
        // happy rising arpeggio
        blip(523, 0.1, 'sine', 0.18)
        setTimeout(() => blip(659, 0.1, 'sine', 0.18), 90)
        setTimeout(() => blip(784, 0.16, 'sine', 0.18), 180)
        break
      case 'escape':
        // sad downward sweep
        blip(440, 0.4, 'sawtooth', 0.14, 110)
        break
      case 'cast':
        blip(300, 0.18, 'sine', 0.1, 600)
        break
    }
  }

  const toggleMute = () => {
    muted.value = !muted.value
    try {
      localStorage.setItem(STORAGE_KEY, muted.value ? '1' : '0')
    } catch {
      // ignore
    }
    if (!muted.value) play('press')
  }

  return { muted, play, toggleMute }
}
