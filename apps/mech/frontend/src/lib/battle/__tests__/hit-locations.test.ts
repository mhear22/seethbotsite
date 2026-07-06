/**
 * Phase 2 — hit locations & part destruction (design §3.3). Covers the HIT
 * LOCATIONS cluster: per-slot sub-hitbox resolution in ProjectileSystem.
 * checkCollisions, per-slot overlay HP on MechEntity, the limb-hit core bleed,
 * the railgun slot-damage payoff, delimb consequences (arm weapon dead, legs
 * strand flag, head no-lock-on), the onSlotDestroyed seam, and that Phase 1
 * dash i-frames / shield still gate slot damage.
 *
 * fireWeapon/ProjectileSystem builds three.js meshes + a pooled canvas texture,
 * so we stub a minimal document.createElement('canvas') for the node env.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import * as THREE from 'three'
import { findPartById } from '../../../shared/data/MechParts'
import type { ArmPart, LegsPart, HeadPart, MechLoadout } from '../../../shared/types/MechTypes'
import {
  MechEntity,
  SLOT_HP_MULTIPLIER,
  SLOT_CORE_BLEED,
  SLOT_ARMOR_PIERCE_MULTIPLIER,
  type CombatStats,
} from '../MechEntity'
import { ProjectileSystem } from '../ProjectileSystem'
import { PhysicsSystem } from '../PhysicsSystem'
import type { InputState } from '../InputManager'

beforeAll(() => {
  if (typeof (globalThis as any).document === 'undefined') {
    const ctx = {
      createRadialGradient: () => ({ addColorStop() {} }),
      fillRect() {},
      set fillStyle(_v: unknown) {},
    }
    ;(globalThis as any).document = {
      createElement: () => ({ width: 0, height: 0, getContext: () => ctx }),
    }
  }
})

function arm(id: string): ArmPart { return findPartById(id) as ArmPart }
function legs(id: string): LegsPart { return findPartById(id) as LegsPart }
function head(id: string): HeadPart { return findPartById(id) as HeadPart }

function makeLoadout(over: Partial<MechLoadout> = {}): MechLoadout {
  return {
    leftArm: arm('arm-autocannon-mk1'),
    rightArm: arm('arm-autocannon-mk1'),
    core: findPartById('core-diesel-gen') as MechLoadout['core'],
    legs: legs('legs-bipedal-standard'),
    head: head('head-standard-optics'),
    rack: null,
    ...over,
  }
}

function makeMech(loadout: MechLoadout = makeLoadout(), stats: Partial<CombatStats> = {}): MechEntity {
  const full: CombatStats = {
    maxHealth: 500, currentHealth: 500, armor: 0, speed: 50,
    firepower: 20, accuracy: 20, energy: 100, ...stats,
  }
  const m = new MechEntity('t', 'Test', loadout, full, false, new THREE.Vector3())
  m.currentPower = 10_000
  return m
}

const NO_INPUT: InputState = {
  forward: false, backward: false, left: false, right: false,
  jump: false, dash: false, useAbility: false,
} as InputState

describe('per-slot overlay HP init (design §3.3 table)', () => {
  it('derives limb HP from part stats × the design multipliers', () => {
    const m = makeMech()
    // autocannon arm health 10 ×8, bipedal legs 80 ×2, standard head 30 ×3.
    expect(m.slotMaxHP.leftArm).toBe(10 * SLOT_HP_MULTIPLIER.leftArm)
    expect(m.slotMaxHP.rightArm).toBe(10 * SLOT_HP_MULTIPLIER.rightArm)
    expect(m.slotMaxHP.legs).toBe(80 * SLOT_HP_MULTIPLIER.legs)
    expect(m.slotMaxHP.head).toBe(30 * SLOT_HP_MULTIPLIER.head)
    // core is the death pool — no independent overlay.
    expect(m.slotMaxHP.core).toBeUndefined()
  })

  // ── Phase 3 coordinated tuning-pass pins (the delimb/TTK triangle) ────────
  // These lock the chosen numbers so a future edit that reverts the "delimb is
  // near-free" fix trips a test. See MechEntity.SLOT_HP_MULTIPLIER for the full
  // rationale block.
  it('pins the Phase 3 multipliers: arms 8, head 3, legs 2 (arms/head raised)', () => {
    expect(SLOT_HP_MULTIPLIER.leftArm).toBe(8)
    expect(SLOT_HP_MULTIPLIER.rightArm).toBe(8)
    expect(SLOT_HP_MULTIPLIER.head).toBe(3)
    expect(SLOT_HP_MULTIPLIER.legs).toBe(2)
    expect(SLOT_CORE_BLEED).toBe(0.35)
  })

  it('makes an arm delimb cost meaningful focused fire (~35% of the core-kill TTK)', () => {
    // Representative starter: autocannon arms (health 10), diesel core, bipedal
    // legs, standard head. maxHealth = sum(part health) = 10+10+100+80+30 = 230.
    // A core-aimed kill drains 230; delimbing the arm drains its overlay pool.
    // Ratio = armPool / coreKillPool must land in the design's 35-45% band, and
    // sit far above the old near-free ~7% (10×3 / 230).
    const m = makeMech(makeLoadout(), { maxHealth: 230, currentHealth: 230, armor: 0 })
    const armPool = m.slotMaxHP.leftArm! // 10 × 8 = 80
    const coreKillPool = m.stats.maxHealth // 230
    const ratio = armPool / coreKillPool
    expect(ratio).toBeGreaterThan(0.3)
    expect(ratio).toBeLessThan(0.5)
    // Strictly dearer than the pre-Phase-3 near-free delimb (mult 3 → 30/230).
    expect(armPool).toBeGreaterThan((30 / 230) * coreKillPool)
  })
})

describe('sub-hitbox resolution (ProjectileSystem.checkCollisions)', () => {
  // Place one projectile at a local height/lateral offset and read back the slot.
  function slotAt(localY: number, lateralX = 0): string {
    const ps = new ProjectileSystem(new THREE.Scene())
    const target = makeMech()
    target.id = 'victim'
    // Owner id differs so the hit registers.
    ;(ps as any).projectiles.push({
      id: 'p', type: 'ballistic', ownerId: 'shooter',
      position: new THREE.Vector3(lateralX, localY, 0),
      velocity: new THREE.Vector3(0, 0, 1), damage: 1, damageType: 'kinetic', lifetime: 1,
      mesh: new THREE.Mesh(),
    })
    const hits = ps.checkCollisions([target])
    expect(hits.length).toBe(1)
    return hits[0].slot
  }

  it('bins the vertical bands: head top, legs bottom, core centre', () => {
    expect(slotAt(4.6)).toBe('head')
    expect(slotAt(1.0)).toBe('legs')
    expect(slotAt(2.8)).toBe('core') // centre mass, no lateral offset
  })

  it('picks the arm by lateral offset in the torso band', () => {
    expect(slotAt(3.8, -1.0)).toBe('leftArm')  // -x flank
    expect(slotAt(3.8, 1.0)).toBe('rightArm')  // +x flank
  })
})

describe('slot damage, core bleed, and railgun payoff', () => {
  it('limb hit chips the slot pool and bleeds a fraction to core', () => {
    const m = makeMech(makeLoadout(), { armor: 0 })
    const beforeCore = m.stats.currentHealth
    const beforeArm = m.slotHP.leftArm! // 30 (autocannon health 10 ×3)
    m.takeDamage(20, 'kinetic', { slot: 'leftArm' }) // under the pool, no destroy
    expect(m.slotHP.leftArm).toBeCloseTo(beforeArm - 20, 5)
    expect(beforeCore - m.stats.currentHealth).toBeCloseTo(20 * SLOT_CORE_BLEED, 5)
  })

  it('an unresolved / core hit applies full damage to core (legacy behaviour)', () => {
    const m = makeMech(makeLoadout(), { armor: 0 })
    m.takeDamage(100, 'kinetic') // no slot
    expect(500 - m.stats.currentHealth).toBeCloseTo(100, 5)
    const m2 = makeMech(makeLoadout(), { armor: 0 })
    m2.takeDamage(100, 'kinetic', { slot: 'core' })
    expect(500 - m2.stats.currentHealth).toBeCloseTo(100, 5)
  })

  it('armour-piercing multiplies SLOT damage but not the core bleed', () => {
    const m = makeMech(makeLoadout(), { armor: 0 })
    const beforeArm = m.slotHP.leftArm! // 30; keep base×mult under it
    m.takeDamage(10, 'energy', { slot: 'leftArm', armorPierce: true })
    expect(beforeArm - m.slotHP.leftArm!).toBeCloseTo(10 * SLOT_ARMOR_PIERCE_MULTIPLIER, 5)
    expect(500 - m.stats.currentHealth).toBeCloseTo(10 * SLOT_CORE_BLEED, 5)
  })
})

describe('delimb consequences', () => {
  it('arm destruction sets the flag, fires onSlotDestroyed, and kills that weapon', () => {
    const m = makeMech()
    let firedSlot: string | null = null
    m.onSlotDestroyed = (_mech, slot) => { firedSlot = slot }
    m.takeDamage(9999, 'kinetic', { slot: 'leftArm' })
    expect(m.leftArmDestroyed).toBe(true)
    expect(m.destroyedSlots.has('leftArm')).toBe(true)
    expect(firedSlot).toBe('leftArm')

    // fireWeapon returns null for the dead arm, still fires from the live arm.
    const ps = new ProjectileSystem(new THREE.Scene())
    m.currentPower = 10_000
    expect(ps.fireWeapon(m, new THREE.Vector3(0, 0, 1), 'left')).toBeNull()
    expect(ps.fireWeapon(m, new THREE.Vector3(0, 0, 1), 'right')).not.toBeNull()
  })

  it('fires onSlotDestroyed exactly once (not on subsequent hits)', () => {
    const m = makeMech()
    let count = 0
    m.onSlotDestroyed = () => { count++ }
    m.takeDamage(9999, 'kinetic', { slot: 'head' })
    m.takeDamage(9999, 'kinetic', { slot: 'head' })
    expect(count).toBe(1)
  })

  it('head destruction disables the mech\'s own missile lock and zeroes targeting bonus', () => {
    const m = makeMech(makeLoadout({ leftArm: arm('arm-missile-pod') }))
    m.currentPower = 10_000
    const enemy = makeMech(); enemy.id = 'enemy'
    const ps = new ProjectileSystem(new THREE.Scene())
    // Before: locks on.
    expect(ps.fireWeapon(m, new THREE.Vector3(0, 0, 1), 'left', enemy)!.targetId).toBe('enemy')
    m.takeDamage(9999, 'kinetic', { slot: 'head' })
    expect(m.headDestroyed).toBe(true)
    expect(m.getTargetingBonus(50, false)).toBe(0)
    // After: missile flies dumb-fire (no target acquired).
    expect(ps.fireWeapon(m, new THREE.Vector3(0, 0, 1), 'left', enemy)!.targetId).toBeUndefined()
  })

  it('legs destruction strands movement (speed cut) and blocks dash + jump', () => {
    const phys = new PhysicsSystem()
    const forwardInput = { ...NO_INPUT, forward: true }

    // Healthy reference: a few frames of forward movement.
    const healthy = makeMech()
    for (let i = 0; i < 30; i++) phys.updateMovement(healthy, forwardInput, 0.05)
    const healthySpeed = Math.hypot(healthy.velocity.x, healthy.velocity.z)

    const stranded = makeMech()
    stranded.legsDestroyed = true
    for (let i = 0; i < 30; i++) phys.updateMovement(stranded, forwardInput, 0.05)
    const strandedSpeed = Math.hypot(stranded.velocity.x, stranded.velocity.z)
    expect(strandedSpeed).toBeLessThan(healthySpeed)
    expect(strandedSpeed).toBeGreaterThan(0)

    // No dash while stranded.
    expect(phys.updateDash(stranded, { ...NO_INPUT, dash: true }, 0.05)).toBe(false)
    // No jump while stranded.
    stranded.isJumping = false
    stranded.velocity.y = 0
    phys.updateJumpJets(stranded, { ...NO_INPUT, jump: true }, 0.05)
    expect(stranded.isJumping).toBe(false)
  })
})

describe('Phase 1 defences still gate slot hits', () => {
  it('dash i-frames negate a limb hit entirely (no slot damage)', () => {
    const m = makeMech()
    m.isDashing = true
    const beforeArm = m.slotHP.leftArm!
    m.takeDamage(9999, 'kinetic', { slot: 'leftArm' })
    expect(m.slotHP.leftArm).toBe(beforeArm)
    expect(m.leftArmDestroyed).toBe(false)
    expect(m.stats.currentHealth).toBe(500)
  })

  it('a frontal shield reduces the damage reaching a slot', () => {
    const m = makeMech(makeLoadout({ leftArm: arm('arm-shield-gen') }), { armor: 0 })
    m.currentPower = 1000
    const beforeArm = m.slotHP.leftArm!
    m.activateShield()
    m.takeDamage(100, 'kinetic', { slot: 'rightArm', fromFront: true })
    // Shield blocked 70% → rightArm pool lost < 100.
    expect(m.slotMaxHP.rightArm! - m.slotHP.rightArm!).toBeLessThan(100)
    expect(m.currentPower).toBeLessThan(1000)
    // left arm (the shield gen) untouched by this rightArm hit.
    expect(m.slotHP.leftArm).toBe(beforeArm)
  })
})
