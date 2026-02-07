<script setup lang="ts">
import { useAppStore } from '../../stores/useAppStore'
import WorldClockList, { type ClockData } from '../shared/clocks/WorldClockList.vue'
import TimeComparisonBars from '../shared/clocks/TimeComparisonBars.vue'
import HolidaysDisplay from '../shared/clocks/HolidaysDisplay.vue'
import BirdSoundsPlayer from '../shared/clocks/BirdSoundsPlayer.vue'

const appStore = useAppStore()

const clocks: ClockData[] = [
  {
    title: 'Brisbane',
    timezone: 'Australia/Brisbane',
    label: 'Brisbane, Australia',
    emoji: '🦘',
    sunrise: 5.5,  // ~5:30 AM
    sunset: 18.5   // ~6:30 PM
  },
  {
    title: 'Tokyo',
    timezone: 'Asia/Tokyo',
    label: 'Tokyo, Japan',
    emoji: '🗼',
    sunrise: 5.0,  // ~5:00 AM
    sunset: 18.0   // ~6:00 PM
  },
  {
    title: 'Central European',
    timezone: 'Europe/Berlin',
    label: 'Central European Time',
    emoji: '🇪🇺',
    sunrise: 7.0,  // ~7:00 AM
    sunset: 19.5   // ~7:30 PM
  },
  {
    title: 'Sillydelphia',
    timezone: 'America/New_York',
    label: 'Sillydelphia, USA',
    emoji: '🔔',
    sunrise: 6.5,  // ~6:30 AM
    sunset: 19.0   // ~7:00 PM
  },
  {
    title: 'Chatham Islands',
    timezone: 'Pacific/Chatham',
    label: 'Chatham Islands, NZ',
    emoji: '🏝️',
    sunrise: 7.0,  // ~7:00 AM
    sunset: 19.5   // ~7:30 PM
  }
]
</script>

<template>
  <div class="clocks-page" :class="{ dark: appStore.darkMode }">
    <div class="clocks-header">
      <h1>⏰ World Clocks</h1>
      <p class="subtitle">Current time across different timezones</p>
    </div>

    <WorldClockList :clocks="clocks" :show-seconds="true" />
    <TimeComparisonBars :clocks="clocks" />
    <HolidaysDisplay />
    <BirdSoundsPlayer />

    <div class="footer-note">
      <p>📍 Timezones: Australia/Brisbane, Asia/Tokyo, Europe/Berlin</p>
      <p>🔄 Updates every second automatically</p>
    </div>
  </div>
</template>

<style scoped>
.clocks-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  transition: background 0.5s ease;
}

.clocks-page.dark {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #5b21b6 100%);
}

.clocks-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.clocks-header h1 {
  font-size: 2.5rem;
  color: #ff6b9d;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #ff6b9d, #ff8a80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.dark .subtitle {
  color: #a0a0a0;
}

.footer-note {
  text-align: center;
  margin-top: 60px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
}

.dark .footer-note {
  background: rgba(40, 44, 52, 0.8);
}

.footer-note p {
  color: #666;
  font-size: 0.9rem;
  margin: 5px 0;
}

.dark .footer-note p {
  color: #a0a0a0;
}

@media (max-width: 768px) {
  .clocks-header h1 {
    font-size: 2rem;
  }
}
</style>
