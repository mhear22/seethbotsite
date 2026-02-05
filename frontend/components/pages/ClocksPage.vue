<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../../stores/useAppStore'

interface ClockData {
  title: string
  timezone: string
  label: string
  emoji: string
  sunrise: number // hour in 24h format (e.g., 6.5 = 6:30)
  sunset: number  // hour in 24h format (e.g., 18.5 = 18:30)
}

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

const currentTime = ref(new Date())
let updateInterval: number | null = null

onMounted(() => {
  // Update clocks every second
  updateInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  // Fetch holidays
  fetchHolidays()

  // Initialize audio player
  if (typeof window !== 'undefined') {
    audioPlayer.value = new Audio()
    audioPlayer.value.addEventListener('ended', handleAudioEnded)
  }
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }

  if (audioPlayer.value) {
    audioPlayer.value.removeEventListener('ended', handleAudioEnded)
    stopSound()
  }
})

const getTimeForTimezone = (timezone: string) => {
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', { timeZone: timezone, hour12: false })
  const [hours, minutes, seconds] = timeString.split(':').map(Number)
  return { hours, minutes, seconds }
}

const getClockHands = (timezone: string) => {
  const time = getTimeForTimezone(timezone)
  const hours = time.hours % 12
  const minutes = time.minutes
  const seconds = time.seconds

  // Calculate rotation degrees
  const hourDeg = (hours * 30) + (minutes * 0.5) // 30° per hour + adjustment for minutes
  const minuteDeg = minutes * 6 // 6° per minute
  const secondDeg = seconds * 6 // 6° per second

  return {
    hour: hourDeg,
    minute: minuteDeg,
    second: secondDeg
  }
}

const formatTime = (timezone: string) => {
  const now = new Date()
  return now.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const formatDate = (timezone: string) => {
  const now = new Date()
  return now.toLocaleDateString('en-US', {
    timeZone: timezone,
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}

// Get current time as decimal hours (0-24)
const getCurrentHour = (timezone: string): number => {
  const time = getTimeForTimezone(timezone)
  return time.hours + time.minutes / 60 + time.seconds / 3600
}

// Fixed "now" position at center (50%)
const NOW_POSITION = 50

// Get offset to align current time with the fixed "now" position
// This shifts the entire day/night bar so current local time aligns at center
const getBarOffset = (timezone: string): number => {
  const currentHour = getCurrentHour(timezone)
  const currentPosition = (currentHour / 24) * 100
  return NOW_POSITION - currentPosition
}

// Get sunrise position with offset applied (normalized to 0-100)
const getSunrisePosition = (sunrise: number, timezone: string): number => {
  const basePosition = (sunrise / 24) * 100
  const offset = getBarOffset(timezone)
  let position = basePosition + offset
  // Normalize to 0-100 range (for wrapping)
  while (position < 0) position += 100
  while (position > 100) position -= 100
  return position
}

// Get sunset position with offset applied (normalized to 0-100)
const getSunsetPosition = (sunset: number, timezone: string): number => {
  const basePosition = (sunset / 24) * 100
  const offset = getBarOffset(timezone)
  let position = basePosition + offset
  // Normalize to 0-100 range (for wrapping)
  while (position < 0) position += 100
  while (position > 100) position -= 100
  return position
}

// Check if daylight period wraps around the bar
const daylightWraps = (sunrise: number, sunset: number, timezone: string): boolean => {
  const sunrisePos = getSunrisePosition(sunrise, timezone)
  const sunsetPos = getSunsetPosition(sunset, timezone)
  return sunsetPos < sunrisePos
}

// Check if current time is during daylight (handles wrapping)
const isDaylight = (timezone: string, sunrise: number, sunset: number): boolean => {
  const hour = getCurrentHour(timezone)

  // If sunset is after sunrise (normal case)
  if (sunset >= sunrise) {
    return hour >= sunrise && hour < sunset
  }

  // If sunset is before sunrise (wraps around midnight)
  // Daylight period is: [sunrise, 24:00] U [00:00, sunset]
  return hour >= sunrise || hour < sunset
}

// Format hour to readable time
const formatHour = (hour: number): string => {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 || 12
  return m === 0 ? `${displayHour} ${ampm}` : `${displayHour}:${m.toString().padStart(2, '0')} ${ampm}`
}

// Holidays API

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

// Bird Sounds
interface BirdSound {
  commonName: string
  sciName: string
  location: string
  mediaUrl: string
  thumbnailUrl: string
  behaviors: string
  rating: string
  speciesCode: string
}

const currentBirdSound = ref<BirdSound | null>(null)
const birdSoundLoading = ref(false)
const birdSoundError = ref<string | null>(null)
const audioPlayer = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const volume = ref(0.3) // Default to 30% volume for relaxing background music

const fetchBirdSound = async () => {
  birdSoundLoading.value = true
  birdSoundError.value = null

  try {
    const response = await fetch('/api/birdsounds/random')
    const data = await response.json()

    if (response.ok) {
      currentBirdSound.value = data
      // Auto-play when a new bird sound is fetched
      if (audioPlayer.value && data.mediaUrl) {
        audioPlayer.value.src = data.mediaUrl
        audioPlayer.value.volume = volume.value
        await audioPlayer.value.play()
        isPlaying.value = true
      }
    } else {
      birdSoundError.value = data.error || 'Failed to fetch bird sound'
      console.error('Bird sounds API error:', data)
    }
  } catch (error) {
    birdSoundError.value = 'Failed to connect to bird sounds API'
    console.error('Error fetching bird sound:', error)
  } finally {
    birdSoundLoading.value = false
  }
}

const togglePlayPause = () => {
  if (!audioPlayer.value || !currentBirdSound.value?.mediaUrl) {
    return
  }

  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  } else {
    audioPlayer.value.play()
    isPlaying.value = true
  }
}

const stopSound = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
    isPlaying.value = false
  }
}

const handleVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  volume.value = parseFloat(target.value)
  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value
  }
}

const handleAudioEnded = () => {
  isPlaying.value = false
  // Auto-fetch next bird sound when current one ends
  setTimeout(() => {
    fetchBirdSound()
  }, 1000)
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
</script>

<template>
  <div class="clocks-page" :class="{ dark: appStore.darkMode }">
    <div class="clocks-header">
      <h1>⏰ World Clocks</h1>
      <p class="subtitle">Current time across different timezones</p>
    </div>

    <div class="clocks-grid">
      <div v-for="clock in clocks" :key="clock.timezone" class="clock-card">
        <div class="clock-header">
          <span class="clock-emoji">{{ clock.emoji }}</span>
          <h3 class="clock-title">{{ clock.title }}</h3>
        </div>

        <div class="clock-face-container">
          <div class="clock-face">
            <!-- Clock face numbers -->
            <span class="clock-number" style="top: 5%; left: 50%; transform: translateX(-50%);">12</span>
            <span class="clock-number" style="top: 50%; right: 5%; transform: translateY(-50%);">3</span>
            <span class="clock-number" style="bottom: 5%; left: 50%; transform: translateX(-50%);">6</span>
            <span class="clock-number" style="top: 50%; left: 5%; transform: translateY(-50%);">9</span>

            <!-- Clock hands -->
            <div class="clock-hand hour-hand" :style="{ transform: `rotate(${getClockHands(clock.timezone).hour}deg)` }"></div>
            <div class="clock-hand minute-hand" :style="{ transform: `rotate(${getClockHands(clock.timezone).minute}deg)` }"></div>
            <div class="clock-hand second-hand" :style="{ transform: `rotate(${getClockHands(clock.timezone).second}deg)` }"></div>

            <!-- Center dot -->
            <div class="clock-center"></div>
          </div>
        </div>

        <div class="clock-info">
          <p class="clock-label">{{ clock.label }}</p>
          <p class="clock-digital">{{ formatTime(clock.timezone) }}</p>
          <p class="clock-date">{{ formatDate(clock.timezone) }}</p>
          <div class="daylight-indicator" :class="{ day: isDaylight(clock.timezone, clock.sunrise, clock.sunset) }">
            <span class="daylight-icon">{{ isDaylight(clock.timezone, clock.sunrise, clock.sunset) ? '☀️' : '🌙' }}</span>
            <span class="daylight-text">{{ isDaylight(clock.timezone, clock.sunrise, clock.sunset) ? 'Day' : 'Night' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stacked Time Bars Section -->
    <div class="time-bars-section">
      <h2>📊 Time of Day Comparison</h2>
      <div class="time-bars-stack">
        <div v-for="clock in clocks" :key="clock.timezone + '-bar'" class="time-bar-row">
          <div class="time-bar-label">
            <span class="bar-emoji">{{ clock.emoji }}</span>
            <span class="bar-title">{{ clock.title }}</span>
          </div>
          <div class="time-bar-wrapper">
            <div class="time-bar">
              <!-- Night/Day gradient background -->
              <!-- Normal daylight bar (no wrap) -->
              <div
                v-if="!daylightWraps(clock.sunrise, clock.sunset, clock.timezone)"
                class="time-bar-day"
                :style="{
                  left: getSunrisePosition(clock.sunrise, clock.timezone) + '%',
                  width: (getSunsetPosition(clock.sunset, clock.timezone) - getSunrisePosition(clock.sunrise, clock.timezone)) + '%'
                }"
              ></div>

              <!-- Wrapped daylight bar (wraps to left side) -->
              <template v-else>
                <!-- First part: from sunrise to 100% -->
                <div
                  class="time-bar-day"
                  :style="{
                    left: getSunrisePosition(clock.sunrise, clock.timezone) + '%',
                    width: (100 - getSunrisePosition(clock.sunrise, clock.timezone)) + '%'
                  }"
                ></div>
                <!-- Second part: from 0% to sunset -->
                <div
                  class="time-bar-day"
                  :style="{
                    left: '0%',
                    width: getSunsetPosition(clock.sunset, clock.timezone) + '%'
                  }"
                ></div>
              </template>

              <!-- Sunrise marker -->
              <div
                class="sun-marker sunrise-marker"
                :style="{ left: getSunrisePosition(clock.sunrise, clock.timezone) + '%' }"
                :title="'Sunrise: ' + formatHour(clock.sunrise)"
              >
                <span class="sun-icon">🌅</span>
              </div>

              <!-- Sunset marker -->
              <div
                class="sun-marker sunset-marker"
                :style="{ left: getSunsetPosition(clock.sunset, clock.timezone) + '%' }"
                :title="'Sunset: ' + formatHour(clock.sunset)"
              >
                <span class="sun-icon">🌇</span>
              </div>

              <!-- Current time indicator (fixed at center) -->
              <div
                class="current-time-marker"
                :style="{ left: NOW_POSITION + '%' }"
                :class="{ daylight: isDaylight(clock.timezone, clock.sunrise, clock.sunset) }"
              >
                <div class="time-marker-line"></div>
                <div class="time-marker-dot"></div>
              </div>
            </div>
            <div class="time-bar-current-label" :style="{ left: NOW_POSITION + '%' }">
              {{ formatTime(clock.timezone) }}
            </div>
          </div>
        </div>

        <!-- Now indicator line spanning all bars -->
        <div class="now-indicator-label">
          <div class="time-bar-label-spacer"></div>
          <div class="now-label-wrapper">
            <span class="now-label">▲ NOW</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Holidays Section -->
    <div class="holidays-section">
      <h2>🎉 Today's Holidays</h2>

      <div v-if="holidaysLoading" class="holidays-loading">
        <span class="loading-spinner">⏳</span>
        <p>Loading holidays...</p>
      </div>

      <div v-else-if="holidaysError" class="holidays-error">
        <span class="error-icon">⚠️</span>
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

    <!-- Bird Sounds Section -->
    <div class="bird-sounds-section">
      <h2>🐦 Relaxing Bird Sounds</h2>
      <p class="bird-sounds-subtitle">Enjoy the calming sounds of nature while viewing the world clocks</p>

      <div v-if="birdSoundLoading && !currentBirdSound" class="bird-sounds-loading">
        <span class="loading-spinner">🐣</span>
        <p>Finding a bird song...</p>
      </div>

      <div v-else-if="birdSoundError" class="bird-sounds-error">
        <span class="error-icon">🪹</span>
        <p>{{ birdSoundError }}</p>
        <button class="retry-button" @click="fetchBirdSound">🔄 Try Again</button>
      </div>

      <div v-else-if="currentBirdSound" class="bird-sounds-player">
        <div class="bird-info">
          <h3 class="bird-name">{{ currentBirdSound.commonName }}</h3>
          <p class="bird-scientific"><em>{{ currentBirdSound.sciName }}</em></p>
          <p class="bird-location">📍 {{ currentBirdSound.location }}</p>
          <p class="bird-behavior">🎵 {{ currentBirdSound.behaviors }}</p>
          <p class="bird-rating">⭐ Rating: {{ currentBirdSound.rating }}/5</p>
        </div>

        <div class="bird-controls">
          <div class="control-buttons">
            <button
              class="control-button"
              :class="{ active: isPlaying }"
              @click="togglePlayPause"
              :disabled="!currentBirdSound.mediaUrl"
            >
              {{ isPlaying ? '⏸️ Pause' : '▶️ Play' }}
            </button>

            <button
              class="control-button stop-button"
              @click="stopSound"
            >
              ⏹️ Stop
            </button>

            <button
              class="control-button"
              @click="fetchBirdSound"
              :disabled="birdSoundLoading"
            >
              {{ birdSoundLoading ? '🐣...' : '🎲 Next Bird' }}
            </button>
          </div>

          <div class="volume-control">
            <label for="volume">🔊 Volume:</label>
            <input
              id="volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              v-model.number="volume"
              @input="handleVolumeChange"
              class="volume-slider"
            />
            <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>

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

