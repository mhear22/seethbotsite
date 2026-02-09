/**
 * Keyboard Shortcuts Composable
 * Provides global keyboard shortcut functionality
 */

import { onMounted, onUnmounted, ref, computed } from 'vue'

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean // Cmd key on Mac
  description: string
  category: 'navigation' | 'actions' | 'panels' | 'modals'
  action: () => void
}

// Shared state (singleton pattern)
const shortcuts = ref<Shortcut[]>([])
const isHelpOpen = ref(false)
const enabled = ref(true)
let isListenerSetup = false

export function useKeyboardShortcuts() {

  // Helper to format keyboard shortcuts for display
  const formatShortcut = (shortcut: Shortcut): string => {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.meta) parts.push('⌘')
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }

  // Enable shortcuts
  const enable = () => {
    enabled.value = true
  }

  // Disable shortcuts
  const disable = () => {
    enabled.value = false
  }

  // Register a keyboard shortcut
  const registerShortcut = (shortcut: Shortcut) => {
    shortcuts.value.push(shortcut)
  }

  // Unregister a keyboard shortcut
  const unregisterShortcut = (key: string, modifiers?: Pick<Shortcut, 'ctrl' | 'shift' | 'alt' | 'meta'>) => {
    const index = shortcuts.value.findIndex(s => {
      const keyMatches = s.key.toLowerCase() === key.toLowerCase()
      const ctrlMatches = !!modifiers?.ctrl === !!s.ctrl
      const shiftMatches = !!modifiers?.shift === !!s.shift
      const altMatches = !!modifiers?.alt === !!s.alt
      const metaMatches = !!modifiers?.meta === !!s.meta
      return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches
    })
    if (index !== -1) {
      shortcuts.value.splice(index, 1)
    }
  }

  // Handle keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    // Skip if shortcuts are disabled
    if (!enabled.value) {
      return
    }

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.getAttribute('contenteditable') === 'true') {
      return
    }

    for (const shortcut of shortcuts.value) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = !!shortcut.ctrl === event.ctrlKey
      const shiftMatches = !!shortcut.shift === event.shiftKey
      const altMatches = !!shortcut.alt === event.altKey
      const metaMatches = !!shortcut.meta === event.metaKey

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        event.preventDefault()
        shortcut.action()
        break
      }
    }
  }

  // Toggle help modal
  const toggleHelp = () => {
    isHelpOpen.value = !isHelpOpen.value
  }

  // Group shortcuts by category
  const shortcutsByCategory = computed(() => {
    const categories: Record<string, Shortcut[]> = {
      navigation: [],
      actions: [],
      panels: [],
      modals: []
    }
    shortcuts.value.forEach(shortcut => {
      if (categories[shortcut.category]) {
        categories[shortcut.category].push(shortcut)
      }
    })
    return categories
  })

  // Setup event listeners (only once)
  onMounted(() => {
    if (!isListenerSetup) {
      window.addEventListener('keydown', handleKeyDown)
      isListenerSetup = true
    }
  })

  // Note: We don't remove the listener on unmount since this is a global singleton

  return {
    shortcuts,
    shortcutsByCategory,
    isHelpOpen,
    enabled,
    toggleHelp,
    registerShortcut,
    unregisterShortcut,
    formatShortcut,
    enable,
    disable
  }
}
