<template>
  <div class="orbital-mechanics-page">
    <div class="page-header">
      <h1>🌌 Orbital Mechanics</h1>
      <p class="subtitle">Watch the cosmic dance of celestial bodies</p>
    </div>
    <div class="canvas-container">
      <canvas ref="canvasRef" class="orbit-canvas"></canvas>
    </div>
    <div class="info-panel">
      <div class="info-item">
        <span class="label">Celestial Bodies:</span>
        <span class="value">{{ bodies.length }}</span>
      </div>
      <div class="info-item">
        <span class="label">Black Hole:</span>
        <span class="value active">Visible</span>
      </div>
      <div class="info-item">
        <span class="label">Camera:</span>
        <span class="value">Auto-rotating</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw } from 'vue'
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animationId: number | null = null

const bodies = ref<Array<{ name: string; distance: number; speed: number; angle: number }>>([])

// Scene objects
let sun: THREE.Mesh | null = null
let blackHole: THREE.Mesh | null = null
let celestialBodies: THREE.Mesh[] = []
let orbitLines: THREE.Line[] = []

// Camera movement
let cameraAngle = 0
let cameraRadius = 80

// Black hole distortion effect
let blackHoleMaterial: THREE.Material | null = null

// Gravitational lensing render target
let lensingTarget: THREE.WebGLRenderTarget | null = null
let lensingMaterial: THREE.ShaderMaterial | null = null
let lensingQuad: THREE.Mesh | null = null

onMounted(() => {
  initScene()
  animate()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  cleanup()
})

