<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { statsRepository } from '../../repositories/stats.repository'
import type { LeaderboardEntry, UserStats } from '../../repositories/types/stats.types'
import { formatDate, formatHistoryTime } from '../../utils/format'
import DailyChallenges from './DailyChallenges.vue'
import Achievements from './Achievements.vue'

const router = useRouter()

const selectedGame = ref<'clicker' | 'fishing'>('clicker')
const leaderboard = ref<LeaderboardEntry[]>([])
const userStats = ref<UserStats | null>(null)
const globalStats = ref<{ total: number; uniqueUsers: number } | null>(null)
const statsHistory = ref<Array<any>>([])
const isLoading = ref(true)
const currentUserId = ref('')
const currentUserName = ref('')

const getOrCreateUserId = (): string => {
  let id = localStorage.getItem('stats-user-id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('stats-user-id', id)
  }
  return id
}

const loadLeaderboard = async () => {
  try {
    const data = await statsRepository.getLeaderboard({
      gameType: selectedGame.value,
      limit: 10
    })
    leaderboard.value = data.leaderboard
  } catch (error) {
    console.error('Error loading leaderboard:', error)
  }
}

const loadUserStats = async () => {
  if (!currentUserId.value) return

  try {
    userStats.value = await statsRepository.getUserStats({
      userId: currentUserId.value,
      gameType: selectedGame.value
    })
  } catch (error) {
    console.error('Error loading user stats:', error)
  }
}

const loadGlobalStats = async () => {
  try {
    const data = await statsRepository.getGlobalStats({
      gameType: selectedGame.value,
      timeRange: 'all'
    })
    globalStats.value = {
      total: data.total,
      uniqueUsers: data.uniqueUsers
    }
  } catch (error) {
    console.error('Error loading global stats:', error)
  }
}

const loadStatsHistory = async () => {
  if (!currentUserId.value) return

  try {
    const data = await statsRepository.getStatsHistory({
      userId: currentUserId.value,
      gameType: selectedGame.value,
      limit: 50
    })
    statsHistory.value = data.history || []
  } catch (error) {
    console.error('Error loading stats history:', error)
  }
}

const loadAllStats = async () => {
  isLoading.value = true
  await Promise.all([
    loadLeaderboard(),
    loadUserStats(),
    loadGlobalStats(),
    loadStatsHistory()
  ])
  isLoading.value = false
}

const selectGame = (game: 'clicker' | 'fishing') => {
  selectedGame.value = game
  loadAllStats()
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
  return num.toString()
}

const gameTitle = computed(() => {
  return selectedGame.value === 'clicker' ? '🍄 Clicker' : '🎣 Fishing'
})

const getHistoryIcon = (statType: string): string => {
  switch (statType) {
    case 'click':
      return '👆'
    case 'fish_caught':
      return '🐟'
    case 'score':
      return '🏆'
    case 'session_end':
      return '🔚'
    default:
      return '📊'
  }
}

const formatHistoryType = (statType: string): string => {
  switch (statType) {
    case 'click':
      return 'Click'
    case 'fish_caught':
      return 'Fish'
    case 'score':
      return 'Score'
    case 'session_end':
      return 'Session End'
    default:
      return statType
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  currentUserId.value = getOrCreateUserId()
  currentUserName.value = localStorage.getItem('user-name') || ''

  loadAllStats()
})
</script>

