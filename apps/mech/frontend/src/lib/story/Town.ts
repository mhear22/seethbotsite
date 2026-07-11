import * as THREE from 'three'
import type { TownState } from '../../composables/useStoryMode'
import { TOWN_DECAY_RADIUS, farmsAliveForCondition, populationForCondition } from '../../composables/useStoryMode'

// ============================================================================
// Shared geometry/material assets. Every town is built from the same shapes, so
// tessellate each one once at module scope instead of per Town instance (5 towns
// re-building ~30 identical geometries each was pure duplicate GPU-buffer churn,
// and identical materials defeat the renderer's draw-state batching). These are
// intentionally NOT tracked in any town's ownedMaterials: they live for the app
// session and must never be disposed by Town.dispose().
// Materials are only shared when setCondition never writes to them — anything
// condition-tinted stays per-town (per-mesh where needed) so towns can diverge.
// ============================================================================

/** Box geometries keyed by dimensions (buildings, rubble, pillars, anchors). */
const SHARED_BOX_GEOS = new Map<string, THREE.BoxGeometry>()
function sharedBoxGeo(w: number, h: number, d: number): THREE.BoxGeometry {
  const key = `${w}x${h}x${d}`
  let geo = SHARED_BOX_GEOS.get(key)
  if (!geo) {
    geo = new THREE.BoxGeometry(w, h, d)
    SHARED_BOX_GEOS.set(key, geo)
  }
  return geo
}

const SHARED = {
  padGeo: new THREE.CircleGeometry(34, 40),
  padMat: new THREE.MeshStandardMaterial({ color: 0x6b5d4f, roughness: 0.95, metalness: 0.0 }),
  /** Base building material; cloned per building (setCondition tints per mesh). */
  buildingBaseMat: new THREE.MeshStandardMaterial({ color: 0xb08968, roughness: 0.85, metalness: 0.05 }),
  /** Rubble is never tinted (colour matches Town.BUILDING_RUBBLE). */
  rubbleMat: new THREE.MeshStandardMaterial({ color: 0x4a3f37, roughness: 1.0, metalness: 0.0 }),
  farmGeo: new THREE.PlaneGeometry(12, 9),
  cropGeo: new THREE.ConeGeometry(0.35, 1.4, 5),
  /** Townsfolk and NPC figures share one capsule. */
  capsuleGeo: new THREE.CapsuleGeometry(0.4, 1.0, 4, 8),
  markerGeo: new THREE.ConeGeometry(1.2, 3, 6),
  markerMat: new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    emissive: 0xffb300,
    emissiveIntensity: 0.8,
    roughness: 0.4,
    metalness: 0.2,
  }),
  berthGeo: new THREE.RingGeometry(3.2, 4.2, 24),
  berthMat: new THREE.MeshStandardMaterial({
    color: 0xd6b24a, roughness: 0.7, metalness: 0.1,
    emissive: 0x4a3a00, emissiveIntensity: 0.3,
  }),
  mastGeo: new THREE.CylinderGeometry(0.5, 0.8, 11, 6),
  dishGeo: new THREE.SphereGeometry(2.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  wellGeo: new THREE.CylinderGeometry(1.8, 2.0, 1.6, 16),

  // ===== Rich-prefab additions (all module-shared across the 5 towns) =====

  // --- Dwellings & halls: roofs, doors, windows, chimneys, garage bay, flag ---
  doorGeo: new THREE.BoxGeometry(1.6, 2.4, 0.14),
  doorMat: new THREE.MeshStandardMaterial({ color: 0x2b1c12, roughness: 0.85, metalness: 0.05 }),
  windowGeo: new THREE.BoxGeometry(0.85, 0.85, 0.1),
  windowMat: new THREE.MeshStandardMaterial({
    color: 0x362b20, emissive: 0xffcf7a, emissiveIntensity: 0.55, roughness: 0.6, metalness: 0.0,
  }),
  roofMatWarm: new THREE.MeshStandardMaterial({ color: 0x6b3a2a, roughness: 0.85, metalness: 0.05 }),
  roofMatSlate: new THREE.MeshStandardMaterial({ color: 0x4d4a48, roughness: 0.8, metalness: 0.05 }),
  chimneyCapGeo: new THREE.BoxGeometry(1.15, 0.22, 1.15),
  chimneyMat: new THREE.MeshStandardMaterial({ color: 0x5a4a3f, roughness: 0.9, metalness: 0.03 }),
  beamMat: new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.9, metalness: 0.02 }),
  workbenchMat: new THREE.MeshStandardMaterial({ color: 0x6b4f3a, roughness: 0.9, metalness: 0.02 }),
  plinthMat: new THREE.MeshStandardMaterial({ color: 0x8d8377, roughness: 0.9, metalness: 0.05 }),
  flagGeo: new THREE.PlaneGeometry(1.3, 0.85),
  flagMat: new THREE.MeshStandardMaterial({
    color: 0x8a2f2f, roughness: 0.8, metalness: 0.0, side: THREE.DoubleSide,
  }),
  flagPoleGeo: new THREE.CylinderGeometry(0.05, 0.07, 3.2, 6),
  flagPoleMat: new THREE.MeshStandardMaterial({ color: 0x746b5e, roughness: 0.6, metalness: 0.3 }),

  // --- Civic landmarks: gate arch, comms mast/dish, well, quest marker ---
  archKeystoneGeo: new THREE.ConeGeometry(1.0, 1.3, 4),
  lampHeadGeo: new THREE.OctahedronGeometry(0.35, 0),
  bannerGeo: new THREE.PlaneGeometry(1.6, 3.2),
  berthOuterGeo: new THREE.RingGeometry(4.4, 4.9, 24),
  latticeRingGeo: new THREE.TorusGeometry(0.95, 0.07, 6, 12),
  guyWireGeo: new THREE.CylinderGeometry(0.035, 0.035, 1, 4),
  yokeAxleGeo: new THREE.CylinderGeometry(0.12, 0.12, 2.6, 8),
  dishRimGeo: new THREE.TorusGeometry(2.2, 0.08, 6, 16),
  commsLightGeo: new THREE.SphereGeometry(0.22, 8, 6),
  wellRimGeo: new THREE.TorusGeometry(1.85, 0.15, 8, 16),
  wellRoofGeo: new THREE.ConeGeometry(2.0, 1.2, 4),
  wellAxleGeo: new THREE.CylinderGeometry(0.09, 0.09, 3.2, 8),
  wellRopeGeo: new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6),
  bucketGeo: new THREE.CylinderGeometry(0.35, 0.28, 0.5, 10),
  markerCoreGeo: new THREE.IcosahedronGeometry(0.55, 0),
  markerRing1Geo: new THREE.TorusGeometry(1.5, 0.09, 6, 20),
  markerRing2Geo: new THREE.TorusGeometry(2.0, 0.07, 6, 20),
  // Tall light-shaft beacon: an open-ended tube rising from the town centre so a
  // colored beam is visible over the 72u mountains from across the map (towns are
  // 330-468u away). Geometry is module-shared (session-lived, like every other
  // SHARED geo); only the additive material is per-town so each beam gets its own
  // tint and disposes with its town. Open-ended = no end caps (pure side glow).
  beaconGeo: new THREE.CylinderGeometry(1.8, 1.8, 110, 12, 1, true),
  lampMat: new THREE.MeshStandardMaterial({
    color: 0xffd54f, emissive: 0xffb300, emissiveIntensity: 1.1, roughness: 0.4, metalness: 0.1,
  }),
  bannerMat: new THREE.MeshStandardMaterial({
    color: 0x8a3b2f, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide,
  }),
  guyWireMat: new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.7, metalness: 0.3 }),
  commsLightMat: new THREE.MeshStandardMaterial({
    color: 0xffb300, emissive: 0xffb300, emissiveIntensity: 0.2, roughness: 0.3, metalness: 0.1,
  }),
  markerCoreMat: new THREE.MeshStandardMaterial({
    color: 0xffe9b0, emissive: 0xffc94d, emissiveIntensity: 1.2, roughness: 0.3, metalness: 0.1,
  }),
  markerRingMat: new THREE.MeshStandardMaterial({
    color: 0xffb300, emissive: 0xffb300, emissiveIntensity: 0.85, roughness: 0.4, metalness: 0.2,
  }),

  // --- Folk & farms: person kit, comms console, farm dressing ---
  personBodyGeo: new THREE.CapsuleGeometry(0.3, 0.7, 4, 8),
  personHeadGeo: new THREE.SphereGeometry(0.23, 8, 6),
  personHatGeo: new THREE.ConeGeometry(0.27, 0.34, 6),
  personHairGeo: new THREE.SphereGeometry(0.25, 6, 5, 0, Math.PI * 2, 0, Math.PI / 2),
  consoleBaseGeo: new THREE.BoxGeometry(1.1, 1.2, 0.7),
  consoleScreenGeo: new THREE.BoxGeometry(0.9, 0.6, 0.08),
  consoleAntennaGeo: new THREE.CylinderGeometry(0.03, 0.03, 1.0, 5),
  consoleBaseMat: new THREE.MeshStandardMaterial({
    color: 0x3d4552, roughness: 0.5, metalness: 0.6, transparent: true, opacity: 1,
  }),
  consoleScreenMat: new THREE.MeshStandardMaterial({
    color: 0x5fd0ff, roughness: 0.3, metalness: 0.1,
    emissive: 0x1c6f8c, emissiveIntensity: 0.6, transparent: true, opacity: 1,
  }),
  consoleAntennaMat: new THREE.MeshStandardMaterial({
    color: 0x2b2f36, roughness: 0.6, metalness: 0.5, transparent: true, opacity: 1,
  }),
  cropBushGeo: new THREE.SphereGeometry(0.4, 6, 5),
  cropRowGeo: new THREE.BoxGeometry(0.5, 0.3, 0.9),
  furrowGeo: new THREE.BoxGeometry(11, 0.1, 0.5),
  furrowMat: new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 1.0, metalness: 0.0 }),
  fencePostGeo: new THREE.CylinderGeometry(0.07, 0.09, 0.9, 5),
  fenceMat: new THREE.MeshStandardMaterial({ color: 0x6b5236, roughness: 0.9, metalness: 0.0 }),
  scarecrowPoleGeo: new THREE.CylinderGeometry(0.06, 0.06, 2.2, 5),
  scarecrowArmGeo: new THREE.BoxGeometry(1.3, 0.08, 0.08),
  scarecrowHeadGeo: new THREE.SphereGeometry(0.22, 6, 5),
  scarecrowHatGeo: new THREE.ConeGeometry(0.32, 0.3, 6),
  scarecrowMat: new THREE.MeshStandardMaterial({ color: 0x8a6a3f, roughness: 1.0, metalness: 0.0 }),
  scarecrowClothMat: new THREE.MeshStandardMaterial({ color: 0x6b4a3a, roughness: 0.95, metalness: 0.0 }),
}

