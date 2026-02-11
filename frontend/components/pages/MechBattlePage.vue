<template>
  <div class="mech-battle-page">
    <!-- Settings Modal -->
    <GameSettingsModal :is-open="isSettingsOpen" @close="isSettingsOpen = false" />

    <!-- Matchmaking View -->
    <MatchmakingView
      v-if="showMatchmaking"
      :status="matchmakingStatus"
      :error-message="matchmakingError"
      @cancel="cancelMatchmaking"
    />

    <!-- Mode Selection -->
    <div v-if="battlePhase === 'mode-select'" class="screen mode-select-screen">
      <div class="screen-content">
        <h1>Select Battle Mode</h1>
        <p class="mode-description">Choose how you want to battle</p>

        <div class="mode-options">
          <button @click="selectSinglePlayer" class="mode-btn single-player-btn">
            <div class="mode-icon">🤖</div>
            <h3>Practice vs AI</h3>
            <p>Battle against AI opponent to test your mech</p>
          </button>

          <button @click="selectMultiplayer" class="mode-btn multiplayer-btn">
            <div class="mode-icon">⚔️</div>
            <h3>Multiplayer Match</h3>
            <p>Fight against real players online</p>
            <span class="coming-soon-badge">Phase 1</span>
          </button>
        </div>

        <div class="button-group">
          <button @click="returnToBuilder" class="back-btn">Return to Builder</button>
        </div>
      </div>
    </div>

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
          <button @click="isSettingsOpen = true" class="settings-btn">Settings</button>
          <button @click="returnToBuilder" class="back-btn">Return to Builder</button>
        </div>
      </div>
    </div>

    <!-- Active Battle -->
    <div v-if="battlePhase === 'active'" class="battle-container">
      <!-- Single Player Battle -->
      <template v-if="battleMode === 'single-player'">
        <BattleCanvas
          :player-mech="battle.battleState.value.player!"
          :enemy-mech="battle.battleState.value.enemy!"
          @battle-end="handleBattleEnd"
          @damage-dealt="handleDamageDealt"
          @time-update="handleTimeUpdate"
          @hud-update="handleHudUpdate"
        />

        <BattleHUD
          :player-health="battle.playerHealth.value"
          :player-max-health="battle.playerMaxHealth.value"
          :enemy-health="battle.enemyHealth.value"
          :enemy-max-health="battle.enemyMaxHealth.value"
          :enemy-name="enemyName"
          :player-power="hudData.playerPower"
          :player-max-power="hudData.playerMaxPower"
          :jump-fuel="battle.battleState.value.player?.jumpFuel ?? 0"
          :has-jump-jets="hasJumpJets"
          :dash-cooldown="hudData.dashCooldown"
          :dash-max-cooldown="hudData.dashMaxCooldown"
          :ability-cooldown="hudData.abilityCooldown"
          :ability-max-cooldown="hudData.abilityMaxCooldown"
          :has-rack-ability="hasRackAbility"
          :ability-name="abilityName"
          :enemy-radar-x="hudData.enemyRadarX"
          :enemy-radar-y="hudData.enemyRadarY"
          :targeting="targetingState"
        />
      </template>

      <!-- Multiplayer Battle -->
      <template v-else-if="battleMode === 'multiplayer' && matchData && multiplayerPlayerMech && multiplayerOpponentMech && auth.token.value">
        <MultiplayerBattleCanvas
          :player-mech="multiplayerPlayerMech"
          :opponent-mech="multiplayerOpponentMech"
          :match-data="matchData"
          :auth-token="auth.token.value"
          @battle-end="handleMultiplayerBattleEnd"
          @opponent-disconnected="handleOpponentDisconnected"
          @damage-dealt="handleDamageDealt"
          @time-update="handleTimeUpdate"
          @hud-update="handleHudUpdate"
        />
      </template>
    </div>

    <!-- Countdown Screen (Multiplayer Only) -->
    <div v-if="battlePhase === 'countdown'" class="screen countdown-screen">
      <div class="screen-content">
        <h1 class="countdown-title">{{ countdownRemaining }}</h1>
        <p class="countdown-subtitle">Match starting...</p>
        <p class="opponent-name">VS {{ matchData?.opponentName }}</p>
      </div>
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

    <!-- Multiplayer Results Screen -->
    <MultiplayerResultsScreen
      v-if="battlePhase === 'multiplayer-results' && multiplayerMatchResult && matchData"
      :result="multiplayerMatchResult.winnerId === matchData.yourPlayerId ? 'victory' : 'defeat'"
      :opponent-name="matchData.opponentName"
      :match-time="battleTime"
      :your-stats="multiplayerMatchResult.stats"
      :opponent-stats="{
        damageDealt: 0,
        damageReceived: multiplayerMatchResult.stats.damageDealt,
        shotsHit: 0,
        shotsFired: 0,
        timeSurvived: battleTime
      }"
      @find-another-match="findAnotherMatch"
      @return-to-menu="returnToBuilder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMechBuilder } from '../../composables/useMechBuilder'
