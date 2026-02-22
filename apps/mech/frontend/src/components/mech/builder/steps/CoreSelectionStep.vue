<template>
  <div class="step-content">
    <h2>
      <MechIcons icon="diesel-gen" :size="32" style="vertical-align: middle; margin-right: 8px" />
      Select Your Core
    </h2>
    <p class="step-description">The core is the heart of your mech, providing power and equipment slots.</p>

    <div class="split-layout">
      <div class="parts-list">
        <div
          v-for="core in corePresets"
          :key="core.id"
          class="part-list-item"
          :class="{
            selected: selectedCore?.id === core.id,
            [`rarity-${core.rarity}`]: true
          }"
          @click="$emit('select', core)"
        >
          <MechIcons :icon="core.icon" :size="48" />
          <div class="part-list-info">
            <div class="part-name">{{ core.name }}</div>
            <div class="part-manufacturer">{{ core.manufacturer }}</div>
          </div>
        </div>
      </div>

      <div class="part-details">
        <div v-if="selectedCore" class="details-card">
          <div class="details-header">
            <MechIcons :icon="selectedCore.icon" :size="64" />
            <div>
              <h3>{{ selectedCore.name }}</h3>
              <div class="part-rarity">{{ selectedCore.rarity }}</div>
              <div class="part-manufacturer">{{ selectedCore.manufacturer }}</div>
            </div>
          </div>
          <p class="part-description">{{ selectedCore.description }}</p>
          <div class="part-stats-detail">
            <div class="stat-row">
              <MechIcons icon="energy" :size="16" />
              <span>{{ selectedCore.powerOutput }} Power</span>
            </div>
            <div class="stat-row">
              <span>📦 {{ selectedCore.slots }} Slots</span>
            </div>
          </div>
          <div class="part-pros-cons">
            <div class="pros">
              <div v-for="pro in selectedCore.pros" :key="pro" class="pro-item">✓ {{ pro }}</div>
            </div>
            <div class="cons">
              <div v-for="con in selectedCore.cons" :key="con" class="con-item">✗ {{ con }}</div>
            </div>
          </div>

          <div class="modified-stats">
            <h4>Modified Stats</h4>
            <div class="stats-preview">
              <div class="stat-item">
                <MechIcons icon="health" :size="20" />
                <span>{{ totalStats.health }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="armor" :size="20" />
                <span>{{ totalStats.armor }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="speed" :size="20" />
                <span>{{ totalStats.speed }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="energy" :size="20" />
                <span :class="{ negative: totalStats.energy < 0 }">{{ totalStats.energy }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="firepower" :size="20" />
                <span>{{ totalStats.firepower }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="accuracy" :size="20" />
                <span>{{ totalStats.accuracy }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-selection">
          <p>Select a core from the list</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CorePart, MechStats } from '../../../../composables/useMechBuilder'
import MechIcons from '../../../mech/MechIcons.vue'

defineProps<{
  corePresets: CorePart[]
  selectedCore: CorePart | null
  totalStats: MechStats
}>()

defineEmits<{
  select: [core: CorePart]
}>()
</script>

<style scoped src="./StepStyles.css"></style>
