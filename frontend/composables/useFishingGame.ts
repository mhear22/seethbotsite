import { ref, computed, watch } from 'vue'
import { statsRepository } from '../repositories/stats.repository'

export interface BaitType {
  id: string
  name: string
  icon: string
  attractsDepth: 'shallow' | 'medium' | 'deep' | 'all'
  bonusMultiplier: number
  cost: number
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export interface FishType {
  color: number
  name: string
  points: number
  size: number
  rare?: boolean
  rarity: Rarity
  depth: 'shallow' | 'medium' | 'deep'
  speed: 'slow' | 'normal' | 'fast'
  behavior: 'random' | 'circle' | 'zigzag'
}

export interface FishUserData extends FishType {
  id: number
  behaviorOffset?: number
  centerX?: number
  centerZ?: number
  orbitRadius?: number
}

// Per-species bestiary record (persisted)
export interface BestiaryEntry {
  name: string
  count: number
  firstCaught: string // ISO date
  bestSize: number
  bestWeight: number
  totalPoints: number
}

export interface UpgradeTier {
  cost: number
  value: number
  label: string
}

export interface UpgradeDef {
  id: 'rod' | 'line' | 'reel'
  name: string
  icon: string
  description: string
  // what the tier "value" affects
  tiers: UpgradeTier[]
}

export const fishTypes: FishType[] = [
  // Shallow zone (easy - depths -1 to -3)
  { color: 0xff6b6b, name: 'Minnow', points: 5, size: 0.6, rarity: 'common', depth: 'shallow', speed: 'fast', behavior: 'random' },
  { color: 0x4ecdc4, name: 'Coral Fish', points: 10, size: 0.8, rarity: 'common', depth: 'shallow', speed: 'normal', behavior: 'random' },
  { color: 0xffe66d, name: 'Sunfish', points: 15, size: 0.9, rarity: 'uncommon', depth: 'shallow', speed: 'slow', behavior: 'circle' },
  { color: 0xff9ff3, name: 'Pink Pufferfish', points: 40, size: 1.0, rarity: 'rare', depth: 'shallow', speed: 'slow', behavior: 'random', rare: true },

  // Medium zone (moderate - depths -3 to -5)
  { color: 0x95e1d3, name: 'Jellyfish', points: 25, size: 1.0, rarity: 'common', depth: 'medium', speed: 'slow', behavior: 'zigzag' },
  { color: 0xdda0dd, name: 'Tropical Fish', points: 30, size: 1.1, rarity: 'common', depth: 'medium', speed: 'normal', behavior: 'circle' },
  { color: 0xff4757, name: 'Clownfish', points: 35, size: 0.9, rarity: 'uncommon', depth: 'medium', speed: 'fast', behavior: 'random' },
  { color: 0x00d2d3, name: 'Rainbow Trout', points: 90, size: 1.2, rarity: 'rare', depth: 'medium', speed: 'fast', behavior: 'zigzag', rare: true },

  // Deep zone (hard - depths -5 to -7)
  { color: 0x2ed573, name: 'Angelfish', points: 50, size: 1.3, rarity: 'common', depth: 'deep', speed: 'normal', behavior: 'zigzag' },
  { color: 0x3742fa, name: 'Blue Tang', points: 60, size: 1.2, rarity: 'uncommon', depth: 'deep', speed: 'fast', behavior: 'circle' },
  { color: 0xff6348, name: 'Salmon', points: 75, size: 1.4, rarity: 'uncommon', depth: 'deep', speed: 'fast', behavior: 'zigzag' },

  // Legendary (very deep - depths -6 to -8)
  { color: 0xffd700, name: 'Legendary Goldfish', points: 150, size: 0.8, rarity: 'legendary', depth: 'deep', speed: 'fast', behavior: 'circle', rare: true },
  { color: 0x9b59b6, name: 'Ancient Coelacanth', points: 200, size: 1.8, rarity: 'legendary', depth: 'deep', speed: 'slow', behavior: 'random', rare: true }
]

export const baitTypes: BaitType[] = [
  { id: 'worm', name: 'Worm', icon: '🪱', attractsDepth: 'shallow', bonusMultiplier: 1.0, cost: 0 },
  { id: 'shrimp', name: 'Shrimp', icon: '🦐', attractsDepth: 'medium', bonusMultiplier: 1.2, cost: 10 },
  { id: 'squid', name: 'Squid', icon: '🦑', attractsDepth: 'deep', bonusMultiplier: 1.5, cost: 25 },
  { id: 'legendary', name: 'Golden Lure', icon: '✨', attractsDepth: 'all', bonusMultiplier: 2.0, cost: 50 }
]

// Rarity display metadata (UI uses this for color flourishes)
export const rarityMeta: Record<Rarity, { label: string; color: string; weight: number }> = {
  common: { label: 'Common', color: '#cbd5e0', weight: 70 },
  uncommon: { label: 'Uncommon', color: '#4ecdc4', weight: 22 },
  rare: { label: 'Rare', color: '#3742fa', weight: 7 },
  legendary: { label: 'Legendary', color: '#ffd700', weight: 1 }
}

// Upgrade definitions. Effects are read via the computed accessors below.
export const upgradeDefs: UpgradeDef[] = [
  {
    id: 'rod',
    name: 'Fishing Rod',
    icon: '🎣',
    description: 'Better rods improve catch chance and widen the safe band.',
    tiers: [
      { cost: 0, value: 0, label: 'Bamboo Rod' },
      { cost: 100, value: 1, label: 'Fiberglass Rod' },
      { cost: 350, value: 2, label: 'Carbon Rod' },
      { cost: 900, value: 3, label: 'Pro Tournament Rod' }
    ]
  },
  {
    id: 'line',
    name: 'Fishing Line',
    icon: '🧵',
    description: 'Stronger line raises max tension before the line snaps.',
    tiers: [
      { cost: 0, value: 0, label: 'Cotton Line' },
      { cost: 120, value: 1, label: 'Nylon Line' },
      { cost: 400, value: 2, label: 'Braided Line' },
      { cost: 1000, value: 3, label: 'Titanium Line' }
    ]
  },
  {
    id: 'reel',
    name: 'Reel',
    icon: '⚙️',
    description: 'Faster reels increase reel-in speed and distance gain.',
    tiers: [
      { cost: 0, value: 0, label: 'Hand Reel' },
      { cost: 150, value: 1, label: 'Spinning Reel' },
      { cost: 450, value: 2, label: 'Baitcaster Reel' },
      { cost: 1100, value: 3, label: 'Electric Reel' }
    ]
  }
]

const STORAGE_KEY = 'fishing-save-v1'

export type ReelMode = 'tension' | 'easy'

export function useFishingGame() {
  // Game state
  const gameActive = ref(false)
  const score = ref(0) // doubles as currency / gold
  const caughtFish = ref<string[]>([])

  // Persisted progression
  const bestiary = ref<Record<string, BestiaryEntry>>({})
  const bestScore = ref(0)
  const bestCombo = ref(0)
  const totalFishCaught = ref(0)
  const heaviestCatch = ref<{ name: string; weight: number } | null>(null)

  // Upgrade levels (index into the tiers array)
  const upgradeLevels = ref<Record<'rod' | 'line' | 'reel', number>>({
    rod: 0,
    line: 0,
    reel: 0
  })

  // Reeling minigame mode
  const reelMode = ref<ReelMode>('tension')

  // ---- Legacy struggle (easy / masher) mechanics ----
  const isStruggling = ref(false)
  const struggleProgress = ref(0)
  const fishStrength = ref(0)
  const struggleTimeRemaining = ref(0)
  const lastKeyPressTime = ref(0)
  const requiredPresses = ref(0)
  const currentPresses = ref(0)

  // ---- Tension-bar reeling minigame state ----
  const tension = ref(0)          // 0..maxTension
  const maxTension = ref(100)
  const safeBandLow = ref(30)     // band lower edge (in tension units)
  const safeBandHigh = ref(60)    // band upper edge
  const distance = ref(0)         // 0..100, fills when in-band; 100 = catch
  const reelActive = ref(false)   // is the player currently reeling/holding

  // Internal loop refs (delta-time)
  let loopId: number | null = null
  let lastFrameTime = 0
  let activeFishData: FishUserData | null = null
  // band drift target & lunge bookkeeping
  let bandCenterTarget = 45
  let bandHalfWidth = 15
  let nextLungeAt = 0
  let onResolve: ((won: boolean) => void) | null = null

  // Combo system
  const comboCount = ref(0)
  const comboMultiplier = computed(() => {
    if (comboCount.value >= 10) return 3.0
    if (comboCount.value >= 5) return 2.0
    if (comboCount.value >= 3) return 1.5
    if (comboCount.value >= 2) return 1.25
    return 1.0
  })
  const maxCombo = ref(0)

  // Depth selection
  const selectedDepth = ref<'shallow' | 'medium' | 'deep'>('medium')

  // Bait system
  const selectedBait = ref<BaitType>(baitTypes[0])
  const baitInventory = ref<Record<string, number>>({
    worm: Infinity,
    shrimp: 5,
    squid: 2,
    legendary: 1
  })

  // ---- Upgrade effect accessors ----
  // Rod: +catch chance, +safe band width
  const rodTier = computed(() => upgradeLevels.value.rod)
  const lineTier = computed(() => upgradeLevels.value.line)
  const reelTier = computed(() => upgradeLevels.value.reel)

  // Bonus catch chance added in checkForBite (consumed by scene via getter passed in cast)
  const catchChanceBonus = computed(() => rodTier.value * 0.06) // up to +0.18
  // Half-width bonus for the tension safe band (wider = easier)
  const bandWidthBonus = computed(() => rodTier.value * 2.5)    // tension units added to half width
  // Max tension before snap
  const maxTensionForGear = computed(() => 100 + lineTier.value * 20)
  // Reel speed: how fast tension rises and distance fills
  const reelSpeedMult = computed(() => 1 + reelTier.value * 0.18)

  // ---- Currency / economy ----
  const currency = computed(() => score.value)

  // User ID for tracking
  const userId = ref('')
  let lastRecordedScore = 0

  const getOrCreateUserId = (): string => {
    let id = localStorage.getItem('stats-user-id')
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('stats-user-id', id)
    }
    return id
  }

