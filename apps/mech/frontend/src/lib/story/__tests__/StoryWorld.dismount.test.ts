/**
 * Phase 4 — DISMOUNT GATING + REMOUNT INTERLOCK (design §4.1 / §4.3).
 *
 * The keystone decay-pause, the on-foot physics/camera, the Recovery search and
 * the persistence round-trip are all pinned by sibling suites — but the gate that
 * decides *when* you may leave the cockpit, and the interlock that yanks you back
 * when hostiles appear on foot, live inside StoryWorld and were untested (the
 * class owns a WebGLRenderer, so nothing constructed it). This drives a REAL
 * StoryWorld against a headless renderer/DOM stub and pins the seams the host
 * reads off frame-info + the keypress handlers:
 *
 *   - canDismount(): only in the mech, out of combat, INSIDE a town (§4.1 trigger);
 *   - dismount()/mount(): flip the body mode and fire onModeChange for persistence;
 *   - dismount() refuses (no-op, no mode-change) outside a town and mid-encounter;
 *   - signalHostileWhileOnFoot(): starts the forced-remount countdown, surfaces it
 *     via frame-info.onFoot.remountSecondsLeft, and auto-mounts on expiry (§4.3 —
 *     the answer to danger on foot is remount, never fight);
 *   - restoreOnFoot(): re-enters the dismounted state on LOAD, bypassing the gate
 *     and WITHOUT re-persisting (the run is already saved on foot).
 *
 * MechEntity fires async GLB loads that can't resolve under node -> stub the
 * loader. ProjectileSystem builds a canvas particle texture, StoryWorld builds a
 * WebGLRenderer and reads window/document -> stub the DOM + swap WebGLRenderer for
 * a headless shim (every other three export stays real).
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import * as THREE from 'three'

// --- headless three: keep everything real except the GL renderer --------------
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>()
  class HeadlessRenderer {
    domElement: unknown
    shadowMap = { enabled: false, type: 0 }
    toneMapping = 0
    toneMappingExposure = 1
    constructor(opts: { canvas?: unknown } = {}) { this.domElement = opts.canvas ?? {} }
    setSize() {}
    setPixelRatio() {}
    setClearColor() {}
    render() {}
    dispose() {}
  }
  return { ...actual, WebGLRenderer: HeadlessRenderer }
})

// --- stub the mech GLB loader (mirrors StoryCombat.test) -----------------------
vi.mock('../../../lib/battle/MechModelLoader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../lib/battle/MechModelLoader')>()
  return { ...actual, getMechModelLoader: () => ({ assembleMech: async () => new THREE.Group() }) }
})

import { StoryWorld } from '../StoryWorld'
import { MechEntity, type CombatStats } from '../../battle/MechEntity'
import { createTowns } from '../../../composables/useStoryMode'
import { findPartById } from '../../../shared/data/MechParts'
import type { ArmPart, MechLoadout } from '../../../shared/types/MechTypes'
import type { QuestDef } from '../quests'
import { ON_FOOT_HOSTILE_GRACE_SEC } from '../StoryWorld'

// --- DOM + canvas shims for a node env -----------------------------------------
function installDom() {
  const listeners = () => ({ addEventListener() {}, removeEventListener() {} })
  const canvas = {
    ...listeners(),
    requestPointerLock() {},
    getContext: () => ({ createRadialGradient: () => ({ addColorStop() {} }), fillRect() {}, set fillStyle(_v: unknown) {} }),
    width: 1280, height: 720, clientWidth: 1280, clientHeight: 720,
  }
  ;(globalThis as any).window = {
    innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
    ...listeners(),
  }
  ;(globalThis as any).document = {
    ...listeners(),
    hidden: false, pointerLockElement: null,
    createElement: () => canvas,
  }
  ;(globalThis as any).requestAnimationFrame = () => 0
  ;(globalThis as any).cancelAnimationFrame = () => {}
  return canvas as unknown as HTMLCanvasElement
}

beforeAll(() => { installDom() })

// --- fixtures ------------------------------------------------------------------
const arm = (id: string) => findPartById(id) as ArmPart
function playerLoadout(): MechLoadout {
  return {
    leftArm: arm('arm-autocannon-mk1'),
    rightArm: arm('arm-autocannon-mk1'),
    core: findPartById('core-diesel-gen') as MechLoadout['core'],
    legs: findPartById('legs-bipedal-standard') as MechLoadout['legs'],
    head: findPartById('head-standard-optics') as MechLoadout['head'],
    rack: null,
  }
}
function makePlayer(): MechEntity {
  const stats: CombatStats = { maxHealth: 5000, currentHealth: 5000, armor: 0, speed: 50, firepower: 20, accuracy: 20, energy: 100 }
  const p = new MechEntity('player', 'Player', playerLoadout(), stats, true, new THREE.Vector3())
  p.currentPower = 10_000
  return p
}
function combatQuest(): QuestDef {
  return {
    id: 'town-0-quest-0', townId: 'town-0', index: 0,
    type: 'wave_defence', waveCount: 1, difficulty: 'easy',
    title: 'T', flavor: 'F', reward: 100,
    briefing: 'B', completion: 'C', giver: 'G',
    sanctioned: true, commandRep: 0, townRep: 0,
  }
}

interface ModeChange { mode: string; townId: string | null; mechPark: [number, number, number] | null }
interface Rig {
  world: StoryWorld
  towns: ReturnType<typeof createTowns>
  modeChanges: ModeChange[]
  lastFrame: () => any
  update: (dt: number) => void
  /** Place the player at a town centre and run a frame so insideTownId latches. */
  standInTown: (i: number) => void
}
let rigs: StoryWorld[] = []
function makeRig(): Rig {
  const towns = createTowns()
  const modeChanges: ModeChange[] = []
  let lastFrame: any = null
  const world = new StoryWorld({
    canvas: (globalThis as any).document.createElement('canvas'),
    playerMech: makePlayer(),
    towns,
    graphics: { shadowQuality: 'off' } as any,
    onFrame: (info) => { lastFrame = info },
    onModeChange: (mode, ctx) => modeChanges.push({ mode, ...ctx }),
  })
  rigs.push(world)
  const update = (dt: number) => (world as any).update(dt)
  const standInTown = (i: number) => {
    const [x, , z] = towns[i].position
    ;(world as any)._playerMech.position.set(x, 0, z)
    update(1 / 60)
  }
  return { world, towns, modeChanges, lastFrame: () => lastFrame, update, standInTown }
}

