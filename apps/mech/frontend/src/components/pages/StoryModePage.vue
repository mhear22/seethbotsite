<template>
  <div class="story-mode-page">
    <!-- Back navigation (hidden once roaming for an immersive view) -->
    <div v-if="!roaming" class="flow-navigation">
      <button type="button" class="flow-pill action" @click="returnToBattle">← Menu</button>
      <span class="flow-pill current">Story Mode</span>
    </div>

    <!-- Intro / start screen -->
    <div v-if="!roaming" class="screen story-intro">
      <div class="screen-content">
        <h1>The Talus Reach</h1>
        <p class="tagline">
          Sixty tons of Directorate Frame in a colony belt the war forgot. You are the
          only thing that can save these towns — and the reason they need saving.
        </p>
        <div class="button-group">
          <button v-if="hasSave" class="start-btn" @click="continueRun">Continue Run</button>
          <button class="settings-btn" @click="startNewRun">New Run</button>
          <button class="back-btn" @click="returnToBattle">Back</button>
        </div>
        <p v-if="hasSave" class="save-hint">A saved run was found (single slot). “New Run” overwrites it.</p>
      </div>
    </div>

    <!-- The persistent open world -->
    <template v-if="roaming">
      <canvas ref="canvasRef" class="story-canvas"></canvas>

      <!-- Top status HUD -->
      <div class="story-hud">
        <div class="hud-money">◈ {{ salvage }}</div>
        <div class="hud-phase">{{ phaseLabel }} · {{ happyCount }}/3 held</div>
      </div>

      <!-- Town HUD: name, color-coded condition bar, both reputation axes, cues -->
      <TownHud
        v-if="nearestTownName"
        :name="nearestTownName"
        :condition="nearestTownCondition"
        :standing="nearestTownStanding"
        :distance="nearestTownDistance"
        :inside="insideTown"
        :command-rep="commandRep"
        :collateral-tick="collateralTick"
      />

      <!-- Active-quest objective tracker -->
      <div v-if="activeQuestObjective" class="story-objective">
        <span class="obj-type">{{ activeQuestTypeLabel }}</span>
        <span class="obj-text">{{ activeQuestObjective }}</span>
      </div>

      <!-- Quest-giver interaction prompt -->
      <div v-if="canTalkToQuestGiver" class="story-interact">
        <span class="key">E</span> Talk to {{ questGiverTownName }}’s quest giver
      </div>

      <!-- Toast for quest results / equip results -->
      <transition name="fade">
        <div v-if="toast" class="story-toast" :class="{ bad: toastBad }">{{ toast }}</div>
      </transition>

      <div class="story-controls-hint">
        WASD move · Mouse look · Shift dash · Space jump · LMB/RMB fire · E interact
      </div>

      <button type="button" class="story-exit" @click="returnToBattle">Exit to Menu</button>

      <!-- On-screen controls (touch devices only; self-gates). Hidden while a panel is open. -->
      <TouchControls
        v-if="!showDialog && !showGarage && !showCredits && !storyTree"
        :input="touchInput"
        context="story"
      />

      <!-- Quest-giver dialogue (authored warden tree; falls back to summary) -->
      <QuestDialog
        v-if="showDialog && dialogTown"
        :town-name="dialogTown.name"
        :quest="dialogQuest"
        :tree="wardenTree"
        :is-choice-available="dialogueChoiceAvailable"
        :seen-briefing="dialogSeenBriefing"
        @choice-selected="onWardenChoice"
        @accept="onAcceptQuest"
        @open-garage="openGarageFromDialog"
        @close="closeDialog"
      />

      <!-- Story dialogue: Vaun's Act III order + the Kestrel confrontation -->
      <div v-if="storyTree" class="story-dialogue-backdrop">
        <div class="story-dialogue-panel">
          <DialogueView
            :tree="storyTree"
            :is-choice-available="dialogueChoiceAvailable"
            :skippable="true"
            @choice-selected="onStoryChoice"
            @end="onStoryDialogueEnd"
            @skip="onStoryDialogueEnd"
          />
        </div>
      </div>

      <!-- Radio transmissions: Vaun act beats, Kestrel intercepts, ace callouts -->
      <CommsToast ref="commsToastRef" />

      <!-- Garage / shop -->
      <Garage
        v-if="showGarage && story.run.value"
        :money="salvage"
        :loadout="story.run.value.loadout"
        :inventory="story.inventory.value"
        :message="garageMessage"
        :message-error="garageMessageError"
        :price-modifier="garagePriceModifier"
        :part-lock="garagePartLock"
        @equip="onEquip"
        @install="onInstall"
        @repair="onRepair"
        @sell="onSell"
        @close="closeGarage"
      />

      <!-- Credits / damage report (run complete) -->
      <StoryCredits
        v-if="showCredits"
        :reports="story.damageReports.value"
        :stats="story.stats.value"
        :towns-helped="story.townsHelped.value"
        :real-elapsed-sec="story.realElapsedSec.value"
        :avg-destruction="story.avgDestruction.value"
        :verdict="story.verdict.value"
        :title="creditTitle"
        :finding-text="creditFinding"
        :flags="creditFlags"
        @finish="finishRun"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as THREE from 'three'
