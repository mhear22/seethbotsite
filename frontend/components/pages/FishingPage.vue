<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFishingGame, baitTypes, type FishUserData } from '../../composables/useFishingGame'
import { useFishingScene } from '../../composables/useFishingScene'
import FishingUI from '../fishing/FishingUI.vue'
import FishingStats from '../fishing/FishingStats.vue'

// Game logic
const game = useFishingGame()
const scene = useFishingScene()

// Scene container
const container = ref<HTMLElement | null>(null)

// Computed for UI
const showWaiting = computed(() => game.gameActive.value && !game.isStruggling.value)

// Start the fishing game
const startGame = () => {
  if (!game.gameActive.value) {
    castLine()
  }
}

// Cast the fishing line
const castLine = () => {
  game.gameActive.value = true

  scene.castLine(
    game.selectedDepth.value,
    onFishCaught,
    onMissedCatch,
    game.selectedBait.value.attractsDepth
  )
}

// Handle fish caught
const onFishCaught = (fishItem: any, fishData: FishUserData) => {
  game.startStruggle(fishData)
  startStruggleMiniGame(fishItem, fishData)
}

// Handle missed catch
const onMissedCatch = () => {
  scene.reelIn(2)
  setTimeout(() => {
    game.gameActive.value = false
  }, 1000)
}

// Struggle mini-game loop
const startStruggleMiniGame = (fishItem: any, fishData: FishUserData) => {
  const struggleStartTime = Date.now()
  const maxDuration = game.struggleTimeRemaining.value * 1000

  const struggleLoop = () => {
    if (!game.isStruggling.value) return

    const elapsed = Date.now() - struggleStartTime
    game.struggleTimeRemaining.value = Math.max(0, (maxDuration - elapsed) / 1000)

    // Fish fights back - decreases progress over time
    game.struggleProgress.value = Math.max(0, game.struggleProgress.value - 0.5)

    // Check win condition
    if (game.struggleProgress.value >= 100 || game.currentPresses.value >= game.requiredPresses.value) {
      // Success! Catch the fish
      completeCatch(fishItem, fishData)
      return
    }

    // Check lose condition
    if (game.struggleTimeRemaining.value <= 0) {
      // Fish escapes!
      fishEscapes(fishItem)
      return
    }

    // Animate fish struggling (shake/pull)
    scene.shakeHook(fishItem)

    requestAnimationFrame(struggleLoop)
  }

  struggleLoop()
}

// Complete the catch
const completeCatch = (fishItem: any, fishData: FishUserData) => {
  game.completeCatch(fishData)

  // Remove fish and create new one
  scene.removeFish(fishItem, 2000, game.selectedDepth.value)

  // Reel in
  scene.resetHookPosition()
  scene.reelIn(2)

  setTimeout(() => {
    game.gameActive.value = false
  }, 1000)
}

// Fish escapes
const fishEscapes = (fishItem: any) => {
  game.fishEscapes()

  // Fish swims away
  scene.animateFishEscape(fishItem)

  scene.resetHookPosition()
  scene.reelIn(2)

  setTimeout(() => {
    game.gameActive.value = false
  }, 1000)
}

// Handle keyboard input for struggle
const handleStruggleKeyPress = (e: KeyboardEvent) => {
  // Guard against triggering during text input
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return
  }

  if (!game.isStruggling.value) return

  // Spacebar for struggle
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault()

    const pressed = game.handleStruggleKeyPress()
    if (pressed) {
      // Visual feedback - pulse hook
      scene.pulseHook()
    }
  }
}

// Lifecycle
onMounted(() => {
  scene.initThreeJS(container)
  window.addEventListener('keydown', handleStruggleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleStruggleKeyPress)
  scene.cleanup()
  game.updateHighScore()
})
</script>

