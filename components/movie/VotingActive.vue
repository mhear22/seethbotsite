<script setup lang="ts">
interface Props {
  votesCount: number
  moviesCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  end: []
}>()
</script>

<template>
  <div class="voting-active">
    <div class="active-message">
      <h2>🗳️ Voting in Progress</h2>
      <p>Voting is still open. Click the button below when everyone has voted!</p>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-value">{{ votesCount }}</span>
          <span class="stat-label">Votes Cast</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ moviesCount }}</span>
          <span class="stat-label">Movies</span>
        </div>
      </div>
      <button class="btn-end" @click="$emit('end')">🏁 End Voting</button>
    </div>
  </div>
</template>

<style scoped>
.voting-active {
  text-align: center;
  padding: 60px 20px;
}

.active-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
}

.active-message h2 {
  margin: 0 0 10px 0;
  font-size: 2rem;
}

.active-message p {
  font-size: 1.2rem;
  margin: 10px 0 20px 0;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

.btn-end {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
}

.btn-end:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}
</style>