afterEach(() => { for (const w of rigs) w.cleanup(); rigs = [] })

// ===========================================================================
describe('canDismount gate (§4.1 — insideTownId is the ready trigger)', () => {
  it('is false out in the open (no town in reach)', () => {
    const { world } = makeRig()
    ;(world as any)._playerMech.position.set(0, 0, 0) // spawn origin: outside any town pad
    ;(world as any).update(1 / 60)
    expect((world as any)._insideTownId).toBeNull()
    expect(world.canDismount()).toBe(false)
  })

  it('is true standing in a town, in the mech, out of combat', () => {
    const { world, standInTown } = makeRig()
    standInTown(0)
    expect((world as any)._insideTownId).not.toBeNull()
    expect(world.canDismount()).toBe(true)
  })

  it('is false mid-encounter even while standing in the town (combat interlock)', () => {
    const { world, towns, standInTown } = makeRig()
    standInTown(0)
    expect(world.canDismount()).toBe(true)
    const [x, , z] = towns[0].position
    ;(world as any).combat.start(combatQuest(), new THREE.Vector3(x, 0, z))
    expect((world as any).combat.active).toBe(true)
    expect(world.canDismount()).toBe(false)
  })
})

// ===========================================================================
describe('dismount() / mount() body-mode flip (§4.1)', () => {
  it('dismount parks the Frame, drops the pilot on foot, and fires onModeChange', () => {
    const { world, towns, modeChanges, standInTown } = makeRig()
    standInTown(0)
    const [x, , z] = towns[0].position

    expect(world.dismount()).toBe(true)
    expect(world.isOnFoot()).toBe(true)
    // The Frame parks where it stood; the persisted park position is that spot.
    const park = world.getMechParkPosition()!
    expect(park.x).toBeCloseTo(x, 3)
    expect(park.z).toBeCloseTo(z, 3)
    // onModeChange is the single persistence seam (design §4.2): mode + town + park.
    expect(modeChanges).toHaveLength(1)
    expect(modeChanges[0].mode).toBe('onFoot')
    expect(modeChanges[0].townId).toBe(towns[0].id)
    expect(modeChanges[0].mechPark).not.toBeNull()
  })

  it('mount climbs back into the parked Frame and re-fires onModeChange (decay resumes)', () => {
    const { world, modeChanges, standInTown } = makeRig()
    standInTown(0)
    world.dismount()

    expect(world.mount()).toBe(true)
    expect(world.isOnFoot()).toBe(false)
    expect(modeChanges).toHaveLength(2)
    expect(modeChanges[1].mode).toBe('mech')
    // The dismount town is cleared on mount (host stops holding decay).
    expect(modeChanges[1].townId).toBeNull()
  })

  it('a blocked dismount is a strict no-op: stays in the mech, no mode-change', () => {
    const { world, modeChanges } = makeRig()
    ;(world as any)._playerMech.position.set(0, 0, 0)
    ;(world as any).update(1 / 60) // outside a town -> gate closed
    expect(world.canDismount()).toBe(false)

    expect(world.dismount()).toBe(false)
    expect(world.isOnFoot()).toBe(false)
    expect(modeChanges).toHaveLength(0)
  })

  it('dismount refuses mid-encounter (no on-foot combat, §6)', () => {
    const { world, towns, modeChanges, standInTown } = makeRig()
    standInTown(0)
    const [x, , z] = towns[0].position
    ;(world as any).combat.start(combatQuest(), new THREE.Vector3(x, 0, z))

    expect(world.dismount()).toBe(false)
    expect(world.isOnFoot()).toBe(false)
    expect(modeChanges).toHaveLength(0)
  })

  it('mount is a no-op when already in the mech', () => {
    const { world, modeChanges } = makeRig()
    expect(world.mount()).toBe(false)
    expect(modeChanges).toHaveLength(0)
  })
})

