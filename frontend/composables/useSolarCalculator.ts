import { ref, computed, watch } from 'vue'

export interface Point {
  x: number
  y: number
}

export interface Panel {
  x: number
  y: number
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
}

export interface SolarSettings {
  panelWidth: number
  panelHeight: number
  setback: number
  wattsPerPanel: number
}

export interface SolarResults {
  panelCount: number
  totalArea: number
  coveragePercent: number
  estimatedKW: number
  orientation: string
  panels: Panel[]
}

// Shoelace formula for polygon area
function polygonArea(vertices: Point[]): number {
  const n = vertices.length
  if (n < 3) return 0
  let area = 0
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += vertices[i].x * vertices[j].y
    area -= vertices[j].x * vertices[i].y
  }
  return Math.abs(area) / 2
}

// Ray casting point-in-polygon test
function pointInPolygon(point: Point, polygon: Point[]): boolean {
  const n = polygon.length
  let inside = false
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y
    const xj = polygon[j].x, yj = polygon[j].y
    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
}

// Inset polygon by distance (shrink inward using edge normals)
function insetPolygon(vertices: Point[], distance: number): Point[] {
  const n = vertices.length
  if (n < 3 || distance <= 0) return [...vertices]

  // Ensure polygon is counter-clockwise
  let signedArea = 0
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    signedArea += vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y
  }
  const ccw = signedArea > 0
  const pts = ccw ? [...vertices] : [...vertices].reverse()

  // Compute inward-offset edges
  const offsetEdges: { p1: Point; p2: Point }[] = []
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const dx = pts[j].x - pts[i].x
    const dy = pts[j].y - pts[i].y
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len === 0) continue
    // Inward normal for CCW polygon: rotate edge direction -90 degrees
    const nx = dy / len
    const ny = -dx / len
    offsetEdges.push({
      p1: { x: pts[i].x + nx * distance, y: pts[i].y + ny * distance },
      p2: { x: pts[j].x + nx * distance, y: pts[j].y + ny * distance }
    })
  }

  if (offsetEdges.length < 3) return []

  // Intersect consecutive offset edges
  const result: Point[] = []
  for (let i = 0; i < offsetEdges.length; i++) {
    const j = (i + 1) % offsetEdges.length
    const intersection = lineIntersection(
      offsetEdges[i].p1, offsetEdges[i].p2,
      offsetEdges[j].p1, offsetEdges[j].p2
    )
    if (intersection) {
      result.push(intersection)
    }
  }

  return result.length >= 3 ? result : []
}

// Line-line intersection
function lineIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)
  if (Math.abs(d) < 1e-10) return null
  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  }
}

// Place panels within polygon using grid sweep
function placePanels(
  polygon: Point[],
  panelW: number,
  panelH: number,
  offsetX: number,
  offsetY: number
): Panel[] {
  if (polygon.length < 3) return []

  // Bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of polygon) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }

  const panels: Panel[] = []
  const startX = minX + offsetX
  const startY = minY + offsetY

  for (let x = startX; x + panelW <= maxX; x += panelW) {
    for (let y = startY; y + panelH <= maxY; y += panelH) {
      // Check all 4 corners are inside polygon
      const corners: Point[] = [
        { x, y },
        { x: x + panelW, y },
        { x: x + panelW, y: y + panelH },
        { x, y: y + panelH }
      ]
      if (corners.every(c => pointInPolygon(c, polygon))) {
        panels.push({
          x,
          y,
          width: panelW,
          height: panelH,
          orientation: panelW < panelH ? 'portrait' : 'landscape'
        })
      }
    }
  }

  return panels
}

// Multi-strategy optimizer: 2 orientations x 3 offsets = 6 strategies
function optimizePlacement(polygon: Point[], panelWidth: number, panelHeight: number): { panels: Panel[], orientation: string } {
  let bestPanels: Panel[] = []
  let bestOrientation = 'landscape'

  const orientations: [number, number, string][] = [
    [panelWidth, panelHeight, 'landscape'],
    [panelHeight, panelWidth, 'portrait']
  ]

  for (const [w, h, label] of orientations) {
    const offsets: [number, number][] = [
      [0, 0],
      [w / 2, 0],
      [0, h / 2]
    ]

    for (const [ox, oy] of offsets) {
      const panels = placePanels(polygon, w, h, ox, oy)
      if (panels.length > bestPanels.length) {
        bestPanels = panels
        bestOrientation = label
      }
    }
  }

  return { panels: bestPanels, orientation: bestOrientation }
}

export function useSolarCalculator() {
  const settings = ref<SolarSettings>({
    panelWidth: 1.7,
    panelHeight: 1.0,
    setback: 0.3,
    wattsPerPanel: 400
  })

  const roofVertices = ref<Point[]>([])
  const isClosed = ref(false)

  const results = computed<SolarResults | null>(() => {
    if (!isClosed.value || roofVertices.value.length < 3) return null

    const roofArea = polygonArea(roofVertices.value)
    const inset = insetPolygon(roofVertices.value, settings.value.setback)

    if (inset.length < 3) {
      return {
        panelCount: 0,
        totalArea: 0,
        coveragePercent: 0,
        estimatedKW: 0,
        orientation: 'N/A',
        panels: []
      }
    }

    const { panels, orientation } = optimizePlacement(
      inset,
      settings.value.panelWidth,
      settings.value.panelHeight
    )

    const panelArea = settings.value.panelWidth * settings.value.panelHeight
    const totalPanelArea = panels.length * panelArea

    return {
      panelCount: panels.length,
      totalArea: totalPanelArea,
      coveragePercent: roofArea > 0 ? (totalPanelArea / roofArea) * 100 : 0,
      estimatedKW: (panels.length * settings.value.wattsPerPanel) / 1000,
      orientation,
      panels
    }
  })

  const insetVertices = computed<Point[]>(() => {
    if (!isClosed.value || roofVertices.value.length < 3) return []
    return insetPolygon(roofVertices.value, settings.value.setback)
  })

  const roofArea = computed(() => {
    if (roofVertices.value.length < 3) return 0
    return polygonArea(roofVertices.value)
  })

  function setVertices(vertices: Point[], closed: boolean) {
    roofVertices.value = vertices
    isClosed.value = closed
  }

  function reset() {
    roofVertices.value = []
    isClosed.value = false
  }

  return {
    settings,
    roofVertices,
    isClosed,
    results,
    insetVertices,
    roofArea,
    setVertices,
    reset
  }
}
