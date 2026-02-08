import { ref, computed } from 'vue'
import * as THREE from 'three'
import { MechEntity, type CombatStats } from '../lib/battle/MechEntity'
import type { MechLoadout, MechStats } from './useMechBuilder'

export interface BattleState {
  phase: 'loading' | 'ready' | 'active' | 'victory' | 'defeat'
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

  function initializeBattle(playerLoadout: MechLoadout, playerStats: MechStats) {
    const combatStats = convertStatsToCombat(playerStats)

    battleState.value.player = new MechEntity(
      'player',
      'Your Mech',
      playerLoadout,
      combatStats,
      true, // isPlayer
      new THREE.Vector3(0, 0, 15) // Spawn position
    )

    battleState.value.phase = 'ready'
  }

  function generateEnemy(difficulty: 'tutorial' | 'easy' | 'medium' | 'hard' | 'boss' = 'tutorial') {
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

    // Create empty loadout for enemy (visuals only)
    const enemyLoadout: MechLoadout = {
      leftArm: null,
      rightArm: null,
      core: null,
      legs: null,
      head: null,
      rack: null
    }

    battleState.value.enemy = new MechEntity(
      'enemy',
      config.name,
      enemyLoadout,
      config.stats,
      false, // Not player
      new THREE.Vector3(0, 0, -15) // Spawn position opposite player
    )
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
