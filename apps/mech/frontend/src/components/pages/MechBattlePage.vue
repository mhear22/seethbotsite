<template>
  <div class="mech-battle-page">
    <div
      v-if="battlePhase !== 'active' && battlePhase !== 'countdown'"
      class="flow-navigation"
      role="navigation"
      aria-label="Mech flow navigation"
    >
      <button type="button" class="flow-pill action" @click="goHome">← Menu</button>
      <button type="button" class="flow-pill action" @click="returnToBuilder">Builder</button>
      <span class="flow-pill current">Battle</span>
    </div>

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

        <div class="mode-options mode-options-4">
          <button @click="selectDuel" class="mode-btn single-player-btn">
            <div class="mode-icon">🤖</div>
            <h3>Practice vs AI</h3>
            <p>Battle a single AI opponent to test your mech</p>
          </button>

          <button @click="selectSurvival" class="mode-btn survival-btn">
            <div class="mode-icon">🌊</div>
            <h3>Survival</h3>
            <p>Endless escalating waves — how long can you last?</p>
            <span v-if="survivalBestWave > 0" class="best-wave-badge">Best: Wave {{ survivalBestWave }}</span>
          </button>

          <button @click="selectMultiplayer('pvp')" class="mode-btn multiplayer-btn">
            <div class="mode-icon">⚔️</div>
            <h3>Duel (Online)</h3>
            <p>Fight against a real player 1v1</p>
            <span class="coming-soon-badge">Phase 1</span>
          </button>

          <button @click="selectMultiplayer('survival')" class="mode-btn coop-btn">
            <div class="mode-icon">🤝</div>
            <h3>Survival (Co-op)</h3>
            <p>Team up online vs escalating AI waves</p>
            <span class="coming-soon-badge coop-badge">Co-op</span>
          </button>

          <button @click="selectStoryMode" class="mode-btn story-btn">
            <div class="mode-icon">🏘️</div>
            <h3>Story Mode</h3>
            <p>Roam an open world, help (or wreck) towns, build your mech</p>
            <span class="coming-soon-badge story-badge">Campaign</span>
          </button>
        </div>

        <div class="button-group">
          <button @click="returnToBuilder" class="back-btn">Return to Builder</button>
        </div>
      </div>
    </div>

    <!-- Map Selection (Single Player Only) -->
    <div v-if="battlePhase === 'map-select'" class="screen map-select-screen">
      <div class="screen-content">
        <h1>Select Arena</h1>
        <p class="mode-description">Choose your battleground</p>

        <div class="map-select-layout">
          <!-- Map List -->
          <div class="map-list">
            <button
              v-for="map in availableMaps"
              :key="map.id"
              @click="selectMap(map.id)"
              class="map-btn"
              :class="{ 'selected': selectedMapId === map.id }"
            >
              <div class="map-icon">{{ getMapIcon(map.id) }}</div>
              <div class="map-info">
                <h3>{{ map.name }}</h3>
                <p class="map-size">{{ map.arena.width }}x{{ map.arena.depth }}</p>
              </div>
              <div v-if="selectedMapId === map.id" class="selected-indicator">SELECTED</div>
            </button>
          </div>

          <!-- Live Map Preview -->
          <div class="map-preview-container">
            <h3 class="preview-title">{{ selectedMap?.name || 'Select a Map' }}</h3>
            <div class="preview-wrapper">
              <MapPreview3D v-if="selectedMapId" :map-id="selectedMapId" />
            </div>
            <div class="preview-details" v-if="selectedMap">
              <div class="detail-row">
                <span class="detail-label">Dimensions:</span>
                <span class="detail-value">{{ selectedMap.arena.width }}m x {{ selectedMap.arena.depth }}m</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Obstacles:</span>
                <span class="detail-value">{{ selectedMap.staticGeometry.length }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Spawn Points:</span>
                <span class="detail-value">{{ selectedMap.spawnPoints.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- In-flow difficulty selector (wired to gameSettings.aiDifficulty) -->
        <div class="difficulty-selector">
          <span class="difficulty-selector-label">AI Difficulty:</span>
          <div class="difficulty-options">
            <button
              v-for="opt in difficultyOptions"
              :key="opt.value"
              class="difficulty-option"
              :class="[`difficulty-${opt.value}`, { active: currentDifficulty === opt.value }]"
              @click="setDifficulty(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="button-group">
          <button @click="confirmMapSelection" class="start-btn">Continue</button>
          <button @click="returnToModeSelect" class="back-btn">Back</button>
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
          <div class="versus-header">
            <span class="versus-side you">Your Mech</span>
            <span class="versus-vs">VS</span>
            <span class="versus-side them">{{ enemyName }}</span>
          </div>

          <!-- Side-by-side stat comparison with higher/lower indicators -->
          <div class="stat-compare">
            <div v-for="row in statComparison" :key="row.label" class="compare-row">
              <span class="compare-val" :class="{ better: row.mine > row.theirs, worse: row.mine < row.theirs }">
                <span class="compare-arrow" v-if="row.mine !== row.theirs">{{ row.mine > row.theirs ? '▲' : '▼' }}</span>
                {{ row.mine }}
              </span>
              <span class="compare-label">{{ row.label }}</span>
              <span class="compare-val them" :class="{ better: row.theirs > row.mine, worse: row.theirs < row.mine }">
                {{ row.theirs }}
                <span class="compare-arrow" v-if="row.mine !== row.theirs">{{ row.theirs > row.mine ? '▲' : '▼' }}</span>
              </span>
            </div>
          </div>

          <div class="enemy-info">
            <p v-if="selectedGameMode === 'survival'" class="mode-tag">Mode: <span class="difficulty-badge difficulty-hard">SURVIVAL</span></p>
            <p>Difficulty: <span class="difficulty-badge" :class="difficultyClass">{{ difficultyLabel }}</span></p>
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
          :player-mech="(battle.battleState.value.player! as MechEntity)"
          :enemy-mech="(battle.battleState.value.enemy! as MechEntity)"
          :map-id="selectedMapId"
          :ai-difficulty="activeAIDifficulty"
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
          :leg-mobility-type="legMobilityType"
          :dash-cooldown="hudData.dashCooldown"
          :dash-max-cooldown="hudData.dashMaxCooldown"
          :ability-cooldown="hudData.abilityCooldown"
          :ability-max-cooldown="hudData.abilityMaxCooldown"
          :has-rack-ability="hasRackAbility"
          :ability-name="abilityName"
          :enemy-radar-x="hudData.enemyRadarX"
          :enemy-radar-y="hudData.enemyRadarY"
          :targeting="targetingState"
          :battle-mode="battleMode2"
          :wave="survivalWave"
          :score="survivalScore"
          :best-wave="survivalBestWave"
        />

        <!-- Between-wave repair / staging overlay (survival only) -->
        <div v-if="battleMode2 === 'survival' && battle.battleState.value.betweenWaves" class="wave-transition">
          <h2>WAVE {{ survivalWave }} CLEARED</h2>
          <p>Repairing… next wave incoming</p>
        </div>
      </template>

      <!-- Multiplayer Battle -->
      <template v-else-if="battleMode === 'multiplayer' && matchData && multiplayerPlayerMech && multiplayerOpponentMech && auth.token.value">
        <MultiplayerBattleCanvas
          :player-mech="(multiplayerPlayerMech as MechEntity)"
          :opponent-mech="(multiplayerOpponentMech as MechEntity)"
          :match-data="matchData"
          :auth-token="auth.token.value"
          :existing-network-manager="networkManager"
          :best-wave="survivalBestWave"
          @battle-end="handleMultiplayerBattleEnd"
          @opponent-disconnected="handleOpponentDisconnected"
          @damage-dealt="handleDamageDealt"
          @time-update="handleTimeUpdate"
          @hud-update="handleHudUpdate"
        />

        <BattleHUD
          :player-health="multiplayerPlayerMech.stats.currentHealth"
          :player-max-health="multiplayerPlayerMech.stats.maxHealth"
          :enemy-health="multiplayerOpponentMech.stats.currentHealth"
          :enemy-max-health="multiplayerOpponentMech.stats.maxHealth"
          :enemy-name="matchData.opponentName"
          :player-power="hudData.playerPower"
          :player-max-power="hudData.playerMaxPower"
          :jump-fuel="multiplayerPlayerMech.jumpFuel"
          :has-jump-jets="hasMultiplayerJumpJets"
          :leg-mobility-type="multiplayerLegMobilityType"
          :dash-cooldown="hudData.dashCooldown"
          :dash-max-cooldown="hudData.dashMaxCooldown"
          :ability-cooldown="hudData.abilityCooldown"
          :ability-max-cooldown="hudData.abilityMaxCooldown"
          :has-rack-ability="hasMultiplayerRackAbility"
          :ability-name="multiplayerAbilityName"
          :enemy-radar-x="hudData.enemyRadarX"
          :enemy-radar-y="hudData.enemyRadarY"
          :targeting="targetingState"
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
          <div v-if="battleMode2 === 'survival'" class="stat-row">
            <span class="stat-label">Wave Reached:</span>
            <span class="stat-value">{{ survivalWave }}</span>
          </div>
          <div class="stat-row final-score">
            <span class="stat-label">Final Score:</span>
            <span class="stat-value">{{ battle.battleState.value.score }}</span>
          </div>
        </div>

        <div class="button-group">
          <button @click="rematch" class="start-btn">Rematch</button>
          <button
            v-if="nextDifficulty"
            @click="rematchHarder"
            class="settings-btn next-difficulty-btn"
          >
            Try {{ nextDifficultyLabel }} →
          </button>
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
          <div v-if="battleMode2 === 'survival'" class="stat-row">
            <span class="stat-label">Waves Cleared:</span>
            <span class="stat-value">{{ Math.max(0, survivalWave - 1) }}</span>
          </div>
          <div v-if="battleMode2 === 'survival'" class="stat-row">
            <span class="stat-label">Best Wave:</span>
            <span class="stat-value">{{ survivalBestWave }}</span>
          </div>
        </div>

        <div class="button-group">
          <button @click="rematch" class="start-btn">Try Again</button>
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
import { ref, reactive, onMounted, computed, watch, onUnmounted, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMechBuilder } from '../../composables/useMechBuilder'
import { useMechBattle } from '../../composables/useMechBattle'
import { useKeyboardShortcuts } from '../../composables/useKeyboardShortcuts'
import { useAuth } from '../../composables/useAuth'
import BattleCanvas from '../mech/BattleCanvas.vue'
import BattleHUD from '../mech/hud/BattleHUD.vue'
import GameSettingsModal from '../mech/GameSettingsModal.vue'
import { useGameSettings, type AIDifficulty } from '../../composables/useGameSettings'
import MatchmakingView from '../mech/MatchmakingView.vue'
import MultiplayerBattleCanvas from '../mech/MultiplayerBattleCanvas.vue'
import MultiplayerResultsScreen from '../mech/hud/MultiplayerResultsScreen.vue'
import MapPreview3D from '../mech/MapPreview3D.vue'
import { NetworkManager } from '../../lib/battle/NetworkManager'
import { MechEntity } from '../../lib/battle/MechEntity'
import type { MechLoadout, MatchFoundMessage, MatchEndMessage, WeaponConfig, AbilityConfig } from '@shared/types/NetworkMessages'
import { SINGLE_PLAYER_MAP_IDS, getAllMaps, getMapById } from '@shared/maps'
import type { MapDefinition } from '@shared/types/MapDefinition'
import * as THREE from 'three'

// Selected battle game-mode for single player: classic duel or escalating waves.
const selectedGameMode = ref<'duel' | 'survival'>('duel')

// Multiplayer state
const battleMode = ref<'single-player' | 'multiplayer'>('single-player')
// Desired online game mode for the current matchmaking request ('pvp' = duel).
const onlineGameMode = ref<'pvp' | 'survival'>('pvp')
const networkManager = new NetworkManager()
const matchmakingStatus = ref<'queued' | 'searching' | 'found' | 'error'>('searching')
const matchmakingError = ref('')
const showMatchmaking = ref(false)
const matchData = ref<MatchFoundMessage | null>(null)
const multiplayerPlayerMech = ref<MechEntity | null>(null)
const multiplayerOpponentMech = ref<MechEntity | null>(null)
const multiplayerMatchResult = ref<MatchEndMessage | null>(null)
const countdownRemaining = ref(3)

// Single player map selection
const selectedMapId = ref<string>(SINGLE_PLAYER_MAP_IDS[0])
const availableMaps = getAllMaps()

const selectedMap = computed(() => getMapById(selectedMapId.value))

const route = useRoute()
const router = useRouter()
const builder = useMechBuilder()
const battle = useMechBattle()
const keyboardShortcuts = useKeyboardShortcuts()
const auth = useAuth()
const gameSettings = useGameSettings()

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

const legMobilityType = computed(() => {
  return battle.battleState.value.player?.loadout.legs?.mobilityType
})

const hasMultiplayerJumpJets = computed(() => {
  return multiplayerPlayerMech.value?.loadout.rack?.id === 'rack-jump-jets'
})

const multiplayerLegMobilityType = computed(() => {
  return multiplayerPlayerMech.value?.loadout.legs?.mobilityType
})

const hasMultiplayerRackAbility = computed(() => {
  return multiplayerPlayerMech.value?.loadout.rack !== null
})

const multiplayerAbilityName = computed(() => {
  const rack = multiplayerPlayerMech.value?.loadout.rack
  if (!rack) return ''
  // Extract short name from full name
  return rack.name.replace(/System|Pack|Bay|Feed/gi, '').trim().toUpperCase()
})

// Difficulty display helpers
const difficultyLabel = computed(() => {
  const labels: Record<AIDifficulty, string> = {
    'tutorial': 'Tutorial',
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard',
    'boss': 'Boss'
  }
  return labels[gameSettings.settings.value.aiDifficulty]
})

const difficultyClass = computed(() => {
  return `difficulty-${gameSettings.settings.value.aiDifficulty}`
})

// In-flow difficulty selector (wired to gameSettings.aiDifficulty).
const difficultyOptions: { value: AIDifficulty; label: string }[] = [
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'boss', label: 'Boss' },
]

const currentDifficulty = computed(() => gameSettings.settings.value.aiDifficulty)

// AI behaviour tier actually used in battle: in survival it escalates with the
// wave (matching the enemy's stat tier); in duel it's the selected difficulty.
const activeAIDifficulty = computed<AIDifficulty>(() => {
  if (battle.battleState.value.mode === 'survival') {
    return battle.currentWaveDifficulty()
  }
  return gameSettings.settings.value.aiDifficulty
})

function setDifficulty(d: AIDifficulty) {
  gameSettings.settings.value.aiDifficulty = d
}

// --- Opponent stat comparison (your stats vs enemy.stats) for the ready screen. ---
interface StatComparisonRow {
  label: string
  mine: number
  theirs: number
}

const statComparison = computed<StatComparisonRow[]>(() => {
  const p = battle.battleState.value.player?.stats
  const e = battle.battleState.value.enemy?.stats
  if (!p || !e) return []
  return [
    { label: 'Health', mine: Math.round(p.maxHealth), theirs: Math.round(e.maxHealth) },
    { label: 'Armor', mine: Math.round(p.armor), theirs: Math.round(e.armor) },
    { label: 'Firepower', mine: Math.round(p.firepower), theirs: Math.round(e.firepower) },
    { label: 'Speed', mine: Math.round(p.speed), theirs: Math.round(e.speed) },
    { label: 'Accuracy', mine: Math.round(p.accuracy), theirs: Math.round(e.accuracy) },
    { label: 'Energy', mine: Math.round(p.energy), theirs: Math.round(e.energy) },
  ]
})

// Survival HUD passthrough.
const battleMode2 = computed(() => battle.battleState.value.mode)
const survivalWave = computed(() => battle.battleState.value.wave)
const survivalScore = computed(() => battle.battleState.value.score)
const survivalBestWave = computed(() => battle.battleState.value.bestWave)

// Next-difficulty nudge on victory (suggest the next harder tier).
const nextDifficulty = computed<AIDifficulty | null>(() => {
  const order: AIDifficulty[] = ['tutorial', 'easy', 'medium', 'hard', 'boss']
  const idx = order.indexOf(currentDifficulty.value)
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null
})

const nextDifficultyLabel = computed(() => {
  if (!nextDifficulty.value) return ''
  return difficultyOptions.find(o => o.value === nextDifficulty.value)?.label ?? ''
})

// Between-wave handling: when the battle composable stages the next wave, briefly
// pause then re-enter the active phase with a fresh, tougher enemy.
watch(() => battle.battleState.value.betweenWaves, (between) => {
  if (between) {
    // Brief repair/staging pause before the next wave begins.
    setTimeout(() => {
      battle.nextWave()
    }, 1500)
  }
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

function selectDuel() {
  battleMode.value = 'single-player'
  selectedGameMode.value = 'duel'
  // Go to map selection first
  battle.battleState.value.phase = 'map-select'
}

function selectSurvival() {
  battleMode.value = 'single-player'
  selectedGameMode.value = 'survival'
  battle.battleState.value.phase = 'map-select'
}

// Story Mode is a separate single-player campaign route; it ignores the builder
// loadout (starts from a Starter mech) and manages its own state.
function selectStoryMode() {
  router.push({ name: 'mech-story' })
}

function selectMap(mapId: string) {
  selectedMapId.value = mapId
}

function confirmMapSelection() {
  const mapDef = getMapById(selectedMapId.value)
  const playerSpawn = mapDef?.spawnPoints.find(s => s.playerSlot === 0)
  const enemySpawn = mapDef?.spawnPoints.find(s => s.playerSlot === 1)

  // Initialize battle with player mech using map spawn position
  battle.initializeBattle(
    builder.loadout.value,
    builder.totalStats.value,
    playerSpawn
  )

  if (selectedGameMode.value === 'survival') {
    // Survival: chain escalating waves from the selected base difficulty.
    battle.startSurvival(gameSettings.settings.value.aiDifficulty, enemySpawn)
  } else {
    // Duel: generate a single enemy at the selected difficulty.
    battle.battleState.value.mode = 'duel'
    battle.generateEnemy(gameSettings.settings.value.aiDifficulty, enemySpawn)
  }
}

// Re-initialize the same loadout + enemy and jump straight back into combat.
// Used by the Rematch / Try Again buttons on victory/defeat.
function rematch() {
  const mapDef = getMapById(selectedMapId.value)
  const playerSpawn = mapDef?.spawnPoints.find(s => s.playerSlot === 0)
  const enemySpawn = mapDef?.spawnPoints.find(s => s.playerSlot === 1)

  battle.initializeBattle(builder.loadout.value, builder.totalStats.value, playerSpawn)

  if (selectedGameMode.value === 'survival') {
    battle.startSurvival(gameSettings.settings.value.aiDifficulty, enemySpawn)
  } else {
    battle.battleState.value.mode = 'duel'
    battle.generateEnemy(gameSettings.settings.value.aiDifficulty, enemySpawn)
  }
  battle.startBattle()
}

// Bump to the next difficulty tier (if any) and rematch.
function rematchHarder() {
  if (nextDifficulty.value) {
    setDifficulty(nextDifficulty.value)
  }
  rematch()
}

function returnToModeSelect() {
  battle.battleState.value.phase = 'mode-select'
}

function getMapIcon(mapId: string): string {
  const icons: Record<string, string> = {
    'default_arena': '🏟️',
    'ruined_highway': '🛣️',
    'reactor_core': '⚡',
    'space_colony': '🚀',
    'mega_factory': '🏭'
  }
  return icons[mapId] || '🗺️'
}

// Helper function to convert builder arm part to network weapon config
function convertArmToWeapon(arm: any, defaultSide: 'left' | 'right'): WeaponConfig {
  if (!arm) {
    // Default fallback weapon
    return {
      type: 'autocannon',
      name: `${defaultSide === 'left' ? 'Left' : 'Right'} Weapon`,
      damage: 20,
      fireRate: 120,
      projectileSpeed: 50,
      energyCost: 10,
      cooldown: 500
    }
  }

  // Map weapon type from builder to network format
  let weaponType: WeaponConfig['type'] = 'autocannon'
  if (arm.weaponType === 'ballistic') {
    // Determine if it's autocannon, missile launcher, or railgun based on part ID
    if (arm.id.includes('missile')) {
      weaponType = 'missile_launcher'
    } else if (arm.id.includes('railgun')) {
      weaponType = 'railgun'
    } else {
      weaponType = 'autocannon'
    }
  } else if (arm.weaponType === 'energy') {
    // Determine if it's laser or plasma cannon based on part ID
    if (arm.id.includes('flame') || arm.id.includes('plasma')) {
      weaponType = 'plasma_cannon'
    } else {
      weaponType = 'laser'
    }
  } else if (arm.weaponType === 'melee') {
    weaponType = 'railgun' // Melee maps to railgun for high damage single shots
  } else if (arm.weaponType === 'support') {
    weaponType = 'laser' // Support weapons default to laser
  }

  // Convert firepower stat to damage (firepower is the damage stat)
  const damage = arm.stats?.firepower || 20

  // Convert fireRate from seconds to rounds per minute, then to cooldown in ms
  // fireRate in builder is seconds between shots
  // Network format: fireRate = rounds per minute, cooldown = ms between shots
  const fireRateSeconds = arm.fireRate || 0.5 // default 0.5s between shots
  const fireRateRPM = Math.round(60 / fireRateSeconds)
  const cooldownMs = Math.round(fireRateSeconds * 1000)

  // Projectile speed based on weapon type
  let projectileSpeed = 50
  if (weaponType === 'railgun') projectileSpeed = 150
  else if (weaponType === 'laser') projectileSpeed = 100
  else if (weaponType === 'plasma_cannon') projectileSpeed = 40
  else if (weaponType === 'missile_launcher') projectileSpeed = 30

  return {
    type: weaponType,
    name: arm.name || `${defaultSide === 'left' ? 'Left' : 'Right'} Weapon`,
    damage,
    fireRate: fireRateRPM,
    projectileSpeed,
    energyCost: arm.powerDraw || 10,
    cooldown: cooldownMs
  }
}

// Helper function to convert builder rack part to network ability config
function convertRackToAbility(rack: any): AbilityConfig {
  if (!rack) {
    // Default fallback ability
    return {
      type: 'shield',
      name: 'Shield',
      duration: 3000,
      cooldown: 15000,
      energyCost: 50
    }
  }

  // Map rack to ability type based on ID or name
  let abilityType: AbilityConfig['type'] = 'shield'

  if (rack.id.includes('smoke') || rack.id.includes('cloak')) {
    abilityType = 'cloak'
  } else if (rack.id.includes('repair') || rack.id.includes('drone')) {
    abilityType = 'repair'
  } else if (rack.id.includes('jump') || rack.id.includes('speed')) {
    abilityType = 'speed_boost'
  } else if (rack.id.includes('emp')) {
    abilityType = 'emp'
  }

  // Set ability parameters based on type
  let duration = 3000
  let cooldown = 15000
  let energyCost = 50

  switch (abilityType) {
    case 'shield':
      duration = 5000
      cooldown = 20000
      energyCost = 40
      break
    case 'speed_boost':
      duration = 4000
      cooldown = 12000
      energyCost = 30
      break
    case 'emp':
      duration = 2000
      cooldown = 25000
      energyCost = 60
      break
    case 'repair':
      duration = 10000
      cooldown = 30000
      energyCost = 50
      break
    case 'cloak':
      duration = 6000
      cooldown = 18000
      energyCost = 35
      break
  }

  return {
    type: abilityType,
    name: rack.name || 'Ability',
    duration,
    cooldown,
    energyCost
  }
}

async function selectMultiplayer(gameMode: 'pvp' | 'survival' = 'pvp') {
  battleMode.value = 'multiplayer'
  onlineGameMode.value = gameMode

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
    const loadout: MechLoadout = {
      chassisType: builder.loadout.value.core?.id || 'core-standard',
      leftWeapon: convertArmToWeapon(builder.loadout.value.leftArm, 'left'),
      rightWeapon: convertArmToWeapon(builder.loadout.value.rightArm, 'right'),
      ability: convertRackToAbility(builder.loadout.value.rack)
    }

    // Request a match (survival co-op or classic 1v1 duel).
    networkManager.requestMatch(loadout, onlineGameMode.value)
    console.log('[MechBattle] Match requested', { gameMode: onlineGameMode.value })
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

  // Match start countdown - server sends countdown=3, 2, 1 then starts game loop
  let countdownTimeout: ReturnType<typeof setTimeout> | null = null
  networkManager.on('match_start', (data: any) => {
    showMatchmaking.value = false
    battle.battleState.value.phase = 'countdown'
    countdownRemaining.value = data.countdown || 3

    // Clear any previous timeout to prevent duplicates
    if (countdownTimeout) clearTimeout(countdownTimeout)

    // When we receive countdown=1, start battle after 1 second (server starts game loop at 0)
    if (data.countdown === 1) {
      countdownTimeout = setTimeout(() => {
        countdownRemaining.value = 0
        battle.battleState.value.phase = 'active'
      }, 1000)
    }
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
  console.log('[MechBattle] Creating multiplayer mechs with data:')
  console.log('  Your Player ID:', data.yourPlayerId)
  console.log('  Opponent ID:', data.opponentId)
  console.log('  Opponent Name:', data.opponentName)

  // Create player mech from builder loadout
  const playerSpawnPos = new THREE.Vector3(
    data.yourSpawnPosition[0],
    data.yourSpawnPosition[1],
    data.yourSpawnPosition[2]
  )

  // markRaw: MechEntity holds the whole Three.js subtree and is mutated by the
  // 60Hz battle loop — deep Vue proxies there cost ms/frame. The HUD template
  // reads (health/fuel) refresh anyway via the 20Hz hud-update re-render.
  multiplayerPlayerMech.value = markRaw(new MechEntity(
    data.yourPlayerId,
    'Your Mech',
    builder.loadout.value,
    {
      ...builder.totalStats.value,
      currentHealth: builder.totalStats.value.maxHealth
    },
    true,
    playerSpawnPos
  ))

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

  multiplayerOpponentMech.value = markRaw(new MechEntity(
    data.opponentId,
    data.opponentName,
    opponentBuilderLoadout,
    opponentStats,
    false,
    opponentSpawnPos
  ))
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

  // Automatically queue for another match in the same online mode.
  selectMultiplayer(onlineGameMode.value)
}

function returnToBuilder() {
  battle.resetBattle()
  router.push({ name: 'mech-builder' })
}

function goHome() {
  battle.resetBattle()
  router.push({ name: 'mech-home' })
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
  background: var(--mech-bg-900);
  z-index: 1000;
  font-family: var(--mech-font);
}

.flow-navigation {
  position: fixed;
  top: var(--mech-space-4);
  left: var(--mech-space-5);
  z-index: 2200;
  display: flex;
  gap: var(--mech-space-2);
}

.flow-pill {
  border-radius: var(--mech-radius-pill);
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: var(--mech-tracking-wide);
  backdrop-filter: var(--mech-blur);
}

.flow-pill.current {
  border: 1px solid var(--mech-border-accent);
  color: var(--mech-accent);
  background: var(--mech-accent-soft);
}

.flow-pill.action {
  border: 1px solid var(--mech-border-strong);
  color: var(--mech-text);
  background: var(--mech-surface);
  cursor: pointer;
  transition: all var(--mech-transition);
}

.flow-pill.action:hover {
  background: var(--mech-surface-raised);
  border-color: var(--mech-border-accent);
  transform: translateY(-1px);
}

.flow-pill.action:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 2px;
}

/* Screens */
.screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mech-page-gradient);
  position: relative;
}

.screen::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1200px 600px at 50% -10%, var(--mech-accent-soft), transparent 60%),
    radial-gradient(900px 500px at 100% 110%, rgba(124, 58, 237, 0.1), transparent 60%);
  pointer-events: none;
}

.screen-content {
  text-align: center;
  padding: var(--mech-space-7);
  max-width: 880px;
  position: relative;
  z-index: 1;
}

/* Loading Screen */
.loading-screen h2 {
  color: var(--mech-text);
  font-size: 2rem;
  margin-bottom: var(--mech-space-6);
  letter-spacing: var(--mech-tracking-wide);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--mech-border);
  border-top: 4px solid var(--mech-accent);
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s linear infinite;
  box-shadow: var(--mech-shadow-accent);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Ready Screen */
.ready-screen h1 {
  color: var(--mech-text);
  font-size: 3rem;
  margin-bottom: var(--mech-space-7);
  letter-spacing: var(--mech-tracking-wide);
  text-shadow: 0 0 24px var(--mech-accent-glow);
}

.mech-preview {
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  padding: var(--mech-space-6);
  border-radius: var(--mech-radius-lg);
  border: 1px solid var(--mech-border-strong);
  box-shadow: var(--mech-shadow-md);
  margin-bottom: var(--mech-space-7);
}

.mech-preview h3 {
  color: var(--mech-accent);
  font-size: 1.5rem;
  margin-bottom: var(--mech-space-5);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--mech-space-4);
  margin-top: var(--mech-space-5);
}

