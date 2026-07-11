<template>
  <div class="town-hud" :class="{ inside, 'collateral-flash': pulsing }">
    <div class="town-hud-header">
      <span class="town-hud-name">{{ name }}</span>
      <span class="town-hud-standing-tag" :class="{ happy }">{{ standingLabel }}</span>
    </div>

    <!-- Two-axis reputation strip: global Command vs this town's standing (Town). -->
    <div class="town-hud-rep">
      <span v-if="commandRep !== undefined" class="rep-chip cmd" title="Command reputation (global)">
        <span class="rep-chip-key">CMD</span>{{ commandPercent }}
      </span>
      <span class="rep-chip town" title="Town standing (this settlement)">
        <span class="rep-chip-key">TOWN</span>{{ standingPercent }}
      </span>
    </div>

    <!-- Condition (physical health) bar — color coded by tier -->
    <div class="town-hud-row">
      <span class="row-label">Condition</span>
      <div class="bar">
        <div
          class="bar-fill"
          :style="{ width: conditionPercent + '%', background: conditionColor }"
        ></div>
        <span class="bar-text">{{ conditionPercent }}%</span>
        <transition name="col-cue">
          <span v-if="pulsing" class="collateral-cue">COLLATERAL</span>
        </transition>
      </div>
    </div>

    <!-- Standing (mood toward you) bar -->
    <div class="town-hud-row">
      <span class="row-label">Standing</span>
      <div class="bar">
        <div
          class="bar-fill standing"
          :style="{ width: standingPercent + '%' }"
        ></div>
        <span class="bar-text">{{ standingPercent }} / 100</span>
      </div>
    </div>

    <!-- Distance / presence-cost cue -->
    <div v-if="inside" class="town-hud-decay">
      <span class="decay-pulse"></span>
      Presence load — {{ name }} bleeds condition while your Frame idles here.
    </div>
    <div v-else class="town-hud-dist">
      <span
        v-if="bearing !== undefined"
        class="town-hud-compass"
        :style="{ transform: `rotate(${bearing * 180 / Math.PI - 90}deg)` }"
        aria-hidden="true"
      >➤</span>
      <span>{{ Math.round(distance) }}m to {{ name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { HAPPY_STANDING_THRESHOLD } from '../../../composables/useStoryMode'

const props = defineProps<{
  name: string
  /** 0..100 physical condition. */
  condition: number
  /** 0..100 mood/standing toward the player (this town's Town-axis standing). */
  standing: number
  /** Centre distance to the town in world units. */
  distance: number
  /** Camera-relative bearing to the town (radians): 0 = ahead, +ve = right.
   *  Drives the rotating compass arrow. Omit to hide the arrow. */
  bearing?: number
  /** True while the player is inside the decay radius. */
  inside: boolean
  /** Global Command reputation (0..100). Optional — omit to hide the CMD chip. */
  commandRep?: number
  /**
   * Monotonic collateral-tax counter. When it INCREASES, the HUD flashes a
   * collateral cue so the player sees the tax tick. SYSTEMS owns the value.
   */
  collateralTick?: number
}>()

const conditionPercent = computed(() => Math.round(Math.max(0, Math.min(100, props.condition))))
const standingPercent = computed(() => Math.round(Math.max(0, Math.min(100, props.standing))))
const commandPercent = computed(() =>
  Math.round(Math.max(0, Math.min(100, props.commandRep ?? 0))),
)
const happy = computed(() => props.standing >= HAPPY_STANDING_THRESHOLD)

const standingLabel = computed(() => {
  if (happy.value) return 'Loyal'
  if (props.standing <= 0) return 'Cold'
  if (props.standing < 50) return 'Wary'
  return 'Thawing'
})

// Collateral pulse: flash briefly whenever the tax counter climbs.
const pulsing = ref(false)
let pulseTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => props.collateralTick,
  (next, prev) => {
    if (next === undefined || prev === undefined || next <= prev) return
    pulsing.value = true
    if (pulseTimer) clearTimeout(pulseTimer)
    pulseTimer = setTimeout(() => (pulsing.value = false), 750)
  },
)
onUnmounted(() => {
  if (pulseTimer) clearTimeout(pulseTimer)
})

// Color-code the condition bar: green (thriving) → amber (damaged) → red (ruined).
const conditionColor = computed(() => {
  const c = conditionPercent.value
  if (c >= 66) return 'linear-gradient(90deg, #34d399, #10b981)'
  if (c >= 33) return 'linear-gradient(90deg, #fbbf24, #f59e0b)'
  return 'linear-gradient(90deg, #f87171, #dc2626)'
})
</script>

<style scoped>
.town-hud {
  position: fixed;
  bottom: 70px;
  left: 20px;
  z-index: 2200;
  width: 280px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.62);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 0.9rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.town-hud.inside {
  border-color: rgba(248, 113, 113, 0.55);
  box-shadow: 0 0 22px rgba(220, 38, 38, 0.28);
}

/* Collateral tax just ticked — brief hard flash. */
.town-hud.collateral-flash {
  border-color: rgba(239, 68, 68, 0.9);
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
}

/* Two-axis reputation chips */
.town-hud-rep {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.rep-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'SFMono-Regular', ui-monospace, monospace;
  font-size: 0.74rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.3);
}

.rep-chip-key {
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  opacity: 0.7;
}

.rep-chip.cmd { color: #fca5a5; border-color: rgba(248, 113, 113, 0.35); }
.rep-chip.town { color: #a5b4fc; border-color: rgba(129, 140, 248, 0.35); }

.collateral-cue {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fecaca;
  text-shadow: 0 0 6px rgba(239, 68, 68, 0.9);
  pointer-events: none;
}

.col-cue-enter-active { transition: opacity 0.1s ease; }
.col-cue-leave-active { transition: opacity 0.4s ease; }
.col-cue-enter-from,
.col-cue-leave-to { opacity: 0; }

.town-hud-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}

.town-hud-name {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.town-hud-standing-tag {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

.town-hud-standing-tag.happy {
  background: rgba(244, 114, 182, 0.25);
  color: #f9a8d4;
}

.town-hud-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
}

.row-label {
  width: 64px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.bar {
  position: relative;
  flex: 1;
  height: 16px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s ease;
}

.bar-fill.standing {
  background: linear-gradient(90deg, #818cf8, #6366f1);
}

.bar-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.town-hud-decay {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  font-style: italic;
  color: #fca5a5;
}

.decay-pulse {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #ef4444;
  animation: decay-pulse 1.1s ease-in-out infinite;
}

@keyframes decay-pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.25); }
}

.town-hud-dist {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  color: #94a3b8;
}

/* Rotating compass arrow pointing toward the settlement (0 = dead ahead). */
.town-hud-compass {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  font-size: 0.95rem;
  line-height: 1;
  color: #fcd34d;
  text-shadow: 0 0 6px rgba(252, 211, 77, 0.6);
  transition: transform 0.08s linear;
}
</style>
