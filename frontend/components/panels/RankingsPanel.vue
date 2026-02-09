<script setup lang="ts">
import { computed } from 'vue'
import type { RankingItem } from '../shared/core/MainApp.vue'
import EmojiRenderer from '../shared/ui/EmojiRenderer.vue'
import { useAppStore } from '../../stores/useAppStore'

const props = defineProps<{
  isOpen?: boolean
  currentRoute?: string
  rankings: RankingItem[]
}>()

const emit = defineEmits<{
  toggle: []
}>()

const appStore = useAppStore()
const isOnHomeRoute = computed(() => props.currentRoute === 'home')

const toggle = () => {
  emit('toggle')
}
</script>

<template>
  <div class="rankings-panel" :class="{ collapsed: !isOpen || !isOnHomeRoute }" role="region" aria-label="Coolness rankings panel">
    <div class="rankings-header">
      <h3>👻 Coolness Rankings</h3>
      <button class="rankings-close" @click="toggle" aria-label="Close rankings panel">✕</button>
    </div>
    <ol class="rankings-list">
      <li v-for="(rank, index) in rankings" :key="index" class="rank-item" :aria-label="`Rank ${index + 1}: ${rank.name} with ${rank.score} points${rank.isCurrentUser ? ', this is you' : ''}`">
        <div class="rank-avatar" aria-hidden="true">
          <EmojiRenderer :emoji="rank.avatar" :size="32" />
        </div>
        <div class="rank-name" :class="{ 'current-user': rank.isCurrentUser }">{{ rank.name }}</div>
        <div class="rank-score" aria-label="Score">{{ rank.score }}</div>
        <div class="rank-label">pts</div>
      </li>
    </ol>
  </div>
</template>
