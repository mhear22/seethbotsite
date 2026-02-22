/**
 * Planetside Mega Factory - Industrial interior with dynamic elements
 * Conveyor belts push mechs, rotating crane arm, slamming pistons
 * Most complex map with moving hazards
 */
import type { MapDefinition } from '../types/MapDefinition';

const WALL_MAT = { color: '#44403c', roughness: 0.8, metalness: 0.3, edgeColor: '#f97316' };
const MACHINE_MAT = { color: '#57534e', roughness: 0.5, metalness: 0.6, edgeColor: '#fb923c' };
const CATWALK_MAT = { color: '#78716c', roughness: 0.6, metalness: 0.4, edgeColor: '#fdba74' };
const CONVEYOR_MAT = { color: '#292524', roughness: 0.4, metalness: 0.3, edgeColor: '#f97316' };
const CRANE_MAT = { color: '#a16207', roughness: 0.4, metalness: 0.7, edgeColor: '#fbbf24' };
const PISTON_MAT = { color: '#991b1b', roughness: 0.3, metalness: 0.8, edgeColor: '#ef4444' };

export const megaFactory: MapDefinition = {
  id: 'mega_factory',
  name: 'Planetside Mega Factory',
  arena: { width: 300, depth: 300, floorY: 0, ceilingY: 60 },
  spawnPoints: [
    { position: [-120, 0, -120], facingAngle: Math.PI / 4, playerSlot: 0 },
    { position: [120, 0, 120], facingAngle: -Math.PI * 3 / 4, playerSlot: 1 },
  ],
  staticGeometry: [
    // === ENCLOSING WALLS ===
    { id: 'fw_n', type: 'box', position: [0, 30, -150], size: [300, 60, 2], collision: true, material: WALL_MAT },
    { id: 'fw_s', type: 'box', position: [0, 30, 150], size: [300, 60, 2], collision: true, material: WALL_MAT },
    { id: 'fw_w', type: 'box', position: [-150, 30, 0], size: [2, 60, 300], collision: true, material: WALL_MAT },
    { id: 'fw_e', type: 'box', position: [150, 30, 0], size: [2, 60, 300], collision: true, material: WALL_MAT },
    // Ceiling
    { id: 'fw_ceil', type: 'box', position: [0, 60, 0], size: [300, 1, 300], collision: false,
      material: { color: '#292524', roughness: 0.7, metalness: 0.3 } },

    // === LARGE MACHINERY BLOCKS ===
    { id: 'mach1', type: 'box', position: [-80, 10, -60], size: [20, 20, 30], collision: true, castShadow: true, material: MACHINE_MAT },
    { id: 'mach2', type: 'box', position: [80, 12.5, -40], size: [15, 25, 15], collision: true, castShadow: true, material: MACHINE_MAT },
    { id: 'mach3', type: 'box', position: [-60, 15, 70], size: [25, 30, 20], collision: true, castShadow: true, material: MACHINE_MAT },
    { id: 'mach4', type: 'box', position: [70, 10, 80], size: [20, 20, 25], collision: true, castShadow: true, material: MACHINE_MAT },
    { id: 'mach5', type: 'box', position: [0, 7.5, 0], size: [15, 15, 15], collision: true, castShadow: true, material: MACHINE_MAT },
    { id: 'mach6', type: 'box', position: [-30, 20, -100], size: [18, 40, 15], collision: true, castShadow: true, material: MACHINE_MAT },
    { id: 'mach7', type: 'box', position: [40, 17.5, 100], size: [20, 35, 18], collision: true, castShadow: true, material: MACHINE_MAT },

    // === CATWALKS ===
    // Lower catwalk at Y=15
    { id: 'cat_low1', type: 'box', position: [-40, 15, 0], size: [80, 1, 6], collision: true, material: CATWALK_MAT },
    { id: 'cat_low2', type: 'box', position: [40, 15, 30], size: [6, 1, 60], collision: true, material: CATWALK_MAT },
    // Upper catwalk at Y=30
    { id: 'cat_hi1', type: 'box', position: [0, 30, -80], size: [120, 1, 6], collision: true, material: CATWALK_MAT },
    { id: 'cat_hi2', type: 'box', position: [-60, 30, 0], size: [6, 1, 80], collision: true, material: CATWALK_MAT },

    // Ramps to catwalks
    { id: 'ramp_low1', type: 'ramp', position: [-80, 0, -5], width: 6, height: 15, depth: 20,
      rotation: [0, Math.PI / 2, 0], collision: true, material: CATWALK_MAT },
    { id: 'ramp_low2', type: 'ramp', position: [40, 0, 60], width: 6, height: 15, depth: 20,
      rotation: [0, Math.PI, 0], collision: true, material: CATWALK_MAT },
    { id: 'ramp_hi1', type: 'ramp', position: [-60, 15, -40], width: 6, height: 15, depth: 25,
      rotation: [0, Math.PI, 0], collision: true, material: CATWALK_MAT },

    // === ADDITIONAL COVER ===
    { id: 'cover1', type: 'box', position: [-110, 4, 30], size: [10, 8, 10], collision: true, castShadow: true, material: MACHINE_MAT },
    { id: 'cover2', type: 'box', position: [110, 4, -30], size: [10, 8, 10], collision: true, castShadow: true, material: MACHINE_MAT },
    { id: 'cover3', type: 'box', position: [-20, 3, 50], size: [8, 6, 8], collision: true, castShadow: true, material: MACHINE_MAT },
    { id: 'cover4', type: 'box', position: [30, 3, -50], size: [8, 6, 8], collision: true, castShadow: true, material: MACHINE_MAT },

    // Piston mounting pillars (visual context for where pistons mount)
    { id: 'pil_p1', type: 'cylinder', position: [-40, 30, 40], radiusTop: 2, radiusBottom: 2, height: 60,
      collision: true, material: { color: '#44403c', roughness: 0.5, metalness: 0.6, edgeColor: '#ef4444' } },
    { id: 'pil_p2', type: 'cylinder', position: [50, 30, -70], radiusTop: 2, radiusBottom: 2, height: 60,
      collision: true, material: { color: '#44403c', roughness: 0.5, metalness: 0.6, edgeColor: '#ef4444' } },

    // === CEILING FLOODLIGHT FIXTURES ===
    // Industrial orange-white floods hanging from ceiling (Y=58)
    { id: 'flood_nw', type: 'box', position: [-80, 58, -60], size: [6, 2, 3],
      collision: false, castShadow: false,
      material: { color: '#ffddaa', roughness: 0.2, metalness: 0.7, emissive: '#ff8800', emissiveIntensity: 3.0 } },
    { id: 'flood_ne', type: 'box', position: [80, 58, -40], size: [6, 2, 3],
      collision: false, castShadow: false,
      material: { color: '#ffddaa', roughness: 0.2, metalness: 0.7, emissive: '#ff8800', emissiveIntensity: 3.0 } },
    { id: 'flood_sw', type: 'box', position: [-60, 58, 70], size: [6, 2, 3],
      collision: false, castShadow: false,
      material: { color: '#ffddaa', roughness: 0.2, metalness: 0.7, emissive: '#ff8800', emissiveIntensity: 3.0 } },
    { id: 'flood_se', type: 'box', position: [70, 58, 80], size: [6, 2, 3],
      collision: false, castShadow: false,
      material: { color: '#ffddaa', roughness: 0.2, metalness: 0.7, emissive: '#ff8800', emissiveIntensity: 3.0 } },
    { id: 'flood_center', type: 'box', position: [0, 58, 0], size: [8, 2, 4],
      collision: false, castShadow: false,
      material: { color: '#fff5cc', roughness: 0.2, metalness: 0.7, emissive: '#ffcc44', emissiveIntensity: 3.5 } },

    // === PISTON WARNING BEACONS (red rotating lights on top of piston pillars) ===
    { id: 'warn_p1', type: 'cylinder', position: [-40, 61.5, 40], radiusTop: 1.5, radiusBottom: 1.5, height: 2, segments: 10,
      collision: false, castShadow: false,
      material: { color: '#ff2200', roughness: 0.1, metalness: 0.5, emissive: '#ff1100', emissiveIntensity: 6.0 } },
    { id: 'warn_p2', type: 'cylinder', position: [50, 61.5, -70], radiusTop: 1.5, radiusBottom: 1.5, height: 2, segments: 10,
      collision: false, castShadow: false,
      material: { color: '#ff2200', roughness: 0.1, metalness: 0.5, emissive: '#ff1100', emissiveIntensity: 6.0 } },

    // === CATWALK STRIP LIGHTS (orange neon strips under catwalk edges) ===
    { id: 'strip_low1', type: 'box', position: [-40, 14.5, 0], size: [80, 0.3, 0.5],
      collision: false, castShadow: false,
      material: { color: '#ff7700', roughness: 0.1, metalness: 0.3, emissive: '#ff5500', emissiveIntensity: 3.0 } },
    { id: 'strip_hi1', type: 'box', position: [0, 29.5, -80], size: [120, 0.3, 0.5],
      collision: false, castShadow: false,
      material: { color: '#ffaa00', roughness: 0.1, metalness: 0.3, emissive: '#ff8800', emissiveIntensity: 3.0 } },

    // === MACHINERY INDICATOR LIGHTS (green status lights on big machines) ===
    { id: 'ind_mach1', type: 'box', position: [-80, 21, -60], size: [1.5, 1.5, 0.4],
      collision: false, castShadow: false,
      material: { color: '#00ff88', roughness: 0.1, metalness: 0.5, emissive: '#00cc66', emissiveIntensity: 5.0 } },
    { id: 'ind_mach2', type: 'box', position: [80, 25.5, -40], size: [1.5, 1.5, 0.4],
      collision: false, castShadow: false,
      material: { color: '#00ff88', roughness: 0.1, metalness: 0.5, emissive: '#00cc66', emissiveIntensity: 5.0 } },
    { id: 'ind_mach3', type: 'box', position: [-60, 31, 70], size: [0.4, 1.5, 1.5],
      collision: false, castShadow: false,
      material: { color: '#00ff88', roughness: 0.1, metalness: 0.5, emissive: '#00cc66', emissiveIntensity: 5.0 } },
  ],
  dynamicElements: [
    // === CONVEYOR BELTS ===
    {
      id: 'conv1',
      type: 'conveyor',
      position: [-100, 0.5, 0],
      size: [6, 1, 40],
      pushDirection: [0, 0, 1],
      pushSpeed: 8,
      material: CONVEYOR_MAT,
    },
    {
      id: 'conv2',
      type: 'conveyor',
      position: [100, 0.5, 20],
      size: [6, 1, 40],
      pushDirection: [0, 0, -1],
      pushSpeed: 8,
      material: CONVEYOR_MAT,
    },
    {
      id: 'conv3',
      type: 'conveyor',
      position: [0, 0.5, -120],
      rotation: [0, Math.PI / 2, 0],
      size: [6, 1, 40],
      pushDirection: [1, 0, 0],
      pushSpeed: 8,
      material: CONVEYOR_MAT,
    },

    // === ROTATING CRANE ARM ===
    {
      id: 'crane1',
      type: 'rotating',
      position: [0, 15, 40],
      shape: 'box',
      size: [30, 3, 3], // 30 unit long arm
      rotationAxis: 'y',
      rotationSpeed: 0.3, // ~20 seconds full rotation
      contactDamage: 10,
      material: CRANE_MAT,
    },

    // === PISTONS ===
    {
      id: 'piston1',
      type: 'piston',
      position: [-40, 30, 40],
      size: [8, 4, 8],
      direction: [0, -1, 0], // Slams down
      restPosition: [-40, 30, 40],
      extendDistance: 26, // Slams from Y=30 down to Y=4
      cycleDuration: 4,
      extendedFraction: 0.15,
      slamDamage: 30,
      material: PISTON_MAT,
    },
    {
      id: 'piston2',
      type: 'piston',
      position: [50, 30, -70],
      size: [8, 4, 8],
      direction: [0, -1, 0],
      restPosition: [50, 30, -70],
      extendDistance: 26,
      cycleDuration: 4.5, // Slightly different timing
      extendedFraction: 0.15,
      slamDamage: 30,
      material: PISTON_MAT,
    },
  ],
  hazardZones: [],
  environment: {
    skyType: 'none',
    ambientLightColor: '#fdba74',
    ambientLightIntensity: 0.35,
    lights: [
      { type: 'point', color: '#f97316', intensity: 1.5, position: [-80, 50, -60], distance: 100 },
      { type: 'point', color: '#f97316', intensity: 1.5, position: [80, 50, 60], distance: 100 },
      { type: 'point', color: '#fbbf24', intensity: 1.0, position: [0, 55, 0], distance: 120 },
      { type: 'point', color: '#ef4444', intensity: 0.8, position: [-40, 35, 40], distance: 40 },
      { type: 'point', color: '#ef4444', intensity: 0.8, position: [50, 35, -70], distance: 40 },
      { type: 'directional', color: '#fed7aa', intensity: 0.2, position: [0, 58, 0], castShadow: true },
      // Ceiling floodlight fills
      { type: 'point', color: '#ff8800', intensity: 3.0, position: [-80, 55, -60], distance: 90, decay: 2 },
      { type: 'point', color: '#ff8800', intensity: 3.0, position: [80, 55, -40], distance: 90, decay: 2 },
      { type: 'point', color: '#ff8800', intensity: 3.0, position: [-60, 55, 70], distance: 90, decay: 2 },
      { type: 'point', color: '#ff8800', intensity: 3.0, position: [70, 55, 80], distance: 90, decay: 2 },
      { type: 'point', color: '#ffcc44', intensity: 3.5, position: [0, 55, 0], distance: 100, decay: 2 },
      // Piston beacon glows
      { type: 'point', color: '#ff1100', intensity: 2.0, position: [-40, 62, 40], distance: 30, decay: 2 },
      { type: 'point', color: '#ff1100', intensity: 2.0, position: [50, 62, -70], distance: 30, decay: 2 },
      // Catwalk strip fills
      { type: 'point', color: '#ff5500', intensity: 1.0, position: [-40, 14, 0], distance: 50, decay: 2 },
      { type: 'point', color: '#ff8800', intensity: 1.0, position: [0, 29, -80], distance: 60, decay: 2 },
    ],
    floorMaterial: { color: '#3f3731', roughness: 0.9, metalness: 0.1, edgeColor: '#78716c' },
    fog: { color: '#292018', near: 30, far: 200 },
    showGrid: false,
    showBoundaryWalls: false,
  },
};
