<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../../stores/useAppStore'

const route = useRoute()
const appStore = useAppStore()

interface BreadcrumbItem {
  label: string
  path: string
}

// Route path mapping to display names
const pathNames: Record<string, string> = {
  '/': 'Home',
  '/fishing': 'Fishing',
  '/stats': 'Statistics',
  '/character-tinder': 'Character Tinder',
  '/girl': 'Girl Mode',
  '/phrenology': 'Phrenology',
  '/gender': 'Phrenology',
  '/about': 'About',
  '/rankings': 'Rankings',
  '/cats': 'Cats',
  '/stocks': 'Stock Market',
  '/movies': 'Movie Night',
  '/countdowns': 'Countdowns',
  '/tickets': 'Tickets',
  '/clocks': 'Clocks',
  '/music': 'Music',
  '/opinion': 'Moldbot Opinions',
  '/mold': 'Mold',
  '/clicker': 'Idle Clicker',
  '/shop': 'Shop',
  '/api-docs': 'API Docs',
  '/auth': 'Account',
  '/wordcloud': 'Word Cloud',
  '/keanu': 'Keanu',
  '/patch-notes': 'Patch Notes',
  '/settings': 'Settings',
  '/car': 'Car Display',
  '/archive': 'Archive & History'
}

const categoryMap: Record<string, string> = {
  '/fishing': 'Fun & Games',
  '/stats': 'Community',
  '/character-tinder': 'Fun & Games',
  '/girl': 'Fun & Games',
  '/phrenology': 'Fun & Games',
  '/gender': 'Fun & Games',
  '/rankings': 'Community',
  '/cats': 'Fun & Games',
  '/stocks': 'Fun & Games',
  '/movies': 'Community',
  '/countdowns': 'Tools',
  '/tickets': 'Tools',
  '/clocks': 'Tools',
  '/music': 'Fun & Games',
  '/opinion': 'Community',
  '/mold': 'Community',
  '/clicker': 'Fun & Games',
  '/shop': 'Fun & Games',
  '/api-docs': 'Tools',
  '/auth': 'Tools',
  '/wordcloud': 'Tools',
  '/keanu': 'Fun & Games',
  '/patch-notes': 'Tools',
  '/settings': 'Tools',
  '/car': 'Tools',
  '/archive': 'Tools'
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', path: '/' }
  ]

  const currentPath = route.path

  if (currentPath !== '/') {
    // Check if path has a category
    const category = categoryMap[currentPath]
    const pageName = pathNames[currentPath] || 'Page'

    if (category && category !== 'Community' && category !== 'Tools') {
      items.push({
        label: category,
        path: '/'
      })
    }

    items.push({
      label: pageName,
      path: currentPath
    })
  }

  return items
})

const isLastBreadcrumb = (index: number) => {
  return index === breadcrumbs.value.length - 1
}
</script>

<template>
  <nav v-if="appStore.showBreadcrumb" class="breadcrumb-nav" aria-label="Breadcrumb navigation">
    <ol class="breadcrumb-list">
      <li
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
        class="breadcrumb-item"
        :class="{ active: isLastBreadcrumb(index) }"
      >
        <router-link
          v-if="!isLastBreadcrumb(index)"
          :to="item.path"
          class="breadcrumb-link"
        >
          {{ item.label }}
        </router-link>
        <span v-else class="breadcrumb-current">
          {{ item.label }}
        </span>
        <span
          v-if="!isLastBreadcrumb(index)"
          class="breadcrumb-separator"
          aria-hidden="true"
        >
          >
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb-nav {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 12px 20px;
  margin: 0 0 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.dark .breadcrumb-nav {
  background: rgba(40, 44, 52, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  gap: 8px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  font-size: 0.9em;
  white-space: nowrap;
}

.breadcrumb-item.active {
  color: #48bb78;
  font-weight: 600;
}

.breadcrumb-link {
  color: #718096;
  text-decoration: none;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark .breadcrumb-link {
  color: #a0aec0;
}

.breadcrumb-link:hover {
  color: #ed8936;
}

.breadcrumb-current {
  color: #48bb78;
  font-weight: 600;
}

.breadcrumb-separator {
  color: #cbd5e0;
  font-size: 0.85em;
}

.dark .breadcrumb-separator {
  color: #4a5568;
}

/* Scrollbar for horizontal scroll */
.breadcrumb-list::-webkit-scrollbar {
  height: 4px;
}

.breadcrumb-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
}

.breadcrumb-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.dark .breadcrumb-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.dark .breadcrumb-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .breadcrumb-nav {
    padding: 10px 16px;
    margin: 0 0 16px 0;
  }

  .breadcrumb-list {
    font-size: 0.85em;
    gap: 6px;
  }

  .breadcrumb-separator {
    font-size: 0.8em;
  }
}
</style>
