<script setup lang="ts">
import { useAudio } from '@/composables/useAudio'
import ShortcutBadge from './ShortcutBadge.vue'

defineProps<{
  darkMode?: boolean
  musicPlaying?: boolean
}>()

const emit = defineEmits<{
  'toggle-rankings': []
  'toggle-dark': []
  'toggle-music': []
  'toggle-feed': []
  'toggle-mika': []
}>()

const { playClick, playPanelOpen, playButtonClick } = useAudio()

const handleRankingsToggle = () => {
  playClick()
  playButtonClick()
  emit('toggle-rankings')
}

const handleDarkToggle = () => {
  playClick()
  playButtonClick()
  emit('toggle-dark')
}

const handleMusicToggle = () => {
  playClick()
  playButtonClick()
  emit('toggle-music')
}

const handleFeedToggle = () => {
  playClick()
  playPanelOpen()
  playButtonClick()
  emit('toggle-feed')
}

const handleMikaToggle = () => {
  playClick()
  playButtonClick()
  emit('toggle-mika')
}
</script>

<template>
  <div role="group" aria-label="Control buttons">
    <button
      class="rankings-toggle"
      @click="handleRankingsToggle"
      aria-label="Toggle rankings panel"
      title="Toggle rankings (Ctrl+R)"
    >
      👻
      <ShortcutBadge :shortcut="{ key: 'r', ctrl: true, meta: true }" class="button-shortcut" />
    </button>
    <button
      class="dark-toggle"
      @click="handleDarkToggle"
      :aria-label="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      title="Toggle theme (Ctrl+D)"
    >
      {{ darkMode ? '☀️' : '🌙' }}
      <ShortcutBadge :shortcut="{ key: 'd', ctrl: true, meta: true }" class="button-shortcut" />
    </button>
    <button
      class="music-control"
      @click="handleMusicToggle"
      :aria-label="musicPlaying ? 'Pause music' : 'Play music'"
      :aria-pressed="musicPlaying"
      title="Toggle music (Ctrl+M)"
    >
      {{ musicPlaying ? '⏸️' : '🎵' }}
      <ShortcutBadge :shortcut="{ key: 'm', ctrl: true, meta: true }" class="button-shortcut" />
    </button>
    <button
      class="feed-toggle"
      @click="handleFeedToggle"
      aria-label="Toggle feeds panel"
      title="Toggle feeds"
    >📰</button>
    <button
      class="mika-btn"
      @click="handleMikaToggle"
      aria-label="Show Mika modal"
    >🌸 Mika</button>
  </div>
</template>

<style scoped>
/* Keyboard Shortcut Badge in Control Buttons */
.button-shortcut {
  margin-left: 4px;
  font-size: 9px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

button:hover .button-shortcut {
  opacity: 1;
}
</style>
