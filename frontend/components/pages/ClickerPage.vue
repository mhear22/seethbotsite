<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { clicksRepository } from '../../repositories/clicks.repository'

const router = useRouter()

const count = ref(0)
const clickPower = ref(1)
const autoClickPower = ref(0)
const isLoading = ref(true)
const isClicking = ref(false)
const clickParticles = ref<Array<{ id: number, x: number, y: number, value: number }>>([])
const showParticles = ref(true)

// Upgrades
const upgrades = ref([
  { id: 1, name: 'Better Click', icon: '👆', cost: 10, power: 1, type: 'click', purchased: 0 },
  { id: 2, name: 'Auto Clicker', icon: '🤖', cost: 50, power: 1, type: 'auto', purchased: 0 },
  { id: 3, name: 'Double Click', icon: '✌️', cost: 200, power: 5, type: 'click', purchased: 0 },
  { id: 4, name: 'Mold Farm', icon: '🍄', cost: 500, power: 5, type: 'auto', purchased: 0 },
  { id: 5, name: 'Super Click', icon: '⚡', cost: 1000, power: 20, type: 'click', purchased: 0 },
  { id: 6, name: 'Mold Factory', icon: '🏭', cost: 2500, power: 20, type: 'auto', purchased: 0 }
])

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

const handleClick = async (event: MouseEvent) => {
  if (isClicking.value) return
  isClicking.value = true

  try {
    const result = await clicksRepository.increment()
    count.value = result.count

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
  upgrade.cost = Math.floor(upgrade.cost * 1.5)

  if (upgrade.type === 'click') {
    clickPower.value += upgrade.power
  } else {
    autoClickPower.value += upgrade.power
  }
}

const resetClicks = async () => {
  if (!confirm('Are you sure you want to reset all progress?')) return

  try {
    const result = await clicksRepository.reset()
    count.value = result.count
    clickPower.value = 1
    autoClickPower.value = 0

    upgrades.value.forEach(u => {
      u.purchased = 0
      u.cost = getOriginalCost(u.id)
    })
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

onMounted(async () => {
  await loadCount()

  // Auto clicker interval
  autoClickInterval = setInterval(async () => {
    if (autoClickPower.value > 0) {
      try {
        const result = await clicksRepository.increment()
        count.value = result.count + (autoClickPower.value - 1)
      } catch (error) {
        console.error('Auto-click error:', error)
      }
    }
  }, 1000)
})

onUnmounted(() => {
  if (autoClickInterval) {
    clearInterval(autoClickInterval)
  }
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

        <!-- Click Button -->
        <div class="click-section">
          <button
            class="click-button"
            @click="handleClick"
            :disabled="isClicking"
          >
            <span class="mushroom-icon">🍄</span>

            <!-- Particles -->
            <TransitionGroup name="particle">
              <div
                v-for="particle in clickParticles"
                :key="particle.id"
                class="particle"
                :style="{ left: particle.x + 'px', top: particle.y + 'px' }"
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
          <div class="upgrades-grid">
            <div
              v-for="upgrade in upgrades"
              :key="upgrade.id"
              class="upgrade-card"
              :class="{ disabled: !canAfford(upgrade.cost), 'click-upgrade': upgrade.type === 'click', 'auto-upgrade': upgrade.type === 'auto' }"
              @click="purchaseUpgrade(upgrade)"
            >
              <div class="upgrade-icon">{{ upgrade.icon }}</div>
              <div class="upgrade-info">
                <h3>{{ upgrade.name }}</h3>
                <p class="upgrade-cost">Cost: {{ formatNumber(upgrade.cost) }}</p>
                <p class="upgrade-power">+{{ upgrade.power }} {{ upgrade.type === 'click' ? 'click' : 'auto' }}/sec</p>
                <p class="upgrade-purchased">Owned: {{ upgrade.purchased }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <button class="action-btn back-btn" @click="goBack">← Back Home</button>
          <button class="action-btn reset-btn" @click="resetClicks">🔄 Reset</button>
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
  max-width: 900px;
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
