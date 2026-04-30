<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const goHome = () => router.push('/')
const goBack = () => router.back()
</script>

<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Page Not Found</h2>
      <p class="error-message">
        The page <code>{{ route.path }}</code> doesn't exist.
      </p>
      <div class="actions">
        <button class="btn-primary" @click="goHome">Go Home</button>
        <button class="btn-secondary" @click="goBack">Go Back</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 6rem;
  font-weight: 800;
  opacity: 0.3;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 1.5rem;
  margin: 0.5rem 0;
}

.error-message {
  opacity: 0.7;
  margin-bottom: 2rem;
}

.error-message code {
  background: rgba(128, 128, 128, 0.2);
  padding: 0.2em 0.5em;
  border-radius: 4px;
  font-size: 0.9em;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.btn-primary {
  background: var(--accent, #646cff);
  color: white;
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(128, 128, 128, 0.3);
  color: inherit;
}
</style>
