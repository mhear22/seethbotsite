/**
 * Map registry - central access point for all map definitions
 */
import type { MapDefinition } from '../types/MapDefinition';
import { defaultArena } from './defaultArena';
import { ruinedHighway } from './ruinedHighway';
import { reactorCore } from './reactorCore';
import { spaceColony } from './spaceColony';
import { megaFactory } from './megaFactory';

export const MAP_REGISTRY: Map<string, MapDefinition> = new Map([
  [defaultArena.id, defaultArena],
  [ruinedHighway.id, ruinedHighway],
  [reactorCore.id, reactorCore],
  [spaceColony.id, spaceColony],
  [megaFactory.id, megaFactory],
]);

/** All multiplayer map IDs (excludes default arena which is for single-player/fallback) */
export const MULTIPLAYER_MAP_IDS = [
  ruinedHighway.id,
  reactorCore.id,
  spaceColony.id,
  megaFactory.id,
];

export function getMapById(id: string): MapDefinition | undefined {
  return MAP_REGISTRY.get(id);
}

export function getRandomMap(): MapDefinition {
  const idx = Math.floor(Math.random() * MULTIPLAYER_MAP_IDS.length);
  return MAP_REGISTRY.get(MULTIPLAYER_MAP_IDS[idx])!;
}

export function getAllMaps(): MapDefinition[] {
  return Array.from(MAP_REGISTRY.values());
}

export { defaultArena, ruinedHighway, reactorCore, spaceColony, megaFactory };
