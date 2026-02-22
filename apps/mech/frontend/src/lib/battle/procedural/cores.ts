/**
 * Procedural Core Part Models
 * Max dimensions: 2.2 x 2.0 x 1.8 units
 * Origin at bottom (where legs connect), models extend upward ~2.0
 */

import * as THREE from 'three'
import { MATERIALS, createEnergyMaterial } from './materials'

export function createDieselGenerator(): THREE.Group {
  const group = new THREE.Group()

  // Main torso body (compact, narrower at waist)
  const bodyGeom = new THREE.BoxGeometry(1.6, 1.6, 1.3)
  const body = new THREE.Mesh(bodyGeom, MATERIALS.powerGen)
  body.position.set(0, 0.9, 0)
  group.add(body)

  // Chest plate (angled armor)
  const chestGeom = new THREE.BoxGeometry(1.5, 0.8, 0.2)
  const chest = new THREE.Mesh(chestGeom, MATERIALS.powerGen)
  chest.position.set(0, 1.3, 0.7)
  chest.rotation.x = -0.15
  group.add(chest)

  // Central chest vent
  const ventGeom = new THREE.BoxGeometry(0.5, 0.6, 0.08)
  const vent = new THREE.Mesh(ventGeom, new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.6,
  }))
  vent.position.set(0, 1.2, 0.78)
  group.add(vent)

  // Chest grille bars
  for (let i = 0; i < 4; i++) {
    const grilleGeom = new THREE.BoxGeometry(0.4, 0.06, 0.04)
    const grille = new THREE.Mesh(grilleGeom, new THREE.MeshStandardMaterial({
      color: 0x333333,
    }))
    grille.position.set(0, 0.95 + i * 0.14, 0.82)
    group.add(grille)
  }

  // Shoulder mounts
  for (let side of [-1, 1]) {
    const shoulderGeom = new THREE.BoxGeometry(0.3, 0.4, 0.8)
    const shoulder = new THREE.Mesh(shoulderGeom, MATERIALS.powerGen)
    shoulder.position.set(side * 0.95, 1.5, 0)
    group.add(shoulder)

    // Side vent stacks
    for (let i = 0; i < 2; i++) {
      const stackGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8)
      const stack = new THREE.Mesh(stackGeom, new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
      }))
      stack.position.set(side * 1.0, 0.8 + i * 0.45, 0.4)
      group.add(stack)
    }
  }

  // Exhaust pipes (back-mounted, shorter)
  for (let i = 0; i < 2; i++) {
    const pipeGeom = new THREE.CylinderGeometry(0.08, 0.1, 0.6, 8)
    const pipe = new THREE.Mesh(pipeGeom, new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.3,
    }))
    pipe.position.set((i - 0.5) * 0.6, 1.6, -0.5)
    group.add(pipe)
  }

  // Waist / lower torso (narrower)
  const waistGeom = new THREE.BoxGeometry(1.2, 0.4, 1.0)
  const waist = new THREE.Mesh(waistGeom, new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.7,
  }))
  waist.position.set(0, 0.2, 0)
  group.add(waist)

  // Back armor plate
  const backGeom = new THREE.BoxGeometry(1.4, 1.4, 0.15)
  const back = new THREE.Mesh(backGeom, MATERIALS.powerGen)
  back.position.set(0, 0.9, -0.65)
  group.add(back)

  return group
}

export function createFusionReactor(): THREE.Group {
  const group = new THREE.Group()

  // Main torso housing (compact)
  const bodyGeom = new THREE.BoxGeometry(1.7, 1.6, 1.3)
  const body = new THREE.Mesh(bodyGeom, MATERIALS.voltTech)
  body.position.set(0, 0.9, 0)
  group.add(body)

  // Chest core (glowing fusion reactor)
  const coreGeom = new THREE.SphereGeometry(0.4, 16, 16)
  const core = new THREE.Mesh(coreGeom, createEnergyMaterial(0x00ffff))
  core.position.set(0, 1.1, 0.35)
  group.add(core)

  // Core containment ring
  const ringGeom = new THREE.TorusGeometry(0.5, 0.04, 8, 24)
  const ring = new THREE.Mesh(ringGeom, MATERIALS.voltTech)
  ring.position.set(0, 1.1, 0.35)
  group.add(ring)

  // Vertical containment rings
  for (let i = 0; i < 2; i++) {
    const vringGeom = new THREE.TorusGeometry(0.45, 0.03, 8, 24)
    const vring = new THREE.Mesh(vringGeom, MATERIALS.voltTech)
    vring.position.set(0, 1.1, 0.35)
    vring.rotation.y = (i * Math.PI) / 2
    group.add(vring)
  }

  // Chest frame around core
  const frameGeom = new THREE.BoxGeometry(1.2, 1.0, 0.2)
  const frame = new THREE.Mesh(frameGeom, MATERIALS.voltTech)
  frame.position.set(0, 1.1, 0.65)
  group.add(frame)

  // Energy conduit lines
  for (let i = 0; i < 3; i++) {
    const conduitGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6)
    const conduit = new THREE.Mesh(conduitGeom, createEnergyMaterial(0x00aaff))
    conduit.position.set(-0.4 + i * 0.4, 0.9, 0.6)
    group.add(conduit)
  }

  // Side power pods / shoulders
  for (let side of [-1, 1]) {
    const podGeom = new THREE.BoxGeometry(0.35, 1.2, 1.0)
    const pod = new THREE.Mesh(podGeom, MATERIALS.voltTech)
    pod.position.set(side * 1.0, 1.0, 0)
    group.add(pod)

    // Energy emitters
    for (let i = 0; i < 2; i++) {
      const emitterGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8)
      const emitter = new THREE.Mesh(emitterGeom, createEnergyMaterial(0x00aaff))
      emitter.position.set(side * 1.1, 0.7 + i * 0.5, 0.4)
      group.add(emitter)
    }
  }

  // Waist
  const waistGeom = new THREE.BoxGeometry(1.3, 0.35, 1.0)
  const waist = new THREE.Mesh(waistGeom, new THREE.MeshStandardMaterial({
    color: 0x222233,
    metalness: 0.6,
  }))
  waist.position.set(0, 0.18, 0)
  group.add(waist)

  // Back reactor vent
  const ventGeom = new THREE.BoxGeometry(1.2, 1.2, 0.1)
  const vent = new THREE.Mesh(ventGeom, new THREE.MeshStandardMaterial({
    color: 0x222233,
    metalness: 0.6,
  }))
  vent.position.set(0, 1.0, -0.65)
  group.add(vent)

  return group
}

