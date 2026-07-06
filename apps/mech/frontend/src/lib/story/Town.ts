import * as THREE from 'three'
import type { TownState } from '../../composables/useStoryMode'
import { farmsAliveForCondition, populationForCondition } from '../../composables/useStoryMode'

// ============================================================================
// Pedestrian-scale types (design §4.4). Consumed by the on-foot ENTITY cluster:
// OnFootPhysics resolves against getPedestrianColliders(); the town-hub UI drives
// its E-prompt off nearestNPC()/nearestAnchor(). All positions are WORLD-space so
// callers never have to know the town's group transform.
// ============================================================================

/** The five town anchors that structure the pedestrian hub (design §4.4). */
export type AnchorKind = 'gate' | 'garage' | 'comms' | 'warden' | 'commons'

/** Who lives at an anchor. `comms` is a console (Vaun is voice-only), not a face. */
export type NPCRole = 'rooker' | 'warden' | 'comms' | 'local'

/**
 * A simple on-foot collision volume. Boxes are axis-aligned (buildings);
 * cylinders wrap masts / pillars / wells. `center` is WORLD-space; the human
 * walker only cares about the XZ footprint, but `height`/y are provided so a
 * caller can gate by elevation if it wants.
 */
export type PedestrianCollider =
  | { kind: 'box'; center: THREE.Vector3; halfExtents: THREE.Vector3 }
  | { kind: 'cylinder'; center: THREE.Vector3; radius: number; height: number }

/** A positioned, nameable anchor (dismount pad, garage, comms, warden, commons). */
export interface TownAnchor {
  townId: string
  kind: AnchorKind
  /** WORLD-space position of the interact/stand point for this anchor. */
  position: THREE.Vector3
  /** Human label for the E-prompt / hub UI. */
  label: string
}

/** A nameable NPC station (garage=Rooker, warden, comms console, commons local). */
export interface TownNPC {
  id: string
  townId: string
  name: string
  role: NPCRole
  anchor: AnchorKind
  /** WORLD-space position (where the figure stands / the console sits). */
  position: THREE.Vector3
}

/**
 * Visual representation of a single town in the open world.
 *
 * Builds a small cluster: a couple of buildings, two farm plots, a crowd of
 * simple townsfolk figures, and a floating quest-giver marker. Condition-driven
 * visual states are exposed via setCondition(0..100) — Phase 1 wires the API and
 * applies coarse material/visibility changes; Phase 2 fleshes out the full
 * intact → damaged → rubble / green → wilting → dead transitions.
 *
 * The Town owns a single THREE.Group (`group`) which StoryWorld adds to the
 * (markRaw'd) scene. The Town instance itself must NOT be made reactive.
 */
export class Town {
  readonly id: string
  readonly name: string
  /** World-space centre of the town (y = 0). */
  readonly position: THREE.Vector3
  /** Root group; add this to the scene. */
  readonly group: THREE.Group

  private condition: number = 100

  // Sub-parts kept for condition-driven updates.
  private buildings: THREE.Mesh[] = []
  /** Rubble debris parented to each building (revealed as it collapses). */
  private buildingRubble: THREE.Mesh[][] = []
  private farms: THREE.Mesh[] = []
  /** Crop tufts per farm plot (wilt/cull with condition). */
  private farmCrops: THREE.Mesh[][] = []
  private townsfolk: THREE.Mesh[] = []
  private marker!: THREE.Mesh
  private markerBaseY: number = 0

  // --- Pedestrian pass (design §4.4) ---
  /** Anchor structure meshes kept for condition-reactive tinting. */
  private anchorStructures: THREE.Mesh[] = []
  /** World-space anchors (gate/garage/comms/warden/commons). */
  private anchors: TownAnchor[] = []
  /** Nameable NPC stations (one per meaningful anchor). */
  private npcs: TownNPC[] = []
  /** NPC figure meshes, index-aligned with `npcs`, for condition-reactive slump. */
  private npcMeshes: THREE.Mesh[] = []
  /** On-foot collision volumes (buildings + anchor structures), WORLD-space. */
  private colliders: PedestrianCollider[] = []
  /** Local (town-relative) anchor stand points, from which world anchors derive. */
  private static readonly ANCHOR_LAYOUT: Record<AnchorKind, { x: number; z: number; label: string }> = {
    // The gate sits on the town's +Z front edge: it is the dismount pad / mount
    // point (the parked Frame monument), so it must be clear of other structures.
    gate: { x: 0, z: 22, label: 'Gate — Frame berth' },
    garage: { x: 16, z: -10, label: "Rooker's Garage" },
    comms: { x: 18, z: 8, label: 'Comms Post' },
    warden: { x: -14, z: -12, label: "Warden's Office" },
    commons: { x: 0, z: 5, label: 'The Commons' },
  }

