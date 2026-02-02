<script setup lang="ts">
interface Movie {
  id: string
  title: string
}

interface Props {
  rankings: string[]
  movies: Movie[]
}

const props = defineProps<Props>()

const getMovieById = (id: string) => {
  return props.movies.find(m => m.id === id)
}
</script>

<template>
  <div class="has-voted">
    <div class="voted-message">
      <h3>✅ You've voted!</h3>
      <p>Your ranking:</p>
      <ol class="my-ranking">
        <li v-for="(movieId, index) in rankings" :key="movieId">
          <span class="rank-number">{{ index + 1 }}</span>
          {{ getMovieById(movieId)?.title || 'Unknown' }}
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.has-voted {
  background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}

.voted-message h3 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
}

.voted-message p {
  margin: 10px 0;
  color: #333;
}

.my-ranking {
  text-align: left;
  max-width: 600px;
  margin: 20px auto 0;
  padding-left: 20px;
}

.my-ranking li {
  padding: 8px 0;
  font-size: 1.1rem;
}

.rank-number {
  display: inline-block;
  background: rgba(255, 255, 255, 0.8);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  text-align: center;
  line-height: 28px;
  margin-right: 10px;
  font-weight: bold;
}
</style>
