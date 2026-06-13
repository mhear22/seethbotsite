import { ref, watch } from 'vue'

// Shared WebAudio context for synthesized combat SFX (lazily created on first
// use so we don't allocate one until the player is actually in a battle, and so
// it's created inside a user-gesture handler when possible).
let sharedAudioContext: AudioContext | null = null
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!sharedAudioContext) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    sharedAudioContext = new Ctor()
  }
  // Resume if the browser suspended it before a user gesture.
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {})
  }
  return sharedAudioContext
}

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

  // ── Synthesized combat SFX (WebAudio, no binary assets) ──────────────────
  // Each respects the mute/volume setting and adds slight random pitch so
  // repeated shots don't sound robotic.

  /** Random pitch multiplier centred on 1.0. */
  const jitter = (amount: number) => 1 + (Math.random() * 2 - 1) * amount

  /**
   * Play a short synthesized tone. gainScale lets each effect set its own
   * loudness relative to the global volume setting.
   */
  const playTone = (opts: {
    type: OscillatorType
    startFreq: number
    endFreq?: number
    duration: number
    gainScale?: number
    attack?: number
  }) => {
    if (muted.value || volume.value <= 0) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = opts.type
    osc.frequency.setValueAtTime(opts.startFreq, now)
    if (opts.endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.endFreq), now + opts.duration)
    }

    const peak = Math.min(1, volume.value * (opts.gainScale ?? 1))
    const attack = opts.attack ?? 0.005
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + opts.duration + 0.02)
  }

  /** Add a short burst of filtered noise (used for whoosh/hit textures). */
  const playNoise = (opts: { duration: number; gainScale?: number; filterFreq?: number; filterType?: BiquadFilterType }) => {
    if (muted.value || volume.value <= 0) return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const frames = Math.floor(ctx.sampleRate * opts.duration)
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames) // decaying noise
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = opts.filterType ?? 'bandpass'
    filter.frequency.setValueAtTime(opts.filterFreq ?? 1200, now)

    const gain = ctx.createGain()
    const peak = Math.min(1, volume.value * (opts.gainScale ?? 1))
    gain.gain.setValueAtTime(peak, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    src.start(now)
    src.stop(now + opts.duration + 0.02)
  }

  /** Ballistic pop — short punchy descending square blip. */
  const playBallisticShot = () => {
    playTone({ type: 'square', startFreq: 420 * jitter(0.08), endFreq: 110, duration: 0.09, gainScale: 0.35 })
    playNoise({ duration: 0.05, gainScale: 0.25, filterFreq: 2000, filterType: 'highpass' })
  }

  /** Energy zap — bright sawtooth sweep. */
  const playEnergyShot = () => {
    playTone({ type: 'sawtooth', startFreq: 900 * jitter(0.1), endFreq: 1700, duration: 0.14, gainScale: 0.28 })
    playTone({ type: 'sine', startFreq: 1800 * jitter(0.1), endFreq: 600, duration: 0.1, gainScale: 0.15 })
  }

  /** Missile whoosh — rising filtered noise. */
  const playMissileShot = () => {
    playNoise({ duration: 0.35, gainScale: 0.3, filterFreq: 700, filterType: 'bandpass' })
    playTone({ type: 'sine', startFreq: 180 * jitter(0.1), endFreq: 320, duration: 0.3, gainScale: 0.18 })
  }

  /** Fire SFX dispatcher keyed by weapon type. */
  const playWeaponFire = (weaponType: 'ballistic' | 'energy' | 'missile') => {
    switch (weaponType) {
      case 'energy': playEnergyShot(); break
      case 'missile': playMissileShot(); break
      default: playBallisticShot(); break
    }
  }

  /** Thruster whoosh for dashes. */
  const playThruster = () => {
    playNoise({ duration: 0.25, gainScale: 0.35, filterFreq: 500 * jitter(0.1), filterType: 'bandpass' })
    playTone({ type: 'sine', startFreq: 240 * jitter(0.1), endFreq: 90, duration: 0.22, gainScale: 0.2 })
  }

  /** Hit-confirm tink — bright metallic ping. crit = higher/brighter. */
  const playHitConfirm = (crit: boolean = false) => {
    const base = crit ? 1400 : 950
    playTone({ type: 'triangle', startFreq: base * jitter(0.05), endFreq: base * 1.6, duration: 0.08, gainScale: crit ? 0.4 : 0.3 })
    playNoise({ duration: 0.04, gainScale: 0.2, filterFreq: 4000, filterType: 'highpass' })
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
    setVolume,
    // Synthesized combat SFX
    playWeaponFire,
    playBallisticShot,
    playEnergyShot,
    playMissileShot,
    playThruster,
    playHitConfirm,
  }
}