<template>
  <div class="stats-page">
    <div class="stats-header">
      <h1>📊 Game Statistics</h1>
      <p>View leaderboards and your personal stats!</p>
    </div>

    <!-- Game Selector -->
    <div class="game-selector">
      <button
        class="game-tab"
        :class="{ active: selectedGame === 'clicker' }"
        @click="selectGame('clicker')"
      >
        🍄 Clicker
      </button>
      <button
        class="game-tab"
        :class="{ active: selectedGame === 'fishing' }"
        @click="selectGame('fishing')"
      >
        🎣 Fishing
      </button>
    </div>

    <!-- Daily Challenges -->
    <DailyChallenges />

    <!-- Achievements -->
    <Achievements />

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading stats...</p>
    </div>

    <div v-else class="stats-content">
      <!-- Global Stats -->
      <div v-if="globalStats" class="global-stats">
        <h2>🌍 Global {{ gameTitle }} Stats</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(globalStats.total) }}</div>
            <div class="stat-label">
              {{ selectedGame === 'clicker' ? 'Total Clicks' : 'Total Fish Caught' }}
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(globalStats.uniqueUsers) }}</div>
            <div class="stat-label">Active Players</div>
          </div>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="leaderboard-section">
        <h2>🏆 {{ gameTitle }} Leaderboard</h2>
        <div v-if="leaderboard.length === 0" class="empty-state">
          No records yet. Be the first to play!
        </div>
        <div v-else class="leaderboard-list">
          <div
            v-for="entry in leaderboard"
            :key="entry.userId"
            class="leaderboard-entry"
            :class="{ 'current-user': entry.userId === currentUserId }"
          >
            <div class="rank" :class="`rank-${entry.rank <= 3 ? entry.rank : 'other'}`">
              {{ entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank }}
            </div>
            <div class="player-info">
              <div class="player-name">
                {{ entry.userName || 'Anonymous' }}
                <span v-if="entry.userId === currentUserId" class="you-badge">YOU</span>
              </div>
              <div class="player-date">Since {{ formatDate(entry.recordedAt) }}</div>
            </div>
            <div class="score">
              {{ formatNumber(entry.score) }}
            </div>
          </div>
        </div>
      </div>

      <!-- User Stats -->
      <div v-if="userStats" class="user-stats">
        <h2>👤 Your {{ gameTitle }} Stats</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ formatNumber(userStats.totalClicks) }}</div>
            <div class="stat-label">Total Clicks</div>
          </div>
          <div class="stat-card" v-if="selectedGame === 'fishing'">
            <div class="stat-value">{{ formatNumber(userStats.totalFishCaught) }}</div>
            <div class="stat-label">Fish Caught</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">
              {{ userStats.highScore ? formatNumber(userStats.highScore) : '-' }}
            </div>
            <div class="stat-label">High Score</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ userStats.totalSessions }}</div>
            <div class="stat-label">Sessions</div>
          </div>
        </div>
      </div>

      <!-- Stats History -->
      <div v-if="statsHistory.length > 0" class="history-section">
        <h2>📈 Your {{ gameTitle }} History</h2>
        <div v-if="statsHistory.length === 0" class="empty-state">
          No history yet. Play to start tracking!
        </div>
        <div v-else class="history-list">
          <div
            v-for="(entry, index) in statsHistory"
            :key="entry.id"
            class="history-entry"
          >
            <div class="history-type">
              {{ getHistoryIcon(entry.statType) }} {{ formatHistoryType(entry.statType) }}
            </div>
            <div class="history-value">
              {{ formatNumber(entry.value) }}
            </div>
            <div class="history-time">
              {{ formatHistoryTime(entry.recordedAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <button class="action-btn back-btn" @click="goBack">← Back Home</button>
        <button
          class="action-btn play-btn"
          @click="router.push(selectedGame === 'clicker' ? '/clicker' : '/fishing')"
        >
          Play {{ gameTitle }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #eee;
}

.stats-header {
  text-align: center;
  margin-bottom: 30px;
}

.stats-header h1 {
  font-size: 3rem;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-header p {
  color: #888;
  font-size: 1.2rem;
  margin: 0;
}

.game-selector {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.game-tab {
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #eee;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.game-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #2d3748;
  border-top: 4px solid #a8e063;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stats-content {
  max-width: 800px;
  margin: 0 auto;
}

.global-stats,
.user-stats {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
}

.global-stats h2,
.user-stats h2 {
  font-size: 1.5rem;
  margin: 0 0 20px 0;
  color: #a8e063;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #a8e063;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #888;
}

.leaderboard-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
}

.leaderboard-section h2 {
  font-size: 1.5rem;
  margin: 0 0 20px 0;
  color: #a8e063;
}

.empty-state {
  text-align: center;
  color: #888;
  padding: 40px 20px;
  font-style: italic;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.leaderboard-entry {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.leaderboard-entry:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.leaderboard-entry.current-user {
  background: rgba(168, 224, 99, 0.1);
  border-color: rgba(168, 224, 99, 0.3);
}

.rank {
  font-size: 1.8rem;
  font-weight: bold;
  width: 40px;
  text-align: center;
}

.rank-1 { color: #ffd700; }
.rank-2 { color: #c0c0c0; }
.rank-3 { color: #cd7f32; }
.rank-other { color: #888; }

.player-info {
  flex: 1;
}

.player-name {
  font-weight: 600;
  color: #eee;
  display: flex;
  align-items: center;
  gap: 8px;
}

.you-badge {
  font-size: 0.7rem;
  background: #a8e063;
  color: #1a1a2e;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

.player-date {
  font-size: 0.85rem;
  color: #888;
  margin-top: 3px;
}

.score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #a8e063;
}

.history-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
}

.history-section h2 {
  font-size: 1.5rem;
  margin: 0 0 20px 0;
  color: #a8e063;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.history-entry {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.history-entry:hover {
  background: rgba(255, 255, 255, 0.08);
}

.history-type {
  font-size: 1rem;
  font-weight: 600;
  color: #eee;
  min-width: 120px;
}

.history-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #a8e063;
  flex: 1;
}

.history-time {
  font-size: 0.85rem;
  color: #888;
}

.actions-section {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #eee;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.play-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.play-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-header h1 {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-section {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
