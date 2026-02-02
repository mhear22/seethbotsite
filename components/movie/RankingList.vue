<script setup lang="ts">
interface Movie {
  id: string
  title: string
}

interface Props {
  rankings: string[]
  movies: Movie[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  moveUp: [index: number]
  moveDown: [index: number]
  remove: [index: number]
}>()

const getMovieById = (id: string) => {
  return props.movies.find(m => m.id === id)
}
</script>

<template>
  <div class="ranking-area">
    <div class="ranking-header">
      <h3>Your Ranking (Priority Order)</h3>
      <span class="count">{{ rankings.length }} / {{ movies.length }}</span>
    </div>

    <div v-if="rankings.length === 0" class="empty-ranking">
      <p>No movies ranked yet. Add movies below!</p>
    </div>

    <div v-else class="ranking-list">
      <div
        v-for="(movieId, index) in rankings"
        :key="movieId"
        class="ranking-item"
      >
        <div class="rank-badge">{{ index + 1 }}</div>
        <div class="movie-name">
          {{ getMovieById(movieId)?.title || 'Unknown' }}
        </div>
        <div class="movie-actions">
          <button
            class="action-btn"
            @click="$emit('moveUp', index)"
            :disabled="index === 0"
            title="Move up"
          >
            ↑
          </button>
          <button
            class="action-btn"
            @click="$emit('moveDown', index)"
            :disabled="index === rankings.length - 1"
            title="Move down"
          >
            ↓
          </button>
          <button
            class="action-btn remove"
            @click="$emit('remove', index)"
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ranking-area {
  background: white;
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.ranking-header h3 {
  margin: 0;
}

.count {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: bold;
}

.empty-ranking {
  text-align: center;
  padding: 30px;
  color: #888;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s;
}

.ranking-item:hover {
  background: #e9ecef;
}

.rank-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.movie-name {
  flex: 1;
  font-weight: 500;
}

.movie-actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: #d0d0d0;
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-btn.remove {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.remove:hover {
  background: #fecaca;
}
</style>
