<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface DailyChallenge {
  id: number
  challengeType: string
  description: string
  targetValue: number
  currentValue: number
  progress: number
  completed: boolean
  date: string
  completedAt?: string
}

const challenges = ref<DailyChallenge[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const todayDate = ref('')

const getOrCreateUserId = (): string => {
  let id = localStorage.getItem('stats-user-id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('stats-user-id', id)
  }
  return id
}

const loadChallenges = async () => {
  try {
    isLoading.value = true
    error.value = null

    const userId = getOrCreateUserId()
    const response = await fetch('/api/challenges', {
      headers: {
        'X-User-Id': userId
      }
    })

    if (!response.ok) {
      throw new Error('Failed to load challenges')
    }

    const data = await response.json()
    challenges.value = data.challenges
    todayDate.value = data.date
  } catch (err) {
    console.error('Error loading challenges:', err)
    error.value = 'Could not load daily challenges'
  } finally {
    isLoading.value = false
  }
}

const completeChallenge = async (challengeId: number) => {
  try {
    const userId = getOrCreateUserId()
    const response = await fetch(`/api/challenges/${challengeId}/complete`, {
      method: 'POST',
      headers: {
        'X-User-Id': userId,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to complete challenge')
    }

    // Refresh challenges
    await loadChallenges()
  } catch (err) {
    console.error('Error completing challenge:', err)
  }
}

const getChallengeIcon = (type: string): string => {
  switch (type) {
    case 'clicks':
      return '👆'
    case 'fish_caught':
      return '🐟'
    case 'fishing_score':
      return '🎣'
    case 'clicker_score':
      return '🍄'
    default:
      return '🎯'
  }
}

const getProgressColor = (progress: number): string => {
  if (progress >= 100) return '#48bb78' // Green for completed
  if (progress >= 50) return '#ecc94b' // Yellow for half
  return '#ed8936' // Orange for low
}

onMounted(() => {
  loadChallenges()
})
</script>

<template>
  <div class="daily-challenges">
    <div class="challenges-header">
      <h2>🎯 Daily Challenges</h2>
      <p v-if="todayDate">Today: {{ todayDate }}</p>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading challenges...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadChallenges" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="challenges.length === 0" class="empty">
      <p>No challenges for today!</p>
    </div>

    <div v-else class="challenges-list">
      <div
        v-for="challenge in challenges"
        :key="challenge.id"
        class="challenge-card"
        :class="{ completed: challenge.completed }"
      >
        <div class="challenge-icon">
          {{ getChallengeIcon(challenge.challengeType) }}
        </div>

        <div class="challenge-content">
          <h3>{{ challenge.description }}</h3>
          <div class="progress-bar-container">
            <div
              class="progress-bar"
              :style="{
                width: `${Math.min(challenge.progress, 100)}%`,
                backgroundColor: getProgressColor(challenge.progress)
              }"
            ></div>
          </div>
          <div class="progress-text">
            <span>{{ challenge.currentValue }} / {{ challenge.targetValue }}</span>
            <span class="progress-percent">{{ Math.round(challenge.progress) }}%</span>
          </div>
        </div>

        <div class="challenge-status">
          <span v-if="challenge.completed" class="completed-badge">✅ Complete!</span>
          <button
            v-else
            @click="completeChallenge(challenge.id)"
            class="cheat-btn"
            title="Complete this challenge (for testing)"
          >
            ⚡
          </button>
        </div>
      </div>
    </div>

    <div class="challenges-footer">
      <p>💡 Complete challenges by playing games! Progress updates automatically.</p>
    </div>
  </div>
</template>

<style scoped>
.daily-challenges {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.daily-challenges.dark {
  background: rgba(40, 44, 52, 0.95);
}

.challenges-header {
  margin-bottom: 20px;
}

.challenges-header h2 {
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #ff6b9d, #ff8a80, #ffb6c1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.challenges-header p {
  margin: 0;
  color: #718096;
  font-size: 0.9em;
}

.dark .challenges-header p {
  color: #a0aec0;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.error button {
  margin-top: 12px;
  padding: 8px 16px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
}

.error button:hover {
  background: #c53030;
}

.challenges-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.challenge-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.challenge-card:hover {
  border-color: #ed8936;
  transform: translateX(4px);
}

.challenge-card.completed {
  border-color: #48bb78;
  background: rgba(72, 187, 120, 0.1);
}

.challenge-icon {
  font-size: 2.5em;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
  border-radius: 12px;
}

.challenge-content {
  flex: 1;
  min-width: 0;
}

.challenge-content h3 {
  margin: 0 0 12px 0;
  font-size: 1.1em;
  color: #2d3748;
}

.dark .challenge-content h3 {
  color: #e2e8f0;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.dark .progress-bar-container {
  background: #4a5568;
}

.progress-bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.85em;
  color: #718096;
}

.dark .progress-text {
  color: #a0aec0;
}

.progress-percent {
  font-weight: 600;
  color: #ed8936;
}

.challenge-card.completed .progress-percent {
  color: #48bb78;
}

.challenge-status {
  flex-shrink: 0;
}

.completed-badge {
  display: inline-block;
  padding: 8px 16px;
  background: #48bb78;
  color: white;
  border-radius: 20px;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.cheat-btn {
  padding: 8px 12px;
  background: #ecc94b;
  color: #744210;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2em;
  transition: all 0.2s ease;
}

.cheat-btn:hover {
  background: #d69e2e;
  transform: scale(1.1);
}

.challenges-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  color: #718096;
  font-size: 0.9em;
}

.dark .challenges-footer {
  border-top-color: #4a5568;
  color: #a0aec0;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 4px solid #e2e8f0;
  border-top-color: #ff6b9d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
