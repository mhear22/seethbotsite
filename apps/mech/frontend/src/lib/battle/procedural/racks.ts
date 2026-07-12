/**
 * Procedural Rack Part Models
 * Max dimensions: ~1.0 x 1.0 x 0.5 units
 *
 * Back/shoulder-mounted heavy hardware: chunky multi-tiered armor packs with
 * a big backpack-cannon / thruster vibe. Built from the shared detailing
 * toolkit so every rack reads as layered angular armor (chamfered plates,
 * gold edge piping, red intake slats, amber sensor glow, rivet greebles)
 * rather than plain boxes.
 *
 * Local convention (matches MechModelLoader attach points):
 *  - X is left/right, the pack is symmetric about X=0.
 *  - +Z is the rear-facing front of the pack (muzzles / nozzles point +Z / down).
 *  - The bulk of armor mass sits behind the mount (biased toward -Z) so the
 *    pack reads as bolted onto the back, then hardware projects out the front.
 *  - Vertical builds (ammo feed, jump jets) rise from y~0 toward the top.
 */

import * as THREE from 'three'
import { createEnergyMaterial } from './materials'
import {
  PALETTE,
  armorMat,
  frameMat,
  accentRedMat,
  trimGoldMat,
  glowEyeMat,
  panelPlate,
  chamferBox,
  trimStripe,
  edgeLine,
  ventSlats,
  riveting,
  ventMat,
} from './detailing'
import {
  seededRand,
  jitter,
  patchPlate,
  weldSeam,
  hangingCable,
  rustStreak,
  scorchDecal,
  sootMat,
  primerMat,
  bareSteelMat,
  applyWear,
} from './weathering'

