/**
 * NARRATIVE CONTENT — authored dialogue trees (GRINDER §2 / §4.5, Phase 3).
 *
 * Built to the SHARED DIALOGUE CONTRACT in `./dialogue`. Pure data: no Vue, no
 * THREE, no state. SYSTEMS resolves `requires`/`effects` against run rep+flags;
 * the UI walks a tree from `entry`, showing a node and its (gated) choices.
 *
 * Trees authored here:
 *   - one per town warden (offer / decline / mood, standing-gated lines) — §4.5
 *   - Major Vaun's Act I arrival + Act II escalation comms — §2.3
 *   - Vaun's Act III sanction order with the refuse-order branch — §4.5
 *   - the Kestrel confrontation (the mirror reveal) — §2.3
 *   - Rooker's garage opener + the Kestrel-mirror line — §2.3 / §4.2
 *
 * A choice with `effects.action: 'acceptQuest'` accepts the town's CURRENT quest
 * (SYSTEMS resolves the id via useStoryMode.getCurrentQuest); the warden's spoken
 * lines are voice, while the per-mission BRIEFING is authored on the QuestDef
 * (quests.ts) and shown by the UI alongside. `refuseOrder` is the Act III beat;
 * it sets the `refused-order` flag the finale and tribunal read.
 *
 * Register throughout: terse military sci-fi. Each warden's voice tracks their
 * disposition (grateful / bitter / opportunist / zealot / broken).
 */

import type { DialogueTree } from './dialogue'

// Flags the trees set (documented so SYSTEMS/finale/tribunal can read them):
export const STORY_FLAGS = {
  /** Player refused Vaun's Act III withdrawal order. */
  REFUSED_ORDER: 'refused-order',
  /** Player accepted/obeyed the scorched-withdrawal order. */
  OBEYED_WITHDRAWAL: 'obeyed-withdrawal',
  /**
   * Player NOTICED that Kestrel leaves her towns intact (the clean-towns brag in
   * her Act II intercepts). Set by SYSTEMS while exploring, BEFORE the finale, so
   * Rooker can name the dismount trick first — the §4.2 teaching beat.
   */
  SAW_KESTREL_CLEAN: 'saw-kestrel-clean',
  /** Player heard Kestrel explain the dismount trick herself (the finale reveal). */
  SAW_KESTREL_TRUTH: 'saw-kestrel-truth',
  /** Rooker has named the Kestrel trick to the player. */
  ROOKER_NAMED_TRICK: 'rooker-named-trick',
} as const

// ============================================================================
// Town warden trees (§4.5) — keyed by town id
// ============================================================================

const wardensRestTree: DialogueTree = {
  entry: 'greet',
  nodes: {
    greet: {
      id: 'greet',
      speaker: 'Sgt. Iolo Track',
      text: 'Pilot. Wire held another night — that\'s down to you. Don\'t let it go to your head; the Reach eats heroes for rations.',
      choices: [
        { text: "What's the job, Sergeant?", next: 'offer' },
        { text: "How's the Rest holding?", next: 'mood' },
        {
          text: "The Rest looks after you, Sergeant.",
          next: 'warm',
          requires: { minTownRep: 60 },
        },
        { text: 'Later.', effects: { action: 'end' } },
      ],
    },
    offer: {
      id: 'offer',
      speaker: 'Sgt. Iolo Track',
      text: "There's work on the board and it won't keep. Read the brief, then tell me you\'re in. I don\'t send a Frame out on a maybe.",
      choices: [
        { text: 'I\'m in. Mounting up.', next: 'accepted', effects: { action: 'acceptQuest' } },
        { text: 'Not yet.', next: 'declined', effects: { action: 'declineQuest' } },
        { text: 'How\'s the town?', next: 'mood' },
      ],
    },
    accepted: {
      id: 'accepted',
      speaker: 'Sgt. Iolo Track',
      text: "Good. Clean and fast, pilot — every minute that Frame stands in the Rest, the Rest pays for it. Go.",
      choices: [],
    },
    declined: {
      id: 'declined',
      speaker: 'Sgt. Iolo Track',
      text: "Understood. It'll still be here when you\'ve got the stomach. So will they.",
      choices: [{ text: 'Step back.', effects: { action: 'end' } }],
    },
    mood: {
      id: 'mood',
      speaker: 'Sgt. Iolo Track',
      text: "Refugees in the barracks, kids on the wire who should be in school. We hold because there\'s nowhere behind us to run to. That\'s the whole strategy.",
      choices: [
        { text: 'Give me the job.', next: 'offer' },
        { text: 'Understood.', effects: { action: 'end' } },
      ],
    },
    warm: {
      id: 'warm',
      speaker: 'Sgt. Iolo Track',
      text: "Twenty years I\'ve saluted people who got us killed on paper. You I\'d follow on foot. Don\'t make me regret saying it.",
      choices: [
        { text: 'Then let\'s work.', next: 'offer' },
        { text: 'Noted, Sergeant.', effects: { action: 'end' } },
      ],
    },
  },
}

