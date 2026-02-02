<script setup lang="ts">
interface Movie {
  id: string
  title: string
  year?: string
  genre?: string
  notes?: string
}

interface Props {
  movies: Movie[]
  rankedIds: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: [movieId: string]
}>()

const isRanked = (movieId: string) => {
  return props.rankedIds.includes(movieId)
}
</script>

<template>
  <div class="available-movies">
    <h3>Available Movies</h3>
    <div class="movie-list">
      <div
        v-for="movie in movies"
        :key="movie.id"
        :class="['movie-item', { added: isRanked(movie.id) }]"
      >
        <div class="movie-details">
          <strong>{{ movie.title }}</strong>
          <span class="meta" v-if="movie.year">({{ movie.year }})</span>
          <span class="meta" v-if="movie.genre">• {{ movie.genre }}</span>
          <p class="notes" v-if="movie.notes">{{ movie.notes }}</p>
        </div>
        <button
          v-if="!isRanked(movie.id)"
          class="add-btn"
          @click="$emit('add', movie.id)"
        >
          + Add
        </button>
        <span v-else class="added-badge">Added</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.available-movies {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.available-movies h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.movie-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.movie-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  background: white;
  border-radius: 8px;
  gap: 10px;
}

.movie-item.added {
  background: #dcfce7;
  border: 2px solid #22c55e;
}

.movie-details {
  flex: 1;
}

.movie-details strong {
  display: block;
  font-size: 1.05rem;
}

.meta {
  color: #666;
  font-size: 0.9rem;
}

.notes {
  margin: 5px 0 0 0;
  color: #888;
  font-size: 0.85rem;
  font-style: italic;
}

.add-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.add-btn:hover {
  opacity: 0.9;
}

.added-badge {
  background: #22c55e;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
}
</style>
