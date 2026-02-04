<script setup lang="ts">
import { ref } from 'vue'

interface FooterLink {
  title: string
  icon: string
  path: string
}

const sections = ref([
  {
    title: 'Quick Links',
    links: [
      { title: 'Home', icon: '🌸', path: '/' },
      { title: 'About', icon: 'ℹ️', path: '/about' }
    ]
  },
  {
    title: 'Fun & Games',
    links: [
      { title: 'Girl Mode', icon: '💕', path: '/girl' },
      { title: 'Gender', icon: '🔮', path: '/gender' },
      { title: 'Cats', icon: '🐱', path: '/cats' },
      { title: 'Stock Market', icon: '📈', path: '/stocks' }
    ]
  },
  {
    title: 'Community',
    links: [
      { title: 'Rankings', icon: '👻', path: '/rankings' },
      { title: 'Movie Night', icon: '🎬', path: '/movies' },
      { title: 'Tickets', icon: '🎫', path: '/tickets' }
    ]
  },
  {
    title: 'Tools',
    links: [
      { title: 'Countdowns', icon: '⏰', path: '/countdowns' }
    ]
  }
])
</script>

<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-sections">
        <div v-for="section in sections" :key="section.title" class="footer-section">
          <h3 class="section-title">{{ section.title }}</h3>
          <ul class="footer-links">
            <li v-for="link in section.links" :key="link.path">
              <RouterLink :to="link.path" class="footer-link">
                <span class="link-icon">{{ link.icon }}</span>
                {{ link.title }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-brand">
        <div class="brand-logo">
          <span class="brand-icon">🌸</span>
          <span class="brand-text">Mold</span>
        </div>
        <p class="brand-tagline">Your favorite interactive website ✨</p>
        <div class="social-links">
          <span class="social-link">💕 Made with love</span>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="copyright">© {{ new Date().getFullYear() }} Mold. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: rgba(255, 255, 255, 0.95);
  border-top: 2px solid rgba(255, 182, 193, 0.2);
  padding: 40px 0 20px;
  margin-top: 60px;
  backdrop-filter: blur(10px);
}

.dark .app-footer {
  background: rgba(40, 44, 52, 0.95);
  border-top-color: rgba(255, 182, 193, 0.15);
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
}

.footer-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 30px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #ff91a4;
  margin: 0;
  font-family: 'Quicksand', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 6px 8px;
  border-radius: 6px;
  font-family: 'Quicksand', sans-serif;
}

.dark .footer-link {
  color: #aaa;
}

.footer-link:hover {
  background: rgba(255, 182, 193, 0.15);
  color: #ff91a4;
  transform: translateX(4px);
}

.dark .footer-link:hover {
  background: rgba(255, 182, 193, 0.1);
  color: #ffb6c1;
}

.link-icon {
  font-size: 16px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  background: rgba(255, 182, 193, 0.1);
  border-radius: 20px;
}

.dark .footer-brand {
  background: rgba(255, 182, 193, 0.05);
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Quicksand', sans-serif;
  font-weight: bold;
  font-size: 24px;
  color: #ff91a4;
  margin-bottom: 10px;
}

.brand-icon {
  font-size: 28px;
}

.brand-text {
  letter-spacing: 0.5px;
}

.brand-tagline {
  font-size: 14px;
  color: #666;
  margin: 0 0 15px 0;
  font-family: 'Quicksand', sans-serif;
}

.dark .brand-tagline {
  color: #aaa;
}

.social-links {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.social-link {
  font-size: 18px;
  transition: transform 0.2s ease;
  cursor: default;
}

.social-link:hover {
  transform: scale(1.2);
}

.footer-bottom {
  max-width: 1400px;
  margin: 30px auto 0;
  padding: 20px 2rem 0;
  border-top: 1px solid rgba(255, 182, 193, 0.2);
  text-align: center;
}

.dark .footer-bottom {
  border-top-color: rgba(255, 182, 193, 0.1);
}

.copyright {
  font-size: 13px;
  color: #888;
  margin: 0;
  font-family: 'Quicksand', sans-serif;
}

.dark .copyright {
  color: #777;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .app-footer {
    padding: 30px 0 15px;
    margin-top: 40px;
  }

  .footer-container {
    grid-template-columns: 1fr;
    padding: 0 1rem;
    gap: 30px;
  }

  .footer-sections {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .section-title {
    font-size: 14px;
  }

  .footer-link {
    font-size: 13px;
    padding: 5px 6px;
  }

  .brand-logo {
    font-size: 20px;
  }

  .brand-icon {
    font-size: 24px;
  }

  .brand-tagline {
    font-size: 13px;
  }

  .footer-bottom {
    margin: 20px auto 0;
    padding: 15px 1rem 0;
  }

  .copyright {
    font-size: 12px;
  }
}
</style>