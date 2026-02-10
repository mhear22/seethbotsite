<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { exportRepository } from '../../repositories/export.repository'
import { useAudio } from '../../composables/useAudio'

const { playButtonClick, playSuccess, playError } = useAudio()

interface Props {
  type: 'rankings' | 'stats' | 'clicks' | 'history' | 'leaderboard'
  userId?: string
  gameType?: 'clicker' | 'fishing'
  statType?: string
  limit?: number
  buttonLabel?: string
  buttonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  userId: '',
  gameType: undefined,
  statType: undefined,
  limit: undefined,
  buttonLabel: 'Export',
  buttonClass: 'export-btn'
})

const emit = defineEmits<{
  exportStart: []
  exportComplete: []
  exportError: [error: string]
}>()

const showMenu = ref(false)
const isExporting = ref(false)

const handleExport = async (format: 'json' | 'csv') => {
  showMenu.value = false
  isExporting.value = true
  emit('exportStart')
  playButtonClick()

  try {
    switch (props.type) {
      case 'rankings':
        await exportRepository.exportRankings({ format })
        break
      case 'stats':
        if (!props.userId) {
          throw new Error('userId is required for stats export')
        }
        await exportRepository.exportStats({
          userId: props.userId,
          gameType: props.gameType,
          format
        })
        break
      case 'clicks':
        if (!props.userId) {
          throw new Error('userId is required for clicks export')
        }
        await exportRepository.exportClicks({
          userId: props.userId,
          limit: props.limit,
          format
        })
        break
      case 'history':
        if (!props.userId) {
          throw new Error('userId is required for history export')
        }
        await exportRepository.exportHistory({
          userId: props.userId,
          gameType: props.gameType,
          statType: props.statType,
          limit: props.limit,
          format
        })
        break
      case 'leaderboard':
        if (!props.gameType) {
          throw new Error('gameType is required for leaderboard export')
        }
        await exportRepository.exportLeaderboard({
          gameType: props.gameType,
          limit: props.limit,
          format
        })
        break
    }

    playSuccess()
    emit('exportComplete')
  } catch (error) {
    playError()
    const errorMessage = error instanceof Error ? error.message : 'Export failed'
    emit('exportError', errorMessage)
  } finally {
    isExporting.value = false
  }
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const container = document.querySelector('.export-button-container')
  if (container && !container.contains(target)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="export-button-container">
    <button
      :class="[buttonClass, { 'is-exporting': isExporting }]"
      @click="showMenu = !showMenu"
      :disabled="isExporting"
      :aria-label="`${isExporting ? 'Exporting' : 'Export data'}. ${showMenu ? 'Menu open' : 'Click to choose format'}`"
      :aria-expanded="showMenu"
      :aria-haspopup="true"
    >
      <span v-if="isExporting" aria-hidden="true">⏳</span>
      <span v-else aria-hidden="true">📥</span>
      {{ buttonLabel }}
    </button>

    <Transition name="dropdown">
      <div v-if="showMenu" class="export-menu" role="menu">
        <div class="menu-header">Export as:</div>
        <button class="menu-item" @click="handleExport('json')" role="menuitem">
          <span class="format-icon" aria-hidden="true">{ }</span>
          <span class="format-name">JSON</span>
        </button>
        <button class="menu-item" @click="handleExport('csv')" role="menuitem">
          <span class="format-icon" aria-hidden="true">📊</span>
          <span class="format-name">CSV</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.export-button-container {
  position: relative;
  display: inline-block;
}

.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.export-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.export-btn.is-exporting {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.export-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: rgba(30, 34, 42, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 180px;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.menu-header {
  padding: 8px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.menu-item:hover {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
}

.format-icon {
  font-size: 1.1rem;
}

.format-name {
  font-weight: 500;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Dark mode support */
.dark .export-btn {
  background: linear-gradient(135deg, #5568d3 0%, #6b4190 100%);
}

.dark .export-menu {
  background: rgba(20, 24, 32, 0.98);
  border-color: rgba(255, 255, 255, 0.05);
}

.dark .menu-item:hover {
  background: rgba(102, 126, 234, 0.2);
}
</style>
