<script setup lang="ts">
import { computed } from 'vue'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
}

const props = defineProps<{
  shortcuts: Shortcut[]
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const formatShortcut = (shortcut: Shortcut) => {
  const parts: string[] = []
  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.alt) parts.push('Alt')
  if (shortcut.shift) parts.push('Shift')
  parts.push(shortcut.key.toUpperCase())
  return parts.join(' + ')
}

const groupedShortcuts = computed(() => {
  const groups: Record<string, Shortcut[]> = {
    Navigation: [],
    Actions: [],
    Toggles: [],
    Other: []
  }

  props.shortcuts.forEach(shortcut => {
    const desc = shortcut.description.toLowerCase()
    if (desc.includes('go to') || desc.includes('navigate')) {
      groups.Navigation.push(shortcut)
    } else if (desc.includes('toggle') || desc.includes('show') || desc.includes('hide')) {
      groups.Toggles.push(shortcut)
    } else if (desc.includes('create') || desc.includes('save') || desc.includes('delete')) {
      groups.Actions.push(shortcut)
    } else {
      groups.Other.push(shortcut)
    }
  })

  return groups
})
</script>

<template>
  <div v-if="isOpen" class="shortcuts-modal-backdrop" @click="emit('close')">
    <div class="shortcuts-modal" @click.stop>
      <div class="shortcuts-modal-header">
        <h2>⌨️ Keyboard Shortcuts</h2>
        <button class="close-btn" @click="emit('close')" aria-label="Close">×</button>
      </div>

      <div class="shortcuts-modal-body">
        <div v-for="(shortcuts, category) in groupedShortcuts" :key="category" class="shortcuts-category">
          <h3 v-if="shortcuts.length > 0">{{ category }}</h3>
          <ul v-if="shortcuts.length > 0">
            <li v-for="shortcut in shortcuts" :key="shortcut.description" class="shortcut-item">
              <kbd class="shortcut-key">{{ formatShortcut(shortcut) }}</kbd>
              <span class="shortcut-description">{{ shortcut.description }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="shortcuts-modal-footer">
        <button class="close-btn-footer" @click="emit('close')">Close (Esc)</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shortcuts-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.shortcuts-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.dark .shortcuts-modal {
  background: #1a1a2e;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.shortcuts-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dark .shortcuts-modal-header {
  border-bottom-color: #374151;
}

.shortcuts-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.dark .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.shortcuts-modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(80vh - 120px);
}

.shortcuts-category h3 {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
}

.dark .shortcuts-category h3 {
  color: #9ca3af;
}

.shortcuts-category {
  margin-bottom: 20px;
}

.shortcuts-category:last-child {
  margin-bottom: 0;
}

.shortcuts-category ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.shortcut-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 12px;
}

.shortcut-key {
  display: inline-flex;
  gap: 4px;
  padding: 4px 8px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: monospace;
  font-weight: 600;
  min-width: fit-content;
}

.dark .shortcut-key {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
}

.shortcut-description {
  flex: 1;
  font-size: 0.9rem;
}

.shortcuts-modal-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.dark .shortcuts-modal-footer {
  border-top-color: #374151;
}

.close-btn-footer {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.close-btn-footer:hover {
  background: #2563eb;
}
</style>
