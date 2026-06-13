<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { clicksRepository } from '../../repositories/clicks.repository'
import { generalRepository } from '../../repositories/general.repository'
import { statsRepository } from '../../repositories/stats.repository'
import { useAudio } from '../../composables/useAudio'

const router = useRouter()
const { playSound, volume } = useAudio()

const count = ref(0)
const clickPower = ref(1)
const autoClickPower = ref(0)
const isLoading = ref(true)
const clickParticles = ref<Array<{ id: number, x: number, y: number, value: number, crit?: boolean }>>([])
const showParticles = ref(true)
const unsyncedClicks = ref(0)

// Mute toggle (shared with global audio volume)
const muted = ref(localStorage.getItem('clicker-muted') === 'true')
watch(muted, (v) => localStorage.setItem('clicker-muted', String(v)))

// Lifetime + prestige
const lifetimeCount = ref(0)
const prestigeTokens = ref(0)

// Offline earnings banner
const offlineEarned = ref(0)
const showOfflineBanner = ref(false)

// Golden mushroom + frenzy buff
const goldenMushroom = ref<{ x: number, y: number } | null>(null)
const buffMultiplier = ref(1)
const buffSecondsLeft = ref(0)

// Juice: container shake + count flash + button punch
const isShaking = ref(false)
const countFlash = ref(false)
const buttonPunch = ref(false)

// Achievements
const unlockedAchievements = ref<string[]>([])
const achievementToasts = ref<Array<{ id: number, name: string, icon: string }>>([])
let lastMilestoneExp = 0

const CRIT_CHANCE = 0.05
const CRIT_MULTIPLIER = 10
const FRENZY_MULTIPLIER = 7
const FRENZY_DURATION = 15
const OFFLINE_EFFICIENCY = 0.5
const OFFLINE_CAP_SEC = 8 * 60 * 60 // 8 hours

// User ID for tracking points
const userId = ref('')
const selectedTargetUser = ref('')

// Rankings for dropdown
const rankings = ref<Array<{ avatar: string; name: string; score: number; isCurrentUser?: boolean }>>([])

// Get or create user ID

// Get or create user ID
const getOrCreateUserId = (): string => {
  let id = localStorage.getItem('clicker-user-id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('clicker-user-id', id)
  }
  return id
}

// Upgrades
// type: 'click' / 'auto' add flat power. 'clickMult' / 'autoMult' add a percentage
// multiplier (power = fractional bonus, e.g. 0.25 = +25%) applied in recalculatePower.
// scale = per-purchase cost growth factor (cheap producers grow slower).
const originalUpgrades = [
  { id: 1, name: 'Better Click', icon: '👆', cost: 10, power: 1, type: 'click', scale: 1.15, purchased: 0 },
  { id: 2, name: 'Auto Clicker', icon: '🤖', cost: 50, power: 1, type: 'auto', scale: 1.15, purchased: 0 },
  { id: 3, name: 'Double Click', icon: '✌️', cost: 200, power: 5, type: 'click', scale: 1.2, purchased: 0 },
  { id: 4, name: 'Mold Farm', icon: '🍄', cost: 500, power: 5, type: 'auto', scale: 1.2, purchased: 0 },
  { id: 5, name: 'Super Click', icon: '⚡', cost: 1000, power: 20, type: 'click', scale: 1.25, purchased: 0 },
  { id: 6, name: 'Mold Factory', icon: '🏭', cost: 2500, power: 20, type: 'auto', scale: 1.25, purchased: 0 },
  // Percentage multiplier upgrades
  { id: 7, name: 'Sharp Fingers', icon: '💪', cost: 5000, power: 0.25, type: 'clickMult', scale: 1.6, purchased: 0 },
  { id: 8, name: 'Mushroom Fertilizer', icon: '🌱', cost: 8000, power: 0.25, type: 'autoMult', scale: 1.6, purchased: 0 },
  // Higher-tier producers
  { id: 9, name: 'Spore Plantation', icon: '🌾', cost: 10000, power: 100, type: 'auto', scale: 1.4, purchased: 0 },
  { id: 10, name: 'Fungal Megafarm', icon: '🏗️', cost: 50000, power: 600, type: 'auto', scale: 1.45, purchased: 0 },
  { id: 11, name: 'Mycelium Empire', icon: '🌌', cost: 250000, power: 3500, type: 'auto', scale: 1.5, purchased: 0 }
]

const upgrades = ref(originalUpgrades.map(u => ({ ...u })))

// Save upgrades to localStorage
const saveUpgrades = () => {
  const savedData = upgrades.value.map(u => ({
    id: u.id,
    purchased: u.purchased,
    cost: u.cost
  }))
  localStorage.setItem('clicker-upgrades', JSON.stringify(savedData))
}

