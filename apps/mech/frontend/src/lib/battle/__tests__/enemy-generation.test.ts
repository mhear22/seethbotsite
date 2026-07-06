/**
 * Phase 2 — unified enemy generation (design §3.6, "unify the two
 * enemy-generation sources of truth"). Before Phase 2 the arena
 * (useMechBattle.generateEnemy) and story (StoryCombat) each held their own
 * stat/loadout tables that could drift. Both now consume the pure
 * `enemyGeneration` module. This suite pins that module's contract and proves
 * the ARENA path actually reads from it, so the two paths cannot diverge.
 *
 * Pure-module coverage: HP rebalance, scaleStats semantics, difficulty +
 * archetype stat/loadout tables, projectile-speed mapping, squad caps and
 * combined-arms compositions. Cross-path coverage: generateEnemy's spawned mech
 * matches enemyStats/enemyLoadout exactly.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  HP_REBALANCE,
  DIFFICULTY_STATS,
  DIFFICULTY_NAMES,
  ARCHETYPE_STATS,
  ARCHETYPE_LOADOUT,
  scaleStats,
  enemyStats,
  enemyLoadout,
  archetypeStats,
  archetypeLoadout,
  weaponProjectileSpeed,
  maxAliveForDifficulty,
  compositionForDifficulty,
  reinforcementComposition,
} from '../enemyGeneration'
import type { EnemyArchetype } from '../EnemyAI'
import type { AIDifficulty } from '../../../composables/useGameSettings'
import { ARM_PARTS, LEGS_PARTS } from '../../../shared/data/MechParts'

// MechEntity (pulled in by useMechBattle) kicks off async GLB loading that can't
// resolve under node; stub the loader so it never spams / rejects.
vi.mock('../../../lib/battle/MechModelLoader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../lib/battle/MechModelLoader')>()
  const THREE = await import('three')
  return {
    ...actual,
    getMechModelLoader: () => ({ assembleMech: async () => new THREE.Group() }),
  }
})

const DIFFICULTIES: AIDifficulty[] = ['tutorial', 'easy', 'medium', 'hard', 'boss']
const ARCHETYPES: EnemyArchetype[] = ['skirmisher', 'line', 'bulwark', 'sniper', 'ace']

describe('HP rebalance (design fix note)', () => {
  it('bumps the pre-Phase-1 pools by the documented HP_REBALANCE factor', () => {
    expect(HP_REBALANCE).toBe(1.4)
    // Raw pre-Phase-1 pools were 150/200/300/400/600 (see module doc).
    const preRebalance: Record<AIDifficulty, number> = {
      tutorial: 150, easy: 200, medium: 300, hard: 400, boss: 600,
    }
    for (const d of DIFFICULTIES) {
      expect(DIFFICULTY_STATS[d].maxHealth).toBe(Math.round(preRebalance[d] * HP_REBALANCE))
      // currentHealth is always seeded to the full pool.
      expect(DIFFICULTY_STATS[d].currentHealth).toBe(DIFFICULTY_STATS[d].maxHealth)
    }
  })

  it('keeps the difficulty ladder monotonic in HP and firepower', () => {
    for (let i = 1; i < DIFFICULTIES.length; i++) {
      const prev = DIFFICULTY_STATS[DIFFICULTIES[i - 1]]
      const cur = DIFFICULTY_STATS[DIFFICULTIES[i]]
      expect(cur.maxHealth).toBeGreaterThan(prev.maxHealth)
      expect(cur.firepower).toBeGreaterThan(prev.firepower)
    }
  })
})

describe('scaleStats', () => {
  it('returns a copy (not the same reference) at scale 1', () => {
    const base = DIFFICULTY_STATS.medium
    const out = scaleStats(base, 1)
    expect(out).toEqual(base)
    expect(out).not.toBe(base)
  })

  it('scales HP/armour/firepower/energy and re-seeds currentHealth from maxHealth', () => {
    const out = scaleStats(DIFFICULTY_STATS.easy, 2)
    expect(out.maxHealth).toBe(Math.round(DIFFICULTY_STATS.easy.maxHealth * 2))
    expect(out.currentHealth).toBe(out.maxHealth) // full, not scaled from old current
    expect(out.armor).toBe(Math.round(DIFFICULTY_STATS.easy.armor * 2))
    expect(out.firepower).toBe(Math.round(DIFFICULTY_STATS.easy.firepower * 2))
  })

  it('leaves speed unscaled so mobility stays readable across scales', () => {
    const out = scaleStats(DIFFICULTY_STATS.boss, 3)
    expect(out.speed).toBe(DIFFICULTY_STATS.boss.speed)
  })

  it('clamps accuracy to 95 no matter how high the scale', () => {
    const out = scaleStats(DIFFICULTY_STATS.boss, 10)
    expect(out.accuracy).toBe(95)
  })
})

describe('difficulty + archetype tables', () => {
  it('enemyStats/enemyLoadout resolve every ladder tier with a named part per slot', () => {
    for (const d of DIFFICULTIES) {
      expect(enemyStats(d)).toEqual(DIFFICULTY_STATS[d])
      expect(DIFFICULTY_NAMES[d]).toBeTruthy()
      const lo = enemyLoadout(d)
      expect(lo.rightArm && lo.leftArm && lo.core && lo.legs && lo.head && lo.rack).toBeTruthy()
    }
  })

  it('archetypeStats/archetypeLoadout resolve every archetype', () => {
    for (const a of ARCHETYPES) {
      expect(archetypeStats(a)).toEqual(ARCHETYPE_STATS[a])
      const lo = archetypeLoadout(a)
      expect(lo.rightArm && lo.core && lo.legs && lo.head && lo.rack).toBeTruthy()
    }
  })

  it('gives archetypes distinct role identities (bulwark tank, skirmisher glass cannon)', () => {
    // Bulwark is the wall among the standard squad (the ace/boss aside): most HP.
    const squad = ARCHETYPES.filter((a) => a !== 'ace')
    expect(ARCHETYPE_STATS.bulwark.maxHealth).toBe(
      Math.max(...squad.map((a) => ARCHETYPE_STATS[a].maxHealth)),
    )
    // Highest armour of all — the wall you flank or delimb.
    expect(ARCHETYPE_STATS.bulwark.armor).toBe(
      Math.max(...ARCHETYPES.map((a) => ARCHETYPE_STATS[a].armor)),
    )
    expect(ARCHETYPE_STATS.bulwark.armor).toBeGreaterThan(ARCHETYPE_STATS.skirmisher.armor)
    // Skirmisher is the fastest, thinnest body.
    expect(ARCHETYPE_STATS.skirmisher.speed).toBe(
      Math.max(...ARCHETYPES.map((a) => ARCHETYPE_STATS[a].speed)),
    )
    expect(ARCHETYPE_STATS.skirmisher.speed).toBeGreaterThan(ARCHETYPE_STATS.bulwark.speed)
  })

  it('gives the bulwark and ace asymmetric arms (shield/missile on one side)', () => {
    // Bulwark: gun on the right, shield on the left (a wall you flank/delimb).
    const bul = ARCHETYPE_LOADOUT.bulwark
    expect(bul.leftArm).toBeDefined()
    expect(bul.leftArm).not.toBe(bul.arm)
    const bulLoadout = archetypeLoadout('bulwark')
    expect(bulLoadout.leftArm!.id).toBe(ARM_PARTS[5].id) // shield-gen
    expect(bulLoadout.rightArm!.id).toBe(ARM_PARTS[0].id) // autocannon

    // Ace: railgun + missile mix, not two of the same arm.
    const aceLoadout = archetypeLoadout('ace')
    expect(aceLoadout.leftArm!.id).not.toBe(aceLoadout.rightArm!.id)
  })

  it('matches archetype chassis to role (skirmisher hover, sniper quad legs)', () => {
    expect(archetypeLoadout('skirmisher').legs!.id).toBe(LEGS_PARTS[2].id) // hover
    expect(archetypeLoadout('sniper').legs!.id).toBe(LEGS_PARTS[3].id) // quad
    expect(archetypeLoadout('sniper').rightArm!.id).toBe(ARM_PARTS[1].id) // railgun
  })
})

describe('weaponProjectileSpeed mapping', () => {
  it('maps energy fast, missile slow, and everything else to the ballistic default', () => {
    expect(weaponProjectileSpeed('energy')).toBe(400)
    expect(weaponProjectileSpeed('missile')).toBe(200)
    expect(weaponProjectileSpeed('ballistic')).toBe(300)
    expect(weaponProjectileSpeed('melee')).toBe(300)
    expect(weaponProjectileSpeed(undefined)).toBe(300)
  })
})

describe('squad caps + combined-arms compositions (§3.6)', () => {
  it('raises the alive cap above the old flat 2 for the harder tiers', () => {
    // §3.6 "raise the cap": hard/boss field real squads.
    expect(maxAliveForDifficulty('hard')).toBeGreaterThan(2)
    expect(maxAliveForDifficulty('boss')).toBeGreaterThan(2)
    expect(maxAliveForDifficulty('boss')).toBeGreaterThanOrEqual(maxAliveForDifficulty('hard'))
  })

  it('composition is non-empty and only ever contains known archetypes', () => {
    for (const d of DIFFICULTIES) {
      const comp = compositionForDifficulty(d)
      expect(comp.length).toBeGreaterThan(0)
      for (const a of comp) expect(ARCHETYPES).toContain(a)
    }
  })

  it('higher tiers field mixed compositions (not N clones of one archetype)', () => {
    expect(new Set(compositionForDifficulty('medium')).size).toBeGreaterThan(1)
    expect(new Set(compositionForDifficulty('hard')).size).toBeGreaterThan(1)
    // A bulwark anchors the harder squads (front of the list spawns first).
    expect(compositionForDifficulty('hard')[0]).toBe('bulwark')
  })

  it('reinforcement pair is exactly two skirmishers (the half-HP ace graft)', () => {
    expect(reinforcementComposition()).toEqual(['skirmisher', 'skirmisher'])
  })
})

// ---------------------------------------------------------------------------
// Cross-path consistency: the ARENA generator must read the shared table, so an
// enemy it spawns is byte-for-byte the module's output. This is the guard that
// makes "one source of truth" enforceable rather than aspirational.
// ---------------------------------------------------------------------------
describe('arena path (useMechBattle.generateEnemy) consumes the unified table', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    ;(globalThis as any).localStorage = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    }
  })
  afterEach(() => {
    delete (globalThis as any).localStorage
    vi.restoreAllMocks()
  })

  it('spawns an enemy whose stats + loadout equal enemyStats/enemyLoadout', async () => {
    const { useMechBattle } = await import('../../../composables/useMechBattle')
    const battle = useMechBattle()
    battle.generateEnemy('medium')
    const enemy = battle.battleState.value.enemy!
    expect(enemy).toBeTruthy()

    // Stats identical to the pure table (proves no inline arena stat block).
    expect(enemy.stats).toEqual(enemyStats('medium'))

    // Loadout parts identical to the pure builder.
    const expected = enemyLoadout('medium')
    expect(enemy.loadout.rightArm?.id).toBe(expected.rightArm?.id)
    expect(enemy.loadout.leftArm?.id).toBe(expected.leftArm?.id)
    expect(enemy.loadout.core?.id).toBe(expected.core?.id)
    expect(enemy.loadout.legs?.id).toBe(expected.legs?.id)
    expect(enemy.loadout.head?.id).toBe(expected.head?.id)
  })

  it('applies the survival stat scale through the same scaleStats path', async () => {
    const { useMechBattle } = await import('../../../composables/useMechBattle')
    const battle = useMechBattle()
    battle.generateEnemy('easy', undefined, { statScale: 2 })
    expect(battle.battleState.value.enemy!.stats).toEqual(enemyStats('easy', 2))
  })
})