import { MechEntity } from '../../lib/battle/MechEntity'
import { StoryWorld, type StoryFrameInfo } from '../../lib/story/StoryWorld'
import type { EnemyKill } from '../../lib/story/StoryCombat'
import {
  useStoryMode,
  computeCombatStats,
  isLoadoutValid,
  repPriceModifier,
  isPartStocked,
  partShopTier,
  isPartRepUnlocked,
  partRepAxis,
  townIndexFromId,
  SHOP_TIER_T2_STANDING,
  SHOP_TIER_T3_STANDING,
  MILITARY_REP_UNLOCK,
  CIVILIAN_REP_UNLOCK,
} from '../../composables/useStoryMode'
import { useAudio } from '../../composables/useAudio'
import { useGameSettings } from '../../composables/useGameSettings'
import {
  questTypeLabel,
  questObjective,
  isFinaleBoss,
  type QuestDef,
  type ShopSlot,
} from '../../lib/story/quests'
import {
  VAUN_COMMS,
  KESTREL_SIGHTINGS,
  aceForTown,
  reinforcementCallout,
  tribunalVerdictCopy,
  type VaunBeatId,
} from '../../lib/story/campaign'
import {
  wardenTreeForTown,
  vaunSanctionTree,
  kestrelConfrontationTree,
} from '../../lib/story/dialogueTrees'
import {
  isChoiceAvailable as isDialogueChoiceAvailable,
  type DialogueChoice,
  type DialogueTree,
} from '../../lib/story/dialogue'
import type { MechPart, MechSlot } from '../../shared/types/MechTypes'
import TownHud from '../mech/story/TownHud.vue'
import QuestDialog from '../mech/story/QuestDialog.vue'
import Garage from '../mech/story/Garage.vue'
import StoryCredits from '../mech/story/StoryCredits.vue'
import CommsToast from '../mech/story/CommsToast.vue'
import DialogueView from '../mech/story/DialogueView.vue'
import type { CommsBeat } from '../mech/story/commsTypes'
import TouchControls from '../mech/TouchControls.vue'
import type { InputManager } from '../../lib/battle/InputManager'

const router = useRouter()
const route = useRoute()
const story = useStoryMode()
const audio = useAudio()
const gameSettings = useGameSettings()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const roaming = ref(false)
const hasSave = ref(false)

// Live HUD state fed by the world's per-frame callback.
const nearestTownName = ref<string | null>(null)
const nearestTownDistance = ref(0)
const insideTown = ref(false)
const nearestTownCondition = ref(100)
const nearestTownStanding = ref(0)

// Quest-giver interaction.
const questGiverTownId = ref<string | null>(null)
const encounterActive = ref(false)
const activeQuestObjective = ref('')
const activeQuestTypeLabel = ref('')

// Modals.
const showDialog = ref(false)
const dialogTownId = ref<string | null>(null)
const showGarage = ref(false)
const garageMessage = ref('')
const garageMessageError = ref(false)

// Credits (shown once the run ends).
const showCredits = ref(false)

// --- Phase 3: comms, story dialogue, collateral, economy ---
// One CommsToast instance; beats pushed imperatively so multiple queue cleanly.
const commsToastRef = ref<InstanceType<typeof CommsToast> | null>(null)
// A blocking Vaun/Kestrel dialogue tree (distinct from the warden QuestDialog).
const storyTree = ref<DialogueTree | null>(null)
const storyTreeKind = ref<'sanction' | 'kestrel' | null>(null)
// Monotonic collateral-tax cue for the TownHud pulse + a severity accumulator so
// the HUD flashes on meaningful chunks, not every frame.
const collateralTick = ref(0)
let collateralSeverityAccum = 0
// The town whose garage is open (drives per-town shop stock depth).
const garageTownId = ref<string | null>(null)
// Wardens the player has already briefed with (enables QuestDialog's fast path).
const visitedWardens = new Set<string>()

// Finale bookkeeping: ensure the "finale begins" order fires once, and that we
// only auto-start one boss encounter per town entry.
let finaleAnnounced = false
let pendingFinaleTownId: string | null = null
// Latches the town where we last refused to auto-start a finale fight because the
// Frame wasn't combat-ready, so the "go repair" warning shows once per entry, not
// every frame the player stands there. Cleared on stepping out of that town.
let blockedRedeployTownId: string | null = null
// A Kestrel finale boss held back until her confrontation dialogue resolves.
let pendingKestrelBoss: { boss: QuestDef; townId: string } | null = null

// Input manager for the on-screen touch controls (set once the world is live).
const touchInput = ref<InputManager | null>(null)

// Toast.
const toast = ref('')
const toastBad = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

// World instance is NON-reactive on purpose (holds three.js objects).
let world: StoryWorld | null = null
// Throttle saves: persist decay roughly once per second of accrual.
let saveAccumulator = 0

