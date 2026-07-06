/**
 * NARRATIVE CONTENT — the Talus Reach campaign (GRINDER §2, Phase 3).
 *
 * Pure, testable content module: no Vue, no THREE, no DOM, no state. It is the
 * single source of authored fiction for Story Mode:
 *   - the five Talus Reach settlements (names, roles, wardens, NPCs) — §2.4;
 *   - the per-town, per-slot quest content that skins the deterministic 3-chain
 *     into Hold / Recovery / Sanction missions — §2.6 (consumed by quests.ts);
 *   - the named Combine aces that hold abandoned towns in the finale — §2.5;
 *   - Major Vaun's act-transition comms, Kestrel's escalating sightings, and
 *     Rooker's mirror-reveal line — §2.3;
 *   - the tribunal verdict copy for the credits ledger — §2.5 / §2 tribunal row.
 *
 * SYSTEMS owns the rep/flag STATE; this module only authors WHAT is said and the
 * rep/flag DELTAS that a beat carries. The tone is the brief's: gritty military
 * sci-fi — terse, war-weary, specific.
 */

import type { QuestType } from './quests'
import type { Verdict } from '../../composables/useStoryMode'

// ============================================================================
// §2.4 — The five Talus Reach settlements
// ============================================================================

export type TownRole = 'garrison' | 'mining' | 'refinery' | 'farm' | 'waystation'

/** A named settlement NPC (voice + one-line identity). Wardens give quests. */
export interface CampaignNpc {
  name: string
  /** One-line identity/role so the UI can label them. */
  role: string
}

export interface TownIdentity {
  /** Matches useStoryMode town-{i} ids by array index. */
  id: string
  /** Re-skinned settlement name (§2.4). Order is load-bearing — index = townIndex. */
  name: string
  role: TownRole
  /** One-line settlement identity for the HUD / warden intro. */
  tagline: string
  /** The quest-giver warden (met at the town). */
  warden: CampaignNpc & {
    /** Their standing relationship to the war — drives their voice (§2.3). */
    disposition: 'grateful' | 'bitter' | 'opportunist' | 'zealot' | 'broken'
  }
  /** 1-2 other named voices in the settlement. */
  npcs: CampaignNpc[]
}

/**
 * The Reach, in the fixed index order useStoryMode's TOWN_NAMES must mirror.
 * INTEGRATOR SEAM: point `useStoryMode.TOWN_NAMES` at `CAMPAIGN_TOWN_NAMES`
 * (below) so names never drift from this authored table.
 */
export const TOWN_IDENTITIES: readonly TownIdentity[] = [
  {
    id: 'town-0',
    name: "Warden's Rest",
    role: 'garrison',
    tagline: 'A Directorate forward post gone to seed; refugees in the old barracks.',
    warden: {
      name: 'Sgt. Iolo Track',
      role: 'garrison warden, Directorate line sergeant (ret.)',
      disposition: 'grateful',
    },
    // NOTE: Rooker is the campaign-wide quartermaster met at EVERY town's garage
    // (§2.3, the diegetic face of Garage.vue), not a Warden's Rest local — so he
    // is not rostered here. These are the Rest's own voices.
    npcs: [
      { name: 'Pvt. Neve', role: 'conscript, too young to be here' },
      { name: 'Odalys', role: 'runs the refugee barracks; knows every name on the wire' },
    ],
  },
  {
    id: 'town-1',
    name: 'Sump',
    role: 'mining',
    tagline: 'A strip-pit colony drowning in its own tailings. Black water, black lungs.',
    warden: {
      name: 'Dessa Korr',
      role: 'pit foreman; has buried more crews than she can count',
      disposition: 'bitter',
    },
    npcs: [{ name: 'Ludo', role: 'pit runner, thirteen, knows every drift' }],
  },
  {
    id: 'town-2',
    name: 'The Kiln',
    role: 'refinery',
    tagline: 'An ore smelter that never cools. Sells refined metal to whoever pays.',
    warden: {
      name: 'Sabik Voss',
      role: 'refinery boss; plays the Directorate and the Combine off each other',
      disposition: 'opportunist',
    },
    npcs: [{ name: 'Marn', role: "Voss's enforcer; says little, means it" }],
  },
  {
    id: 'town-3',
    name: 'Longwater',
    role: 'farm',
    tagline: 'Dome hydroponics run as a water-faith commune. The last green in the Reach.',
    warden: {
      name: 'Mother Enye',
      role: 'matriarch of the Longwater faithful; reads the war as scripture',
      disposition: 'zealot',
    },
    npcs: [{ name: 'Tobias', role: "Enye's son; keeps the pumps and his doubts running" }],
  },
  {
    id: 'town-4',
    name: 'Halberd Station',
    role: 'waystation',
    tagline: 'A dead rail junction. One working generator, one stubborn family.',
    warden: {
      name: 'Cull',
      role: 'stationmaster; stopped believing the trains would run again',
      disposition: 'broken',
    },
    npcs: [{ name: 'Sett', role: "Cull's daughter; keeps the lights on out of spite" }],
  },
] as const

