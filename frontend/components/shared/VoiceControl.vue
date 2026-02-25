<template>
  <div class="voice-control" :class="{ 'voice-active': isListening, 'voice-disabled': !enabled }">
    <!-- Main voice button -->
    <button
      ref="voiceButton"
      class="voice-button"
      :class="{
        'listening': isListening,
        'processing': voiceState === 'processing',
        'error': voiceState === 'error'
      }"
      :aria-label="ariaLabel"
      :title="tooltip"
      @click="toggleListening"
    >
      <!-- Microphone icon -->
      <svg
        v-if="!isListening"
        class="mic-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>

      <!-- Listening animation -->
      <div v-else class="listening-indicator">
        <div class="sound-wave">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- Processing spinner -->
      <svg
        v-if="voiceState === 'processing'"
        class="processing-spinner"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="32" stroke-dashoffset="32">
          <animate
            attributeName="stroke-dashoffset"
            values="32;0"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </button>

    <!-- Status indicator -->
    <div v-if="showStatus" class="voice-status">
      <span class="status-text">{{ statusText }}</span>
      <span v-if="lastTranscript && isListening" class="transcript">"{{ lastTranscript }}"</span>
    </div>

    <!-- Settings toggle -->
    <button
      v-if="showSettings"
      class="settings-toggle"
      :class="{ 'active': showSettingsPanel }"
      title="Voice settings"
      @click.stop="toggleSettings"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v10M1 12h6m6 0h10" />
      </svg>
    </button>

    <!-- Settings panel -->
    <Transition name="slide">
      <div v-if="showSettingsPanel" class="settings-panel">
        <h3>Voice Control Settings</h3>
        
        <label class="setting-item">
          <input type="checkbox" v-model="voiceEnabled" @change="toggleVoiceEnabled" />
          <span>Enable voice navigation</span>
        </label>

        <label class="setting-item">
          <input type="checkbox" v-model="feedbackEnabled" @change="toggleFeedbackEnabled" />
          <span>Voice feedback</span>
        </label>

        <button class="help-button" @click="showCommands">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 9a3 3 0 1 1 4 2.83V14" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>View Commands</span>
        </button>
      </div>
    </Transition>

    <!-- Not supported message -->
    <div v-if="!isSupported" class="not-supported">
      <span>⚠️ Voice control not supported in this browser</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useVoiceNavigation, type VoiceState } from '../../composables/useVoiceNavigation'
import { useSpeechSynthesis } from '../../composables/useSpeechSynthesis'

// Props
interface Props {
  showStatus?: boolean
  showSettings?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

const props = withDefaults(defineProps<Props>(), {
  showStatus: true,
  showSettings: true,
  position: 'bottom-right'
})

// Voice navigation
const voice = useVoiceNavigation()
const synth = useSpeechSynthesis()

// Local state
const showSettingsPanel = ref(false)
const voiceEnabled = ref(voice.enabled.value)
const feedbackEnabled = ref(synth.enabled.value)

// Refs
const voiceButton = ref<HTMLButtonElement | null>(null)

// Computed
const isSupported = computed(() => voice.isSupported.value)
const isListening = computed(() => voice.isListening.value)
const voiceState = computed(() => voice.voiceState.value)
const enabled = computed(() => voice.enabled.value)
const lastTranscript = computed(() => voice.lastTranscript.value)

const ariaLabel = computed(() => {
  if (!isSupported.value) return 'Voice control not supported'
  if (isListening.value) return 'Stop voice control'
  return 'Start voice control'
})

const tooltip = computed(() => {
  if (!isSupported.value) return 'Voice control not supported in this browser'
  if (isListening.value) return 'Click to stop listening'
  return 'Click to start voice commands'
})

const statusText = computed(() => {
  if (!isSupported.value) return 'Not supported'
  if (!enabled.value) return 'Voice control disabled'
  
  switch (voiceState.value) {
    case 'listening':
      return 'Listening...'
    case 'processing':
      return 'Processing...'
    case 'error':
      return 'Error'
    default:
      return 'Ready'
  }
})

// Actions
const toggleListening = () => {
  voice.toggleListening()
}

const toggleSettings = () => {
  showSettingsPanel.value = !showSettingsPanel.value
}

const toggleVoiceEnabled = () => {
  voice.setEnabled(voiceEnabled.value)
}

const toggleFeedbackEnabled = () => {
  synth.setEnabled(feedbackEnabled.value)
}

const showCommands = () => {
  voice.showCommandsOverlay()
  showSettingsPanel.value = false
}

// Keyboard shortcut (press 'v' to toggle voice)
const handleKeyPress = (event: KeyboardEvent) => {
  // Don't trigger when typing in inputs
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return
  }

