<script setup lang="ts">
import { onMounted } from 'vue'
import Modal from '../shared/ui/Modal.vue'
import { useCharacterVoting } from '../../composables/useCharacterVoting'

// Use the composable for all voting logic
const voting = useCharacterVoting()

// Destructure state and methods
const {
  characters,
  currentPair,
  loading,
  voting: isVoting,
  showLeaderboard,
  showAddModal,
  lastVote,
  showVoteResult,
  newCharacter,
  leadingCharacter,
  totalBattles,
  hasCharacters,
  hasCurrentPair,
  vote,
  addCharacter,
  toggleLeaderboard,
  openAddModal,
  closeAddModal,
  getWinRate
} = voting

// Initialize on mount
onMounted(() => {
  voting.initialize()
})
</script>

<template>
  <div class="character-tinder-page">
    <div class="character-shell">
      <div class="page-header">
        <p class="header-kicker">ELO ARENA</p>
        <h1>🎭 Fictional Character Tinder</h1>
        <p class="header-subtitle">Vote for your favourite characters and see who reigns supreme.</p>
        <div v-if="characters.length > 0" class="header-metrics" aria-label="Character stats summary">
          <div class="metric-pill">
            <span class="metric-label">Contenders</span>
            <strong>{{ characters.length }}</strong>
          </div>
          <div v-if="leadingCharacter" class="metric-pill">
            <span class="metric-label">Top Seed</span>
            <strong>{{ leadingCharacter.name }}</strong>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Battles</span>
            <strong>{{ totalBattles }}</strong>
          </div>
        </div>
        <div class="header-actions">
          <button @click="openAddModal" class="action-btn add-btn" aria-label="Add a new character">
            ➕ Add Character
          </button>
          <button
            @click="toggleLeaderboard"
            class="action-btn leaderboard-btn"
            :aria-label="showLeaderboard ? 'Start voting' : 'Show leaderboard'"
            :aria-pressed="showLeaderboard"
          >
            {{ showLeaderboard ? '🎮 Start Voting' : '🏆 Leaderboard' }}
          </button>
        </div>
      </div>

      <!-- Vote Result Popup -->
      <div v-if="showVoteResult && lastVote" class="vote-result-popup" role="status" aria-live="polite">
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
      <div v-if="!showLeaderboard" class="voting-section" role="region" aria-label="Voting area">
        <div v-if="loading" class="loading panel-state" aria-live="polite">
          Loading characters...
        </div>
        <div v-else-if="!currentPair" class="empty-state panel-state">
          <h2>🎭 No characters yet!</h2>
          <p>Be the first to add a character to start voting.</p>
          <button @click="openAddModal" class="add-first-btn" aria-label="Add the first character">
            ➕ Add First Character
          </button>
        </div>
        <div v-else class="matchup-panel">
          <p class="vote-hint">Choose your winner</p>
          <div class="character-pair" role="list">
            <button
              v-for="character in currentPair"
              :key="character.id"
              class="character-card"
              @click="vote(character.id)"
              :class="{ voting: isVoting }"
              :disabled="isVoting"
              :aria-label="`Vote for ${character.name}. Current ELO rating: ${character.elo_rating}, ${character.wins} wins, ${character.losses} losses`"
              role="listitem"
            >
              <div class="character-image">
                <img
                  v-if="character.image_url"
                  :src="character.image_url"
                  :alt="`Portrait of ${character.name}`"
                />
                <div v-else class="placeholder-image">
                  <span class="placeholder-emoji" aria-hidden="true">🎭</span>
                </div>
              </div>
              <div class="character-info">
                <h3>{{ character.name }}</h3>
                <div class="character-stats">
                  <span class="elo">ELO:{{ character.elo_rating }} (</span>
                  <span class="wins">{{ character.wins }}W</span>
                  <span aria-hidden="true"> - </span>
                  <span class="losses">{{ character.losses }}L</span>
                  <span class="elo">)</span>
                </div>
                <span class="vote-cta">{{ isVoting ? 'Voting...' : 'Tap to vote' }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Leaderboard Section -->
      <div v-if="showLeaderboard" class="leaderboard-section" role="region" aria-label="Leaderboard">
        <div v-if="loading" class="loading panel-state" aria-live="polite">
          Loading leaderboard...
        </div>
        <div v-else-if="characters.length === 0" class="empty-state panel-state">
          <h2>🏆 Leaderboard</h2>
          <p>No characters yet. Add some to start the competition!</p>
        </div>
        <div v-else class="leaderboard-panel">
          <div class="leaderboard-header">
            <h2>🏆 Leaderboard</h2>
            <p>{{ characters.length }} contenders ranked by ELO rating</p>
          </div>
          <ol class="leaderboard">
            <li
              v-for="(character, index) in characters"
              :key="character.id"
              class="leaderboard-item"
              :class="{ 'top-3': index < 3 }"
              :aria-label="`Rank ${index + 1}: ${character.name}. ELO rating: ${character.elo_rating}, ${character.wins} wins, ${character.losses} losses`"
            >
              <div class="rank" aria-hidden="true">
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
                    :alt="`Portrait of ${character.name}`"
                  />
                  <div v-else class="avatar-placeholder" aria-hidden="true">🎭</div>
                </div>
                <div class="character-details">
                  <h4>{{ character.name }}</h4>
                  <div class="stats">
                    <span class="elo">ELO:{{ character.elo_rating }} (</span>
                    <span class="wins">{{ character.wins }}W</span>
                    <span aria-hidden="true"> - </span>
                    <span class="losses">{{ character.losses }}L</span>
                    <span class="elo">)</span>
                    <span class="win-rate">
                      {{ getWinRate(character) }}% WR
                    </span>
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <!-- Add Character Modal -->
      <Modal
        :is-open="showAddModal"
        title="Add New Character"
        @close="closeAddModal"
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
              @click="closeAddModal"
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
  </div>
</template>

<style scoped>
.character-tinder-page {
  --card-bg: rgba(255, 255, 255, 0.9);
  --card-border: rgba(255, 255, 255, 0.52);
  --text-main: #332447;
  --text-muted: #6d6184;
  --accent: #ff4f8b;
  --accent-soft: #ff8d6c;
  --success: #27b57a;
  --danger: #f05b70;
  position: relative;
  min-height: 100vh;
  padding: 90px 18px 48px;
  background:
    radial-gradient(circle at 12% 16%, rgba(255, 255, 255, 0.35) 0, transparent 30%),
    radial-gradient(circle at 88% 10%, rgba(255, 210, 190, 0.35) 0, transparent 36%),
    linear-gradient(145deg, #ff5f6d 0%, #ffc371 100%);
  overflow: hidden;
}

.character-tinder-page::before,
.character-tinder-page::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.character-tinder-page::before {
  width: 380px;
  height: 380px;
  top: -180px;
  left: -120px;
  background: rgba(255, 255, 255, 0.22);
  filter: blur(12px);
}

.character-tinder-page::after {
  width: 420px;
  height: 420px;
  right: -190px;
  bottom: -220px;
  background: rgba(255, 119, 170, 0.2);
  filter: blur(16px);
}

.character-shell {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
}

.character-tinder-page h1,
.character-tinder-page h2,
.character-tinder-page h3,
.character-tinder-page h4 {
  background: none;
  -webkit-text-fill-color: currentColor;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.header-kicker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 12px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.74rem;
  letter-spacing: 0.18em;
  font-weight: 700;
  color: #fff5f8;
  background: rgba(51, 36, 71, 0.36);
  border: 1px solid rgba(255, 255, 255, 0.45);
}

.page-header h1 {
  margin: 0;
  font-size: clamp(1.9rem, 5vw, 3rem);
  color: #fff;
  text-shadow: 0 12px 24px rgba(47, 20, 58, 0.2);
}

.header-subtitle {
  max-width: 660px;
  margin: 14px auto 0;
  color: rgba(255, 247, 250, 0.94);
  font-size: 1.04rem;
  line-height: 1.55;
}

.header-metrics {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin: 22px auto 0;
}

.metric-pill {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #fff;
}

.metric-label {
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  opacity: 0.85;
}

.metric-pill strong {
  font-size: 0.94rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  line-height: 1.1;
  vertical-align: middle;
  white-space: nowrap;
  padding: 12px 24px;
  font-size: 0.96rem;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  box-shadow: 0 10px 20px rgba(65, 20, 62, 0.2);
  width: inherit;
}

.add-btn {
  background: #fff;
  color: #ff3f80;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgba(65, 20, 62, 0.26);
}

.leaderboard-btn {
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(6px);
}

.leaderboard-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.24);
}

