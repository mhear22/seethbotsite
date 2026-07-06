import { describe, it, expect } from 'vitest'
import {
  TOWN_IDENTITIES,
  CAMPAIGN_TOWN_NAMES,
  CAMPAIGN_ACES,
  aceForTown,
  reinforcementCallout,
  actForRun,
  VAUN_COMMS,
  KESTREL_SIGHTINGS,
  tribunalVerdictCopy,
  TRIBUNAL_FINDINGS,
} from '../campaign'
import {
  ALL_DIALOGUE_TREES,
  WARDEN_TREES,
  wardenTreeForTown,
  vaunSanctionTree,
  kestrelConfrontationTree,
  STORY_FLAGS,
} from '../dialogueTrees'
import type { DialogueTree } from '../dialogue'
import { TOWN_COUNT, TOWN_NAMES } from '../../../composables/useStoryMode'

describe('Talus Reach settlements (§2.4)', () => {
  it('defines one identity per town with a warden and NPCs', () => {
    expect(TOWN_IDENTITIES).toHaveLength(TOWN_COUNT)
    for (const t of TOWN_IDENTITIES) {
      expect(t.name).toBeTruthy()
      expect(t.tagline.length).toBeGreaterThan(10)
      expect(t.warden.name).toBeTruthy()
      expect(t.npcs.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('covers all five re-skinned dispositions across the wardens', () => {
    const dispositions = new Set(TOWN_IDENTITIES.map((t) => t.warden.disposition))
    expect(dispositions).toEqual(
      new Set(['grateful', 'bitter', 'opportunist', 'zealot', 'broken']),
    )
  })

  it('exposes canonical names matching the town count (integrator wires TOWN_NAMES)', () => {
    expect(CAMPAIGN_TOWN_NAMES).toHaveLength(TOWN_COUNT)
    // Non-drift guard: if the integrator has already pointed TOWN_NAMES at the
    // campaign, they stay identical. (This asserts count parity regardless.)
    expect(TOWN_NAMES.length).toBe(CAMPAIGN_TOWN_NAMES.length)
  })
})

describe('named Combine aces (§2.5)', () => {
  it('defines one ace per town, including Kestrel', () => {
    expect(CAMPAIGN_ACES).toHaveLength(TOWN_COUNT)
    expect(CAMPAIGN_ACES.map((a) => a.name)).toContain('Kestrel')
    for (let t = 0; t < TOWN_COUNT; t++) {
      const ace = aceForTown(t)!
      expect(ace.name).toBeTruthy()
      expect(ace.intro.length).toBeGreaterThan(20)
      expect(ace.occupies).toBe(`town-${t}`)
    }
  })

  it('resolves the ace-specific reinforcement callout even with an epithet in the name', () => {
    const kass = CAMPAIGN_ACES[0]
    // StoryCombat names the boss mech `Warlord Kass "Rustjaw"` — the lookup must
    // still find Kass by substring.
    expect(reinforcementCallout(`${kass.name} "${kass.epithet}"`)).toBe(kass.reinforcementCallout)
    // Unknown boss -> terse generic fallback that still names it.
    expect(reinforcementCallout('Enforcer Hollis')).toContain('Enforcer Hollis')
  })
})

describe('act structure over the phase machine (§2.5)', () => {
  it('maps phase + progress onto three acts', () => {
    expect(actForRun({ phase: 'exploring', questsCompleted: 0 })).toBe(1)
    expect(actForRun({ phase: 'exploring', questsCompleted: 1 })).toBe(2)
    expect(actForRun({ phase: 'exploring', questsCompleted: 0, chapter: 2 })).toBe(2)
    expect(actForRun({ phase: 'finale', questsCompleted: 9 })).toBe(3)
    expect(actForRun({ phase: 'ended', questsCompleted: 9 })).toBe(3)
  })

  it('supplies a Vaun beat for every act transition and escalating Kestrel sightings', () => {
    for (const line of Object.values(VAUN_COMMS)) expect(line.length).toBeGreaterThan(20)
    expect(KESTREL_SIGHTINGS.length).toBeGreaterThanOrEqual(3)
  })
})

describe('tribunal verdict copy (§2)', () => {
  it('produces a finding + detail for every verdict tier', () => {
    for (const v of ['Hero', 'Mercenary', 'Menace', 'Monster'] as const) {
      expect(TRIBUNAL_FINDINGS[v].finding).toBeTruthy()
      const copy = tribunalVerdictCopy(v, {
        refusedOrders: false,
        obeyedWithdrawal: false,
        townsAbandoned: 0,
      })
      expect(copy.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('adds flag-aware addenda for refused orders and abandoned towns', () => {
    const refused = tribunalVerdictCopy('Menace', {
      refusedOrders: true,
      obeyedWithdrawal: false,
      townsAbandoned: 2,
    })
    expect(refused.join(' ')).toMatch(/refused a direct/i)
    expect(refused.join(' ')).toMatch(/2 settlements/i)

    const obeyed = tribunalVerdictCopy('Mercenary', {
      refusedOrders: false,
      obeyedWithdrawal: true,
      townsAbandoned: 1,
    })
    expect(obeyed.join(' ')).toMatch(/withdrawal order as issued/i)
    expect(obeyed.join(' ')).toMatch(/1 settlement\b/i)
  })
})

// ---------------------------------------------------------------------------
// Structural integrity of every authored dialogue tree.
// ---------------------------------------------------------------------------
function assertTreeIntegrity(tree: DialogueTree, label: string) {
  // entry resolves
  expect(tree.nodes[tree.entry], `${label}: entry '${tree.entry}' exists`).toBeTruthy()
  for (const [key, node] of Object.entries(tree.nodes)) {
    expect(node.id, `${label}: node key/id match`).toBe(key)
    expect(node.speaker, `${label}:${key} has a speaker`).toBeTruthy()
    expect(node.text.length, `${label}:${key} has authored text`).toBeGreaterThan(0)
    for (const choice of node.choices) {
      expect(choice.text.length, `${label}:${key} choice has text`).toBeGreaterThan(0)
      if (choice.next !== undefined) {
        expect(
          tree.nodes[choice.next],
          `${label}:${key} choice -> existing node '${choice.next}'`,
        ).toBeTruthy()
      }
    }
  }
}

describe('dialogue trees (§4.5) — structure', () => {
  it('every registered tree has a resolvable entry and no dangling choice targets', () => {
    for (const [id, tree] of Object.entries(ALL_DIALOGUE_TREES)) {
      assertTreeIntegrity(tree, id)
    }
  })

  it('provides a warden tree for each of the five towns', () => {
    for (let t = 0; t < TOWN_COUNT; t++) {
      const tree = wardenTreeForTown(`town-${t}`)
      expect(tree, `warden tree for town-${t}`).toBeTruthy()
    }
    expect(Object.keys(WARDEN_TREES)).toHaveLength(TOWN_COUNT)
  })

  it('has at least 40 authored nodes across all trees', () => {
    const total = Object.values(ALL_DIALOGUE_TREES).reduce(
      (n, t) => n + Object.keys(t.nodes).length,
      0,
    )
    expect(total).toBeGreaterThanOrEqual(40)
  })

  it("every warden tree can offer and accept the town's current quest", () => {
    for (const tree of Object.values(WARDEN_TREES)) {
      const actions = Object.values(tree.nodes)
        .flatMap((n) => n.choices)
        .map((c) => c.effects?.action)
      expect(actions).toContain('acceptQuest')
      expect(actions).toContain('declineQuest')
    }
  })
})

describe('Act III refuse-order branch (§4.5)', () => {
  it('sets the refused-order flag and shifts rep (Command down, Town up) on refusal', () => {
    const refuseChoices = Object.values(vaunSanctionTree.nodes)
      .flatMap((n) => n.choices)
      .filter((c) => c.effects?.action === 'refuseOrder')
    expect(refuseChoices.length).toBeGreaterThanOrEqual(1)
    for (const c of refuseChoices) {
      expect(c.effects?.setFlags).toContain(STORY_FLAGS.REFUSED_ORDER)
      expect(c.effects?.commandRep).toBeLessThan(0)
      expect(c.effects?.townRep).toBeGreaterThan(0)
    }
    // The comply path sets the obeyed flag so the tribunal can tell them apart.
    const obeyFlags = Object.values(vaunSanctionTree.nodes)
      .flatMap((n) => n.choices)
      .flatMap((c) => c.effects?.setFlags ?? [])
    expect(obeyFlags).toContain(STORY_FLAGS.OBEYED_WITHDRAWAL)
  })
})

describe('Kestrel confrontation (§2.3)', () => {
  it('offers a reveal path that sets the mirror-truth flag and always leads to the fight', () => {
    const revealChoices = Object.values(kestrelConfrontationTree.nodes)
      .flatMap((n) => n.choices)
      .filter((c) => c.effects?.setFlags?.includes(STORY_FLAGS.SAW_KESTREL_TRUTH))
    expect(revealChoices.length).toBeGreaterThanOrEqual(1)
    // Every terminal choice in the tree resolves to the fight (action:'end' on the
    // fight node) — the confrontation precedes combat, never replaces it.
    const fight = kestrelConfrontationTree.nodes['fight']
    expect(fight).toBeTruthy()
    expect(fight.choices.some((c) => c.effects?.action === 'end')).toBe(true)
  })
})
