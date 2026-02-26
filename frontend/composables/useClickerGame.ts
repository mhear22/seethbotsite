import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { clicksRepository } from '../../repositories/clicks.repository'
import { generalRepository } from '../../repositories/general.repository'
import { statsRepository } from '../../repositories/stats.repository'

export interface Upgrade {
  id: number
  name: string
  icon: string
  cost: number
  power: number
  type: 'click' | 'auto'
  purchased: number
}

export interface ClickParticle {
  id: number
  x: number
  y: number
  value: number
}

export interface ClickerState {
  count: number
  clickPower: number
  autoClickPower: number
}

// Original upgrade definitions
const ORIGINAL_UPGRADES: Omit<Upgrade, 'cost' | 'purchased'>[] = [
  { id: 1, name: 'Better Click', icon: '👆', power: 1, type: 'click' },
  { id: 2, name: 'Auto Clicker', icon: '🤖', power: 1, type: 'auto' },
  { id: 3, name: 'Double Click', icon: '✌️', power: 5, type: 'click' },
  { id: 4, name: 'Mold Farm', icon: '🍄', power: 5, type: 'auto' },
  { id: 5, name: 'Super Click', icon: '⚡', power: 20, type: 'click' },
  { id: 6, name: 'Mold Factory', icon: '🏭', power: 20, type: 'auto' }
]

// Original costs for cost scaling
const ORIGINAL_COSTS: Record<number, number> = {
  1: 10,
  2: 50,
  3: 200,
  4: 500,
  5: 1000,
  6: 2500
}

function getOriginalCost(id: number): number {
  return ORIGINAL_COSTS[id] || 10
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
  return num.toString()
}

