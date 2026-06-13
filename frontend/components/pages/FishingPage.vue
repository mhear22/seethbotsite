<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFishingGame, baitTypes, rarityMeta, type FishUserData } from '../../composables/useFishingGame'
import { useFishingScene } from '../../composables/useFishingScene'
import { useFishingAudio } from '../../composables/useFishingAudio'
import FishingUI from '../fishing/FishingUI.vue'
import FishingStats from '../fishing/FishingStats.vue'
import FishingReelOverlay from '../fishing/FishingReelOverlay.vue'
import FishingCatchCard from '../fishing/FishingCatchCard.vue'
import FishingBestiary from '../fishing/FishingBestiary.vue'
import FishingShop from '../fishing/FishingShop.vue'
import FishingPointsFloat from '../fishing/FishingPointsFloat.vue'

// Game logic
const game = useFishingGame()
const scene = useFishingScene()
const audio = useFishingAudio()

// Scene container
const container = ref<HTMLElement | null>(null)

// Reduced-motion preference
const reducedMotion = ref(false)

// Feedback state
const showBite = ref(false)
const edgeFlash = ref(false)
const showCatchCard = ref(false)
const pointsFloats = ref<{ id: number; points: number }[]>([])
let floatId = 0
let catchCardTimer: ReturnType<typeof setTimeout> | null = null

// The fish currently being fought (kept so we can resolve scene effects)
let activeFishItem: any = null

// Computed for UI
const showWaiting = computed(() => game.gameActive.value && !game.isStruggling.value)
const rarityColor = computed(() =>
  game.lastCatch.value ? rarityMeta[game.lastCatch.value.rarity].color : '#38bdf8'
)
const activeFishName = computed(() =>
  activeFishItem ? (activeFishItem.userData as FishUserData).name : 'Fish'
)
const activeRarityColor = computed(() => {
  if (!activeFishItem) return '#38bdf8'
  return rarityMeta[(activeFishItem.userData as FishUserData).rarity].color
})

// Start the fishing game
const startGame = () => {
  if (!game.gameActive.value) {
    castLine()
  }
}

// Cast the fishing line
const castLine = () => {
  game.gameActive.value = true
  game.consumeBaitOnCast()
  audio.play('cast')

  scene.castLine(
    game.selectedDepth.value,
    onFishCaught,
    onMissedCatch,
    game.selectedBait.value.attractsDepth,
    game.catchChanceBonus.value
  )
}

// Trigger the brief pre-struggle telegraph (bobber twitch + edge flash + bite blip)
const playBiteTelegraph = (onReady: () => void) => {
  audio.play('bite')
  showBite.value = true
  if (!reducedMotion.value) {
    edgeFlash.value = true
    setTimeout(() => { edgeFlash.value = false }, 320)
  }
  const delay = reducedMotion.value ? 120 : 520
  setTimeout(() => {
    showBite.value = false
    onReady()
  }, delay)
}

// Handle fish caught (hooked)
const onFishCaught = (fishItem: any, fishData: FishUserData) => {
  activeFishItem = fishItem
  playBiteTelegraph(() => {
    if (game.reelMode.value === 'tension') {
      game.startTensionGame(
        fishData,
        (won) => {
          if (won) completeCatch(fishItem, fishData)
          else fishEscapes(fishItem)
        },
        (intensity) => scene.shakeHook(fishItem, intensity)
      )
    } else {
      game.startStruggle(fishData)
      startStruggleMiniGame(fishItem, fishData)
    }
  })
}

// Handle missed catch
const onMissedCatch = () => {
  scene.reelIn(2)
  setTimeout(() => {
    game.gameActive.value = false
  }, 1000)
}

// Easy / masher struggle loop (fish fights back over time)
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
      completeCatch(fishItem, fishData)
      return
    }

    // Check lose condition
    if (game.struggleTimeRemaining.value <= 0) {
      fishEscapes(fishItem)
      return
    }

    // Animate fish struggling (shake/pull)
    scene.shakeHook(fishItem)

    requestAnimationFrame(struggleLoop)
  }

  struggleLoop()
}

// Spawn a floating "+N" indicator
const spawnPointsFloat = (points: number) => {
  const id = ++floatId
  pointsFloats.value.push({ id, points })
  setTimeout(() => {
    pointsFloats.value = pointsFloats.value.filter(f => f.id !== id)
  }, 1200)
}

// Complete the catch
const completeCatch = (fishItem: any, fishData: FishUserData) => {
  game.completeCatch(fishData)
  audio.play('catch')

  if (game.lastCatch.value) spawnPointsFloat(game.lastCatch.value.points)

  // Show the result card briefly
  showCatchCard.value = true
  if (catchCardTimer) clearTimeout(catchCardTimer)
  catchCardTimer = setTimeout(() => { showCatchCard.value = false }, 2600)

  // Remove fish and create new one
  scene.removeFish(fishItem, 2000, game.selectedDepth.value)

  // Reel in
  scene.resetHookPosition()
  scene.reelIn(2)
  activeFishItem = null

  setTimeout(() => {
    game.gameActive.value = false
  }, 1000)
}

// Fish escapes
const fishEscapes = (fishItem: any) => {
  game.fishEscapes()
  audio.play('escape')

  // Fish swims away (respawn in the current zone)
  scene.animateFishEscape(fishItem, game.selectedDepth.value)

  scene.resetHookPosition()
  scene.reelIn(2)
  activeFishItem = null

  setTimeout(() => {
    game.gameActive.value = false
  }, 1000)
}

// Reel input from the on-screen button
const onReelInput = (active: boolean) => {
  game.reel(active)
}

