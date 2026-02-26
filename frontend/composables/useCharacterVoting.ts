import { ref, computed, onMounted } from 'vue'

export interface Character {
  id: number
  name: string
  image_url: string | null
  elo_rating: number
  wins: number
  losses: number
  created_at: string
}

export interface VoteResult {
  winner: Character
  loser: Character
  elo_change_winner: number
  elo_change_loser: number
}

export interface NewCharacterForm {
  name: string
  image_url: string
}

export function useCharacterVoting() {
  const characters = ref<Character[]>([])
  const currentPair = ref<[Character, Character] | null>(null)
  const loading = ref(false)
  const voting = ref(false)
  const showLeaderboard = ref(false)
  const showAddModal = ref(false)

  // Vote result state
  const lastVote = ref<VoteResult | null>(null)
  const showVoteResult = ref(false)

  // Form state
  const newCharacter = ref<NewCharacterForm>({
    name: '',
    image_url: ''
  })

  // Computed
  const leadingCharacter = computed(() => characters.value[0] || null)

  const totalBattles = computed(() => {
    const totalRecords = characters.value.reduce((sum, character) => sum + character.wins + character.losses, 0)
    return Math.floor(totalRecords / 2)
  })

  const hasCharacters = computed(() => characters.value.length > 0)

  const hasCurrentPair = computed(() => currentPair.value !== null)

  // API calls
  async function loadCharacters(): Promise<void> {
    loading.value = true
    try {
      const response = await fetch('/api/characters')
      const data = await response.json()
      characters.value = data.characters || []
    } catch (error) {
      console.error('Error loading characters:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadRandomPair(): Promise<void> {
    loading.value = true
    try {
      const response = await fetch('/api/characters/random-pair')
      const data = await response.json()
      if (data.characters && data.characters.length >= 2) {
        currentPair.value = [data.characters[0], data.characters[1]]
      } else {
        currentPair.value = null
      }
    } catch (error) {
      console.error('Error loading random pair:', error)
      currentPair.value = null
    } finally {
      loading.value = false
    }
  }

  async function vote(winnerId: number): Promise<void> {
    if (!currentPair.value || voting.value) return

    const loser = currentPair.value.find(c => c.id !== winnerId)
    if (!loser) return

    voting.value = true
    try {
      const response = await fetch('/api/characters/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winner_id: winnerId,
          loser_id: loser.id
        })
      })

      const data = await response.json()
      lastVote.value = data
      showVoteResult.value = true

      // Reload characters and get new pair after short delay
      setTimeout(async () => {
        await loadCharacters()
        await loadRandomPair()
        showVoteResult.value = false
      }, 1500)
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      voting.value = false
    }
  }

  async function addCharacter(): Promise<boolean> {
    if (!newCharacter.value.name.trim()) return false

    loading.value = true
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCharacter.value.name.trim(),
          image_url: newCharacter.value.image_url.trim() || null
        })
      })

      if (!response.ok) throw new Error('Failed to add character')

      // Reset form
      newCharacter.value = { name: '', image_url: '' }
      showAddModal.value = false

      // Reload characters
      await loadCharacters()
      await loadRandomPair()
      return true
    } catch (error) {
      console.error('Error adding character:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // UI actions
  function toggleLeaderboard(): void {
    showLeaderboard.value = !showLeaderboard.value
  }

  function openAddModal(): void {
    showAddModal.value = true
  }

  function closeAddModal(): void {
    showAddModal.value = false
    newCharacter.value = { name: '', image_url: '' }
  }

  // Initialize
  async function initialize(): Promise<void> {
    await loadCharacters()
    await loadRandomPair()
  }

  // Get win rate percentage
  function getWinRate(character: Character): number {
    const total = character.wins + character.losses
    if (total === 0) return 0
    return Math.round((character.wins / total) * 100)
  }

  return {
    // State
    characters,
    currentPair,
    loading,
    voting,
    showLeaderboard,
    showAddModal,
    lastVote,
    showVoteResult,
    newCharacter,

    // Computed
    leadingCharacter,
    totalBattles,
    hasCharacters,
    hasCurrentPair,

    // API actions
    loadCharacters,
    loadRandomPair,
    vote,
    addCharacter,

    // UI actions
    toggleLeaderboard,
    openAddModal,
    closeAddModal,
    initialize,
    getWinRate
  }
}
