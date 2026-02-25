/**
 * Voice Navigation Composable
 * Provides voice command recognition for hands-free navigation
 * Accessibility: Enables Orlando to navigate the entire site using voice commands
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSpeechSynthesis } from './useSpeechSynthesis'
import { useAppStore } from '../stores/useAppStore'

// Speech Recognition types (browser APIs may have vendor prefixes)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onstart: (() => void) | null
  onend: (() => void) | null
  onspeechstart: (() => void) | null
  onspeechend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export interface VoiceCommand {
  phrases: string[]       // Phrases that trigger this command
  action: () => void      // Action to execute
  description: string     // Help text
  category: 'navigation' | 'actions' | 'forms' | 'panels' | 'help'
  feedback?: string       // Optional custom feedback message
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error'

// Shared state (singleton)
const isSupported = ref(false)
const isListening = ref(false)
const voiceState = ref<VoiceState>('idle')
const lastTranscript = ref('')
const lastError = ref('')
const commands = ref<VoiceCommand[]>([])
const commandHistory = ref<{ command: string; timestamp: number }[]>([])
const enabled = ref(true)
const showFeedback = ref(false)
const feedbackMessage = ref('')

let recognition: SpeechRecognition | null = null
let speechSynthesis: ReturnType<typeof useSpeechSynthesis> | null = null

export function useVoiceNavigation() {
  const router = useRouter()
  const appStore = useAppStore()
  const synth = useSpeechSynthesis()
  speechSynthesis = synth

  // Check if Speech Recognition is supported
  const checkSupport = (): boolean => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    isSupported.value = !!SpeechRecognitionAPI
    return isSupported.value
  }

  // Initialize Speech Recognition
  const initRecognition = () => {
    if (!checkSupport()) {
      console.warn('[VoiceNavigation] Speech Recognition not supported in this browser')
      return null
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    const instance = new SpeechRecognitionAPI()

    // Configure recognition
    instance.continuous = false      // Stop after each command
    instance.interimResults = true   // Get partial results for better UX
    instance.lang = 'en-US'          // Default to US English
    instance.maxAlternatives = 3     // Get multiple alternatives

    // Event handlers
    instance.onstart = () => {
      isListening.value = true
      voiceState.value = 'listening'
      lastError.value = ''
      console.log('[VoiceNavigation] Listening...')
    }

    instance.onspeechstart = () => {
      console.log('[VoiceNavigation] Speech detected')
    }

    instance.onspeechend = () => {
      console.log('[VoiceNavigation] Speech ended')
    }

    instance.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results
      const lastResult = results[results.length - 1]
      
      if (lastResult) {
        const transcript = lastResult[0].transcript.toLowerCase().trim()
        lastTranscript.value = transcript
        
        // Show interim results
        if (!lastResult.isFinal) {
          showFeedbackOverlay(`Listening: "${transcript}"`)
          return
        }

        // Process final result
        voiceState.value = 'processing'
        console.log('[VoiceNavigation] Final transcript:', transcript)
        
        processCommand(transcript)
      }
    }

    instance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[VoiceNavigation] Error:', event.error)
      lastError.value = event.error
      
      if (event.error === 'no-speech') {
        // Not a real error, just no speech detected
        voiceState.value = 'idle'
      } else if (event.error === 'aborted') {
        voiceState.value = 'idle'
      } else {
        voiceState.value = 'error'
        showFeedbackOverlay(`Error: ${event.error}`)
        synth.announceError(`speech recognition error: ${event.error}`)
      }
      
      isListening.value = false
    }

    instance.onend = () => {
      isListening.value = false
      if (voiceState.value === 'listening') {
        voiceState.value = 'idle'
      }
      console.log('[VoiceNavigation] Recognition ended')
    }

    return instance
  }

  // Show feedback overlay
  const showFeedbackOverlay = (message: string, duration: number = 2000) => {
    feedbackMessage.value = message
    showFeedback.value = true
    setTimeout(() => {
      showFeedback.value = false
    }, duration)
  }

  // Process voice command
  const processCommand = (transcript: string) => {
    // Add to history
    commandHistory.value.unshift({
      command: transcript,
      timestamp: Date.now()
    })
    // Keep only last 50 commands
    if (commandHistory.value.length > 50) {
      commandHistory.value.pop()
    }

    // Find matching command
    for (const cmd of commands.value) {
      for (const phrase of cmd.phrases) {
        const normalizedPhrase = phrase.toLowerCase()
        
        // Exact match
        if (transcript === normalizedPhrase) {
          executeCommand(cmd, transcript)
          return
        }
        
        // Contains match (e.g., "go to home page" matches "go to home")
        if (transcript.includes(normalizedPhrase)) {
          executeCommand(cmd, transcript)
          return
        }
        
        // Fuzzy match for similar phrases (e.g., "goto home" matches "go to home")
        const fuzzyTranscript = transcript.replace(/\s+/g, ' ').replace(/go\s*to/gi, 'go to')
        if (fuzzyTranscript.includes(normalizedPhrase)) {
          executeCommand(cmd, transcript)
          return
        }
      }
    }

    // No command matched
    const errorMsg = `I didn't understand "${transcript}". Say "help" for available commands.`
    showFeedbackOverlay(errorMsg, 3000)
    synth.announceError(`I didn't understand that command`)
    voiceState.value = 'idle'
  }

  // Execute matched command
  const executeCommand = (command: VoiceCommand, transcript: string) => {
    console.log('[VoiceNavigation] Executing command:', command.description)
    
    try {
      command.action()
      
      // Show feedback
      const feedback = command.feedback || `✓ ${command.description}`
      showFeedbackOverlay(feedback)
      
      // Audio feedback
      if (speechSynthesis?.enabled.value) {
        speechSynthesis.announceSuccess(command.description.toLowerCase())
      }
      
      voiceState.value = 'idle'
    } catch (error) {
      console.error('[VoiceNavigation] Command execution failed:', error)
      showFeedbackOverlay(`Failed: ${error}`)
      speechSynthesis?.announceError('command failed')
      voiceState.value = 'error'
    }
  }

  // Register default navigation commands
  const registerDefaultCommands = () => {
    // Navigation commands
    registerCommand({
      phrases: ['go to home', 'go home', 'home', 'home page'],
      action: () => router.push('/'),
      description: 'Navigate to home page',
      category: 'navigation',
      feedback: 'Navigating to home'
    })

    registerCommand({
      phrases: ['go to settings', 'settings', 'open settings'],
      action: () => router.push('/settings'),
      description: 'Navigate to settings page',
      category: 'navigation',
      feedback: 'Opening settings'
    })

    registerCommand({
      phrases: ['go to about', 'about', 'about page'],
      action: () => router.push('/about'),
      description: 'Navigate to about page',
      category: 'navigation',
      feedback: 'Opening about page'
    })

    registerCommand({
      phrases: ['go to stats', 'stats', 'statistics'],
      action: () => router.push('/stats'),
      description: 'Navigate to stats page',
      category: 'navigation',
      feedback: 'Opening stats'
    })

    registerCommand({
      phrases: ['go to rankings', 'rankings', 'leaderboard'],
      action: () => router.push('/rankings'),
      description: 'Navigate to rankings page',
      category: 'navigation',
      feedback: 'Opening rankings'
    })

    registerCommand({
      phrases: ['go to favorites', 'favorites', 'favourites'],
      action: () => router.push('/favorites'),
      description: 'Navigate to favorites page',
      category: 'navigation',
      feedback: 'Opening favorites'
    })

    registerCommand({
      phrases: ['go to cats', 'cats', 'cat page'],
      action: () => router.push('/cats'),
      description: 'Navigate to cats page',
      category: 'navigation',
      feedback: 'Opening cats page'
    })

    registerCommand({
      phrases: ['go to movies', 'movies', 'movie page'],
      action: () => router.push('/movies'),
      description: 'Navigate to movies page',
      category: 'navigation',
      feedback: 'Opening movies page'
    })

    registerCommand({
      phrases: ['go to fishing', 'fishing', 'fish game'],
      action: () => router.push('/fishing'),
      description: 'Navigate to fishing game',
      category: 'navigation',
      feedback: 'Opening fishing game'
    })

    registerCommand({
      phrases: ['go to shop', 'shop', 'store'],
      action: () => router.push('/shop'),
      description: 'Navigate to shop page',
      category: 'navigation',
      feedback: 'Opening shop'
    })

    registerCommand({
      phrases: ['go to tickets', 'tickets', 'ticket page'],
      action: () => router.push('/tickets'),
      description: 'Navigate to tickets page',
      category: 'navigation',
      feedback: 'Opening tickets'
    })

    registerCommand({
      phrases: ['go to data center', 'data center', 'datacenter', 'open data center'],
      action: () => router.push('/datacenter'),
      description: 'Navigate to data center game',
      category: 'navigation',
      feedback: 'Opening data center'
    })

    registerCommand({
      phrases: ['go to countdowns', 'countdowns', 'countdown page'],
      action: () => router.push('/countdowns'),
      description: 'Navigate to countdowns page',
      category: 'navigation',
      feedback: 'Opening countdowns'
    })

    registerCommand({
      phrases: ['go to music', 'music', 'music page'],
      action: () => router.push('/music'),
      description: 'Navigate to music page',
      category: 'navigation',
      feedback: 'Opening music page'
    })

    registerCommand({
      phrases: ['go to clicker', 'clicker', 'clicker game'],
      action: () => router.push('/clicker'),
      description: 'Navigate to clicker game',
      category: 'navigation',
      feedback: 'Opening clicker game'
    })

    registerCommand({
      phrases: ['go to mold', 'mold', 'mold page'],
      action: () => router.push('/mold'),
      description: 'Navigate to mold page',
      category: 'navigation',
      feedback: 'Opening mold page'
    })

    registerCommand({
      phrases: ['go to clock', 'clock', 'clocks', 'clock page'],
      action: () => router.push('/clocks'),
      description: 'Navigate to clocks page',
      category: 'navigation',
      feedback: 'Opening clocks page'
    })

    registerCommand({
      phrases: ['go to stocks', 'stocks', 'stock market'],
      action: () => router.push('/stocks'),
      description: 'Navigate to stocks page',
      category: 'navigation',
      feedback: 'Opening stocks page'
    })

    registerCommand({
      phrases: ['go to solar', 'solar', 'solar panels'],
      action: () => router.push('/solar'),
      description: 'Navigate to solar panel page',
      category: 'navigation',
      feedback: 'Opening solar page'
    })

    registerCommand({
      phrases: ['go to messages', 'messages', 'message page'],
      action: () => router.push('/messages'),
      description: 'Navigate to messages page',
      category: 'navigation',
      feedback: 'Opening messages'
    })

    // Browser navigation
    registerCommand({
      phrases: ['go back', 'back', 'previous page'],
      action: () => router.back(),
      description: 'Go back to previous page',
      category: 'navigation',
      feedback: 'Going back'
    })

    registerCommand({
      phrases: ['go forward', 'forward', 'next page'],
      action: () => router.forward(),
      description: 'Go forward in history',
      category: 'navigation',
      feedback: 'Going forward'
    })

    // Scroll commands
    registerCommand({
      phrases: ['scroll down', 'page down'],
      action: () => {
        window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' })
      },
      description: 'Scroll page down',
      category: 'actions',
      feedback: 'Scrolling down'
    })

    registerCommand({
      phrases: ['scroll up', 'page up'],
      action: () => {
        window.scrollBy({ top: -window.innerHeight * 0.5, behavior: 'smooth' })
      },
      description: 'Scroll page up',
      category: 'actions',
      feedback: 'Scrolling up'
    })

    registerCommand({
      phrases: ['scroll to top', 'go to top', 'top of page'],
      action: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },
      description: 'Scroll to top of page',
      category: 'actions',
      feedback: 'Scrolling to top'
    })

    registerCommand({
      phrases: ['scroll to bottom', 'go to bottom', 'bottom of page'],
      action: () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      },
      description: 'Scroll to bottom of page',
      category: 'actions',
      feedback: 'Scrolling to bottom'
    })

    // Panel commands
    registerCommand({
      phrases: ['open favorites panel', 'show favorites', 'toggle favorites'],
      action: () => appStore.togglePanel('favorites'),
      description: 'Toggle favorites panel',
      category: 'panels',
      feedback: 'Toggling favorites panel'
    })

    registerCommand({
      phrases: ['open rankings panel', 'show rankings', 'toggle rankings'],
      action: () => appStore.togglePanel('rankings'),
      description: 'Toggle rankings panel',
      category: 'panels',
      feedback: 'Toggling rankings panel'
    })

    registerCommand({
      phrases: ['close panels', 'close all panels', 'hide panels'],
      action: () => {
        if (appStore.panels.favorites) appStore.togglePanel('favorites')
        if (appStore.panels.rankings) appStore.togglePanel('rankings')
        if (appStore.panels.feed) appStore.togglePanel('feed')
      },
      description: 'Close all panels',
      category: 'panels',
      feedback: 'Closing panels'
    })

    // Theme commands
    registerCommand({
      phrases: ['toggle dark mode', 'dark mode', 'switch theme'],
      action: () => appStore.toggleDarkMode(),
      description: 'Toggle dark mode',
      category: 'actions',
      feedback: 'Toggling dark mode'
    })

    // Music commands
    registerCommand({
      phrases: ['toggle music', 'play music', 'stop music', 'music'],
      action: () => appStore.toggleMusic(),
      description: 'Toggle background music',
      category: 'actions',
      feedback: 'Toggling music'
    })

    registerCommand({
      phrases: ['mute', 'mute audio', 'mute sound'],
      action: () => {
        if (!appStore.isMuted) appStore.toggleMute()
      },
      description: 'Mute all audio',
      category: 'actions',
      feedback: 'Muting audio'
    })

    registerCommand({
      phrases: ['unmute', 'unmute audio', 'unmute sound'],
      action: () => {
        if (appStore.isMuted) appStore.toggleMute()
      },
      description: 'Unmute audio',
      category: 'actions',
      feedback: 'Unmuting audio'
    })

    // Action commands
    registerCommand({
      phrases: ['next quote', 'new quote', 'quote'],
      action: () => appStore.nextQuote(),
      description: 'Show next quote',
      category: 'actions',
      feedback: 'Next quote'
    })

    registerCommand({
      phrases: ['new cat', 'next cat', 'cat picture'],
      action: () => appStore.nextCat(),
      description: 'Load new cat image',
      category: 'actions',
      feedback: 'Loading new cat'
    })

    registerCommand({
      phrases: ['fart', 'play fart'],
      action: () => appStore.onFart(),
      description: 'Play fart sound',
      category: 'actions',
      feedback: '💨'
    })

    registerCommand({
      phrases: ['open search', 'search', 'command palette', 'search modal'],
      action: () => appStore.toggleSearchModal(),
      description: 'Open search modal',
      category: 'actions',
      feedback: 'Opening search'
    })

    registerCommand({
      phrases: ['close modal', 'close', 'close dialog', 'escape'],
      action: () => {
        // Dispatch escape key event to trigger close handlers
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      },
      description: 'Close current modal/dialog',
      category: 'actions',
      feedback: 'Closing'
    })

    // Help commands
    registerCommand({
      phrases: ['help', 'what can i say', 'show commands', 'commands', 'voice help'],
      action: () => {
        showCommandsOverlay()
      },
      description: 'Show available voice commands',
      category: 'help',
      feedback: 'Showing commands'
    })

    // Stop listening
    registerCommand({
      phrases: ['stop listening', 'stop', 'cancel'],
      action: () => {
        stopListening()
        showFeedbackOverlay('Voice control stopped')
        speechSynthesis?.announce('Voice control stopped')
      },
      description: 'Stop voice recognition',
      category: 'actions',
      feedback: 'Stopping voice control'
    })
  }

  // Show commands overlay
  const showCommandsOverlay = () => {
    // Dispatch custom event for VoiceFeedback component to handle
    window.dispatchEvent(new CustomEvent('voice-show-commands'))
  }

  // Register a custom command
  const registerCommand = (command: VoiceCommand) => {
    // Check if command with same description exists
    const existing = commands.value.findIndex(c => c.description === command.description)
    if (existing !== -1) {
      commands.value[existing] = command
    } else {
      commands.value.push(command)
    }
  }

  // Unregister a command
  const unregisterCommand = (description: string) => {
    const index = commands.value.findIndex(c => c.description === description)
    if (index !== -1) {
      commands.value.splice(index, 1)
    }
  }

  // Start listening for commands
  const startListening = () => {
    if (!isSupported.value) {
      console.warn('[VoiceNavigation] Speech Recognition not supported')
      showFeedbackOverlay('Voice control not supported in this browser', 3000)
      return
    }

    if (!enabled.value) {
      console.log('[VoiceNavigation] Voice navigation is disabled')
      return
    }

    if (isListening.value) {
      console.log('[VoiceNavigation] Already listening')
      return
    }

    if (!recognition) {
      recognition = initRecognition()
    }

    if (recognition) {
      try {
        recognition.start()
        speechSynthesis?.announce('Listening')
      } catch (error) {
        console.error('[VoiceNavigation] Failed to start recognition:', error)
        lastError.value = 'Failed to start recognition'
      }
    }
  }

  // Stop listening
  const stopListening = () => {
    if (recognition) {
      try {
        recognition.stop()
      } catch (error) {
        console.error('[VoiceNavigation] Failed to stop recognition:', error)
      }
    }
    isListening.value = false
    voiceState.value = 'idle'
  }

  // Toggle listening
  const toggleListening = () => {
    if (isListening.value) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Enable/disable voice navigation
  const setEnabled = (value: boolean) => {
    enabled.value = value
    localStorage.setItem('voiceNavigationEnabled', value.toString())
    
    if (!value && isListening.value) {
      stopListening()
    }
    
    if (value) {
      speechSynthesis?.announce('Voice navigation enabled')
    }
  }

  // Get commands grouped by category
  const commandsByCategory = computed(() => {
    const categories: Record<string, VoiceCommand[]> = {
      navigation: [],
      actions: [],
      forms: [],
      panels: [],
      help: []
    }
    commands.value.forEach(cmd => {
      if (categories[cmd.category]) {
        categories[cmd.category].push(cmd)
      }
    })
    return categories
  })

  // Initialize
  const init = () => {
    checkSupport()
    
    // Load saved preference
    const savedEnabled = localStorage.getItem('voiceNavigationEnabled')
    if (savedEnabled !== null) {
      enabled.value = savedEnabled === 'true'
    }

    // Initialize recognition
    recognition = initRecognition()
    
    // Register default commands
    registerDefaultCommands()

    console.log('[VoiceNavigation] Initialized with', commands.value.length, 'commands')
  }

  // Cleanup
  const cleanup = () => {
    stopListening()
    recognition = null
    commands.value = []
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
    isSupported,
    isListening,
    voiceState,
    lastTranscript,
    lastError,
    commands,
    commandHistory,
    enabled,
    showFeedback,
    feedbackMessage,

    // Computed
    commandsByCategory,
    isReady: computed(() => isSupported.value && enabled.value),

    // Actions
    startListening,
    stopListening,
    toggleListening,
    setEnabled,
    registerCommand,
    unregisterCommand,
    showFeedbackOverlay,
    showCommandsOverlay,
    
    // Init/cleanup
    init,
    cleanup
  }
}
