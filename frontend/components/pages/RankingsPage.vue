<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import EmojiRenderer from '../shared/ui/EmojiRenderer.vue'
import type { RankingItem } from '../shared/core/MainApp.vue'

const appStore = useAppStore()

onMounted(() => {
  appStore.loadRankings()
})
</script>

<template>
  <div class="page rankings-page">
    <div class="rankings-container">
      <h2 class="rankings-title">👻 Coolness Rankings</h2>
      <div class="rankings-list">
        <div v-for="(rank, index) in appStore.rankings" :key="index" class="rank-item">
          <div class="rank-number">{{ index + 1 }}</div>
          <div class="rank-avatar">
            <EmojiRenderer :emoji="rank.avatar" :size="40" />
          </div>
          <div class="rank-name" :class="{ 'current-user': rank.isCurrentUser }">{{ rank.name }}</div>
          <div class="rank-score">{{ rank.score }} pts</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rankings-page {
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rankings-container {
  background: rgba(40, 44, 52, 0.95);
  border-radius: 16px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dark .rankings-container {
  background: rgba(20, 24, 32, 0.95);
}

.rankings-title {
  text-align: center;
  color: #e2e8f0;
  margin-bottom: 20px;
  font-size: 24px;
}

.rankings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rank-item {
  display: grid;
  grid-template-columns: 40px 50px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: background 0.2s;
}

.rank-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.rank-number {
  color: #a0aec0;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
}

.rank-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-name {
  color: #e2e8f0;
  font-weight: 500;
  font-size: 16px;
}

.rank-name.current-user {
  color: #48bb78;
  font-weight: bold;
}

.dark .rank-name.current-user {
  color: #68d391;
}

.rank-score {
  color: #48bb78;
  font-weight: bold;
  font-size: 14px;
}

.dark .rank-score {
  color: #68d391;
}
</style>