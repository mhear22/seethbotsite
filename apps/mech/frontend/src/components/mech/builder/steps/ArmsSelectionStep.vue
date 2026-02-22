<template>
  <div class="step-content">
    <h2>
      <MechIcons icon="autocannon" :size="32" style="vertical-align: middle; margin-right: 8px" />
      Select Your Weapons
    </h2>
    <p class="step-description">Choose weapons for left and right arms. Mix and match for asymmetric loadouts.</p>

    <div class="split-layout">
      <div class="parts-list">
        <div
          v-for="arm in armPresets"
          :key="arm.id"
          class="part-list-item"
          :class="{
            selected: leftArm?.id === arm.id || rightArm?.id === arm.id,
            [`rarity-${arm.rarity}`]: true,
            'in-synergy': isPartInSynergy(arm.id)
          }"
          @click="$emit('select-arm', arm)"
        >
          <MechIcons :icon="arm.icon" :size="48" />
          <div class="part-list-info">
            <div class="part-name">{{ arm.name }}</div>
            <div class="part-manufacturer">{{ arm.manufacturer }}</div>
          </div>
        </div>
      </div>

      <div class="part-details">
        <div class="arm-slots-display">
          <div class="arm-slot-mini">
            <h4>Left Arm</h4>
            <div v-if="leftArm" class="selected-arm-mini">
              <MechIcons :icon="leftArm.icon" :size="24" />
              <span>{{ leftArm.name }}</span>
              <button @click.stop="$emit('remove', 'leftArm')" class="remove-btn-mini">✕</button>
            </div>
            <div v-else class="empty-slot-mini">Empty</div>
          </div>
          <div class="arm-slot-mini">
            <h4>Right Arm</h4>
            <div v-if="rightArm" class="selected-arm-mini">
              <MechIcons :icon="rightArm.icon" :size="24" />
              <span>{{ rightArm.name }}</span>
              <button @click.stop="$emit('remove', 'rightArm')" class="remove-btn-mini">✕</button>
            </div>
            <div v-else class="empty-slot-mini">Empty</div>
          </div>
        </div>

        <div v-if="previewArm" class="details-card">
          <div class="details-header">
            <MechIcons :icon="previewArm.icon" :size="64" />
            <div>
              <h3>{{ previewArm.name }}</h3>
              <div class="part-rarity">{{ previewArm.rarity }}</div>
              <div class="part-manufacturer">{{ previewArm.manufacturer }}</div>
            </div>
          </div>
          <p class="part-description">{{ previewArm.description }}</p>
          <div class="part-stats-detail">
            <div class="stat-row">
              <MechIcons icon="firepower" :size="16" />
              <span>{{ previewArm.stats.firepower }} Firepower</span>
            </div>
            <div class="stat-row">
              <MechIcons icon="accuracy" :size="16" />
              <span>{{ previewArm.stats.accuracy }} Accuracy</span>
            </div>
            <div class="stat-row">
              <span>⚡ {{ previewArm.powerDraw }} Power Draw</span>
            </div>
            <div class="stat-row">
              <span>🎯 {{ previewArm.weaponType }}</span>
            </div>
          </div>
          <div class="part-pros-cons">
            <div class="pros">
              <div v-for="pro in previewArm.pros" :key="pro" class="pro-item">✓ {{ pro }}</div>
            </div>
            <div class="cons">
              <div v-for="con in previewArm.cons" :key="con" class="con-item">✗ {{ con }}</div>
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
          <p>Select a weapon from the list</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArmPart, MechStats } from '../../../../composables/useMechBuilder'
import MechIcons from '../../../mech/MechIcons.vue'

defineProps<{
  armPresets: ArmPart[]
  leftArm: ArmPart | null
  rightArm: ArmPart | null
  previewArm: ArmPart | null
  totalStats: MechStats
  isPartInSynergy: (partId: string) => boolean
}>()

defineEmits<{
  'select-arm': [arm: ArmPart]
  remove: [slot: 'leftArm' | 'rightArm']
}>()
</script>

<style scoped src="./StepStyles.css"></style>
<style scoped>
.arm-slots-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.arm-slot-mini {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.arm-slot-mini h4 {
  margin: 0;
  font-size: 14px;
  color: #2d3748;
  font-weight: 600;
}

.selected-arm-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 2px solid #4299e1;
  border-radius: 6px;
  font-size: 13px;
  color: #2d3748;
}

.selected-arm-mini span {
  flex: 1;
  font-weight: 500;
}

.remove-btn-mini {
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  transition: background 0.2s;
}

.remove-btn-mini:hover {
  background: #c53030;
}

.empty-slot-mini {
  padding: 12px;
  background: white;
  border: 2px dashed #cbd5e0;
  border-radius: 6px;
  text-align: center;
  color: #a0aec0;
  font-size: 13px;
}

.in-synergy {
  box-shadow: 0 0 0 2px #ed8936;
}

/* Dark mode */
.dark .arm-slots-display {
  background: #1a202c;
}

.dark .arm-slot-mini h4 {
  color: #e2e8f0;
}

.dark .selected-arm-mini {
  background: #2d3748;
  color: #e2e8f0;
}

.dark .empty-slot-mini {
  background: #2d3748;
  border-color: #4a5568;
  color: #718096;
}
</style>
