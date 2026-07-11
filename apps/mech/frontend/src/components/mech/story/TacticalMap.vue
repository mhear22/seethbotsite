<template>
  <div class="tacmap-backdrop" @click.self="$emit('close')">
    <div class="tacmap-panel" role="dialog" aria-modal="true" aria-label="Tactical map of the Talus Reach">
      <div class="tacmap-header">
        <h2 class="tacmap-title">TALUS REACH — TACTICAL</h2>
        <span class="tacmap-phase">{{ phaseLabel }}</span>
        <button type="button" class="tacmap-close" aria-label="Close map" @click="$emit('close')">&times;</button>
      </div>

      <div class="tacmap-body">
        <!-- The map square. Pure CSS positioning off the tested projection. -->
        <div class="tacmap-map" aria-hidden="false">
          <!-- Range rings + grid, decorative -->
          <div class="tacmap-grid" aria-hidden="true"></div>
          <div class="tacmap-ring outer" aria-hidden="true"></div>
          <div class="tacmap-ring inner" aria-hidden="true"></div>

          <!-- Towns -->
          <button
            v-for="m in markers"
            :key="m.id"
            type="button"
            class="tacmap-town"
            :class="[m.status, { active: m.id === activeQuestTownId, focused: m.id === focusedId }]"
            :style="{ left: m.xPct + '%', top: m.yPct + '%' }"
            :aria-label="`${m.name} — ${statusLabel(m.status)}, condition ${m.condition}%, standing ${m.standing}, ${m.distance}m away`"
            @click="focusedId = focusedId === m.id ? null : m.id"
          >
            <span class="town-dot"></span>
            <span class="town-name">{{ m.name }}</span>
            <span v-if="m.id === activeQuestTownId" class="town-quest" title="Active mission">◆</span>
          </button>

          <!-- Player -->
          <div
            class="tacmap-player"
            :style="{ left: player.xPct + '%', top: player.yPct + '%' }"
            title="Your Frame"
          >
            <span class="player-pulse"></span>
            <span class="player-dot"></span>
          </div>
        </div>

        <!-- Side panel: selected town detail, else the roster. -->
        <div class="tacmap-side">
          <template v-if="focusedMarker">
            <div class="side-town">
              <div class="side-town-head">
                <span class="side-town-name">{{ focusedMarker.name }}</span>
                <span class="side-status" :class="focusedMarker.status">{{ statusLabel(focusedMarker.status) }}</span>
              </div>
              <div class="side-row">
                <span class="side-label">Condition</span>
                <div class="side-bar"><div class="side-fill cond" :style="{ width: focusedMarker.condition + '%' }"></div></div>
                <span class="side-val">{{ focusedMarker.condition }}%</span>
              </div>
              <div class="side-row">
                <span class="side-label">Standing</span>
                <div class="side-bar"><div class="side-fill stand" :style="{ width: focusedMarker.standing + '%' }"></div></div>
                <span class="side-val">{{ focusedMarker.standing }}</span>
              </div>
              <p class="side-dist">{{ focusedMarker.distance }}m out</p>
              <p class="side-hint">{{ statusHint(focusedMarker.status) }}</p>
            </div>
          </template>
          <template v-else>
            <ul class="side-roster">
              <li
                v-for="m in rosterSorted"
                :key="m.id"
                class="roster-row"
                :class="m.status"
                @click="focusedId = m.id"
              >
                <span class="roster-dot" :class="m.status"></span>
                <span class="roster-name">{{ m.name }}</span>
                <span class="roster-meta">{{ m.condition }}% · {{ m.distance }}m</span>
              </li>
            </ul>
          </template>

          <div class="tacmap-legend">
            <span class="legend-item"><span class="roster-dot held"></span>Held</span>
            <span class="legend-item"><span class="roster-dot friendly"></span>Friendly</span>
            <span class="legend-item"><span class="roster-dot neutral"></span>Cold</span>
            <span class="legend-item"><span class="roster-dot hostile"></span>Occupied</span>
            <span class="legend-item"><span class="roster-dot cleared"></span>Cleared</span>
          </div>
        </div>
      </div>

      <p class="tacmap-foot">M / Esc close · click a settlement for detail</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { StoryPhase, TownState } from '../../../composables/useStoryMode'
import {
  buildTownMarkers,
  projectToMap,
  statusLabel,
  type TownMapStatus,
} from '../../../lib/story/tacticalMap'