/** Town names in index order — the canonical source for useStoryMode.TOWN_NAMES. */
export const CAMPAIGN_TOWN_NAMES = TOWN_IDENTITIES.map((t) => t.name) as readonly string[]

export function townIdentity(index: number): TownIdentity | undefined {
  return TOWN_IDENTITIES[index]
}

// ============================================================================
// §2.6 — Authored quest content (Hold / Recovery / Sanction)
// ============================================================================

/**
 * Authored strings + rep deltas for one quest slot. `type` MUST match the type
 * `quests.buildQuest` computes for that (townIndex, slot) — a determinism test
 * pins this so content can never silently drift from the machinery.
 *
 * Rep axis (§3.7): Command-sanctioned Holds/Sanctions raise Command; on-foot
 * Recoveries and town-loved fights raise Town and can annoy Command. A Sanction
 * the town hates costs Town standing even as Command rewards it.
 */
export interface QuestContent {
  type: QuestType
  title: string
  /** Terse one-line hook the warden speaks when offering (maps to QuestDef.flavor). */
  hook: string
  /** 2-4 sentence mission brief. */
  briefing: string
  /** Completion beat — advances the town's arc. */
  completion: string
  /** Command-sanctioned (Hold/Sanction under orders) vs town-initiated (Recovery). */
  sanctioned: boolean
  /** Command reputation delta on completion (§3.7). */
  commandRep: number
  /** Town reputation delta on completion (§3.7). */
  townRep: number
  /** Recovery only: the thing recovered (maps to QuestDef.objectName). */
  objectName?: string
  /** Sanction only: the target's callsign, used as the boss mech's name so the
   *  HUD + reinforcement callout read as a person. Escalates toward Kestrel. */
  target?: string
}

/**
 * CAMPAIGN_QUESTS[townIndex][slot]. Each town's three entries are authored in
 * SLOT order and each carries the type buildQuest derives for that slot, so a
 * town's arc reads as a three-beat story regardless of which type comes first.
 */
