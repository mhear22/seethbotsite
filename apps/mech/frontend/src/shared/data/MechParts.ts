/**
 * Mech Part Data - All mech parts defined in JSON-friendly format
 * This file is the single source of truth for all mech parts
 * Edit this file to adjust game balance
 */

import type { ArmPart, CorePart, LegsPart, HeadPart, RackPart, SynergyEffect } from '../types/MechTypes'

// ============================================================================
// ARM PARTS
// ============================================================================

export const ARM_PARTS: ArmPart[] = [
  {
    id: 'arm-striker-railcannon',
    name: 'Striker Rail-Cannon Arm',
    type: 'arm',
    weaponType: 'ballistic',
    icon: 'autocannon',
    description: 'Long slim rail-cannon cantilevered forward with twin red accelerator rails, muzzle brake and an amber charge glow.',
    stats: { health: -4, armor: -2, speed: -2, energy: -6, firepower: 18, accuracy: 10 },
    weight: 18,
    powerDraw: 3,
    fireRate: 0.16,
    damageType: 'kinetic',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/arm/arm-striker-railcannon.glb'
  },
  {
    id: 'arm-striker-blade',
    name: 'Striker Mono-Blade Arm',
    type: 'arm',
    weaponType: 'melee',
    icon: 'pile-driver',
    description: 'Compact articulated arm ending in a long swept mono-blade with a gold cutting edge and amber emitter glow.',
    stats: { health: -2, armor: -2, speed: 6, energy: -2, firepower: 12, accuracy: 4 },
    weight: 12,
    powerDraw: 8,
    fireRate: 1.4,
    damageType: 'melee',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/arm/arm-striker-blade.glb'
  },
  {
    id: 'arm-juggernaut-breacher',
    name: 'Juggernaut Breacher Fist',
    type: 'arm',
    weaponType: 'melee',
    icon: 'pile-driver',
    description: 'An oversized blocky arm ending in a spiked breacher knuckle — heavy vented forearm, brutal close-range crush weapon.',
    stats: { health: 16, armor: 18, speed: -6, energy: -2, firepower: 24, accuracy: -4 },
    weight: 30,
    powerDraw: 8,
    fireRate: 1.4,
    damageType: 'melee',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/arm/arm-juggernaut-breacher.glb'
  },
  {
    id: 'arm-juggernaut-cannon',
    name: 'Juggernaut Twin Cannon',
    type: 'arm',
    weaponType: 'ballistic',
    icon: 'autocannon',
    description: 'A big boxy twin-barrel cannon arm with a vented housing and amber charge indicator — devastating forward firepower at the cost of speed.',
    stats: { health: 14, armor: 16, speed: -8, energy: -6, firepower: 34, accuracy: -2 },
    weight: 34,
    powerDraw: 3,
    fireRate: 0.16,
    damageType: 'kinetic',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/arm/arm-juggernaut-cannon.glb'
  },
  {
    id: 'arm-sentinel-tower-shield',
    name: 'Sentinel Tower Shield Arm',
    type: 'arm',
    weaponType: 'support',
    icon: 'shield-gen',
    description: 'A defensive arm mounting a tall layered tower shield with full heraldic gold borders, a red diamond boss and a pointed lower tip.',
    stats: { health: 18, armor: 20, speed: -4, energy: 0, firepower: 2, accuracy: 0 },
    weight: 26,
    powerDraw: 5,
    fireRate: 1.0,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/arm/arm-sentinel-tower-shield.glb'
  },
  {
    id: 'arm-sentinel-lance',
    name: 'Sentinel Lance Arm',
    type: 'arm',
    weaponType: 'melee',
    icon: 'pile-driver',
    description: 'A gauntleted arm couching a long gold-bound ceremonial lance with a fluted spear head, vamplate guard and glowing amber pommel.',
    stats: { health: 0, armor: 4, speed: 0, energy: 0, firepower: 18, accuracy: 6 },
    weight: 20,
    powerDraw: 8,
    fireRate: 1.4,
    damageType: 'melee',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/arm/arm-sentinel-lance.glb'
  },
  {
    id: 'arm-mantis-scythe',
    name: 'Mantis Scythe Blade',
    type: 'arm',
    weaponType: 'melee',
    icon: 'pile-driver',
    description: 'A huge raptorial scythe arm folding down to a serrated grasping edge and hooked killing tip, with a bright cutting lip and red war-stripe.',
    stats: { health: 0, armor: 1, speed: -2, energy: -2, firepower: 12, accuracy: 4 },
    weight: 8,
    powerDraw: 8,
    fireRate: 1.4,
    damageType: 'melee',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'legendary',
    manufacturer: 'Foundry',
    modelPath: '/models/arm/arm-mantis-scythe.glb'
  },
  {
    id: 'arm-mantis-claw',
    name: 'Mantis Manipulator Claw',
    type: 'arm',
    weaponType: 'melee',
    icon: 'pile-driver',
    description: 'A lighter secondary manipulator arm ending in a two-finger pincer with an amber wrist actuator — a nimble alternative to the scythe.',
    stats: { health: -1, armor: -1, speed: 3, energy: 1, firepower: 5, accuracy: 3 },
    weight: 4,
    powerDraw: 8,
    fireRate: 1.4,
    damageType: 'melee',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'uncommon',
    manufacturer: 'Foundry',
    modelPath: '/models/arm/arm-mantis-claw.glb'
  },
  {
    id: 'arm-valkyrie-beampod',
    name: 'Valkyrie Beam-Pod Arm',
    type: 'arm',
    weaponType: 'energy',
    icon: 'railgun',
    description: 'A sleek aero arm with a symmetric swept pauldron and a forearm-mounted cylindrical beam emitter pod with a glowing amber muzzle and heat vents. Mirrors onto either shoulder.',
    stats: { health: 24, armor: 10, speed: 6, energy: 22, firepower: 30, accuracy: 16 },
    weight: 20,
    powerDraw: 8,
    fireRate: 0.5,
    damageType: 'energy',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/arm/arm-valkyrie-beampod.glb'
  },
  {
    id: 'arm-harrier-blade-rifle',
    name: 'Harrier Blade-Rifle Arm',
    type: 'arm',
    weaponType: 'energy',
    icon: 'railgun',
    description: 'Slim long-barrel blade-rifle with an amber charge breach and an under-barrel mono-blade for melee slashes. High firepower and reach.',
    stats: { health: 40, armor: 6, speed: 2, energy: 18, firepower: 30, accuracy: 10 },
    weight: 14,
    powerDraw: 8,
    fireRate: 0.5,
    damageType: 'energy',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/arm/arm-harrier-blade-rifle.glb'
  },
  {
    id: 'arm-harrier-missile-pod',
    name: 'Harrier Missile-Pod Arm',
    type: 'arm',
    weaponType: 'missile',
    icon: 'missile-pod',
    description: 'Shoulder-mounted 6-tube amber-cored missile pod above a gripping hand and red-slashed forearm guard. Saturating splash firepower.',
    stats: { health: 42, armor: 8, speed: -2, energy: 14, firepower: 26, accuracy: 4 },
    weight: 17,
    powerDraw: 12,
    fireRate: 0.8,
    damageType: 'kinetic',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/arm/arm-harrier-missile-pod.glb'
  },

  {
    id: 'arm-autocannon-mk1',
    name: 'M61 Autocannon',
    type: 'arm',
    weaponType: 'ballistic',
    icon: 'autocannon',
    description: '20mm rotary cannon with high rate of fire',
    stats: { health: 10, armor: 5, speed: 0, energy: -10, firepower: 50, accuracy: 15 },
    weight: 8,
    // 1.5/shot at 0.12s cadence ≈ 12.5 power/s — the LOWEST sustained draw of any
    // weapon (below the missile pod's 15/s), which is the autocannon's whole
    // identity: lower DPS than the missile but its power-efficient sustain answer.
    // Was 5/shot (≈42/s), which made it strictly dominated by the missile pod.
    powerDraw: 1.5,
    fireRate: 0.12,
    // Sustained-pressure kinetic. Fast forgiving tracer, tight base spread.
    damageType: 'kinetic',
    projectileSpeed: 340,
    spread: 0.02,
    pros: ['High rate of fire', 'Good accuracy', 'Low energy draw'],
    cons: ['Limited range', 'Ammo dependent'],
    rarity: 'common',
    manufacturer: 'ArmsCore',
    synergyTags: ['ballistic', 'rapid-fire'],
    modelPath: '/models/arms/autocannon.glb'
  },
  {
    id: 'arm-railgun',
    name: 'Mk8 Railgun',
    type: 'arm',
    weaponType: 'energy',
    icon: 'railgun',
    description: 'High-powered electromagnetic accelerator - devastating single shots',
    stats: { health: 5, armor: 0, speed: -5, energy: -30, firepower: 400, accuracy: 25 },
    weight: 12,
    powerDraw: 25,
    fireRate: 2.0,
    // One devastating aimed shot. Near-hitscan velocity, pinpoint, armour-piercing.
    damageType: 'energy',
    projectileSpeed: 700,
    spread: 0.0,
    armorPierce: true,
    pros: ['Armor piercing', 'Extreme range', 'High velocity'],
    cons: ['High energy cost', 'Slow rate of fire', 'Heavy'],
    rarity: 'rare',
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'precision', 'heavy-weapon'],
    modelPath: '/models/arms/railgun.glb'
  },
  {
    id: 'arm-pile-driver',
    name: 'Hydraulic Pile Driver',
    type: 'arm',
    weaponType: 'melee',
    icon: 'pile-driver',
    description: 'Devastating pneumatic ram capable of crippling enemies in one strike',
    stats: { health: 20, armor: 15, speed: 5, energy: -5, firepower: 320, accuracy: 10 },
    weight: 15,
    powerDraw: 10,
    // Brawler finisher. Melee channel (ignores ranged resistances); slow heavy swing + lunge.
    fireRate: 1.5,
    damageType: 'melee',
    pros: ['No ammo', 'Structural damage', 'Bonus armor'],
    cons: ['Melee only', 'Close range required'],
    rarity: 'uncommon',
    manufacturer: 'TitanForge',
    synergyTags: ['melee', 'heavy'],
    modelPath: '/models/arms/pile-driver.glb'
  },
  {
    id: 'arm-missile-pod',
    name: 'SRM-6 Missile Pod',
    type: 'arm',
    // 'missile' activates the homing path in ProjectileSystem (steering + trail).
    weaponType: 'missile',
    icon: 'missile-pod',
    description: 'Six-tube launcher fires a homing salvo for devastating alpha strikes',
    stats: { health: 8, armor: 3, speed: 0, energy: -15, firepower: 100, accuracy: 8 },
    weight: 10,
    powerDraw: 15,
    fireRate: 1.0,
    projectileCount: 6,
    // Burst alpha, now homing. Slow enough to out-dash if you time it; salvo cone.
    damageType: 'kinetic',
    projectileSpeed: 200,
    spread: 0.06,
    pros: ['Massive burst damage', 'Area effect', 'Good against groups'],
    cons: ['Low accuracy', 'Ammo limited', 'Reload time'],
    rarity: 'uncommon',
    manufacturer: 'ArmsCore',
    synergyTags: ['ballistic', 'explosive'],
    modelPath: '/models/arms/missile-pod.glb'
  },
  {
    id: 'arm-flamer',
    name: 'Type-7 Flamethrower',
    type: 'arm',
    weaponType: 'energy',
    icon: 'flamethrower',
    description: 'High-pressure napalm projector',
    stats: { health: 12, armor: 5, speed: 0, energy: -20, firepower: 240, accuracy: 12 },
    weight: 9,
    powerDraw: 20,
    fireRate: 0.4,
    // Short-range energy shredder + area denial. Slow wide cone, applies burn DoT.
    damageType: 'energy',
    projectileSpeed: 120,
    spread: 0.12,
    appliesBurn: true,
    pros: ['Area denial', 'No ammo', 'Persistent damage'],
    cons: ['Very short range', 'High energy use', 'Collateral damage'],
    rarity: 'common',
    manufacturer: 'InfernoTech',
    synergyTags: ['energy', 'area-effect'],
    modelPath: '/models/arms/flamethrower.glb'
  },
  {
    id: 'arm-shield-gen',
    name: 'Aegis Shield Generator',
    type: 'arm',
    weaponType: 'support',
    icon: 'shield-gen',
    description: 'Directional energy shield projector',
    stats: { health: 15, armor: 25, speed: -3, energy: -25, firepower: 0, accuracy: 0 },
    weight: 7,
    powerDraw: 0, // raising the block is free; power is spent per damage blocked in takeDamage
    // Passive energy resistance on top of the held directional block (see MechEntity shield handling).
    resistances: { energy: 0.2 },
    pros: ['Blocks incoming fire', 'Energy resistant', 'Regenerates'],
    cons: ['No offensive capability', 'High energy drain', 'Directional only'],
    rarity: 'rare',
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'defensive'],
    modelPath: '/models/arms/shield-generator.glb'
  }
]

