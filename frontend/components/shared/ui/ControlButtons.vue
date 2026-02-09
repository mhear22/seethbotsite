<script setup lang="ts">
import { useAudio } from '@/composables/useAudio'

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

const { playClick, playPanelOpen } = useAudio()

const handleRankingsToggle = () => {
  playClick()
  emit('toggle-rankings')
}

const handleDarkToggle = () => {
  playClick()
  emit('toggle-dark')
}

const handleMusicToggle = () => {
  playClick()
  emit('toggle-music')
}

const handleFeedToggle = () => {
  playClick()
  playPanelOpen()
  emit('toggle-feed')
}

const handleMikaToggle = () => {
  playClick()
  emit('toggle-mika')
}
</script>

<template>
  <div role="group" aria-label="Control buttons">
    <button
      class="rankings-toggle"
      @click="handleRankingsToggle"
      aria-label="Toggle rankings panel"
      title="Toggle rankings"
    >👻</button>
    <button
      class="dark-toggle"
      @click="handleDarkToggle"
      :aria-label="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      title=""
    >
      {{ darkMode ? '☀️' : '🌙' }}
    </button>
    <button
      class="music-control"
      @click="handleMusicToggle"
      :aria-label="musicPlaying ? 'Pause music' : 'Play music'"
      :aria-pressed="musicPlaying"
      title=""
    >
      {{ musicPlaying ? '⏸️' : '🎵' }}
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
