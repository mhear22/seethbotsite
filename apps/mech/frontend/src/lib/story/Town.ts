import * as THREE from 'three'
import type { TownState } from '../../composables/useStoryMode'
import { farmsAliveForCondition, populationForCondition } from '../../composables/useStoryMode'

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
    this.group.clear()
  }
}
