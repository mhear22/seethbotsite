<template>
  <div class="quest-dialog-backdrop" @click.self="$emit('close')">
    <div class="quest-dialog">
      <div class="qd-header">
        <span class="qd-town">{{ townName }}</span>
        <button class="qd-close" type="button" @click="$emit('close')">✕</button>
      </div>

      <!-- ============ TREE MODE: warden branching dialogue ============ -->
      <template v-if="tree && showBriefing">
        <DialogueView
          :tree="tree"
          :is-choice-available="isChoiceAvailable"
          :skippable="true"
          @choice-selected="onTreeChoice"
          @end="$emit('close')"
          @skip="$emit('close')"
        />
        <button
          v-if="seenBriefing"
          class="qd-fastpath-toggle"
          type="button"
          @click="showBriefing = false"
        >Skip briefing →</button>
      </template>

      <!-- ============ FAST PATH: repeat-visit accept/decline ============ -->
      <template v-else-if="tree && !showBriefing">
        <p class="qd-fastpath-note">Repeat visit — briefing skipped.</p>
        <template v-if="quest">
          <div class="qd-type-tag" :class="quest.type">{{ typeLabel }}</div>
          <h2 class="qd-title">{{ quest.title }}</h2>
          <ul class="qd-details">
            <li><span class="dk">Objective</span><span class="dv">{{ objective }}</span></li>
            <li><span class="dk">Payout</span><span class="dv reward">◈ {{ quest.reward }} salvage</span></li>
          </ul>
          <div class="qd-actions">
            <button class="qd-btn primary" type="button" @click="emit('accept', quest)">Accept</button>
            <button class="qd-btn ghost" type="button" @click="emit('open-garage')">Garage</button>
            <button class="qd-btn ghost" type="button" @click="$emit('close')">Stand down</button>
          </div>
        </template>
        <template v-else>
          <p class="qd-flavor">No orders on the board. {{ townName }} holds.</p>
          <div class="qd-actions">
            <button class="qd-btn ghost" type="button" @click="$emit('close')">Mount up</button>
          </div>
        </template>
        <button class="qd-fastpath-toggle" type="button" @click="showBriefing = true">← Full briefing</button>
      </template>

      <!-- ============ LEGACY SUMMARY MODE (no tree supplied) ============ -->
      <template v-else>
        <!-- Town chain complete: nothing left to offer -->
        <template v-if="!quest">
          <h2 class="qd-title">Nothing on the board</h2>
          <p class="qd-flavor">
            “You’ve held up your end. {{ townName }} still stands — scarred, but standing.
            That’s more than most of the Reach can say.”
          </p>
          <div class="qd-actions">
            <button
              v-for="(opt, i) in options"
              :key="opt.id"
              class="qd-btn ghost"
              :class="{ selected: i === selected }"
              type="button"
              @click="activate(opt)"
              @mouseenter="selected = i"
            >{{ opt.label }}</button>
          </div>
        </template>

        <!-- An offered quest -->
        <template v-else>
          <div class="qd-type-tag" :class="quest.type">{{ typeLabel }}</div>
          <h2 class="qd-title">{{ quest.title }}</h2>
          <p class="qd-flavor">“{{ quest.flavor }}”</p>

          <ul class="qd-details">
            <li>
              <span class="dk">Objective</span>
              <span class="dv">{{ objective }}</span>
            </li>
            <li>
              <span class="dk">Payout</span>
              <span class="dv reward">◈ {{ quest.reward }} salvage</span>
            </li>
            <li>
              <span class="dk">Order</span>
              <span class="dv">{{ quest.index + 1 }} of {{ chainLength }}</span>
            </li>
          </ul>

          <p class="qd-warning">
            Every second your Frame idles here, this place loses another wall. Make it quick.
          </p>

          <div class="qd-actions">
            <button
              v-for="(opt, i) in options"
              :key="opt.id"
              class="qd-btn"
              :class="[opt.id === 'accept' ? 'primary' : 'ghost', { selected: i === selected }]"
              type="button"
              @click="activate(opt)"
              @mouseenter="selected = i"
            >{{ opt.label }}</button>
          </div>
        </template>

        <p class="qd-nav-hint">W/S or ↑/↓ to choose · Enter/E to select · Esc to close</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import {
  questTypeLabel,
  questObjective,
  type QuestDef,
} from '../../../lib/story/quests'
import { QUESTS_PER_CHAIN } from '../../../composables/useStoryMode'
import DialogueView from './DialogueView.vue'
import type { DialogueTree, DialogueChoice } from '../../../lib/story/dialogue'

const props = withDefaults(
  defineProps<{
    townName: string
    quest: QuestDef | null
    /**
     * Warden dialogue tree. When present, QuestDialog renders DialogueView.
     * When absent, it falls back to the legacy quest-summary UI (unchanged),
     * so existing call sites keep working.
     */
    tree?: DialogueTree | null
    /** Availability predicate forwarded to DialogueView (SYSTEMS owns state). */
    isChoiceAvailable?: (choice: DialogueChoice) => boolean
    /** Repeat visit — offer the skip-briefing fast path. */
    seenBriefing?: boolean
  }>(),
  { tree: null, isChoiceAvailable: undefined, seenBriefing: false },
)

const emit = defineEmits<{
  (e: 'accept', quest: QuestDef): void
  (e: 'open-garage'): void
  (e: 'close'): void
  /** Fired in tree mode for every selected choice; host applies effects. */
  (e: 'choice-selected', choice: DialogueChoice): void
}>()