  userId.value = getOrCreateUserId()

  // ---- Persistence ----
  const loadSave = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (typeof data.score === 'number') score.value = data.score
      if (Array.isArray(data.caughtFish)) caughtFish.value = data.caughtFish
      if (data.baitInventory && typeof data.baitInventory === 'object') {
        // worm stays Infinity even though JSON can't store it
        baitInventory.value = { worm: Infinity, ...data.baitInventory, worm: Infinity }
      }
      if (data.bestiary && typeof data.bestiary === 'object') bestiary.value = data.bestiary
      if (typeof data.bestScore === 'number') bestScore.value = data.bestScore
      if (typeof data.bestCombo === 'number') bestCombo.value = data.bestCombo
      if (typeof data.totalFishCaught === 'number') totalFishCaught.value = data.totalFishCaught
      if (data.heaviestCatch) heaviestCatch.value = data.heaviestCatch
      if (data.upgradeLevels && typeof data.upgradeLevels === 'object') {
        upgradeLevels.value = { rod: 0, line: 0, reel: 0, ...data.upgradeLevels }
      }
      if (data.reelMode === 'tension' || data.reelMode === 'easy') reelMode.value = data.reelMode
    } catch (error) {
      console.error('Error loading fishing save:', error)
    }
  }

  const saveData = () => {
    try {
      // Strip Infinity (JSON-safe): persist all but worm
      const baitToSave: Record<string, number> = {}
      for (const [k, v] of Object.entries(baitInventory.value)) {
        if (k === 'worm') continue
        if (Number.isFinite(v)) baitToSave[k] = v
      }
      const payload = {
        score: score.value,
        caughtFish: caughtFish.value,
        baitInventory: baitToSave,
        bestiary: bestiary.value,
        bestScore: bestScore.value,
        bestCombo: bestCombo.value,
        totalFishCaught: totalFishCaught.value,
        heaviestCatch: heaviestCatch.value,
        upgradeLevels: upgradeLevels.value,
        reelMode: reelMode.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.error('Error saving fishing save:', error)
    }
  }

  loadSave()

  // Reactive persistence watch
  watch(
    [score, caughtFish, baitInventory, bestiary, bestScore, bestCombo, totalFishCaught, heaviestCatch, upgradeLevels, reelMode],
    saveData,
    { deep: true }
  )

  // Record fish caught stat
  const recordFishCaught = async (fishName: string, points: number) => {
    try {
      await statsRepository.recordStat({
        userId: userId.value,
        userName: localStorage.getItem('user-name') || undefined,
        gameType: 'fishing',
        statType: 'fish_caught',
        value: 1,
        metadata: {
          fishName,
          points,
          combo: comboCount.value,
          comboMultiplier: comboMultiplier.value,
          baitUsed: selectedBait.value.id,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error recording fish caught:', error)
    }
  }

  // Update high score for fishing
  const updateHighScore = async () => {
    if (score.value > lastRecordedScore) {
      try {
        await statsRepository.updateHighScore({
          userId: userId.value,
          userName: localStorage.getItem('user-name') || undefined,
          gameType: 'fishing',
          score: score.value,
          details: {
            fishCaught: caughtFish.value.length,
            maxCombo: maxCombo.value,
            timestamp: new Date().toISOString()
          }
        })
        lastRecordedScore = score.value
      } catch (error) {
        console.error('Error updating high score:', error)
      }
    }
  }

  // ---- Bestiary / records bookkeeping ----
  // Each catch rolls a randomized size factor (0.7..1.4). Weight derives from size.
  const rollSizeFactor = () => 0.7 + Math.random() * 0.7

  const recordBestiary = (fishData: FishUserData, finalPoints: number) => {
    const sizeFactor = rollSizeFactor()
    const actualSize = +(fishData.size * sizeFactor).toFixed(2)
    const actualWeight = +(fishData.size * sizeFactor * 2.2).toFixed(2) // arbitrary kg-ish
    const now = new Date().toISOString()

    const existing = bestiary.value[fishData.name]
    if (existing) {
      existing.count++
      existing.bestSize = Math.max(existing.bestSize, actualSize)
      existing.bestWeight = Math.max(existing.bestWeight, actualWeight)
      existing.totalPoints += finalPoints
    } else {
      bestiary.value[fishData.name] = {
        name: fishData.name,
        count: 1,
        firstCaught: now,
        bestSize: actualSize,
        bestWeight: actualWeight,
        totalPoints: finalPoints
      }
    }

    totalFishCaught.value++
    if (!heaviestCatch.value || actualWeight > heaviestCatch.value.weight) {
      heaviestCatch.value = { name: fishData.name, weight: actualWeight }
    }

    return { actualSize, actualWeight }
  }

  // Completion percentage of the bestiary
  const completionPercent = computed(() => {
    const discovered = Object.keys(bestiary.value).length
    return Math.round((discovered / fishTypes.length) * 100)
  })

  // Last catch info for UI flourish
  const lastCatch = ref<{
    name: string
    points: number
    rarity: Rarity
    color: number
    size: number
    weight: number
  } | null>(null)

  // Complete catch
  const completeCatch = (fishData: FishUserData) => {
    isStruggling.value = false

    // Apply combo and bait multipliers
    const finalPoints = Math.floor(
      fishData.points *
      comboMultiplier.value *
      selectedBait.value.bonusMultiplier
    )

    score.value += finalPoints
    caughtFish.value.push(fishData.name)

    const { actualSize, actualWeight } = recordBestiary(fishData, finalPoints)

    lastCatch.value = {
      name: fishData.name,
      points: finalPoints,
      rarity: fishData.rarity,
      color: fishData.color,
      size: actualSize,
      weight: actualWeight
    }

    // Record stats
    recordFishCaught(fishData.name, finalPoints)
    updateHighScore()

    // Increment combo
    comboCount.value++
    if (comboCount.value > maxCombo.value) {
      maxCombo.value = comboCount.value
    }
    if (maxCombo.value > bestCombo.value) bestCombo.value = maxCombo.value
    if (score.value > bestScore.value) bestScore.value = score.value
  }

  // Fish escapes
  const fishEscapes = () => {
    isStruggling.value = false
    // Reset combo
    comboCount.value = 0
  }

  // ---- Legacy / easy masher struggle ----
  const startStruggle = (fishData: FishUserData) => {
    isStruggling.value = true
    fishStrength.value = fishData.points
    requiredPresses.value = Math.ceil(fishData.points / 5)
    currentPresses.value = 0
    struggleProgress.value = 0
    struggleTimeRemaining.value = 3 + (fishData.points / 50)
  }

  // Handle struggle key press (easy mode)
  const handleStruggleKeyPress = () => {
    if (!isStruggling.value) return false

    const now = Date.now()
    const timeSinceLastPress = now - lastKeyPressTime.value

    // Prevent spam (minimum 100ms between presses)
    if (timeSinceLastPress < 100) return false

    lastKeyPressTime.value = now
    currentPresses.value++

    // Authoritative metric: progress is press progress
    struggleProgress.value = Math.min(100, (currentPresses.value / requiredPresses.value) * 100)

    return true
  }

  // ===========================================================
  // TENSION-BAR REELING MINIGAME (delta-time loop)
  // ===========================================================
  // Tunables derived from fish strength/speed + gear.
  const startTensionGame = (
    fishData: FishUserData,
    onDone: (won: boolean) => void,
    onShake?: (intensity: number) => void
  ) => {
    isStruggling.value = true
    activeFishData = fishData
    onResolve = onDone

    fishStrength.value = fishData.points

    // Gear-driven config
    maxTension.value = maxTensionForGear.value
    // strength scales 0..1 (200pt legendary ~= 1)
    const strengthNorm = Math.min(1, fishData.points / 200)
    const speedFactor = fishData.speed === 'fast' ? 1.3 : fishData.speed === 'slow' ? 0.7 : 1.0

    // Band half-width: rarer/stronger fish -> narrower band. Rod widens it.
    bandHalfWidth = Math.max(
      6,
      18 - strengthNorm * 9 + bandWidthBonus.value
    )
    bandCenterTarget = maxTension.value * 0.5
    safeBandLow.value = bandCenterTarget - bandHalfWidth
    safeBandHigh.value = bandCenterTarget + bandHalfWidth

    tension.value = 0
    distance.value = 0
    reelActive.value = false

    // Lunge cadence: stronger/faster fish lunge more often
    nextLungeAt = 0
    lungeIntervalBase = Math.max(0.8, 2.2 - strengthNorm * 1.0) / speedFactor

    onShakeCb = onShake || null

    lastFrameTime = performance.now()
    if (loopId !== null) cancelAnimationFrame(loopId)
    loopId = requestAnimationFrame(tensionLoop)
  }

  let lungeIntervalBase = 1.5
  let lungeTimer = 0
  let onShakeCb: ((intensity: number) => void) | null = null

  // External input from UI: hold to reel
  const reel = (active: boolean) => {
    reelActive.value = active
  }

  const stopTensionGame = () => {
    if (loopId !== null) {
      cancelAnimationFrame(loopId)
      loopId = null
    }
    isStruggling.value = false
    reelActive.value = false
    activeFishData = null
    onResolve = null
    onShakeCb = null
  }

  const tensionLoop = (nowMs: number) => {
    if (!isStruggling.value || !activeFishData) {
      loopId = null
      return
    }

    const dt = Math.min(0.05, Math.max(0, (nowMs - lastFrameTime) / 1000))
    lastFrameTime = nowMs

    const fish = activeFishData
    const strengthNorm = Math.min(1, fish.points / 200)

    // --- Tension dynamics ---
    // Reeling raises tension; releasing lets it fall (fish runs).
    const riseRate = (40 + strengthNorm * 30) * reelSpeedMult.value
    const fallRate = 35 + strengthNorm * 25
    if (reelActive.value) {
      tension.value += riseRate * dt
    } else {
      tension.value -= fallRate * dt
    }
    tension.value = Math.max(0, tension.value)

    // --- Lunges: shift & narrow the band by strength/speed ---
    lungeTimer += dt
    if (lungeTimer >= nextLungeAt) {
      lungeTimer = 0
      nextLungeAt = lungeIntervalBase * (0.6 + Math.random() * 0.8)
      // Shift band center somewhere within the playable range
      const margin = bandHalfWidth + 5
      bandCenterTarget = margin + Math.random() * (maxTension.value - margin * 2)
      if (onShakeCb) onShakeCb(0.3 + strengthNorm * 0.7)
    }

    // Smoothly drift the actual band toward the target center
    const drift = (60 + strengthNorm * 40) * dt
    const cur = (safeBandLow.value + safeBandHigh.value) / 2
    let next = cur
    if (Math.abs(bandCenterTarget - cur) <= drift) next = bandCenterTarget
    else next += Math.sign(bandCenterTarget - cur) * drift
    safeBandLow.value = next - bandHalfWidth
    safeBandHigh.value = next + bandHalfWidth

    // --- Win/lose checks ---
    // Out-of-band too high snaps the line (escape).
    if (tension.value >= maxTension.value) {
      const resolve = onResolve
      stopTensionGame()
      if (resolve) resolve(false)
      return
    }

    const inBand = tension.value >= safeBandLow.value && tension.value <= safeBandHigh.value
    if (inBand) {
      // Distance fills while in-band, faster reel = faster fill
      distance.value += (22 + reelSpeedMult.value * 6) * dt
    } else {
      // Slight bleed-off when out of band so mistakes cost progress
      distance.value -= 6 * dt
    }
    distance.value = Math.max(0, Math.min(100, distance.value))

    if (distance.value >= 100) {
      const resolve = onResolve
      stopTensionGame()
      if (resolve) resolve(true)
      return
    }

    loopId = requestAnimationFrame(tensionLoop)
  }

  // Select bait
  const selectBait = (bait: BaitType) => {
    if (gameActive.value) return false
    if (bait.cost > 0 && (baitInventory.value[bait.id] ?? 0) <= 0) return false
    selectedBait.value = bait
    return true
  }

  // Consume one unit of the selected bait on cast (when it has a cost)
  const consumeBaitOnCast = () => {
    const bait = selectedBait.value
    if (bait.cost > 0 && Number.isFinite(baitInventory.value[bait.id])) {
      baitInventory.value[bait.id] = Math.max(0, (baitInventory.value[bait.id] ?? 0) - 1)
      // If we ran out, fall back to worm for the next cast
      if ((baitInventory.value[bait.id] ?? 0) <= 0) {
        selectedBait.value = baitTypes[0]
      }
    }
  }

  // Buy bait with score/currency
  const buyBait = (id: string): boolean => {
    const bait = baitTypes.find(b => b.id === id)
    if (!bait || bait.cost <= 0) return false
    if (score.value < bait.cost) return false
    score.value -= bait.cost
    baitInventory.value[id] = (Number.isFinite(baitInventory.value[id]) ? baitInventory.value[id] : 0) + 1
    return true
  }

  // ---- Upgrades ----
  const getUpgrade = (id: 'rod' | 'line' | 'reel') => upgradeDefs.find(u => u.id === id)!

  const nextUpgradeTier = (id: 'rod' | 'line' | 'reel'): UpgradeTier | null => {
    const def = getUpgrade(id)
    const next = upgradeLevels.value[id] + 1
    return next < def.tiers.length ? def.tiers[next] : null
  }

  const buyUpgrade = (id: 'rod' | 'line' | 'reel'): boolean => {
    const next = nextUpgradeTier(id)
    if (!next) return false
    if (score.value < next.cost) return false
    score.value -= next.cost
    upgradeLevels.value[id]++
    return true
  }

  // Reset game state (does NOT wipe persisted progression unless requested)
  const resetGame = () => {
    score.value = 0
    caughtFish.value = []
    comboCount.value = 0
    maxCombo.value = 0
    gameActive.value = false
    isStruggling.value = false
    stopTensionGame()
  }

  return {
    // State
    gameActive,
    score,
    currency,
    caughtFish,
    isStruggling,
    struggleProgress,
    fishStrength,
    struggleTimeRemaining,
    requiredPresses,
    currentPresses,
    comboCount,
    comboMultiplier,
    maxCombo,
    selectedDepth,
    selectedBait,
    baitInventory,
    userId,

    // Tension minigame state
    reelMode,
    tension,
    maxTension,
    safeBandLow,
    safeBandHigh,
    distance,
    reelActive,

    // Progression / bestiary
    bestiary,
    bestScore,
    bestCombo,
    totalFishCaught,
    heaviestCatch,
    completionPercent,
    lastCatch,

    // Upgrades
    upgradeLevels,
    catchChanceBonus,
    bandWidthBonus,
    maxTensionForGear,
    reelSpeedMult,

    // Methods
    completeCatch,
    fishEscapes,
    startStruggle,
    handleStruggleKeyPress,
    startTensionGame,
    stopTensionGame,
    reel,
    selectBait,
    consumeBaitOnCast,
    buyBait,
    buyUpgrade,
    nextUpgradeTier,
    getUpgrade,
    updateHighScore,
    resetGame,
    getOrCreateUserId,
    saveData
  }
}
