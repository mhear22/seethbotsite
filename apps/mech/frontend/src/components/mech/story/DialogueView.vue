<template>
  <div class="dv" role="dialog" aria-modal="true" :aria-label="`Transmission: ${node?.speaker ?? ''}`">
    <!-- Speaker nameplate -->
    <div class="dv-plate">
      <span class="dv-caret">&gt;&gt;</span>
      <span class="dv-speaker">{{ node?.speaker ?? '—' }}</span>
      <button
        v-if="skippable"
        class="dv-skip"
        type="button"
        title="Skip (Esc)"
        @click="skip"
      >SKIP ✕</button>
    </div>

    <!-- Line -->
    <p class="dv-text">{{ node?.text }}</p>

    <!-- Choices -->
    <ul v-if="node" class="dv-choices">
      <li
        v-for="(c, i) in visibleChoices"
        :key="i"
        class="dv-choice"
        :class="{
          selected: i === selected,
          locked: !c.available,
        }"
        @mouseenter="c.available && (selected = i)"
        @click="c.available && choose(i)"
      >
        <span class="dv-key">{{ i + 1 }}</span>
        <span class="dv-choice-text">{{ c.choice.text }}</span>
        <span v-if="!c.available" class="dv-lock">{{ c.lockLabel }}</span>
        <span v-else-if="c.tag" class="dv-tag" :class="c.tagClass">{{ c.tag }}</span>
      </li>
    </ul>

    <p class="dv-hint">1–{{ Math.min(9, visibleChoices.length) }} / ↑↓ select · E/Enter confirm · Esc skip</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { DialogueTree, DialogueChoice } from '../../../lib/story/dialogue'

const props = withDefaults(
  defineProps<{
    tree: DialogueTree
    /**
     * Availability predicate. STATE LIVES IN THE COMPOSABLE — this callback lets
     * SYSTEMS decide, against live rep/flags, whether a `requires`-gated choice
     * is selectable. Absent = everything available.
     */
    isChoiceAvailable?: (choice: DialogueChoice) => boolean
    /** Start at a node other than tree.entry (e.g. resume a branch). */
    startId?: string
    /** Show locked (unmet-requirement) choices greyed with a hint, vs hide them. */
    showLocked?: boolean
    /** Allow Esc / skip button to bail out. */
    skippable?: boolean
  }>(),
  {
    isChoiceAvailable: undefined,
    startId: undefined,
    showLocked: true,
    skippable: true,
  },
)

const emit = defineEmits<{
  /** Fired for EVERY selected choice — the host applies effects (flags/rep/action). */
  (e: 'choice-selected', choice: DialogueChoice): void
  /** The tree terminated (a choice with no `next`, or action 'end'). */
  (e: 'end'): void
  /** Player bailed out (Esc / skip). */
  (e: 'skip'): void
  /** Emitted whenever the visible node changes (for host-side comms/analytics). */
  (e: 'node', nodeId: string): void
}>()

const currentId = ref(props.startId ?? props.tree.entry)
const selected = ref(0)

const node = computed(() => props.tree.nodes[currentId.value] ?? null)

/** Human-readable lock reason from a choice's requires block. */
function lockLabel(choice: DialogueChoice): string {
  const r = choice.requires
  if (!r) return 'Locked'
  if (r.minCommandRep != null) return `Command ${r.minCommandRep}`
  if (r.minTownRep != null) return `Town ${r.minTownRep}`
  if (r.flag) return 'Locked'
  return 'Locked'
}

/** A short affordance tag for choices that carry a notable effect. */
function effectTag(choice: DialogueChoice): { tag: string; tagClass: string } | null {
  const a = choice.effects?.action
  if (a === 'refuseOrder') return { tag: 'DEFY', tagClass: 'defy' }
  if (a === 'acceptQuest') return { tag: 'ACCEPT', tagClass: 'accept' }
  if (a === 'openGarage') return { tag: 'GARAGE', tagClass: 'garage' }
  return null
}

const visibleChoices = computed(() => {
  const raw = node.value?.choices ?? []
  return raw
    .map((choice) => {
      const available = props.isChoiceAvailable ? props.isChoiceAvailable(choice) : true
      const et = effectTag(choice)
      return {
        choice,
        available,
        lockLabel: lockLabel(choice),
        tag: et?.tag ?? '',
        tagClass: et?.tagClass ?? '',
      }
    })
    .filter((c) => props.showLocked || c.available)
})

/** Reset traversal + selection whenever the tree (or explicit start) changes. */
watch(
  () => [props.tree, props.startId] as const,
  () => {
    currentId.value = props.startId ?? props.tree.entry
    selected.value = 0
    emit('node', currentId.value)
  },
)