const sumpTree: DialogueTree = {
  entry: 'greet',
  nodes: {
    greet: {
      id: 'greet',
      speaker: 'Dessa Korr',
      text: "Frame pilot. Wonderful. Try not to stand anywhere important — the ground here\'s hollow and so\'s my patience. What do you want?",
      choices: [
        { text: 'Work. What have you got?', next: 'offer' },
        { text: "How's Sump?", next: 'mood' },
        {
          text: "You\'ve stopped spitting when I pass, Korr.",
          next: 'warm',
          requires: { minTownRep: 60 },
        },
        { text: 'Nothing.', effects: { action: 'end' } },
      ],
    },
    offer: {
      id: 'offer',
      speaker: 'Dessa Korr',
      text: "There\'s a job. It\'s ugly, it\'s on the board, and it\'ll cost somebody something. Read it. If you\'re taking it, take it — don\'t stand there dripping resolve on my floor.",
      choices: [
        { text: 'I\'ll take it.', next: 'accepted', effects: { action: 'acceptQuest' } },
        { text: 'Not this one.', next: 'declined', effects: { action: 'declineQuest' } },
        { text: 'Tell me about Sump first.', next: 'mood' },
      ],
    },
    accepted: {
      id: 'accepted',
      speaker: 'Dessa Korr',
      text: "Then go. And pilot — every step that machine takes in my town, a beam creaks somewhere I can\'t see. Be quick.",
      choices: [],
    },
    declined: {
      id: 'declined',
      speaker: 'Dessa Korr',
      text: "Course not. Nobody takes the ugly ones till they have to. I\'ll be here. I\'m always here.",
      choices: [{ text: 'Step back.', effects: { action: 'end' } }],
    },
    mood: {
      id: 'mood',
      speaker: 'Dessa Korr',
      text: "We dig, the pit takes some of us, we dig again. The Directorate sends a Frame instead of shoring the drifts. I\'ve stopped expecting better. Stops it hurting.",
      choices: [
        { text: 'What\'s the job?', next: 'offer' },
        { text: 'Understood.', effects: { action: 'end' } },
      ],
    },
    warm: {
      id: 'warm',
      speaker: 'Dessa Korr',
      text: "Don\'t read into it. You pulled people out of the dark instead of adding to the pile. That\'s rarer up here than you\'d think. That\'s all.",
      choices: [
        { text: 'Put me to work, then.', next: 'offer' },
        { text: 'Fair enough.', effects: { action: 'end' } },
      ],
    },
  },
}

const kilnTree: DialogueTree = {
  entry: 'greet',
  nodes: {
    greet: {
      id: 'greet',
      speaker: 'Sabik Voss',
      text: "Ah — the Directorate\'s big expensive stick. Come in, mind the pour. Everything in The Kiln is for sale, pilot, including my full attention. What\'s it buying today?",
      choices: [
        { text: 'You\'ve got work for a Frame.', next: 'offer' },
        { text: "Whose side are you on, Voss?", next: 'mood' },
        {
          text: "You trust me with the real jobs now.",
          next: 'warm',
          requires: { minTownRep: 60 },
        },
        { text: 'Not today.', effects: { action: 'end' } },
      ],
    },
    offer: {
      id: 'offer',
      speaker: 'Sabik Voss',
      text: "I do. It\'s on the board, dressed up as a threat to the town — and it is one, don\'t misunderstand. It\'s also good for business. The two aren\'t always enemies. Interested?",
      choices: [
        { text: 'I\'ll do it.', next: 'accepted', effects: { action: 'acceptQuest' } },
        { text: 'I don\'t do your errands.', next: 'declined', effects: { action: 'declineQuest' } },
        { text: 'Whose side are you on?', next: 'mood' },
      ],
    },
    accepted: {
      id: 'accepted',
      speaker: 'Sabik Voss',
      text: "Splendid. Do try to be tidy — a wrecked town buys nothing, and a Frame standing idle in my streets is just expensive weather. Off you go.",
      choices: [],
    },
    declined: {
      id: 'declined',
      speaker: 'Sabik Voss',
      text: "No harm. The offer keeps — offers always keep. Someone will take it. Someone always does.",
      choices: [{ text: 'Walk out.', effects: { action: 'end' } }],
    },
    mood: {
      id: 'mood',
      speaker: 'Sabik Voss',
      text: "Sides? I\'m on the furnace\'s side. It doesn\'t care whose flag the ore ships under, and neither do I. The Kiln outlives every side that\'s ever come through — because I sell to all of them.",
      choices: [
        { text: 'The job, Voss.', next: 'offer' },
        { text: 'Right.', effects: { action: 'end' } },
      ],
    },
    warm: {
      id: 'warm',
      speaker: 'Sabik Voss',
      text: "You\'ve turned a profit for this town without burning it down. That is a rarer skill than shooting, pilot, and I reward rarity. The good contracts are yours first now.",
      choices: [
        { text: 'Show me the good ones.', next: 'offer' },
        { text: 'Later.', effects: { action: 'end' } },
      ],
    },
  },
}

