/**
 * SHARED DIALOGUE CONTRACT (Phase 3, GRINDER §2 / §4.5).
 *
 * The single pure type contract every dialogue cluster builds to:
 *   - SYSTEMS owns the rep/flag state that `requires`/`effects` read and write.
 *   - CONTENT (this cluster) authors the trees in `dialogueTrees.ts`.
 *   - UI renders a DialogueTree node-by-node, resolving choices against run state.
 *
 * Pure module: no Vue, no THREE, no DOM, no state. Types only.
 *
 * NOTE TO INTEGRATOR: this file was authored by the NARRATIVE CONTENT cluster
 * because `dialogueTrees.ts`/`campaign.ts` need the types to compile and be
 * unit-tested standalone. It is a verbatim transcription of the shared contract
 * in the Phase 3 brief — if the SYSTEMS cluster also produced a `dialogue.ts`,
 * the two are identical by construction; keep either. Do not add state here.
 */

/** A reputation/flag gate on a choice. All present clauses must pass (AND). */
export interface DialogueRequirement {
  /** storyFlag that must be set (true) for this choice to appear. */
  flag?: string
  /** Minimum Command reputation required. */
  minCommandRep?: number
  /** Minimum Town reputation required. */
  minTownRep?: number
}

/** Side effects a choice applies when taken. */
export interface DialogueEffects {
  /** storyFlags to set true (consumed by the finale + tribunal). */
  setFlags?: string[]
  /** Command reputation delta (may be negative). */
  commandRep?: number
  /** Town reputation delta (may be negative). */
  townRep?: number
  /**
   * A host-side action the UI performs on this choice. `acceptQuest` resolves
   * the town's CURRENT quest (via useStoryMode.getCurrentQuest) — the tree does
   * not name a quest id; `refuseOrder` is the Act III defiance beat.
   */
  action?: 'acceptQuest' | 'declineQuest' | 'openGarage' | 'refuseOrder' | 'end'
}

export interface DialogueChoice {
  /** The line the player picks. */
  text: string
  /** Node id to advance to. Omit for a terminal choice (dialogue ends). */
  next?: string
  /** Gate: hide/disable this choice unless the requirement passes. */
  requires?: DialogueRequirement
  /** Applied when the choice is taken. */
  effects?: DialogueEffects
}

export interface DialogueNode {
  /** Stable id, unique within its tree. */
  id: string
  /** Who is speaking (character name / callsign / 'COMMS'). */
  speaker: string
  /** The spoken line(s) for this node. */
  text: string
  /** Player responses. An empty array is a terminal node. */
  choices: DialogueChoice[]
}

export interface DialogueTree {
  /** Node id the tree opens on. */
  entry: string
  /** All nodes, keyed by id. */
  nodes: Record<string, DialogueNode>
}

// ===========================================================================
// SYSTEMS-owned pure evaluation helpers (rep/flag state lives on StoryRun).
//
// These are the isChoiceAvailable / applyEffects / evaluateChoice helpers named
// in the shared contract. They read + write a minimal DialogueState that
// StoryRun is structurally assignable to, so useStoryMode passes its run
// straight in. Pure + standalone (no import of useStoryMode -> no import cycle).
// ===========================================================================

/** The run state a dialogue choice reads and mutates. StoryRun satisfies this. */
export interface DialogueState {
  storyFlags: string[]
  commandRep: number
  townRep: number
}

const REP_FLOOR = 0
const REP_CEIL = 100
const clampRepValue = (v: number): number => Math.max(REP_FLOOR, Math.min(REP_CEIL, v))

/** The resolved consequence of taking a choice. */
export interface DialogueEffectResult {
  /** The discrete host action to perform (if any). */
  action?: NonNullable<DialogueEffects['action']>
  /** The next node id to show (undefined = the conversation ends). */
  next?: string
}

/**
 * Whether a choice's requirements are met by the current state. A choice with no
 * `requires` is always available. A required flag that is unset, or a rep below
 * a stated minimum, gates the choice out.
 */
export function isChoiceAvailable(choice: DialogueChoice, state: DialogueState): boolean {
  const req = choice.requires
  if (!req) return true
  if (req.flag !== undefined && !state.storyFlags.includes(req.flag)) return false
  if (req.minCommandRep !== undefined && !(state.commandRep >= req.minCommandRep)) return false
  if (req.minTownRep !== undefined && !(state.townRep >= req.minTownRep)) return false
  return true
}

/**
 * Apply a choice's effects to the state (mutates it): raise flags (idempotent),
 * adjust the two reputation axes (clamped 0..100), and surface the discrete
 * action + next node. Does NOT gate — use evaluateChoice for a guarded apply.
 */
export function applyEffects(state: DialogueState, choice: DialogueChoice): DialogueEffectResult {
  const fx = choice.effects
  if (fx) {
    if (fx.setFlags) {
      for (const f of fx.setFlags) if (!state.storyFlags.includes(f)) state.storyFlags.push(f)
    }
    if (typeof fx.commandRep === 'number') state.commandRep = clampRepValue(state.commandRep + fx.commandRep)
    if (typeof fx.townRep === 'number') state.townRep = clampRepValue(state.townRep + fx.townRep)
  }
  return { action: fx?.action, next: choice.next }
}

/** The result of routing a choice through the availability guard + effects. */
export interface ChoiceEvaluation {
  /** False if the choice was gated out; effects are NOT applied in that case. */
  available: boolean
  /** Present only when `available` — the applied effects' action + next node. */
  result?: DialogueEffectResult
}

/**
 * Guarded apply: if the choice is available, apply its effects and return the
 * result; otherwise a no-op with `available: false`. The one entry point the
 * composable/UI should call, so a gated choice can never mutate state.
 */
export function evaluateChoice(state: DialogueState, choice: DialogueChoice): ChoiceEvaluation {
  if (!isChoiceAvailable(choice, state)) return { available: false }
  return { available: true, result: applyEffects(state, choice) }
}

/** Look up a node in a tree (undefined if the id is unknown). */
export function nodeById(tree: DialogueTree, id: string): DialogueNode | undefined {
  return tree.nodes[id]
}

/** The subset of a node's choices currently offerable to the player. */
export function availableChoices(node: DialogueNode, state: DialogueState): DialogueChoice[] {
  return node.choices.filter((c) => isChoiceAvailable(c, state))
}