.stat-item {
  background: var(--mech-accent-soft);
  padding: var(--mech-space-4);
  border-radius: var(--mech-radius-sm);
  border: 1px solid var(--mech-border-accent);
}

.stat-label {
  color: var(--mech-text-dim);
  font-size: 0.9rem;
  display: block;
  margin-bottom: var(--mech-space-1);
}

.stat-value {
  color: var(--mech-text);
  font-size: 1.3rem;
  font-weight: bold;
}

.enemy-info {
  margin-top: var(--mech-space-5);
  color: var(--mech-text);
}

.difficulty-badge {
  background: var(--mech-success-strong);
  color: #fff;
  padding: 4px 14px;
  border-radius: var(--mech-radius-pill);
  font-weight: bold;
  font-size: 0.85rem;
  letter-spacing: var(--mech-tracking-wide);
}

.difficulty-badge.difficulty-tutorial {
  background: var(--mech-text-muted);
}

.difficulty-badge.difficulty-easy {
  background: var(--mech-success-strong);
}

.difficulty-badge.difficulty-medium {
  background: var(--mech-accent-strong);
}

.difficulty-badge.difficulty-hard {
  background: var(--mech-warn-strong);
}

.difficulty-badge.difficulty-boss {
  background: var(--mech-danger-strong);
}