  // Shared geometries/materials owned by this town (disposed on teardown).
  private ownedGeometries: THREE.BufferGeometry[] = []
  private ownedMaterials: THREE.Material[] = []

  private static readonly CROWD_SIZE = 8

  // --- Condition thresholds (0..100). Shared by all visual transitions so the
  //     intact → damaged → rubble / green → wilting → dead stages are explicit. ---
  /** At/above this the town reads as thriving. */
  private static readonly THRIVING = 66
  /** Between DAMAGED and THRIVING: visibly suffering but standing. */
  private static readonly DAMAGED = 33
  /** Below RUBBLE the buildings have collapsed into rubble. */
  private static readonly RUBBLE = 15

  // Reusable palette (avoids per-frame allocations in setCondition).
  private static readonly FARM_GREEN = new THREE.Color(0x4caf50)
  private static readonly FARM_WILT = new THREE.Color(0xb59f3b)
  private static readonly FARM_DEAD = new THREE.Color(0x6b4f3a)
  private static readonly BUILDING_INTACT = new THREE.Color(0xb08968)
  private static readonly BUILDING_RUBBLE = new THREE.Color(0x4a3f37)
  private static readonly CROP_GREEN = new THREE.Color(0x2e7d32)
  private static readonly CROP_DEAD = new THREE.Color(0x5d4a36)
  private readonly _tmpColor = new THREE.Color()

  constructor(state: Pick<TownState, 'id' | 'name' | 'position' | 'condition'>) {
    this.id = state.id
    this.name = state.name
    this.position = new THREE.Vector3(state.position[0], state.position[1], state.position[2])

    this.group = new THREE.Group()
    this.group.name = `town-${state.id}`
    this.group.position.copy(this.position)

    this.build()
    this.setCondition(state.condition ?? 100)
  }

  private trackGeo<T extends THREE.BufferGeometry>(g: T): T {
    this.ownedGeometries.push(g)
    return g
  }

  private trackMat<T extends THREE.Material>(m: T): T {
    this.ownedMaterials.push(m)
    return m
  }

