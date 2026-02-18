<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

const modalContainer = ref<HTMLElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)
const focusableElements = ref<HTMLElement[]>([])

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

// Get all focusable elements within modal
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ]
  return Array.from(container.querySelectorAll(focusableSelectors.join(',')))
}

// Focus trap - keep focus within modal
const handleTab = (e: KeyboardEvent) => {
  if (!modalContainer.value) return

  const elements = focusableElements.value
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
  if (props.isOpen && modalContainer.value) {
    // Save previously focused element
    previouslyFocused.value = document.activeElement as HTMLElement

    // Get focusable elements
    focusableElements.value = getFocusableElements(modalContainer.value)

    // Focus the close button or first focusable element
    await nextTick()
    const closeBtn = modalContainer.value.querySelector('.modal-close-btn') as HTMLElement
    if (closeBtn) {
      closeBtn.focus()
    } else if (focusableElements.value.length > 0) {
      focusableElements.value[0].focus()
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
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-container" ref="modalContainer">
        <div class="modal-header">
          <h2 id="modal-title" class="modal-title">{{ title }}</h2>
          <button class="modal-close-btn" @click="close" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
  font-weight: 600;
}

.modal-close-btn {
  background: transparent;
  border: none;
  font-size: 32px;
  line-height: 1;
  color: #718096;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: #f7fafc;
  color: #2d3748;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Dark mode */
.dark .modal-container {
  background: #2d3748;
}

.dark .modal-header {
  border-bottom-color: #4a5568;
}

.dark .modal-title {
  color: #e2e8f0;
}

.dark .modal-close-btn {
  color: #a0aec0;
}

.dark .modal-close-btn:hover {
  background: #1a202c;
  color: #e2e8f0;
}

.dark .modal-body {
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
}

.dark .modal-body::-webkit-scrollbar {
  width: 8px;
}

.dark .modal-body::-webkit-scrollbar-track {
  background: #1a202c;
}

.dark .modal-body::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.dark .modal-body::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>
