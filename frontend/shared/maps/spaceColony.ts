/**
 * Space Colony Interior - Enclosed megastructure with windows showing rotating planet
 * Low ceiling (40), indoor atmosphere with support columns and cargo areas
 * Windows along long walls use animated planet shader on frontend
 */
import type { MapDefinition } from '../types/MapDefinition';

const WALL_MAT = { color: '#374151', roughness: 0.5, metalness: 0.5, edgeColor: '#60a5fa' };
const COLUMN_MAT = { color: '#4b5563', roughness: 0.4, metalness: 0.6, edgeColor: '#93c5fd' };
const CARGO_MAT = { color: '#78350f', roughness: 0.8, metalness: 0.1, edgeColor: '#f59e0b' };
const WALKWAY_MAT = { color: '#6b7280', roughness: 0.6, metalness: 0.4, edgeColor: '#60a5fa' };
const WINDOW_MAT = { color: '#0c4a6e', roughness: 0.1, metalness: 0.0, emissive: '#38bdf8', emissiveIntensity: 0.3, edgeColor: '#7dd3fc', opacity: 0.8, transparent: true };

// Generate support columns every 30 units
function generateColumns(): MapDefinition['staticGeometry'] {
  const columns: MapDefinition['staticGeometry'] = [];
  const spacingX = 35;
  const spacingZ = 30;
  let idx = 0;
  for (let x = -105; x <= 105; x += spacingX) {
    for (let z = -60; z <= 60; z += spacingZ) {
      // Skip center area for gameplay space
      if (Math.abs(x) < 35 && Math.abs(z) < 30) continue;
      columns.push({
        id: `col_${idx++}`,
        type: 'cylinder',
        position: [x, 20, z],
        radiusTop: 1.5,
        radiusBottom: 2,
        height: 40,
        collision: true,
        material: COLUMN_MAT,
      });
    }
  }
  return columns;
}

