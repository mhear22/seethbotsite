<template>
  <div class="garage-backdrop" @click.self="$emit('close')">
    <div class="garage">
      <div class="g-header">
        <h2>Garage</h2>
        <div class="g-money">💰 {{ money }}</div>
        <button class="g-close" type="button" @click="$emit('close')">✕</button>
      </div>

      <!-- Tab bar: Shop (buy & equip) vs Inventory (owned salvage) -->
      <div class="g-tabs">
        <button
          class="g-tab"
          :class="{ active: tab === 'shop' }"
          type="button"
          @click="tab = 'shop'"
        >Shop</button>
        <button
          class="g-tab"
          :class="{ active: tab === 'inventory' }"
          type="button"
          @click="tab = 'inventory'"
        >Inventory <span v-if="inventory.length" class="g-tab-count">{{ inventory.length }}</span></button>
      </div>

      <!-- ================= SHOP TAB ================= -->
      <template v-if="tab === 'shop'">
      <p class="g-sub">
        Spend salvage to bolt on better parts. Builds must stay legal:
        a core, legs, a head, at least one weapon, and no energy deficit.
      </p>

      <!-- Slot selector -->
      <div class="g-slots">
        <button
          v-for="s in SLOTS"
          :key="s.key"
          class="g-slot"
          :class="{ active: activeSlot === s.key }"
          type="button"
          @click="activeSlot = s.key"
        >
          <span class="slot-name">{{ s.label }}</span>
          <span class="slot-equipped">{{ equippedName(s.key) }}</span>
        </button>
      </div>

      <!-- Catalogue for the active slot -->
      <div class="g-catalogue">
        <div
          v-for="(entry, i) in slotCatalogue"
          :key="entry.part.id"
          class="g-part"
          :class="{ equipped: isEquipped(entry.part.id), selected: i === selectedPart, [entry.part.rarity]: true }"
          @mouseenter="selectedPart = i"
        >
          <div class="part-main">
            <span class="part-name">{{ entry.part.name }}</span>
            <span class="part-rarity">{{ entry.part.rarity }}</span>
          </div>
          <p class="part-desc">{{ entry.part.description }}</p>
          <div class="part-stats">
            <span v-if="entry.part.stats.firepower" class="stat fp">FP {{ entry.part.stats.firepower }}</span>
            <span v-if="entry.part.stats.health" class="stat hp">HP {{ entry.part.stats.health }}</span>
            <span v-if="entry.part.stats.armor" class="stat ar">AR {{ entry.part.stats.armor }}</span>
            <span v-if="entry.part.stats.speed" class="stat sp">SP {{ entry.part.stats.speed }}</span>
            <span class="stat en" :class="{ neg: entry.part.stats.energy < 0 }">EN {{ entry.part.stats.energy }}</span>
          </div>
          <div class="part-foot">
            <span class="part-price" :class="{ afford: money >= entry.price }">💰 {{ entry.price }}</span>
            <button
              v-if="isEquipped(entry.part.id)"
              class="buy-btn equipped-btn"
              type="button"
              disabled
            >Equipped</button>
            <button
              v-else
              class="buy-btn"
              type="button"
              :disabled="money < entry.price"
              @click="emitEquip(entry.part)"
            >Buy &amp; Equip</button>
          </div>
        </div>
      </div>
      </template>

      <!-- ================= INVENTORY TAB ================= -->
      <template v-else>
        <p class="g-sub">
          Parts you own but haven't installed — bought spares and battlefield salvage.
          Damaged salvage must be repaired before it can be installed.
        </p>

        <p v-if="!inventoryRows.length" class="g-empty">
          Your inventory is empty. Salvage drops from destroyed enemies land here,
          and anything you unequip is stowed rather than scrapped.
        </p>

        <div v-else class="g-catalogue">
          <div
            v-for="row in inventoryRows"
            :key="row.instanceId"
            class="g-part"
            :class="{ damaged: row.damaged, [row.part.rarity]: true }"
          >
            <div class="part-main">
              <span class="part-name">{{ row.part.name }}</span>
              <span class="part-rarity">{{ row.part.rarity }}</span>
            </div>
            <p class="part-desc">{{ row.part.description }}</p>
            <div class="part-stats">
              <span v-if="row.part.stats.firepower" class="stat fp">FP {{ row.part.stats.firepower }}</span>
              <span v-if="row.part.stats.health" class="stat hp">HP {{ row.part.stats.health }}</span>
              <span v-if="row.part.stats.armor" class="stat ar">AR {{ row.part.stats.armor }}</span>
              <span v-if="row.part.stats.speed" class="stat sp">SP {{ row.part.stats.speed }}</span>
              <span class="stat en" :class="{ neg: row.part.stats.energy < 0 }">EN {{ row.part.stats.energy }}</span>
            </div>
            <div v-if="row.damaged" class="inv-condition damaged">⚠ Damaged — repair to install</div>
            <div class="part-foot inv-foot">
              <!-- Damaged: only repair (for a fee) or sell as-is. -->
              <template v-if="row.damaged">
                <button
                  class="buy-btn"
                  type="button"
                  :disabled="money < row.repairCost"
                  @click="emitRepair(row.instanceId)"
                >Repair 💰{{ row.repairCost }}</button>
              </template>
              <!-- Pristine: install into each valid slot. -->
              <template v-else>
                <button
                  v-for="s in row.slots"
                  :key="s.key"
                  class="buy-btn"
                  type="button"
                  @click="emitInstall(row.instanceId, s.key)"
                >Install {{ s.label }}</button>
              </template>
              <button
                class="buy-btn sell-btn"
                type="button"
                @click="emitSell(row.instanceId)"
              >Sell 💰{{ row.sellPrice }}</button>
            </div>
          </div>
        </div>
      </template>

      <p v-if="message" class="g-message" :class="{ error: messageError }">{{ message }}</p>

      <p v-if="tab === 'shop'" class="g-nav-hint">
        A/D or ←/→ switch slot · W/S or ↑/↓ pick part · Enter/E buy &amp; equip · Esc close
      </p>
      <p v-else class="g-nav-hint">Click to install, repair, or sell · Esc close</p>

      <div class="g-actions">
        <button class="g-done" type="button" @click="$emit('close')">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { MechLoadout } from '../../../composables/useMechBuilder'
