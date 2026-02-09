<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { clicksRepository } from '../../repositories/clicks.repository'
import { useAudio } from '@/composables/useAudio'

const honkCount = ref(0)
const isLoading = ref(false)
const isMigrating = ref(false)
const currentMessage = ref('Honk!')
// Start in center-right position for better visibility
const goosePosition = ref({ x: 0, y: 0 }) // Will be set on mount to centered position
const gooseElement = ref<HTMLElement | null>(null)
const { playHonk } = useAudio()

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

  // Play honk sound using useAudio composable
  playHonk()

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

  // Set initial position to random location
  const setInitialPosition = () => {
    const dimensions = getGooseDimensions()
    const safeMargin = 20
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Calculate maximum x and y positions
    const maxX = viewportWidth - dimensions.width - safeMargin
    const maxY = viewportHeight - dimensions.height - safeMargin

    // Generate random position within bounds
    const startX = Math.floor(Math.random() * (maxX - safeMargin) + safeMargin)
    const startY = Math.floor(Math.random() * (maxY - safeMargin) + safeMargin)

    goosePosition.value = { x: startX, y: startY }
  }

  // Set initial position on mount
  setInitialPosition()

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
        🪿
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
              transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.digital-goose:hover {
  transform: scale(1.15) translateY(-5px);
}

.digital-goose:hover .goose-container {
  box-shadow: 0 8px 30px rgba(255, 159, 64, 0.4);
  border-color: rgba(255, 159, 64, 0.4);
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
  background: linear-gradient(135deg, rgba(66, 153, 225, 0.95), rgba(49, 130, 206, 0.95));
  border-radius: 50px;
  padding: 10px 15px;
  box-shadow: 0 4px 20px rgba(66, 153, 225, 0.3);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  min-width: 140px;
  transition: all 0.3s ease;
}

.dark .goose-container {
  background: linear-gradient(135deg, rgba(49, 130, 206, 0.95), rgba(30, 64, 175, 0.95));
  border: 2px solid rgba(129, 140, 248, 0.3);
}

.goose-emoji {
  font-size: 48px;
  text-align: center;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  line-height: 1;
  background: rgba(255, 255, 255, 0.15);
  width: 60px;
  height: 60px;
  margin-left: auto;
  margin-right: auto;
  transition: transform 0.2s ease;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.digital-goose:hover .goose-emoji {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.goose-message {
  color: #ffffff;
  font-size: 11px;
  text-align: center;
  margin-bottom: 6px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  line-height: 1.2;
}

.honk-counter {
  color: #fffbeb;
  font-size: 10px;
  text-align: center;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.2);
  padding: 3px 8px;
  border-radius: 12px;
  display: inline-block;
}

.dark .honk-counter {
  color: #fef3c7;
  background: rgba(0, 0, 0, 0.3);
}
</style>