const salvage = computed(() => story.salvage.value)
const commandRep = computed(() => story.commandRep.value)
const happyCount = computed(() => story.happyCount.value)
const phaseLabel = computed(() => {
  switch (story.phase.value) {
    case 'finale': return 'The Order'
    case 'ended': return 'Tribunal'
    default: return story.chapter.value === 'act1' ? 'Deployment' : 'The Grind'
  }
})

// True only when a quest-giver is in range AND no encounter/modal is blocking.
// During the finale, un-helped target towns are held by a boss (you fight, not
// talk), so their quest-giver is unavailable.
const canTalkToQuestGiver = computed(
  () =>
    questGiverTownId.value !== null &&
    !encounterActive.value &&
    !showDialog.value &&
    !showGarage.value &&
    !showCredits.value &&
    storyTree.value === null &&
    !isFinaleTargetTown(questGiverTownId.value),
)

function isFinaleTargetTown(townId: string | null): boolean {
  if (!townId || story.phase.value !== 'finale') return false
  return story.remainingFinaleTargets.value.some((t) => t.id === townId)
}
const questGiverTownName = computed(
  () => (questGiverTownId.value ? story.getTown(questGiverTownId.value)?.name ?? '' : ''),
)

const dialogTown = computed(() =>
  dialogTownId.value ? story.getTown(dialogTownId.value) : undefined,
)
const dialogQuest = computed<QuestDef | null>(() =>
  dialogTownId.value ? story.getCurrentQuest(dialogTownId.value) : null,
)
/** The authored warden dialogue tree for the town being talked to (§4.5). */
const wardenTree = computed<DialogueTree | null>(() =>
  dialogTownId.value ? wardenTreeForTown(dialogTownId.value) : null,
)
// Captured at open time (BEFORE marking visited) so the first visit always shows
// the full briefing and repeat visits get QuestDialog's fast path.
const dialogSeenBriefing = ref(false)

/**
 * Availability predicate handed to DialogueView / QuestDialog — STATE STAYS IN
 * THE COMPOSABLE. Resolves a `requires`-gated choice against the live run's
 * rep + storyFlags (StoryRun is structurally a DialogueState).
 */
function dialogueChoiceAvailable(choice: DialogueChoice): boolean {
  const run = story.run.value
  if (!run) return true
  return isDialogueChoiceAvailable(choice, run)
}

// --- Tribunal (credits) copy, flag-aware (§2 / §2.5) ---
const tribunalParagraphs = computed(() =>
  tribunalVerdictCopy(story.verdict.value, {
    refusedOrders: story.hasStoryFlag('refused-order'),
    obeyedWithdrawal: story.hasStoryFlag('obeyed-withdrawal'),
    townsAbandoned: story.remainingFinaleTargets.value.length,
  }),
)
const creditTitle = computed(() => tribunalParagraphs.value[0] ?? 'Tribunal Record')
const creditFinding = computed(() => tribunalParagraphs.value[1] ?? '')
const creditFlags = computed(() =>
  tribunalParagraphs.value.slice(2).map((p) => {
    const i = p.indexOf(':')
    return i > 0
      ? { label: p.slice(0, i), detail: p.slice(i + 1).trim() }
      : { label: 'On the record', detail: p }
  }),
)

// --- Garage economy gates (§3.7). SYSTEMS owns the math; buy is UI-gated. ---
/** Reputation-adjusted display price for a restricted part (base for the rest). */
function garagePriceModifier(part: MechPart, base: number): number {
  return Math.max(0, Math.round(base * repPriceModifier(part, commandRep.value, story.townRep.value)))
}
/** Tier/rep lock for a part in the current town's garage, or null if buyable. */
function garagePartLock(part: MechPart): { reason: string } | null {
  const town = garageTownId.value ? story.getTown(garageTownId.value) : undefined
  const standing = town?.standing ?? 0
  if (!isPartStocked(part, standing)) {
    const need = partShopTier(part) === 3 ? SHOP_TIER_T3_STANDING : SHOP_TIER_T2_STANDING
    return { reason: `Town standing ${need}+` }
  }
  if (!isPartRepUnlocked(part, commandRep.value, story.townRep.value)) {
    return {
      reason: partRepAxis(part) === 'command'
        ? `Command rep ${MILITARY_REP_UNLOCK}+`
        : `Town rep ${CIVILIAN_REP_UNLOCK}+`,
    }
  }
  return null
}

// --- Comms beats ---
/** Push a radio beat (CommsToast dedupes by id + queues). */
function pushComms(beat: CommsBeat): void {
  commsToastRef.value?.push(beat)
}
/** A Vaun act-transition beat. */
function vaunComms(id: VaunBeatId): CommsBeat {
  return { id: `vaun-${id}`, callsign: 'MAJ VAUN', line: VAUN_COMMS[id], variant: 'comms' }
}
/** Fire a cosmetic act/sighting beat exactly once (persisted via a storyFlag so
 *  it never repeats across a reload). The 'beat:' flags are cosmetic — the
 *  tribunal only reads refused-order / obeyed-withdrawal. */