export function createSmokeLauncher(): THREE.Group {
  const group = new THREE.Group()

  // Shared materials for this part (reuse instances across meshes).
  const armor = armorMat()
  const armorTier = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const steelLight = frameMat(PALETTE.frameSteelLight)
  const ventBlack = ventMat()
  const amber = glowEyeMat(PALETTE.glowAmber)

  // --- Back-mounted housing: a wedge-shaped armor block bolted to the back.
  // Built from two stacked chamfered plates with the upper one sloped forward
  // so the silhouette tapers rather than reading as a flat slab.
  const lower = new THREE.Mesh(chamferBox(0.92, 0.26, 0.32, 0.05), armor)
  lower.position.set(0, -0.08, -0.13)
  group.add(lower)

  const upper = new THREE.Mesh(chamferBox(0.86, 0.24, 0.3, 0.05), armorTier)
  upper.position.set(0, 0.16, -0.16)
  upper.rotation.x = -0.16 // slope the crown back
  group.add(upper)

  // Raised, gold-trimmed center plate proud of the front face -> layered tier.
  const tier = panelPlate(0.6, 0.3, 0.1, {
    baseMat: armorTier,
    topMat: armor,
    inset: 0.07,
    raise: 0.04,
    trim: true,
  })
  tier.position.set(0, 0.04, 0.04)
  group.add(tier)

  // Angular end caps that wrap the sides (overlap the housing for depth).
  for (const side of [-1, 1]) {
    const cap = new THREE.Mesh(chamferBox(0.12, 0.46, 0.34, 0.04), armor)
    cap.position.set(side * 0.42, 0.02, -0.12)
    cap.rotation.z = side * -0.1 // flare outward at the top
    group.add(cap)

    // Red accent slash on each cap.
    const slash = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.34, 0.04), accentRedMat())
    slash.position.set(side * 0.46, 0.04, 0.06)
    slash.rotation.z = side * -0.1
    group.add(slash)
  }

  // --- Launcher: three angled 2-tube banks fanned like a mortar rack. Each bank
  // splays about the battery centre (outer columns rotate outward) so the tubes
  // point in a spread rather than sitting in one flat grid.
  const battery = new THREE.Group()
  const goldTrim = trimGoldMat()
  for (const col of [-1, 0, 1]) {
    const bank = new THREE.Group()
    bank.rotation.y = col * 0.35 // outer columns splay outward about the centre
    const bx = col * 0.26

    // Per-bank steel mantlet the two tubes seat in.
    const mantlet = new THREE.Mesh(chamferBox(0.24, 0.42, 0.12, 0.03), steel)
    mantlet.position.set(bx, 0, 0.16)
    bank.add(mantlet)
    // Thin gold frame around each bank face.
    const frame = trimStripe(0.2, 0.4, { thickness: 0.014, mat: goldTrim })
    frame.position.set(bx, 0, 0.23)
    bank.add(frame)

    // Two stacked tubes per bank — reuse the collar / gold ring / dark bore set,
    // kept co-axial within the bank.
    for (const y of [-0.09, 0.09]) {
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.14, 12), steel)
      collar.rotation.x = Math.PI / 2
      collar.position.set(bx, y, 0.22)
      bank.add(collar)

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.012, 8, 14), goldTrim)
      ring.position.set(bx, y, 0.29)
      bank.add(ring)

      const bore = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 12), ventBlack)
      bore.rotation.x = Math.PI / 2
      bore.position.set(bx, y, 0.24)
      bank.add(bore)
    }
    battery.add(bank)
  }
  battery.rotation.x = -0.14 // angle the whole battery up
  group.add(battery)

  // --- Detail: gold crown line, amber targeting sensor, rivet rows.
  const crown = edgeLine(0.82, { thickness: 0.018 })
  crown.position.set(0, 0.28, -0.02)
  crown.rotation.x = -0.16
  group.add(crown)

  // Taller central amber targeting sensor rising between the fanned banks, set
  // in a dark recessed housing so the glow reads as a mortar sight.
  const sensorHousing = new THREE.Mesh(chamferBox(0.12, 0.3, 0.06, 0.02), ventBlack)
  sensorHousing.position.set(0, 0.16, 0.16)
  sensorHousing.rotation.x = -0.14
  group.add(sensorHousing)
  const sensor = new THREE.Mesh(chamferBox(0.08, 0.26, 0.05, 0.02), amber)
  sensor.position.set(0, 0.16, 0.19)
  sensor.rotation.x = -0.14
  group.add(sensor)

  // Rivet rows along the lower front edge for weathered greeble.
  const rivetsTop = riveting(6, 0.15, { radius: 0.02 })
  rivetsTop.position.set(0, -0.18, 0.04)
  group.add(rivetsTop)
  const rivetsBack = riveting(4, 0.14, { radius: 0.018, mat: steelLight })
  rivetsBack.position.set(0, 0.16, -0.31)
  group.add(rivetsBack)

  return group
}