/* Versus header + stat comparison (ready screen) */
.versus-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.versus-side {
  font-size: 1.3rem;
  font-weight: bold;
  flex: 1;
}

.versus-side.you {
  color: var(--mech-success);
  text-align: left;
}

.versus-side.them {
  color: var(--mech-danger);
  text-align: right;
}

.versus-vs {
  color: var(--mech-warn);
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: var(--mech-tracking-caps);
  text-shadow: 0 0 12px var(--mech-warn-glow);
}

.stat-compare {
  display: flex;
  flex-direction: column;
  gap: var(--mech-space-2);
}

.compare-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--mech-space-3);
  background: var(--mech-surface-2);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-sm);
  padding: 10px 16px;
  transition: border-color var(--mech-transition);
}

.compare-row:hover {
  border-color: var(--mech-border-strong);
}

.compare-label {
  color: var(--mech-text-dim);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: var(--mech-tracking-wide);
  white-space: nowrap;
}

.compare-val {
  color: var(--mech-text);
  font-size: 1.2rem;
  font-weight: bold;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.compare-val.them {
  text-align: left;
  justify-content: flex-start;
}

.compare-val.better {
  color: var(--mech-success);
}

.compare-val.worse {
  color: var(--mech-danger);
}

.compare-arrow {
  font-size: 0.7rem;
}

.mode-tag {
  margin-bottom: 6px;
}

/* In-flow difficulty selector */
.difficulty-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mech-space-3);
  margin-bottom: var(--mech-space-5);
}

