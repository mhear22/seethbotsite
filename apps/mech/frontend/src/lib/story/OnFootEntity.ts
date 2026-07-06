import * as THREE from 'three'
import { markRaw } from 'vue'
import type { PilotableEntity } from '../battle/PilotableEntity'
import { ON_FOOT } from '../battle/constants'

/**
 * The pilot on foot (design §4.1/§4.3) — the fragile human that steps out of the
 * Frame. A small procedural figure in the same primitive style as the mechs and
 * townsfolk: a capsule torso, a head, stubby limbs, dark flight-suit materials.
 *
 * It is ~1.8u tall (ON_FOOT.HEIGHT) against the ~5-6u Frame, so the machine
 * towers — the whole point of the dismount is that the town is suddenly at your
 * scale and the survivors are taller than you expected.
 *
 * Implements PilotableEntity so CameraController and OnFootPhysics treat it
 * exactly like a MechEntity (position/rotation/velocity/mesh/update). It carries
 * NO combat state — there is no on-foot combat (design §6); vulnerability is the
 * feature. The only juice is a subtle idle/walk bob driven in update(dt).
 */
export class OnFootEntity implements PilotableEntity {
  mesh: THREE.Group
  position: THREE.Vector3
  rotation: THREE.Euler
  velocity: THREE.Vector3

  /** Advancing phase for the walk cycle; also drives limb swing. */
  private walkCycle = 0
  /** Slow, always-running phase for the idle breathing sway. */
  private idlePhase = Math.random() * Math.PI * 2

  // Owned resources for disposal (mirrors Town / MechEntity ownership discipline).
  private ownedGeometries: THREE.BufferGeometry[] = []
  private ownedMaterials: THREE.Material[] = []

  // Cached limb nodes for animation.
  private torso!: THREE.Mesh
  private legLeft!: THREE.Mesh
  private legRight!: THREE.Mesh
  private armLeft!: THREE.Mesh
  private armRight!: THREE.Mesh
  /** Resting y of the whole body group, so the bob is a delta and never drifts. */
  private baseBodyY = 0