export function createAmmoFeed(): THREE.Group {
  const group = new THREE.Group()

  const armor = armorMat()
  const armorTier = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const steelLight = frameMat(PALETTE.frameSteelLight)
  const amber = glowEyeMat(PALETTE.glowAmber)

  // --- Tall layered ammo canister: a tapered tower (wider at base) made of
  // two stacked tiers so the silhouette steps inward as it rises.
  const lowerBody = new THREE.Mesh(chamferBox(0.6, 0.46, 0.36, 0.05), armor)
  lowerBody.position.set(0, 0.24, 0)
  group.add(lowerBody)

  const upperBody = panelPlate(0.5, 0.36, 0.3, {
    baseMat: armorTier,
    topMat: armor,
    inset: 0.09,
    raise: 0.05,
    trim: true,
  })
  upperBody.position.set(0, 0.62, 0.02)
  group.add(upperBody)

  // Sloped roof cap so the top isn't flat.
  const cap = new THREE.Mesh(chamferBox(0.5, 0.12, 0.3, 0.04), armorTier)
  cap.position.set(0, 0.82, -0.03)
  cap.rotation.x = 0.22
  group.add(cap)

  // Gold piping frame around the lower canister body + a single crown line.
  const piping = trimStripe(0.54, 0.4, { thickness: 0.018 })
  piping.position.set(0, 0.24, 0.19)
  group.add(piping)
  const crown = edgeLine(0.5, { thickness: 0.016 })
  crown.position.set(0, 0.8, 0.13)
  crown.rotation.x = 0.22
  group.add(crown)

  // Red intake / cooling slats stacked on the front of both tiers.
  const slatsLo = ventSlats(3, 0.42, 0.2, { depth: 0.05 })
  slatsLo.position.set(0, 0.18, 0.2)
  group.add(slatsLo)
  const slatsHi = ventSlats(3, 0.34, 0.16, { depth: 0.05 })
  slatsHi.position.set(0, 0.62, 0.2)
  group.add(slatsHi)

  // --- Angled steel feed chute exiting toward the weapon, with clamp rings.
  const chute = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.105, 0.56, 12), steel)
  chute.position.set(0.3, 0.46, 0.12)
  chute.rotation.z = Math.PI / 3.4
  group.add(chute)
  for (let i = 0; i < 2; i++) {
    const clamp = new THREE.Mesh(
      new THREE.TorusGeometry(0.092, 0.022, 8, 14),
      frameMat(PALETTE.frameSteelLight)
    )
    clamp.rotation.z = Math.PI / 3.4
    // step the clamps down the chute axis
    clamp.position.set(0.24 + i * 0.12, 0.56 - i * 0.18, 0.12)
    group.add(clamp)
  }

  // Amber ammo-count sensor strip on the front.
  const indicator = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.03), amber)
  indicator.position.set(-0.2, 0.4, 0.2)
  group.add(indicator)

  // Rivets up the canister side and along the base.
  const rivetsSide = riveting(4, 0.14, { radius: 0.02 })
  rivetsSide.rotation.z = Math.PI / 2
  rivetsSide.position.set(0.27, 0.4, 0.19)
  group.add(rivetsSide)
  const rivetsBase = riveting(4, 0.15, { radius: 0.02, mat: steelLight })
  rivetsBase.position.set(0, 0.05, 0.19)
  group.add(rivetsBase)

  return group
}

