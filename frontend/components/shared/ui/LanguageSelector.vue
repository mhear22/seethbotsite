<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { availableLocales, changeLocale, type Locale } from '../../../config/i18n'
import Tooltip from './Tooltip.vue'

const { locale } = useI18n()
const isOpen = ref(false)

const handleLocaleChange = (newLocale: Locale) => {
  changeLocale(newLocale)
  isOpen.value = false
}
</script>

<template>
  <div class="language-selector">
    <Tooltip :text="$t('common.language')">
      <button
        @click="isOpen = !isOpen"
        class="language-button"
        :aria-label="$t('language.selectLanguage')"
      >
        <span class="flag">{{ availableLocales.find(l => l.code === locale)?.flag || '🌐' }}</span>
        <span class="code">{{ locale.toUpperCase() }}</span>
        <svg class="arrow" :class="{ open: isOpen }" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </Tooltip>

    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <button
          v-for="loc in availableLocales"
          :key="loc.code"
          @click="handleLocaleChange(loc.code)"
          class="dropdown-item"
          :class="{ active: loc.code === locale }"
        >
          <span class="flag">{{ loc.flag }}</span>
          <span class="name">{{ loc.name }}</span>
          <span v-if="loc.code === locale" class="check">✓</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.language-selector {
  position: relative;
  display: inline-block;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--surface-color, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
  border-radius: 8px;
  color: var(--text-color, white);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.language-button:hover {
  background: var(--surface-hover-color, rgba(255, 255, 255, 0.2));
  border-color: var(--border-hover-color, rgba(255, 255, 255, 0.3));
}

.flag {
  font-size: 1.125rem;
  line-height: 1;
}

.code {
  font-weight: 500;
  font-size: 0.875rem;
}

.arrow {
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: var(--surface-color, #1a1a2e);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-color, white);
  font-size: 0.9375rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: var(--surface-hover-color, rgba(255, 255, 255, 0.1));
}

.dropdown-item.active {
  background: var(--primary-color, #6366f1);
  color: white;
}

.dropdown-item .name {
  flex: 1;
}

.dropdown-item .check {
  font-weight: bold;
  color: var(--success-color, #10b981);
}

.dropdown-item.active .check {
  color: white;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Dark mode adjustments */
:global(.dark) .language-button,
:global(.dark) .dropdown-menu {
  --surface-color: rgba(0, 0, 0, 0.3);
  --surface-hover-color: rgba(0, 0, 0, 0.5);
  --border-color: rgba(255, 255, 255, 0.1);
  --border-hover-color: rgba(255, 255, 255, 0.2);
  --text-color: white;
}

:global(.dark) .dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Light mode adjustments */
:global(.light) .language-button,
:global(.light) .dropdown-menu {
  --surface-color: rgba(255, 255, 255, 0.8);
  --surface-hover-color: rgba(255, 255, 255, 0.95);
  --border-color: rgba(0, 0, 0, 0.1);
  --border-hover-color: rgba(0, 0, 0, 0.2);
  --text-color: #1a1a2e;
}
</style>
