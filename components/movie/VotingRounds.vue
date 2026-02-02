<script setup lang="ts">
interface Movie {
  id: string
  title: string
}

interface RoundResult {
  movieId: string
  title: string
  votes: number
  percentage: number
  eliminated: boolean
}

interface Round {
  round: number
  eliminated: string | null
  winner: string | null
  results: RoundResult[]
  isFinal: boolean
}

interface Props {
  rounds: Round[]
  getMovieTitle: (id: string) => string
}

defineProps<Props>()
</script>

<template>
  <div class="rounds-section">
    <h3>📊 Voting Rounds (Preferential)</h3>
    <div class="rounds-container">
      <div
        v-for="(round, index) in rounds"
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
</template>

<style scoped>
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
</style>