// Save stats to localStorage
const saveStats = () => {
  const stats = {
    count: count.value,
    clickPower: clickPower.value,
    autoClickPower: autoClickPower.value,
    lifetimeCount: lifetimeCount.value,
    prestigeTokens: prestigeTokens.value
  }
  localStorage.setItem('clicker-stats', JSON.stringify(stats))
  // Timestamp for offline / idle earnings
  localStorage.setItem('clicker-last-seen', String(Date.now()))

  // Save selected target user
  if (selectedTargetUser.value) {
    localStorage.setItem('clicker-target-user', selectedTargetUser.value)
  }
}

// Permanent global multiplier from prestige tokens (+10% each)
const prestigeMultiplier = computed(() => 1 + prestigeTokens.value * 0.1)

// Recalculate click power and auto click power from purchased upgrades
const recalculatePower = () => {
  let newClickPower = 1 // Base click power
  let newAutoClickPower = 0 // Base auto click power
  let clickMult = 1
  let autoMult = 1

  upgrades.value.forEach(u => {
    if (u.type === 'click') {
      newClickPower += u.purchased * u.power
    } else if (u.type === 'auto') {
      newAutoClickPower += u.purchased * u.power
    } else if (u.type === 'clickMult') {
      clickMult += u.purchased * u.power
    } else if (u.type === 'autoMult') {
      autoMult += u.purchased * u.power
    }
  })

  // Apply percentage multipliers and the permanent prestige multiplier
  clickPower.value = Math.floor(newClickPower * clickMult * prestigeMultiplier.value)
  autoClickPower.value = Math.floor(newAutoClickPower * autoMult * prestigeMultiplier.value)
}

// A gain helper that also tracks lifetime points (drives prestige + achievements)
const addPoints = (amount: number) => {
  count.value += amount
  lifetimeCount.value += amount
  unsyncedClicks.value += amount
}