// ============================================================================
// CORE PARTS
// ============================================================================

export const CORE_PARTS: CorePart[] = [
  {
    id: 'core-striker-lean',
    name: 'Striker Lean Core',
    type: 'core',
    icon: 'diesel-gen',
    description: 'Slim forward-leaning torso with a red chest intake, gold-trimmed sternum and square shoulder mounts for an aggressive stance.',
    stats: { health: -10, armor: -6, speed: 6, energy: 55, firepower: 6, accuracy: 4 },
    weight: 28,
    powerOutput: 55,
    slots: 2,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/core/core-striker-lean.glb'
  },
  {
    id: 'core-juggernaut-bastion',
    name: 'Juggernaut Bastion Core',
    type: 'core',
    icon: 'diesel-gen',
    description: 'A thick tiered torso crowned with massive layered pauldrons and a big glowing red central intake vent, plus a back heat-sink spine — brutal, top-heavy mass.',
    stats: { health: 48, armor: 40, speed: -16, energy: 60, firepower: 6, accuracy: 0 },
    weight: 48,
    powerOutput: 60,
    slots: 2,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'legendary',
    manufacturer: 'Foundry',
    modelPath: '/models/core/core-juggernaut-bastion.glb'
  },
  {
    id: 'core-sentinel-heraldic',
    name: 'Sentinel Heraldic Torso',
    type: 'core',
    icon: 'diesel-gen',
    description: 'A broad gold-trimmed breastplate bearing a red-field, gold-cross heraldic crest with a glowing amber core, flanked by red intake vents and a reinforced spine block.',
    stats: { health: 40, armor: 17, speed: -2, energy: 65, firepower: 4, accuracy: 0 },
    weight: 34,
    powerOutput: 65,
    slots: 2,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/core/core-sentinel-heraldic.glb'
  },
  {
    id: 'core-mantis-thorax',
    name: 'Mantis Thorax Carapace',
    type: 'core',
    icon: 'diesel-gen',
    description: 'A low, forward-pitched insectoid thorax with a segmented dorsal scute ridge, red chest intake grille, and glowing spinal sensor strip.',
    stats: { health: 10, armor: 6, speed: 2, energy: 50, firepower: 2, accuracy: 1 },
    weight: 9,
    powerOutput: 50,
    slots: 2,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/core/core-mantis-thorax.glb'
  },
  {
    id: 'core-valkyrie-intake',
    name: 'Valkyrie Intake Torso',
    type: 'core',
    icon: 'diesel-gen',
    description: 'A tapered aerodynamic breastplate with a recessed central air-intake grille, flanking side cooling ducts, red collarbone slashes and gold piping. Wide shoulder yoke feeds the arm mounts.',
    stats: { health: 60, armor: 22, speed: 10, energy: 70, firepower: 6, accuracy: 8 },
    weight: 34,
    powerOutput: 70,
    slots: 2,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/core/core-valkyrie-intake.glb'
  },
  {
    id: 'core-harrier-raider',
    name: 'Harrier Raider Core',
    type: 'core',
    icon: 'diesel-gen',
    description: 'Compact forward-pitched raider torso with a red chest intake and gold-trimmed sternum. Light and nimble over heavily armored.',
    stats: { health: 110, armor: 16, speed: 10, energy: 55, firepower: 6, accuracy: 6 },
    weight: 18,
    powerOutput: 55,
    slots: 2,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/core/core-harrier-raider.glb'
  },

  {
    id: 'core-diesel-gen',
    name: 'D9 Diesel Generator',
    type: 'core',
    icon: 'diesel-gen',
    description: 'Reliable diesel-electric hybrid core',
    stats: { health: 100, armor: 25, speed: 0, energy: 50, firepower: 0, accuracy: 0 },
    weight: 35,
    pros: ['Reliable', 'Easy maintenance', 'Balanced output'],
    cons: ['Moderate energy', 'No special features'],
    rarity: 'common',
    powerOutput: 50,
    slots: 2,
    manufacturer: 'PowerGen',
    synergyTags: ['balanced'],
    modelPath: '/models/core/diesel-generator.glb'
  },
  {
    id: 'core-fusion',
    name: 'FR-12 Fusion Reactor',
    type: 'core',
    icon: 'fusion-reactor',
    description: 'Compact fusion reactor with massive output',
    stats: { health: 120, armor: 20, speed: -10, energy: 100, firepower: 0, accuracy: 0 },
    weight: 50,
    pros: ['Massive energy', 'Powers heavy weapons', '4 equipment slots'],
    cons: ['Heavy', 'Reduced speed', 'Radiation shielding required'],
    rarity: 'legendary',
    powerOutput: 100,
    slots: 4,
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'heavy'],
    modelPath: '/models/core/fusion-reactor.glb'
  },
  {
    id: 'core-gas-turbine',
    name: 'GT-440 Gas Turbine',
    type: 'core',
    icon: 'gas-turbine',
    description: 'High-RPM turbine for mobility-focused builds',
    stats: { health: 80, armor: 15, speed: 15, energy: 40, firepower: 0, accuracy: 0 },
    weight: 28,
    pros: ['Lightweight', 'Speed boost', 'Quick startup'],
    cons: ['Lower energy output', 'Fragile', 'Fuel inefficient'],
    rarity: 'uncommon',
    powerOutput: 40,
    slots: 2,
    manufacturer: 'SwiftDrive',
    synergyTags: ['mobility', 'light'],
    modelPath: '/models/core/gas-turbine.glb'
  },
  {
    id: 'core-capacitor-bank',
    name: 'C-Series Capacitor Bank',
    type: 'core',
    icon: 'capacitor-bank',
    description: 'Ultra-capacitor array for burst power delivery',
    stats: { health: 90, armor: 18, speed: 0, energy: 70, firepower: 5, accuracy: 0 },
    weight: 30,
    pros: ['High burst output', 'Energy weapon bonus', 'Fast recharge'],
    cons: ['No sustained output', 'Requires downtime', 'Expensive'],
    rarity: 'rare',
    powerOutput: 70,
    slots: 3,
    manufacturer: 'VoltTech',
    synergyTags: ['energy', 'burst'],
    modelPath: '/models/core/capacitor-bank.glb'
  }
]

