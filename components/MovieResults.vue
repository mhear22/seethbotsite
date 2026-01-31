<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const emit = defineEmits(['refresh'])

interface Movie {
  id: string
  title: string
  suggestedBy: string
  year?: string
  genre?: string
}

interface VotingRound {
  id: string
  isActive: boolean
  startDate: string
  endDate?: string
  movieIds: string[]
  winner?: string
}

const votingRound = ref<VotingRound | null>(null)
const movies = ref<Movie[]>([])
const votes = ref<any[]>([])
const results = ref<any>(null)

const winner = computed(() => {
  if (!votingRound.value?.winner || !movies.value.length) return null
  return movies.value.find(m => m.id === votingRound.value?.winner)
})

const getMovieTitle = (id: string) => {
  const movie = movies.value.find(m => m.id === id)
  return movie?.title || 'Unknown'
}

const loadVotingRound = async () => {
  try {
    const response = await fetch('/api/movies/voting-round')
    const data = await response.json()
    votingRound.value = data.round

    if (data.round) {
      await loadMovies()
      await loadVotes()

      // If round is ended, calculate results
      if (!data.round.isActive) {
        results.value = calculateResults()
      }
    }
  } catch (error) {
    console.error('Failed to load voting round:', error)
  }
}

const loadMovies = async () => {
  try {
    const response = await fetch('/api/movies')
    const data = await response.json()
    movies.value = data.movies
  } catch (error) {
    console.error('Failed to load movies:', error)
  }
}

const loadVotes = async () => {
  try {
    const response = await fetch('/api/movies/votes')
    const data = await response.json()
    votes.value = data.votes
  } catch (error) {
    console.error('Failed to load votes:', error)
  }
}

const calculateResults = () => {
  if (!votingRound.value || !movies.value.length) return null

  const movieIds = votingRound.value.movieIds
  const roundMovies = movies.value.filter(m => movieIds.includes(m.id))
  const roundVotes = votes.value.filter(v =>
    v.rankings.some((r: string) => movieIds.includes(r))
  )

  // Calculate preferential voting rounds
  const rounds = simulatePreferentialVoting(roundMovies, roundVotes)

  return {
    rounds,
    totalVotes: roundVotes.length,
    winner: votingRound.value.winner
  }
}

const simulatePreferentialVoting = (movies: Movie[], votes: any[]) => {
  if (movies.length === 0) return []

  const rounds: any[] = []
  let remainingMovies = [...movies]
  let roundNumber = 1

  while (remainingMovies.length > 0) {
    // Count first preferences
    const counts: { [key: string]: number } = {}
    remainingMovies.forEach(m => counts[m.id] = 0)

    votes.forEach(vote => {
      for (const movieId of vote.rankings) {
        if (counts.hasOwnProperty(movieId)) {
          counts[movieId]++
          break
        }
      }
    })

    // Build round results
    const roundResults = remainingMovies.map(movie => ({
      movieId: movie.id,
      title: movie.title,
      votes: counts[movie.id] || 0,
      percentage: votes.length > 0 ? ((counts[movie.id] || 0) / votes.length * 100) : 0,
      eliminated: false
    }))

    // Sort by votes
    roundResults.sort((a, b) => b.votes - a.votes)

    // Check for majority winner
    const topVote = roundResults[0].votes
    const hasMajority = topVote > votes.length / 2
    const isLastRound = remainingMovies.length === 1

    if (hasMajority || isLastRound) {
      rounds.push({
        round: roundNumber,
        eliminated: isLastRound ? null : roundResults[roundResults.length - 1].movieId,
        winner: roundResults[0].movieId,
        results: roundResults,
        isFinal: true
      })
      break
    }

    // Mark lowest as eliminated
    roundResults[roundResults.length - 1].eliminated = true

    rounds.push({
      round: roundNumber,
      eliminated: roundResults[roundResults.length - 1].movieId,
      results: roundResults,
      isFinal: false
    })

    // Remove eliminated movie
    const eliminatedId = roundResults[roundResults.length - 1].movieId
    remainingMovies = remainingMovies.filter(m => m.id !== eliminatedId)

    roundNumber++
  }

  return rounds
}

const resetVoting = async () => {
  if (!confirm('Are you sure you want to reset all voting? This will delete all votes and the current round.')) {
    return
  }

  try {
    const response = await fetch('/api/movies/voting-round/reset', {
      method: 'POST'
    })

    if (response.ok) {
      alert('Voting reset successfully!')
      results.value = null
      emit('refresh')
    } else {
      alert('Failed to reset voting')
    }
  } catch (error) {
    console.error('Error resetting voting:', error)
    alert('Failed to reset voting')
  }
}

onMounted(() => {
  loadVotingRound()
})
</script>

