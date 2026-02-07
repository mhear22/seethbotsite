<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/useAppStore'
import { useSolarStore } from '../../composables/useSolarStore'
import { useBatteryCalculator, BATTERY_PRESETS } from '../../composables/useBatteryCalculator'

const store = useAppStore()
const router = useRouter()
const solarStore = useSolarStore()
const battery = useBatteryCalculator()

const hasSolarData = computed(() => solarStore.solarResults.value !== null)
const estimatedKW = computed(() => solarStore.solarResults.value?.estimatedKW ?? 0)
const panelCount = computed(() => solarStore.solarResults.value?.panelCount ?? 0)

const results = computed(() => battery.calculateResults(estimatedKW.value))

// Custom battery modal
const showCustomModal = ref(false)

function handleAddCustom() {
  battery.addCustom()
  showCustomModal.value = false
}

// 24hr Chart
const hourlyData = computed(() => battery.generateHourlyData(estimatedKW.value))
const hoverHour = ref<number | null>(null)

// Chart layout constants
const CL = 55, CR = 745, CT = 15, CB = 275
const CW = CR - CL, CH = CB - CT

function hourToX(h: number): number {
  return CL + (h / 24) * CW
}

const maxKW = computed(() => {
  const m = Math.max(...hourlyData.value.map(p => Math.max(p.solarKW, p.usageKW)))
  return Math.max(m * 1.15, 0.5)
})

const maxKWh = computed(() => {
  const m = Math.max(...hourlyData.value.map(p => p.batteryKWh))
  return Math.max(m * 1.15, 0.5)
})

function kwToY(v: number): number {
  return CB - (v / maxKW.value) * CH
}

function kwhToY(v: number): number {
  return CB - (v / maxKWh.value) * CH
}

const solarAreaPath = computed(() => {
  let d = `M ${CL} ${CB}`
  for (let t = 0; t <= 24; t += 0.25) {
    const solar = battery.solarKWAtTime(t, estimatedKW.value)
    d += ` L ${hourToX(t).toFixed(1)} ${kwToY(solar).toFixed(1)}`
  }
  d += ` L ${CR} ${CB} Z`
  return d
})

const batteryLinePoints = computed(() => {
  return hourlyData.value
    .map(p => `${hourToX(p.hour).toFixed(1)},${kwhToY(p.batteryKWh).toFixed(1)}`)
    .join(' ')
})

const usageY = computed(() => kwToY(hourlyData.value[0]?.usageKW ?? 0))

const hoverData = computed(() => {
  if (hoverHour.value === null) return null
  return hourlyData.value[hoverHour.value] ?? null
})

const tooltipX = computed(() => {
  if (hoverHour.value === null) return 0
  const x = hourToX(hoverHour.value)
  return x > CR - 175 ? x - 170 : x + 12
})

function onChartHover(event: MouseEvent) {
  const svg = event.currentTarget as SVGSVGElement
  const rect = svg.getBoundingClientRect()
  const x = event.clientX - rect.left
  const svgX = (x / rect.width) * 800
  const hour = Math.round(((svgX - CL) / CW) * 24)
  hoverHour.value = (hour >= 0 && hour <= 24) ? hour : null
}

function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? h + 'am' : (h - 12) + 'pm'
}

const chartHourLabels = [0, 3, 6, 9, 12, 15, 18, 21, 24]
</script>