// ============================================================================
// Rich dwelling builders. Each wraps the original tintable SHELL mesh in a
// THREE.Group and hangs purely-decorative geometry off the shell (not the
// group) as children, in shell-local space. Parenting to the shell means
// setCondition's squash/lean/position writes on the shell (applyBuildings)
// carry the roof/door/windows/chimney along for free — they collapse into the
// rubble with the shell with zero extra condition-system code. Decorative
// materials are the SHARED.* ones (never tinted); only the shell's own cloned
// material is ever written to. Roof panels are plain Box panels tilted via
// rotation.x (exact for non-square footprints, unlike a rotated-cone hip roof).
// ============================================================================

/** Attach a low-poly gable (ridge) roof to a building shell as two child panels. */
function addGableRoof(
  shell: THREE.Mesh, w: number, d: number, h: number, mat: THREE.MeshStandardMaterial,
): { rise: number } {
  const rise = Math.max(1.4, Math.min(3.2, h * 0.32))
  const overhangD = (d / 2) * 1.15
  const ridgeLen = w * 1.05
  const pitch = Math.atan2(rise, overhangD)
  const panelLen = Math.hypot(overhangD, rise)
  const panelGeo = sharedBoxGeo(ridgeLen, 0.2, panelLen)
  for (const side of [-1, 1] as const) {
    const panel = new THREE.Mesh(panelGeo, mat)
    panel.rotation.x = side * pitch
    panel.position.set(0, h / 2 + rise / 2, side * (overhangD / 2))
    panel.castShadow = true
    panel.receiveShadow = true
    shell.add(panel)
  }
  return { rise }
}

/** A recessed door + two flanking lit windows on the shell's local +Z face. */
function addDoorAndWindows(shell: THREE.Mesh, w: number, h: number, d: number): void {
  const door = new THREE.Mesh(SHARED.doorGeo, SHARED.doorMat)
  door.position.set(0, -h / 2 + 1.2, d / 2 + 0.08)
  shell.add(door)

  const winY = -h / 2 + h * 0.62
  for (const side of [-1, 1]) {
    const win = new THREE.Mesh(SHARED.windowGeo, SHARED.windowMat)
    win.position.set(side * w * 0.27, winY, d / 2 + 0.06)
    shell.add(win)
  }
}