// ============================================================================
// LEGS PARTS
// ============================================================================

export const LEGS_PARTS: LegsPart[] = [
  {
    id: 'legs-wraith-rj',
    name: 'Wraith Reverse-Joint',
    type: 'legs',
    mobilityType: 'bipedal',
    icon: 'bipedal',
    description: 'Digitigrade chicken-walker frame — fast, agile, light on armor',
    stats: { health: 60, armor: 10, speed: 22, energy: 0, firepower: 0, accuracy: 8 },
    weight: 14,
    powerCapacity: 95,
    pros: ['High mobility', 'Excellent acceleration', 'Agile dodging'],
    cons: ['Light armor', 'Less stable firing platform'],
    rarity: 'uncommon',
    manufacturer: 'Nightsteel',
    modelPath: '/models/legs/wraith-rj.glb'
  },
  {
    id: 'legs-striker-skirmisher',
    name: 'Striker Skirmisher Legs',
    type: 'legs',
    icon: 'bipedal',
    description: 'Slim reverse-knee digitigrade legs built for speed, with red knee guards, gold shin slashes and forward talon toes.',
    stats: { health: -20, armor: -4, speed: 14, energy: 4, firepower: 0, accuracy: 2 },
    weight: 22,
    mobilityType: 'bipedal',
    powerCapacity: 100,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/legs/legs-striker-skirmisher.glb'
  },
  {
    id: 'legs-juggernaut-heavy',
    name: 'Juggernaut Heavy Legs',
    type: 'legs',
    icon: 'bipedal',
    description: 'Stubby, powerful bipedal legs on broad clawed feet with red shin intakes and a wide planted stance — built for a hulking heavy-assault frame.',
    stats: { health: 40, armor: 32, speed: -14, energy: -4, firepower: 0, accuracy: -2 },
    weight: 42,
    mobilityType: 'bipedal',
    powerCapacity: 100,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/legs/legs-juggernaut-heavy.glb'
  },
  {
    id: 'legs-sentinel-guardian',
    name: 'Sentinel Guardian Legs',
    type: 'legs',
    icon: 'bipedal',
    description: 'Broad, planted knightly legs with gold-trimmed thigh and shin plates, heraldic knee guards, red cooling vents and heavy toe-capped feet for a rock-stable stance.',
    stats: { health: 32, armor: 15, speed: -6, energy: 2, firepower: 0, accuracy: 0 },
    weight: 30,
    mobilityType: 'bipedal',
    powerCapacity: 100,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/legs/legs-sentinel-guardian.glb'
  },
  {
    id: 'legs-mantis-raptor',
    name: 'Mantis Raptor Legs',
    type: 'legs',
    icon: 'bipedal',
    description: 'Sharp reverse-joint digitigrade raptor legs with splayed talon feet, a rear killing dew-spur, and exposed shin pistons — built for speed over armor.',
    stats: { health: -4, armor: -3, speed: 9, energy: 2, firepower: 0, accuracy: 3 },
    weight: 7,
    mobilityType: 'bipedal',
    powerCapacity: 100,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/legs/legs-mantis-raptor.glb'
  },
  {
    id: 'legs-valkyrie-thruster',
    name: 'Valkyrie Thruster Legs',
    type: 'legs',
    icon: 'bipedal',
    description: 'Aerospace-interceptor legs built as downward hover pods with amber nozzle jets, swept calf thruster fins with gold-edged blades, and a slim frame pelvis yoke. Feet plant on the ground for a poised hover-ready stance.',
    stats: { health: 30, armor: 8, speed: 22, energy: 14, firepower: 0, accuracy: 4 },
    weight: 26,
    mobilityType: 'bipedal',
    powerCapacity: 100,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/legs/legs-valkyrie-thruster.glb'
  },
  {
    id: 'legs-harrier-rj',
    name: 'Harrier RJ Legs',
    type: 'legs',
    icon: 'bipedal',
    description: 'Exaggerated reverse-joint chicken-walker legs: knee-forward, ankle-back, splayed talon feet with rear heel spurs and exposed twin extensor pistons. Fast, agile, lightly armored.',
    stats: { health: 80, armor: 10, speed: 34, energy: 8, firepower: 0, accuracy: 4 },
    weight: 22,
    mobilityType: 'bipedal',
    powerCapacity: 100,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/legs/legs-harrier-rj.glb'
  },

  {
    id: 'legs-bipedal-standard',
    name: 'Standard Bipedal Frame',
    type: 'legs',
    mobilityType: 'bipedal',
    icon: 'bipedal',
    description: 'Standard two-legged walker configuration',
    stats: { health: 80, armor: 20, speed: 10, energy: 0, firepower: 0, accuracy: 5 },
    weight: 20,
    powerCapacity: 100,
    pros: ['Balanced mobility', 'Good stability', 'All-terrain'],
    cons: ['Nothing exceptional', 'Average speed'],
    rarity: 'common',
    manufacturer: 'GenMech',
    synergyTags: ['balanced'],
    modelPath: '/models/legs/bipedal-standard.glb'
  },
  {
    id: 'legs-tracked-heavy',
    name: 'T-90 Heavy Tracks',
    type: 'legs',
    mobilityType: 'tracked',
    icon: 'tracked',
    description: 'Military-grade tank treads for maximum stability',
    stats: { health: 120, armor: 40, speed: -5, energy: 0, firepower: 0, accuracy: 10 },
    weight: 30,
    powerCapacity: 120,
    // Tracked/reinforced = kinetic-resistant, energy-weak (design §3.2).
    resistances: { kinetic: 0.25, energy: -0.2 },
    pros: ['Extreme stability', 'Heavy armor', 'Perfect firing platform'],
    cons: ['Slow', 'Difficult terrain penalties', 'Heavy'],
    rarity: 'uncommon',
    manufacturer: 'ArmorWorks',
    synergyTags: ['heavy', 'defensive'],
    modelPath: '/models/legs/tracked-heavy.glb'
  },
  {
    id: 'legs-hover',
    name: 'Graviton Hover System',
    type: 'legs',
    mobilityType: 'hover',
    icon: 'hover',
    description: 'Anti-gravity propulsion for maximum mobility',
    stats: { health: 50, armor: 10, speed: 25, energy: -20, firepower: 0, accuracy: -5 },
    weight: 15,
    powerCapacity: 80,
    // Hover/scout = energy-resistant, kinetic-weak (design §3.2).
    resistances: { energy: 0.25, kinetic: -0.2 },
    pros: ['Very fast', 'Ignores terrain', 'Evasion bonus'],
    cons: ['Fragile', 'Energy drain', 'Unstable firing platform'],
    rarity: 'rare',
    manufacturer: 'SwiftDrive',
    synergyTags: ['mobility', 'light'],
    modelPath: '/models/legs/hover-system.glb'
  },
  {
    id: 'legs-quad',
    name: 'Quadrupedal Chassis',
    type: 'legs',
    mobilityType: 'quadrupedal',
    icon: 'quadrupedal',
    description: 'Four-legged walker for rough terrain',
    stats: { health: 100, armor: 25, speed: 8, energy: 0, firepower: 0, accuracy: 8 },
    weight: 25,
    powerCapacity: 110,
    // Stable heavy platform: mild kinetic resistance.
    resistances: { kinetic: 0.1 },
    pros: ['Very stable', 'Excellent terrain handling', 'Good load capacity'],
    cons: ['Complex mechanics', 'Maintenance intensive', 'Slower than bipedal'],
    rarity: 'uncommon',
    manufacturer: 'TitanForge',
    synergyTags: ['stability', 'heavy'],
    modelPath: '/models/legs/quadrupedal.glb'
  }
]

