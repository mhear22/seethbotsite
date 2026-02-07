<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { achievementsRepository } from '../../repositories/achievements.repository'
import type { AchievementDisplay, AchievementProgress } from '../../repositories/types/achievements.types'

const achievements = ref<AchievementDisplay[]>([])
const progress = ref<AchievementProgress | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const checkingForNew = ref(false)
const newUnlocksMessage = ref<string | null>(null)

const loadAchievements = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Load all achievements
    achievements.value = await achievementsRepository.getAllAchievements()

    // Load progress
    progress.value = await achievementsRepository.getAchievementProgress()
  } catch (err) {
    console.error('Error loading achievements:', err)
    error.value = 'Could not load achievements'
  } finally {
    isLoading.value = false
  }
}

const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return '#48bb78' // Green
  if (percentage >= 75) return '#38b2ac' // Teal
  if (percentage >= 50) return '#ecc94b' // Yellow
  if (percentage >= 25) return '#ed8936' // Orange
  return '#fc8181' // Red
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const checkNewAchievements = async () => {
  try {
    checkingForNew.value = true
    newUnlocksMessage.value = null

    const result = await achievementsRepository.checkAchievements()

    if (result.newUnlocks.length > 0) {
      newUnlocksMessage.value = `🎉 Unlocked ${result.newUnlocks.length} new achievement(s)!`
      // Reload to show new achievements
      await loadAchievements()
    } else {
      newUnlocksMessage.value = 'No new achievements unlocked.'
    }

    // Clear message after 5 seconds
    setTimeout(() => {
      newUnlocksMessage.value = null
    }, 5000)
  } catch (err) {
    console.error('Error checking achievements:', err)
    error.value = 'Could not check for new achievements'
  } finally {
    checkingForNew.value = false
  }
}

onMounted(() => {
  loadAchievements()
})
</script>

<template>
  <div class="achievements">
    <div class="achievements-header">
      <h1>🏆 Achievements</h1>
      <p v-if="progress" class="progress-summary">
        {{ progress.unlocked }} / {{ progress.total }} unlocked
        <span class="progress-percent">({{ progress.percentage }}%)</span>
      </p>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading achievements...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadAchievements" class="retry-btn">Retry</button>
    </div>

    <div v-if="newUnlocksMessage" class="new-unlocks-message">
      {{ newUnlocksMessage }}
    </div>

    <div v-else-if="progress && progress.unlocked > 0" class="progress-overview">
      <div class="progress-bar-container">
        <div
          class="progress-bar"
          :style="{
            width: `${progress.percentage}%`,
            backgroundColor: getProgressColor(progress.percentage)
          }"
        ></div>
      </div>
      <button
        @click="checkNewAchievements"
        class="check-btn"
        :disabled="checkingForNew"
      >
        {{ checkingForNew ? '🔄 Checking...' : '🔄 Check for New Achievements' }}
      </button>
    </div>

    <div v-else class="empty">
      <p>No achievements unlocked yet! Play games to earn achievements.</p>
      <button
        @click="checkNewAchievements"
        class="check-btn"
        :disabled="checkingForNew"
      >
        {{ checkingForNew ? '🔄 Checking...' : '🔄 Check for Achievements' }}
      </button>
    </div>

    <div v-if="!isLoading && !error" class="achievements-grid">
      <div
        v-for="item in achievements"
        :key="item.template.id"
        class="achievement-card"
        :class="{ unlocked: item.unlocked, locked: !item.unlocked }"
      >
        <div class="achievement-icon">
          {{ item.template.icon }}
        </div>

        <div class="achievement-content">
          <h3>{{ item.template.name }}</h3>
          <p class="achievement-description">{{ item.template.description }}</p>
          <p v-if="item.unlocked && item.unlockedAt" class="achievement-date">
            Unlocked: {{ formatDate(item.unlockedAt) }}
          </p>
          <p v-else class="achievement-status">🔒 Locked</p>
        </div>
      </div>
    </div>

    <div class="achievements-footer">
      <p>💡 Keep playing to unlock more achievements!</p>
    </div>
  </div>
</template>

<style scoped>
.achievements {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.achievements.dark {
  background: rgba(40, 44, 52, 0.95);
}

.achievements-header {
  margin-bottom: 20px;
}

.achievements-header h1 {
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #ffd700, #ffb347, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.5rem;
}

.progress-summary {
  margin: 0;
  color: #718096;
  font-size: 0.9em;
}

.dark .progress-summary {
  color: #a0aec0;
}

.progress-percent {
  font-weight: 600;
  color: #ed8936;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.error button,
.check-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s ease;
}

.error button:hover,
.check-btn:hover:not(:disabled) {
  background: #3182ce;
}

.check-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.new-unlocks-message {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #48bb78, #38b2ac);
  color: white;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.progress-overview {
  margin-bottom: 24px;
}

.progress-bar-container {
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.dark .progress-bar-container {
  background: #4a5568;
}

.progress-bar {
  height: 100%;
  transition: width 0.5s ease, background-color 0.5s ease;
  border-radius: 6px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.achievement-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.achievement-card:hover {
  border-color: #ed8936;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.achievement-card.unlocked {
  border-color: #ecc94b;
  background: linear-gradient(135deg, rgba(236, 201, 75, 0.1), rgba(255, 255, 255, 0.9));
}

.achievement-card.locked {
  border-color: #cbd5e0;
  background: rgba(247, 250, 252, 0.8);
  opacity: 0.8;
}

.achievement-card.locked:hover {
  opacity: 1;
  border-color: #a0aec0;
}

.dark .achievement-card.locked {
  background: rgba(45, 55, 72, 0.8);
}

.achievement-icon {
  font-size: 2.5em;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.achievement-card.unlocked .achievement-icon {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  animation: glow 2s ease-in-out infinite alternate;
}

.achievement-card.locked .achievement-icon {
  filter: grayscale(0.8);
}

.dark .achievement-card.locked .achievement-icon {
  filter: grayscale(0.8) brightness(0.7);
}

@keyframes glow {
  from {
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
  }
  to {
    box-shadow: 0 0 16px rgba(255, 215, 0, 0.6);
  }
}

.achievement-content {
  flex: 1;
  min-width: 0;
}

.achievement-content h3 {
  margin: 0 0 8px 0;
  font-size: 1.1em;
  color: #2d3748;
}

.dark .achievement-content h3 {
  color: #e2e8f0;
}

.achievement-description {
  margin: 0 0 8px 0;
  font-size: 0.9em;
  color: #4a5568;
  line-height: 1.4;
}

.dark .achievement-description {
  color: #a0aec0;
}

.achievement-date {
  margin: 0;
  font-size: 0.8em;
  color: #38b2ac;
  font-weight: 600;
}

.achievement-status {
  margin: 0;
  font-size: 0.85em;
  color: #718096;
  font-style: italic;
}

.achievements-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  color: #718096;
  font-size: 0.9em;
}

.dark .achievements-footer {
  border-top-color: #4a5568;
  color: #a0aec0;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 4px solid #e2e8f0;
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .achievements-grid {
    grid-template-columns: 1fr;
  }
}
</style>
