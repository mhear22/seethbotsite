<script setup lang="ts">
defineProps<{
  isOpen?: boolean
  catImage: string
  loading?: boolean
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
  <div class="cat-panel" :class="{ collapsed: !isOpen }">
    <div class="cat-header">
      <h3>🐱 Random Cats</h3>
      <button class="cat-close" @click="toggle">✕</button>
    </div>
    <div class="cat-content">
      <img v-if="!loading" :src="catImage" class="cat-image" alt="Random cat" />
      <div v-if="loading" class="cat-loading">Loading... 🐱</div>
      <button class="cute-btn" @click="$emit('new-cat')" :disabled="loading">🔄 New Cat</button>
    </div>
  </div>
</template>