function fireOnce(flag: string, factory: () => CommsBeat): void {
  if (story.hasStoryFlag(flag)) return
  story.raiseFlag(flag)
  pushComms(factory())
}
/** Act-transition + Kestrel-sighting comms, keyed off quest milestones. */
function scheduleActComms(quest: QuestDef): void {
  const s = story.stats.value
  if (s.questsCompleted === 1) fireOnce('beat:act1-hold', () => vaunComms('act1-first-chain'))
  if (happyCount.value === 1) fireOnce('beat:act2-open', () => vaunComms('act2-open'))
  if (happyCount.value === 2) fireOnce('beat:act2-pressure', () => vaunComms('act2-pressure'))
  // Kestrel escalates as you complete Sanctions (boss hunts).
  if (quest.type === 'boss_hunt') {
    const idx = Math.min(s.bossesDefeated - 1, KESTREL_SIGHTINGS.length - 1)
    if (idx >= 0) {
      fireOnce(`beat:kestrel-${idx}`, () => ({
        id: `kestrel-sighting-${idx}`,
        callsign: 'KESTREL',
        line: KESTREL_SIGHTINGS[idx],
        variant: 'hostile',
      }))
      // Sighting >=1 is Kestrel's clean-towns brag — the moment the player NOTICES
      // she leaves towns intact. Set the exploring-era flag that unlocks Rooker
      // naming the dismount trick (§4.2), so the teaching beat can land before the
      // finale rather than only after Kestrel spells it out herself. (raiseFlag is
      // idempotent.)
      if (idx >= 1) story.raiseFlag('saw-kestrel-clean')
    }
  }
}

onMounted(() => {
  hasSave.value = story.hasSavedRun()
  window.addEventListener('keydown', handleKey)
  // Arriving from the home menu's "Continue" entry jumps straight into the run.
  if (route.query.start === 'continue' && hasSave.value) {
    continueRun()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
  teardownWorld()
})

/** E opens the quest-giver dialogue; Escape closes whatever panel is open. */
function handleKey(e: KeyboardEvent) {
  if (!roaming.value) return
  if (e.code === 'Escape') {
    if (showGarage.value) closeGarage()
    else if (showDialog.value) closeDialog()
    return
  }
  if (e.code === 'KeyE' && canTalkToQuestGiver.value && questGiverTownId.value) {
    openDialog(questGiverTownId.value)
  }
}

function showToast(message: string, bad = false) {
  toast.value = message
  toastBad.value = bad
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 3200)
}

function startNewRun() {
  story.newRun()
  beginRoaming()
}

function continueRun() {
  story.loadOrNew()
  beginRoaming()
}

async function beginRoaming() {
  roaming.value = true
  showCredits.value = false
  pendingFinaleTownId = null
  // A continued run mid-finale should announce again; a fresh/exploring run shouldn't.
  finaleAnnounced = story.phase.value !== 'finale'
  await nextTick()
  const canvas = canvasRef.value
  if (!canvas || !story.run.value) return

  const loadout = story.run.value.loadout
  const playerMech = new MechEntity(
    'story-player',
    'Your Mech',
    loadout,
    computeCombatStats(loadout),
    true,
    new THREE.Vector3(0, 0, 0),
  )

  world = new StoryWorld({
    canvas,
    playerMech,
    towns: story.run.value.towns,
    graphics: gameSettings.settings.value.graphics,
    onFrame: handleFrame,
    onQuestComplete: handleQuestComplete,
    onPlayerDefeated: handlePlayerDefeated,
    onEnemyKilled: handleEnemyKilled,
    onReinforcement: handleReinforcement,
    onCollateral: handleCollateral,
  })
  world.start()
  touchInput.value = world.getInputManager()

  // Act I arrival hail (once per run). A continued mid-campaign run won't re-hear
  // it (the flag persists); a fresh deployment gets Vaun's opener.
  fireOnce('beat:arrival', () => vaunComms('arrival'))
}

// --- Story dialogue (Vaun / Kestrel) — a blocking DialogueView modal ---

/** Open a blocking story tree (pauses the world). */
function openStoryTree(tree: DialogueTree, kind: 'sanction' | 'kestrel'): void {
  storyTree.value = tree
  storyTreeKind.value = kind
  world?.setPaused(true)
}

/** Apply a story-dialogue choice's effects (flags/rep) through the composable. */
function onStoryChoice(choice: DialogueChoice): void {
  story.chooseDialogue(choice)
}

/** Resolve a story tree: unpause, then branch on which tree it was. */
function onStoryDialogueEnd(): void {
  const kind = storyTreeKind.value
  storyTree.value = null
  storyTreeKind.value = null
  world?.setPaused(false)

  if (kind === 'kestrel' && pendingKestrelBoss) {
    const { boss, townId } = pendingKestrelBoss
    pendingKestrelBoss = null
    const town = story.getTown(townId)
    if (town) beginFinaleBossEncounter(boss, town)
    return
  }
  if (kind === 'sanction') {
    // Obeying the withdrawal order ends the campaign (the abandoned towns are
    // left to the aces); refusing keeps the finale live so you can hunt them.
    if (story.hasStoryFlag('obeyed-withdrawal')) {
      story.concludeRun() // -> 'ended'; handleFinale rolls credits next frame
    }
  }
}

