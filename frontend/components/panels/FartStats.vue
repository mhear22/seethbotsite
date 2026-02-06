<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface FartStats {
  totalFarts: number
  totalUsers: number
  totalVolume: number
  avgVolume: number
  todayFarts: number
}

interface LeaderboardEntry {
  user_id: string
  total_farts: number
  total_volume: number
  avg_volume: number
  max_volume: number
  last_fart: string
}

const loading = ref(true)
const stats = ref<FartStats | null>(null)
const leaderboard = ref<LeaderboardEntry[]>([])
const error = ref<string | null>(null)

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

const fetchFartStats = async () => {
  try {
    loading.value = true
    error.value = null
    
    const [statsRes, leaderboardRes] = await Promise.all([
      fetch('/api/farts/stats'),
      fetch('/api/farts/leaderboard?limit=10')
    ])
    
    if (!statsRes.ok || !leaderboardRes.ok) {
      throw new Error('Failed to fetch fart data')
    }
    
    stats.value = await statsRes.json()
    leaderboard.value = await leaderboardRes.json()
    
  } catch (err) {
    console.error('Error fetching fart stats:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load fart statistics'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchFartStats()
  // Refresh every 30 seconds
  setInterval(fetchFartStats, 30000)
})
</script>

<template>
  <div class="fart-stats">
    <h3 class="stats-title">💨 Fart-o-meter Statistics</h3>
    
    <div v-if="loading" class="loading">
      Loading fart statistics...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="stats" class="stats-content">
      <!-- Overall Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(stats.totalFarts) }}</div>
          <div class="stat-label">Total Farts</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(stats.totalUsers) }}</div>
          <div class="stat-label">Users</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">{{ stats.avgVolume.toFixed(2) }}</div>
          <div class="stat-label">Avg Volume</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(stats.todayFarts) }}</div>
          <div class="stat-label">Today</div>
        </div>
      </div>
      
      <!-- Leaderboard -->
      <div class="leaderboard">
        <h4 class="leaderboard-title">🏆 Top Farters</h4>
        
        <div v-if="leaderboard.length === 0" class="no-data">
          No farts recorded yet. Be the first!
        </div>
        
        <div v-else class="leaderboard-list">
          <div
            v-for="(entry, index) in leaderboard"
            :key="entry.user_id"
            class="leaderboard-entry"
          >
            <div class="rank">{{ index + 1 }}</div>
            <div class="user">{{ entry.user_id }}</div>
            <div class="farts">{{ formatNumber(entry.total_farts) }}</div>
            <div class="volume">{{ entry.avg_volume.toFixed(2) }}</div>
            <div class="last">{{ formatDate(entry.last_fart) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fart-stats {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  font-family: inherit;
}

.dark .fart-stats {
  background: rgba(40, 44, 52, 0.95);
}

.stats-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: bold;
  color: #2d3436;
  text-align: center;
}

.dark .stats-title {
  color: #e2e8f0;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  color: #636e72;
}

.error {
  color: #e74c3c;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  background: rgba(0, 184, 148, 0.1);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  border: 2px solid rgba(0, 184, 148, 0.3);
}

.dark .stat-card {
  background: rgba(0, 206, 201, 0.1);
  border-color: rgba(0, 206, 201, 0.3);
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #00b894;
  margin-bottom: 4px;
}

.dark .stat-value {
  color: #00cec9;
}

.stat-label {
  font-size: 11px;
  color: #636e72;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark .stat-label {
  color: #b2bec3;
}

.leaderboard {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 12px;
}

.dark .leaderboard {
  background: rgba(255, 255, 255, 0.05);
}

.leaderboard-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: bold;
  color: #2d3436;
}

.dark .leaderboard-title {
  color: #e2e8f0;
}

.no-data {
  text-align: center;
  color: #636e72;
  padding: 20px;
  font-style: italic;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-entry {
  display: grid;
  grid-template-columns: 30px 1fr 60px 50px 70px;
  gap: 8px;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  font-size: 12px;
}

.dark .leaderboard-entry {
  background: rgba(0, 0, 0, 0.2);
}

.leaderboard-entry:nth-child(1) {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.leaderboard-entry:nth-child(2) {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(192, 192, 192, 0.1));
  border: 1px solid rgba(192, 192, 192, 0.3);
}

.leaderboard-entry:nth-child(3) {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(205, 127, 50, 0.1));
  border: 1px solid rgba(205, 127, 50, 0.3);
}

.rank {
  font-weight: bold;
  color: #636e72;
  text-align: center;
}

.dark .rank {
  color: #b2bec3;
}

.user {
  font-weight: 600;
  color: #2d3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .user {
  color: #e2e8f0;
}

.farts {
  font-weight: bold;
  color: #00b894;
  text-align: right;
}

.dark .farts {
  color: #00cec9;
}

.volume {
  color: #636e72;
  text-align: right;
}

.dark .volume {
  color: #b2bec3;
}

.last {
  color: #636e72;
  text-align: right;
  font-size: 10px;
}

.dark .last {
  color: #b2bec3;
}
</style>