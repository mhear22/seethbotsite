<script setup lang="ts">
import TicketsPage from '@frontend/components/pages/TicketsPage.vue'
</script>

<template>
  <main class="tickets-app-shell">
    <header class="tickets-app-header">
      <a href="/" class="home-link">← Home</a>
      <h1>Tickets</h1>
    </header>
    <TicketsPage />
  </main>
</template>

<style scoped>
.tickets-app-shell {
  min-height: 100vh;
}

.tickets-app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: color-mix(in srgb, var(--bg-primary) 90%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--text-primary) 15%, transparent);
  backdrop-filter: blur(8px);
}

.tickets-app-header h1 {
  margin: 0;
  font-size: 1rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.home-link {
  color: inherit;
  text-decoration: none;
  font-size: 0.9rem;
}

.home-link:hover {
  text-decoration: underline;
}
</style>
