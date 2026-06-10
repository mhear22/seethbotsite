<script setup lang="ts">
interface Booth {
  n: string  // booth name
  t: string  // type ('EV' or 'PB')
  v: number  // votes
  p: Record<string, number>  // party percentages
}

interface ElectorateData {
  name: string
  formerName?: string
  booths?: Booth[]
}

interface Props {
  electorate?: ElectorateData | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  electorate: null,
  loading: false
})

const emit = defineEmits<{
  close: []
}>()

const partyColors: Record<string, string> = {
  ALP: '#e53e3e',
  LNP: '#3182ce',
  GRN: '#38a169',
  ONP: '#dd6b20',
  KAP: '#d69e2e',
  IND: '#718096'
}

const getDonutSegments = (percentages: Record<string, number>) => {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const segments: { party: string; color: string; dash: string; dashOffset: string }[] = []
  let currentOffset = 0
  
  const partyOrder = ['ALP', 'LNP', 'GRN', 'KAP', 'ONP', 'IND']
  
  for (const party of partyOrder) {
    const pct = percentages[party]
    if (!pct || pct <= 0) continue
    
    const segmentLength = (pct / 100) * circumference
    segments.push({
      party,
      color: partyColors[party] || '#718096',
      dash: `${segmentLength} ${circumference - segmentLength}`,
      dashOffset: `${-currentOffset}`
    })
    currentOffset += segmentLength
  }
  
  return segments
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="electorate" 
      class="booth-modal-overlay" 
      @click="emit('close')"
    >
      <div class="booth-modal" @click.stop>
        <div class="booth-modal-header">
          <div>
            <h3>{{ electorate.name }}</h3>
            <span v-if="electorate.formerName" class="former-name-modal">
              (formerly {{ electorate.formerName }})
            </span>
          </div>
          <button class="booth-modal-close" @click="emit('close')">✕</button>
        </div>
        <div class="booth-modal-subtitle">2024 Election - Booth Results</div>
        
        <div v-if="loading" class="booth-loading">
          <div class="booth-spinner"></div>
          Loading booth data...
        </div>
        
        <div v-else-if="!electorate.booths?.length" class="booth-empty">
          No booth data available for this electorate.
        </div>
        
        <div v-else class="booth-grid">
          <div 
            v-for="(booth, idx) in electorate.booths" 
            :key="idx"
            class="booth-card"
          >
            <div class="donut-container">
              <svg viewBox="0 0 100 100" class="donut-chart">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" class="donut-bg-circle" stroke-width="20" />
                <circle
                  v-for="(seg, i) in getDonutSegments(booth.p)"
                  :key="i"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  :stroke="seg.color"
                  stroke-width="20"
                  :stroke-dasharray="seg.dash"
                  :stroke-dashoffset="seg.dashOffset"
                  class="donut-segment"
                />
              </svg>
              <div class="donut-center">
                <span class="donut-votes">{{ booth.v.toLocaleString() }}</span>
                <span class="donut-label">votes</span>
              </div>
            </div>
            <div class="booth-info">
              <span class="booth-name">{{ booth.n }}</span>
              <span class="booth-type">{{ booth.t === 'EV' ? 'Early Voting' : 'Polling Booth' }}</span>
            </div>
            <div class="booth-legend">
              <div 
                v-for="(seg, i) in getDonutSegments(booth.p)" 
                :key="i"
                class="legend-item"
              >
                <span class="legend-color" :style="{ background: seg.color }"></span>
                <span class="legend-party">{{ seg.party }}</span>
                <span class="legend-pct">{{ booth.p[seg.party].toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.booth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.booth-modal {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.booth-modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booth-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a202c;
}

.former-name-modal {
  font-size: 0.875rem;
  color: #718096;
  display: block;
  margin-top: 0.25rem;
}

.booth-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.booth-modal-close:hover {
  background-color: #f7fafc;
}

.booth-modal-subtitle {
  padding: 0.75rem 1.5rem;
  background: #f7fafc;
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
}

.booth-loading {
  padding: 3rem;
  text-align: center;
  color: #718096;
}

.booth-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #646cff;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.booth-empty {
  padding: 3rem;
  text-align: center;
  color: #a0aec0;
}

.booth-grid {
  padding: 1.5rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.booth-card {
  background: #f7fafc;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.donut-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 0.75rem;
}

.donut-chart {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-bg-circle {
  opacity: 0.3;
}

.donut-segment {
  transition: opacity 0.2s ease;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.donut-votes {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a202c;
}

.donut-label {
  display: block;
  font-size: 0.625rem;
  color: #a0aec0;
  text-transform: uppercase;
}

.booth-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.booth-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #2d3748;
}

.booth-type {
  font-size: 0.6875rem;
  color: #a0aec0;
}

.booth-legend {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
}

.legend-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-party {
  color: #4a5568;
  font-weight: 500;
}

.legend-pct {
  color: #a0aec0;
  margin-left: auto;
}

@media (max-width: 768px) {
  .booth-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .booth-card {
    padding: 0.75rem;
  }
}
</style>