<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const modalBox = ref<HTMLElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

const close = () => {
  // Restore focus to previously focused element
  if (previouslyFocused.value) {
    previouslyFocused.value.focus()
  }
  emit('close')
}

// Close on Escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    close()
  }
}

// Focus trap - keep focus within modal
const handleTab = (e: KeyboardEvent) => {
  if (!modalBox.value) return

  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ]

  const elements = Array.from(modalBox.value.querySelectorAll(focusableSelectors.join(',')))
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
  if (props.isOpen && modalBox.value) {
    // Save previously focused element
    previouslyFocused.value = document.activeElement as HTMLElement

    // Focus the close button
    await nextTick()
    const closeBtn = modalBox.value.querySelector('.cute-btn') as HTMLElement
    if (closeBtn) {
      closeBtn.focus()
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
  <div class="mika-modal" :class="{ active: isOpen }" @click.self="close" role="dialog" aria-modal="true" aria-label="Mika modal">
    <div class="mika-modal-box" ref="modalBox">
      <div class="emoji" role="img" aria-label="Cherry blossom">🌸</div>
      <h1>Hi there!</h1>
      <button class="cute-btn" @click="close" @keydown.enter="close">Close</button>
    </div>
  </div>
</template>
