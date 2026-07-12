/**
 * Overworld free-roam gunplay — firing outside encounters, ground scarring,
 * the reckless-fire standing tax (fired near a town with no hostiles), and the
 * stray-impact/building-hit CONDITION tax (landed/direct-hit shots near a town).
 *
 * The pure standing math (applyRecklessFire) is pinned in campaign-systems;
 * this suite drives a REAL StoryWorld (headless renderer/DOM, same rig as
 * StoryWorld.dismount.test.ts) to pin the world-side seams:
 *
 *   - holding fire in free roam actually spawns projectiles (the input was
 *     previously read and discarded outside encounters);
 *   - onRecklessFire fires with the town id + proximity severity when shooting
 *     inside RECKLESS_FIRE_RADIUS of a town, and is cooldown-throttled;
 *   - shooting out in the open fires no reckless event;
 *   - a projectile reaching the ground registers a persistent scar instance
 *     and is removed from flight;
 *   - a projectile landing near a town's centre taxes its condition
 *     (onCollateral, forwarded from OverworldGunplay's onStrayImpact) with no
 *     cooldown, tapered by proximity;
 *   - a projectile that strikes a town building directly is removed with NO
 *     ground scar and a much harder condition tax;
 *   - a landed shot far from every town taxes nothing.
 */
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
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
    forceContextLoss() {}
  }
  return { ...actual, WebGLRenderer: HeadlessRenderer }
})

// --- stub the mech GLB loader (mirrors StoryWorld.dismount.test) ---------------
vi.mock('../../../lib/battle/MechModelLoader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../lib/battle/MechModelLoader')>()
  return { ...actual, getMechModelLoader: () => ({ assembleMech: async () => new THREE.Group() }) }
})

import { StoryWorld } from '../StoryWorld'
import { MechEntity, type CombatStats } from '../../battle/MechEntity'
import { createTowns } from '../../../composables/useStoryMode'
import { findPartById } from '../../../shared/data/MechParts'
import type { ArmPart, MechLoadout } from '../../../shared/types/MechTypes'

// --- DOM + canvas shims for a node env (same surface as the dismount rig) ------
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

interface RecklessEvent { townId: string; severity: number }
interface CollateralEvent { amount: number; position: THREE.Vector3 }
let rigs: StoryWorld[] = []
function makeRig() {
  const towns = createTowns()
  const reckless: RecklessEvent[] = []
  const collateral: CollateralEvent[] = []
  const world = new StoryWorld({
    canvas: (globalThis as any).document.createElement('canvas'),
    playerMech: makePlayer(),
    towns,
    graphics: { shadowQuality: 'off' } as any,
    onRecklessFire: (townId: string, severity: number) => reckless.push({ townId, severity }),
    onCollateral: (amount: number, position: THREE.Vector3) => collateral.push({ amount, position }),
  } as any)
  rigs.push(world)
  const update = (dt: number) => (world as any).update(dt)
  const holdFire = (down: boolean) => (world as any).inputManager.setVirtualButton('shootRight', down)
  const placePlayer = (x: number, z: number) => (world as any)._playerMech.position.set(x, 0, z)
  return { world, towns, reckless, collateral, update, holdFire, placePlayer }
}

afterEach(() => { for (const w of rigs) w.cleanup(); rigs = [] })