.difficulty-selector-label {
  color: var(--mech-text-dim);
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--mech-tracking-wide);
}

.difficulty-options {
  display: flex;
  gap: var(--mech-space-2);
  flex-wrap: wrap;
  justify-content: center;
}

.difficulty-option {
  padding: 9px 20px;
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-pill);
  background: var(--mech-surface-2);
  color: var(--mech-text-dim);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--mech-transition);
}

.difficulty-option:hover {
  border-color: var(--mech-border-accent);
  color: var(--mech-text);
  transform: translateY(-1px);
}

.difficulty-option:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 2px;
}

.difficulty-option.active {
  color: #fff;
  border-color: transparent;
  box-shadow: var(--mech-shadow-sm);
}

.difficulty-option.active.difficulty-tutorial { background: var(--mech-text-muted); }
.difficulty-option.active.difficulty-easy { background: var(--mech-success-strong); }
.difficulty-option.active.difficulty-medium { background: var(--mech-accent-strong); }
.difficulty-option.active.difficulty-hard { background: var(--mech-warn-strong); }
.difficulty-option.active.difficulty-boss { background: var(--mech-danger-strong); }

.next-difficulty-btn {
  background: var(--mech-purple-grad);
}

.next-difficulty-btn:hover {
  background: var(--mech-purple-grad);
  filter: brightness(1.1);
  box-shadow: 0 0 24px rgba(124, 58, 237, 0.5);
}

