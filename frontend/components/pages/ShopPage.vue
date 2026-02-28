<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/useAppStore'
import { formatDate } from '../../utils/format'

interface ShopItem {
  id: number
  name: string
  description: string
  price: number
  icon: string
  category: string
  effect?: string
}

interface MembershipTier {
  id: number
  name: string
  price: number
  priceDisplay: string
  interval: string
  features: string[]
}

interface UserSubscription {
  tier: string
  status: string
  isActive: boolean
  endDate?: string
}

interface UserInventory {
  id: number
  itemId: number
  itemName: string
  itemIcon: string
  category: string
  purchasedAt: string
}

const router = useRouter()
const appStore = useAppStore()

const userId = ref<string>('')
const shopItems = ref<ShopItem[]>([])
const userInventory = ref<UserInventory[]>([])
const userPoints = ref<number>(0)
const membershipTiers = ref<MembershipTier[]>([])
const userSubscription = ref<UserSubscription | null>(null)
const loading = ref<boolean>(true)
const purchasing = ref<number | null>(null)
const subscribing = ref<string | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const showCheckout = ref<boolean>(false)
const selectedTier = ref<MembershipTier | null>(null)
const paymentMethod = ref<'paypal' | 'bank_transfer'>('paypal')
const bankDetails = ref<any>(null)
const checkoutUrl = ref<string | null>(null)
const activeTab = ref<'membership' | 'items'>('membership')

const isLoggedIn = computed(() => !!localStorage.getItem('token'))

// Load user ID on mount
onMounted(async () => {
  const storedUserId = localStorage.getItem('userId')
  if (storedUserId) {
    userId.value = storedUserId
  } else {
    userId.value = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('userId', userId.value)
  }

  await Promise.all([
    loadMembershipTiers(),
    loadUserSubscription(),
    loadShopItems(),
    loadUserPoints(),
    loadUserInventory()
  ])
})

const loadMembershipTiers = async () => {
  try {
    const response = await fetch('/api/subscriptions/tiers')
    if (!response.ok) throw new Error('Failed to fetch membership tiers')
    const data = await response.json()
    membershipTiers.value = data.tiers || []
  } catch (err) {
    console.error('Error loading membership tiers:', err)
  }
}

const loadUserSubscription = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await fetch('/api/subscriptions/status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      userSubscription.value = data.subscription
    }
  } catch (err) {
    console.error('Error loading subscription:', err)
  }
}

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

const selectTier = (tier: MembershipTier) => {
  if (!isLoggedIn.value) {
    router.push('/auth?redirect=/shop&message=login-required')
    return
  }
  selectedTier.value = tier
  showCheckout.value = true
  bankDetails.value = null
  checkoutUrl.value = null
}

const initiatePayment = async () => {
  if (!selectedTier.value) return

  subscribing.value = selectedTier.value.name
  error.value = null
  success.value = null

  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tier: selectedTier.value.name,
        paymentMethod: paymentMethod.value
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to initiate checkout')
    }

    const data = await response.json()

    if (paymentMethod.value === 'paypal') {
      checkoutUrl.value = data.checkoutUrl
      success.value = 'PayPal checkout initiated. Complete payment to activate subscription.'
    } else {
      bankDetails.value = data.bankDetails
      success.value = 'Please transfer the amount with the reference code.'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to initiate payment'
  } finally {
    subscribing.value = null
  }
}

const confirmBankPayment = async () => {
  // This would be called after user confirms they've made the bank transfer
  success.value = 'Bank transfer details saved. Your subscription will be activated after verification.'
  showCheckout.value = false
  await loadUserSubscription()
}

const completePayPalPayment = async (paymentId: number, orderId: string, txnId?: string) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/subscriptions/paypal/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ paymentId, orderId, txnId })
    })

    if (response.ok) {
      success.value = 'Subscription activated successfully!'
      showCheckout.value = false
      await loadUserSubscription()
    }
  } catch (err) {
    console.error('Error completing PayPal payment:', err)
  }
}

