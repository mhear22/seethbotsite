<template>
  <div class="bestiary">
    <div class="bestiary-head">
      <h2>📖 Bestiary</h2>
      <div class="completion">
        <div class="completion-text">{{ completionPercent }}% discovered</div>
        <div class="completion-bar">
          <div class="completion-fill" :style="{ width: `${completionPercent}%` }"></div>
        </div>
      </div>
    </div>

    <!-- Records panel -->
    <div class="records">
      <div class="record">
        <span class="record-label">Best Score</span>
        <span class="record-value">{{ bestScore }}</span>
      </div>
      <div class="record">
        <span class="record-label">Best Combo</span>
        <span class="record-value">{{ bestCombo }}x</span>
      </div>
      <div class="record">
        <span class="record-label">Total Caught</span>
        <span class="record-value">{{ totalFishCaught }}</span>
      </div>
      <div class="record">
        <span class="record-label">Heaviest</span>
        <span class="record-value heaviest">
          {{ heaviestCatch ? `${heaviestCatch.weight.toFixed(1)}kg` : '—' }}
        </span>
        <span v-if="heaviestCatch" class="record-sub">{{ heaviestCatch.name }}</span>
      </div>
    </div>

    <!-- Species grid -->
    <div class="species-grid">
      <div
        v-for="fish in allFish"
        :key="fish.name"
        class="species-card"
        :class="{ discovered: !!entry(fish.name), undiscovered: !entry(fish.name) }"
        :style="entry(fish.name) ? { borderColor: rarityMeta[fish.rarity].color } : {}"
      >
        <div
          class="species-silhouette"
          :style="entry(fish.name) ? { background: hex(fish.color) } : {}"
        >
          <span v-if="entry(fish.name)" class="species-emoji">🐟</span>
          <span v-else class="species-unknown">?</span>
        </div>
        <div class="species-name">
          {{ entry(fish.name) ? fish.name : '???' }}
        </div>
        <div v-if="entry(fish.name)" class="species-meta">
          <span class="rarity-pill" :style="{ color: rarityMeta[fish.rarity].color }">
            {{ rarityMeta[fish.rarity].label }}
          </span>
          <span>×{{ entry(fish.name)!.count }}</span>
        </div>
        <div v-if="entry(fish.name)" class="species-detail">
          best {{ entry(fish.name)!.bestSize.toFixed(1) }} ·
          {{ entry(fish.name)!.bestWeight.toFixed(1) }}kg
        </div>
        <div v-if="entry(fish.name)" class="species-first">
          first {{ formatDate(entry(fish.name)!.firstCaught) }}
        </div>
        <div v-else class="species-detail muted">Not yet discovered</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fishTypes, rarityMeta, type BestiaryEntry } from '../../composables/useFishingGame'

const props = defineProps<{
  bestiary: Record<string, BestiaryEntry>
  completionPercent: number
  bestScore: number
  bestCombo: number
  totalFishCaught: number
  heaviestCatch: { name: string; weight: number } | null
}>()

const allFish = fishTypes

const entry = (name: string): BestiaryEntry | undefined => props.bestiary[name]

const hex = (color: number) => '#' + color.toString(16).padStart(6, '0')

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}
</script>

<style scoped>
.bestiary {
  max-width: 800px;
  margin: 0 auto 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.bestiary-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.bestiary-head h2 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
}

.completion {
  flex: 1;
  min-width: 180px;
}

.completion-text {
  color: white;
  font-weight: 700;
  text-align: right;
  margin-bottom: 6px;
}

.completion-bar {
  height: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  overflow: hidden;
}

.completion-fill {
  height: 100%;
  background: linear-gradient(90deg, #fcd34d, #f59e0b);
  border-radius: 6px;
  transition: width 0.4s ease-out;
}

.records {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.record {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.record-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.record-value {
  color: white;
  font-size: 22px;
  font-weight: 800;
}

.record-value.heaviest { color: #fcd34d; }

.record-sub {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
}

.species-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}

.species-card {
  background: rgba(0, 0, 0, 0.22);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  transition: transform 0.2s;
}

.species-card.discovered:hover {
  transform: translateY(-3px);
}

.species-card.undiscovered {
  opacity: 0.6;
}

.species-silhouette {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.5);
}

.species-emoji {
  font-size: 30px;
  filter: brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
}

.species-unknown {
  font-size: 30px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.4);
}

.species-name {
  color: white;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
}

.species-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2px;
}

.rarity-pill {
  font-weight: 700;
}

.species-detail {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.species-detail.muted {
  font-style: italic;
  color: rgba(255, 255, 255, 0.45);
}

.species-first {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.dark .bestiary {
  background: rgba(45, 55, 72, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .records {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
