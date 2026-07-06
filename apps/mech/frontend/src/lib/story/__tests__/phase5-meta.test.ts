import { describe, it, expect } from 'vitest'
import {
  createFreshRun,
  createNewGamePlusRun,
  handlePlayerDefeated,
  serializeRun,
  deserializeRun,
  actLabelFor,
  DEATH_SALVAGE_LOSS_FRACTION,
  DEATH_SALVAGE_LOSS_FRACTION_IRONMAN,
  HAPPY_STANDING_THRESHOLD,
  type StoryRun,
} from '../../../composables/useStoryMode'
import { motionScale } from '../../../composables/useGameSettings'
import { ngPlusEnemyScale } from '../StoryCombat'

// ============================================================================
// Phase 5 META & POLISH — Ironman, New Game+, save-shape, reduced motion.
// ============================================================================

describe('Ironman flag (§5)', () => {
  it('defaults off; opts in via createFreshRun options', () => {
    expect(createFreshRun(1000).ironman).toBe(false)
    expect(createFreshRun(1000, { ironman: true }).ironman).toBe(true)
  })

  it('doubles the salvage loss on a downing (50% vs the normal 25%)', () => {
    const normal = createFreshRun(1000)
    normal.salvage = 1000
    const normalResult = handlePlayerDefeated(normal)
    expect(normalResult.salvageLost).toBe(Math.floor(1000 * DEATH_SALVAGE_LOSS_FRACTION))
    expect(normalResult.salvageLost).toBe(250)

    const iron = createFreshRun(1000, { ironman: true })
    iron.salvage = 1000
    const ironResult = handlePlayerDefeated(iron)
    expect(ironResult.salvageLost).toBe(Math.floor(1000 * DEATH_SALVAGE_LOSS_FRACTION_IRONMAN))
    expect(ironResult.salvageLost).toBe(500)
    expect(iron.salvage).toBe(500)
  })

  it('is otherwise a normal downing — still not a game-over (downed:true)', () => {
    const iron = createFreshRun(1000, { ironman: true })
    iron.salvage = 40
    const result = handlePlayerDefeated(iron)
    expect(result.downed).toBe(true)
  })
})

describe('New Game+ carry-over (§5)', () => {
  function finishedRun(): StoryRun {
    const prev = createFreshRun(1000, { ironman: true })
    prev.salvage = 777
    prev.commandRep = 90
    prev.townRep = 20
    prev.inventory = [{ instanceId: 'inst-0', partId: prev.loadout.core!.id, condition: 'pristine' }]
    prev.stats.moneyEarned = 5000
    prev.stats.questsCompleted = 9
    prev.realElapsedSec = 1234
    prev.storyFlags = ['refused-order', 'beat:arrival']
    prev.towns[0].standing = HAPPY_STANDING_THRESHOLD
    prev.towns[0].condition = 30
    prev.phase = 'ended'
    prev.chapter = 'act3'
    return prev
  }

  it('carries loadout / inventory / salvage / both reps / Ironman, and bumps the cycle', () => {
    const prev = finishedRun()
    const ng = createNewGamePlusRun(prev, 2000)
    expect(ng.salvage).toBe(777)
    expect(ng.commandRep).toBe(90)
    expect(ng.townRep).toBe(20)
    expect(ng.inventory).toHaveLength(1)
    expect(ng.inventory[0].partId).toBe(prev.loadout.core!.id)
    expect(ng.loadout.core?.id).toBe(prev.loadout.core?.id)
    expect(ng.ironman).toBe(true)
    expect(ng.ngPlusLevel).toBe(1)
  })

  it('resets the world — towns, phase, acts, flags, elapsed time all start over', () => {
    const prev = finishedRun()
    const ng = createNewGamePlusRun(prev, 2000)
    expect(ng.phase).toBe('exploring')
    expect(ng.chapter).toBe('act1')
    expect(ng.storyFlags).toEqual([])
    expect(ng.realElapsedSec).toBe(0)
    expect(ng.towns.every((t) => t.condition === 100 && t.standing === 0)).toBe(true)
    expect(ng.stats.questsCompleted).toBe(0)
    // Gross lifetime earnings carry so the tribunal service record is cumulative.
    expect(ng.stats.moneyEarned).toBe(5000)
  })

  it('stacks the cycle counter across successive NG+ runs', () => {
    const c1 = createNewGamePlusRun(finishedRun())
    const c2 = createNewGamePlusRun(c1)
    expect(c1.ngPlusLevel).toBe(1)
    expect(c2.ngPlusLevel).toBe(2)
  })
})

describe('save-shape: Ironman + NG+ are additive optional fields (no version bump)', () => {
  it('round-trips ironman + ngPlusLevel', () => {
    const run = createFreshRun(1000, { ironman: true, ngPlusLevel: 3 })
    run.salvage = 42
    const restored = deserializeRun(serializeRun(run))
    expect(restored).not.toBeNull()
    expect(restored!.ironman).toBe(true)
    expect(restored!.ngPlusLevel).toBe(3)
    expect(restored!.version).toBe(run.version) // unchanged
  })

  it('a pre-Phase-5 v3 save (no meta fields) loads as a normal, first-cycle run', () => {
    const run = createFreshRun(1000) as unknown as Record<string, unknown>
    delete run.ironman
    delete run.ngPlusLevel
    const restored = deserializeRun(JSON.stringify({ ...run, loadout: {
      core: null, legs: null, head: null, leftArm: null, rightArm: null, rack: null,
    } }))
    expect(restored).not.toBeNull()
    expect(restored!.ironman).toBe(false)
    expect(restored!.ngPlusLevel).toBe(0)
  })

  it('still rejects an unknown/future schema version', () => {
    expect(deserializeRun(JSON.stringify({ version: 99, towns: [] }))).toBeNull()
  })
})

describe('actLabelFor — home-menu Continue card (§5)', () => {
  it('maps phase/chapter the same way the in-world HUD does', () => {
    expect(actLabelFor('exploring', 'act1')).toContain('Act I')
    expect(actLabelFor('exploring', 'act2')).toContain('Act II')
    expect(actLabelFor('finale', 'act3')).toContain('Act III')
    expect(actLabelFor('ended', 'act3')).toBe('Tribunal')
  })
})

describe('New Game+ enemy scaling (§5) — the cycle actually gets harder', () => {
  it('is a no-op on the first cycle (level 0 → 1.0)', () => {
    expect(ngPlusEnemyScale(0)).toBe(1)
  })

  it('adds one difficulty tier (~0.15) of toughness per cycle, monotonically', () => {
    expect(ngPlusEnemyScale(1)).toBeCloseTo(1.15)
    expect(ngPlusEnemyScale(2)).toBeCloseTo(1.3)
    expect(ngPlusEnemyScale(3)).toBeGreaterThan(ngPlusEnemyScale(2))
  })

  it('clamps garbage/negative input to the first-cycle baseline', () => {
    expect(ngPlusEnemyScale(-5)).toBe(1)
    expect(ngPlusEnemyScale(1.9)).toBeCloseTo(1.15) // floored to 1
  })
})

describe('reduced motion — scene effect multiplier (§5 polish)', () => {
  it('is 0 when reduced motion is on, 1 otherwise', () => {
    expect(motionScale({ reducedMotion: true })).toBe(0)
    expect(motionScale({ reducedMotion: false })).toBe(1)
  })
})
