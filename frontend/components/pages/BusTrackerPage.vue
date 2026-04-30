<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Vehicle {
  id: string
  tripId: string
  routeId: string
  directionId: number
  latitude: number
  longitude: number
  bearing: number
  speed: number
  timestamp: number
  occupancyStatus: number
  congestionLevel: number
  stopId: string
}

type TransitMode = 'Bus' | 'Rail' | 'Tram' | 'Ferry'

const vehicles = ref<Vehicle[]>([])
const loading = ref(true)
const error = ref('')
const selectedMode = ref<TransitMode>('Bus')
const routeFilter = ref('')
const availableRoutes = ref<string[]>([])
const lastUpdated = ref<Date | null>(null)
const selectedVehicle = ref<Vehicle | null>(null)
const autoRefresh = ref(true)
const vehicleCount = ref(0)

let map: L.Map | null = null
let markers: L.Marker[] = []
let refreshInterval: ReturnType<typeof setInterval> | null = null

const brisbaneCenter: [number, number] = [-27.4698, 153.0251]

const modeEmoji: Record<TransitMode, string> = {
  Bus: '🚌',
  Rail: '🚆',
  Tram: '🚋',
  Ferry: '⛴️',
}

const occupancyLabels: Record<number, string> = {
  0: '',
  1: 'Many seats available',
  2: 'Few seats available',
  3: 'Standing room only',
  4: 'Full',
}

const filteredVehicles = computed(() => {
  if (!routeFilter.value) return vehicles.value
  return vehicles.value.filter(v =>
    v.routeId.toLowerCase().includes(routeFilter.value.toLowerCase())
  )
})

function formatDelay(seconds: number): string {
  if (seconds === 0) return 'On time'
  const mins = Math.round(seconds / 60)
  if (mins > 0) return `+${mins} min late`
  return `${mins} min early`
}

function formatTime(timestamp: number): string {
  if (!timestamp) return 'N/A'
  return new Date(timestamp * 1000).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  return `${Math.floor(seconds / 60)}m ago`
}

