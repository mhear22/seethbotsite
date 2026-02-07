<script setup lang="ts">
import type { ClockData } from './WorldClock.vue'

interface Props {
  clocks: ClockData[]
}

defineProps<Props>()

// Get current time as decimal hours (0-24)
const getCurrentHour = (timezone: string): number => {
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', { timeZone: timezone, hour12: false })
  const [hours, minutes, seconds] = timeString.split(':').map(Number)
  return hours + minutes / 60 + seconds / 3600
}

// Fixed "now" position at center (50%)
const NOW_POSITION = 50

// Get offset to align current time with the fixed "now" position
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
</script>

<template>
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
</template>

<style scoped>
.time-bars-section {
  max-width: 800px;
  margin: 40px auto 0;
  padding: 25px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
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

@media (max-width: 768px) {
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

.dark .time-bars-section {
  background: rgba(40, 44, 52, 0.95);
}

.dark .bar-title {
  color: #e2e8f0;
}

.dark .time-marker-dot {
  border-color: #2d3139;
}

.dark .time-bar-current-label {
  color: #ffb6c1;
}

.dark .now-label {
  color: #ffb6c1;
}
</style>
