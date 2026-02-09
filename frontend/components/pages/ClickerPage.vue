<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { clicksRepository } from '../../repositories/clicks.repository'
import { generalRepository } from '../../repositories/general.repository'
import { statsRepository } from '../../repositories/stats.repository'

const router = useRouter()

const count = ref(0)
const clickPower = ref(1)
const autoClickPower = ref(0)
const isLoading = ref(true)
const isClicking = ref(false)
const clickParticles = ref<Array<{ id: number, x: number, y: number, value: number }>>([])
const showParticles = ref(true)
const unsyncedClicks = ref(0)

// User ID for tracking points
const userId = ref('')
const selectedTargetUser = ref('')

// Rankings for dropdown
const rankings = ref<Array<{ avatar: string; name: string; score: number; isCurrentUser?: boolean }>>([])

// Get or create user ID

// Get or create user ID
const getOrCreateUserId = (): string => {
  let id = localStorage.getItem('clicker-user-id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('clicker-user-id', id)
  }
  return id
}

// Upgrades
const originalUpgrades = [
  { id: 1, name: 'Better Click', icon: '👆', cost: 10, power: 1, type: 'click', purchased: 0 },
  { id: 2, name: 'Auto Clicker', icon: '🤖', cost: 50, power: 1, type: 'auto', purchased: 0 },
  { id: 3, name: 'Double Click', icon: '✌️', cost: 200, power: 5, type: 'click', purchased: 0 },
  { id: 4, name: 'Mold Farm', icon: '🍄', cost: 500, power: 5, type: 'auto', purchased: 0 },
  { id: 5, name: 'Super Click', icon: '⚡', cost: 1000, power: 20, type: 'click', purchased: 0 },
  { id: 6, name: 'Mold Factory', icon: '🏭', cost: 2500, power: 20, type: 'auto', purchased: 0 }
]

const upgrades = ref([...originalUpgrades])

// Save upgrades to localStorage
const saveUpgrades = () => {
  const savedData = upgrades.value.map(u => ({
    id: u.id,
    purchased: u.purchased,
    cost: u.cost
  }))
  localStorage.setItem('clicker-upgrades', JSON.stringify(savedData))
}

// Save stats to localStorage
const saveStats = () => {
  const stats = {
    count: count.value,
    clickPower: clickPower.value,
    autoClickPower: autoClickPower.value
  }
  localStorage.setItem('clicker-stats', JSON.stringify(stats))

  // Save selected target user
  if (selectedTargetUser.value) {
    localStorage.setItem('clicker-target-user', selectedTargetUser.value)
  }
}

// Recalculate click power and auto click power from purchased upgrades
const recalculatePower = () => {
  let newClickPower = 1 // Base click power
  let newAutoClickPower = 0 // Base auto click power

  upgrades.value.forEach(u => {
    if (u.type === 'click') {
      newClickPower += u.purchased * u.power
    } else if (u.type === 'auto') {
      newAutoClickPower += u.purchased * u.power
    }
  })

  clickPower.value = newClickPower
  autoClickPower.value = newAutoClickPower
}

