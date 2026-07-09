<template>
  <div class="step-content review-step">
    <h2>
      <MechIcons icon="synergy-target" :size="20" style="vertical-align: middle; margin-right: 8px" />
      Review Your Build
    </h2>

    <div class="review-layout">
      <div class="mech-visual">
        <div class="mech-diagram">
          <div class="mech-part mech-head">
            <MechIcons :icon="loadout.head?.icon || 'unknown'" :size="36" />
            <span class="part-label">{{ loadout.head?.name || 'No Head' }}</span>
            <PartDeltaTooltip v-if="loadout.head" :part="loadout.head" />
          </div>
          <div class="mech-part mech-core">
            <MechIcons :icon="loadout.core?.icon || 'unknown'" :size="48" />
            <span class="part-label">{{ loadout.core?.name || 'No Core' }}</span>
            <PartDeltaTooltip v-if="loadout.core" :part="loadout.core" />
          </div>
          <div class="mech-arms-row">
            <div class="mech-part mech-arm">
              <MechIcons :icon="loadout.leftArm?.icon || 'unknown'" :size="36" />
              <span class="part-label">{{ loadout.leftArm?.name || 'Empty' }}</span>
              <PartDeltaTooltip v-if="loadout.leftArm" :part="loadout.leftArm" />
            </div>
            <div class="mech-part mech-arm">
              <MechIcons :icon="loadout.rightArm?.icon || 'unknown'" :size="36" />
              <span class="part-label">{{ loadout.rightArm?.name || 'Empty' }}</span>
              <PartDeltaTooltip v-if="loadout.rightArm" :part="loadout.rightArm" />
            </div>
          </div>
          <div class="mech-part mech-legs">
            <MechIcons :icon="loadout.legs?.icon || 'unknown'" :size="36" />
            <span class="part-label">{{ loadout.legs?.name || 'No Legs' }}</span>
            <PartDeltaTooltip v-if="loadout.legs" :part="loadout.legs" />
          </div>
          <div v-if="loadout.rack" class="mech-part mech-rack">
            <MechIcons :icon="loadout.rack.icon" :size="28" />
            <span class="part-label">{{ loadout.rack.name }}</span>
            <PartDeltaTooltip :part="loadout.rack" />
          </div>
        </div>
      </div>

      <div class="stats-summary">
        <h3>Total Stats</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <MechIcons icon="health" :size="18" />
            <span class="stat-label">Health</span>
            <span class="stat-value">{{ totalStats.health }}</span>
          </div>
          <div class="stat-item">
            <MechIcons icon="armor" :size="18" />
            <span class="stat-label">Armor</span>
            <span class="stat-value">{{ totalStats.armor }}</span>
          </div>
          <div class="stat-item">
            <MechIcons icon="speed" :size="18" />
            <span class="stat-label">Speed</span>
            <span class="stat-value">{{ totalStats.speed }}</span>
          </div>
          <div class="stat-item">
            <MechIcons icon="energy" :size="18" />
            <span class="stat-label">Energy</span>
            <span class="stat-value" :class="{ negative: totalStats.energy < 0 }">{{ totalStats.energy }}</span>
          </div>
          <div class="stat-item">
            <MechIcons icon="firepower" :size="18" />
            <span class="stat-label">Firepower</span>
            <span class="stat-value">{{ totalStats.firepower }}</span>
          </div>
          <div class="stat-item">
            <MechIcons icon="accuracy" :size="18" />
            <span class="stat-label">Accuracy</span>
            <span class="stat-value">{{ totalStats.accuracy }}</span>
          </div>
        </div>

        <div class="build-score">
          <span class="score-label">Build Score</span>
          <span class="score-value">{{ buildScore }}</span>
        </div>
      </div>

      <div class="synergies-section">
        <h3>
          <MechIcons icon="synergy-bolt" :size="18" style="vertical-align: middle; margin-right: 8px" />
          Active Synergies
        </h3>
        <div v-if="activeSynergies.length === 0" class="no-synergies">
          No synergies active
        </div>
        <div v-else class="synergy-list">
          <div v-for="synergy in activeSynergies" :key="synergy.id" class="synergy-card">
            <MechIcons :icon="synergy.icon" :size="24" />
            <div class="synergy-info">
              <div class="synergy-name">{{ synergy.name }}</div>
              <div class="synergy-description">{{ synergy.description }}</div>
              <div v-if="synergy.specialEffect" class="synergy-effect">{{ synergy.specialEffect }}</div>
              <div class="synergy-bonuses">
                <span v-if="synergy.statBonus.health">Health +{{ synergy.statBonus.health }}</span>
                <span v-if="synergy.statBonus.armor">Armor +{{ synergy.statBonus.armor }}</span>
                <span v-if="synergy.statBonus.speed">Speed +{{ synergy.statBonus.speed }}</span>
                <span v-if="synergy.statBonus.energy">Energy +{{ synergy.statBonus.energy }}</span>
                <span v-if="synergy.statBonus.firepower">Firepower +{{ synergy.statBonus.firepower }}</span>
                <span v-if="synergy.statBonus.accuracy">Accuracy +{{ synergy.statBonus.accuracy }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="warnings.length > 0" class="warnings-section">
        <h3>⚠️ Warnings</h3>
        <div class="warning-item" v-for="(warning, idx) in warnings" :key="idx">
          {{ warning }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MechLoadout, MechStats, SynergyEffect } from '../../../../composables/useMechBuilder'
import MechIcons from '../../../mech/MechIcons.vue'
import PartDeltaTooltip from './PartDeltaTooltip.vue'

defineProps<{
  loadout: MechLoadout
  totalStats: MechStats
  activeSynergies: SynergyEffect[]
  buildScore: number
  warnings: string[]
}>()
</script>

<style scoped>
.review-step {
  padding: var(--mech-space-4);
}

.review-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.mech-visual {
  grid-column: 1 / -1;
  background: var(--mech-surface);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-md);
  padding: var(--mech-space-3);
}

