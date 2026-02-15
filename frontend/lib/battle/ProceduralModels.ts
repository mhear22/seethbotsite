/**
 * Procedural Model Generator for Mech Parts
 *
 * Generates Three.js geometry for mech parts following the specifications
 * in /models/README.md. This is used as a fallback when GLB models aren't available,
 * and also serves as a reference for model dimensions and attachment points.
 *
 * Model Requirements:
 * - 1 unit = 1 meter
 * - Origin at attachment point
 * - Parts fit within bounding boxes defined in README
 */

import * as THREE from 'three'
import type { PartType } from '../../shared/types/MechTypes'

/**
 * Material presets for different manufacturers
 */
const MATERIALS = {
  // ArmsCore - Military industrial look
  armsCore: new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    metalness: 0.7,
    roughness: 0.4,
  }),

  // VoltTech - High-tech energy company
  voltTech: new THREE.MeshStandardMaterial({
    color: 0x3366cc,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x1144aa,
    emissiveIntensity: 0.3,
  }),

  // TitanForge - Heavy industrial
  titanForge: new THREE.MeshStandardMaterial({
    color: 0x5a4a3a,
    metalness: 0.6,
    roughness: 0.6,
  }),

  // InfernoTech - Fire/heat themed
  infernoTech: new THREE.MeshStandardMaterial({
    color: 0x8b2500,
    metalness: 0.5,
    roughness: 0.3,
    emissive: 0xff4400,
    emissiveIntensity: 0.4,
  }),

  // PowerGen - Standard power systems
  powerGen: new THREE.MeshStandardMaterial({
    color: 0x556b2f,
    metalness: 0.5,
    roughness: 0.5,
  }),

  // SwiftDrive - Fast, lightweight
  swiftDrive: new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.9,
    roughness: 0.1,
  }),

  // GenMech - General purpose
  genMech: new THREE.MeshStandardMaterial({
    color: 0x696969,
    metalness: 0.5,
    roughness: 0.5,
  }),

  // ArmorWorks - Heavy armor specialist
  armorWorks: new THREE.MeshStandardMaterial({
    color: 0x2f4f4f,
    metalness: 0.7,
    roughness: 0.4,
  }),

  // TacticalSys - Tactical equipment
  tacticalSys: new THREE.MeshStandardMaterial({
    color: 0x556b2f,
    metalness: 0.4,
    roughness: 0.6,
  }),
}

/**
 * Energy glow material for weapon effects
 */
const createEnergyMaterial = (color: number): THREE.MeshStandardMaterial => {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.2,
    roughness: 0.1,
    emissive: color,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
  })
}

/**
 * ARM WEAPONS
 * Max dimensions: 1.0 x 2.5 x 1.0 units
 */

export function createAutocannon(): THREE.Group {
  const group = new THREE.Group()

  // Shoulder mount joint
  const mountGeom = new THREE.CylinderGeometry(0.25, 0.28, 0.35, 12)
  const mount = new THREE.Mesh(mountGeom, MATERIALS.armsCore)
  mount.rotation.z = Math.PI / 2
  mount.position.set(0, 0, -0.15)
  group.add(mount)

  // Main housing body
  const housingGeom = new THREE.BoxGeometry(0.65, 0.65, 0.85)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.armsCore)
  housing.position.set(0, 0, 0.15)
  group.add(housing)

  // Rotary barrels housing
  const rotaryGeom = new THREE.CylinderGeometry(0.22, 0.28, 0.4, 12)
  const rotary = new THREE.Mesh(rotaryGeom, MATERIALS.armsCore)
  rotary.rotation.x = Math.PI / 2
  rotary.position.set(0, 0, 0.6)
  group.add(rotary)

  // Rotary barrels (6 barrels in circle)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const barrelGeom = new THREE.CylinderGeometry(0.045, 0.045, 1.9, 8)
    const barrel = new THREE.Mesh(barrelGeom, new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.9,
      roughness: 0.2,
    }))
    barrel.rotation.x = Math.PI / 2
    barrel.position.set(
      Math.cos(angle) * 0.13,
      Math.sin(angle) * 0.13,
      1.5
    )
    group.add(barrel)

    // Barrel tips
    const tipGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 8)
    const tip = new THREE.Mesh(tipGeom, new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.9,
    }))
    tip.rotation.x = Math.PI / 2
    tip.position.set(
      Math.cos(angle) * 0.13,
      Math.sin(angle) * 0.13,
      2.49
    )
    group.add(tip)
  }

  // Central barrel support
  const supportGeom = new THREE.CylinderGeometry(0.08, 0.1, 1.8, 8)
  const support = new THREE.Mesh(supportGeom, MATERIALS.armsCore)
  support.rotation.x = Math.PI / 2
  support.position.set(0, 0, 1.4)
  group.add(support)

  // Ammo feed chute (top)
  const feedGeom = new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8)
  const feed = new THREE.Mesh(feedGeom, new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.7,
  }))
  feed.position.set(0.2, 0.35, 0.1)
  feed.rotation.z = -0.5
  group.add(feed)

  // Side detail panels
  for (let side of [-1, 1]) {
    const panelGeom = new THREE.BoxGeometry(0.08, 0.55, 0.7)
    const panel = new THREE.Mesh(panelGeom, new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.6,
    }))
    panel.position.set(side * 0.36, 0, 0.15)
    group.add(panel)
  }

  // Attachment point marker (invisible, for reference)
  const attachment = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, transparent: true, opacity: 0.3 })
  )
  attachment.position.set(0, 0, 0)
  group.add(attachment)

  return group
}

