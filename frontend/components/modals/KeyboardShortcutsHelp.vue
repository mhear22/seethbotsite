<template>
  <div v-if="isOpen" class="modal-overlay" @click="close" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-content" @click.stop ref="modalRef">
      <div class="modal-header">
        <h2 id="modal-title">⌨️ Keyboard Shortcuts</h2>
        <button class="close-button" @click="close" aria-label="Close modal">✕</button>
      </div>
      <div class="modal-body">
        <div v-for="(groupShortcuts, category) in shortcutsByCategory" :key="category" class="shortcut-category">
          <h3 class="category-title">{{ getCategoryTitle(category) }}</h3>
          <div class="shortcut-list">
            <div v-for="shortcut in groupShortcuts" :key="formatShortcut(shortcut)" class="shortcut-item">
              <kbd class="shortcut-key">{{ formatShortcut(shortcut) }}</kbd>
              <span class="shortcut-description">{{ shortcut.description }}</span>
            </div>
          </div>
        </div>
        <div v-if="Object.keys(shortcutsByCategory).every(cat => shortcutsByCategory[cat].length === 0)" class="no-shortcuts">
          <p>No keyboard shortcuts configured.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="close-button footer-button" @click="close" @keydown.enter="close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useKeyboardShortcuts } from '../../composables/useKeyboardShortcuts'

interface Props {
  isOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false
})

const emit = defineEmits<{
  close: []
}>()

const { shortcutsByCategory, formatShortcut } = useKeyboardShortcuts()

const modalRef = ref<HTMLElement | null>(null)
const previouslyFocusedElement = ref<HTMLElement | null>(null)

const getCategoryTitle = (category: string): string => {
  const titles: Record<string, string> = {
    navigation: '🧭 Navigation',
    actions: '⚡ Actions',
    panels: '📊 Panels',
    modals: '🔲 Modals'
  }
  return titles[category] || category
}

const close = () => {
  emit('close')
}

// Handle Escape key to close the modal
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
  // Tab key - trap focus within modal
  else if (event.key === 'Tab') {
    if (!modalRef.value) return

    const focusableElements = modalRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault()
      lastFocusable.focus()
    } else if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault()
      firstFocusable.focus()
    }
  }
}

// Watch for modal open/close to manage focus
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Modal is opening
    nextTick(() => {
      // Store currently focused element to restore later
      previouslyFocusedElement.value = document.activeElement as HTMLElement

      // Focus the close button
      const closeButton = modalRef.value?.querySelector('.modal-header .close-button') as HTMLElement
      if (closeButton) {
        closeButton.focus()
      }

      // Add keyboard event listener
      document.addEventListener('keydown', handleKeyDown)
    })
  } else {
    // Modal is closing
    document.removeEventListener('keydown', handleKeyDown)

    // Restore focus to previously focused element
    if (previouslyFocusedElement.value) {
      previouslyFocusedElement.value.focus()
      previouslyFocusedElement.value = null
    }
  }
})

// Clean up event listener on component unmount
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  border: 1px solid var(--border-color);
  margin: 20px auto;
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
    margin: 10px auto;
    border-radius: 8px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-header h2 {
    font-size: 1.2rem;
  }

  .modal-body {
    padding: 16px;
  }

  .category-title {
    font-size: 1rem;
  }

  .shortcut-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 8px;
  }

  .shortcut-key {
    font-size: 0.8rem;
    padding: 3px 8px;
  }

  .shortcut-description {
    font-size: 0.9rem;
  }

  .modal-footer {
    padding: 12px 16px;
  }

  .footer-button {
    width: 100%;
    padding: 12px;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
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
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.close-button {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-button:hover,
.close-button:focus {
  background: var(--bg-hover);
  color: var(--text-primary);
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.shortcut-category {
  margin-bottom: 24px;
}

.category-title {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  color: var(--text-primary);
  font-weight: 600;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.shortcut-item:hover {
  background: var(--bg-hover);
}

.shortcut-key {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 4px 10px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
  font-size: 0.85rem;
  color: var(--text-primary);
  white-space: nowrap;
  min-width: fit-content;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.shortcut-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.no-shortcuts {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.footer-button {
  padding: 10px 24px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-button:hover,
.footer-button:focus {
  opacity: 0.9;
  transform: translateY(-1px);
  outline: 2px solid white;
  outline-offset: 2px;
}

/* Dark mode support */
:global(.dark) .modal-content {
  background: #1a1a1a;
}

:global(.dark) .shortcut-key {
  background: #2d2d2d;
  border-color: #3d3d3d;
}

:global(.dark) .shortcut-item:hover {
  background: #2d2d2d;
}

/* Darker mode support */
:global(.darker) .modal-content {
  background: #0d0d0d;
}

:global(.darker) .shortcut-key {
  background: #1a1a1a;
  border-color: #2d2d2d;
}

:global(.darker) .shortcut-item:hover {
  background: #1a1a1a;
}
</style>
