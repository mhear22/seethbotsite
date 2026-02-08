<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  title: string
  path: string
}

const route = useRoute()

/**
 * Generate breadcrumb items from the current route
 */
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const crumbs: BreadcrumbItem[] = []
  const pathSegments = route.path.split('/').filter(Boolean)

  // Always add Home
  crumbs.push({ title: 'Home', path: '/' })

  // Add each segment as a breadcrumb
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // Format title from segment (convert kebab-case to Title Case)
    const title = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    crumbs.push({ title, path: currentPath })
  })

  // Limit breadcrumbs to prevent overcrowding (max 4 items)
  if (crumbs.length > 4) {
    const first = crumbs[0]
    const last = crumbs[crumbs.length - 1]
    const prev = crumbs[crumbs.length - 2]
    crumbs.splice(1, crumbs.length - 3, { title: '...', path: prev.path })
  }

  return crumbs
})

/**
 * Check if we should show breadcrumbs (hide on home page)
 */
const showBreadcrumbs = computed(() => {
  return route.path !== '/'
})

/**
 * Get icon for breadcrumb level
 */
const getBreadcrumbIcon = (index: number): string => {
  const icons = ['🏠', '📁', '📄', '📋']
  return icons[index] || '📍'
}
</script>

<template>
  <nav v-if="showBreadcrumbs" class="breadcrumbs" aria-label="Breadcrumb navigation">
    <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="crumb.path"
        class="breadcrumb-item"
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      >
        <meta itemprop="position" :content="String(index + 1)" />

        <!-- Link for all but the last item -->
        <router-link
          v-if="index !== breadcrumbs.length - 1"
          :to="crumb.path"
          class="breadcrumb-link"
          itemprop="item"
        >
          <span class="breadcrumb-icon" aria-hidden="true">{{ getBreadcrumbIcon(index) }}</span>
          <span itemprop="name">{{ crumb.title }}</span>
        </router-link>

        <!-- Current page (not a link) -->
        <span v-else class="breadcrumb-current" itemprop="name">
          <span class="breadcrumb-icon" aria-hidden="true">{{ getBreadcrumbIcon(index) }}</span>
          {{ crumb.title }}
        </span>

        <!-- Separator (not after the last item) -->
        <span v-if="index !== breadcrumbs.length - 1" class="breadcrumb-separator" aria-hidden="true">
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
/* Breadcrumb Navigation Container */
.breadcrumbs {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 12px 20px;
  margin: 10px auto 20px;
  max-width: 1200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  font-size: 14px;
  overflow-x: auto;
  scroll-behavior: smooth;
}

.dark .breadcrumbs {
  background: rgba(40, 44, 52, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Custom scrollbar for horizontal scrolling */
.breadcrumbs::-webkit-scrollbar {
  height: 4px;
}

.breadcrumbs::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
}

.breadcrumbs::-webkit-scrollbar-thumb {
  background: rgba(255, 182, 193, 0.5);
  border-radius: 2px;
}

.breadcrumbs::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 182, 193, 0.8);
}

.dark .breadcrumbs::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.dark .breadcrumbs::-webkit-scrollbar-thumb {
  background: rgba(255, 182, 193, 0.3);
}

/* Breadcrumb List */
.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 4px;
  flex-wrap: nowrap;
}

/* Breadcrumb Item */
.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Breadcrumb Link */
.breadcrumb-link {
  color: #666;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
}

.dark .breadcrumb-link {
  color: #a0aec0;
}

.breadcrumb-link:hover {
  color: #ff91a4;
  background: rgba(255, 182, 193, 0.1);
}

.dark .breadcrumb-link:hover {
  color: #ffb6c1;
  background: rgba(255, 182, 193, 0.15);
}

/* Breadcrumb Icon */
.breadcrumb-icon {
  font-size: 14px;
  opacity: 0.8;
}

.breadcrumb-link:hover .breadcrumb-icon {
  transform: scale(1.1);
  opacity: 1;
}

/* Current Page (not a link) */
.breadcrumb-current {
  color: #ff91a4;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
}

.dark .breadcrumb-current {
  color: #ffb6c1;
}

.breadcrumb-current .breadcrumb-icon {
  opacity: 1;
}

/* Breadcrumb Separator */
.breadcrumb-separator {
  color: #cbd5e0;
  font-size: 14px;
  margin: 0 2px;
  font-weight: 300;
  user-select: none;
}

.dark .breadcrumb-separator {
  color: #4a5568;
}

/* Responsive Design */
@media (max-width: 768px) {
  .breadcrumbs {
    padding: 10px 16px;
    margin: 8px 16px 16px;
    font-size: 13px;
    border-radius: 8px;
  }

  .breadcrumb-link {
    padding: 3px 6px;
  }

  .breadcrumb-current {
    padding: 3px 6px;
  }

  .breadcrumb-icon {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .breadcrumbs {
    padding: 8px 12px;
    margin: 6px 12px 14px;
    font-size: 12px;
  }

  /* Hide separator on very small screens for cleaner look */
  .breadcrumb-separator {
    font-size: 12px;
    margin: 0 1px;
  }

  /* Reduce padding further */
  .breadcrumb-link,
  .breadcrumb-current {
    padding: 2px 4px;
  }
}

/* Print styles */
@media print {
  .breadcrumbs {
    background: none;
    box-shadow: none;
    border-bottom: 1px solid #ccc;
  }

  .breadcrumb-link {
    color: #000;
  }
}
</style>
