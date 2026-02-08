<script setup lang="ts">
import { computed } from 'vue'
import { formatDateForTimezone } from '../../../utils/format'

export interface ClockData {
  title: string
  timezone: string
  label: string
  emoji: string
  sunrise: number // hour in 24h format (e.g., 6.5 = 6:30)
  sunset: number  // hour in 24h format (e.g., 18.5 = 18:30)
}

interface Props {
  clock: ClockData
  showSeconds?: boolean
}

withDefaults(defineProps<Props>(), {
  showSeconds: true
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

// Get current time as decimal hours (0-24)
const getCurrentHour = (timezone: string): number => {
  const time = getTimeForTimezone(timezone)
  return time.hours + time.minutes / 60 + time.seconds / 3600
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
</script>

<template>
  <div class="world-clock">
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
        <div v-if="showSeconds" class="clock-hand second-hand" :style="{ transform: `rotate(${getClockHands(clock.timezone).second}deg)` }"></div>

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
</template>

<style scoped>
.world-clock {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
}

.world-clock:hover {
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

.clock-number {
  position: absolute;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  transform: translate(-50%, -50%);
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

.minute-hand {
  width: 3px;
  height: 70px;
  background: #666;
  margin-left: -1.5px;
  z-index: 3;
}

.second-hand {
  width: 2px;
  height: 80px;
  background: #ff6b9d;
  margin-left: -1px;
  z-index: 4;
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

.clock-info {
  text-align: center;
}

.clock-label {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 8px 0;
}

.clock-digital {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ff6b9d;
  margin: 0 0 5px 0;
  font-family: 'Courier New', monospace;
}

.clock-date {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
  font-style: italic;
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

.dark .clock-title {
  color: #e2e8f0;
}

.dark .clock-face {
  background: linear-gradient(135deg, #2d3139 0%, #1f2229 100%);
  border-color: #ffb6c1;
}

.dark .clock-number {
  color: #e2e8f0;
}

.dark .hour-hand {
  background: #e2e8f0;
}

.dark .minute-hand {
  background: #a0a0a0;
}

.dark .second-hand {
  background: #ffb6c1;
}

.dark .clock-center {
  background: #ffb6c1;
  box-shadow: 0 0 5px rgba(255, 182, 193, 0.5);
}

.dark .clock-label {
  color: #a0a0a0;
}

.dark .clock-digital {
  color: #ffb6c1;
}

.dark .clock-date {
  color: #888;
}

.dark .daylight-text {
  color: #e2e8f0;
}

.dark .daylight-indicator:not(.day) .daylight-text {
  color: #e2e8f0;
}

@media (max-width: 768px) {
  .clock-face {
    width: 180px;
    height: 180px;
  }
}
</style>
