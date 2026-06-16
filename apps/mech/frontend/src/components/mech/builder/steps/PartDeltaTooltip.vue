<template>
  <div class="part-delta-tooltip">
    <div class="delta-title">Stat Contribution</div>
    <div class="delta-rows">
      <div
        v-for="row in deltaRows"
        :key="row.label"
        class="delta-row"
        :class="{ positive: row.value > 0, negative: row.value < 0 }"
      >
        <span class="delta-label">{{ row.label }}</span>
        <span class="delta-value">{{ row.value > 0 ? '+' : '' }}{{ row.value }}</span>
      </div>
      <div v-if="deltaRows.length === 0" class="delta-empty">No stat changes</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MechPart } from '../../../../composables/useMechBuilder'

const props = defineProps<{ part: MechPart }>()

// Per-stat contribution this part makes to the build totals. Shows only the
// non-zero stats, with +/- signs so the player can see at a glance what the
// equipped part adds or subtracts vs an empty slot.
const deltaRows = computed(() => {
  const s = props.part.stats
  const all: { label: string; value: number }[] = [
    { label: 'Health', value: s.health },
    { label: 'Armor', value: s.armor },
    { label: 'Speed', value: s.speed },
    { label: 'Energy', value: s.energy },
    { label: 'Firepower', value: s.firepower },
    { label: 'Accuracy', value: s.accuracy },
  ]
  return all.filter(r => r.value !== 0)
})
</script>

<style scoped>
.part-delta-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  min-width: 160px;
  background: var(--mech-surface-raised);
  backdrop-filter: var(--mech-blur);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-sm);
  padding: 10px 12px;
  box-shadow: var(--mech-shadow-md);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--mech-transition-fast), transform var(--mech-transition-fast);
  z-index: 30;
}

/* Parent .mech-part hover reveals the tooltip. */
:global(.mech-part:hover) > .part-delta-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.delta-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--mech-text-dim);
  text-transform: uppercase;
  letter-spacing: var(--mech-tracking-wide);
  margin-bottom: 6px;
}

.delta-rows {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.delta-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
}

.delta-label {
  color: var(--mech-text-dim);
}

.delta-value {
  font-weight: 700;
  color: var(--mech-text);
}

.delta-row.positive .delta-value {
  color: var(--mech-success);
}

.delta-row.negative .delta-value {
  color: var(--mech-danger);
}

.delta-empty {
  font-size: 12px;
  color: var(--mech-text-dim);
}
</style>
