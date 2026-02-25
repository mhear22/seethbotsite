import { onUnmounted } from 'vue'
import * as THREE from 'three'
import type { PlacedRack, SupplierId } from '../types/game'

interface SceneSnapshot {
  rows: number
  cols: number
  heatMap: number[][]
  racks: PlacedRack[]
  movingRackId: string | null
}

interface SceneOptions {
  getDraggedOfferId: () => string | null
  onTileClick: (x: number, y: number) => void
  onOfferDrop: (offerId: string, x: number, y: number) => void
  onRackSelect: (rackId: string) => void
}

interface PickResult {
  kind: 'tile' | 'rack'
  x: number
  y: number
  rackId?: string
}

const supplierColors: Record<SupplierId, number> = {
  zoogle: 0x22c55e,
  asw: 0xfacc15,
  macrohard: 0x3b82f6,
  gridlink: 0x111111
}

const rackColor = (rack: PlacedRack): number => {
  const hasNoIncome = rack.dailyCash <= 0 || rack.movedToday
  if (rack.role !== 'utility' && hasNoIncome) {
    return 0xef4444
  }

  return supplierColors[rack.supplierId]
}

const heatColor = (heat: number): number => {
  const intensity = Math.max(0, Math.min(1, heat / 16))
  const cool = new THREE.Color('#0f172a')
  const warm = new THREE.Color('#1d4ed8')
  const hot = new THREE.Color('#ef4444')

  if (intensity < 0.45) {
    return cool.lerp(warm, intensity / 0.45).getHex()
  }

  return warm.lerp(hot, (intensity - 0.45) / 0.55).getHex()
}

const keyFor = (x: number, y: number): string => `${x},${y}`
const keyToCoords = (key: string): { x: number; y: number } | null => {
  const [x, y] = key.split(',').map((value) => Number.parseInt(value, 10))
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null
  }
  return { x, y }
}

const createRackCross = (): THREE.Group => {
  const crossGroup = new THREE.Group()
  const barGeometry = new THREE.BoxGeometry(0.62, 0.05, 0.08)

  const barA = new THREE.Mesh(barGeometry, new THREE.MeshBasicMaterial({ color: 0xef4444 }))
  barA.rotation.y = Math.PI / 4
  barA.position.y = 0.48

  const barB = new THREE.Mesh(barGeometry, new THREE.MeshBasicMaterial({ color: 0xef4444 }))
  barB.rotation.y = -Math.PI / 4
  barB.position.y = 0.48

  crossGroup.add(barA)
  crossGroup.add(barB)
  crossGroup.visible = false
  return crossGroup
}

const disposeRackMesh = (mesh: THREE.Mesh) => {
  const material = mesh.material as THREE.MeshStandardMaterial
  material.dispose()
  mesh.geometry.dispose()

  mesh.children.forEach((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const childMaterial = child.material
    if (Array.isArray(childMaterial)) {
      childMaterial.forEach((entry) => entry.dispose())
    } else {
      childMaterial.dispose()
    }
    child.geometry.dispose()
  })
}

