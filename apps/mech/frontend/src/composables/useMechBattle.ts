import { ref, computed } from 'vue'
import * as THREE from 'three'
import { MechEntity, type CombatStats } from '../lib/battle/MechEntity'
import type { MechLoadout, MechStats } from './useMechBuilder'
import { ARM_PARTS, CORE_PARTS, LEGS_PARTS, HEAD_PARTS, RACK_PARTS } from '../shared/data/MechParts'

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
    // Enemy presets based on difficulty
    const enemyConfigs = {
      tutorial: {
        name: 'Training Bot',
        stats: {
          maxHealth: 150,
          currentHealth: 150,
          armor: 10,
          speed: 60,
          firepower: 25,
          accuracy: 30,
          energy: 50
        }
      },
      easy: {
        name: 'Scout Mech',
        stats: {
          maxHealth: 200,
          currentHealth: 200,
          armor: 15,
          speed: 80,
          firepower: 30,
          accuracy: 40,
          energy: 60
        }
      },
      medium: {
        name: 'Assault Mech',
        stats: {
          maxHealth: 300,
          currentHealth: 300,
          armor: 25,
          speed: 70,
          firepower: 45,
          accuracy: 50,
          energy: 80
        }
      },
      hard: {
        name: 'Heavy Mech',
        stats: {
          maxHealth: 400,
          currentHealth: 400,
          armor: 35,
          speed: 60,
          firepower: 60,
          accuracy: 60,
          energy: 100
        }
      },
      boss: {
        name: 'TITAN-Class Destroyer',
        stats: {
          maxHealth: 600,
          currentHealth: 600,
          armor: 45,
          speed: 70,
          firepower: 80,
          accuracy: 70,
          energy: 120
        }
      }
    }

    const baseConfig = enemyConfigs[difficulty]

    // Apply optional stat scaling (survival waves ramp the same archetype up).
    const scale = options?.statScale ?? 1
    const config = {
      name: options?.nameSuffix ? `${baseConfig.name} ${options.nameSuffix}` : baseConfig.name,
      stats: scale === 1 ? baseConfig.stats : {
        maxHealth: Math.round(baseConfig.stats.maxHealth * scale),
        currentHealth: Math.round(baseConfig.stats.maxHealth * scale),
        armor: Math.round(baseConfig.stats.armor * scale),
        speed: baseConfig.stats.speed, // keep mobility readable
        firepower: Math.round(baseConfig.stats.firepower * scale),
        accuracy: Math.min(95, Math.round(baseConfig.stats.accuracy * scale)),
        energy: Math.round(baseConfig.stats.energy * scale)
      }
    }

    // Select parts based on difficulty
    const enemyLoadouts: Record<string, { arm: number; core: number; legs: number; head: number; rack: number }> = {
      tutorial: { arm: 0, core: 0, legs: 0, head: 0, rack: 0 },       // autocannon, diesel, bipedal, standard optics, smoke
      easy:    { arm: 0, core: 2, legs: 0, head: 3, rack: 2 },        // autocannon, gas turbine, bipedal, scout, jump jets
      medium:  { arm: 1, core: 0, legs: 1, head: 1, rack: 1 },        // railgun, diesel, tracked, targeting array, ammo feed
      hard:    { arm: 3, core: 1, legs: 3, head: 2, rack: 3 },        // missile pod, fusion, quad, reinforced, repair drone
      boss:    { arm: 1, core: 1, legs: 1, head: 1, rack: 2 },        // railgun, fusion, tracked, targeting array, jump jets
    }

    const indices = enemyLoadouts[difficulty] ?? enemyLoadouts.tutorial

    const enemyLoadout: MechLoadout = {
      leftArm: ARM_PARTS[indices.arm] ?? ARM_PARTS[0],
      rightArm: ARM_PARTS[indices.arm] ?? ARM_PARTS[0],
      core: CORE_PARTS[indices.core] ?? CORE_PARTS[0],
      legs: LEGS_PARTS[indices.legs] ?? LEGS_PARTS[0],
      head: HEAD_PARTS[indices.head] ?? HEAD_PARTS[0],
      rack: RACK_PARTS[indices.rack] ?? RACK_PARTS[0],
    }

    const spawnPos = enemySpawn
      ? new THREE.Vector3(enemySpawn.position[0], enemySpawn.position[1], enemySpawn.position[2])
      : new THREE.Vector3(0, 0, -15)
    const facingAngle = enemySpawn?.facingAngle ?? 0

    const enemy = new MechEntity(
      'enemy',
      config.name,
      enemyLoadout,
      config.stats,
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
