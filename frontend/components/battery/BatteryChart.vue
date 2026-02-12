<template>
  <div class="card chart-card">
    <h3>24-Hour Energy Profile</h3>
    <svg
      viewBox="0 0 800 330"
      class="chart-svg"
      @mousemove="onChartHover"
      @mouseleave="onChartLeave"
    >
      <!-- Grid lines -->
      <line
        v-for="h in chartHourLabels"
        :key="'vg-' + h"
        :x1="hourToX(h)"
        :y1="CT"
        :x2="hourToX(h)"
        :y2="CB"
        class="chart-grid"
      />
      <line
        v-for="frac in [0.25, 0.5, 0.75]"
        :key="'hg-' + frac"
        :x1="CL"
        :y1="CB - frac * CH"
        :x2="CR"
        :y2="CB - frac * CH"
        class="chart-grid"
      />

      <!-- Axes -->
      <line :x1="CL" :y1="CT" :x2="CL" :y2="CB" class="chart-axis" />
      <line :x1="CR" :y1="CT" :x2="CR" :y2="CB" class="chart-axis" />
      <line :x1="CL" :y1="CB" :x2="CR" :y2="CB" class="chart-axis" />

      <!-- Solar area -->
      <path :d="solarAreaPath" class="solar-area" />

      <!-- Usage line -->
      <polyline :points="usageLinePoints" class="usage-line" />

      <!-- Battery line -->
      <polyline :points="batteryLinePoints" class="battery-line" />

      <!-- Left Y-axis labels (kW) -->
      <text :x="CL - 8" :y="CB + 4" text-anchor="end" class="axis-label">0</text>
      <text :x="CL - 8" :y="CB - CH / 2 + 4" text-anchor="end" class="axis-label">
        {{ (maxKW / 2).toFixed(1) }}
      </text>
      <text :x="CL - 8" :y="CT + 4" text-anchor="end" class="axis-label">
        {{ maxKW.toFixed(1) }}
      </text>
      <text :x="CL - 8" :y="CT - 5" text-anchor="end" class="axis-unit">kW</text>

      <!-- Right Y-axis labels (kWh) -->
      <text :x="CR + 8" :y="CB + 4" text-anchor="start" class="axis-label">0</text>
      <text :x="CR + 8" :y="CB - CH / 2 + 4" text-anchor="start" class="axis-label">
        {{ (maxKWh / 2).toFixed(1) }}
      </text>
      <text :x="CR + 8" :y="CT + 4" text-anchor="start" class="axis-label">
        {{ maxKWh.toFixed(1) }}
      </text>
      <text :x="CR + 8" :y="CT - 5" text-anchor="start" class="axis-unit">kWh</text>

      <!-- X-axis labels -->
      <g v-for="h in chartHourLabels" :key="'xl-' + h">
        <line :x1="hourToX(h)" :y1="CB" :x2="hourToX(h)" :y2="CB + 5" class="chart-axis" />
        <text :x="hourToX(h)" :y="CB + 18" text-anchor="middle" class="axis-label">
          {{ formatHour(h) }}
        </text>
      </g>

      <!-- Legend -->
      <g transform="translate(55, 305)">
        <rect x="0" y="0" width="16" height="10" rx="2" class="legend-solar-swatch" />
        <text x="22" y="9" class="legend-text">Solar (kW)</text>
        <line x1="150" y1="5" x2="174" y2="5" class="legend-usage-line" />
        <text x="180" y="9" class="legend-text">Usage (kW)</text>
        <line x1="290" y1="5" x2="314" y2="5" class="legend-battery-line" />
        <text x="320" y="9" class="legend-text">Battery (kWh)</text>
      </g>

      <!-- Hover elements -->
      <g v-if="hoverHour !== null && hoverData">
        <line :x1="hourToX(hoverHour)" :y1="CT" :x2="hourToX(hoverHour)" :y2="CB" class="hover-line" />
        <circle :cx="hourToX(hoverHour)" :cy="kwToY(hoverData.solarKW)" r="4" class="dot-solar" />
        <circle :cx="hourToX(hoverHour)" :cy="kwToY(hoverData.usageKW)" r="4" class="dot-usage" />
        <circle :cx="hourToX(hoverHour)" :cy="kwhToY(hoverData.batteryKWh)" r="4" class="dot-battery" />

        <!-- Tooltip -->
        <g :transform="`translate(${tooltipX}, 22)`">
          <rect x="0" y="0" width="160" height="78" rx="8" class="tooltip-bg" />
          <text x="10" y="16" class="tt-title">{{ formatHour(hoverHour) }}</text>
          <text x="10" y="34" class="tt-solar">Solar: {{ hoverData.solarKW.toFixed(2) }} kW</text>
          <text x="10" y="50" class="tt-usage">Usage: {{ hoverData.usageKW.toFixed(2) }} kW</text>
          <text x="10" y="66" class="tt-battery">Stored: {{ hoverData.batteryKWh.toFixed(1) }} kWh</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'