.clocks-grid {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.clock-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
}

.dark .clock-card {
  background: rgba(40, 44, 52, 0.95);
}

.clock-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
}

.clock-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.clock-emoji {
  font-size: 2rem;
}

.clock-title {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
  font-weight: bold;
}

.dark .clock-title {
  color: #e2e8f0;
}

.clock-face-container {
  margin-bottom: 20px;
}

.clock-face {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  border: 8px solid #ff91a4;
  position: relative;
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.1);
}

.dark .clock-face {
  background: linear-gradient(135deg, #2d3139 0%, #1f2229 100%);
  border-color: #ffb6c1;
}

.clock-number {
  position: absolute;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  transform: translate(-50%, -50%);
}

.dark .clock-number {
  color: #e2e8f0;
}

.clock-hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom center;
  border-radius: 4px;
  transition: transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 0.44);
}

.hour-hand {
  width: 4px;
  height: 50px;
  background: #333;
  margin-left: -2px;
  z-index: 2;
}

.dark .hour-hand {
  background: #e2e8f0;
}

.minute-hand {
  width: 3px;
  height: 70px;
  background: #666;
  margin-left: -1.5px;
  z-index: 3;
}

.dark .minute-hand {
  background: #a0a0a0;
}

.second-hand {
  width: 2px;
  height: 80px;
  background: #ff6b9d;
  margin-left: -1px;
  z-index: 4;
}