// First visit → full briefing; repeat visit → fast path by default.
const showBriefing = ref(!props.seenBriefing)
watch(
  () => props.seenBriefing,
  (v) => (showBriefing.value = !v),
)

/**
 * Bridge tree choices to the legacy events so an integrator can wire either
 * `choice-selected` (full control) or the convenience accept/open-garage events.
 */
function onTreeChoice(choice: DialogueChoice) {
  emit('choice-selected', choice)
  const action = choice.effects?.action
  if (action === 'openGarage') emit('open-garage')
  else if (action === 'acceptQuest' && props.quest) emit('accept', props.quest)
}

const chainLength = QUESTS_PER_CHAIN
const typeLabel = computed(() => (props.quest ? questTypeLabel(props.quest.type) : ''))
const objective = computed(() => (props.quest ? questObjective(props.quest, 0) : ''))

/** Keyboard/mouse-navigable option list for the legacy summary mode. */
type DialogOption = { id: 'accept' | 'garage' | 'close'; label: string }
const options = computed<DialogOption[]>(() =>
  props.quest
    ? [
        { id: 'accept', label: 'Accept order' },
        { id: 'garage', label: 'Rooker’s garage' },
        { id: 'close', label: 'Not now' },
      ]
    : [{ id: 'close', label: 'Mount up' }],
)

const selected = ref(0)
watch(options, (opts) => {
  if (selected.value >= opts.length) selected.value = 0
})

function activate(opt: DialogOption) {
  if (opt.id === 'accept' && props.quest) emit('accept', props.quest)
  else if (opt.id === 'garage') emit('open-garage')
  else emit('close')
}

// The legacy summary owns its own keyboard nav. In tree mode DialogueView owns
// keys, so this handler no-ops there (guarded on !tree || !showBriefing).
function handleKey(e: KeyboardEvent) {
  if (props.tree && showBriefing.value) return
  const opts = options.value
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      e.preventDefault()
      e.stopPropagation()
      selected.value = (selected.value - 1 + opts.length) % opts.length
      break
    case 'KeyS':
    case 'ArrowDown':
      e.preventDefault()
      e.stopPropagation()
      selected.value = (selected.value + 1) % opts.length
      break
    case 'Enter':
    case 'KeyE':
      e.preventDefault()
      e.stopPropagation()
      activate(opts[selected.value])
      break
    case 'Escape':
      e.preventDefault()
      e.stopPropagation()
      emit('close')
      break
  }
}

// Capture phase so menu navigation wins over the page's global roam handler.
onMounted(() => window.addEventListener('keydown', handleKey, true))
onUnmounted(() => window.removeEventListener('keydown', handleKey, true))
</script>

<style scoped>
.quest-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
}

.quest-dialog {
  width: min(480px, 92vw);
  padding: 24px 26px 22px;
  border-radius: 10px;
  background: linear-gradient(160deg, #141b26, #0a0f18);
  border: 1px solid rgba(245, 158, 11, 0.32);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
  color: #f1f5f9;
}

.qd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.qd-town {
  font-family: 'SFMono-Regular', ui-monospace, monospace;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #fcd34d;
}

.qd-close {
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
}

.qd-close:hover {
  background: rgba(255, 255, 255, 0.16);
}

.qd-type-tag {
  display: inline-block;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.qd-type-tag.wave_defence { background: rgba(59, 130, 246, 0.22); color: #93c5fd; }
.qd-type-tag.hidden_object { background: rgba(16, 185, 129, 0.22); color: #6ee7b7; }
.qd-type-tag.boss_hunt { background: rgba(239, 68, 68, 0.22); color: #fca5a5; }

.qd-title {
  margin: 0 0 10px;
  font-size: 1.5rem;
  font-weight: 800;
}

.qd-flavor {
  margin: 0 0 16px;
  font-style: italic;
  color: #cbd5e1;
  line-height: 1.55;
}

.qd-details {
  list-style: none;
  margin: 0 0 16px;
  padding: 14px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.qd-details li {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 0.9rem;
}

.dk {
  color: #94a3b8;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.dv {
  font-weight: 700;
}

.dv.reward {
  color: #fcd34d;
}

.qd-warning {
  margin: 0 0 18px;
  font-size: 0.78rem;
  color: #fca5a5;
  line-height: 1.4;
}

.qd-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.qd-btn {
  flex: 1 1 auto;
  min-width: 110px;
  padding: 11px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.qd-btn.primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #1c1917;
}

.qd-btn.primary:hover {
  box-shadow: 0 0 18px rgba(245, 158, 11, 0.45);
}

.qd-btn.ghost {
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.qd-btn.ghost:hover {
  background: rgba(255, 255, 255, 0.14);
}

.qd-btn.selected {
  outline: 2px solid #fcd34d;
  outline-offset: 2px;
  box-shadow: 0 0 16px rgba(252, 211, 77, 0.45);
}

.qd-fastpath-note {
  margin: 0 0 14px;
  font-size: 0.74rem;
  letter-spacing: 0.04em;
  color: #94a3b8;
  text-transform: uppercase;
}

.qd-fastpath-toggle {
  margin-top: 16px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  padding: 0;
}

.qd-fastpath-toggle:hover {
  color: #fcd34d;
}

.qd-nav-hint {
  margin: 14px 0 0;
  text-align: center;
  font-size: 0.7rem;
  color: #64748b;
}
</style>