/* Survival mode button + best-wave badge */
.mode-options-3 {
  grid-template-columns: repeat(3, 1fr);
}

.mode-options-4 {
  grid-template-columns: repeat(2, 1fr);
  max-width: 800px;
}

.coop-badge {
  background: var(--mech-cyan-grad);
}

.story-badge {
  background: var(--mech-success-grad);
}

.story-btn:hover {
  border-color: var(--mech-success-glow);
}

.best-wave-badge {
  position: absolute;
  top: var(--mech-space-4);
  right: var(--mech-space-4);
  background: var(--mech-cyan-grad);
  color: #fff;
  padding: 6px 14px;
  border-radius: var(--mech-radius-pill);
  font-size: 0.78rem;
  font-weight: bold;
  box-shadow: var(--mech-shadow-sm);
}

/* Between-wave transition overlay */
.wave-transition {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  pointer-events: none;
  animation: pulse 1.5s ease-in-out infinite;
}

.wave-transition h2 {
  color: var(--mech-warn);
  font-size: 3rem;
  letter-spacing: var(--mech-tracking-wide);
  text-shadow: 0 0 24px var(--mech-warn-glow);
  margin-bottom: var(--mech-space-3);
}

.wave-transition p {
  color: var(--mech-text);
  font-size: 1.3rem;
}