.vote-result-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  animation: votePopupIn 0.28s ease;
}

@keyframes votePopupIn {
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
  padding: 24px;
  border-radius: 22px;
  background: #fff;
  display: flex;
  gap: 20px;
  border: 1px solid rgba(255, 79, 139, 0.22);
  box-shadow: 0 22px 44px rgba(31, 10, 30, 0.24);
}

.winner-result,
.loser-result {
  min-width: 180px;
  text-align: center;
}

.winner-result h3,
.loser-result h3 {
  margin: 0 0 6px;
  font-size: 1.15rem;
}

.winner-result h3,
.winner-result .elo-change {
  color: var(--success);
}

.loser-result h3,
.loser-result .elo-change {
  color: var(--danger);
}

.elo-change {
  margin: 0;
  font-weight: 700;
}

.voting-section,
.leaderboard-section {
  max-width: 980px;
  margin: 0 auto;
}

.panel-state {
  text-align: center;
  border-radius: 22px;
  padding: 56px 20px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--text-main);
  box-shadow: 0 14px 30px rgba(31, 15, 45, 0.14);
}

.panel-state p {
  margin-top: 6px;
  color: var(--text-muted);
}

.empty-state h2 {
  margin-bottom: 6px;
  font-size: 1.7rem;
  color: var(--text-main);
}