function handleFrame(info: StoryFrameInfo) {
  // HUD updates.
  nearestTownName.value = info.nearestTownName
  nearestTownDistance.value = info.nearestTownDistance
  insideTown.value = info.insideTownId !== null
  questGiverTownId.value = info.questGiverTownId
  encounterActive.value = info.encounterActive

  // Total real elapsed.
  story.tickElapsed(info.deltaTime)

  // Active-quest objective tracker (from the live encounter progress).
  if (info.encounter && story.activeQuest.value) {
    const q = story.activeQuest.value
    activeQuestTypeLabel.value = questTypeLabel(q.type)
    const progress = q.type === 'hidden_object'
      ? (info.encounter.found ? 1 : 0)
      : info.encounter.cleared
    activeQuestObjective.value = questObjective(q, progress)
  } else {
    activeQuestObjective.value = ''
    activeQuestTypeLabel.value = ''
  }

  // Decay the town the player is inside (real-time, proximity-gated), then push
  // the new condition to its visuals.
  if (info.insideTownId) {
    const newCondition = story.tickTownDecay(info.insideTownId, info.deltaTime)
    if (newCondition !== undefined) {
      world?.setTownCondition(info.insideTownId, newCondition)
    }
    // Throttled persistence so decay survives a reload without hammering
    // localStorage every frame.
    saveAccumulator += info.deltaTime
    if (saveAccumulator >= 1) {
      saveAccumulator = 0
      story.save()
    }
  }

  // Always reflect the nearest town's live state (condition + standing) in the
  // Town HUD, whether or not the player is inside the decay radius.
  if (info.nearestTownId) {
    const town = story.getTown(info.nearestTownId)
    if (town) {
      nearestTownCondition.value = Math.round(town.condition)
      nearestTownStanding.value = Math.round(town.standing)
    }
  }

  handleFinale(info)
}

/**
 * Finale orchestration: announce the finale once it unlocks, occupy the un-helped
 * towns with strong opponents (auto-start a boss encounter when the player walks
 * into one), and roll credits when the last falls.
 */
function handleFinale(info: StoryFrameInfo) {
  // Run already over -> roll credits once.
  if (story.phase.value === 'ended' && !showCredits.value) {
    openCredits()
    return
  }
  if (story.phase.value !== 'finale') return

  // First frame in the finale: flip the run + deliver Vaun's withdrawal ORDER as
  // a blocking dialogue (comply -> withdraw/end, refuse -> hunt the aces). §2.5.
  if (!finaleAnnounced) {
    finaleAnnounced = true
    story.beginFinale()
    audio.playLevelUp()
    // Deliver Vaun's withdrawal ORDER once. `finaleAnnounced` is fresh-false on
    // every remount, so a run continued mid-finale re-enters here — but the player
    // may have ALREADY answered the order (complied or refused). Re-issuing would
    // re-apply the rep deltas and let them overwrite a locked-in decision, so gate
    // on the decision flags the order sets. §2.5.
    if (!story.hasStoryFlag('obeyed-withdrawal') && !story.hasStoryFlag('refused-order')) {
      openStoryTree(vaunSanctionTree, 'sanction')
    }
    return
  }

  // Hold everything while a story-dialogue modal is open.
  if (storyTree.value) return

  // Drop the "not combat-ready" latch once the player steps out of that town.
  if (blockedRedeployTownId && info.insideTownId !== blockedRedeployTownId) {
    blockedRedeployTownId = null
  }

  // Walk into an un-helped, uncleared town -> the ace who took it is waiting.
  if (
    info.insideTownId &&
    !info.encounterActive &&
    !story.activeQuest.value &&
    pendingFinaleTownId === null
  ) {
    const town = story.getTown(info.insideTownId)
    const isTarget =
      town && !showCredits.value &&
      story.remainingFinaleTargets.value.some((t) => t.id === town.id)
    if (isTarget && world) {
      // Death-stakes gate (§3.7): a Frame stripped of its legs/head/weapon arms on
      // the last defeat can't fight an ace. Hold the encounter until the pilot
      // repairs + refits at Rooker's, rather than dropping them into an unwinnable
      // fight they can only escape by dying again (bleeding another 25% salvage).
      if (story.run.value && !isLoadoutValid(story.run.value.loadout)) {
        if (blockedRedeployTownId !== town!.id) {
          blockedRedeployTownId = town!.id
          showToast(
            "Frame's not combat-ready — no weapon systems online. Repair and refit at Rooker's before you take this ground.",
            true,
          )
        }
        return
      }
      const boss = story.finaleBossForTown(town!.id)
      if (boss) {
        // Kestrel gets her mirror-reveal confrontation before the fight (§2.3).
        const isKestrel = (boss.bossName ?? '').includes('Kestrel')
        if (isKestrel && !story.hasStoryFlag('met-kestrel')) {
          story.raiseFlag('met-kestrel')
          pendingKestrelBoss = { boss, townId: town!.id }
          openStoryTree(kestrelConfrontationTree, 'kestrel')
          return
        }
        beginFinaleBossEncounter(boss, town!)
      }
    }
  }
}

