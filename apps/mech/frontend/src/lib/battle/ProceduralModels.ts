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

import { getBakedPart } from './procedural/bakedParts'
import { createAutocannon, createRailgun, createPileDriver, createMissilePod, createFlamethrower, createShieldGenerator } from './procedural/arms'
import { createDieselGenerator, createFusionReactor, createGasTurbine, createCapacitorBank } from './procedural/cores'
import { createBipedalLegs, createTrackedLegs, createHoverLegs, createQuadrupedalLegs } from './procedural/legs'
import { createStandardOptics, createTargetingArray, createReinforcedPod, createScoutSuite } from './procedural/heads'
import { createSmokeLauncher, createAmmoFeed, createJumpJets, createRepairDrone } from './procedural/racks'
// New bespoke-derived modular parts (decomposed showcase designs).
import { createWraithLegs } from './procedural/parts/wraith'
import { createStrikerBladeArm, createStrikerCore, createStrikerHead, createStrikerLegs, createStrikerRack, createStrikerRailArm } from './procedural/parts/strikerParts'
import { createJuggernautArm, createJuggernautArmCannon, createJuggernautCore, createJuggernautHead, createJuggernautLegs, createJuggernautRack } from './procedural/parts/juggernautParts'
import { createSentinelCore, createSentinelHead, createSentinelLanceArm, createSentinelLegs, createSentinelRack, createSentinelShieldArm } from './procedural/parts/sentinelParts'
import { createMantisArmClaw, createMantisArmScythe, createMantisCore, createMantisHead, createMantisLegs, createMantisRack } from './procedural/parts/mantisParts'
import { createValkyrieArm, createValkyrieCore, createValkyrieHead, createValkyrieLegs, createValkyrieRack } from './procedural/parts/valkyrieParts'
import { createHarrierArmBladeRifle, createHarrierArmMissilePod, createHarrierCore, createHarrierHead, createHarrierLegs, createHarrierRack } from './procedural/parts/harrierParts'

export { MATERIALS, createEnergyMaterial } from './procedural/materials'
export { createAutocannon, createRailgun, createPileDriver, createMissilePod, createFlamethrower, createShieldGenerator }
export { createDieselGenerator, createFusionReactor, createGasTurbine, createCapacitorBank }
export { createBipedalLegs, createTrackedLegs, createHoverLegs, createQuadrupedalLegs }
export { createStandardOptics, createTargetingArray, createReinforcedPod, createScoutSuite }
export { createSmokeLauncher, createAmmoFeed, createJumpJets, createRepairDrone }

const MODEL_BUILDERS: Record<string, () => THREE.Group> = {
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
  'legs-wraith-rj': createWraithLegs,

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

  // --- Bespoke-derived modular parts (decomposed showcase designs) ---
  // Cores
  'core-striker-lean': createStrikerCore,
  'core-juggernaut-bastion': createJuggernautCore,
  'core-sentinel-heraldic': createSentinelCore,
  'core-mantis-thorax': createMantisCore,
  'core-valkyrie-intake': createValkyrieCore,
  'core-harrier-raider': createHarrierCore,
  // Legs
  'legs-striker-skirmisher': createStrikerLegs,
  'legs-juggernaut-heavy': createJuggernautLegs,
  'legs-sentinel-guardian': createSentinelLegs,
  'legs-mantis-raptor': createMantisLegs,
  'legs-valkyrie-thruster': createValkyrieLegs,
  'legs-harrier-rj': createHarrierLegs,
  // Heads
  'head-striker-visor': createStrikerHead,
  'head-juggernaut-bunker': createJuggernautHead,
  'head-sentinel-helm': createSentinelHead,
  'head-mantis-clustered': createMantisHead,
  'head-valkyrie-canopy': createValkyrieHead,
  'head-harrier-visor': createHarrierHead,
  // Arms
  'arm-striker-railcannon': createStrikerRailArm,
  'arm-striker-blade': createStrikerBladeArm,
  'arm-juggernaut-breacher': createJuggernautArm,
  'arm-juggernaut-cannon': createJuggernautArmCannon,
  'arm-sentinel-tower-shield': createSentinelShieldArm,
  'arm-sentinel-lance': createSentinelLanceArm,
  'arm-mantis-scythe': createMantisArmScythe,
  'arm-mantis-claw': createMantisArmClaw,
  'arm-valkyrie-beampod': createValkyrieArm,
  'arm-harrier-blade-rifle': createHarrierArmBladeRifle,
  'arm-harrier-missile-pod': createHarrierArmMissilePod,
  // Racks
  'rack-striker-thrusterfins': createStrikerRack,
  'rack-juggernaut-missile': createJuggernautRack,
  'rack-sentinel-banner': createSentinelRack,
  'rack-mantis-carapace': createMantisRack,
  'rack-valkyrie-wing': createValkyrieRack,
  'rack-harrier-boosters': createHarrierRack,
}

/**
 * Get the procedural model generator function for a part ID.
 *
 * The returned function serves a clone of a baked, module-cached model: the
 * raw builder runs at most once per part id per session, its meshes are merged
 * into a handful of draw calls, and all instances share the same geometry (see
 * procedural/bakedParts.ts). Callers that mutate materials must clone them —
 * the raw builders above remain exported for anything needing a fresh,
 * unmerged model.
 */
export function getProceduralModel(partId: string): (() => THREE.Group) | null {
  const builder = MODEL_BUILDERS[partId]
  if (!builder) return null
  return () => getBakedPart(partId, builder)
}
