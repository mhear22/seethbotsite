<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../../../stores/useAppStore'

const appStore = useAppStore()
const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

// Dark mode icon based on current state
const darkModeIcon = () => {
  if (appStore.darkerMode) return '🌑'
  if (appStore.darkMode) return '🌙'
  return '☀️'
}

const darkModeLabel = () => {
  if (appStore.darkerMode) return 'Midnight'
  if (appStore.darkMode) return 'Dark'
  return 'Light'
}
</script>

<template>
  <!-- Backdrop -->
  <div v-if="isOpen" class="fab-backdrop" @click="close"></div>

  <!-- FAB Panel -->
  <Transition name="fab-panel">
    <div v-if="isOpen" class="fab-panel">
      <div class="fab-panel-header">
        <span class="fab-panel-title">Controls</span>
      </div>
      <div class="fab-grid">
        <!-- Dark Mode (cycles) -->
        <button
          class="fab-item"
          :class="{ active: appStore.darkMode }"
          @click="appStore.toggleDarkMode()"
        >
          <span class="fab-item-icon">{{ darkModeIcon() }}</span>
          <span class="fab-item-label">{{ darkModeLabel() }}</span>
        </button>

        <!-- Chaos Mode -->
        <button
          class="fab-item"
          :class="{ active: appStore.chaosMode }"
          @click="appStore.toggleChaosMode()"
        >
          <span class="fab-item-icon">🌀</span>
          <span class="fab-item-label">Chaos</span>
        </button>

        <!-- Mold Mode -->
        <button
          class="fab-item"
          :class="{ active: appStore.moldMode }"
          @click="appStore.toggleMoldMode()"
        >
          <span class="fab-item-icon">🦠</span>
          <span class="fab-item-label">Mold</span>
        </button>

        <!-- Music -->
        <button
          class="fab-item"
          :class="{ active: appStore.musicPlaying }"
          @click="appStore.toggleMusic()"
        >
          <span class="fab-item-icon">🎵</span>
          <span class="fab-item-label">Music</span>
        </button>

        <!-- Mute -->
        <button
          class="fab-item"
          :class="{ active: !appStore.isMuted }"
          @click="appStore.toggleMute()"
        >
          <span class="fab-item-icon">{{ appStore.isMuted ? '🔇' : '🔊' }}</span>
          <span class="fab-item-label">{{ appStore.isMuted ? 'Muted' : 'Sound' }}</span>
        </button>

        <!-- Rankings Panel -->
        <button
          class="fab-item"
          :class="{ active: appStore.panels.rankings }"
          @click="appStore.togglePanel('rankings')"
        >
          <span class="fab-item-icon">👻</span>
          <span class="fab-item-label">Rankings</span>
        </button>

        <!-- Cat Panel -->
        <button
          class="fab-item"
          :class="{ active: appStore.panels.cat }"
          @click="appStore.togglePanel('cat')"
        >
          <span class="fab-item-icon">🐱</span>
          <span class="fab-item-label">Cat</span>
        </button>

        <!-- Feed Panel -->
        <button
          class="fab-item"
          :class="{ active: appStore.panels.feed }"
          @click="appStore.togglePanel('feed')"
        >
          <span class="fab-item-icon">📰</span>
          <span class="fab-item-label">Feed</span>
        </button>

        <!-- Goose -->
        <button
          class="fab-item"
          :class="{ active: appStore.panels.digitalGoose }"
          @click="appStore.togglePanel('digitalGoose')"
        >
          <span class="fab-item-icon">🦆</span>
          <span class="fab-item-label">Goose</span>
        </button>

        <!-- Mining -->
        <button
          class="fab-item"
          :class="{ active: appStore.panels.mining }"
          @click="appStore.togglePanel('mining')"
        >
          <span class="fab-item-icon">⛏️</span>
          <span class="fab-item-label">Mining</span>
        </button>
      </div>
    </div>
  </Transition>

  <!-- FAB Button -->
  <button
    class="mobile-fab"
    :class="{ open: isOpen }"
    @click="toggle"
    aria-label="Toggle controls"
  >
    <span class="fab-icon">{{ isOpen ? '✕' : '⚙️' }}</span>
  </button>
</template>

<style scoped>
/* Hidden on desktop */
.mobile-fab,
.fab-backdrop,
.fab-panel {
  display: none;
}

@media (max-width: 768px) {
  .mobile-fab {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 82px;
    right: 16px;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(145deg, #ff91a4, #ff6b9d);
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 1001;
    box-shadow: 0 4px 16px rgba(255, 107, 157, 0.4);
    transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .mobile-fab:active {
    transform: scale(0.92);
  }

  .mobile-fab.open {
    background: linear-gradient(145deg, #666, #444);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .fab-icon {
    line-height: 1;
    transition: transform 0.2s ease;
  }

  .mobile-fab.open .fab-icon {
    transform: rotate(90deg);
  }

  .fab-backdrop {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1000;
  }

  .fab-panel {
    display: block;
    position: fixed;
    bottom: 144px;
    right: 16px;
    width: 260px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(16px);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    z-index: 1001;
    padding: 16px;
    border: 1px solid rgba(255, 182, 193, 0.3);
  }

  .dark .fab-panel {
    background: rgba(40, 44, 52, 0.98);
    border-color: rgba(255, 182, 193, 0.15);
  }

  .darker .fab-panel {
    background: rgba(12, 12, 16, 0.98);
    border-color: rgba(255, 182, 193, 0.08);
  }

  .fab-panel-header {
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 182, 193, 0.2);
  }

  .fab-panel-title {
    font-family: 'Quicksand', sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: #ff91a4;
  }

  .dark .fab-panel-title {
    color: #ffb6c1;
  }

  .fab-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .fab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 10px 4px;
    border: 2px solid transparent;
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.03);
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .dark .fab-item {
    background: rgba(255, 255, 255, 0.05);
  }

  .darker .fab-item {
    background: rgba(255, 255, 255, 0.03);
  }

  .fab-item.active {
    background: rgba(255, 107, 157, 0.12);
    border-color: #ff91a4;
  }

  .dark .fab-item.active {
    background: rgba(255, 107, 157, 0.15);
    border-color: #ffb6c1;
  }

  .fab-item:active {
    transform: scale(0.94);
  }

  .fab-item-icon {
    font-size: 22px;
    line-height: 1;
  }

  .fab-item-label {
    font-family: 'Quicksand', sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: #666;
    text-align: center;
    line-height: 1.1;
  }

  .dark .fab-item-label {
    color: #aaa;
  }

  .darker .fab-item-label {
    color: #888;
  }

  .fab-item.active .fab-item-label {
    color: #ff6b9d;
  }

  .dark .fab-item.active .fab-item-label {
    color: #ffb6c1;
  }

  /* Panel transition */
  .fab-panel-enter-active {
    transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .fab-panel-leave-active {
    transition: all 0.15s ease-in;
  }

  .fab-panel-enter-from {
    opacity: 0;
    transform: translateY(16px) scale(0.95);
  }

  .fab-panel-leave-to {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
}
</style>
