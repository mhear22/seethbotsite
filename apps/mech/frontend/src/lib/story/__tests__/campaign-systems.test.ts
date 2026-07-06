/**
 * Phase 3 — CAMPAIGN SYSTEMS cluster (design §3.5, §3.7, §2.5). Pure/state
 * coverage for the consequence economy and stakes this cluster owns:
 *   - chapter (act) derivation + story flags
 *   - two-axis reputation: clamp/adjust, shop-tier depth (per-town standing) vs
 *     rep-gated restricted hardware + price modifiers (global)
 *   - the gentle collateral tax math + the clean-vs-sloppy severity budget
 *   - death stakes (salvage loss, town hit, limb repair debt)
 *   - the dialogue evaluation helpers (isChoiceAvailable / applyEffects /
 *     evaluateChoice) against run-shaped state
 *   - THE FINALE-GATE REGRESSION: rep swings must NOT move isFinaleUnlocked.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  createFreshRun,
  deriveChapter,
  hasFlag,
  setFlag,
  clampRep,
  adjustRep,
  shopTier,
  partShopTier,
  isPartStocked,
  partRepAxis,
  isPartRepUnlocked,
  repPriceModifier,
  applyCollateral,
  handlePlayerDefeated,
  isFinaleUnlocked,
  happyTownCount,
  useStoryMode,
  REP_START,
  MILITARY_REP_UNLOCK,
  CIVILIAN_REP_UNLOCK,
  SHOP_TIER_T2_STANDING,
  SHOP_TIER_T3_STANDING,
  DEATH_SALVAGE_LOSS_FRACTION,
  DEATH_TOWN_CONDITION_HIT,
  DEATH_STANDING_HIT,
  COLLATERAL_CONDITION_PER_SEVERITY,
  COLLATERAL_SEVERITY_PER_PLAYER_HIT,
  COLLATERAL_SEVERITY_PER_COMBAT_SECOND,
  COLLATERAL_SEVERITY_PER_PLAYER_SHOT,
  COLLATERAL_SEVERITY_PER_ENEMY_KILL,
  repairPrice,
  type StoryRun,
} from '../../../composables/useStoryMode'
import {
  isChoiceAvailable,
  applyEffects,
  evaluateChoice,
  type DialogueChoice,
  type DialogueState,
} from '../dialogue'
import { findPartById } from '../../../shared/data/MechParts'

function installMemoryStorage() {
  const store = new Map<string, string>()
  ;(globalThis as { localStorage?: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size
    },
  } as Storage
}

// ===========================================================================
describe('chapter (act) derivation + flags (§2.5)', () => {
  it('maps phase + progress onto the three acts', () => {
    expect(deriveChapter('exploring', 0)).toBe('act1') // Deployment
    expect(deriveChapter('exploring', 1)).toBe('act2') // The Grind
    expect(deriveChapter('finale', 9)).toBe('act3') // The Order
    expect(deriveChapter('ended', 9)).toBe('act3') // Tribunal
  })

  it('raises flags idempotently', () => {
    const run = createFreshRun(1)
    expect(hasFlag(run, 'met-rooker')).toBe(false)
    setFlag(run, 'met-rooker')
    setFlag(run, 'met-rooker')
    expect(run.storyFlags).toEqual(['met-rooker'])
    expect(hasFlag(run, 'met-rooker')).toBe(true)
  })
})

// ===========================================================================
describe('two-axis reputation (§3.7)', () => {
  it('clamps rep into 0..100', () => {
    expect(clampRep(-5)).toBe(0)
    expect(clampRep(140)).toBe(100)
    expect(clampRep(50)).toBe(50)
  })

  it('adjusts either/both axes independently, clamped', () => {
    const run = createFreshRun(1)
    adjustRep(run, { commandRep: 30 })
    expect(run.commandRep).toBe(80)
    expect(run.townRep).toBe(REP_START) // untouched
    adjustRep(run, { commandRep: 40, townRep: -70 })
    expect(run.commandRep).toBe(100) // clamped
    expect(run.townRep).toBe(0) // clamped
  })

  it('shop DEPTH is gated by per-town standing (T1 always, T2/T3 with standing)', () => {
    expect(shopTier(0)).toBe(1)
    expect(shopTier(SHOP_TIER_T2_STANDING)).toBe(2)
    expect(shopTier(SHOP_TIER_T3_STANDING)).toBe(3)
    // A common part is stocked everywhere; a rare part only at T3 standing.
    const common = findPartById('arm-autocannon-mk1')!
    const rare = findPartById('arm-railgun')!
    expect(partShopTier(common)).toBe(1)
    expect(partShopTier(rare)).toBe(3)
    expect(isPartStocked(rare, 0)).toBe(false)
    expect(isPartStocked(rare, SHOP_TIER_T3_STANDING)).toBe(true)
    expect(isPartStocked(common, 0)).toBe(true)
  })

  it('restricted hardware is rep-gated on the matching GLOBAL axis', () => {
    const railgun = findPartById('arm-railgun')! // rare energy -> Command
    const fusion = findPartById('core-fusion')! // legendary energy -> Command
    const shield = findPartById('arm-shield-gen')! // rare support -> Town
    const repair = findPartById('rack-repair-drone')! // legendary support -> Town
    const common = findPartById('arm-autocannon-mk1')! // common -> ungated

    expect(partRepAxis(railgun)).toBe('command')
    expect(partRepAxis(fusion)).toBe('command')
    expect(partRepAxis(shield)).toBe('town')
    expect(partRepAxis(repair)).toBe('town')
    expect(partRepAxis(common)).toBeNull()

    // Command hardware needs commandRep; Town hardware needs townRep.
    expect(isPartRepUnlocked(railgun, MILITARY_REP_UNLOCK, 0)).toBe(true)
    expect(isPartRepUnlocked(railgun, MILITARY_REP_UNLOCK - 1, 100)).toBe(false)
    expect(isPartRepUnlocked(shield, 0, CIVILIAN_REP_UNLOCK)).toBe(true)
    expect(isPartRepUnlocked(shield, 100, CIVILIAN_REP_UNLOCK - 1)).toBe(false)
    // Ungated parts are always buyable regardless of rep.
    expect(isPartRepUnlocked(common, 0, 0)).toBe(true)
  })

  it('rep discounts/surcharges a restricted part on its axis; neutral at start', () => {
    const railgun = findPartById('arm-railgun')! // command axis
    const common = findPartById('arm-autocannon-mk1')!
    expect(repPriceModifier(railgun, REP_START, REP_START)).toBeCloseTo(1, 5)
    expect(repPriceModifier(railgun, 100, REP_START)).toBeLessThan(1) // maxed -> discount
    expect(repPriceModifier(railgun, 0, REP_START)).toBeGreaterThan(1) // tanked -> surcharge
    // Town rep must not move a command-axis part's price.
    expect(repPriceModifier(railgun, REP_START, 100)).toBeCloseTo(1, 5)
    // Ungated parts never move.
    expect(repPriceModifier(common, 0, 0)).toBe(1)
  })
})

// ===========================================================================
describe('collateral tax (§3.5) — gentle, dominated by hits + time', () => {
  it('firing and kills are explicitly zero-severity (never taxed)', () => {
    expect(COLLATERAL_SEVERITY_PER_PLAYER_SHOT).toBe(0)
    expect(COLLATERAL_SEVERITY_PER_ENEMY_KILL).toBe(0)
  })

  it('is a one-way condition ratchet driven by emitted severity', () => {
    const run = createFreshRun(1)
    const before = run.towns[0].condition
    const after = applyCollateral(run, 'town-0', 4)!
    expect(after).toBeCloseTo(before - 4 * COLLATERAL_CONDITION_PER_SEVERITY, 5)
    // Zero / negative severity is a no-op; unknown town is undefined.
    expect(applyCollateral(run, 'town-0', 0)).toBe(after)
    expect(applyCollateral(run, 'nope', 5)).toBeUndefined()
    // Re-derives population/farms from the new condition.
    expect(run.towns[0].population.current).toBeLessThanOrEqual(run.towns[0].population.initial)
  })

  it('a clean fast fight costs a town < 1 condition; a full sloppy fight < ~8', () => {
    // Model the event mix from the documented contract. Each event is
    // distance-tapered at emission; use a representative 0.6 proximity factor.
    const proximity = 0.6
    const budget = (playerHits: number, combatSeconds: number) =>
      (playerHits * COLLATERAL_SEVERITY_PER_PLAYER_HIT +
        combatSeconds * COLLATERAL_SEVERITY_PER_COMBAT_SECOND) *
      proximity

    // CLEAN: dodge everything (0 hits), end it fast (~6s).
    const clean = createFreshRun(1)
    const cleanCost = clean.towns[0].condition - applyCollateral(clean, 'town-0', budget(0, 6))!
    expect(cleanCost).toBeLessThan(1)

    // SLOPPY: tank a lot of hits (~16) over a drawn-out fight (~35s).
    const sloppy = createFreshRun(1)
    const sloppyCost = sloppy.towns[0].condition - applyCollateral(sloppy, 'town-0', budget(16, 35))!
    expect(sloppyCost).toBeLessThan(8)
    // ...and sloppy is meaningfully worse than clean, so skill = mercy is legible.
    expect(sloppyCost).toBeGreaterThan(cleanCost * 4)
  })
})

// ===========================================================================
describe('death stakes (§3.7) — downed, not game-over', () => {
  it('loses 25% salvage, hits the defended town, and racks limb repair debt', () => {
    const run = createFreshRun(1)
    run.salvage = 1000
    run.towns[0].standing = 60
    const startCondition = run.towns[0].condition
    // Player died with the left arm (autocannon) shot off.
    const result = handlePlayerDefeated(run, 'town-0', ['leftArm'])

    expect(result.downed).toBe(true)
    expect(result.salvageLost).toBe(Math.floor(1000 * DEATH_SALVAGE_LOSS_FRACTION))
    expect(run.salvage).toBe(1000 - result.salvageLost)
    expect(result.townConditionHit).toBe(DEATH_TOWN_CONDITION_HIT)
    expect(run.towns[0].condition).toBe(startCondition - DEATH_TOWN_CONDITION_HIT)
    expect(result.standingHit).toBe(DEATH_STANDING_HIT)
    expect(run.towns[0].standing).toBe(60 - DEATH_STANDING_HIT)

    // The destroyed arm was stripped into inventory as damaged (repair debt),
    // and the loadout slot emptied so it must be repaired + refit before redeploy.
    expect(result.damagedSlots).toEqual(['leftArm'])
    const autocannon = findPartById('arm-autocannon-mk1')!
    expect(result.repairFeeOwed).toBe(repairPrice(autocannon))
    expect(run.loadout.leftArm).toBeNull()
    const wreck = run.inventory.find((i) => i.partId === 'arm-autocannon-mk1')
    expect(wreck?.condition).toBe('damaged')
  })

  it('a townless defeat (free roam) still bleeds salvage but hits no town', () => {
    const run = createFreshRun(1)
    run.salvage = 400
    const result = handlePlayerDefeated(run)
    expect(result.salvageLost).toBe(Math.floor(400 * DEATH_SALVAGE_LOSS_FRACTION))
    expect(result.townConditionHit).toBe(0)
    expect(result.standingHit).toBe(0)
    expect(result.damagedSlots).toEqual([])
  })
})

// ===========================================================================
describe('dialogue evaluation helpers (shared contract)', () => {
  const state = (over: Partial<DialogueState> = {}): DialogueState => ({
    storyFlags: [],
    commandRep: REP_START,
    townRep: REP_START,
    ...over,
  })

  it('gates choices on flags + rep minimums', () => {
    const flagged: DialogueChoice = { text: 'x', requires: { flag: 'saw-kestrel' } }
    expect(isChoiceAvailable(flagged, state())).toBe(false)
    expect(isChoiceAvailable(flagged, state({ storyFlags: ['saw-kestrel'] }))).toBe(true)

    const cmdGate: DialogueChoice = { text: 'y', requires: { minCommandRep: 70 } }
    expect(isChoiceAvailable(cmdGate, state({ commandRep: 69 }))).toBe(false)
    expect(isChoiceAvailable(cmdGate, state({ commandRep: 70 }))).toBe(true)

    const noReq: DialogueChoice = { text: 'z' }
    expect(isChoiceAvailable(noReq, state())).toBe(true)
  })

  it('applyEffects raises flags and adjusts rep (clamped), returning action + next', () => {
    const s = state({ commandRep: 90 })
    const choice: DialogueChoice = {
      text: 'Negative. I am clearing those towns.',
      next: 'refuse',
      effects: { action: 'refuseOrder', setFlags: ['refused-order'], commandRep: -25, townRep: 20 },
    }
    const res = applyEffects(s, choice)
    expect(s.storyFlags).toEqual(['refused-order'])
    expect(s.commandRep).toBe(65)
    expect(s.townRep).toBe(70)
    expect(res.action).toBe('refuseOrder')
    expect(res.next).toBe('refuse')
  })

  it('evaluateChoice is a guarded apply: a gated choice never mutates state', () => {
    const s = state()
    const gated: DialogueChoice = {
      text: 'locked',
      requires: { minTownRep: 80 },
      effects: { townRep: 50, setFlags: ['should-not-set'] },
    }
    const evaluation = evaluateChoice(s, gated)
    expect(evaluation.available).toBe(false)
    expect(evaluation.result).toBeUndefined()
    expect(s.townRep).toBe(REP_START) // untouched
    expect(s.storyFlags).toEqual([]) // untouched
  })

  it('StoryRun is structurally usable as dialogue state (systems seam)', () => {
    const run = createFreshRun(1)
    const choice: DialogueChoice = { text: 'ok', effects: { commandRep: 5, setFlags: ['f'] } }
    // The composable passes its run straight into the helpers.
    const evaluation = evaluateChoice(run, choice)
    expect(evaluation.available).toBe(true)
    expect(run.commandRep).toBe(REP_START + 5)
    expect(run.storyFlags).toEqual(['f'])
  })
})

// ===========================================================================
// THE LOAD-BEARING REGRESSION (§3.7 mandatory mitigation): the finale gate must
// derive from PER-TOWN standing only. Swinging the new global rep axes to their
// extremes must not change happyTownCount / isFinaleUnlocked in either direction.
describe('finale gate is invariant to the reputation split (regression)', () => {
  it('rep swings never move isFinaleUnlocked / happyTownCount', () => {
    const towns: StoryRun['towns'] = createFreshRun(1).towns
    // Three towns happy by standing -> finale unlocked, regardless of rep.
    towns[0].standing = 100
    towns[1].standing = 100
    towns[2].standing = 100
    const baseHappy = happyTownCount(towns)
    const baseUnlocked = isFinaleUnlocked(towns)
    expect(baseUnlocked).toBe(true)

    // The gate reads only `standing`; prove that no rep value could flip it by
    // exercising the pure gate across the full 0..100 rep range on a run.
    for (const commandRep of [0, 50, 100]) {
      for (const townRep of [0, 50, 100]) {
        const run = createFreshRun(1)
        run.commandRep = commandRep
        run.townRep = townRep
        run.towns[0].standing = 100
        run.towns[1].standing = 100
        run.towns[2].standing = 100
        expect(happyTownCount(run.towns)).toBe(baseHappy)
        expect(isFinaleUnlocked(run.towns)).toBe(baseUnlocked)
      }
    }
  })

  it('through the composable: maxing/tanking rep leaves phase progression identical', () => {
    installMemoryStorage()
    const drive = (commandRep: number, townRep: number) => {
      const story = useStoryMode()
      story.newRun()
      story.adjustReputation({ commandRep: commandRep - REP_START, townRep: townRep - REP_START })
      // Help three towns -> the finale must unlock purely on standing.
      for (let t = 0; t < 3; t++) {
        const id = story.towns.value[t].id
        for (let q = 0; q < 3; q++) story.finishActiveQuest(story.getCurrentQuest(id)!)
      }
      return story.phase.value
    }
    expect(drive(100, 0)).toBe('finale') // all Command, no Town
    expect(drive(0, 100)).toBe('finale') // all Town, no Command
    expect(drive(50, 50)).toBe('finale') // neutral
  })
})

// ===========================================================================
describe('composable seams (Phase 3 wrappers persist + expose state)', () => {
  beforeEach(installMemoryStorage)

  it('applyTownCollateral, adjustReputation, raiseFlag, playerDefeated persist', () => {
    const story = useStoryMode()
    story.newRun()
    story.addSalvage(800)

    story.adjustReputation({ commandRep: 10, townRep: -5 })
    story.raiseFlag('deployed')
    story.applyTownCollateral('town-0', 4)
    const townId = story.towns.value[0].id
    const defeat = story.playerDefeated(townId, [])

    expect(story.commandRep.value).toBe(REP_START + 10)
    expect(story.townRep.value).toBe(REP_START - 5)
    expect(story.hasStoryFlag('deployed')).toBe(true)
    expect(defeat.salvageLost).toBeGreaterThan(0)

    // A reload sees every mutation (all wrappers saved).
    const reloaded = useStoryMode()
    expect(reloaded.load()).toBe(true)
    expect(reloaded.commandRep.value).toBe(REP_START + 10)
    expect(reloaded.townRep.value).toBe(REP_START - 5)
    expect(reloaded.storyFlags.value).toContain('deployed')
    expect(reloaded.salvage.value).toBe(story.salvage.value)
  })

  it('chapter tracks the phase machine as quests complete', () => {
    const story = useStoryMode()
    story.newRun()
    expect(story.chapter.value).toBe('act1') // Deployment: nothing done
    // Finish one quest -> still exploring but now The Grind.
    const id = story.towns.value[0].id
    story.finishActiveQuest(story.getCurrentQuest(id)!)
    expect(story.chapter.value).toBe('act2')
  })
})
