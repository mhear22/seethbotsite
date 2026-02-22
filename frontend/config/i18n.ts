import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import zh from '../locales/zh.json'
import ja from '../locales/ja.json'

// Type-safe locale keys
export type Locale = 'en' | 'zh' | 'ja'

export const availableLocales: { code: Locale; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }
]

// Load saved locale from localStorage or use browser locale
const getSavedLocale = (): Locale => {
  const saved = localStorage.getItem('locale') as Locale
  if (saved && availableLocales.some(l => l.code === saved)) {
    return saved
  }

  // Try to detect browser locale
  const browserLocale = navigator.language.split('-')[0] as Locale
  if (availableLocales.some(l => l.code === browserLocale)) {
    return browserLocale
  }

  return 'en' // Default to English
}

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: getSavedLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
    ja
  }
})

// Export functions to change locale
export const changeLocale = (locale: Locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale
}

export const getCurrentLocale = (): Locale => {
  return i18n.global.locale.value as Locale
}

export default i18n
