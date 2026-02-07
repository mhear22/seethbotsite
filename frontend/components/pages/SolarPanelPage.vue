<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/useAppStore'
import { useSolarCalculator } from '../../composables/useSolarCalculator'
import { useSolarCanvas } from '../../composables/useSolarCanvas'
import { useSolarStore } from '../../composables/useSolarStore'

const store = useAppStore()
const router = useRouter()
const calculator = useSolarCalculator()
const canvas = useSolarCanvas()
const solarStore = useSolarStore()

// Sync calculator results to shared store for battery page
watch(() => calculator.results.value, (r) => {
  solarStore.setSolarResults(r)
}, { immediate: true })
const svgRef = ref<SVGSVGElement | null>(null)

// Sync canvas vertices to calculator (in meters)
watch([() => canvas.verticesInMeters.value, () => canvas.isClosed.value], () => {
  calculator.setVertices(canvas.verticesInMeters.value, canvas.isClosed.value)
}, { deep: true })

function onCanvasClick(event: MouseEvent) {
  if (!svgRef.value) return
  canvas.addVertex(event, svgRef.value)
}

function onCanvasMouseMove(event: MouseEvent) {
  if (!svgRef.value) return
  canvas.handleMouseMove(event, svgRef.value)
}

function onCanvasRightClick(event: MouseEvent) {
  event.preventDefault()
  canvas.closePolygon()
}

function handleReset() {
  canvas.reset()
  calculator.reset()
}

function handleUndo() {
  canvas.undo()
}

// Convert panel positions from meters back to SVG pixels
function panelToSvg(panel: { x: number; y: number; width: number; height: number }) {
  const pos = canvas.metersToSvg({ x: panel.x, y: panel.y })
  return {
    x: pos.x,
    y: pos.y,
    width: panel.width / canvas.config.value.metersPerPixel,
    height: panel.height / canvas.config.value.metersPerPixel
  }
}

// Convert inset vertices from meters to SVG
function insetPathSvg() {
  const pts = calculator.insetVertices.value
  if (pts.length < 3) return ''
  return pts.map((p, i) => {
    const sv = canvas.metersToSvg(p)
    return `${i === 0 ? 'M' : 'L'}${sv.x},${sv.y}`
  }).join(' ') + ' Z'
}
</script>

