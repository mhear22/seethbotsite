import { describe, it, expect, beforeEach } from 'vitest'
import {
  createFreshRun,
  serializeRun,
  deserializeRun,
  awardSalvage,
  nextInstanceId,
  repairPrice,
  salvageSellPrice,
  buildStarterLoadout,
  isLoadoutValid,
  useStoryMode,
  SAVE_VERSION,
  SALVAGE_SCRAP_FLOOR,
  SALVAGE_SCRAP_PER_POWER,
  SALVAGE_DESTROYED_DROP_CHANCE,
  REPAIR_PRICE_FRACTION,
  SELL_PRICE_FRACTION_PRISTINE,
  SELL_PRICE_FRACTION_DAMAGED,
  INSTALL_FITTING_FEE_FRACTION,
  fittingFee,
  SLOT_KEYS,
  type StoryRun,
  type InventoryItem,
} from '../../../composables/useStoryMode'
import type { MechLoadout } from '../../../composables/useMechBuilder'
import { partPrice, partPowerScore } from '../quests'
import { findPartById } from '../../../shared/data/MechParts'

// ---------------------------------------------------------------------------
// In-memory localStorage so the composable's persistence calls succeed (node env).
// ---------------------------------------------------------------------------
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

/** A constant rng for deterministic drop rolls. */
const rngConst = (v: number) => () => v

/** The killed enemy's loadout used across drop tests (starter = 6 equipped slots). */
function killedLoadout(): MechLoadout {
  return buildStarterLoadout()
}

/** How many slots are equipped in a loadout. */
function equippedSlotCount(loadout: MechLoadout): number {
  return SLOT_KEYS.reduce((n, s) => (loadout[s] ? n + 1 : n), 0)
}

// ===========================================================================
describe('inventory instance ids', () => {
  it('starts at inst-0 and advances past the highest existing suffix', () => {
    expect(nextInstanceId([])).toBe('inst-0')
    expect(nextInstanceId([{ instanceId: 'inst-0' }, { instanceId: 'inst-5' }])).toBe('inst-6')
    // Non-matching ids are ignored.
    expect(nextInstanceId([{ instanceId: 'garbage' }])).toBe('inst-0')
  })
})

// ===========================================================================
describe('repair + sell pricing', () => {
  const part = findPartById('arm-railgun')!

  it('repair is a documented fraction of shop price (rounded, floored)', () => {
    const expected = Math.max(20, Math.round((partPrice(part) * REPAIR_PRICE_FRACTION) / 10) * 10)
    expect(repairPrice(part)).toBe(expected)
    expect(repairPrice(part)).toBeLessThan(partPrice(part))
  })

  it('sell refunds a fraction of shop price; damaged fetches strictly less', () => {
    const pristine = salvageSellPrice(part, 'pristine')
    const damaged = salvageSellPrice(part, 'damaged')
    expect(pristine).toBe(
      Math.max(10, Math.round((partPrice(part) * SELL_PRICE_FRACTION_PRISTINE) / 10) * 10),
    )
    expect(damaged).toBe(
      Math.max(10, Math.round((partPrice(part) * SELL_PRICE_FRACTION_DAMAGED) / 10) * 10),
    )
    expect(damaged).toBeLessThan(pristine)
    expect(pristine).toBeLessThan(partPrice(part))
  })
})

