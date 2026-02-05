import { computed, ref } from 'vue'

interface LanguageRegion {
  code: string
  name: string
}

// Word mappings from US to AU English
const US_TO_AU: Record<string, string> = {
  'color': 'colour',
  'Color': 'Colour',
  'COLOR': 'COLOUR',
  'center': 'centre',
  'Center': 'Centre',
  'CENTER': 'CENTRE',
  'favorite': 'favourite',
  'Favorite': 'Favourite',
  'FAVORITE': 'FAVOURITE',
  'organize': 'organise',
  'Organize': 'Organise',
  'ORGANIZE': 'ORGANISE',
  'realize': 'realise',
  'Realize': 'Realise',
  'REALIZE': 'REALISE',
  'analyze': 'analyse',
  'Analyze': 'Analyse',
  'ANALYZE': 'ANALYSE',
  'behavior': 'behaviour',
  'Behavior': 'Behaviour',
  'BEHAVIOR': 'BEHAVIOUR',
  'neighbor': 'neighbour',
  'Neighbor': 'Neighbour',
  'NEIGHBOR': 'NEIGHBOUR',
  'meter': 'metre',
  'Meter': 'Metre',
  'METER': 'METRE'
}

// Available language regions
export const LANGUAGE_REGIONS: LanguageRegion[] = [
  { code: 'US', name: 'US English' },
  { code: 'AU', name: 'Australian English' }
]

// Load language preference from localStorage
const savedLanguage = localStorage.getItem('languageRegion')
const languageRegion = ref(savedLanguage === 'AU' ? 'AU' : 'US')

// Apply language to text
export const applyLanguage = (text: string, region: 'US' | 'AU' = languageRegion.value): string => {
  if (region === 'US') return text

  let result = text
  for (const [usWord, auWord] of Object.entries(US_TO_AU)) {
    // Use word boundaries to avoid replacing parts of words
    const regex = new RegExp(`\\b${usWord}\\b`, 'g')
    result = result.replace(regex, auWord)
  }
  return result
}

// Set language region
export const setLanguageRegion = (region: 'US' | 'AU') => {
  languageRegion.value = region
  localStorage.setItem('languageRegion', region)
}

// Get current language region
export const useLanguage = () => {
  return {
    languageRegion,
    setLanguageRegion,
    applyLanguage,
    toggleLanguage: () => {
      const newRegion = languageRegion.value === 'US' ? 'AU' : 'US'
      setLanguageRegion(newRegion)
    },
    isAustralian: computed(() => languageRegion.value === 'AU')
  }
}

export default useLanguage