  // V key toggles voice control
  if (event.key.toLowerCase() === 'v' && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault()
    toggleListening()
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.voice-control {
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  /* Default position: bottom-right */
  bottom: 20px;
  right: 20px;
}

.voice-control[data-position="bottom-left"] {
  right: auto;
  left: 20px;
}

.voice-control[data-position="top-right"] {
  bottom: auto;
  top: 20px;
}

.voice-control[data-position="top-left"] {
  bottom: auto;
  right: auto;
  top: 20px;
  left: 20px;
}

/* Main voice button */
.voice-button {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary, #2a2a2a);
  color: var(--text-primary, #fff);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.voice-button:hover {
  transform: scale(1.05);
  background: var(--bg-tertiary, #3a3a3a);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.voice-button:focus {
  outline: 3px solid var(--accent-color, #00ff88);
  outline-offset: 2px;
}

.voice-button.listening {
  background: var(--accent-color, #00ff88);
  color: #000;
  animation: pulse 1.5s ease-in-out infinite;
}

.voice-button.processing {
  background: var(--warning-color, #ffaa00);
  animation: spin 1s linear infinite;
}

.voice-button.error {
  background: var(--error-color, #ff4444);
}

.voice-disabled .voice-button {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mic icon */
.mic-icon {
  width: 24px;
  height: 24px;
}

/* Sound wave animation */
.listening-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sound-wave {
  display: flex;
  gap: 3px;
  height: 24px;
  align-items: center;
}

.sound-wave span {
  width: 4px;
  height: 8px;
  background: currentColor;
  border-radius: 2px;
  animation: sound-wave 0.8s ease-in-out infinite;
}

.sound-wave span:nth-child(1) { animation-delay: 0s; }
.sound-wave span:nth-child(2) { animation-delay: 0.1s; }
.sound-wave span:nth-child(3) { animation-delay: 0.2s; }
.sound-wave span:nth-child(4) { animation-delay: 0.3s; }

@keyframes sound-wave {
  0%, 100% { height: 8px; }
  50% { height: 20px; }
}

/* Processing spinner */
.processing-spinner {
  position: absolute;
  top: -4px;
  left: -4px;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  color: var(--accent-color, #00ff88);
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(0, 255, 136, 0);
  }
}

/* Status indicator */
.voice-status {
  background: var(--bg-secondary, #2a2a2a);
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  min-width: 100px;
}

.status-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #aaa);
}

.transcript {
  font-size: 11px;
  color: var(--text-muted, #888);
  font-style: italic;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Settings toggle */
.settings-toggle {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary, #3a3a3a);
  color: var(--text-secondary, #aaa);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.settings-toggle:hover,
.settings-toggle.active {
  background: var(--accent-color, #00ff88);
  color: #000;
}

.settings-toggle svg {
  width: 14px;
  height: 14px;
}

/* Settings panel */
.settings-panel {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 12px;
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  padding: 16px;
  min-width: 220px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.settings-panel h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #fff);
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary, #aaa);
}

.setting-item:hover {
  color: var(--text-primary, #fff);
}

.setting-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--accent-color, #00ff88);
}

.help-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border: 1px solid var(--border-color, #444);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #aaa);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.help-button:hover {
  background: var(--bg-tertiary, #3a3a3a);
  color: var(--text-primary, #fff);
  border-color: var(--accent-color, #00ff88);
}

.help-button svg {
  width: 16px;
  height: 16px;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Not supported message */
.not-supported {
  background: var(--error-color, #ff4444);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  text-align: center;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .voice-button,
  .settings-toggle,
  .settings-panel {
    transition: none;
  }
  
  .voice-button.listening {
    animation: none;
  }
  
  .sound-wave span {
    animation: none;
    height: 12px;
  }
  
  .processing-spinner {
    animation: none;
  }
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .voice-control {
    bottom: 16px;
    right: 16px;
  }
  
  .voice-button {
    width: 48px;
    height: 48px;
  }
  
  .mic-icon {
    width: 20px;
    height: 20px;
  }
  
  .settings-panel {
    right: -60px;
    min-width: 200px;
  }
}
</style>