.add-first-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  line-height: 1.1;
  vertical-align: middle;
  white-space: nowrap;
  margin-top: 16px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(120deg, var(--accent) 0%, var(--accent-soft) 100%);
  box-shadow: 0 10px 22px rgba(255, 66, 130, 0.3);
}

.matchup-panel {
  border-radius: 26px;
  padding: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: 0 18px 34px rgba(30, 14, 46, 0.16);
}

.vote-hint {
  text-align: center;
  margin: 0 0 18px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.character-pair {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.character-pair::before {
  content: 'VS';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  box-shadow: 0 12px 24px rgba(255, 72, 137, 0.32);
}

.character-card {
  position: relative;
  text-align: left;
  border: 1px solid rgba(255, 108, 160, 0.2);
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  box-shadow: 0 10px 24px rgba(24, 6, 32, 0.1);
}

.character-card:nth-child(1) {
  animation: cardRise 0.35s ease;
}

.character-card:nth-child(2) {
  animation: cardRise 0.44s ease;
}

@keyframes cardRise {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.character-card:hover:not(.voting) {
  transform: translateY(-5px);
  border-color: rgba(255, 79, 139, 0.45);
  box-shadow: 0 18px 30px rgba(20, 4, 28, 0.16);
}

.character-card.voting {
  cursor: progress;
  opacity: 0.68;
}

.character-image {
  width: 100%;
  height: 255px;
  overflow: hidden;
  background: linear-gradient(145deg, #ff8d9d 0%, #ffb56d 100%);
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
  font-size: clamp(3.3rem, 8vw, 4.5rem);
}

.character-info {
  padding: 16px 16px 18px;
}

.character-info h3 {
  margin: 0 0 8px;
  font-size: 1.35rem;
  color: var(--text-main);
}

.character-stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.vote-cta {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(120deg, var(--accent) 0%, var(--accent-soft) 100%);
}

.elo {
  font-weight: 700;
}

.wins {
  color: var(--success);
  font-weight: 700;
}

.losses {
  color: var(--danger);
  font-weight: 700;
}

.leaderboard-panel {
  border-radius: 24px;
  padding: 18px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: 0 18px 34px rgba(30, 14, 46, 0.16);
}

.leaderboard-header {
  margin: 0 0 14px;
  padding: 10px 12px;
}

.leaderboard-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-main);
}

.leaderboard-header p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 0.93rem;
}

.leaderboard {
  border-radius: 18px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.52);
  border: 1px solid rgba(255, 255, 255, 0.58);
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.leaderboard-item + .leaderboard-item {
  margin-top: 8px;
}

.leaderboard-item:hover {
  background: rgba(255, 255, 255, 0.58);
}

.leaderboard-item.top-3 {
  background: rgba(255, 224, 166, 0.34);
}

.rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.74);
}