export function useDataCenterScene(options: SceneOptions) {
  let container: HTMLElement | null = null
  let scene: THREE.Scene | null = null
  let camera: THREE.OrthographicCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let frameHandle: number | null = null
  let resizeObserver: ResizeObserver | null = null

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  const tileGroup = new THREE.Group()
  const rackGroup = new THREE.Group()
  const hoverMarkerMaterial = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.26,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  const hoverMarker = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.86), hoverMarkerMaterial)
  hoverMarker.rotation.x = -Math.PI / 2
  hoverMarker.position.y = 0.03
  hoverMarker.visible = false

  const tileMeshes = new Map<string, THREE.Mesh>()
  const rackMeshes = new Map<string, THREE.Mesh>()

  let hoveredTileKey: string | null = null
  let currentSnapshot: SceneSnapshot | null = null

  const updateRendererSize = () => {
    if (!container || !renderer || !camera) return

    const width = container.clientWidth
    const height = Math.max(1, container.clientHeight)

    renderer.setSize(width, height)

    const aspect = width / height
    const extent = Math.max(6, (Math.max(currentSnapshot?.rows ?? 5, currentSnapshot?.cols ?? 5) * 0.9))

    camera.left = -extent * aspect
    camera.right = extent * aspect
    camera.top = extent
    camera.bottom = -extent
    camera.updateProjectionMatrix()
  }

  const worldPosition = (x: number, y: number, rows: number, cols: number): THREE.Vector3 => {
    const xOffset = x - cols / 2 + 0.5
    const zOffset = y - rows / 2 + 0.5
    return new THREE.Vector3(xOffset, 0, zOffset)
  }

  const buildGrid = (rows: number, cols: number) => {
    tileMeshes.forEach((mesh) => {
      const material = mesh.material as THREE.MeshStandardMaterial
      material.dispose()
      mesh.geometry.dispose()
      tileGroup.remove(mesh)
    })
    tileMeshes.clear()

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const geometry = new THREE.PlaneGeometry(0.94, 0.94)
        const material = new THREE.MeshStandardMaterial({
          color: 0x111827,
          roughness: 0.8,
          transparent: true,
          opacity: 0.88
        })
        const tile = new THREE.Mesh(geometry, material)

        tile.rotation.x = -Math.PI / 2
        tile.position.copy(worldPosition(x, y, rows, cols))
        tile.userData.kind = 'tile'
        tile.userData.x = x
        tile.userData.y = y

        tileGroup.add(tile)
        tileMeshes.set(keyFor(x, y), tile)
      }
    }
  }

  const tileHasRack = (snapshot: SceneSnapshot, x: number, y: number): boolean =>
    snapshot.racks.some((rack) => rack.x === x && rack.y === y)

  const updateHoveredTile = (nextKey: string | null) => {
    if (hoveredTileKey === nextKey) return

    hoveredTileKey = nextKey
    if (currentSnapshot) {
      syncTiles(currentSnapshot)
    }
  }

  const syncTiles = (snapshot: SceneSnapshot) => {
    const draggedOfferId = options.getDraggedOfferId()

    for (let y = 0; y < snapshot.rows; y += 1) {
      for (let x = 0; x < snapshot.cols; x += 1) {
        const tile = tileMeshes.get(keyFor(x, y))
        if (!tile) continue

        const heat = snapshot.heatMap[y]?.[x] ?? 0
        const material = tile.material as THREE.MeshStandardMaterial

        material.color.setHex(heatColor(heat))
        material.emissive.setHex(0x000000)
      }
    }

    if (hoveredTileKey) {
      const hovered = tileMeshes.get(hoveredTileKey)
      if (hovered) {
        const material = hovered.material as THREE.MeshStandardMaterial
        if (draggedOfferId) {
          const hoveredCoords = keyToCoords(hoveredTileKey)
          const isOccupied = hoveredCoords ? tileHasRack(snapshot, hoveredCoords.x, hoveredCoords.y) : false
          material.emissive.setHex(isOccupied ? 0x7f1d1d : 0x14532d)
        } else {
          material.emissive.setHex(0x1f2937)
        }
      }
    }

    if (!draggedOfferId || !hoveredTileKey) {
      hoverMarker.visible = false
      return
    }

    const hoveredCoords = keyToCoords(hoveredTileKey)
    if (!hoveredCoords) {
      hoverMarker.visible = false
      return
    }

    const hoverPosition = worldPosition(hoveredCoords.x, hoveredCoords.y, snapshot.rows, snapshot.cols)
    hoverMarker.position.set(hoverPosition.x, 0.03, hoverPosition.z)

    const blocked = tileHasRack(snapshot, hoveredCoords.x, hoveredCoords.y)
    hoverMarkerMaterial.color.setHex(blocked ? 0xef4444 : 0x22c55e)
    hoverMarkerMaterial.opacity = blocked ? 0.32 : 0.24
    hoverMarker.visible = true
  }

  const syncRacks = (snapshot: SceneSnapshot) => {
    const seenRackIds = new Set(snapshot.racks.map((rack) => rack.id))

    rackMeshes.forEach((mesh, rackId) => {
      if (!seenRackIds.has(rackId)) {
        disposeRackMesh(mesh)
        rackGroup.remove(mesh)
        rackMeshes.delete(rackId)
      }
    })

    for (const rack of snapshot.racks) {
      let mesh = rackMeshes.get(rack.id)

      if (!mesh) {
        const geometry = new THREE.BoxGeometry(0.72, 0.8, 0.72)
        const material = new THREE.MeshStandardMaterial({
          color: rackColor(rack),
          metalness: 0.2,
          roughness: 0.55
        })

        mesh = new THREE.Mesh(geometry, material)
        mesh.userData.kind = 'rack'
        mesh.userData.rackId = rack.id
        mesh.userData.cross = createRackCross()
        mesh.add(mesh.userData.cross as THREE.Group)

        rackGroup.add(mesh)
        rackMeshes.set(rack.id, mesh)
      }

      const material = mesh.material as THREE.MeshStandardMaterial
      material.color.setHex(rackColor(rack))
      material.emissive.setHex(snapshot.movingRackId === rack.id ? 0x1f2937 : 0x000000)
      const cross = mesh.userData.cross as THREE.Group | undefined
      if (cross) {
        cross.visible = rack.movedToday
      }

      const basePosition = worldPosition(rack.x, rack.y, snapshot.rows, snapshot.cols)
      mesh.position.set(basePosition.x, 0.42, basePosition.z)
    }
  }

  const pick = (clientX: number, clientY: number): PickResult | null => {
    if (!renderer || !camera) return null

    const rect = renderer.domElement.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null

    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(pointer, camera)

    const intersections = raycaster.intersectObjects(
      [...rackGroup.children, ...tileGroup.children],
      false
    )

    if (intersections.length === 0) return null

    const object = intersections[0].object as THREE.Mesh
    const kind = object.userData.kind

    if (kind === 'rack') {
      const rackId = object.userData.rackId as string
      const rack = currentSnapshot?.racks.find((entry) => entry.id === rackId)
      if (!rack) return null

      return {
        kind: 'rack',
        rackId,
        x: rack.x,
        y: rack.y
      }
    }

    return {
      kind: 'tile',
      x: object.userData.x as number,
      y: object.userData.y as number
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    const result = pick(event.clientX, event.clientY)
    const nextKey = result && result.kind === 'tile' ? keyFor(result.x, result.y) : null
    updateHoveredTile(nextKey)
  }

  const onPointerDown = (event: PointerEvent) => {
    const result = pick(event.clientX, event.clientY)
    if (!result) return

    if (result.kind === 'rack' && result.rackId) {
      options.onRackSelect(result.rackId)
      return
    }

    options.onTileClick(result.x, result.y)
  }

  const onDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }

    const result = pick(event.clientX, event.clientY)
    const nextKey = result && result.kind === 'tile' ? keyFor(result.x, result.y) : null
    updateHoveredTile(nextKey)
  }

  const onDragLeave = () => {
    updateHoveredTile(null)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()

    const offerId = options.getDraggedOfferId()
    if (!offerId) {
      updateHoveredTile(null)
      return
    }

    const result = pick(event.clientX, event.clientY)
    if (!result || result.kind !== 'tile') {
      updateHoveredTile(null)
      return
    }

    options.onOfferDrop(offerId, result.x, result.y)
    updateHoveredTile(null)
  }

  const startRenderLoop = () => {
    if (!renderer || !scene || !camera) return

    const draw = () => {
      frameHandle = requestAnimationFrame(draw)
      renderer.render(scene, camera)
    }

    draw()
  }

  const stopRenderLoop = () => {
    if (frameHandle !== null) {
      cancelAnimationFrame(frameHandle)
      frameHandle = null
    }
  }

  const mount = (element: HTMLElement) => {
    container = element

    scene = new THREE.Scene()
    scene.background = null

    camera = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 100)
    camera.position.set(13, 14, 13)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.background = 'transparent'

    container.appendChild(renderer.domElement)

    const hemisphere = new THREE.HemisphereLight(0xb4d5ff, 0x0f172a, 1.1)
    scene.add(hemisphere)

    const directional = new THREE.DirectionalLight(0xffffff, 0.75)
    directional.position.set(12, 20, 6)
    scene.add(directional)

    scene.add(tileGroup)
    scene.add(rackGroup)
    scene.add(hoverMarker)

    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('dragover', onDragOver)
    renderer.domElement.addEventListener('dragleave', onDragLeave)
    renderer.domElement.addEventListener('drop', onDrop)

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateRendererSize())
      resizeObserver.observe(container)
    } else {
      window.addEventListener('resize', updateRendererSize)
    }

    updateRendererSize()
    startRenderLoop()
  }

  const sync = (snapshot: SceneSnapshot) => {
    currentSnapshot = snapshot

    const tileCountChanged = tileMeshes.size !== snapshot.rows * snapshot.cols
    if (tileCountChanged) {
      buildGrid(snapshot.rows, snapshot.cols)
      updateRendererSize()
    }

    syncTiles(snapshot)
    syncRacks(snapshot)
  }

  const unmount = () => {
    stopRenderLoop()

    if (renderer) {
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('dragover', onDragOver)
      renderer.domElement.removeEventListener('dragleave', onDragLeave)
      renderer.domElement.removeEventListener('drop', onDrop)

      renderer.dispose()
      renderer.domElement.remove()
    }

    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    } else {
      window.removeEventListener('resize', updateRendererSize)
    }

    tileMeshes.forEach((mesh) => {
      const material = mesh.material as THREE.MeshStandardMaterial
      material.dispose()
      mesh.geometry.dispose()
    })
    tileMeshes.clear()

    rackMeshes.forEach((mesh) => {
      disposeRackMesh(mesh)
    })
    rackMeshes.clear()

    tileGroup.clear()
    rackGroup.clear()

    container = null
    scene = null
    camera = null
    renderer = null
    hoveredTileKey = null
    hoverMarker.visible = false
    currentSnapshot = null
  }

  onUnmounted(() => {
    unmount()
  })

  return {
    mount,
    sync,
    unmount
  }
}
