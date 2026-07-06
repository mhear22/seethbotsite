import { describe, it, expect, beforeEach } from 'vitest'
import {
  applyDecay,
  isHappy,
  standingPerQuest,
  happyTownCount,
  isFinaleUnlocked,
  finaleTargets,
  farmsAliveForCondition,
  populationForCondition,
  buildStarterLoadout,
  isLoadoutValid,
  loadoutInvalidReason,
  computeCombatStats,
  createFreshRun,
  serializeRun,
  deserializeRun,
  townSpawnPosition,
  townIndexFromId,
  questForTown,
  buildTownDamageReport,
  averageDestruction,
  verdictForDamage,
  verdictFlavor,
  useStoryMode,
  DECAY_PER_SECOND,
  HAPPY_STANDING_THRESHOLD,
  FINALE_UNLOCK_HAPPY_TOWNS,
  QUESTS_PER_CHAIN,
  TOWN_COUNT,
  WORLD_HALF_EXTENT,
  type TownState,
} from '../../../composables/useStoryMode'
import { findPartById } from '../../../shared/data/MechParts'
import { partPrice, isFinaleBoss, buildFinaleBoss, buildQuest, FINALE_BOSS_REWARD } from '../quests'

describe('story decay math', () => {
  it('decays condition by the configured rate while present', () => {
    expect(applyDecay(100, 10)).toBeCloseTo(100 - 10 * DECAY_PER_SECOND, 5)
  })

  it('is a one-way ratchet that never increases', () => {
    expect(applyDecay(50, -100)).toBe(50)
    expect(applyDecay(50, 0)).toBe(50)
  })

  it('floors at zero (fully destroyable)', () => {
    expect(applyDecay(1, 10_000)).toBe(0)
  })
})

describe('happiness + finale unlock', () => {
  it('marks a town happy only at/above the standing threshold', () => {
    expect(isHappy({ standing: HAPPY_STANDING_THRESHOLD - 1 })).toBe(false)
    expect(isHappy({ standing: HAPPY_STANDING_THRESHOLD })).toBe(true)
  })

  it('a full quest chain reaches the happy threshold', () => {
    const perQuest = standingPerQuest(QUESTS_PER_CHAIN)
    expect(perQuest * QUESTS_PER_CHAIN).toBeCloseTo(HAPPY_STANDING_THRESHOLD, 5)
  })

  it('unlocks the finale at the required number of happy towns', () => {
    const towns = Array.from({ length: 5 }, () => ({ standing: 0 }))
    expect(isFinaleUnlocked(towns)).toBe(false)
    for (let i = 0; i < FINALE_UNLOCK_HAPPY_TOWNS; i++) towns[i].standing = 100
    expect(happyTownCount(towns)).toBe(FINALE_UNLOCK_HAPPY_TOWNS)
    expect(isFinaleUnlocked(towns)).toBe(true)
  })

  it('finale targets are towns not helped and not cleared', () => {
    const towns = [
      { standing: 100, cleared: false }, // happy -> not a target
      { standing: 0, cleared: true },    // cleared -> not a target
      { standing: 0, cleared: false },   // target
    ]
    const targets = finaleTargets(towns)
    expect(targets).toHaveLength(1)
    expect(targets[0]).toBe(towns[2])
  })
})

describe('condition-driven counts', () => {
  it('scales farms and population linearly with condition', () => {
    expect(farmsAliveForCondition(100, 2)).toBe(2)
    expect(farmsAliveForCondition(0, 2)).toBe(0)
    expect(populationForCondition(50, 12)).toBe(6)
  })
})

describe('starter loadout', () => {
  it('produces a valid loadout (core/legs/head + weapon + non-negative energy)', () => {
    const loadout = buildStarterLoadout()
    expect(loadout.core).not.toBeNull()
    expect(loadout.legs).not.toBeNull()
    expect(loadout.head).not.toBeNull()
    expect(loadout.leftArm ?? loadout.rightArm).not.toBeNull()
    expect(isLoadoutValid(loadout)).toBe(true)
  })
})

