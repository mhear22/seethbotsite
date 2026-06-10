<script setup lang="ts">
interface MapData {
  name: string
  image: string
  color: string
  status: string
  party: string
  region: string
}

interface Props {
  mapData?: MapData | null
  darkMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mapData: null,
  darkMode: false
})

const emit = defineEmits<{
  close: []
}>()

const closeModal = () => {
  emit('close')
}

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'proposed': 'Proposed',
    'controversial': 'Controversial',
    'new': 'New',
    'abolished': 'Abolished',
    'modified': 'Modified'
  }
  return statusMap[status] || status
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="mapData" 
      class="map-modal-overlay" 
      :class="{ 'dark-overlay': props.darkMode }" 
      @click="closeModal"
    >
      <div class="map-modal" :class="{ 'map-modal-dark': props.darkMode }" @click.stop>
        <div class="map-modal-header" :class="{ 'map-modal-header-dark': props.darkMode }">
          <h3 :class="{ 'map-modal-title-dark': props.darkMode }">
            {{ mapData.name }} — Proposed Boundaries
          </h3>
          <button class="map-modal-close" :class="{ 'map-modal-close-dark': props.darkMode }" @click="closeModal">
            ✕
          </button>
        </div>
        <img 
          :src="mapData.image" 
          :alt="mapData.name + ' map'"
          class="map-modal-image"
          @click="$emit('expand')"
          style="cursor: zoom-in;"
        />
        <div class="map-modal-footer" :class="{ 'map-modal-footer-dark': props.darkMode }">
          <span class="status-badge" :class="mapData.color">
            {{ getStatusLabel(mapData.status) }}
          </span>
          <span class="party">{{ mapData.party }}</span>
          <span class="region">
            <svg :size="14" style="display: inline; margin-right: 4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {{ mapData.region }}
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.map-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.dark-overlay {
  background: rgba(0, 0, 0, 0.9);
}

.map-modal {
  background: white;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  width: 600px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.map-modal-dark {
  background: #2a2a2a;
  color: white;
}

.map-modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-modal-header-dark {
  border-bottom: 1px solid #404040;
}

.map-modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.map-modal-title-dark {
  color: white;
}

.map-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.map-modal-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.map-modal-close-dark {
  color: #ccc;
}

.map-modal-close-dark:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.map-modal-image {
  width: 100%;
  height: auto;
  max-height: 60vh;
  object-fit: contain;
  background: #f5f5f5;
}

.map-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.map-modal-footer-dark {
  border-top: 1px solid #404040;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.controversial {
  background-color: #fed7d7;
  color: #c53030;
}

.status-badge.modified {
  background-color: #fef3c7;
  color: #d97706;
}

.status-badge.new {
  background-color: #d1fae5;
  color: #059669;
}

.status-badge.abolished {
  background-color: #fee2e2;
  color: #dc2626;
}

.party {
  color: #666;
  font-weight: 500;
}

.region {
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .map-modal {
    max-width: 95vw;
    width: 100%;
    max-height: 95vh;
  }
  
  .map-modal-image {
    max-height: 50vh;
  }
  
  .map-modal-footer {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }
}
</style>