import { ref } from 'vue'
import type { Ref } from 'vue'

// Audio processing types and interfaces
interface FartAudioProcessor {
  audioContext: AudioContext | null
  sourceNode: AudioBufferSourceNode | null
  bassFilter: BiquadFilterNode | null
  distortionCurve: Float32Array | null
  distortionNode: WaveShaperNode | null
  gainNode: GainNode | null
  analyserNode: AnalyserNode | null
  isInitialized: boolean
}

interface FartAudioParams {
  bassGain: number          // -6 to +6 dB
  bassFrequency: number     // 40-120 Hz
  distortionAmount: number  // 0-100%
  volumeMultiplier: number  // 0.5-1.5x
  playbackRate: number     // 0.9-1.1x
}

// Store audio processor instance
const fartProcessor: Ref<FartAudioProcessor | null> = ref(null)

// Initialize audio context and nodes
function initializeFartProcessor(): FartAudioProcessor {
  if (fartProcessor.value?.isInitialized) {
    return fartProcessor.value
  }

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  const audioContext = new AudioContextClass()

  const processor: FartAudioProcessor = {
    audioContext,
    sourceNode: null,
    bassFilter: null,
    distortionCurve: null,
    distortionNode: null,
    gainNode: null,
    analyserNode: null,
    isInitialized: true
  }

  fartProcessor.value = processor
  return processor
}

// Generate random audio parameters for fart sound
function generateFartParams(): FartAudioParams {
  return {
    bassGain: Math.random() * 12 - 6,        // -6 to +6 dB
    bassFrequency: 40 + Math.random() * 80,   // 40-120 Hz
    distortionAmount: Math.random() * 100,   // 0-100%
    volumeMultiplier: 0.5 + Math.random(),    // 0.5-1.5x
    playbackRate: 0.9 + Math.random() * 0.2   // 0.9-1.1x
  }
}

// Create distortion curve for wave shaper
function makeDistortionCurve(amount: number): Float32Array {
  const k = typeof amount === 'number' ? amount : 50
  const n_samples = 44100
  const curve = new Float32Array(n_samples)
  const deg = Math.PI / 180

  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
  }

  return curve
}

// Process fart sound with random parameters
async function playFartWithProcessing(audioElement: HTMLAudioElement): Promise<void> {
  try {
    const processor = initializeFartProcessor()
    if (!processor.audioContext) return

    // Resume audio context if suspended (browser policy)
    if (processor.audioContext.state === 'suspended') {
      await processor.audioContext.resume()
    }

    // Generate random parameters for this playback
    const params = generateFartParams()
    console.log('🎵 Fart parameters:', params)

    // Create audio buffer from element
    const arrayBuffer = await audioElement.arrayBuffer()
    const audioBuffer = await processor.audioContext.decodeAudioData(arrayBuffer)

    // Create source node
    processor.sourceNode = processor.audioContext.createBufferSource()
    processor.sourceNode.buffer = audioBuffer
    processor.sourceNode.playbackRate.value = params.playbackRate

    // Create bass filter (low-pass + gain for sub-bass emphasis)
    processor.bassFilter = processor.audioContext.createBiquadFilter()
    processor.bassFilter.type = 'lowpass'
    processor.bassFilter.frequency.value = params.bassFrequency
    processor.bassFilter.gain.value = params.bassGain

    // Create distortion node
    processor.distortionCurve = makeDistortionCurve(params.distortionAmount)
    processor.distortionNode = processor.audioContext.createWaveShaper()
    processor.distortionNode.curve = processor.distortionCurve
    processor.distortionNode.oversample = '4x'

    // Create gain node for volume control
    processor.gainNode = processor.audioContext.createGain()
    const baseVolume = 0.5 // Base 50% volume as per ticket #172
    processor.gainNode.gain.value = baseVolume * params.volumeMultiplier

    // Create analyser for visualization (optional)
    processor.analyserNode = processor.audioContext.createAnalyser()
    processor.analyserNode.fftSize = 256

    // Connect the audio graph: source -> bass -> distortion -> gain -> analyser -> destination
    processor.sourceNode.connect(processor.bassFilter)
    processor.bassFilter.connect(processor.distortionNode)
    processor.distortionNode.connect(processor.gainNode)
    processor.gainNode.connect(processor.analyserNode)
    processor.analyserNode.connect(processor.audioContext.destination)

    // Play the processed sound
    processor.sourceNode.start(0)

    // Cleanup after playback
    const duration = audioBuffer.duration / params.playbackRate
    setTimeout(() => {
      if (processor.sourceNode) {
        try {
          processor.sourceNode.stop()
        } catch (e) {
          // Ignore errors if already stopped
        }
      }
    }, duration * 1000 + 100)

  } catch (error) {
    console.error('❌ Fart audio processing failed:', error)
    // Fallback to simple playback if processing fails
    audioElement.currentTime = 0
    audioElement.volume = 0.5
    audioElement.play().catch(err => {
      console.log('Fallback fart play failed:', err)
    })
  }
}