<template>
  <div class="page battery-page" :class="{ dark: store.darkMode }">
    <div class="page-header">
      <h1>Battery Calculator</h1>
      <p class="subtitle">Step 2: Size your battery storage</p>
    </div>

    <div class="battery-layout">
      <!-- Back button -->
      <button class="back-btn" @click="router.push('/solar')">
        &larr; Back to Panel Layout
      </button>

      <!-- Solar summary or warning -->
      <div v-if="hasSolarData" class="card summary-card">
        <h3>Solar Panel Results</h3>
        <div class="summary-grid">
          <div class="summary-stat">
            <span class="summary-value">{{ estimatedKW.toFixed(2) }} kW</span>
            <span class="summary-label">Estimated Power</span>
          </div>
          <div class="summary-stat">
            <span class="summary-value">{{ panelCount }}</span>
            <span class="summary-label">Panels</span>
          </div>
        </div>
      </div>
      <div v-else class="card warning-card">
        <h3>No Solar Data</h3>
        <p>Complete the panel layout first to get your estimated power generation.</p>
        <button class="toolbar-btn primary" @click="router.push('/solar')">Go to Panel Calculator</button>
      </div>

      <!-- Settings -->
      <div class="card">
        <h3>Settings</h3>
        <div class="settings-grid">
          <div class="setting-field">
            <label>Peak Sun Hours</label>
            <input type="number" v-model.number="battery.settings.value.peakSunHours" min="1" max="12" step="0.5" />
          </div>
          <div class="setting-field">
            <label>Daily Usage (kWh)</label>
            <input type="number" v-model.number="battery.settings.value.dailyUsageKWh" min="1" max="200" step="1" />
          </div>
          <div class="setting-field">
            <label>Days of Autonomy</label>
            <input type="number" v-model.number="battery.settings.value.daysOfAutonomy" min="1" max="7" step="1" />
          </div>
        </div>
      </div>

      <!-- Battery Options -->
      <div class="card">
        <h3>Battery Options</h3>
        <div class="presets-grid">
          <div
            v-for="preset in BATTERY_PRESETS"
            :key="preset.id"
            class="preset-card"
          >
            <div class="preset-name">{{ preset.name }}</div>
            <div class="preset-specs">
              <span>{{ preset.capacityKWh }} kWh</span>
              <span>{{ preset.powerKW }} kW</span>
              <span>{{ preset.efficiency }}% eff</span>
              <span>{{ preset.warrantyYears }} yr warranty</span>
            </div>
            <button class="add-btn" @click="battery.addPreset(preset)">+ Add</button>
          </div>
          <!-- Custom battery card -->
          <div class="preset-card custom-preset" @click="showCustomModal = true">
            <div class="preset-name">Custom Battery</div>
            <div class="preset-specs">
              <span>Define your own specs</span>
            </div>
            <span class="add-btn">+ Configure</span>
          </div>
        </div>
      </div>

      <!-- Selected Batteries -->
      <div class="card" v-if="battery.selectedBatteries.value.length > 0">
        <div class="selected-header">
          <h3>Selected Batteries</h3>
          <button class="toolbar-btn" @click="battery.clearAll()">Clear All</button>
        </div>
        <div class="selected-list">
          <div
            v-for="entry in battery.selectedBatteries.value"
            :key="entry.battery.id"
            class="selected-entry"
          >
            <div class="entry-info">
              <span class="entry-name">{{ entry.battery.name }}</span>
              <span class="entry-spec">{{ entry.battery.capacityKWh }} kWh / {{ entry.battery.powerKW }} kW</span>
            </div>
            <div class="qty-controls">
              <button class="qty-btn" @click="battery.decrementQuantity(entry.battery.id)">-</button>
              <span class="qty-value">{{ entry.quantity }}</span>
              <button class="qty-btn" @click="battery.incrementQuantity(entry.battery.id)">+</button>
            </div>
          </div>
          <div class="totals-row">
            <span>Total</span>
            <span>{{ battery.totalCapacity.value.toFixed(1) }} kWh / {{ battery.totalPower.value.toFixed(1) }} kW</span>
          </div>
        </div>
      </div>

      <!-- 24hr Graph -->
      <div class="card chart-card">
        <h3>24-Hour Energy Profile</h3>
        <svg viewBox="0 0 800 330" class="chart-svg" @mousemove="onChartHover" @mouseleave="hoverHour = null">
          <!-- Grid lines -->
          <line
            v-for="h in chartHourLabels" :key="'vg-'+h"
            :x1="hourToX(h)" :y1="CT" :x2="hourToX(h)" :y2="CB"
            class="chart-grid"
          />
          <line
            v-for="frac in [0.25, 0.5, 0.75]" :key="'hg-'+frac"
            :x1="CL" :y1="CB - frac * CH" :x2="CR" :y2="CB - frac * CH"
            class="chart-grid"
          />

          <!-- Axes -->
          <line :x1="CL" :y1="CT" :x2="CL" :y2="CB" class="chart-axis" />
          <line :x1="CR" :y1="CT" :x2="CR" :y2="CB" class="chart-axis" />
          <line :x1="CL" :y1="CB" :x2="CR" :y2="CB" class="chart-axis" />

          <!-- Solar area -->
          <path :d="solarAreaPath" class="solar-area" />

          <!-- Usage line -->
          <line :x1="CL" :y1="usageY" :x2="CR" :y2="usageY" class="usage-line" />

          <!-- Battery line -->
          <polyline :points="batteryLinePoints" class="battery-line" />

          <!-- Left Y-axis labels (kW) -->
          <text :x="CL - 8" :y="CB + 4" text-anchor="end" class="axis-label">0</text>
          <text :x="CL - 8" :y="CB - CH / 2 + 4" text-anchor="end" class="axis-label">{{ (maxKW / 2).toFixed(1) }}</text>
          <text :x="CL - 8" :y="CT + 4" text-anchor="end" class="axis-label">{{ maxKW.toFixed(1) }}</text>
          <text :x="CL - 8" :y="CT - 5" text-anchor="end" class="axis-unit">kW</text>

          <!-- Right Y-axis labels (kWh) -->
          <text :x="CR + 8" :y="CB + 4" text-anchor="start" class="axis-label">0</text>
          <text :x="CR + 8" :y="CB - CH / 2 + 4" text-anchor="start" class="axis-label">{{ (maxKWh / 2).toFixed(1) }}</text>
          <text :x="CR + 8" :y="CT + 4" text-anchor="start" class="axis-label">{{ maxKWh.toFixed(1) }}</text>
          <text :x="CR + 8" :y="CT - 5" text-anchor="start" class="axis-unit">kWh</text>

          <!-- X-axis labels -->
          <g v-for="h in chartHourLabels" :key="'xl-'+h">
            <line :x1="hourToX(h)" :y1="CB" :x2="hourToX(h)" :y2="CB + 5" class="chart-axis" />
            <text :x="hourToX(h)" :y="CB + 18" text-anchor="middle" class="axis-label">{{ formatHour(h) }}</text>
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
            <line
              :x1="hourToX(hoverHour)" :y1="CT"
              :x2="hourToX(hoverHour)" :y2="CB"
              class="hover-line"
            />
            <circle :cx="hourToX(hoverHour)" :cy="kwToY(hoverData.solarKW)" r="4" class="dot-solar" />
            <circle :cx="hourToX(hoverHour)" :cy="usageY" r="4" class="dot-usage" />
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

      <!-- Results -->
      <div class="card results-card">
        <h3>Results</h3>
        <div class="results-grid">
          <div class="stat-card">
            <div class="stat-value">{{ results.dailyGeneration.toFixed(1) }} kWh</div>
            <div class="stat-label">Daily Generation</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ results.bestCaseStorage.toFixed(1) }} kWh</div>
            <div class="stat-label">Best Case Needed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ results.worstCaseStorage.toFixed(1) }} kWh</div>
            <div class="stat-label">Worst Case Needed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ results.weightedEfficiency.toFixed(0) }}%</div>
            <div class="stat-label">Avg Efficiency</div>
          </div>
        </div>

        <!-- Coverage bars -->
        <div class="coverage-section">
          <div class="coverage-row">
            <div class="coverage-label">
              Best Case (Sunny)
              <span v-if="results.bestCaseCoverage >= 100" class="check">&#10003;</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill best" :style="{ width: Math.min(100, results.bestCaseCoverage) + '%' }"></div>
            </div>
            <span class="coverage-pct">{{ results.bestCaseCoverage.toFixed(0) }}%</span>
          </div>
          <div class="coverage-row">
            <div class="coverage-label">
              Worst Case (Autonomy)
              <span v-if="results.worstCaseCoverage >= 100" class="check">&#10003;</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill worst" :style="{ width: Math.min(100, results.worstCaseCoverage) + '%' }"></div>
            </div>
            <span class="coverage-pct">{{ results.worstCaseCoverage.toFixed(0) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Battery Modal -->
    <div v-if="showCustomModal" class="modal-overlay" @click.self="showCustomModal = false">
      <div class="modal-card">
        <h3>Custom Battery</h3>
        <div class="modal-fields">
          <div class="setting-field">
            <label>Name</label>
            <input type="text" v-model="battery.customBattery.value.name" placeholder="My Battery" />
          </div>
          <div class="setting-field">
            <label>Capacity (kWh)</label>
            <input type="number" v-model.number="battery.customBattery.value.capacityKWh" min="0.1" max="100" step="0.1" />
          </div>
          <div class="setting-field">
            <label>Power (kW)</label>
            <input type="number" v-model.number="battery.customBattery.value.powerKW" min="0.1" max="50" step="0.1" />
          </div>
          <div class="setting-field">
            <label>Efficiency (%)</label>
            <input type="number" v-model.number="battery.customBattery.value.efficiency" min="50" max="100" step="1" />
          </div>
        </div>
        <div class="modal-actions">
          <button class="toolbar-btn" @click="showCustomModal = false">Cancel</button>
          <button class="toolbar-btn primary" @click="handleAddCustom" :disabled="!battery.customBattery.value.name.trim()">Add Battery</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.battery-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 80px 20px 40px;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 8px;
  background: linear-gradient(45deg, #ff91a4, #ffb347);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.battery-page.dark .subtitle {
  color: #aaa;
}

.battery-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Back button */
.back-btn {
  align-self: flex-start;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f8f8;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #eee;
  transform: translateY(-1px);
}

.battery-page.dark .back-btn {
  background: #2a2a40;
  border-color: #444;
  color: #ddd;
}

.battery-page.dark .back-btn:hover {
  background: #3a3a55;
}

/* Card base */
.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
}

.battery-page.dark .card {
  background: rgba(30, 30, 45, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card h3 {
  margin: 0 0 16px;
  font-size: 1.3rem;
  color: #333;
}

.battery-page.dark .card h3 {
  color: #eee;
}

/* Warning card */
.warning-card {
  border: 2px solid #ffb347;
}

.warning-card p {
  color: #666;
  margin: 0 0 12px;
}

.battery-page.dark .warning-card p {
  color: #aaa;
}

/* Summary card */
.summary-card {
  border: 1px solid rgba(255, 145, 164, 0.3);
}

.summary-grid {
  display: flex;
  gap: 24px;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #ff91a4;
}

.summary-label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.battery-page.dark .summary-label {
  color: #999;
}

/* Settings */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.setting-field label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 6px;
}

.battery-page.dark .setting-field label {
  color: #aaa;
}

.setting-field input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f8f8f8;
  color: #333;
  box-sizing: border-box;
}

.setting-field input:focus {
  outline: none;
  border-color: #ff91a4;
  box-shadow: 0 0 0 3px rgba(255, 145, 164, 0.15);
}

.battery-page.dark .setting-field input {
  background: #2a2a40;
  border-color: #444;
  color: #eee;
}

.battery-page.dark .setting-field input:focus {
  border-color: #ff91a4;
  box-shadow: 0 0 0 3px rgba(255, 145, 164, 0.2);
}

/* Presets grid */
.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.preset-card {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.2s ease;
}

.preset-card:hover {
  border-color: #ff91a4;
  box-shadow: 0 2px 8px rgba(255, 145, 164, 0.15);
}

.battery-page.dark .preset-card {
  background: #1e1e30;
  border-color: #444;
}

.battery-page.dark .preset-card:hover {
  border-color: #ff91a4;
}

.custom-preset {
  border-style: dashed;
  cursor: pointer;
  text-align: center;
}

.custom-preset:hover {
  border-color: #ffb347;
  box-shadow: 0 2px 8px rgba(255, 179, 71, 0.15);
}

.preset-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 8px;
  color: #333;
}