// Load stats from localStorage
const loadStats = () => {
  try {
    const saved = localStorage.getItem('clicker-stats')
    if (saved) {
      const stats = JSON.parse(saved)
      // Only load count, let upgrades determine power
      count.value = stats.count || 0
    }

    // Load selected target user
    const savedTarget = localStorage.getItem('clicker-target-user')
    if (savedTarget) {
      selectedTargetUser.value = savedTarget
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Load upgrades from localStorage
const loadUpgrades = () => {
  try {
    const saved = localStorage.getItem('clicker-upgrades')
    if (saved) {
      const savedData = JSON.parse(saved)
      // Create a new array with saved data merged in to properly trigger Vue reactivity
      upgrades.value = upgrades.value.map(u => {
        const savedUpgrade = savedData.find((s: any) => s.id === u.id)
        const purchased = savedUpgrade?.purchased || 0
        return {
          ...u,
          purchased: purchased,
          cost: Math.floor(getOriginalCost(u.id) * Math.pow(1.5, purchased))
        }
      })
      // Recalculate power after loading upgrades
      recalculatePower()
    }
  } catch (error) {
    console.error('Error loading upgrades:', error)
  }
}

// Load rankings
const loadRankings = async () => {
  try {
    const data = await generalRepository.getRankings()
    rankings.value = data

    // Set default target to current user if they exist in rankings
    const currentUser = rankings.value.find(r => r.isCurrentUser)
    if (currentUser) {
      selectedTargetUser.value = currentUser.name
    }
  } catch (error) {
    console.error('Error loading rankings:', error)
  }
}

// Watch for target user changes
watch(selectedTargetUser, (newValue) => {
  if (newValue) {
    localStorage.setItem('clicker-target-user', newValue)
  }
})

// Sync clicks to rankings
const syncClicksToPoints = async () => {
  if (unsyncedClicks.value <= 0 || !selectedTargetUser.value) return

  try {
    await clicksRepository.addPoints(selectedTargetUser.value, unsyncedClicks.value)
    unsyncedClicks.value = 0
  } catch (error) {
    console.error('Error syncing clicks to points:', error)
    // Don't reset unsyncedClicks on error - will retry next time
  }
}

// Record click stat
const recordClickStat = async () => {
  try {
    await statsRepository.recordStat({
      userId: userId.value,
      userName: localStorage.getItem('user-name') || undefined,
      gameType: 'clicker',
      statType: 'click',
      value: clickPower.value,
      metadata: {
        timestamp: new Date().toISOString(),
        autoClicker: autoClickPower.value > 0
      }
    })
  } catch (error) {
    console.error('Error recording click stat:', error)
  }
}

// Track and update high score
let lastRecordedScore = 0
const updateHighScore = async () => {
  if (count.value > lastRecordedScore) {
    try {
      await statsRepository.updateHighScore({
        userId: userId.value,
        userName: localStorage.getItem('user-name') || undefined,
        gameType: 'clicker',
        score: count.value,
        details: {
          clickPower: clickPower.value,
          autoClickPower: autoClickPower.value,
          timestamp: new Date().toISOString()
        }
      })
      lastRecordedScore = count.value
    } catch (error) {
      console.error('Error updating high score:', error)
    }
  }
}

let autoClickInterval: ReturnType<typeof setInterval> | null = null
let particleIdCounter = 0

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
  return num.toString()
}

const loadCount = async () => {
  try {
    const data = await clicksRepository.getCount()
    count.value = data.count
  } catch (error) {
    console.error('Error loading count:', error)
  } finally {
    isLoading.value = false
  }
}

// Save stats periodically
let saveInterval: ReturnType<typeof setInterval> | null = null

const handleClick = async (event: MouseEvent) => {
  if (isClicking.value) return
  isClicking.value = true

  try {
    // Increment local count directly (idle clicker is independent)
    count.value += clickPower.value

    // Track unsynced clicks for points
    unsyncedClicks.value += clickPower.value

    // Sync clicks to points (with debounce)
    if (unsyncedClicks.value >= 10) {
      syncClicksToPoints()
    }

    // Record click stat
    recordClickStat()

    // Update high score periodically
    if (count.value > lastRecordedScore && count.value % 10 === 0) {
      updateHighScore()
    }

    // Save stats after click
    saveStats()

    // Add click particle
    if (showParticles.value && event.target instanceof HTMLElement) {
      const rect = (event.target as HTMLElement).getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const particle = {
        id: particleIdCounter++,
        x,
        y,
        value: clickPower.value
      }

      clickParticles.value.push(particle)

      // Remove particle after animation
      setTimeout(() => {
        clickParticles.value = clickParticles.value.filter(p => p.id !== particle.id)
      }, 1000)
    }
  } catch (error) {
    console.error('Error clicking:', error)
  } finally {
    setTimeout(() => { isClicking.value = false }, 50)
  }
}

const purchaseUpgrade = async (upgrade: any) => {
  if (count.value < upgrade.cost) return

  count.value -= upgrade.cost
  upgrade.purchased++
  // Recalculate cost from original base cost
  upgrade.cost = Math.floor(getOriginalCost(upgrade.id) * Math.pow(1.5, upgrade.purchased))

  if (upgrade.type === 'click') {
    clickPower.value += upgrade.power
  } else {
    autoClickPower.value += upgrade.power
  }

  // Save upgrades and stats to localStorage
  saveUpgrades()
  saveStats()
}

const resetClicks = async () => {
  if (!confirm('Are you sure you want to reset all progress?')) return

  try {
    // Reset locally (don't call legacy API - idle clicker is independent)
    count.value = 0
    clickPower.value = 1
    autoClickPower.value = 0

    upgrades.value.forEach(u => {
      u.purchased = 0
      u.cost = getOriginalCost(u.id)
    })

    // Save the reset upgrades state to localStorage (not just remove)
    saveUpgrades()

    // Also clear stats from localStorage
    localStorage.removeItem('clicker-stats')

    // Save the reset state
    saveStats()
  } catch (error) {
    console.error('Error resetting:', error)
  }
}

const getOriginalCost = (id: number) => {
  const original = [
    { id: 1, cost: 10 },
    { id: 2, cost: 50 },
    { id: 3, cost: 200 },
    { id: 4, cost: 500 },
    { id: 5, cost: 1000 },
    { id: 6, cost: 2500 }
  ]
  return original.find(u => u.id === id)?.cost || 10
}

const canAfford = (cost: number) => count.value >= cost

const goBack = () => {
  router.push('/')
}

// Grant coolness points to selected user
const grantCoolnessPoints = async () => {
  if (!selectedTargetUser.value) {
    alert('Please select a user to grant points to!')
    return
  }

  if (count.value < 100) {
    alert('You need at least 100 points to grant coolness points!')
    return
  }

  if (!confirm(`Grant 100 coolness points to ${selectedTargetUser.value}? This will cost 100 idle clicker points.`)) {
    return
  }

  try {
    // Deduct 100 points from idle clicker
    count.value -= 100
    saveStats()

    // Grant 100 points to selected user via API
    await clicksRepository.addPoints(selectedTargetUser.value, 100)

    alert(`✅ Successfully granted 100 coolness points to ${selectedTargetUser.value}!`)
  } catch (error) {
    console.error('Error granting coolness points:', error)
    alert('❌ Failed to grant coolness points. Please try again.')
    // Refund the points on error
    count.value += 100
    saveStats()
  }
}

onMounted(async () => {
  // Initialize user ID
  userId.value = getOrCreateUserId()

  // Load stats and upgrades from localStorage (idle clicker is independent)
  loadStats()
  loadUpgrades()

  // Load rankings for user selection dropdown
  await loadRankings()

  // Initialize count to loaded value or 0 (don't load from server)
  if (count.value === 0) {
    count.value = 0
  }
  isLoading.value = false

  // Auto clicker interval
  autoClickInterval = setInterval(async () => {
    if (autoClickPower.value > 0) {
      try {
        // Increment local count directly (don't use legacy API)
        count.value += autoClickPower.value

        // Track unsynced auto-clicks
        unsyncedClicks.value += autoClickPower.value

        // Sync clicks periodically (every 10 auto-clicks worth)
        if (unsyncedClicks.value >= 10) {
          syncClicksToPoints()
        }

        // Record auto-click stat
        recordClickStat()

        // Update high score
        updateHighScore()

        // Save stats to localStorage
        saveStats()
      } catch (error) {
        console.error('Auto-click error:', error)
      }
    }
  }, 1000)

  // Save stats to localStorage every 5 seconds
  saveInterval = setInterval(() => {
    saveStats()
  }, 5000)

  // Sync any remaining clicks every 30 seconds
  setInterval(() => {
    syncClicksToPoints()
  }, 30000)
})

onUnmounted(() => {
  if (autoClickInterval) {
    clearInterval(autoClickInterval)
  }
  if (saveInterval) {
    clearInterval(saveInterval)
  }
  // Sync any remaining clicks before unmount
  syncClicksToPoints()
  // Update final high score
  updateHighScore()
  // Save stats before unmount
  saveStats()
})
</script>

<template>
  <div class="clicker-page">
    <div class="clicker-container">
      <div class="clicker-header">
        <h1>🖱️ Idle Clicker</h1>
        <p>Click the mushroom to earn points!</p>
      </div>

      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading your progress...</p>
      </div>

      <div v-else class="clicker-content">
        <!-- Stats -->
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-label">Points</span>
            <span class="stat-value">{{ formatNumber(count) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Click Power</span>
            <span class="stat-value">{{ formatNumber(clickPower) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Auto/Sec</span>
            <span class="stat-value">{{ formatNumber(autoClickPower) }}</span>
          </div>
        </div>

        <!-- Target User Selector (for giving points to rankings) -->
        <div class="target-user-section">
          <label for="target-user" class="target-label">Give idle points to:</label>
          <select
            id="target-user"
            v-model="selectedTargetUser"
            class="target-select"
          >
            <option value="">Select a user...</option>
            <option v-for="user in rankings" :key="user.name" :value="user.name">
              {{ user.avatar }} {{ user.name }} ({{ formatNumber(user.score) }} pts)
            </option>
          </select>
          <p v-if="!selectedTargetUser" class="target-warning">
            ⚠️ Select a user to give idle points to rankings
          </p>
        </div>

        <!-- Click Button -->
        <div class="click-section">
          <button
            class="click-button"
            @click="handleClick"
            :disabled="isClicking"
            :aria-label="`Click to earn ${formatNumber(clickPower)} points`"
          >
            <span class="mushroom-icon" aria-hidden="true">🍄</span>

            <!-- Particles -->
            <TransitionGroup name="particle" aria-live="polite">
              <div
                v-for="particle in clickParticles"
                :key="particle.id"
                class="particle"
                :style="{ left: particle.x + 'px', top: particle.y + 'px' }"
                :aria-label="`Earned ${particle.value} points`"
                role="status"
              >
                +{{ particle.value }}
              </div>
            </TransitionGroup>
          </button>
          <p class="click-instruction">Click the mushroom!</p>
        </div>

        <!-- Upgrades -->
        <div class="upgrades-section">
          <h2>✨ Upgrades</h2>
          <div class="upgrades-grid" role="list">
            <button
              v-for="upgrade in upgrades"
              :key="upgrade.id"
              class="upgrade-card"
              :class="{ disabled: !canAfford(upgrade.cost), 'click-upgrade': upgrade.type === 'click', 'auto-upgrade': upgrade.type === 'auto' }"
              @click="purchaseUpgrade(upgrade)"
              :disabled="!canAfford(upgrade.cost)"
              :aria-label="`Purchase ${upgrade.name} for ${formatNumber(upgrade.cost)} points. Increases ${upgrade.type === 'click' ? 'click power' : 'auto-clicks'} by ${upgrade.power}. Currently owned: ${upgrade.purchased}`"
              role="listitem"
            >
              <div class="upgrade-icon" aria-hidden="true">{{ upgrade.icon }}</div>
              <div class="upgrade-info">
                <h3>{{ upgrade.name }}</h3>
                <p class="upgrade-cost">Cost: {{ formatNumber(upgrade.cost) }}</p>
                <p class="upgrade-power">+{{ upgrade.power }} {{ upgrade.type === 'click' ? 'click' : 'auto' }}/sec</p>
                <p class="upgrade-purchased">Owned: {{ upgrade.purchased }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <button class="action-btn back-btn" @click="goBack" aria-label="Return to home page">← Back Home</button>
          <button class="action-btn grant-btn" @click="grantCoolnessPoints" aria-label="Grant 100 coolness points to selected user">🎁 Grant 100 Coolness Points</button>
          <button class="action-btn reset-btn" @click="resetClicks" aria-label="Reset all progress">🔄 Reset</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clicker-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #eee;
}

.clicker-container {
  max-width: 800px;
  margin: 0 auto;
}

.clicker-header {
  text-align: center;
  margin-bottom: 30px;
}

.clicker-header h1 {
  font-size: 3rem;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.clicker-header p {
  color: #888;
  font-size: 1.2rem;
  margin: 0;
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

.clicker-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: #a8e063;
}

.target-user-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.target-label {
  display: block;
  font-size: 0.9rem;
  color: #a8e063;
  font-weight: bold;
  margin-bottom: 8px;
}

.target-select {
  width: 100%;
  max-width: 400px;
  padding: 10px 12px;
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid #a8e063;
  border-radius: 8px;
  color: #eee;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.target-select:focus {
  outline: none;
  border-color: #56ab2f;
  box-shadow: 0 0 10px rgba(168, 224, 99, 0.3);
}

.target-select option {
  background: #1a1a2e;
  color: #eee;
  padding: 8px;
}

.target-warning {
  color: #ff6b9d;
  font-size: 0.85rem;
  margin: 10px 0 0 0;
  font-style: italic;
}

.click-section {
  text-align: center;
  margin-bottom: 40px;
}

.click-button {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 10px 30px rgba(168, 224, 99, 0.3);
  overflow: visible;
}

.click-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(168, 224, 99, 0.4);
}

.click-button:active:not(:disabled) {
  transform: scale(0.95);
}

.click-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.mushroom-icon {
  font-size: 6rem;
  display: block;
  line-height: 200px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.particle {
  position: absolute;
  font-size: 1.2rem;
  font-weight: bold;
  color: #a8e063;
  text-shadow: 0 0 10px rgba(168, 224, 99, 0.8);
  pointer-events: none;
  animation: particleFloat 1s ease-out forwards;
}

@keyframes particleFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scale(1.5);
  }
}

.particle-enter-active {
  animation: particleFloat 1s ease-out forwards;
}

.particle-leave-active {
  display: none;
}

.click-instruction {
  margin-top: 15px;
  color: #888;
  font-size: 1rem;
}

.upgrades-section h2 {
  text-align: center;
  font-size: 2rem;
  margin: 0 0 20px 0;
  color: #a8e063;
}

.upgrades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.upgrade-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(168, 224, 99, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upgrade-card:hover:not(.disabled) {
  background: rgba(168, 224, 99, 0.1);
  transform: translateY(-5px);
  border-color: rgba(168, 224, 99, 0.6);
}

.upgrade-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upgrade-card.click-upgrade {
  border-color: rgba(168, 224, 99, 0.5);
}

.upgrade-card.auto-upgrade {
  border-color: rgba(86, 171, 47, 0.5);
}

.upgrade-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.upgrade-info h3 {
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  color: #fff;
}

.upgrade-cost {
  color: #a8e063;
  font-weight: bold;
  margin: 5px 0;
  font-size: 1rem;
}

.upgrade-power {
  color: #888;
  margin: 5px 0;
  font-size: 0.9rem;
}

.upgrade-purchased {
  color: #666;
  margin: 5px 0 0 0;
  font-size: 0.85rem;
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

.reset-btn {
  background: rgba(255, 82, 82, 0.2);
  color: #ff5252;
  border: 1px solid rgba(255, 82, 82, 0.3);
}

.reset-btn:hover {
  background: rgba(255, 82, 82, 0.3);
}

.grant-btn {
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  color: #fff;
  border: none;
}

.grant-btn:hover {
  background: linear-gradient(135deg, #56ab2f 0%, #3d8a1f 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(168, 224, 99, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }

  .clicker-header h1 {
    font-size: 2rem;
  }

  .click-button {
    width: 150px;
    height: 150px;
  }

  .mushroom-icon {
    font-size: 4rem;
    line-height: 150px;
  }

  .upgrades-grid {
    grid-template-columns: 1fr;
  }
}
</style>