export const CAMPAIGN_QUESTS: readonly (readonly QuestContent[])[] = [
  // ---- town-0 Warden's Rest (garrison) — slots: wave, hidden, boss ----
  [
    {
      type: 'wave_defence',
      title: 'Line at the Wire',
      hook: 'Combine outriders are testing our east wire. Break them.',
      briefing:
        'Skirmishers have been probing the perimeter at dusk, three nights running. Tonight they came in force. Hold the wire until they break contact — the Rest has nowhere left to fall back to.',
      completion:
        'The outriders scatter into the dark. Track logs it as a clean defence and pins a Directorate commendation to your file. The Rest sleeps behind its wire another night.',
      sanctioned: true,
      commandRep: 8,
      townRep: 6,
    },
    {
      type: 'hidden_object',
      title: 'Black Box',
      hook: "A scout of ours went down on the flats. Her recorder's still calling.",
      briefing:
        'Lieutenant Aro flew a recon sweep west of the wire and never came back. Her flight recorder is still transmitting from the salt flats. Go out on foot and bring it in — Command will want the sensor logs, and I want to know what killed her.',
      completion:
        "The recorder's last thirty seconds are Aro's voice, flat and professional, calling a single contact by name: Kestrel. Track goes quiet when he hears it. So do you.",
      sanctioned: false,
      commandRep: -2,
      townRep: 12,
      objectName: "Lt. Aro's flight recorder",
    },
    {
      type: 'boss_hunt',
      title: 'Old Debts',
      target: 'Enforcer Hollis',
      hook: 'A Combine enforcer rolled up to drag one of my people back. He stays.',
      briefing:
        'One of the refugees in the wire is a Combine deserter — Command has him flagged as an asset, but he cooks for the whole barracks and never touched a trigger. Now his old unit sent a heavy to collect him. Command signed off on the kill. So put the enforcer down and we keep our cook.',
      completion:
        "The enforcer burns where it stands. The deserter doesn't run — he brings you a mess tin and says nothing, which from him is everything. Track: \"Warden's Rest is yours, pilot. Try to leave it standing.\"",
      sanctioned: true,
      commandRep: 12,
      townRep: 6,
    },
  ],
  // ---- town-1 Sump (mining) — slots: hidden, boss, wave ----
  [
    {
      type: 'hidden_object',
      title: 'Pit Nine',
      hook: 'A shift crew is down in a collapsed drift. Their beacon still pings.',
      briefing:
        "Nine went in this morning; the roof came down at noon. We can hear one beacon under the rubble and nothing else. On foot — a Frame on that ground drops the rest of the roof. Find the beacon and I'll get diggers to it.",
      completion:
        "You walk the last survivor's beacon back to the pit-head yourself. Korr doesn't thank you — Korr doesn't thank anyone — but she stops spitting when you pass. In Sump, that is a monument.",
      sanctioned: false,
      commandRep: -2,
      townRep: 12,
      objectName: "the Pit Nine survivor beacon",
    },
    {
      type: 'boss_hunt',
      title: 'Company Man',
      target: 'Quartermaster Dagen',
      hook: "Command wants the buyer dead. That buyer's the only reason we eat.",
      briefing:
        'A Combine quartermaster has been buying Sump ore at triple the Directorate rate. Command calls it funding the enemy and wants him sanctioned. Korr calls it groceries. Orders are orders — the buyer runs a war-Frame, so this is a kill, not an arrest.',
      completion:
        'The buyer dies in his own scrapyard and the ore he paid for rots on the docks. Korr watches the payout dry up and says only: "You fed us to Command, pilot. Remember that when you want us grateful."',
      sanctioned: true,
      commandRep: 12,
      townRep: -8,
    },
    {
      type: 'wave_defence',
      title: 'Tailings',
      hook: 'Raiders are coming for the stockpile. Everything we have is in that pile.',
      briefing:
        "A scavenger band caught wind that Sump's ore isn't selling anymore, so now they'll just take it. Hold the pit-head. If that stockpile burns, the town starves before spring.",
      completion:
        'The raiders break on the pit-head and drag their wrecks away. Korr counts the stockpile twice, then, grudging: "Sump owes you one. Don\'t come collecting when it\'s down a shaft."',
      sanctioned: true,
      commandRep: 8,
      townRep: 6,
    },
  ],
  // ---- town-2 The Kiln (refinery) — slots: boss, wave, hidden ----
  [
    {
      type: 'boss_hunt',
      title: 'House Rules',
      target: 'Captain Roone',
      hook: "There's a warband boss squatting my north kiln. I want him gone.",
      briefing:
        "Voss points you at a rival captain who's set up in the cold north kiln — calls him a raider threat. He's really a competitor cutting into Voss's trade, and Voss knows you know. But the captain does run a heavy, and he will burn the Kiln to keep it. So burn him first.",
      completion:
        'The rival captain goes into his own furnace. Voss counts the north kiln back into his ledger before the ash settles. "Pleasure doing business," he says. It wasn\'t Command\'s war you fought today.',
      sanctioned: false,
      commandRep: -2,
      townRep: 8,
    },
    {
      type: 'wave_defence',
      title: 'Feed the Fire',
      hook: 'Combine raid on the smelter. If the pour stops, the Kiln dies.',
      briefing:
        "The Combine wants The Kiln's output for its own guns and sent a raiding column to take it. Hold the smelter floor — if the furnace goes cold it takes a week to relight, and the Kiln doesn't have a week.",
      completion:
        'The raid breaks against the furnace wall and the pour never stops. Voss will sell three versions of this story by morning — one to the Directorate, one to the Combine, one to himself. The furnace roars on.',
      sanctioned: true,
      commandRep: 8,
      townRep: 6,
    },
    {
      type: 'hidden_object',
      title: 'Slag',
      hook: "One of the pour-kids ran into the cooling tunnels. Find her before the next pour.",
      briefing:
        "A furnace kid bolted into the cooling tunnels after a scolding and hasn't come out. The next pour floods those tunnels with slag-heat in the hour. Go in on foot and get her — a Frame won't fit and the vibration brings the roof down.",
      completion:
        "You carry the kid out coughing but whole, minutes before the pour. Voss makes a show of not caring and quietly docks no one's pay for the stopped line. Even opportunists keep a ledger they don't show.",
      sanctioned: false,
      commandRep: -2,
      townRep: 12,
      objectName: 'the missing pour-kid',
    },
  ],
  // ---- town-3 Longwater (farm) — slots: wave, hidden, boss ----
  [
    {
      type: 'wave_defence',
      title: 'The Flood Wall',
      hook: 'Raiders come for the water. Providence sent us a Frame. Hold the dome.',
      briefing:
        "Longwater's domes hold the only clean water for a hundred kilometres, and a raider band means to siphon it dry. Hold the flood wall. Mother Enye will call it a miracle either way — make it the kind where the water stays.",
      completion:
        'The raiders retreat with empty tanks. Mother Enye declares you an instrument of providence and marks the wall with salt and oil. You are, at least, an instrument. The domes stay green.',
      sanctioned: true,
      commandRep: 8,
      townRep: 6,
    },
    {
      type: 'hidden_object',
      title: 'The Lost Lamb',
      hook: 'A pilgrim walked into the salt flats at first light. Bring him home.',
      briefing:
        "One of the faithful took the water-pilgrimage too literally and wandered into the salt on foot. He won't last another day out there. Go find him — quietly, on foot; Mother Enye says a Frame's shadow frightens the penitent.",
      completion:
        "You walk the pilgrim back through the dome doors as the faithful sing. Mother Enye takes it as proof of everything she already believed, and her belief in you hardens into something heavier than trust.",
      sanctioned: false,
      commandRep: -2,
      townRep: 12,
      objectName: 'the lost pilgrim',
    },
    {
      type: 'boss_hunt',
      title: 'Apostate',
      target: 'Mercenary Sear',
      hook: 'A heretic would sell our water to the Combine. Break the machine that guards him.',
      briefing:
        "A Longwater farmer struck a deal to pipe water to the Combine and hired a Frame to guard the valves. Mother Enye names him apostate; Command, pleased to deny the Combine water, co-signs the sanction. The farmer's guard-Frame is the target — the farmer himself will run once it's slag.",
      completion:
        "The guard-Frame dies at the valves and the apostate flees into the flats. Enye consecrates the ground where it fell; half of Longwater cheers and half won't meet your eye. The water stays Directorate. For now.",
      sanctioned: true,
      commandRep: 12,
      townRep: 4,
    },
  ],
  // ---- town-4 Halberd Station (waystation) — slots: hidden, boss, wave ----
  [
    {
      type: 'hidden_object',
      title: 'The Manifest',
      hook: "There's a munitions cache buried under the dead rail. Sett wants it for trade.",
      briefing:
        'Before the line died, a Directorate train buried a munitions cache under the north siding and the manifest with it. Sett means to trade it for a working generator so Halberd sees another winter. Dig it out on foot — the rail bed won\'t hold a Frame\'s weight.',
      completion:
        'You surface the cache and Sett trades half of it for a generator that same night. The station lights come up steady for the first time in a year. Cull watches them burn and almost — almost — smiles.',
      sanctioned: false,
      commandRep: -2,
      townRep: 12,
      objectName: 'the buried munitions manifest',
    },
    {
      type: 'boss_hunt',
      title: 'Last Train',
      target: 'Junction-Ace Vell',
      hook: 'A Combine ace sits in my junction tower. Clear it and the line runs again.',
      briefing:
        "A Combine ace has claimed the junction tower and with it the only signal that lets a train through Halberd. Command wants the line reopened for resupply; Sett wants it reopened to live. Same target either way — a Frame in the tower. Take it down.",
      completion:
        'The tower burns and the signals go green. A supply train grinds through Halberd Station for the first time in a year, and Sett runs alongside it laughing like a child. Cull just watches the tail lights, believing.',
      sanctioned: true,
      commandRep: 12,
      townRep: 6,
    },
    {
      type: 'wave_defence',
      title: 'Hold the Platform',
      hook: "They want the junction back. They can't have it. Hold the platform.",
      briefing:
        'The Combine wants its junction tower back and sent a column to retake it before the line beds in. Hold the platform. If they take the signal again, Halberd goes dark for good and no one will bother relighting it.',
      completion:
        'The column breaks on the platform edge and pulls back down the dead line. Cull, who had stopped speaking in futures, says quietly: "Maybe the line lives." From Cull, that is a resurrection.',
      sanctioned: true,
      commandRep: 8,
      townRep: 6,
    },
  ],
] as const

