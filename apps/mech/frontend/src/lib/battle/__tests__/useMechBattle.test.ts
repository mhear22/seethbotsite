import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useMechBattle, type AIDifficultyTier } from '../../../composables/useMechBattle'
import type { MechStats, MechLoadout } from '../../../composables/useMechBuilder'
import { ARM_PARTS, CORE_PARTS, LEGS_PARTS, HEAD_PARTS, RACK_PARTS } from '../../../shared/data/MechParts'

/**
 * NOTE on test scope: useMechBattle imports MechEntity, which constructs three.js
 * geometry (fine in node). MechEntity's constructor also kicks off async GLB
 * model loading (GLTFLoader.loadAsync), which can't resolve relative model URLs
 * under node. That load is fire-and-forget and wrapped in try/catch inside
 * MechEntity, so it never fails a test — but it spams the console. We stub the
 * model loader so assembleMech resolves to an empty group instead. No WebGL /
 * BattleScene is pulled in by this composable, so no further mocking is needed.
 */
vi.mock('../../../lib/battle/MechModelLoader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../lib/battle/MechModelLoader')>()
  const THREE = await import('three')
  return {
    ...actual,
    getMechModelLoader: () => ({
      assembleMech: async () => new THREE.Group(),
    }),
  }
})

function installLocalStorage() {
  const store = new Map<string, string>()
  ;(globalThis as any).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  }
  return store
}

const DIFFICULTY_ORDER: AIDifficultyTier[] = ['tutorial', 'easy', 'medium', 'hard', 'boss']

function makePlayerStats(): MechStats {
  return { health: 300, armor: 20, speed: 60, energy: 60, firepower: 40, accuracy: 40 }
}

function makePlayerLoadout(): MechLoadout {
  return {
    leftArm: ARM_PARTS[0],
    rightArm: ARM_PARTS[0],
    core: CORE_PARTS[0],
    legs: LEGS_PARTS[0],
    head: HEAD_PARTS[0],
    rack: RACK_PARTS[0],
  }
}

let store: Map<string, string>
beforeEach(() => {
  store = installLocalStorage()
})
afterEach(() => {
  delete (globalThis as any).localStorage
  vi.restoreAllMocks()
})

describe('useMechBattle survival difficulty escalation', () => {
  it('escalates the difficulty tier as the wave increases (every 2 waves, capped at boss)', () => {
    const battle = useMechBattle()
    battle.battleState.value.mode = 'survival'

    // Start from medium (index 2). Helper is exposed via currentWaveDifficulty
    // by stepping wave; assert tier monotonically climbs and caps at boss.
    const tiers: AIDifficultyTier[] = []
    battle.startSurvival('medium')
    tiers.push(battle.currentWaveDifficulty())
    for (let w = 2; w <= 12; w++) {
      battle.battleState.value.wave = w
      tiers.push(battle.currentWaveDifficulty())
    }

    // Indices must be non-decreasing.
    const indices = tiers.map(t => DIFFICULTY_ORDER.indexOf(t))
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThanOrEqual(indices[i - 1])
    }
    // Should reach a strictly higher tier than the base by deeper waves.
    expect(indices[indices.length - 1]).toBeGreaterThan(indices[0])
    // Capped at boss (last index).
    expect(Math.max(...indices)).toBe(DIFFICULTY_ORDER.length - 1)
    expect(tiers[tiers.length - 1]).toBe('boss')
  })
})

describe('useMechBattle nextWave', () => {
  it('increments the wave, repairs the player, and spawns an escalated enemy', () => {
    const battle = useMechBattle()
    battle.initializeBattle(makePlayerLoadout(), makePlayerStats())
    battle.startSurvival('tutorial')

    const player = battle.battleState.value.player!
    // Damage the player so we can observe the between-wave repair.
    player.stats.currentHealth = 50
    player.isDestroyed = true
    player.currentPower = 0

    const wave1Enemy = battle.battleState.value.enemy!
    const wave1MaxHealth = wave1Enemy.stats.maxHealth
    const startWave = battle.battleState.value.wave

    const returnedWave = battle.nextWave()

    // Wave counter incremented and returned.
    expect(returnedWave).toBe(startWave + 1)
    expect(battle.battleState.value.wave).toBe(startWave + 1)

    // Player repaired (35% of maxHealth restored) and reset to active.
    expect(player.stats.currentHealth).toBeGreaterThan(50)
    expect(player.stats.currentHealth).toBeLessThanOrEqual(player.stats.maxHealth)
    expect(player.isDestroyed).toBe(false)
    expect(player.currentPower).toBe(player.maxPower)

    // A new (escalated) enemy was spawned; deeper wave -> higher scaled health.
    const wave2Enemy = battle.battleState.value.enemy!
    expect(wave2Enemy).not.toBe(wave1Enemy)
    expect(wave2Enemy.stats.maxHealth).toBeGreaterThan(wave1MaxHealth)

    // Phase re-enters active combat.
    expect(battle.battleState.value.phase).toBe('active')
    expect(battle.battleState.value.betweenWaves).toBe(false)
  })

  it('grows the enemy stat scale monotonically with the wave (statScaleForWave)', () => {
    // statScaleForWave is internal but drives generateEnemy's scaling. Spawn the
    // same base tier at successive waves and confirm scaled health climbs.
    const battle = useMechBattle()
    battle.startSurvival('tutorial') // tutorial tier holds for waves 1-2
    const w1Health = battle.battleState.value.enemy!.stats.maxHealth

    battle.battleState.value.wave = 2
    // Re-generate at wave 2 (still tutorial tier) via nextWave path is wave 2->3,
    // so call generateEnemy directly with the wave-2 scale by advancing wave then
    // using nextWave semantics: simplest is to compare w1 vs a deeper wave.
    const battle2 = useMechBattle()
    battle2.startSurvival('tutorial')
    battle2.battleState.value.wave = 1
    battle2.nextWave() // -> wave 2, tutorial tier, larger scale
    const w2Health = battle2.battleState.value.enemy!.stats.maxHealth

    expect(w2Health).toBeGreaterThan(w1Health)
  })
})

describe('useMechBattle bestWave persistence', () => {
  it('persists best wave to localStorage on survival victory and reloads it', () => {
    const battle = useMechBattle()
    battle.initializeBattle(makePlayerLoadout(), makePlayerStats())
    battle.startSurvival('medium')

    // Advance a few waves, then record a victory which should update bestWave.
    battle.battleState.value.wave = 4
    battle.endBattle('victory', 12)

    expect(battle.battleState.value.bestWave).toBe(4)
    expect(store.get('mech-survival-best-wave')).toBe('4')

    // A fresh composable instance reads the persisted best wave on construction.
    const reloaded = useMechBattle()
    expect(reloaded.battleState.value.bestWave).toBe(4)
  })

  it('records best wave reached on survival defeat (waves fully cleared)', () => {
    const battle = useMechBattle()
    battle.initializeBattle(makePlayerLoadout(), makePlayerStats())
    battle.startSurvival('medium')

    battle.battleState.value.wave = 6 // died fighting wave 6 -> cleared 5
    battle.endBattle('defeat', 30)

    expect(battle.battleState.value.bestWave).toBe(5)
    expect(store.get('mech-survival-best-wave')).toBe('5')
    expect(battle.battleState.value.phase).toBe('defeat')
  })
})