/* Buttons */
.button-group {
  display: flex;
  gap: var(--mech-space-4);
  justify-content: center;
  margin-top: var(--mech-space-6);
  flex-wrap: wrap;
}

.start-btn,
.back-btn,
.return-btn,
.settings-btn {
  padding: 15px 40px;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: var(--mech-tracking-wide);
  border: none;
  border-radius: var(--mech-radius-md);
  cursor: pointer;
  transition: all var(--mech-transition);
}

.start-btn:focus-visible,
.back-btn:focus-visible,
.return-btn:focus-visible,
.settings-btn:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 3px;
}

.start-btn {
  background: var(--mech-warn-grad);
  color: var(--mech-text-on-accent);
  box-shadow: var(--mech-shadow-sm);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--mech-warn-glow);
}

.settings-btn {
  background: var(--mech-accent-grad);
  color: #fff;
  box-shadow: var(--mech-shadow-sm);
}

.settings-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--mech-accent-glow);
}

.back-btn,
.return-btn {
  background: var(--mech-surface);
  color: var(--mech-text);
  border: 1px solid var(--mech-border-strong);
}

.back-btn:hover,
.return-btn:hover {
  background: var(--mech-surface-raised);
  border-color: var(--mech-border-accent);
  transform: translateY(-2px);
}

