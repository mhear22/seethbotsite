<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { availableLocales, changeLocale, type Locale } from '../../config/i18n'

const { locale } = useI18n

const selectedLocale = computed<Locale>({
  get: () => locale.value as Locale,
  set: (value: Locale) => {
    changeLocale(value)
  }
})
</script>

<template>
  <div class="language-settings">
    <h2 class="section-title">🌐 Language / 语言 / 言語</h2>

    <div class="setting-item">
      <label class="setting-label">
        <span class="label-text">{{ $t('language.selectLanguage') }}</span>
        <span class="label-desc">{{ $t('common.language') }}</span>
      </label>

      <div class="language-grid">
        <button
          v-for="loc in availableLocales"
          :key="loc.code"
          @click="selectedLocale = loc.code"
          class="language-option"
          :class="{ active: selectedLocale === loc.code }"
        >
          <span class="flag">{{ loc.flag }}</span>
          <span class="name">{{ loc.name }}</span>
          <span v-if="selectedLocale === loc.code" class="check">✓</span>
        </button>
      </div>
    </div>

    <div class="setting-info">
      <p class="info-text">
        💡 {{ $t('common.language') }} preference is saved automatically.
      </p>
    </div>
  </div>
</template>

<style scoped>
.language-settings {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color, #1a1a2e);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark .section-title {
  color: var(--text-color, white);
}

.setting-item {
  background: var(--surface-color, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.setting-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark .setting-item {
  background: var(--surface-color, rgba(40, 44, 52, 0.95));
  border-color: var(--border-color, rgba(255, 255, 255, 0.1));
}

.dark .setting-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.setting-label {
  display: block;
  margin-bottom: 1rem;
}

.label-text {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color, #1a1a2e);
  margin-bottom: 0.25rem;
}

.dark .label-text {
  color: var(--text-color, white);
}

.label-desc {
  display: block;
  font-size: 0.875rem;
  color: var(--text-muted, #666);
  line-height: 1.5;
}

.dark .label-desc {
  color: var(--text-muted, #a0aec0);
}

.language-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--input-bg, #f7fafc);
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 10px;
  color: var(--text-color, #1a1a2e);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.language-option:hover {
  background: var(--input-hover, #edf2f7);
  border-color: var(--border-hover, #cbd5e0);
  transform: translateY(-2px);
}

.language-option:active {
  transform: translateY(0);
}

.language-option.active {
  background: var(--primary-bg, #6366f1);
  border-color: var(--primary-color, #6366f1);
  color: white;
}

.language-option .flag {
  font-size: 1.5rem;
  line-height: 1;
}

.language-option .name {
  flex: 1;
  text-align: left;
}

.language-option .check {
  font-weight: bold;
  color: var(--success-color, #10b981);
  margin-left: auto;
}

.language-option.active .check {
  color: white;
}

.dark .language-option {
  background: var(--input-bg, #2d3748);
  border-color: var(--border-color, #4a5568);
  color: white;
}

.dark .language-option:hover {
  background: var(--input-hover, #4a5568);
  border-color: var(--border-hover, #718096);
}

.dark .language-option.active {
  background: var(--primary-bg, #6366f1);
  border-color: var(--primary-color, #6366f1);
}

.setting-info {
  background: var(--info-bg, #ebf8ff);
  border-left: 4px solid var(--info-border, #4299e1);
  border-radius: 8px;
  padding: 0.875rem 1rem;
  margin-top: 1rem;
}

.dark .setting-info {
  background: var(--info-bg, #2a4365);
  border-color: var(--info-border, #63b3ed);
}

.info-text {
  font-size: 0.875rem;
  color: var(--info-text, #2b6cb0);
  margin: 0;
  line-height: 1.5;
}

.dark .info-text {
  color: var(--info-text, #90cdf4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .language-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .language-option {
    padding: 0.75rem 0.875rem;
  }
}
</style>