<template>
  <div class="page solar-page" :class="{ dark: store.darkMode }">
    <div class="page-header">
      <h1>Solar Panel Calculator</h1>
      <p class="subtitle">Draw your roof shape and calculate optimal solar panel placement</p>
    </div>

    <div class="solar-layout">
      <!-- Instructions -->
      <div class="card instructions-card">
        <h3>How to Use</h3>
        <div class="steps">
          <div class="step">
            <span class="step-num">1</span>
            <span>Click on the canvas to place roof vertices</span>
          </div>
          <div class="step">
            <span class="step-num">2</span>
            <span>Right-click or press "Close" to complete the shape</span>
          </div>
          <div class="step">
            <span class="step-num">3</span>
            <span>View optimized panel layout and results below</span>
          </div>
        </div>
      </div>

      <!-- SVG Canvas -->
      <div class="card canvas-card">
        <div class="canvas-toolbar">
          <button class="toolbar-btn" @click="handleUndo" :disabled="canvas.vertices.value.length === 0 && !canvas.isClosed.value">
            Undo
          </button>
          <button class="toolbar-btn" @click="handleReset" :disabled="canvas.vertices.value.length === 0">
            Clear
          </button>
          <button class="toolbar-btn primary" @click="canvas.closePolygon()" :disabled="canvas.vertices.value.length < 3 || canvas.isClosed.value">
            Close Polygon
          </button>
          <label class="snap-toggle">
            <input type="checkbox" v-model="canvas.config.value.snapToGrid" />
            Snap to Grid
          </label>
        </div>

        <svg
          ref="svgRef"
          :viewBox="`0 0 ${canvas.config.value.width} ${canvas.config.value.height}`"
          class="solar-svg"
          @click="onCanvasClick"
          @mousemove="onCanvasMouseMove"
          @contextmenu="onCanvasRightClick"
        >
          <!-- Grid -->
          <line
            v-for="(line, i) in canvas.gridLines.value"
            :key="'grid-' + i"
            :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2"
            :class="['grid-line', { major: line.major }]"
          />

          <!-- Inset polygon (setback area) -->
          <path
            v-if="canvas.isClosed.value && insetPathSvg()"
            :d="insetPathSvg()"
            class="inset-polygon"
          />

          <!-- Panels -->
          <rect
            v-for="(panel, i) in calculator.results.value?.panels || []"
            :key="'panel-' + i"
            :x="panelToSvg(panel).x"
            :y="panelToSvg(panel).y"
            :width="panelToSvg(panel).width"
            :height="panelToSvg(panel).height"
            class="solar-panel"
          />

          <!-- Roof polygon -->
          <path
            v-if="canvas.vertices.value.length > 0"
            :d="canvas.polygonPath.value"
            class="roof-polygon"
            :class="{ closed: canvas.isClosed.value }"
          />

          <!-- Preview line -->
          <line
            v-if="canvas.previewLine.value"
            :x1="canvas.previewLine.value.x1"
            :y1="canvas.previewLine.value.y1"
            :x2="canvas.previewLine.value.x2"
            :y2="canvas.previewLine.value.y2"
            class="preview-line"
          />

          <!-- Vertices -->
          <circle
            v-for="(v, i) in canvas.vertices.value"
            :key="'vertex-' + i"
            :cx="v.x" :cy="v.y" r="5"
            class="vertex"
          />

          <!-- Hover point -->
          <circle
            v-if="canvas.hoverPoint.value && !canvas.isClosed.value"
            :cx="canvas.hoverPoint.value.x"
            :cy="canvas.hoverPoint.value.y"
            r="4"
            class="hover-point"
          />
        </svg>

        <div class="canvas-info">
          <span>Grid: 1m per major square</span>
          <span>Vertices: {{ canvas.vertices.value.length }}</span>
          <span v-if="calculator.roofArea.value > 0">Roof Area: {{ calculator.roofArea.value.toFixed(1) }} m²</span>
        </div>
      </div>

      <!-- Settings -->
      <div class="card settings-card">
        <h3>Panel Settings</h3>
        <div class="settings-grid">
          <div class="setting-field">
            <label>Panel Width (m)</label>
            <input type="number" v-model.number="calculator.settings.value.panelWidth" min="0.1" max="5" step="0.1" />
          </div>
          <div class="setting-field">
            <label>Panel Height (m)</label>
            <input type="number" v-model.number="calculator.settings.value.panelHeight" min="0.1" max="5" step="0.1" />
          </div>
          <div class="setting-field">
            <label>Edge Setback (m)</label>
            <input type="number" v-model.number="calculator.settings.value.setback" min="-3" max="3" step="0.1" />
          </div>
          <div class="setting-field">
            <label>Watts per Panel</label>
            <input type="number" v-model.number="calculator.settings.value.wattsPerPanel" min="1" max="1000" step="10" />
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="card results-card" v-if="calculator.results.value">
        <h3>Results</h3>
        <div class="results-grid">
          <div class="stat-card">
            <div class="stat-value">{{ calculator.results.value.panelCount }}</div>
            <div class="stat-label">Panels</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ calculator.results.value.totalArea.toFixed(1) }} m²</div>
            <div class="stat-label">Total Panel Area</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ calculator.results.value.coveragePercent.toFixed(1) }}%</div>
            <div class="stat-label">Coverage</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ calculator.results.value.estimatedKW.toFixed(2) }} kW</div>
            <div class="stat-label">Estimated Power</div>
          </div>
        </div>
        <div class="orientation-info">
          Optimal orientation: <strong>{{ calculator.results.value.orientation }}</strong>
        </div>
      </div>

      <!-- Next Step -->
      <div class="card next-step-card" v-if="calculator.results.value">
        <button class="next-btn" @click="router.push('/solar/battery')">
          Next: Battery Calculator &rarr;
        </button>
        <p class="next-hint">Size your battery storage based on these panel results</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.solar-page {
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

.solar-page.dark .subtitle {
  color: #aaa;
}

.solar-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Card base */
.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
}