// ===========================================================================
describe('awardSalvage (pure)', () => {
  let run: StoryRun
  beforeEach(() => {
    run = createFreshRun(1000)
  })

  it('grants scrap scaled by the killed enemy total part power (floored)', () => {
    const loadout = killedLoadout()
    let power = 0
    for (const s of SLOT_KEYS) if (loadout[s]) power += partPowerScore(loadout[s]!)
    const expected = Math.max(SALVAGE_SCRAP_FLOOR, Math.round(power * SALVAGE_SCRAP_PER_POWER))

    const before = run.salvage
    const earnedBefore = run.stats.moneyEarned
    const result = awardSalvage(run, loadout, [], rngConst(0.99))

    expect(result.scrap).toBe(expected)
    expect(run.salvage).toBe(before + expected)
    expect(run.stats.moneyEarned).toBe(earnedBefore + expected)
  })

  it('a stripped enemy still pays at least the scrap floor', () => {
    const empty: MechLoadout = { leftArm: null, rightArm: null, core: null, legs: null, head: null, rack: null }
    const result = awardSalvage(run, empty, [], rngConst(0))
    expect(result.scrap).toBe(SALVAGE_SCRAP_FLOOR)
    expect(result.drops).toHaveLength(0)
  })

  it('a destroyed slot drops its part in damaged condition (0.85 chance)', () => {
    const loadout = killedLoadout()
    // Phase 3: destroyed-drop chance is 0.85 (was 1.0). rng at 0.5 passes the
    // destroyed roll (0.5 < 0.85) but fails every intact roll (0.5 >= 0.25), so
    // only the destroyed leftArm survives — isolating the destroyed-drop rule.
    const result = awardSalvage(run, loadout, ['leftArm'], rngConst(0.5))
    expect(result.drops).toHaveLength(1)
    expect(result.drops[0].condition).toBe('damaged')
    expect(result.drops[0].partId).toBe(loadout.leftArm!.id)
    // Drop is committed to the run inventory.
    expect(run.inventory).toContainEqual(result.drops[0])
  })

  it('intact slots drop pristine when the roll passes, with unique ids', () => {
    const loadout = killedLoadout()
    // rng at 0 -> every intact slot passes the 0.25 chance.
    const result = awardSalvage(run, loadout, [], rngConst(0))
    expect(result.drops).toHaveLength(equippedSlotCount(loadout))
    expect(result.drops.every((d) => d.condition === 'pristine')).toBe(true)
    const ids = new Set(result.drops.map((d) => d.instanceId))
    expect(ids.size).toBe(result.drops.length) // all unique
  })

  it('intact slots never drop when the roll fails', () => {
    const result = awardSalvage(run, killedLoadout(), [], rngConst(0.99))
    expect(result.drops).toHaveLength(0)
  })

  it('drop instance ids never collide with parts already in inventory', () => {
    run.inventory.push({ instanceId: 'inst-0', partId: 'arm-autocannon-mk1', condition: 'pristine' })
    const result = awardSalvage(run, killedLoadout(), [], rngConst(0))
    const allIds = run.inventory.map((i) => i.instanceId)
    expect(new Set(allIds).size).toBe(allIds.length)
  })

  // --- ace_hunt guaranteed pristine drop (§5.4) ---
  it('guaranteePristine forces one pristine drop even when every chance roll fails', () => {
    const loadout = killedLoadout()
    // rng 0.99 fails BOTH the intact (0.25) and destroyed (0.85) rolls: with no
    // guarantee this kill would drop nothing. The ace guarantee must still yield one.
    const result = awardSalvage(run, loadout, ['leftArm'], rngConst(0.99), { guaranteePristine: true })
    expect(result.drops).toHaveLength(1)
    expect(result.drops[0].condition).toBe('pristine')
    // It is one of the ace's equipped parts, committed to the run inventory.
    const equippedIds = SLOT_KEYS.map((s) => loadout[s]?.id).filter(Boolean)
    expect(equippedIds).toContain(result.drops[0].partId)
    expect(run.inventory).toContainEqual(result.drops[0])
  })

  it('guaranteePristine does not add a second drop when a pristine already rolled', () => {
    const loadout = killedLoadout()
    // rng 0 passes every intact roll -> all equipped slots already drop pristine.
    const result = awardSalvage(run, loadout, [], rngConst(0), { guaranteePristine: true })
    expect(result.drops).toHaveLength(equippedSlotCount(loadout))
    expect(result.drops.every((d) => d.condition === 'pristine')).toBe(true)
  })

  it('guaranteePristine prefers an intact slot over a destroyed one', () => {
    const loadout = killedLoadout()
    // Every EQUIPPED slot destroyed except the core. rng 0.99 fails all rolls, so
    // the only pristine drop is the forced one — and it must be the intact core.
    const destroyed = SLOT_KEYS.filter((s) => s !== 'core' && loadout[s])
    const result = awardSalvage(run, loadout, destroyed, rngConst(0.99), { guaranteePristine: true })
    const pristine = result.drops.filter((d) => d.condition === 'pristine')
    expect(pristine).toHaveLength(1)
    expect(pristine[0].partId).toBe(loadout.core!.id)
  })
})

