/**
 * Phase 4 — THE KEYSTONE (GRINDER §4.2): while the player is on foot the town
 * does not decay, and combat collateral cannot land. Plus the §4 persistence
 * rule: body mode + Frame park position survive a save/load round-trip on the
 * additive v3 fields (no schema bump).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  useStoryMode,
  createFreshRun,
  serializeRun,
  deserializeRun,
  applyDecay,
  DECAY_PER_SECOND,
  SAVE_VERSION,
} from '../../../composables/useStoryMode'

/** In-memory localStorage so the node test env can persist (mirrors sibling tests). */
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

describe('decay pauses on foot (§4.2 keystone)', () => {
  it('accrues decay in the mech, freezes on dismount, resumes on mount', () => {
    const story = useStoryMode()
    story.newRun()
    const id = story.towns.value[0].id
    const start = story.getTown(id)!.condition

    // In the Frame near the town: decay ratchets down exactly as applyDecay says.
    story.tickTownDecay(id, 10)
    const afterMech = story.getTown(id)!.condition
    expect(afterMech).toBeCloseTo(applyDecay(start, 10), 5)
    expect(afterMech).toBeLessThan(start)

    // Dismount: the reactor idles, the weight is off the ground — decay freezes,
    // no matter how long the tick claims the player lingered.
    story.setPilotMode('onFoot', { townId: id, mechPark: [1, 2, 3] })
    expect(story.isOnFoot.value).toBe(true)
    const frozen = story.getTown(id)!.condition
    story.tickTownDecay(id, 999)
    expect(story.getTown(id)!.condition).toBe(frozen)

    // Mount back up: presence is harm again, decay resumes from where it froze.
    story.setPilotMode('mech')
    expect(story.isOnFoot.value).toBe(false)
    story.tickTownDecay(id, 5)
    expect(story.getTown(id)!.condition).toBeCloseTo(applyDecay(frozen, 5), 5)
    expect(story.getTown(id)!.condition).toBeLessThan(frozen)
  })

  it('freezes decay for the whole world while on foot (any town, not just yours)', () => {
    const story = useStoryMode()
    story.newRun()
    const [a, b] = story.towns.value
    story.setPilotMode('onFoot', { townId: a.id })
    const beforeA = story.getTown(a.id)!.condition
    const beforeB = story.getTown(b.id)!.condition
    story.tickTownDecay(a.id, 50)
    story.tickTownDecay(b.id, 50)
    expect(story.getTown(a.id)!.condition).toBe(beforeA)
    expect(story.getTown(b.id)!.condition).toBe(beforeB)
  })

  it('combat collateral cannot land while on foot (no on-foot combat, §4.2)', () => {
    const story = useStoryMode()
    story.newRun()
    const id = story.towns.value[0].id

    // In the mech, collateral chips condition down.
    const start = story.getTown(id)!.condition
    story.applyTownCollateral(id, 4)
    expect(story.getTown(id)!.condition).toBeLessThan(start)

    // On foot, the same call is a no-op.
    story.setPilotMode('onFoot', { townId: id })
    const frozen = story.getTown(id)!.condition
    story.applyTownCollateral(id, 999)
    expect(story.getTown(id)!.condition).toBe(frozen)
  })
})

describe('on-foot state persistence (§4, additive v3)', () => {
  it('a fresh run defaults to the mech with no park position', () => {
    const run = createFreshRun()
    expect(run.pilotMode).toBe('mech')
    expect(run.onFootTownId).toBeNull()
    expect(run.mechPark).toBeNull()
  })

  it('does NOT bump the save version — the fields ride v3', () => {
    expect(createFreshRun().version).toBe(SAVE_VERSION)
    expect(SAVE_VERSION).toBe(3)
  })

  it('round-trips mode + onFootTownId + Frame park through save/load', () => {
    const run = createFreshRun()
    run.pilotMode = 'onFoot'
    run.onFootTownId = 'town-2'
    run.mechPark = [12.5, 0, -34.25]
    const restored = deserializeRun(serializeRun(run))!
    expect(restored.pilotMode).toBe('onFoot')
    expect(restored.onFootTownId).toBe('town-2')
    expect(restored.mechPark).toEqual([12.5, 0, -34.25])
  })

  it('a v3 save written before Phase 4 (no on-foot fields) loads as driving', () => {
    const legacy = createFreshRun()
    // Strip the additive fields to simulate a pre-Phase-4 v3 payload.
    const raw = JSON.stringify({
      ...JSON.parse(serializeRun(legacy)),
      pilotMode: undefined,
      onFootTownId: undefined,
      mechPark: undefined,
    })
    const restored = deserializeRun(raw)!
    expect(restored.pilotMode).toBe('mech')
    expect(restored.onFootTownId).toBeNull()
    expect(restored.mechPark).toBeNull()
  })

  it('rejects a garbage Frame park position rather than trusting it', () => {
    const run = createFreshRun()
    const raw = JSON.stringify({ ...JSON.parse(serializeRun(run)), mechPark: ['x', 2] })
    expect(deserializeRun(raw)!.mechPark).toBeNull()
  })

  it('setPilotMode persists so a reload resumes the dismounted state', () => {
    const story = useStoryMode()
    story.newRun()
    const id = story.towns.value[0].id
    story.setPilotMode('onFoot', { townId: id, mechPark: [5, 0, 5] })

    // Re-read straight from the save slot: the persisted run is on foot.
    const reloaded = deserializeRun(localStorage.getItem('mech-story-v1')!)!
    expect(reloaded.pilotMode).toBe('onFoot')
    expect(reloaded.onFootTownId).toBe(id)
    expect(reloaded.mechPark).toEqual([5, 0, 5])
  })

  it('mounting clears the on-foot town but keeps the park until reused', () => {
    const story = useStoryMode()
    story.newRun()
    const id = story.towns.value[0].id
    story.setPilotMode('onFoot', { townId: id, mechPark: [5, 0, 5] })
    story.setPilotMode('mech')
    expect(story.pilotMode.value).toBe('mech')
    expect(story.onFootTownId.value).toBeNull()
  })
})
