<template>
  <div class="town-hud" :class="{ inside }">
    <div class="town-hud-header">
      <span class="town-hud-name">{{ name }}</span>
      <span class="town-hud-standing-tag" :class="{ happy }">{{ standingLabel }}</span>
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

    <!-- Distance / decay cue -->
    <div v-if="inside" class="town-hud-decay">
      <span class="decay-pulse"></span>
      Your mech is wrecking this place just by being here…
    </div>
    <div v-else class="town-hud-dist">{{ Math.round(distance) }}m away</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { HAPPY_STANDING_THRESHOLD } from '../../../composables/useStoryMode'

const props = defineProps<{
  name: string
  /** 0..100 physical condition. */
  condition: number
  /** 0..100 mood/standing toward the player. */
  standing: number
  /** Centre distance to the town in world units. */
  distance: number
  /** True while the player is inside the decay radius. */
  inside: boolean
}>()

const conditionPercent = computed(() => Math.round(Math.max(0, Math.min(100, props.condition))))
const standingPercent = computed(() => Math.round(Math.max(0, Math.min(100, props.standing))))
const happy = computed(() => props.standing >= HAPPY_STANDING_THRESHOLD)

const standingLabel = computed(() => {
  if (happy.value) return 'Happy ♥'
  if (props.standing <= 0) return 'Indifferent'
  if (props.standing < 50) return 'Wary'
  return 'Warming up'
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
  font-size: 0.76rem;
  color: #94a3b8;
}
</style>
