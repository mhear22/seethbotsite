<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

interface TickerItem {
  title: string
  subtitle: string
  icon: string
  path: string
}

const tickerItems = ref<TickerItem[]>([
  { title: 'Home', subtitle: 'Your personal dashboard', icon: '🌸', path: '/' },
  { title: 'Movies', subtitle: 'Movie night voting and suggestions', icon: '🎬', path: '/movies' },
  { title: 'Rankings', subtitle: 'See who tops the leaderboards', icon: '👻', path: '/rankings' },
  { title: 'Messages', subtitle: 'Community chat and discussions', icon: '💬', path: '/messages' },
  { title: 'Tickets', subtitle: 'Feature requests and bug tracking', icon: '🎫', path: '/tickets' },
  { title: 'Stocks', subtitle: 'Virtual stock market trading', icon: '📈', path: '/stocks' },
  { title: 'Idle Clicker', subtitle: 'Click to earn points and upgrades', icon: '🖱️', path: '/clicker' },
  { title: 'Fishing', subtitle: 'Cast your line and catch rewards', icon: '🎣', path: '/fishing' },
  { title: 'Stats', subtitle: 'Track your progress and achievements', icon: '📊', path: '/stats' },
  { title: 'Character Tinder', subtitle: 'Swipe left or right on characters', icon: '🎭', path: '/character-tinder' },
  { title: 'Girl Mode', subtitle: 'Pink aesthetics and vibes', icon: '💕', path: '/girl' },
  { title: 'Phrenology', subtitle: 'Analyze head shapes for fun', icon: '🧠', path: '/gender' },
  { title: 'Cats', subtitle: 'Adorable cats to brighten your day', icon: '🐱', path: '/cats' },
  { title: 'Keanu', subtitle: 'Everything Keanu Reeves related', icon: '🥋', path: '/keanu' },
  { title: 'Shop', subtitle: 'Spend your points on cool items', icon: '🛍️', path: '/shop' },
  { title: 'Music', subtitle: 'Listen to your favorite tunes', icon: '🎵', path: '/music' },
  { title: 'Clocks', subtitle: 'World time zones at a glance', icon: '🌍', path: '/clocks' },
  { title: 'Countdowns', subtitle: 'Track upcoming events and dates', icon: '⏰', path: '/countdowns' },
  { title: 'Favorites', subtitle: 'Your saved items and links', icon: '⭐', path: '/favorites' },
  { title: 'Patch Notes', subtitle: 'Latest updates and changes', icon: '📝', path: '/patch-notes' },
  { title: 'About', subtitle: 'Learn more about this platform', icon: 'ℹ️', path: '/about' },
  { title: 'Settings', subtitle: 'Customize your experience', icon: '⚙️', path: '/settings' },
  { title: 'API Docs', subtitle: 'Explore the API documentation', icon: '📚', path: '/api-docs' },
  { title: 'Account', subtitle: 'Manage your profile and auth', icon: '🔐', path: '/auth' },
  { title: 'Mold', subtitle: 'Track mold levels and growth', icon: '🍄', path: '/mold' },
  { title: 'Moldbot Opinions', subtitle: 'AI-generated thoughts and opinions', icon: '🤖', path: '/opinion' },
  { title: 'Analytics', subtitle: 'View platform statistics', icon: '📊', path: '/analytics' }
])

const scrollPosition = ref(0)
const scrollSpeed = 0.5 // pixels per frame
let animationFrameId: number | null = null

const animate = () => {
  scrollPosition.value -= scrollSpeed

  // Reset position when we've scrolled through all items
  const itemWidth = 300 // estimated width of each ticker item
  const totalWidth = itemWidth * tickerItems.value.length
  if (Math.abs(scrollPosition.value) >= totalWidth) {
    scrollPosition.value = 0
  }

  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  animationFrameId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div class="page-ticker">
    <div class="ticker-track" :style="{ transform: `translateX(${scrollPosition}px)` }">
      <!-- Display items twice for seamless looping -->
      <RouterLink
        v-for="(item, index) in [...tickerItems, ...tickerItems]"
        :key="`${item.path}-${index}`"
        :to="item.path"
        class="ticker-item"
      >
        <span class="ticker-icon">{{ item.icon }}</span>
        <div class="ticker-content">
          <span class="ticker-title">{{ item.title }}</span>
          <span class="ticker-subtitle">{{ item.subtitle }}</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.page-ticker {
  width: 100%;
  overflow: hidden;
  background: linear-gradient(90deg, rgba(255, 182, 193, 0.1), rgba(255, 218, 185, 0.1), rgba(255, 182, 193, 0.1));
  border-bottom: 1px solid rgba(255, 182, 193, 0.2);
  padding: 8px 0;
  position: relative;
}

.dark .page-ticker {
  background: linear-gradient(90deg, rgba(100, 100, 100, 0.1), rgba(120, 120, 120, 0.1), rgba(100, 100, 100, 0.1));
  border-bottom-color: rgba(255, 182, 193, 0.1);
}

.ticker-track {
  display: flex;
  white-space: nowrap;
  will-change: transform;
}

.ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  text-decoration: none;
  color: #666;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 0 4px;
}

.dark .ticker-item {
  color: #aaa;
}

.ticker-item:hover {
  background: rgba(255, 182, 193, 0.2);
  color: #ff91a4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark .ticker-item:hover {
  background: rgba(255, 182, 193, 0.15);
  color: #ffb6c1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ticker-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.ticker-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ticker-title {
  font-weight: 700;
  font-size: 14px;
  color: inherit;
}

.ticker-subtitle {
  font-size: 11px;
  opacity: 0.8;
  font-weight: 400;
}

/* Add a gradient fade at the edges for smooth appearance */
.page-ticker::before,
.page-ticker::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  z-index: 1;
  pointer-events: none;
}

.page-ticker::before {
  left: 0;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.9), transparent);
}

.dark .page-ticker::before {
  background: linear-gradient(to right, rgba(20, 20, 20, 0.9), transparent);
}

.page-ticker::after {
  right: 0;
  background: linear-gradient(to left, rgba(255, 255, 255, 0.9), transparent);
}

.dark .page-ticker::after {
  background: linear-gradient(to left, rgba(20, 20, 20, 0.9), transparent);
}

/* Pause animation on hover */
.page-ticker:hover .ticker-track {
  animation-play-state: paused;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .ticker-item {
    padding: 6px 12px;
    margin: 0 2px;
  }

  .ticker-icon {
    font-size: 1.2rem;
  }

  .ticker-title {
    font-size: 12px;
  }

  .ticker-subtitle {
    font-size: 10px;
  }

  .page-ticker::before,
  .page-ticker::after {
    width: 40px;
  }
}
</style>