const props = defineProps<{
  towns: TownState[]
  /** Player world position (x/z) captured when the map opened (world is paused). */
  playerX: number
  playerZ: number
  phase: StoryPhase
  /** Ids of towns currently held by finale aces. */
  finaleTargetIds: string[]
  /** Town with the active quest, if any. */
  activeQuestTownId: string | null
  /** World half-extent (map spans ±this). */
  halfExtent: number
  phaseLabel: string
}>()

defineEmits<{ (e: 'close'): void }>()

const focusedId = ref<string | null>(null)

const markers = computed(() =>
  buildTownMarkers(props.towns, props.playerX, props.playerZ, props.phase, props.finaleTargetIds, props.halfExtent),
)
const rosterSorted = computed(() => [...markers.value].sort((a, b) => a.distance - b.distance))
const focusedMarker = computed(() => markers.value.find((m) => m.id === focusedId.value) ?? null)
const player = computed(() => projectToMap(props.playerX, props.playerZ, props.halfExtent))

/** One-line tactical read per status — the map should advise, not just report. */
function statusHint(status: TownMapStatus): string {
  switch (status) {
    case 'hostile': return 'An ace holds this ground. Repair, refit, and take it back.'
    case 'cleared': return 'Nothing left to do here but remember it.'
    case 'held': return 'Counts toward the withdrawal gate. Your presence still bleeds it — keep visits short.'
    case 'friendly': return 'Standing earned. Finish the chain to hold it.'
    default: return 'No relationship. They only know your silhouette.'
  }
}
</script>

<style scoped>
.tacmap-backdrop {
  position: fixed;
  inset: 0;
  background: var(--mech-overlay);
  backdrop-filter: var(--mech-blur);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 900;
  font-family: var(--mech-font);
}

.tacmap-panel {
  width: min(92vw, 820px);
  max-height: 92vh;
  overflow-y: auto;
  background: var(--mech-surface);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-lg);
  box-shadow: var(--mech-shadow-lg);
  padding: var(--mech-space-4) var(--mech-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--mech-space-3);
}

.tacmap-header {
  display: flex;
  align-items: center;
  gap: var(--mech-space-3);
}

.tacmap-title {
  margin: 0;
  font-size: 1rem;
  letter-spacing: var(--mech-tracking-wide);
  color: var(--mech-accent);
}

.tacmap-phase {
  font-size: 0.8rem;
  color: var(--mech-text-dim);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-sm);
  padding: 2px 8px;
}

.tacmap-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--mech-text-dim);
  font-size: 1.6rem;
  line-height: 1;
  width: 30px;
  height: 30px;
  cursor: pointer;
  border-radius: var(--mech-radius-sm);
}
.tacmap-close:hover { color: var(--mech-text); background: var(--mech-surface-2); }
.tacmap-close:focus-visible { outline: 2px solid var(--mech-accent); outline-offset: 2px; }

.tacmap-body {
  display: flex;
  gap: var(--mech-space-4);
  align-items: stretch;
  flex-wrap: wrap;
}

/* --- Map square --- */
.tacmap-map {
  position: relative;
  flex: 1 1 340px;
  aspect-ratio: 1;
  min-width: 280px;
  background:
    radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.06), transparent 65%),
    var(--mech-bg-800);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-md);
  overflow: hidden;
}

.tacmap-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--mech-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--mech-border) 1px, transparent 1px);
  background-size: 12.5% 12.5%;
  opacity: 0.35;
}

.tacmap-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 1px dashed var(--mech-border-strong);
  border-radius: 50%;
  opacity: 0.4;
}
/* Town rings sit at 0.55/0.78 of half-extent; the map spans ±half-extent with an
   8% margin, so ring diameter = fraction × (100% − 2×8%). */
.tacmap-ring.inner { width: 46.2%; height: 46.2%; }
.tacmap-ring.outer { width: 65.5%; height: 65.5%; }

/* --- Town markers --- */
.tacmap-town {
  position: absolute;
  transform: translate(-50%, -50%);
  background: none;
  border: none;
  padding: 10px; /* generous hit target */
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--mech-text);
}
.tacmap-town:focus-visible { outline: 2px solid var(--mech-accent); outline-offset: -4px; border-radius: var(--mech-radius-sm); }