/** Start a named-ace finale encounter, announcing the ace over comms first. */
function beginFinaleBossEncounter(boss: QuestDef, town: { id: string; name: string }) {
  if (!world) return
  pendingFinaleTownId = town.id
  story.startQuest(boss)
  const started = world.startQuest(boss, boss.townId)
  if (started) {
    audio.playWeaponFire('energy')
    const ace = aceForTown(townIndexFromId(town.id))
    if (ace) {
      pushComms({
        id: `ace-intro-${town.id}`,
        callsign: ace.name.toUpperCase(),
        line: ace.intro,
        variant: 'hostile',
      })
    }
    showToast(`${town.name}: ${boss.title} holds the ground. Take it back.`, true)
  } else {
    story.clearActiveQuest()
    pendingFinaleTownId = null
  }
}

// --- Quest-giver dialogue ---

function openDialog(townId: string) {
  dialogSeenBriefing.value = visitedWardens.has(townId)
  visitedWardens.add(townId)
  dialogTownId.value = townId
  showDialog.value = true
  world?.setPaused(true)
}

function closeDialog() {
  showDialog.value = false
  dialogTownId.value = null
  // Only resume if the garage isn't also open.
  if (!showGarage.value) world?.setPaused(false)
}

function onAcceptQuest(quest: QuestDef) {
  if (!world) return
  // Death-stakes gate (§3.7): don't let a downed pilot redeploy on a Frame the
  // last fight stripped invalid (legs/head/weapon arms shot off into repair debt).
  // They must repair + refit at Rooker's first. Keep the dialogue open so the
  // garage is one choice away.
  if (story.run.value && !isLoadoutValid(story.run.value.loadout)) {
    showToast(
      "Frame's not combat-ready — repair and refit at Rooker's before you redeploy.",
      true,
    )
    return
  }
  story.startQuest(quest)
  const started = world.startQuest(quest, quest.townId)
  showDialog.value = false
  dialogTownId.value = null
  world.setPaused(false)
  if (started) {
    showToast(`Order accepted: ${quest.title}. Make it quick and clean.`)
  } else {
    story.clearActiveQuest()
    showToast('Could not start the quest right now.', true)
  }
}

/** Apply a warden dialogue choice's effects (rep/flags) via the composable. The
 *  accept/garage/close actions are bridged by QuestDialog to their own events. */
function onWardenChoice(choice: DialogueChoice): void {
  story.chooseDialogue(choice)
}

// --- Quest completion / defeat ---

function handleQuestComplete(quest: QuestDef) {
  // Finale boss kills clear the town outright (separate path from chain quests).
  if (isFinaleBoss(quest)) {
    const town = story.finishFinaleBoss(quest)
    pendingFinaleTownId = null
    audio.playLevelUp()
    // Reclaiming against orders is defiance: Command down, Town up (§3.7).
    story.adjustReputation({ commandRep: quest.commandRep, townRep: quest.townRep })
    if (town) showToast(`${town.name} reclaimed. +◈${quest.reward} salvage`)
    if (quest.completion) {
      pushComms({ id: `finale-done-${quest.id}`, callsign: 'THE REACH', line: quest.completion, variant: 'comms' })
    }
    // refreshPhase inside finishFinaleBoss flips to 'ended' when the last falls;
    // handleFinale will open the credits on the next frame.
    return
  }

  const town = story.finishActiveQuest(quest)
  audio.playSuccess()
  // Two-axis reputation from the authored quest content (§3.7).
  story.adjustReputation({ commandRep: quest.commandRep, townRep: quest.townRep })
  showToast(`Contract filled: ${quest.title}. +◈${quest.reward} salvage`)
  // The authored completion beat, delivered by the warden over comms.
  if (quest.completion) {
    pushComms({
      id: `done-${quest.id}`,
      callsign: (quest.giver || 'WARDEN').toUpperCase().slice(0, 18),
      line: quest.completion,
      variant: 'comms',
    })
  }
  // Push the (possibly newly-happy) standing to the HUD immediately.
  if (town) {
    nearestTownStanding.value = Math.round(town.standing)
    if (town.standing >= 100) {
      showToast(`${town.name} stands with you. (${happyCount.value}/3 held)`)
      audio.playAchievement()
    }
  }
  // Act-transition + Kestrel-sighting comms, keyed off the new milestone state.
  scheduleActComms(quest)
}

/**
 * Death stakes (§3.7): the Reach bleeds you, it doesn't kill you. On a defeat we
 * lose 25% salvage, the defended town takes a condition + standing hit, and every
 * limb shot off the Frame this fight is stripped into the inventory as damaged
 * repair debt — you must repair + refit at Rooker's before those slots work
 * again. The recovered Frame limps back to the town edge. No game-over screen.
 */