/** Authored content for a quest slot (undefined if out of range). */
export function questContent(townIndex: number, slot: number): QuestContent | undefined {
  return CAMPAIGN_QUESTS[townIndex]?.[slot]
}

// ============================================================================
// §2.5 — Named Combine aces (finale bosses)
// ============================================================================

export interface CombatAce {
  /** Callsign / name used as the boss mech's name (feeds StoryCombat identity). */
  name: string
  epithet: string
  /** The town this ace holds when it is abandoned (townIndex order). */
  occupies: string
  /** One-line finale intro (boss identity banner). */
  intro: string
  /** Comms line barked when the ace calls in the half-HP reinforcement pair (§3.6). */
  reinforcementCallout: string
}

/**
 * One ace per settlement, indexed to match townIndex. Each is a pilot who had a
 * Reach of their own and chose the machine over the people — the mirror at scale
 * (§2.3). Kestrel holds Halberd Station: if you abandon it, the tell is that her
 * town never decayed (§4.2).
 */
export const CAMPAIGN_ACES: readonly CombatAce[] = [
  {
    name: 'Warlord Kass',
    epithet: 'Rustjaw',
    occupies: 'town-0',
    intro: "Kass took Warden's Rest the day after you left it. Rustjaw doesn't hold ground. He grinds it.",
    reinforcementCallout: 'Rustjaw: "Bring me the rest of them. I\'m still hungry."',
  },
  {
    name: 'Sar Vane',
    epithet: 'the Undertaker',
    occupies: 'town-1',
    intro: 'Vane buried Sump under its own tailings and calls the pit hers now. She shoots once. She rarely needs twice.',
    reinforcementCallout: 'Vane: "Flush him toward me. I\'ll close the lid."',
  },
  {
    name: 'Brant Oxwell',
    epithet: 'Foundry',
    occupies: 'town-2',
    intro: 'Oxwell runs The Kiln as a war-camp now, feeding wrecks into the furnace. He walks straight at you and does not stop.',
    reinforcementCallout: 'Oxwell: "Stoke the fire! Feed him in!"',
  },
  {
    name: 'Ammar Vesh',
    epithet: 'Coldwater',
    occupies: 'town-3',
    intro: 'Vesh drained the Longwater domes to the salt and kites the ruins like a wasp. Fast, and never where you last shot.',
    reinforcementCallout: 'Vesh: "Wings on me. Cut him from three sides."',
  },
  {
    name: 'Kestrel',
    epithet: 'the Clean Kill',
    occupies: 'town-4',
    intro: 'Kestrel holds Halberd Station — and the town still stands, untouched, every light burning. That is how you know it is her.',
    reinforcementCallout: 'Kestrel: "Two more. Quick and clean. Like I taught you.\"',
  },
] as const