import type { MechPart } from '../../../shared/types/MechTypes'
import {
  buildShopCatalogue,
  partPrice,
  slotsForPart,
  type ShopSlot,
} from '../../../lib/story/quests'
import { findPartById } from '../../../shared/data/MechParts'
import {
  repairPrice,
  salvageSellPrice,
  type InventoryItem,
} from '../../../composables/useStoryMode'

const props = withDefaults(
  defineProps<{
    money: number
    loadout: MechLoadout
    /** Owned-but-unequipped parts (bought spares + salvage). */
    inventory?: InventoryItem[]
    /** Last action result, surfaced as a banner. */
    message?: string
    messageError?: boolean
  }>(),
  { inventory: () => [] },
)

const emit = defineEmits<{
  (e: 'equip', payload: { part: MechPart; slot: ShopSlot }): void
  (e: 'install', payload: { instanceId: string; slot: ShopSlot }): void
  (e: 'repair', payload: { instanceId: string }): void
  (e: 'sell', payload: { instanceId: string }): void
  (e: 'close'): void
}>()

/** Which tab is showing. */
const tab = ref<'shop' | 'inventory'>('shop')

/** Convenience alias for the (defaulted) inventory prop. */
const inventory = computed<InventoryItem[]>(() => props.inventory ?? [])

/** Short slot labels for install buttons (arms get L/R so both fit on a card). */
const SLOT_SHORT: Record<ShopSlot, string> = {
  leftArm: 'L',
  rightArm: 'R',
  core: 'Core',
  legs: 'Legs',
  head: 'Head',
  rack: 'Rack',
}

