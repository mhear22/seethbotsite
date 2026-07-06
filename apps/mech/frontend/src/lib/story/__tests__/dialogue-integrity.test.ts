/**
 * Phase 3 — INTEGRATION test gaps beyond the cluster suites (GRINDER §2.5 / §3.7 / §4.5).
 *
 * The cluster tests already cover: save migration v1->v3, two-axis rep math + the
 * finale-gate regression, collateral bounds + emission shape, death stakes, the
 * pure dialogue helpers (isChoiceAvailable/applyEffects/evaluateChoice), and act
 * derivation. This file fills the three seams NOTHING pins yet:
 *
 *   1. DIALOGUE TREE REACHABILITY + TERMINABILITY. campaign.test's assertTreeIntegrity
 *      only rejects *dangling forward references* (choice.next -> missing node). It
 *      does NOT catch an ORPHAN node (authored, but no path from entry reaches it —
 *      the tell-tale of a renamed/typo'd id) nor a NON-TERMINATING trap (a cycle
 *      with no exit, which would soft-lock the DialogueView modal). A pure walker
 *      over ALL_DIALOGUE_TREES catches both across every authored tree.
 *
 *   2. chooseDialogue — the guarded live-run seam the UI actually calls. The pure
 *      evaluateChoice is tested; the composable wrapper (gate -> apply to the real
 *      run -> persist, no-op + no-save when gated) is not.
 *
 *   3. concludeRun — the Act III "obey the withdrawal" conclusion. The phase machine
 *      can only reach 'ended' by CLEARING every finale target; the scorched-
 *      withdrawal ending leaves towns un-reclaimed, so concludeRun is the *only*
 *      path to the tribunal with abandoned towns on the ledger.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useStoryMode } from '../../../composables/useStoryMode'
import { ALL_DIALOGUE_TREES, WARDEN_TREES } from '../dialogueTrees'
import type { DialogueTree, DialogueChoice } from '../dialogue'

function installMemoryStorage() {
  const store = new Map<string, string>()
  ;(globalThis as { localStorage?: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size
    },
  } as Storage
}

// --- pure graph helpers over an authored tree -------------------------------

/** Node ids reachable from the entry by following every choice.next (gating-blind). */
function reachableFrom(tree: DialogueTree): Set<string> {
  const seen = new Set<string>()
  const queue: string[] = [tree.entry]
  while (queue.length) {
    const id = queue.shift()!
    if (seen.has(id)) continue
    seen.add(id)
    const node = tree.nodes[id]
    if (!node) continue // dangling ref: campaign.test already flags these
    for (const c of node.choices) {
      if (c.next !== undefined && !seen.has(c.next)) queue.push(c.next)
    }
  }
  return seen
}

/** A choice that ends the conversation: no onward node, or an explicit 'end' action. */
function isExitChoice(c: DialogueChoice): boolean {
  return c.next === undefined || c.effects?.action === 'end'
}

/** Ids of nodes from which SOME path exits the conversation (terminability fixpoint). */
function terminatingNodes(tree: DialogueTree): Set<string> {
  const terminating = new Set<string>()
  // Seed: nodes that exit directly (empty choices == terminal node, or an exit choice).
  for (const [id, node] of Object.entries(tree.nodes)) {
    if (node.choices.length === 0 || node.choices.some(isExitChoice)) terminating.add(id)
  }
  // Propagate: a node terminates if any choice leads to a terminating node.
  let grew = true
  while (grew) {
    grew = false
    for (const [id, node] of Object.entries(tree.nodes)) {
      if (terminating.has(id)) continue
      if (node.choices.some((c) => c.next !== undefined && terminating.has(c.next))) {
        terminating.add(id)
        grew = true
      }
    }
  }
  return terminating
}

// ===========================================================================
describe('dialogue tree reachability + terminability (§4.5 — pure walker)', () => {
  it('every authored node is reachable from its tree entry (no orphan nodes)', () => {
    for (const [id, tree] of Object.entries(ALL_DIALOGUE_TREES)) {
      const reachable = reachableFrom(tree)
      const orphans = Object.keys(tree.nodes).filter((n) => !reachable.has(n))
      expect(orphans, `${id}: orphaned (unreachable) nodes -> ${orphans.join(', ')}`).toEqual([])
    }
  })

  it('every reachable node can reach a conversation exit (no trap cycles)', () => {
    for (const [id, tree] of Object.entries(ALL_DIALOGUE_TREES)) {
      const reachable = reachableFrom(tree)
      const terminating = terminatingNodes(tree)
      const traps = [...reachable].filter((n) => tree.nodes[n] && !terminating.has(n))
      expect(traps, `${id}: non-terminating (soft-lock) nodes -> ${traps.join(', ')}`).toEqual([])
    }
  })

  it('the trees StoryModePage mounts are all registered + walkable', () => {
    // The integrator mounts these by key; a rename here would silently break a beat.
    const required = [
      'vaun:sanction', // Act III withdrawal order (blocking choice)
      'kestrel:confrontation', // pre-boss confrontation (blocking choice)
      ...Object.keys(WARDEN_TREES).map((t) => `warden:${t}`), // one warden per town
    ]
    for (const key of required) {
      const tree = ALL_DIALOGUE_TREES[key]
      expect(tree, `mounted tree '${key}' is registered in ALL_DIALOGUE_TREES`).toBeTruthy()
      // walkable == entry reaches an exit
      expect(terminatingNodes(tree).has(tree.entry), `'${key}' entry can terminate`).toBe(true)
    }
  })
})