function handlePlayerDefeated(destroyedSlots: MechSlot[]) {
  const defendedTownId = story.activeQuest.value?.townId ?? pendingFinaleTownId ?? undefined
  const result = story.playerDefeated(defendedTownId, destroyedSlots)
  story.clearActiveQuest()
  pendingFinaleTownId = null
  audio.playError()

  // Rebuild the (possibly stripped) Frame so the pilot can limp back to a garage,
  // and drop it at the edge of the town they were defending.
  if (world && story.run.value) {
    const loadout = story.run.value.loadout
    world.applyLoadout(loadout, computeCombatStats(loadout))
    const town = defendedTownId ? story.getTown(defendedTownId) : undefined
    if (town) {
      world.setPlayerPosition(town.position[0] + 45, town.position[2] + 45)
      world.setTownCondition(town.id, town.condition)
      nearestTownStanding.value = Math.round(town.standing)
    }
  }

  // Downed / eject beat.
  pushComms({
    id: `downed-${Date.now()}`,
    callsign: 'FRAME AI',
    line: 'Reactor breach. Eject — eject. Pilot clear. Recovering what still walks.',
    variant: 'reinforcement',
  })

  const bits = [`Frame down — you ejected. Lost ◈${result.salvageLost} salvage`]
  if (result.damagedSlots.length) {
    bits.push(`${result.damagedSlots.length} limb${result.damagedSlots.length === 1 ? '' : 's'} wrecked — repair at Rooker's before you redeploy`)
  }
  showToast(bits.join('. ') + '.', true)
}

/**
 * Salvage (§3.6/§3.7): a killed enemy drops scrap + parts. `destroyedSlots` (the
 * limbs you shot off) drop damaged; intact parts roll a chance to drop pristine.
 * Surface the haul as a HUD toast.
 */
function handleEnemyKilled(kill: EnemyKill) {
  const result = story.awardKillSalvage(kill.loadout, kill.destroyedSlots)
  const drops = result.drops.length
  const parts = drops === 1 ? 'part' : 'parts'
  showToast(
    drops > 0
      ? `Salvage: +◈${result.scrap} and ${drops} ${parts} stripped.`
      : `Salvage: +◈${result.scrap}.`,
  )
}

/** Comms callout (§3.6): a named ace called in reinforcements at half health. */
function handleReinforcement(info: { bossName: string; count: number }) {
  audio.playError()
  pushComms({
    id: `reinf-${info.bossName}-${Date.now()}`,
    callsign: info.bossName.toUpperCase().slice(0, 18),
    line: reinforcementCallout(info.bossName),
    variant: 'reinforcement',
  })
  showToast(`${info.bossName}: hostile reinforcements inbound (${info.count})!`, true)
}

/**
 * Collateral tax (§3.5): route the combat-emitted severity into a gentle one-way
 * town-condition decrement (dominated by hits-you-take + combat time, never your
 * own fire). Push the new condition to the town visuals, and flash the HUD cue
 * only on meaningful chunks so the tax is *seen* without a constant strobe.
 */
function handleCollateral(amount: number, _position: THREE.Vector3) {
  const townId = story.activeQuest.value?.townId ?? pendingFinaleTownId
  if (!townId) return
  // Mutate condition in-memory every frame (cheap); DON'T persist per frame — that
  // would serialize the whole run + hit localStorage ~60x/sec on the core combat
  // loop. We flush the save on the throttle below instead.
  const condition = story.applyTownCollateral(townId, amount, false)
  if (condition === undefined) return
  world?.setTownCondition(townId, condition)
  // (handleFrame refreshes the HUD's nearest-town condition each frame.)
  // Flash the HUD — and persist — roughly once per ~0.25 condition lost (1.0
  // severity). This throttles saves to meaningful chunks (mirrors the decay save
  // throttle) instead of one write per combat frame.
  collateralSeverityAccum += amount
  if (collateralSeverityAccum >= 1) {
    collateralSeverityAccum = 0
    collateralTick.value++
    story.save()
  }
}

// --- Credits / run completion ---

function openCredits() {
  showCredits.value = true
  world?.setPaused(true)
  story.save()
  audio.playAchievement()
}

/** Archive (clear) the finished run and return to the mode-select menu. */
function finishRun() {
  showCredits.value = false
  story.clearSavedRun()
  teardownWorld()
  router.push({ name: 'mech-home' })
}

// --- Garage ---

function openGarageFromDialog() {
  // Remember which town's garage this is (drives per-town shop stock depth).
  garageTownId.value = dialogTownId.value
  showDialog.value = false
  dialogTownId.value = null
  garageMessage.value = ''
  showGarage.value = true
  world?.setPaused(true)
}

function closeGarage() {
  showGarage.value = false
  garageMessage.value = ''
  if (!showDialog.value) world?.setPaused(false)
}

function onEquip(payload: { part: MechPart; slot: ShopSlot }) {
  const result = story.buyAndEquip(payload.part, payload.slot)
  if (result.ok) {
    garageMessageError.value = false
    garageMessage.value = `Equipped ${payload.part.name}.`
    // Apply the new loadout to the live mech so combat reflects the upgrade.
    if (world && story.run.value) {
      const loadout = story.run.value.loadout
      world.applyLoadout(loadout, computeCombatStats(loadout))
    }
  } else {
    garageMessageError.value = true
    garageMessage.value = result.reason ?? 'Could not equip that part.'
  }
}

