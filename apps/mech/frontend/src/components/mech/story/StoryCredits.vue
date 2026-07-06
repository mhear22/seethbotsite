<template>
  <div class="story-credits" role="dialog" aria-modal="true" aria-label="Tribunal record">
    <div class="credits-scroll">
      <div class="credits-inner">
        <div class="credits-eyebrow">Directorate Tribunal · Talus Reach</div>
        <h1 class="credits-title">{{ title }}</h1>

        <!-- Overall verdict / tribunal finding -->
        <section class="verdict-block" :class="verdictClass">
          <div class="verdict-label">Tribunal Finding</div>
          <div class="verdict-grade">{{ verdict }}</div>
          <p class="verdict-flavor">{{ finding }}</p>
          <div class="verdict-meter">
            Average settlement destruction on the record: {{ Math.round(avgDestruction) }}%.
          </div>
        </section>

        <!-- storyFlag callouts — refused orders, reprisals, etc. (data-driven) -->
        <section v-if="flags.length" class="findings-block">
          <h2>On the Record</h2>
          <ul class="findings-list">
            <li v-for="(f, i) in flags" :key="i" class="finding-row">
              <span class="finding-mark">▸</span>
              <span class="finding-body">
                <span class="finding-label">{{ f.label }}</span>
                <span v-if="f.detail" class="finding-detail">{{ f.detail }}</span>
              </span>
            </li>
          </ul>
        </section>

        <!-- Per-settlement damage — entered as evidence -->
        <section class="report-block">
          <h2>Evidence · Per-Settlement Damage</h2>
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
              <span class="condition-text">{{ r.destroyedPct }}% razed</span>
            </div>
            <div class="town-detail">
              <span>Casualties: {{ r.residentsLost }} of {{ r.residentsInitial }}</span>
              <span>Infrastructure lost: {{ r.farmsLost }} of {{ r.farmsTotal }}</span>
            </div>
          </div>
        </section>

        <!-- Service record -->
        <section class="stats-block">
          <h2>Service Record</h2>
          <div class="stat-grid">
            <div class="stat"><span class="stat-num">{{ townsHelped }}</span><span class="stat-cap">settlements held</span></div>
            <div class="stat"><span class="stat-num">{{ stats.questsCompleted }}</span><span class="stat-cap">contracts filled</span></div>
            <div class="stat"><span class="stat-num">{{ stats.bossesDefeated }}</span><span class="stat-cap">aces downed</span></div>
            <div class="stat"><span class="stat-num">◈ {{ stats.moneyEarned }}</span><span class="stat-cap">salvage recovered</span></div>
            <div class="stat"><span class="stat-num">{{ elapsedLabel }}</span><span class="stat-cap">time in the Frame</span></div>
          </div>
        </section>

        <div class="credits-footer">
          <p>{{ footerNote }}</p>
          <button class="finish-btn" @click="$emit('finish')">{{ finishLabel }}</button>
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

/** A single storyFlag callout on the tribunal record (CONTENT supplies copy). */
interface TribunalFlag {
  label: string
  detail?: string
}

const props = withDefaults(
  defineProps<{
    reports: TownDamageReport[]
    stats: RunStats
    townsHelped: number
    realElapsedSec: number
    avgDestruction: number
    verdict: Verdict
    /** Headline of the record. */
    title?: string
    /**
     * The tribunal finding prose. CONTENT owns campaign copy; omit to fall back
     * to the built-in per-verdict flavor.
     */
    findingText?: string
    /** storyFlag callouts (refused orders, reprisals…). Empty = section hidden. */
    flags?: TribunalFlag[]
    finishLabel?: string
    footerNote?: string
  }>(),
  {
    title: 'Tribunal Record',
    findingText: undefined,
    flags: () => [],
    finishLabel: 'Close the file',
    footerNote: 'Filed by the Directorate. Contested by no one still alive to contest it.',
  },
)

defineEmits<{ (e: 'finish'): void }>()

// Prefer CONTENT-supplied finding prose; fall back to the built-in flavor.
const finding = computed(() => props.findingText ?? verdictFlavor(props.verdict))

const flags = computed(() => props.flags ?? [])

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

.credits-eyebrow {
  text-align: center;
  font-family: 'SFMono-Regular', ui-monospace, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: -20px;
}

.credits-title {
  text-align: center;
  color: #fff;
  font-size: 2.6rem;
  letter-spacing: 0.05em;
  text-shadow: 0 0 24px rgba(245, 158, 11, 0.5);
  margin: 0;
}

/* storyFlag callouts */
.findings-block {
  padding: 22px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.findings-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.finding-row {
  display: flex;
  gap: 10px;
  align-items: baseline;
}

.finding-mark {
  color: #f59e0b;
  flex: 0 0 auto;
}

.finding-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.finding-label {
  color: #f1f5f9;
  font-weight: 700;
  font-size: 0.95rem;
}

.finding-detail {
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.45;
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