// ===========================================================================
describe('chooseDialogue — guarded live-run evaluation (composable seam)', () => {
  beforeEach(installMemoryStorage)

  it('applies an available choice’s flag/rep effects to the live run and persists', () => {
    const story = useStoryMode()
    story.newRun()
    const cmd0 = story.commandRep.value
    const town0 = story.townRep.value

    const choice: DialogueChoice = {
      text: 'Understood, Major.',
      next: 'brief',
      effects: { setFlags: ['seen-briefing'], commandRep: 6, townRep: -3, action: 'openGarage' },
    }
    const ev = story.chooseDialogue(choice)

    expect(ev.available).toBe(true)
    expect(ev.result?.action).toBe('openGarage')
    expect(ev.result?.next).toBe('brief')
    expect(story.commandRep.value).toBe(cmd0 + 6)
    expect(story.townRep.value).toBe(town0 - 3)
    expect(story.hasStoryFlag('seen-briefing')).toBe(true)

    // Persisted: a reload sees the applied effects.
    const reloaded = useStoryMode()
    expect(reloaded.load()).toBe(true)
    expect(reloaded.commandRep.value).toBe(cmd0 + 6)
    expect(reloaded.storyFlags.value).toContain('seen-briefing')
  })

  it('a gated choice is a strict no-op: available:false, no mutation, nothing saved', () => {
    const story = useStoryMode()
    story.newRun()
    const cmd0 = story.commandRep.value
    const town0 = story.townRep.value

    const gated: DialogueChoice = {
      text: 'I know what you did.',
      requires: { flag: 'saw-the-truth', minCommandRep: 999 },
      effects: { setFlags: ['should-never-set'], commandRep: 50, townRep: 50 },
    }
    const ev = story.chooseDialogue(gated)

    expect(ev.available).toBe(false)
    expect(ev.result).toBeUndefined()
    expect(story.commandRep.value).toBe(cmd0)
    expect(story.townRep.value).toBe(town0)
    expect(story.hasStoryFlag('should-never-set')).toBe(false)

    // Not persisted either: a fresh load reflects the untouched run.
    const reloaded = useStoryMode()
    expect(reloaded.load()).toBe(true)
    expect(reloaded.commandRep.value).toBe(cmd0)
    expect(reloaded.storyFlags.value).not.toContain('should-never-set')
  })

  it('clamps reputation on the live run to 0..100 across repeated choices', () => {
    const story = useStoryMode()
    story.newRun()

    const spike: DialogueChoice = { text: 'up', effects: { commandRep: 80 } }
    const crater: DialogueChoice = { text: 'down', effects: { townRep: -80 } }
    story.chooseDialogue(spike)
    story.chooseDialogue(spike) // would overshoot 100
    story.chooseDialogue(crater)
    story.chooseDialogue(crater) // would undershoot 0

    expect(story.commandRep.value).toBe(100)
    expect(story.townRep.value).toBe(0)
  })
})

// ===========================================================================
describe('concludeRun — Act III withdrawal ends a run the machine cannot (§2.5)', () => {
  beforeEach(installMemoryStorage)

  it('a fresh run does not end on its own; concludeRun flips it to ended/act3 + persists', () => {
    const story = useStoryMode()
    story.newRun()

    // The phase machine keeps an un-cleared run alive: completing a quest does not end it.
    const id = story.towns.value[0].id
    story.finishActiveQuest(story.getCurrentQuest(id)!)
    expect(story.phase.value).not.toBe('ended')

    // Obeying the withdrawal is the only path to 'ended' with towns still un-reclaimed.
    story.concludeRun()
    expect(story.phase.value).toBe('ended')
    expect(story.chapter.value).toBe('act3')

    // The abandoned towns are still on the ledger (never cleared).
    expect(story.towns.value.some((t) => !t.cleared)).toBe(true)

    // Persisted across reload.
    const reloaded = useStoryMode()
    expect(reloaded.load()).toBe(true)
    expect(reloaded.phase.value).toBe('ended')
    expect(reloaded.chapter.value).toBe('act3')
  })

  it('is idempotent (a second call is a no-op)', () => {
    const story = useStoryMode()
    story.newRun()
    story.concludeRun()
    story.concludeRun()
    expect(story.phase.value).toBe('ended')
    expect(story.chapter.value).toBe('act3')
  })
})