/** Install a salvaged (pristine) inventory part; re-apply the loadout to the live mech. */
function onInstall(payload: { instanceId: string; slot: ShopSlot }) {
  const result = story.installFromInventory(payload.instanceId, payload.slot)
  if (result.ok) {
    garageMessageError.value = false
    garageMessage.value = result.fee
      ? `Part installed. Rooker's fitting fee: ◈${result.fee}.`
      : 'Part installed.'
    if (world && story.run.value) {
      const loadout = story.run.value.loadout
      world.applyLoadout(loadout, computeCombatStats(loadout))
    }
  } else {
    garageMessageError.value = true
    garageMessage.value = result.reason ?? 'Could not install that part.'
  }
}

/** Repair a damaged salvaged part back to pristine for scrap. */
function onRepair(payload: { instanceId: string }) {
  const result = story.repairPart(payload.instanceId)
  garageMessageError.value = !result.ok
  garageMessage.value = result.ok
    ? `Repaired for ◈${result.cost}.`
    : result.reason ?? 'Could not repair that part.'
}

/** Sell a salvaged part for scrap. */
function onSell(payload: { instanceId: string }) {
  const result = story.sellPart(payload.instanceId)
  garageMessageError.value = !result.ok
  garageMessage.value = result.ok
    ? `Sold for ◈${result.refund}.`
    : result.reason ?? 'Could not sell that part.'
}

function teardownWorld() {
  if (world) {
    story.save()
    world.cleanup()
    world = null
  }
  touchInput.value = null
}

function returnToBattle() {
  teardownWorld()
  router.push({ name: 'mech-home' })
}
</script>

<style scoped>
.story-mode-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  z-index: 1000;
}

.story-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.flow-navigation {
  position: fixed;
  top: 18px;
  left: 20px;
  z-index: 2200;
  display: flex;
  gap: 10px;
}

.flow-pill {
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.03em;
  backdrop-filter: blur(6px);
}

.flow-pill.current {
  border: 1px solid rgba(245, 158, 11, 0.6);
  color: #fde68a;
  background: rgba(180, 83, 9, 0.35);
}

.flow-pill.action {
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: #fff;
  background: rgba(15, 23, 42, 0.45);
  cursor: pointer;
}

.flow-pill.action:hover {
  background: rgba(15, 23, 42, 0.65);
}

/* Intro screen */
.screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f2937, #064e3b);
}

.screen-content {
  text-align: center;
  padding: 40px;
  max-width: 700px;
}

.story-intro h1 {
  color: #fff;
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(245, 158, 11, 0.7);
}

.tagline {
  color: #d1d5db;
  font-size: 1.2rem;
  line-height: 1.5;
  margin-bottom: 36px;
}

.save-hint {
  color: #9ca3af;
  font-size: 0.9rem;
  margin-top: 20px;
}

.button-group {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.start-btn,
.settings-btn,
.back-btn {
  padding: 15px 36px;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

.start-btn:hover {
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
}

.settings-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
}

.settings-btn:hover {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* In-world HUD */
.story-hud {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2200;
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 10px 22px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}

.hud-money {
  color: #fcd34d;
}

.hud-phase {
  color: #a7f3d0;
  font-size: 0.85rem;
}

.story-controls-hint {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2200;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 6px 14px;
  border-radius: 999px;
}

/* The keyboard/mouse hint is meaningless on touch — the on-screen controls speak for themselves. */
@media (pointer: coarse) {
  .story-controls-hint {
    display: none;
  }
}

.story-exit {
  position: fixed;
  top: 18px;
  right: 20px;
  z-index: 2200;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(15, 23, 42, 0.5);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.story-exit:hover {
  background: rgba(15, 23, 42, 0.75);
}

/* Active-quest objective tracker (top-right under exit) */
.story-objective {
  position: fixed;
  top: 64px;
  right: 20px;
  z-index: 2200;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(245, 158, 11, 0.4);
  backdrop-filter: blur(8px);
  color: #fff;
  max-width: 280px;
}

.obj-type {
  font-size: 0.66rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fcd34d;
}

.obj-text {
  font-size: 0.92rem;
  font-weight: 700;
  text-align: right;
}

/* Quest-giver interact prompt (center-bottom, above controls hint) */
.story-interact {
  position: fixed;
  bottom: 54px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2200;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(245, 158, 11, 0.5);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  backdrop-filter: blur(8px);
}

.story-interact .key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #f59e0b;
  color: #1f2937;
  font-weight: 900;
  font-size: 0.85rem;
}

/* Toast for quest/equip results */
.story-toast {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2400;
  padding: 12px 24px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.92);
  color: #06281d;
  font-weight: 800;
  font-size: 0.95rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.story-toast.bad {
  background: rgba(239, 68, 68, 0.92);
  color: #2a0606;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Story dialogue (Vaun / Kestrel) — blocking comms panel */
.story-dialogue-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(3px);
}

.story-dialogue-panel {
  width: min(560px, 92vw);
  padding: 24px 26px 22px;
  border-radius: 10px;
  background: linear-gradient(160deg, #141b26, #0a0f18);
  border: 1px solid rgba(245, 158, 11, 0.32);
  border-left: 4px solid #f59e0b;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
}
</style>
