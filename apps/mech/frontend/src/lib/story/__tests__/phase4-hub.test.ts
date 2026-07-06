/**
 * Phase 4 — HUB UI & ON-FOOT QUESTS (GRINDER §4.5).
 *
 * Covers the data seams this cluster added, all pure:
 *   1. On-foot Recovery — the §4/§4.2 keystone: hidden_object quests are on-foot,
 *      in-town (searchRadius inside town bounds), decay-free by nature.
 *   2. The mission board builder — the data-driven warden-office board.
 *   3. ANCHOR_DIALOGUE + dialogueForAnchor — the anchor -> tree resolution the
 *      integrator wires (gate/garage/comms-by-act/warden/commons).
 *   4. Commons ambient trees + the condition-reactive entry + the Rooker toast.
 *
 * (Reachability/terminability of the new commons trees is covered for free by
 * dialogue-integrity.test's walker, since they are registered in ALL_DIALOGUE_TREES.)
 */
import { describe, it, expect } from 'vitest'
import {
  buildQuest,
  buildQuestChain,
  buildMissionBoard,
  boardHasOpenMission,
  currentQuest,
  isOnFootRecovery,
  ON_FOOT_SEARCH_RADIUS,
  type QuestDef,
} from '../quests'
import {
  ALL_DIALOGUE_TREES,
  ANCHOR_DIALOGUE,
  COMMONS_TREES,
  COMMONS_RUINED_THRESHOLD,
  commonsEntryFor,
  commonsTreeForTown,
  dialogueForAnchor,
  rookerKestrelToast,
  STORY_FLAGS,
  type AnchorKind,
} from '../dialogueTrees'
import { ROOKER_KESTREL_LINE } from '../campaign'
import { QUESTS_PER_CHAIN, TOWN_COUNT, TOWN_DECAY_RADIUS } from '../../../composables/useStoryMode'

// ===========================================================================
describe('on-foot Recovery (§4 / §4.2 keystone)', () => {
  it('every shipping-town Recovery is on-foot, in-town, decay-free by nature', () => {
    for (let t = 0; t < TOWN_COUNT; t++) {
      for (const q of buildQuestChain(`town-${t}`, t)) {
        if (q.type !== 'hidden_object') continue
        expect(isOnFootRecovery(q), `town-${t} recovery is on foot`).toBe(true)
        expect(q.onFoot).toBe(true)
        expect(q.searchRadius).toBe(ON_FOOT_SEARCH_RADIUS)
        // In-town: the walkable search area sits inside the decay radius so it is
        // reachable on foot (and thus decay-free while dismounted).
        expect(q.searchRadius!).toBeLessThan(TOWN_DECAY_RADIUS)
      }
    }
  })

  it('non-recovery quests are never flagged on-foot recoveries', () => {
    const chain = buildQuestChain('town-0', 0)
    for (const q of chain) {
      if (q.type !== 'hidden_object') expect(isOnFootRecovery(q)).toBe(false)
    }
  })

  it('the split holds: a mech-scale field recovery is NOT on-foot', () => {
    // A hypothetical field-wreck recovery outside town bounds stays mech-scale.
    const field: QuestDef = {
      ...buildQuest('town-0', 0, 1), // town-0 slot 1 is the hidden_object beat
      onFoot: false,
      searchRadius: 200,
    }
    expect(field.type).toBe('hidden_object')
    expect(isOnFootRecovery(field)).toBe(false)
  })
})

// ===========================================================================
describe('mission board builder (§4.5)', () => {
  it('lists the whole chain in slot order', () => {
    const board = buildMissionBoard('town-0', 0, 0)
    expect(board).toHaveLength(QUESTS_PER_CHAIN)
    expect(board.map((e) => e.quest.index)).toEqual([0, 1, 2])
  })

  it('marks completed / available / locked around the progress index', () => {
    const board = buildMissionBoard('town-0', 0, 1)
    expect(board[0].status).toBe('completed')
    expect(board[1].status).toBe('available')
    expect(board[2].status).toBe('locked')
  })

  it('has exactly one available beat while the chain is open, none when done', () => {
    for (let i = 0; i < QUESTS_PER_CHAIN; i++) {
      const open = buildMissionBoard('town-1', 1, i).filter((e) => e.status === 'available')
      expect(open).toHaveLength(1)
      expect(boardHasOpenMission(i)).toBe(true)
    }
    const done = buildMissionBoard('town-1', 1, QUESTS_PER_CHAIN)
    expect(done.every((e) => e.status === 'completed')).toBe(true)
    expect(done.filter((e) => e.status === 'available')).toHaveLength(0)
    expect(boardHasOpenMission(QUESTS_PER_CHAIN)).toBe(false)
  })

  it('the available row is the town\'s current quest (same accept flow as dialogue)', () => {
    for (let t = 0; t < TOWN_COUNT; t++) {
      const idx = 1
      const available = buildMissionBoard(`town-${t}`, t, idx).find((e) => e.status === 'available')
      expect(available!.quest.id).toBe(currentQuest(`town-${t}`, t, idx)!.id)
    }
  })

  it('carries one-line briefings, rep-axis tags and the on-foot flag per row', () => {
    for (const e of buildMissionBoard('town-0', 0, 0)) {
      expect(e.oneLine.length).toBeGreaterThan(0)
      expect(e.typeLabel).toBeTruthy()
      expect(e.rep.command).toBe(e.quest.commandRep)
      expect(e.rep.town).toBe(e.quest.townRep)
      expect(e.rep.sanctioned).toBe(e.quest.sanctioned)
      expect(e.onFoot).toBe(isOnFootRecovery(e.quest))
    }
  })
})

