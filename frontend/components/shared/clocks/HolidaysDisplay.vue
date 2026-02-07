<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Holiday {
  name: string
  name_local: string
  language: string
  iso: string
  country: string
  date: string
  weekday: {
    date: string
    type: string
  }
}

const holidays = ref<Holiday[]>([])
const holidaysLoading = ref(false)
const holidaysError = ref<string | null>(null)

const countryFlags: Record<string, string> = {
  US: '🇺🇸', CA: '🇨🇦', GB: '🇬🇧', AU: '🇦🇺', DE: '🇩🇪',
  FR: '🇫🇷', IT: '🇮🇹', ES: '🇪🇸', NL: '🇳🇱', BE: '🇧🇪',
  AT: '🇦🇹', CH: '🇨🇭', PL: '🇵🇱', CZ: '🇨🇿', HU: '🇭🇺',
  RO: '🇷🇴', BG: '🇧🇬', GR: '🇬🇷', DK: '🇩🇰', SE: '🇸🇪',
  NO: '🇳🇴', FI: '🇫🇮', IS: '🇮🇸', IE: '🇮🇪', PT: '🇵🇹',
  LU: '🇱🇺', JP: '🇯🇵', KR: '🇰🇷', CN: '🇨🇳', IN: '🇮🇳',
  BR: '🇧🇷', AR: '🇦🇷', MX: '🇲🇽', CO: '🇨🇴', PE: '🇵🇪',
  CL: '🇨🇱', UY: '🇺🇾', ZA: '🇿🇦', NG: '🇳🇬', EG: '🇪🇬',
  TR: '🇹🇷', SA: '🇸🇦', AE: '🇦🇪', IL: '🇮🇱', TH: '🇹🇭',
  VN: '🇻🇳', ID: '🇮🇩', MY: '🇲🇾', SG: '🇸🇬', PH: '🇵🇭',
  NZ: '🇳🇿', RU: '🇷🇺', UA: '🇺🇦', BY: '🇧🇾', KZ: '🇰🇿',
  UZ: '🇺🇿', SI: '🇸🇮'
}

const getCountryFlag = (iso: string): string => {
  return countryFlags[iso] || '🌍'
}

const fetchHolidays = async () => {
  holidaysLoading.value = true
  holidaysError.value = null

  try {
    const response = await fetch('/api/holidays/today')
    const data = await response.json()

    if (response.ok) {
      holidays.value = data.holidays || []
    } else {
      holidaysError.value = data.error || 'Failed to fetch holidays'
      console.error('Holidays API error:', data)
    }
  } catch (error) {
    holidaysError.value = 'Failed to connect to holidays API'
    console.error('Error fetching holidays:', error)
  } finally {
    holidaysLoading.value = false
  }
}

onMounted(() => {
  fetchHolidays()
})
</script>

<template>
  <div class="holidays-section">
    <h2>🎉 Today's Holidays</h2>

    <div v-if="holidaysLoading" class="holidays-loading">
      <span class="loading-spinner">⏳</span>
      <p>Loading holidays...</p>
    </div>

    <div v-else-if="holidaysError" class="holidays-error" role="alert" aria-live="assertive">
      <span class="error-icon" aria-hidden="true">⚠️</span>
      <p>{{ holidaysError }}</p>
    </div>

    <div v-else-if="holidays.length === 0" class="holidays-empty">
      <span class="empty-icon">🌍</span>
      <p>No holidays today</p>
      <p class="empty-subtitle">Looks like a regular day around the world!</p>
    </div>

    <div v-else class="holidays-list">
      <div v-for="holiday in holidays" :key="`${holiday.iso}-${holiday.name}`" class="holiday-card">
        <div class="holiday-header">
          <span class="holiday-emoji">🎊</span>
          <h3 class="holiday-name">{{ holiday.name }}</h3>
        </div>
        <div class="holiday-details">
          <p class="holiday-country">{{ getCountryFlag(holiday.iso) }} {{ holiday.country }}</p>
          <p v-if="holiday.name_local !== holiday.name" class="holiday-local-name">{{ holiday.name_local }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.holidays-section {
  max-width: 800px;
  margin: 40px auto 0;
  padding: 25px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.holidays-section h2 {
  text-align: center;
  color: #ff6b9d;
  margin: 0 0 25px 0;
  font-size: 1.5rem;
}

.holidays-loading,
.holidays-error,
.holidays-empty {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner,
.error-icon,
.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.holidays-loading p,
.holidays-error p,
.holidays-empty p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.empty-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin-top: 8px !important;
}

.holidays-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.holiday-card {
  background: linear-gradient(135deg, #fff5f8 0%, #fff 100%);
  border-radius: 15px;
  padding: 20px;
  border: 2px solid #ffb6c1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.holiday-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(255, 107, 157, 0.2);
}

.holiday-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.holiday-emoji {
  font-size: 2rem;
}

.holiday-name {
  font-size: 1.2rem;
  color: #ff6b9d;
  margin: 0;
  font-weight: bold;
  flex: 1;
}

.holiday-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.holiday-country {
  font-size: 0.95rem;
  color: #333;
  margin: 0;
  font-weight: 500;
}

.holiday-local-name {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  font-style: italic;
}

@media (max-width: 768px) {
  .holidays-section {
    margin: 30px 10px 0;
    padding: 20px 15px;
  }

  .holidays-list {
    grid-template-columns: 1fr;
  }
}

.dark .holidays-section {
  background: rgba(40, 44, 52, 0.95);
}

.dark .holidays-loading p,
.dark .holidays-error p,
.dark .holidays-empty p {
  color: #a0a0a0;
}

.dark .empty-subtitle {
  color: #888;
}

.dark .holiday-card {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(40, 44, 52, 1) 100%);
  border-color: rgba(255, 182, 193, 0.3);
}

.dark .holiday-name {
  color: #ffb6c1;
}

.dark .holiday-country {
  color: #e2e8f0;
}

.dark .holiday-local-name {
  color: #999;
}
</style>