export function createRailgun(): THREE.Group {
  const group = new THREE.Group()

  // Shoulder mount joint
  const mountGeom = new THREE.CylinderGeometry(0.28, 0.3, 0.35, 12)
  const mount = new THREE.Mesh(mountGeom, MATERIALS.voltTech)
  mount.rotation.z = Math.PI / 2
  mount.position.set(0, 0, -0.2)
  group.add(mount)

  // Main capacitor housing
  const housingGeom = new THREE.BoxGeometry(0.85, 0.7, 0.7)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.voltTech)
  housing.position.set(0, 0, 0.15)
  group.add(housing)

  // Central power core (glowing)
  const coreGeom = new THREE.SphereGeometry(0.2, 12, 12)
  const core = new THREE.Mesh(coreGeom, createEnergyMaterial(0x00ffff))
  core.position.set(0, 0, 0.15)
  group.add(core)

  // Top capacitor bank
  const capGeom = new THREE.BoxGeometry(0.7, 0.2, 0.5)
  const cap = new THREE.Mesh(capGeom, MATERIALS.voltTech)
  cap.position.set(0, 0.45, 0.15)
  group.add(cap)

  // Main rails (dual parallel rails)
  for (let side of [-1, 1]) {
    const railGeom = new THREE.BoxGeometry(0.12, 0.12, 2.2)
    const railMat = MATERIALS.voltTech.clone()
    const rail = new THREE.Mesh(railGeom, railMat)
    rail.position.set(side * 0.18, 0, 1.4)
    group.add(rail)

    // Rail detail strips
    const stripGeom = new THREE.BoxGeometry(0.04, 0.14, 2.0)
    const strip = new THREE.Mesh(stripGeom, new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.9,
    }))
    strip.position.set(side * 0.18, 0, 1.35)
    group.add(strip)
  }

  // Power coils along rails
  for (let i = 0; i < 7; i++) {
    const coilGeom = new THREE.TorusGeometry(0.28, 0.035, 8, 12)
    const coil = new THREE.Mesh(coilGeom, createEnergyMaterial(0x00aaff))
    coil.position.set(0, 0, i * 0.32 + 0.4)
    group.add(coil)
  }

  // Barrel frame (top and bottom)
  for (let pos of [0.15, -0.15]) {
    const frameGeom = new THREE.BoxGeometry(0.08, 0.08, 2.0)
    const frame = new THREE.Mesh(frameGeom, MATERIALS.voltTech)
    frame.position.set(0, pos, 1.35)
    group.add(frame)
  }

  // Muzzle brake
  const muzzleGeom = new THREE.BoxGeometry(0.5, 0.4, 0.15)
  const muzzle = new THREE.Mesh(muzzleGeom, MATERIALS.voltTech)
  muzzle.position.set(0, 0, 2.55)
  group.add(muzzle)

  // Side vents
  for (let side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const ventGeom = new THREE.BoxGeometry(0.1, 0.15, 0.05)
      const vent = new THREE.Mesh(ventGeom, new THREE.MeshStandardMaterial({
        color: 0x222222,
      }))
      vent.position.set(side * 0.45, 0.2 - i * 0.15, 0.15)
      group.add(vent)
    }
  }

  // Energy conduit cables
  for (let side of [-1, 1]) {
    const cableGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6)
    const cable = new THREE.Mesh(cableGeom, new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.6,
    }))
    cable.position.set(side * 0.35, 0.3, -0.05)
    cable.rotation.z = side * 0.4
    group.add(cable)
  }

  return group
}

export function createPileDriver(): THREE.Group {
  const group = new THREE.Group()

  // Main spike
  const spikeGeom = new THREE.ConeGeometry(0.15, 1.5, 8)
  const spike = new THREE.Mesh(spikeGeom, MATERIALS.titanForge)
  spike.rotation.x = -Math.PI / 2
  spike.position.set(0, 0, 1.5)
  group.add(spike)

  // Hydraulic cylinder
  const cylinderGeom = new THREE.CylinderGeometry(0.2, 0.25, 1.2, 12)
  const cylinder = new THREE.Mesh(cylinderGeom, MATERIALS.titanForge)
  cylinder.rotation.x = Math.PI / 2
  cylinder.position.set(0, 0, 0.6)
  group.add(cylinder)

  // Hydraulic lines
  for (let i = 0; i < 3; i++) {
    const line = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    )
    line.position.set(
      Math.cos(i * Math.PI * 2 / 3) * 0.35,
      Math.sin(i * Math.PI * 2 / 3) * 0.35,
      0.2
    )
    group.add(line)
  }

  // Heavy housing
  const housingGeom = new THREE.BoxGeometry(0.9, 0.9, 0.6)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.titanForge)
  housing.position.set(0, 0, -0.3)
  group.add(housing)

  return group
}

export function createMissilePod(): THREE.Group {
  const group = new THREE.Group()

  // 6 missile tubes in 2x3 arrangement
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const tubeGeom = new THREE.CylinderGeometry(0.12, 0.12, 1.5, 8)
      const tube = new THREE.Mesh(tubeGeom, MATERIALS.armsCore)
      tube.rotation.x = Math.PI / 2
      tube.position.set(
        (col - 1) * 0.3,
        (row - 0.5) * 0.3,
        0.75
      )
      group.add(tube)

      // Missile inside (visible)
      const missileGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.3, 6)
      const missile = new THREE.Mesh(missileGeom, new THREE.MeshStandardMaterial({
        color: 0xcc3333,
        metalness: 0.6,
        roughness: 0.4,
      }))
      missile.rotation.x = Math.PI / 2
      missile.position.set(
        (col - 1) * 0.3,
        (row - 0.5) * 0.3,
        0.85
      )
      group.add(missile)
    }
  }

  // Housing
  const housingGeom = new THREE.BoxGeometry(1.0, 0.8, 0.5)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.armsCore)
  housing.position.set(0, 0, -0.25)
  group.add(housing)

  return group
}

export function createFlamethrower(): THREE.Group {
  const group = new THREE.Group()

  // Main barrel
  const barrelGeom = new THREE.CylinderGeometry(0.15, 0.2, 1.8, 8)
  const barrel = new THREE.Mesh(barrelGeom, MATERIALS.infernoTech)
  barrel.rotation.x = Math.PI / 2
  barrel.position.set(0, 0, 0.9)
  group.add(barrel)

  // Flame nozzle
  const nozzleGeom = new THREE.ConeGeometry(0.25, 0.4, 8)
  const nozzle = new THREE.Mesh(nozzleGeom, createEnergyMaterial(0xff4400))
  nozzle.rotation.x = Math.PI / 2
  nozzle.position.set(0, 0, 2.0)
  group.add(nozzle)

  // Fuel tanks (2 side tanks)
  for (let side of [-1, 1]) {
    const tankGeom = new THREE.CapsuleGeometry(0.12, 0.8, 8, 12)
    const tank = new THREE.Mesh(tankGeom, MATERIALS.infernoTech)
    tank.position.set(side * 0.35, 0, -0.1)
    group.add(tank)
  }

  // Housing
  const housingGeom = new THREE.BoxGeometry(0.8, 0.5, 0.4)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.infernoTech)
  housing.position.set(0, 0, -0.4)
  group.add(housing)

  return group
}

