<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface GameRelease {
  title: string
  game: string
  date: Date
  description: string
  emoji: string
  image: string
}

// Real release dates
const releases: GameRelease[] = [
  {
    title: 'New Mewgenics',
    game: 'new-mewgenics',
    date: new Date('2026-02-10T00:00:00Z'),
    description: 'The next generation of Pokémon games',
    emoji: '🎮',
    image: 'https://cdn-icons-png.flaticon.com/512/retro-game-pad.png'
  },
  {
    title: 'Slay → Spire 2',
    game: 'slay-the-spire-2',
    date: new Date('2026-03-15T00:00:00Z'),
    description: 'The highly anticipated sequel returns',
    emoji: '🗡️',
    image: 'https://cdn-icons-png.flaticon.com/512/joystick.png'
  },
  {
    title: 'Tomodachi Life: Living in Dream',
    game: 'tomodachi-life',
    date: new Date('2026-04-16T00:00:00Z'),
    description: 'Continue your cozy life as a cat in this cozy sequel',
    emoji: '🐱',
    image: 'https://cdn-icons-png.flaticon.com/512/cat-face.png'
  },
  {
    title: 'The Heat Death of Universe',
    game: 'heat-death-of-universe',
    date: new Date('12006-01-01T00:00:00Z'),
    description: 'The universe faces its ultimate fate in ~10,000 years',
    emoji: '🌌',
    image: 'https://cdn-icons-png.flaticon.com/512/sun.png'
  }
]

const currentTime = ref(new Date())
let updateInterval: number | null = null

onMounted(() => {
  // Update countdown every second
  updateInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

const getTimeUntil = (date: Date) => {
  const diff = date.getTime() - currentTime.value.getTime()
  
  if (diff <= 0) {
    return { released: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return { released: false, days, hours, minutes, seconds }
}

const formatTime = (time: number) => {
  return time.toString().padStart(2, '0')
}

const sortedReleases = computed(() => {
  return [...releases].sort((a, b) => a.date.getTime() - b.date.getTime())
})
</script>

<template>
  <div class="countdown-page">
    <div class="countdown-header">
      <h1>🎮 Game Release Countdowns</h1>
      <p class="subtitle">Time until your most anticipated games!</p>
    </div>

    <div class="countdown-grid">
      <div v-for="release in sortedReleases" :key="release.game" class="countdown-card" :class="{ 'released': getTimeUntil(release.date).released }">
        <div class="game-image">
          <img :src="release.image" :alt="release.title" />
          <div class="game-emoji">{{ release.emoji }}</div>
        </div>
        <div class="game-info">
          <h3 class="game-title">{{ release.title }}</h3>
          <p class="game-description">{{ release.description }}</p>
          <p class="release-date">Release: {{ release.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}</p>
        </div>
        <div class="countdown-display">
          <div v-if="getTimeUntil(release.date).released" class="released-badge">
            ✨ Released! ✨
          </div>
          <div v-else class="timer">
            <div class="time-unit">
              <span class="time-value">{{ formatTime(getTimeUntil(release.date).days) }}</span>
              <span class="time-label">Days</span>
            </div>
            <div class="time-unit">
              <span class="time-value">{{ formatTime(getTimeUntil(release.date).hours) }}</span>
              <span class="time-label">Hours</span>
            </div>
            <div class="time-unit">
              <span class="time-value">{{ formatTime(getTimeUntil(release.date).minutes) }}</span>
              <span class="time-label">Minutes</span>
            </div>
            <div class="time-unit">
              <span class="time-value">{{ formatTime(getTimeUntil(release.date).seconds) }}</span>
              <span class="time-label">Seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-note">
      <p>📌 <strong>Real Release Dates:</strong></p>
      <p>New Mewgenics - February 10, 2026</p>
      <p>Slay → Spire 2 - March 15, 2026</p>
      <p>Tomodachi Life - April 16, 2026</p>
      <p>The Heat Death of Universe - ~10,000 years from now!</p>
    </div>
  </div>
</template>

<style scoped>
.countdown-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.countdown-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.countdown-header h1 {
  font-size: 2.5rem;
  color: #ff6b9d;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #ff6b9d, #ff8a80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.countdown-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}

.countdown-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.countdown-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
}

.countdown-card.released {
  opacity: 0.7;
  transform: scale(0.98);
}

.game-image {
  position: relative;
  margin-bottom: 15px;
  border-radius: 15px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.game-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.game-emoji {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 48px;
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.3));
}

.game-info {
  margin-bottom: 15px;
}

.game-title {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.game-description {
  color: #666;
  font-size: 0.95rem;
  margin: 0 0 5px 0;
  line-height: 1.5;
}

.release-date {
  color: #999;
  font-size: 0.85rem;
  margin: 0 0 15px 0;
  font-style: italic;
}

.countdown-display {
  text-align: center;
  padding: 15px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 15px;
  border: 2px solid rgba(255, 107, 157, 0.2);
}

.released-badge {
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(45deg, #90EE90, #32CD32);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(144, 238, 144, 0.3);
}

.timer {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.time-unit:hover {
  transform: scale(1.05);
}

.time-value {
  font-size: 2rem;
  font-weight: bold;
  color: #ff6b9d;
  line-height: 1;
  font-family: 'Courier New', monospace;
}

.time-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 5px;
}

.footer-note {
  text-align: center;
  margin-top: 60px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
}

.footer-note p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 768px) {
  .countdown-grid {
    grid-template-columns: 1fr;
  }
  
  .game-image {
    height: 80px;
  }
  
  .time-value {
    font-size: 1.5rem;
  }
  
  .time-label {
    font-size: 0.65rem;
  }
  
  .game-title {
    font-size: 1.2rem;
  }
  
  .game-description {
    font-size: 0.85rem;
  }
}
</style>
