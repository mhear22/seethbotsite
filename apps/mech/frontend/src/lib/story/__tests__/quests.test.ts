import { describe, it, expect } from 'vitest'
import {
  buildQuest,
  buildQuestChain,
  currentQuest,
  questReward,
  partPrice,
  partPowerScore,
  slotsForPart,
  isWeaponArm,
  buildShopCatalogue,
  questObjective,
  type QuestType,
} from '../quests'
import { ARM_PARTS, CORE_PARTS, findPartById } from '../../../shared/data/MechParts'
import { QUESTS_PER_CHAIN } from '../../../composables/useStoryMode'

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
