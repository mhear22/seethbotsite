/**
 * Pure-math tests for DayNightCycle — no DOM/canvas/renderer involved, so this
 * suite runs unstubbed (unlike StoryWorld.dismount.test.ts's headless rig).
 *
 * Covers the three seams the design calls out explicitly:
 *  - setTimeOfDay positions (including wrap-around) and the "today" seam:
 *    timeOfDay 0.25 must reproduce OverworldSky's fixed base constants exactly
 *    (theta=0 at that point — see the class doc);
 *  - the daylight curve at noon vs. deep night (smooth, bounded 0..1);
 *  - sun/planet/moon all rotate by the SAME quaternion each frame — the angle
 *    between any pair (dot product of the unit directions) stays constant as
 *    time advances, since rotation is angle-preserving.
 */
import { describe, it, expect } from 'vitest'
import { DayNightCycle, CYCLE_LENGTH_SEC } from '../DayNightCycle'
import { SUN_DIRECTION, PLANET_DIRECTION, MOON_DIRECTION } from '../OverworldSky'

describe('DayNightCycle — setTimeOfDay positions', () => {
  it('defaults to 0.25 (mid-morning) and reproduces the fixed base constants exactly', () => {
    const cycle = new DayNightCycle()
    expect(cycle.timeOfDay).toBeCloseTo(0.25, 10)
    expect(cycle.sunDir.x).toBeCloseTo(SUN_DIRECTION.x, 10)
    expect(cycle.sunDir.y).toBeCloseTo(SUN_DIRECTION.y, 10)
    expect(cycle.sunDir.z).toBeCloseTo(SUN_DIRECTION.z, 10)
    expect(cycle.planetDir.distanceTo(PLANET_DIRECTION)).toBeCloseTo(0, 10)
    expect(cycle.moonDir.distanceTo(MOON_DIRECTION)).toBeCloseTo(0, 10)
  })

  it('setTimeOfDay(0.25) reproduces the base constants from any starting point', () => {
    const cycle = new DayNightCycle(0.9)
    cycle.setTimeOfDay(0.25)
    expect(cycle.sunDir.distanceTo(SUN_DIRECTION)).toBeCloseTo(0, 10)
  })

  it('wraps values outside [0, 1)', () => {
    const a = new DayNightCycle()
    a.setTimeOfDay(1.25)
    const b = new DayNightCycle()
    b.setTimeOfDay(0.25)
    expect(a.timeOfDay).toBeCloseTo(b.timeOfDay, 10)
    expect(a.sunDir.distanceTo(b.sunDir)).toBeCloseTo(0, 10)

    const c = new DayNightCycle()
    c.setTimeOfDay(-0.75)
    expect(c.timeOfDay).toBeCloseTo(0.25, 10)
    expect(c.sunDir.distanceTo(b.sunDir)).toBeCloseTo(0, 10)
  })

  it('update(dt) advances timeOfDay by dt / CYCLE_LENGTH_SEC and wraps over a full cycle', () => {
    const cycle = new DayNightCycle(0)
    cycle.update(CYCLE_LENGTH_SEC * 0.1)
    expect(cycle.timeOfDay).toBeCloseTo(0.1, 6)

    cycle.update(CYCLE_LENGTH_SEC) // a full cycle later, right back where it was
    expect(cycle.timeOfDay).toBeCloseTo(0.1, 6)
  })
})

