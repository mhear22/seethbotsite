<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import { useFavorites } from '../../composables/useFavorites'
import EmojiRenderer from '../shared/ui/EmojiRenderer.vue'
import type { RankingItem } from '../shared/core/MainApp.vue'

const appStore = useAppStore()
const { toggleFavorite, isFavorite } = useFavorites()

onMounted(() => {
  appStore.loadRankings()
})

const handleFavorite = (rank: RankingItem, e: Event) => {
  e.stopPropagation()
  toggleFavorite('ranking', rank)
}

const isRankingFavorite = (rank: RankingItem) => {
  return isFavorite('ranking', rank)
}
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
          <button
            @click="handleFavorite(rank, $event)"
            :class="['favorite-btn', { favorited: isRankingFavorite(rank) }]"
            :title="isRankingFavorite(rank) ? 'Remove from favorites' : 'Add to favorites'"
          >
            ⭐
          </button>
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
  grid-template-columns: 40px 50px 1fr auto 40px;
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

.favorite-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #718096;
  background: rgba(255, 255, 255, 0.05);
  color: #718096;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.favorite-btn:hover {
  transform: scale(1.1);
  border-color: #f6d365;
  color: #f6d365;
}

.favorite-btn.favorited {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border-color: #f6d365;
  color: white;
  box-shadow: 0 2px 8px rgba(246, 211, 101, 0.3);
}

.favorite-btn.favorited:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(246, 211, 101, 0.4);
}
</style>