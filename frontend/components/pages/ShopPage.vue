<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../../stores/useAppStore'

interface ShopItem {
  id: number
  name: string
  description: string
  cost: number
  icon: string
  category: string
  effect?: string
}

interface UserInventory {
  id: number
  itemId: number
  itemName: string
  itemIcon: string
  category: string
  purchasedAt: string
}

const appStore = useAppStore()

const userId = ref<string>('')
const shopItems = ref<ShopItem[]>([])
const userInventory = ref<UserInventory[]>([])
const userPoints = ref<number>(0)
const loading = ref<boolean>(true)
const purchasing = ref<number | null>(null)
const error = ref<string | null>(null)

// Load user ID on mount
onMounted(async () => {
  const storedUserId = localStorage.getItem('userId')
  if (storedUserId) {
    userId.value = storedUserId
  } else {
    userId.value = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('userId', userId.value)
  }

  await loadShopItems()
  await loadUserPoints()
  await loadUserInventory()
})

const loadShopItems = async () => {
  try {
    const response = await fetch('/api/shop/items')
    if (!response.ok) throw new Error('Failed to fetch shop items')
    const data = await response.json()
    shopItems.value = data.items || []
  } catch (err) {
    error.value = 'Failed to load shop items'
    console.error('Error loading shop items:', err)
  }
}

const loadUserPoints = async () => {
  try {
    const response = await fetch('/api/points/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId.value })
    })
    if (!response.ok) throw new Error('Failed to fetch user points')
    const data = await response.json()
    userPoints.value = data.points || 0
  } catch (err) {
    console.error('Error loading user points:', err)
  }
}

const loadUserInventory = async () => {
  try {
    const response = await fetch(`/api/shop/inventory?userId=${userId.value}`)
    if (!response.ok) throw new Error('Failed to fetch inventory')
    const data = await response.json()
    userInventory.value = data.inventory || []
  } catch (err) {
    console.error('Error loading inventory:', err)
  } finally {
    loading.value = false
  }
}

const purchaseItem = async (item: ShopItem) => {
  if (purchasing.value !== null) return
  if (userPoints.value < item.cost) {
    error.value = 'Insufficient points'
    return
  }

  // Check if already owned
  const alreadyOwned = userInventory.value.some(i => i.itemId === item.id)
  if (alreadyOwned) {
    error.value = 'You already own this item'
    return
  }

  purchasing.value = item.id
  error.value = null

  try {
    const response = await fetch('/api/shop/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId.value,
        itemId: item.id
      })
    })

    if (!response.ok) {
      const data = await response.json()
      error.value = data.error || 'Failed to purchase'
      return
    }

    const data = await response.json()
    if (data.success) {
      await loadUserPoints()
      await loadUserInventory()
      error.value = null
    } else {
      error.value = data.message || 'Failed to purchase'
    }
  } catch (err) {
    error.value = 'Failed to purchase item'
    console.error('Error purchasing item:', err)
  } finally {
    purchasing.value = null
  }
}

const isOwned = (itemId: number) => {
  return userInventory.value.some(i => i.itemId === itemId)
}

const isAffordable = (cost: number) => {
  return userPoints.value >= cost
}

const categoryItems = computed(() => {
  const categories = shopItems.value.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ShopItem[]>)

  return categories
})

const formatPoints = (points: number) => {
  return points.toLocaleString()
}
</script>

