import { ref, computed } from 'vue'
import type { Point } from './useSolarCalculator'

export interface CanvasConfig {
  width: number
  height: number
  gridSize: number
  snapToGrid: boolean
  metersPerPixel: number
}

export function useSolarCanvas() {
  const config = ref<CanvasConfig>({
    width: 800,
    height: 500,
    gridSize: 20,
    snapToGrid: true,
    metersPerPixel: 0.05  // 20px = 1m
  })

  const vertices = ref<Point[]>([])
  const isClosed = ref(false)
  const hoverPoint = ref<Point | null>(null)

  function snapPoint(p: Point): Point {
    if (!config.value.snapToGrid) return p
    const g = config.value.gridSize
    return {
      x: Math.round(p.x / g) * g,
      y: Math.round(p.y / g) * g
    }
  }

  function svgToMeters(p: Point): Point {
    return {
      x: p.x * config.value.metersPerPixel,
      y: p.y * config.value.metersPerPixel
    }
  }

  function metersToSvg(p: Point): Point {
    return {
      x: p.x / config.value.metersPerPixel,
      y: p.y / config.value.metersPerPixel
    }
  }

  const verticesInMeters = computed<Point[]>(() => {
    return vertices.value.map(v => svgToMeters(v))
  })

  function getSvgPoint(event: MouseEvent, svgEl: SVGSVGElement): Point {
    const rect = svgEl.getBoundingClientRect()
    const scaleX = config.value.width / rect.width
    const scaleY = config.value.height / rect.height
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    }
  }

  function addVertex(event: MouseEvent, svgEl: SVGSVGElement) {
    if (isClosed.value) return
    const raw = getSvgPoint(event, svgEl)
    const point = snapPoint(raw)
    vertices.value.push(point)
  }

  function handleMouseMove(event: MouseEvent, svgEl: SVGSVGElement) {
    if (isClosed.value) return
    const raw = getSvgPoint(event, svgEl)
    hoverPoint.value = snapPoint(raw)
  }

  function closePolygon() {
    if (vertices.value.length >= 3) {
      isClosed.value = true
      hoverPoint.value = null
    }
  }

  function undo() {
    if (isClosed.value) {
      isClosed.value = false
      return
    }
    if (vertices.value.length > 0) {
      vertices.value.pop()
    }
  }

  function reset() {
    vertices.value = []
    isClosed.value = false
    hoverPoint.value = null
  }

  // Polygon path string for SVG
  const polygonPath = computed(() => {
    if (vertices.value.length === 0) return ''
    return vertices.value.map((v, i) => `${i === 0 ? 'M' : 'L'}${v.x},${v.y}`).join(' ') +
      (isClosed.value ? ' Z' : '')
  })

  // Preview line from last vertex to hover point
  const previewLine = computed(() => {
    if (isClosed.value || vertices.value.length === 0 || !hoverPoint.value) return null
    const last = vertices.value[vertices.value.length - 1]
    return { x1: last.x, y1: last.y, x2: hoverPoint.value.x, y2: hoverPoint.value.y }
  })

  // Grid lines for SVG background
  const gridLines = computed(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = []
    const g = config.value.gridSize
    const majorEvery = 5

    for (let x = 0; x <= config.value.width; x += g) {
      lines.push({ x1: x, y1: 0, x2: x, y2: config.value.height, major: (x / g) % majorEvery === 0 })
    }
    for (let y = 0; y <= config.value.height; y += g) {
      lines.push({ x1: 0, y1: y, x2: config.value.width, y2: y, major: (y / g) % majorEvery === 0 })
    }
    return lines
  })

  return {
    config,
    vertices,
    isClosed,
    hoverPoint,
    verticesInMeters,
    polygonPath,
    previewLine,
    gridLines,
    addVertex,
    handleMouseMove,
    closePolygon,
    undo,
    reset,
    snapPoint,
    svgToMeters,
    metersToSvg
  }
}