const longwaterTree: DialogueTree = {
  entry: 'greet',
  nodes: {
    greet: {
      id: 'greet',
      speaker: 'Mother Enye',
      text: "The iron giant walks among the green. Providence is heavy-handed, but it is not blind. Speak, pilot. The water is listening.",
      choices: [
        { text: 'I\'m here to work.', next: 'offer' },
        { text: 'How does Longwater fare?', next: 'mood' },
        {
          text: "The faithful speak your name, Mother.",
          next: 'warm',
          requires: { minTownRep: 60 },
        },
        { text: 'Not now.', effects: { action: 'end' } },
      ],
    },
    offer: {
      id: 'offer',
      speaker: 'Mother Enye',
      text: "There is a trial set before us, written on your board in the tongue of soldiers. Read it and be the answer. But know this — the Frame is a flood. Use it, and something downstream drowns.",
      choices: [
        { text: 'I\'ll be the answer.', next: 'accepted', effects: { action: 'acceptQuest' } },
        { text: 'Not this trial.', next: 'declined', effects: { action: 'declineQuest' } },
        { text: 'Tell me of Longwater.', next: 'mood' },
      ],
    },
    accepted: {
      id: 'accepted',
      speaker: 'Mother Enye',
      text: "Go, then, and go swiftly. Every hour the flood stands still in our domes, our green pays the tithe. Providence favours the quick and the clean.",
      choices: [],
    },
    declined: {
      id: 'declined',
      speaker: 'Mother Enye',
      text: "Faith is patient. The trial will wait for you, and the water will remember who hesitated when it called.",
      choices: [{ text: 'Withdraw.', effects: { action: 'end' } }],
    },
    mood: {
      id: 'mood',
      speaker: 'Mother Enye',
      text: "We hold the last green in the Reach behind glass and prayer. The war would drink us dry and call it strategy. We call it a test. We have not failed one yet.",
      choices: [
        { text: 'What must be done?', next: 'offer' },
        { text: 'Understood.', effects: { action: 'end' } },
      ],
    },
    warm: {
      id: 'warm',
      speaker: 'Mother Enye',
      text: "They light a lamp for you at the pumps each night. Do not let it make you careless, giant — providence lifts up those it means to test hardest. You are being lifted.",
      choices: [
        { text: 'Then set me a task.', next: 'offer' },
        { text: 'I\'ll carry it.', effects: { action: 'end' } },
      ],
    },
  },
}

