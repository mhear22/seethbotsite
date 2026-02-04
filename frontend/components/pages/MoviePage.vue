<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import MovieSuggestions from '../shared/movies/MovieSuggestions.vue'
import MovieVoting from '../shared/movies/MovieVoting.vue'
import MovieResults from '../shared/movies/MovieResults.vue'
import { moviesRepository } from '../../repositories/movies.repository'
import { usePolling } from '../../composables/usePolling'

const activeTab = ref<'suggestions' | 'voting' | 'results'>('suggestions')
const votingRound = ref<any>(null)

const fetchVotingRound = async () => {
  try {
    votingRound.value = await moviesRepository.getVotingRound()

    // Auto-switch to voting tab if there's an active round
    if (votingRound.value?.isActive && activeTab.value === 'results') {
      activeTab.value = 'voting'
    }
  } catch (error) {
    console.error('Failed to fetch voting round:', error)
  }
}

// Use polling composable for automatic updates
const { data: polledRound } = usePolling(
  () => moviesRepository.getVotingRound(),
  { initialInterval: 10000 }
)

onMounted(() => {
  fetchVotingRound()
})

// Watch for polling updates
watch(polledRound, (newRound) => {
  if (newRound) {
    votingRound.value = newRound
    // Auto-switch to voting tab if there's an active round
    if (newRound.isActive && activeTab.value === 'results') {
      activeTab.value = 'voting'
    }
  }
})
</script>

<template>
  <div class="movie-page">
    <div class="movie-header">
      <h1>🎬 Movie Night 🎬</h1>
      <p class="subtitle">Fortnightly movie suggestions & preferential voting</p>
    </div>

    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'suggestions' }]"
        @click="activeTab = 'suggestions'"
      >
        📝 Suggestions
      </button>
      <button
        :class="['tab', { active: activeTab === 'voting' }]"
        @click="activeTab = 'voting'"
      >
        🗳️ Vote
        <span v-if="votingRound?.isActive" class="badge">Active</span>
      </button>
      <button
        :class="['tab', { active: activeTab === 'results' }]"
        @click="activeTab = 'results'"
      >
        🏆 Results
      </button>
    </div>

    <div class="tab-content">
      <MovieSuggestions v-if="activeTab === 'suggestions'" @refresh="fetchVotingRound" />
      <MovieVoting v-if="activeTab === 'voting'" @refresh="fetchVotingRound" />
      <MovieResults v-if="activeTab === 'results'" @refresh="fetchVotingRound" />
    </div>
  </div>
</template>

<style scoped>
.movie-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.movie-header {
  text-align: center;
  margin-bottom: 30px;
}

.movie-header h1 {
  font-size: 2.5rem;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-top: 10px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.tab {
  padding: 12px 24px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab:hover {
  background: #e0e0e0;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.badge {
  background: #10b981;
  color: white;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.tab-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  min-height: 60vh;
}

/* Dark mode support */
.dark .tab-content {
  background: rgba(40, 44, 52, 0.95);
  color: #e2e8f0;
}

.dark .movie-header h1 {
  -webkit-text-fill-color: transparent;
}

.dark .subtitle {
  color: #a0aec0;
}
</style>