  constructor(spawnPosition: THREE.Vector3 = new THREE.Vector3()) {
    this.position = spawnPosition.clone()
    this.rotation = new THREE.Euler(0, 0, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.mesh = markRaw(this.build())
    this.mesh.position.copy(this.position)
  }

  private track<T extends THREE.BufferGeometry>(g: T): T {
    this.ownedGeometries.push(g)
    return g
  }
  private trackMat<T extends THREE.Material>(m: T): T {
    this.ownedMaterials.push(m)
    return m
  }

  /**
   * Build the figure scaled so the top of the head sits at ON_FOOT.HEIGHT. All
   * component sizes below are expressed as fractions of that height, so retuning
   * HEIGHT rescales the whole pilot coherently.
   */
  private build(): THREE.Group {
    const group = new THREE.Group()
    group.name = 'pilot-on-foot'

    const H = ON_FOOT.HEIGHT

    // Dark flight-suit + helmet materials (matte, unlit-ish, low metalness).
    const suit = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0x2b3038, roughness: 0.85, metalness: 0.1,
    }))
    const helmet = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0x3a4250, roughness: 0.5, metalness: 0.25,
    }))
    const visor = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0x141a22, roughness: 0.2, metalness: 0.6,
      emissive: 0x1b2a3a, emissiveIntensity: 0.3,
    }))

    // Legs: two short capsules under the torso.
    const legLen = H * 0.42
    const legGeo = this.track(new THREE.CapsuleGeometry(H * 0.075, legLen, 3, 6))
    const legOffsetX = H * 0.09
    this.legLeft = new THREE.Mesh(legGeo, suit)
    this.legRight = new THREE.Mesh(legGeo, suit)
    this.legLeft.position.set(-legOffsetX, legLen * 0.5 + H * 0.075, 0)
    this.legRight.position.set(legOffsetX, legLen * 0.5 + H * 0.075, 0)
    for (const l of [this.legLeft, this.legRight]) { l.castShadow = true; group.add(l) }

    // Torso: a capsule sitting on the hips.
    const torsoLen = H * 0.34
    const torsoY = legLen + H * 0.075 + torsoLen * 0.5
    const torsoGeo = this.track(new THREE.CapsuleGeometry(H * 0.13, torsoLen, 4, 8))
    this.torso = new THREE.Mesh(torsoGeo, suit)
    this.torso.position.set(0, torsoY, 0)
    this.torso.castShadow = true
    group.add(this.torso)

    // Arms: thin capsules hanging at the sides of the torso.
    const armLen = H * 0.34
    const armGeo = this.track(new THREE.CapsuleGeometry(H * 0.05, armLen, 3, 6))
    const armOffsetX = H * 0.17
    this.armLeft = new THREE.Mesh(armGeo, suit)
    this.armRight = new THREE.Mesh(armGeo, suit)
    this.armLeft.position.set(-armOffsetX, torsoY + torsoLen * 0.1, 0)
    this.armRight.position.set(armOffsetX, torsoY + torsoLen * 0.1, 0)
    for (const a of [this.armLeft, this.armRight]) { a.castShadow = true; group.add(a) }

    // Head + helmet visor.
    const headR = H * 0.11
    const headY = torsoY + torsoLen * 0.5 + headR * 0.9
    const headGeo = this.track(new THREE.SphereGeometry(headR, 12, 10))
    const head = new THREE.Mesh(headGeo, helmet)
    head.position.set(0, headY, 0)
    head.castShadow = true
    group.add(head)

    const visorGeo = this.track(new THREE.SphereGeometry(headR * 0.86, 12, 8, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.35, Math.PI * 0.35))
    const visorMesh = new THREE.Mesh(visorGeo, visor)
    visorMesh.position.copy(head.position)
    visorMesh.position.z += headR * 0.18
    group.add(visorMesh)

    this.baseBodyY = 0
    return group
  }

  /**
   * Per-frame tick (PilotableEntity). Syncs mesh transform to position/rotation,
   * then layers the bob: a walk bounce + limb swing scaled by horizontal speed,
   * falling back to a slow idle sway when standing still. Purely cosmetic; no
   * physics or combat happens here.
   */
  update(deltaTime: number): void {
    this.mesh.position.copy(this.position)
    this.mesh.rotation.copy(this.rotation)

    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2)
    // 0 at standstill → 1 at full sprint, for blending idle sway into walk bob.
    const moveT = Math.min(1, speed / ON_FOOT.SPRINT_SPEED)

    this.idlePhase += deltaTime * ON_FOOT.BOB_IDLE_FREQUENCY
    // Walk cadence scales with speed so faster movement bobs quicker.
    this.walkCycle += deltaTime * ON_FOOT.BOB_WALK_FREQUENCY * (0.4 + moveT)

    // Vertical bob: double-frequency bounce while walking, gentle sway at idle.
    const walkBob = Math.abs(Math.sin(this.walkCycle)) * ON_FOOT.BOB_WALK_AMPLITUDE * moveT
    const idleBob = Math.sin(this.idlePhase) * ON_FOOT.BOB_IDLE_AMPLITUDE * (1 - moveT)
    this.mesh.position.y = this.position.y + this.baseBodyY + walkBob + idleBob

    // Limb swing: opposed leg/arm pendulum, amplitude scaled by speed.
    const swing = Math.sin(this.walkCycle) * 0.5 * moveT
    this.legLeft.rotation.x = swing
    this.legRight.rotation.x = -swing
    this.armLeft.rotation.x = -swing
    this.armRight.rotation.x = swing
  }

  /** Dispose owned geometry/materials (mirror MechEntity/Town teardown). */
  dispose(): void {
    for (const g of this.ownedGeometries) g.dispose()
    for (const m of this.ownedMaterials) m.dispose()
    this.ownedGeometries = []
    this.ownedMaterials = []
    this.mesh.clear()
  }
}
