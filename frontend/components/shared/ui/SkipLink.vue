<script setup lang="ts">
// Skip link allows keyboard users to jump directly to main content
// This is important for accessibility
</script>

<template>
  <a
    href="#main-content"
    class="skip-link"
  >
    Skip to main content
  </a>
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #ff6b9d;
  color: white;
  padding: 8px 16px;
  z-index: 10000;
  transition: top 0.3s ease;
  text-decoration: none;
  font-weight: bold;
  font-family: 'Quicksand', sans-serif;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
  outline: 2px solid #ff91a4;
  outline-offset: 2px;
}

.dark .skip-link {
  background: #ff8a80;
}

.darker .skip-link {
  background: #ff91a4;
}

.chaos .skip-link {
  background: #ff0080;
  animation: chaosPulse 1s ease-in-out infinite;
}
</style>