const halberdTree: DialogueTree = {
  entry: 'greet',
  nodes: {
    greet: {
      id: 'greet',
      speaker: 'Cull',
      text: "...Oh. A pilot. They still send those. Sett said one might come. Didn\'t believe her. Don\'t much believe you, either. What.",
      choices: [
        { text: 'I\'m here to help. What\'s the job?', next: 'offer' },
        { text: "How's the station?", next: 'mood' },
        {
          text: "The line\'s running because of you, Cull.",
          next: 'warm',
          requires: { minTownRep: 60 },
        },
        { text: 'Nothing.', effects: { action: 'end' } },
      ],
    },
    offer: {
      id: 'offer',
      speaker: 'Cull',
      text: "Help. Right. There\'s a thing on the board Sett wrote up — she still thinks the station can be saved. Read it. Do it or don\'t. Doesn\'t change much either way. ...But do read it.",
      choices: [
        { text: 'I\'ll do it.', next: 'accepted', effects: { action: 'acceptQuest' } },
        { text: 'Maybe later.', next: 'declined', effects: { action: 'declineQuest' } },
        { text: 'Tell me about Halberd.', next: 'mood' },
      ],
    },
    accepted: {
      id: 'accepted',
      speaker: 'Cull',
      text: "Huh. All right. Be quick with that machine — every step it takes, the platform sheds another rivet, and we\'re short on rivets. And pilot. ...Sett\'ll be glad. Go.",
      choices: [],
    },
    declined: {
      id: 'declined',
      speaker: 'Cull',
      text: "Yeah. Figured. Everyone means to come back to Halberd. Nobody does. I\'ll tell Sett you were busy.",
      choices: [{ text: 'Step back.', effects: { action: 'end' } }],
    },
    mood: {
      id: 'mood',
      speaker: 'Cull',
      text: "Junction town with no junction. One generator, one daughter too stubborn to leave, one drunk stationmaster. Line died a year ago. Most of the hope went with it. Sett kept some. Don\'t know where she hides it.",
      choices: [
        { text: 'Let\'s change that. The job?', next: 'offer' },
        { text: 'Understood.', effects: { action: 'end' } },
      ],
    },
    warm: {
      id: 'warm',
      speaker: 'Cull',
      text: "Heard a train last week. Real one. Sett cried; I pretended not to. First time in a year I looked down the line and saw something coming instead of nothing. That\'s you. ...Thanks. Won\'t say it twice.",
      choices: [
        { text: 'Then let\'s keep it running.', next: 'offer' },
        { text: 'You don\'t have to.', effects: { action: 'end' } },
      ],
    },
  },
}

/** All five warden trees, keyed by town id. */
export const WARDEN_TREES: Record<string, DialogueTree> = {
  'town-0': wardensRestTree,
  'town-1': sumpTree,
  'town-2': kilnTree,
  'town-3': longwaterTree,
  'town-4': halberdTree,
}

// ============================================================================
// Major Vaun comms trees (§2.3)
// ============================================================================

/** Act I — arrival briefing (deployment). */
export const vaunArrivalTree: DialogueTree = {
  entry: 'hail',
  nodes: {
    hail: {
      id: 'hail',
      speaker: 'Maj. Vaun',
      text: "Pilot, Major Vaun, Directorate command. You\'re my only asset in the Talus Reach and the capital wrote this belt off a decade ago. I didn\'t. Get to Warden\'s Rest, keep it breathing.",
      choices: [
        { text: 'Understood, Major.', next: 'signoff' },
        { text: 'Why here? Why me?', next: 'why' },
      ],
    },
    why: {
      id: 'why',
      speaker: 'Maj. Vaun',
      text: "Because the Reach is cheap to lose and expensive to hold, and you\'re what I could spare. Five settlements, one Frame, no reinforcements coming. The Frame is a scalpel, pilot. Everyone up here will beg you to use it as a hammer.",
      choices: [{ text: 'Understood.', next: 'signoff' }],
    },
    signoff: {
      id: 'signoff',
      speaker: 'Maj. Vaun',
      text: "Then earn the fuel we spent getting you here. Keep the towns standing and keep me off your channel. Vaun, out.",
      choices: [{ text: 'Close channel.', effects: { action: 'end' } }],
    },
  },
}

/** Act II — the grind; orders tighten, aces named. */
export const vaunEscalationTree: DialogueTree = {
  entry: 'hail',
  nodes: {
    hail: {
      id: 'hail',
      speaker: 'Maj. Vaun',
      text: "The Combine\'s pushing the whole Reach now, and they\'re fielding named aces — one of them flies like she trained under us. Pick your towns, pilot. Every hour in one is an hour the others bleed.",
      choices: [
        { text: 'I\'ll save who I can.', next: 'signoff' },
        { text: 'Trained under us? Who?', next: 'kestrel' },
        { text: 'I can hold more than you think.', next: 'push' },
      ],
    },
    kestrel: {
      id: 'kestrel',
      speaker: 'Maj. Vaun',
      text: "Callsign Kestrel. If you pulled Aro\'s recorder off the salt, you already have the name — I\'d hoped you wouldn\'t hear it this soon. Directorate ace, defected three years back, took half her squadron\'s respect with her. She kills clean and she doesn\'t linger. If your paths cross, do not hesitate — she won\'t.",
      choices: [{ text: 'Understood.', next: 'signoff' }],
    },
    push: {
      id: 'push',
      speaker: 'Maj. Vaun',
      text: "I hope you\'re right. But hear me: the towns you don\'t secure are already on my write-off list. Don\'t make me file them, and don\'t break yourself trying to save what the math says is gone.",
      choices: [{ text: 'Understood.', next: 'signoff' }],
    },
    signoff: {
      id: 'signoff',
      speaker: 'Maj. Vaun',
      text: "Efficiency, pilot. Not sentiment. Vaun, out.",
      choices: [{ text: 'Close channel.', effects: { action: 'end' } }],
    },
  },
}

