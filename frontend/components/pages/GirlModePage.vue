<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const darkMode = inject('darkMode')

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="girl-mode-container">
    <div class="girl-mode-content">
      <div class="girl-emoji">💕</div>
      <h1>Girl Mode Activated!</h1>
      <p>Welcome to the girl mode experience! 🌸</p>
      <p>This is a special space just for you.</p>
      <div class="girl-features">
        <div class="girl-feature">
          <div class="feature-icon">🎀</div>
          <div class="feature-text">Sparkly Everything</div>
        </div>
        <div class="girl-feature">
          <div class="feature-icon">💖</div>
          <div class="feature-text">Cute Vibes</div>
        </div>
        <div class="girl-feature">
          <div class="feature-icon">🌸</div>
          <div class="feature-text">Flower Power</div>
        </div>
        <div class="girl-feature">
          <div class="feature-icon">🎀</div>
          <div class="feature-text">Rainbow Mode</div>
        </div>
      </div>
      <div class="girl-message">
        <p>You are valid and loved exactly as you are! ✨</p>
        <p>This is your safe space to be yourself.</p>
      </div>
      <button class="cute-btn girl-back-btn" @click="goBack">💕 Go Back</button>
    </div>
  </div>
</template>

<style scoped>
.girl-mode-container {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff5f7 0%, #ffe4ec 50%, #ffd6e7 100%);
  position: relative;
  overflow: hidden;
}

.dark .girl-mode-container {
  background: linear-gradient(135deg, #2d1f2f 0%, #1a1218 50%, #2a1a24 100%);
}

/* Animated floating particles */
.girl-mode-container::before,
.girl-mode-container::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 105, 180, 0.15) 0%, transparent 70%);
  animation: float 8s ease-in-out infinite;
}

.girl-mode-container::before {
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.girl-mode-container::after {
  bottom: -100px;
  right: -100px;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, 30px) scale(1.1);
  }
}

.girl-mode-content {
  text-align: center;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 60px rgba(255, 105, 180, 0.2), 0 0 0 1px rgba(255, 105, 180, 0.1);
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.6s ease;
}

.dark .girl-mode-content {
  background: rgba(45, 31, 47, 0.9);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 105, 180, 0.2);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.girl-emoji {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #e91e8c;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ff69b4 0%, #e91e8c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark h1 {
  background: linear-gradient(135deg, #ffb6c1 0%, #ff69b4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 0.75rem;
}

.dark p {
  color: #ccc;
}

.girl-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 2rem 0;
}

.girl-feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 105, 180, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.dark .girl-feature {
  background: rgba(255, 105, 180, 0.15);
}

.girl-feature:hover {
  transform: translateY(-2px);
  background: rgba(255, 105, 180, 0.2);
  box-shadow: 0 8px 20px rgba(255, 105, 180, 0.15);
}

.dark .girl-feature:hover {
  background: rgba(255, 105, 180, 0.25);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.feature-icon {
  font-size: 1.8rem;
}

.feature-text {
  font-weight: 600;
  color: #e91e8c;
}

.dark .feature-text {
  color: #ffb6c1;
}

.girl-message {
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(255, 105, 180, 0.2) 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 2px dashed rgba(255, 105, 180, 0.3);
}

.dark .girl-message {
  background: linear-gradient(135deg, rgba(255, 105, 180, 0.2) 0%, rgba(255, 82, 157, 0.15) 100%);
  border-color: rgba(255, 105, 180, 0.4);
}

.girl-message p {
  margin-bottom: 0.5rem;
}

.girl-message p:last-child {
  margin-bottom: 0;
}

.cute-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #ff69b4 0%, #e91e8c 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
}

.cute-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 105, 180, 0.4);
}

.cute-btn:active {
  transform: translateY(0);
}

.dark .cute-btn {
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
}

/* Responsive Design */
@media (max-width: 640px) {
  .girl-mode-container {
    padding: 1rem;
  }

  .girl-mode-content {
    padding: 2rem 1.5rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .girl-emoji {
    font-size: 3rem;
  }

  .girl-features {
    grid-template-columns: 1fr;
  }

  .feature-icon {
    font-size: 1.5rem;
  }

  .feature-text {
    font-size: 0.95rem;
  }

  p {
    font-size: 1rem;
  }

  .cute-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .girl-mode-container::before,
  .girl-mode-container::after,
  .girl-emoji,
  .girl-mode-content {
    animation: none;
  }

  .girl-feature:hover,
  .cute-btn:hover {
    transform: none;
  }
}
</style>