export function createGasTurbine(): THREE.Group {
  const group = new THREE.Group()

  // Main turbine housing (cylindrical torso)
  const housingGeom = new THREE.CylinderGeometry(0.6, 0.7, 1.6, 12)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.swiftDrive)
  housing.position.set(0, 0.9, 0)
  group.add(housing)

  // Front intake
  const intakeGeom = new THREE.CircleGeometry(0.5, 16)
  const intake = new THREE.Mesh(intakeGeom, MATERIALS.swiftDrive)
  intake.position.set(0, 0.9, 0.7)
  group.add(intake)

  // Shoulder nacelles
  for (let side of [-1, 1]) {
    const nacelleGeom = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8)
    const nacelle = new THREE.Mesh(nacelleGeom, MATERIALS.swiftDrive)
    nacelle.rotation.x = Math.PI / 2
    nacelle.position.set(side * 0.8, 1.2, -0.1)
    group.add(nacelle)

    // Exhaust nozzle
    const nozzleGeom = new THREE.ConeGeometry(0.2, 0.3, 8)
    const nozzle = new THREE.Mesh(nozzleGeom, createEnergyMaterial(0xff4400))
    nozzle.rotation.x = Math.PI / 2
    nozzle.position.set(side * 0.8, 1.2, -0.6)
    group.add(nozzle)
  }

  // Waist connector
  const waistGeom = new THREE.CylinderGeometry(0.5, 0.55, 0.3, 12)
  const waist = new THREE.Mesh(waistGeom, MATERIALS.swiftDrive)
  waist.position.set(0, 0.15, 0)
  group.add(waist)

  // Fuel lines
  for (let i = 0; i < 2; i++) {
    const lineGeom = new THREE.CylinderGeometry(0.025, 0.025, 1.4, 6)
    const line = new THREE.Mesh(lineGeom, new THREE.MeshStandardMaterial({
      color: 0x333333,
    }))
    line.position.set(0.55, 0.9, (i - 0.5) * 0.4)
    group.add(line)
  }

  return group
}

export function createCapacitorBank(): THREE.Group {
  const group = new THREE.Group()

  // Central housing (compact)
  const housingGeom = new THREE.BoxGeometry(1.6, 1.6, 1.4)
  const housing = new THREE.Mesh(housingGeom, MATERIALS.voltTech)
  housing.position.set(0, 0.9, 0)
  group.add(housing)

  // Capacitor cylinders (2x2 grid visible on chest)
  for (let row of [-1, 1]) {
    for (let col of [-1, 1]) {
      const capGeom = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 12)
      const cap = new THREE.Mesh(capGeom, createEnergyMaterial(0x00aaff))
      cap.position.set(col * 0.35, 0.9, row * 0.35)
      group.add(cap)
    }
  }

  // Power terminals on top
  for (let i = 0; i < 2; i++) {
    const termGeom = new THREE.BoxGeometry(0.25, 0.15, 0.25)
    const term = new THREE.Mesh(termGeom, new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
    }))
    term.position.set((i - 0.5) * 0.8, 1.8, 0)
    group.add(term)
  }

  // Side panels / shoulders
  for (let side of [-1, 1]) {
    const panelGeom = new THREE.BoxGeometry(0.25, 1.0, 1.0)
    const panel = new THREE.Mesh(panelGeom, MATERIALS.voltTech)
    panel.position.set(side * 0.95, 1.0, 0)
    group.add(panel)
  }

  // Waist
  const waistGeom = new THREE.BoxGeometry(1.2, 0.35, 1.0)
  const waist = new THREE.Mesh(waistGeom, MATERIALS.voltTech)
  waist.position.set(0, 0.15, 0)
  group.add(waist)

  // Status lights
  for (let i = 0; i < 3; i++) {
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      createEnergyMaterial(0x00ff00)
    )
    light.position.set(0.8, 1.4, (i - 1) * 0.3)
    group.add(light)
  }

  return group
}
