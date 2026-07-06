/**
 * Phase 4 — WALKABLE TOWN (GRINDER §4.4).
 *
 * The pedestrian pass on Town.ts: the five anchors, the on-foot colliders the
 * ENTITY cluster's OnFootPhysics resolves against, and the nameable NPC stations
 * that drive the on-foot E-prompt. All positions are asserted WORLD-space (town
 * centre + local) since that is the contract every caller relies on.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { Town, type AnchorKind, type NPCRole } from '../Town'

/** A town parked well off origin so world-vs-local offsets are unambiguous. */
function makeTown(condition = 100): Town {
  return new Town({ id: 'town-3', name: 'The Kiln', position: [100, 0, 50], condition })
}

const ALL_KINDS: AnchorKind[] = ['gate', 'garage', 'comms', 'warden', 'commons']

describe('town anchors (§4.4)', () => {
  it('exposes exactly the five anchors, one per kind, all world-space', () => {
    const town = makeTown()
    const anchors = town.getAnchors()
    expect(anchors).toHaveLength(5)
    const kinds = anchors.map((a) => a.kind).sort()
    expect(kinds).toEqual([...ALL_KINDS].sort())
    for (const a of anchors) {
      expect(a.townId).toBe('town-3')
      expect(a.label.length).toBeGreaterThan(0)
      // World-space: no anchor sits exactly at the local origin's world spot by
      // accident — each is offset from the town centre by its layout position.
      expect(a.position).toBeInstanceOf(THREE.Vector3)
    }
  })

  it('getAnchor + getGatePosition agree, and the gate is the +Z front berth', () => {
    const town = makeTown()
    const gate = town.getAnchor('gate')!
    expect(gate).toBeTruthy()
    // Gate berth is world-space = town centre (100,0,50) + local (0,0,22).
    expect(gate.position.x).toBeCloseTo(100, 5)
    expect(gate.position.z).toBeCloseTo(72, 5)
    expect(town.getGatePosition().distanceTo(gate.position)).toBeCloseTo(0, 5)
  })
})

describe('pedestrian colliders (§4.4)', () => {
  it('returns a non-empty mix of boxes and cylinders, all world-space', () => {
    const town = makeTown()
    const colliders = town.getPedestrianColliders()
    expect(colliders.length).toBeGreaterThan(4)
    const boxes = colliders.filter((c) => c.kind === 'box')
    const cylinders = colliders.filter((c) => c.kind === 'cylinder')
    expect(boxes.length).toBeGreaterThan(0)
    expect(cylinders.length).toBeGreaterThan(0)
    // Every collider centre is offset into world space (near the town, not origin).
    for (const c of colliders) {
      expect(Math.hypot(c.center.x - 100, c.center.z - 50)).toBeLessThan(40)
    }
  })

  it('boxes carry positive half-extents, cylinders a positive radius/height', () => {
    for (const c of makeTown().getPedestrianColliders()) {
      if (c.kind === 'box') {
        expect(c.halfExtents.x).toBeGreaterThan(0)
        expect(c.halfExtents.z).toBeGreaterThan(0)
      } else {
        expect(c.radius).toBeGreaterThan(0)
        expect(c.height).toBeGreaterThan(0)
      }
    }
  })

  it('the gate berth is kept clear — no collider overlaps the parked-Frame pad', () => {
    const gate = makeTown().getGatePosition()
    for (const c of makeTown().getPedestrianColliders()) {
      // The two gate pillars flank the berth (±5u); nothing blocks the centre.
      const d = Math.hypot(c.center.x - gate.x, c.center.z - gate.z)
      expect(d).toBeGreaterThan(2)
    }
  })
})

describe('NPC stations + proximity queries (§4.4)', () => {
  it('stands one nameable NPC at each interactable anchor (gate has none)', () => {
    const town = makeTown()
    const npcs = town.getNPCs()
    const roles = npcs.map((n) => n.role).sort()
    expect(roles).toEqual((['comms', 'local', 'rooker', 'warden'] as NPCRole[]).sort())
    // The gate is the parked-Frame berth — never an NPC.
    expect(npcs.some((n) => n.anchor === 'gate')).toBe(false)
    for (const n of npcs) {
      expect(n.id).toBe(`town-3-${n.role}`)
      expect(n.name.length).toBeGreaterThan(0)
    }
  })

  it('nearestNPC / getNPCAtPosition find the NPC you stand next to, else null', () => {
    const town = makeTown()
    const rooker = town.getNPCs().find((n) => n.role === 'rooker')!
    // Standing on Rooker returns Rooker within the interact radius.
    const hit = town.nearestNPC(rooker.position.clone(), 4.5)
    expect(hit?.role).toBe('rooker')
    // getNPCAtPosition is the alias the ENTITY cluster codes against.
    expect(town.getNPCAtPosition(rooker.position.clone(), 4.5)?.id).toBe(rooker.id)
    // Far away (map corner) → nobody in range.
    expect(town.nearestNPC(new THREE.Vector3(-500, 0, -500), 4.5)).toBeNull()
  })

  it('nearestAnchor resolves the anchor you are standing in', () => {
    const town = makeTown()
    const gate = town.getGatePosition()
    expect(town.nearestAnchor(gate, 6)?.kind).toBe('gate')
    expect(town.nearestAnchor(new THREE.Vector3(-500, 0, -500), 6)).toBeNull()
  })
})

describe('condition reactivity + teardown', () => {
  it('re-skins from pristine to gutted without changing the pedestrian contract', () => {
    const town = makeTown(100)
    const anchorsBefore = town.getAnchors().length
    const collidersBefore = town.getPedestrianColliders().length
    const npcsBefore = town.getNPCs().length
    // Decayed variant: structures scorch, survivors slump — but the walkable
    // contract (anchors/colliders/NPCs) is stable so the hub never breaks.
    expect(() => town.setCondition(0)).not.toThrow()
    expect(town.getAnchors()).toHaveLength(anchorsBefore)
    expect(town.getPedestrianColliders()).toHaveLength(collidersBefore)
    expect(town.getNPCs()).toHaveLength(npcsBefore)
    expect(() => town.setCondition(55)).not.toThrow()
  })

  it('dispose clears the pedestrian arrays', () => {
    const town = makeTown()
    town.dispose()
    expect(town.getAnchors()).toHaveLength(0)
    expect(town.getPedestrianColliders()).toHaveLength(0)
    expect(town.getNPCs()).toHaveLength(0)
  })
})