export function useClickerGame() {
  // Core state
  const count = ref(0)
  const clickPower = ref(1)
  const autoClickPower = ref(0)
  const isLoading = ref(true)
  const isClicking = ref(false)

  // Upgrades
  const upgrades = ref<Upgrade[]>([])

  // Particles
  const clickParticles = ref<ClickParticle[]>([])
  const showParticles = ref(true)
  let particleIdCounter = 0

  // User tracking
  const userId = ref('')
  const selectedTargetUser = ref('')
  const unsyncedClicks = ref(0)

  // Rankings for dropdown
  const rankings = ref<Array<{ avatar: string; name: string; score: number; isCurrentUser?: boolean }>>([])

  // Intervals
  let autoClickInterval: ReturnType<typeof setInterval> | null = null
  let saveInterval: ReturnType<typeof setInterval> | null = null
  let syncInterval: ReturnType<typeof setInterval> | null = null
  let lastRecordedScore = 0

  // Computed
  const canAfford = computed(() => (cost: number) => count.value >= cost)

  const totalPower = computed(() => clickPower.value + autoClickPower.value)

  // Initialize user ID
  function getOrCreateUserId(): string {
    let id = localStorage.getItem('clicker-user-id')
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('clicker-user-id', id)
    }
    return id
  }

  // Save/Load functions
  function saveUpgrades(): void {
    const savedData = upgrades.value.map(u => ({
      id: u.id,
      purchased: u.purchased,
      cost: u.cost
    }))
    localStorage.setItem('clicker-upgrades', JSON.stringify(savedData))
  }

  function saveStats(): void {
    const stats: ClickerState = {
      count: count.value,
      clickPower: clickPower.value,
      autoClickPower: autoClickPower.value
    }
    localStorage.setItem('clicker-stats', JSON.stringify(stats))

    if (selectedTargetUser.value) {
      localStorage.setItem('clicker-target-user', selectedTargetUser.value)
    }
  }

  function recalculatePower(): void {
    let newClickPower = 1
    let newAutoClickPower = 0

    upgrades.value.forEach(u => {
      if (u.type === 'click') {
        newClickPower += u.purchased * u.power
      } else if (u.type === 'auto') {
        newAutoClickPower += u.purchased * u.power
      }
    })

    clickPower.value = newClickPower
    autoClickPower.value = newAutoClickPower
  }

  function loadStats(): void {
    try {
      const saved = localStorage.getItem('clicker-stats')
      if (saved) {
        const stats = JSON.parse(saved)
        count.value = stats.count || 0
      }

      const savedTarget = localStorage.getItem('clicker-target-user')
      if (savedTarget) {
        selectedTargetUser.value = savedTarget
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  function loadUpgrades(): void {
    try {
      const saved = localStorage.getItem('clicker-upgrades')
      if (saved) {
        const savedData = JSON.parse(saved)
        upgrades.value = ORIGINAL_UPGRADES.map(u => {
          const savedUpgrade = savedData.find((s: any) => s.id === u.id)
          const purchased = savedUpgrade?.purchased || 0
          return {
            ...u,
            purchased: purchased,
            cost: Math.floor(getOriginalCost(u.id) * Math.pow(1.5, purchased))
          }
        })
        recalculatePower()
      } else {
        // Initialize with defaults
        upgrades.value = ORIGINAL_UPGRADES.map(u => ({
          ...u,
          purchased: 0,
          cost: getOriginalCost(u.id)
        }))
      }
    } catch (error) {
      console.error('Error loading upgrades:', error)
      upgrades.value = ORIGINAL_UPGRADES.map(u => ({
        ...u,
        purchased: 0,
        cost: getOriginalCost(u.id)
      }))
    }
  }

  async function loadRankings(): Promise<void> {
    try {
      const data = await generalRepository.getRankings()
      rankings.value = data

      const currentUser = rankings.value.find(r => r.isCurrentUser)
      if (currentUser && !selectedTargetUser.value) {
        selectedTargetUser.value = currentUser.name
      }
    } catch (error) {
      console.error('Error loading rankings:', error)
    }
  }

  // Sync functions
  async function syncClicksToPoints(): Promise<void> {
    if (unsyncedClicks.value <= 0 || !selectedTargetUser.value) return

    try {
      await clicksRepository.addPoints(selectedTargetUser.value, unsyncedClicks.value)
      unsyncedClicks.value = 0
    } catch (error) {
      console.error('Error syncing clicks to points:', error)
    }
  }

  async function recordClickStat(): Promise<void> {
    try {
      await statsRepository.recordStat({
        userId: userId.value,
        userName: localStorage.getItem('user-name') || undefined,
        gameType: 'clicker',
        statType: 'click',
        value: clickPower.value,
        metadata: {
          timestamp: new Date().toISOString(),
          autoClicker: autoClickPower.value > 0
        }
      })
    } catch (error) {
      console.error('Error recording click stat:', error)
    }
  }

  async function updateHighScore(): Promise<void> {
    if (count.value > lastRecordedScore) {
      try {
        await statsRepository.updateHighScore({
          userId: userId.value,
          userName: localStorage.getItem('user-name') || undefined,
          gameType: 'clicker',
          score: count.value,
          details: {
            clickPower: clickPower.value,
            autoClickPower: autoClickPower.value,
            timestamp: new Date().toISOString()
          }
        })
        lastRecordedScore = count.value
      } catch (error) {
        console.error('Error updating high score:', error)
      }
    }
  }

  // Game actions
  async function handleClick(event: MouseEvent): Promise<void> {
    if (isClicking.value) return
    isClicking.value = true

    try {
      count.value += clickPower.value
      unsyncedClicks.value += clickPower.value

      if (unsyncedClicks.value >= 10) {
        syncClicksToPoints()
      }

      recordClickStat()

      if (count.value > lastRecordedScore && count.value % 10 === 0) {
        updateHighScore()
      }

      saveStats()

      // Add click particle
      if (showParticles.value && event.target instanceof HTMLElement) {
        const rect = (event.target as HTMLElement).getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        const particle: ClickParticle = {
          id: particleIdCounter++,
          x,
          y,
          value: clickPower.value
        }

        clickParticles.value.push(particle)

        setTimeout(() => {
          clickParticles.value = clickParticles.value.filter(p => p.id !== particle.id)
        }, 1000)
      }
    } catch (error) {
      console.error('Error clicking:', error)
    } finally {
      setTimeout(() => { isClicking.value = false }, 50)
    }
  }

  async function purchaseUpgrade(upgrade: Upgrade): Promise<void> {
    if (count.value < upgrade.cost) return

    count.value -= upgrade.cost
    upgrade.purchased++
    upgrade.cost = Math.floor(getOriginalCost(upgrade.id) * Math.pow(1.5, upgrade.purchased))

    if (upgrade.type === 'click') {
      clickPower.value += upgrade.power
    } else {
      autoClickPower.value += upgrade.power
    }

    saveUpgrades()
    saveStats()
  }

  async function resetClicks(): Promise<void> {
    if (!confirm('Are you sure you want to reset all progress?')) return

    try {
      count.value = 0
      clickPower.value = 1
      autoClickPower.value = 0

      upgrades.value.forEach(u => {
        u.purchased = 0
        u.cost = getOriginalCost(u.id)
      })

      saveUpgrades()
      localStorage.removeItem('clicker-stats')
      saveStats()
    } catch (error) {
      console.error('Error resetting:', error)
    }
  }

  async function grantCoolnessPoints(): Promise<boolean> {
    if (!selectedTargetUser.value) {
      alert('Please select a user to grant points to!')
      return false
    }

    if (count.value < 100) {
      alert('You need at least 100 points to grant coolness points!')
      return false
    }

    if (!confirm(`Grant 100 coolness points to ${selectedTargetUser.value}? This will cost 100 idle clicker points.`)) {
      return false
    }

    try {
      count.value -= 100
      saveStats()

      await clicksRepository.addPoints(selectedTargetUser.value, 100)

      alert(`✅ Successfully granted 100 coolness points to ${selectedTargetUser.value}!`)
      return true
    } catch (error) {
      console.error('Error granting coolness points:', error)
      alert('❌ Failed to grant coolness points. Please try again.')
      count.value += 100
      saveStats()
      return false
    }
  }

  // Lifecycle
  function initialize(): void {
    userId.value = getOrCreateUserId()
    loadStats()
    loadUpgrades()
    loadRankings()
    isLoading.value = false

    // Auto clicker interval
    autoClickInterval = setInterval(async () => {
      if (autoClickPower.value > 0) {
        count.value += autoClickPower.value
        unsyncedClicks.value += autoClickPower.value

        if (unsyncedClicks.value >= 10) {
          syncClicksToPoints()
        }

        recordClickStat()
        updateHighScore()
        saveStats()
      }
    }, 1000)

    // Save stats every 5 seconds
    saveInterval = setInterval(() => {
      saveStats()
    }, 5000)

    // Sync clicks every 30 seconds
    syncInterval = setInterval(() => {
      syncClicksToPoints()
    }, 30000)
  }

  function cleanup(): void {
    if (autoClickInterval) clearInterval(autoClickInterval)
    if (saveInterval) clearInterval(saveInterval)
    if (syncInterval) clearInterval(syncInterval)
    syncClicksToPoints()
    updateHighScore()
    saveStats()
  }

  // Watch for target user changes
  watch(selectedTargetUser, (newValue) => {
    if (newValue) {
      localStorage.setItem('clicker-target-user', newValue)
    }
  })

  return {
    // State
    count,
    clickPower,
    autoClickPower,
    isLoading,
    isClicking,
    upgrades,
    clickParticles,
    showParticles,
    userId,
    selectedTargetUser,
    rankings,

    // Computed
    canAfford,
    totalPower,

    // Actions
    handleClick,
    purchaseUpgrade,
    resetClicks,
    grantCoolnessPoints,
    syncClicksToPoints,

    // Lifecycle
    initialize,
    cleanup,

    // Utilities
    formatNumber,
    getOriginalCost
  }
}