/** Inventory rows resolved to parts + prices; unknown part ids are dropped. */
const inventoryRows = computed(() =>
  inventory.value.flatMap((item) => {
    const part = findPartById(item.partId)
    if (!part) return []
    const damaged = item.condition === 'damaged'
    return [{
      instanceId: item.instanceId,
      part,
      damaged,
      repairCost: repairPrice(part),
      sellPrice: salvageSellPrice(part, item.condition),
      slots: slotsForPart(part).map((key) => ({ key, label: SLOT_SHORT[key] })),
    }]
  }),
)

function emitInstall(instanceId: string, slot: ShopSlot): void {
  emit('install', { instanceId, slot })
}
function emitRepair(instanceId: string): void {
  emit('repair', { instanceId })
}
function emitSell(instanceId: string): void {
  emit('sell', { instanceId })
}

const SLOTS: Array<{ key: ShopSlot; label: string }> = [
  { key: 'leftArm', label: 'Left Arm' },
  { key: 'rightArm', label: 'Right Arm' },
  { key: 'core', label: 'Core' },
  { key: 'legs', label: 'Legs' },
  { key: 'head', label: 'Head' },
  { key: 'rack', label: 'Rack' },
]

const activeSlot = ref<ShopSlot>('leftArm')
/** Index of the keyboard-highlighted part within the active slot's catalogue. */
const selectedPart = ref(0)

const catalogue = buildShopCatalogue()

const slotCatalogue = computed(() =>
  catalogue
    .filter((part) => slotsForPart(part).includes(activeSlot.value))
    .map((part) => ({ part, price: partPrice(part) })),
)

function equippedName(slot: ShopSlot): string {
  return props.loadout[slot]?.name ?? '— empty —'
}

function isEquipped(partId: string): boolean {
  return props.loadout[activeSlot.value]?.id === partId
}

function emitEquip(part: MechPart): void {
  emit('equip', { part, slot: activeSlot.value })
}

// Reset the part highlight whenever the slot (and thus catalogue) changes.
watch(activeSlot, () => {
  selectedPart.value = 0
})

function cycleSlot(dir: number): void {
  const i = SLOTS.findIndex((s) => s.key === activeSlot.value)
  const next = (i + dir + SLOTS.length) % SLOTS.length
  activeSlot.value = SLOTS[next].key
}

/** Buy & equip the highlighted part if it's affordable and not already equipped. */
function confirmSelected(): void {
  const entry = slotCatalogue.value[selectedPart.value]
  if (!entry) return
  if (isEquipped(entry.part.id)) return
  if (props.money < entry.price) return
  emitEquip(entry.part)
}

function handleKey(e: KeyboardEvent) {
  // Escape always closes, regardless of tab.
  if (e.code === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    emit('close')
    return
  }
  // Tab toggles between Shop and Inventory.
  if (e.code === 'Tab') {
    e.preventDefault()
    e.stopPropagation()
    tab.value = tab.value === 'shop' ? 'inventory' : 'shop'
    return
  }
  // The remaining keys drive the shop catalogue only.
  if (tab.value !== 'shop') return
  const list = slotCatalogue.value
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      e.preventDefault()
      e.stopPropagation()
      if (list.length) selectedPart.value = (selectedPart.value - 1 + list.length) % list.length
      break
    case 'KeyS':
    case 'ArrowDown':
      e.preventDefault()
      e.stopPropagation()
      if (list.length) selectedPart.value = (selectedPart.value + 1) % list.length
      break
    case 'KeyA':
    case 'ArrowLeft':
      e.preventDefault()
      e.stopPropagation()
      cycleSlot(-1)
      break
    case 'KeyD':
    case 'ArrowRight':
      e.preventDefault()
      e.stopPropagation()
      cycleSlot(1)
      break
    case 'Enter':
    case 'KeyE':
      e.preventDefault()
      e.stopPropagation()
      confirmSelected()
      break
  }
}

// Capture phase so menu navigation wins over the page's global roam handler.
onMounted(() => window.addEventListener('keydown', handleKey, true))
onUnmounted(() => window.removeEventListener('keydown', handleKey, true))
</script>

