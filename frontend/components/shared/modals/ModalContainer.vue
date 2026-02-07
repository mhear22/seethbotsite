<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

export interface ModalItem {
  id: string
  title: string
  icon: string
  isOpen: boolean
  position?: 'left' | 'right'
}

// Make ModalItem available for import
export type { ModalItem }

const props = defineProps<{
  modals: ModalItem[]
}>()

const emit = defineEmits<{
  toggle: [modalId: string]
}>()

const collapsed = ref(false)

const containerClass = computed(() => {
  const positions = [...new Set(props.modals.map(m => m.position || 'left'))]
  return positions.includes('right') ? 'right-dock' : 'left-dock'
})

// localStorage key based on dock position
const storageKey = computed(() => `dock-collapsed-${containerClass.value.replace('-dock', '')}`)

// Load collapsed state from localStorage
onMounted(() => {
  const saved = localStorage.getItem(storageKey.value)
  if (saved !== null) {
    collapsed.value = saved === 'true'
  }
})

// Save collapsed state to localStorage when it changes
watch(collapsed, (newValue) => {
  localStorage.setItem(storageKey.value, String(newValue))
})

const toggleModal = (modalId: string) => {
  emit('toggle', modalId)
}

const toggleContainer = () => {
  collapsed.value = !collapsed.value
}

const openModals = computed(() => {
  return props.modals.filter(m => m.isOpen)
})

const anyOpen = computed(() => openModals.value.length > 0)
</script>

<template>
  <div class="modal-dock" :class="[containerClass, { collapsed }]" role="region" :aria-label="containerClass === 'left-dock' ? 'Left panel dock' : 'Right panel dock'">
    <!-- Toggle Button -->
    <button
      class="dock-toggle"
      @click="toggleContainer"
      :aria-label="collapsed ? 'Show panels' : 'Hide panels'"
      :aria-expanded="!collapsed"
      :title="collapsed ? 'Show modals' : 'Hide modals'"
    >
      {{ collapsed ? '◀' : '▶' }}
    </button>

    <!-- Modal List -->
    <div class="modal-list" role="list">
      <div
        v-for="modal in modals"
        :key="modal.id"
        class="modal-item"
        :class="{ 'modal-open': modal.isOpen }"
        role="listitem"
      >
        <!-- Toggle Button -->
        <button
          class="modal-toggle-btn"
          @click="toggleModal(modal.id)"
          :class="{ active: modal.isOpen }"
          :aria-expanded="modal.isOpen"
          :aria-controls="`modal-${modal.id}-content`"
          :title="`${modal.isOpen ? 'Close' : 'Open'} ${modal.title}`"
        >
          <span class="modal-icon" aria-hidden="true">{{ modal.icon }}</span>
          <span class="modal-title">{{ modal.title }}</span>
        </button>

        <!-- Modal Content Slot -->
        <div :id="`modal-${modal.id}-content`" class="modal-content-wrapper" role="region" :aria-hidden="!modal.isOpen">
          <slot :name="`modal-${modal.id}`" :modal="modal" :isOpen="modal.isOpen">
            <div v-if="modal.isOpen" class="modal-placeholder">
              {{ modal.title }} content
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-dock {
  position: fixed;
  top: 70px;
  bottom: 20px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0;
  z-index: 150;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  max-height: calc(100vh - 90px);
}

.modal-dock.left-dock {
  left: 20px;
}

.modal-dock.right-dock {
  right: 20px;
}

.dock-toggle {
  position: absolute;
  background: rgba(255, 107, 157, 0.9);
  color: white;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  z-index: 151;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  opacity: 0;
}

.modal-dock:hover .dock-toggle {
  opacity: 1;
}

.left-dock .dock-toggle {
  right: -40px;
}

.right-dock .dock-toggle {
  left: -40px;
  transform: rotate(180deg);
}

.dock-toggle:hover {
  background: rgba(255, 107, 157, 1);
  transform: scale(1.1);
  opacity: 1;
}

.right-dock .dock-toggle:hover {
  transform: rotate(180deg) scale(1.1);
  opacity: 1;
}

.modal-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 0;
  max-height: 100%;
}

.modal-item {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 107, 157, 0.3);
  border-radius: 12px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Quicksand', sans-serif;
  color: #666;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  flex-shrink: 0;
}

.modal-toggle-btn:hover {
  background: rgba(255, 107, 157, 0.1);
  border-color: rgba(255, 107, 157, 0.5);
  transform: translateX(-2px);
}

.modal-toggle-btn.active {
  background: rgba(255, 107, 157, 0.2);
  border-color: rgba(255, 107, 157, 0.7);
  color: #ff6b9d;
}

.modal-icon {
  font-size: 18px;
}

.modal-title {
  font-size: 13px;
}

.modal-content-wrapper {
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-item:not(.modal-open) .modal-content-wrapper {
  max-height: 0 !important;
}

.modal-item.modal-open .modal-content-wrapper {
  max-height: 500px;
}

.modal-placeholder {
  padding: 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0 0 12px 12px;
  font-size: 13px;
  color: #666;
  margin-top: -2px;
}

/* Collapsed state */
.modal-dock.collapsed {
  opacity: 0.3;
}

.modal-dock.collapsed .modal-list {
  opacity: 0;
  pointer-events: none;
}

.modal-dock.collapsed:hover {
  opacity: 1;
}

.modal-dock.collapsed:hover .modal-list {
  opacity: 1;
  pointer-events: auto;
}

/* Dark mode */
.dark .modal-toggle-btn {
  background: rgba(40, 44, 52, 0.95);
  border-color: rgba(255, 107, 157, 0.4);
  color: #aaa;
}

.dark .modal-toggle-btn:hover {
  background: rgba(255, 107, 157, 0.15);
  border-color: rgba(255, 107, 157, 0.6);
}

.dark .modal-toggle-btn.active {
  background: rgba(255, 107, 157, 0.25);
  border-color: rgba(255, 107, 157, 0.8);
  color: #ffb6c1;
}

.dark .modal-placeholder {
  background: rgba(40, 44, 52, 0.95);
  color: #aaa;
}

/* Scrollbar styling */
.modal-list::-webkit-scrollbar {
  width: 6px;
}

.modal-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.modal-list::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 157, 0.5);
  border-radius: 3px;
}

.modal-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 107, 157, 0.7);
}
</style>
