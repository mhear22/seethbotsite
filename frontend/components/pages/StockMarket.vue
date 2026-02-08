<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { stocksRepository } from '../../repositories/stocks.repository'
import { useUserId } from '../../composables/useUserId'
import { usePolling } from '../../composables/usePolling'
import { formatTime } from '../../utils/format'

interface Stock {
  name: string
  avatar: string
  price: number
  coolnessScore: number
  shares: number
  minPrice: number
  maxPrice: number
  priceHistory: { timestamp: number; price: number }[]
}

interface Holding {
  [stockName: string]: number
}

interface Transaction {
  timestamp: number
  type: 'buy' | 'sell'
  stockName: string
  shares: number
  price: number
  total: number
}

interface Portfolio {
  userId: string
  cash: number
  holdings: Holding
  transactions: Transaction[]
}

// Use centralized userId management
const { userId } = useUserId()

const stocks = ref<Stock[]>([])
const portfolio = ref<Portfolio | null>(null)
const portfolioValue = ref<number>(10000)
const selectedStock = ref<Stock | null>(null)
const tradeShares = ref<number>(1)
const tradeType = ref<'buy' | 'sell'>('buy')
const loading = ref<boolean>(false)

// Computed
const selectedStockOwned = computed(() => {
  if (!selectedStock.value || !portfolio.value) return 0
  return portfolio.value.holdings[selectedStock.value.name] || 0
})

const tradeTotal = computed(() => {
  if (!selectedStock.value) return 0
  return selectedStock.value.price * tradeShares.value
})

const canAfford = computed(() => {
  if (!portfolio.value || !selectedStock.value) return false
  if (tradeType.value === 'sell') return true
  return portfolio.value.cash >= tradeTotal.value
})

const canTrade = computed(() => {
  if (!selectedStock.value) return false
  if (tradeType.value === 'sell') {
    return selectedStockOwned.value >= tradeShares.value
  }
  return canAfford.value
})

// Methods
const loadStocks = async () => {
  try {
    stocks.value = await stocksRepository.getStocks()
  } catch (error) {
    console.error('Error loading stocks:', error)
  }
}

const loadPortfolio = async () => {
  try {
    const data = await stocksRepository.getPortfolio(userId.value)
    portfolio.value = data.portfolio
    portfolioValue.value = data.portfolioValue
  } catch (error) {
    console.error('Error loading portfolio:', error)
  }
}

const selectStock = (stock: Stock) => {
  selectedStock.value = stock
  tradeType.value = 'buy'
  tradeShares.value = 1
}

const executeTrade = async () => {
  if (!selectedStock.value || loading.value) return

  loading.value = true
  try {
    if (tradeType.value === 'buy') {
      await stocksRepository.buyStock(userId.value, selectedStock.value.name, tradeShares.value)
    } else {
      await stocksRepository.sellStock(userId.value, selectedStock.value.name, tradeShares.value)
    }

    await loadStocks()
    await loadPortfolio()
  } catch (error) {
    console.error('Error executing trade:', error)
  } finally {
    loading.value = false
  }
}

