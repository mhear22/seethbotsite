/**
 * Procedural Core Part Models
 * Max dimensions: 2.5 x 3.5 x 2.5 units
 */

import * as THREE from 'three'
import { MATERIALS, createEnergyMaterial } from './materials'

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
