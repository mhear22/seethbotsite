<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../../../stores/useAppStore'

const appStore = useAppStore()

const cursorX = ref(0)
const cursorY = ref(0)

const showTorch = computed(() => appStore.darkerMode)

const updateCursorPosition = (e: MouseEvent) => {
  cursorX.value = e.clientX
  cursorY.value = e.clientY
}

onMounted(() => {
  document.addEventListener('mousemove', updateCursorPosition)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', updateCursorPosition)
})
</script>

<template>
  <div v-if="showTorch" class="torch-container">
    <!-- Dark overlay with spotlight hole -->
    <div class="dark-overlay"></div>
    
    <!-- Spotlight effect around cursor -->
    <div 
      class="spotlight"
      :style="{
        left: `${cursorX}px`,
        top: `${cursorY}px`
      }"
    ></div>
    
    <!-- Torch SVG -->
    <div 
      class="torch"
      :style="{
        left: `${cursorX}px`,
        top: `${cursorY}px`
      }"
    >
      <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Torch handle -->
        <rect x="25" y="50" width="10" height="30" rx="3" fill="#8B4513" />
        
        <!-- Torch body -->
        <ellipse cx="30" cy="50" rx="15" ry="12" fill="#A0522D" />
        
        <!-- Flame base (dark orange) -->
        <ellipse cx="30" cy="35" rx="12" ry="18" fill="#FF4500" opacity="0.8" />
        
        <!-- Flame middle (orange) -->
        <ellipse cx="30" cy="28" rx="10" ry="16" fill="#FF6600" opacity="0.7" />
        
        <!-- Flame top (yellow) -->
        <ellipse cx="30" cy="20" rx="8" ry="14" fill="#FFCC00" opacity="0.9" />
        
        <!-- Flame highlights (white tip) -->
        <ellipse cx="30" cy="14" rx="5" ry="10" fill="#FFFFFF" opacity="0.6" />
        
        <!-- Flame flicker effect (inner glow) -->
        <ellipse cx="30" cy="22" rx="11" ry="18" fill="#FF9933" opacity="0.3" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.torch-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10000;
}

/* Dark overlay that dims the entire page */
.dark-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  pointer-events: none;
}

/* Spotlight that creates a "hole" in the dark overlay */
.spotlight {
  position: fixed;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    transparent 0%,
    transparent 25%,
    rgba(0, 0, 0, 0.85) 100%
  );
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: left 0.05s ease, top 0.05s ease;
  mix-blend-mode: multiply;
}

.torch {
  position: fixed;
  pointer-events: none;
  transform: translate(-30px, -80px);
  transition: left 0.1s ease, top 0.1s ease, transform 0.1s ease;
  filter: drop-shadow(0 0 20px rgba(255, 100, 0, 0.5));
  animation: flicker 0.3s ease-in-out infinite;
}

@keyframes flicker {
  0%, 100% {
    transform: translate(-30px, -80px) scale(1) rotate(-2deg);
  }
  50% {
    transform: translate(-30px, -80px) scale(1.02) rotate(2deg);
  }
}
</style>