function initScene() {
  if (!canvasRef.value) return

  // Scene setup
  scene = markRaw(new THREE.Scene())
  scene.background = new THREE.Color(0x000011)

  // Camera setup
  camera = markRaw(new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  ))

  // Renderer setup
  renderer = markRaw(new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  }))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // Setup gravitational lensing render target
  lensingTarget = markRaw(new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    }
  ))

  // Setup lensing post-processing shader
  lensingMaterial = markRaw(new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      schwarzschildRadius: { value: 3.0 },
      lensingStrength: { value: 15.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float schwarzschildRadius;
      uniform float lensingStrength;

      varying vec2 vUv;

      void main() {
        // Black hole position in screen space (normalized to -1 to 1)
        vec2 bhPos = vec2(0.0, 0.0);

        // Calculate distance from current pixel to black hole center
        vec2 delta = vUv - bhPos;
        float dist = length(delta);

        // Gravitational lensing: bend light rays
        // The bending angle is proportional to 1/r
        // Einstein ring occurs at a specific radius
        float einsteinRadius = schwarzschildRadius * 0.03;

        // Calculate lensing distortion
        float lensingFactor = 0.0;
        if (dist > einsteinRadius * 0.5) {
          lensingFactor = lensingStrength * einsteinRadius / dist;
        } else {
          lensingFactor = 0.0;
        }

        // Apply lensing to UV coordinates
        vec2 distortedUv = vUv - delta * lensingFactor;

        // Create event horizon (black center)
        float eventHorizon = smoothstep(einsteinRadius * 0.5, einsteinRadius * 0.6, dist);
        vec3 color = texture2D(tDiffuse, distortedUv).rgb;

        // Apply event horizon blackness
        color *= eventHorizon;

        // Add Einstein ring glow
        float einsteinRing = smoothstep(einsteinRadius * 0.95, einsteinRadius, dist) *
                           (1.0 - smoothstep(einsteinRadius, einsteinRadius * 1.05, dist));
        vec3 ringColor = vec3(1.0, 0.95, 0.9) * einsteinRing * 0.5;
        color += ringColor;

        // Add accretion disk glow
        float diskGlow = smoothstep(einsteinRadius * 0.6, einsteinRadius, dist) *
                        (1.0 - smoothstep(einsteinRadius * 1.3, einsteinRadius * 1.5, dist));
        vec3 accretionColor = mix(
          vec3(0.8, 0.4, 0.0),
          vec3(1.0, 0.6, 0.1),
          diskGlow
        ) * diskGlow * 0.3;
        color += accretionColor;

        gl_FragColor = vec4(color, 1.0);
      }
    `
  }))

  // Create full-screen quad for post-processing
  const quadGeometry = new THREE.PlaneGeometry(2, 2)
  lensingQuad = markRaw(new THREE.Mesh(quadGeometry, lensingMaterial))
  scene?.add(lensingQuad)

  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x333333)
  scene.add(ambientLight)

  // Point light at the sun
  const sunLight = new THREE.PointLight(0xffffaa, 2, 500)
  sunLight.position.set(0, 0, 0)
  scene.add(sunLight)

  // Create the sun
  const sunGeometry = new THREE.SphereGeometry(4, 32, 32)
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdd00
  })
  sun = markRaw(new THREE.Mesh(sunGeometry, sunMaterial))
  sun.userData.isGlowing = true
  scene.add(sun)

  // Add glow effect to sun
  const glowGeometry = new THREE.SphereGeometry(5, 32, 32)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.3
  })
  const glow = markRaw(new THREE.Mesh(glowGeometry, glowMaterial))
  sun.add(glow)

  // Create celestial bodies
  createCelestialBodies()

  // Create orbit lines
  createOrbitLines()

  // Create black hole
  createBlackHole()

  // Add stars
  createStars()

  // Initial camera position
  updateCamera()
}

function createCelestialBodies() {
  const planetData = [
    { name: 'Mercury', distance: 10, size: 0.8, color: 0xaaaaaa, speed: 2.5 },
    { name: 'Venus', distance: 15, size: 1.2, color: 0xffaa55, speed: 2.0 },
    { name: 'Earth', distance: 20, size: 1.3, color: 0x5555ff, speed: 1.5 },
    { name: 'Mars', distance: 25, size: 1.0, color: 0xff4444, speed: 1.2 },
    { name: 'Jupiter', distance: 35, size: 2.5, color: 0xffcc88, speed: 0.8 },
    { name: 'Saturn', distance: 45, size: 2.2, color: 0xddaa66, speed: 0.6 }
  ]

  planetData.forEach((planet, index) => {
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32)
    const material = new THREE.MeshStandardMaterial({
      color: planet.color,
      roughness: 0.8,
      metalness: 0.2
    })

    const mesh = markRaw(new THREE.Mesh(geometry, material))
    mesh.userData = {
      distance: planet.distance,
      speed: planet.speed,
      angle: Math.random() * Math.PI * 2,
      name: planet.name
    }

    scene?.add(mesh)
    celestialBodies.push(mesh)
    bodies.value.push({
      name: planet.name,
      distance: planet.distance,
      speed: planet.speed,
      angle: mesh.userData.angle
    })

    // Add rings for Saturn
    if (planet.name === 'Saturn') {
      const ringGeometry = new THREE.RingGeometry(3, 4.5, 64)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xaa8866,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      })
      const ring = markRaw(new THREE.Mesh(ringGeometry, ringMaterial))
      ring.rotation.x = Math.PI / 2.5
      mesh.add(ring)
    }
  })
}

function createOrbitLines() {
  celestialBodies.forEach((body) => {
    const distance = body.userData.distance
    const points: THREE.Vector3[] = []

    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2
      points.push(new THREE.Vector3(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      ))
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: 0x444466,
      transparent: true,
      opacity: 0.3
    })

    const line = markRaw(new THREE.Line(geometry, material))
    scene?.add(line)
    orbitLines.push(line)
  })
}

function createBlackHole() {
  // Create black hole sphere (simple black sphere - the lensing is done in post-processing)
  const blackHoleGeometry = new THREE.SphereGeometry(3, 32, 32)
  blackHoleMaterial = markRaw(new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 1.0
  }))

  blackHole = markRaw(new THREE.Mesh(blackHoleGeometry, blackHoleMaterial))
  blackHole.position.set(0, 0, -60) // Position in the background
  scene?.add(blackHole)

  // Add enhanced accretion disk with multiple layers
  const diskGeometry1 = new THREE.RingGeometry(9, 14, 128)
  const diskMaterial1 = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  })
  const accretionDisk1 = markRaw(new THREE.Mesh(diskGeometry1, diskMaterial1))
  accretionDisk1.rotation.x = Math.PI / 2.3
  blackHole.add(accretionDisk1)

  const diskGeometry2 = new THREE.RingGeometry(13, 18, 128)
  const diskMaterial2 = new THREE.MeshBasicMaterial({
    color: 0xff4400,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  })
  const accretionDisk2 = markRaw(new THREE.Mesh(diskGeometry2, diskMaterial2))
  accretionDisk2.rotation.x = Math.PI / 2.5
  blackHole.add(accretionDisk2)

  const diskGeometry3 = new THREE.RingGeometry(17, 22, 128)
  const diskMaterial3 = new THREE.MeshBasicMaterial({
    color: 0xaa2200,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5
  })
  const accretionDisk3 = markRaw(new THREE.Mesh(diskGeometry3, diskMaterial3))
  accretionDisk3.rotation.x = Math.PI / 2.7
  blackHole.add(accretionDisk3)

  // Rotate accretion disks at different speeds
  blackHole.userData.disks = [accretionDisk1, accretionDisk2, accretionDisk3]
  blackHole.userData.diskSpeeds = [0.003, 0.002, 0.001]
}

function createStars() {
  const starsGeometry = new THREE.BufferGeometry()
  const starCount = 2000
  const positions = new Float32Array(starCount * 3)
  const colors = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3
    // Random position in a sphere
    const radius = 100 + Math.random() * 200
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = radius * Math.cos(phi)

    // Random star colors
    const colorChoice = Math.random()
    if (colorChoice < 0.3) {
      colors[i3] = 1.0     // Red
      colors[i3 + 1] = 0.8
      colors[i3 + 2] = 0.8
    } else if (colorChoice < 0.6) {
      colors[i3] = 0.8     // Blue
      colors[i3 + 1] = 0.9
      colors[i3 + 2] = 1.0
    } else {
      colors[i3] = 1.0     // White
      colors[i3 + 1] = 1.0
      colors[i3 + 2] = 1.0
    }
  }

  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const starsMaterial = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  })

  const stars = markRaw(new THREE.Points(starsGeometry, starsMaterial))
  scene?.add(stars)
}

function updateCamera() {
  if (!camera) return

  // Camera slowly moves in a circle opposite to planet orbits
  cameraAngle += 0.0005 // Very slow rotation

  const x = Math.cos(cameraAngle) * cameraRadius
  const z = Math.sin(cameraAngle) * cameraRadius
  const y = 30 // Elevated view

  camera.position.set(x, y, z)
  camera.lookAt(0, 0, 0)
}

function updateBlackHole(time: number) {
  // Slowly rotate the black hole
  if (blackHole) {
    blackHole.rotation.y += 0.001

    // Rotate accretion disks at different speeds
    blackHole.userData.disks.forEach((disk: THREE.Mesh, index: number) => {
      disk.rotation.z += blackHole.userData.diskSpeeds[index]
    })
  }
}

function animate() {
  animationId = requestAnimationFrame(animate)

  const time = Date.now()

  // Update celestial bodies
  celestialBodies.forEach((body) => {
    body.userData.angle += body.userData.speed * 0.001

    body.position.x = Math.cos(body.userData.angle) * body.userData.distance
    body.position.z = Math.sin(body.userData.angle) * body.userData.distance

    // Rotate the planet on its axis
    body.rotation.y += 0.01
  })

  // Pulse the sun
  if (sun) {
    const scale = 1 + Math.sin(time * 0.002) * 0.05
    sun.scale.set(scale, scale, scale)
  }

  // Update camera
  updateCamera()

  // Update black hole shader
  updateBlackHole(time)

  // Gravitational lensing post-processing
  if (renderer && scene && camera && lensingTarget && lensingQuad && lensingMaterial) {
    // Remove lensing quad from scene
    scene.remove(lensingQuad)

    // Render scene to render target
    renderer.setRenderTarget(lensingTarget)
    renderer.render(scene, camera)

    // Set back to default framebuffer
    renderer.setRenderTarget(null)

    // Update lensing material
    lensingMaterial.uniforms.tDiffuse.value = lensingTarget.texture

    // Render lensing effect
    scene.add(lensingQuad)
    renderer.render(scene, camera)
  } else {
    renderer?.render(scene!, camera!)
  }
}

function handleResize() {
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)

  // Resize lensing render target
  if (lensingTarget) {
    lensingTarget.setSize(window.innerWidth, window.innerHeight)
  }
}

function cleanup() {
  // Dispose geometries and materials
  celestialBodies.forEach((body) => {
    body.geometry.dispose()
    if (Array.isArray(body.material)) {
      body.material.forEach((m) => m.dispose())
    } else {
      body.material.dispose()
    }
  })

  orbitLines.forEach((line) => {
    line.geometry.dispose()
    if (Array.isArray(line.material)) {
      line.material.forEach((m) => m.dispose())
    } else {
      line.material.dispose()
    }
  })

  if (blackHoleMaterial) {
    blackHoleMaterial.dispose()
  }

  if (sun) {
    sun.geometry.dispose()
    if (Array.isArray(sun.material)) {
      sun.material.forEach((m) => m.dispose())
    } else {
      sun.material.dispose()
    }
  }

  if (blackHole) {
    blackHole.geometry.dispose()
    if (Array.isArray(blackHole.material)) {
      blackHole.material.forEach((m) => m.dispose())
    } else {
      blackHole.material.dispose()
    }
  }

  if (lensingMaterial) {
    lensingMaterial.dispose()
  }

  if (lensingQuad) {
    lensingQuad.geometry.dispose()
    if (Array.isArray(lensingQuad.material)) {
      lensingQuad.material.forEach((m) => m.dispose())
    } else {
      lensingQuad.material.dispose()
    }
  }

  if (lensingTarget) {
    lensingTarget.dispose()
  }

  if (renderer) {
    renderer.dispose()
  }
}
</script>

<style scoped>
.orbital-mechanics-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #000;
}

.page-header {
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(100, 100, 150, 0.3);
}

.page-header h1 {
  font-size: 2rem;
  color: #fff;
  margin: 0 0 5px 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
}

.subtitle {
  color: #a5b4fc;
  font-size: 1rem;
  margin: 0;
}

.canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.orbit-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.info-panel {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 15px 25px;
  border-radius: 12px;
  border: 1px solid rgba(100, 100, 150, 0.3);
  z-index: 10;
  display: flex;
  gap: 30px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item .label {
  color: #a5b4fc;
  font-size: 0.9rem;
}

.info-item .value {
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
}

.info-item .value.active {
  color: #d946ef;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.5rem;
  }

  .info-panel {
    flex-direction: column;
    gap: 10px;
    padding: 10px 15px;
    width: 90%;
  }

  .info-item {
    justify-content: center;
  }
}
</style>
