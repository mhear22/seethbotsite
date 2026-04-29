<script setup lang="ts">
import { useAppStore } from '../../stores/useAppStore'

const store = useAppStore()
</script>

<template>
  <div class="page about-page" :class="{ dark: store.darkMode }">
    <h1>About ✨</h1>
    <p class="subtitle">Welcome to Mika's playful corner of the internet!</p>

    <div class="about-sections">
      <section class="about-section">
        <h2>🎮 Features</h2>
        <ul class="feature-list">
          <li><strong>🧪 Mold Meter</strong> - Interactive tachometer that reacts to the "fart" button with random values and audio feedback</li>
          <li><strong>🏆 Coolness Rankings</strong> - Real-time leaderboard that refreshes every 30 seconds</li>
          <li><strong>🐱 Random Cats</strong> - Fetch random cat images with a built-in toy synth game</li>
          <li><strong>📈 Stock Market Game</strong> - Buy and sell virtual stocks with database persistence</li>
          <li><strong>🎬 Movie Night</strong> - Suggest movies, vote for favourites, and see results</li>
          <li><strong>🌙 Dark Mode</strong> - Toggle between light and dark themes with smooth transitions</li>
          <li><strong>🎵 Audio System</strong> - Interactive sound effects and background music</li>
        </ul>
      </section>

      <section class="about-section">
        <h2>🛠️ Tech Stack</h2>
        <div class="tech-grid">
          <div class="tech-item">
            <span class="tech-icon">⚡</span>
            <div>
              <strong>Vue 3</strong>
              <p>Composition API with TypeScript</p>
            </div>
          </div>
          <div class="tech-item">
            <span class="tech-icon">🔨</span>
            <div>
              <strong>Vite</strong>
              <p>Fast build system & dev server</p>
            </div>
          </div>
          <div class="tech-item">
            <span class="tech-icon">📦</span>
            <div>
              <strong>Pinia</strong>
              <p>State management</p>
            </div>
          </div>
          <div class="tech-item">
            <span class="tech-icon">🧭</span>
            <div>
              <strong>Vue Router</strong>
              <p>Multi-page routing</p>
            </div>
          </div>
          <div class="tech-item">
            <span class="tech-icon">🐳</span>
            <div>
              <strong>Docker</strong>
              <p>Containerized deployment</p>
            </div>
          </div>
          <div class="tech-item">
            <span class="tech-icon">🔧</span>
            <div>
              <strong>Node.js + Express</strong>
              <p>Backend API server</p>
            </div>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>🎨 Design Philosophy</h2>
        <p>This site is built for fun and experimentation. It features playful animations, interactive elements, and a vibrant color scheme that adapts to dark mode. The design emphasizes user interaction and small delightful moments.</p>
        <p class="highlight">Current theme: {{ store.darkMode ? '🌙 Dark Mode' : '☀️ Light Mode' }}</p>
      </section>

      <section class="about-section">
        <h2>📊 Stats</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">185+</div>
            <div class="stat-label">API Endpoints</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">40+</div>
            <div class="stat-label">Interactive Pages</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">Type-Safe</div>
            <div class="stat-label">Full TypeScript</div>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>🔗 Links</h2>
        <div class="links-grid">
          <a href="https://github.com/mhear22/seethbotsite" target="_blank" class="link-card">
            <span class="link-icon">🐙</span>
            <span>Source Code</span>
          </a>
          <a href="https://mald.mikahear.es" target="_blank" class="link-card">
            <span class="link-icon">🌐</span>
            <span>Live Site</span>
          </a>
        </div>
      </section>
    </div>

    <footer class="about-footer">
      <p>Made with 💖 by Mika | {{ store.darkMode ? 'Dark' : 'Light' }} mode enabled</p>
    </footer>
  </div>
</template>

<style scoped>
/* CSS Variables for theme colors */
:root {
  --card-bg: rgba(255, 255, 255, 0.95);
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --hover-bg: #f7fafc;
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}

.about-page.dark {
  --card-bg: #2d3748;
  --text-primary: #ffffff;
  --text-secondary: #f1f5f9;
  --hover-bg: #4a5568;
}

.about-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
}

.about-page.dark {
  background: linear-gradient(135deg, #0d1219 0%, #1a202c 100%);
}

h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
}

.about-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.about-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.about-section h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.feature-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-list li {
  padding: 1rem;
  background: var(--hover-bg);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
  color: var(--text-primary);
  transition: transform 0.2s ease;
}

.feature-list li:hover {
  transform: translateX(5px);
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--hover-bg);
  border-radius: 8px;
  color: var(--text-primary);
  transition: transform 0.2s ease;
}

.tech-item:hover {
  transform: translateY(-3px);
}

.tech-icon {
  font-size: 2rem;
}

.tech-item strong {
  display: block;
  font-size: 1.1rem;
}

.tech-item p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.highlight {
  padding: 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: 12px;
  color: white;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--hover-bg);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.link-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.link-icon {
  font-size: 2rem;
}

.about-footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .about-page {
    padding: 20px 15px;
  }

  h1 {
    font-size: 2rem;
  }

  .about-section {
    padding: 1.5rem;
  }

  .tech-grid,
  .stats-grid,
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
