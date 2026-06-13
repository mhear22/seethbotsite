/**
 * Tests for useFishingGame composable
 *
 * Covers the deterministic game logic (economy, upgrades, bestiary,
 * persistence, rarity/depth, and the tension minigame). The three.js
 * scene itself is not exercised here.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the stats repository so catch recording / high score calls don't hit the network.
vi.mock('../../repositories/stats.repository', () => ({
  statsRepository: {
    recordStat: vi.fn().mockResolvedValue({ success: true, message: 'ok' }),
    updateHighScore: vi.fn().mockResolvedValue({ success: true, isNewRecord: false, score: 0, message: 'ok' }),
  },
}))

import {
  useFishingGame,
  fishTypes,
  baitTypes,
  rarityMeta,
  upgradeDefs,
  type FishUserData,
  type Rarity,
} from '../../composables/useFishingGame'

// Helper: build a FishUserData from a named fish type.
const makeFish = (name: string, overrides: Partial<FishUserData> = {}): FishUserData => {
  const base = fishTypes.find(f => f.name === name)!
  return { id: 1, ...base, ...overrides }
}

describe('useFishingGame', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
    vi.clearAllMocks()
  })

  describe('economy: bait', () => {
    it('buyBait spends score and adds to inventory', () => {
      const game = useFishingGame()
      game.score.value = 100

      const ok = game.buyBait('shrimp') // cost 10, starts at 5

      expect(ok).toBe(true)
      expect(game.score.value).toBe(90)
      expect(game.baitInventory.value.shrimp).toBe(6)
    })

    it('buyBait rejects when score is insufficient', () => {
      const game = useFishingGame()
      game.score.value = 5

      const ok = game.buyBait('shrimp') // cost 10

      expect(ok).toBe(false)
      expect(game.score.value).toBe(5)
      expect(game.baitInventory.value.shrimp).toBe(5)
    })

    it('buyBait rejects free / unknown bait', () => {
      const game = useFishingGame()
      game.score.value = 100

      expect(game.buyBait('worm')).toBe(false) // cost 0
      expect(game.buyBait('nonexistent')).toBe(false)
      expect(game.score.value).toBe(100)
    })

    it('consumeBaitOnCast decrements the selected bait', () => {
      const game = useFishingGame()
      const shrimp = baitTypes.find(b => b.id === 'shrimp')!
      game.selectBait(shrimp)

      game.consumeBaitOnCast()

      expect(game.baitInventory.value.shrimp).toBe(4)
      expect(game.selectedBait.value.id).toBe('shrimp')
    })

    it('consumeBaitOnCast falls back to worm when bait is depleted', () => {
      const game = useFishingGame()
      const squid = baitTypes.find(b => b.id === 'squid')! // starts at 2
      game.selectBait(squid)

      game.consumeBaitOnCast() // 2 -> 1
      expect(game.selectedBait.value.id).toBe('squid')

      game.consumeBaitOnCast() // 1 -> 0, fall back to worm

      expect(game.baitInventory.value.squid).toBe(0)
      expect(game.selectedBait.value.id).toBe('worm')
    })

    it('consumeBaitOnCast never decrements the infinite worm', () => {
      const game = useFishingGame()
      // worm is selected by default
      game.consumeBaitOnCast()
      expect(game.baitInventory.value.worm).toBe(Infinity)
      expect(game.selectedBait.value.id).toBe('worm')
    })
  })

  describe('upgrades', () => {
    it('buyUpgrade increments the level and spends score', () => {
      const game = useFishingGame()
      game.score.value = 1000

      const ok = game.buyUpgrade('rod') // tier 1 cost 100

      expect(ok).toBe(true)
      expect(game.upgradeLevels.value.rod).toBe(1)
      expect(game.score.value).toBe(900)
    })

    it('buyUpgrade rejects when score is insufficient', () => {
      const game = useFishingGame()
      game.score.value = 50

      const ok = game.buyUpgrade('rod') // tier 1 cost 100

      expect(ok).toBe(false)
      expect(game.upgradeLevels.value.rod).toBe(0)
      expect(game.score.value).toBe(50)
    })

    it('effect computeds increase with level', () => {
      const game = useFishingGame()
      game.score.value = 100000

      const baseCatch = game.catchChanceBonus.value
      const baseBand = game.bandWidthBonus.value
      const baseMaxTension = game.maxTensionForGear.value
      const baseReel = game.reelSpeedMult.value

      game.buyUpgrade('rod')
      game.buyUpgrade('line')
      game.buyUpgrade('reel')

      expect(game.catchChanceBonus.value).toBeGreaterThan(baseCatch)
      expect(game.bandWidthBonus.value).toBeGreaterThan(baseBand)
      expect(game.maxTensionForGear.value).toBeGreaterThan(baseMaxTension)
      expect(game.reelSpeedMult.value).toBeGreaterThan(baseReel)

      // Spot-check exact formulas
      expect(game.catchChanceBonus.value).toBeCloseTo(0.06)
      expect(game.bandWidthBonus.value).toBeCloseTo(2.5)
      expect(game.maxTensionForGear.value).toBe(120)
      expect(game.reelSpeedMult.value).toBeCloseTo(1.18)
    })

    it('nextUpgradeTier returns the next tier and null when maxed', () => {
      const game = useFishingGame()
      const def = upgradeDefs.find(u => u.id === 'rod')!

      expect(game.nextUpgradeTier('rod')).toEqual(def.tiers[1])

      // Max out the rod (3 tiers above base)
      game.score.value = 100000
      game.buyUpgrade('rod')
      game.buyUpgrade('rod')
      game.buyUpgrade('rod')

      expect(game.upgradeLevels.value.rod).toBe(3)
      expect(game.nextUpgradeTier('rod')).toBeNull()
      expect(game.buyUpgrade('rod')).toBe(false)
    })
  })

  describe('bestiary / records', () => {
    it('recording a catch updates count, points and totals', () => {
      const game = useFishingGame()
      const fish = makeFish('Minnow') // 5 points

      game.completeCatch(fish)

      const entry = game.bestiary.value['Minnow']
      expect(entry.count).toBe(1)
      expect(entry.totalPoints).toBeGreaterThan(0)
      expect(entry.bestSize).toBeGreaterThan(0)
      expect(entry.bestWeight).toBeGreaterThan(0)
      expect(game.totalFishCaught.value).toBe(1)
      expect(game.caughtFish.value).toContain('Minnow')
    })

    it('accumulates count and keeps the best size/weight across catches', () => {
      const game = useFishingGame()

      game.completeCatch(makeFish('Minnow'))
      const firstBestSize = game.bestiary.value['Minnow'].bestSize
      const firstBestWeight = game.bestiary.value['Minnow'].bestWeight

      game.completeCatch(makeFish('Minnow'))

      const entry = game.bestiary.value['Minnow']
      expect(entry.count).toBe(2)
      // best* are monotonic maxima
      expect(entry.bestSize).toBeGreaterThanOrEqual(firstBestSize)
      expect(entry.bestWeight).toBeGreaterThanOrEqual(firstBestWeight)
      expect(game.totalFishCaught.value).toBe(2)
    })

    it('completionPercent reflects discovered species', () => {
      const game = useFishingGame()
      expect(game.completionPercent.value).toBe(0)

      game.completeCatch(makeFish('Minnow'))
      game.completeCatch(makeFish('Coral Fish'))

      const expected = Math.round((2 / fishTypes.length) * 100)
      expect(game.completionPercent.value).toBe(expected)
    })

    it('heaviestCatch tracks the maximum weight', () => {
      const game = useFishingGame()

      // A big fish should outweigh a small one. Ancient Coelacanth (size 1.8)
      // is far heavier than a Minnow (size 0.6) even accounting for the
      // random 0.7..1.4 size factor.
      game.completeCatch(makeFish('Minnow'))
      const afterSmall = game.heaviestCatch.value
      expect(afterSmall).not.toBeNull()
      expect(afterSmall!.name).toBe('Minnow')

      game.completeCatch(makeFish('Ancient Coelacanth'))

      expect(game.heaviestCatch.value!.name).toBe('Ancient Coelacanth')
      expect(game.heaviestCatch.value!.weight).toBeGreaterThan(afterSmall!.weight)
    })

    it('applies combo and bait multipliers to awarded points', () => {
      const game = useFishingGame()
      const squid = baitTypes.find(b => b.id === 'squid')! // 1.5x
      game.selectBait(squid)

      const fish = makeFish('Coral Fish') // 10 points
      game.completeCatch(fish)

      // First catch: combo multiplier is 1.0, bait 1.5 -> floor(10 * 1 * 1.5) = 15
      expect(game.score.value).toBe(15)
    })
  })

  describe('persistence', () => {
    it('round-trips state through localStorage on reload', () => {
      const game = useFishingGame()
      game.score.value = 250
      game.buyUpgrade('rod') // cost 100 -> score 150, rod level 1
      game.completeCatch(makeFish('Sunfish'))

      // The watch persists synchronously-ish; force a save to be safe.
      game.saveData()

      const reloaded = useFishingGame()

      expect(reloaded.score.value).toBe(game.score.value)
      expect(reloaded.upgradeLevels.value.rod).toBe(1)
      expect(reloaded.bestiary.value['Sunfish']).toBeTruthy()
      expect(reloaded.totalFishCaught.value).toBe(1)
      expect(reloaded.heaviestCatch.value).not.toBeNull()
    })

    it('infinite worm bait survives serialization', () => {
      const game = useFishingGame()
      game.score.value = 100
      game.buyBait('shrimp')
      game.saveData()

      // Serialized payload must not contain a non-finite worm value
      const raw = localStorage.getItem('fishing-save-v1')!
      const parsed = JSON.parse(raw)
      expect(parsed.baitInventory.worm).toBeUndefined()
      expect(parsed.baitInventory.shrimp).toBe(6)

      const reloaded = useFishingGame()
      expect(reloaded.baitInventory.value.worm).toBe(Infinity)
      expect(reloaded.baitInventory.value.shrimp).toBe(6)
    })
  })

  describe('rarity / depth metadata', () => {
    it('exposes rarityMeta for every rarity', () => {
      const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'legendary']
      for (const r of rarities) {
        expect(rarityMeta[r]).toBeTruthy()
        expect(typeof rarityMeta[r].label).toBe('string')
        expect(typeof rarityMeta[r].color).toBe('string')
        expect(typeof rarityMeta[r].weight).toBe('number')
      }
      // Every fish references a defined rarity
      for (const fish of fishTypes) {
        expect(rarityMeta[fish.rarity]).toBeTruthy()
      }
    })

    it('selectBait rejects costed bait with no inventory', () => {
      const game = useFishingGame()
      // Drain squid (starts at 2)
      game.baitInventory.value.squid = 0
      const squid = baitTypes.find(b => b.id === 'squid')!

      expect(game.selectBait(squid)).toBe(false)
      expect(game.selectedBait.value.id).toBe('worm')
    })
  })

  describe('tension minigame', () => {
    // The loop is requestAnimationFrame-driven with delta time computed from
    // performance.now(). We drive it manually by capturing the rAF callback
    // and stepping performance.now() forward between invocations.
    let rafCallbacks: Array<(t: number) => void>
    let nowValue: number

    beforeEach(() => {
      rafCallbacks = []
      nowValue = 0

      vi.spyOn(performance, 'now').mockImplementation(() => nowValue)
      vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
        rafCallbacks.push(cb)
        return rafCallbacks.length
      })
      vi.stubGlobal('cancelAnimationFrame', vi.fn())
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    })

    // Advance the loop by `ms` milliseconds by invoking the most recently
    // scheduled rAF callback with the new timestamp.
    const step = (ms: number) => {
      nowValue += ms
      const cb = rafCallbacks.shift()
      if (cb) cb(nowValue)
    }

    it('tension rises while reeling and falls when released', () => {
      const game = useFishingGame()
      const fish = makeFish('Minnow')
      game.startTensionGame(fish, vi.fn())

      // Reel in: tension should climb.
      game.reel(true)
      step(50)
      const rising = game.tension.value
      expect(rising).toBeGreaterThan(0)

      step(50)
      expect(game.tension.value).toBeGreaterThan(rising)

      // Release: tension falls back.
      game.reel(false)
      const beforeFall = game.tension.value
      step(50)
      step(50)
      expect(game.tension.value).toBeLessThan(beforeFall)

      game.stopTensionGame()
    })

    it('snaps the line (escape) when tension hits max', () => {
      const onDone = vi.fn()
      const game = useFishingGame()
      const fish = makeFish('Minnow')
      game.startTensionGame(fish, onDone)

      // Hold reel continuously; tension keeps climbing until it snaps.
      game.reel(true)
      for (let i = 0; i < 200 && onDone.mock.calls.length === 0; i++) {
        step(50)
      }

      expect(onDone).toHaveBeenCalledWith(false)
      // After snap the game is no longer struggling.
      expect(game.isStruggling.value).toBe(false)
    })

    it('fills distance and resolves as a catch when distance reaches full', () => {
      const onDone = vi.fn()
      const game = useFishingGame()
      const fish = makeFish('Minnow')
      game.startTensionGame(fish, onDone)

      // Strategy: keep tension inside the safe band. We nudge reel on/off
      // based on whether current tension sits below the band midpoint, so
      // distance accumulates while staying in-band and never snapping.
      for (let i = 0; i < 2000 && onDone.mock.calls.length === 0; i++) {
        const mid = (game.safeBandLow.value + game.safeBandHigh.value) / 2
        game.reel(game.tension.value < mid)
        step(16)
      }

      expect(game.distance.value).toBeGreaterThan(0)
      // Should have resolved as a catch (true) by reaching full distance.
      expect(onDone).toHaveBeenCalledWith(true)
    })

    it('reel(active) toggles reelActive state directly', () => {
      const game = useFishingGame()
      game.reel(true)
      expect(game.reelActive.value).toBe(true)
      game.reel(false)
      expect(game.reelActive.value).toBe(false)
    })
  })
})
