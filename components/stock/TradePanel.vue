<script setup lang="ts">
import { computed } from 'vue'

interface Stock {
  name: string
  avatar: string
  price: number
  minPrice: number
  maxPrice: number
  priceHistory: { timestamp: number; price: number }[]
}

interface Portfolio {
  cash: number
  holdings: { [stockName: string]: number }
}

interface Props {
  stock: Stock | null
  portfolio: Portfolio | null
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  trade: [type: 'buy' | 'sell', shares: number]
}>()

const tradeType = ref<'buy' | 'sell'>('buy')
const tradeShares = ref<number>(1)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
}

const formatEmoji = (emoji: string): string => {
  const customEmojiMatch = emoji.match(/^<a?:([a-zA-Z0-9_]+):(\d+)>$/)
  if (customEmojiMatch) {
    const emojiId = customEmojiMatch[2]
    const isAnimated = emoji.startsWith('<a:')
    const extension = isAnimated ? 'gif' : 'png'
    return `<img src="https://cdn.discordapp.com/emojis/${emojiId}.${extension}" class="emoji" alt="emoji" loading="lazy" />`
  }
  return emoji
}

const selectedStockOwned = computed(() => {
  if (!props.stock || !props.portfolio) return 0
  return props.portfolio.holdings[props.stock.name] || 0
})

const tradeTotal = computed(() => {
  if (!props.stock) return 0
  return props.stock.price * tradeShares.value
})

const canAfford = computed(() => {
  if (!props.portfolio || !props.stock) return false
  if (tradeType.value === 'sell') return true
  return props.portfolio.cash >= tradeTotal.value
})

const canTrade = computed(() => {
  if (!props.stock) return false
  if (tradeType.value === 'sell') {
    return selectedStockOwned.value >= tradeShares.value
  }
  return canAfford.value
})

const maxShares = computed(() => {
  if (!props.portfolio || !props.stock) return 0
  if (tradeType.value === 'sell') {
    return selectedStockOwned.value
  }
  return Math.floor(props.portfolio.cash / props.stock.price)
})

const executeTrade = () => {
  if (!canTrade.value || props.loading) return
  emit('trade', tradeType.value, tradeShares.value)
}
</script>

<template>
  <div v-if="stock" class="trade-card">
    <h3>
      <span v-html="formatEmoji(stock.avatar)"></span> {{ stock.name }}
    </h3>

    <StockChart :history="stock.priceHistory" />

    <div class="price-display">
      <div class="current-price">{{ formatCurrency(stock.price) }}</div>
      <div class="price-range">
        Min: {{ formatCurrency(stock.minPrice) }} / Max: {{ formatCurrency(stock.maxPrice) }}
      </div>
    </div>

    <div class="trade-controls">
      <div class="trade-type-selector">
        <button :class="{ active: tradeType === 'buy' }" @click="tradeType = 'buy'">
          🟢 Buy
        </button>
        <button :class="{ active: tradeType === 'sell' }" @click="tradeType = 'sell'">
          🔴 Sell
        </button>
      </div>

      <div class="shares-input">
        <label>Shares:</label>
        <input
          type="number"
          v-model.number="tradeShares"
          min="1"
          :max="maxShares"
          @input="tradeShares = Math.max(1, tradeShares)"
        />
        <span v-if="tradeType === 'sell'" class="owned-shares">
          Owned: {{ selectedStockOwned }}
        </span>
      </div>

      <div class="trade-total">
        <span>{{ tradeType === 'buy' ? 'Cost' : 'Revenue' }}:</span>
        <span class="total-amount">{{ formatCurrency(tradeTotal) }}</span>
      </div>

      <button
        class="trade-button"
        :disabled="!canTrade || loading"
        @click="executeTrade"
      >
        {{ loading ? '...' : (tradeType === 'buy' ? 'Buy' : 'Sell') }}
      </button>
    </div>
  </div>

  <div v-else class="no-selection">
    <p>Select a stock to start trading</p>
  </div>
</template>

<style scoped>
.trade-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

body.dark .trade-card {
  background: rgba(40, 44, 52, 0.95);
}

.trade-card h3 {
  color: #ff6b9d;
  margin-bottom: 15px;
  font-size: 20px;
}

.price-display {
  margin-bottom: 15px;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: #48bb78;
}

.price-range {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

body.dark .price-range {
  color: #aaa;
}

.trade-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.trade-type-selector {
  display: flex;
  gap: 10px;
}

.trade-type-selector button {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #ff6b9d;
  border-radius: 10px;
  background: transparent;
  color: #ff6b9d;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.trade-type-selector button.active {
  background: #ff6b9d;
  color: white;
}

.trade-type-selector button:first-child {
  border-color: #48bb78;
  color: #48bb78;
}

.trade-type-selector button:first-child.active {
  background: #48bb78;
  border-color: #48bb78;
}

.shares-input {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.shares-input label {
  font-size: 14px;
  color: #666;
  font-weight: bold;
}

body.dark .shares-input label {
  color: #aaa;
}

.shares-input input {
  padding: 10px;
  border: 2px solid #ff6b9d;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  color: #333;
}

body.dark .shares-input input {
  background: rgba(30, 30, 30, 0.9);
  color: #e2e8f0;
  border-color: #e85e90;
}

.owned-shares {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

body.dark .owned-shares {
  color: #aaa;
}

.trade-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 107, 157, 0.1);
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
}

.total-amount {
  color: #48bb78;
  font-size: 20px;
}

.trade-button {
  background: linear-gradient(45deg, #48bb78, #38a169);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 15px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
}

.trade-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.5);
}

.trade-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-selection {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.no-selection p {
  color: #666;
  font-size: 18px;
}

body.dark .no-selection {
  background: rgba(40, 44, 52, 0.95);
}

body.dark .no-selection p {
  color: #aaa;
}
</style>
