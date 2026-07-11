/**
 * Tactical map (M overlay) — projection + town-status derivation.
 *
 * The map is the Act II decision surface ("you choose which towns to save",
 * design §2.5): these tests pin the world→map projection the overlay positions
 * markers with, and the status rules that colour them — most importantly that
 * an un-helped town reads as OCCUPIED once the finale flips, and that a held
 * town can never be mislabelled hostile.
 */
import { describe, it, expect } from 'vitest'
import {
  buildTownMarkers,
  projectToMap,
  statusLabel,
  townMapStatus,
} from '../tacticalMap'
import {
  HAPPY_STANDING_THRESHOLD,
  TOWN_COUNT,
  WORLD_HALF_EXTENT,
  createTowns,
  townSpawnPosition,
} from '../../../composables/useStoryMode'

describe('projectToMap', () => {
  it('maps the world centre to the middle of the map square', () => {
    const p = projectToMap(0, 0, WORLD_HALF_EXTENT)
    expect(p.xPct).toBeCloseTo(50)
    expect(p.yPct).toBeCloseTo(50)
  })

  it('maps +X east to the right and +Z south downward', () => {
    const east = projectToMap(WORLD_HALF_EXTENT, 0, WORLD_HALF_EXTENT)
    const south = projectToMap(0, WORLD_HALF_EXTENT, WORLD_HALF_EXTENT)
    expect(east.xPct).toBeGreaterThan(90)
    expect(east.yPct).toBeCloseTo(50)
    expect(south.yPct).toBeGreaterThan(90)
  })

  it('clamps out-of-bounds positions into the margin instead of overflowing', () => {
    const p = projectToMap(WORLD_HALF_EXTENT * 3, -WORLD_HALF_EXTENT * 3, WORLD_HALF_EXTENT)
    expect(p.xPct).toBeLessThanOrEqual(100)
    expect(p.yPct).toBeGreaterThanOrEqual(0)
  })

  it('keeps every deterministic town position inside the frame', () => {
    for (let i = 0; i < TOWN_COUNT; i++) {
      const [x, , z] = townSpawnPosition(i)
      const p = projectToMap(x, z, WORLD_HALF_EXTENT)
      expect(p.xPct).toBeGreaterThan(0)
      expect(p.xPct).toBeLessThan(100)
      expect(p.yPct).toBeGreaterThan(0)
      expect(p.yPct).toBeLessThan(100)
    }
  })
})

describe('townMapStatus', () => {
  const town = (standing: number, cleared = false) => ({ standing, cleared })

  it('reads cold with no standing, friendly with some, held at the threshold', () => {
    expect(townMapStatus(town(0), 'exploring', false)).toBe('neutral')
    expect(townMapStatus(town(34), 'exploring', false)).toBe('friendly')
    expect(townMapStatus(town(HAPPY_STANDING_THRESHOLD), 'exploring', false)).toBe('held')
  })

  it('flips an un-helped town to hostile when the finale arrives', () => {
    expect(townMapStatus(town(34), 'finale', true)).toBe('hostile')
    // …but never while still exploring, even if it would qualify.
    expect(townMapStatus(town(34), 'exploring', true)).toBe('friendly')
  })

  it('never marks a held or cleared town hostile', () => {
    // A held town is not a finale target by definition (finaleTargets filters
    // happy towns), but the status rule must be safe against a stale id list.
    expect(townMapStatus(town(HAPPY_STANDING_THRESHOLD), 'finale', false)).toBe('held')
    expect(townMapStatus(town(20, true), 'finale', true)).toBe('cleared')
  })

  it('labels every status for the legend/marker titles', () => {
    for (const s of ['hostile', 'cleared', 'held', 'friendly', 'neutral'] as const) {
      expect(statusLabel(s)).toBeTruthy()
    }
  })
})

describe('buildTownMarkers', () => {
  it('produces one positioned, measured marker per town of a fresh run', () => {
    const towns = createTowns()
    const markers = buildTownMarkers(towns, 0, 0, 'exploring', [], WORLD_HALF_EXTENT)
    expect(markers).toHaveLength(TOWN_COUNT)
    for (const m of markers) {
      const src = towns.find((t) => t.id === m.id)!
      expect(m.name).toBe(src.name)
      expect(m.status).toBe('neutral')
      // Distance from the spawn (world centre) equals the ring radius used by
      // townSpawnPosition — inner ring 0.55, outer 0.78 of the half-extent.
      const [x, , z] = src.position
      expect(m.distance).toBe(Math.round(Math.hypot(x, z)))
      expect(m.xPct).toBeGreaterThan(0)
      expect(m.xPct).toBeLessThan(100)
    }
  })

  it('marks finale targets hostile and measures distance from the player, not the origin', () => {
    const towns = createTowns()
    const target = towns[1]
    const [px, , pz] = towns[0].position // player parked at town 0
    const markers = buildTownMarkers(towns, px, pz, 'finale', [target.id], WORLD_HALF_EXTENT)
    expect(markers.find((m) => m.id === target.id)?.status).toBe('hostile')
    expect(markers.find((m) => m.id === towns[0].id)?.distance).toBe(0)
  })
})