export function createShieldGenerator(): THREE.Group {
  const group = new THREE.Group()

  // Projector dish
  const dishGeom = new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI)
  const dish = new THREE.Mesh(dishGeom, createEnergyMaterial(0x4444ff))
  dish.rotation.x = -Math.PI / 2
  dish.position.set(0, 0, 0.8)
  group.add(dish)

  // Emitter ring
  const ringGeom = new THREE.TorusGeometry(0.4, 0.05, 8, 24)
  const ring = new THREE.Mesh(ringGeom, MATERIALS.voltTech)
  ring.position.set(0, 0, 0.6)
  group.add(ring)

  // Power core
  const coreGeom = new THREE.SphereGeometry(0.25, 12, 12)
  const core = new THREE.Mesh(coreGeom, createEnergyMaterial(0x00aaff))
  core.position.set(0, 0, 0)
  group.add(core)

  // Housing
  const housingGeom = new THREE.BoxGeometry(0.7, 0.7, 0.5)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.voltTech)
  housing.position.set(0, 0, -0.4)
  group.add(housing)

  return group
}

/**
 * CORE PARTS
 * Max dimensions: 2.5 x 3.5 x 2.5 units
 */

export function createDieselGenerator(): THREE.Group {
  const group = new THREE.Group()

  // Main torso body (more humanoid shape)
  const bodyGeom = new THREE.BoxGeometry(2.0, 2.8, 1.8)
  const body = new THREE.Mesh(bodyGeom, MATERIALS.powerGen)
  body.position.set(0, 1.4, 0)
  group.add(body)

  // Chest plate (angled armor)
  const chestGeom = new THREE.BoxGeometry(1.9, 1.2, 0.3)
  const chest = new THREE.Mesh(chestGeom, MATERIALS.powerGen)
  chest.position.set(0, 2.2, 0.95)
  chest.rotation.x = -0.2
  group.add(chest)

  // Central chest vent
  const ventGeom = new THREE.BoxGeometry(0.6, 1.0, 0.1)
  const vent = new THREE.Mesh(ventGeom, new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.6,
  }))
  vent.position.set(0, 2.1, 1.05)
  group.add(vent)

  // Chest grille
  for (let i = 0; i < 5; i++) {
    const grilleGeom = new THREE.BoxGeometry(0.5, 0.08, 0.05)
    const grille = new THREE.Mesh(grilleGeom, new THREE.MeshStandardMaterial({
      color: 0x333333,
    }))
    grille.position.set(0, 1.7 + i * 0.18, 1.1)
    group.add(grille)
  }

  // Side armor plates
  for (let side of [-1, 1]) {
    const plateGeom = new THREE.BoxGeometry(0.3, 2.2, 1.6)
    const plate = new THREE.Mesh(plateGeom, MATERIALS.powerGen)
    plate.position.set(side * 1.1, 1.4, 0)
    group.add(plate)

    // Side vent stacks
    for (let i = 0; i < 3; i++) {
      const stackGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 8)
      const stack = new THREE.Mesh(stackGeom, new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
      }))
      stack.position.set(side * 1.2, 1.0 + i * 0.6, 0.5)
      group.add(stack)
    }
  }

  // Exhaust pipes (shoulder-mounted)
  for (let i = 0; i < 2; i++) {
    const pipeGeom = new THREE.CylinderGeometry(0.1, 0.12, 1.2, 8)
    const pipe = new THREE.Mesh(pipeGeom, new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.3,
    }))
    pipe.position.set((i - 0.5) * 1.0, 3.0, -0.3)
    group.add(pipe)

    // Exhaust tip
    const tipGeom = new THREE.CylinderGeometry(0.08, 0.1, 0.2, 8)
    const tip = new THREE.Mesh(tipGeom, new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.9,
    }))
    tip.position.set((i - 0.5) * 1.0, 3.6, -0.3)
    group.add(tip)
  }

  // Lower torso detail
  const lowerGeom = new THREE.BoxGeometry(1.6, 0.8, 1.4)
  const lower = new THREE.Mesh(lowerGeom, new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.7,
  }))
  lower.position.set(0, 0.4, 0)
  group.add(lower)

  // Fuel tanks (back-mounted)
  for (let side of [-1, 1]) {
    const tankGeom = new THREE.CapsuleGeometry(0.25, 1.2, 8, 12)
    const tank = new THREE.Mesh(tankGeom, MATERIALS.powerGen)
    tank.rotation.z = Math.PI / 2
    tank.position.set(side * 0.5, 1.5, -0.95)
    group.add(tank)
  }

  // Back armor plate
  const backGeom = new THREE.BoxGeometry(1.8, 2.5, 0.2)
  const back = new THREE.Mesh(backGeom, MATERIALS.powerGen)
  back.position.set(0, 1.3, -0.9)
  group.add(back)

  return group
}