.dark .second-hand {
  background: #ffb6c1;
}

.clock-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  background: #ff6b9d;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  box-shadow: 0 0 5px rgba(255, 107, 157, 0.5);
}

.dark .clock-center {
  background: #ffb6c1;
  box-shadow: 0 0 5px rgba(255, 182, 193, 0.5);
}

.clock-info {
  text-align: center;
}

.clock-label {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 8px 0;
}

.dark .clock-label {
  color: #a0a0a0;
}

.clock-digital {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ff6b9d;
  margin: 0 0 5px 0;
  font-family: 'Courier New', monospace;
}

.dark .clock-digital {
  color: #ffb6c1;
}

.clock-date {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
  font-style: italic;
}

.dark .clock-date {
  color: #888;
}

.daylight-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #2d3139 0%, #1a1a2e 100%);
  border-radius: 20px;
  border: 2px solid #4a4a5a;
}

.daylight-indicator.day {
  background: linear-gradient(135deg, #ffd89b 0%, #87ceeb 100%);
  border-color: #ffd89b;
}

.daylight-icon {
  font-size: 1.3rem;
}

.daylight-text {
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
}

.dark .daylight-text {
  color: #1a1a2e;
}

.dark .daylight-indicator:not(.day) .daylight-text {
  color: #e2e8f0;
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

/* Stacked Time Bars Section */
.time-bars-section {
  max-width: 800px;
  margin: 40px auto 0;
  padding: 25px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.dark .time-bars-section {
  background: rgba(40, 44, 52, 0.95);
}

.time-bars-section h2 {
  text-align: center;
  color: #ff6b9d;
  margin: 0 0 25px 0;
  font-size: 1.5rem;
}

.time-bars-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-bar-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time-bar-label {
  width: 120px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-emoji {
  font-size: 1.3rem;
}

.bar-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.dark .bar-title {
  color: #e2e8f0;
}

.time-bar-wrapper {
  flex: 1;
  position: relative;
  padding-top: 20px;
  padding-bottom: 18px;
}

.time-bar {
  position: relative;
  height: 28px;
  background: linear-gradient(90deg,
    #1a1a2e 0%,
    #1a1a2e 100%
  );
  border-radius: 14px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.time-bar-day {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg,
    #ffd89b 0%,
    #87ceeb 20%,
    #87ceeb 80%,
    #ffd89b 100%
  );
  border-radius: 14px;
  transition: all 0.3s ease;
}

.sun-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.sun-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.current-time-marker {
  position: absolute;
  top: -6px;
  transform: translateX(-50%);
  z-index: 15;
  transition: left 1s linear;
}

.time-marker-line {
  width: 3px;
  height: 40px;
  background: #ff6b9d;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(255, 107, 157, 0.6);
}

.current-time-marker.daylight .time-marker-line {
  background: #ff6b9d;
  box-shadow: 0 0 10px rgba(255, 107, 157, 0.8);
}

.time-marker-dot {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  background: #ff6b9d;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.dark .time-marker-dot {
  border-color: #2d3139;
}

.time-bar-current-label {
  position: absolute;
  bottom: -2px;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 600;
  color: #ff6b9d;
  white-space: nowrap;
  transition: left 1s linear;
}

.dark .time-bar-current-label {
  color: #ffb6c1;
}

.now-indicator-label {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 5px;
}

.time-bar-label-spacer {
  width: 120px;
  flex-shrink: 0;
}

.now-label-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
}

.now-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ff6b9d;
  letter-spacing: 1px;
}

.dark .now-label {
  color: #ffb6c1;
}

@media (max-width: 768px) {
  .clocks-grid {
    grid-template-columns: 1fr;
  }

  .clock-face {
    width: 180px;
    height: 180px;
  }

  .clocks-header h1 {
    font-size: 2rem;
  }

  .time-bars-section {
    margin: 30px 10px 0;
    padding: 20px 15px;
  }

  .time-bar-row {
    flex-direction: column;
    align-items: stretch;
    gap: 5px;
  }

  .time-bar-label {
    width: auto;
    justify-content: center;
  }

  .now-indicator-label {
    flex-direction: column;
  }

  .time-bar-label-spacer {
    display: none;
  }

  .time-bar-current-label {
    font-size: 0.65rem;
  }
}

/* Holidays Section */
.holidays-section {
  max-width: 800px;
  margin: 40px auto 0;
  padding: 25px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.dark .holidays-section {
  background: rgba(40, 44, 52, 0.95);
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

.dark .holidays-loading p,
.dark .holidays-error p,
.dark .holidays-empty p {
  color: #a0a0a0;
}

.empty-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin-top: 8px !important;
}

.dark .empty-subtitle {
  color: #888;
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

.dark .holiday-card {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(40, 44, 52, 1) 100%);
  border-color: rgba(255, 182, 193, 0.3);
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

.dark .holiday-name {
  color: #ffb6c1;
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

.dark .holiday-country {
  color: #e2e8f0;
}

.holiday-local-name {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  font-style: italic;
}

.dark .holiday-local-name {
  color: #999;
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

/* Bird Sounds Section */
.bird-sounds-section {
  max-width: 900px;
  margin: 40px auto 0;
  padding: 25px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.dark .bird-sounds-section {
  background: rgba(40, 44, 52, 0.95);
}

.bird-sounds-section h2 {
  text-align: center;
  color: #ff6b9d;
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.bird-sounds-subtitle {
  text-align: center;
  color: #666;
  margin: 0 0 25px 0;
  font-size: 1rem;
  font-style: italic;
}

.dark .bird-sounds-subtitle {
  color: #a0a0a0;
}

.bird-sounds-loading,
.bird-sounds-error {
  text-align: center;
  padding: 40px 20px;
}

.bird-sounds-loading .loading-spinner,
.bird-sounds-error .error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.bird-sounds-loading p,
.bird-sounds-error p {
  color: #666;
  font-size: 1.1rem;
  margin: 0 0 15px 0;
}

.dark .bird-sounds-loading p,
.dark .bird-sounds-error p {
  color: #a0a0a0;
}

.retry-button {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 157, 0.3);
}

.bird-sounds-player {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.bird-info {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #fff5f8 0%, #fff 100%);
  border-radius: 15px;
  border: 2px solid #ffb6c1;
}

.dark .bird-info {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(40, 44, 52, 1) 100%);
  border-color: rgba(255, 182, 193, 0.3);
}

.bird-name {
  font-size: 1.8rem;
  color: #ff6b9d;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.dark .bird-name {
  color: #ffb6c1;
}

.bird-scientific {
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 10px 0;
}

.dark .bird-scientific {
  color: #999;
}

.bird-location,
.bird-behavior,
.bird-rating {
  font-size: 0.95rem;
  color: #555;
  margin: 5px 0;
}

.dark .bird-location,
.dark .bird-behavior,
.dark .bird-rating {
  color: #a0a0a0;
}

.bird-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.control-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-width: 120px;
}

.control-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.control-button.active {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8a80 100%);
}

.control-button.stop-button {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.volume-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.dark .volume-control {
  background: rgba(0, 0, 0, 0.2);
}

.volume-control label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.dark .volume-control label {
  color: #e2e8f0;
}

.volume-slider {
  width: 150px;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #ff6b9d;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.volume-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #ff6b9d;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.volume-value {
  font-weight: bold;
  color: #ff6b9d;
  min-width: 45px;
  text-align: right;
}

.dark .volume-value {
  color: #ffb6c1;
}

@media (max-width: 768px) {
  .bird-sounds-section {
    margin: 30px 10px 0;
    padding: 20px 15px;
  }

  .bird-sounds-player {
    gap: 20px;
  }

  .bird-info {
    padding: 15px;
  }

  .bird-name {
    font-size: 1.5rem;
  }

  .bird-scientific {
    font-size: 1rem;
  }

  .control-buttons {
    gap: 10px;
  }

  .control-button {
    padding: 12px 20px;
    font-size: 0.9rem;
    min-width: 100px;
  }

  .volume-control {
    padding: 12px;
  }

  .volume-slider {
    width: 120px;
  }
}
</style>
