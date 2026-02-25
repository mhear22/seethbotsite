/**
 * Speech Synthesis Composable
 * Provides text-to-speech functionality for voice feedback
 * Accessibility: Announces actions and provides audio confirmations
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface SpeechOptions {
  rate?: number    // Speed (0.1 - 10, default 1)
  pitch?: number   // Pitch (0 - 2, default 1)
  volume?: number  // Volume (0 - 1, default 1)
  lang?: string    // Language code (e.g., 'en-US', 'en-AU')
  voice?: SpeechSynthesisVoice
}

// Shared state (singleton)
const isSpeaking = ref(false)
const isSupported = ref(false)
const voices = ref<SpeechSynthesisVoice[]>([])
const enabled = ref(true)
const currentUtterance = ref<SpeechSynthesisUtterance | null>(null)

let isInitialized = false

export function useSpeechSynthesis() {
  // Check if speech synthesis is supported
  const checkSupport = () => {
    isSupported.value = 'speechSynthesis' in window
    return isSupported.value
  }

  // Load available voices
  const loadVoices = () => {
    if (!isSupported.value) return
    
    const availableVoices = window.speechSynthesis.getVoices()
    voices.value = availableVoices
    
    // Log available voices for debugging
    if (availableVoices.length > 0) {
      console.log('[SpeechSynthesis] Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`))
    }
  }

  // Get preferred voice (prefer Australian English if available, fallback to English)
  const getPreferredVoice = (lang?: string): SpeechSynthesisVoice | null => {
    if (voices.value.length === 0) return null
    
    const targetLang = lang || 'en-AU'
    
    // Try exact match first
    let voice = voices.value.find(v => v.lang === targetLang)
    if (voice) return voice
    
    // Try language prefix match (e.g., 'en' for 'en-AU')
    const langPrefix = targetLang.split('-')[0]
    voice = voices.value.find(v => v.lang.startsWith(langPrefix))
    if (voice) return voice
    
    // Fallback to first English voice
    voice = voices.value.find(v => v.lang.startsWith('en'))
    if (voice) return voice
    
    // Last resort: first available voice
    return voices.value[0] || null
  }

  // Speak text aloud
  const speak = (text: string, options: SpeechOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isSupported.value) {
        console.warn('[SpeechSynthesis] Not supported in this browser')
        resolve()
        return
      }

      if (!enabled.value) {
        console.log('[SpeechSynthesis] Speech disabled, skipping:', text)
        resolve()
        return
      }

      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      currentUtterance.value = utterance

      // Apply options
      utterance.rate = options.rate ?? 1.0
      utterance.pitch = options.pitch ?? 1.0
      utterance.volume = options.volume ?? 1.0
      
      // Set voice
      if (options.voice) {
        utterance.voice = options.voice
      } else {
        const preferredVoice = getPreferredVoice(options.lang)
        if (preferredVoice) {
          utterance.voice = preferredVoice
        }
      }

      // Set language
      utterance.lang = options.lang ?? utterance.voice?.lang ?? 'en-US'

      // Event handlers
      utterance.onstart = () => {
        isSpeaking.value = true
        console.log('[SpeechSynthesis] Speaking:', text)
      }

      utterance.onend = () => {
        isSpeaking.value = false
        currentUtterance.value = null
        resolve()
      }

      utterance.onerror = (event) => {
        isSpeaking.value = false
        currentUtterance.value = null
        console.error('[SpeechSynthesis] Error:', event.error)
        reject(event)
      }

      // Speak!
      window.speechSynthesis.speak(utterance)
    })
  }

  // Stop speaking
  const stop = () => {
    if (!isSupported.value) return
    
    window.speechSynthesis.cancel()
    isSpeaking.value = false
    currentUtterance.value = null
  }

  // Pause speaking
  const pause = () => {
    if (!isSupported.value) return
    window.speechSynthesis.pause()
  }

  // Resume speaking
  const resume = () => {
    if (!isSupported.value) return
    window.speechSynthesis.resume()
  }

  // Enable/disable speech
  const setEnabled = (value: boolean) => {
    enabled.value = value
    if (!value) {
      stop()
    }
  }

  // Quick announce (for accessibility feedback)
  const announce = (text: string) => {
    return speak(text, { rate: 1.2, volume: 0.8 })
  }

  // Announce command success
  const announceSuccess = (action: string) => {
    const phrases = [
      `${action}`,
      `Done: ${action}`,
      `Okay, ${action}`,
      `Sure, ${action}`
    ]
    const phrase = phrases[Math.floor(Math.random() * phrases.length)]
    return speak(phrase, { rate: 1.1 })
  }

  // Announce command failure
  const announceError = (reason: string) => {
    return speak(`Sorry, ${reason}`, { rate: 1.0, pitch: 0.9 })
  }

  // Announce available commands help
  const announceHelp = (commands: string[]) => {
    const commandList = commands.slice(0, 5).join(', ')
    return speak(`Available commands: ${commandList}. Say "show commands" for more.`, { rate: 0.9 })
  }

  // Initialize
  const init = () => {
    if (isInitialized) return
    
    checkSupport()
    
    if (isSupported.value) {
      // Load voices (may need to wait for voiceschanged event)
      loadVoices()
      
      // Voices load asynchronously in some browsers
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
      }
      
      // Load saved preference
      const savedEnabled = localStorage.getItem('voiceFeedbackEnabled')
      if (savedEnabled !== null) {
        enabled.value = savedEnabled === 'true'
      }
    }
    
    isInitialized = true
  }

  // Cleanup
  const cleanup = () => {
    stop()
    if (isSupported.value && window.speechSynthesis.removeEventListener) {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }

  // Setup on mount
  onMounted(() => {
    init()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    // State
    isSpeaking,
    isSupported,
    voices,
    enabled,
    currentUtterance,
    
    // Computed
    isReady: computed(() => isSupported.value && voices.value.length > 0),
    
    // Actions
    speak,
    stop,
    pause,
    resume,
    setEnabled,
    announce,
    announceSuccess,
    announceError,
    announceHelp,
    init,
    cleanup,
    getPreferredVoice,
    
    // Voice selection
    englishVoices: computed(() => voices.value.filter(v => v.lang.startsWith('en'))),
    australianVoices: computed(() => voices.value.filter(v => v.lang === 'en-AU'))
  }
}
