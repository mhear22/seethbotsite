<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/useAppStore'
import { useSolarStore } from '../../composables/useSolarStore'
import { useBatteryCalculator, BATTERY_PRESETS } from '../../composables/useBatteryCalculator'
import { useBatteryChart } from '../../composables/useBatteryChart'
import BatterySettings from '../battery/BatterySettings.vue'
import BatteryChart from '../battery/BatteryChart.vue'

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

// Chart logic
const hourlyData = computed(() => {
  const data = battery.generateHourlyData(estimatedKW.value)
  console.log('Hourly data:', data)
  return data
})

const chart = useBatteryChart(
  hourlyData,
  battery.solarKWAtTime,
  estimatedKW
)

// Debug chart data
console.log('Chart data:', {
  maxKW: chart.maxKW,
  maxKWh: chart.maxKWh,
  solarPath: chart.solarAreaPath,
  batteryPoints: chart.batteryLinePoints,
  usagePoints: chart.usageLinePoints
})
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

      <!-- Settings Component -->
      <BatterySettings
        :settings="battery.settings.value"
        :presets="BATTERY_PRESETS"
        @update:peak-sun-hours="battery.settings.value.peakSunHours = $event"
        @update:daily-usage-k-wh="battery.settings.value.dailyUsageKWh = $event"
        @update:days-of-autonomy="battery.settings.value.daysOfAutonomy = $event"
        @update:daylight-hours="battery.settings.value.daylightHours = $event"
        @add-preset="battery.addPreset($event)"
        @open-custom-modal="showCustomModal = true"
      />

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

      <!-- Chart Component -->
      <BatteryChart
        :CL="chart.CL"
        :CR="chart.CR"
        :CT="chart.CT"
        :CB="chart.CB"
        :CH="chart.CH"
        :CW="chart.CW"
        :chartHourLabels="chart.chartHourLabels"
        :solarAreaPath="chart.solarAreaPath.value"
        :usageLinePoints="chart.usageLinePoints.value"
        :batteryLinePoints="chart.batteryLinePoints.value"
        :maxKW="chart.maxKW.value"
        :maxKWh="chart.maxKWh.value"
        :hoverHour="chart.hoverHour.value"
        :hoverData="chart.hoverData.value"
        :tooltipX="chart.tooltipX.value"
        :hourToX="chart.hourToX"
        :kwToY="chart.kwToY"
        :kwhToY="chart.kwhToY"
        :formatHour="chart.formatHour"
        @chart-hover="chart.onChartHover($event)"
        @chart-leave="chart.hoverHour.value = null"
      />

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
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Cards */
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.battery-page.dark .card {
  background: #1e1e2e;
  border-color: #333;
}

.card h3 {
  margin: 0 0 20px 0;
  font-size: 1.3rem;
  color: #333;
}

.battery-page.dark .card h3 {
  color: #e0e0e0;
}

/* Summary card */
.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.summary-card h3 {
  color: white;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.summary-value {
  font-size: 1.8rem;
  font-weight: 700;
}

.summary-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Warning card */
.warning-card {
  background: #fff3cd;
  border: 2px solid #ffc107;
}

.warning-card h3 {
  color: #856404;
}

.warning-card p {
  color: #856404;
  margin: 8px 0 16px;
}

/* Selected batteries */
.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.selected-header h3 {
  margin: 0;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f8f8;
  border-radius: 8px;
}

.battery-page.dark .selected-entry {
  background: #2a2a40;
}

.entry-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.entry-name {
  font-weight: 600;
  color: #333;
}

.battery-page.dark .entry-name {
  color: #e0e0e0;
}

.entry-spec {
  font-size: 0.85rem;
  color: #666;
}

.battery-page.dark .entry-spec {
  color: #b0b0b0;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #333;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.qty-btn:hover {
  background: #f0f0f0;
}

.battery-page.dark .qty-btn {
  background: #1e1e2e;
  border-color: #444;
  color: #e0e0e0;
}

.qty-value {
  min-width: 30px;
  text-align: center;
  font-weight: 600;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 2px solid #ddd;
  font-weight: 700;
  font-size: 1.05rem;
}

.battery-page.dark .totals-row {
  border-color: #444;
}

/* Results */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #f8f8f8;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.battery-page.dark .stat-card {
  background: #2a2a40;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff91a4;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

.battery-page.dark .stat-label {
  color: #b0b0b0;
}

/* Coverage */
.coverage-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coverage-row {
  display: grid;
  grid-template-columns: 180px 1fr 60px;
  gap: 12px;
  align-items: center;
}

.coverage-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.battery-page.dark .coverage-label {
  color: #e0e0e0;
}

.check {
  color: #51cf66;
  margin-left: 8px;
}

.progress-bar {
  height: 24px;
  background: #eee;
  border-radius: 12px;
  overflow: hidden;
}

.battery-page.dark .progress-bar {
  background: #2a2a40;
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.progress-fill.best {
  background: linear-gradient(90deg, #51cf66, #37b24d);
}

.progress-fill.worst {
  background: linear-gradient(90deg, #ff8787, #ff6b6b);
}

.coverage-pct {
  font-weight: 600;
  text-align: right;
  color: #666;
}

.battery-page.dark .coverage-pct {
  color: #b0b0b0;
}

/* Toolbar buttons */
.toolbar-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: #f0f0f0;
}

.toolbar-btn.primary {
  background: linear-gradient(45deg, #ff91a4, #ffb347);
  color: white;
  border: none;
}

.toolbar-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 145, 164, 0.3);
}

.toolbar-btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.battery-page.dark .toolbar-btn {
  background: #2a2a40;
  border-color: #444;
  color: #e0e0e0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.battery-page.dark .modal-card {
  background: #1e1e2e;
}

.modal-card h3 {
  margin: 0 0 24px 0;
  font-size: 1.5rem;
}

.modal-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.setting-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
}

.battery-page.dark .setting-field label {
  color: #b0b0b0;
}

.setting-field input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.battery-page.dark .setting-field input {
  background: #2a2a40;
  border-color: #444;
  color: #e0e0e0;
}

.setting-field input:focus {
  outline: none;
  border-color: #ff91a4;
  box-shadow: 0 0 0 3px rgba(255, 145, 164, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .battery-page {
    padding: 60px 16px 30px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .coverage-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .coverage-pct {
    text-align: left;
  }
}
</style>