export function aceForTown(townIndex: number): CombatAce | undefined {
  return CAMPAIGN_ACES[townIndex]
}

/**
 * Reinforcement comms line for a boss by name (§3.6). The finale boss mech name
 * carries the epithet (e.g. `Warlord Kass "Rustjaw"`), so match if the given name
 * contains the ace's name. Chain-Sanction targets (Enforcer Hollis, etc.) have no
 * bespoke ace line and get the terse generic fallback.
 */
export function reinforcementCallout(bossName: string): string {
  const ace = CAMPAIGN_ACES.find((a) => bossName.includes(a.name))
  return ace?.reinforcementCallout ?? `${bossName}: "Reinforcements — converge on the Frame!"`
}

// ============================================================================
// §2.5 — Act structure over the exploring -> finale -> ended machine
// ============================================================================

export type ActId = 1 | 2 | 3

/**
 * Which act a run is in, layered on the existing phase machine (§2.5). We do NOT
 * widen StoryPhase — Act I/II both live in `exploring` (split by whether the
 * player has completed any quests yet), Act III is `finale`, and the tribunal is
 * `ended`. `chapter` (added to StoryRun by SYSTEMS) is honoured when present so
 * beats can be advanced explicitly; otherwise the act is derived.
 */
export function actForRun(input: {
  phase: 'exploring' | 'finale' | 'ended'
  questsCompleted: number
  chapter?: number
}): ActId {
  if (input.phase === 'finale' || input.phase === 'ended') return 3
  if (typeof input.chapter === 'number' && input.chapter >= 2) return 2
  return input.questsCompleted > 0 ? 2 : 1
}