.character-display {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.character-avatar {
  width: 58px;
  height: 58px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #ff8898 0%, #ffc27f 100%);
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
  font-size: 1.6rem;
}

.character-details h4 {
  margin: 0 0 4px;
  font-size: 1.02rem;
  color: var(--text-main);
}

.character-details .stats {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-items: center;
  font-size: 0.84rem;
  color: var(--text-muted);
}

.win-rate {
  margin-left: 7px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 0.74rem;
  color: #704118;
  background: rgba(255, 194, 125, 0.35);
}

.add-character-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 0.93rem;
  font-weight: 700;
  color: #3a2d4b;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #e4deed;
  border-radius: 10px;
  font-size: 0.96rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(255, 79, 139, 0.15);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.1;
  vertical-align: middle;
  white-space: nowrap;
  min-width: 104px;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 0.93rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.cancel-btn {
  color: #5f4f79;
  background: #ece8f4;
}

.submit-btn {
  color: #fff;
  background: linear-gradient(125deg, var(--accent), var(--accent-soft));
}

.cancel-btn:hover:not(:disabled),
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.cancel-btn:disabled,
.submit-btn:disabled,
.action-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .character-pair {
    grid-template-columns: 1fr;
  }

  .character-pair::before {
    display: none;
  }
}

@media (max-width: 640px) {
  .character-tinder-page {
    padding: 84px 14px 36px;
  }

  .matchup-panel,
  .leaderboard-panel,
  .panel-state {
    padding: 16px;
  }

  .vote-result-content {
    min-width: min(92vw, 360px);
    flex-direction: column;
    gap: 12px;
  }

  .winner-result,
  .loser-result {
    min-width: 0;
  }

  .leaderboard-item {
    align-items: flex-start;
  }

  .character-display {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .character-card,
  .vote-result-popup,
  .action-btn,
  .submit-btn,
  .cancel-btn {
    animation: none !important;
    transition: none !important;
  }
}

.dark .character-tinder-page {
  --card-bg: rgba(38, 44, 58, 0.88);
  --card-border: rgba(255, 161, 191, 0.23);
  --text-main: #f4eff9;
  --text-muted: #cbc3df;
  --accent: #ff7aac;
  --accent-soft: #ffb277;
  --success: #47d59a;
  --danger: #ff7b94;
  background:
    radial-gradient(circle at 18% 14%, rgba(255, 160, 209, 0.14) 0, transparent 32%),
    radial-gradient(circle at 88% 8%, rgba(255, 187, 141, 0.12) 0, transparent 28%),
    linear-gradient(145deg, #242836 0%, #31244b 56%, #3e2946 100%);
}

.dark .header-kicker {
  color: #ffe8f0;
  background: rgba(255, 145, 189, 0.16);
}

.dark .panel-state,
.dark .matchup-panel,
.dark .leaderboard-panel {
  box-shadow: 0 20px 32px rgba(5, 6, 13, 0.34);
}

.dark .character-card {
  background: rgba(34, 39, 52, 0.96);
  border-color: rgba(255, 146, 194, 0.2);
}

.dark .leaderboard {
  background: rgba(16, 18, 27, 0.34);
  border-color: rgba(255, 255, 255, 0.12);
}

.dark .leaderboard-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dark .rank {
  background: rgba(255, 255, 255, 0.12);
  color: #ffe4ef;
}

.dark .win-rate {
  color: #ffdcb8;
  background: rgba(255, 182, 121, 0.2);
}

.dark .vote-result-content {
  background: #202636;
  border-color: rgba(255, 146, 195, 0.3);
}

.dark .form-group label {
  color: #f2ecff;
}

.dark .form-group input {
  border-color: rgba(255, 183, 214, 0.3);
  background: rgba(25, 29, 40, 0.75);
  color: #f4eff9;
}

.dark .cancel-btn {
  color: #f4eff9;
  background: rgba(255, 255, 255, 0.14);
}
</style>