export function createFusionReactor(): THREE.Group {
  const group = new THREE.Group()

  // Main torso housing
  const bodyGeom = new THREE.BoxGeometry(2.2, 2.8, 1.8)
  const body = new THREE.Mesh(bodyGeom, MATERIALS.voltTech)
  body.position.set(0, 1.4, 0)
  group.add(body)

  // Chest core housing (transparent)
  const coreGeom = new THREE.SphereGeometry(0.6, 16, 16)
  const core = new THREE.Mesh(coreGeom, createEnergyMaterial(0x00ffff))
  core.position.set(0, 1.8, 0.5)
  group.add(core)

  // Core containment ring (horizontal)
  const ringGeom = new THREE.TorusGeometry(0.7, 0.05, 8, 24)
  const ring = new THREE.Mesh(ringGeom, MATERIALS.voltTech)
  ring.position.set(0, 1.8, 0.5)
  group.add(ring)

  // Vertical containment rings
  for (let i = 0; i < 3; i++) {
    const vringGeom = new THREE.TorusGeometry(0.65, 0.04, 8, 24)
    const vring = new THREE.Mesh(vringGeom, MATERIALS.voltTech)
    vring.position.set(0, 1.8, 0.5)
    vring.rotation.y = (i * Math.PI) / 3
    group.add(vring)
  }

  // Chest armor frame (around core)
  const frameGeom = new THREE.BoxGeometry(1.6, 1.6, 0.3)
  const frame = new THREE.Mesh(frameGeom, MATERIALS.voltTech)
  frame.position.set(0, 1.8, 0.9)
  group.add(frame)

  // Energy conduit lines on chest
  for (let i = 0; i < 4; i++) {
    const conduitGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6)
    const conduit = new THREE.Mesh(conduitGeom, createEnergyMaterial(0x00aaff))
    conduit.position.set(-0.6 + i * 0.4, 1.4, 0.85)
    group.add(conduit)
  }

  // Side power pods
  for (let side of [-1, 1]) {
    const podGeom = new THREE.BoxGeometry(0.4, 2.2, 1.4)
    const pod = new THREE.Mesh(podGeom, MATERIALS.voltTech)
    pod.position.set(side * 1.2, 1.4, 0)
    group.add(pod)

    // Side energy emitters
    for (let i = 0; i < 3; i++) {
      const emitterGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.15, 8)
      const emitter = new THREE.Mesh(emitterGeom, createEnergyMaterial(0x00aaff))
      emitter.position.set(side * 1.3, 0.8 + i * 0.6, 0.7)
      group.add(emitter)
    }
  }

  // Shoulder mount points (detailed)
  for (let side of [-1, 1]) {
    const mountGeom = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 12)
    const mount = new THREE.Mesh(mountGeom, MATERIALS.voltTech)
    mount.rotation.z = Math.PI / 2
    mount.position.set(side * 1.2, 2.6, 0)
    group.add(mount)
  }

  // Back reactor vent
  const ventGeom = new THREE.BoxGeometry(1.5, 2.0, 0.15)
  const vent = new THREE.Mesh(ventGeom, new THREE.MeshStandardMaterial({
    color: 0x222233,
    metalness: 0.6,
  }))
  vent.position.set(0, 1.5, -0.9)
  group.add(vent)

  // Back power conduits
  for (let i = 0; i < 4; i++) {
    const bconduitGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.0, 6)
    const bconduit = new THREE.Mesh(bconduitGeom, MATERIALS.voltTech)
    bconduit.position.set(-0.5 + i * 0.33, 1.4, -0.85)
    group.add(bconduit)
  }

  return group
}

export function createGasTurbine(): THREE.Group {
  const group = new THREE.Group()

  // Main turbine housing
  const housingGeom = new THREE.CylinderGeometry(0.8, 1.0, 2.5, 12)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.swiftDrive)
  housing.position.set(0, 1.25, 0)
  group.add(housing)

  // Intake fans
  for (let i = 0; i < 2; i++) {
    const fanGeom = new THREE.CircleGeometry(0.7, 16)
    const fan = new THREE.Mesh(fanGeom, MATERIALS.swiftDrive)
    fan.position.set(0, 1.25, i === 0 ? 1.0 : -1.0)
    fan.rotation.y = i === 0 ? 0 : Math.PI
    group.add(fan)
  }

  // Exhaust nozzles
  for (let i = 0; i < 2; i++) {
    const nozzleGeom = new THREE.ConeGeometry(0.3, 0.5, 8)
    const nozzle = new THREE.Mesh(nozzleGeom, createEnergyMaterial(0xff4400))
    nozzle.rotation.x = Math.PI / 2
    nozzle.position.set((i - 0.5) * 1.2, 0.25, 0)
    group.add(nozzle)
  }

  // Fuel lines
  for (let i = 0; i < 3; i++) {
    const lineGeom = new THREE.CylinderGeometry(0.03, 0.03, 2.0, 6)
    const line = new THREE.Mesh(lineGeom, new THREE.MeshStandardMaterial({
      color: 0x333333,
    }))
    line.position.set(0.9, 1.25, 0)
    line.rotation.z = Math.PI / 2
    line.position.y += i * 0.8 - 0.8
    group.add(line)
  }

  return group
}

export function createCapacitorBank(): THREE.Group {
  const group = new THREE.Group()

  // Central housing
  const housingGeom = new THREE.BoxGeometry(2.0, 2.5, 2.0)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.voltTech)
  housing.position.set(0, 1.25, 0)
  group.add(housing)

  // Capacitor cylinders (3x3 grid)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const capGeom = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 12)
      const cap = new THREE.Mesh(capGeom, createEnergyMaterial(0x00aaff))
      cap.position.set(
        (col - 1) * 0.6,
        1.25,
        (row - 1) * 0.6
      )
      group.add(cap)
    }
  }

  // Power terminals on top
  for (let i = 0; i < 4; i++) {
    const termGeom = new THREE.BoxGeometry(0.3, 0.2, 0.3)
    const term = new THREE.Mesh(termGeom, new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
    }))
    term.position.set(
      (i % 2 - 0.5) * 1.2,
      2.6,
      (Math.floor(i / 2) - 0.5) * 1.2
    )
    group.add(term)
  }

  // Status lights
  for (let i = 0; i < 3; i++) {
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      createEnergyMaterial(0x00ff00)
    )
    light.position.set(1.0, 2.0, i * 0.5 - 0.5)
    group.add(light)
  }

  return group
}

/**
 * LEGS PARTS
 * Max dimensions: 2.0 x 2.0 x 2.0 units
 */