/**
 * Act III — the sanction order, with the refuse-order branch (§4.5). Refusing
 * costs Command standing, raises Town standing, and sets the `refused-order`
 * flag the finale and the tribunal read back. Complying sets `obeyed-withdrawal`.
 */
export const vaunSanctionTree: DialogueTree = {
  entry: 'order',
  nodes: {
    order: {
      id: 'order',
      speaker: 'Maj. Vaun',
      text: "New orders, pilot, and you won\'t like them. The Reach is declared unrecoverable. Directorate is withdrawing and salting what we leave. Any town you haven\'t secured is a Combine asset now — the aces already moved in. Stand down and pull out.",
      choices: [
        { text: 'Understood. Withdrawing.', next: 'comply', effects: { setFlags: ['obeyed-withdrawal'], commandRep: 10 } },
        { text: 'Negative. I\'m clearing those towns.', next: 'refuse', effects: { action: 'refuseOrder', setFlags: ['refused-order'], commandRep: -25, townRep: 20 } },
        { text: 'Why salt them? They\'re ours.', next: 'why' },
      ],
    },
    why: {
      id: 'why',
      speaker: 'Maj. Vaun',
      text: "Because a live town under Combine control is a supply depot pointed at us. Denial isn\'t cruelty, pilot, it\'s arithmetic — I\'ve run it a hundred times and it comes out the same. That doesn\'t make it feel like anything but what it is.",
      choices: [
        { text: 'Understood. Withdrawing.', next: 'comply', effects: { setFlags: ['obeyed-withdrawal'], commandRep: 10 } },
        { text: 'Your arithmetic can go to hell. I\'m clearing them.', next: 'refuse', effects: { action: 'refuseOrder', setFlags: ['refused-order'], commandRep: -25, townRep: 20 } },
      ],
    },
    comply: {
      id: 'comply',
      speaker: 'Maj. Vaun',
      text: "Good soldier. Fall back to the extraction line and don\'t look at the fires; it doesn\'t help and it doesn\'t change the math. You did what could be done. Vaun, out.",
      choices: [],
    },
    refuse: {
      id: 'refuse',
      speaker: 'Maj. Vaun',
      text: "Then you\'re off the books, pilot. No support, no extraction, no record that says you followed orders — because you didn\'t. ...For what it\'s worth, and it\'s worth nothing operationally: I hope you win. Vaun, out.",
      choices: [],
    },
  },
}

// ============================================================================
// Kestrel confrontation (§2.3) — the mirror reveal
// ============================================================================

/**
 * Fired when the player engages the Kestrel-held finale town. The reveal branch
 * sets `saw-kestrel-truth`. Every path lands on the fight — the confrontation is
 * a beat before combat, not an alternative to it.
 */
