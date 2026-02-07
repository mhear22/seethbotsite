<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import QuoteSection from '../shared/ui/QuoteSection.vue'
import { useAppStore } from '../../stores/useAppStore'

const appStore = useAppStore()

// Latest patch note
interface PatchNote {
  id: string
  version: string
  buildNumber: number
  buildTime: string
  title: string
  changes: {
    type: 'added' | 'improved' | 'fixed' | 'removed'
    description: string
  }[]
  createdAt: string
}

const latestPatchNote = ref<PatchNote | null>(null)
const patchNoteLoading = ref(true)

const loadLatestPatchNote = async () => {
  try {
    const response = await fetch('/api/patch-notes/latest')
    if (response.ok) {
      latestPatchNote.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load latest patch note:', error)
  } finally {
    patchNoteLoading.value = false
  }
}

const formatBuildTime = (timeString: string) => {
  const date = new Date(timeString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }
}

const getChangeIcon = (type: string) => {
  const icons: Record<string, string> = {
    added: '✨',
    improved: '🚀',
    fixed: '🔧',
    removed: '🗑️'
  }
  return icons[type] || '•'
}

onMounted(() => {
  loadLatestPatchNote()
})

// Feature categories for the home page
const featureCategories = [
  {
    title: 'Fun & Games',
    icon: '🎮',
    description: 'Enjoy interactive features and entertainment',
    features: [
      { name: 'Girl Mode', icon: '💕', path: '/girl' },
      { name: 'Gender', icon: '🔮', path: '/gender' },
      { name: 'Cats', icon: '🐱', path: '/cats' },
      { name: 'Stock Market', icon: '📈', path: '/stocks' },
      { name: 'Music', icon: '🎵', path: '/music' }
    ]
  },
  {
    title: 'Community',
    icon: '👥',
    description: 'Connect with rankings and events',
    features: [
      { name: 'Rankings', icon: '👻', path: '/rankings' },
      { name: 'Stats', icon: '📊', path: '/stats' },
      { name: 'Movie Night', icon: '🎬', path: '/movies' },
      { name: 'Tickets', icon: '🎫', path: '/tickets' }
    ]
  },
  {
    title: 'Tools',
    icon: '🛠️',
    description: 'Useful utilities and information',
    features: [
      { name: 'Clocks', icon: '🌍', path: '/clocks' },
      { name: 'Countdowns', icon: '⏰', path: '/countdowns' },
      { name: 'About', icon: 'ℹ️', path: '/about' },
      { name: 'Archive', icon: '📜', path: '/archive' },
      { name: 'API Docs', icon: '📚', path: '/api-docs' },
      { name: 'Solar Calculator', icon: '☀️', path: '/solar' }
    ]
  }
]
</script>

<template>
  <div class="page home-page">
    <!-- Welcome Section -->
    <section class="welcome-section">
      <h1 class="welcome-title">Welcome to Mold! 🌸</h1>
      <p class="welcome-subtitle">
        Your one-stop destination for fun, games, community rankings, and useful tools.
        Explore the features below or use the navigation menu to get started.
      </p>
    </section>

    <!-- Quote Section -->
    <QuoteSection :current-quote="appStore.currentQuote" @next-quote="appStore.nextQuote" />

    <!-- Latest Patch Note Section -->
    <section v-if="latestPatchNote" class="patch-note-section">
      <div class="patch-note-header">
        <h2 class="patch-note-title">📝 Latest Update</h2>
        <RouterLink to="/patch-notes" class="view-all-link">View All →</RouterLink>
      </div>
      <div class="patch-note-card">
        <div class="patch-note-meta">
          <span class="version-badge">v{{ latestPatchNote.version }}</span>
          <span class="build-info">Build #{{ latestPatchNote.buildNumber }} • {{ formatBuildTime(latestPatchNote.buildTime) }}</span>
        </div>
        <h3 class="patch-note-heading">{{ latestPatchNote.title }}</h3>
        <ul class="patch-note-changes">
          <li v-for="(change, index) in latestPatchNote.changes.slice(0, 5)" :key="index" class="change-item">
            <span class="change-icon">{{ getChangeIcon(change.type) }}</span>
            <span class="change-text">{{ change.description }}</span>
          </li>
        </ul>
        <p v-if="latestPatchNote.changes.length > 5" class="more-changes">
          +{{ latestPatchNote.changes.length - 5 }} more change{{ latestPatchNote.changes.length - 5 !== 1 ? 's' : '' }}
        </p>
      </div>
    </section>

    <!-- Feature Categories -->
    <section class="features-section">
      <div
        v-for="category in featureCategories"
        :key="category.title"
        class="feature-category"
      >
        <h2 class="category-title">
          <span class="category-icon">{{ category.icon }}</span>
          {{ category.title }}
        </h2>
        <p class="category-description">{{ category.description }}</p>
        <div class="feature-list">
          <RouterLink
            v-for="feature in category.features"
            :key="feature.path"
            :to="feature.path"
            class="feature-card"
          >
            <span class="feature-icon">{{ feature.icon }}</span>
            <span class="feature-name">{{ feature.name }}</span>
            <span class="feature-arrow">→</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Quick Tips Section -->
    <section class="tips-section">
      <h2 class="tips-title">Quick Tips 💡</h2>
      <ul class="tips-list">
        <li>Toggle <strong>dark mode</strong> using the ☀️/🌙 button in the nav bar</li>
        <li>Play <strong>background music</strong> with the 🔊 button</li>
        <li>Open the <strong>mold meter</strong> (🍄) to track... mold levels</li>
        <li>Check <strong>rankings</strong> (👻) and <strong>cats</strong> (🐱) panels anytime</li>
        <li>Don't forget to honk at the <strong>digital goose</strong> (🦆)</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
/* Page Container */
.page.home-page {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  /* Animated gradient background - light mode */
  background: linear-gradient(
    -45deg,
    #ffecd2,
    #fcb69f,
    #a8edea,
    #fed6e3,
    #ffecd2
  );
  background-size: 400% 400%;
  animation: gradientAnimation 15s ease infinite;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Animated gradient background - dark mode */
.dark .page.home-page {
  background: linear-gradient(
    -45deg,
    #1a1a2e,
    #16213e,
    #0f3460,
    #1a1a2e
  );
  background-size: 400% 400%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Welcome Section */
.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.6);
  padding: 2rem;
  border-radius: 16px;
  backdrop-filter: blur(8px);
}

.dark .welcome-section {
  background: rgba(26, 32, 44, 0.6);
}

.welcome-title {
  font-size: 3rem;
  font-weight: 700;
  color: #ff91a4;
  margin-bottom: 1rem;
  animation: fadeInDown 0.6s ease;
}

.dark .welcome-title {
  color: #ffb6c1;
}

.welcome-subtitle {
  font-size: 1.2rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  animation: fadeInUp 0.6s ease 0.1s both;
}

.dark .welcome-subtitle {
  color: #aaa;
}

/* Features Section */
.features-section {
  margin-bottom: 3rem;
}

.feature-category {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeInUp 0.6s ease both;
  backdrop-filter: blur(8px);
}

.dark .feature-category {
  background: rgba(40, 44, 52, 0.7);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.feature-category:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 182, 193, 0.15);
}

