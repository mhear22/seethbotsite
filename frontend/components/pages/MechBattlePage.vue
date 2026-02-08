<template>
  <div class="mech-battle-page">
    <!-- Loading State -->
    <div v-if="battlePhase === 'loading'" class="screen loading-screen">
      <div class="screen-content">
        <h2>Initializing Battle Systems...</h2>
        <div class="loading-spinner"></div>
      </div>
    </div>

    <!-- Pre-Battle Ready Screen -->
    <div v-if="battlePhase === 'ready'" class="screen ready-screen">
      <div class="screen-content">
        <h1>Ready for Combat</h1>

        <div class="mech-preview">
          <h3>Your Mech</h3>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-label">Health:</span>
              <span class="stat-value">{{ playerStats.maxHealth }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Armor:</span>
              <span class="stat-value">{{ playerStats.armor }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Firepower:</span>
              <span class="stat-value">{{ playerStats.firepower }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Speed:</span>
              <span class="stat-value">{{ playerStats.speed }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Accuracy:</span>
              <span class="stat-value">{{ playerStats.accuracy }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Energy:</span>
              <span class="stat-value">{{ playerStats.energy }}</span>
            </div>
          </div>

          <h3 style="margin-top: 30px">Enemy: {{ enemyName }}</h3>
          <div class="enemy-info">
            <p>Difficulty: <span class="difficulty-badge">Tutorial</span></p>
            <p>Prepare for combat!</p>
          </div>
        </div>

        <div class="button-group">
          <button @click="startBattle" class="start-btn">Launch Battle</button>
          <button @click="returnToBuilder" class="back-btn">Return to Builder</button>
        </div>
      </div>
    </div>

    <!-- Active Battle -->
    <div v-if="battlePhase === 'active'" class="battle-container">
      <BattleCanvas
        :player-mech="battle.battleState.value.player!"
        :enemy-mech="battle.battleState.value.enemy!"
        @battle-end="handleBattleEnd"
        @damage-dealt="handleDamageDealt"
        @time-update="handleTimeUpdate"
      />

      <BattleHUD
        :player-health="battle.playerHealth.value"
        :player-max-health="battle.playerMaxHealth.value"
        :enemy-health="battle.enemyHealth.value"
        :enemy-max-health="battle.enemyMaxHealth.value"
        :enemy-name="enemyName"
        :jump-fuel="battle.battleState.value.player?.jumpFuel ?? 0"
        :has-jump-jets="hasJumpJets"
      />
    </div>

    <!-- Victory Screen -->
    <div v-if="battlePhase === 'victory'" class="screen victory-screen">
      <div class="screen-content">
        <h1 class="victory-title">VICTORY!</h1>

        <div class="battle-stats">
          <div class="stat-row">
            <span class="stat-label">Time:</span>
            <span class="stat-value">{{ battleTime.toFixed(1) }}s</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Damage Dealt:</span>
            <span class="stat-value">{{ Math.round(battle.battleState.value.damageDealt) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Health Remaining:</span>
            <span class="stat-value">{{ Math.round(battle.playerHealth.value) }} / {{ Math.round(battle.playerMaxHealth.value) }}</span>
          </div>
          <div class="stat-row final-score">
            <span class="stat-label">Final Score:</span>
            <span class="stat-value">{{ battle.battleState.value.score }}</span>
          </div>
        </div>

        <div class="button-group">
          <button @click="returnToBuilder" class="return-btn">Return to Builder</button>
        </div>
      </div>
    </div>

    <!-- Defeat Screen -->
    <div v-if="battlePhase === 'defeat'" class="screen defeat-screen">
      <div class="screen-content">
        <h1 class="defeat-title">DEFEAT</h1>

        <div class="battle-stats">
          <div class="stat-row">
            <span class="stat-label">Time Survived:</span>
            <span class="stat-value">{{ battleTime.toFixed(1) }}s</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Damage Dealt:</span>
            <span class="stat-value">{{ Math.round(battle.battleState.value.damageDealt) }}</span>
          </div>
        </div>

        <div class="button-group">
          <button @click="returnToBuilder" class="return-btn">Return to Builder</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMechBuilder } from '../../composables/useMechBuilder'
import { useMechBattle } from '../../composables/useMechBattle'
import BattleCanvas from '../mech/BattleCanvas.vue'
import BattleHUD from '../mech/BattleHUD.vue'

const route = useRoute()
const router = useRouter()
const builder = useMechBuilder()
const battle = useMechBattle()

const battlePhase = computed(() => battle.battleState.value.phase)
const battleTime = ref(0)

const playerStats = computed(() => {
  if (!battle.battleState.value.player) {
    return { maxHealth: 0, armor: 0, firepower: 0, speed: 0, accuracy: 0, energy: 0 }
  }
  return battle.battleState.value.player.stats
})

const enemyName = computed(() => battle.battleState.value.enemy?.name ?? 'Unknown Enemy')

const hasJumpJets = computed(() => {
  return battle.battleState.value.player?.loadout.rack?.id === 'rack-jump-jets'
})

onMounted(() => {
  // Load mech from query parameter
  const buildCode = route.query.build as string
  if (buildCode) {
    const success = builder.importBuild(buildCode)
    if (!success) {
      console.error('Failed to import build')
      router.push({ name: 'mech-builder' })
      return
    }
  } else {
    // Try to use current loadout
    builder.loadFromBrowser()
  }

  // Check if loadout is complete
  if (!builder.isComplete.value) {
    console.error('Incomplete mech loadout')
    router.push({ name: 'mech-builder' })
    return
  }

  // Initialize battle with player mech
  battle.initializeBattle(builder.loadout.value, builder.totalStats.value)

  // Generate enemy mech (Phase 1: tutorial difficulty)
  battle.generateEnemy('tutorial')
})

function startBattle() {
  battle.startBattle()
}

function handleBattleEnd(result: 'victory' | 'defeat') {
  battle.endBattle(result, battleTime.value)
}

function handleDamageDealt(amount: number) {
  battle.addDamageDealt(amount)
}

function handleTimeUpdate(time: number) {
  battleTime.value = time
}

function returnToBuilder() {
  battle.resetBattle()
  router.push({ name: 'mech-builder' })
}
</script>

<style scoped>
.mech-battle-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  position: relative;
}

/* Screens */
.screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}

.screen-content {
  text-align: center;
  padding: 40px;
  max-width: 800px;
}

/* Loading Screen */
.loading-screen h2 {
  color: #fff;
  font-size: 2rem;
  margin-bottom: 30px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Ready Screen */
.ready-screen h1 {
  color: #fff;
  font-size: 3rem;
  margin-bottom: 40px;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
}

.mech-preview {
  background: rgba(0, 0, 0, 0.4);
  padding: 30px;
  border-radius: 12px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 40px;
}

.mech-preview h3 {
  color: #3b82f6;
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
}

.stat-item {
  background: rgba(59, 130, 246, 0.1);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.stat-label {
  color: #9ca3af;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 5px;
}

.stat-value {
  color: #fff;
  font-size: 1.3rem;
  font-weight: bold;
}

.enemy-info {
  margin-top: 20px;
  color: #e5e7eb;
}

.difficulty-badge {
  background: #10b981;
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.9rem;
}

/* Buttons */
.button-group {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.start-btn,
.back-btn,
.return-btn {
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

.start-btn:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
}

.back-btn,
.return-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.back-btn:hover,
.return-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Battle Container */
.battle-container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Victory Screen */
.victory-screen {
  background: linear-gradient(135deg, #065f46, #047857);
}

.victory-title {
  color: #10b981;
  font-size: 4rem;
  margin-bottom: 40px;
  text-shadow: 0 0 30px rgba(16, 185, 129, 0.8);
  animation: pulse 2s ease-in-out infinite;
}

/* Defeat Screen */
.defeat-screen {
  background: linear-gradient(135deg, #7f1d1d, #991b1b);
}

.defeat-title {
  color: #ef4444;
  font-size: 4rem;
  margin-bottom: 40px;
  text-shadow: 0 0 30px rgba(239, 68, 68, 0.8);
}

/* Battle Stats */
.battle-stats {
  background: rgba(0, 0, 0, 0.4);
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 40px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row .stat-label {
  color: #9ca3af;
  font-size: 1.1rem;
}

.stat-row .stat-value {
  color: #fff;
  font-size: 1.3rem;
  font-weight: bold;
}

.stat-row.final-score {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid rgba(59, 130, 246, 0.5);
}

.stat-row.final-score .stat-label {
  color: #3b82f6;
  font-size: 1.3rem;
}

.stat-row.final-score .stat-value {
  color: #60a5fa;
  font-size: 2rem;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .ready-screen h1,
  .victory-title,
  .defeat-title {
    font-size: 2.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .start-btn,
  .back-btn,
  .return-btn {
    width: 100%;
  }
}
</style>
