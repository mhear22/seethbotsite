<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const confirmationBox = ref<HTMLElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

const close = () => {
  // Restore focus to previously focused element
  if (previouslyFocused.value) {
    previouslyFocused.value.focus()
  }
  emit('close')
}

const confirm = () => {
  emit('confirm')
}

// Close on Escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    close()
  }
}

// Focus trap - keep focus within modal
const handleTab = (e: KeyboardEvent) => {
  if (!confirmationBox.value) return

  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ]

  const elements = Array.from(confirmationBox.value.querySelectorAll(focusableSelectors.join(',')))
  if (elements.length === 0) return

  const firstElement = elements[0]
  const lastElement = elements[elements.length - 1]

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      // Shift + Tab: going backwards
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab: going forwards
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }
}

// Set up focus management when modal opens
const setupFocusManagement = async () => {
  if (props.isOpen && confirmationBox.value) {
    // Save previously focused element
    previouslyFocused.value = document.activeElement as HTMLElement

    // Focus the first button (Go back)
    await nextTick()
    const buttons = confirmationBox.value.querySelectorAll('.cute-btn') as NodeListOf<HTMLElement>
    if (buttons.length > 0) {
      buttons[0].focus()
    }

    // Add tab event listener for focus trapping
    document.addEventListener('keydown', handleTab)
  } else {
    // Remove tab event listener when modal closes
    document.removeEventListener('keydown', handleTab)
  }
}

// Watch for modal open/close
watch(() => props.isOpen, setupFocusManagement)

// Add/remove escape key listener
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('keydown', handleTab)
})
</script>

<template>
  <div class="confirmation" :class="{ active: isOpen }" @click.self="close" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
    <div class="confirmation-box" ref="confirmationBox">
      <div class="emoji" aria-hidden="true">💕</div>
      <h1 id="confirmation-title">So you want to be a girl?</h1>
      <p>You could totally be a girl if you wanted. No matter who you are or what you've been through, don't let anything stop you from living as your best self!</p>
      <p>✨ You are valid no matter who you are ✨</p>
      <div class="button-row">
        <button class="cute-btn" @click="close" @keydown.enter="close" aria-label="Cancel and return to previous page">Go back</button>
        <button class="cute-btn" @click="confirm" @keydown.enter="confirm" aria-label="Confirm and switch to girl mode" style="background: linear-gradient(45deg, #ff6b9d, #ff8a80);">Yes! Turn me into a girl! 💕</button>
      </div>
    </div>
  </div>
</template>