// ============================================================================
// HEAD PARTS
// ============================================================================

export const HEAD_PARTS: HeadPart[] = [
  {
    id: 'head-striker-visor',
    name: 'Striker Visor Head',
    type: 'head',
    icon: 'standard-optics',
    description: 'Narrow angular helmet with a single glowing amber visor slit, cheek vents and a swept red sensor crest.',
    stats: { health: -2, armor: -1, speed: 3, energy: 2, firepower: 2, accuracy: 10 },
    weight: 6,
    sensorRange: 500,
    targetingBonus: 10,
    targetingConeAngle: 15,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'uncommon',
    manufacturer: 'Foundry',
    modelPath: '/models/head/head-striker-visor.glb'
  },
  {
    id: 'head-juggernaut-bunker',
    name: 'Juggernaut Bunker Head',
    type: 'head',
    icon: 'standard-optics',
    description: 'A small, heavily recessed skull with a cowl brow and a single amber optic band, sunk low to sit between towering shoulders.',
    stats: { health: 8, armor: 10, speed: -1, energy: 0, firepower: 0, accuracy: 6 },
    weight: 8,
    sensorRange: 500,
    targetingBonus: 6,
    targetingConeAngle: 15,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'uncommon',
    manufacturer: 'Foundry',
    modelPath: '/models/head/head-juggernaut-bunker.glb'
  },
  {
    id: 'head-sentinel-helm',
    name: 'Sentinel Crested Helm',
    type: 'head',
    icon: 'standard-optics',
    description: 'An upright knightly helm with a gold brow band, cheek guards and a glowing amber T-visor, crowned by a tall red-and-gold crest fin.',
    stats: { health: 6, armor: 4, speed: 0, energy: 4, firepower: 0, accuracy: 11 },
    weight: 8,
    sensorRange: 500,
    targetingBonus: 11,
    targetingConeAngle: 15,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/head/head-sentinel-helm.glb'
  },
  {
    id: 'head-mantis-clustered',
    name: 'Mantis Clustered Head',
    type: 'head',
    icon: 'standard-optics',
    description: 'A small mandibled skull with a cluster of amber compound glow-eyes and twin sensor antennae for sharp target acquisition.',
    stats: { health: 2, armor: 1, speed: 1, energy: 2, firepower: 1, accuracy: 8 },
    weight: 3,
    sensorRange: 500,
    targetingBonus: 8,
    targetingConeAngle: 15,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/head/head-mantis-clustered.glb'
  },
  {
    id: 'head-valkyrie-canopy',
    name: 'Valkyrie Canopy Head',
    type: 'head',
    icon: 'standard-optics',
    description: 'A jet-fighter cockpit head: tinted swept canopy glass, a glowing amber sensor visor beneath the lip, a nose pitot fin, rear crest fin and cheek intakes.',
    stats: { health: 12, armor: 4, speed: 6, energy: 8, firepower: 2, accuracy: 20 },
    weight: 8,
    sensorRange: 500,
    targetingBonus: 20,
    targetingConeAngle: 15,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/head/head-valkyrie-canopy.glb'
  },
  {
    id: 'head-harrier-visor',
    name: 'Harrier Visor Head',
    type: 'head',
    icon: 'standard-optics',
    description: 'Slim angular helm with a single glowing amber optic in a dark visor recess, swept sensor crest and antenna. Boosts targeting.',
    stats: { health: 26, armor: 4, speed: 3, energy: 4, firepower: 0, accuracy: 16 },
    weight: 5,
    sensorRange: 500,
    targetingBonus: 16,
    targetingConeAngle: 15,
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'uncommon',
    manufacturer: 'Foundry',
    modelPath: '/models/head/head-harrier-visor.glb'
  },

  {
    id: 'head-standard-optics',
    name: 'Standard Optics Package',
    type: 'head',
    icon: 'standard-optics',
    description: 'Basic visual and thermal sensors',
    stats: { health: 30, armor: 10, speed: 0, energy: -5, firepower: 0, accuracy: 10 },
    weight: 8,
    pros: ['Reliable', 'Low cost', 'Good visibility'],
    cons: ['Basic sensors', 'No advanced targeting'],
    rarity: 'common',
    manufacturer: 'GenMech',
    sensorRange: 500,
    targetingBonus: 10,
    targetingConeAngle: 15,
    synergyTags: ['balanced'],
    modelPath: '/models/head/standard-optics.glb'
  },
  {
    id: 'head-targeting-array',
    name: 'Advanced Targeting Array',
    type: 'head',
    icon: 'targeting-array',
    description: 'Military-grade fire control system',
    stats: { health: 25, armor: 8, speed: 0, energy: -15, firepower: 0, accuracy: 25 },
    weight: 10,
    pros: ['Excellent accuracy', 'Target tracking', 'Weak point detection'],
    cons: ['Fragile', 'High energy use', 'Expensive'],
    rarity: 'rare',
    manufacturer: 'VoltTech',
    sensorRange: 800,
    targetingBonus: 25,
    targetingConeAngle: 25,
    synergyTags: ['precision', 'energy'],
    modelPath: '/models/head/targeting-array.glb'
  },
  {
    id: 'head-reinforced',
    name: 'Reinforced Command Pod',
    type: 'head',
    icon: 'reinforced',
    description: 'Heavily armored cockpit for survivability',
    stats: { health: 60, armor: 30, speed: 0, energy: 0, firepower: 0, accuracy: 5 },
    weight: 15,
    // Reinforced = kinetic-resistant, slightly energy-weak (design §3.2).
    resistances: { kinetic: 0.2, energy: -0.05 },
    pros: ['Very durable', 'Pilot protection', 'EMP resistant'],
    cons: ['Limited sensors', 'Heavy', 'Reduced visibility'],
    rarity: 'uncommon',
    manufacturer: 'ArmorWorks',
    sensorRange: 350,
    targetingBonus: 5,
    targetingConeAngle: 10,
    synergyTags: ['defensive', 'heavy'],
    modelPath: '/models/head/reinforced-pod.glb'
  },
  {
    id: 'head-scout-suite',
    name: 'Scout Sensor Suite',
    type: 'head',
    icon: 'scout-suite',
    description: 'Long-range reconnaissance sensors',
    stats: { health: 20, armor: 5, speed: 5, energy: -10, firepower: 0, accuracy: 15 },
    weight: 5,
    // Scout = energy-resistant, kinetic-weak (design §3.2).
    resistances: { energy: 0.15, kinetic: -0.15 },
    pros: ['Extended range', 'Multi-spectrum', 'Threat detection'],
    cons: ['Very fragile', 'No armor', 'Vulnerable to EMP'],
    rarity: 'uncommon',
    manufacturer: 'SwiftDrive',
    sensorRange: 1200,
    targetingBonus: 15,
    targetingConeAngle: 20,
    synergyTags: ['mobility', 'light'],
    modelPath: '/models/head/scout-suite.glb'
  }
]

