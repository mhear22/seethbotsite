<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref<string>('')
const currentDate = ref<string>('')
const temperature = ref(24)
const speed = ref(0)
const fuel = ref(75)
const speedInterval = ref<number | null>(null)

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  currentDate.value = now.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  })
}

const accelerate = () => {
  speed.value = Math.min(speed.value + 5, 200)
}

const decelerate = () => {
  speed.value = Math.max(speed.value - 5, 0)
}

const adjustFuel = (amount: number) => {
  fuel.value = Math.max(0, Math.min(100, fuel.value + amount))
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (speedInterval.value) {
    clearInterval(speedInterval.value)
  }
})
</script>

<template>
  <div class="car-page">
    <div class="car-display">
      <!-- Header with time and date -->
      <div class="car-header">
        <div class="time-display">
          <div class="time">{{ currentTime }}</div>
          <div class="date">{{ currentDate }}</div>
        </div>
        <div class="weather-display">
          <div class="temperature">{{ temperature }}°C</div>
          <div class="weather-icon">☀️</div>
        </div>
      </div>

      <!-- Speedometer -->
      <div class="speedometer-section">
        <div class="speed-container">
          <div class="speed-value">{{ speed }}</div>
          <div class="speed-unit">km/h</div>
        </div>
        <div class="speed-controls">
          <button @click="decelerate" class="speed-btn slow">🔻 Slower</button>
          <button @click="accelerate" class="speed-btn fast">🔺 Faster</button>
        </div>
      </div>

      <!-- Fuel gauge -->
      <div class="fuel-section">
        <div class="fuel-label">⛽ Fuel Level</div>
        <div class="fuel-gauge">
          <div class="fuel-bar" :style="{ width: fuel + '%' }"></div>
        </div>
        <div class="fuel-value">{{ fuel }}%</div>
        <div class="fuel-controls">
          <button @click="adjustFuel(-10)" class="fuel-btn">-10%</button>
          <button @click="adjustFuel(10)" class="fuel-btn">+10%</button>
        </div>
      </div>

      <!-- Quick actions - car-sized buttons -->
      <div class="quick-actions">
        <button class="action-btn nav">🗺️ Navigation</button>
        <button class="action-btn music">🎵 Music</button>
        <button class="action-btn phone">📞 Phone</button>
        <button class="action-btn settings">⚙️ Settings</button>
      </div>

      <!-- Vehicle info -->
      <div class="vehicle-info">
        <div class="info-item">
          <div class="info-label">Odometer</div>
          <div class="info-value">45,230 km</div>
        </div>
        <div class="info-item">
          <div class="info-label">Range</div>
          <div class="info-value">520 km</div>
        </div>
        <div class="info-item">
          <div class="info-label">Battery</div>
          <div class="info-value">82%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.car-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.car-display {
  width: 100%;
  max-width: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  padding: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.car-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.time-display {
  text-align: left;
}

.time {
  font-size: 4rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 10px;
}

.date {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.weather-display {
  display: flex;
  align-items: center;
  gap: 15px;
}

.temperature {
  font-size: 3rem;
  font-weight: 600;
  color: #ffffff;
}

.weather-icon {
  font-size: 3rem;
}

.speedometer-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
}

.speed-container {
  margin-bottom: 30px;
}

.speed-value {
  font-size: 8rem;
  font-weight: 800;
  color: #00ff88;
  line-height: 1;
  text-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
}

.speed-unit {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  margin-top: -10px;
}

.speed-controls {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.speed-btn {
  padding: 20px 40px;
  font-size: 1.5rem;
  font-weight: 700;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;
}

.speed-btn.slow {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.speed-btn.fast {
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  color: #1a1a2e;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.4);
}

.speed-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.speed-btn:active {
  transform: translateY(0);
}

.fuel-section {
  margin-bottom: 40px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
}

.fuel-label {
  font-size: 1.8rem;
  color: white;
  font-weight: 600;
  margin-bottom: 15px;
}

.fuel-gauge {
  width: 100%;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 15px;
}

.fuel-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b 0%, #ffe66d 50%, #00ff88 100%);
  transition: width 0.3s ease;
  border-radius: 20px;
}

.fuel-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffe66d;
  text-align: center;
  margin-bottom: 20px;
}

.fuel-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.fuel-btn {
  padding: 15px 30px;
  font-size: 1.2rem;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.fuel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.action-btn {
  padding: 40px 30px;
  font-size: 2rem;
  font-weight: 700;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 160px;
}

.action-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.action-btn.nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-btn.music {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.action-btn.phone {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.action-btn.settings {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.vehicle-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.info-item {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  text-align: center;
}

.info-label {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  margin-bottom: 8px;
}

.info-value {
  font-size: 1.8rem;
  color: white;
  font-weight: 700;
}

/* Dark mode support */
.dark .car-page {
  background: linear-gradient(135deg, #0a0a14 0%, #0d0e1e 50%, #0a1929 100%);
}

.dark .car-display {
  background: rgba(0, 0, 0, 0.8);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .car-page {
    padding: 10px;
  }

  .car-display {
    padding: 20px;
    border-radius: 20px;
  }

  .time {
    font-size: 2.5rem;
  }

  .date {
    font-size: 1rem;
  }

  .temperature {
    font-size: 2rem;
  }

  .weather-icon {
    font-size: 2rem;
  }

  .speed-value {
    font-size: 5rem;
  }

  .speed-unit {
    font-size: 1.2rem;
  }

  .speed-controls {
    flex-direction: column;
    gap: 10px;
  }

  .speed-btn {
    padding: 15px 30px;
    font-size: 1.2rem;
    min-width: 100%;
  }

  .fuel-label {
    font-size: 1.3rem;
  }

  .fuel-value {
    font-size: 1.8rem;
  }

  .quick-actions {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .action-btn {
    padding: 30px 20px;
    font-size: 1.5rem;
    min-height: 120px;
  }

  .vehicle-info {
    grid-template-columns: 1fr;
  }
}
</style>
