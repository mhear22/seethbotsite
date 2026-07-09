<template>
  <div class="step-content">
    <h2>
      <MechIcons icon="smoke-launcher" :size="16" style="vertical-align: middle; margin-right: 8px" />
      Select Equipment Rack (Optional)
    </h2>
    <p class="step-description">Add special equipment for tactical advantages.</p>

    <div class="split-layout">
      <div class="parts-list">
        <div
          class="part-list-item skip-item"
          :class="{ selected: !selectedRack }"
          @click="$emit('skip')"
        >
          <div class="skip-icon">✕</div>
          <div class="part-list-info">
            <div class="part-name">No Equipment</div>
            <div class="part-manufacturer">Skip</div>
          </div>
        </div>

        <div
          v-for="rack in rackPresets"
          :key="rack.id"
          class="part-list-item"
          :class="{
            selected: selectedRack?.id === rack.id,
            [`rarity-${rack.rarity}`]: true
          }"
          @click="$emit('select', rack)"
        >
          <MechIcons :icon="rack.icon" :size="28" />
          <div class="part-list-info">
            <div class="part-name">{{ rack.name }}</div>
            <div class="part-manufacturer">{{ rack.manufacturer }}</div>
          </div>
        </div>
      </div>

      <div class="part-details">
        <div v-if="selectedRack" class="details-card">
          <div class="details-header">
            <MechIcons :icon="selectedRack.icon" :size="36" />
            <div>
              <h3>{{ selectedRack.name }}</h3>
              <div class="part-rarity">{{ selectedRack.rarity }}</div>
              <div class="part-manufacturer">{{ selectedRack.manufacturer }}</div>
            </div>
          </div>
          <p class="part-description">{{ selectedRack.description }}</p>
          <div class="special-ability">
            <strong>Ability:</strong> {{ selectedRack.specialAbility }}
          </div>
          <div class="part-pros-cons">
            <div class="pros">
              <div v-for="pro in selectedRack.pros" :key="pro" class="pro-item">✓ {{ pro }}</div>
            </div>
            <div class="cons">
              <div v-for="con in selectedRack.cons" :key="con" class="con-item">✗ {{ con }}</div>
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
          <p>No equipment selected (optional)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RackPart, MechStats } from '../../../../composables/useMechBuilder'
import MechIcons from '../../../mech/MechIcons.vue'

defineProps<{
  rackPresets: RackPart[]
  selectedRack: RackPart | null
  totalStats: MechStats
}>()

defineEmits<{
  select: [rack: RackPart]
  skip: []
}>()
</script>

<style scoped src="./StepStyles.css"></style>
<style scoped>
.skip-item {
  border: 1px dashed var(--mech-border-strong) !important;
}

.skip-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--mech-text-muted);
}

.special-ability {
  margin-bottom: var(--mech-space-3);
  padding: var(--mech-space-2);
  background: rgba(245, 158, 11, 0.12);
  border-left: 4px solid var(--mech-warn-strong);
  border-radius: var(--mech-radius-sm);
  font-size: 12px;
  color: var(--mech-warn);
}

.special-ability strong {
  color: var(--mech-warn);
}
</style>