export function createBipedalLegs(): THREE.Group {
  const group = new THREE.Group()

  // Two detailed legs
  for (let side of [-1, 1]) {
    // Hip joint (ball joint)
    const hipJointGeom = new THREE.SphereGeometry(0.18, 12, 12)
    const hipJoint = new THREE.Mesh(hipJointGeom, new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.9,
      roughness: 0.2,
    }))
    hipJoint.position.set(side * 0.7, 1.7, 0)
    group.add(hipJoint)

    // Upper leg armor plates
    const upperOuterGeom = new THREE.BoxGeometry(0.35, 0.8, 0.35)
    const upperOuter = new THREE.Mesh(upperOuterGeom, MATERIALS.genMech)
    upperOuter.position.set(side * 0.7, 1.25, 0.1)
    group.add(upperOuter)

    // Upper leg inner mechanism
    const upperInnerGeom = new THREE.CylinderGeometry(0.15, 0.18, 0.7, 8)
    const upperInner = new THREE.Mesh(upperInnerGeom, new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.4,
    }))
    upperInner.position.set(side * 0.7, 1.2, -0.05)
    group.add(upperInner)

    // Hydraulic pistons (front and back)
    for (let pos of [0.15, -0.15]) {
      const pistonGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 6)
      const piston = new THREE.Mesh(pistonGeom, new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.1,
      }))
      piston.position.set(side * 0.7, 1.22, pos)
      group.add(piston)
    }

    // Knee joint (detailed)
    const kneeGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.25, 12)
    const knee = new THREE.Mesh(kneeGeom, new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.9,
      roughness: 0.2,
    }))
    knee.rotation.z = Math.PI / 2
    knee.position.set(side * 0.7, 0.8, 0)
    group.add(knee)

    // Knee cap armor
    const kneeCapGeom = new THREE.BoxGeometry(0.2, 0.2, 0.25)
    const kneeCap = new THREE.Mesh(kneeCapGeom, MATERIALS.genMech)
    kneeCap.position.set(side * 0.7, 0.8, 0.2)
    group.add(kneeCap)

    // Lower leg armor (angled)
    const lowerGeom = new THREE.BoxGeometry(0.3, 0.7, 0.32)
    const lower = new THREE.Mesh(lowerGeom, MATERIALS.genMech)
    lower.position.set(side * 0.7, 0.4, 0.08)
    lower.rotation.x = 0.1
    group.add(lower)

    // Lower leg actuator
    const actuatorGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.65, 8)
    const actuator = new THREE.Mesh(actuatorGeom, new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
    }))
    actuator.position.set(side * 0.7, 0.38, -0.08)
    group.add(actuator)

    // Ankle joint
    const ankleGeom = new THREE.SphereGeometry(0.12, 8, 8)
    const ankle = new THREE.Mesh(ankleGeom, new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.9,
    }))
    ankle.position.set(side * 0.7, 0.05, 0.05)
    group.add(ankle)

    // Foot (detailed with toe)
    const footGeom = new THREE.BoxGeometry(0.45, 0.12, 0.7)
    const foot = new THREE.Mesh(footGeom, MATERIALS.genMech)
    foot.position.set(side * 0.7, -0.02, 0.15)
    group.add(foot)

    // Foot toe section (articulated)
    const toeGeom = new THREE.BoxGeometry(0.4, 0.1, 0.2)
    const toe = new THREE.Mesh(toeGeom, MATERIALS.genMech)
    toe.position.set(side * 0.7, -0.03, 0.5)
    group.add(toe)

    // Heel
    const heelGeom = new THREE.BoxGeometry(0.35, 0.1, 0.15)
    const heel = new THREE.Mesh(heelGeom, MATERIALS.genMech)
    heel.position.set(side * 0.7, -0.03, -0.18)
    group.add(heel)
  }

  // Hip assembly (detailed)
  const hipGeom = new THREE.BoxGeometry(1.8, 0.35, 0.7)
  const hip = new THREE.Mesh(hipGeom, MATERIALS.genMech)
  hip.position.set(0, 1.75, 0)
  group.add(hip)

  // Hip armor plates
  for (let side of [-1, 1]) {
    const plateGeom = new THREE.BoxGeometry(0.35, 0.45, 0.55)
    const plate = new THREE.Mesh(plateGeom, MATERIALS.genMech)
    plate.position.set(side * 0.95, 1.65, 0)
    group.add(plate)
  }

  // Central pelvis detail
  const pelvisGeom = new THREE.BoxGeometry(0.8, 0.4, 0.5)
  const pelvis = new THREE.Mesh(pelvisGeom, new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.8,
  }))
  pelvis.position.set(0, 1.55, 0)
  group.add(pelvis)

  return group
}

export function createTrackedLegs(): THREE.Group {
  const group = new THREE.Group()

  // Two track assemblies
  for (let side of [-1, 1]) {
    // Track housing
    const trackGeom = new THREE.BoxGeometry(0.6, 1.2, 1.8)
    const track = new THREE.Mesh(trackGeom, MATERIALS.armorWorks)
    track.position.set(side * 1.0, 0.6, 0)
    group.add(track)

    // Road wheels
    for (let i = 0; i < 4; i++) {
      const wheelGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 12)
      const wheel = new THREE.Mesh(wheelGeom, new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.9,
      }))
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(side * 1.0, 0.4, (i - 1.5) * 0.45)
      group.add(wheel)
    }

    // Drive sprocket
    const sprocketGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 8)
    const sprocket = new THREE.Mesh(sprocketGeom, MATERIALS.armorWorks)
    sprocket.rotation.z = Math.PI / 2
    sprocket.position.set(side * 1.0, 1.0, -0.8)
    group.add(sprocket)
  }

  // Body platform
  const platformGeom = new THREE.BoxGeometry(2.6, 0.4, 2.0)
  const platform = new THREE.Mesh(platformGeom, MATERIALS.armorWorks)
  platform.position.set(0, 1.4, 0)
  group.add(platform)

  return group
}