export function createJumpJets(): THREE.Group {
  const group = new THREE.Group()

  // Salvage-grade starter rack: field-patched but flown hard. All scatter
  // below is deterministic through one shared PRNG so the bake is stable.
  const rand = seededRand(505)

  const armor = armorMat()
  const armorTier = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const steelLight = frameMat(PALETTE.frameSteelLight)

  // --- Central armored thruster spine connecting the two pods.
  const spine = new THREE.Mesh(chamferBox(0.3, 0.72, 0.28, 0.05), armor)
  spine.position.set(0, 0.36, -0.06)
  jitter(spine, rand, 0.015, 0.035)
  group.add(spine)

  // Raised gold-trimmed plate on the spine face.
  const spinePlate = panelPlate(0.22, 0.6, 0.08, {
    baseMat: armorTier,
    topMat: armor,
    inset: 0.045,
    raise: 0.04,
    trim: true,
  })
  spinePlate.position.set(0, 0.38, 0.11)
  jitter(spinePlate, rand, 0.012, 0.03)
  group.add(spinePlate)

  // Amber power-core strip glowing down the spine center.
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.46, 0.03), glowEyeMat(PALETTE.glowAmber))
  core.position.set(0, 0.4, 0.17)
  group.add(core)

  // Tilted red-oxide patch plate slapped over the spine base — a replacement
  // panel from the scrapper that never got painted to match.
  const spinePatch = patchPlate(0.14, 0.12, { mat: primerMat(), d: 0.03 })
  spinePatch.position.set(0.05, 0.07, 0.095)
  spinePatch.rotation.z = 0.18
  group.add(spinePatch)

  // Rust streaks bleeding down from the spine's bolt row (gravity stains
  // under the rivet heads).
  const boltXs = [-0.08, 0, 0.08]
  for (const bx of boltXs) {
    const h = 0.09 + rand() * 0.07
    const streak = rustStreak(0.018 + rand() * 0.012, h)
    streak.position.set(bx + (rand() - 0.5) * 0.01, 0.04 - h / 2 - 0.01, 0.086)
    group.add(streak)
  }

  // A fuel/ignition line slung between the two thruster housings, its
  // conduit cover long gone.
  const spineCable = hangingCable(
    new THREE.Vector3(-0.3, 0.2, 0.22),
    new THREE.Vector3(0.3, 0.2, 0.22),
    { sag: 0.12, radius: 0.018 }
  )
  group.add(spineCable)

  // --- Twin angular thruster pods, canted outward, layered shells.
  for (const side of [-1, 1]) {
    const cant = side * 0.09
    // The left jet has flown harder than the right — asymmetric burn wear.
    const heavyBurn = side === -1

    // Outer tapered armored pod shell (wider at base).
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.64, 12), armor)
    pod.position.set(side * 0.35, 0.3, 0)
    pod.rotation.z = cant
    jitter(pod, rand, 0.015, 0.04)
    group.add(pod)

    // Mid armor band wrapping the pod (overlap layer / panel line).
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.1, 12), armorTier)
    band.position.set(side * 0.35 - Math.sin(cant) * 0.12, 0.18, 0)
    band.rotation.z = cant
    jitter(band, rand, 0.012, 0.035)
    group.add(band)

    // Gold trim ring at the band seam.
    const trimRing = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.012, 8, 16), trimGoldMat())
    trimRing.position.set(side * 0.35 - Math.sin(cant) * 0.07, 0.23, 0)
    trimRing.rotation.z = cant
    group.add(trimRing)

    // Steel mounting collar at the pod top.
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.12, 12), steel)
    collar.position.set(side * 0.35 + Math.sin(cant) * 0.3, 0.6, 0)
    collar.rotation.z = cant
    group.add(collar)

    // Right pod only: one tank strap sheared off and got patched with a
    // crude bare-steel clamp, welded shut down the front seam.
    if (side === 1) {
      const strapRadius = 0.195
      const strapX = side * 0.35 - Math.sin(cant) * 0.12
      const repairStrap = new THREE.Mesh(
        new THREE.CylinderGeometry(strapRadius, strapRadius, 0.06, 12),
        bareSteelMat()
      )
      repairStrap.position.set(strapX, 0.46, 0)
      repairStrap.rotation.z = cant
      group.add(repairStrap)

      const strapWeld = weldSeam(0.05, { radius: 0.014 })
      strapWeld.rotation.z = Math.PI / 2
      strapWeld.position.set(strapX, 0.46, strapRadius + 0.006)
      group.add(strapWeld)
    }

    // Hot amber thrust nozzle pointing down (flared cone).
    const nozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.24, 12),
      createEnergyMaterial(PALETTE.glowAmber)
    )
    nozzle.rotation.x = Math.PI
    const nozzleX = side * 0.35 - Math.sin(cant) * 0.34
    nozzle.position.set(nozzleX, -0.1, 0)
    nozzle.rotation.z = cant
    group.add(nozzle)

    // Inner steel nozzle ring (exposed mechanical).
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 8, 16), steelLight)
    ring.position.set(side * 0.35 - Math.sin(cant) * 0.28, 0.0, 0)
    ring.rotation.x = Math.PI / 2
    ring.rotation.y = cant
    group.add(ring)

    // Soot collar scorched into the nozzle lip where it meets the housing.
    const sootCollar = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.02, 8, 16), sootMat())
    sootCollar.position.set(nozzleX, 0.01, 0)
    sootCollar.rotation.x = Math.PI / 2
    sootCollar.rotation.y = cant
    group.add(sootCollar)

    // Charred tip where the exhaust point pokes out below the housing.
    const tipChar = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), sootMat())
    tipChar.position.set(nozzleX, -0.21, 0)
    group.add(tipChar)

    // Scorch decals fanning out across the housing directly around/below
    // the exhaust — every jet has flown, the left one harder.
    const scorchCount = heavyBurn ? 4 : 2
    for (let i = 0; i < scorchCount; i++) {
      const decal = scorchDecal(0.13 + rand() * 0.08)
      decal.position.set(
        side * 0.35 - Math.sin(cant) * 0.1 + (rand() - 0.5) * 0.16,
        -0.01 + rand() * 0.15,
        0.225
      )
      decal.rotation.z = cant + (rand() - 0.5) * 0.4
      group.add(decal)
    }

    // Red intake slats on the outer face of each pod.
    const slats = ventSlats(3, 0.22, 0.26, { depth: 0.04 })
    slats.position.set(side * 0.4, 0.36, 0.18)
    slats.rotation.z = cant
    group.add(slats)
  }

  // Gold trim line across the top crown of the pack.
  const crown = edgeLine(0.72, { thickness: 0.018 })
  crown.position.set(0, 0.66, 0.06)
  group.add(crown)

  // Rivets along the spine base.
  const rivets = riveting(3, 0.08, { radius: 0.018, mat: steelLight })
  rivets.position.set(0, 0.04, 0.1)
  group.add(rivets)

  applyWear(group)
  return group
}