const generateChartData = (history: { timestamp: number; price: number }[]) => {
  if (!history || history.length < 2) return ''

  const prices = history.map(h => h.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1

  const width = 300
  const height = 100
  const padding = 5

  let points = ''
  history.forEach((point, index) => {
    const x = padding + (index / (history.length - 1)) * (width - padding * 2)
    const normalizedPrice = (point.price - minPrice) / priceRange
    const y = height - padding - normalizedPrice * (height - padding * 2)
    points += `${x},${y} `
  })

  const color = history[history.length - 1].price >= history[0].price ? '#48bb78' : '#ff6b6b'

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <polyline
        points="${points.trim()}"
        fill="none"
        stroke="${color}"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        cx="${points.trim().split(' ').pop()?.split(',')[0] || 0}"
        cy="${points.trim().split(' ').pop()?.split(',')[1] || 0}"
        r="4"
        fill="${color}"
      />
    </svg>
  `
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
}

// Convert Discord custom emoji format to HTML img tag
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

// Use polling composables for automatic updates
usePolling(loadStocks, { initialInterval: 5000 })
usePolling(loadPortfolio, { initialInterval: 5000 })

// Lifecycle
onMounted(() => {
  loadStocks()
  loadPortfolio()
})
</script>

<template>
  <div class="stock-market">
    <div class="market-container">
      <!-- Left Panel: Stock List -->
      <div class="stock-list">
        <h1>📈 Coolness Stocks</h1>
        <div class="header-info">
          <span class="user-id">ID: {{ userId.slice(0, 12) }}...</span>
          <span class="cash-balance">{{ formatCurrency(portfolioValue) }}</span>
        </div>
        <div class="stock-grid">
          <div
            v-for="stock in stocks"
            :key="stock.name"
            class="stock-card"
            :class="{ active: selectedStock?.name === stock.name }"
            @click="selectStock(stock)"
          >
            <div class="stock-header">
              <span class="stock-avatar" v-html="formatEmoji(stock.avatar)"></span>
              <span class="stock-name">{{ stock.name }}</span>
            </div>
            <div class="stock-price">{{ formatCurrency(stock.price) }}</div>
            <div class="stock-info">
              <span>{{ stock.shares }} shares</span>
              <span :class="{ up: stock.price > stock.coolnessScore / 10, down: stock.price < stock.coolnessScore / 10 }">
                {{ stock.price > stock.coolnessScore / 10 ? '↑' : stock.price < stock.coolnessScore / 10 ? '↓' : '=' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Trading & Portfolio -->
      <div class="trading-panel">
        <!-- Trade Card -->
        <div v-if="selectedStock" class="trade-card">
          <h3>
            <span v-html="formatEmoji(selectedStock.avatar)"></span> {{ selectedStock.name }}
          </h3>

          <!-- Price Chart -->
          <div class="chart-container" v-html="generateChartData(selectedStock.priceHistory)"></div>

          <div class="price-display">
            <div class="current-price">{{ formatCurrency(selectedStock.price) }}</div>
            <div class="price-range">
              Min: {{ formatCurrency(selectedStock.minPrice) }} / Max: {{ formatCurrency(selectedStock.maxPrice) }}
            </div>
          </div>

          <!-- Trade Controls -->
          <div class="trade-controls">
            <div class="trade-type-selector">
              <button
                :class="{ active: tradeType === 'buy' }"
                @click="tradeType = 'buy'"
              >
                🟢 Buy
              </button>
              <button
                :class="{ active: tradeType === 'sell' }"
                @click="tradeType = 'sell'"
              >
                🔴 Sell
              </button>
            </div>

            <div class="shares-input">
              <label>Shares:</label>
              <input
                type="number"
                v-model.number="tradeShares"
                min="1"
                :max="tradeType === 'sell' ? selectedStockOwned : Math.floor((portfolio?.cash || 0) / selectedStock.price)"
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

        <!-- Portfolio Card -->
        <div v-if="portfolio" class="portfolio-card">
          <h3>💼 My Portfolio</h3>
          <div class="portfolio-summary">
            <div class="summary-item">
              <span class="label">Cash:</span>
              <span class="value">{{ formatCurrency(portfolio.cash) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Stocks:</span>
              <span class="value">{{ Object.values(portfolio.holdings).reduce((a, b) => a + b, 0) }} shares</span>
            </div>
            <div class="summary-item total">
              <span class="label">Total:</span>
              <span class="value">{{ formatCurrency(portfolioValue) }}</span>
            </div>
          </div>

          <div class="holdings-list">
            <div
              v-for="(shares, stockName) in portfolio.holdings"
              :key="stockName"
              v-show="shares > 0"
              class="holding-item"
            >
              <span class="holding-name">{{ stockName }}</span>
              <span class="holding-shares">{{ shares }} shares</span>
            </div>
          </div>
        </div>

        <!-- No Stock Selected -->
        <div v-if="!selectedStock" class="no-selection">
          <p>Select a stock to start trading</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stock-market {
  min-height: 100vh;
  padding: 100px 20px 20px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

body.dark .stock-market {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #5b21b6 100%);
}

.market-container {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
}

@media (max-width: 1024px) {
  .market-container {
    grid-template-columns: 1fr;
  }
}

/* Stock List */
.stock-list {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

body.dark .stock-list {
  background: rgba(40, 44, 52, 0.95);
}

.stock-list h1 {
  color: #ff6b9d;
  margin-bottom: 15px;
  font-size: 24px;
}

.header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 107, 157, 0.1);
  border-radius: 10px;
}

.user-id {
  font-size: 12px;
  color: #666;
}

body.dark .user-id {
  color: #aaa;
}

.cash-balance {
  font-size: 18px;
  font-weight: bold;
  color: #48bb78;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.stock-card {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stock-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.stock-card.active {
  border-color: #ff6b9d;
  background: rgba(255, 107, 157, 0.1);
}

body.dark .stock-card {
  background: rgba(60, 64, 72, 0.9);
}

body.dark .stock-card.active {
  background: rgba(232, 94, 144, 0.1);
  border-color: #e85e90;
}

.stock-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.stock-avatar {
  font-size: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.stock-avatar .emoji {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

h3 .emoji {
  width: 28px;
  height: 28px;
  object-fit: contain;
  vertical-align: middle;
}

.stock-name {
  font-weight: bold;
  color: #333;
  flex: 1;
}

body.dark .stock-name {
  color: #e2e8f0;
}

.stock-price {
  font-size: 20px;
  font-weight: bold;
  color: #48bb78;
  margin-bottom: 8px;
}

.stock-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

body.dark .stock-info {
  color: #aaa;
}

.stock-info .up {
  color: #48bb78;
}

.stock-info .down {
  color: #ff6b6b;
}

/* Trading Panel */
.trading-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.trade-card,
.portfolio-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

body.dark .trade-card,
body.dark .portfolio-card {
  background: rgba(40, 44, 52, 0.95);
}

.trade-card h3,
.portfolio-card h3 {
  color: #ff6b9d;
  margin-bottom: 15px;
  font-size: 20px;
}

.chart-container {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
  overflow: hidden;
}

.chart-container svg {
  width: 100%;
  height: auto;
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

/* Trade Controls */
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

/* Portfolio */
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
