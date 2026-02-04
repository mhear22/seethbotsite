<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../stores/useAppStore'

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
  }
]

const currentTime = ref(new Date())
let updateInterval: number | null = null

onMounted(() => {
  // Update clocks every second
  updateInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
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
    hour12: true
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

// Get sunrise position with offset applied
const getSunrisePosition = (sunrise: number, timezone: string): number => {
  const basePosition = (sunrise / 24) * 100
  const offset = getBarOffset(timezone)
  return basePosition + offset
}

// Get sunset position with offset applied
const getSunsetPosition = (sunset: number, timezone: string): number => {
  const basePosition = (sunset / 24) * 100
  const offset = getBarOffset(timezone)
  return basePosition + offset
}

// Check if current time is during daylight
const isDaylight = (timezone: string, sunrise: number, sunset: number): boolean => {
  const hour = getCurrentHour(timezone)
  return hour >= sunrise && hour < sunset
}

// Format hour to readable time
const formatHour = (hour: number): string => {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 || 12
  return m === 0 ? `${displayHour} ${ampm}` : `${displayHour}:${m.toString().padStart(2, '0')} ${ampm}`
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
              <div
                class="time-bar-day"
                :style="{
                  left: getSunrisePosition(clock.sunrise, clock.timezone) + '%',
                  width: (getSunsetPosition(clock.sunset, clock.timezone) - getSunrisePosition(clock.sunrise, clock.timezone)) + '%'
                }"
              ></div>

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
  max-width: 1200px;
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
  max-width: 900px;
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
</style>
