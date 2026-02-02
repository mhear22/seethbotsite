<script setup lang="ts">
interface Movie {
  id: string
  title: string
  suggestedBy: string
  year?: string
  genre?: string
}

interface Props {
  winner: Movie | null
}

const props = defineProps<Props>()
</script>

<template>
  <div v-if="winner" class="winner-section">
    <div class="winner-card">
      <div class="winner-badge">🏆 WINNER</div>
      <h3 class="winner-title">{{ winner.title }}</h3>
      <p class="winner-meta">
        <span v-if="winner.year">{{ winner.year }}</span>
        <span v-if="winner.genre">• {{ winner.genre }}</span>
      </p>
      <p class="winner-suggested">Suggested by {{ winner.suggestedBy }}</p>
    </div>
  </div>
</template>

<style scoped>
.winner-section {
  margin-bottom: 30px;
}

.winner-card {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
}

.winner-badge {
  background: white;
  color: #d97706;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 15px;
}

.winner-title {
  font-size: 2rem;
  margin: 0 0 10px 0;
  color: #1f2937;
}

.winner-meta {
  color: #4b5563;
  font-size: 1.1rem;
  margin: 5px 0;
}

.winner-suggested {
  color: #6b7280;
  font-style: italic;
  margin: 10px 0 0 0;
}
</style>
