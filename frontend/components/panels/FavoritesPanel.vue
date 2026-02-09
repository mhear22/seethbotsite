<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFavoritesStore, type Favorite } from '../../stores/useFavoritesStore'
import { useAppStore } from '../../stores/useAppStore'
import { usePanels } from '../../composables/usePanels'

defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const appStore = useAppStore()
const favoritesStore = useFavoritesStore()
const { panels } = usePanels()
const isDragging = ref(false)
const dragStartIndex = ref<number | null>(null)

// Type-specific icon mapping
const getTypeIcon = (type: string) => {
  const icons = {
    page: '📄',
    panel: '📊',
    feature: '⚡'
  }
  return icons[type as keyof typeof icons] || '🔖'
}

// Get action for a favorite
const getFavoriteAction = (favorite: Favorite) => {
  switch (favorite.item_type) {
    case 'panel':
      return () => {
        if (panels.favorite in panels) {
          panels[favorite.item_id as keyof typeof panels] = true
        }
      }
    case 'feature':
      return () => {
        // Feature-specific actions could be handled here
        console.log('Launch feature:', favorite.item_id)
      }
    case 'page':
    default:
      return () => {
        // Navigation to pages could be handled here
        console.log('Navigate to page:', favorite.item_id)
      }
  }
}

// Handle drag start
const onDragStart = (event: DragEvent, index: number) => {
  isDragging.value = true
  dragStartIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

// Handle drag over
const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

// Handle drop
const onDrop = async (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  isDragging.value = false

  if (dragStartIndex.value === null || dragStartIndex.value === targetIndex) {
    return
  }

  const startIndex = dragStartIndex.value
  const newFavorites = [...favoritesStore.favorites]

  // Reorder the array
  const [movedItem] = newFavorites.splice(startIndex, 1)
  newFavorites.splice(targetIndex, 0, movedItem)

  // Get the IDs in the new order
  const favoriteIds = newFavorites.map(fav => fav.id)

  // Sync with backend
  await favoritesStore.reorderFavorites(favoriteIds)

  dragStartIndex.value = null
}

// Handle drag end
const onDragEnd = () => {
  isDragging.value = false
  dragStartIndex.value = null
}

// Handle click on favorite
const handleClick = (favorite: Favorite) => {
  const action = getFavoriteAction(favorite)
  if (action) {
    action()
  }
}

// Toggle favorite panel
const toggle = () => {
  emit('toggle')
}

// Remove favorite
const removeFavorite = async (event: Event, favoriteId: number) => {
  event.stopPropagation()
  await favoritesStore.removeFavorite(favoriteId)
}

// Load favorites on mount
onMounted(async () => {
  if (appStore.isAuthenticated) {
    await favoritesStore.loadFavorites()
  }
})
</script>

<template>
  <div class="favorites-panel" :class="{ collapsed: !isOpen }" role="region" aria-label="Quick favorites panel">
    <div class="favorites-header">
      <h3>⭐ Quick Favorites</h3>
      <button class="favorites-close" @click="toggle" aria-label="Close favorites panel">✕</button>
    </div>

    <div v-if="favoritesStore.loading" class="favorites-loading">
      Loading...
    </div>

    <div v-else-if="favoritesStore.error" class="favorites-error">
      {{ favoritesStore.error }}
    </div>

    <div v-else-if="favoritesStore.favorites.length === 0" class="favorites-empty">
      <p>No favorites yet</p>
      <small>Star items to add them here</small>
    </div>

    <ul v-else class="favorites-list" aria-label="Favorites list">
      <li
        v-for="(favorite, index) in favoritesStore.favorites"
        :key="favorite.id"
        class="favorite-item"
        :class="{ dragging: isDragging }"
        :draggable="true"
        @dragstart="onDragStart($event, index)"
        @dragover="onDragOver"
        @drop="onDrop($event, index)"
        @dragend="onDragEnd"
        @click="handleClick(favorite)"
        role="button"
        :tabindex="0"
        :aria-label="`${getTypeIcon(favorite.item_type)} ${favorite.display_name}, ${favorite.item_type}. Press Enter to open, or drag to reorder.`"
      >
        <div class="favorite-handle" aria-hidden="true">⋮⋮</div>
        <div class="favorite-icon" aria-hidden="true">{{ getTypeIcon(favorite.item_type) }}</div>
        <div class="favorite-info">
          <span class="favorite-name">{{ favorite.display_name }}</span>
          <span class="favorite-type">{{ favorite.item_type }}</span>
        </div>
        <button
          class="favorite-remove"
          @click="removeFavorite($event, favorite.id)"
          aria-label="Remove from favorites"
          tabindex="-1"
        >
          ✕
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.favorites-panel {
  position: fixed;
  top: 60px;
  right: 20px;
  width: 280px;
  max-height: calc(100vh - 100px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.favorites-panel.collapsed {
  transform: translateX(320px);
  opacity: 0;
  pointer-events: none;
}

.favorites-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

.favorites-header h3 {
  margin: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.favorites-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 0.2s;
}

.favorites-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.favorites-loading,
.favorites-error,
.favorites-empty {
  padding: 24px 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.favorites-error {
  color: #e53e3e;
}

.favorites-empty small {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.favorites-list {
  list-style: none;
  margin: 0;
  padding: 8px;
  overflow-y: auto;
  flex: 1;
}

.favorite-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 4px;
  background: #f7fafc;
  border-radius: 8px;
  cursor: move;
  transition: background 0.2s, transform 0.2s;
  user-select: none;
}

.favorite-item:hover {
  background: #edf2f7;
}

.favorite-item:active {
  transform: scale(0.98);
}

.favorite-item[tabindex="0"]:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.favorite-item.dragging {
  opacity: 0.5;
}

.favorite-handle {
  color: #a0aec0;
  font-size: 12px;
  cursor: grab;
  margin-right: 8px;
}

.favorite-icon {
  font-size: 20px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.favorite-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.favorite-name {
  font-size: 13px;
  font-weight: 500;
  color: #2d3748;
}

.favorite-type {
  font-size: 11px;
  color: #718096;
  text-transform: capitalize;
}

.favorite-remove {
  background: rgba(237, 100, 166, 0.1);
  border: none;
  color: #ed64a6;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background 0.2s, color 0.2s;
  margin-left: 8px;
}

.favorite-remove:hover {
  background: rgba(237, 100, 166, 0.2);
  color: #d53f8c;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .favorites-panel {
    top: auto;
    right: 0;
    left: 0;
    width: 100%;
    max-height: 50vh;
    border-radius: 12px 12px 0 0;
    bottom: 0;
  }

  .favorites-panel.collapsed {
    transform: translateY(100%);
  }
}
</style>
