<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiGet, apiPost, apiDelete, handleApiError, showError, showSuccess } from '../../../utils/api'

const emit = defineEmits(['refresh'])

interface Movie {
  id: string
  title: string
  suggestedBy: string
  year?: string
  genre?: string
  notes?: string
  createdAt: string
  thumbnail?: string
}

const movies = ref<Movie[]>([])
const showAddForm = ref(false)
const newMovie = ref({
  title: '',
  suggestedBy: '',
  year: '',
  genre: '',
  notes: '',
  thumbnail: ''
})
const selectedMovies = ref<string[]>([])
const userId = ref('')

const loadMovies = async () => {
  try {
    const data = await apiGet<{ movies: Movie[] }>('/api/movies')
    movies.value = data.movies
  } catch (error) {
    showError(handleApiError(error, 'Failed to load movies'))
  }
}

const addMovie = async () => {
  if (!newMovie.value.title || !newMovie.value.suggestedBy) {
    showError('Please fill in title and your name')
    return
  }

  try {
    await apiPost('/api/movies', {
      title: newMovie.value.title,
      suggestedBy: newMovie.value.suggestedBy,
      year: newMovie.value.year || undefined,
      genre: newMovie.value.genre || undefined,
      notes: newMovie.value.notes || undefined,
      thumbnail: newMovie.value.thumbnail || undefined
    })

    newMovie.value = {
      title: '',
      suggestedBy: '',
      year: '',
      genre: '',
      notes: '',
      thumbnail: ''
    }
    showAddForm.value = false
    showSuccess('Movie added successfully!')
    await loadMovies()
  } catch (error) {
    showError(handleApiError(error, 'Failed to add movie'))
  }
}

const deleteMovie = async (id: string) => {
  if (!confirm('Are you sure you want to delete this movie?')) {
    return
  }

  try {
    await apiDelete(`/api/movies/${id}`)
    showSuccess('Movie deleted successfully!')
    await loadMovies()
  } catch (error) {
    showError(handleApiError(error, 'Failed to delete movie'))
  }
}

const startVoting = async () => {
  if (selectedMovies.value.length < 2) {
    showError('Please select at least 2 movies to vote on')
    return
  }

  if (!confirm(`Start voting with ${selectedMovies.value.length} movies?`)) {
    return
  }

  try {
    await apiPost('/api/movies/voting-round/start', { movieIds: selectedMovies.value })
    showSuccess('Voting round started!')
    selectedMovies.value = []
    emit('refresh')
  } catch (error) {
    showError(handleApiError(error, 'Failed to start voting round'))
  }
}

const toggleSelect = (movieId: string) => {
  const index = selectedMovies.value.indexOf(movieId)
  if (index > -1) {
    selectedMovies.value.splice(index, 1)
  } else {
    selectedMovies.value.push(movieId)
  }
}

onMounted(() => {
  loadMovies()
  // Set a simple user ID (in production, this would come from auth)
  userId.value = localStorage.getItem('userId') || 'user-' + Math.random().toString(36).substr(2, 9)
  localStorage.setItem('userId', userId.value)
})
</script>

<template>
  <div class="movie-suggestions">
    <div class="suggestions-header">
      <h2>📝 Movie Suggestions</h2>
      <button class="btn-primary" @click="showAddForm = !showAddForm">
        {{ showAddForm ? 'Cancel' : '+ Add Movie' }}
      </button>
    </div>

    <div v-if="showAddForm" class="add-form">
      <h3>🎬 Add New Movie Suggestion</h3>
      <div class="form-group">
        <label>Movie Title *</label>
        <input
          v-model="newMovie.title"
          type="text"
          placeholder="Enter movie title..."
          required
        />
      </div>
      <div class="form-group">
        <label>Your Name *</label>
        <input
          v-model="newMovie.suggestedBy"
          type="text"
          placeholder="Your name..."
          required
        />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Year</label>
          <input
            v-model="newMovie.year"
            type="text"
            placeholder="2024"
          />
        </div>
        <div class="form-group">
          <label>Genre</label>
          <input
            v-model="newMovie.genre"
            type="text"
            placeholder="Action, Comedy..."
          />
        </div>
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea
          v-model="newMovie.notes"
          placeholder="Why this movie? Any details..."
          rows="3"
        ></textarea>
      </div>
      <div class="form-actions">
        <button class="btn-secondary" @click="showAddForm = false">Cancel</button>
        <button class="btn-primary" @click="addMovie">Add Movie</button>
      </div>
    </div>

    <div v-if="selectedMovies.length > 0" class="selected-bar">
      <span>{{ selectedMovies.length }} movie(s) selected for voting</span>
      <button class="btn-success" @click="startVoting">Start Voting</button>
    </div>

    <div class="movies-grid">
      <div
        v-for="movie in movies"
        :key="movie.id"
        :class="['movie-card', { selected: selectedMovies.includes(movie.id) }]"
        @click="toggleSelect(movie.id)"
      >
        <div class="movie-poster" v-if="movie.thumbnail">
          <img :src="movie.thumbnail" :alt="movie.title" />
        </div>
        <div class="movie-poster-placeholder" v-else>
          🎬
        </div>
        <div class="movie-info">
          <h3>{{ movie.title }}</h3>
          <p class="meta" v-if="movie.year">{{ movie.year }}</p>
          <p class="meta" v-if="movie.genre">{{ movie.genre }}</p>
          <p class="notes" v-if="movie.notes">{{ movie.notes }}</p>
          <div class="footer">
            <span class="suggested-by">Suggested by {{ movie.suggestedBy }}</span>
            <button
              class="btn-delete"
              @click.stop="deleteMovie(movie.id)"
              title="Delete movie"
            >
              🗑️
            </button>
          </div>
        </div>
        <div class="select-check">
          ✓
        </div>
      </div>
    </div>

    <div v-if="movies.length === 0" class="empty-state">
      <p>No movie suggestions yet. Add your first one! 🎬</p>
    </div>
  </div>
</template>

<style scoped>
.movie-suggestions {
  padding: 10px;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.suggestions-header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.add-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.add-form h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.selected-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.movie-card {
  background: white;
  border: 2px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.movie-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.movie-card.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.movie-poster {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f0f0f0;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-poster-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.movie-info {
  padding: 15px;
}

.movie-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.meta {
  margin: 4px 0;
  color: #666;
  font-size: 0.9rem;
}

.notes {
  margin: 8px 0;
  color: #888;
  font-size: 0.85rem;
  font-style: italic;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.suggested-by {
  font-size: 0.85rem;
  color: #888;
}

.select-check {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #667eea;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s;
}

.movie-card.selected .select-check {
  opacity: 1;
  transform: scale(1);
}

.btn-primary,
.btn-secondary,
.btn-success,
.btn-delete {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  opacity: 0.9;
}

.btn-delete {
  background: transparent;
  padding: 5px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-delete:hover {
  transform: scale(1.2);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.empty-state p {
  font-size: 1.2rem;
  margin: 0;
}
</style>
