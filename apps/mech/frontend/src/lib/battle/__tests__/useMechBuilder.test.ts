import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useMechBuilder, STARTER_PRESETS } from '../../../composables/useMechBuilder'

/**
 * Minimal in-memory localStorage so the builder's persistence works under the
 * node test environment (no DOM). Installed/torn down per test for isolation.
 */
function installLocalStorage() {
  const store = new Map<string, string>()
  const mock = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size
    },
  }
  ;(globalThis as any).localStorage = mock
  return mock
}

beforeEach(() => {
  installLocalStorage()
})
afterEach(() => {
  delete (globalThis as any).localStorage
  vi.restoreAllMocks()
})

describe('useMechBuilder.randomizeBuild', () => {
  it('produces a warning-free, valid build across many iterations', () => {
    const builder = useMechBuilder()
    for (let i = 0; i < 200; i++) {
      builder.randomizeBuild()
      const lo = builder.loadout.value
      // Valid core/legs/head present.
      expect(lo.core, `iteration ${i}: core`).not.toBeNull()
      expect(lo.legs, `iteration ${i}: legs`).not.toBeNull()
      expect(lo.head, `iteration ${i}: head`).not.toBeNull()
      // At least one real (non-support) weapon arm.
      const arms = [lo.leftArm, lo.rightArm].filter(a => a !== null)
      const realWeapons = arms.filter(a => a!.weaponType !== 'support')
      expect(realWeapons.length, `iteration ${i}: real weapon`).toBeGreaterThanOrEqual(1)
      // Non-negative energy budget.
      expect(builder.totalStats.value.energy, `iteration ${i}: energy`).toBeGreaterThanOrEqual(0)
      // No warnings at all.
      expect(builder.warnings.value, `iteration ${i}: warnings`).toEqual([])
    }
  })

  it('falls back to a known-good build when every random attempt fails', () => {
    // Force the bounded retry loop to never satisfy the energy constraint by
    // making Math.random always pick the most energy-hungry / weaponless picks.
    // Returning ~0.999 makes randomItem pick the last array element and the
    // optional-slot rolls (< 0.85 / < 0.8) fail, exercising the fallback path.
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    const builder = useMechBuilder()
    builder.randomizeBuild()
    const lo = builder.loadout.value
    // Fallback build is guaranteed valid and warning-free.
    expect(lo.core).not.toBeNull()
    expect(lo.legs).not.toBeNull()
    expect(lo.head).not.toBeNull()
    expect(lo.leftArm).not.toBeNull()
    expect(builder.warnings.value).toEqual([])
  })
})

describe('useMechBuilder.loadPresetBuild', () => {
  it('loads every STARTER_PRESET into a valid, warning-free loadout', () => {
    expect(STARTER_PRESETS.length).toBeGreaterThan(0)
    for (const preset of STARTER_PRESETS) {
      const builder = useMechBuilder()
      builder.loadPresetBuild(preset.id)
      const lo = builder.loadout.value
      expect(lo.core, `${preset.name}: core`).not.toBeNull()
      expect(lo.legs, `${preset.name}: legs`).not.toBeNull()
      expect(lo.head, `${preset.name}: head`).not.toBeNull()
      const armed = lo.leftArm !== null || lo.rightArm !== null
      expect(armed, `${preset.name}: armed`).toBe(true)
      expect(builder.totalStats.value.energy, `${preset.name}: energy`).toBeGreaterThanOrEqual(0)
      expect(builder.warnings.value, `${preset.name}: warnings`).toEqual([])
    }
  })
})

describe('useMechBuilder save/load/delete round-trip', () => {
  it('persists a saved build through localStorage and reloads it', () => {
    const builder = useMechBuilder()
    builder.loadPresetBuild('preset-sniper')
    const sniperLeftArmId = builder.loadout.value.leftArm?.id
    builder.saveBuild('My Sniper')

    expect(builder.savedBuilds.value).toHaveLength(1)
    expect(builder.savedBuilds.value[0].name).toBe('My Sniper')

    // A fresh builder instance reads the persisted builds back out of storage.
    const reloaded = useMechBuilder()
    reloaded.loadBuildsFromStorage()
    expect(reloaded.savedBuilds.value).toHaveLength(1)
    expect(reloaded.savedBuilds.value[0].name).toBe('My Sniper')
    expect(reloaded.savedBuilds.value[0].loadout.leftArm?.id).toBe(sniperLeftArmId)

    // loadBuild copies the saved loadout into the active loadout.
    reloaded.resetBuild()
    expect(reloaded.loadout.value.core).toBeNull()
    reloaded.loadBuild(0)
    expect(reloaded.loadout.value.leftArm?.id).toBe(sniperLeftArmId)
  })

  it('deletes a saved build and persists the deletion', () => {
    const builder = useMechBuilder()
    builder.loadPresetBuild('preset-tank')
    builder.saveBuild('Tank A')
    builder.loadPresetBuild('preset-scout')
    builder.saveBuild('Scout B')
    expect(builder.savedBuilds.value).toHaveLength(2)

    builder.deleteBuild(0)
    expect(builder.savedBuilds.value).toHaveLength(1)
    expect(builder.savedBuilds.value[0].name).toBe('Scout B')

    const reloaded = useMechBuilder()
    reloaded.loadBuildsFromStorage()
    expect(reloaded.savedBuilds.value).toHaveLength(1)
    expect(reloaded.savedBuilds.value[0].name).toBe('Scout B')
  })
})