export const kestrelConfrontationTree: DialogueTree = {
  entry: 'hail',
  nodes: {
    hail: {
      id: 'hail',
      speaker: 'Kestrel',
      text: "So you came for me after all. I hoped you'd know better — I'm the one who taught you to read a fight before you wrecked it. Look at the town behind me, pilot: every light still on, every roof where I found it. That's not Vaun's mercy. When did one of yours last look like this?",
      choices: [
        { text: 'You\'re a traitor, Kestrel.', next: 'accuse' },
        { text: 'How are your towns always clean?', next: 'reveal' },
        { text: 'Save it. We do this the loud way.', next: 'fight' },
      ],
    },
    accuse: {
      id: 'accuse',
      speaker: 'Kestrel',
      text: "Traitor. To Vaun\'s arithmetic, sure. She\'d have salted this place a month ago and called it a clean withdrawal. I kept it standing. You tell me which of us betrayed the people who actually live here.",
      choices: [
        { text: 'Then how do you keep it standing?', next: 'reveal' },
        { text: 'Doesn\'t matter now.', next: 'fight' },
      ],
    },
    reveal: {
      id: 'reveal',
      speaker: 'Kestrel',
      text: "You want the secret? I get out of the machine. That\'s it. I dismount, I do the work on foot, I leave before the ground remembers my weight. The Frame was never the mercy, pilot. Getting out of it is. You still haven\'t learned that.",
      choices: [
        { text: 'Maybe I have. Doesn\'t save you.', next: 'fight', effects: { setFlags: ['saw-kestrel-truth'] } },
        { text: 'Too late for both of us.', next: 'fight', effects: { setFlags: ['saw-kestrel-truth'] } },
      ],
    },
    fight: {
      id: 'fight',
      speaker: 'Kestrel',
      text: "Then spool up. Let\'s see if you learned anything at all. Try to keep it clean — for once.",
      choices: [{ text: 'Engage.', effects: { action: 'end' } }],
    },
  },
}

// ============================================================================
// Rooker — quartermaster / garage (§2.3, §4.2 mirror line)
// ============================================================================

/**
 * Rooker at the garage: opens the Garage UI, and — once the player has NOTICED a
 * clean Kestrel town (her Act II clean-towns brag, `saw-kestrel-clean`) — names
 * the dismount trick out loud (§4.2), setting `rooker-named-trick`. Gated on the
 * exploring-era `saw-kestrel-clean`, NOT the finale-only `saw-kestrel-truth`, so
 * Rooker TEACHES the mercy first and Kestrel later confirms it — not the reverse.
 */
export const rookerTree: DialogueTree = {
  entry: 'greet',
  nodes: {
    greet: {
      id: 'greet',
      speaker: 'Rooker',
      text: "Frame\'s a mess, as usual. Sit it down and let me look. I ran with the Combine long enough to know what a Frame does to a town — so don\'t stand it in the square while we talk. What do you need?",
      choices: [
        { text: 'Open her up. Let\'s work.', effects: { action: 'openGarage' } },
        { text: 'Kestrel\'s towns — they never decay. How?', next: 'mirror', requires: { flag: 'saw-kestrel-clean' } },
        { text: 'What did the Combine teach you?', next: 'combine' },
        { text: 'Nothing right now.', effects: { action: 'end' } },
      ],
    },
    mirror: {
      id: 'mirror',
      speaker: 'Rooker',
      text: "You noticed. Good — most pilots never do. Her towns don\'t decay because she gets out of the machine. Dismounts, does the work on foot, leaves before the weight settles. That\'s the whole secret. You just have to want to.",
      choices: [
        { text: 'I want to.', next: 'greet', effects: { setFlags: ['rooker-named-trick'] } },
        { text: 'It\'s not that simple.', next: 'combine', effects: { setFlags: ['rooker-named-trick'] } },
      ],
    },
    combine: {
      id: 'combine',
      speaker: 'Rooker',
      text: "That both sides run the same war with different flags, and the Frame doesn\'t care which one\'s painted on it. It flattens the same either way. I deserted the day I understood the machine was the enemy, not the men in it. Now — your loadout?",
      choices: [
        { text: 'Open the garage.', effects: { action: 'openGarage' } },
        { text: 'Later.', effects: { action: 'end' } },
      ],
    },
  },
}

// ============================================================================
// Registry — every authored tree, for the integrator to mount
// ============================================================================

/**
 * Flat registry of all trees by a stable id. WARDEN_TREES are also exposed keyed
 * by town id for the on-foot warden hookup. INTEGRATOR SEAM: the UI mounts a
 * tree by id; SYSTEMS resolves requires/effects against run rep + storyFlags.
 */
export const ALL_DIALOGUE_TREES: Record<string, DialogueTree> = {
  'warden:town-0': wardensRestTree,
  'warden:town-1': sumpTree,
  'warden:town-2': kilnTree,
  'warden:town-3': longwaterTree,
  'warden:town-4': halberdTree,
  'vaun:arrival': vaunArrivalTree,
  'vaun:escalation': vaunEscalationTree,
  'vaun:sanction': vaunSanctionTree,
  'kestrel:confrontation': kestrelConfrontationTree,
  'rooker:garage': rookerTree,
}

/** The warden tree for a given town id (null if none). */
export function wardenTreeForTown(townId: string): DialogueTree | null {
  return WARDEN_TREES[townId] ?? null
}