/* Battle Container */
.battle-container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Victory Screen */
.victory-screen {
  background: linear-gradient(135deg, #042f2a 0%, #064e3b 55%, #032620 100%);
}

.victory-screen::before {
  background: radial-gradient(1000px 600px at 50% -10%, var(--mech-success-glow), transparent 60%);
}

.victory-title {
  color: var(--mech-success);
  font-size: 4rem;
  margin-bottom: var(--mech-space-7);
  letter-spacing: var(--mech-tracking-wide);
  text-shadow: 0 0 30px var(--mech-success-glow);
  animation: pulse 2s ease-in-out infinite;
}

/* Defeat Screen */
.defeat-screen {
  background: linear-gradient(135deg, #2a0d0d 0%, #4c1414 55%, #260909 100%);
}

.defeat-screen::before {
  background: radial-gradient(1000px 600px at 50% -10%, var(--mech-danger-glow), transparent 60%);
}

.defeat-title {
  color: var(--mech-danger);
  font-size: 4rem;
  margin-bottom: var(--mech-space-7);
  letter-spacing: var(--mech-tracking-wide);
  text-shadow: 0 0 30px var(--mech-danger-glow);
}

/* Battle Stats */
.battle-stats {
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  border: 1px solid var(--mech-border-strong);
  padding: var(--mech-space-6);
  border-radius: var(--mech-radius-lg);
  box-shadow: var(--mech-shadow-md);
  margin-bottom: var(--mech-space-7);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: var(--mech-space-4) 0;
  border-bottom: 1px solid var(--mech-border);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row .stat-label {
  color: var(--mech-text-dim);
  font-size: 1.05rem;
}

.stat-row .stat-value {
  color: var(--mech-text);
  font-size: 1.3rem;
  font-weight: bold;
}

.stat-row.final-score {
  margin-top: var(--mech-space-5);
  padding-top: var(--mech-space-5);
  border-top: 1px solid var(--mech-border-accent);
}

.stat-row.final-score .stat-label {
  color: var(--mech-accent);
  font-size: 1.3rem;
}

.stat-row.final-score .stat-value {
  color: var(--mech-accent);
  font-size: 2rem;
  text-shadow: 0 0 18px var(--mech-accent-glow);
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

/* Map Selection Screen */
.map-select-screen h1 {
  color: var(--mech-text);
  font-size: 3rem;
  margin-bottom: var(--mech-space-5);
  letter-spacing: var(--mech-tracking-wide);
  text-shadow: 0 0 24px var(--mech-accent-glow);
}

.map-select-layout {
  display: flex;
  gap: var(--mech-space-6);
  margin-bottom: var(--mech-space-7);
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
  align-items: flex-start;
}

.map-list {
  display: flex;
  flex-direction: column;
  gap: var(--mech-space-3);
  min-width: 260px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: var(--mech-space-3);
}

.map-list::-webkit-scrollbar {
  width: 6px;
}

.map-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 3px;
}

.map-list::-webkit-scrollbar-thumb {
  background: var(--mech-accent-glow);
  border-radius: 3px;
}

.map-btn {
  background: var(--mech-surface-2);
  padding: var(--mech-space-3) var(--mech-space-4);
  border-radius: var(--mech-radius-md);
  border: 1px solid var(--mech-border-strong);
  cursor: pointer;
  transition: all var(--mech-transition);
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--mech-space-3);
  text-align: left;
}

.map-btn:hover {
  border-color: var(--mech-border-accent);
  background: var(--mech-accent-soft);
  transform: translateX(4px);
}

.map-btn:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 2px;
}

.map-btn.selected {
  border-color: var(--mech-success-strong);
  background: rgba(16, 185, 129, 0.14);
  box-shadow: 0 0 18px var(--mech-success-glow);
}

.map-btn .map-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.map-btn .map-info h3 {
  color: var(--mech-text);
  font-size: 1rem;
  margin-bottom: 2px;
}

.map-btn .map-size {
  color: var(--mech-text-dim);
  font-size: 0.8rem;
}

.map-preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--mech-space-3);
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  border-radius: var(--mech-radius-lg);
  padding: var(--mech-space-4);
  border: 1px solid var(--mech-border-strong);
  box-shadow: var(--mech-shadow-md);
  min-height: 380px;
}

