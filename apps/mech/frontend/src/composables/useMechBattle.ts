import { ref, computed } from 'vue'
import * as THREE from 'three'
import { MechEntity, type CombatStats } from '../lib/battle/MechEntity'
import type { MechLoadout, MechStats } from './useMechBuilder'
import { ARM_PARTS, CORE_PARTS, LEGS_PARTS, HEAD_PARTS, RACK_PARTS } from '../shared/data/MechParts'

export interface SpawnPosition {
  position: [number, number, number]
  facingAngle: number
}

export interface BattleState {
  phase: 'loading' | 'ready' | 'active' | 'victory' | 'defeat' | 'mode-select' | 'map-select' | 'countdown' | 'multiplayer-results'
  player: MechEntity | null
  enemy: MechEntity | null
  time: number
  score: number
  damageDealt: number
}

export function useMechBattle() {
  const battleState = ref<BattleState>({
    phase: 'loading',
    player: null,
    enemy: null,
    time: 0,
    score: 0,
    damageDealt: 0
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
    difficulty: 'tutorial' | 'easy' | 'medium' | 'hard' | 'boss' = 'tutorial',
    enemySpawn?: SpawnPosition
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

    const config = enemyConfigs[difficulty]

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

  function startBattle() {
    if (!battleState.value.player || !battleState.value.enemy) {
      console.error('Cannot start battle: player or enemy not initialized')
      return
    }

    battleState.value.phase = 'active'
    battleState.value.time = 0
    battleState.value.score = 0
    battleState.value.damageDealt = 0
  }

  function endBattle(result: 'victory' | 'defeat', time: number) {
    battleState.value.phase = result
    battleState.value.time = time

    // Calculate score
    if (result === 'victory') {
      const timeBonus = Math.max(0, 1000 - time * 10)
      const damageBonus = battleState.value.damageDealt * 2
      const healthBonus = battleState.value.player
        ? (battleState.value.player.stats.currentHealth / battleState.value.player.stats.maxHealth) * 500
        : 0

      battleState.value.score = Math.round(timeBonus + damageBonus + healthBonus)
    }
  }

  function addDamageDealt(amount: number) {
    battleState.value.damageDealt += amount
  }

  function resetBattle() {
    battleState.value = {
      phase: 'loading',
      player: null,
      enemy: null,
      time: 0,
      score: 0,
      damageDealt: 0
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
