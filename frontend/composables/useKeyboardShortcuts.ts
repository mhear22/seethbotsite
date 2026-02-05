/**
 * Keyboard Shortcuts Composable
 * Provides global keyboard shortcut functionality
 */

import { onMounted, onUnmounted, ref } from 'vue'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
}

export function useKeyboardShortcuts() {
  const shortcuts = ref<Shortcut[]>([])
  const isHelpOpen = ref(false)

  const registerShortcut = (shortcut: Shortcut) => {
    shortcuts.value.push(shortcut)
  }

  const unregisterShortcut = (key: string) => {
    const index = shortcuts.value.findIndex(s => s.key === key)
    if (index !== -1) {
      shortcuts.value.splice(index, 1)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.getAttribute('contenteditable') === 'true') {
      return
    }

    for (const shortcut of shortcuts.value) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = !!shortcut.ctrl === event.ctrlKey
      const shiftMatches = !!shortcut.shift === event.shiftKey
      const altMatches = !!shortcut.alt === event.altKey

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault()
        shortcut.action()
        break
      }
    }
  }

  const toggleHelp = () => {
    isHelpOpen.value = !isHelpOpen.value
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    shortcuts,
    isHelpOpen,
    toggleHelp,
    registerShortcut,
    unregisterShortcut
  }
}
