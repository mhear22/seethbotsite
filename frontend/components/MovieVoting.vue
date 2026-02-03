<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { moviesRepository } from '../repositories/movies.repository'
import { useUserId } from '../composables/useUserId'

const emit = defineEmits(['refresh'])

interface Movie {
  id: string
  title: string
  suggestedBy: string
  year?: string
  genre?: string
  notes?: string
}

interface VotingRound {
  id: string
  isActive: boolean
  startDate: string
  movieIds: string[]
  winner?: string
}

const votingRound = ref<VotingRound | null>(null)
const movies = ref<Movie[]>([])
const rankings = ref<string[]>([])
const myVote = ref<any>(null)
const hasVoted = ref(false)

// Use centralized userId management
const { userId } = useUserId()

const votingMovies = computed(() => {
  if (!votingRound.value) return []
  return votingRound.value.movieIds.map(id =>
    movies.value.find(m => m.id === id)
  ).filter(Boolean) as Movie[]
})

const loadVotingRound = async () => {
  try {
    votingRound.value = await moviesRepository.getVotingRound()

    // Load movies if there's an active round
    if (votingRound.value?.isActive) {
      await loadMovies()
    }
  } catch (error) {
    console.error('Failed to load voting round:', error)
  }
}

const loadMovies = async () => {
  try {
    movies.value = await moviesRepository.getMovies()
  } catch (error) {
    console.error('Failed to load movies:', error)
  }
}

const loadMyVote = async () => {
  if (!userId.value) return

  try {
    const vote = await moviesRepository.getVote(userId.value)
    if (vote) {
      myVote.value = vote
      rankings.value = vote.rankings
      hasVoted.value = true
    } else {
      hasVoted.value = false
    }
  } catch (error) {
    hasVoted.value = false
  }
}

const submitVote = async () => {
  if (rankings.value.length < 2) {
    alert('Please rank at least 2 movies in order of preference')
    return
  }

  try {
    const response = await moviesRepository.submitVote(userId.value, rankings.value)
    hasVoted.value = true
    myVote.value = response.vote
    alert('Vote submitted! 🗳️')
  } catch (error) {
    console.error('Error submitting vote:', error)
    alert('Failed to submit vote')
  }
}

const moveUp = (index: number) => {
  if (index > 0) {
    const item = rankings.value.splice(index, 1)[0]
    rankings.value.splice(index - 1, 0, item)
  }
}

const moveDown = (index: number) => {
  if (index < rankings.value.length - 1) {
    const item = rankings.value.splice(index, 1)[0]
    rankings.value.splice(index + 1, 0, item)
  }
}

const getMovieById = (id: string) => {
  return movies.value.find(m => m.id === id)
}

onMounted(async () => {
  await loadVotingRound()
  await loadMyVote()
})
</script>

<template>
  <div class="movie-voting">
    <div v-if="!votingRound || !votingRound.isActive" class="no-voting">
      <h2>🗳️ No Active Voting Round</h2>
      <p>Voting hasn't started yet. Go to the Suggestions tab to select movies and start a voting round!</p>
    </div>

    <div v-else class="voting-active">
      <div class="voting-header">
        <h2>🗳️ Vote for Movie Night!</h2>
        <p class="subtitle">Rank movies in order of preference (Australian Parliament style)</p>
      </div>

      <div v-if="hasVoted" class="has-voted">
        <div class="voted-message">
          <h3>✅ You've voted!</h3>
          <p>Your ranking:</p>
          <ol class="my-ranking">
            <li v-for="(movieId, index) in myVote.rankings" :key="movieId">
              <span class="rank-number">{{ index + 1 }}</span>
              {{ getMovieById(movieId)?.title || 'Unknown' }}
            </li>
          </ol>
        </div>
      </div>

      <div v-else class="voting-form">
        <div class="instructions">
          <h3>📋 How to Vote</h3>
          <ol>
            <li>Add movies to your ranking by clicking the "+ Add" button</li>
            <li>Drag or use arrows to reorder by preference (1st choice at the top)</li>
            <li>Rank as many or as few as you like (minimum 2)</li>
            <li>Click "Submit Vote" when you're done</li>
          </ol>
        </div>

        <div class="ranking-area">
          <div class="ranking-header">
            <h3>Your Ranking (Priority Order)</h3>
            <span class="count">{{ rankings.length }} / {{ votingMovies.length }}</span>
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
                  @click="moveUp(index)"
                  :disabled="index === 0"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  class="action-btn"
                  @click="moveDown(index)"
                  :disabled="index === rankings.length - 1"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  class="action-btn remove"
                  @click="rankings.splice(index, 1)"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="available-movies">
          <h3>Available Movies</h3>
          <div class="movie-list">
            <div
              v-for="movie in votingMovies"
              :key="movie.id"
              :class="['movie-item', { added: rankings.includes(movie.id) }]"
            >
              <div class="movie-details">
                <strong>{{ movie.title }}</strong>
                <span class="meta" v-if="movie.year">({{ movie.year }})</span>
                <span class="meta" v-if="movie.genre">• {{ movie.genre }}</span>
                <p class="notes" v-if="movie.notes">{{ movie.notes }}</p>
              </div>
              <button
                v-if="!rankings.includes(movie.id)"
                class="add-btn"
                @click="rankings.push(movie.id)"
              >
                + Add
              </button>
              <span v-else class="added-badge">Added</span>
            </div>
          </div>
        </div>

        <div class="submit-section">
          <button
            class="btn-submit"
            @click="submitVote"
            :disabled="rankings.length < 2"
          >
            Submit Vote ({{ rankings.length }} movies ranked)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.movie-voting {
  padding: 10px;
}

.no-voting {
  text-align: center;
  padding: 60px 20px;
}

.no-voting h2 {
  margin-bottom: 10px;
  font-size: 2rem;
}

.voting-header {
  text-align: center;
  margin-bottom: 30px;
}

.voting-header h2 {
  margin: 0 0 10px 0;
  font-size: 2rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.has-voted {
  background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}

.voted-message h3 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
}

.voted-message p {
  margin: 10px 0;
  color: #333;
}

.my-ranking {
  text-align: left;
  max-width: 600px;
  margin: 20px auto 0;
  padding-left: 20px;
}

.my-ranking li {
  padding: 8px 0;
  font-size: 1.1rem;
}

.rank-number {
  display: inline-block;
  background: rgba(255, 255, 255, 0.8);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  text-align: center;
  line-height: 28px;
  margin-right: 10px;
  font-weight: bold;
}

.instructions {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.instructions h3 {
  margin-top: 0;
}

.instructions ol {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.instructions li {
  margin: 8px 0;
  line-height: 1.5;
}

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

.submit-section {
  text-align: center;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
