/**
 * Procedural Arm Weapon Models
 * Max dimensions: 1.0 x 2.5 x 1.0 units
 */

import * as THREE from 'three'
import { MATERIALS, createEnergyMaterial } from './materials'

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
