<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showOverlay" class="voice-feedback-overlay" :class="{ 'show-commands': showingCommands }">
        <!-- Feedback message -->
        <Transition name="slide-up">
          <div v-if="showMessage" class="feedback-message" :class="messageType">
            <div class="feedback-icon">
              <!-- Success icon -->
              <svg v-if="messageType === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <!-- Error icon -->
              <svg v-else-if="messageType === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <!-- Processing icon -->
              <svg v-else-if="messageType === 'processing'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32">
                  <animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite" />
                </circle>
              </svg>
              <!-- Info icon -->
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <span class="feedback-text">{{ message }}</span>
          </div>
        </Transition>

        <!-- Commands help overlay -->
        <Transition name="fade-scale">
          <div v-if="showingCommands" class="commands-help">
            <div class="commands-header">
              <h2>Voice Commands</h2>
              <button class="close-button" @click="hideCommands" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div class="commands-content">
              <div v-for="(cmds, category) in commandsByCategory" :key="category" class="command-category">
                <h3 class="category-title">{{ formatCategory(category) }}</h3>
                <ul class="command-list">
                  <li v-for="cmd in cmds" :key="cmd.description" class="command-item">
                    <span class="command-phrases">{{ cmd.phrases.slice(0, 2).join(' • ') }}</span>
                    <span class="command-description">{{ cmd.description }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="commands-footer">
              <p>Press <kbd>V</kbd> to toggle voice control</p>
              <p>Say "stop" or "cancel" to stop listening</p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useVoiceNavigation } from '../../composables/useVoiceNavigation'

const voice = useVoiceNavigation()

// Local state
const showMessage = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | 'processing' | 'info'>('info')
const showingCommands = ref(false)
let messageTimeout: ReturnType<typeof setTimeout> | null = null

// Computed
const showOverlay = computed(() => showMessage.value || showingCommands.value)
const commandsByCategory = computed(() => voice.commandsByCategory.value)

// Format category name for display
const formatCategory = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

// Show feedback message
const showFeedback = (msg: string, type: 'success' | 'error' | 'processing' | 'info' = 'info', duration: number = 2000) => {
  message.value = msg
  messageType.value = type
  showMessage.value = true

  // Clear existing timeout
  if (messageTimeout) {
    clearTimeout(messageTimeout)
  }

  // Auto-hide after duration
  messageTimeout = setTimeout(() => {
    showMessage.value = false
  }, duration)
}

// Show commands help
const showCommands = () => {
  showingCommands.value = true
}

// Hide commands help
const hideCommands = () => {
  showingCommands.value = false
}

// Handle custom events from voice navigation
const handleShowCommands = () => {
  showCommands()
}

// Watch voice feedback state
const unwatchFeedback = voice.showFeedback

// Lifecycle
onMounted(() => {
  // Listen for custom events
  window.addEventListener('voice-show-commands', handleShowCommands)
  
  // Watch voice feedback changes
  // Note: In Vue 3, we can watch the ref directly
  import('vue').then(({ watch }) => {
    watch(
      () => voice.showFeedback.value,
      (showing) => {
        if (showing) {
          // Determine message type from content
          const msg = voice.feedbackMessage.value
          let type: 'success' | 'error' | 'processing' | 'info' = 'info'
          
          if (msg.includes('✓') || msg.includes('Navigating') || msg.includes('Opening') || msg.includes('Toggling')) {
            type = 'success'
          } else if (msg.includes('Error') || msg.includes("didn't understand")) {
            type = 'error'
          } else if (msg.includes('Listening') || msg.includes('Processing')) {
            type = 'processing'
          }
          
          showFeedback(msg, type)
        }
      }
    )
  })
})

onUnmounted(() => {
  window.removeEventListener('voice-show-commands', handleShowCommands)
  
  if (messageTimeout) {
    clearTimeout(messageTimeout)
  }
})

// Expose methods
defineExpose({
  showFeedback,
  showCommands,
  hideCommands
})
</script>

<style scoped>
.voice-feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
}

.voice-feedback-overlay.show-commands {
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

/* Feedback message */
.feedback-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
  max-width: 400px;
}

.feedback-message.success {
  border-left: 4px solid var(--accent-color, #00ff88);
}

.feedback-message.error {
  border-left: 4px solid var(--error-color, #ff4444);
}

.feedback-message.processing {
  border-left: 4px solid var(--warning-color, #ffaa00);
}

.feedback-message.info {
  border-left: 4px solid var(--info-color, #4488ff);
}

.feedback-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.feedback-icon svg {
  width: 100%;
  height: 100%;
}

.feedback-message.success .feedback-icon {
  color: var(--accent-color, #00ff88);
}

.feedback-message.error .feedback-icon {
  color: var(--error-color, #ff4444);
}

.feedback-message.processing .feedback-icon {
  color: var(--warning-color, #ffaa00);
}

.feedback-message.info .feedback-icon {
  color: var(--info-color, #4488ff);
}

.feedback-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #fff);
}

/* Commands help */
.commands-help {
  position: relative;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: var(--bg-secondary, #2a2a2a);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.commands-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color, #444);
  flex-shrink: 0;
}

.commands-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #fff);
}

.close-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #aaa);
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--bg-tertiary, #3a3a3a);
  color: var(--text-primary, #fff);
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.commands-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.command-category {
  margin-bottom: 24px;
}

.command-category:last-child {
  margin-bottom: 0;
}

.category-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent-color, #00ff88);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color, #444);
}

.command-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.command-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light, #333);
}

.command-item:last-child {
  border-bottom: none;
}

.command-phrases {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #fff);
}

.command-description {
  font-size: 12px;
  color: var(--text-muted, #888);
}

.commands-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color, #444);
  background: var(--bg-tertiary, #222);
  flex-shrink: 0;
}

.commands-footer p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted, #888);
  text-align: center;
}

.commands-footer p + p {
  margin-top: 4px;
}

.commands-footer kbd {
  display: inline-block;
  padding: 2px 6px;
  background: var(--bg-secondary, #2a2a2a);
  border: 1px solid var(--border-color, #444);
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .feedback-message,
  .commands-help {
    transition: none;
  }
  
  .fade-enter-active,
  .fade-leave-active,
  .slide-up-enter-active,
  .slide-up-leave-active,
  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: none;
  }
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .voice-feedback-overlay {
    padding-top: 60px;
  }
  
  .feedback-message {
    padding: 12px 16px;
    margin: 0 16px;
  }
  
  .feedback-text {
    font-size: 13px;
  }
  
  .commands-help {
    width: 95%;
    max-height: 85vh;
  }
  
  .commands-header {
    padding: 16px;
  }
  
  .commands-header h2 {
    font-size: 18px;
  }
  
  .commands-content {
    padding: 12px 16px;
  }
  
  .command-item {
    padding: 8px 0;
  }
}
</style>
