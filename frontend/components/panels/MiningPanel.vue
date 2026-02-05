<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserId } from '../../composables/useUserId'

const { userId } = useUserId()

const mining = ref(false)
const progress = ref(0)
const elapsed = ref(0)
const discoveredStock = ref<any>(null)
const message = ref('')
const miningStartedAt = ref<number | null>(null)

const canStartMining = computed(() => !mining.value)
const isMiningComplete = computed(() => progress.value >= 100 && mining.value)

const startMining = async () => {
  try {
    const response = await fetch('/api/mining/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: userId.value }),
    })

    if (!response.ok) {
      const error = await response.json()
      message.value = error.error || error.message || 'Failed to start mining'
      return
    }

    const data = await response.json()
    mining.value = true
    miningStartedAt.value = Date.now()
    message.value = 'GPU mining started! Mining for new stocks...'

    // Start polling for progress
    pollProgress()
  } catch (error) {
    console.error('Error starting mining:', error)
    message.value = 'Failed to start mining. Please try again.'
  }
}

const pollProgress = async () => {
  if (!mining.value) return

  try {
    const response = await fetch(`/api/mining/progress?userId=${encodeURIComponent(userId.value)}`)
    if (!response.ok) {
      // Mining complete or error
      const data = await response.json()
      if (data.error && data.error.includes('No mining operation')) {
        mining.value = false
        message.value = 'Mining complete! Claim your new stock.'
      }
      return
    }

    const data = await response.json()
    progress.value = data.progress
    elapsed.value = data.elapsed

    if (data.complete) {
      mining.value = false
      message.value = 'Mining complete! Claim your new stock.'
    } else {
      // Continue polling
      setTimeout(pollProgress, 1000)
    }
  } catch (error) {
    console.error('Error polling progress:', error)
  }
}

const claimStock = async () => {
  try {
    const response = await fetch('/api/mining/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: userId.value }),
    })

    if (!response.ok) {
      const error = await response.json()
      message.value = error.error || 'Failed to claim stock'
      return
    }

    const data = await response.json()
    discoveredStock.value = data.stock
    message.value = data.message

    // Reset progress after claiming
    progress.value = 0
    elapsed.value = 0
  } catch (error) {
    console.error('Error claiming stock:', error)
    message.value = 'Failed to claim stock. Please try again.'
  }
}

const resetMining = () => {
  mining.value = false
  progress.value = 0
  elapsed.value = 0
  discoveredStock.value = null
  message.value = ''
  miningStartedAt.value = null
}
</script>

<template>
  <div class="mining-panel">
    <div class="mining-header">
      <h3>⛏️ GPU Mining</h3>
      <p class="mining-subtitle">Mine for new stocks</p>
    </div>

    <div v-if="!mining && !discoveredStock" class="mining-start">
      <button
        class="start-mining-btn"
        :disabled="!canStartMining"
        @click="startMining"
      >
        <span class="btn-icon">💻</span>
        <span class="btn-text">Start Mining</span>
      </button>
      <p class="mining-info">
        Use your GPU to mine for new stocks! Mining takes approximately 30 seconds.
      </p>
    </div>

    <div v-if="mining" class="mining-progress">
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="progress-text">{{ Math.floor(progress) }}%</div>
      </div>

      <div class="mining-status">
        <div class="status-icon">
          <span v-if="progress < 33">🔄</span>
          <span v-else-if="progress < 66">⚡</span>
          <span v-else>💎</span>
        </div>
        <div class="status-text">
          <p>{{ message }}</p>
          <p class="status-time">{{ Math.floor(elapsed) }}s elapsed</p>
        </div>
      </div>

      <div class="mining-animation">
        <div class="mining-blocks">
          <div v-for="i in 5" :key="i" class="mining-block" :style="{ animationDelay: `${i * 0.2}s` }"></div>
        </div>
      </div>
    </div>

    <div v-if="discoveredStock" class="mining-result">
      <div class="result-success">🎉 New Stock Discovered!</div>

      <div class="discovered-stock">
        <div class="stock-avatar">{{ discoveredStock.avatar }}</div>
        <div class="stock-info">
          <div class="stock-name">{{ discoveredStock.name }}</div>
          <div class="stock-price">€{{ discoveredStock.price }}</div>
        </div>
      </div>

      <button class="reset-btn" @click="resetMining">
        Mine Another Stock
      </button>
    </div>

    <div v-if="message && !mining && !discoveredStock" class="mining-message">
      {{ message }}
    </div>
  </div>
</template>

<style scoped>
.mining-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 20px;
  color: #fff;
  min-height: 400px;
}

.mining-header {
  text-align: center;
  margin-bottom: 20px;
}

.mining-header h3 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: 600;
}

.mining-subtitle {
  margin: 0;
  font-size: 14px;
  color: #8892b0;
}

.start-mining-btn {
  width: 100%;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.start-mining-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.start-mining-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 20px;
}

.btn-text {
  font-size: 16px;
}

.mining-info {
  margin-top: 15px;
  font-size: 13px;
  color: #8892b0;
  text-align: center;
  line-height: 1.5;
}

.progress-container {
  margin: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #0a0a1a;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
  border-radius: 10px;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  margin-top: 10px;
  font-weight: 600;
  color: #667eea;
}

.mining-status {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
  padding: 15px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.status-icon {
  font-size: 32px;
  animation: pulse 1.5s ease-in-out infinite;
}

.status-text p {
  margin: 0;
  font-size: 14px;
}

.status-time {
  font-size: 12px;
  color: #8892b0;
  margin-top: 5px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.mining-animation {
  margin: 20px 0;
  text-align: center;
}

.mining-blocks {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.mining-block {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.mining-result {
  text-align: center;
}

.result-success {
  font-size: 20px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 20px;
  animation: celebrate 0.5s ease-out;
}

@keyframes celebrate {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.discovered-stock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  margin: 20px 0;
}

.stock-avatar {
  font-size: 48px;
}

.stock-info {
  text-align: left;
}

.stock-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stock-price {
  font-size: 16px;
  color: #667eea;
}

.reset-btn {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.mining-message {
  text-align: center;
  padding: 15px;
  background: rgba(255, 99, 71, 0.1);
  border-radius: 8px;
  color: #ff6347;
  font-size: 14px;
}
</style>