// ============================================================================
// §2.3 — Major Vaun comms beats + Kestrel escalation
// ============================================================================

export type VaunBeatId =
  | 'arrival'
  | 'act1-first-chain'
  | 'act2-open'
  | 'act2-pressure'
  | 'act3-order'

/**
 * Major Sela Vaun — Directorate handler, comms-only, cold and competent (§2.3).
 * These are the act-transition callouts the host fires as a banner/log line; the
 * full branching Act III order lives in the dialogue tree (`vaunSanctionTree`).
 */
export const VAUN_COMMS: Record<VaunBeatId, string> = {
  arrival:
    "Vaun: \"Pilot, this is Major Vaun, Directorate command. You're my only asset in the Talus Reach, so I'll be blunt: the capital wrote this belt off a decade ago. I didn't. Get to Warden's Rest, keep it breathing, and try to remember the Frame is a scalpel, not a hammer.\"",
  'act1-first-chain':
    'Vaun: "Warden\'s Rest holds. Good work, and I mean that — clean runs keep towns standing and keep me off your comms. Four more settlements out there. I can\'t save all of them. Neither can you."',
  'act2-open':
    'Vaun: "The Combine\'s pushing harder along the whole Reach. Pick your towns, pilot. Every hour you spend in one is an hour the others bleed. I need efficiency, not sentiment."',
  'act2-pressure':
    "Vaun: \"The Combine's fielding aces now — named ones. One of them's flying like she trained under us, because she did. Watch your six. And pilot — the towns you're not saving are already on my write-off list. Don't make me file them.\"",
  'act3-order':
    "Vaun: \"New orders, and you won't like them. The Reach is declared unrecoverable. Directorate is pulling out and salting what we leave. Any settlement you haven't secured is a Combine asset now — the aces already moved in. Withdraw, or clear them against orders. Open a channel when you've decided. — Vaun, out.\"",
}

/** Kestrel's escalating sightings across Act II (surfaced as intercepted comms). */
export const KESTREL_SIGHTINGS: readonly string[] = [
  'Intercept — Kestrel: "I know that gait. Sixty tons and still light on your feet. Hello again."',
  'Intercept — Kestrel: "Look at the mess you leave. I take my towns clean and they never even file a complaint. You should try getting out of the machine sometime."',
  'Intercept — Kestrel: "You\'re still fighting Vaun\'s war. I stopped. That\'s the only difference between us — and it\'s the whole difference."',
] as const