<style scoped>
.garage-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
}

.garage {
  width: min(720px, 94vw);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  padding: 22px 24px;
  border-radius: 18px;
  background: linear-gradient(160deg, #111827, #0b1120);
  border: 1px solid rgba(99, 102, 241, 0.35);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
  color: #f8fafc;
}

.g-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}

.g-header h2 {
  margin: 0;
  font-size: 1.5rem;
  flex: 1;
}

.g-money {
  font-weight: 800;
  color: #fcd34d;
}

.g-close {
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}

.g-close:hover { background: rgba(255, 255, 255, 0.16); }

.g-sub {
  margin: 0 0 14px;
  font-size: 0.82rem;
  color: #94a3b8;
  line-height: 1.45;
}

.g-slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.g-slot {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #e2e8f0;
  cursor: pointer;
  text-align: left;
}

.g-slot.active {
  border-color: rgba(99, 102, 241, 0.7);
  background: rgba(99, 102, 241, 0.18);
}

.slot-name {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #a5b4fc;
}

.slot-equipped {
  font-size: 0.78rem;
  color: #cbd5e1;
}

.g-catalogue {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px;
  padding-right: 4px;
}

.g-part {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.g-part.equipped {
  border-color: rgba(16, 185, 129, 0.6);
  background: rgba(16, 185, 129, 0.1);
}

/* Keyboard-highlighted part: clear amber outline so the selection is visible. */
.g-part.selected {
  outline: 2px solid #fcd34d;
  outline-offset: 1px;
  box-shadow: 0 0 16px rgba(252, 211, 77, 0.4);
}

.g-part.rare { border-left: 3px solid #60a5fa; }
.g-part.legendary { border-left: 3px solid #fbbf24; }
.g-part.uncommon { border-left: 3px solid #34d399; }

.part-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}

.part-name {
  font-weight: 700;
  font-size: 0.92rem;
}

.part-rarity {
  font-size: 0.64rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.part-desc {
  margin: 6px 0;
  font-size: 0.74rem;
  color: #94a3b8;
  line-height: 1.35;
}

.part-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.stat {
  font-size: 0.66rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}

.stat.fp { color: #fca5a5; }
.stat.hp { color: #86efac; }
.stat.ar { color: #93c5fd; }
.stat.sp { color: #c4b5fd; }
.stat.en.neg { color: #fca5a5; }

.part-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.part-price {
  font-weight: 800;
  color: #f87171;
  font-size: 0.85rem;
}

.part-price.afford { color: #fcd34d; }

.buy-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
}

.buy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.equipped-btn {
  background: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.g-message {
  margin: 10px 0 0;
  font-size: 0.82rem;
  color: #6ee7b7;
}

.g-message.error {
  color: #fca5a5;
}

.g-nav-hint {
  margin: 10px 0 0;
  text-align: center;
  font-size: 0.72rem;
  color: #94a3b8;
}

.g-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

.g-done {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
}

.g-done:hover {
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.4);
}

/* --- Tabs --- */
.g-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.g-tab {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
}

.g-tab.active {
  border-color: rgba(99, 102, 241, 0.7);
  background: rgba(99, 102, 241, 0.18);
  color: #e0e7ff;
}

.g-tab-count {
  display: inline-block;
  margin-left: 4px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.4);
  font-size: 0.7rem;
}

/* --- Inventory --- */
.g-empty {
  margin: 12px 0;
  padding: 20px;
  text-align: center;
  font-size: 0.82rem;
  color: #94a3b8;
  line-height: 1.5;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}

.g-part.damaged {
  border-color: rgba(248, 113, 113, 0.5);
  background: rgba(248, 113, 113, 0.08);
}

.inv-condition {
  font-size: 0.7rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.inv-condition.damaged {
  color: #fca5a5;
}

.inv-foot {
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 6px;
}

.sell-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  margin-left: auto;
}

.sell-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}
</style>
