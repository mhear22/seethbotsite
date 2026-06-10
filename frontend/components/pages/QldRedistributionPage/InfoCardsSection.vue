<script setup lang="ts">
import { useAppStore } from '../../../stores/useAppStore'
import { 
  Scale, 
  Calendar, 
  BarChart3, 
  MessageCircleWarning 
} from 'lucide-vue-next'

const store = useAppStore()
</script>

<template>
  <section class="section">
    <h2>How It Works</h2>
    <div class="info-cards">
      <div class="info-card">
        <Scale :size="32" class="info-icon-svg" />
        <h3>Independent Commission</h3>
        <p>The Queensland Redistribution Commission reviews electoral boundaries for fair representation. Its independence has been questioned after the Crisafulli Government appointed former LNP director-general John Sosso as Electoral Commissioner.</p>
        <a href="#sosso-section" class="read-more-link">Read more about the Sosso appointment controversy →</a>
      </div>
      <div class="info-card">
        <Calendar :size="32" class="info-icon-svg" />
        <h3>First Review Since 2017</h3>
        <p>This is the first comprehensive redistribution in nearly a decade, reflecting significant demographic changes across Queensland.</p>
      </div>
      <div class="info-card">
        <BarChart3 :size="32" class="info-icon-svg" />
        <h3>Seat Count: 93</h3>
        <p>Queensland maintains 93 seats, but boundaries have shifted significantly to reflect population movements from rural areas to the south-east.</p>
      </div>
      <div class="info-card">
        <MessageCircleWarning :size="32" class="info-icon-svg" />
        <h3>Public Consultation</h3>
        <p>The public consultation period is open for objections. Queenslanders can submit feedback on proposed boundary changes.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 3rem;
}

.section h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--text-primary, #333);
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.info-card {
  background: var(--card-bg, white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid var(--border-color, #e0e0e0);
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.info-icon-svg {
  width: 32px;
  height: 32px;
  margin-bottom: 1rem;
  color: var(--accent, #646cff);
}

.info-card h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: var(--text-primary, #333);
}

.info-card p {
  color: var(--text-secondary, #666);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.read-more-link {
  color: var(--accent, #646cff);
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease;
}

.read-more-link:hover {
  color: var(--accent-dark, #4a4aff);
  text-decoration: underline;
}

.dark .section h2 {
  color: var(--text-primary-light, #fff);
}

.dark .info-card {
  background: var(--card-bg-dark, #2a2a2a);
  border-color: var(--border-color-dark, #404040);
}

.dark .info-card h3 {
  color: var(--text-primary-light, #fff);
}

.dark .info-card p {
  color: var(--text-secondary-light, #ccc);
}

.dark .info-card:hover {
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .section {
    padding: 0 1rem 2rem;
  }
  
  .section h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .info-card {
    padding: 1.25rem;
  }
}
</style>