<template>
  <div :class="['shop-page', { dark: appStore.darkMode }]">
    <div class="shop-header">
      <h1>🛍️ Shop</h1>
      <p>Spend your coolness points on upgrades!</p>
      <div class="points-display">
        <span class="points-icon">⭐</span>
        <span class="points-value">{{ formatPoints(userPoints) }} pts</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading shop...</p>
    </div>

    <div v-else class="shop-content">
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="inventory-section">
        <h2>🎒 My Inventory</h2>
        <div v-if="userInventory.length === 0" class="empty-inventory">
          <p>You don't own any items yet!</p>
        </div>
        <div v-else class="inventory-grid">
          <div v-for="item in userInventory" :key="item.id" class="inventory-item">
            <div class="inventory-icon">{{ item.itemIcon }}</div>
            <div class="inventory-details">
              <div class="inventory-name">{{ item.itemName }}</div>
              <div class="inventory-date">Purchased {{ new Date(item.purchasedAt).toLocaleDateString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-for="(items, category) in categoryItems" :key="category" class="shop-category">
        <h2 class="category-title">{{ category }}</h2>
        <div class="items-grid">
          <div
            v-for="item in items"
            :key="item.id"
            :class="['shop-item', { owned: isOwned(item.id), affordable: isAffordable(item.cost) }]"
            @click="purchaseItem(item)"
          >
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-description">{{ item.description }}</div>
              <div class="item-cost">
                <span class="cost-icon">⭐</span>
                <span class="cost-value">{{ formatPoints(item.cost) }}</span>
              </div>
            </div>
            <div v-if="isOwned(item.id)" class="item-badge owned">Owned</div>
            <div v-else-if="purchasing === item.id" class="item-badge purchasing">Purchasing...</div>
            <div v-else-if="!isAffordable(item.cost)" class="item-badge too-expensive">Too Expensive</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-page {
  min-height: 100vh;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.shop-page.dark {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e0e0e0;
}

.shop-header {
  text-align: center;
  margin-bottom: 30px;
}

.shop-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
}

.shop-header p {
  font-size: 1.1rem;
  opacity: 0.8;
}

.points-display {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px 25px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.points-icon {
  font-size: 2rem;
}

.points-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.loading-state {
  text-align: center;
  padding: 50px;
}

.spinner {
  border: 4px solid rgba(102, 126, 234, 0.1);
  border-left-color: #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.inventory-section {
  background: rgba(102, 126, 234, 0.05);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.inventory-section h2 {
  margin: 0 0 15px 0;
}

.empty-inventory {
  text-align: center;
  padding: 30px;
  opacity: 0.7;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.inventory-icon {
  font-size: 2.5rem;
}

.inventory-details {
  flex: 1;
}

.inventory-name {
  font-weight: bold;
  font-size: 1rem;
}

.inventory-date {
  font-size: 0.85rem;
  opacity: 0.7;
}

.shop-category {
  margin-bottom: 30px;
}

.category-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  text-align: center;
  color: #667eea;
}

.dark .category-title {
  color: #a855f7;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.shop-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #e0e0e0;
  display: flex;
  gap: 15px;
  position: relative;
}

.shop-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.shop-item.owned {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(102, 126, 234, 0.05);
}

.shop-item.affordable {
  border-color: #10b981;
}

.shop-item:not(.affordable) {
  opacity: 0.7;
  cursor: not-allowed;
}

.item-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: #1a1a2e;
}

.item-description {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 10px;
}

.item-cost {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.cost-icon {
  font-size: 1.2rem;
}

.cost-value {
  font-weight: bold;
  color: #667eea;
}

.dark .shop-item {
  background: #2d3748;
  border-color: #3d4852;
}

.dark .shop-item:hover {
  box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3);
  border-color: #a855f7;
}

.dark .shop-item.owned {
  background: rgba(168, 85, 247, 0.1);
}

.dark .item-name {
  color: #e0e0e0;
}

.dark .item-description {
  color: #b0b3b3;
}

.dark .item-cost {
  background: rgba(168, 85, 247, 0.2);
}

.dark .cost-value {
  color: #a855f7;
}

.item-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.item-badge.owned {
  background: #10b981;
  color: white;
}

.item-badge.purchasing {
  background: #667eea;
  color: white;
  animation: pulse 1.5s ease-in-out infinite;
}

.item-badge.too-expensive {
  background: #ef4444;
  color: white;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