import { useMechBattle } from '../../composables/useMechBattle'
import { useKeyboardShortcuts } from '../../composables/useKeyboardShortcuts'
import { useAuth } from '../../composables/useAuth'
import BattleCanvas from '../mech/BattleCanvas.vue'
import BattleHUD from '../mech/BattleHUD.vue'
import GameSettingsModal from '../mech/GameSettingsModal.vue'
import MatchmakingView from '../mech/MatchmakingView.vue'
import MultiplayerBattleCanvas from '../mech/MultiplayerBattleCanvas.vue'
import MultiplayerResultsScreen from '../mech/MultiplayerResultsScreen.vue'
import { NetworkManager } from '../../lib/battle/NetworkManager'
import { MechEntity } from '../../lib/battle/MechEntity'
import type { MechLoadout, MatchFoundMessage, MatchEndMessage } from '@shared/types/NetworkMessages'
import * as THREE from 'three'

// Multiplayer state
const battleMode = ref<'single-player' | 'multiplayer'>('single-player')
const networkManager = new NetworkManager()
const matchmakingStatus = ref<'queued' | 'searching' | 'found' | 'error'>('searching')
const matchmakingError = ref('')
const showMatchmaking = ref(false)
const matchData = ref<MatchFoundMessage | null>(null)
const multiplayerPlayerMech = ref<MechEntity | null>(null)
const multiplayerOpponentMech = ref<MechEntity | null>(null)
const multiplayerMatchResult = ref<MatchEndMessage | null>(null)
const countdownRemaining = ref(3)

const route = useRoute()
const router = useRouter()
const builder = useMechBuilder()
const battle = useMechBattle()
const keyboardShortcuts = useKeyboardShortcuts()
const auth = useAuth()

const battlePhase = computed(() => battle.battleState.value.phase)
const battleTime = ref(0)
const isSettingsOpen = ref(false)
const hudData = reactive({
  dashCooldown: 0,
  dashMaxCooldown: 2,
  playerPower: 100,
  playerMaxPower: 100,
  abilityCooldown: 0,
  abilityMaxCooldown: 15,
  enemyRadarX: 0,
  enemyRadarY: 0,
})

const targetingState = ref({
  isTargeted: false,
  screenX: 0,
  screenY: 0,
  screenWidth: 0,
  screenHeight: 0
})

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

const hasRackAbility = computed(() => {
  return battle.battleState.value.player?.loadout.rack !== null
})

const abilityName = computed(() => {
  const rack = battle.battleState.value.player?.loadout.rack
  if (!rack) return ''
  // Extract short name from full name
  return rack.name.replace(/System|Pack|Bay|Feed/gi, '').trim().toUpperCase()
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

  // Start with mode selection
  battle.battleState.value.phase = 'mode-select'

  // Watch battle phase and disable shortcuts during active battle
  watch(battlePhase, (phase) => {
    console.log('[MechBattle] Phase changed to:', phase, '| Shortcuts enabled:', keyboardShortcuts.enabled.value)
    if (phase === 'active') {
      console.log('[MechBattle] 🔒 DISABLING keyboard shortcuts for active battle')
      keyboardShortcuts.disable()
    } else {
      console.log('[MechBattle] 🔓 ENABLING keyboard shortcuts')
      keyboardShortcuts.enable()
    }
  }, { immediate: true })
})