// ===========================================================================
describe('ANCHOR_DIALOGUE + dialogueForAnchor (§4.4 / §4.5)', () => {
  const ctx = { townId: 'town-2', chapter: 'act1' as const }

  it('covers all five anchor kinds', () => {
    const kinds: AnchorKind[] = ['gate', 'garage', 'comms', 'warden', 'commons']
    for (const k of kinds) expect(ANCHOR_DIALOGUE[k]).toBeTruthy()
  })

  it('the gate opens no dialogue (it is the remount point)', () => {
    expect(dialogueForAnchor('gate', ctx)).toBeNull()
    expect(ANCHOR_DIALOGUE.gate.tree).toBeNull()
  })

  it('the garage opens Rooker\'s tree', () => {
    expect(dialogueForAnchor('garage', ctx)).toBe('rooker:garage')
    expect(ANCHOR_DIALOGUE.garage.opensGarage).toBe(true)
  })

  it('the comms post routes Vaun by act', () => {
    expect(dialogueForAnchor('comms', { townId: 'town-0', chapter: 'act1' })).toBe('vaun:arrival')
    expect(dialogueForAnchor('comms', { townId: 'town-0', chapter: 'act2' })).toBe('vaun:escalation')
    expect(dialogueForAnchor('comms', { townId: 'town-0', chapter: 'act3' })).toBe('vaun:sanction')
  })

  it('warden + commons resolve per town', () => {
    for (let t = 0; t < TOWN_COUNT; t++) {
      expect(dialogueForAnchor('warden', { townId: `town-${t}`, chapter: 'act1' })).toBe(`warden:town-${t}`)
      expect(dialogueForAnchor('commons', { townId: `town-${t}`, chapter: 'act1' })).toBe(`commons:town-${t}`)
    }
  })

  it('every resolved anchor tree id is a registered, mountable tree', () => {
    const anchors: AnchorKind[] = ['garage', 'comms', 'warden', 'commons']
    const chapters = ['act1', 'act2', 'act3'] as const
    for (let t = 0; t < TOWN_COUNT; t++) {
      for (const chapter of chapters) {
        for (const a of anchors) {
          const id = dialogueForAnchor(a, { townId: `town-${t}`, chapter })
          expect(id, `${a} @ town-${t}/${chapter}`).toBeTruthy()
          expect(ALL_DIALOGUE_TREES[id!], `${id} registered`).toBeTruthy()
        }
      }
    }
  })
})

// ===========================================================================
describe('commons ambient trees (§4.5)', () => {
  it('provides one commons tree per town, each registered', () => {
    expect(Object.keys(COMMONS_TREES)).toHaveLength(TOWN_COUNT)
    for (let t = 0; t < TOWN_COUNT; t++) {
      expect(commonsTreeForTown(`town-${t}`)).toBeTruthy()
      expect(ALL_DIALOGUE_TREES[`commons:town-${t}`]).toBe(COMMONS_TREES[`town-${t}`])
    }
  })

  it('every commons tree has the stable greet + hard nodes for the reactive entry', () => {
    for (const tree of Object.values(COMMONS_TREES)) {
      expect(tree.entry).toBe('greet')
      expect(tree.nodes['greet']).toBeTruthy()
      expect(tree.nodes['hard']).toBeTruthy()
    }
  })

  it('opens on the hardship line for a gutted town, the ambient line otherwise', () => {
    expect(commonsEntryFor(COMMONS_RUINED_THRESHOLD - 1)).toBe('hard')
    expect(commonsEntryFor(COMMONS_RUINED_THRESHOLD)).toBe('greet')
    expect(commonsEntryFor(100)).toBe('greet')
  })
})

// ===========================================================================
describe('Rooker mirror-reveal toast (§4.2)', () => {
  it('is silent before the player notices Kestrel\'s clean towns', () => {
    expect(rookerKestrelToast([])).toBeNull()
  })

  it('surfaces the line once noticed, until Rooker has named the trick', () => {
    expect(rookerKestrelToast([STORY_FLAGS.SAW_KESTREL_CLEAN])).toBe(ROOKER_KESTREL_LINE)
  })

  it('goes silent again once the trick has been named', () => {
    expect(
      rookerKestrelToast([STORY_FLAGS.SAW_KESTREL_CLEAN, STORY_FLAGS.ROOKER_NAMED_TRICK]),
    ).toBeNull()
  })
})