// ============================================================================
// RACK PARTS
// ============================================================================

export const RACK_PARTS: RackPart[] = [
  {
    id: 'rack-striker-thrusterfins',
    name: 'Striker Thruster Fins',
    type: 'rack',
    icon: 'smoke-launcher',
    description: 'Back-mounted pack with two swept thruster fins, cooling vents and amber nozzle glows for burst mobility.',
    stats: { health: -4, armor: -1, speed: 12, energy: 10, firepower: 0, accuracy: 2 },
    weight: 10,
    specialAbility: 'Striker Thruster Fins',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'uncommon',
    manufacturer: 'Foundry',
    modelPath: '/models/rack/rack-striker-thrusterfins.glb'
  },
  {
    id: 'rack-juggernaut-missile',
    name: 'Juggernaut Twin Missile Pods',
    type: 'rack',
    icon: 'smoke-launcher',
    description: 'Twin boxy back-mounted missile pods on an armored bracket, each a 3x2 tube grid with amber targeting lights — saturating indirect firepower.',
    stats: { health: 10, armor: 8, speed: -6, energy: -8, firepower: 28, accuracy: 4 },
    weight: 26,
    specialAbility: 'Juggernaut Twin Missile Pods',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/rack/rack-juggernaut-missile.glb'
  },
  {
    id: 'rack-sentinel-banner',
    name: 'Sentinel Banner Pack',
    type: 'rack',
    icon: 'smoke-launcher',
    description: 'A back-mounted booster pack flying a twin-poled heraldic banner (red field, gold cross) with gold finials and amber vernier thrusters below.',
    stats: { health: 8, armor: 4, speed: -2, energy: 10, firepower: 0, accuracy: 0 },
    weight: 12,
    specialAbility: 'Sentinel Banner Pack',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'uncommon',
    manufacturer: 'Foundry',
    modelPath: '/models/rack/rack-sentinel-banner.glb'
  },
  {
    id: 'rack-mantis-carapace',
    name: 'Mantis Carapace Rack',
    type: 'rack',
    icon: 'smoke-launcher',
    description: 'A segmented dorsal carapace with folded elytra wing-cases, gold spine crests, and an amber-glow thruster cluster with twin exhaust nozzles.',
    stats: { health: 3, armor: 5, speed: 4, energy: 5, firepower: 0, accuracy: 1 },
    weight: 6,
    specialAbility: 'Mantis Carapace Rack',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/rack/rack-mantis-carapace.glb'
  },
  {
    id: 'rack-valkyrie-wing',
    name: 'Valkyrie Swept-Wing Pack',
    type: 'rack',
    icon: 'smoke-launcher',
    description: 'A large back-mounted flight pack: raked twin wing blades with gold leading edges and red ailerons, twin rearward main thrusters and wing-root hover boosters, all glowing amber.',
    stats: { health: 20, armor: 6, speed: 26, energy: 24, firepower: 8, accuracy: 6 },
    weight: 30,
    specialAbility: 'Valkyrie Swept-Wing Pack',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'legendary',
    manufacturer: 'Foundry',
    modelPath: '/models/rack/rack-valkyrie-wing.glb'
  },
  {
    id: 'rack-harrier-boosters',
    name: 'Harrier Twin Boosters',
    type: 'rack',
    icon: 'smoke-launcher',
    description: 'Back-mounted twin-thruster booster pack with angled amber nozzles and a rear exhaust grille. Big speed and energy for raid dashes.',
    stats: { health: 30, armor: 4, speed: 22, energy: 20, firepower: 0, accuracy: 2 },
    weight: 9,
    specialAbility: 'Harrier Twin Boosters',
    pros: ['Bespoke frame part', 'Distinct silhouette'],
    cons: ['Experimental'],
    rarity: 'rare',
    manufacturer: 'Foundry',
    modelPath: '/models/rack/rack-harrier-boosters.glb'
  },

  {
    id: 'rack-smoke-launcher',
    name: 'Smoke Launcher System',
    type: 'rack',
    icon: 'smoke-launcher',
    description: 'Deploys smoke screens for cover',
    stats: { health: 5, armor: 0, speed: 0, energy: 0, firepower: 0, accuracy: -5 },
    weight: 8,
    pros: ['Breaks lock-on', 'Concealment', 'Escape tool'],
    cons: ['Obscures own vision', 'Limited charges'],
    rarity: 'common',
    manufacturer: 'TacticalSys',
    specialAbility: 'Deploy smoke screen (3 charges)',
    synergyTags: ['tactical', 'defensive'],
    modelPath: '/models/rack/smoke-launcher.glb'
  },
  {
    id: 'rack-ammo-feed',
    name: 'Extended Ammo Feed',
    type: 'rack',
    icon: 'ammo-feed',
    description: 'Additional ammunition storage and feed system',
    stats: { health: 10, armor: 5, speed: -3, energy: 0, firepower: 10, accuracy: 0 },
    weight: 12,
    pros: ['More ammo', 'Sustained fire', 'Faster reload'],
    cons: ['Heavy', 'Explosive if hit', 'Only helps ballistic weapons'],
    rarity: 'uncommon',
    manufacturer: 'ArmsCore',
    specialAbility: '+50% ammo capacity for ballistic weapons',
    synergyTags: ['ballistic', 'heavy'],
    modelPath: '/models/rack/ammo-feed.glb'
  },
  {
    id: 'rack-jump-jets',
    name: 'Jump Jet Pack',
    type: 'rack',
    icon: 'jump-jets',
    description: 'Short-burst rockets for vertical mobility',
    stats: { health: 8, armor: 0, speed: 15, energy: -15, firepower: 0, accuracy: 0 },
    weight: 10,
    pros: ['Vertical mobility', 'Obstacle clearing', 'Repositioning'],
    cons: ['Energy drain', 'Limited fuel', 'Unstable when firing'],
    rarity: 'rare',
    manufacturer: 'SwiftDrive',
    specialAbility: 'Short vertical jumps (recharge 10s)',
    synergyTags: ['mobility', 'light'],
    modelPath: '/models/rack/jump-jets.glb'
  },
  {
    id: 'rack-repair-drone',
    name: 'Auto-Repair Drone Bay',
    type: 'rack',
    icon: 'repair-drone',
    description: 'Autonomous repair drones for field maintenance',
    stats: { health: 15, armor: 5, speed: 0, energy: -10, firepower: 0, accuracy: 0 },
    weight: 15,
    pros: ['Passive healing', 'Repairs all components', 'Long duration'],
    cons: ['Slow repair rate', 'Energy drain', 'Vulnerable drones'],
    rarity: 'legendary',
    manufacturer: 'GenMech',
    specialAbility: 'Restore 5 HP/sec when out of combat',
    synergyTags: ['support', 'defensive'],
    modelPath: '/models/rack/repair-drone.glb'
  }
]