<template>
  <div class="movie-results">
    <div v-if="!votingRound" class="no-results">
      <h2>🏆 Voting Results</h2>
      <p>No voting round has been created yet.</p>
    </div>

    <div v-else-if="votingRound.isActive" class="voting-active">
      <div class="active-message">
        <h2>🗳️ Voting in Progress</h2>
        <p>Voting is still open. Check back after the voting round ends to see the results!</p>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ votes.length }}</span>
            <span class="stat-label">Votes Cast</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ movies.filter(m => votingRound?.movieIds.includes(m.id)).length }}</span>
            <span class="stat-label">Movies</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!results" class="loading">
      <p>Loading results...</p>
    </div>

    <div v-else class="results-display">
      <div class="results-header">
        <h2>🏆 Voting Results</h2>
        <p class="subtitle">{{ results.totalVotes }} votes cast • Australian Parliament preferential voting</p>
        <button class="btn-reset" @click="resetVoting">🔄 Reset Voting</button>
      </div>

      <div v-if="winner" class="winner-section">
        <div class="winner-card">
          <div class="winner-badge">🏆 WINNER</div>
          <h3 class="winner-title">{{ winner.title }}</h3>
          <p class="winner-meta">
            <span v-if="winner.year">{{ winner.year }}</span>
            <span v-if="winner.genre">• {{ winner.genre }}</span>
          </p>
          <p class="winner-suggested">Suggested by {{ winner.suggestedBy }}</p>
        </div>
      </div>

      <div class="rounds-section">
        <h3>📊 Voting Rounds (Preferential)</h3>
        <div class="rounds-container">
          <div
            v-for="(round, index) in results.rounds"
            :key="index"
            :class="['round-card', { final: round.isFinal }]"
          >
            <div class="round-header">
              <h4>Round {{ round.round }}</h4>
              <span v-if="round.isFinal" class="final-badge">FINAL</span>
              <span v-if="round.eliminated" class="eliminated-badge">
                Eliminated: {{ getMovieTitle(round.eliminated) }}
              </span>
            </div>

            <div class="round-results">
              <div
                v-for="result in round.results"
                :key="result.movieId"
                :class="['result-item', {
                  winner: round.winner === result.movieId,
                  eliminated: result.eliminated
                }]"
              >
                <div class="result-title">
                  <span v-if="round.winner === result.movieId" class="trophy">🏆</span>
                  {{ result.title }}
                  <span v-if="result.eliminated" class="eliminated-tag">✕</span>
                </div>
                <div class="result-votes">
                  <div class="votes-bar">
                    <div
                      class="votes-fill"
                      :style="{ width: result.percentage + '%' }"
                    ></div>
                  </div>
                  <div class="votes-text">
                    {{ result.votes }} votes ({{ result.percentage.toFixed(1) }}%)
                  </div>
                </div>
              </div>
            </div>

            <div v-if="round.isFinal" class="round-note">
              <p>✨ {{ round.winner ? getMovieTitle(round.winner) : 'Candidate' }} achieved majority!</p>
            </div>
          </div>
        </div>
      </div>

      <div class="how-it-works">
        <h3>📖 How Preferential Voting Works</h3>
        <ol>
          <li>Voters rank movies in order of preference (1st, 2nd, 3rd...)</li>
          <li>In Round 1, only 1st preferences are counted</li>
          <li>If no movie has >50% of votes, the lowest-ranked movie is eliminated</li>
          <li>Votes for the eliminated movie are redistributed to voters' next preferences</li>
          <li>This continues until one movie has >50% (majority) or only one remains</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.movie-results {
  padding: 10px;
}

.no-results,
.voting-active,
.loading {
  text-align: center;
  padding: 60px 20px;
}

.no-results h2,
.voting-active h2 {
  margin-bottom: 10px;
  font-size: 2rem;
}

.active-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
}

.active-message p {
  font-size: 1.2rem;
  margin: 10px 0 20px 0;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

.results-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.results-header h2 {
  margin: 0 0 10px 0;
  font-size: 2rem;
}

.subtitle {
  color: #666;
  margin: 5px 0 20px 0;
}

.btn-reset {
  background: #e0e0e0;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #d0d0d0;
}

.winner-section {
  margin-bottom: 30px;
}

.winner-card {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
}

.winner-badge {
  background: white;
  color: #d97706;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 15px;
}

.winner-title {
  font-size: 2rem;
  margin: 0 0 10px 0;
  color: #1f2937;
}

.winner-meta {
  color: #4b5563;
  font-size: 1.1rem;
  margin: 5px 0;
}

.winner-suggested {
  color: #6b7280;
  font-style: italic;
  margin: 10px 0 0 0;
}

.rounds-section {
  margin-bottom: 30px;
}

.rounds-section h3 {
  margin-bottom: 20px;
}

.rounds-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.round-card {
  background: #f8f9fa;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
}

.round-card.final {
  border-color: #10b981;
  background: #ecfdf5;
}

.round-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.round-header h4 {
  margin: 0;
  font-size: 1.3rem;
}

.final-badge {
  background: #10b981;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.85rem;
}

.eliminated-badge {
  background: #f59e0b;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.85rem;
}

.round-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.result-item.winner {
  border-left-color: #10b981;
  background: linear-gradient(90deg, #ecfdf5 0%, white 100%);
}

.result-item.eliminated {
  opacity: 0.6;
}

.result-title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.trophy {
  font-size: 1.3rem;
}

.eliminated-tag {
  color: #f59e0b;
  font-weight: bold;
}

.result-votes {
  display: flex;
  align-items: center;
  gap: 12px;
}

.votes-bar {
  flex: 1;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  min-width: 100px;
}

.votes-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.result-item.winner .votes-fill {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.votes-text {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
}

.round-note {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  font-weight: 500;
  color: #10b981;
}

.how-it-works {
  background: #fef3c7;
  padding: 20px;
  border-radius: 12px;
}

.how-it-works h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #92400e;
}

.how-it-works ol {
  margin: 0;
  padding-left: 20px;
  line-height: 1.7;
}

.how-it-works li {
  margin: 8px 0;
  color: #78350f;
}
</style>