describe('DayNightCycle — daylight curve', () => {
  it('is near-full daylight at a high-sun time of day (t=0.25)', () => {
    const cycle = new DayNightCycle(0.25)
    expect(cycle.sunDir.y).toBeGreaterThan(0.3) // well above the horizon
    expect(cycle.daylight).toBeGreaterThan(0.9)
    expect(cycle.sunIntensityFactor).toBeGreaterThan(0.9)
  })

  it('is near-zero at deep night (t=0.65, the lowest sun elevation of the cycle)', () => {
    const cycle = new DayNightCycle()
    cycle.setTimeOfDay(0.65)
    expect(cycle.sunDir.y).toBeLessThan(-0.3) // well below the horizon
    expect(cycle.daylight).toBeLessThan(0.05)
    // sunIntensityFactor never fully bottoms out (a sliver of "moonlight").
    expect(cycle.sunIntensityFactor).toBeGreaterThan(0)
    expect(cycle.sunIntensityFactor).toBeLessThan(0.1)
  })

  it('daylight and sunIntensityFactor stay within [0, 1] across the whole cycle', () => {
    const cycle = new DayNightCycle()
    for (let t = 0; t < 1; t += 0.01) {
      cycle.setTimeOfDay(t)
      expect(cycle.daylight).toBeGreaterThanOrEqual(0)
      expect(cycle.daylight).toBeLessThanOrEqual(1)
      expect(cycle.sunIntensityFactor).toBeGreaterThanOrEqual(0)
      expect(cycle.sunIntensityFactor).toBeLessThanOrEqual(1)
    }
  })

  it('lightColor and fogDim stay valid, finite colours across the whole cycle', () => {
    const cycle = new DayNightCycle()
    for (let t = 0; t < 1; t += 0.05) {
      cycle.setTimeOfDay(t)
      for (const c of [cycle.lightColor, cycle.fogDim]) {
        expect(Number.isFinite(c.r)).toBe(true)
        expect(Number.isFinite(c.g)).toBe(true)
        expect(Number.isFinite(c.b)).toBe(true)
      }
    }
  })

  it('roughly 60% of the cycle keeps the sun above the horizon (day) vs. 40% below (night)', () => {
    const cycle = new DayNightCycle()
    let daySamples = 0
    const total = 1000
    for (let i = 0; i < total; i++) {
      cycle.setTimeOfDay(i / total)
      if (cycle.sunDir.y > 0) daySamples++
    }
    const dayFraction = daySamples / total
    expect(dayFraction).toBeGreaterThan(0.5)
    expect(dayFraction).toBeLessThan(0.7)
  })
})

describe('DayNightCycle — one rigid rotation (sun/planet/moon pinned together)', () => {
  it('rotates sun/planet/moon by the SAME quaternion — pairwise angles (dot products) stay constant', () => {
    const cycle = new DayNightCycle()
    cycle.setTimeOfDay(0.25)
    const sunPlanetDot0 = cycle.sunDir.dot(cycle.planetDir)
    const sunMoonDot0 = cycle.sunDir.dot(cycle.moonDir)
    const planetMoonDot0 = cycle.planetDir.dot(cycle.moonDir)

    // Also confirm it matches the RAW base-constant angle (rotation preserves it).
    expect(sunPlanetDot0).toBeCloseTo(SUN_DIRECTION.dot(PLANET_DIRECTION), 8)

    for (const t of [0, 0.1, 0.33, 0.5, 0.65, 0.8, 0.99]) {
      cycle.setTimeOfDay(t)
      expect(cycle.sunDir.dot(cycle.planetDir)).toBeCloseTo(sunPlanetDot0, 8)
      expect(cycle.sunDir.dot(cycle.moonDir)).toBeCloseTo(sunMoonDot0, 8)
      expect(cycle.planetDir.dot(cycle.moonDir)).toBeCloseTo(planetMoonDot0, 8)
      // Every direction stays a unit vector (rotation preserves length).
      expect(cycle.sunDir.length()).toBeCloseTo(1, 8)
      expect(cycle.planetDir.length()).toBeCloseTo(1, 8)
      expect(cycle.moonDir.length()).toBeCloseTo(1, 8)
    }
  })

  it('sunDir/planetDir/moonDir are reused instances (never reallocated across updates)', () => {
    const cycle = new DayNightCycle()
    const sunRef = cycle.sunDir
    const planetRef = cycle.planetDir
    const moonRef = cycle.moonDir
    cycle.update(1)
    cycle.setTimeOfDay(0.5)
    expect(cycle.sunDir).toBe(sunRef)
    expect(cycle.planetDir).toBe(planetRef)
    expect(cycle.moonDir).toBe(moonRef)
  })
})