const purchaseItem = async (item: ShopItem) => {
  if (purchasing.value !== null) return
  if (userPoints.value < item.price) {
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

const isAffordable = (price: number) => {
  return userPoints.value >= price
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

const getTierDisplayName = (tier: string) => {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

const getTierColor = (tier: string) => {
  const colors: Record<string, string> = {
    'basic': '#10b981',
    'pro': '#3b82f6',
    'premium': '#8b5cf6'
  }
  return colors[tier] || '#667eea'
}
</script>

<template>
  <div :class="['shop-page', { dark: appStore.darkMode }]">
    <div class="shop-header">
      <h1>🛍️ Shop</h1>
      <p>Subscribe for full access or spend your coolness points!</p>
      <div class="points-display">
        <span class="points-icon">⭐</span>
        <span class="points-value">{{ formatPoints(userPoints) }} pts</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <template v-else>
      <!-- Subscription Status Banner -->
      <div v-if="userSubscription?.isActive" class="subscription-banner active">
        <span class="banner-icon">✨</span>
        <span>You have an active <strong>{{ getTierDisplayName(userSubscription.tier) }}</strong> subscription!</span>
        <span v-if="userSubscription.endDate" class="expiry">Valid until {{ formatDate(userSubscription.endDate) }}</span>
      </div>

      <div v-else-if="userSubscription && !userSubscription.isActive" class="subscription-banner expired">
        <span class="banner-icon">⚠️</span>
        <span>Your subscription has expired. Renew to regain access!</span>
      </div>

      <!-- Error/Success Messages -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="success" class="success-message">
        {{ success }}
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'membership' }]"
          @click="activeTab = 'membership'"
        >
          💎 Membership
        </button>
        <button
          :class="['tab', { active: activeTab === 'items' }]"
          @click="activeTab = 'items'"
        >
          🎁 Items Shop
        </button>
      </div>

      <!-- Membership Tab -->
      <div v-if="activeTab === 'membership'" class="membership-section">
        <h2>🔒 Unlock Full Access</h2>
        <p class="membership-intro">
          Subscribe to access all pages and features beyond the homepage and shop!
        </p>

        <!-- Checkout Modal -->
        <div v-if="showCheckout && selectedTier" class="checkout-modal">
          <div class="checkout-content">
            <h3>Subscribe to {{ getTierDisplayName(selectedTier.name) }}</h3>
            <p class="checkout-price">{{ selectedTier.priceDisplay }} / month</p>

            <div class="payment-methods">
              <label class="payment-option">
                <input type="radio" v-model="paymentMethod" value="paypal" />
                <span class="payment-label">
                  <span class="payment-icon">💳</span>
                  PayPal
                </span>
              </label>
              <label class="payment-option">
                <input type="radio" v-model="paymentMethod" value="bank_transfer" />
                <span class="payment-label">
                  <span class="payment-icon">🏦</span>
                  Bank Transfer
                </span>
              </label>
            </div>

            <!-- Bank Transfer Details -->
            <div v-if="bankDetails" class="bank-details">
              <h4>Bank Transfer Details</h4>
              <div class="bank-info">
                <p><strong>Account Name:</strong> {{ bankDetails.accountName }}</p>
                <p><strong>BSB:</strong> {{ bankDetails.bsb }}</p>
                <p><strong>Account Number:</strong> {{ bankDetails.accountNumber }}</p>
                <p><strong>Amount:</strong> ${{ bankDetails.amount }} {{ bankDetails.currency }}</p>
                <p class="reference"><strong>Reference:</strong> {{ bankDetails.reference }}</p>
              </div>
              <p class="bank-note">Use the reference code above so we can verify your payment.</p>
              <button @click="confirmBankPayment" class="btn-confirm">I've Made the Transfer</button>
            </div>

            <!-- PayPal Info -->
            <div v-else-if="checkoutUrl && paymentMethod === 'paypal'" class="paypal-info">
              <p>Complete your payment via PayPal to activate your subscription.</p>
              <a :href="checkoutUrl" target="_blank" class="btn-paypal">Open PayPal</a>
            </div>

            <div v-else class="checkout-actions">
              <button
                @click="initiatePayment"
                :disabled="subscribing !== null"
                class="btn-subscribe"
              >
                {{ subscribing ? 'Processing...' : 'Continue to Payment' }}
              </button>
              <button @click="showCheckout = false" class="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Membership Tiers Grid -->
        <div class="tiers-grid">
          <div
            v-for="tier in membershipTiers"
            :key="tier.id"
            :class="['tier-card', tier.name, { current: userSubscription?.tier === tier.name }]"
            :style="{ '--tier-color': getTierColor(tier.name) }"
          >
            <div class="tier-header">
              <h3>{{ getTierDisplayName(tier.name) }}</h3>
              <div class="tier-price">
                <span class="price-amount">{{ tier.priceDisplay }}</span>
                <span class="price-interval">/ {{ tier.interval }}</span>
              </div>
            </div>

            <ul class="tier-features">
              <li v-for="(feature, index) in tier.features" :key="index">
                <span class="feature-check">✓</span>
                {{ feature }}
              </li>
            </ul>

            <button
              v-if="userSubscription?.tier === tier.name && userSubscription?.isActive"
              class="btn-current"
              disabled
            >
              Current Plan
            </button>
            <button
              v-else
              @click="selectTier(tier)"
              class="btn-select"
            >
              {{ userSubscription?.tier ? 'Upgrade' : 'Subscribe' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Items Tab -->
      <div v-if="activeTab === 'items'" class="items-section">
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
                <div class="inventory-date">Purchased {{ formatDate(item.purchasedAt) }}</div>
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
              :class="['shop-item', { owned: isOwned(item.id), affordable: isAffordable(item.price) }]"
              @click="purchaseItem(item)"
            >
              <div class="item-icon">{{ item.icon }}</div>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-description">{{ item.description }}</div>
                <div class="item-cost">
                  <span class="cost-icon">⭐</span>
                  <span class="cost-value">{{ formatPoints(item.price) }}</span>
                </div>
              </div>
              <div v-if="isOwned(item.id)" class="item-badge owned">Owned</div>
              <div v-else-if="purchasing === item.id" class="item-badge purchasing">Purchasing...</div>
              <div v-else-if="!isAffordable(item.price)" class="item-badge too-expensive">Too Expensive</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.shop-page {
  min-height: 100vh;
  padding: 20px;
  max-width: 1000px;
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
  margin-top: 15px;
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
  background: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.dark .error-message {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fca5a5;
}

.success-message {
  background: #d1fae5;
  border: 1px solid #10b981;
  color: #065f46;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.dark .success-message {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #6ee7b7;
}

.subscription-banner {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.subscription-banner.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2));
  border: 1px solid #10b981;
}

.subscription-banner.expired {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid #f59e0b;
}

.banner-icon {
  font-size: 1.5rem;
}

.expiry {
  margin-left: auto;
  opacity: 0.8;
  font-size: 0.9rem;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tab {
  flex: 1;
  padding: 15px 25px;
  border: 2px solid #e0e0e0;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.tab:hover {
  border-color: #667eea;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.dark .tab {
  border-color: #3d4852;
  color: #e0e0e0;
}

.membership-section h2 {
  text-align: center;
  margin-bottom: 10px;
}

.membership-intro {
  text-align: center;
  opacity: 0.8;
  margin-bottom: 30px;
}

.tiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.tier-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  border: 3px solid #e0e0e0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tier-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--tier-color);
}

.tier-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  border-color: var(--tier-color);
}

.tier-card.current {
  border-color: var(--tier-color);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.dark .tier-card {
  background: #2d3748;
  border-color: #3d4852;
}

.tier-header {
  text-align: center;
  margin-bottom: 20px;
}

.tier-header h3 {
  font-size: 1.5rem;
  margin: 0 0 10px 0;
  color: var(--tier-color);
}

.tier-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 5px;
}

.price-amount {
  font-size: 2rem;
  font-weight: bold;
}

.price-interval {
  opacity: 0.6;
}

.tier-features {
  list-style: none;
  padding: 0;
  margin: 0 0 25px 0;
}

.tier-features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  font-size: 0.95rem;
}

.feature-check {
  color: #10b981;
  font-weight: bold;
}

.btn-select, .btn-current {
  width: 100%;
  padding: 15px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-select {
  background: var(--tier-color);
  color: white;
  border: none;
}

.btn-select:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.btn-current {
  background: #e0e0e0;
  color: #666;
  border: none;
  cursor: default;
}

.dark .btn-current {
  background: #3d4852;
  color: #999;
}

/* Checkout Modal */
.checkout-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.checkout-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  max-width: 450px;
  width: 100%;
}

.dark .checkout-content {
  background: #2d3748;
}

.checkout-content h3 {
  margin: 0 0 10px 0;
  text-align: center;
}

.checkout-price {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 25px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 25px;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-option:hover {
  border-color: #667eea;
}

.payment-option input {
  margin-right: 15px;
}

.payment-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-icon {
  font-size: 1.5rem;
}

.bank-details {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.dark .bank-details {
  background: #1a202c;
}

.bank-details h4 {
  margin: 0 0 15px 0;
}

.bank-info p {
  margin: 8px 0;
}

.reference {
  background: #667eea;
  color: white;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  margin-top: 15px;
}

.bank-note {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 15px;
}

.btn-confirm, .btn-paypal {
  display: block;
  width: 100%;
  padding: 15px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
}

.checkout-actions {
  display: flex;
  gap: 10px;
}

.btn-subscribe {
  flex: 1;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-subscribe:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 15px 25px;
  background: transparent;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
}

/* Items Section */
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
