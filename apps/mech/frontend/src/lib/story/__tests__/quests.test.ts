import { describe, it, expect } from 'vitest'
import {
  buildQuest,
  buildQuestChain,
  buildFinaleBoss,
  currentQuest,
  questReward,
  questTypeFor,
  partPrice,
  partPowerScore,
  slotsForPart,
  isWeaponArm,
  buildShopCatalogue,
  questObjective,
  questFamily,
  questTypeLabel,
  type QuestType,
} from '../quests'
import { CAMPAIGN_QUESTS, TOWN_IDENTITIES, CAMPAIGN_ACES } from '../campaign'
import { ARM_PARTS, CORE_PARTS, findPartById } from '../../../shared/data/MechParts'
import { QUESTS_PER_CHAIN, TOWN_COUNT } from '../../../composables/useStoryMode'

describe('quest chains', () => {
  it('builds a chain of QUESTS_PER_CHAIN deterministic quests', () => {
    const a = buildQuestChain('town-0', 0)
    const b = buildQuestChain('town-0', 0)
    expect(a).toHaveLength(QUESTS_PER_CHAIN)
    expect(a).toEqual(b)
    expect(a.map((q) => q.id)).toEqual(['town-0-quest-0', 'town-0-quest-1', 'town-0-quest-2'])
  })

  it('covers all three quest types within a single town chain', () => {
    const types = new Set<QuestType>(buildQuestChain('town-0', 0).map((q) => q.type))
    expect(types).toEqual(new Set(['wave_defence', 'hidden_object', 'boss_hunt']))
  })

  it('starts the chain on a different type per town (offset by index)', () => {
    expect(buildQuest('town-0', 0, 0).type).not.toBe(buildQuest('town-1', 1, 0).type)
  })

  it('currentQuest returns null once the chain is complete', () => {
    expect(currentQuest('town-0', 0, QUESTS_PER_CHAIN)).toBeNull()
    expect(currentQuest('town-0', 0, 0)?.id).toBe('town-0-quest-0')
  })

  it('rewards increase with chain depth', () => {
    expect(questReward('wave_defence', 2)).toBeGreaterThan(questReward('wave_defence', 0))
    expect(questReward('boss_hunt', 0)).toBeGreaterThan(questReward('hidden_object', 0))
  })

  it('populates type-specific params', () => {
    const chain = buildQuestChain('town-0', 0)
    const wave = chain.find((q) => q.type === 'wave_defence')!
    const boss = chain.find((q) => q.type === 'boss_hunt')!
    const hidden = chain.find((q) => q.type === 'hidden_object')!
    expect(wave.waveCount).toBeGreaterThanOrEqual(2)
    expect(boss.difficulty).toBe('boss')
    expect(boss.bossScale).toBeGreaterThanOrEqual(1)
    expect(hidden.objectName).toBeTruthy()
    expect(hidden.searchRadius).toBeGreaterThan(0)
  })

  it('formats an objective string per type', () => {
    const wave = buildQuest('town-0', 0, 0)
    // town-0 slot 0 is wave_defence
    expect(questObjective(wave, 1)).toContain('1/')
  })
})

describe('authored campaign content (Phase 3 §2.6)', () => {
  it('authored content family matches the deterministic machinery for every town/slot (§5)', () => {
    // The determinism guard (updated for Phase 5): CAMPAIGN_QUESTS is authored in
    // slot order, and each entry MUST share the FAMILY buildQuest derives for that
    // (townIndex, slot). Early towns author the plain base type; later towns may
    // author a within-family variety (escort/hold/extraction ~ wave; ace_hunt ~
    // boss). Recovery (hidden_object) is never substituted. This keeps the town's
    // three-beat wave/recovery/boss arc intact while the objective varies.
    for (let t = 0; t < TOWN_COUNT; t++) {
      for (let s = 0; s < QUESTS_PER_CHAIN; s++) {
        expect(questFamily(CAMPAIGN_QUESTS[t][s].type)).toBe(questFamily(questTypeFor(t, s)))
      }
    }
  })

  it('every shipping town/slot resolves authored (non-fallback) content', () => {
    for (let t = 0; t < TOWN_COUNT; t++) {
      const chain = buildQuestChain(`town-${t}`, t)
      for (const q of chain) {
        expect(q.title).toBeTruthy()
        expect(q.briefing.length).toBeGreaterThan(20)
        expect(q.completion.length).toBeGreaterThan(20)
        expect(q.giver).toBe(TOWN_IDENTITIES[t].warden.name)
      }
    }
  })

  it('carries two-axis reputation deltas; Recovery favours Town, boss-family names its target', () => {
    for (let t = 0; t < TOWN_COUNT; t++) {
      for (const q of buildQuestChain(`town-${t}`, t)) {
        if (q.type === 'hidden_object') {
          // Recovery = on-foot help: town-initiated, Town-positive.
          expect(q.sanctioned).toBe(false)
          expect(q.townRep).toBeGreaterThan(0)
        }
        // Boss family (Sanction OR Phase-5 ace hunt) names a person, not a title.
        if (questFamily(q.type) === 'boss') {
          expect(q.bossName).toBeTruthy()
          // A Command-sanctioned kill raises Command; a town-initiated one
          // (e.g. Voss's "House Rules") raises Town instead — the axis tracks
          // who ordered it.
          if (q.sanctioned) expect(q.commandRep).toBeGreaterThan(0)
          else expect(q.townRep).toBeGreaterThan(0)
        }
      }
    }
  })

  it('finale bosses are named Combine aces with defiance rep + a boss callsign', () => {
    for (let t = 0; t < TOWN_COUNT; t++) {
      const boss = buildFinaleBoss(`town-${t}`, t)
      expect(boss.id).toBe(`town-${t}-finale`)
      expect(boss.title).toContain(CAMPAIGN_ACES[t].name)
      expect(boss.bossName).toContain(CAMPAIGN_ACES[t].name)
      // Reclaiming an abandoned town defies Command: Town up, Command down (§3.7).
      expect(boss.townRep).toBeGreaterThan(0)
      expect(boss.commandRep).toBeLessThan(0)
      expect(boss.sanctioned).toBe(false)
    }
  })
})

