<template>
  <div class="step-content">
    <h2>
      <MechIcons icon="standard-optics" :size="16" style="vertical-align: middle; margin-right: 8px" />
      Select Your Head
    </h2>
    <p class="step-description">The head contains sensors and targeting systems for accuracy.</p>

    <div class="split-layout">
      <div class="parts-list">
        <div
          v-for="head in headPresets"
          :key="head.id"
          class="part-list-item"
          :class="{
            selected: selectedHead?.id === head.id,
            [`rarity-${head.rarity}`]: true
          }"
          @click="$emit('select', head)"
        >
          <MechIcons :icon="head.icon" :size="28" />
          <div class="part-list-info">
            <div class="part-name">{{ head.name }}</div>
            <div class="part-manufacturer">{{ head.manufacturer }}</div>
          </div>
        </div>
      </div>

      <div class="part-details">
        <div v-if="selectedHead" class="details-card">
          <div class="details-header">
            <MechIcons :icon="selectedHead.icon" :size="36" />
            <div>
              <h3>{{ selectedHead.name }}</h3>
              <div class="part-rarity">{{ selectedHead.rarity }}</div>
              <div class="part-manufacturer">{{ selectedHead.manufacturer }}</div>
            </div>
          </div>
          <p class="part-description">{{ selectedHead.description }}</p>
          <div class="part-stats-detail">
            <div class="stat-row">
              <MechIcons icon="accuracy" :size="16" />
              <span>Accuracy +{{ selectedHead.stats.accuracy }}</span>
            </div>
            <div class="stat-row">
              <span>📡 {{ selectedHead.sensorRange }}m Sensor Range</span>
            </div>
            <div class="stat-row">
              <span>🎯 +{{ selectedHead.targetingBonus }}% Targeting</span>
            </div>
          </div>
          <div class="part-pros-cons">
            <div class="pros">
              <div v-for="pro in selectedHead.pros" :key="pro" class="pro-item">✓ {{ pro }}</div>
            </div>
            <div class="cons">
              <div v-for="con in selectedHead.cons" :key="con" class="con-item">✗ {{ con }}</div>
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
          <p>Select a head from the list</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HeadPart, MechStats } from '../../../../composables/useMechBuilder'
import MechIcons from '../../../mech/MechIcons.vue'

defineProps<{
  headPresets: HeadPart[]
  selectedHead: HeadPart | null
  totalStats: MechStats
}>()

defineEmits<{
  select: [head: HeadPart]
}>()
</script>

<style scoped src="./StepStyles.css"></style>