export function createHoverLegs(): THREE.Group {
  const group = new THREE.Group()

  // Central hover pod
  const podGeom = new THREE.CylinderGeometry(0.6, 0.8, 0.5, 16)
  const pod = new THREE.Mesh(podGeom, MATERIALS.swiftDrive)
  pod.position.set(0, 0.5, 0)
  group.add(pod)

  // Hover thrusters (4 corners)
  for (let x of [-1, 1]) {
    for (let z of [-1, 1]) {
      const thrusterGeom = new THREE.CylinderGeometry(0.25, 0.35, 0.4, 12)
      const thruster = new THREE.Mesh(thrusterGeom, MATERIALS.swiftDrive)
      thruster.position.set(x * 0.8, 0.2, z * 0.8)
      group.add(thruster)

      // Thrust glow
      const glowGeom = new THREE.ConeGeometry(0.2, 0.3, 8)
      const glow = new THREE.Mesh(glowGeom, createEnergyMaterial(0x00aaff))
      glow.rotation.x = Math.PI
      glow.position.set(x * 0.8, 0, z * 0.8)
      group.add(glow)
    }
  }

  // Stabilizers
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2
    const stabGeom = new THREE.BoxGeometry(0.1, 0.1, 0.8)
    const stab = new THREE.Mesh(stabGeom, MATERIALS.swiftDrive)
    stab.position.set(
      Math.cos(angle) * 1.2,
      0.8,
      Math.sin(angle) * 1.2
    )
    stab.rotation.y = angle
    group.add(stab)
  }

  return group
}

export function createQuadrupedalLegs(): THREE.Group {
  const group = new THREE.Group()

  // Four legs
  for (let x of [-1, 1]) {
    for (let z of [-1, 1]) {
      // Upper leg
      const upperGeom = new THREE.CapsuleGeometry(0.2, 0.5, 8, 12)
      const upper = new THREE.Mesh(upperGeom, MATERIALS.titanForge)
      upper.position.set(x * 0.8, 1.0, z * 0.8)
      group.add(upper)

      // Lower leg
      const lowerGeom = new THREE.CapsuleGeometry(0.15, 0.4, 8, 12)
      const lower = new THREE.Mesh(lowerGeom, MATERIALS.titanForge)
      lower.position.set(x * 0.8, 0.3, z * 0.8)
      group.add(lower)

      // Foot
      const footGeom = new THREE.BoxGeometry(0.3, 0.1, 0.4)
      const foot = new THREE.Mesh(footGeom, MATERIALS.titanForge)
      foot.position.set(x * 0.8, 0, z * 0.8)
      group.add(foot)

      // Knee
      const kneeGeom = new THREE.SphereGeometry(0.12, 8, 8)
      const knee = new THREE.Mesh(kneeGeom, new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
      }))
      knee.position.set(x * 0.8, 0.6, z * 0.8)
      group.add(knee)
    }
  }

  // Central body frame
  const frameGeom = new THREE.BoxGeometry(2.0, 0.3, 2.0)
  const frame = new THREE.Mesh(frameGeom, MATERIALS.titanForge)
  frame.position.set(0, 1.3, 0)
  group.add(frame)

  return group
}

/**
 * HEAD PARTS
 * Max dimensions: 1.5 x 1.5 x 1.5 units
 */

export function createStandardOptics(): THREE.Group {
  const group = new THREE.Group()

  // Neck base
  const neckGeom = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 8)
  const neck = new THREE.Mesh(neckGeom, new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.8,
  }))
  neck.position.set(0, 0.15, 0)
  group.add(neck)

  // Main head structure
  const headGeom = new THREE.BoxGeometry(0.95, 0.75, 0.9)
  const head = new THREE.Mesh(headGeom, MATERIALS.genMech)
  head.position.set(0, 0.55, 0)
  group.add(head)

  // Forehead armor plate
  const foreheadGeom = new THREE.BoxGeometry(0.9, 0.25, 0.3)
  const forehead = new THREE.Mesh(foreheadGeom, MATERIALS.genMech)
  forehead.position.set(0, 0.85, 0.35)
  forehead.rotation.x = -0.3
  group.add(forehead)

  // Central visor (angled, glowing)
  const visorGeom = new THREE.BoxGeometry(0.75, 0.22, 0.12)
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x004444,
    metalness: 0.3,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
    emissive: 0x003333,
    emissiveIntensity: 0.5,
  })
  const visor = new THREE.Mesh(visorGeom, visorMat)
  visor.position.set(0, 0.55, 0.5)
  visor.rotation.x = 0.15
  group.add(visor)

  // Visor frame
  const frameGeom = new THREE.BoxGeometry(0.85, 0.28, 0.08)
  const frame = new THREE.Mesh(frameGeom, new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.9,
  }))
  frame.position.set(0, 0.55, 0.52)
  frame.rotation.x = 0.15
  group.add(frame)

  // Eye sensors (twin optics)
  for (let side of [-1, 1]) {
    const eyeGeom = new THREE.SphereGeometry(0.08, 8, 8)
    const eye = new THREE.Mesh(eyeGeom, createEnergyMaterial(0x00ffff))
    eye.position.set(side * 0.25, 0.55, 0.52)
    group.add(eye)
  }

  // Side sensor pods
  for (let side of [-1, 1]) {
    const podGeom = new THREE.BoxGeometry(0.15, 0.35, 0.5)
    const pod = new THREE.Mesh(podGeom, MATERIALS.genMech)
    pod.position.set(side * 0.55, 0.55, 0)
    group.add(pod)

    // Side sensor lens
    const lensGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8)
    const lens = new THREE.Mesh(lensGeom, createEnergyMaterial(0x00ff00))
    lens.rotation.z = Math.PI / 2
    lens.position.set(side * 0.63, 0.55, 0)
    group.add(lens)
  }

  // Antenna array (back)
  const antGeom = new THREE.CylinderGeometry(0.025, 0.02, 0.5, 6)
  const antenna = new THREE.Mesh(antGeom, new THREE.MeshStandardMaterial({
    color: 0x666666,
    metalness: 0.8,
  }))
  antenna.position.set(0.15, 1.0, -0.2)
  group.add(antenna)

  // Chin detail
  const chinGeom = new THREE.BoxGeometry(0.6, 0.15, 0.4)
  const chin = new THREE.Mesh(chinGeom, MATERIALS.genMech)
  chin.position.set(0, 0.25, 0.25)
  group.add(chin)

  return group
}