.battery-page.dark .preset-name {
  color: #eee;
}

.preset-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.custom-preset .preset-specs {
  justify-content: center;
}

.preset-specs span {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(255, 145, 164, 0.1);
  color: #888;
}

.battery-page.dark .preset-specs span {
  background: rgba(255, 145, 164, 0.08);
  color: #999;
}

.add-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff91a4, #ffb347);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Toolbar buttons */
.toolbar-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f8f8;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.toolbar-btn:hover:not(:disabled) {
  background: #eee;
  transform: translateY(-1px);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn.primary {
  background: linear-gradient(135deg, #ff91a4, #ffb347);
  color: white;
  border: none;
}

.toolbar-btn.primary:hover:not(:disabled) {
  opacity: 0.9;
}

.battery-page.dark .toolbar-btn {
  background: #2a2a40;
  border-color: #444;
  color: #ddd;
}

.battery-page.dark .toolbar-btn:hover:not(:disabled) {
  background: #3a3a55;
}

.battery-page.dark .toolbar-btn.primary {
  background: linear-gradient(135deg, #ff91a4, #ffb347);
  color: white;
}

/* Selected batteries */
.selected-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.selected-header h3 {
  margin: 0;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: #fafafa;
}

.battery-page.dark .selected-entry {
  background: #1e1e30;
  border-color: #444;
}

.entry-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entry-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
}

.battery-page.dark .entry-name {
  color: #eee;
}

.entry-spec {
  font-size: 0.8rem;
  color: #888;
}

.battery-page.dark .entry-spec {
  color: #999;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f0f0f0;
  color: #333;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.qty-btn:hover {
  background: #e0e0e0;
}

.battery-page.dark .qty-btn {
  background: #2a2a40;
  border-color: #555;
  color: #ddd;
}

.battery-page.dark .qty-btn:hover {
  background: #3a3a55;
}

.qty-value {
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 24px;
  text-align: center;
  color: #333;
}

.battery-page.dark .qty-value {
  color: #eee;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 2px solid rgba(255, 145, 164, 0.3);
  margin-top: 4px;
  font-weight: 600;
  color: #ff91a4;
}

/* 24hr Chart */
.chart-svg {
  width: 100%;
  cursor: crosshair;
}

.chart-grid {
  stroke: #e8e8e8;
  stroke-width: 0.5;
}

.battery-page.dark .chart-grid {
  stroke: #333;
}

.chart-axis {
  stroke: #ccc;
  stroke-width: 1;
}

.battery-page.dark .chart-axis {
  stroke: #555;
}

.axis-label {
  fill: #888;
  font-size: 10px;
  font-family: system-ui, sans-serif;
}

.battery-page.dark .axis-label {
  fill: #777;
}

.axis-unit {
  fill: #999;
  font-size: 9px;
  font-family: system-ui, sans-serif;
}

.battery-page.dark .axis-unit {
  fill: #666;
}

.legend-text {
  fill: #888;
  font-size: 10px;
  font-family: system-ui, sans-serif;
}

.battery-page.dark .legend-text {
  fill: #777;
}

.legend-solar-swatch {
  fill: rgba(255, 179, 71, 0.4);
  stroke: #ffb347;
  stroke-width: 1;
}

.legend-usage-line {
  stroke: #ff91a4;
  stroke-width: 2;
  stroke-dasharray: 4 3;
}

.legend-battery-line {
  stroke: #22c55e;
  stroke-width: 2.5;
}

.solar-area {
  fill: rgba(255, 179, 71, 0.3);
  stroke: #ffb347;
  stroke-width: 1.5;
}

.usage-line {
  stroke: #ff91a4;
  stroke-width: 2;
  stroke-dasharray: 6 4;
}

.battery-line {
  fill: none;
  stroke: #22c55e;
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.hover-line {
  stroke: #888;
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.battery-page.dark .hover-line {
  stroke: #666;
}

.dot-solar {
  fill: #ffb347;
  stroke: white;
  stroke-width: 1.5;
}

.dot-usage {
  fill: #ff91a4;
  stroke: white;
  stroke-width: 1.5;
}

.dot-battery {
  fill: #22c55e;
  stroke: white;
  stroke-width: 1.5;
}

.battery-page.dark .dot-solar,
.battery-page.dark .dot-usage,
.battery-page.dark .dot-battery {
  stroke: #1e1e2d;
}

.tooltip-bg {
  fill: rgba(255, 255, 255, 0.95);
  stroke: #ddd;
  stroke-width: 1;
}

.battery-page.dark .tooltip-bg {
  fill: rgba(30, 30, 45, 0.95);
  stroke: #555;
}

.tt-title {
  fill: #333;
  font-size: 11px;
  font-weight: 600;
  font-family: system-ui, sans-serif;
}

.battery-page.dark .tt-title {
  fill: #eee;
}

.tt-solar {
  fill: #c07808;
  font-size: 10px;
  font-family: system-ui, sans-serif;
}

.tt-usage {
  fill: #d04060;
  font-size: 10px;
  font-family: system-ui, sans-serif;
}

.tt-battery {
  fill: #16803c;
  font-size: 10px;
  font-family: system-ui, sans-serif;
}

.battery-page.dark .tt-solar {
  fill: #ffb347;
}

.battery-page.dark .tt-usage {
  fill: #ff91a4;
}

.battery-page.dark .tt-battery {
  fill: #4ade80;
}

/* Results */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.stat-card {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, rgba(255, 145, 164, 0.1), rgba(255, 179, 71, 0.1));
  border-radius: 12px;
  border: 1px solid rgba(255, 145, 164, 0.2);
}

.battery-page.dark .stat-card {
  background: linear-gradient(135deg, rgba(255, 145, 164, 0.08), rgba(255, 179, 71, 0.08));
  border-color: rgba(255, 145, 164, 0.15);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff91a4;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.battery-page.dark .stat-label {
  color: #999;
}

/* Coverage bars */
.coverage-section {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.coverage-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.coverage-label {
  min-width: 160px;
  font-size: 0.9rem;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
}

.battery-page.dark .coverage-label {
  color: #ccc;
}

.check {
  color: #22c55e;
  font-weight: bold;
  font-size: 1.1rem;
}

.progress-bar {
  flex: 1;
  height: 20px;
  background: #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
}

.battery-page.dark .progress-bar {
  background: #2a2a40;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.4s ease;
}

.progress-fill.best {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.progress-fill.worst {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.coverage-pct {
  min-width: 44px;
  text-align: right;
  font-weight: 600;
  font-size: 0.9rem;
  color: #555;
}

.battery-page.dark .coverage-pct {
  color: #ccc;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.battery-page.dark .modal-card {
  background: #1e1e2d;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-card h3 {
  margin: 0 0 20px;
  font-size: 1.3rem;
  color: #333;
}

.battery-page.dark .modal-card h3 {
  color: #eee;
}

.modal-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 600px) {
  .battery-page {
    padding: 60px 12px 30px;
  }

  .page-header h1 {
    font-size: 1.8rem;
  }

  .card {
    padding: 16px;
  }

  .presets-grid {
    grid-template-columns: 1fr;
  }

  .settings-grid {
    grid-template-columns: 1fr 1fr;
  }

  .results-grid {
    grid-template-columns: 1fr 1fr;
  }

  .coverage-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .coverage-label {
    min-width: auto;
  }

  .progress-bar {
    width: 100%;
  }

  .coverage-pct {
    min-width: auto;
  }
}
</style>