// Keep the highlight on an available, in-range choice.
watch([visibleChoices, node], () => {
  const list = visibleChoices.value
  if (!list.length) return
  if (selected.value >= list.length) selected.value = 0
  if (!list[selected.value]?.available) {
    const firstAvail = list.findIndex((c) => c.available)
    selected.value = firstAvail >= 0 ? firstAvail : 0
  }
})

function choose(index: number) {
  const entry = visibleChoices.value[index]
  if (!entry || !entry.available) return
  const choice = entry.choice
  emit('choice-selected', choice)

  // Content-level traversal stays in the view; state effects are the host's.
  if (choice.effects?.action === 'end') {
    emit('end')
    return
  }
  if (choice.next && props.tree.nodes[choice.next]) {
    currentId.value = choice.next
    selected.value = 0
    emit('node', currentId.value)
    return
  }
  // No onward node → the branch is terminal.
  emit('end')
}

function skip() {
  if (!props.skippable) return
  emit('skip')
}

function moveSelection(dir: number) {
  const list = visibleChoices.value
  if (!list.length) return
  let i = selected.value
  for (let step = 0; step < list.length; step++) {
    i = (i + dir + list.length) % list.length
    if (list[i].available) {
      selected.value = i
      return
    }
  }
}

function handleKey(e: KeyboardEvent) {
  // Number-key direct select (1–9).
  if (e.code.startsWith('Digit')) {
    const n = parseInt(e.key, 10)
    if (n >= 1 && n <= 9 && n <= visibleChoices.value.length) {
      e.preventDefault()
      e.stopPropagation()
      choose(n - 1)
    }
    return
  }
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      e.preventDefault()
      e.stopPropagation()
      moveSelection(-1)
      break
    case 'KeyS':
    case 'ArrowDown':
      e.preventDefault()
      e.stopPropagation()
      moveSelection(1)
      break
    case 'Enter':
    case 'KeyE':
      e.preventDefault()
      e.stopPropagation()
      choose(selected.value)
      break
    case 'Escape':
      e.preventDefault()
      e.stopPropagation()
      skip()
      break
  }
}

// Capture phase so dialogue navigation wins over the page's global roam handler.
onMounted(() => {
  window.addEventListener('keydown', handleKey, true)
  emit('node', currentId.value)
})
onUnmounted(() => window.removeEventListener('keydown', handleKey, true))
</script>

<style scoped>
.dv {
  color: #e5e7eb;
  font-family: 'SFMono-Regular', ui-monospace, 'Cascadia Code', 'Roboto Mono', monospace;
}

.dv-plate {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.dv-caret {
  color: #f59e0b;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.dv-speaker {
  flex: 1;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #fcd34d;
}

.dv-skip {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: transparent;
  color: #94a3b8;
  font-family: inherit;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.dv-skip:hover {
  color: #e2e8f0;
  border-color: rgba(148, 163, 184, 0.6);
}

.dv-text {
  margin: 0 0 18px;
  font-size: 0.98rem;
  line-height: 1.6;
  color: #f1f5f9;
  white-space: pre-line;
}

.dv-choices {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dv-choice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 13px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(148, 163, 184, 0.05);
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.dv-choice.selected {
  border-color: #fcd34d;
  background: rgba(252, 211, 77, 0.1);
  box-shadow: inset 3px 0 0 #f59e0b;
}

.dv-choice.locked {
  cursor: not-allowed;
  opacity: 0.42;
  border-style: dashed;
}

.dv-key {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 3px;
  background: rgba(148, 163, 184, 0.18);
  color: #cbd5e1;
  font-size: 0.72rem;
  font-weight: 800;
}

.dv-choice.selected .dv-key {
  background: #f59e0b;
  color: #1c1917;
}

.dv-choice-text {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.35;
  color: #e2e8f0;
}

.dv-lock {
  flex: 0 0 auto;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.4);
  border-radius: 3px;
  padding: 2px 6px;
}

.dv-tag {
  flex: 0 0 auto;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 2px 6px;
  border-radius: 3px;
}

.dv-tag.accept { color: #6ee7b7; background: rgba(16, 185, 129, 0.16); }
.dv-tag.garage { color: #a5b4fc; background: rgba(99, 102, 241, 0.16); }
.dv-tag.defy { color: #fca5a5; background: rgba(239, 68, 68, 0.18); }

.dv-hint {
  margin: 16px 0 0;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  color: #64748b;
  text-align: center;
}
</style>
