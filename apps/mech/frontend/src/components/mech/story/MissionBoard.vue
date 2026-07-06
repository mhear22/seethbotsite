<template>
  <div class="board-backdrop" @click.self="$emit('close')">
    <div class="board">
      <div class="board-header">
        <div class="board-title-wrap">
          <span class="board-kicker">Warden's Office · Mission Board</span>
          <h2 class="board-title">{{ townName }}</h2>
        </div>
        <button class="board-close" type="button" @click="$emit('close')">✕</button>
      </div>

      <p v-if="allDone" class="board-empty">
        Every posting on the board is closed. {{ townName }} holds — scarred, but standing.
      </p>

      <ul class="board-list">
        <li
          v-for="entry in entries"
          :key="entry.quest.id"
          class="board-row"
          :class="entry.status"
        >
          <div class="row-top">
            <span class="row-type" :class="entry.quest.type">{{ entry.typeLabel }}</span>
            <span v-if="entry.onFoot" class="row-onfoot" title="Walked on foot inside town — decay-free (§4.2).">ON FOOT</span>
            <span class="row-name">{{ entry.quest.title }}</span>
            <span class="row-status-tag" :class="entry.status">{{ statusLabel(entry.status) }}</span>
          </div>

          <p class="row-brief">{{ entry.oneLine }}</p>

          <div class="row-bottom">
            <div class="row-tags">
              <span class="tag order" :class="{ sanctioned: entry.rep.sanctioned }">
                {{ entry.rep.sanctioned ? 'Command order' : 'Town request' }}
              </span>
              <span v-if="entry.rep.command" class="tag cmd">CMD {{ signed(entry.rep.command) }}</span>
              <span v-if="entry.rep.town" class="tag town">TOWN {{ signed(entry.rep.town) }}</span>
              <span class="tag reward">◈ {{ entry.quest.reward }}</span>
            </div>
            <button
              v-if="entry.status === 'available'"
              class="row-accept"
              type="button"
              @click="$emit('accept', entry.quest)"
            >Accept</button>
          </div>
        </li>
      </ul>

      <p class="board-hint">Accepting posts the mission — same as taking it from the warden.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MissionBoardEntry, MissionStatus, QuestDef } from '../../../lib/story/quests'

const props = defineProps<{
  /** Settlement whose board this is. */
  townName: string
  /**
   * The town's full chain as rows (built by quests.buildMissionBoard): completed
   * beats, the current acceptable beat, and locked upcoming beats — data-driven.
   */
  entries: MissionBoardEntry[]
}>()

defineEmits<{
  /** Accept the available mission — the host routes this EXACTLY like the
   *  dialogue `acceptQuest` action (mount up / dismount for on-foot Recovery). */
  (e: 'accept', quest: QuestDef): void
  (e: 'close'): void
}>()

const allDone = computed(() => props.entries.every((e) => e.status === 'completed'))

function statusLabel(status: MissionStatus): string {
  switch (status) {
    case 'completed': return 'Cleared'
    case 'available': return 'Open'
    case 'locked': return 'Later'
  }
}

/** Signed rep delta for a tag (e.g. +8, -8). */
function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`
}
</script>

<style scoped>
.board-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
}

.board {
  width: min(560px, 94vw);
  max-height: 88vh;
  overflow-y: auto;
  padding: 22px 24px 20px;
  border-radius: 10px;
  background: linear-gradient(160deg, #141b26, #0a0f18);
  border: 1px solid rgba(245, 158, 11, 0.32);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
  color: #f1f5f9;
}

.board-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.board-kicker {
  font-family: 'SFMono-Regular', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fcd34d;
}

.board-title {
  margin: 4px 0 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.board-close {
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 0 0 auto;
}

.board-close:hover { background: rgba(255, 255, 255, 0.16); }

.board-empty {
  margin: 0 0 14px;
  font-style: italic;
  color: #cbd5e1;
  line-height: 1.5;
}

.board-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.board-row {
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.board-row.available {
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.06);
}

.board-row.completed { opacity: 0.62; }
.board-row.locked { opacity: 0.5; }

.row-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.row-type {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}

.row-type.wave_defence { background: rgba(59, 130, 246, 0.22); color: #93c5fd; }
.row-type.hidden_object { background: rgba(16, 185, 129, 0.22); color: #6ee7b7; }
.row-type.boss_hunt { background: rgba(239, 68, 68, 0.22); color: #fca5a5; }

.row-onfoot {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 4px;
  padding: 1px 6px;
}

.row-name {
  flex: 1;
  font-size: 1rem;
  font-weight: 700;
}

.row-status-tag {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
}

.row-status-tag.completed { background: rgba(52, 211, 153, 0.16); color: #6ee7b7; }
.row-status-tag.available { background: rgba(252, 211, 77, 0.18); color: #fcd34d; }
.row-status-tag.locked { background: rgba(148, 163, 184, 0.16); color: #cbd5e1; }

.row-brief {
  margin: 0 0 10px;
  font-size: 0.86rem;
  font-style: italic;
  color: #cbd5e1;
  line-height: 1.45;
}

.row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.row-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-family: 'SFMono-Regular', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.28);
  color: #cbd5e1;
}

.tag.order { color: #cbd5e1; }
.tag.order.sanctioned { color: #fca5a5; border-color: rgba(248, 113, 113, 0.35); }
.tag.cmd { color: #fca5a5; border-color: rgba(248, 113, 113, 0.35); }
.tag.town { color: #a5b4fc; border-color: rgba(129, 140, 248, 0.35); }
.tag.reward { color: #fcd34d; border-color: rgba(245, 158, 11, 0.35); }

.row-accept {
  flex: 0 0 auto;
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #1c1917;
  font-size: 0.86rem;
  font-weight: 800;
  cursor: pointer;
  transition: box-shadow 0.15s ease;
}

.row-accept:hover { box-shadow: 0 0 18px rgba(245, 158, 11, 0.45); }

.board-hint {
  margin: 16px 0 0;
  text-align: center;
  font-size: 0.7rem;
  color: #64748b;
}
</style>