describe('run factory + serialization', () => {
  it('creates a fresh run with the right number of towns', () => {
    const run = createFreshRun(1000)
    expect(run.towns).toHaveLength(TOWN_COUNT)
    expect(run.phase).toBe('exploring')
    expect(run.salvage).toBe(0)
    // v3 defaults: neutral two-axis rep, act1, no flags.
    expect(run.commandRep).toBe(50)
    expect(run.townRep).toBe(50)
    expect(run.chapter).toBe('act1')
    expect(run.storyFlags).toEqual([])
    expect(run.towns.every((t) => t.condition === 100 && t.standing === 0)).toBe(true)
  })

  it('round-trips through serialize/deserialize preserving loadout part ids', () => {
    const run = createFreshRun(2000)
    run.salvage = 500
    run.towns[0].condition = 42
    const restored = deserializeRun(serializeRun(run))
    expect(restored).not.toBeNull()
    expect(restored!.salvage).toBe(500)
    expect(restored!.towns[0].condition).toBe(42)
    expect(restored!.loadout.core?.id).toBe(run.loadout.core?.id)
    expect(restored!.loadout.leftArm?.id).toBe(run.loadout.leftArm?.id)
  })

  it('rejects malformed save data', () => {
    expect(deserializeRun('not json')).toBeNull()
    expect(deserializeRun(JSON.stringify({ version: 99 }))).toBeNull()
  })

  it('produces deterministic, in-bounds town positions', () => {
    const a = townSpawnPosition(0)
    const b = townSpawnPosition(0)
    expect(a).toEqual(b)
    // Towns sit on rings scaled off WORLD_HALF_EXTENT (outer ring = 0.78×), so
    // they must stay strictly inside the world bound — not a hard-coded radius.
    for (let i = 0; i < TOWN_COUNT; i++) {
      const [x, , z] = townSpawnPosition(i)
      expect(Math.abs(x)).toBeLessThan(WORLD_HALF_EXTENT)
      expect(Math.abs(z)).toBeLessThan(WORLD_HALF_EXTENT)
    }
  })
})

describe('quest helpers', () => {
  it('parses a numeric town index from its id', () => {
    expect(townIndexFromId('town-3')).toBe(3)
    expect(townIndexFromId('bogus')).toBe(-1)
  })

  it('returns the town’s current quest, null once the chain is done', () => {
    expect(questForTown({ id: 'town-0', questIndex: 0 })?.id).toBe('town-0-quest-0')
    expect(questForTown({ id: 'town-0', questIndex: QUESTS_PER_CHAIN })).toBeNull()
  })
})

describe('loadout validation + combat stats', () => {
  it('flags invalid loadouts with a human reason', () => {
    const starter = buildStarterLoadout()
    expect(loadoutInvalidReason(starter)).toBe('')
    expect(loadoutInvalidReason({ ...starter, core: null })).toMatch(/core/i)
    expect(loadoutInvalidReason({ ...starter, leftArm: null, rightArm: null })).toMatch(/weapon/i)
  })

  it('computes playable combat stats with floors applied', () => {
    const stats = computeCombatStats(buildStarterLoadout())
    expect(stats.maxHealth).toBeGreaterThanOrEqual(100)
    expect(stats.energy).toBeGreaterThanOrEqual(50)
    expect(stats.currentHealth).toBe(stats.maxHealth)
  })
})