export function createTargetingArray(): THREE.Group {
  const group = new THREE.Group()

  // Neck base
  const neckGeom = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 8)
  const neck = new THREE.Mesh(neckGeom, new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.8,
  }))
  neck.position.set(0, 0.15, 0)
  group.add(neck)

  // Main head housing (angular)
  const headGeom = new THREE.BoxGeometry(1.0, 0.7, 0.85)
  const head = new THREE.Mesh(headGeom, MATERIALS.voltTech)
  head.position.set(0, 0.55, 0)
  group.add(head)

  // Central sensor dome
  const domeGeom = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2)
  const dome = new THREE.Mesh(domeGeom, MATERIALS.voltTech)
  dome.position.set(0, 0.9, 0.1)
  group.add(dome)

  // Main targeting array (front-mounted dish)
  const dishGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16)
  const dish = new THREE.Mesh(dishGeom, createEnergyMaterial(0x00aaff))
  dish.position.set(0, 0.55, 0.55)
  dish.rotation.x = Math.PI / 2
  group.add(dish)

  // Dish frame
  const dframeGeom = new THREE.TorusGeometry(0.38, 0.03, 8, 16)
  const dframe = new THREE.Mesh(dframeGeom, MATERIALS.voltTech)
  dframe.position.set(0, 0.55, 0.55)
  group.add(dframe)

  // Side sensor pods (detailed)
  for (let side of [-1, 1]) {
    const podGeom = new THREE.BoxGeometry(0.25, 0.5, 0.6)
    const pod = new THREE.Mesh(podGeom, MATERIALS.voltTech)
    pod.position.set(side * 0.65, 0.55, 0.05)
    group.add(pod)

    // Sensor lens array (3 lenses)
    for (let i = 0; i < 3; i++) {
      const lensGeom = new THREE.SphereGeometry(0.05, 8, 8)
      const lens = new THREE.Mesh(lensGeom, createEnergyMaterial(0x00ff00))
      lens.position.set(side * 0.78, 0.35 + i * 0.2, 0.2)
      group.add(lens)
    }

    // Side antenna
    const antGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6)
    const ant = new THREE.Mesh(antGeom, new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
    }))
    ant.position.set(side * 0.75, 0.95, -0.1)
    ant.rotation.z = side * 0.3
    group.add(ant)
  }

  // Top sensor fin
  const finGeom = new THREE.BoxGeometry(0.08, 0.3, 0.5)
  const fin = new THREE.Mesh(finGeom, MATERIALS.voltTech)
  fin.position.set(0, 1.1, 0)
  group.add(fin)

  // Central processor unit (back of head)
  const procGeom = new THREE.BoxGeometry(0.7, 0.5, 0.35)
  const proc = new THREE.Mesh(procGeom, MATERIALS.voltTech)
  proc.position.set(0, 0.55, -0.45)
  group.add(proc)

  // Processor cooling vents
  for (let i = 0; i < 3; i++) {
    const ventGeom = new THREE.BoxGeometry(0.5, 0.08, 0.05)
    const vent = new THREE.Mesh(ventGeom, new THREE.MeshStandardMaterial({
      color: 0x222222,
    }))
    vent.position.set(0, 0.35 + i * 0.2, -0.6)
    group.add(vent)
  }

  // Status lights
  for (let i = 0; i < 2; i++) {
    const lightGeom = new THREE.SphereGeometry(0.04, 8, 8)
    const light = new THREE.Mesh(lightGeom, createEnergyMaterial(0x00ff00))
    light.position.set(-0.3 + i * 0.6, 0.8, 0.55)
    group.add(light)
  }

  return group
}

export function createReinforcedPod(): THREE.Group {
  const group = new THREE.Group()

  // Heavy armor shell
  const shellGeom = new THREE.BoxGeometry(1.2, 1.0, 1.0)
  const shell = new THREE.Mesh(shellGeom, MATERIALS.armorWorks)
  shell.position.set(0, 0.5, 0)
  group.add(shell)

  // Armor plating (slanted)
  const plateGeom = new THREE.BoxGeometry(1.1, 0.3, 0.8)
  const plate = new THREE.Mesh(plateGeom, MATERIALS.armorWorks)
  plate.position.set(0, 0.85, 0.15)
  plate.rotation.x = -Math.PI / 8
  group.add(plate)

  // Reinforced visor slit
  const slitGeom = new THREE.BoxGeometry(0.7, 0.08, 0.15)
  const slit = new THREE.Mesh(slitGeom, new THREE.MeshStandardMaterial({
    color: 0x003333,
    metalness: 0.3,
    transparent: true,
    opacity: 0.8,
  }))
  slit.position.set(0, 0.5, 0.55)
  group.add(slit)

  // Armor rivets
  for (let x of [-0.4, 0, 0.4]) {
    for (let y of [0.3, 0.7]) {
      const rivetGeom = new THREE.SphereGeometry(0.04, 6, 6)
      const rivet = new THREE.Mesh(rivetGeom, new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.9,
      }))
      rivet.position.set(x, y, 0.55)
      group.add(rivet)
    }
  }

  return group
}

export function createScoutSuite(): THREE.Group {
  const group = new THREE.Group()

  // Lightweight frame
  const frameGeom = new THREE.BoxGeometry(0.6, 0.4, 0.5)
  const frame = new THREE.Mesh(frameGeom, MATERIALS.swiftDrive)
  frame.position.set(0, 0.2, 0)
  group.add(frame)

  // Long-range sensor array (dish)
  const dishGeom = new THREE.ConeGeometry(0.5, 0.4, 12, 1, true)
  const dish = new THREE.Mesh(dishGeom, MATERIALS.swiftDrive)
  dish.rotation.x = Math.PI / 2
  dish.position.set(0, 0.4, 0.4)
  group.add(dish)

  // Multi-spectrum cameras
  for (let i = 0; i < 3; i++) {
    const camGeom = new THREE.CylinderGeometry(0.08, 0.06, 0.2, 8)
    const cam = new THREE.Mesh(camGeom, MATERIALS.swiftDrive)
    cam.rotation.x = Math.PI / 2
    cam.position.set((i - 1) * 0.2, 0.3, 0.6)
    group.add(cam)

    // Lens
    const lensGeom = new THREE.SphereGeometry(0.05, 8, 8)
    const lens = new THREE.Mesh(lensGeom, createEnergyMaterial(0xff0000))
    lens.position.set((i - 1) * 0.2, 0.3, 0.72)
    group.add(lens)
  }

  // Communication antennas (2)
  for (let side of [-1, 1]) {
    const antGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 6)
    const ant = new THREE.Mesh(antGeom, new THREE.MeshStandardMaterial({
      color: 0x888888,
    }))
    ant.position.set(side * 0.25, 0.7, 0)
    group.add(ant)
  }

  return group
}