// ===========================================================================
describe('save migration chain (v1 -> v2 -> v3)', () => {
  it('loads a v1 payload up to v3: inventory added, money -> salvage 1:1, v3 defaults', () => {
    const run = createFreshRun(2000)
    run.salvage = 250
    // Shape a v1 raw from the current serializer, then strip the v2/v3-only
    // fields and rename salvage back to money to mimic an actual old v1 save.
    const raw = JSON.parse(serializeRun(run)) as Record<string, unknown>
    raw.version = 1
    raw.money = raw.salvage
    delete raw.salvage
    delete raw.inventory
    delete raw.commandRep
    delete raw.townRep
    delete raw.storyFlags
    delete raw.chapter
    const restored = deserializeRun(JSON.stringify(raw))

    expect(restored).not.toBeNull()
    expect(restored!.version).toBe(SAVE_VERSION) // 3
    expect(restored!.inventory).toEqual([]) // v1->v2 gain
    expect(restored!.salvage).toBe(250) // money -> salvage, 1:1
    // v2->v3 neutral defaults appear.
    expect(restored!.commandRep).toBe(50)
    expect(restored!.townRep).toBe(50)
    expect(restored!.storyFlags).toEqual([])
    expect(restored!.chapter).toBe('act1')
    expect(restored!.loadout.leftArm?.id).toBe(run.loadout.leftArm?.id)
  })

  it('loads a v2 payload up to v3, carrying money -> salvage and deriving act', () => {
    const run = createFreshRun(2500)
    run.salvage = 400
    const raw = JSON.parse(serializeRun(run)) as Record<string, unknown>
    raw.version = 2
    raw.money = raw.salvage
    delete raw.salvage
    delete raw.commandRep
    delete raw.townRep
    delete raw.storyFlags
    delete raw.chapter
    // A mid-campaign v2 save (a quest done, still exploring) derives to act2.
    ;(raw.stats as { questsCompleted: number }).questsCompleted = 1
    const restored = deserializeRun(JSON.stringify(raw))
    expect(restored).not.toBeNull()
    expect(restored!.version).toBe(SAVE_VERSION)
    expect(restored!.salvage).toBe(400)
    expect(restored!.commandRep).toBe(50)
    expect(restored!.townRep).toBe(50)
    expect(restored!.chapter).toBe('act2') // exploring + quests done -> The Grind
  })

  it('round-trips a v3 run preserving inventory + reputation + flags', () => {
    const run = createFreshRun(2600)
    run.commandRep = 72
    run.townRep = 38
    run.storyFlags = ['met-rooker', 'saw-kestrel-clean']
    run.inventory.push({ instanceId: 'inst-0', partId: 'arm-railgun', condition: 'pristine' })
    const restored = deserializeRun(serializeRun(run))
    expect(restored).not.toBeNull()
    expect(restored!.version).toBe(SAVE_VERSION)
    expect(restored!.commandRep).toBe(72)
    expect(restored!.townRep).toBe(38)
    expect(restored!.storyFlags).toEqual(['met-rooker', 'saw-kestrel-clean'])
    expect(restored!.inventory).toEqual(run.inventory)
  })

  it('round-trips a v2 run preserving inventory instances', () => {
    const run = createFreshRun(3000)
    run.inventory.push(
      { instanceId: 'inst-0', partId: 'arm-railgun', condition: 'pristine' },
      { instanceId: 'inst-1', partId: 'arm-autocannon-mk1', condition: 'damaged' },
    )
    const restored = deserializeRun(serializeRun(run))
    expect(restored).not.toBeNull()
    expect(restored!.version).toBe(SAVE_VERSION)
    expect(restored!.inventory).toEqual(run.inventory)
  })

  it('drops malformed / unknown-part inventory entries on load', () => {
    const run = createFreshRun(3100)
    const raw = JSON.parse(serializeRun(run)) as Record<string, unknown>
    raw.inventory = [
      { instanceId: 'inst-0', partId: 'arm-railgun', condition: 'pristine' },
      { instanceId: 'inst-1', partId: 'does-not-exist', condition: 'pristine' }, // dropped
      { partId: 'arm-autocannon-mk1' }, // missing id + condition -> normalised
      null, // dropped
      'garbage', // dropped
    ]
    const restored = deserializeRun(JSON.stringify(raw))
    expect(restored).not.toBeNull()
    expect(restored!.inventory).toHaveLength(2)
    expect(restored!.inventory[0].partId).toBe('arm-railgun')
    expect(restored!.inventory[1].partId).toBe('arm-autocannon-mk1')
    expect(restored!.inventory[1].condition).toBe('pristine') // normalised default
  })

  it('rejects an unknown/future schema version cleanly (null, no throw)', () => {
    // v3 is now the current known version; a future version is rejected. Include
    // a loadout so the guard (not a downstream loadout parse) is what rejects it.
    const futureLoadout = { core: null, legs: null, head: null, leftArm: null, rightArm: null, rack: null }
    expect(deserializeRun(JSON.stringify({ version: 4, towns: [], loadout: futureLoadout }))).toBeNull()
    expect(deserializeRun(JSON.stringify({ version: 99, towns: [], loadout: futureLoadout }))).toBeNull()
  })

  it('rejects corrupted payloads cleanly (null, no throw)', () => {
    expect(deserializeRun('not json at all')).toBeNull()
    expect(deserializeRun('{}')).toBeNull() // no towns array
    expect(deserializeRun(JSON.stringify({ version: 2 }))).toBeNull() // no towns array
  })
})