.preview-title {
  color: var(--mech-accent);
  font-size: 1.2rem;
  margin: 0;
  text-align: center;
  letter-spacing: var(--mech-tracking-wide);
}

.preview-wrapper {
  flex: 1;
  min-height: 250px;
  border-radius: var(--mech-radius-sm);
  overflow: hidden;
}

.preview-details {
  display: flex;
  gap: var(--mech-space-5);
  justify-content: center;
  padding-top: var(--mech-space-2);
  border-top: 1px solid var(--mech-border);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-label {
  color: var(--mech-text-dim);
  font-size: 0.85rem;
}

.detail-value {
  color: var(--mech-text);
  font-size: 0.9rem;
  font-weight: 600;
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.selected-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--mech-success-grad);
  color: #fff;
  padding: 3px 8px;
  border-radius: var(--mech-radius-sm);
  font-size: 0.65rem;
  font-weight: bold;
  letter-spacing: var(--mech-tracking-wide);
}

/* Mode Selection Screen */
.mode-select-screen h1 {
  color: var(--mech-text);
  font-size: 3rem;
  margin-bottom: var(--mech-space-5);
  letter-spacing: var(--mech-tracking-wide);
  text-shadow: 0 0 24px var(--mech-accent-glow);
}

.mode-description {
  color: var(--mech-text-dim);
  font-size: 1.15rem;
  margin-bottom: var(--mech-space-7);
}

.mode-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--mech-space-5);
  margin-bottom: var(--mech-space-7);
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.mode-btn {
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  padding: var(--mech-space-7) var(--mech-space-6);
  border-radius: var(--mech-radius-lg);
  border: 1px solid var(--mech-border-strong);
  cursor: pointer;
  transition: all var(--mech-transition);
  position: relative;
  overflow: hidden;
}

.mode-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--mech-accent-soft), transparent 60%);
  opacity: 0;
  transition: opacity var(--mech-transition);
  pointer-events: none;
}

.mode-btn:hover {
  border-color: var(--mech-border-accent);
  transform: translateY(-5px);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.4), 0 0 28px var(--mech-accent-glow);
}

.mode-btn:hover::after {
  opacity: 1;
}

.mode-btn:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 3px;
}

.mode-icon {
  font-size: 4rem;
  margin-bottom: var(--mech-space-5);
}

.mode-btn h3 {
  color: var(--mech-text);
  font-size: 1.5rem;
  margin-bottom: var(--mech-space-3);
}

.mode-btn p {
  color: var(--mech-text-dim);
  font-size: 1rem;
  line-height: 1.5;
}

.coming-soon-badge {
  position: absolute;
  top: var(--mech-space-4);
  right: var(--mech-space-4);
  background: var(--mech-warn-grad);
  color: var(--mech-text-on-accent);
  padding: 6px 14px;
  border-radius: var(--mech-radius-pill);
  font-size: 0.78rem;
  font-weight: bold;
  letter-spacing: var(--mech-tracking-wide);
}

/* Countdown Screen */
.countdown-screen {
  background: var(--mech-page-gradient);
}

.countdown-title {
  color: var(--mech-warn);
  font-size: 8rem;
  margin-bottom: var(--mech-space-5);
  text-shadow: 0 0 40px var(--mech-warn-glow);
  animation: pulse 1s ease-in-out infinite;
  font-weight: bold;
}

.countdown-subtitle {
  color: var(--mech-text-dim);
  font-size: 1.5rem;
  margin-bottom: var(--mech-space-6);
}

.opponent-name {
  color: var(--mech-accent);
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 0 20px var(--mech-accent-glow);
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

  .mode-options,
  .mode-options-3,
  .mode-options-4 {
    grid-template-columns: 1fr;
  }

  .map-select-layout {
    flex-direction: column;
  }

  .map-list {
    flex-direction: row;
    flex-wrap: wrap;
    max-height: none;
    min-width: auto;
  }

  .map-btn {
    flex: 1 1 calc(50% - 6px);
    min-width: 140px;
  }

  .map-preview-container {
    min-height: 280px;
  }

  .preview-wrapper {
    min-height: 180px;
  }

  .preview-details {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