/**
 * RACK PARTS
 * Max dimensions: 1.0 x 1.0 x 0.5 units
 */

export function createSmokeLauncher(): THREE.Group {
  const group = new THREE.Group()

  // Launcher tubes (3 tubes)
  for (let i = 0; i < 3; i++) {
    const tubeGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8)
    const tube = new THREE.Mesh(tubeGeom, MATERIALS.tacticalSys)
    tube.rotation.x = Math.PI / 2
    tube.position.set((i - 1) * 0.25, 0, 0)
    group.add(tube)
  }

  // Housing
  const housingGeom = new THREE.BoxGeometry(0.9, 0.25, 0.3)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.tacticalSys)
  housing.position.set(0, 0, -0.15)
  group.add(housing)

  return group
}

export function createAmmoFeed(): THREE.Group {
  const group = new THREE.Group()

  // Ammo canister
  const canGeom = new THREE.BoxGeometry(0.6, 0.8, 0.35)
  const can = new THREE.Mesh(canGeom, MATERIALS.armsCore)
  can.position.set(0, 0.4, 0)
  group.add(can)

  // Feed chute
  const chuteGeom = new THREE.CylinderGeometry(0.08, 0.1, 0.5, 8)
  const chute = new THREE.Mesh(chuteGeom, MATERIALS.armsCore)
  chute.position.set(0.3, 0.6, 0.1)
  chute.rotation.z = Math.PI / 4
  group.add(chute)

  // Ammo indicator
  const indGeom = new THREE.BoxGeometry(0.1, 0.3, 0.05)
  const ind = new THREE.Mesh(indGeom, createEnergyMaterial(0x00ff00))
  ind.position.set(0.35, 0.5, 0.18)
  group.add(ind)

  return group
}

export function createJumpJets(): THREE.Group {
  const group = new THREE.Group()

  // Jet pods (2)
  for (let side of [-1, 1]) {
    const podGeom = new THREE.CylinderGeometry(0.2, 0.25, 0.6, 8)
    const pod = new THREE.Mesh(podGeom, MATERIALS.swiftDrive)
    pod.position.set(side * 0.35, 0.3, 0)
    group.add(pod)

    // Thrust nozzle
    const nozzleGeom = new THREE.ConeGeometry(0.15, 0.2, 8)
    const nozzle = new THREE.Mesh(nozzleGeom, createEnergyMaterial(0xff4400))
    nozzle.rotation.x = Math.PI
    nozzle.position.set(side * 0.35, -0.1, 0)
    group.add(nozzle)
  }

  // Fuel tank
  const tankGeom = new THREE.CapsuleGeometry(0.15, 0.5, 8, 12)
  const tank = new THREE.Mesh(tankGeom, MATERIALS.swiftDrive)
  tank.position.set(0, 0.35, 0)
  group.add(tank)

  return group
}

export function createRepairDrone(): THREE.Group {
  const group = new THREE.Group()

  // Drone bay housing
  const bayGeom = new THREE.BoxGeometry(0.7, 0.3, 0.4)
  const bay = new THREE.Mesh(bayGeom, MATERIALS.genMech)
  bay.position.set(0, 0.15, 0)
  group.add(bay)

  // Drone (sitting in bay)
  const droneGeom = new THREE.BoxGeometry(0.3, 0.15, 0.3)
  const drone = new THREE.Mesh(droneGeom, MATERIALS.genMech)
  drone.position.set(0, 0.38, 0)
  group.add(drone)

  // Repair arms
  for (let side of [-1, 1]) {
    const armGeom = new THREE.BoxGeometry(0.08, 0.3, 0.05)
    const arm = new THREE.Mesh(armGeom, new THREE.MeshStandardMaterial({
      color: 0x888888,
    }))
    arm.position.set(side * 0.22, 0.35, 0.15)
    arm.rotation.x = Math.PI / 4
    group.add(arm)
  }

  // Status light
  const lightGeom = new THREE.SphereGeometry(0.04, 8, 8)
  const light = new THREE.Mesh(lightGeom, createEnergyMaterial(0x00ff00))
  light.position.set(0.3, 0.2, 0.21)
  group.add(light)

  return group
}

/**
 * Get the procedural model generator function for a part ID
 */
export function getProceduralModel(partId: string): (() => THREE.Group) | null {
  const modelMap: Record<string, () => THREE.Group> = {
    // Arms
    'arm-autocannon-mk1': createAutocannon,
    'arm-railgun': createRailgun,
    'arm-pile-driver': createPileDriver,
    'arm-missile-pod': createMissilePod,
    'arm-flamer': createFlamethrower,
    'arm-shield-gen': createShieldGenerator,

    // Cores
    'core-diesel-gen': createDieselGenerator,
    'core-fusion': createFusionReactor,
    'core-gas-turbine': createGasTurbine,
    'core-capacitor-bank': createCapacitorBank,

    // Legs
    'legs-bipedal-standard': createBipedalLegs,
    'legs-tracked-heavy': createTrackedLegs,
    'legs-hover': createHoverLegs,
    'legs-quad': createQuadrupedalLegs,

    // Heads
    'head-standard-optics': createStandardOptics,
    'head-targeting-array': createTargetingArray,
    'head-reinforced': createReinforcedPod,
    'head-scout-suite': createScoutSuite,

    // Racks
    'rack-smoke-launcher': createSmokeLauncher,
    'rack-ammo-feed': createAmmoFeed,
    'rack-jump-jets': createJumpJets,
    'rack-repair-drone': createRepairDrone,
  }

  return modelMap[partId] || null
}
