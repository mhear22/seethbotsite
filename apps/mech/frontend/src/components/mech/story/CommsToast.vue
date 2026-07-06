<template>
  <transition name="comms-slide">
    <div
      v-if="active"
      class="comms"
      :class="active.variant ?? 'comms'"
      role="status"
      aria-live="polite"
    >
      <div class="comms-bar">
        <span class="comms-dot"></span>
        <span class="comms-callsign">{{ active.callsign }}</span>
        <span class="comms-band">{{ bandLabel }}</span>
        <button class="comms-x" type="button" title="Dismiss" @click="dismissActive">✕</button>
      </div>
      <p class="comms-line">{{ active.line }}</p>
      <div class="comms-progress">
        <span :key="active.id" class="comms-progress-fill" :style="{ animationDuration: activeDurationMs + 'ms' }"></span>
      </div>
      <div v-if="queue.length" class="comms-more">+{{ queue.length }} incoming</div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { CommsBeat } from './commsTypes'

const props = withDefaults(
  defineProps<{
    /**
     * Declarative feed: set this to a new beat (new id) and it enqueues. Rapid
     * updates queue rather than clobber. Alternatively call the exposed push().
     */
    beat?: CommsBeat | null
  }>(),
  { beat: null },
)

const emit = defineEmits<{
  (e: 'shown', id: string): void
  (e: 'dismissed', id: string): void
  /** All beats drained — useful for the integrator to un-gate input, etc. */
  (e: 'idle'): void
}>()

const DEFAULT_DURATION: Record<NonNullable<CommsBeat['variant']>, number> = {
  comms: 4200,
  hostile: 4600,
  reinforcement: 5200,
}

const active = ref<CommsBeat | null>(null)
const queue = ref<CommsBeat[]>([])
const seen = new Set<string>()
let timer: ReturnType<typeof setTimeout> | null = null

const activeDurationMs = computed(() =>
  active.value ? active.value.durationMs ?? DEFAULT_DURATION[active.value.variant ?? 'comms'] : 0,
)

const bandLabel = computed(() => {
  switch (active.value?.variant) {
    case 'hostile':
      return 'INTERCEPT'
    case 'reinforcement':
      return 'CONTACT'
    default:
      return 'COMMS'
  }
})

function push(beat: CommsBeat) {
  if (!beat || seen.has(beat.id)) return
  seen.add(beat.id)
  queue.value.push(beat)
  if (!active.value) advance()
}

function advance() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  const next = queue.value.shift() ?? null
  active.value = next
  if (!next) {
    emit('idle')
    return
  }
  emit('shown', next.id)
  const ms = next.durationMs ?? DEFAULT_DURATION[next.variant ?? 'comms']
  timer = setTimeout(() => {
    const id = next.id
    active.value = null
    emit('dismissed', id)
    // Brief gap between transmissions so they read as separate.
    timer = setTimeout(advance, 260)
  }, ms)
}

function dismissActive() {
  if (!active.value) return
  const id = active.value.id
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  active.value = null
  emit('dismissed', id)
  timer = setTimeout(advance, 200)
}

// Declarative feed: enqueue whenever a new beat id arrives.
watch(
  () => props.beat,
  (b) => {
    if (b) push(b)
  },
  { immediate: true },
)

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

// Imperative alternative for the integrator.
defineExpose({ push })
</script>

<style scoped>
.comms {
  position: fixed;
  top: 78px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2500;
  width: min(440px, 92vw);
  padding: 12px 14px 14px;
  border-radius: 8px;
  background: rgba(10, 15, 25, 0.92);
  border: 1px solid rgba(245, 158, 11, 0.5);
  border-left: 4px solid #f59e0b;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  color: #f1f5f9;
  font-family: 'SFMono-Regular', ui-monospace, 'Cascadia Code', 'Roboto Mono', monospace;
  backdrop-filter: blur(6px);
}

.comms.hostile {
  border-color: rgba(239, 68, 68, 0.6);
  border-left-color: #ef4444;
}

.comms.reinforcement {
  border-color: rgba(239, 68, 68, 0.7);
  border-left-color: #ef4444;
  animation: comms-alarm 0.9s ease-in-out infinite;
}

@keyframes comms-alarm {
  0%, 100% { box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); }
  50% { box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 22px rgba(239, 68, 68, 0.5); }
}

.comms-bar {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 8px;
}

.comms-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
  animation: comms-blink 1s steps(2, start) infinite;
}

.comms.hostile .comms-dot,
.comms.reinforcement .comms-dot {
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

@keyframes comms-blink {
  0% { opacity: 1; }
  50% { opacity: 0.25; }
  100% { opacity: 1; }
}

.comms-callsign {
  flex: 1;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fcd34d;
}

.comms.hostile .comms-callsign,
.comms.reinforcement .comms-callsign {
  color: #fca5a5;
}

.comms-band {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 3px;
  padding: 2px 5px;
}

.comms-x {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0 2px;
}

.comms-x:hover { color: #cbd5e1; }

.comms-line {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.5;
  color: #e2e8f0;
}

.comms-progress {
  margin-top: 10px;
  height: 2px;
  border-radius: 2px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
}

.comms-progress-fill {
  display: block;
  height: 100%;
  width: 100%;
  background: #f59e0b;
  transform-origin: left;
  animation: comms-drain 4.2s linear forwards;
}

.comms.hostile .comms-progress-fill,
.comms.reinforcement .comms-progress-fill {
  background: #ef4444;
}

@keyframes comms-drain {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.comms-more {
  margin-top: 6px;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: #64748b;
  text-align: right;
}

.comms-slide-enter-active,
.comms-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.comms-slide-enter-from,
.comms-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .comms.reinforcement { animation: none; }
  .comms-dot { animation: none; }
  .comms-progress-fill { animation-duration: 0.01s; }
}
</style>
