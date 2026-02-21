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

import type * as THREE from 'three'

import { createAutocannon, createRailgun, createPileDriver, createMissilePod, createFlamethrower, createShieldGenerator } from './procedural/arms'
import { createDieselGenerator, createFusionReactor, createGasTurbine, createCapacitorBank } from './procedural/cores'
import { createBipedalLegs, createTrackedLegs, createHoverLegs, createQuadrupedalLegs } from './procedural/legs'
import { createStandardOptics, createTargetingArray, createReinforcedPod, createScoutSuite } from './procedural/heads'
import { createSmokeLauncher, createAmmoFeed, createJumpJets, createRepairDrone } from './procedural/racks'

export { MATERIALS, createEnergyMaterial } from './procedural/materials'
export { createAutocannon, createRailgun, createPileDriver, createMissilePod, createFlamethrower, createShieldGenerator }
export { createDieselGenerator, createFusionReactor, createGasTurbine, createCapacitorBank }
export { createBipedalLegs, createTrackedLegs, createHoverLegs, createQuadrupedalLegs }
export { createStandardOptics, createTargetingArray, createReinforcedPod, createScoutSuite }
export { createSmokeLauncher, createAmmoFeed, createJumpJets, createRepairDrone }

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
