/**
 * Reactor Core - Circular arena with central reactor cylinder
 * Periodic radiation pulse hazard forces players away from center
 * Tighter arena (250x250) for intense close-quarters combat
 */
import type { MapDefinition } from '../types/MapDefinition';

const WALL_MAT = { color: '#374151', roughness: 0.6, metalness: 0.4, edgeColor: '#10b981' };
const REACTOR_MAT = { color: '#065f46', roughness: 0.3, metalness: 0.7, emissive: '#10b981', emissiveIntensity: 0.5, edgeColor: '#34d399' };
const OUTER_MAT = { color: '#4b5563', roughness: 0.7, metalness: 0.3, edgeColor: '#6ee7b7' };

// Generate inner ring wall segments (8 segments around radius=25)
function generateInnerRing(): MapDefinition['staticGeometry'] {
  const segments: MapDefinition['staticGeometry'] = [];
  const count = 8;
  const radius = 25;
  for (let i = 0; i < count; i++) {
    // Leave gaps at 0, PI/2, PI, 3PI/2 (4 corridors)
    if (i % 2 === 0) continue;
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    segments.push({
      id: `inner_${i}`,
      type: 'box',
      position: [x, 7.5, z],
      size: [12, 15, 3],
      rotation: [0, angle + Math.PI / 2, 0],
      collision: true,
      castShadow: true,
      material: WALL_MAT,
    });
  }
  return segments;
}

// Generate outer scattered boxes
function generateOuterRing(): MapDefinition['staticGeometry'] {
  const boxes: MapDefinition['staticGeometry'] = [];
  const positions: [number, number][] = [
    [-60, -55], [-70, 10], [-50, 65], [-30, -75],
    [55, -60], [70, 15], [50, 70], [35, -70],
    [-15, -80], [20, 80], [-80, -30], [80, 40],
    [-40, 40], [45, -40], [-65, 55], [65, -55],
  ];
  positions.forEach(([x, z], i) => {
    const w = 6 + Math.abs((x * 7 + z * 3) % 8);
    const h = 6 + Math.abs((x * 3 + z * 7) % 10);
    const d = 6 + Math.abs((x * 5 + z * 5) % 8);
    boxes.push({
      id: `outer_${i}`,
      type: 'box',
      position: [x, h / 2, z],
      size: [w, h, d],
      collision: true,
      castShadow: true,
      material: OUTER_MAT,
    });
  });
  return boxes;
}

export const reactorCore: MapDefinition = {
  id: 'reactor_core',
  name: 'Reactor Core',
  arena: { width: 250, depth: 250, floorY: 0, ceilingY: 80 },
  spawnPoints: [
    { position: [-90, 0, 0], facingAngle: 0, playerSlot: 0 },
    { position: [90, 0, 0], facingAngle: Math.PI, playerSlot: 1 },
  ],
  staticGeometry: [
    // Central reactor cylinder
    { id: 'reactor', type: 'cylinder', position: [0, 30, 0], radiusTop: 15, radiusBottom: 15, height: 60,
      segments: 32, collision: true, castShadow: true, material: REACTOR_MAT, tags: ['reactor'] },

    // Reactor base ring
    { id: 'reactor_base', type: 'cylinder', position: [0, 2, 0], radiusTop: 18, radiusBottom: 20, height: 4,
      segments: 32, collision: true, material: { color: '#1f2937', roughness: 0.5, metalness: 0.6, edgeColor: '#10b981' } },

    // Inner ring walls (with corridor gaps)
    ...generateInnerRing(),

    // Outer scattered cover
    ...generateOuterRing(),
  ],
  dynamicElements: [],
  hazardZones: [
    {
      id: 'reactor_pulse',
      shape: 'cylinder',
      position: [0, 0, 0],
      radius: 35,
      height: 80,
      damage: 15,
      period: 8,
      activeDuration: 1,
      warningDuration: 2,
      damageType: 'radiation',
    },
  ],
  environment: {
    skyType: 'solid_color',
    skyColor: '#0a0f0a',
    ambientLightColor: '#4ade80',
    ambientLightIntensity: 0.3,
    lights: [
      { type: 'point', color: '#10b981', intensity: 2.0, position: [0, 50, 0], distance: 120 },
      { type: 'point', color: '#10b981', intensity: 0.8, position: [0, 5, 0], distance: 60 },
      { type: 'directional', color: '#6ee7b7', intensity: 0.3, position: [40, 60, 30], castShadow: true },
      { type: 'hemisphere', color: '#134e4a', intensity: 0.2, groundColor: '#0a0f0a' },
    ],
    floorMaterial: { color: '#1f2937', roughness: 0.4, metalness: 0.6, edgeColor: '#10b981' },
    fog: { color: '#0a1f0a', near: 50, far: 200 },
    showGrid: true,
    gridSize: 250,
    showBoundaryWalls: true,
  },
};