describe('free-roam firing (outside encounters)', () => {
  it('spawns projectiles while fire is held, none while released', () => {
    const { world, update, holdFire, placePlayer } = makeRig()
    placePlayer(0, 0) // open ground, no town in reach
    update(0.1)
    const projectiles = () => (world as any).projectileSystem.getProjectiles()
    expect(projectiles().length).toBe(0)

    holdFire(true)
    update(0.1)
    expect(projectiles().length).toBeGreaterThan(0)
    holdFire(false)
  })

  it('reports reckless fire with town id + proximity severity, throttled by cooldown', () => {
    const { towns, reckless, update, holdFire, placePlayer } = makeRig()
    const [x, , z] = towns[0].position
    placePlayer(x, z) // town centre: severity ~1
    update(0.1)

    holdFire(true)
    // Several shots inside the cooldown window: exactly one event.
    for (let i = 0; i < 10; i++) update(0.1) // 1.0s < cooldown
    expect(reckless.length).toBe(1)
    expect(reckless[0].townId).toBe(towns[0].id)
    expect(reckless[0].severity).toBeGreaterThan(0.9)
    expect(reckless[0].severity).toBeLessThanOrEqual(1)

    // Keep firing past the cooldown: a second event lands.
    for (let i = 0; i < 45; i++) update(0.1) // +4.5s > cooldown
    expect(reckless.length).toBe(2)
    holdFire(false)
  })

  it('fires no reckless event out in the open', () => {
    const { reckless, update, holdFire, placePlayer } = makeRig()
    placePlayer(0, 0) // spawn origin: outside every town pad
    update(0.1)
    holdFire(true)
    for (let i = 0; i < 10; i++) update(0.1)
    holdFire(false)
    expect(reckless.length).toBe(0)
  })

  it('scars the ground where a projectile lands and removes it from flight', () => {
    const { world, towns, update, holdFire, placePlayer } = makeRig()
    const [x, , z] = towns[0].position
    placePlayer(x, z)
    update(0.1)

    holdFire(true)
    update(0.1)
    holdFire(false)
    const gunplay = (world as any).gunplay
    const projectiles = (world as any).projectileSystem.getProjectiles()
    expect(projectiles.length).toBeGreaterThan(0)
    expect(gunplay.scarCount).toBe(0)

    // Drive one projectile below the terrain surface; next frame must impact.
    projectiles[0].position.y = -50
    update(0.1)
    expect(gunplay.scarCount).toBeGreaterThan(0)
    expect((world as any).projectileSystem.getProjectiles()).not.toContain(projectiles[0])
  })

  it('taxes a town condition (stray-impact collateral) when a shot lands at its centre', () => {
    const { world, towns, collateral, update, holdFire, placePlayer } = makeRig()
    const [x, , z] = towns[0].position
    placePlayer(x, z)
    update(0.1)

    holdFire(true)
    update(0.1)
    holdFire(false)
    const gunplay = (world as any).gunplay
    const projectiles = (world as any).projectileSystem.getProjectiles()
    expect(projectiles.length).toBeGreaterThan(0)
    const scarBefore = gunplay.scarCount

    // Force the shot straight down onto the town centre (no building sits
    // there); zero its velocity so this frame's own physics step can't carry
    // it away from the exact point before the impact check reads it.
    projectiles[0].velocity.set(0, 0, 0)
    projectiles[0].position.set(x, -50, z)
    update(0.1)

    expect(gunplay.scarCount).toBeGreaterThan(scarBefore) // still scars the ground
    expect(collateral.length).toBe(1)
    expect(collateral[0].amount).toBeCloseTo(0.35, 1) // IMPACT_SEVERITY at dist ~0
    // `towns[0].position` is the plain [x,y,z] tuple from createTowns(); the
    // emitted position is the real Town instance's world Vector3 — compare xz.
    expect(collateral[0].position.x).toBeCloseTo(x, 5)
    expect(collateral[0].position.z).toBeCloseTo(z, 5)
  })

  it('taxes a town condition much harder on a direct building hit, with no ground scar', () => {
    const { world, towns, collateral, update, holdFire, placePlayer } = makeRig()
    const [x, , z] = towns[0].position
    placePlayer(x, z)
    update(0.1)

    holdFire(true)
    update(0.1)
    holdFire(false)
    const gunplay = (world as any).gunplay
    const projectiles = (world as any).projectileSystem.getProjectiles()
    expect(projectiles.length).toBeGreaterThan(0)
    const p = projectiles[0]
    const scarBefore = gunplay.scarCount

    // Drop the shot dead-centre inside the first building's collider (Town.ts
    // buildingDefs[0]: w8 h9 d8 at local x=-8, z=-6 — world centre y=h/2=4.5).
    // Zero velocity so this frame's own physics step can't carry it out of the
    // collider before the building-hit check reads it.
    p.velocity.set(0, 0, 0)
    p.position.set(x - 8, 4.5, z - 6)
    update(0.1)

    expect((world as any).projectileSystem.getProjectiles()).not.toContain(p)
    expect(gunplay.scarCount).toBe(scarBefore) // building hits never add a ground scar
    expect(collateral.length).toBe(1)
    // dist to town centre = hypot(8, 6) = 10 → IMPACT_SEVERITY*(1-10/70)*3 = 0.9
    expect(collateral[0].amount).toBeCloseTo(0.9, 2)
  })

  it('taxes nothing for a landed shot far from every town', () => {
    const { world, collateral, update, holdFire, placePlayer } = makeRig()
    placePlayer(0, 0) // spawn origin: outside every town's RECKLESS_FIRE_RADIUS
    update(0.1)

    holdFire(true)
    update(0.1)
    holdFire(false)
    const gunplay = (world as any).gunplay
    const projectiles = (world as any).projectileSystem.getProjectiles()
    expect(projectiles.length).toBeGreaterThan(0)
    const scarBefore = gunplay.scarCount

    projectiles[0].position.y = -50
    update(0.1)

    expect(gunplay.scarCount).toBeGreaterThan(scarBefore) // ground scarring is unconditional
    expect(collateral.length).toBe(0)
  })
})
