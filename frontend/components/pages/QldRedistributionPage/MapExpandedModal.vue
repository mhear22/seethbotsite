<script setup lang="ts">
import { ref } from 'vue'

interface MapData {
  name: string
  image: string
}

interface Props {
  visible: boolean
  mapData?: MapData | null
}

const props = withDefaults(defineProps<Props>(), {
  mapData: null
})

const emit = defineEmits<{
  close: []
}>()

const zoomed = ref(false)

const handleClose = () => {
  zoomed.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="visible && mapData" 
      class="map-expanded-overlay" 
      @click="handleClose"
    >
      <div class="map-expanded-container" @click.stop>
        <button class="map-expanded-close" @click="handleClose">✕</button>
        <img 
          :src="mapData.image" 
          :alt="mapData.name + ' map'"
          class="map-expanded-image"
          :class="{ 'map-zoomed': zoomed }"
          @click="zoomed = !zoomed"
          style="cursor: zoom-in;"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.map-expanded-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 2rem;
}

.map-expanded-container {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
}

.map-expanded-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  z-index: 1002;
}

.map-expanded-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.map-expanded-image {
  max-width: 95vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  transition: transform 0.3s ease;
  cursor: zoom-in;
}

.map-zoomed {
  transform: scale(1.5);
  cursor: zoom-out;
}

@media (max-width: 768px) {
  .map-expanded-overlay {
    padding: 1rem;
  }
  
  .map-expanded-image {
    max-width: 100vw;
    max-height: 85vh;
  }
}
</style>