// Handle keyboard input
const handleKeyDown = (e: KeyboardEvent) => {
  // Guard against triggering during text input
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return
  }

  if (!game.isStruggling.value) return

  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault()

    if (game.reelMode.value === 'tension') {
      if (!e.repeat) game.reel(true)
    } else {
      const pressed = game.handleStruggleKeyPress()
      if (pressed) {
        audio.play('press')
        scene.pulseHook()
      }
    }
  }
}

const handleKeyUp = (e: KeyboardEvent) => {
  if ((e.key === ' ' || e.code === 'Space') && game.reelMode.value === 'tension') {
    game.reel(false)
  }
}

// Toggle reel mode (disabled while a game is active)
const toggleReelMode = () => {
  if (game.gameActive.value) return
  game.reelMode.value = game.reelMode.value === 'tension' ? 'easy' : 'tension'
}

// Lifecycle
onMounted(() => {
  scene.initThreeJS(container)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  if (typeof window !== 'undefined' && window.matchMedia) {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (catchCardTimer) clearTimeout(catchCardTimer)
  game.stopTensionGame()
  scene.cleanup()
  game.updateHighScore()
  game.saveData()
})
</script>

<template>
  <div class="fishing-page">
    <!-- Screen-edge flash a beat before the struggle overlay opens -->
    <div v-if="edgeFlash" class="edge-flash"></div>

    <FishingUI
      :score="game.score.value"
      :combo-count="game.comboCount.value"
      :combo-multiplier="game.comboMultiplier.value"
      :max-combo="game.maxCombo.value"
      :show-waiting="showWaiting"
      :is-struggling="game.isStruggling.value && game.reelMode.value === 'easy'"
      :struggle-progress="game.struggleProgress.value"
      :struggle-time-remaining="game.struggleTimeRemaining.value"
      :current-presses="game.currentPresses.value"
      :required-presses="game.requiredPresses.value"
      :fish-strength="game.fishStrength.value"
    />

    <!-- Tension reeling overlay -->
    <FishingReelOverlay
      v-if="game.isStruggling.value && game.reelMode.value === 'tension'"
      :tension="game.tension.value"
      :max-tension="game.maxTension.value"
      :safe-band-low="game.safeBandLow.value"
      :safe-band-high="game.safeBandHigh.value"
      :distance="game.distance.value"
      :reel-active="game.reelActive.value"
      :fish-name="activeFishName"
      :rarity-color="activeRarityColor"
      :show-bite="showBite"
      :reduced-motion="reducedMotion"
      @reel="onReelInput"
    />

    <!-- Catch result card + points float -->
    <FishingCatchCard
      :last-catch="showCatchCard ? game.lastCatch.value : null"
      :reduced-motion="reducedMotion"
    />
    <FishingPointsFloat :floats="pointsFloats" :reduced-motion="reducedMotion" />

    <div class="fishing-container">
      <div ref="container" class="game-container">
        <!-- THREE.js canvas will be inserted here -->
        <!-- Bite telegraph flash inside the tank -->
        <transition name="bite-tank">
          <div v-if="showBite" class="tank-bite">🐟 BITE!</div>
        </transition>
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

      <!-- Mode + mute toggles -->
      <div class="toggle-row">
        <button
          class="toggle-btn"
          :disabled="game.gameActive.value"
          @click="toggleReelMode"
          :title="game.gameActive.value ? 'Cannot change mode while fishing' : 'Switch reeling mode'"
        >
          Reel Mode:
          <strong>{{ game.reelMode.value === 'tension' ? '🎚️ Tension' : '⚡ Easy (masher)' }}</strong>
        </button>
        <button class="toggle-btn" @click="audio.toggleMute" :title="audio.muted.value ? 'Unmute' : 'Mute'">
          {{ audio.muted.value ? '🔇 Muted' : '🔊 Sound' }}
        </button>
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

    <!-- Upgrade shop -->
    <FishingShop
      :currency="game.currency.value"
      :levels="game.upgradeLevels.value"
      :bait-inventory="game.baitInventory.value"
      :next-upgrade-tier="game.nextUpgradeTier"
      @buy-upgrade="game.buyUpgrade"
      @buy-bait="game.buyBait"
    />

    <!-- Bestiary / collection log -->
    <FishingBestiary
      :bestiary="game.bestiary.value"
      :completion-percent="game.completionPercent.value"
      :best-score="game.bestScore.value"
      :best-combo="game.bestCombo.value"
      :total-fish-caught="game.totalFishCaught.value"
      :heaviest-catch="game.heaviestCatch.value"
    />

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

/* Screen-edge flash before the struggle overlay */
.edge-flash {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1200;
  box-shadow: inset 0 0 120px 30px rgba(253, 224, 71, 0.7);
  animation: edgePulse 0.32s ease-out;
}

@keyframes edgePulse {
  0% { opacity: 0; }
  40% { opacity: 1; }
  100% { opacity: 0; }
}

.tank-bite {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(253, 224, 71, 0.95);
  color: #1e293b;
  font-weight: 900;
  font-size: 18px;
  padding: 6px 16px;
  border-radius: 20px;
  z-index: 12;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.bite-tank-enter-active { animation: tankBite 0.3s ease-out; }
.bite-tank-leave-active { transition: opacity 0.2s; }
.bite-tank-leave-to { opacity: 0; }

@keyframes tankBite {
  0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
  60% { transform: translateX(-50%) scale(1.15); opacity: 1; }
  100% { transform: translateX(-50%) scale(1); }
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

.toggle-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.toggle-btn {
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.18);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.toggle-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.toggle-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.toggle-btn strong {
  margin-left: 6px;
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

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .edge-flash,
  .tank-bite,
  .bite-tank-enter-active {
    animation: none !important;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .fishing-controls {
    grid-template-columns: 1fr;
  }
}
</style>