interface HourlyDataPoint {
  hour: number
  solarKW: number
  usageKW: number
  batteryKWh: number
}

const props = defineProps<{
  CL: number
  CR: number
  CT: number
  CB: number
  CH: number
  CW: number
  chartHourLabels: number[]
  solarAreaPath: string
  usageLinePoints: string
  batteryLinePoints: string
  maxKW: number
  maxKWh: number
  hoverHour: number | null
  hoverData: HourlyDataPoint | null
  tooltipX: number
  hourToX: (h: number) => number
  kwToY: (v: number) => number
  kwhToY: (v: number) => number
  formatHour: (h: number) => string
}>()

// Debug props
watchEffect(() => {
  console.log('BatteryChart props:', {
    maxKW: props.maxKW,
    maxKWh: props.maxKWh,
    solarAreaPath: props.solarAreaPath?.substring(0, 50),
    usageLinePoints: props.usageLinePoints?.substring(0, 50),
    batteryLinePoints: props.batteryLinePoints?.substring(0, 50),
    hourToX: typeof props.hourToX,
    kwToY: typeof props.kwToY
  })
})

const emit = defineEmits<{
  'chart-hover': [event: MouseEvent]
  'chart-leave': []
}>()

const onChartHover = (event: MouseEvent) => {
  emit('chart-hover', event)
}

const onChartLeave = () => {
  emit('chart-leave')
}
</script>

<style scoped>
.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-card h3 {
  margin: 0 0 16px 0;
  font-size: 1.3rem;
  color: #333;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
  user-select: none;
}

/* Grid and axes */
.chart-grid {
  stroke: #e0e0e0;
  stroke-width: 1;
}

.chart-axis {
  stroke: #999;
  stroke-width: 1.5;
}

/* Solar area */
.solar-area {
  fill: rgba(255, 179, 71, 0.3);
  stroke: #ffb347;
  stroke-width: 2;
}

/* Usage line */
.usage-line {
  fill: none;
  stroke: #ff6b6b;
  stroke-width: 2.5;
  stroke-linejoin: round;
}

/* Battery line */
.battery-line {
  fill: none;
  stroke: #51cf66;
  stroke-width: 2.5;
  stroke-linejoin: round;
}

/* Axis labels */
.axis-label {
  font-size: 11px;
  fill: #666;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.axis-unit {
  font-size: 12px;
  fill: #999;
  font-weight: 600;
}

/* Legend */
.legend-solar-swatch {
  fill: rgba(255, 179, 71, 0.5);
  stroke: #ffb347;
  stroke-width: 1.5;
}

.legend-usage-line {
  stroke: #ff6b6b;
  stroke-width: 3;
}

.legend-battery-line {
  stroke: #51cf66;
  stroke-width: 3;
}

.legend-text {
  font-size: 12px;
  fill: #666;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Hover elements */
.hover-line {
  stroke: #666;
  stroke-width: 1;
  stroke-dasharray: 4 2;
  pointer-events: none;
}

.dot-solar {
  fill: #ffb347;
  stroke: white;
  stroke-width: 2;
  pointer-events: none;
}

.dot-usage {
  fill: #ff6b6b;
  stroke: white;
  stroke-width: 2;
  pointer-events: none;
}

.dot-battery {
  fill: #51cf66;
  stroke: white;
  stroke-width: 2;
  pointer-events: none;
}

/* Tooltip */
.tooltip-bg {
  fill: rgba(0, 0, 0, 0.9);
  stroke: white;
  stroke-width: 1;
  pointer-events: none;
}

.tt-title {
  font-size: 13px;
  font-weight: 700;
  fill: white;
  pointer-events: none;
}

.tt-solar {
  font-size: 11px;
  fill: #ffb347;
  pointer-events: none;
}

.tt-usage {
  font-size: 11px;
  fill: #ff6b6b;
  pointer-events: none;
}

.tt-battery {
  font-size: 11px;
  fill: #51cf66;
  pointer-events: none;
}

/* Dark mode */
.dark .chart-card {
  background: #1e1e2e;
}

.dark .chart-card h3 {
  color: #e0e0e0;
}

.dark .chart-grid {
  stroke: #444;
}

.dark .chart-axis {
  stroke: #666;
}

.dark .axis-label,
.dark .legend-text {
  fill: #b0b0b0;
}

.dark .axis-unit {
  fill: #888;
}

@media (max-width: 768px) {
  .chart-card {
    padding: 16px;
  }

  .axis-label,
  .legend-text {
    font-size: 10px;
  }
}
</style>
