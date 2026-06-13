<template>
  <transition name="catch-pop">
    <div v-if="lastCatch" class="catch-card" :class="{ 'reduced-motion': reducedMotion }" :style="cardStyle">
      <div class="catch-title">You caught a {{ lastCatch.name }}!</div>
      <div class="catch-silhouette" :style="{ background: hexColor }">
        <span class="silhouette-emoji">🐟</span>
      </div>
      <div class="catch-rarity" :style="{ color: rarityHex }">
        {{ rarityLabel }}
      </div>
      <div class="catch-stats">
        <span>{{ lastCatch.weight.toFixed(1) }} kg</span>
        <span>·</span>
        <span>size {{ lastCatch.size.toFixed(1) }}</span>
      </div>
      <div class="catch-points">+{{ lastCatch.points }} pts</div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { rarityMeta, type Rarity } from '../../composables/useFishingGame'

interface CatchInfo {
  name: string
  points: number
  rarity: Rarity
  color: number
  size: number
  weight: number
}

const props = defineProps<{
  lastCatch: CatchInfo | null
  reducedMotion: boolean
}>()

const hexColor = computed(() =>
  props.lastCatch ? '#' + props.lastCatch.color.toString(16).padStart(6, '0') : '#888'
)
const rarityHex = computed(() => (props.lastCatch ? rarityMeta[props.lastCatch.rarity].color : '#fff'))
const rarityLabel = computed(() => (props.lastCatch ? rarityMeta[props.lastCatch.rarity].label : ''))
const cardStyle = computed(() => ({ '--rarity-color': rarityHex.value }))
</script>

<style scoped>
.catch-card {
  position: fixed;
  top: 18%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  background: rgba(15, 23, 42, 0.95);
  border: 3px solid var(--rarity-color, #38bdf8);
  border-radius: 18px;
  padding: 22px 34px;
  text-align: center;
  box-shadow: 0 0 40px var(--rarity-color, rgba(56, 189, 248, 0.5)), 0 12px 36px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  min-width: 220px;
}

.catch-title {
  color: white;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}

.catch-silhouette {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.45);
  animation: silhouetteSpin 3s linear infinite;
}

.silhouette-emoji {
  font-size: 44px;
  filter: brightness(0) invert(1) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4));
}

@keyframes silhouetteSpin {
  0%, 100% { transform: scale(1) rotate(-6deg); }
  50% { transform: scale(1.08) rotate(6deg); }
}

.catch-rarity {
  font-size: 16px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.catch-stats {
  color: #cbd5e0;
  font-size: 13px;
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 10px;
}

.catch-points {
  font-size: 28px;
  font-weight: 900;
  color: #fcd34d;
  text-shadow: 0 2px 8px rgba(252, 211, 77, 0.6);
}

.catch-pop-enter-active {
  animation: catchPop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}
.catch-pop-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}
.catch-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-30px) scale(0.9);
}

@keyframes catchPop {
  from { opacity: 0; transform: translateX(-50%) scale(0.5); }
  to { opacity: 1; transform: translateX(-50%) scale(1); }
}

.reduced-motion .catch-silhouette { animation: none; }
.reduced-motion.catch-card { animation: none; }
</style>
