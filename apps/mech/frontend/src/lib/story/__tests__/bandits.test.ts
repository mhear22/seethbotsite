/**
 * Roaming bandits (see Bandits.ts) — hostile mechs that prowl near living towns,
 * aggro on the player, and can be fought/killed in free roam.
 *
 * Drives a REAL StoryWorld (headless renderer/DOM, same rig as
 * overworld-gunplay.test.ts) so this suite pins the world-side seams:
 *
 *   - spawning respects the MAX_BANDITS cap;
 *   - an abandoned town (condition at/under the threshold) is never chosen as a
 *     spawn anchor;
 *   - a live bandit near the player vouches for reckless-looking fire near a
 *     town (OverworldGunplay.hostilesNear, wired to BanditSystem.hasHostileNear)
 *     while shots still fly;
 *   - a player projectile driven into a bandit kills it and fires onBanditKilled
 *     with a salvage-ready payload.
 *
 * Uses direct internal calls ((world as any).bandits.trySpawn(...)) rather than
 * waiting out the real ~25s spawn-check timer.
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
import { MAX_BANDITS, SPAWN_TOWN_MIN_CONDITION } from '../Bandits'
import { MechEntity, type CombatStats } from '../../battle/MechEntity'
import { createTowns } from '../../../composables/useStoryMode'
import { findPartById } from '../../../shared/data/MechParts'
import type { ArmPart, MechLoadout } from '../../../shared/types/MechTypes'
import type { EnemyKill } from '../StoryCombat'

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

let rigs: StoryWorld[] = []
function makeRig() {
  const towns = createTowns()
  const reckless: Array<{ townId: string; severity: number }> = []
  const banditKills: EnemyKill[] = []
  const spotted: number[] = []
  const world = new StoryWorld({
    canvas: (globalThis as any).document.createElement('canvas'),
    playerMech: makePlayer(),
    towns,
    graphics: { shadowQuality: 'off' } as any,
    onRecklessFire: (townId: string, severity: number) => reckless.push({ townId, severity }),
    onBanditKilled: (kill: EnemyKill) => banditKills.push(kill),
    onBanditsSpotted: (count: number) => spotted.push(count),
  } as any)
  rigs.push(world)
  const update = (dt: number) => (world as any).update(dt)
  const holdFire = (down: boolean) => (world as any).inputManager.setVirtualButton('shootRight', down)
  const placePlayer = (x: number, z: number) => (world as any)._playerMech.position.set(x, 0, z)
  const bandits = () => (world as any).bandits
  const projectiles = () => (world as any).projectileSystem.getProjectiles()
  return { world, towns, reckless, banditKills, spotted, update, holdFire, placePlayer, bandits, projectiles }
}

afterEach(() => { for (const w of rigs) w.cleanup(); rigs = [] })

describe('roaming bandits', () => {
  it('caps spawning at MAX_BANDITS — a spawn attempt past the cap is refused', () => {
    const { towns, update, placePlayer, bandits } = makeRig()
    const [x, , z] = towns[0].position
    placePlayer(x, z)
    update(0.1) // let the rig settle (terrain/towns constructed)

    const pos = new THREE.Vector3(x, 0, z)
    for (let i = 0; i < MAX_BANDITS; i++) {
      expect(bandits().trySpawn(pos)).toBe(true)
    }
    expect(bandits().count).toBe(MAX_BANDITS)
    // A 4th attempt is refused — the cap holds regardless of eligible towns.
    expect(bandits().trySpawn(pos)).toBe(false)
    expect(bandits().count).toBe(MAX_BANDITS)
  })

  it('never anchors a spawn on an abandoned town (condition at/under the threshold)', () => {
    const { towns, update, placePlayer, bandits } = makeRig()
    for (const t of towns) t.condition = SPAWN_TOWN_MIN_CONDITION // at the threshold, not above it
    const [x, , z] = towns[0].position
    placePlayer(x, z)
    update(0.1)

    const pos = new THREE.Vector3(x, 0, z)
    expect(bandits().trySpawn(pos)).toBe(false)
    expect(bandits().count).toBe(0)
  })

  it('a live bandit near the player vouches for reckless-looking fire near a town, without silencing the shots', () => {
    const { towns, reckless, update, holdFire, placePlayer, bandits, projectiles } = makeRig()
    const [x, , z] = towns[0].position
    placePlayer(x, z) // town centre: would normally read as reckless fire
    update(0.1)

    // Force-spawn a bandit, then park it well within the 80u hostile-vouch radius
    // of the player (trySpawn's own ring is 90-150u out — too far for the gate).
    expect(bandits().trySpawn(new THREE.Vector3(x, 0, z))).toBe(true)
    const bandit = (bandits() as any).bandits[0]
    bandit.mech.position.set(x + 30, 0, z)

    holdFire(true)
    for (let i = 0; i < 10; i++) update(0.1) // several shots — would normally trip the cooldown-gated protest
    holdFire(false)

    expect(reckless.length).toBe(0)
    expect(projectiles().length).toBeGreaterThan(0)
  })

  it('a player projectile driven into a bandit kills it and fires onBanditKilled', () => {
    const { towns, banditKills, update, holdFire, placePlayer, bandits, projectiles } = makeRig()
    const [x, , z] = towns[0].position
    placePlayer(x, z)
    update(0.1)

    expect(bandits().trySpawn(new THREE.Vector3(x, 0, z))).toBe(true)
    const bandit = (bandits() as any).bandits[0]
    bandit.mech.position.set(x + 40, 0, z)
    // One HP left — the next hit that lands is guaranteed to defeat it, mirroring
    // the StoryCombat test pattern (set health low, drive one hit home).
    bandit.mech.stats.currentHealth = 1

    // Fire a real player shot so the collision path (checkCollisions → takeDamage
    // → onBanditKilled) is exercised end-to-end, not a synthetic takeDamage call.
    holdFire(true)
    update(0.1)
    holdFire(false)
    const shots = projectiles()
    expect(shots.length).toBeGreaterThan(0)

    // Drive the shot straight onto the bandit's hitbox. Zero velocity so this
    // frame's own physics step can't carry it away before the impact check reads
    // it (mirrors overworld-gunplay.test.ts's building/ground-impact tests).
    const shot = shots[0]
    shot.velocity.set(0, 0, 0)
    shot.position.set(bandit.mech.position.x, bandit.mech.position.y + 1, bandit.mech.position.z)
    update(0.1)

    expect(banditKills.length).toBe(1)
    expect(banditKills[0].loadout).toBeTruthy()
    expect(Array.isArray(banditKills[0].destroyedSlots)).toBe(true)
    expect(bandits().count).toBe(0) // dead bandit is removed + disposed
  })
})
