<script setup lang="ts">
import type { RankingItem } from './MainApp.vue'
import EmojiRenderer from './EmojiRenderer.vue'

defineProps<{
  isOpen?: boolean
  rankings: RankingItem[]
}>()

const emit = defineEmits<{
  toggle: []
}>()

const toggle = () => {
  emit('toggle')
}
</script>

<template>
  <div class="rankings-panel" :class="{ collapsed: !isOpen }">
    <div class="rankings-header">
      <h3>👻 Coolness Rankings</h3>
      <button class="rankings-close" @click="toggle">✕</button>
    </div>
    <div class="rankings-list">
      <div v-for="(rank, index) in rankings" :key="index" class="rank-item">
        <div class="rank-avatar">
          <EmojiRenderer :emoji="rank.avatar" :size="32" />
        </div>
        <div class="rank-name" :class="{ 'current-user': rank.isCurrentUser }">{{ rank.name }}</div>
        <div class="rank-score">{{ rank.score }}</div>
        <div class="rank-label">pts</div>
      </div>
    </div>
  </div>
</template>