function createBusIcon(bearing: number, routeId: string): L.DivIcon {
  const shortRoute = routeId.split('-').pop() || routeId
  const color = getRouteColor(routeId)
  return L.divIcon({
    className: 'bus-marker',
    html: `<div class="bus-icon" style="background:${color};transform:rotate(${bearing}deg)">
      <span class="bus-route">${shortRoute}</span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function getRouteColor(routeId: string): string {
  // Generate consistent colors for routes
  let hash = 0
  for (let i = 0; i < routeId.length; i++) {
    hash = routeId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 45%)`
}

async function fetchVehicles() {
  try {
    error.value = ''
    const mode = selectedMode.value
    const params = new URLSearchParams({ mode })
    if (routeFilter.value) params.set('route', routeFilter.value)

    const res = await fetch(`/api/bus-tracker/vehicles?${params}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    vehicles.value = data.vehicles || []
    vehicleCount.value = data.count || 0
    lastUpdated.value = new Date()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function fetchRoutes() {
  try {
    const res = await fetch(`/api/bus-tracker/routes?mode=${selectedMode.value}`)
    if (!res.ok) return
    const data = await res.json()
    availableRoutes.value = data.routes || []
  } catch {
    // Non-critical
  }
}

function updateMarkers() {
  if (!map) return

  // Clear existing markers
  markers.forEach(m => m.remove())
  markers = []

  const vList = filteredVehicles.value
  vList.forEach(v => {
    const icon = createBusIcon(v.bearing, v.routeId)
    const marker = L.marker([v.latitude, v.longitude], { icon })
      .addTo(map!)

    const shortRoute = v.routeId.split('-').pop() || v.routeId
    const speed = Math.round(v.speed * 3.6) // m/s to km/h
    const occupancy = occupancyLabels[v.occupancyStatus] || ''

    marker.bindPopup(`
      <div class="bus-popup">
        <strong>${modeEmoji[selectedMode.value]} Route ${shortRoute}</strong><br>
        <span>Trip: ${v.tripId.slice(-8)}</span><br>
        <span>Speed: ${speed} km/h</span><br>
        <span>Direction: ${Math.round(v.bearing)}°</span>
        ${occupancy ? `<br><span>${occupancy}</span>` : ''}
        <br><span>Updated: ${formatTime(v.timestamp)}</span>
      </div>
    `)

    marker.on('click', () => {
      selectedVehicle.value = v
    })

    markers.push(marker)
  })

  // Fit map to markers if there are any and map hasn't been manually moved
  if (vList.length > 0 && markers.length > 0) {
    const group = L.featureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.1))
  }
}

function initMap() {
  map = L.map('bus-map').setView(brisbaneCenter, 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap | Translink GTFS-RT',
    maxZoom: 18,
  }).addTo(map)
}

async function refresh() {
  await Promise.all([fetchVehicles(), fetchRoutes()])
  updateMarkers()
}

watch(selectedMode, () => {
  routeFilter.value = ''
  refresh()
})

watch(filteredVehicles, () => {
  updateMarkers()
})

watch(autoRefresh, (val) => {
  if (val) {
    refreshInterval = setInterval(refresh, 30000)
  } else if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})

onMounted(() => {
  initMap()
  refresh()
  if (autoRefresh.value) {
    refreshInterval = setInterval(refresh, 30000)
  }
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (map) map.remove()
})
</script>

<template>
  <div class="page bus-tracker-page">
    <div class="tracker-header">
      <h1>🚌 Live Brisbane Transit Tracker</h1>
      <p class="subtitle">Real-time positions from Translink GTFS-RT data</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>Mode:</label>
        <div class="mode-buttons">
          <button
            v-for="mode in (['Bus', 'Rail', 'Tram', 'Ferry'] as TransitMode[])"
            :key="mode"
            :class="['mode-btn', { active: selectedMode === mode }]"
            @click="selectedMode = mode"
          >
            {{ modeEmoji[mode] }} {{ mode }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label for="route-filter">Route:</label>
        <input
          id="route-filter"
          v-model="routeFilter"
          type="text"
          placeholder="Filter by route ID..."
          class="route-input"
          list="route-list"
        />
        <datalist id="route-list">
          <option v-for="r in availableRoutes" :key="r" :value="r" />
        </datalist>
      </div>

      <div class="control-group">
        <label class="auto-refresh">
          <input v-model="autoRefresh" type="checkbox" />
          Auto-refresh (30s)
        </label>
      </div>

      <button class="refresh-btn" @click="refresh" :disabled="loading">
        {{ loading ? '⏳' : '🔄' }} Refresh
      </button>
    </div>

    <div class="stats-bar">
      <span>{{ modeEmoji[selectedMode] }} {{ vehicleCount }} vehicles tracked</span>
      <span v-if="lastUpdated">Updated {{ timeAgo(lastUpdated) }}</span>
      <span v-if="error" class="error-text">{{ error }}</span>
    </div>

    <div id="bus-map" class="map-container"></div>

    <div v-if="selectedVehicle" class="vehicle-detail">
      <h3>{{ modeEmoji[selectedMode] }} {{ selectedVehicle.routeId }}</h3>
      <div class="detail-grid">
        <div><strong>Trip:</strong> {{ selectedVehicle.tripId }}</div>
        <div><strong>Position:</strong> {{ selectedVehicle.latitude.toFixed(5) }}, {{ selectedVehicle.longitude.toFixed(5) }}</div>
        <div><strong>Speed:</strong> {{ Math.round(selectedVehicle.speed * 3.6) }} km/h</div>
        <div><strong>Bearing:</strong> {{ Math.round(selectedVehicle.bearing) }}°</div>
        <div><strong>Occupancy:</strong> {{ occupancyLabels[selectedVehicle.occupancyStatus] || 'Unknown' }}</div>
        <div><strong>Last update:</strong> {{ formatTime(selectedVehicle.timestamp) }}</div>
      </div>
      <button class="close-detail" @click="selectedVehicle = null">✕</button>
    </div>

    <div class="info-section">
      <h3>📊 Active Routes ({{ availableRoutes.length }})</h3>
      <div class="route-chips">
        <span
          v-for="route in availableRoutes.slice(0, 30)"
          :key="route"
          class="route-chip"
          :style="{ background: getRouteColor(route) }"
          @click="routeFilter = route"
        >
          {{ route.split('-').pop() }}
        </span>
        <span v-if="availableRoutes.length > 30" class="more-routes">
          +{{ availableRoutes.length - 30 }} more
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bus-tracker-page {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tracker-header {
  text-align: center;
  margin-bottom: 1rem;
}

.tracker-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.subtitle {
  opacity: 0.7;
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background: var(--surface-2, #1a1a2e);
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-size: 0.85rem;
  font-weight: 600;
}

.mode-buttons {
  display: flex;
  gap: 0.25rem;
}

.mode-btn {
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--border-color, #333);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.mode-btn.active {
  background: var(--accent, #6c5ce7);
  border-color: var(--accent, #6c5ce7);
  color: white;
}

.route-input {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--border-color, #333);
  border-radius: 6px;
  background: var(--surface-1, #16213e);
  color: inherit;
  font-size: 0.85rem;
  width: 160px;
}

.refresh-btn {
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--border-color, #333);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 0.85rem;
  margin-left: auto;
}

.auto-refresh {
  font-size: 0.8rem;
  cursor: pointer;
}

.stats-bar {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.error-text {
  color: #e74c3c;
  opacity: 1;
}

.map-container {
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color, #333);
}

.vehicle-detail {
  position: relative;
  background: var(--surface-2, #1a1a2e);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.75rem;
}

.vehicle-detail h3 {
  margin: 0 0 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.25rem;
  font-size: 0.85rem;
}

.close-detail {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
}

.info-section {
  margin-top: 1rem;
}

.info-section h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.route-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.route-chip {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.more-routes {
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  opacity: 0.6;
}

/* Leaflet marker styles */
:deep(.bus-marker) {
  background: none !important;
  border: none !important;
}

:deep(.bus-icon) {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.4);
  border: 2px solid rgba(255,255,255,0.8);
  transition: transform 0.3s;
}

:deep(.bus-icon:hover) {
  transform: scale(1.3) !important;
}

:deep(.bus-route) {
  pointer-events: none;
}

:deep(.bus-popup) {
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  .mode-buttons {
    flex-wrap: wrap;
  }
  .map-container {
    height: 350px;
  }
  .refresh-btn {
    margin-left: 0;
  }
}
</style>