describe('composable: quests + garage', () => {
  // The test env is `node` (see vitest.config.ts), so provide a tiny in-memory
  // localStorage so the composable's persistence calls succeed.
  beforeEach(() => {
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
  })

  it('completing a quest pays money + raises standing + advances the chain', () => {
    const story = useStoryMode()
    story.newRun()
    const town = story.towns.value[0]
    const quest = story.getCurrentQuest(town.id)!
    story.startQuest(quest)
    expect(story.activeQuest.value?.id).toBe(quest.id)

    const moneyBefore = story.money.value
    story.finishActiveQuest(quest)

    const updated = story.getTown(town.id)!
    expect(story.money.value).toBe(moneyBefore + quest.reward)
    expect(updated.questIndex).toBe(1)
    expect(updated.standing).toBeCloseTo(standingPerQuest(QUESTS_PER_CHAIN), 5)
    expect(story.activeQuest.value).toBeNull()
  })

  it('finishActiveQuest honours a degraded reward override (§5 escort attrition)', () => {
    const story = useStoryMode()
    story.newRun()
    const town = story.towns.value[0]
    const quest = story.getCurrentQuest(town.id)!
    story.startQuest(quest)

    const moneyBefore = story.money.value
    // A partial escort pays a fraction of the base reward; the chain still advances.
    const degraded = Math.round(quest.reward * 0.5)
    story.finishActiveQuest(quest, degraded)

    expect(story.money.value).toBe(moneyBefore + degraded)
    expect(story.getTown(town.id)!.questIndex).toBe(1) // still advanced
    expect(story.activeQuest.value).toBeNull()
  })

  it('an ace_hunt kill counts toward the boss tally like a Sanction (§5.4)', () => {
    const story = useStoryMode()
    story.newRun()
    // A later town (Kiln, index 2) authors an ace_hunt in its boss slot.
    const town = story.towns.value[2]
    const before = story.stats.value.bossesDefeated
    let sawAce = false
    for (let q = 0; q < QUESTS_PER_CHAIN; q++) {
      const quest = story.getCurrentQuest(town.id)!
      if (quest.type === 'ace_hunt') sawAce = true
      story.finishActiveQuest(quest)
    }
    expect(sawAce).toBe(true) // guards the fixture: Kiln really does field an ace
    expect(story.stats.value.bossesDefeated).toBe(before + 1)
  })

  it('a full chain makes the town happy and unlocks the finale at 3 towns', () => {
    const story = useStoryMode()
    story.newRun()
    for (let t = 0; t < FINALE_UNLOCK_HAPPY_TOWNS; t++) {
      const town = story.towns.value[t]
      for (let q = 0; q < QUESTS_PER_CHAIN; q++) {
        const quest = story.getCurrentQuest(town.id)!
        story.finishActiveQuest(quest)
      }
      expect(isHappy(story.getTown(town.id)!)).toBe(true)
    }
    expect(story.happyCount.value).toBe(FINALE_UNLOCK_HAPPY_TOWNS)
    expect(story.phase.value).toBe('finale')
  })

  it('buyAndEquip spends money, equips, and keeps the loadout legal', () => {
    const story = useStoryMode()
    story.newRun()
    story.addMoney(8000)
    // A high-energy core first so a draw-heavy weapon stays within budget.
    const fusion = findPartById('core-fusion')!
    expect(story.buyAndEquip(fusion, 'core').ok).toBe(true)

    const railgun = findPartById('arm-railgun')!
    const price = partPrice(railgun)
    const before = story.money.value
    const result = story.buyAndEquip(railgun, 'rightArm')
    expect(result.ok).toBe(true)
    expect(story.money.value).toBe(before - price)
    expect(story.run.value?.loadout.rightArm?.id).toBe('arm-railgun')
    expect(isLoadoutValid(story.run.value!.loadout)).toBe(true)
  })

  it('buyAndEquip refuses when too poor and never deducts money', () => {
    const story = useStoryMode()
    story.newRun() // money starts at 0
    const railgun = findPartById('arm-railgun')!
    const result = story.buyAndEquip(railgun, 'rightArm')
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/not enough/i)
    expect(story.money.value).toBe(0)
  })

  it('buyAndEquip rejects an illegal result (e.g. dropping the only weapon)', () => {
    const story = useStoryMode()
    story.newRun()
    story.addMoney(5000)
    // Starter has only a left arm weapon; equipping the support shield there
    // would leave no weapon -> rejected, money untouched.
    const shield = findPartById('arm-shield-gen')!
    const before = story.money.value
    const result = story.buyAndEquip(shield, 'leftArm')
    expect(result.ok).toBe(false)
    expect(story.money.value).toBe(before)
  })
})