// ===========================================================================
describe('composable: inventory & salvage', () => {
  beforeEach(installMemoryStorage)

  it('buyPart spends scrap and stows a pristine instance (does not equip)', () => {
    const story = useStoryMode()
    story.newRun()
    story.addMoney(10_000)
    const railgun = findPartById('arm-railgun')!
    const before = story.money.value

    const res = story.buyPart(railgun)
    expect(res.ok).toBe(true)
    expect(story.money.value).toBe(before - partPrice(railgun))
    expect(story.inventory.value).toHaveLength(1)
    expect(story.inventory.value[0].condition).toBe('pristine')
    // Loadout is untouched — buying only stocks the inventory (starter arm intact).
    expect(story.run.value!.loadout.rightArm?.id).toBe('arm-autocannon-mk1')
  })

  it('buyPart refuses when too poor and never deducts scrap', () => {
    const story = useStoryMode()
    story.newRun() // money 0
    const res = story.buyPart(findPartById('arm-railgun')!)
    expect(res.ok).toBe(false)
    expect(res.reason).toMatch(/not enough/i)
    expect(story.inventory.value).toHaveLength(0)
    expect(story.money.value).toBe(0)
  })

  it('installFromInventory equips a pristine part and consumes the instance', () => {
    const story = useStoryMode()
    story.newRun()
    story.addMoney(10_000)
    // Starter already runs the big fusion core, so a draw-heavy weapon stays legal.
    const railgun = findPartById('arm-railgun')!
    story.buyPart(railgun)
    const res = story.installFromInventory(story.inventory.value[0].instanceId, 'rightArm')

    expect(res.ok).toBe(true)
    expect(story.run.value!.loadout.rightArm?.id).toBe('arm-railgun')
    expect(isLoadoutValid(story.run.value!.loadout)).toBe(true)
    // The railgun instance is no longer loose in inventory (the displaced starter
    // autocannon is stowed instead).
    expect(story.inventory.value.find((i) => i.partId === 'arm-railgun')).toBeUndefined()
  })

  it('installFromInventory returns the displaced part to inventory (swap, no loss)', () => {
    const story = useStoryMode()
    story.newRun()
    story.addMoney(10_000)
    const oldCoreId = story.run.value!.loadout.core!.id
    const fusion = findPartById('core-fusion')!
    story.buyPart(fusion)
    const inst = story.inventory.value[0].instanceId

    const res = story.installFromInventory(inst, 'core')
    expect(res.ok).toBe(true)
    expect(story.run.value!.loadout.core?.id).toBe('core-fusion')
    // The starter core is stowed (pristine), not destroyed.
    const stowed = story.inventory.value
    expect(stowed).toHaveLength(1)
    expect(stowed[0].partId).toBe(oldCoreId)
    expect(stowed[0].condition).toBe('pristine')
  })

  it('installFromInventory refuses a damaged part until repaired', () => {
    const story = useStoryMode()
    story.newRun()
    story.run.value!.inventory.push({ instanceId: 'inst-0', partId: 'arm-railgun', condition: 'damaged' })
    const res = story.installFromInventory('inst-0', 'rightArm')
    expect(res.ok).toBe(false)
    expect(res.reason).toMatch(/damaged/i)
    // Loadout untouched — the starter autocannon stays on the right arm.
    expect(story.run.value!.loadout.rightArm?.id).toBe('arm-autocannon-mk1')
  })

  it('installFromInventory rejects an illegal result, leaving inventory intact', () => {
    const story = useStoryMode()
    story.newRun()
    story.addMoney(10_000)
    // Reduce to a single weapon, then installing the support shield over it leaves
    // no weapon -> illegal.
    story.run.value!.loadout.rightArm = null
    const shield = findPartById('arm-shield-gen')!
    story.buyPart(shield)
    const inst = story.inventory.value[0].instanceId
    const res = story.installFromInventory(inst, 'leftArm')
    expect(res.ok).toBe(false)
    // Instance was not consumed.
    expect(story.inventory.value.find((i) => i.instanceId === inst)).toBeDefined()
  })

  it('repairPart flips damaged -> pristine and charges the repair fee', () => {
    const story = useStoryMode()
    story.newRun()
    story.addMoney(10_000)
    const railgun = findPartById('arm-railgun')!
    story.run.value!.inventory.push({ instanceId: 'inst-0', partId: 'arm-railgun', condition: 'damaged' })
    const before = story.money.value

    const res = story.repairPart('inst-0')
    expect(res.ok).toBe(true)
    expect(res.cost).toBe(repairPrice(railgun))
    expect(story.money.value).toBe(before - repairPrice(railgun))
    expect(story.inventory.value[0].condition).toBe('pristine')
  })

  it('repairPart refuses an already-working part', () => {
    const story = useStoryMode()
    story.newRun()
    story.run.value!.inventory.push({ instanceId: 'inst-0', partId: 'arm-railgun', condition: 'pristine' })
    const res = story.repairPart('inst-0')
    expect(res.ok).toBe(false)
    expect(res.reason).toMatch(/working order/i)
  })

  it('sellPart removes the instance and refunds scrap', () => {
    const story = useStoryMode()
    story.newRun()
    const railgun = findPartById('arm-railgun')!
    story.run.value!.inventory.push({ instanceId: 'inst-0', partId: 'arm-railgun', condition: 'pristine' })
    const before = story.money.value

    const res = story.sellPart('inst-0')
    expect(res.ok).toBe(true)
    expect(res.refund).toBe(salvageSellPrice(railgun, 'pristine'))
    expect(story.money.value).toBe(before + salvageSellPrice(railgun, 'pristine'))
    expect(story.inventory.value).toHaveLength(0)
  })

  it('awardKillSalvage grants scrap + drops through the composable and persists', () => {
    const story = useStoryMode()
    story.newRun()
    const before = story.money.value
    const result = story.awardKillSalvage(buildStarterLoadout(), ['leftArm'], rngConst(0.5))

    expect(result.scrap).toBeGreaterThanOrEqual(SALVAGE_SCRAP_FLOOR)
    expect(story.money.value).toBe(before + result.scrap)
    // The destroyed leftArm dropped damaged into inventory.
    expect(story.inventory.value).toHaveLength(1)
    expect(story.inventory.value[0].condition).toBe('damaged')

    // Persisted: a reload sees the same inventory + scrap.
    const reloaded = useStoryMode()
    expect(reloaded.load()).toBe(true)
    expect(reloaded.inventory.value).toEqual(story.inventory.value)
    expect(reloaded.money.value).toBe(story.money.value)
  })
})