.dark .feature-category:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

/* Add staggered animation delays */
.feature-category:nth-child(1) {
  animation-delay: 0.2s;
}

.feature-category:nth-child(2) {
  animation-delay: 0.3s;
}

.feature-category:nth-child(3) {
  animation-delay: 0.4s;
}

.category-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark .category-title {
  color: #eee;
}

.category-icon {
  font-size: 2rem;
}

.category-description {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.dark .category-description {
  color: #aaa;
}

/* Feature Cards Grid */
.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 182, 193, 0.1);
  border-radius: 12px;
  text-decoration: none;
  color: #ff91a4;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.dark .feature-card {
  background: rgba(255, 182, 193, 0.05);
  color: #ffb6c1;
}

.feature-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #ff91a4;
  transform: scaleY(0);
  transition: transform 0.2s ease;
}

.feature-card:hover {
  background: rgba(255, 182, 193, 0.2);
  transform: translateX(4px);
}

.feature-card:hover::before {
  transform: scaleY(1);
}

.dark .feature-card:hover {
  background: rgba(255, 182, 193, 0.15);
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-name {
  flex: 1;
}

.feature-arrow {
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.2s ease;
}

.feature-card:hover .feature-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Tips Section */
.tips-section {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  animation: fadeInUp 0.6s ease 0.5s both;
  backdrop-filter: blur(8px);
}

.dark .tips-section {
  background: rgba(26, 32, 44, 0.6);
}

.tips-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
}

.dark .tips-title {
  color: #eee;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.tips-list li {
  color: #666;
  line-height: 1.6;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 182, 193, 0.2);
  transition: padding-left 0.2s ease;
}

.dark .tips-list li {
  color: #aaa;
  border-bottom-color: rgba(255, 182, 193, 0.1);
}

.tips-list li:last-child {
  border-bottom: none;
}

.tips-list li:hover {
  padding-left: 0.5rem;
}

.tips-list strong {
  color: #ff91a4;
}

.dark .tips-list strong {
  color: #ffb6c1;
}

/* Quote Section Wrapper */
:deep(.quote-section) {
  margin: 3rem 0;
}

/* Patch Note Section */
.patch-note-section {
  margin: 3rem 0;
}

.patch-note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.patch-note-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #ff91a4;
  margin: 0;
}

.dark .patch-note-title {
  color: #ffb6c1;
}

.view-all-link {
  color: #ff91a4;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.dark .view-all-link {
  color: #ffb6c1;
}

.view-all-link:hover {
  opacity: 0.8;
}

.patch-note-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dark .patch-note-card {
  background: rgba(40, 44, 52, 0.7);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.patch-note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.dark .patch-note-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.patch-note-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.version-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.build-info {
  color: #666;
  font-size: 0.8rem;
}

.dark .build-info {
  color: #aaa;
}

.patch-note-heading {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.dark .patch-note-heading {
  color: #eee;
}

.patch-note-changes {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.change-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
}

.dark .change-item {
  color: #ccc;
}

.change-icon {
  font-size: 1rem;
  min-width: 20px;
}

.change-text {
  flex: 1;
}

.more-changes {
  color: #ff91a4;
  font-size: 0.85rem;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
}

.dark .more-changes {
  color: #ffb6c1;
}

/* Animations */
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

/* Responsive Design */
@media (max-width: 768px) {
  .page.home-page {
    padding: 1rem;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
  }

  .feature-category {
    padding: 1.5rem;
  }

  .category-title {
    font-size: 1.4rem;
  }

  .feature-list {
    grid-template-columns: 1fr;
  }

  .tips-section {
    padding: 1.5rem;
  }

  .tips-list {
    font-size: 0.9rem;
  }
}
</style>
