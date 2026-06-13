<template>
  <div class="quest-dialog-backdrop" @click.self="$emit('close')">
    <div class="quest-dialog">
      <div class="qd-header">
        <span class="qd-town">{{ townName }}</span>
        <button class="qd-close" type="button" @click="$emit('close')">✕</button>
      </div>

      <!-- Town chain complete: nothing left to offer -->
      <template v-if="!quest">
        <h2 class="qd-title">Nothing left to ask</h2>
        <p class="qd-flavor">
          “You’ve done right by us, friend. {{ townName }} is happy — even if it’s a bit… dented.”
        </p>
        <div class="qd-actions">
          <button class="qd-btn ghost" type="button" @click="$emit('close')">Leave</button>
        </div>
      </template>

      <!-- An offered quest -->
      <template v-else>
        <div class="qd-type-tag" :class="quest.type">{{ typeLabel }}</div>
        <h2 class="qd-title">{{ quest.title }}</h2>
        <p class="qd-flavor">“{{ quest.flavor }}”</p>

        <ul class="qd-details">
          <li>
            <span class="dk">Objective</span>
            <span class="dv">{{ objective }}</span>
          </li>
          <li>
            <span class="dk">Reward</span>
            <span class="dv reward">💰 {{ quest.reward }}</span>
          </li>
          <li>
            <span class="dk">Progress</span>
            <span class="dv">Quest {{ quest.index + 1 }} of {{ chainLength }}</span>
          </li>
        </ul>

        <p class="qd-warning">
          Heads up: lingering here wrecks the town. Get in, do the job, get out.
        </p>

        <div class="qd-actions">
          <button class="qd-btn primary" type="button" @click="$emit('accept', quest)">
            Accept Quest
          </button>
          <button class="qd-btn ghost" type="button" @click="$emit('open-garage')">
            Visit Garage
          </button>
          <button class="qd-btn ghost" type="button" @click="$emit('close')">Maybe later</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  questTypeLabel,
  questObjective,
  type QuestDef,
} from '../../../lib/story/quests'
import { QUESTS_PER_CHAIN } from '../../../composables/useStoryMode'

const props = defineProps<{
  townName: string
  quest: QuestDef | null
}>()

defineEmits<{
  (e: 'accept', quest: QuestDef): void
  (e: 'open-garage'): void
  (e: 'close'): void
}>()

const chainLength = QUESTS_PER_CHAIN
const typeLabel = computed(() => (props.quest ? questTypeLabel(props.quest.type) : ''))
const objective = computed(() => (props.quest ? questObjective(props.quest, 0) : ''))
</script>

<style scoped>
.quest-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
}

.quest-dialog {
  width: min(460px, 92vw);
  padding: 26px 28px 24px;
  border-radius: 18px;
  background: linear-gradient(160deg, #1f2937, #0f172a);
  border: 1px solid rgba(245, 158, 11, 0.35);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  color: #f8fafc;
}

.qd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.qd-town {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fcd34d;
}

.qd-close {
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
}

.qd-close:hover {
  background: rgba(255, 255, 255, 0.16);
}

.qd-type-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 8px;
}

.qd-type-tag.wave_defence { background: rgba(59, 130, 246, 0.22); color: #93c5fd; }
.qd-type-tag.hidden_object { background: rgba(16, 185, 129, 0.22); color: #6ee7b7; }
.qd-type-tag.boss_hunt { background: rgba(239, 68, 68, 0.22); color: #fca5a5; }

.qd-title {
  margin: 0 0 10px;
  font-size: 1.6rem;
  font-weight: 800;
}

.qd-flavor {
  margin: 0 0 16px;
  font-style: italic;
  color: #cbd5e1;
  line-height: 1.5;
}

.qd-details {
  list-style: none;
  margin: 0 0 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.qd-details li {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 0.92rem;
}

.dk {
  color: #94a3b8;
  font-weight: 600;
}

.dv {
  font-weight: 700;
}

.dv.reward {
  color: #fcd34d;
}

.qd-warning {
  margin: 0 0 18px;
  font-size: 0.8rem;
  color: #fca5a5;
}

.qd-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.qd-btn {
  flex: 1 1 auto;
  min-width: 120px;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.qd-btn.primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

.qd-btn.primary:hover {
  box-shadow: 0 0 18px rgba(245, 158, 11, 0.45);
}

.qd-btn.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.qd-btn.ghost:hover {
  background: rgba(255, 255, 255, 0.16);
}
</style>