<template>
  <div class="fishing-page">
    <FishingUI
      :score="game.score.value"
      :combo-count="game.comboCount.value"
      :combo-multiplier="game.comboMultiplier.value"
      :max-combo="game.maxCombo.value"
      :show-waiting="showWaiting"
      :is-struggling="game.isStruggling.value"
      :struggle-progress="game.struggleProgress.value"
      :struggle-time-remaining="game.struggleTimeRemaining.value"
      :current-presses="game.currentPresses.value"
      :required-presses="game.requiredPresses.value"
      :fish-strength="game.fishStrength.value"
    />

    <div class="fishing-container">
      <div ref="container" class="game-container">
        <!-- THREE.js canvas will be inserted here -->
      </div>

      <FishingStats
        :score="game.score.value"
        :caught-fish="game.caughtFish.value"
        :combo-count="game.comboCount.value"
        :combo-multiplier="game.comboMultiplier.value"
        :max-combo="game.maxCombo.value"
      />

      <!-- Fishing Controls -->
      <div class="fishing-controls">
        <!-- Depth Selection -->
        <div class="depth-selector">
          <h3>🌊 Depth</h3>
          <div class="depth-buttons">
            <button
              v-for="depth in ['shallow', 'medium', 'deep']"
              :key="depth"
              @click="game.selectedDepth.value = depth as 'shallow' | 'medium' | 'deep'"
              :class="['depth-btn', { active: game.selectedDepth.value === depth }]"
              :disabled="game.gameActive.value"
            >
              {{ depth.charAt(0).toUpperCase() + depth.slice(1) }}
            </button>
          </div>
        </div>

        <!-- Bait Selection -->
        <div class="bait-selector">
          <h3>🎣 Bait</h3>
          <div class="bait-buttons">
            <button
              v-for="bait in baitTypes"
              :key="bait.id"
              @click="game.selectBait(bait)"
              :class="['bait-btn', { active: game.selectedBait.value.id === bait.id }]"
              :disabled="game.gameActive.value || (game.baitInventory.value[bait.id] === 0 && bait.cost > 0)"
            >
              <span class="bait-icon">{{ bait.icon }}</span>
              <span class="bait-name">{{ bait.name }}</span>
              <span v-if="bait.cost > 0" class="bait-count">
                {{ game.baitInventory.value[bait.id] }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="game-controls">
        <button
          @click="startGame"
          :disabled="game.gameActive.value"
          class="cast-button"
          :class="{ active: game.gameActive.value }"
        >
          {{ game.gameActive.value ? '🎣 Fishing...' : '🎣 Cast Line' }}
        </button>
      </div>
    </div>

    <div class="caught-fish">
      <h2>Caught Fish 🐟</h2>
      <div v-if="game.caughtFish.value.length === 0" class="empty-catch">
        No fish caught yet. Cast your line!
      </div>
      <div v-else class="fish-list">
        <div v-for="(fish, index) in game.caughtFish.value" :key="index" class="fish-item">
          🐟 {{ fish }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fishing-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.fishing-container {
  max-width: 800px;
  margin: 0 auto 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.game-container {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background: #0077be;
  margin-bottom: 20px;
}

.fishing-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.depth-selector h3,
.bait-selector h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: white;
  text-align: center;
}

.depth-buttons,
.bait-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.depth-btn,
.bait-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.depth-btn:hover:not(:disabled),
.bait-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.depth-btn.active,
.bait-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.depth-btn:disabled,
.bait-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bait-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 80px;
}

.bait-icon {
  font-size: 1.5rem;
}

.bait-name {
  font-size: 0.9rem;
}

.bait-count {
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
}

.game-controls {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.cast-button {
  padding: 16px 40px;
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.cast-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.cast-button:active:not(:disabled) {
  transform: translateY(0);
}

.cast-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cast-button.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.caught-fish {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.caught-fish h2 {
  margin: 0 0 15px 0;
  color: white;
  text-align: center;
  font-size: 1.5rem;
}

.empty-catch {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  padding: 20px;
}

.fish-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.fish-item {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Dark mode support */
.dark .fishing-page {
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
}

.dark .fishing-container,
.dark .caught-fish {
  background: rgba(45, 55, 72, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .caught-fish h2 {
  color: #e2e8f0;
}

.dark .empty-catch {
  color: #a0aec0;
}

.dark .fish-item {
  background: rgba(255, 107, 157, 0.2);
  border-color: rgba(255, 107, 157, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .fishing-controls {
    grid-template-columns: 1fr;
  }
}
</style>
