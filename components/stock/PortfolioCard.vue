<script setup lang="ts">
import { computed } from 'vue'

interface Portfolio {
  cash: number
  holdings: { [stockName: string]: number }
}

interface Props {
  portfolio: Portfolio | null
  portfolioValue: number
}

const props = defineProps<Props>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
}

const totalShares = computed(() => {
  if (!props.portfolio) return 0
  return Object.values(props.portfolio.holdings).reduce((a, b) => a + b, 0)
})

const holdingsList = computed(() => {
  if (!props.portfolio) return []
  return Object.entries(props.portfolio.holdings)
    .filter(([_, shares]) => shares > 0)
    .map(([name, shares]) => ({ name, shares }))
})
</script>

<template>
  <div v-if="portfolio" class="portfolio-card">
    <h3>💼 My Portfolio</h3>
    <div class="portfolio-summary">
      <div class="summary-item">
        <span class="label">Cash:</span>
        <span class="value">{{ formatCurrency(portfolio.cash) }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Stocks:</span>
        <span class="value">{{ totalShares }} shares</span>
      </div>
      <div class="summary-item total">
        <span class="label">Total:</span>
        <span class="value">{{ formatCurrency(portfolioValue) }}</span>
      </div>
    </div>

    <div v-if="holdingsList.length > 0" class="holdings-list">
      <div
        v-for="{ name, shares } in holdingsList"
        :key="name"
        class="holding-item"
      >
        <span class="holding-name">{{ name }}</span>
        <span class="holding-shares">{{ shares }} shares</span>
      </div>
    </div>
    <div v-else class="no-holdings">
      <p>No holdings yet</p>
    </div>
  </div>
</template>

<style scoped>
.portfolio-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

body.dark .portfolio-card {
  background: rgba(40, 44, 52, 0.95);
}

.portfolio-card h3 {
  color: #ff6b9d;
  margin-bottom: 15px;
  font-size: 20px;
}

.portfolio-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 107, 157, 0.05);
  border-radius: 10px;
}

.summary-item.total {
  background: rgba(72, 187, 120, 0.15);
  font-weight: bold;
  font-size: 18px;
}

.summary-item .label {
  color: #666;
}

.summary-item .value {
  color: #333;
  font-weight: bold;
}

body.dark .summary-item .label {
  color: #aaa;
}

body.dark .summary-item .value {
  color: #e2e8f0;
}

.holdings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.holding-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  font-size: 14px;
}

body.dark .holding-item {
  background: rgba(60, 64, 72, 0.9);
}

.holding-name {
  color: #333;
  font-weight: 500;
}

body.dark .holding-name {
  color: #e2e8f0;
}

.holding-shares {
  color: #48bb78;
  font-weight: bold;
}

.no-holdings {
  text-align: center;
  padding: 20px;
  color: #888;
  font-style: italic;
}
</style>
