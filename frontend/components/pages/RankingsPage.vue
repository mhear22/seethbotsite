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
      <h1 class="rankings-title">👻 Coolness Rankings</h1>
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
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.dark .rankings-container {
  background: rgba(40, 44, 52, 0.95);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.rankings-title {
  text-align: center;
  color: #2d3748;
  margin-bottom: 20px;
  font-size: 24px;
}

.dark .rankings-title {
  color: #e2e8f0;
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
  background: rgba(0, 0, 0, 0.03);
  border-radius: 10px;
  transition: background 0.2s;
}

.dark .rank-item {
  background: rgba(255, 255, 255, 0.05);
}

.rank-item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.dark .rank-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.rank-number {
  color: #718096;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
}

.dark .rank-number {
  color: #a0aec0;
}

.rank-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-name {
  color: #2d3748;
  font-weight: 500;
  font-size: 16px;
}

.dark .rank-name {
  color: #e2e8f0;
}

.rank-name.current-user {
  color: #38a169;
  font-weight: bold;
}

.dark .rank-name.current-user {
  color: #68d391;
}

.rank-score {
  color: #38a169;
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
  border: 2px solid #cbd5e0;
  background: rgba(0, 0, 0, 0.03);
  color: #a0aec0;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.dark .favorite-btn {
  border-color: #718096;
  background: rgba(255, 255, 255, 0.05);
  color: #718096;
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

/* Responsive Design */
@media (max-width: 640px) {
  .rankings-page {
    padding: 20px 16px;
  }

  .rankings-container {
    padding: 20px;
  }

  .rankings-title {
    font-size: 20px;
  }

  .rank-item {
    grid-template-columns: 32px 40px 1fr auto 36px;
    gap: 8px;
    padding: 10px;
  }

  .rank-name {
    font-size: 14px;
  }

  .rank-score {
    font-size: 12px;
  }
}
</style>