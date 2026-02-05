<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Modal from '../shared/ui/Modal.vue'

interface Character {
  id: number
  name: string
  image_url: string | null
  elo_rating: number
  wins: number
  losses: number
  created_at: string
}

interface VoteResult {
  winner: Character
  loser: Character
  elo_change_winner: number
  elo_change_loser: number
}

const characters = ref<Character[]>([])
const currentPair = ref<[Character, Character] | null>(null)
const showAddModal = ref(false)
const showLeaderboard = ref(false)
const loading = ref(false)
const voting = ref(false)

// Form state
const newCharacter = ref({
  name: '',
  image_url: ''
})

// Vote result state
const lastVote = ref<VoteResult | null>(null)
const showVoteResult = ref(false)

// Load all characters
const loadCharacters = async () => {
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

// Load random pair for voting
const loadRandomPair = async () => {
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

// Vote for a character
const vote = async (winnerId: number) => {
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

// Add new character
const addCharacter = async () => {
  if (!newCharacter.value.name.trim()) return

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
  } catch (error) {
    console.error('Error adding character:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCharacters()
  await loadRandomPair()
})
</script>

<template>
  <div class="character-tinder-page">
    <div class="page-header">
      <h1>🎭 Fictional Character Tinder</h1>
      <p>Vote for your favourite characters and see who reigns supreme!</p>
      <div class="header-actions">
        <button @click="showAddModal = true" class="action-btn add-btn">
          ➕ Add Character
        </button>
        <button @click="showLeaderboard = !showLeaderboard" class="action-btn leaderboard-btn">
          {{ showLeaderboard ? '🎮 Start Voting' : '🏆 Leaderboard' }}
        </button>
      </div>
    </div>

    <!-- Vote Result Popup -->
    <div v-if="showVoteResult && lastVote" class="vote-result-popup">
      <div class="vote-result-content">
        <div class="winner-result">
          <h3>🏆 {{ lastVote.winner.name }} wins!</h3>
          <p class="elo-change">+{{ lastVote.elo_change_winner }} ELO</p>
        </div>
        <div class="loser-result">
          <h3>💔 {{ lastVote.loser.name }}</h3>
          <p class="elo-change">{{ lastVote.elo_change_loser }} ELO</p>
        </div>
      </div>
    </div>

    <!-- Voting Section -->
    <div v-if="!showLeaderboard" class="voting-section">
      <div v-if="loading" class="loading">
        Loading characters...
      </div>
      <div v-else-if="!currentPair" class="empty-state">
        <h2>🎭 No characters yet!</h2>
        <p>Be the first to add a character to start voting.</p>
        <button @click="showAddModal = true" class="add-first-btn">
          ➕ Add First Character
        </button>
      </div>
      <div v-else class="character-pair">
        <div
          v-for="character in currentPair"
          :key="character.id"
          class="character-card"
          @click="vote(character.id)"
          :class="{ voting: voting }"
        >
          <div class="character-image">
            <img
              v-if="character.image_url"
              :src="character.image_url"
              :alt="character.name"
            />
            <div v-else class="placeholder-image">
              <span class="placeholder-emoji">🎭</span>
            </div>
          </div>
          <div class="character-info">
            <h3>{{ character.name }}</h3>
            <div class="character-stats">
              <span class="elo">⭐ {{ character.elo_rating }} ELO</span>
              <span class="record">{{ character.wins }}W - {{ character.losses }}L</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leaderboard Section -->
    <div v-if="showLeaderboard" class="leaderboard-section">
      <div v-if="loading" class="loading">
        Loading leaderboard...
      </div>
      <div v-else-if="characters.length === 0" class="empty-state">
        <h2>🏆 Leaderboard</h2>
        <p>No characters yet. Add some to start the competition!</p>
      </div>
      <div v-else class="leaderboard">
        <div
          v-for="(character, index) in characters"
          :key="character.id"
          class="leaderboard-item"
          :class="{ 'top-3': index < 3 }"
        >
          <div class="rank">
            <span v-if="index === 0">🥇</span>
            <span v-else-if="index === 1">🥈</span>
            <span v-else-if="index === 2">🥉</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="character-display">
            <div class="character-avatar">
              <img
                v-if="character.image_url"
                :src="character.image_url"
                :alt="character.name"
              />
              <div v-else class="avatar-placeholder">🎭</div>
            </div>
            <div class="character-details">
              <h4>{{ character.name }}</h4>
              <div class="stats">
                <span class="elo">⭐ {{ character.elo_rating }}</span>
                <span class="record">{{ character.wins }}W - {{ character.losses }}L</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Character Modal -->
    <Modal
      :is-open="showAddModal"
      title="Add New Character"
      @close="showAddModal = false"
    >
      <form @submit.prevent="addCharacter" class="add-character-form">
        <div class="form-group">
          <label for="name">Character Name *</label>
          <input
            id="name"
            v-model="newCharacter.name"
            type="text"
            placeholder="e.g., Batman, Spider-Man, Wonder Woman"
            required
          />
        </div>
        <div class="form-group">
          <label for="image_url">Image URL (optional)</label>
          <input
            id="image_url"
            v-model="newCharacter.image_url"
            type="url"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div class="form-actions">
          <button
            type="button"
            @click="showAddModal = false"
            class="cancel-btn"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="submit-btn"
            :disabled="loading || !newCharacter.name.trim()"
          >
            {{ loading ? 'Adding...' : 'Add Character' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.character-tinder-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 50%, #ffb6c1 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.page-header p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0 0 20px 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.add-btn {
  background: white;
  color: #ff6b9d;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.leaderboard-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.leaderboard-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.vote-result-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.vote-result-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  display: flex;
  gap: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.winner-result,
.loser-result {
  text-align: center;
}

.winner-result h3,
.loser-result h3 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.winner-result h3 {
  color: #48bb78;
}

.loser-result h3 {
  color: #f56565;
}

.elo-change {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

.winner-result .elo-change {
  color: #48bb78;
}

.loser-result .elo-change {
  color: #f56565;
}

.voting-section {
  max-width: 900px;
  margin: 0 auto;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
}

.empty-state h2 {
  font-size: 2rem;
  margin-bottom: 10px;
}

.add-first-btn {
  margin-top: 20px;
  padding: 16px 32px;
  font-size: 1.2rem;
  font-weight: 700;
  background: white;
  color: #ff6b9d;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.add-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.character-pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.character-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.character-card:hover:not(.voting) {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.character-card.voting {
  cursor: not-allowed;
  opacity: 0.7;
}

.character-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.character-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-emoji {
  font-size: 80px;
}

.character-info {
  padding: 20px;
}

.character-info h3 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  color: #2d3748;
}

.character-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #718096;
}

.elo,
.record {
  font-weight: 600;
}

.leaderboard-section {
  max-width: 600px;
  margin: 0 auto;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 12px;
  transition: all 0.3s;
  border-bottom: 1px solid #e2e8f0;
}

.leaderboard-item:last-child {
  border-bottom: none;
}

.leaderboard-item:hover {
  background: rgba(255, 107, 157, 0.1);
}

.leaderboard-item.top-3 {
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.rank {
  font-size: 1.5rem;
  font-weight: 700;
  width: 40px;
  text-align: center;
  color: #718096;
}

.character-display {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.character-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.character-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.character-details h4 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: #2d3748;
}

.character-details .stats {
  font-size: 0.9rem;
  color: #718096;
}

.add-character-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #ff6b9d;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.cancel-btn:hover:not(:disabled) {
  background: #cbd5e0;
}

.submit-btn {
  background: #ff6b9d;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #ff5277;
  transform: translateY(-1px);
}

.cancel-btn:disabled,
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Dark mode */
.dark .character-tinder-page {
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%);
}

.dark .leaderboard {
  background: rgba(45, 55, 72, 0.95);
  border-color: rgba(255, 107, 157, 0.2);
}

.dark .character-info h3,
.dark .character-details h4 {
  color: #e2e8f0;
}

.dark .form-group label {
  color: #cbd5e0;
}

.dark .form-group input {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark .form-group input:focus {
  border-color: #ff6b9d;
}
</style>