describe('Phase 5 mission variety in chains (§5)', () => {
  const allChains = () =>
    Array.from({ length: TOWN_COUNT }, (_, t) => buildQuestChain(`town-${t}`, t))

  it('early towns (0-1) stay on the plain three base types', () => {
    const base = new Set<QuestType>(['wave_defence', 'hidden_object', 'boss_hunt'])
    for (const t of [0, 1]) {
      for (const q of buildQuestChain(`town-${t}`, t)) {
        expect(base.has(q.type)).toBe(true)
      }
    }
  })

  it('surfaces all four variety types across the later-town chains', () => {
    const types = new Set<QuestType>(allChains().flat().map((q) => q.type))
    expect(types.has('escort_convoy')).toBe(true)
    expect(types.has('hold_the_line')).toBe(true)
    expect(types.has('extraction')).toBe(true)
    expect(types.has('ace_hunt')).toBe(true)
  })

  it('every variety substitution respects its family (never touches Recovery)', () => {
    for (let t = 0; t < TOWN_COUNT; t++) {
      const chain = buildQuestChain(`town-${t}`, t)
      for (const q of chain) {
        // hidden_object slots are always plain Recovery (on-foot keystone, §4.2).
        if (questFamily(q.type) === 'recovery') expect(q.type).toBe('hidden_object')
        // wave-family variety carries wave params; boss-family carries a name.
        if (q.type === 'escort_convoy') {
          expect(q.escortCount).toBeGreaterThanOrEqual(2)
          expect(q.waypointDistance).toBeGreaterThan(0)
          expect(q.difficulty).toBeTruthy()
        }
        if (q.type === 'hold_the_line') {
          expect(q.holdWaves).toBeGreaterThanOrEqual(1)
          expect(q.barricadeHp).toBeGreaterThan(0)
        }
        if (q.type === 'extraction') {
          expect(q.holdSeconds).toBeGreaterThan(0)
          expect(q.beaconDistance).toBeGreaterThan(0)
          expect(q.perimeterRadius).toBeGreaterThan(0)
        }
        if (q.type === 'ace_hunt') {
          expect(q.bossName).toBeTruthy()
          expect(q.difficulty).toBe('boss')
          expect(q.bodyguardCount).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })

  it('gives every quest type a HUD label and objective string', () => {
    const types: QuestType[] = [
      'wave_defence', 'hidden_object', 'boss_hunt',
      'escort_convoy', 'hold_the_line', 'extraction', 'ace_hunt',
    ]
    for (const type of types) {
      expect(questTypeLabel(type).length).toBeGreaterThan(0)
    }
    // Objective text renders for a representative variety quest.
    const escort = allChains().flat().find((q) => q.type === 'escort_convoy')!
    expect(questObjective(escort, escort.escortCount ?? 0)).toContain('convoy')
    const extraction = allChains().flat().find((q) => q.type === 'extraction')!
    expect(questObjective(extraction, 30)).toContain('30')
  })
})

describe('economy pricing', () => {
  it('prices parts higher when they are more powerful', () => {
    const autocannon = findPartById('arm-autocannon-mk1')!
    const railgun = findPartById('arm-railgun')!
    expect(partPrice(railgun)).toBeGreaterThan(partPrice(autocannon))
    expect(partPowerScore(railgun)).toBeGreaterThan(partPowerScore(autocannon))
  })

  it('prices legendary parts above common parts of similar stats', () => {
    const diesel = CORE_PARTS.find((c) => c.id === 'core-diesel-gen')!
    const fusion = CORE_PARTS.find((c) => c.id === 'core-fusion')!
    expect(partPrice(fusion)).toBeGreaterThan(partPrice(diesel))
  })

  it('enforces a sane price floor', () => {
    for (const part of buildShopCatalogue()) {
      expect(partPrice(part)).toBeGreaterThanOrEqual(40)
    }
  })

  it('catalogue is sorted cheapest-first', () => {
    const prices = buildShopCatalogue().map(partPrice)
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1])
    }
  })
})

describe('part slot + weapon helpers', () => {
  it('arms can go in either hand; other parts in their own slot', () => {
    expect(slotsForPart(ARM_PARTS[0])).toEqual(['leftArm', 'rightArm'])
    expect(slotsForPart(CORE_PARTS[0])).toEqual(['core'])
  })

  it('identifies weapon arms vs the support shield', () => {
    expect(isWeaponArm(findPartById('arm-autocannon-mk1')!)).toBe(true)
    expect(isWeaponArm(findPartById('arm-shield-gen')!)).toBe(false)
    expect(isWeaponArm(findPartById('core-diesel-gen')!)).toBe(false)
  })
})
