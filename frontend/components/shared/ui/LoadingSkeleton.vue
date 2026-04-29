<script setup lang="ts">
/**
 * Standardized loading skeleton component
 * Provides consistent loading visuals across the app
 */
interface Props {
  variant?: 'text' | 'card' | 'avatar' | 'image' | 'list'
  count?: number
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  count: 1,
  animated: true
})
</script>

<template>
  <div class="loading-skeleton-wrapper" :class="{ 'animated': animated }">
    <div
      v-for="i in count"
      :key="i"
      class="loading-skeleton"
      :class="`skeleton-${variant}`"
      role="status"
      :aria-label="`Loading ${variant}`"
    >
      <span class="sr-only">Loading...</span>
    </div>
  </div>
</template>

<style scoped>
.loading-skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading-skeleton {
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Animation for skeletons */
.loading-skeleton-wrapper.animated .loading-skeleton {
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Variant styles */
.skeleton-text {
  height: 1rem;
  width: 100%;
}

.skeleton-text:last-child {
  width: 80%;
}

.skeleton-card {
  height: 200px;
  width: 100%;
  border-radius: 8px;
}

.skeleton-avatar {
  height: 48px;
  width: 48px;
  border-radius: 50%;
}

.skeleton-image {
  height: 300px;
  width: 100%;
  border-radius: 8px;
}

.skeleton-list {
  height: 60px;
  width: 100%;
  border-radius: 8px;
}

/* Dark mode support */
:global(.dark) .loading-skeleton {
  background: linear-gradient(
    90deg,
    #2a2a2a 25%,
    #3a3a3a 50%,
    #2a2a2a 75%
  );
  background-size: 200% 100%;
}
</style>
