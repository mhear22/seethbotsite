import { ref, computed } from 'vue'
import { statsRepository } from '../repositories/stats.repository'

export interface BaitType {
  id: string
  name: string
  icon: string
  attractsDepth: 'shallow' | 'medium' | 'deep' | 'all'
  bonusMultiplier: number
  cost: number
}

export interface FishType {
  color: number
  name: string
  points: number
  size: number
  rare?: boolean
  depth: 'shallow' | 'medium' | 'deep'
  speed: 'slow' | 'normal' | 'fast'
  behavior: 'random' | 'circle' | 'zigzag'
}

export interface FishUserData extends FishType {
  id: number
  behaviorOffset?: number
}

export const fishTypes: FishType[] = [
  // Shallow zone (easy - depths -1 to -3)
  { color: 0xff6b6b, name: 'Minnow', points: 5, size: 0.6, depth: 'shallow', speed: 'fast', behavior: 'random' },
  { color: 0x4ecdc4, name: 'Coral Fish', points: 10, size: 0.8, depth: 'shallow', speed: 'normal', behavior: 'random' },
  { color: 0xffe66d, name: 'Sunfish', points: 15, size: 0.9, depth: 'shallow', speed: 'slow', behavior: 'circle' },

  // Medium zone (moderate - depths -3 to -5)
  { color: 0x95e1d3, name: 'Jellyfish', points: 25, size: 1.0, depth: 'medium', speed: 'slow', behavior: 'zigzag' },
  { color: 0xdda0dd, name: 'Tropical Fish', points: 30, size: 1.1, depth: 'medium', speed: 'normal', behavior: 'circle' },
  { color: 0xff4757, name: 'Clownfish', points: 35, size: 0.9, depth: 'medium', speed: 'fast', behavior: 'random' },

  // Deep zone (hard - depths -5 to -7)
  { color: 0x2ed573, name: 'Angelfish', points: 50, size: 1.3, depth: 'deep', speed: 'normal', behavior: 'zigzag' },
  { color: 0x3742fa, name: 'Blue Tang', points: 60, size: 1.2, depth: 'deep', speed: 'fast', behavior: 'circle' },
  { color: 0xff6348, name: 'Salmon', points: 75, size: 1.4, depth: 'deep', speed: 'fast', behavior: 'zigzag' },

  // Legendary (very deep - depths -6 to -8)
  { color: 0xffd700, name: 'Legendary Goldfish', points: 150, size: 0.8, depth: 'deep', speed: 'fast', behavior: 'circle', rare: true },
  { color: 0x9b59b6, name: 'Ancient Coelacanth', points: 200, size: 1.8, depth: 'deep', speed: 'slow', behavior: 'random', rare: true }
]

export const baitTypes: BaitType[] = [
  { id: 'worm', name: 'Worm', icon: '🪱', attractsDepth: 'shallow', bonusMultiplier: 1.0, cost: 0 },
  { id: 'shrimp', name: 'Shrimp', icon: '🦐', attractsDepth: 'medium', bonusMultiplier: 1.2, cost: 10 },
  { id: 'squid', name: 'Squid', icon: '🦑', attractsDepth: 'deep', bonusMultiplier: 1.5, cost: 25 },
  { id: 'legendary', name: 'Golden Lure', icon: '✨', attractsDepth: 'all', bonusMultiplier: 2.0, cost: 50 }
]

export function useFishingGame() {
  // Game state
  const gameActive = ref(false)
  const score = ref(0)
  const caughtFish = ref<string[]>([])

  // Struggle mechanics
  const isStruggling = ref(false)
  const struggleProgress = ref(0)
  const fishStrength = ref(0)
  const struggleTimeRemaining = ref(0)
  const lastKeyPressTime = ref(0)
  const requiredPresses = ref(0)
  const currentPresses = ref(0)

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

  // Initialize user ID
  userId.value = getOrCreateUserId()

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

    // Record stats
    recordFishCaught(fishData.name, finalPoints)
    updateHighScore()

    // Increment combo
    comboCount.value++
    if (comboCount.value > maxCombo.value) {
      maxCombo.value = comboCount.value
    }
  }

  // Fish escapes
  const fishEscapes = () => {
    isStruggling.value = false
    // Reset combo
    comboCount.value = 0
  }

  // Start struggle
  const startStruggle = (fishData: FishUserData) => {
    isStruggling.value = true
    fishStrength.value = fishData.points
    requiredPresses.value = Math.ceil(fishData.points / 5)
    currentPresses.value = 0
    struggleProgress.value = 0
    struggleTimeRemaining.value = 3 + (fishData.points / 50)
  }

  // Handle struggle key press
  const handleStruggleKeyPress = () => {
    if (!isStruggling.value) return false

    const now = Date.now()
    const timeSinceLastPress = now - lastKeyPressTime.value

    // Prevent spam (minimum 100ms between presses)
    if (timeSinceLastPress < 100) return false

    lastKeyPressTime.value = now
    currentPresses.value++

    // Increase progress based on press timing
    struggleProgress.value += 10

    return true
  }

  // Select bait
  const selectBait = (bait: BaitType) => {
    if (gameActive.value) return false
    if (bait.cost > 0 && baitInventory.value[bait.id] === 0) return false
    selectedBait.value = bait
    return true
  }

  // Reset game state (for new game)
  const resetGame = () => {
    score.value = 0
    caughtFish.value = []
    comboCount.value = 0
    maxCombo.value = 0
    gameActive.value = false
    isStruggling.value = false
  }

  return {
    // State
    gameActive,
    score,
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

    // Methods
    completeCatch,
    fishEscapes,
    startStruggle,
    handleStruggleKeyPress,
    selectBait,
    updateHighScore,
    resetGame,
    getOrCreateUserId
  }
}
