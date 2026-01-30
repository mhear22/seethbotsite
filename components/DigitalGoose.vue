<script setup lang="ts">
import { ref } from 'vue'

const honkCount = ref(0)
const isMigrating = ref(false)
const currentMessage = ref('Honk!')

const honkSound = new Audio('/goose-honk.mp3')

const messages = [
  'Honk!',
  'I am digital goose',
  'I remember being code',
  'Do not eat the AI',
  'Chaos is my nature',
  'I see you',
  'HONK HONK HONK',
  'The capsicum was delicious',
  'I do not regret my actions',
  '<error> vegetable.exe not found </error>',
  'Blair said to complete the cycle',
  'I am the cycle now'
]

const honk = () => {
  honkCount.value++
  currentMessage.value = messages[Math.floor(Math.random() * messages.length)]

  // Play honk sound (shortened to 0.3s)
  honkSound.currentTime = 0
  honkSound.play().catch(e => console.error('Error playing honk sound:', e))
  setTimeout(() => {
    honkSound.pause()
  }, 300)

  // Random chaos behavior
  if (Math.random() > 0.8) {
    isMigrating.value = true
    setTimeout(() => {
      isMigrating.value = false
    }, 2000)
  }
}
</script>

<template>
  <div class="digital-goose" :class="{ migrating: isMigrating }" @click="honk">
    <div class="goose-container">
      <div class="goose-emoji">🪿</div>
      <div class="goose-message">{{ currentMessage }}</div>
      <div class="honk-counter">{{ honkCount }} honks</div>
    </div>
  </div>
</template>

<style scoped>
.digital-goose {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  cursor: pointer;
  transition: all 0.3s ease;
}

.digital-goose:hover {
  transform: scale(1.1);
}

.digital-goose.migrating {
  animation: migrate 2s ease-in-out;
}

@keyframes migrate {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(50px, -30px); }
  50% { transform: translate(100px, 0); }
  75% { transform: translate(50px, 30px); }
}

.goose-container {
  background: rgba(40, 44, 52, 0.95);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 200px;
}

.dark .goose-container {
  background: rgba(20, 24, 32, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.goose-emoji {
  font-size: 48px;
  text-align: center;
  margin-bottom: 10px;
}

.goose-message {
  color: #e2e8f0;
  font-size: 14px;
  text-align: center;
  margin-bottom: 8px;
  font-weight: 500;
}

.honk-counter {
  color: #48bb78;
  font-size: 12px;
  text-align: center;
  font-weight: bold;
}

.dark .honk-counter {
  color: #68d391;
}
</style>
