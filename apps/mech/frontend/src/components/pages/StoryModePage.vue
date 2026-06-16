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
        <h1>Story Mode</h1>
        <p class="tagline">
          A walking disaster with a heart of gold. Help the towns… or wreck them just by showing up.
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
        <div class="hud-money">💰 {{ money }}</div>
        <div class="hud-phase">{{ phaseLabel }} · {{ happyCount }}/3 towns happy</div>
      </div>

      <!-- Town HUD: name, color-coded condition bar, standing, decay cue -->
      <TownHud
        v-if="nearestTownName"
        :name="nearestTownName"
        :condition="nearestTownCondition"
        :standing="nearestTownStanding"
        :distance="nearestTownDistance"
        :inside="insideTown"
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
        v-if="!showDialog && !showGarage && !showCredits"
        :input="touchInput"
        context="story"
      />

      <!-- Quest-giver dialogue -->
      <QuestDialog
        v-if="showDialog && dialogTown"
        :town-name="dialogTown.name"
        :quest="dialogQuest"
        @accept="onAcceptQuest"
        @open-garage="openGarageFromDialog"
        @close="closeDialog"
      />

      <!-- Garage / shop -->
      <Garage
        v-if="showGarage && story.run.value"
        :money="money"
        :loadout="story.run.value.loadout"
        :message="garageMessage"
        :message-error="garageMessageError"
        @equip="onEquip"
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
import { useStoryMode, computeCombatStats } from '../../composables/useStoryMode'
import { useAudio } from '../../composables/useAudio'
import {
  questTypeLabel,
  questObjective,
  isFinaleBoss,
  type QuestDef,
  type ShopSlot,
} from '../../lib/story/quests'
import type { MechPart } from '../../shared/types/MechTypes'
import TownHud from '../mech/story/TownHud.vue'
import QuestDialog from '../mech/story/QuestDialog.vue'
import Garage from '../mech/story/Garage.vue'
import StoryCredits from '../mech/story/StoryCredits.vue'
import TouchControls from '../mech/TouchControls.vue'
import type { InputManager } from '../../lib/battle/InputManager'

const router = useRouter()
const route = useRoute()
const story = useStoryMode()
const audio = useAudio()

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

// Finale bookkeeping: ensure the "finale begins" banner fires once, and that we
// only auto-start one boss encounter per town entry.
let finaleAnnounced = false
let pendingFinaleTownId: string | null = null

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

const money = computed(() => story.money.value)
const happyCount = computed(() => story.happyCount.value)
const phaseLabel = computed(() => {
  switch (story.phase.value) {
    case 'finale': return 'Finale'
    case 'ended': return 'Run complete'
    default: return 'Exploring'
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
    onFrame: handleFrame,
    onQuestComplete: handleQuestComplete,
    onPlayerDefeated: handlePlayerDefeated,
  })
  world.start()
  touchInput.value = world.getInputManager()
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

  // First frame in the finale: flip the run into finale mode + announce it.
  if (!finaleAnnounced) {
    finaleAnnounced = true
    story.beginFinale()
    const targets = story.remainingFinaleTargets.value
    showToast(
      `Finale! Strong opponents have seized ${targets.length} town${targets.length === 1 ? '' : 's'} you left behind. Hunt them down.`,
    )
    audio.playLevelUp()
  }

  // Walk into an un-helped, uncleared town -> the boss is waiting there.
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
      const boss = story.finaleBossForTown(town!.id)
      if (boss) {
        pendingFinaleTownId = town!.id
        story.startQuest(boss)
        const started = world.startQuest(boss, boss.townId)
        if (started) {
          audio.playWeaponFire('energy')
          showToast(`${town!.name}: ${boss.title} attacks!`, true)
        } else {
          story.clearActiveQuest()
          pendingFinaleTownId = null
        }
      }
    }
  }
}

// --- Quest-giver dialogue ---

function openDialog(townId: string) {
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
  story.startQuest(quest)
  const started = world.startQuest(quest, quest.townId)
  showDialog.value = false
  dialogTownId.value = null
  world.setPaused(false)
  if (started) {
    showToast(`Quest accepted: ${quest.title}`)
  } else {
    story.clearActiveQuest()
    showToast('Could not start the quest right now.', true)
  }
}

// --- Quest completion / defeat ---

function handleQuestComplete(quest: QuestDef) {
  // Finale boss kills clear the town outright (separate path from chain quests).
  if (isFinaleBoss(quest)) {
    const town = story.finishFinaleBoss(quest)
    pendingFinaleTownId = null
    audio.playLevelUp()
    if (town) {
      showToast(`${town.name} liberated! +💰 ${quest.reward}`)
    }
    // refreshPhase inside finishFinaleBoss flips to 'ended' when the last falls;
    // handleFinale will open the credits on the next frame.
    return
  }

  const town = story.finishActiveQuest(quest)
  audio.playSuccess()
  showToast(`Quest complete! +💰 ${quest.reward}`)
  // Push the (possibly newly-happy) standing to the HUD immediately.
  if (town) {
    nearestTownStanding.value = Math.round(town.standing)
    if (town.standing >= 100) {
      showToast(`${town.name} is now happy! (${happyCount.value}/3)`)
      audio.playAchievement()
    }
  }
  if (story.phase.value === 'finale' && !finaleAnnounced) {
    showToast('Finale unlocked — strong opponents now hold the towns you left behind.')
  }
}

function handlePlayerDefeated() {
  story.clearActiveQuest()
  pendingFinaleTownId = null
  // Revive the player for the open world (Story Mode has no game-over screen in
  // v1; the lasting cost is the town decay you caused). Rebuild at full health.
  if (world && story.run.value) {
    const loadout = story.run.value.loadout
    world.applyLoadout(loadout, computeCombatStats(loadout))
  }
  audio.playError()
  showToast('Your mech was wrecked! Repaired at the nearest town — try again.', true)
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
</style>
