<script setup lang="ts">
import type { RankingItem } from '../shared/core/MainApp.vue'
import EmojiRenderer from '../shared/ui/EmojiRenderer.vue'
import { useAppStore } from '../../stores/useAppStore'

defineProps<{
  isOpen?: boolean
  currentRoute?: string
  rankings: RankingItem[]
}>()

const emit = defineEmits<{
  toggle: []
}>()

const appStore = useAppStore()
const isOnHomeRoute = computed(() => currentRoute === 'home')

const toggle = () => {
  emit('toggle')
}
</script>

<template>
  <div class="rankings-panel" :class="{ collapsed: !isOpen || !isOnHomeRoute }">
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