.town-dot {
  width: 11px;
  height: 11px;
  border-radius: 3px;
  transform: rotate(45deg);
  border: 1.5px solid currentColor;
  background: var(--mech-bg-700);
}
.tacmap-town.held { color: var(--mech-success); }
.tacmap-town.held .town-dot { background: var(--mech-success); box-shadow: 0 0 8px var(--mech-success-glow); }
.tacmap-town.friendly { color: var(--mech-accent); }
.tacmap-town.friendly .town-dot { background: var(--mech-accent-soft); }
.tacmap-town.neutral { color: var(--mech-text-dim); }
.tacmap-town.hostile { color: var(--mech-danger); }
.tacmap-town.hostile .town-dot { background: var(--mech-danger); box-shadow: 0 0 10px var(--mech-danger-glow); animation: tac-threat 1.6s ease-in-out infinite; }
.tacmap-town.cleared { color: var(--mech-text-muted); }
.tacmap-town.cleared .town-dot { background: var(--mech-text-muted); opacity: 0.6; }
.tacmap-town.focused .town-dot { outline: 2px solid var(--mech-accent); outline-offset: 2px; }

@keyframes tac-threat {
  0%, 100% { box-shadow: 0 0 4px var(--mech-danger-glow); }
  50% { box-shadow: 0 0 14px var(--mech-danger-glow); }
}

.town-name {
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.town-quest {
  position: absolute;
  top: -4px;
  right: -2px;
  color: var(--mech-warn);
  font-size: 0.8rem;
  text-shadow: 0 0 6px var(--mech-warn-glow);
}

/* --- Player marker --- */
.tacmap-player {
  position: absolute;
  width: 26px;
  height: 26px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.player-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mech-warn);
  box-shadow: 0 0 8px var(--mech-warn-glow);
}
.player-pulse {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid var(--mech-warn);
  animation: tac-pulse 2s ease-out infinite;
}
@keyframes tac-pulse {
  0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .player-pulse, .tacmap-town.hostile .town-dot { animation: none; }
}

/* --- Side panel --- */
.tacmap-side {
  flex: 1 1 220px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: var(--mech-space-3);
}

.side-town {
  background: var(--mech-surface-2);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-md);
  padding: var(--mech-space-3);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.side-town-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.side-town-name { font-weight: 700; letter-spacing: 0.03em; }
.side-status { font-size: 0.72rem; padding: 2px 8px; border-radius: var(--mech-radius-sm); border: 1px solid currentColor; }
.side-status.held { color: var(--mech-success); }
.side-status.friendly { color: var(--mech-accent); }
.side-status.neutral { color: var(--mech-text-dim); }
.side-status.hostile { color: var(--mech-danger); }
.side-status.cleared { color: var(--mech-text-muted); }

.side-row { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
.side-label { width: 64px; color: var(--mech-text-dim); }
.side-bar { flex: 1; height: 6px; background: var(--mech-bg-700); border-radius: 3px; overflow: hidden; }
.side-fill { height: 100%; border-radius: 3px; }
.side-fill.cond { background: var(--mech-warn-grad); }
.side-fill.stand { background: var(--mech-accent-grad); }
.side-val { width: 38px; text-align: right; font-variant-numeric: tabular-nums; }
.side-dist { margin: 0; font-size: 0.78rem; color: var(--mech-text-dim); }
.side-hint { margin: 0; font-size: 0.78rem; color: var(--mech-text-dim); line-height: 1.45; font-style: italic; }

.side-roster { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.roster-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-sm);
  background: var(--mech-surface-2);
  font-size: 0.8rem;
  cursor: pointer;
}
.roster-row:hover { border-color: var(--mech-border-accent); }
.roster-name { flex: 1; }
.roster-meta { color: var(--mech-text-dim); font-variant-numeric: tabular-nums; }

.roster-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  transform: rotate(45deg);
  flex-shrink: 0;
  background: var(--mech-text-dim);
}
.roster-dot.held { background: var(--mech-success); }
.roster-dot.friendly { background: var(--mech-accent); }
.roster-dot.neutral { background: var(--mech-text-dim); }
.roster-dot.hostile { background: var(--mech-danger); }
.roster-dot.cleared { background: var(--mech-text-muted); }

.tacmap-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  font-size: 0.72rem;
  color: var(--mech-text-dim);
  margin-top: auto;
}
.legend-item { display: inline-flex; align-items: center; gap: 6px; }

.tacmap-foot {
  margin: 0;
  text-align: center;
  font-size: 0.72rem;
  color: var(--mech-text-muted);
  letter-spacing: 0.04em;
}
</style>
