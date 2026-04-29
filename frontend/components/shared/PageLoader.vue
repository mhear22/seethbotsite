<template>
  <div class="page-loader" :class="{ 'full-page': fullPage }">
    <div class="loader-content">
      <div class="spinner" :style="{ width: size + 'px', height: size + 'px' }">
        <div class="spinner-ring"></div>
      </div>
      <p v-if="message" class="loader-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
  fullPage?: boolean
  size?: number
}>()
</script>

<style scoped>
.page-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.page-loader.full-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 9999;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  position: relative;
  border-radius: 50%;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loader-message {
  color: #a5b4fc;
  font-size: 0.9rem;
  margin: 0;
  text-align: center;
}

/* Skeleton loader styles for content-heavy pages */
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.1) 0%,
    rgba(99, 102, 241, 0.2) 50%,
    rgba(99, 102, 241, 0.1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
