/**
 * Tactical-map projection + marker derivation for the Story Mode overworld.
 *
 * Pure, testable module: no Vue, no THREE, no DOM (mirrors quests.ts). The
 * TacticalMap.vue overlay consumes these helpers; keeping the math here means
 * the world→map projection and the town status rules are unit-tested and can
 * never drift from what the overlay renders.
 *
 * The player reads the map to answer the campaign's core question (§2.5 Act II:
 * "you choose which towns to save"): where is everything, which towns are held,
 * which are slipping, and — in the finale — which are occupied by the aces.
 */
import type { StoryPhase, TownState } from '../../composables/useStoryMode'
import { HAPPY_STANDING_THRESHOLD } from '../../composables/useStoryMode'

/** How a town reads on the map. Drives marker colour/icon in TacticalMap.vue. */
export type TownMapStatus =
  /** Occupied finale target — an ace holds it (phase 'finale'/'ended'). */
  | 'hostile'
  /** Finale opponent defeated, or chain finished and locked in. */
  | 'cleared'
  /** Standing at the happy threshold — this town counts toward the finale gate. */
  | 'held'
  /** Some standing earned but not yet held. */
  | 'friendly'
  /** No relationship yet. */
  | 'neutral'

export interface MapPoint {
  /** 0..100 percentage across the map square (left → right = west → east). */
  xPct: number
  /** 0..100 percentage down the map square (top → bottom = north → south). */
  yPct: number
}

export interface TownMapMarker extends MapPoint {
  id: string
  name: string
  status: TownMapStatus
  /** 0..100, rounded for display. */
  condition: number
  /** 0..100, rounded for display. */
  standing: number
  /** Straight-line distance from the player, world units (≈ metres in HUD copy). */
  distance: number
}

/**
 * Project a world-space (x, z) into map percentages. World +X maps right and
 * world +Z maps DOWN (three.js top view: +X east, +Z south), so the map matches
 * what a player sees turning the camera. `marginPct` keeps the outer-ring towns
 * (radius 0.78 × half-extent) comfortably inside the frame.
 */
export function projectToMap(
  x: number,
  z: number,
  halfExtent: number,
  marginPct = 8,
): MapPoint {
  const span = 100 - marginPct * 2
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
  return {
    xPct: marginPct + clamp01((x + halfExtent) / (halfExtent * 2)) * span,
    yPct: marginPct + clamp01((z + halfExtent) / (halfExtent * 2)) * span,
  }
}

/**
 * Status rules, most-urgent first:
 *  1. an un-helped, un-cleared town during the finale is an occupied target;
 *  2. cleared is terminal (ace beaten — or the chain was finished pre-finale);
 *  3. held at the happy threshold (the finale-gate currency, §2.5);
 *  4. any earned standing reads as friendly;
 *  5. otherwise neutral.
 */
export function townMapStatus(
  town: Pick<TownState, 'standing' | 'cleared'>,
  phase: StoryPhase,
  isFinaleTarget: boolean,
): TownMapStatus {
  if (phase !== 'exploring' && isFinaleTarget && !town.cleared) return 'hostile'
  if (town.cleared) return 'cleared'
  if (town.standing >= HAPPY_STANDING_THRESHOLD) return 'held'
  if (town.standing > 0) return 'friendly'
  return 'neutral'
}

/** Human label for a status (legend + marker title). */
export function statusLabel(status: TownMapStatus): string {
  switch (status) {
    case 'hostile': return 'Occupied'
    case 'cleared': return 'Cleared'
    case 'held': return 'Held'
    case 'friendly': return 'Friendly'
    default: return 'Cold'
  }
}

/** Build the render-ready marker list for every town. */
export function buildTownMarkers(
  towns: TownState[],
  playerX: number,
  playerZ: number,
  phase: StoryPhase,
  finaleTargetIds: ReadonlySet<string> | string[],
  halfExtent: number,
): TownMapMarker[] {
  const targets = finaleTargetIds instanceof Set ? finaleTargetIds : new Set(finaleTargetIds)
  return towns.map((t) => {
    const [x, , z] = t.position
    return {
      id: t.id,
      name: t.name,
      status: townMapStatus(t, phase, targets.has(t.id)),
      condition: Math.round(t.condition),
      standing: Math.round(t.standing),
      distance: Math.round(Math.hypot(x - playerX, z - playerZ)),
      ...projectToMap(x, z, halfExtent),
    }
  })
}