// ===========================================================================
describe('forced-remount interlock (§4.3 — hostiles on foot)', () => {
  it('is inert in the mech (no countdown to surface)', () => {
    const { world } = makeRig()
    world.signalHostileWhileOnFoot()
    expect((world as any)._remountSecondsLeft).toBeNull()
  })

  it('on foot: starts the grace countdown and surfaces it via frame-info', () => {
    const { world, lastFrame, standInTown, update } = makeRig()
    standInTown(0)
    world.dismount()

    world.signalHostileWhileOnFoot()
    expect((world as any)._remountSecondsLeft).toBeCloseTo(ON_FOOT_HOSTILE_GRACE_SEC, 5)

    // The host reads the timer off the on-foot frame-info slice (ticked by dt).
    update(1 / 60)
    expect(lastFrame().onFoot.remountSecondsLeft).toBeCloseTo(ON_FOOT_HOSTILE_GRACE_SEC, 1)
  })

  it('does not re-arm the countdown while one is already running', () => {
    const { world, standInTown, update } = makeRig()
    standInTown(0)
    world.dismount()
    world.signalHostileWhileOnFoot()
    update(1) // burn a second off the clock
    const remaining = (world as any)._remountSecondsLeft
    world.signalHostileWhileOnFoot() // must NOT refill the grace window
    expect((world as any)._remountSecondsLeft).toBe(remaining)
  })

  it('auto-mounts the pilot when the countdown expires (remount, never fight)', () => {
    const { world, modeChanges, standInTown, update } = makeRig()
    standInTown(0)
    world.dismount()
    expect(world.isOnFoot()).toBe(true)
    world.signalHostileWhileOnFoot()

    // Still on foot within the grace window.
    update(ON_FOOT_HOSTILE_GRACE_SEC - 1)
    expect(world.isOnFoot()).toBe(true)

    // The frame that drains the last of the grace yanks the pilot back into the Frame.
    update(2)
    expect(world.isOnFoot()).toBe(false)
    // dismount + auto-mount => two mode changes, ending in the mech.
    expect(modeChanges.map((m) => m.mode)).toEqual(['onFoot', 'mech'])
  })

  it('freezes the countdown while the world is paused (a hub panel must not burn grace)', () => {
    const { world, standInTown, update } = makeRig()
    standInTown(0)
    world.dismount()
    world.signalHostileWhileOnFoot()
    const before = (world as any)._remountSecondsLeft

    // A panel opens: paused frames advance elapsed but must NOT tick the grace down.
    world.setPaused(true)
    update(ON_FOOT_HOSTILE_GRACE_SEC + 5)
    expect((world as any)._remountSecondsLeft).toBe(before)
    expect(world.isOnFoot()).toBe(true)

    // Once unpaused, the countdown resumes from where it left off.
    world.setPaused(false)
    update(1)
    expect((world as any)._remountSecondsLeft).toBeCloseTo(before - 1, 5)
    expect(world.isOnFoot()).toBe(true)
  })
})

// ===========================================================================
describe('restoreOnFoot on load (§4 persistence — bypasses the gate)', () => {
  it('re-enters the dismounted state without the town/combat gate and without re-persisting', () => {
    const { world, towns, modeChanges } = makeRig()
    // Out in the open (gate would refuse a fresh dismount), simulate a load.
    ;(world as any)._playerMech.position.set(0, 0, 0)
    ;(world as any).update(1 / 60)
    expect(world.canDismount()).toBe(false)

    expect(world.restoreOnFoot(towns[1].id)).toBe(true)
    expect(world.isOnFoot()).toBe(true)
    // Restoring FROM the saved state must not fire onModeChange (already persisted).
    expect(modeChanges).toHaveLength(0)
  })

  it('returns false for an unknown town id', () => {
    const { world } = makeRig()
    expect(world.restoreOnFoot('town-does-not-exist')).toBe(false)
    expect(world.isOnFoot()).toBe(false)
  })
})