export function createRepairDrone(): THREE.Group {
  const group = new THREE.Group()

  const armor = armorMat()
  const armorTier = armorMat(PALETTE.armorMid)
  const steel = frameMat()
  const steelLight = frameMat(PALETTE.frameSteelLight)

  // --- Layered drone-bay housing with a slightly sloped opening lip.
  const bay = panelPlate(0.7, 0.34, 0.4, {
    baseMat: armor,
    topMat: armorTier,
    inset: 0.08,
    raise: 0.04,
    trim: true,
  })
  bay.position.set(0, 0.16, 0)
  group.add(bay)

  // Angled bay-door lip overhanging the opening (overlap + slope).
  const lip = new THREE.Mesh(chamferBox(0.7, 0.1, 0.16, 0.03), armorTier)
  lip.position.set(0, 0.36, 0.16)
  lip.rotation.x = -0.3
  group.add(lip)

  // Gold piping along the bay opening + a crown line on the lip.
  const piping = trimStripe(0.62, 0.28, { thickness: 0.016 })
  piping.position.set(0, 0.16, 0.21)
  group.add(piping)
  const crown = edgeLine(0.66, { thickness: 0.016 })
  crown.position.set(0, 0.4, 0.21)
  crown.rotation.x = -0.3
  group.add(crown)

  // Red status vent slats on the bay face.
  const slats = ventSlats(3, 0.16, 0.18, { depth: 0.04 })
  slats.position.set(-0.2, 0.16, 0.21)
  group.add(slats)

  // Side end caps flanking the bay for a chunkier silhouette.
  for (const side of [-1, 1]) {
    const sideCap = new THREE.Mesh(chamferBox(0.1, 0.36, 0.42, 0.03), armor)
    sideCap.position.set(side * 0.36, 0.16, 0)
    sideCap.rotation.z = side * -0.08
    group.add(sideCap)
  }

  // --- The drone itself, nested in the bay as a small tapered chassis.
  const drone = new THREE.Mesh(chamferBox(0.3, 0.16, 0.3, 0.04), armorTier)
  drone.position.set(0, 0.42, 0.02)
  group.add(drone)

  // Drone gold trim accent.
  const droneTrim = trimStripe(0.28, 0.14, { thickness: 0.014 })
  droneTrim.position.set(0, 0.42, 0.18)
  group.add(droneTrim)

  // Steel articulated repair arms folded over the drone (two segments each).
  for (const side of [-1, 1]) {
    const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.26, 0.05), steel)
    upperArm.position.set(side * 0.22, 0.4, 0.16)
    upperArm.rotation.x = Math.PI / 4
    group.add(upperArm)

    const foreArm = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.16, 0.045), steelLight)
    foreArm.position.set(side * 0.22, 0.52, 0.05)
    foreArm.rotation.x = Math.PI / 2.4
    group.add(foreArm)

    // Bright steel pivot joint at the arm base.
    const joint = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 10), steelLight)
    joint.rotation.z = Math.PI / 2
    joint.position.set(side * 0.22, 0.46, 0.08)
    group.add(joint)
  }

  // Amber sensor eye on the drone.
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), glowEyeMat(PALETTE.glowAmber))
  sensor.position.set(0, 0.42, 0.19)
  group.add(sensor)

  // Rivets along the bay base.
  const rivets = riveting(4, 0.16, { radius: 0.02 })
  rivets.position.set(0, 0.02, 0.21)
  group.add(rivets)

  return group
}
