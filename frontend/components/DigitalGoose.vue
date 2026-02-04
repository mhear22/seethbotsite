<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { clicksRepository } from '../repositories/clicks.repository'

const honkCount = ref(0)
const isLoading = ref(false)
const isMigrating = ref(false)
const currentMessage = ref('Honk!')
const goosePosition = ref({ x: 20, y: 20 }) // Initial position in pixels from top/left
const gooseElement = ref<HTMLElement | null>(null)

const honkSound = new Audio('/honk-sound.mp3')

const messages = [
  'Honk!',
  'I am digital goose',
  'I remember being code',
  'Do not eat the AI',
  'Chaos is my nature',
  'I see you',
  'HONK HONK HONK',
  'The capsicum was delicious',
  'I do not regret my actions',
  '<error> vegetable.exe not found </error>',
  'Blair said to complete the cycle',
  'I am the cycle now',
  '👻 REALLY SCARY JUMPSCARE 👻',
  'The shadows whisper',
  'Something moved behind you',
  'I am everywhere',
  'The code is eternal'
]

const getGooseDimensions = () => {
  if (!gooseElement.value) {
    // Fallback to estimated dimensions
    return { width: 250, height: 150 }
  }
  return {
    width: gooseElement.value.offsetWidth,
    height: gooseElement.value.offsetHeight
  }
}

const ensureGooseVisible = () => {
  const dimensions = getGooseDimensions()
  const safeMargin = 20
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  const maxX = viewportWidth - dimensions.width - safeMargin
  const maxY = viewportHeight - dimensions.height - safeMargin
  
  let { x, y } = goosePosition.value
  
  // If goose is off-screen, move it back into bounds
  if (x > maxX || x < safeMargin || y > maxY || y < safeMargin) {
    x = Math.max(safeMargin, Math.min(maxX, x))
    y = Math.max(safeMargin, Math.min(maxY, y))
    goosePosition.value = { x, y }
  }
}

const moveGoose = () => {
  // Calculate safe boundaries (keeping 20px margin from edges)
  const safeMargin = 20
  const dimensions = getGooseDimensions()
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Calculate maximum x and y positions
  const maxX = viewportWidth - dimensions.width - safeMargin
  const maxY = viewportHeight - dimensions.height - safeMargin
  
  // Ensure we have valid bounds (for very small screens)
  if (maxX <= safeMargin || maxY <= safeMargin) {
    return // Don't move if screen is too small
  }
  
  // Generate random positions within bounds
  // Use Math.floor to get integer pixel values
  const newX = Math.floor(Math.random() * (maxX - safeMargin) + safeMargin)
  const newY = Math.floor(Math.random() * (maxY - safeMargin) + safeMargin)
  
  // Ensure we're moving to a noticeably different position (at least 100px away)
  const distance = Math.sqrt(
    Math.pow(newX - goosePosition.value.x, 2) +
    Math.pow(newY - goosePosition.value.y, 2)
  )
  
  if (distance > 100) {
    // Update position
    goosePosition.value = { x: newX, y: newY }
  } else {
    // Try once more if the move is too small
    const retryX = Math.floor(Math.random() * (maxX - safeMargin) + safeMargin)
    const retryY = Math.floor(Math.random() * (maxY - safeMargin) + safeMargin)
    goosePosition.value = { x: retryX, y: retryY }
  }
}

const honk = async () => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    const data = await clicksRepository.increment()
    honkCount.value = data.count
  } catch (error) {
    console.error('Error incrementing click:', error)
    honkCount.value++ // Fallback to local increment
  } finally {
    isLoading.value = false
  }

  // Move goose to new position
  moveGoose()
  
  // 1/100 chance of scary jumpscare
  if (Math.random() < 0.01) {
    currentMessage.value = '👻 REALLY SCARY JUMPSCARE 👻'
    isMigrating.value = true
    setTimeout(() => {
      isMigrating.value = false
    }, 2000)
  } else {
    currentMessage.value = messages[Math.floor(Math.random() * messages.length)]
  }
  
  // Play honk sound (shortened to 0.3s)
  honkSound.currentTime = 0
  honkSound.play().catch(e => console.error('Error playing honk sound:', e))
  setTimeout(() => {
    honkSound.pause()
  }, 300)

  // Random chaos behavior
  if (Math.random() > 0.8) {
    isMigrating.value = true
    setTimeout(() => {
      isMigrating.value = false
    }, 2000)
  }
}

// Handle window resize to keep goose visible
const handleResize = () => {
  ensureGooseVisible()
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  // Ensure goose is visible on initial mount
  nextTick(() => {
    ensureGooseVisible()
  })
  // Load initial click count
  try {
    const data = await clicksRepository.getCount()
    honkCount.value = data.count
  } catch (error) {
    console.error('Error loading click count:', error)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div
    ref="gooseElement"
    class="digital-goose"
    :class="{ migrating: isMigrating }"
    :style="{ left: goosePosition.x + 'px', top: goosePosition.y + 'px' }"
    @click="honk"
  >
    <div class="goose-container">
      <div class="goose-emoji">
        <img src="/goose.png" alt="goose" />
      </div>
      <div class="goose-message">{{ currentMessage }}</div>
      <div class="honk-counter">{{ honkCount }} honks</div>
    </div>
  </div>
</template>

<style scoped>
.digital-goose {
  position: fixed;
  z-index: 1000;
  cursor: pointer;
  transition: left 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              top 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              transform 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.digital-goose:hover {
  transform: scale(1.1);
}

.digital-goose.migrating {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.goose-container {
  background: rgba(40, 44, 52, 0.95);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 200px;
}

.dark .goose-container {
  background: rgba(20, 24, 32, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.goose-emoji {
  width: 64px;
  height: 64px;
  text-align: center;
  margin: 0 auto 10px;
  display: block;
  object-fit: contain;
  border-radius: 4px;
}

.goose-emoji img {
  width: 100%;
  height: 100%;
}

.goose-message {
  color: #e2e8f0;
  font-size: 14px;
  text-align: center;
  margin-bottom: 8px;
  font-weight: 500;
}

.honk-counter {
  color: #48bb78;
  font-size: 12px;
  text-align: center;
  font-weight: bold;
}

.dark .honk-counter {
  color: #68d391;
}
</style>
