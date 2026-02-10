<script setup lang="ts">
import { useAudio } from '../../composables/useAudio'

const { playButtonClick } = useAudio()

defineProps<{
  darkMode?: boolean
  musicPlaying?: boolean
}>()

defineEmits<{
  'toggle-rankings': []
  'toggle-dark': []
  'toggle-music': []
  'toggle-feed': []
  'toggle-mika': []
}>()
</script>

<template>
  <div role="group" aria-label="Control buttons">
    <button
      class="rankings-toggle"
      @click="playButtonClick(); $emit('toggle-rankings')"
      aria-label="Toggle rankings panel"
      title="Toggle rankings"
    >👻</button>
    <button
      class="dark-toggle"
      @click="playButtonClick(); $emit('toggle-dark')"
      :aria-label="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      title=""
    >
      {{ darkMode ? '☀️' : '🌙' }}
    </button>
    <button
      class="music-control"
      @click="playButtonClick(); $emit('toggle-music')"
      :aria-label="musicPlaying ? 'Pause music' : 'Play music'"
      :aria-pressed="musicPlaying"
      title=""
    >
      {{ musicPlaying ? '⏸️' : '🎵' }}
    </button>
    <button
      class="feed-toggle"
      @click="playButtonClick(); $emit('toggle-feed')"
      aria-label="Toggle feeds panel"
      title="Toggle feeds"
    >📰</button>
    <button
      class="mika-btn"
      @click="playButtonClick(); $emit('toggle-mika')"
      aria-label="Show Mika modal"
    >🌸 Mika</button>
  </div>
</template>
