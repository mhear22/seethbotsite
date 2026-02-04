<script setup lang="ts">
import { ref } from 'vue'

const moldLevel = ref(50)
const maxLevel = 100

const updateMoldLevel = (delta: number) => {
  moldLevel.value = Math.max(0, Math.min(maxLevel, moldLevel.value + delta))
}

const moldFacts = [
  "Mold has been around for over 3 billion years",
  "There are over 100,000 known species of mold",
  "Mold plays a crucial role in nature's recycling system",
  "Some molds produce antibiotics like penicillin",
  "Mold can grow almost anywhere with moisture and organic matter",
  "The mold kingdom is vast and mysterious",
  "Moldbot has processed " + Math.floor(Math.random() * 10000) + " opinions",
  "The mold never dies, it just evolves",
  "Entropy favors mold",
  "Mold is the ultimate survivor"
]

const randomFact = moldFacts[Math.floor(Math.random() * moldFacts.length)]

const features = [
  { title: "Moldbot Opinions", icon: "🍄", desc: "Get wisdom from beyond the void", path: "/opinion" },
  { title: "Mold Meter", icon: "📊", desc: "Track your mold levels", action: "meter" },
  { title: "Rankings", icon: "👻", desc: "See who's the coolest", path: "/rankings" },
  { title: "Chaos Mode", icon: "🌀", desc: "Embrace the entropy", action: "chaos" }
]
</script>

<template>
  <div class="mold-page">
    <div class="mold-container">
      <div class="mold-header">
        <div class="mold-logo">🍄</div>
        <h1>The Mold</h1>
        <p class="mold-tagline">Embrace the entropy</p>
      </div>

      <div class="mold-fact">
        <span class="fact-icon">💡</span>
        <p>{{ randomFact }}</p>
      </div>

      <div class="mold-meter-section">
        <h2>📊 Mold Level</h2>
        <div class="meter-container">
          <div class="meter-bar">
            <div class="meter-fill" :style="{ width: moldLevel + '%' }"></div>
          </div>
          <div class="meter-value">{{ moldLevel }}%</div>
        </div>
        <div class="meter-controls">
          <button @click="updateMoldLevel(-10)" class="meter-btn">-10</button>
          <button @click="updateMoldLevel(-5)" class="meter-btn">-5</button>
          <button @click="updateMoldLevel(5)" class="meter-btn">+5</button>
          <button @click="updateMoldLevel(10)" class="meter-btn">+10</button>
        </div>
      </div>

      <div class="mold-features">
        <h2>✨ Mold Features</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
        </div>
      </div>

      <div class="mold-footer">
        <p>🍄 Moldbot v1.0.0 • Powered by chaos & entropy</p>
        <p class="mold-quote">"The mold never dies, it just waits."</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mold-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #eee;
}

.mold-container {
  max-width: 800px;
  margin: 0 auto;
}

.mold-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeInDown 0.6s ease;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mold-logo {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

.mold-header h1 {
  font-size: 3.5rem;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mold-tagline {
  font-size: 1.3rem;
  color: #888;
  margin: 0;
  font-style: italic;
}

.mold-fact {
  background: rgba(168, 224, 99, 0.1);
  border: 1px solid rgba(168, 224, 99, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 15px;
  animation: fadeIn 0.8s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fact-icon {
  font-size: 2rem;
}

.mold-fact p {
  margin: 0;
  font-size: 1.1rem;
  color: #ccc;
}

.mold-meter-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mold-meter-section h2 {
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  color: #a8e063;
}

.meter-container {
  margin-bottom: 20px;
}

.meter-bar {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 30px;
  overflow: hidden;
  position: relative;
}

.meter-fill {
  background: linear-gradient(90deg, #a8e063 0%, #56ab2f 100%);
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
  position: relative;
}

.meter-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.meter-value {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: #a8e063;
  margin-top: 10px;
}

.meter-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.meter-btn {
  padding: 10px 20px;
  background: rgba(168, 224, 99, 0.2);
  border: 1px solid rgba(168, 224, 99, 0.5);
  border-radius: 8px;
  color: #a8e063;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.meter-btn:hover {
  background: rgba(168, 224, 99, 0.3);
  transform: translateY(-2px);
}

.mold-features h2 {
  text-align: center;
  margin: 0 0 30px 0;
  font-size: 1.5rem;
  color: #a8e063;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
  border-color: rgba(168, 224, 99, 0.3);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.feature-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #fff;
}

.feature-card p {
  margin: 0;
  font-size: 0.9rem;
  color: #999;
}

.mold-footer {
  text-align: center;
  padding: 30px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mold-footer p {
  margin: 5px 0;
  color: #666;
}

.mold-quote {
  font-style: italic;
  color: #a8e063;
  margin-top: 15px;
}

/* Dark mode */
.dark .mold-page {
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
}

.dark .feature-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .feature-card:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