// ===========================================================================
// Phase 3 salvage counterweights (deferred P2 findings): the destroyed-slot
// drop is no longer guaranteed, and installing an inventory part costs a fee.
describe('Phase 3 salvage counterweights', () => {
  beforeEach(installMemoryStorage)

  it('destroyed-slot drop chance is 0.85 and a high roll misses the wreck', () => {
    expect(SALVAGE_DESTROYED_DROP_CHANCE).toBe(0.85)
    const run = createFreshRun(4000)
    // rng 0.9 >= 0.85 -> the destroyed slot fails its roll, no drop.
    const result = awardSalvage(run, buildStarterLoadout(), ['leftArm'], rngConst(0.9))
    expect(result.drops).toHaveLength(0)
    expect(run.inventory).toHaveLength(0)
  })

  it('installFromInventory charges a scrap fitting fee (fraction of shop price)', () => {
    expect(INSTALL_FITTING_FEE_FRACTION).toBe(0.1)
    const story = useStoryMode()
    story.newRun()
    story.addSalvage(10_000)
    const fusion = findPartById('core-fusion')!
    story.buyPart(fusion)
    const inst = story.inventory.value[0].instanceId
    const before = story.salvage.value

    const res = story.installFromInventory(inst, 'core')
    expect(res.ok).toBe(true)
    expect(res.fee).toBe(fittingFee(fusion))
    expect(res.fee).toBeGreaterThan(0)
    expect(story.salvage.value).toBe(before - fittingFee(fusion))
  })

  it('installFromInventory refuses when the pilot cannot afford the fitting fee', () => {
    const story = useStoryMode()
    story.newRun() // salvage 0
    // Seed a pristine part directly so the only cost gating the install is the fee.
    // Use a core distinct from the starter's fusion so the "unchanged" check is real.
    story.run.value!.inventory.push({ instanceId: 'inst-0', partId: 'core-diesel-gen', condition: 'pristine' })
    const res = story.installFromInventory('inst-0', 'core')
    expect(res.ok).toBe(false)
    expect(res.reason).toMatch(/fitting fee/i)
    // Loadout unchanged, instance not consumed.
    expect(story.run.value!.loadout.core?.id).not.toBe('core-diesel-gen')
    expect(story.inventory.value.find((i) => i.instanceId === 'inst-0')).toBeDefined()
  })
})