  private build(): void {
    // --- Ground pad so the town reads as a distinct region ---
    const padGeo = this.trackGeo(new THREE.CircleGeometry(34, 40))
    const padMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0x6b5d4f,
      roughness: 0.95,
      metalness: 0.0,
    }))
    const pad = new THREE.Mesh(padGeo, padMat)
    pad.rotation.x = -Math.PI / 2
    pad.position.y = 0.02
    pad.receiveShadow = true
    this.group.add(pad)

    // --- Buildings (a couple) ---
    const buildingMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0xb08968,
      roughness: 0.85,
      metalness: 0.05,
    }))
    const buildingDefs: Array<{ w: number; h: number; d: number; x: number; z: number }> = [
      { w: 8, h: 9, d: 8, x: -8, z: -6 },
      { w: 10, h: 6, d: 7, x: 9, z: -4 },
    ]
    for (const b of buildingDefs) {
      const geo = this.trackGeo(new THREE.BoxGeometry(b.w, b.h, b.d))
      const mesh = new THREE.Mesh(geo, buildingMat.clone())
      this.ownedMaterials.push(mesh.material as THREE.Material)
      mesh.position.set(b.x, b.h / 2, b.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData.baseHeight = b.h
      this.buildings.push(mesh)
      this.group.add(mesh)

      // Pedestrian AABB collider (world-space) so on-foot walkers can't clip it.
      this.colliders.push({
        kind: 'box',
        center: new THREE.Vector3(this.position.x + b.x, b.h / 2, this.position.z + b.z),
        halfExtents: new THREE.Vector3(b.w / 2, b.h / 2, b.d / 2),
      })

      // Rubble debris around the footprint, hidden until the building collapses.
      const rubblePieces: THREE.Mesh[] = []
      const rubbleMat = this.trackMat(new THREE.MeshStandardMaterial({
        color: Town.BUILDING_RUBBLE,
        roughness: 1.0,
        metalness: 0.0,
      }))
      for (let r = 0; r < 5; r++) {
        const s = 1.2 + (r % 3) * 0.7
        const rubGeo = this.trackGeo(new THREE.BoxGeometry(s, s * 0.6, s))
        const rub = new THREE.Mesh(rubGeo, rubbleMat)
        const ra = (r / 5) * Math.PI * 2
        const rr = b.w * 0.32
        rub.position.set(b.x + Math.cos(ra) * rr, (s * 0.6) / 2, b.z + Math.sin(ra) * rr)
        rub.rotation.set(Math.random() * 0.4, ra, Math.random() * 0.4)
        rub.castShadow = true
        rub.receiveShadow = true
        rub.visible = false
        rubblePieces.push(rub)
        this.group.add(rub)
      }
      this.buildingRubble.push(rubblePieces)
    }

    // --- Farms (2 plots) ---
    const farmDefs: Array<{ x: number; z: number }> = [
      { x: -14, z: 12 },
      { x: 14, z: 13 },
    ]
    for (const f of farmDefs) {
      const geo = this.trackGeo(new THREE.PlaneGeometry(12, 9))
      const mat = this.trackMat(new THREE.MeshStandardMaterial({
        color: 0x4caf50,
        roughness: 1.0,
        metalness: 0.0,
      }))
      const farm = new THREE.Mesh(geo, mat)
      farm.rotation.x = -Math.PI / 2
      farm.position.set(f.x, 0.05, f.z)
      farm.receiveShadow = true
      this.farms.push(farm)
      this.group.add(farm)

      // Crop tufts standing on the plot — they wilt (shrink + brown) then vanish
      // as the plot dies, giving the farm a readable green → dead transition.
      const crops: THREE.Mesh[] = []
      const cropGeo = this.trackGeo(new THREE.ConeGeometry(0.35, 1.4, 5))
      const cropMat = this.trackMat(new THREE.MeshStandardMaterial({
        color: Town.CROP_GREEN,
        roughness: 0.9,
        metalness: 0.0,
      }))
      for (let cx = -1; cx <= 1; cx++) {
        for (let cz = -1; cz <= 1; cz++) {
          const crop = new THREE.Mesh(cropGeo, cropMat)
          crop.position.set(f.x + cx * 3.2, 0.8, f.z + cz * 2.4)
          crop.castShadow = true
          crop.userData.baseY = 0.8
          crops.push(crop)
          this.group.add(crop)
        }
      }
      this.farmCrops.push(crops)
    }

    // --- Townsfolk (small crowd of simple figures) ---
    const folkGeo = this.trackGeo(new THREE.CapsuleGeometry(0.4, 1.0, 4, 8))
    for (let i = 0; i < Town.CROWD_SIZE; i++) {
      // Per-folk material so an individual can fade out as the crowd thins.
      const folkMat = this.trackMat(new THREE.MeshStandardMaterial({
        color: 0xe8c39e,
        roughness: 0.8,
        metalness: 0.0,
        transparent: true,
        opacity: 1,
      }))
      const angle = (i / Town.CROWD_SIZE) * Math.PI * 2
      const r = 5 + (i % 3) * 1.5
      const folk = new THREE.Mesh(folkGeo, folkMat)
      folk.position.set(Math.cos(angle) * r, 0.9, Math.sin(angle) * r)
      folk.castShadow = true
      this.townsfolk.push(folk)
      this.group.add(folk)
    }

    // --- Quest-giver marker (floating beacon) ---
    const markerGeo = this.trackGeo(new THREE.ConeGeometry(1.2, 3, 6))
    const markerMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0xffd54f,
      emissive: 0xffb300,
      emissiveIntensity: 0.8,
      roughness: 0.4,
      metalness: 0.2,
    }))
    this.marker = new THREE.Mesh(markerGeo, markerMat)
    this.markerBaseY = 6
    this.marker.position.set(0, this.markerBaseY, 0)
    this.marker.rotation.x = Math.PI // point down
    this.marker.name = 'quest-marker'
    this.group.add(this.marker)

    this.buildPedestrian()
  }

  /**
   * Pedestrian pass (design §4.4). Places the five anchors as visually distinct
   * structures in the existing procedural style, registers their colliders, and
   * stands a nameable NPC at each meaningful anchor (the gate is the parked-Frame
   * berth, so it has no figure). Everything is added to the same THREE.Group and
   * reads correctly from both the mech shoulder camera and the ~1.7u on-foot eye.
   */
  private buildPedestrian(): void {
    const L = Town.ANCHOR_LAYOUT

    // World-space anchors first — the hub UI and mount logic key off these.
    ;(Object.keys(L) as AnchorKind[]).forEach((kind) => {
      const a = L[kind]
      this.anchors.push({
        townId: this.id,
        kind,
        position: new THREE.Vector3(this.position.x + a.x, 0, this.position.z + a.z),
        label: a.label,
      })
    })

    // --- Gate: two pillars + a lintel forming a berth arch over the dismount pad ---
    const gate = L.gate
    const stoneMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0x8d8377, roughness: 0.9, metalness: 0.05,
    }))
    const pillarGeo = this.trackGeo(new THREE.BoxGeometry(1.6, 8, 1.6))
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(pillarGeo, stoneMat)
      pillar.position.set(gate.x + side * 5, 4, gate.z)
      pillar.castShadow = true
      pillar.userData.baseHeight = 8
      this.anchorStructures.push(pillar)
      this.group.add(pillar)
      this.colliders.push({
        kind: 'cylinder',
        center: new THREE.Vector3(this.position.x + gate.x + side * 5, 4, this.position.z + gate.z),
        radius: 1.1, height: 8,
      })
    }
    const lintelGeo = this.trackGeo(new THREE.BoxGeometry(12, 1.4, 2))
    const lintel = new THREE.Mesh(lintelGeo, stoneMat)
    lintel.position.set(gate.x, 8.3, gate.z)
    lintel.castShadow = true
    lintel.userData.baseHeight = 1.4
    this.anchorStructures.push(lintel)
    this.group.add(lintel)
    // Dismount pad ring on the ground so the berth reads as the Frame's spot.
    const padGeo = this.trackGeo(new THREE.RingGeometry(3.2, 4.2, 24))
    const padMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0xd6b24a, roughness: 0.7, metalness: 0.1,
      emissive: 0x4a3a00, emissiveIntensity: 0.3,
    }))
    const berth = new THREE.Mesh(padGeo, padMat)
    berth.rotation.x = -Math.PI / 2
    berth.position.set(gate.x, 0.06, gate.z)
    berth.receiveShadow = true
    this.group.add(berth)

    // --- Garage: a wide, open-fronted hangar (Rooker) ---
    this.buildAnchorBox('garage', L.garage.x, L.garage.z, 11, 6, 9, 0x7a6f63)
    // --- Warden's office: a taller, sturdier hall with a mast flag ---
    this.buildAnchorBox('warden', L.warden.x, L.warden.z, 8, 8, 8, 0x9c8f6f)

    // --- Comms post: a lattice mast topped with a dish ---
    const comms = L.comms
    const mastMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0x556070, roughness: 0.6, metalness: 0.4,
    }))
    const mastGeo = this.trackGeo(new THREE.CylinderGeometry(0.5, 0.8, 11, 6))
    const mast = new THREE.Mesh(mastGeo, mastMat)
    mast.position.set(comms.x, 5.5, comms.z)
    mast.castShadow = true
    mast.userData.baseHeight = 11
    this.anchorStructures.push(mast)
    this.group.add(mast)
    const dishGeo = this.trackGeo(new THREE.SphereGeometry(2.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2))
    const dish = new THREE.Mesh(dishGeo, mastMat)
    dish.position.set(comms.x, 11, comms.z)
    dish.rotation.set(Math.PI * 0.7, 0, 0)
    dish.castShadow = true
    this.anchorStructures.push(dish)
    this.group.add(dish)
    this.colliders.push({
      kind: 'cylinder',
      center: new THREE.Vector3(this.position.x + comms.x, 5.5, this.position.z + comms.z),
      radius: 1.2, height: 11,
    })

    // --- Commons: a low stone well the survivors gather around ---
    const commons = L.commons
    const wellMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0x8d8377, roughness: 0.95, metalness: 0.0,
    }))
    const wellGeo = this.trackGeo(new THREE.CylinderGeometry(1.8, 2.0, 1.6, 16))
    const well = new THREE.Mesh(wellGeo, wellMat)
    well.position.set(commons.x, 0.8, commons.z)
    well.castShadow = true
    well.receiveShadow = true
    well.userData.baseHeight = 1.6
    this.anchorStructures.push(well)
    this.group.add(well)
    this.colliders.push({
      kind: 'cylinder',
      center: new THREE.Vector3(this.position.x + commons.x, 0.8, this.position.z + commons.z),
      radius: 2.1, height: 1.6,
    })

    // --- NPC stations: one nameable figure per interactable anchor ---
    // Gate is the parked-Frame berth, so it carries no figure.
    this.buildNPC('rooker', 'Rooker', 'garage', L.garage.x + 4, L.garage.z + 3, 0xc06a34)
    this.buildNPC('warden', 'Warden', 'warden', L.warden.x + 3, L.warden.z + 4, 0x8a9a5b)
    this.buildNPC('comms', 'Comms Uplink', 'comms', L.comms.x - 3, L.comms.z + 1, 0x4f7fb0)
    this.buildNPC('local', 'Townsfolk', 'commons', L.commons.x + 3, L.commons.z + 2, 0xd8b48a)
  }

  /** Build a box anchor structure (garage/warden), register its collider + tint. */
  private buildAnchorBox(
    kind: AnchorKind, x: number, z: number, w: number, h: number, d: number, color: number,
  ): void {
    const mat = this.trackMat(new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05 }))
    const geo = this.trackGeo(new THREE.BoxGeometry(w, h, d))
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, h / 2, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData.baseHeight = h
    mesh.name = `anchor-${kind}`
    this.anchorStructures.push(mesh)
    this.group.add(mesh)
    this.colliders.push({
      kind: 'box',
      center: new THREE.Vector3(this.position.x + x, h / 2, this.position.z + z),
      halfExtents: new THREE.Vector3(w / 2, h / 2, d / 2),
    })
  }

  /** Stand a nameable NPC capsule at an anchor and register it for the E-prompt. */
  private buildNPC(role: NPCRole, name: string, anchor: AnchorKind, x: number, z: number, color: number): void {
    const mat = this.trackMat(new THREE.MeshStandardMaterial({
      color, roughness: 0.8, metalness: 0.0, transparent: true, opacity: 1,
    }))
    const geo = this.trackGeo(new THREE.CapsuleGeometry(0.4, 1.0, 4, 8))
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, 0.9, z)
    mesh.castShadow = true
    mesh.userData.baseY = 0.9
    mesh.name = `npc-${role}`
    this.npcMeshes.push(mesh)
    this.group.add(mesh)
    this.npcs.push({
      id: `${this.id}-${role}`,
      townId: this.id,
      name,
      role,
      anchor,
      position: new THREE.Vector3(this.position.x + x, 0.9, this.position.z + z),
    })
  }

  /**
   * Apply a condition value (0..100) to the town's visuals.
   *
   * Phase 1 implements coarse states; the thresholds match the pure helpers in
   * useStoryMode so the data model and visuals stay in sync:
   *  - Farms: green (high) → yellow/wilting (mid) → brown dirt (low); dead plots
   *    beyond the alive count are forced to dirt.
   *  - Townsfolk: hidden once the population count drops below their index.
   *  - Buildings: tint toward scorched/dark and sink slightly as they near rubble.
   */
  setCondition(condition: number): void {
    this.condition = Math.max(0, Math.min(100, condition))
    const c = this.condition

    this.applyFarms(c)
    this.applyTownsfolk(c)
    this.applyBuildings(c)
    this.applyAnchors(c)
  }

  /**
   * Anchor structures share the buildings' scorch/lean language so the pedestrian
   * hub reads pristine → battered with the rest of the town, and the surviving
   * NPC figures hunch + dim (but never vanish — they are named, not crowd).
   */
  private applyAnchors(c: number): void {
    const damage = Town.clamp01((Town.THRIVING - c) / Town.THRIVING)
    for (const s of this.anchorStructures) {
      const mat = s.material as THREE.MeshStandardMaterial
      // Tint from each structure's own base colour toward rubble-dark.
      if (!s.userData.baseColor) s.userData.baseColor = mat.color.clone()
      this._tmpColor.copy(s.userData.baseColor as THREE.Color).lerp(Town.BUILDING_RUBBLE, damage * 0.8)
      mat.color.copy(this._tmpColor)
    }
    // NPC figures: slump a touch and fade toward (but not to) gone as morale drops.
    for (const m of this.npcMeshes) {
      const mat = m.material as THREE.MeshStandardMaterial
      mat.opacity = 0.55 + 0.45 * Town.clamp01(c / 100)
      const baseY = (m.userData.baseY as number) ?? 0.9
      m.position.y = baseY - damage * 0.12
    }
  }

  /**
   * Farms: green crops while thriving → wilting (browning + shrinking tufts) in
   * the mid band → dead dirt plots culled by the alive count at the low end.
   */
  private applyFarms(c: number): void {
    const aliveFarms = farmsAliveForCondition(c, this.farms.length)
    // Wilt factor 1 (lush) → 0 (dead), gradual across the whole range.
    const wilt = Town.clamp01(c / 100)

    this.farms.forEach((farm, i) => {
      const mat = farm.material as THREE.MeshStandardMaterial
      const alive = i < aliveFarms
      // Soil: lush plots stay green-brown, dead plots are bare dirt.
      this._tmpColor.copy(Town.FARM_GREEN)
      if (c < Town.THRIVING) {
        const m = Town.clamp01((Town.THRIVING - c) / Town.THRIVING)
        this._tmpColor.lerp(Town.FARM_WILT, m)
      }
      mat.color.copy(alive ? this._tmpColor : Town.FARM_DEAD)

      // Crop tufts: shrink + brown as the plot wilts, then hide on dead plots.
      const crops = this.farmCrops[i] ?? []
      for (const crop of crops) {
        const cropMat = crop.material as THREE.MeshStandardMaterial
        if (!alive) {
          crop.visible = false
          continue
        }
        crop.visible = wilt > 0.05
        const scale = 0.3 + wilt * 0.7
        crop.scale.set(scale, scale, scale)
        const baseY = (crop.userData.baseY as number) ?? 0.8
        crop.position.y = baseY * scale
        this._tmpColor.copy(Town.CROP_DEAD).lerp(Town.CROP_GREEN, wilt)
        cropMat.color.copy(this._tmpColor)
      }
    })
  }

  /**
   * Townsfolk: full crowd while thriving → thinning crowd as condition drops →
   * gone at the bottom. The single person on the cull boundary fades out
   * smoothly (rather than popping) so the crowd thins gradually.
   */
  private applyTownsfolk(c: number): void {
    const exact = (c / 100) * this.townsfolk.length // fractional population
    const whole = Math.floor(exact)
    const frac = exact - whole

    this.townsfolk.forEach((folk, i) => {
      const mat = folk.material as THREE.MeshStandardMaterial
      if (i < whole) {
        folk.visible = true
        mat.opacity = 1
      } else if (i === whole && frac > 0.02) {
        // The fading-out individual on the boundary.
        folk.visible = true
        mat.opacity = frac
      } else {
        folk.visible = false
        mat.opacity = 0
      }
    })
  }

  /**
   * Buildings: intact → scorched/damaged (darkening + leaning + slight squash)
   * → rubble (collapsed flat, debris revealed) across THRIVING/DAMAGED/RUBBLE.
   */
  private applyBuildings(c: number): void {
    // Damage 0 (pristine) → 1 (rubble), eased across the band below THRIVING.
    const damage = Town.clamp01((Town.THRIVING - c) / Town.THRIVING)
    const collapsed = c <= Town.RUBBLE

    this.buildings.forEach((b, idx) => {
      const mat = b.material as THREE.MeshStandardMaterial
      this._tmpColor.copy(Town.BUILDING_INTACT).lerp(Town.BUILDING_RUBBLE, damage)
      mat.color.copy(this._tmpColor)

      const baseH = (b.userData.baseHeight as number) ?? 8
      if (collapsed) {
        // Fully collapsed: flatten the shell and reveal rubble debris.
        const squash = 0.12
        b.scale.set(1, squash, 1)
        b.position.y = (baseH * squash) / 2
        b.rotation.z = 0
      } else {
        // Damaged: lean and partially squash; intact at full condition.
        const squash = 1 - damage * 0.35
        b.scale.set(1, squash, 1)
        b.position.y = (baseH * squash) / 2
        b.rotation.z = damage * (idx % 2 === 0 ? 0.08 : -0.08)
      }

      const rubble = this.buildingRubble[idx] ?? []
      for (const piece of rubble) piece.visible = collapsed
    })
  }

  private static clamp01(v: number): number {
    return v < 0 ? 0 : v > 1 ? 1 : v
  }

  getCondition(): number {
    return this.condition
  }

  /** Squared XZ distance from a world position to the town centre. */
  distanceSqTo(pos: THREE.Vector3): number {
    const dx = pos.x - this.position.x
    const dz = pos.z - this.position.z
    return dx * dx + dz * dz
  }

  /** Animate the quest marker (bob + slow spin). Called from the render loop. */
  update(elapsed: number): void {
    if (this.marker) {
      this.marker.position.y = this.markerBaseY + Math.sin(elapsed * 2) * 0.5
      this.marker.rotation.y += 0.01
    }
  }

  // --- Pedestrian API (design §4.4) — all positions WORLD-space ---

  /**
   * On-foot collision volumes for the buildings and anchor structures. The
   * ENTITY cluster's OnFootPhysics resolves the human walker against exactly
   * this array. Returns the live array (do not mutate); it never changes after
   * construction, so callers may cache it.
   */
  getPedestrianColliders(): PedestrianCollider[] {
    return this.colliders
  }

  /** The five positioned anchors (gate/garage/comms/warden/commons). */
  getAnchors(): TownAnchor[] {
    return this.anchors
  }

  /** A single anchor by kind (e.g. the gate berth for mount/dismount). */
  getAnchor(kind: AnchorKind): TownAnchor | undefined {
    return this.anchors.find((a) => a.kind === kind)
  }

  /** WORLD-space gate berth position — the Frame's parked monument / mount pad. */
  getGatePosition(): THREE.Vector3 {
    const g = this.getAnchor('gate')
    return g ? g.position.clone() : this.position.clone()
  }

  /** The nameable NPC stations (Rooker, Warden, Comms console, a Commons local). */
  getNPCs(): TownNPC[] {
    return this.npcs
  }

  /**
   * Nearest NPC within `radius` (XZ) of a world position, or null. Powers the
   * on-foot E-prompt: the hub UI shows "Talk to {name}" for the returned NPC.
   */
  nearestNPC(pos: THREE.Vector3, radius: number): TownNPC | null {
    let best: TownNPC | null = null
    let bestSq = radius * radius
    for (const npc of this.npcs) {
      const dx = pos.x - npc.position.x
      const dz = pos.z - npc.position.z
      const dSq = dx * dx + dz * dz
      if (dSq <= bestSq) {
        bestSq = dSq
        best = npc
      }
    }
    return best
  }

  /** Alias of nearestNPC — the ENTITY cluster codes against this exact name. */
  getNPCAtPosition(pos: THREE.Vector3, radius: number): TownNPC | null {
    return this.nearestNPC(pos, radius)
  }

  /** Nearest anchor within `radius` (XZ) of a world position, or null. */
  nearestAnchor(pos: THREE.Vector3, radius: number): TownAnchor | null {
    let best: TownAnchor | null = null
    let bestSq = radius * radius
    for (const a of this.anchors) {
      const dx = pos.x - a.position.x
      const dz = pos.z - a.position.z
      const dSq = dx * dx + dz * dz
      if (dSq <= bestSq) {
        bestSq = dSq
        best = a
      }
    }
    return best
  }

  /** Dispose all geometries/materials owned by this town. */
  dispose(): void {
    for (const g of this.ownedGeometries) g.dispose()
    for (const m of this.ownedMaterials) m.dispose()
    this.ownedGeometries = []
    this.ownedMaterials = []
    this.buildings = []
    this.buildingRubble = []
    this.farms = []
    this.farmCrops = []
    this.townsfolk = []
    this.anchorStructures = []
    this.npcMeshes = []
    this.anchors = []
    this.npcs = []
    this.colliders = []
    this.group.clear()
  }
}
