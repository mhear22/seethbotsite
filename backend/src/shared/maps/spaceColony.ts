/**
 * Space Colony Interior - Open area inside a rotating O'Neill cylinder
 * Halo-like ring world where you can see the curved landscape and distant planet
 * Uses ring_world sky type for immersive rotating colony effect
 */
import type { MapDefinition } from '../types/MapDefinition';

const WALL_MAT = { color: '#374151', roughness: 0.5, metalness: 0.5, edgeColor: '#60a5fa' };
const COLUMN_MAT = { color: '#4b5563', roughness: 0.4, metalness: 0.6, edgeColor: '#93c5fd' };
const CARGO_MAT = { color: '#78350f', roughness: 0.8, metalness: 0.1, edgeColor: '#f59e0b' };
const WALKWAY_MAT = { color: '#6b7280', roughness: 0.6, metalness: 0.4, edgeColor: '#60a5fa' };
const PLATFORM_MAT = { color: '#475569', roughness: 0.5, metalness: 0.6, edgeColor: '#38bdf8' };

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
  arena: { width: 280, depth: 200, floorY: 0, ceilingY: 1000 }, // High ceiling - open to the ring world sky
  spawnPoints: [
    { position: [-110, 0, 0], facingAngle: 0, playerSlot: 0 },
    { position: [110, 0, 0], facingAngle: Math.PI, playerSlot: 1 },
  ],
  staticGeometry: [
    // === BOUNDARY WALLS (lower, for gameplay containment) ===
    // Long walls (along X axis)
    { id: 'wall_n', type: 'box', position: [0, 10, -100], size: [280, 20, 2], collision: true, material: WALL_MAT },
    { id: 'wall_s', type: 'box', position: [0, 10, 100], size: [280, 20, 2], collision: true, material: WALL_MAT },
    // Short walls (along Z axis)
    { id: 'wall_w', type: 'box', position: [-140, 10, 0], size: [2, 20, 200], collision: true, material: WALL_MAT },
    { id: 'wall_e', type: 'box', position: [140, 10, 0], size: [2, 20, 200], collision: true, material: WALL_MAT },

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

    // === RAISED PLATFORMS (colony infrastructure) ===
    // Central landing pad
    { id: 'platform_center', type: 'box', position: [0, 2, 0], size: [40, 1, 40], collision: true, castShadow: true, receiveShadow: true, material: PLATFORM_MAT },
    // Ramps to central platform
    { id: 'ramp_n', type: 'ramp', position: [0, 0, -22], width: 10, height: 2, depth: 8, rotation: [0, 0, 0], collision: true, material: PLATFORM_MAT },
    { id: 'ramp_s', type: 'ramp', position: [0, 0, 22], width: 10, height: 2, depth: 8, rotation: [0, Math.PI, 0], collision: true, material: PLATFORM_MAT },
    { id: 'ramp_w', type: 'ramp', position: [-22, 0, 0], width: 8, height: 2, depth: 10, rotation: [0, Math.PI/2, 0], collision: true, material: PLATFORM_MAT },
    { id: 'ramp_e', type: 'ramp', position: [22, 0, 0], width: 8, height: 2, depth: 10, rotation: [0, -Math.PI/2, 0], collision: true, material: PLATFORM_MAT },

    // === WALKWAYS at Y=10 along walls ===
    // Lower walkway (Y=10) along north wall
    { id: 'wk_n_low', type: 'box', position: [0, 10, -85], size: [200, 1, 10], collision: true, material: WALKWAY_MAT },
    // Upper walkway (Y=15) along south wall
    { id: 'wk_s_hi', type: 'box', position: [0, 15, 85], size: [200, 1, 10], collision: true, material: WALKWAY_MAT },

    // Ramps connecting walkways to ground
    { id: 'ramp_n_w', type: 'ramp', position: [-100, 0, -80], width: 8, height: 10, depth: 20,
      rotation: [0, Math.PI, 0], collision: true, material: WALKWAY_MAT },
    { id: 'ramp_n_e', type: 'ramp', position: [100, 0, -80], width: 8, height: 10, depth: 20,
      rotation: [0, Math.PI, 0], collision: true, material: WALKWAY_MAT },
    { id: 'ramp_s_w', type: 'ramp', position: [-100, 0, 80], width: 8, height: 15, depth: 25,
      collision: true, material: WALKWAY_MAT },
    { id: 'ramp_s_e', type: 'ramp', position: [100, 0, 80], width: 8, height: 15, depth: 25,
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
    skyType: 'ring_world',
    ambientLightColor: '#64748b',
    ambientLightIntensity: 0.6,
    lights: [
      // Main sunlight (coming through ring windows)
      { type: 'directional', color: '#fff7ed', intensity: 0.8, position: [50, 100, 50], castShadow: true },
      // Fill light from opposite side
      { type: 'directional', color: '#e0f2fe', intensity: 0.3, position: [-50, 50, -50] },
      // Point lights around central platform
      { type: 'point', color: '#38bdf8', intensity: 0.8, position: [0, 8, 0], distance: 60 },
      // Accent lights along walkways
      { type: 'point', color: '#38bdf8', intensity: 0.5, position: [-70, 12, -85], distance: 40 },
      { type: 'point', color: '#38bdf8', intensity: 0.5, position: [70, 12, -85], distance: 40 },
      { type: 'point', color: '#38bdf8', intensity: 0.5, position: [-70, 17, 85], distance: 40 },
      { type: 'point', color: '#38bdf8', intensity: 0.5, position: [70, 17, 85], distance: 40 },
    ],
    floorMaterial: { color: '#334155', roughness: 0.3, metalness: 0.7, edgeColor: '#475569' },
    fog: { color: '#1e293b', near: 50, far: 250 },
    showGrid: false,
    showBoundaryWalls: false,
  },
};
