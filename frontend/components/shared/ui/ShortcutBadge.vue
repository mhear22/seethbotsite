<script setup lang="ts">
import { computed } from 'vue'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

const props = defineProps<{
  shortcut: Shortcut | string
  compact?: boolean
}>()

// Parse shortcut if it's a string
const parsedShortcut = computed(() => {
  if (typeof props.shortcut === 'string') {
    // Parse string like "Ctrl+K" or "Cmd+K"
    const parts = props.shortcut.split('+')
    return {
      key: parts[parts.length - 1],
      ctrl: parts.includes('Ctrl'),
      shift: parts.includes('Shift'),
      alt: parts.includes('Alt'),
      meta: parts.includes('Cmd') || parts.includes('Meta')
    }
  }
  return props.shortcut
})

// Format shortcut for display
const formattedShortcut = computed(() => {
  const s = parsedShortcut.value
  const parts: string[] = []

  if (s.ctrl) parts.push('Ctrl')
  if (s.meta) parts.push('⌘')
  if (s.shift) parts.push('Shift')
  if (s.alt) parts.push('Alt')

  parts.push(s.key.toUpperCase())

  return parts
})

const isCompact = computed(() => props.compact ?? false)
</script>

<template>
  <span class="shortcut-badge" :class="{ compact }">
    <span
      v-for="(part, index) in formattedShortcut"
      :key="index"
      class="shortcut-part"
    >
      {{ part }}
    </span>
  </span>
</template>

<style scoped>
.shortcut-badge {
  display: inline-flex;
  gap: 2px;
  align-items: center;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #718096;
  background: #f7fafc;
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

.shortcut-part {
  display: inline-block;
  padding: 0 2px;
}

/* Compact version - smaller padding */
.shortcut-badge.compact {
  font-size: 10px;
  padding: 1px 3px;
  gap: 1px;
}

/* Dark mode */
.dark .shortcut-badge {
  color: #a0aec0;
  background: #2d3748;
  border-color: #4a5568;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Chaos theme */
.chaos .shortcut-badge {
  animation: chaosBadge 0.3s ease-in-out infinite;
  background: #ff0080;
  color: white;
  border-color: #ff69b4;
}

@keyframes chaosBadge {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
