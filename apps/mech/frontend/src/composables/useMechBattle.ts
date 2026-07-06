import { ref, computed } from 'vue'
import * as THREE from 'three'
import { MechEntity, type CombatStats } from '../lib/battle/MechEntity'
import type { MechLoadout, MechStats } from './useMechBuilder'
import { enemyStats, enemyLoadout, DIFFICULTY_NAMES } from '../lib/battle/enemyGeneration'

export interface SpawnPosition {
  position: [number, number, number]
  facingAngle: number
}

export type BattleMode = 'duel' | 'survival'

export type AIDifficultyTier = 'tutorial' | 'easy' | 'medium' | 'hard' | 'boss'

const DIFFICULTY_ORDER: AIDifficultyTier[] = ['tutorial', 'easy', 'medium', 'hard', 'boss']

const BEST_WAVE_KEY = 'mech-survival-best-wave'

export interface BattleState {
  phase: 'loading' | 'ready' | 'active' | 'victory' | 'defeat' | 'mode-select' | 'map-select' | 'countdown' | 'multiplayer-results'
  /** 'duel' is the classic single-enemy fight; 'survival' chains escalating waves. */
  mode: BattleMode
  player: MechEntity | null
  enemy: MechEntity | null
  time: number
  score: number
  damageDealt: number
  /** Survival wave counter (1-based). Always 1 in duel mode. */
  wave: number
  /** Best wave reached across all survival runs (persisted to localStorage). */
  bestWave: number
  /** Brief between-wave repair flag; true while the next wave is spawning. */
  betweenWaves: boolean
}

function loadBestWave(): number {
  try {
    const stored = localStorage.getItem(BEST_WAVE_KEY)
    return stored ? Math.max(0, parseInt(stored, 10) || 0) : 0
  } catch {
    return 0
  }
}

function saveBestWave(wave: number): void {
  try {
    localStorage.setItem(BEST_WAVE_KEY, String(wave))
  } catch {
    // ignore persistence failures
  }
}