// Simple fallback playback (no processing)
function playFartSimple(audioElement: HTMLAudioElement, volume?: number): void {
  audioElement.pause()
  audioElement.currentTime = 0
  audioElement.loop = false
  audioElement.volume = Math.min(Math.max(volume ?? 0.5, 0), 1.0)
  audioElement.play().catch(err => {
    console.log('Simple fart play failed:', err)
  })
}

export function useFartAudio() {
  const isProcessingEnabled = ref(true)
  const lastFartParams = ref<FartAudioParams | null>(null)

  // Play fart with AI-based audio processing
  const playFart = async (volume?: number, forceSimple: boolean = false) => {
    const audioElement = document.getElementById('fartSound') as HTMLAudioElement
    if (!audioElement) return

    try {
      if (forceSimple || !isProcessingEnabled.value) {
        // Use simple playback if processing disabled or forced
        playFartSimple(audioElement, volume)
      } else {
        // Use AI-based processing
        await playFartWithProcessing(audioElement)
      }
    } catch (error) {
      console.error('Fart playback error:', error)
      // Fallback to simple playback on error
      playFartSimple(audioElement, volume)
    }
  }

  // Toggle audio processing on/off
  const toggleProcessing = (enabled: boolean) => {
    isProcessingEnabled.value = enabled
  }

  // Get last used parameters (for debugging/visualization)
  const getLastParams = () => lastFartParams.value

  // Test different fart variations (for development)
  const testFartVariation = async (variationIndex: number) => {
    const audioElement = document.getElementById('fartSound') as HTMLAudioElement
    if (!audioElement) return

    // Predefined test variations
    const testVariations: FartAudioParams[] = [
      { bassGain: 6, bassFrequency: 60, distortionAmount: 80, volumeMultiplier: 1.2, playbackRate: 1.0 },   // Heavy & loud
      { bassGain: -6, bassFrequency: 40, distortionAmount: 20, volumeMultiplier: 0.7, playbackRate: 1.1 },  // Light & quiet
      { bassGain: 0, bassFrequency: 100, distortionAmount: 100, volumeMultiplier: 1.0, playbackRate: 0.9 }, // Gritty
      { bassGain: 3, bassFrequency: 80, distortionAmount: 50, volumeMultiplier: 1.1, playbackRate: 1.0 },   // Balanced
    ]

    const params = testVariations[variationIndex % testVariations.length]
    lastFartParams.value = params

    try {
      const processor = initializeFartProcessor()
      if (!processor.audioContext) return

      if (processor.audioContext.state === 'suspended') {
        await processor.audioContext.resume()
      }

      const arrayBuffer = await audioElement.arrayBuffer()
      const audioBuffer = await processor.audioContext.decodeAudioData(arrayBuffer)

      processor.sourceNode = processor.audioContext.createBufferSource()
      processor.sourceNode.buffer = audioBuffer
      processor.sourceNode.playbackRate.value = params.playbackRate

      processor.bassFilter = processor.audioContext.createBiquadFilter()
      processor.bassFilter.type = 'lowpass'
      processor.bassFilter.frequency.value = params.bassFrequency
      processor.bassFilter.gain.value = params.bassGain

      processor.distortionCurve = makeDistortionCurve(params.distortionAmount)
      processor.distortionNode = processor.audioContext.createWaveShaper()
      processor.distortionNode.curve = processor.distortionCurve
      processor.distortionNode.oversample = '4x'

      processor.gainNode = processor.audioContext.createGain()
      processor.gainNode.gain.value = 0.5 * params.volumeMultiplier

      processor.sourceNode.connect(processor.bassFilter)
      processor.bassFilter.connect(processor.distortionNode)
      processor.distortionNode.connect(processor.gainNode)
      processor.gainNode.connect(processor.audioContext.destination)

      processor.sourceNode.start(0)

    } catch (error) {
      console.error('Test fart variation failed:', error)
    }
  }

  return {
    playFart,
    toggleProcessing,
    getLastParams,
    testFartVariation,
    isProcessingEnabled
  }
}