/** A chimney stack + cowl cap, poked through the roof slope near the ridge. */
function addChimney(shell: THREE.Mesh, w: number, h: number, rise: number): void {
  const stackH = 2.0
  const stackGeo = sharedBoxGeo(0.75, stackH, 0.75)
  const stackCenterY = h / 2 + rise + 0.7
  const stack = new THREE.Mesh(stackGeo, SHARED.chimneyMat)
  stack.position.set(w * 0.28, stackCenterY, 0)
  stack.castShadow = true
  shell.add(stack)

  const cap = new THREE.Mesh(SHARED.chimneyCapGeo, SHARED.chimneyMat)
  cap.position.set(w * 0.28, stackCenterY + stackH / 2 + 0.11, 0)
  shell.add(cap)
}

/** Residential building: gable roof, door, 2 windows, chimney. */
function buildRichBuilding(
  w: number, h: number, d: number, x: number, z: number, shellMat: THREE.MeshStandardMaterial,
): THREE.Group {
  const shell = new THREE.Mesh(sharedBoxGeo(w, h, d), shellMat)
  shell.position.set(x, h / 2, z)
  shell.castShadow = true
  shell.receiveShadow = true
  shell.userData.baseHeight = h

  const { rise } = addGableRoof(shell, w, d, h, SHARED.roofMatWarm)
  addDoorAndWindows(shell, w, h, d)
  addChimney(shell, w, h, rise)

  const group = new THREE.Group()
  group.add(shell)
  group.userData.shell = shell
  return group
}

/** Warden's office: stone plinth, slate gable roof, door, 2 windows, flag. */
function makeRichWarden(
  w: number, h: number, d: number, x: number, z: number, shellMat: THREE.MeshStandardMaterial,
): THREE.Group {
  const shell = new THREE.Mesh(sharedBoxGeo(w, h, d), shellMat)
  shell.position.set(x, h / 2, z)
  shell.castShadow = true
  shell.receiveShadow = true
  shell.userData.baseHeight = h
  shell.name = 'anchor-warden'

  const plinth = new THREE.Mesh(sharedBoxGeo(w + 1.6, 0.6, d + 1.6), SHARED.plinthMat)
  plinth.position.set(0, -h / 2 + 0.3, 0)
  plinth.castShadow = true
  plinth.receiveShadow = true
  shell.add(plinth)

  const { rise } = addGableRoof(shell, w, d, h, SHARED.roofMatSlate)
  addDoorAndWindows(shell, w, h, d)

  const pole = new THREE.Mesh(SHARED.flagPoleGeo, SHARED.flagPoleMat)
  pole.position.set(0, h / 2 + rise + 1.6, 0)
  pole.castShadow = true
  shell.add(pole)

  const flag = new THREE.Mesh(SHARED.flagGeo, SHARED.flagMat)
  flag.rotation.y = Math.PI / 2
  flag.position.set(0.65, h / 2 + rise + 2.85, 0)
  shell.add(flag)

  const group = new THREE.Group()
  group.add(shell)
  group.userData.shell = shell
  return group
}