export function useMechBattle() {
  const battleState = ref<BattleState>({
    phase: 'loading',
    mode: 'duel',
    player: null,
    enemy: null,
    time: 0,
    score: 0,
    damageDealt: 0,
    wave: 1,
    bestWave: loadBestWave(),
    betweenWaves: false
  })

  function convertStatsToCombat(stats: MechStats): CombatStats {
    return {
      maxHealth: Math.max(100, stats.health),
      currentHealth: Math.max(100, stats.health),
      armor: Math.max(0, stats.armor),
      speed: Math.max(50, stats.speed + 50), // Add base speed
      firepower: Math.max(20, stats.firepower + 20), // Add base firepower
      accuracy: Math.max(20, stats.accuracy + 20), // Add base accuracy
      energy: Math.max(50, stats.energy + 50) // Add base energy
    }
  }

  function initializeBattle(
    playerLoadout: MechLoadout,
    playerStats: MechStats,
    playerSpawn?: SpawnPosition
  ) {
    const combatStats = convertStatsToCombat(playerStats)

    const spawnPos = playerSpawn
      ? new THREE.Vector3(playerSpawn.position[0], playerSpawn.position[1], playerSpawn.position[2])
      : new THREE.Vector3(0, 0, 15)
    const facingAngle = playerSpawn?.facingAngle ?? Math.PI

    battleState.value.player = new MechEntity(
      'player',
      'Your Mech',
      playerLoadout,
      combatStats,
      true, // isPlayer
      spawnPos
    )
    battleState.value.player.rotation.y = facingAngle

    battleState.value.phase = 'ready'
  }

  function generateEnemy(
    difficulty: AIDifficultyTier = 'tutorial',
    enemySpawn?: SpawnPosition,
    options?: { statScale?: number; nameSuffix?: string }
  ) {
    // Stats + loadout come from the unified enemyGeneration table (single source
    // of truth shared with StoryCombat). Survival waves pass statScale to ramp
    // the same archetype up.
    const scale = options?.statScale ?? 1
    const stats = enemyStats(difficulty, scale)
    const baseName = DIFFICULTY_NAMES[difficulty]
    const name = options?.nameSuffix ? `${baseName} ${options.nameSuffix}` : baseName
    const loadout = enemyLoadout(difficulty)

    const spawnPos = enemySpawn
      ? new THREE.Vector3(enemySpawn.position[0], enemySpawn.position[1], enemySpawn.position[2])
      : new THREE.Vector3(0, 0, -15)
    const facingAngle = enemySpawn?.facingAngle ?? 0

    const enemy = new MechEntity(
      'enemy',
      name,
      loadout,
      stats,
      false, // Not player
      spawnPos
    )
    enemy.rotation.y = facingAngle

    battleState.value.enemy = enemy
  }

  // Survival context — remembered so each wave can re-spawn an escalating enemy
  // at the same point with the same base difficulty.
  let survivalBaseDifficulty: AIDifficultyTier = 'medium'
  let survivalEnemySpawn: SpawnPosition | undefined

  /**
   * Difficulty tier for a given survival wave: starts at the base tier and steps
   * up the ladder every 2 waves, capping at 'boss'.
   */
  function difficultyForWave(base: AIDifficultyTier, wave: number): AIDifficultyTier {
    const baseIdx = DIFFICULTY_ORDER.indexOf(base)
    const idx = Math.min(DIFFICULTY_ORDER.length - 1, baseIdx + Math.floor((wave - 1) / 2))
    return DIFFICULTY_ORDER[idx]
  }

  /** Stat multiplier applied on top of the tier for deeper survival waves. */
  function statScaleForWave(wave: number): number {
    return 1 + (wave - 1) * 0.12
  }

  /** Difficulty tier the current/next survival wave should use. */
  function currentWaveDifficulty(): AIDifficultyTier {
    return difficultyForWave(survivalBaseDifficulty, battleState.value.wave)
  }

  function startBattle() {
    if (!battleState.value.player || !battleState.value.enemy) {
      console.error('Cannot start battle: player or enemy not initialized')
      return
    }

    battleState.value.phase = 'active'
    battleState.value.time = 0
    battleState.value.score = 0
    battleState.value.damageDealt = 0
    battleState.value.wave = 1
    battleState.value.betweenWaves = false
  }

  /**
   * Begin a Survival run. Sets up wave 1 and remembers the base difficulty +
   * enemy spawn so later waves can escalate from the same archetype.
   */
  function startSurvival(baseDifficulty: AIDifficultyTier, enemySpawn?: SpawnPosition) {
    survivalBaseDifficulty = baseDifficulty
    survivalEnemySpawn = enemySpawn
    battleState.value.mode = 'survival'
    battleState.value.wave = 1
    generateEnemy(currentWaveDifficulty(), enemySpawn, {
      statScale: statScaleForWave(1),
      nameSuffix: 'W1',
    })
  }

  /**
   * Advance to the next survival wave: bump the counter, briefly repair the
   * player, spawn a tougher enemy, and re-enter the active phase. Returns the
   * new wave index.
   */
  function nextWave(): number {
    const player = battleState.value.player
    battleState.value.wave += 1
    const wave = battleState.value.wave

    // Brief between-wave repair: restore a chunk of the player's health.
    if (player) {
      const repair = player.stats.maxHealth * 0.35
      player.stats.currentHealth = Math.min(player.stats.maxHealth, player.stats.currentHealth + repair)
      player.isDestroyed = false
      // Restore power so the next wave starts ready.
      player.currentPower = player.maxPower
    }

    generateEnemy(currentWaveDifficulty(), survivalEnemySpawn, {
      statScale: statScaleForWave(wave),
      nameSuffix: `W${wave}`,
    })

    battleState.value.betweenWaves = false
    battleState.value.phase = 'active'
    return wave
  }

  function endBattle(result: 'victory' | 'defeat', time: number) {
    battleState.value.time = time

    // Calculate score for any victory (accumulates across survival waves).
    if (result === 'victory') {
      const timeBonus = Math.max(0, 1000 - time * 10)
      const damageBonus = battleState.value.damageDealt * 2
      const healthBonus = battleState.value.player
        ? (battleState.value.player.stats.currentHealth / battleState.value.player.stats.maxHealth) * 500
        : 0
      const waveScore = Math.round(timeBonus + damageBonus + healthBonus)

      if (battleState.value.mode === 'survival') {
        battleState.value.score += waveScore
        // Track best wave reached.
        if (battleState.value.wave > battleState.value.bestWave) {
          battleState.value.bestWave = battleState.value.wave
          saveBestWave(battleState.value.bestWave)
        }
        // Don't show the victory screen — stage the next wave instead.
        battleState.value.betweenWaves = true
        return
      }

      battleState.value.score = waveScore
    } else if (battleState.value.mode === 'survival') {
      // Defeat in survival: lock in the best wave reached (current wave - was
      // surviving it). Best wave is the highest wave fully cleared.
      const reached = Math.max(0, battleState.value.wave - 1)
      if (reached > battleState.value.bestWave) {
        battleState.value.bestWave = reached
        saveBestWave(battleState.value.bestWave)
      }
    }

    battleState.value.phase = result
  }

  function addDamageDealt(amount: number) {
    battleState.value.damageDealt += amount
  }

  function resetBattle() {
    battleState.value = {
      phase: 'loading',
      mode: 'duel',
      player: null,
      enemy: null,
      time: 0,
      score: 0,
      damageDealt: 0,
      wave: 1,
      bestWave: loadBestWave(),
      betweenWaves: false
    }
  }

  // Computed properties
  const playerHealth = computed(() => battleState.value.player?.stats.currentHealth ?? 0)
  const playerMaxHealth = computed(() => battleState.value.player?.stats.maxHealth ?? 100)
  const enemyHealth = computed(() => battleState.value.enemy?.stats.currentHealth ?? 0)
  const enemyMaxHealth = computed(() => battleState.value.enemy?.stats.maxHealth ?? 100)

  return {
    battleState,
    initializeBattle,
    generateEnemy,
    startBattle,
    startSurvival,
    nextWave,
    currentWaveDifficulty,
    endBattle,
    addDamageDealt,
    resetBattle,
    // Computed
    playerHealth,
    playerMaxHealth,
    enemyHealth,
    enemyMaxHealth
  }
}
