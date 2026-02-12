<template>
  <div class="step-content review-step">
    <h2>
      <MechIcons icon="synergy-target" :size="32" style="vertical-align: middle; margin-right: 8px" />
      Review Your Build
    </h2>

    <div class="review-layout">
      <div class="mech-visual">
        <div class="mech-diagram">
          <div class="mech-part mech-head">
            <MechIcons :icon="loadout.head?.icon || 'unknown'" :size="64" />
            <span class="part-label">{{ loadout.head?.name || 'No Head' }}</span>
          </div>
          <div class="mech-part mech-core">
            <MechIcons :icon="loadout.core?.icon || 'unknown'" :size="80" />
            <span class="part-label">{{ loadout.core?.name || 'No Core' }}</span>
          </div>
          <div class="mech-arms-row">
            <div class="mech-part mech-arm">
              <MechIcons :icon="loadout.leftArm?.icon || 'unknown'" :size="64" />
              <span class="part-label">{{ loadout.leftArm?.name || 'Empty' }}</span>
            </div>
            <div class="mech-part mech-arm">
              <MechIcons :icon="loadout.rightArm?.icon || 'unknown'" :size="64" />
              <span class="part-label">{{ loadout.rightArm?.name || 'Empty' }}</span>
            </div>
          </div>
          <div class="mech-part mech-legs">
            <MechIcons :icon="loadout.legs?.icon || 'unknown'" :size="64" />
            <span class="part-label">{{ loadout.legs?.name || 'No Legs' }}</span>
          </div>
          <div v-if="loadout.rack" class="mech-part mech-rack">
            <MechIcons :icon="loadout.rack.icon" :size="48" />
            <span class="part-label">{{ loadout.rack.name }}</span>
          </div>
        </div>
      </div>

      <div class="stats-summary">
        <h3>Total Stats</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <MechIcons icon="health" :size="24" />
            <span class="stat-label">Health</span>
            <span class="stat-value">{{ totalStats.health }}</span>
          </div>
          <div class="stat-item">
            <MechIcons icon="armor" :size="24" />
            <span class="stat-label">Armor</span>
            <span class="stat-value">{{ totalStats.armor }}</span>
          </div>
          <div class="stat-item">
            <MechIcons icon="speed" :size="24" />
            <span class="stat-label">Speed</span>
            <span class="stat-value">{{ totalStats.speed }}</span>
          </div>
          <div class="stat-item">
            <MechIcons icon="energy" :size="24" />
            <span class="stat-label">Energy</span>
            <span class="stat-value" :class="{ negative: totalStats.energy < 0 }">{{ totalStats.energy }}</span>
          </div>
          <div class="stat-item">
            <MechIcons icon="firepower" :size="24" />
            <span class="stat-label">Firepower</span>
            <span class="stat-value">{{ totalStats.firepower }}</span>
          </div>
          <div class="stat-item">
            <MechIcons icon="accuracy" :size="24" />
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
          <MechIcons icon="synergy-bolt" :size="24" style="vertical-align: middle; margin-right: 8px" />
          Active Synergies
        </h3>
        <div v-if="activeSynergies.length === 0" class="no-synergies">
          No synergies active
        </div>
        <div v-else class="synergy-list">
          <div v-for="synergy in activeSynergies" :key="synergy.id" class="synergy-card">
            <MechIcons :icon="synergy.icon" :size="32" />
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
  padding: 20px;
}

.review-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.mech-visual {
  grid-column: 1 / -1;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}

.mech-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.mech-part {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f7fafc;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  min-width: 150px;
}

.mech-arms-row {
  display: flex;
  gap: 24px;
}

.part-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
}

.stats-summary {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}

.stats-summary h3 {
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.stat-label {
  font-size: 13px;
  color: #718096;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
}

.stat-value.negative {
  color: #e53e3e;
}

.build-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.score-label {
  font-size: 16px;
  font-weight: 600;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
}

.synergies-section {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}

.synergies-section h3 {
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 20px;
}

.no-synergies {
  text-align: center;
  padding: 40px;
  color: #a0aec0;
  font-size: 16px;
}

.synergy-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.synergy-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fff5e6;
  border: 2px solid #ed8936;
  border-radius: 8px;
}

.synergy-info {
  flex: 1;
}

.synergy-name {
  font-weight: 700;
  font-size: 16px;
  color: #c05621;
  margin-bottom: 4px;
}

.synergy-description {
  font-size: 14px;
  color: #744210;
  margin-bottom: 8px;
}

.synergy-effect {
  font-size: 13px;
  font-style: italic;
  color: #975a16;
  margin-bottom: 8px;
}

.synergy-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.synergy-bonuses span {
  padding: 4px 8px;
  background: #fed7aa;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #7c2d12;
}

.warnings-section {
  grid-column: 1 / -1;
  background: #fff5f5;
  border: 2px solid #fc8181;
  border-radius: 12px;
  padding: 24px;
}

.warnings-section h3 {
  margin: 0 0 16px 0;
  color: #c53030;
  font-size: 20px;
}

.warning-item {
  padding: 12px;
  background: white;
  border-left: 4px solid #e53e3e;
  border-radius: 4px;
  margin-bottom: 8px;
  color: #742a2a;
  font-size: 14px;
}

/* Dark mode */
.dark .mech-visual,
.dark .stats-summary,
.dark .synergies-section {
  background: #2d3748;
  border-color: #4a5568;
}

.dark .mech-part {
  background: #1a202c;
  border-color: #4a5568;
}

.dark .part-label {
  color: #e2e8f0;
}

.dark .stats-summary h3,
.dark .synergies-section h3 {
  color: #e2e8f0;
}

.dark .stat-item {
  background: #1a202c;
}

.dark .stat-label {
  color: #cbd5e0;
}

.dark .stat-value {
  color: #e2e8f0;
}

.dark .no-synergies {
  color: #718096;
}

.dark .synergy-card {
  background: #744210;
  border-color: #ed8936;
}

.dark .synergy-name {
  color: #fed7aa;
}

.dark .synergy-description {
  color: #feebc8;
}

.dark .synergy-effect {
  color: #fed7aa;
}

.dark .synergy-bonuses span {
  background: #975a16;
  color: #feebc8;
}

.dark .warnings-section {
  background: #742a2a;
  border-color: #fc8181;
}

.dark .warnings-section h3 {
  color: #feb2b2;
}

.dark .warning-item {
  background: #2d3748;
  color: #feb2b2;
}
</style>
