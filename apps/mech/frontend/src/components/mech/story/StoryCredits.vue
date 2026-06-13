<template>
  <div class="story-credits" role="dialog" aria-modal="true" aria-label="Run complete">
    <div class="credits-scroll">
      <div class="credits-inner">
        <h1 class="credits-title">The End</h1>

        <!-- Overall verdict / grade -->
        <section class="verdict-block" :class="verdictClass">
          <div class="verdict-label">Verdict</div>
          <div class="verdict-grade">{{ verdict }}</div>
          <p class="verdict-flavor">{{ flavor }}</p>
          <div class="verdict-meter">
            Towns left {{ Math.round(avgDestruction) }}% destroyed on average.
          </div>
        </section>

        <!-- Per-town damage report -->
        <section class="report-block">
          <h2>Aftermath Report</h2>
          <div v-for="r in reports" :key="r.id" class="town-row">
            <div class="town-head">
              <span class="town-name">{{ r.name }}</span>
              <span class="town-tag" :class="statusClass(r)">{{ statusLabel(r) }}</span>
            </div>
            <div class="condition-bar">
              <div
                class="condition-fill"
                :style="{ width: r.condition + '%', background: barColor(r.condition) }"
              ></div>
              <span class="condition-text">{{ r.destroyedPct }}% destroyed</span>
            </div>
            <div class="town-detail">
              <span>👥 {{ r.residentsLost }}/{{ r.residentsInitial }} residents lost</span>
              <span>🌾 {{ r.farmsLost }}/{{ r.farmsTotal }} farms lost</span>
            </div>
          </div>
        </section>

        <!-- Run stats -->
        <section class="stats-block">
          <h2>Run Stats</h2>
          <div class="stat-grid">
            <div class="stat"><span class="stat-num">{{ townsHelped }}</span><span class="stat-cap">towns helped</span></div>
            <div class="stat"><span class="stat-num">{{ stats.questsCompleted }}</span><span class="stat-cap">quests done</span></div>
            <div class="stat"><span class="stat-num">{{ stats.bossesDefeated }}</span><span class="stat-cap">bosses killed</span></div>
            <div class="stat"><span class="stat-num">💰 {{ stats.moneyEarned }}</span><span class="stat-cap">money earned</span></div>
            <div class="stat"><span class="stat-num">{{ elapsedLabel }}</span><span class="stat-cap">time piloted</span></div>
          </div>
        </section>

        <div class="credits-footer">
          <p>A walking disaster — Story Mode v1</p>
          <button class="finish-btn" @click="$emit('finish')">Return to Menu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  verdictFlavor,
  type TownDamageReport,
  type RunStats,
  type Verdict,
} from '../../../composables/useStoryMode'

const props = defineProps<{
  reports: TownDamageReport[]
  stats: RunStats
  townsHelped: number
  realElapsedSec: number
  avgDestruction: number
  verdict: Verdict
}>()

defineEmits<{ (e: 'finish'): void }>()

const flavor = computed(() => verdictFlavor(props.verdict))

const verdictClass = computed(() => `verdict-${props.verdict.toLowerCase()}`)

const elapsedLabel = computed(() => {
  const s = Math.max(0, Math.round(props.realElapsedSec))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem.toString().padStart(2, '0')}s`
})

function statusLabel(r: TownDamageReport): string {
  if (r.helped) return 'SAVED'
  if (r.cleared) return 'LIBERATED'
  return 'ABANDONED'
}

function statusClass(r: TownDamageReport): string {
  if (r.helped) return 'tag-saved'
  if (r.cleared) return 'tag-liberated'
  return 'tag-abandoned'
}

function barColor(condition: number): string {
  if (condition >= 66) return '#22c55e'
  if (condition >= 33) return '#eab308'
  return '#ef4444'
}
</script>

<style scoped>
.story-credits {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: radial-gradient(circle at 50% 0%, #1f2937, #050a14 70%);
  overflow-y: auto;
  display: flex;
  justify-content: center;
}

.credits-scroll {
  width: 100%;
  max-width: 640px;
  padding: 60px 24px 80px;
}

.credits-inner {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.credits-title {
  text-align: center;
  color: #fff;
  font-size: 3rem;
  letter-spacing: 0.06em;
  text-shadow: 0 0 24px rgba(245, 158, 11, 0.6);
  margin: 0;
}

h2 {
  color: #fcd34d;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 14px;
}

/* Verdict */
.verdict-block {
  text-align: center;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(15, 23, 42, 0.6);
}

.verdict-label {
  color: #9ca3af;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.verdict-grade {
  font-size: 2.6rem;
  font-weight: 900;
  margin: 4px 0 8px;
}

.verdict-hero .verdict-grade { color: #34d399; text-shadow: 0 0 20px rgba(52, 211, 153, 0.6); }
.verdict-mercenary .verdict-grade { color: #fcd34d; text-shadow: 0 0 20px rgba(252, 211, 77, 0.5); }
.verdict-menace .verdict-grade { color: #fb923c; text-shadow: 0 0 20px rgba(251, 146, 60, 0.5); }
.verdict-monster .verdict-grade { color: #f87171; text-shadow: 0 0 22px rgba(248, 113, 113, 0.6); }

.verdict-flavor {
  color: #e5e7eb;
  font-size: 1rem;
  line-height: 1.5;
  margin: 6px 0 12px;
}

.verdict-meter {
  color: #9ca3af;
  font-size: 0.85rem;
}

/* Per-town report */
.report-block {
  padding: 22px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.town-row {
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.town-row:last-child { border-bottom: none; }

.town-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.town-name { color: #fff; font-weight: 700; font-size: 1.05rem; }

.town-tag {
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 999px;
}

.tag-saved { background: rgba(52, 211, 153, 0.2); color: #6ee7b7; }
.tag-liberated { background: rgba(96, 165, 250, 0.2); color: #93c5fd; }
.tag-abandoned { background: rgba(248, 113, 113, 0.2); color: #fca5a5; }

.condition-bar {
  position: relative;
  height: 18px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.4);
  overflow: hidden;
  margin-bottom: 6px;
}

.condition-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.condition-text {
  position: absolute;
  right: 10px;
  top: 0;
  line-height: 18px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.town-detail {
  display: flex;
  gap: 18px;
  color: #9ca3af;
  font-size: 0.82rem;
}

/* Run stats */
.stats-block {
  padding: 22px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 14px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.25);
}

.stat-num { color: #fcd34d; font-size: 1.4rem; font-weight: 900; }
.stat-cap { color: #9ca3af; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; }

.credits-footer {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.credits-footer p { color: #6b7280; font-size: 0.85rem; }

.finish-btn {
  padding: 14px 36px;
  font-size: 1.05rem;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  transition: box-shadow 0.2s ease;
}

.finish-btn:hover { box-shadow: 0 0 24px rgba(245, 158, 11, 0.5); }
</style>
