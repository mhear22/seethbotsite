<template>
  <div class="showcase">
    <header class="showcase-head">
      <div>
        <h1>Frame Concepts</h1>
        <p class="sub">Seven new chassis designs — click and drag a card to spin it.</p>
      </div>
      <RouterLink to="/" class="back">← Menu</RouterLink>
    </header>

    <div class="grid">
      <div v-for="d in designs" :key="d.name" class="card">
        <canvas
          :ref="(el) => registerCanvas(d.name, el as HTMLCanvasElement | null)"
          class="card-canvas"
          @pointerdown="onDown($event, d.name)"
        ></canvas>
        <div class="card-label">{{ d.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from 'vue'
import * as THREE from 'three'

import { createStrikerMech } from '../../lib/battle/showcase/striker'
import { createJuggernautMech } from '../../lib/battle/showcase/juggernaut'
import { createWraithMech } from '../../lib/battle/showcase/wraith'
import { createSentinelMech } from '../../lib/battle/showcase/sentinel'
import { createMantisMech } from '../../lib/battle/showcase/mantis'
import { createValkyrieMech } from '../../lib/battle/showcase/valkyrie'
import { createHarrierMech } from '../../lib/battle/showcase/harrier'

interface Design {
  name: string
  build: () => THREE.Group
}

const designs: Design[] = [
  { name: 'Striker', build: createStrikerMech },
  { name: 'Juggernaut', build: createJuggernautMech },
  { name: 'Wraith', build: createWraithMech },
  { name: 'Sentinel', build: createSentinelMech },
  { name: 'Mantis', build: createMantisMech },
  { name: 'Valkyrie', build: createValkyrieMech },
  { name: 'Harrier', build: createHarrierMech },
]

interface Stage {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  pivot: THREE.Group
  spin: boolean
}

const stages = new Map<string, Stage>()
const canvases = new Map<string, HTMLCanvasElement>()
const dragState = reactive({ name: '', lastX: 0 })
let rafId: number | null = null

function registerCanvas(name: string, el: HTMLCanvasElement | null): void {
  if (el) canvases.set(name, el)
}

function buildStage(name: string, build: () => THREE.Group, canvas: HTMLCanvasElement): Stage {
  const w = canvas.clientWidth || 320
  const h = canvas.clientHeight || 300

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x14171d)

  const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100)
  camera.position.set(6.5, 4.2, 7.5)
  camera.lookAt(0, 2.2, 0)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(w, h, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  // Same 3-point-ish rig the in-game preview uses, so forms read cleanly.
  scene.add(new THREE.AmbientLight(0xffffff, 0.45))
  const key = new THREE.DirectionalLight(0xffffff, 1.1)
  key.position.set(8, 16, 10)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0x88aaff, 0.35)
  fill.position.set(-9, 8, -6)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(0xffa060, 0.5)
  rim.position.set(-4, 5, -12)
  scene.add(rim)

  // Ground disc so the mech reads as standing, not floating.
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 3.4, 0.12, 48),
    new THREE.MeshStandardMaterial({ color: 0x0d0f13, roughness: 0.9, metalness: 0.1 }),
  )
  disc.position.y = -0.06
  scene.add(disc)

  const pivot = new THREE.Group()
  const mech = build()
  pivot.add(mech)
  pivot.rotation.y = Math.PI * 0.15
  scene.add(pivot)

  return { renderer, scene, camera, pivot, spin: true }
}

function tick(): void {
  for (const stage of stages.values()) {
    if (stage.spin) stage.pivot.rotation.y += 0.006
    stage.renderer.render(stage.scene, stage.camera)
  }
  rafId = requestAnimationFrame(tick)
}

function onDown(e: PointerEvent, name: string): void {
  dragState.name = name
  dragState.lastX = e.clientX
  const stage = stages.get(name)
  if (stage) stage.spin = false
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

function onMove(e: PointerEvent): void {
  const stage = stages.get(dragState.name)
  if (!stage) return
  const dx = e.clientX - dragState.lastX
  dragState.lastX = e.clientX
  stage.pivot.rotation.y += dx * 0.01
}

function onUp(): void {
  const stage = stages.get(dragState.name)
  if (stage) stage.spin = true
  dragState.name = ''
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
}

onMounted(() => {
  for (const d of designs) {
    const canvas = canvases.get(d.name)
    if (!canvas) continue
    try {
      stages.set(d.name, buildStage(d.name, d.build, canvas))
    } catch (err) {
      console.error(`Showcase: failed to build ${d.name}`, err)
    }
  }
  tick()
})

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  for (const stage of stages.values()) {
    stage.scene.traverse((o: THREE.Object3D) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose()
        const m = o.material
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose())
        else if (m) m.dispose()
      }
    })
    stage.renderer.dispose()
  }
  stages.clear()
})
</script>

<style scoped>
.showcase {
  min-height: 100vh;
  background: radial-gradient(120% 100% at 50% 0%, #1c2128 0%, #0c0e12 70%);
  color: #e7ebf0;
  padding: 28px clamp(16px, 4vw, 56px) 64px;
  box-sizing: border-box;
}
.showcase-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
}
.showcase-head h1 {
  margin: 0;
  font-size: clamp(24px, 3.4vw, 40px);
  letter-spacing: 0.02em;
  background: linear-gradient(90deg, #ffd27a, #ff8a5c);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.sub {
  margin: 6px 0 0;
  color: #8a93a3;
  font-size: 14px;
}
.back {
  color: #cdd5e2;
  text-decoration: none;
  border: 1px solid #2b313b;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 14px;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;
}
.back:hover {
  background: #1b2027;
  border-color: #3a424e;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.card {
  position: relative;
  border: 1px solid #262c35;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #161a20, #0e1116);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  aspect-ratio: 4 / 3.4;
}
.card-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  touch-action: none;
}
.card-canvas:active {
  cursor: grabbing;
}
.card-label {
  position: absolute;
  left: 14px;
  bottom: 12px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f0f3f8;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}
</style>
