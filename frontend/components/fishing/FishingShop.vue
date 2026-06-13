<template>
  <div class="shop">
    <div class="shop-head">
      <h2>🛒 Upgrade Shop</h2>
      <div class="gold">💰 {{ currency }} gold</div>
    </div>

    <div class="upgrade-grid">
      <div v-for="def in upgradeDefs" :key="def.id" class="upgrade-card">
        <div class="upgrade-top">
          <span class="upgrade-icon">{{ def.icon }}</span>
          <div class="upgrade-titles">
            <div class="upgrade-name">{{ def.name }}</div>
            <div class="upgrade-tier">{{ currentTierLabel(def.id) }}</div>
          </div>
        </div>
        <div class="upgrade-desc">{{ def.description }}</div>

        <!-- Tier pips -->
        <div class="tier-pips">
          <span
            v-for="(tier, i) in def.tiers"
            :key="i"
            class="pip"
            :class="{ filled: i <= levels[def.id] }"
          ></span>
        </div>

        <template v-if="next(def.id)">
          <button
            class="buy-btn"
            :disabled="currency < next(def.id)!.cost"
            @click="onBuy(def.id)"
          >
            <span class="buy-label">{{ next(def.id)!.label }}</span>
            <span class="buy-cost" :class="{ unaffordable: currency < next(def.id)!.cost }">
              💰 {{ next(def.id)!.cost }}
            </span>
          </button>
        </template>
        <div v-else class="maxed">★ MAX LEVEL ★</div>
      </div>
    </div>

    <!-- Bait restock -->
    <div class="bait-shop">
      <h3>🎣 Restock Bait</h3>
      <div class="bait-row">
        <div v-for="bait in purchasableBait" :key="bait.id" class="bait-card">
          <span class="bait-icon">{{ bait.icon }}</span>
          <span class="bait-name">{{ bait.name }}</span>
          <span class="bait-have">have {{ baitInventory[bait.id] ?? 0 }}</span>
          <button
            class="bait-buy"
            :disabled="currency < bait.cost"
            @click="$emit('buy-bait', bait.id)"
          >
            +1 · 💰{{ bait.cost }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  upgradeDefs,
  baitTypes,
  type UpgradeDef,
  type UpgradeTier
} from '../../composables/useFishingGame'

type UpgradeId = UpgradeDef['id']

const props = defineProps<{
  currency: number
  levels: Record<UpgradeId, number>
  baitInventory: Record<string, number>
  nextUpgradeTier: (id: UpgradeId) => UpgradeTier | null
}>()

const emit = defineEmits<{
  (e: 'buy-upgrade', id: UpgradeId): void
  (e: 'buy-bait', id: string): void
}>()

const purchasableBait = computed(() => baitTypes.filter(b => b.cost > 0))

const next = (id: UpgradeId) => props.nextUpgradeTier(id)

const currentTierLabel = (id: UpgradeId) => {
  const def = upgradeDefs.find(u => u.id === id)!
  return def.tiers[props.levels[id]]?.label ?? ''
}

const onBuy = (id: UpgradeId) => emit('buy-upgrade', id)
</script>

<style scoped>
.shop {
  max-width: 800px;
  margin: 0 auto 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.shop-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.shop-head h2 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
}

.gold {
  background: rgba(252, 211, 77, 0.2);
  color: #fcd34d;
  font-weight: 800;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(252, 211, 77, 0.4);
}

.upgrade-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.upgrade-card {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upgrade-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.upgrade-icon { font-size: 28px; }

.upgrade-name {
  color: white;
  font-weight: 700;
  font-size: 15px;
}

.upgrade-tier {
  color: #4ecdc4;
  font-size: 12px;
  font-weight: 600;
}

.upgrade-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  flex: 1;
}

.tier-pips {
  display: flex;
  gap: 5px;
}

.pip {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
}

.pip.filled {
  background: linear-gradient(90deg, #4ecdc4, #06b6d4);
}

.buy-btn {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  color: white;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.15s, opacity 0.15s;
}

.buy-btn:hover:not(:disabled) { transform: translateY(-2px); }

.buy-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: rgba(100, 116, 139, 0.5);
}

.buy-label { font-size: 13px; }

.buy-cost { font-size: 13px; color: #fcd34d; }
.buy-cost.unaffordable { color: #fca5a5; }

.maxed {
  text-align: center;
  padding: 10px;
  color: #fcd34d;
  font-weight: 800;
  letter-spacing: 1px;
  background: rgba(252, 211, 77, 0.12);
  border-radius: 10px;
}

.bait-shop {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 16px;
}

.bait-shop h3 {
  margin: 0 0 12px;
  color: white;
  font-size: 1.1rem;
}

.bait-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.bait-card {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 96px;
  flex: 1;
}

.bait-icon { font-size: 24px; }

.bait-name {
  color: white;
  font-size: 13px;
  font-weight: 600;
}

.bait-have {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
}

.bait-buy {
  margin-top: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.bait-buy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(100, 116, 139, 0.5);
}

.dark .shop {
  background: rgba(45, 55, 72, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .upgrade-grid {
    grid-template-columns: 1fr;
  }
}
</style>