export const spaceColony: MapDefinition = {
  id: 'space_colony',
  name: 'Space Colony Interior',
  arena: { width: 280, depth: 200, floorY: 0, ceilingY: 40 },
  spawnPoints: [
    { position: [-110, 0, 0], facingAngle: 0, playerSlot: 0 },
    { position: [110, 0, 0], facingAngle: Math.PI, playerSlot: 1 },
  ],
  staticGeometry: [
    // === ENCLOSING WALLS ===
    // Long walls (along X axis)
    { id: 'wall_n', type: 'box', position: [0, 20, -100], size: [280, 40, 2], collision: true, material: WALL_MAT },
    { id: 'wall_s', type: 'box', position: [0, 20, 100], size: [280, 40, 2], collision: true, material: WALL_MAT },
    // Short walls (along Z axis)
    { id: 'wall_w', type: 'box', position: [-140, 20, 0], size: [2, 40, 200], collision: true, material: WALL_MAT },
    { id: 'wall_e', type: 'box', position: [140, 20, 0], size: [2, 40, 200], collision: true, material: WALL_MAT },
    // Ceiling
    { id: 'ceiling', type: 'box', position: [0, 40, 0], size: [280, 1, 200], collision: false, receiveShadow: true,
      material: { color: '#1f2937', roughness: 0.6, metalness: 0.4 } },

    // === WINDOWS along long walls (tagged for shader) ===
    { id: 'win_n1', type: 'plane', position: [-70, 22, -99], width: 40, height: 20, material: WINDOW_MAT, collision: false, tags: ['window'] },
    { id: 'win_n2', type: 'plane', position: [0, 22, -99], width: 40, height: 20, material: WINDOW_MAT, collision: false, tags: ['window'] },
    { id: 'win_n3', type: 'plane', position: [70, 22, -99], width: 40, height: 20, material: WINDOW_MAT, collision: false, tags: ['window'] },
    { id: 'win_s1', type: 'plane', position: [-70, 22, 99], width: 40, height: 20,
      rotation: [0, Math.PI, 0], material: WINDOW_MAT, collision: false, tags: ['window'] },
    { id: 'win_s2', type: 'plane', position: [0, 22, 99], width: 40, height: 20,
      rotation: [0, Math.PI, 0], material: WINDOW_MAT, collision: false, tags: ['window'] },
    { id: 'win_s3', type: 'plane', position: [70, 22, 99], width: 40, height: 20,
      rotation: [0, Math.PI, 0], material: WINDOW_MAT, collision: false, tags: ['window'] },

    // === SUPPORT COLUMNS ===
    ...generateColumns(),

    // === CARGO AREAS (stacked boxes in corners) ===
    // NW cargo cluster
    { id: 'cargo_nw1', type: 'box', position: [-110, 4, -75], size: [10, 8, 8], collision: true, castShadow: true, material: CARGO_MAT },
    { id: 'cargo_nw2', type: 'box', position: [-120, 3, -65], size: [8, 6, 8], collision: true, castShadow: true, material: CARGO_MAT },
    { id: 'cargo_nw3', type: 'box', position: [-105, 7, -80], size: [6, 6, 6], collision: true, castShadow: true, material: CARGO_MAT },
    // NE cargo cluster
    { id: 'cargo_ne1', type: 'box', position: [110, 4, -75], size: [10, 8, 8], collision: true, castShadow: true, material: CARGO_MAT },
    { id: 'cargo_ne2', type: 'box', position: [120, 3, -65], size: [8, 6, 8], collision: true, castShadow: true, material: CARGO_MAT },
    // SW cargo cluster
    { id: 'cargo_sw1', type: 'box', position: [-110, 4, 75], size: [10, 8, 8], collision: true, castShadow: true, material: CARGO_MAT },
    { id: 'cargo_sw2', type: 'box', position: [-120, 3, 65], size: [8, 6, 8], collision: true, castShadow: true, material: CARGO_MAT },
    // SE cargo cluster
    { id: 'cargo_se1', type: 'box', position: [110, 4, 75], size: [10, 8, 8], collision: true, castShadow: true, material: CARGO_MAT },
    { id: 'cargo_se2', type: 'box', position: [120, 3, 65], size: [8, 6, 8], collision: true, castShadow: true, material: CARGO_MAT },

    // === WALKWAYS at Y=10 and Y=20 along walls ===
    // Lower walkway (Y=10) along north wall
    { id: 'wk_n_low', type: 'box', position: [0, 10, -85], size: [200, 1, 10], collision: true, material: WALKWAY_MAT },
    // Upper walkway (Y=20) along south wall
    { id: 'wk_s_hi', type: 'box', position: [0, 20, 85], size: [200, 1, 10], collision: true, material: WALKWAY_MAT },

    // Ramps connecting walkways to ground
    { id: 'ramp_n_w', type: 'ramp', position: [-100, 0, -80], width: 8, height: 10, depth: 20,
      rotation: [0, Math.PI, 0], collision: true, material: WALKWAY_MAT },
    { id: 'ramp_n_e', type: 'ramp', position: [100, 0, -80], width: 8, height: 10, depth: 20,
      rotation: [0, Math.PI, 0], collision: true, material: WALKWAY_MAT },
    { id: 'ramp_s_w', type: 'ramp', position: [-100, 0, 80], width: 8, height: 20, depth: 30,
      collision: true, material: WALKWAY_MAT },
    { id: 'ramp_s_e', type: 'ramp', position: [100, 0, 80], width: 8, height: 20, depth: 30,
      collision: true, material: WALKWAY_MAT },

    // === CENTER STRUCTURES for cover ===
    { id: 'center1', type: 'box', position: [-25, 3.5, 0], size: [8, 7, 12], collision: true, castShadow: true, material: WALL_MAT },
    { id: 'center2', type: 'box', position: [25, 3.5, 0], size: [8, 7, 12], collision: true, castShadow: true, material: WALL_MAT },
    { id: 'center3', type: 'box', position: [0, 4, -30], size: [12, 8, 8], collision: true, castShadow: true, material: WALL_MAT },
    { id: 'center4', type: 'box', position: [0, 4, 30], size: [12, 8, 8], collision: true, castShadow: true, material: WALL_MAT },
  ],
  dynamicElements: [],
  hazardZones: [],
  environment: {
    skyType: 'none',
    ambientLightColor: '#94a3b8',
    ambientLightIntensity: 0.4,
    lights: [
      // Window light pools along north wall
      { type: 'point', color: '#38bdf8', intensity: 1.0, position: [-70, 15, -80], distance: 50 },
      { type: 'point', color: '#38bdf8', intensity: 1.0, position: [0, 15, -80], distance: 50 },
      { type: 'point', color: '#38bdf8', intensity: 1.0, position: [70, 15, -80], distance: 50 },
      // Window light pools along south wall
      { type: 'point', color: '#38bdf8', intensity: 1.0, position: [-70, 15, 80], distance: 50 },
      { type: 'point', color: '#38bdf8', intensity: 1.0, position: [0, 15, 80], distance: 50 },
      { type: 'point', color: '#38bdf8', intensity: 1.0, position: [70, 15, 80], distance: 50 },
      // General overhead
      { type: 'directional', color: '#e2e8f0', intensity: 0.3, position: [0, 39, 0], castShadow: true },
    ],
    floorMaterial: { color: '#334155', roughness: 0.3, metalness: 0.7, edgeColor: '#475569' },
    fog: { color: '#1e293b', near: 20, far: 180 },
    showGrid: false,
    showBoundaryWalls: false, // Walls are part of geometry
  },
};