/** Kestrel's reveal line — the mirror named out loud (§2.3). */
export const KESTREL_REVEAL =
  'Kestrel: "You want to know how my towns stay standing? I get out of the machine. That\'s it. That\'s the whole secret. I stopped pretending the Frame was the mercy."'

/** Rooker names the trick the first time the player notices Kestrel\'s clean towns (§2.3/§4.2). */
export const ROOKER_KESTREL_LINE =
  'Rooker: "Her towns don\'t decay. You noticed. She gets out of the machine — dismounts, does the work on foot, leaves. That\'s the whole secret. You just have to want to."'

// ============================================================================
// §2 tribunal — verdict copy for the credits ledger
// ============================================================================

/** Flag/summary inputs the tribunal copy reads (SYSTEMS supplies from storyFlags). */
export interface TribunalSummary {
  /** Player defied Vaun's Act III withdrawal order (storyFlag: refused-order). */
  refusedOrders: boolean
  /** Player complied with the scorched-withdrawal order. */
  obeyedWithdrawal: boolean
  /** Towns left to the aces (abandoned, uncleared). */
  townsAbandoned: number
}

interface TribunalFinding {
  /** The verdict reframed as a tribunal finding header. */
  finding: string
  /** The body of the finding — how history and the survivors remember you. */
  detail: string
}

/** Base finding per verdict tier (§2 tribunal row). */
export const TRIBUNAL_FINDINGS: Record<Verdict, TribunalFinding> = {
  Hero: {
    finding: 'FINDING: EXEMPLARY CONDUCT',
    detail:
      'The tribunal records that the Reach stands. Where the accused fought, roofs stayed on and wells stayed clean. The survivors gave testimony without being asked. History will call this restraint; the people who lived it call it mercy.',
  },
  Mercenary: {
    finding: 'FINDING: SERVICE RENDERED',
    detail:
      'The tribunal records a war competently fought and a ledger that mostly balances. The accused saved what could be saved and billed the rest. No town sings the name; none curses it. The Reach remembers a professional who came, did the job, and left it standing enough.',
  },
  Menace: {
    finding: 'FINDING: RECKLESS ENDANGERMENT',
    detail:
      'The tribunal records craters where the accused meant to help. The intent is not in question; the rubble is. Towns that survived the Combine did not survive the rescue. History files this under good soldiers and the wreckage they leave behind.',
  },
  Monster: {
    finding: 'FINDING: CATASTROPHIC HARM',
    detail:
      'The tribunal records the Talus Reach as it was left: emptied, cratered, salted. The Combine took ground; the accused took everything else. The few who lived do not distinguish between the two. History will file this under natural disaster, and be kind in doing so.',
  },
}

/**
 * Full tribunal copy for the credits: the base finding plus flag-aware addenda
 * that reference the run's storyFlags (§2 — the verdict reads the record back).
 * Returns an ordered list of paragraphs.
 */
export function tribunalVerdictCopy(verdict: Verdict, summary: TribunalSummary): string[] {
  const base = TRIBUNAL_FINDINGS[verdict]
  const out: string[] = [base.finding, base.detail]

  if (summary.refusedOrders) {
    out.push(
      'ADDENDUM: The record notes that the accused refused a direct Directorate order to withdraw and salt the Reach, and turned instead on the occupying aces. Command entered this as insubordination. The survivors entered it as the day someone finally chose them.',
    )
  } else if (summary.obeyedWithdrawal) {
    out.push(
      'ADDENDUM: The record notes that the accused executed the withdrawal order as issued. The Reach was surrendered intact to the Combine and to the aces who hold it. Command commends the discipline. The abandoned do not.',
    )
  }

  if (summary.townsAbandoned > 0) {
    const n = summary.townsAbandoned
    out.push(
      `ADDENDUM: ${n} settlement${n === 1 ? '' : 's'} left to the aces. Their names are read into the record so the tribunal cannot pretend they were forgotten.`,
    )
  }

  return out
}