/** Garage: enclosed workshop (gable roof + side window) plus an open lean-to bay. */
function makeRichGarage(
  w: number, h: number, d: number, x: number, z: number, shellMat: THREE.MeshStandardMaterial,
): THREE.Group {
  const shell = new THREE.Mesh(sharedBoxGeo(w, h, d), shellMat)
  shell.position.set(x, h / 2, z)
  shell.castShadow = true
  shell.receiveShadow = true
  shell.userData.baseHeight = h
  shell.name = 'anchor-garage'

  addGableRoof(shell, w, d, h, SHARED.roofMatWarm)

  const win = new THREE.Mesh(SHARED.windowGeo, SHARED.windowMat)
  win.rotation.y = Math.PI / 2
  win.position.set(w / 2 + 0.06, -h / 2 + h * 0.6, -d * 0.15)
  shell.add(win)

  // Open bay: asymmetric lean-to canopy on two posts, past the front (+Z) wall.
  const bayWidth = w * 0.7
  const bayDepth = d * 0.5
  const postH = h * 0.55
  const eaveY = -h / 2 + postH
  const attachY = h / 2 - 0.6
  const drop = attachY - eaveY
  const angle = Math.atan2(drop, bayDepth)
  const slantLen = Math.hypot(bayDepth, drop)

  const canopy = new THREE.Mesh(sharedBoxGeo(bayWidth, 0.22, slantLen), SHARED.roofMatWarm)
  canopy.rotation.x = angle
  canopy.position.set(0, (attachY + eaveY) / 2, d / 2 + bayDepth / 2)
  canopy.castShadow = true
  canopy.receiveShadow = true
  shell.add(canopy)

  const postGeo = sharedBoxGeo(0.4, postH, 0.4)
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(postGeo, SHARED.beamMat)
    post.position.set(side * (bayWidth / 2), -h / 2 + postH / 2, d / 2 + bayDepth * 0.92)
    post.castShadow = true
    shell.add(post)
  }

  const bench = new THREE.Mesh(sharedBoxGeo(2.2, 0.9, 0.8), SHARED.workbenchMat)
  bench.position.set(bayWidth * 0.22, -h / 2 + 0.45, d / 2 + bayDepth * 0.55)
  bench.castShadow = true
  shell.add(bench)

  const group = new THREE.Group()
  group.add(shell)
  group.userData.shell = shell
  return group
}

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
  /** Small props (crops, folk, rubble, NPCs, berth, well) culled by distance. */
  private readonly detail: THREE.Group
  private detailVisible = true

  private condition: number = 100
  /**
   * Last condition applied to the visuals, quantized to whole points (NaN until
   * the first apply). setCondition runs every frame while the player is inside
   * a town (tickTownDecay), but the visuals only move fractions of a point per
   * second — sub-point re-applies of ~100 material writes are skipped.
   */
  private lastAppliedCondition = Number.NaN

  // Sub-parts kept for condition-driven updates.
  private buildings: THREE.Mesh[] = []
  /** Rubble debris parented to each building (revealed as it collapses). */
  private buildingRubble: THREE.Mesh[][] = []
  private farms: THREE.Mesh[] = []
  /** Crop tufts per farm plot (wilt/cull with condition). */
  private farmCrops: THREE.Mesh[][] = []
  /** Townsfolk figures — each a small Group (body+head+accessory), faded/culled as a unit. */
  private townsfolk: THREE.Group[] = []
  private marker!: THREE.Group
  private markerBaseY: number = 0
  /** Tall additive light-shaft rising from the town centre (long-range beacon). */
  private beacon!: THREE.Mesh
  /** Counter-rotating halo rings on the quest marker (animated in updateAnimated). */
  private markerRings!: THREE.Mesh[]
  /** Comms dish+yoke pivot (slow azimuth spin), the dish, and the blinking feed light. */
  private dishPivot!: THREE.Group
  private dish!: THREE.Mesh
  private commsLight!: THREE.Mesh

  // --- Pedestrian pass (design §4.4) ---
  /** Anchor structure meshes kept for condition-reactive tinting. */
  private anchorStructures: THREE.Mesh[] = []
  /** World-space anchors (gate/garage/comms/warden/commons). */
  private anchors: TownAnchor[] = []
  /** Nameable NPC stations (one per meaningful anchor). */
  private npcs: TownNPC[] = []
  /** NPC figure groups, index-aligned with `npcs`, for condition-reactive slump/fade. */
  private npcMeshes: THREE.Group[] = []
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

  // Materials owned by this town (disposed on teardown). Geometries are all
  // module-shared (SHARED/sharedBoxGeo) and never town-owned.
  private ownedMaterials: THREE.Material[] = []

  private static readonly CROWD_SIZE = 8

  /**
   * Beyond this XZ distance the `detail` sub-group is hidden: a crop tuft or
   * townsfolk capsule is only a few pixels tall out here but still costs a
   * main-pass and a shadow-pass draw call each (~40 meshes per town). The
   * town's silhouette (buildings, gate, mast) and the quest-marker beacon stay
   * visible at any range so navigation is unaffected and nothing pops in view.
   */
  private static readonly DETAIL_CULL_RADIUS_SQ = (TOWN_DECAY_RADIUS * 4) ** 2

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

    // Small props live in a sub-group so distant towns can drop them from both
    // the main and shadow passes (see updateDetailVisibility) without hiding
    // the town silhouette or the quest marker.
    this.detail = new THREE.Group()
    this.detail.name = `town-${state.id}-detail`
    this.group.add(this.detail)

    this.build()
    this.setCondition(state.condition ?? 100)
  }

  private trackMat<T extends THREE.Material>(m: T): T {
    this.ownedMaterials.push(m)
    return m
  }

  private build(): void {
    // --- Ground pad so the town reads as a distinct region ---
    const pad = new THREE.Mesh(SHARED.padGeo, SHARED.padMat)
    pad.rotation.x = -Math.PI / 2
    pad.position.y = 0.02
    pad.receiveShadow = true
    this.group.add(pad)

    // --- Buildings (a couple) ---
    const buildingDefs: Array<{ w: number; h: number; d: number; x: number; z: number }> = [
      { w: 8, h: 9, d: 8, x: -8, z: -6 },
      { w: 10, h: 6, d: 7, x: 9, z: -4 },
    ]
    for (const b of buildingDefs) {
      // Per-building material clone: setCondition tints each shell individually.
      // The shell is wrapped in a rich Group (gable roof, door, lit windows,
      // chimney) whose decoration rides the shell's transform — so the existing
      // scorch/lean/collapse in applyBuildings still drives the whole dwelling.
      const mat = this.trackMat(SHARED.buildingBaseMat.clone())
      const richGroup = buildRichBuilding(b.w, b.h, b.d, b.x, b.z, mat)
      const mesh = richGroup.userData.shell as THREE.Mesh
      this.buildings.push(mesh)
      this.group.add(richGroup)

      // Pedestrian AABB collider (world-space) so on-foot walkers can't clip it.
      this.colliders.push({
        kind: 'box',
        center: new THREE.Vector3(this.position.x + b.x, b.h / 2, this.position.z + b.z),
        halfExtents: new THREE.Vector3(b.w / 2, b.h / 2, b.d / 2),
      })

      // Rubble debris around the footprint, hidden until the building collapses.
      const rubblePieces: THREE.Mesh[] = []
      for (let r = 0; r < 5; r++) {
        const s = 1.2 + (r % 3) * 0.7
        const rub = new THREE.Mesh(sharedBoxGeo(s, s * 0.6, s), SHARED.rubbleMat)
        const ra = (r / 5) * Math.PI * 2
        const rr = b.w * 0.32
        rub.position.set(b.x + Math.cos(ra) * rr, (s * 0.6) / 2, b.z + Math.sin(ra) * rr)
        rub.rotation.set(Math.random() * 0.4, ra, Math.random() * 0.4)
        rub.castShadow = true
        rub.receiveShadow = true
        rub.visible = false
        rubblePieces.push(rub)
        this.detail.add(rub)
      }
      this.buildingRubble.push(rubblePieces)
    }

    // --- Farms (2 plots) ---
    const farmDefs: Array<{ x: number; z: number }> = [
      { x: -14, z: 12 },
      { x: 14, z: 13 },
    ]

    // Static perimeter posts + furrow ridges for BOTH plots share one
    // InstancedMesh each per town — they never change with condition, so a single
    // draw call covers all of them (not ~20 separate meshes).
    const postsPerPlot = 10
    const fencePosts = new THREE.InstancedMesh(SHARED.fencePostGeo, SHARED.fenceMat, postsPerPlot * farmDefs.length)
    fencePosts.castShadow = true
    let postIx = 0
    const furrowRows = 6
    const furrows = new THREE.InstancedMesh(SHARED.furrowGeo, SHARED.furrowMat, furrowRows * farmDefs.length)
    furrows.receiveShadow = true
    let furrowIx = 0
    const m4 = new THREE.Matrix4()

    for (const f of farmDefs) {
      // Per-plot material: applyFarms colours alive/dead plots differently.
      const mat = this.trackMat(new THREE.MeshStandardMaterial({
        color: 0x4caf50,
        roughness: 1.0,
        metalness: 0.0,
      }))
      const farm = new THREE.Mesh(SHARED.farmGeo, mat)
      farm.rotation.x = -Math.PI / 2
      farm.position.set(f.x, 0.05, f.z)
      farm.receiveShadow = true
      this.farms.push(farm)
      this.group.add(farm)

      // Furrow rows across the plot (static dirt ridges, not condition-tinted).
      for (let r = 0; r < furrowRows; r++) {
        const rz = f.z + (r - (furrowRows - 1) / 2) * 1.4
        m4.makeTranslation(f.x, 0.1, rz)
        furrows.setMatrixAt(furrowIx++, m4)
      }

      // Perimeter fence posts (static decoration just outside the plot).
      const hw = 6.4, hd = 4.8
      const postPts: Array<[number, number]> = [
        [-hw, -hd], [0, -hd], [hw, -hd],
        [-hw, 0], [hw, 0],
        [-hw, hd], [0, hd], [hw, hd],
        [-hw * 0.5, -hd], [hw * 0.5, hd],
      ]
      for (const [px, pz] of postPts) {
        m4.makeTranslation(f.x + px, 0.45, f.z + pz)
        fencePosts.setMatrixAt(postIx++, m4)
      }

      // Scarecrow: one per plot, never wilted.
      const scarecrow = this.buildScarecrow()
      scarecrow.position.set(f.x + (Math.random() - 0.5) * 2, 0, f.z + (Math.random() - 0.5) * 1.5)
      scarecrow.rotation.y = Math.random() * Math.PI * 2
      this.detail.add(scarecrow)

      // Crop tufts — mixed shapes for variety; they wilt (shrink + brown) then
      // vanish as the plot dies. Each crop has its own tintable material so a
      // couple can carry a warm hue on top of the shared wilt curve applyFarms
      // drives every frame (via userData.tint).
      const crops: THREE.Mesh[] = []
      let cropI = 0
      for (let cx = -1; cx <= 1; cx++) {
        for (let cz = -1; cz <= 1; cz++) {
          const kind = cropI % 3
          const geo = kind === 0 ? SHARED.cropGeo : kind === 1 ? SHARED.cropBushGeo : SHARED.cropRowGeo
          const baseY = kind === 0 ? 0.8 : kind === 1 ? 0.45 : 0.2
          const cropMat = this.trackMat(new THREE.MeshStandardMaterial({
            color: Town.CROP_GREEN, roughness: 0.9, metalness: 0.0,
          }))
          const crop = new THREE.Mesh(geo, cropMat)
          crop.position.set(
            f.x + cx * 3.2 + (Math.random() - 0.5) * 0.6,
            baseY,
            f.z + cz * 2.4 + (Math.random() - 0.5) * 0.6,
          )
          crop.rotation.y = Math.random() * Math.PI * 2
          crop.castShadow = true
          crop.userData.baseY = baseY
          crop.userData.tint = new THREE.Color(
            1 + (Math.random() - 0.5) * 0.3,
            1 + (Math.random() - 0.5) * 0.15,
            1 + (Math.random() - 0.5) * 0.2,
          )
          crops.push(crop)
          this.detail.add(crop)
          cropI++
        }
      }
      this.farmCrops.push(crops)
    }
    furrows.instanceMatrix.needsUpdate = true
    fencePosts.instanceMatrix.needsUpdate = true
    this.detail.add(furrows)
    this.detail.add(fencePosts)

    // --- Townsfolk (small crowd of low-poly figures) ---
    const CLOTH_COLORS = [0x8a6f4e, 0x5b7065, 0x6d5a7a, 0x9c6b4a, 0x4f6a80, 0x7a6a4f]
    const SKIN_COLORS = [0xe8c39e, 0xd8b48a, 0xc99a72]
    for (let i = 0; i < Town.CROWD_SIZE; i++) {
      const hasAccessory = Math.random() < 0.6
      const folk = this.buildPerson({
        skinColor: SKIN_COLORS[i % SKIN_COLORS.length],
        clothColor: CLOTH_COLORS[i % CLOTH_COLORS.length],
        accessory: hasAccessory ? (Math.random() < 0.5 ? 'hat' : 'hair') : 'none',
        accessoryColor: 0x2e2620,
        scale: 0.92 + Math.random() * 0.16,
      })
      const angle = (i / Town.CROWD_SIZE) * Math.PI * 2
      const r = 5 + (i % 3) * 1.5
      folk.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r)
      folk.rotation.y = Math.random() * Math.PI * 2
      folk.userData.baseY = 0
      this.townsfolk.push(folk)
      this.detail.add(folk)
    }

    // --- Quest-giver marker (floating beacon: spike + glowing core + halos) ---
    this.buildRichMarker()

    // --- Long-range light-shaft beacon (visible over hills from across the map) ---
    this.buildBeacon()

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

    // --- Gate: monumental berth arch (buttressed pillars, keystone, lamps, banners) ---
    this.buildRichGate(L.gate.x, L.gate.z)
    // --- Garage: open-fronted hangar with a lean-to bay + workbench (Rooker) ---
    this.buildRichGarage(11, 6, 9, L.garage.x, L.garage.z)
    // --- Warden's office: sturdier hall with a stone plinth + flag ---
    this.buildRichWarden(8, 8, 8, L.warden.x, L.warden.z)
    // --- Comms post: braced lattice mast, guy-wires, rotating dish, blinking light ---
    this.buildRichComms(L.comms.x, L.comms.z)
    // --- Commons: roofed stone well with a crank + hanging bucket ---
    this.buildRichWell(L.commons.x, L.commons.z)

    // --- NPC stations: one nameable figure per interactable anchor ---
    // Gate is the parked-Frame berth, so it carries no figure.
    this.buildNPC('rooker', 'Rooker', 'garage', L.garage.x + 4, L.garage.z + 3, 0xc06a34)
    this.buildNPC('warden', 'Warden', 'warden', L.warden.x + 3, L.warden.z + 4, 0x8a9a5b)
    this.buildNPC('comms', 'Comms Uplink', 'comms', L.comms.x - 3, L.comms.z + 1, 0x4f7fb0)
    this.buildNPC('local', 'Townsfolk', 'commons', L.commons.x + 3, L.commons.z + 2, 0xd8b48a)
  }

  /** Garage: rich open-fronted hangar. Wires the shell into the tint/collider system. */
  private buildRichGarage(w: number, h: number, d: number, x: number, z: number): void {
    const mat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x7a6f63, roughness: 0.85, metalness: 0.05 }))
    const richGroup = makeRichGarage(w, h, d, x, z, mat)
    this.anchorStructures.push(richGroup.userData.shell as THREE.Mesh)
    this.group.add(richGroup)
    this.colliders.push({
      kind: 'box',
      center: new THREE.Vector3(this.position.x + x, h / 2, this.position.z + z),
      halfExtents: new THREE.Vector3(w / 2, h / 2, d / 2),
    })
  }

  /** Warden's office: rich sturdier hall (stone plinth + flag). */
  private buildRichWarden(w: number, h: number, d: number, x: number, z: number): void {
    const mat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x9c8f6f, roughness: 0.85, metalness: 0.05 }))
    const richGroup = makeRichWarden(w, h, d, x, z, mat)
    this.anchorStructures.push(richGroup.userData.shell as THREE.Mesh)
    this.group.add(richGroup)
    this.colliders.push({
      kind: 'box',
      center: new THREE.Vector3(this.position.x + x, h / 2, this.position.z + z),
      halfExtents: new THREE.Vector3(w / 2, h / 2, d / 2),
    })
  }

  /**
   * Gate: a monumental berth arch over the Frame dismount pad — buttressed
   * pillars, a keystone lintel, hanging lamps, weathered banners, and a
   * two-ring stone berth. The clear passage between the pillars (|x-offset| = 5)
   * and the lintel underside are unchanged, so the parked Frame still fits.
   */
  private buildRichGate(x: number, z: number): void {
    const stoneMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0x8d8377, roughness: 0.9, metalness: 0.05,
    }))
    const pillarGeo = sharedBoxGeo(1.6, 8, 1.6)
    const buttressGeo = sharedBoxGeo(0.9, 4.2, 1.3)

    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(pillarGeo, stoneMat)
      pillar.position.set(x + side * 5, 4, z)
      pillar.castShadow = true
      pillar.userData.baseHeight = 8
      this.anchorStructures.push(pillar)
      this.group.add(pillar)
      this.colliders.push({
        kind: 'cylinder',
        center: new THREE.Vector3(this.position.x + x + side * 5, 4, this.position.z + z),
        radius: 1.1, height: 8,
      })

      const buttress = new THREE.Mesh(buttressGeo, stoneMat)
      buttress.position.set(x + side * (5 + 0.9), 2.1, z)
      buttress.rotation.z = side * -0.18
      buttress.castShadow = true
      this.anchorStructures.push(buttress)
      this.group.add(buttress)
      this.colliders.push({
        kind: 'box',
        center: new THREE.Vector3(this.position.x + x + side * (5 + 0.9), 2.1, this.position.z + z),
        halfExtents: new THREE.Vector3(0.45, 2.1, 0.65),
      })

      const lampHead = new THREE.Mesh(SHARED.lampHeadGeo, SHARED.lampMat)
      lampHead.position.set(x + side * (5 - 0.75), 6.4, z + 0.85)
      this.group.add(lampHead)

      const banner = new THREE.Mesh(SHARED.bannerGeo, SHARED.bannerMat)
      banner.position.set(x + side * (5 - 0.85), 5.5, z)
      banner.rotation.y = Math.PI / 2
      this.group.add(banner)
    }

    const lintel = new THREE.Mesh(sharedBoxGeo(12, 1.4, 2), stoneMat)
    lintel.position.set(x, 8.3, z)
    lintel.castShadow = true
    lintel.userData.baseHeight = 1.4
    this.anchorStructures.push(lintel)
    this.group.add(lintel)

    const keystone = new THREE.Mesh(SHARED.archKeystoneGeo, stoneMat)
    keystone.position.set(x, 7.75, z + 1.1)
    keystone.rotation.x = Math.PI
    keystone.rotation.y = Math.PI / 4
    keystone.castShadow = true
    this.anchorStructures.push(keystone)
    this.group.add(keystone)

    const berth = new THREE.Mesh(SHARED.berthGeo, SHARED.berthMat)
    berth.rotation.x = -Math.PI / 2
    berth.position.set(x, 0.06, z)
    berth.receiveShadow = true
    this.detail.add(berth)
    const berthOuter = new THREE.Mesh(SHARED.berthOuterGeo, SHARED.padMat)
    berthOuter.rotation.x = -Math.PI / 2
    berthOuter.position.set(x, 0.05, z)
    berthOuter.receiveShadow = true
    this.detail.add(berthOuter)
  }

  /**
   * Comms post: a braced lattice mast with three guy-wires, a dish + yoke on a
   * rotating pivot, and a small blinking antenna light (see updateAnimated).
   */
  private buildRichComms(x: number, z: number): void {
    const mastMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0x556070, roughness: 0.6, metalness: 0.4,
    }))

    const mast = new THREE.Mesh(SHARED.mastGeo, mastMat)
    mast.position.set(x, 5.5, z)
    mast.castShadow = true
    mast.userData.baseHeight = 11
    this.anchorStructures.push(mast)
    this.group.add(mast)
    this.colliders.push({
      kind: 'cylinder',
      center: new THREE.Vector3(this.position.x + x, 5.5, this.position.z + z),
      radius: 1.2, height: 11,
    })

    for (const hy of [2.75, 5.5, 8.25]) {
      const ring = new THREE.Mesh(SHARED.latticeRingGeo, mastMat)
      ring.rotation.x = Math.PI / 2
      ring.position.set(x, hy, z)
      ring.castShadow = true
      this.anchorStructures.push(ring)
      this.group.add(ring)
    }

    const topPoint = new THREE.Vector3(x, 9.5, z)
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2
      const ground = new THREE.Vector3(x + Math.cos(a) * 3.2, 0, z + Math.sin(a) * 3.2)
      const dir = new THREE.Vector3().subVectors(ground, topPoint)
      const len = dir.length()
      const wire = new THREE.Mesh(SHARED.guyWireGeo, SHARED.guyWireMat)
      wire.position.copy(topPoint).add(dir.clone().multiplyScalar(0.5))
      wire.scale.y = len
      wire.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
      this.group.add(wire)
    }

    const dishPivot = new THREE.Group()
    dishPivot.position.set(x, 11, z)
    this.group.add(dishPivot)
    this.dishPivot = dishPivot

    const axle = new THREE.Mesh(SHARED.yokeAxleGeo, mastMat)
    axle.rotation.z = Math.PI / 2
    dishPivot.add(axle)
    this.anchorStructures.push(axle)

    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(sharedBoxGeo(0.18, 1.0, 0.18), mastMat)
      arm.position.set(side * 1.1, -0.5, 0)
      dishPivot.add(arm)
      this.anchorStructures.push(arm)
    }

    const dish = new THREE.Mesh(SHARED.dishGeo, mastMat)
    dish.rotation.set(Math.PI * 0.7, 0, 0)
    dish.castShadow = true
    dishPivot.add(dish)
    this.anchorStructures.push(dish)
    this.dish = dish

    const dishRim = new THREE.Mesh(SHARED.dishRimGeo, mastMat)
    dishRim.rotation.set(Math.PI * 0.7, 0, 0)
    dishPivot.add(dishRim)
    this.anchorStructures.push(dishRim)

    const commsLight = new THREE.Mesh(SHARED.commsLightGeo, SHARED.commsLightMat)
    commsLight.position.set(0, 0.4, 0)
    dishPivot.add(commsLight)
    this.commsLight = commsLight
  }

  /**
   * Commons well: the stone drum plus a rim cap, two posts holding a pitched
   * roof, a crank axle, and a rope-hung bucket dangling into the mouth.
   */
  private buildRichWell(x: number, z: number): void {
    const wellMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0x8d8377, roughness: 0.95, metalness: 0.0,
    }))

    const well = new THREE.Mesh(SHARED.wellGeo, wellMat)
    well.position.set(x, 0.8, z)
    well.castShadow = true
    well.receiveShadow = true
    well.userData.baseHeight = 1.6
    this.anchorStructures.push(well)
    this.detail.add(well)
    this.colliders.push({
      kind: 'cylinder',
      center: new THREE.Vector3(this.position.x + x, 0.8, this.position.z + z),
      radius: 2.1, height: 1.6,
    })

    const rim = new THREE.Mesh(SHARED.wellRimGeo, wellMat)
    rim.rotation.x = Math.PI / 2
    rim.position.set(x, 1.6, z)
    rim.castShadow = true
    this.anchorStructures.push(rim)
    this.detail.add(rim)

    const postGeo = sharedBoxGeo(0.25, 2.3, 0.25)
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(postGeo, wellMat)
      post.position.set(x + side * 1.6, 2.75, z)
      post.castShadow = true
      this.anchorStructures.push(post)
      this.detail.add(post)
      this.colliders.push({
        kind: 'cylinder',
        center: new THREE.Vector3(this.position.x + x + side * 1.6, 2.75, this.position.z + z),
        radius: 0.2, height: 2.3,
      })
    }

    const roof = new THREE.Mesh(SHARED.wellRoofGeo, wellMat)
    roof.rotation.y = Math.PI / 4
    roof.position.set(x, 4.5, z)
    roof.castShadow = true
    this.anchorStructures.push(roof)
    this.detail.add(roof)

    const axle = new THREE.Mesh(SHARED.wellAxleGeo, wellMat)
    axle.rotation.z = Math.PI / 2
    axle.position.set(x, 3.7, z)
    this.anchorStructures.push(axle)
    this.detail.add(axle)

    const crank = new THREE.Mesh(sharedBoxGeo(0.5, 0.12, 0.12), wellMat)
    crank.position.set(x + 1.6, 3.7, z + 0.25)
    crank.rotation.y = Math.PI / 5
    this.anchorStructures.push(crank)
    this.detail.add(crank)

    const rope = new THREE.Mesh(SHARED.wellRopeGeo, SHARED.guyWireMat)
    rope.position.set(x, 2.7, z)
    this.detail.add(rope)

    const bucketMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: 0x5b4636, roughness: 0.8, metalness: 0.2,
    }))
    const bucket = new THREE.Mesh(SHARED.bucketGeo, bucketMat)
    bucket.position.set(x, 1.45, z)
    bucket.castShadow = true
    this.anchorStructures.push(bucket)
    this.detail.add(bucket)
  }

  /**
   * Quest-giver marker: a downward spike, a glowing core, and two
   * counter-rotating halo rings for long-range readability. `marker` is a Group
   * so the existing bob/spin in update() works unchanged.
   */
  private buildRichMarker(): void {
    const marker = new THREE.Group()
    this.markerBaseY = 6
    marker.position.set(0, this.markerBaseY, 0)
    marker.name = 'quest-marker'

    const spike = new THREE.Mesh(SHARED.markerGeo, SHARED.markerMat)
    spike.rotation.x = Math.PI // point down
    marker.add(spike)

    const core = new THREE.Mesh(SHARED.markerCoreGeo, SHARED.markerCoreMat)
    core.position.y = 0.9
    marker.add(core)

    const ring1 = new THREE.Mesh(SHARED.markerRing1Geo, SHARED.markerRingMat)
    ring1.rotation.x = Math.PI / 2.4
    marker.add(ring1)

    const ring2 = new THREE.Mesh(SHARED.markerRing2Geo, SHARED.markerRingMat)
    ring2.rotation.x = -Math.PI / 3.2
    marker.add(ring2)

    this.markerRings = [ring1, ring2]
    this.marker = marker
    this.group.add(marker)
  }

  /**
   * A deterministic per-town beam tint, derived from the town id so each town's
   * light-shaft is distinguishable at range and reloads reproduce the same hue.
   * Falls back to the marker's warm amber if the id is empty.
   */
  private beaconColor(): THREE.Color {
    if (!this.id) return new THREE.Color(0xffb300)
    let h = 0
    for (let i = 0; i < this.id.length; i++) h = (Math.imul(h, 31) + this.id.charCodeAt(i)) >>> 0
    return new THREE.Color().setHSL((h % 360) / 360, 0.7, 0.55)
  }

  /**
   * Tall vertical light-shaft rising from the town centre. The quest marker
   * (markerBaseY=6, r1.2 cone) is a pinprick behind the 72u mountains from 300u+
   * out; this beam pokes well above them so towns stay findable across the map.
   *
   * Purely visual — NO collider is registered (mechs/walkers pass straight
   * through, preserving the collision feel). Parented to `this.group` (not the
   * bobbing marker group) and frustumCulled=false so it never pops out when the
   * town centre leaves the frustum. Additive blending + depthWrite=false + a
   * strong per-town emissive tint keep it reading as a glowing beam through fog.
   */
  private buildBeacon(): void {
    const mat = this.trackMat(new THREE.MeshBasicMaterial({
      color: this.beaconColor(),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide, // open-ended tube: light the inside faces too
      fog: true,
    }))
    const beacon = new THREE.Mesh(SHARED.beaconGeo, mat)
    // Geometry is 110u tall centred on its origin; lift so the base sits at the
    // pad and the beam rises straight up out of the town centre.
    beacon.position.set(0, 55, 0)
    beacon.castShadow = false
    beacon.receiveShadow = false
    beacon.frustumCulled = false
    beacon.renderOrder = 2 // draw after opaque terrain/props in the transparent pass
    beacon.name = 'town-beacon'
    this.beacon = beacon
    this.group.add(beacon)
  }

  /**
   * Build one low-poly figure (crowd member or named NPC) from the shared person
   * kit: torso capsule + head sphere, plus an optional hat/hair accessory. A
   * Group so the whole figure fades/hides as a unit (applyTownsfolk/applyAnchors
   * traverse it). Every material is a fresh transparent clone, tracked for teardown.
   */
  private buildPerson(opts: {
    skinColor: number
    clothColor: number
    accessory?: 'hat' | 'hair' | 'none'
    accessoryColor?: number
    scale?: number
  }): THREE.Group {
    const group = new THREE.Group()

    const bodyMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: opts.clothColor, roughness: 0.85, metalness: 0.0, transparent: true, opacity: 1,
    }))
    const body = new THREE.Mesh(SHARED.personBodyGeo, bodyMat)
    body.position.y = 0.695 // capsule half-height so feet sit at y=0
    body.castShadow = true
    group.add(body)

    const headMat = this.trackMat(new THREE.MeshStandardMaterial({
      color: opts.skinColor, roughness: 0.7, metalness: 0.0, transparent: true, opacity: 1,
    }))
    const head = new THREE.Mesh(SHARED.personHeadGeo, headMat)
    head.position.y = 1.47
    head.castShadow = true
    group.add(head)

    const accessory = opts.accessory ?? 'none'
    if (accessory !== 'none') {
      const accMat = this.trackMat(new THREE.MeshStandardMaterial({
        color: opts.accessoryColor ?? opts.clothColor, roughness: 0.9, metalness: 0.0, transparent: true, opacity: 1,
      }))
      const accGeo = accessory === 'hat' ? SHARED.personHatGeo : SHARED.personHairGeo
      const acc = new THREE.Mesh(accGeo, accMat)
      acc.position.y = accessory === 'hat' ? 1.82 : 1.68
      acc.castShadow = true
      group.add(acc)
    }

    group.scale.setScalar(opts.scale ?? 1)
    return group
  }

  /** Comms Uplink is a console, not a person: a small terminal prop (cabinet + screen + antenna). */
  private buildConsole(): THREE.Group {
    const group = new THREE.Group()

    const base = new THREE.Mesh(SHARED.consoleBaseGeo, this.trackMat(SHARED.consoleBaseMat.clone()))
    base.position.y = 0.6
    base.castShadow = true
    base.receiveShadow = true
    group.add(base)

    const screen = new THREE.Mesh(SHARED.consoleScreenGeo, this.trackMat(SHARED.consoleScreenMat.clone()))
    screen.position.set(0, 0.85, 0.36)
    group.add(screen)

    const antenna = new THREE.Mesh(SHARED.consoleAntennaGeo, this.trackMat(SHARED.consoleAntennaMat.clone()))
    antenna.position.y = 1.7
    antenna.castShadow = true
    group.add(antenna)

    return group
  }

  /** Static scarecrow decoration (never wilted by applyFarms). */
  private buildScarecrow(): THREE.Group {
    const group = new THREE.Group()
    const pole = new THREE.Mesh(SHARED.scarecrowPoleGeo, SHARED.scarecrowMat)
    pole.position.y = 1.1
    pole.castShadow = true
    group.add(pole)

    const arms = new THREE.Mesh(SHARED.scarecrowArmGeo, SHARED.scarecrowClothMat)
    arms.position.y = 1.7
    arms.castShadow = true
    group.add(arms)

    const head = new THREE.Mesh(SHARED.scarecrowHeadGeo, SHARED.scarecrowMat)
    head.position.y = 2.15
    head.castShadow = true
    group.add(head)

    const hat = new THREE.Mesh(SHARED.scarecrowHatGeo, SHARED.scarecrowClothMat)
    hat.position.y = 2.42
    hat.castShadow = true
    group.add(hat)

    return group
  }

  /** Stand a nameable NPC figure (or the comms console) at an anchor and register it. */
  private buildNPC(role: NPCRole, name: string, anchor: AnchorKind, x: number, z: number, color: number): void {
    const figure = role === 'comms'
      ? this.buildConsole() // the comms anchor is a terminal prop, not a person
      : this.buildPerson({
          skinColor: 0xe8c39e,
          clothColor: color,
          accessory: Math.random() < 0.5 ? 'hat' : 'hair', // named NPCs always dressed
          accessoryColor: 0x3a3226,
          scale: 1.05,
        })
    figure.position.set(x, 0, z)
    figure.userData.baseY = 0
    figure.name = `npc-${role}`
    this.npcMeshes.push(figure)
    this.detail.add(figure)
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
   * Per-frame animation for the rich landmark props (comms dish rotation +
   * blink, marker halo spin + core breathe). Called from update(); a pure
   * function of `elapsed` so it stays deterministic.
   */
  private updateAnimated(elapsed: number): void {
    this.dishPivot.rotation.y = elapsed * 0.12
    // SHARED.commsLightMat / markerCoreMat are module-shared: all 5 towns write
    // the same value in sync — redundant but harmless.
    SHARED.commsLightMat.emissiveIntensity = Math.sin(elapsed * 3.1) > 0.4 ? 1.6 : 0.12
    this.markerRings[0].rotation.y = elapsed * 0.6
    this.markerRings[1].rotation.y = elapsed * -0.4
    SHARED.markerCoreMat.emissiveIntensity = 1.0 + Math.sin(elapsed * 1.5) * 0.35
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

    // Decay ticks call this every frame with a fractionally-changed value; the
    // lerps below are imperceptible at sub-point granularity, so skip the full
    // re-apply until the whole-point value moves. (NaN sentinel means the first
    // call — including the constructor's — always applies.)
    const quantized = Math.round(this.condition)
    if (quantized === this.lastAppliedCondition) return
    this.lastAppliedCondition = quantized

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
    // NPC figures/console: slump a touch and fade toward (but not to) gone as
    // morale drops. Each is a Group now, so walk its child meshes for opacity.
    const npcOpacity = 0.55 + 0.45 * Town.clamp01(c / 100)
    for (const m of this.npcMeshes) {
      m.traverse((child) => {
        const mesh = child as THREE.Mesh
        if ((mesh as unknown as { isMesh?: boolean }).isMesh) {
          (mesh.material as THREE.MeshStandardMaterial).opacity = npcOpacity
        }
      })
      const baseY = (m.userData.baseY as number) ?? 0
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
        // Per-crop hue jitter on top of the shared wilt curve (see userData.tint).
        if (crop.userData.tint) this._tmpColor.multiply(crop.userData.tint as THREE.Color)
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
      let visible: boolean, opacity: number
      if (i < whole) {
        visible = true
        opacity = 1
      } else if (i === whole && frac > 0.02) {
        // The fading-out individual on the boundary.
        visible = true
        opacity = frac
      } else {
        visible = false
        opacity = 0
      }
      // folk is a Group now — toggle the group and set each child mesh's opacity.
      folk.visible = visible
      folk.traverse((child) => {
        const mesh = child as THREE.Mesh
        if ((mesh as unknown as { isMesh?: boolean }).isMesh) {
          (mesh.material as THREE.MeshStandardMaterial).opacity = opacity
        }
      })
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

  /**
   * Squared XZ distance from a world position to the town centre.
   *
   * StoryWorld calls this every frame with the active body's position, so it
   * doubles as the distance-cull hook for the small-prop `detail` group (the
   * explicit alternative is passing playerPos to update()). The side effect is
   * a cached-boolean compare — effectively free.
   */
  distanceSqTo(pos: THREE.Vector3): number {
    const dx = pos.x - this.position.x
    const dz = pos.z - this.position.z
    const dSq = dx * dx + dz * dz
    this.updateDetailVisibility(dSq)
    return dSq
  }

  /** Hide/show the small-prop group when the cull threshold is crossed. */
  private updateDetailVisibility(dSq: number): void {
    const visible = dSq < Town.DETAIL_CULL_RADIUS_SQ
    if (visible !== this.detailVisible) {
      this.detailVisible = visible
      this.detail.visible = visible
    }
  }

  /**
   * Animate the quest marker (bob + slow spin). Called from the render loop.
   * Pass `playerPos` to also drive the small-prop distance cull from here
   * (otherwise the per-frame distanceSqTo() call covers it).
   */
  update(elapsed: number, playerPos?: THREE.Vector3): void {
    if (playerPos) this.distanceSqTo(playerPos) // applies the detail cull
    if (this.marker) {
      this.marker.position.y = this.markerBaseY + Math.sin(elapsed * 2) * 0.5
      this.marker.rotation.y += 0.01
    }
    this.updateAnimated(elapsed)
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

  /**
   * Dispose all materials owned by this town. Geometries/materials in the
   * module-scope SHARED/SHARED_BOX_GEOS pool are deliberately left alive — they
   * are used by every town for the whole app session.
   */
  dispose(): void {
    for (const m of this.ownedMaterials) m.dispose()
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
    this.detail.clear()
    this.group.clear()
  }
}