.solar-page.dark .card {
  background: rgba(30, 30, 45, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card h3 {
  margin: 0 0 16px;
  font-size: 1.3rem;
  color: #333;
}

.solar-page.dark .card h3 {
  color: #eee;
}

/* Instructions */
.steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: #555;
}

.solar-page.dark .step {
  color: #ccc;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff91a4, #ffb347);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
  flex-shrink: 0;
}

/* Canvas toolbar */
.canvas-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  align-items: center;
}

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
  background: linear-gradient(135deg, #ff91a4, #ffb347);
}

.solar-page.dark .toolbar-btn {
  background: #2a2a40;
  border-color: #444;
  color: #ddd;
}

.solar-page.dark .toolbar-btn:hover:not(:disabled) {
  background: #3a3a55;
}

.solar-page.dark .toolbar-btn.primary {
  background: linear-gradient(135deg, #ff91a4, #ffb347);
  color: white;
}

.snap-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
  margin-left: auto;
  cursor: pointer;
}

.solar-page.dark .snap-toggle {
  color: #aaa;
}

/* SVG Canvas */
.solar-svg {
  width: 100%;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: crosshair;
  background: #fafafa;
}

.solar-page.dark .solar-svg {
  border-color: #444;
  background: #1a1a2e;
}

.grid-line {
  stroke: #e8e8e8;
  stroke-width: 0.5;
}

.grid-line.major {
  stroke: #d0d0d0;
  stroke-width: 1;
}

.solar-page.dark .grid-line {
  stroke: #2a2a40;
}

.solar-page.dark .grid-line.major {
  stroke: #3a3a55;
}

.roof-polygon {
  fill: rgba(255, 145, 164, 0.15);
  stroke: #ff91a4;
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.roof-polygon.closed {
  fill: rgba(255, 145, 164, 0.1);
}

.inset-polygon {
  fill: none;
  stroke: #ffb347;
  stroke-width: 1;
  stroke-dasharray: 6 3;
  opacity: 0.6;
}

.solar-panel {
  fill: rgba(59, 130, 246, 0.5);
  stroke: rgba(59, 130, 246, 0.8);
  stroke-width: 0.8;
}

.solar-page.dark .solar-panel {
  fill: rgba(96, 165, 250, 0.4);
  stroke: rgba(96, 165, 250, 0.7);
}

.preview-line {
  stroke: #ff91a4;
  stroke-width: 1.5;
  stroke-dasharray: 5 5;
  opacity: 0.6;
}

.vertex {
  fill: #ff91a4;
  stroke: white;
  stroke-width: 2;
  cursor: pointer;
}

.solar-page.dark .vertex {
  stroke: #1a1a2e;
}

.hover-point {
  fill: rgba(255, 145, 164, 0.5);
  stroke: #ff91a4;
  stroke-width: 1;
  pointer-events: none;
}

.canvas-info {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 0.8rem;
  color: #888;
  flex-wrap: wrap;
}

.solar-page.dark .canvas-info {
  color: #777;
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

.solar-page.dark .setting-field label {
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

.solar-page.dark .setting-field input {
  background: #2a2a40;
  border-color: #444;
  color: #eee;
}

.solar-page.dark .setting-field input:focus {
  border-color: #ff91a4;
  box-shadow: 0 0 0 3px rgba(255, 145, 164, 0.2);
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

.solar-page.dark .stat-card {
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

.solar-page.dark .stat-label {
  color: #999;
}

.orientation-info {
  margin-top: 12px;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.solar-page.dark .orientation-info {
  color: #aaa;
}

.orientation-info strong {
  color: #ff91a4;
  text-transform: capitalize;
}

/* Next step */
.next-step-card {
  text-align: center;
}

.next-btn {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff91a4, #ffb347);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.next-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 145, 164, 0.3);
}

.next-hint {
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: #888;
}

.solar-page.dark .next-hint {
  color: #777;
}

/* Responsive */
@media (max-width: 600px) {
  .solar-page {
    padding: 60px 12px 30px;
  }

  .page-header h1 {
    font-size: 1.8rem;
  }

  .card {
    padding: 16px;
  }

  .settings-grid {
    grid-template-columns: 1fr 1fr;
  }

  .results-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
