<script setup lang="ts">
defineProps<{
  isOpen?: boolean
  catImage: string
  loading?: boolean
  centered?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  'new-cat': []
}>()

const toggle = () => {
  emit('toggle')
}
</script>

<template>
  <div class="cat-panel" :class="{ collapsed: !isOpen, centered }">
    <div class="cat-header">
      <h3>🐱 Random Cats</h3>
      <button class="cat-close" @click="toggle" v-if="!centered">✕</button>
    </div>
    <div class="cat-content">
      <img v-if="!loading" :src="catImage" class="cat-image" alt="Random cat" />
      <div v-if="loading" class="cat-loading">Loading... 🐱</div>
      <button class="cute-btn" @click="$emit('new-cat')" :disabled="loading">🔄 New Cat</button>

      <div class="cat-game-container">
        <iframe
          src="https://itch.io/embed-game/3165293"
          width="100%"
          height="500"
          frameborder="0"
          class="cat-game-iframe"
          allowfullscreen>
          <a href="https://bellicapelli.itch.io/ots-01" target="_blank">OTS-01 by bellicapelli</a>
        </iframe>
        <div class="cat-game-fallback">
          <a href="https://bellicapelli.itch.io/ots-01" target="_blank" class="cat-game-link">
            🎮 Play OTS-01 (Virtual Toy Synth)
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