// Re-enable shortcuts when leaving page
onUnmounted(() => {
  console.log('[MechBattle] Component unmounted, re-enabling keyboard shortcuts')
  keyboardShortcuts.enable()

  // Disconnect from multiplayer if connected
  if (networkManager.isConnected()) {
    console.log('[MechBattle] Disconnecting from multiplayer server')
    networkManager.disconnect()
  }
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

function handleHudUpdate(data: {
  dashCooldown: number
  dashMaxCooldown: number
  playerPower: number
  playerMaxPower: number
  abilityCooldown: number
  abilityMaxCooldown: number
  enemyRadarX: number
  enemyRadarY: number
  targeting: {
    isTargeted: boolean
    screenX: number
    screenY: number
    screenWidth: number
    screenHeight: number
  }
}) {
  hudData.dashCooldown = data.dashCooldown
  hudData.dashMaxCooldown = data.dashMaxCooldown
  hudData.playerPower = data.playerPower
  hudData.playerMaxPower = data.playerMaxPower
  hudData.abilityCooldown = data.abilityCooldown
  hudData.abilityMaxCooldown = data.abilityMaxCooldown
  hudData.enemyRadarX = data.enemyRadarX
  hudData.enemyRadarY = data.enemyRadarY
  targetingState.value = data.targeting
}

function selectSinglePlayer() {
  battleMode.value = 'single-player'

  // Initialize battle with player mech
  battle.initializeBattle(builder.loadout.value, builder.totalStats.value)

  // Generate enemy mech (Phase 1: tutorial difficulty)
  battle.generateEnemy('tutorial')
}

async function selectMultiplayer() {
  battleMode.value = 'multiplayer'

  // Check authentication
  if (!auth.isAuthenticated.value || !auth.token.value) {
    matchmakingError.value = 'You must be logged in to play multiplayer'
    matchmakingStatus.value = 'error'
    showMatchmaking.value = true
    setTimeout(() => {
      showMatchmaking.value = false
      router.push({ name: 'auth', query: { mode: 'login' } })
    }, 2000)
    return
  }

  try {
    // Show matchmaking UI
    showMatchmaking.value = true
    matchmakingStatus.value = 'searching'
    matchmakingError.value = ''

    // Setup network event handlers
    setupNetworkHandlers()

    // Connect to multiplayer server
    console.log('[MechBattle] Connecting to multiplayer server...')
    await networkManager.connect(auth.token.value)
    console.log('[MechBattle] Connected! Requesting match...')

    // Convert builder loadout to network format
    // TODO: Proper conversion from builder parts to weapon/ability configs
    const loadout: MechLoadout = {
      chassisType: builder.loadout.value.core?.id || 'core-standard',
      leftWeapon: {
        type: 'autocannon',
        name: builder.loadout.value.leftArm?.name || 'Left Weapon',
        damage: 20,
        fireRate: 120,
        projectileSpeed: 50,
        energyCost: 10,
        cooldown: 500
      },
      rightWeapon: {
        type: 'laser',
        name: builder.loadout.value.rightArm?.name || 'Right Weapon',
        damage: 15,
        fireRate: 180,
        projectileSpeed: 100,
        energyCost: 8,
        cooldown: 333
      },
      ability: {
        type: 'shield',
        name: builder.loadout.value.rack?.name || 'Shield',
        duration: 3000,
        cooldown: 15000,
        energyCost: 50
      }
    }

    // Request a match
    networkManager.requestMatch(loadout)
    console.log('[MechBattle] Match requested')
  } catch (error) {
    console.error('[MechBattle] Failed to connect to multiplayer:', error)
    matchmakingStatus.value = 'error'
    matchmakingError.value = 'Failed to connect to multiplayer server'
    setTimeout(() => {
      showMatchmaking.value = false
    }, 3000)
  }
}

function cancelMatchmaking() {
  console.log('[MechBattle] Cancelling matchmaking...')
  networkManager.cancelMatchmaking()
  networkManager.disconnect()
  showMatchmaking.value = false
  battle.battleState.value.phase = 'mode-select'
}

function setupNetworkHandlers() {
  // Match found
  networkManager.on('match_found', (data: MatchFoundMessage) => {
    console.log('[MechBattle] Match found!', data)
    matchmakingStatus.value = 'found'
    matchData.value = data

    // Create player and opponent mechs for multiplayer
    createMultiplayerMechs(data)
  })

  // Match start (countdown completed)
  networkManager.on('match_start', (data: any) => {
    console.log('[MechBattle] Match starting!', data)

    // Start countdown
    battle.battleState.value.phase = 'countdown'
    showMatchmaking.value = false
    countdownRemaining.value = data.countdown || 3

    // Countdown timer
    const countdownInterval = setInterval(() => {
      countdownRemaining.value--

      if (countdownRemaining.value <= 0) {
        clearInterval(countdownInterval)
        // Start the actual battle
        battle.battleState.value.phase = 'active'
      }
    }, 1000)
  })

  // Matchmaking status updates
  networkManager.on('matchmaking_status', (data: any) => {
    console.log('[MechBattle] Matchmaking status:', data)
    if (data.status === 'queued') {
      matchmakingStatus.value = 'queued'
    }
  })

  // Errors
  networkManager.on('server_error', (data: any) => {
    console.error('[MechBattle] Server error:', data)
    matchmakingStatus.value = 'error'
    matchmakingError.value = data.message || 'An error occurred'
  })

  // Disconnection
  networkManager.on('disconnected', () => {
    console.log('[MechBattle] Disconnected from server')
    if (showMatchmaking.value) {
      matchmakingStatus.value = 'error'
      matchmakingError.value = 'Disconnected from server'
    }
  })
}

function createMultiplayerMechs(data: MatchFoundMessage) {
  // Create player mech from builder loadout
  const playerSpawnPos = new THREE.Vector3(
    data.yourSpawnPosition[0],
    data.yourSpawnPosition[1],
    data.yourSpawnPosition[2]
  )

  multiplayerPlayerMech.value = new MechEntity(
    data.yourPlayerId,
    'Your Mech',
    builder.loadout.value,
    {
      ...builder.totalStats.value,
      currentHealth: builder.totalStats.value.maxHealth
    },
    true,
    playerSpawnPos
  )

  // Create opponent mech from their loadout
  const opponentSpawnPos = new THREE.Vector3(
    data.opponentSpawnPosition[0],
    data.opponentSpawnPosition[1],
    data.opponentSpawnPosition[2]
  )

  // Convert network loadout to builder format
  const opponentBuilderLoadout: any = {
    core: { id: data.opponentLoadout.chassisType },
    leftArm: { name: data.opponentLoadout.leftWeapon.name },
    rightArm: { name: data.opponentLoadout.rightWeapon.name },
    rack: { name: data.opponentLoadout.ability.name }
  }

  const opponentStats = {
    maxHealth: 100,
    currentHealth: 100,
    armor: 50,
    firepower: 50,
    speed: 50,
    accuracy: 50,
    energy: 100
  }

  multiplayerOpponentMech.value = new MechEntity(
    data.opponentId,
    data.opponentName,
    opponentBuilderLoadout,
    opponentStats,
    false,
    opponentSpawnPos
  )
}

function handleMultiplayerBattleEnd(result: MatchEndMessage) {
  console.log('[MechBattle] Multiplayer battle ended:', result)
  multiplayerMatchResult.value = result
  battle.battleState.value.phase = 'multiplayer-results'
}

function handleOpponentDisconnected() {
  console.log('[MechBattle] Opponent disconnected - you win!')
  // Will be handled by match_end message from server
}

function findAnotherMatch() {
  // Reset state and queue for another match
  multiplayerMatchResult.value = null
  matchData.value = null
  multiplayerPlayerMech.value = null
  multiplayerOpponentMech.value = null
  battle.battleState.value.phase = 'mode-select'

  // Automatically queue for another match
  selectMultiplayer()
}

function returnToBuilder() {
  battle.resetBattle()
  router.push({ name: 'mech-builder' })
}
</script>

<style scoped>
.mech-battle-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  z-index: 1000;
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
.return-btn,
.settings-btn {
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

.settings-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

.settings-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
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

/* Mode Selection Screen */
.mode-select-screen h1 {
  color: #fff;
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
}

.mode-description {
  color: #9ca3af;
  font-size: 1.2rem;
  margin-bottom: 40px;
}

.mode-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-bottom: 40px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.mode-btn {
  background: rgba(0, 0, 0, 0.4);
  padding: 40px 30px;
  border-radius: 12px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.mode-btn:hover {
  border-color: rgba(59, 130, 246, 0.6);
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

.mode-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.mode-btn h3 {
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.mode-btn p {
  color: #9ca3af;
  font-size: 1rem;
  line-height: 1.5;
}

.coming-soon-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Countdown Screen */
.countdown-screen {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}

.countdown-title {
  color: #f59e0b;
  font-size: 8rem;
  margin-bottom: 20px;
  text-shadow: 0 0 40px rgba(245, 158, 11, 0.8);
  animation: pulse 1s ease-in-out infinite;
  font-weight: bold;
}

.countdown-subtitle {
  color: #9ca3af;
  font-size: 1.5rem;
  margin-bottom: 30px;
}

.opponent-name {
  color: #3b82f6;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
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

  .countdown-title {
    font-size: 5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .start-btn,
  .back-btn,
  .return-btn,
  .settings-btn {
    width: 100%;
  }

  .mode-options {
    grid-template-columns: 1fr;
  }
}
</style>