// ---------------------------------------------------------------------------
// Phase 4: finale + credits (pure logic)
// ---------------------------------------------------------------------------

/** Install a tiny in-memory localStorage so the node test env can persist. */
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

/** Drive a town's whole chain to happy (helped). */
function helpTown(story: ReturnType<typeof useStoryMode>, townId: string) {
  for (let q = 0; q < QUESTS_PER_CHAIN; q++) {
    const quest = story.getCurrentQuest(townId)!
    story.finishActiveQuest(quest)
  }
}

describe('finale orchestration', () => {
  beforeEach(installMemoryStorage)

  it('finale boss quests are tagged and scaled beyond chain bosses', () => {
    const boss = buildFinaleBoss('town-2', 2)
    expect(isFinaleBoss(boss)).toBe(true)
    expect(boss.type).toBe('boss_hunt')
    expect(boss.reward).toBe(FINALE_BOSS_REWARD)
    // Tougher than the toughest chain boss (chain bossScale tops out ~1.5).
    expect(boss.bossScale!).toBeGreaterThan(1.5)
    // A regular chain quest id is NOT a finale boss.
    expect(isFinaleBoss(buildQuest('town-0', 0, 0))).toBe(false)
  })

  it('beginFinale flips to finale and returns the un-helped towns as targets', () => {
    const story = useStoryMode()
    story.newRun()
    helpTown(story, 'town-0')
    helpTown(story, 'town-1')
    helpTown(story, 'town-2') // 3 happy -> finale unlocks
    expect(story.phase.value).toBe('finale')

    const targets = story.beginFinale()
    expect(story.phase.value).toBe('finale')
    // Two un-helped towns remain (5 total - 3 helped).
    expect(targets).toHaveLength(TOWN_COUNT - FINALE_UNLOCK_HAPPY_TOWNS)
    expect(targets.every((t) => !isHappy(t) && !t.cleared)).toBe(true)
  })

  it('clearing every finale boss ends the run', () => {
    const story = useStoryMode()
    story.newRun()
    helpTown(story, 'town-0')
    helpTown(story, 'town-1')
    helpTown(story, 'town-2')
    story.beginFinale()

    const targets = story.remainingFinaleTargets.value.map((t) => t.id)
    for (const id of targets) {
      const boss = story.finaleBossForTown(id)!
      story.startQuest(boss)
      story.finishFinaleBoss(boss)
    }
    expect(story.remainingFinaleTargets.value).toHaveLength(0)
    expect(story.phase.value).toBe('ended')
  })

  it('finishFinaleBoss pays, counts the kill, and clears the town once (idempotent)', () => {
    const story = useStoryMode()
    story.newRun()
    helpTown(story, 'town-0')
    helpTown(story, 'town-1')
    helpTown(story, 'town-2')
    story.beginFinale()

    const target = story.remainingFinaleTargets.value[0]
    const boss = story.finaleBossForTown(target.id)!
    const moneyBefore = story.money.value
    const killsBefore = story.stats.value.bossesDefeated

    story.finishFinaleBoss(boss)
    expect(story.getTown(target.id)!.cleared).toBe(true)
    expect(story.money.value).toBe(moneyBefore + boss.reward)
    expect(story.stats.value.bossesDefeated).toBe(killsBefore + 1)

    // Firing again must not double-pay or double-count.
    story.finishFinaleBoss(boss)
    expect(story.money.value).toBe(moneyBefore + boss.reward)
    expect(story.stats.value.bossesDefeated).toBe(killsBefore + 1)
  })
})

