<template>
  <div class="reel-overlay" :class="{ 'reduced-motion': reducedMotion }">
    <div class="reel-card" :class="{ 'pop-in': !reducedMotion }">
      <!-- Bite telegraph -->
      <transition name="bite-flash">
        <div v-if="showBite" class="bite-telegraph">BITE!</div>
      </transition>

      <div class="reel-header">
        <h3>🎣 REEL IT IN!</h3>
        <div class="fish-tag" :style="{ color: rarityColor }">
          {{ fishName }}
        </div>
      </div>

      <!-- Tension gauge (vertical) with moving safe band -->
      <div class="reel-body">
        <div class="tension-wrap">
          <div class="tension-label">Tension</div>
          <div
            class="tension-gauge"
            :class="{ danger: tensionPct > 82, ok: inBand }"
          >
            <!-- safe band overlay -->
            <div
              class="safe-band"
              :style="{
                bottom: `${bandLowPct}%`,
                height: `${Math.max(0, bandHighPct - bandLowPct)}%`
              }"
            ></div>
            <!-- snap zone marker -->
            <div class="snap-marker"></div>
            <!-- current tension fill -->
            <div
              class="tension-fill"
              :class="{ inband: inBand, danger: tensionPct > 82 }"
              :style="{ height: `${tensionPct}%` }"
            ></div>
          </div>
          <div class="tension-hint" :class="{ alert: tensionPct > 82 }">
            {{ tensionPct > 82 ? 'EASE OFF!' : inBand ? 'PERFECT' : 'KEEP IT IN THE BAND' }}
          </div>
        </div>

        <!-- Distance / progress bar -->
        <div class="distance-wrap">
          <div class="distance-label">Distance to land</div>
          <div class="distance-track">
            <div class="distance-fill" :style="{ width: `${distance}%` }">
              <span class="distance-fish">🐟</span>
            </div>
          </div>
          <div class="distance-pct">{{ Math.round(distance) }}%</div>
        </div>
      </div>

      <!-- Hold-to-reel button -->
      <button
        class="reel-button"
        :class="{ holding: reelActive }"
        @pointerdown.prevent="onPress"
        @pointerup.prevent="onRelease"
        @pointerleave="onRelease"
        @pointercancel="onRelease"
        @contextmenu.prevent
      >
        {{ reelActive ? '🌀 REELING...' : '🎣 HOLD TO REEL' }}
      </button>
      <div class="key-hint">
        Hold <kbd>SPACE</kbd> or the button to reel. Release to let line slacken.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tension: number
  maxTension: number
  safeBandLow: number
  safeBandHigh: number
  distance: number
  reelActive: boolean
  fishName: string
  rarityColor: string
  showBite: boolean
  reducedMotion: boolean
}>()

const emit = defineEmits<{
  (e: 'reel', active: boolean): void
}>()

const tensionPct = computed(() => Math.max(0, Math.min(100, (props.tension / props.maxTension) * 100)))
const bandLowPct = computed(() => Math.max(0, Math.min(100, (props.safeBandLow / props.maxTension) * 100)))
const bandHighPct = computed(() => Math.max(0, Math.min(100, (props.safeBandHigh / props.maxTension) * 100)))
const inBand = computed(() => props.tension >= props.safeBandLow && props.tension <= props.safeBandHigh)

const onPress = () => emit('reel', true)
const onRelease = () => emit('reel', false)
</script>

<style scoped>
.reel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding-bottom: 6vh;
}

.reel-card {
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(8px);
  padding: 22px 26px 26px;
  border-radius: 18px 18px 16px 16px;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(56, 189, 248, 0.4);
  max-width: 520px;
  width: 92%;
  position: relative;
}

.pop-in {
  animation: popIn 0.28s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

@keyframes popIn {
  from { opacity: 0; transform: translateY(40px) scale(0.92); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.bite-telegraph {
  position: absolute;
  top: -54px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 46px;
  font-weight: 900;
  color: #fde047;
  text-shadow: 0 0 18px rgba(253, 224, 71, 0.8), 0 3px 6px rgba(0, 0, 0, 0.6);
  letter-spacing: 2px;
  pointer-events: none;
}

.bite-flash-enter-active { animation: biteFlash 0.5s ease-out; }
.bite-flash-leave-active { transition: opacity 0.2s; }
.bite-flash-leave-to { opacity: 0; }

@keyframes biteFlash {
  0% { transform: translateX(-50%) scale(0.4); opacity: 0; }
  50% { transform: translateX(-50%) scale(1.25); opacity: 1; }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}

.reel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.reel-header h3 {
  margin: 0;
  color: #38bdf8;
  font-size: 24px;
}

.fish-tag {
  font-weight: 800;
  font-size: 18px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.reel-body {
  display: flex;
  gap: 22px;
  align-items: stretch;
  margin-bottom: 18px;
}

.tension-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tension-label,
.distance-label {
  color: #cbd5e0;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tension-gauge {
  position: relative;
  width: 54px;
  height: 180px;
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #334155;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.tension-gauge.ok { box-shadow: 0 0 16px rgba(34, 197, 94, 0.4); }
.tension-gauge.danger { border-color: #ef4444; box-shadow: 0 0 18px rgba(239, 68, 68, 0.6); }

.safe-band {
  position: absolute;
  left: 0;
  right: 0;
  background: repeating-linear-gradient(
    -45deg,
    rgba(34, 197, 94, 0.45),
    rgba(34, 197, 94, 0.45) 6px,
    rgba(34, 197, 94, 0.25) 6px,
    rgba(34, 197, 94, 0.25) 12px
  );
  border-top: 2px solid rgba(34, 197, 94, 0.9);
  border-bottom: 2px solid rgba(34, 197, 94, 0.9);
  transition: bottom 0.05s linear, height 0.05s linear;
  z-index: 1;
}

.snap-marker {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #ef4444;
  z-index: 2;
}

.tension-fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(0deg, #0ea5e9, #38bdf8);
  z-index: 3;
  transition: height 0.04s linear, background 0.15s;
  opacity: 0.85;
}

.tension-fill.inband { background: linear-gradient(0deg, #16a34a, #4ade80); }
.tension-fill.danger { background: linear-gradient(0deg, #dc2626, #f87171); }

.tension-hint {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  height: 14px;
}
.tension-hint.alert { color: #f87171; }

.distance-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.distance-track {
  position: relative;
  height: 34px;
  background: #1e293b;
  border-radius: 17px;
  overflow: hidden;
  border: 2px solid #334155;
}

.distance-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fcd34d);
  border-radius: 17px;
  transition: width 0.05s linear;
  min-width: 24px;
}

.distance-fish {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
}

.distance-pct {
  text-align: right;
  color: #fcd34d;
  font-weight: 800;
  font-size: 16px;
}

.reel-button {
  width: 100%;
  padding: 18px;
  font-size: 20px;
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  transition: transform 0.08s, box-shadow 0.15s;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);
}

.reel-button.holding {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  transform: scale(0.97);
  box-shadow: 0 0 22px rgba(34, 197, 94, 0.6);
}

.key-hint {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 10px;
}

.key-hint kbd {
  background: #334155;
  padding: 2px 8px;
  border-radius: 5px;
  border: 1px solid #475569;
  color: #f1f5f9;
  font-weight: 700;
}

/* Reduced motion: kill animated reveals/sweeps */
.reduced-motion .pop-in,
.reduced-motion .bite-flash-enter-active { animation: none; }
.reduced-motion .reel-button.holding { transform: none; }
.reduced-motion .safe-band,
.reduced-motion .tension-fill,
.reduced-motion .distance-fill { transition: none; }
</style>