// ============================================================================
// SYNERGIES
// ============================================================================

export const SYNERGIES: SynergyEffect[] = [
  {
    id: 'heavy-assault',
    name: 'Heavy Assault Platform',
    description: 'Reinforced chassis and heavy weapons create a devastating tank',
    icon: 'synergy-shield',
    requiredParts: ['core-fusion', 'legs-tracked-heavy'],
    statBonus: { health: 50, armor: 30 },
    specialEffect: 'Reduced terrain penalties'
  },
  {
    id: 'dual-ballistic',
    name: 'Dual Ballistic Weapons',
    description: 'Matched ballistic weapons improve fire coordination',
    icon: 'synergy-target',
    requiredParts: ['arm-autocannon-mk1', 'arm-autocannon-mk1'],
    statBonus: { accuracy: 20, firepower: 15 },
    specialEffect: 'Synchronized fire mode available'
  },
  {
    id: 'volttech-suite',
    name: 'VoltTech Integration',
    description: 'VoltTech components operate with peak efficiency together',
    icon: 'capacitor-bank',
    requiredParts: ['core-fusion', 'arm-railgun', 'head-targeting-array'],
    statBonus: { energy: 20, accuracy: 25 },
    specialEffect: 'Energy weapons recharge 30% faster'
  },
  {
    id: 'scout-config',
    name: 'Scout Configuration',
    description: 'Light, fast build optimized for reconnaissance',
    icon: 'scout',
    requiredParts: ['legs-hover', 'head-scout-suite', 'core-gas-turbine'],
    statBonus: { speed: 20, accuracy: 10 },
    specialEffect: 'Extended sensor range and evasion bonus'
  },
  {
    id: 'melee-brawler',
    name: 'Melee Brawler',
    description: 'Heavy armor and melee weapons for close combat',
    icon: 'fist',
    requiredParts: ['arm-pile-driver', 'legs-quad', 'head-reinforced'],
    statBonus: { health: 40, armor: 25, firepower: 20 },
    specialEffect: 'Melee damage increased, charge attack unlocked'
  },
  {
    id: 'missile-barrage',
    name: 'Missile Barrage',
    description: 'Dual missile systems with extended ammunition',
    icon: 'explosion',
    requiredParts: ['arm-missile-pod', 'arm-missile-pod', 'rack-ammo-feed'],
    statBonus: { firepower: 30, accuracy: 10 },
    specialEffect: 'Salvo mode: Fire all missiles simultaneously'
  },
  {
    id: 'energy-fortress',
    name: 'Energy Fortress',
    description: 'Shield generator and high energy output for defense',
    icon: 'synergy-fortress',
    requiredParts: ['arm-shield-gen', 'core-capacitor-bank'],
    statBonus: { armor: 35, energy: 25 },
    specialEffect: 'Shield regenerates twice as fast'
  }
]

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

/** All parts combined for easy lookup */
export const ALL_PARTS = [
  ...ARM_PARTS,
  ...CORE_PARTS,
  ...LEGS_PARTS,
  ...HEAD_PARTS,
  ...RACK_PARTS
]

/**
 * Find a part by its ID
 */
export function findPartById(id: string) {
  return ALL_PARTS.find(part => part.id === id) ?? null
}

/**
 * Get all parts of a specific type
 */
export function getPartsByType(type: 'arm'): ArmPart[]
export function getPartsByType(type: 'core'): CorePart[]
export function getPartsByType(type: 'legs'): LegsPart[]
export function getPartsByType(type: 'head'): HeadPart[]
export function getPartsByType(type: 'rack'): RackPart[]
export function getPartsByType(type: string) {
  switch (type) {
    case 'arm': return ARM_PARTS
    case 'core': return CORE_PARTS
    case 'legs': return LEGS_PARTS
    case 'head': return HEAD_PARTS
    case 'rack': return RACK_PARTS
    default: return []
  }
}