describe('run stats tracking', () => {
  beforeEach(installMemoryStorage)

  it('tracks quests, boss kills, and gross money earned', () => {
    const story = useStoryMode()
    story.newRun()
    // A full chain = QUESTS_PER_CHAIN quests, exactly one of which is a boss hunt.
    helpTown(story, 'town-0')
    const stats = story.stats.value
    expect(stats.questsCompleted).toBe(QUESTS_PER_CHAIN)
    expect(stats.bossesDefeated).toBe(1)
    expect(stats.moneyEarned).toBeGreaterThan(0)
    // Gross earnings ignore spending: spend, earnings stay.
    const earned = stats.moneyEarned
    story.addMoney(0) // no-op
    expect(story.stats.value.moneyEarned).toBe(earned)
  })

  it('stats + phase survive a save/load round-trip', () => {
    const story = useStoryMode()
    story.newRun()
    helpTown(story, 'town-0')
    helpTown(story, 'town-1')
    helpTown(story, 'town-2')
    story.beginFinale()
    story.save()

    const reloaded = useStoryMode()
    expect(reloaded.load()).toBe(true)
    expect(reloaded.phase.value).toBe('finale')
    expect(reloaded.stats.value.questsCompleted).toBe(story.stats.value.questsCompleted)
    expect(reloaded.stats.value.bossesDefeated).toBe(story.stats.value.bossesDefeated)
    expect(reloaded.happyCount.value).toBe(FINALE_UNLOCK_HAPPY_TOWNS)
  })

  it('older saves without a stats block load with zeroed stats', () => {
    const legacy = createFreshRun(1000) as unknown as Record<string, unknown>
    delete legacy.stats
    const restored = deserializeRun(JSON.stringify({ ...legacy, loadout: { core: null, legs: null, head: null, leftArm: null, rightArm: null, rack: null } }))
    expect(restored).not.toBeNull()
    expect(restored!.stats).toEqual({ questsCompleted: 0, bossesDefeated: 0, moneyEarned: 0 })
  })
})

describe('damage report + verdict', () => {
  function town(overrides: Partial<TownState>): TownState {
    return {
      id: 'town-0',
      name: 'Testville',
      position: [0, 0, 0],
      condition: 100,
      standing: 0,
      decaySecondsAccrued: 0,
      farms: { alive: 2, total: 2 },
      population: { current: 12, initial: 12 },
      questChain: [],
      questIndex: 0,
      cleared: false,
      ...overrides,
    }
  }

  it('reports residents + farms lost and percent destroyed', () => {
    const r = buildTownDamageReport(
      town({
        condition: 40,
        farms: { alive: 1, total: 2 },
        population: { current: 5, initial: 12 },
      }),
    )
    expect(r.destroyedPct).toBe(60)
    expect(r.residentsLost).toBe(7)
    expect(r.farmsLost).toBe(1)
    expect(r.helped).toBe(false)
  })

  it('marks helped/cleared towns', () => {
    expect(buildTownDamageReport(town({ standing: 100 })).helped).toBe(true)
    expect(buildTownDamageReport(town({ cleared: true })).cleared).toBe(true)
  })

  it('grades the verdict by average destruction', () => {
    expect(verdictForDamage(0)).toBe('Hero')
    expect(verdictForDamage(40)).toBe('Mercenary')
    expect(verdictForDamage(60)).toBe('Menace')
    expect(verdictForDamage(90)).toBe('Monster')
    // Every verdict has flavor text.
    for (const v of ['Hero', 'Mercenary', 'Menace', 'Monster'] as const) {
      expect(verdictFlavor(v).length).toBeGreaterThan(0)
    }
  })

  it('averages destruction across towns', () => {
    const towns = [town({ condition: 100 }), town({ condition: 0 })]
    expect(averageDestruction(towns)).toBe(50)
    expect(averageDestruction([])).toBe(0)
  })
})