.mech-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mech-space-2);
}

.mech-part {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--mech-space-2);
  background: var(--mech-surface-2);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-sm);
  min-width: 100px;
  position: relative;
  cursor: help;
  transition: border-color var(--mech-transition);
}

.mech-part:hover {
  border-color: var(--mech-border-accent);
}

.mech-arms-row {
  display: flex;
  gap: var(--mech-space-3);
}

.part-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--mech-text);
  text-align: center;
}

.stats-summary {
  background: var(--mech-surface);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-md);
  padding: 12px 14px;
}

.stats-summary h3 {
  margin: 0 0 var(--mech-space-3) 0;
  color: var(--mech-text);
  font-size: 15px;
  letter-spacing: var(--mech-tracking-wide);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--mech-space-2);
  margin-bottom: var(--mech-space-3);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--mech-space-2);
  background: var(--mech-surface-2);
  border-radius: var(--mech-radius-sm);
}

.stat-label {
  font-size: 11px;
  color: var(--mech-text-dim);
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--mech-text);
}

.stat-value.negative {
  color: var(--mech-danger);
}

.build-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--mech-space-2) var(--mech-space-3);
  background: var(--mech-purple-grad);
  border-radius: var(--mech-radius-sm);
  color: #fff;
}

.score-label {
  font-size: 13px;
  font-weight: 600;
}

.score-value {
  font-size: 20px;
  font-weight: 700;
}

.synergies-section {
  background: var(--mech-surface);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-md);
  padding: 12px 14px;
}

.synergies-section h3 {
  margin: 0 0 var(--mech-space-3) 0;
  color: var(--mech-text);
  font-size: 15px;
  letter-spacing: var(--mech-tracking-wide);
}

.no-synergies {
  text-align: center;
  padding: var(--mech-space-4);
  color: var(--mech-text-muted);
  font-size: 13px;
}

.synergy-list {
  display: flex;
  flex-direction: column;
  gap: var(--mech-space-2);
}

.synergy-card {
  display: flex;
  gap: var(--mech-space-3);
  padding: var(--mech-space-2) var(--mech-space-3);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid var(--mech-warn-glow);
  border-radius: var(--mech-radius-sm);
}

.synergy-info {
  flex: 1;
}

.synergy-name {
  font-weight: 700;
  font-size: 13px;
  color: var(--mech-warn);
  margin-bottom: 3px;
}

.synergy-description {
  font-size: 12px;
  color: var(--mech-text-dim);
  margin-bottom: var(--mech-space-1);
}

.synergy-effect {
  font-size: 12px;
  font-style: italic;
  color: var(--mech-warn);
  margin-bottom: var(--mech-space-1);
}

.synergy-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: var(--mech-space-1);
}

.synergy-bonuses span {
  padding: 2px 6px;
  background: rgba(245, 158, 11, 0.18);
  border-radius: var(--mech-radius-sm);
  font-size: 11px;
  font-weight: 600;
  color: var(--mech-warn);
}

.warnings-section {
  grid-column: 1 / -1;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid var(--mech-danger-glow);
  border-radius: var(--mech-radius-md);
  padding: 12px 14px;
}

.warnings-section h3 {
  margin: 0 0 var(--mech-space-3) 0;
  color: var(--mech-danger);
  font-size: 15px;
}

.warning-item {
  padding: var(--mech-space-2);
  background: var(--mech-surface-2);
  border-left: 4px solid var(--mech-danger-strong);
  border-radius: var(--mech-radius-sm);
  margin-bottom: var(--mech-space-2);
  color: var(--mech-danger);
  font-size: 12px;
}
</style>