// Load stats from localStorage
const loadStats = () => {
  try {
    const saved = localStorage.getItem('clicker-stats')
    if (saved) {
      const stats = JSON.parse(saved)
      // Only load count, let upgrades determine power
      count.value = stats.count || 0
      lifetimeCount.value = stats.lifetimeCount || stats.count || 0
      prestigeTokens.value = stats.prestigeTokens || 0
    }

    // Load unlocked achievements
    const savedAch = localStorage.getItem('clicker-achievements')
    if (savedAch) {
      unlockedAchievements.value = JSON.parse(savedAch)
    }

    // Load selected target user
    const savedTarget = localStorage.getItem('clicker-target-user')
    if (savedTarget) {
      selectedTargetUser.value = savedTarget
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Load upgrades from localStorage
const loadUpgrades = () => {
  try {
    const saved = localStorage.getItem('clicker-upgrades')
    if (saved) {
      const savedData = JSON.parse(saved)
      // Create a new array with saved data merged in to properly trigger Vue reactivity
      upgrades.value = upgrades.value.map(u => {
        const savedUpgrade = savedData.find((s: any) => s.id === u.id)
        const purchased = savedUpgrade?.purchased || 0
        return {
          ...u,
          purchased: purchased,
          cost: Math.floor(getOriginalCost(u.id) * Math.pow(u.scale, purchased))
        }
      })
      // Recalculate power after loading upgrades
      recalculatePower()
    }
  } catch (error) {
    console.error('Error loading upgrades:', error)
  }
}

// Load rankings
const loadRankings = async () => {
  try {
    const data = await generalRepository.getRankings()
    rankings.value = data

    // Set default target to current user if they exist in rankings
    const currentUser = rankings.value.find(r => r.isCurrentUser)
    if (currentUser) {
      selectedTargetUser.value = currentUser.name
    }
  } catch (error) {
    console.error('Error loading rankings:', error)
  }
}

// Watch for target user changes
watch(selectedTargetUser, (newValue) => {
  if (newValue) {
    localStorage.setItem('clicker-target-user', newValue)
  }
})

// Sync clicks to rankings
const syncClicksToPoints = async () => {
  if (unsyncedClicks.value <= 0 || !selectedTargetUser.value) return

  try {
    await clicksRepository.addPoints(selectedTargetUser.value, unsyncedClicks.value)
    unsyncedClicks.value = 0
  } catch (error) {
    console.error('Error syncing clicks to points:', error)
    // Don't reset unsyncedClicks on error - will retry next time
  }
}

// Batched click stats: accumulate locally, flush an aggregated stat on the 30s
// interval and on unmount instead of one API call per click/tick.
let pendingStatValue = 0

const flushClickStat = async () => {
  if (pendingStatValue <= 0) return
  const value = pendingStatValue
  pendingStatValue = 0
  try {
    await statsRepository.recordStat({
      userId: userId.value,
      userName: localStorage.getItem('user-name') || undefined,
      gameType: 'clicker',
      statType: 'click',
      value,
      metadata: {
        timestamp: new Date().toISOString(),
        autoClicker: autoClickPower.value > 0
      }
    })
  } catch (error) {
    console.error('Error recording click stat:', error)
    // Re-queue on failure so the value isn't lost
    pendingStatValue += value
  }
}

// Track and update high score
let lastRecordedScore = 0
const updateHighScore = async () => {
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

let autoClickInterval: ReturnType<typeof setInterval> | null = null
let particleIdCounter = 0

// ---------------------------------------------------------------------------
// Juice: sound, button punch, screen shake, count flash
// ---------------------------------------------------------------------------
const playClick = (crit = false) => {
  if (muted.value) return
  // Randomize playbackRate so rapid clicks don't sound robotic.
  playSound('clickSound', {
    volume: crit ? volume.value : volume.value * 0.7,
    rate: crit ? 1.5 : 0.9 + Math.random() * 0.3
  })
}

const punchButton = () => {
  buttonPunch.value = false
  // Force reflow so the class re-triggers on every click
  requestAnimationFrame(() => { buttonPunch.value = true })
  setTimeout(() => { buttonPunch.value = false }, 120)
}

const shakeScreen = () => {
  isShaking.value = true
  setTimeout(() => { isShaking.value = false }, 400)
}

const flashCount = () => {
  countFlash.value = true
  setTimeout(() => { countFlash.value = false }, 600)
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------
let toastIdCounter = 0
const achievementList = [
  { id: 'clicks100', name: 'Getting Started', icon: '👆', test: () => lifetimeCount.value >= 100 },
  { id: 'points1k', name: 'Spore Collector', icon: '🍄', test: () => lifetimeCount.value >= 1000 },
  { id: 'points10k', name: 'Mold Mogul', icon: '💰', test: () => lifetimeCount.value >= 10000 },
  { id: 'points100k', name: 'Fungal Tycoon', icon: '🏆', test: () => lifetimeCount.value >= 100000 },
  { id: 'points1m', name: 'Millionaire Mushroom', icon: '💎', test: () => lifetimeCount.value >= 1000000 },
  { id: 'upgrades10', name: 'Shopaholic', icon: '🛒', test: () => upgrades.value.reduce((s, u) => s + u.purchased, 0) >= 10 },
  { id: 'firstPrestige', name: 'Reborn', icon: '♻️', test: () => prestigeTokens.value >= 1 },
  { id: 'goldenCatch', name: 'Golden Touch', icon: '✨', test: () => false } // unlocked manually
]

const isUnlocked = (id: string) => unlockedAchievements.value.includes(id)

const unlockAchievement = (id: string) => {
  if (isUnlocked(id)) return
  const ach = achievementList.find(a => a.id === id)
  if (!ach) return
  unlockedAchievements.value.push(id)
  localStorage.setItem('clicker-achievements', JSON.stringify(unlockedAchievements.value))
  // Toast
  const toast = { id: toastIdCounter++, name: ach.name, icon: ach.icon }
  achievementToasts.value.push(toast)
  if (!muted.value) playSound('clickSound', { volume: volume.value, rate: 1.7 })
  setTimeout(() => {
    achievementToasts.value = achievementToasts.value.filter(t => t.id !== toast.id)
  }, 3500)
}

const checkAchievements = () => {
  achievementList.forEach(a => {
    if (!isUnlocked(a.id) && a.test()) unlockAchievement(a.id)
  })
}

// Power-of-ten milestone celebration
const checkMilestone = () => {
  if (count.value < 100) return
  const exp = Math.floor(Math.log10(count.value))
  if (exp > lastMilestoneExp) {
    lastMilestoneExp = exp
    flashCount()
    shakeScreen()
    if (!muted.value) playSound('clickSound', { volume: volume.value, rate: 1.3 })
  }
}

// ---------------------------------------------------------------------------
// Prestige / Rebirth
// ---------------------------------------------------------------------------
const PRESTIGE_THRESHOLD = 1000000
const pendingPrestigeTokens = computed(() => {
  if (lifetimeCount.value < PRESTIGE_THRESHOLD) return 0
  return Math.floor(Math.sqrt(count.value / PRESTIGE_THRESHOLD))
})
const canPrestige = computed(() => pendingPrestigeTokens.value > 0)

const doPrestige = () => {
  if (!canPrestige.value) return
  const gained = pendingPrestigeTokens.value
  if (!confirm(`Rebirth now for ${gained} prestige token(s)? This resets your points and upgrades but grants a permanent +${gained * 10}% multiplier.`)) return

  prestigeTokens.value += gained
  // Reset run progress (keep lifetime + tokens)
  count.value = 0
  upgrades.value.forEach(u => {
    u.purchased = 0
    u.cost = getOriginalCost(u.id)
  })
  recalculatePower()
  lastMilestoneExp = 0
  saveUpgrades()
  saveStats()
  checkAchievements()
  flashCount()
  shakeScreen()
}

// ---------------------------------------------------------------------------
// Golden mushroom + frenzy buff
// ---------------------------------------------------------------------------
let goldenSpawnTimeout: ReturnType<typeof setTimeout> | null = null
let goldenDespawnTimeout: ReturnType<typeof setTimeout> | null = null
let buffInterval: ReturnType<typeof setInterval> | null = null

const scheduleGoldenMushroom = () => {
  // Spawn every 1-2 minutes
  const delay = 60000 + Math.random() * 60000
  goldenSpawnTimeout = setTimeout(spawnGoldenMushroom, delay)
}

const spawnGoldenMushroom = () => {
  goldenMushroom.value = {
    x: 10 + Math.random() * 80, // % of viewport
    y: 20 + Math.random() * 50
  }
  // Drifts for ~8s then disappears
  goldenDespawnTimeout = setTimeout(() => {
    goldenMushroom.value = null
    scheduleGoldenMushroom()
  }, 8000)
}

const catchGoldenMushroom = () => {
  if (!goldenMushroom.value) return
  goldenMushroom.value = null
  if (goldenDespawnTimeout) clearTimeout(goldenDespawnTimeout)

  // Apply Frenzy buff
  buffMultiplier.value = FRENZY_MULTIPLIER
  buffSecondsLeft.value = FRENZY_DURATION
  if (buffInterval) clearInterval(buffInterval)
  buffInterval = setInterval(() => {
    buffSecondsLeft.value--
    if (buffSecondsLeft.value <= 0) {
      buffMultiplier.value = 1
      if (buffInterval) clearInterval(buffInterval)
      buffInterval = null
    }
  }, 1000)

  unlockAchievement('goldenCatch')
  flashCount()
  if (!muted.value) playSound('clickSound', { volume: volume.value, rate: 1.8 })
  scheduleGoldenMushroom()
}

const NUMBER_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']

const formatNumber = (num: number) => {
  if (num < 1000) return Math.floor(num).toString()
  const tier = Math.floor(Math.log10(num) / 3)
  if (tier < NUMBER_SUFFIXES.length) {
    const scaled = num / Math.pow(1000, tier)
    return scaled.toFixed(2) + NUMBER_SUFFIXES[tier]
  }
  // Fall back to scientific notation for truly astronomical values
  return num.toExponential(2)
}

const loadCount = async () => {
  try {
    const data = await clicksRepository.getCount()
    count.value = data.count
  } catch (error) {
    console.error('Error loading count:', error)
  } finally {
    isLoading.value = false
  }
}

// Save stats periodically
let saveInterval: ReturnType<typeof setInterval> | null = null
let syncInterval: ReturnType<typeof setInterval> | null = null

const handleClick = (event: MouseEvent) => {
  // No lock: every click registers instantly and pops a particle.
  const crit = Math.random() < CRIT_CHANCE
  const gain = Math.floor(clickPower.value * buffMultiplier.value * (crit ? CRIT_MULTIPLIER : 1))

  addPoints(gain)
  pendingStatValue += gain

  // Juice
  playClick(crit)
  punchButton()
  if (crit) shakeScreen()

  // Sync clicks to points (with debounce)
  if (unsyncedClicks.value >= 10) {
    syncClicksToPoints()
  }

  // Add click particle (on the button so coordinates are relative to it)
  if (showParticles.value) {
    const btn = event.currentTarget as HTMLElement
    const rect = btn.getBoundingClientRect()
    const particle = {
      id: particleIdCounter++,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      value: gain,
      crit
    }
    clickParticles.value.push(particle)
    setTimeout(() => {
      clickParticles.value = clickParticles.value.filter(p => p.id !== particle.id)
    }, 1000)
  }

  checkMilestone()
  checkAchievements()
}

const purchaseUpgrade = (upgrade: any) => {
  if (count.value < upgrade.cost) return

  count.value -= upgrade.cost
  upgrade.purchased++
  // Recalculate cost from original base cost using this upgrade's scaling factor
  upgrade.cost = Math.floor(getOriginalCost(upgrade.id) * Math.pow(upgrade.scale, upgrade.purchased))

  // Recalculate from scratch so flat power, multipliers and prestige all apply
  recalculatePower()

  if (!muted.value) playSound('clickSound', { volume: volume.value, rate: 1.1 })

  // Save upgrades and stats to localStorage
  saveUpgrades()
  saveStats()
  checkAchievements()
}

const resetClicks = async () => {
  if (!confirm('Are you sure you want to reset all progress?')) return

  try {
    // Reset locally (don't call legacy API - idle clicker is independent)
    count.value = 0
    clickPower.value = 1
    autoClickPower.value = 0
    lifetimeCount.value = 0
    prestigeTokens.value = 0
    lastMilestoneExp = 0
    unlockedAchievements.value = []
    buffMultiplier.value = 1
    buffSecondsLeft.value = 0

    upgrades.value.forEach(u => {
      u.purchased = 0
      u.cost = getOriginalCost(u.id)
    })

    // Save the reset upgrades state to localStorage (not just remove)
    saveUpgrades()

    // Also clear stats from localStorage
    localStorage.removeItem('clicker-stats')
    localStorage.removeItem('clicker-achievements')
    localStorage.removeItem('clicker-last-seen')

    // Save the reset state
    saveStats()
  } catch (error) {
    console.error('Error resetting:', error)
  }
}

const getOriginalCost = (id: number) => {
  return originalUpgrades.find(u => u.id === id)?.cost || 10
}

const canAfford = (cost: number) => count.value >= cost

const goBack = () => {
  router.push('/')
}

// Grant coolness points to selected user
const grantCoolnessPoints = async () => {
  if (!selectedTargetUser.value) {
    alert('Please select a user to grant points to!')
    return
  }

  if (count.value < 100) {
    alert('You need at least 100 points to grant coolness points!')
    return
  }

  if (!confirm(`Grant 100 coolness points to ${selectedTargetUser.value}? This will cost 100 idle clicker points.`)) {
    return
  }

  try {
    // Deduct 100 points from idle clicker
    count.value -= 100
    saveStats()

    // Grant 100 points to selected user via API
    await clicksRepository.addPoints(selectedTargetUser.value, 100)

    alert(`✅ Successfully granted 100 coolness points to ${selectedTargetUser.value}!`)
  } catch (error) {
    console.error('Error granting coolness points:', error)
    alert('❌ Failed to grant coolness points. Please try again.')
    // Refund the points on error
    count.value += 100
    saveStats()
  }
}

onMounted(async () => {
  // Initialize user ID
  userId.value = getOrCreateUserId()

  // Load stats and upgrades from localStorage (idle clicker is independent)
  loadStats()
  loadUpgrades()
  // Ensure power reflects prestige multiplier even with no saved upgrades
  recalculatePower()

  // Offline / idle earnings: award capped auto income accrued while away
  const lastSeen = parseInt(localStorage.getItem('clicker-last-seen') || '0', 10)
  if (lastSeen > 0 && autoClickPower.value > 0) {
    const elapsedSec = Math.min((Date.now() - lastSeen) / 1000, OFFLINE_CAP_SEC)
    const earned = Math.floor(elapsedSec * autoClickPower.value * OFFLINE_EFFICIENCY)
    if (earned > 0) {
      addPoints(earned)
      offlineEarned.value = earned
      showOfflineBanner.value = true
      setTimeout(() => { showOfflineBanner.value = false }, 8000)
    }
  }
  // Seed milestone tracker so we don't re-flash on load
  lastMilestoneExp = count.value >= 100 ? Math.floor(Math.log10(count.value)) : 0

  // Load rankings for user selection dropdown
  await loadRankings()

  isLoading.value = false

  checkAchievements()

  // Auto clicker interval
  autoClickInterval = setInterval(() => {
    if (autoClickPower.value > 0) {
      const gain = Math.floor(autoClickPower.value * buffMultiplier.value)
      addPoints(gain)
      pendingStatValue += gain

      if (unsyncedClicks.value >= 10) {
        syncClicksToPoints()
      }
      checkMilestone()
      checkAchievements()
    }
  }, 1000)

  // Save stats to localStorage every 5 seconds
  saveInterval = setInterval(() => {
    saveStats()
  }, 5000)

  // Sync clicks + flush batched stats + high score every 30 seconds
  syncInterval = setInterval(() => {
    syncClicksToPoints()
    flushClickStat()
    updateHighScore()
  }, 30000)

  // Kick off the golden mushroom spawn loop
  scheduleGoldenMushroom()
})

onUnmounted(() => {
  if (autoClickInterval) clearInterval(autoClickInterval)
  if (saveInterval) clearInterval(saveInterval)
  if (syncInterval) clearInterval(syncInterval)
  if (buffInterval) clearInterval(buffInterval)
  if (goldenSpawnTimeout) clearTimeout(goldenSpawnTimeout)
  if (goldenDespawnTimeout) clearTimeout(goldenDespawnTimeout)
  // Sync any remaining clicks before unmount
  syncClicksToPoints()
  // Flush batched click stats + final high score
  flushClickStat()
  updateHighScore()
  // Save stats before unmount
  saveStats()
})
</script>

<template>
  <div class="clicker-page" :class="{ shaking: isShaking }">
    <!-- Hidden click sound (randomized playbackRate on play) -->
    <audio id="clickSound" src="/sounds/click.mp3" preload="auto"></audio>

    <!-- Achievement toasts -->
    <TransitionGroup name="toast" tag="div" class="toast-stack" aria-live="polite">
      <div v-for="toast in achievementToasts" :key="toast.id" class="achievement-toast" role="status">
        <span class="toast-icon">{{ toast.icon }}</span>
        <div class="toast-text">
          <strong>Achievement Unlocked!</strong>
          <span>{{ toast.name }}</span>
        </div>
      </div>
    </TransitionGroup>

    <!-- Floating golden mushroom -->
    <button
      v-if="goldenMushroom"
      class="golden-mushroom"
      :style="{ left: goldenMushroom.x + 'vw', top: goldenMushroom.y + 'vh' }"
      @click="catchGoldenMushroom"
      aria-label="Catch the golden mushroom for a Frenzy buff"
    >🍄</button>

    <div class="clicker-container">
      <div class="clicker-header">
        <h1>🖱️ Idle Clicker</h1>
        <p>Click the mushroom to earn points!</p>
        <button class="mute-toggle" @click="muted = !muted" :aria-label="muted ? 'Unmute sounds' : 'Mute sounds'">
          {{ muted ? '🔇' : '🔊' }}
        </button>
      </div>

      <!-- Welcome back / offline earnings banner -->
      <Transition name="banner">
        <div v-if="showOfflineBanner" class="offline-banner" role="status">
          🎉 Welcome back! You earned <strong>+{{ formatNumber(offlineEarned) }}</strong> points while away.
        </div>
      </Transition>

      <!-- Active Frenzy buff indicator -->
      <Transition name="banner">
        <div v-if="buffSecondsLeft > 0" class="frenzy-banner" role="status">
          ⚡ FRENZY x{{ FRENZY_MULTIPLIER }}! {{ buffSecondsLeft }}s left
        </div>
      </Transition>

      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading your progress...</p>
      </div>

      <div v-else class="clicker-content">
        <!-- Stats -->
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-label">Points</span>
            <span class="stat-value" :class="{ 'count-flash': countFlash }">{{ formatNumber(count) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Click Power</span>
            <span class="stat-value">{{ formatNumber(clickPower) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Auto/Sec</span>
            <span class="stat-value">{{ formatNumber(autoClickPower) }}</span>
          </div>
        </div>

        <!-- Target User Selector (for giving points to rankings) -->
        <div class="target-user-section">
          <label for="target-user" class="target-label">Give idle points to:</label>
          <select
            id="target-user"
            v-model="selectedTargetUser"
            class="target-select"
          >
            <option value="">Select a user...</option>
            <option v-for="user in rankings" :key="user.name" :value="user.name">
              {{ user.avatar }} {{ user.name }} ({{ formatNumber(user.score) }} pts)
            </option>
          </select>
          <p v-if="!selectedTargetUser" class="target-warning">
            ⚠️ Select a user to give idle points to rankings
          </p>
        </div>

        <!-- Click Button -->
        <div class="click-section">
          <button
            class="click-button"
            :class="{ punch: buttonPunch }"
            @click="handleClick"
            :aria-label="`Click to earn ${formatNumber(clickPower)} points`"
          >
            <span class="mushroom-icon" aria-hidden="true">🍄</span>

            <!-- Particles -->
            <TransitionGroup name="particle" aria-live="polite">
              <div
                v-for="particle in clickParticles"
                :key="particle.id"
                class="particle"
                :class="{ 'particle-crit': particle.crit }"
                :style="{ left: particle.x + 'px', top: particle.y + 'px' }"
                :aria-label="`Earned ${particle.value} points`"
                role="status"
              >
                {{ particle.crit ? 'CRIT! ' : '' }}+{{ formatNumber(particle.value) }}
              </div>
            </TransitionGroup>
          </button>
          <p class="click-instruction">Click the mushroom!</p>
        </div>

        <!-- Upgrades -->
        <div class="upgrades-section">
          <h2>✨ Upgrades</h2>
          <div class="upgrades-grid" role="list">
            <button
              v-for="upgrade in upgrades"
              :key="upgrade.id"
              class="upgrade-card"
              :class="{ disabled: !canAfford(upgrade.cost), 'click-upgrade': upgrade.type === 'click', 'auto-upgrade': upgrade.type === 'auto' }"
              @click="purchaseUpgrade(upgrade)"
              :disabled="!canAfford(upgrade.cost)"
              :aria-label="`Purchase ${upgrade.name} for ${formatNumber(upgrade.cost)} points. Increases ${upgrade.type === 'click' ? 'click power' : 'auto-clicks'} by ${upgrade.power}. Currently owned: ${upgrade.purchased}`"
              role="listitem"
            >
              <div class="upgrade-icon" aria-hidden="true">{{ upgrade.icon }}</div>
              <div class="upgrade-info">
                <h3>{{ upgrade.name }}</h3>
                <p class="upgrade-cost">Cost: {{ formatNumber(upgrade.cost) }}</p>
                <p class="upgrade-power">
                  <template v-if="upgrade.type === 'clickMult'">+{{ upgrade.power * 100 }}% click power</template>
                  <template v-else-if="upgrade.type === 'autoMult'">+{{ upgrade.power * 100 }}% auto income</template>
                  <template v-else-if="upgrade.type === 'click'">+{{ upgrade.power }} click power</template>
                  <template v-else>+{{ upgrade.power }} auto/sec</template>
                </p>
                <p class="upgrade-purchased">Owned: {{ upgrade.purchased }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Prestige / Rebirth -->
        <div class="prestige-section">
          <h2>♻️ Prestige</h2>
          <div class="prestige-card">
            <div class="prestige-stat">
              <span class="prestige-label">Prestige Tokens</span>
              <span class="prestige-value">{{ prestigeTokens }}</span>
            </div>
            <div class="prestige-stat">
              <span class="prestige-label">Global Multiplier</span>
              <span class="prestige-value">x{{ prestigeMultiplier.toFixed(1) }}</span>
            </div>
            <div class="prestige-stat">
              <span class="prestige-label">Lifetime Points</span>
              <span class="prestige-value">{{ formatNumber(lifetimeCount) }}</span>
            </div>
          </div>
          <p class="prestige-desc">
            <template v-if="canPrestige">
              Rebirth now to gain <strong>{{ pendingPrestigeTokens }}</strong> token(s)
              (+{{ pendingPrestigeTokens * 10 }}% permanent multiplier).
            </template>
            <template v-else>
              Reach {{ formatNumber(PRESTIGE_THRESHOLD) }} lifetime points to unlock Rebirth.
            </template>
          </p>
          <button
            class="action-btn prestige-btn"
            :class="{ disabled: !canPrestige }"
            :disabled="!canPrestige"
            @click="doPrestige"
          >
            ♻️ Rebirth ({{ pendingPrestigeTokens }})
          </button>
        </div>

        <!-- Achievements -->
        <div class="achievements-section">
          <h2>🏅 Achievements</h2>
          <div class="achievements-grid" role="list">
            <div
              v-for="ach in achievementList"
              :key="ach.id"
              class="achievement-card"
              :class="{ locked: !isUnlocked(ach.id) }"
              role="listitem"
              :aria-label="`${ach.name}: ${isUnlocked(ach.id) ? 'unlocked' : 'locked'}`"
            >
              <div class="achievement-icon">{{ isUnlocked(ach.id) ? ach.icon : '🔒' }}</div>
              <div class="achievement-name">{{ ach.name }}</div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <button class="action-btn back-btn" @click="goBack" aria-label="Return to home page">← Back Home</button>
          <button class="action-btn grant-btn" @click="grantCoolnessPoints" aria-label="Grant 100 coolness points to selected user">🎁 Grant 100 Coolness Points</button>
          <button class="action-btn reset-btn" @click="resetClicks" aria-label="Reset all progress">🔄 Reset</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clicker-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #eee;
}

.clicker-container {
  max-width: 800px;
  margin: 0 auto;
}

.clicker-header {
  text-align: center;
  margin-bottom: 30px;
}

.clicker-header h1 {
  font-size: 3rem;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.clicker-header p {
  color: #888;
  font-size: 1.2rem;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #2d3748;
  border-top: 4px solid #a8e063;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.clicker-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: #a8e063;
}

.target-user-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.target-label {
  display: block;
  font-size: 0.9rem;
  color: #a8e063;
  font-weight: bold;
  margin-bottom: 8px;
}

.target-select {
  width: 100%;
  max-width: 400px;
  padding: 10px 12px;
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid #a8e063;
  border-radius: 8px;
  color: #eee;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.target-select:focus {
  outline: none;
  border-color: #56ab2f;
  box-shadow: 0 0 10px rgba(168, 224, 99, 0.3);
}

.target-select option {
  background: #1a1a2e;
  color: #eee;
  padding: 8px;
}

.target-warning {
  color: #ff6b9d;
  font-size: 0.85rem;
  margin: 10px 0 0 0;
  font-style: italic;
}

.click-section {
  text-align: center;
  margin-bottom: 40px;
}

.click-button {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 10px 30px rgba(168, 224, 99, 0.3);
  overflow: visible;
}

.click-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(168, 224, 99, 0.4);
}

.click-button:active:not(:disabled) {
  transform: scale(0.95);
}

.click-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.mushroom-icon {
  font-size: 6rem;
  display: block;
  line-height: 200px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.particle {
  position: absolute;
  font-size: 1.2rem;
  font-weight: bold;
  color: #a8e063;
  text-shadow: 0 0 10px rgba(168, 224, 99, 0.8);
  pointer-events: none;
  animation: particleFloat 1s ease-out forwards;
}

@keyframes particleFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scale(1.5);
  }
}

.particle-crit {
  font-size: 2rem;
  color: #ffd700;
  text-shadow: 0 0 14px rgba(255, 215, 0, 0.9);
  z-index: 5;
}

.particle-enter-active {
  animation: particleFloat 1s ease-out forwards;
}

.particle-leave-active {
  display: none;
}

/* Button punch (stronger than CSS :active) */
.click-button.punch {
  animation: punch 0.12s ease-out;
}

@keyframes punch {
  0% { transform: scale(1); }
  40% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

/* Screen shake on crits / milestones */
.clicker-page.shaking {
  animation: screenShake 0.4s ease-in-out;
}

@keyframes screenShake {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-6px, 3px); }
  40% { transform: translate(6px, -3px); }
  60% { transform: translate(-4px, -3px); }
  80% { transform: translate(4px, 3px); }
}

/* Count flash on milestone */
.count-flash {
  animation: countFlash 0.6s ease-out;
}

@keyframes countFlash {
  0% { transform: scale(1); color: #a8e063; }
  40% { transform: scale(1.5); color: #ffd700; text-shadow: 0 0 20px rgba(255, 215, 0, 0.9); }
  100% { transform: scale(1); color: #a8e063; }
}

/* Mute toggle */
.mute-toggle {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-size: 1.2rem;
  padding: 6px 10px;
  cursor: pointer;
}

.clicker-header {
  position: relative;
}

/* Offline + frenzy banners */
.offline-banner, .frenzy-banner {
  text-align: center;
  padding: 14px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 1.05rem;
}

.offline-banner {
  background: linear-gradient(135deg, rgba(168, 224, 99, 0.25), rgba(86, 171, 47, 0.25));
  border: 1px solid rgba(168, 224, 99, 0.5);
  color: #d6ffb0;
}

.frenzy-banner {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 140, 0, 0.25));
  border: 1px solid rgba(255, 215, 0, 0.6);
  color: #ffe98a;
  font-weight: bold;
  animation: frenzyPulse 0.8s ease-in-out infinite;
}

@keyframes frenzyPulse {
  0%, 100% { box-shadow: 0 0 0 rgba(255, 215, 0, 0); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
}

.banner-enter-active, .banner-leave-active {
  transition: all 0.4s ease;
}
.banner-enter-from, .banner-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

/* Golden mushroom */
.golden-mushroom {
  position: fixed;
  z-index: 100;
  font-size: 3.5rem;
  background: none;
  border: none;
  cursor: pointer;
  filter: drop-shadow(0 0 18px rgba(255, 215, 0, 0.9));
  animation: goldenDrift 8s linear, goldenSpin 1.5s ease-in-out infinite;
}

@keyframes goldenDrift {
  0% { opacity: 0; transform: scale(0.5); }
  10% { opacity: 1; transform: scale(1); }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes goldenSpin {
  0%, 100% { rotate: -12deg; }
  50% { rotate: 12deg; }
}

/* Achievement toasts */
.toast-stack {
  position: fixed;
  top: 90px;
  right: 20px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.achievement-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #2d3748, #1a1a2e);
  border: 1px solid rgba(255, 215, 0, 0.6);
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 220px;
}

.toast-icon { font-size: 2rem; }
.toast-text { display: flex; flex-direction: column; }
.toast-text strong { color: #ffd700; font-size: 0.8rem; }
.toast-text span { color: #eee; font-size: 1rem; }

.toast-enter-active, .toast-leave-active { transition: all 0.4s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(60px); }

/* Prestige section */
.prestige-section h2, .achievements-section h2 {
  text-align: center;
  font-size: 2rem;
  margin: 0 0 20px 0;
  color: #a8e063;
}

.prestige-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.prestige-stat {
  background: rgba(255, 215, 0, 0.06);
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.prestige-label { display: block; font-size: 0.85rem; color: #888; margin-bottom: 5px; }
.prestige-value { display: block; font-size: 1.5rem; font-weight: bold; color: #ffd700; }

.prestige-desc { text-align: center; color: #aaa; margin: 0 0 15px 0; }

.prestige-section {
  margin-bottom: 30px;
  text-align: center;
}

.prestige-btn {
  background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
  color: #1a1a2e;
}

.prestige-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
}

.prestige-btn.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Achievements grid */
.achievements-section { margin-bottom: 30px; }

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
}

.achievement-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.35);
  border-radius: 12px;
  padding: 14px 8px;
  text-align: center;
}

.achievement-card.locked {
  opacity: 0.4;
  border-color: rgba(255, 255, 255, 0.1);
  filter: grayscale(1);
}

.achievement-icon { font-size: 2rem; margin-bottom: 6px; }
.achievement-name { font-size: 0.8rem; color: #ddd; }

.click-instruction {
  margin-top: 15px;
  color: #888;
  font-size: 1rem;
}

.upgrades-section h2 {
  text-align: center;
  font-size: 2rem;
  margin: 0 0 20px 0;
  color: #a8e063;
}

.upgrades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.upgrade-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(168, 224, 99, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upgrade-card:hover:not(.disabled) {
  background: rgba(168, 224, 99, 0.1);
  transform: translateY(-5px);
  border-color: rgba(168, 224, 99, 0.6);
}

.upgrade-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upgrade-card.click-upgrade {
  border-color: rgba(168, 224, 99, 0.5);
}

.upgrade-card.auto-upgrade {
  border-color: rgba(86, 171, 47, 0.5);
}

.upgrade-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.upgrade-info h3 {
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  color: #fff;
}

.upgrade-cost {
  color: #a8e063;
  font-weight: bold;
  margin: 5px 0;
  font-size: 1rem;
}

.upgrade-power {
  color: #888;
  margin: 5px 0;
  font-size: 0.9rem;
}

.upgrade-purchased {
  color: #666;
  margin: 5px 0 0 0;
  font-size: 0.85rem;
}

.actions-section {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #eee;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.reset-btn {
  background: rgba(255, 82, 82, 0.2);
  color: #ff5252;
  border: 1px solid rgba(255, 82, 82, 0.3);
}

.reset-btn:hover {
  background: rgba(255, 82, 82, 0.3);
}

.grant-btn {
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  color: #fff;
  border: none;
}

.grant-btn:hover {
  background: linear-gradient(135deg, #56ab2f 0%, #3d8a1f 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(168, 224, 99, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }

  .clicker-header h1 {
    font-size: 2rem;
  }

  .click-button {
    width: 150px;
    height: 150px;
  }

  .mushroom-icon {
    font-size: 4rem;
    line-height: 150px;
  }

  .upgrades-grid {
    grid-template-columns: 1fr;
  }
}
</style>
