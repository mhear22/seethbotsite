<script setup lang="ts">
// Hero section component for Queensland Redistribution page
</script>

<template>
  <section class="hero">
    <h1>Queensland Electoral Redistribution 2026</h1>
    <p class="hero-subtitle">The first comprehensive boundary review since 2017 raises questions about fairness and representation</p>
  </section>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 3rem 2rem 2rem;
  background: linear-gradient(135deg, var(--accent, #646cff) 0%, var(--accent-secondary, #8b5cf6) 100%);
  color: white;
  margin-bottom: 3rem;
  border-radius: 12px;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero {
    padding: 2rem 1.5rem 1.5rem;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>