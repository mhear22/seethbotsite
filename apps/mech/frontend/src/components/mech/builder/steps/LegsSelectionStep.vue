<template>
  <div class="step-content">
    <h2>
      <MechIcons icon="bipedal" :size="16" style="vertical-align: middle; margin-right: 8px" />
      Select Your Legs
    </h2>
    <p class="step-description">Legs determine mobility, stability, and terrain handling.</p>

    <div class="split-layout">
      <div class="parts-list">
        <div
          v-for="legs in legsPresets"
          :key="legs.id"
          class="part-list-item"
          :class="{
            selected: selectedLegs?.id === legs.id,
            [`rarity-${legs.rarity}`]: true
          }"
          @click="$emit('select', legs)"
        >
          <MechIcons :icon="legs.icon" :size="28" />
          <div class="part-list-info">
            <div class="part-name">{{ legs.name }}</div>
            <div class="part-manufacturer">{{ legs.manufacturer }}</div>
          </div>
        </div>
      </div>

      <div class="part-details">
        <div v-if="selectedLegs" class="details-card">
          <div class="details-header">
            <MechIcons :icon="selectedLegs.icon" :size="36" />
            <div>
              <h3>{{ selectedLegs.name }}</h3>
              <div class="part-rarity">{{ selectedLegs.rarity }}</div>
              <div class="part-manufacturer">{{ selectedLegs.manufacturer }}</div>
            </div>
          </div>
          <p class="part-description">{{ selectedLegs.description }}</p>
          <div class="part-stats-detail">
            <div class="stat-row">
              <MechIcons icon="speed" :size="16" />
              <span>Speed {{ selectedLegs.stats.speed > 0 ? '+' : '' }}{{ selectedLegs.stats.speed }}</span>
            </div>
            <div class="stat-row">
              <MechIcons icon="armor" :size="16" />
              <span>Armor +{{ selectedLegs.stats.armor }}</span>
            </div>
            <div class="stat-row">
              <span>⚡ {{ selectedLegs.powerCapacity }} Power Capacity</span>
            </div>
            <div class="stat-row">
              <span>🦿 {{ selectedLegs.mobilityType }}</span>
            </div>
          </div>
          <div class="part-pros-cons">
            <div class="pros">
              <div v-for="pro in selectedLegs.pros" :key="pro" class="pro-item">✓ {{ pro }}</div>
            </div>
            <div class="cons">
              <div v-for="con in selectedLegs.cons" :key="con" class="con-item">✗ {{ con }}</div>
            </div>
          </div>

          <div class="modified-stats">
            <h4>Modified Stats</h4>
            <div class="stats-preview">
              <div class="stat-item">
                <MechIcons icon="health" :size="16" />
                <span>{{ totalStats.health }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="armor" :size="16" />
                <span>{{ totalStats.armor }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="speed" :size="16" />
                <span>{{ totalStats.speed }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="energy" :size="16" />
                <span :class="{ negative: totalStats.energy < 0 }">{{ totalStats.energy }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="firepower" :size="16" />
                <span>{{ totalStats.firepower }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="accuracy" :size="16" />
                <span>{{ totalStats.accuracy }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-selection">
          <p>Select legs from the list</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LegsPart, MechStats } from '../../../../composables/useMechBuilder'
import MechIcons from '../../../mech/MechIcons.vue'

defineProps<{
  legsPresets: LegsPart[]
  selectedLegs: LegsPart | null
  totalStats: MechStats
}>()

defineEmits<{
  select: [legs: LegsPart]
}>()
</script>

<style scoped src="./StepStyles.css"></style>
