<template>
  <div class="orbital-mechanics-page">
    <div class="page-header">
      <h1>🌌 Orbital Mechanics</h1>
      <p class="subtitle">Watch the cosmic dance of celestial bodies</p>
    </div>
    <div class="canvas-container">
      <canvas ref="canvasRef" class="orbit-canvas"></canvas>
    </div>
    <div class="scene-selector">
      <div class="selector-title">Scene Type</div>
      <button 
        v-for="scene in sceneOptions" 
        :key="scene.id"
        class="scene-btn"
        :class="{ active: currentScene === scene.id }"
        @click="switchScene(scene.id)"
        :title="scene.description"
      >
        <span class="scene-icon">{{ scene.icon }}</span>
        <span class="scene-name">{{ scene.name }}</span>
      </button>
    </div>
    <div class="controls-hint">
      <div class="title">Camera Controls</div>
      <div class="action">
        <span class="key">←</span> <span class="key">→</span> or <span class="key">A</span> <span class="key">D</span> Rotate
      </div>
      <div class="action">
        <span class="key">↑</span> <span class="key">↓</span> or <span class="key">W</span> <span class="key">S</span> Vertical
      </div>
      <div class="action">
        <span class="key">Scroll</span> or <span class="key">Q</span> <span class="key">E</span> Zoom
      </div>
    </div>
    <div class="info-panel">
      <div class="info-item">
        <span class="label">Scene:</span>
        <span class="value">{{ sceneOptions.find((s: any) => s.id === currentScene)?.name }}</span>
      </div>
      <div class="info-item">
        <span class="label">Celestial Bodies:</span>
        <span class="value">{{ bodies.length }}</span>
      </div>
      <div class="info-item">
        <span class="label">Black Hole:</span>
        <span class="value" :class="{ active: currentScene === 'solar' || currentScene === 'blackhole-sun' }">{{ currentScene === 'solar' || currentScene === 'blackhole-sun' ? 'Visible' : 'Hidden' }}</span>
      </div>
      <div class="info-item">
        <span class="label">Camera:</span>
        <span class="value" :class="{ active: manualControl }">{{ manualControl ? 'Manual (WASD/Arrows)' : 'Auto-rotating' }}</span>
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

// Scene options
const currentScene = ref<'solar' | 'blackhole-sun' | 'binary'>('solar')

const sceneOptions = [
  { id: 'solar', name: 'Solar System', icon: '🌍', description: 'Classic solar system with orbiting planets' },
  { id: 'blackhole-sun', name: 'Sun vs Black Hole', icon: '☀️🕳️', description: 'A sun being consumed by a black hole' },
  { id: 'binary', name: 'Binary System', icon: '⭐⭐', description: 'Two stars with planets in orbit' }
]

// Scene objects
let sun: THREE.Mesh | null = null
let blackHole: THREE.Mesh | null = null
let celestialBodies: THREE.Mesh[] = []
let orbitLines: THREE.Line[] = []

// Camera movement
let cameraAngle = 0
let cameraRadius = 80
let cameraVertical = 30

// Camera control state
const manualControl = ref(false)
const keysPressed = ref<Set<string>>(new Set())

// Nebulae
let nebulaMeshes: THREE.Mesh[] = []
let nebulaMaterials: THREE.ShaderMaterial[] = []

// Black hole distortion effect
let blackHoleMaterial: THREE.Material | null = null
let accretionDiskMaterial: THREE.ShaderMaterial | null = null

// Zoom
let zoomVelocity = 0

// Gravitational lensing render target
let lensingTarget: THREE.WebGLRenderTarget | null = null
let lensingMaterial: THREE.ShaderMaterial | null = null
let lensingQuad: THREE.Mesh | null = null
let orthoCamera: THREE.OrthographicCamera | null = null

// Black hole world position for lensing
const blackHolePosition = new THREE.Vector3(0, 0, -120)
const tempV = new THREE.Vector3()

onMounted(() => {
  initScene()
  animate()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  window.addEventListener('wheel', handleWheel, { passive: true })
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('wheel', handleWheel)
  cleanup()
})

function switchScene(sceneType: 'solar' | 'blackhole-sun' | 'binary') {
  currentScene.value = sceneType
  
  // Remove existing celestial bodies
  celestialBodies.forEach((body) => {
    scene?.remove(body)
    body.geometry.dispose()
    if (Array.isArray(body.material)) {
      body.material.forEach((m) => m.dispose())
    } else {
      body.material.dispose()
    }
  })
  celestialBodies = []
  bodies.value = []

  // Remove orbit lines
  orbitLines.forEach((line) => {
    scene?.remove(line)
    line.geometry.dispose()
    if (Array.isArray(line.material)) {
      line.material.forEach((m) => m.dispose())
    } else {
      line.material.dispose()
    }
  })
  orbitLines = []

  // Remove black hole if switching away from black hole scenes
  if (sceneType !== 'blackhole-sun' && blackHole) {
    scene?.remove(blackHole)
    if (blackHoleMaterial) {
      if (Array.isArray(blackHoleMaterial)) {
        blackHoleMaterial.forEach((m) => m.dispose())
      } else {
        blackHoleMaterial.dispose()
      }
    }
    blackHole = null
  }

  // Re-initialize scene based on type
  if (sceneType === 'solar') {
    setupSolarScene()
  } else if (sceneType === 'blackhole-sun') {
    setupBlackholeSunScene()
  } else if (sceneType === 'binary') {
    setupBinaryScene()
  }
}

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
    10
  ))

  // Orthographic camera for full-screen quad
  orthoCamera = markRaw(new THREE.OrthographicCamera(
    -1, 1,
    1, -1,
    0.1, 10
  ))
  orthoCamera.position.z = 1

  // Renderer setup
  renderer = markRaw(new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  }))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

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
      schwarzschildRadius: { value: 1.0 },
      lensingStrength: { value: 1 },
      bhPos: { value: new THREE.Vector2(0.5, 0.5) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float schwarzschildRadius;
      uniform float lensingStrength;
      uniform vec2 bhPos;

      varying vec2 vUv;

      void main() {

        // Calculate distance from current pixel to black hole center
        vec2 delta = vUv - bhPos;
        float dist = length(delta);

        // Gravitational lensing: bend light rays
        // The bending angle is proportional to 1/r
        // Einstein ring occurs at a specific radius
        float einsteinRadius = schwarzschildRadius * 0.03;

        // Only apply lensing effect near the black hole
        float influence = 1.0 - smoothstep(einsteinRadius * 2.0, einsteinRadius * 4.0, dist);
        
        vec3 color = texture2D(tDiffuse, vUv).rgb;

        if (influence > 0.0) {
          // Calculate lensing distortion
          float lensingFactor = 0.0;
          if (dist > einsteinRadius * 0.5) {
            lensingFactor = lensingStrength * einsteinRadius / dist * influence;
          } else {
            lensingFactor = 0.0;
          }

          // Apply lensing to UV coordinates
          vec2 distortedUv = vUv - delta * lensingFactor;
          color = texture2D(tDiffuse, distortedUv).rgb;

          // Create event horizon (black center)
          float eventHorizon = smoothstep(einsteinRadius * 0.5, einsteinRadius * 0.6, dist);

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
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `
  }))

  // Create full-screen quad for post-processing
  const quadGeometry = new THREE.PlaneGeometry(2, 2)
  lensingQuad = markRaw(new THREE.Mesh(quadGeometry, lensingMaterial))
  // Don't add to scene - it will be added dynamically during post-processing

  // Ambient light (minimal, most light from sun)
  const ambientLight = new THREE.AmbientLight(0x555577, 0.3)
  scene.add(ambientLight)

  // Point light at the sun
  const sunLight = new THREE.PointLight(0xffffcc, 5000, 1000)
  sunLight.position.set(0, 0, 0)
  sunLight.decay = 2
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 2048
  sunLight.shadow.mapSize.height = 2048
  scene.add(sunLight)

  // Create the sun with realistic shader
  const sunGeometry = new THREE.SphereGeometry(4, 64, 64)
  const sunMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
      
      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for(int i = 0; i < 5; i++) {
          value += amplitude * snoise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }
      
      void main() {
        vec3 pos = vWorldPosition * 0.5;
        
      // Animated noise for solar surface
      float noise1 = fbm(vec3(pos.x + time * 0.1, pos.y, pos.z + time * 0.05));
      float noise2 = fbm(vec3(pos.x * 1.5 - time * 0.08, pos.y * 1.5, pos.z * 1.5 + time * 0.07));
      float noise = mix(noise1, noise2, 0.5);
      
      // Normalize noise to 0-1 range
      noise = noise * 0.5 + 0.5;
      
      // Fresnel effect for limb darkening
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = 1.0 - max(0.0, dot(viewDir, vNormal));
      fresnel = pow(fresnel, 2.5);
      
      // Core color (yellow-white)
      vec3 coreColor = vec3(1.0, 0.98, 0.9);
      
      // Surface color (golden-orange)
      vec3 surfaceColor = vec3(1.0, 0.75, 0.35);
      
      // Limb darkening (redder at edges)
      vec3 limbColor = vec3(0.95, 0.5, 0.15);
      
      // Mix colors based on noise and fresnel
      vec3 color = mix(surfaceColor, coreColor, noise * 0.4 + 0.3);
      color = mix(color, limbColor, fresnel * 0.6);
      
      // Add subtle surface activity
      float activity = smoothstep(0.4, 0.8, noise) * 0.15;
      color += vec3(1.0, 0.95, 0.7) * activity;
      
      // Ensure bright colors
      color = max(color, vec3(0.0));
      color = clamp(color, 0.0, 1.0);
      
      gl_FragColor = vec4(color, 1.0);
    }
    `
  })
  sun = markRaw(new THREE.Mesh(sunGeometry, sunMaterial))
  sun.userData.isGlowing = true
  scene.add(sun)

  // Realistic corona/glow using sprite
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  
  // Create radial gradient for corona
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(255, 255, 230, 1.0)')
  gradient.addColorStop(0.2, 'rgba(255, 240, 180, 0.8)')
  gradient.addColorStop(0.4, 'rgba(255, 200, 100, 0.4)')
  gradient.addColorStop(0.7, 'rgba(255, 150, 50, 0.15)')
  gradient.addColorStop(1, 'rgba(200, 100, 30, 0)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)
  
  const coronaTexture = new THREE.CanvasTexture(canvas)
  const coronaMaterial = new THREE.SpriteMaterial({
    map: coronaTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  
  const corona = markRaw(new THREE.Sprite(coronaMaterial))
  corona.scale.set(0.7, 0.4, 2)
  sun.add(corona)

  // Setup the default scene
  setupSolarScene()

  // Initial camera position
  updateCamera()
}

function createBinaryStars() {
  // Create two stars orbiting each other
  const star1Data = {
    size: 2.5,
    color: 0xffddaa,
    glowColor: 0xffaa55
  }

  const star2Data = {
    size: 2.0,
    color: 0xaaddff,
    glowColor: 0x55aaff
  }

  // Create star 1
  const star1Geometry = new THREE.SphereGeometry(star1Data.size, 32, 32)
  const star1Material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      coreColor: { value: new THREE.Color(star1Data.color) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normal;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 coreColor;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = 1.0 - max(0.0, dot(viewDir, vNormal));
        fresnel = pow(fresnel, 3.0);
        
        gl_FragColor = vec4(coreColor, 1.0);
      }
    `
  })

  const star1 = markRaw(new THREE.Mesh(star1Geometry, star1Material))
  star1.userData.isStar = true
  star1.userData.starIndex = 1
  star1.userData.orbitRadius = 15
  star1.userData.orbitAngle = 0
  scene?.add(star1)
  celestialBodies.push(star1)

  // Create star 2
  const star2Geometry = new THREE.SphereGeometry(star2Data.size, 32, 32)
  const star2Material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      coreColor: { value: new THREE.Color(star2Data.color) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vNormal = normal;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 coreColor;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = 1.0 - max(0.0, dot(viewDir, vNormal));
        fresnel = pow(fresnel, 3.0);
        
        gl_FragColor = vec4(coreColor, 1.0);
      }
    `
  })

  const star2 = markRaw(new THREE.Mesh(star2Geometry, star2Material))
  star2.userData.isStar = true
  star2.userData.starIndex = 2
  star2.userData.orbitRadius = 15
  star2.userData.orbitAngle = Math.PI
  scene?.add(star2)
  celestialBodies.push(star2)

  // Add point lights for the stars
  const star1Light = new THREE.PointLight(star1Data.glowColor, 3000, 100)
  star1Light.position.set(0, 0, 0)
  star1.add(star1Light)
  scene?.add(star1Light)

  const star2Light = new THREE.PointLight(star2Data.glowColor, 2500, 100)
  star2Light.position.set(0, 0, 0)
  star2.add(star2Light)
  scene?.add(star2Light)
}

function createBinaryPlanets() {
  // Planets orbiting the binary star system
  const binaryPlanetData = [
    { name: 'Alpha', distance: 25, size: 0.9, color: 0x44aaff, speed: 1.2 },
    { name: 'Beta', distance: 35, size: 0.7, color: 0xff44aa, speed: 0.8 },
    { name: 'Gamma', distance: 50, size: 1.1, color: 0xaaff44, speed: 0.5 }
  ]

  binaryPlanetData.forEach((planet) => {
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32)
    const material = new THREE.MeshStandardMaterial({
      color: planet.color,
      roughness: 0.6,
      metalness: 0.1
    })

    const mesh = markRaw(new THREE.Mesh(geometry, material))
    mesh.castShadow = true
    mesh.receiveShadow = true
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
  })

  // Create orbit lines for binary planets
  binaryPlanetData.forEach((planet) => {
    const distance = planet.distance
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
      color: 0x44aaff,
      transparent: true,
      opacity: 0.4
    })

    const line = markRaw(new THREE.Line(geometry, material))
    scene?.add(line)
    orbitLines.push(line)
  })
}

function setupSolarScene() {
  // Create celestial bodies
  createCelestialBodies()

  // Create orbit lines
  createOrbitLines()

  // Create black hole (but hidden, just for effect)
  createBlackHole()

  // Add stars
  createStars()

  // Add distant nebulae
  createNebulae()
}

function setupBlackholeSunScene() {
  // Create celestial bodies
  createCelestialBodies()

  // Create orbit lines
  createOrbitLines()

  // Create black hole
  createBlackHole()

  // Move sun closer to black hole to show it being "eaten"
  if (sun) {
    sun.position.set(0, 0, -50)
    sun.userData.isBeingEaten = true
  }

  // Add stars
  createStars()

  // Add distant nebulae
  createNebulae()
}

function setupBinaryScene() {
  // Remove default sun
  if (sun) {
    scene?.remove(sun)
    sun = null
  }

  // Create binary star system
  createBinaryStars()

  // Create planets around the binary system
  createBinaryPlanets()

  // Add stars
  createStars()

  // Add distant nebulae
  createNebulae()
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
      roughness: 0.6,
      metalness: 0.1
    })

    const mesh = markRaw(new THREE.Mesh(geometry, material))
    mesh.castShadow = true
    mesh.receiveShadow = true
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
      color: 0x6677aa,
      transparent: true,
      opacity: 0.9
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
  blackHole.position.set(0, 0, -120)
  scene?.add(blackHole)

  // Realistic accretion disk using a custom shader
  // Single wide ring geometry, tilted to be viewed at a shallow angle
  const diskGeometry = new THREE.RingGeometry(4.5, 26, 256, 64)
  accretionDiskMaterial = markRaw(new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      innerRadius: { value: 4.5 },
      outerRadius: { value: 26.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float innerRadius;
      uniform float outerRadius;
      varying vec2 vUv;
      varying vec3 vPosition;

      // Hash-based noise
      float hash(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1,0)), f.x),
          mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
          f.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p = p * 2.1 + vec2(1.3, 0.7);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        float r = length(vPosition.xy);
        float normalizedR = (r - innerRadius) / (outerRadius - innerRadius);
        normalizedR = clamp(normalizedR, 0.0, 1.0);

        // Angle around the disk
        float angle = atan(vPosition.y, vPosition.x);

        // Keplerian angular velocity: inner material moves faster
        float angularSpeed = 0.6 / max(r * 0.18, 0.1);
        float sweptAngle = angle - time * angularSpeed;

        // Turbulent noise in polar coordinates
        vec2 polarUv = vec2(sweptAngle / (2.0 * 3.14159) + 0.5, normalizedR);
        float turbulence = fbm(polarUv * vec2(12.0, 4.0) + vec2(time * 0.05, 0.0));
        float fineTurb = fbm(polarUv * vec2(30.0, 8.0) - vec2(time * 0.08, 0.0));
        turbulence = turbulence * 0.7 + fineTurb * 0.3;

        // Relativistic Doppler brightening: approaching side (angle ~ 0) is brighter
        float doppler = 0.5 + 0.5 * cos(angle);
        doppler = pow(doppler, 1.5);

        // Temperature gradient: white-hot at inner edge -> orange -> dark red at outer edge
        vec3 innerColor  = vec3(1.0,  0.98, 0.85); // near-white / pale yellow
        vec3 midColor    = vec3(1.0,  0.55, 0.08); // bright orange
        vec3 outerColor  = vec3(0.45, 0.05, 0.0);  // deep dark red

        vec3 color;
        if (normalizedR < 0.5) {
          color = mix(innerColor, midColor, normalizedR * 2.0);
        } else {
          color = mix(midColor, outerColor, (normalizedR - 0.5) * 2.0);
        }

        // Modulate brightness by turbulence and Doppler
        float brightness = turbulence * (1.0 + doppler * 0.6);
        color *= brightness;

        // Thin bright filaments near inner edge
        float filament = smoothstep(0.0, 0.15, normalizedR) * (1.0 - smoothstep(0.15, 0.35, normalizedR));
        color += vec3(1.0, 0.9, 0.6) * filament * fbm(polarUv * vec2(20.0, 2.0) + time * 0.1) * 1.2;

        // Sharp inner edge falloff, soft outer edge
        float innerEdge = smoothstep(0.0, 0.04, normalizedR);
        float outerEdge = 1.0 - smoothstep(0.78, 1.0, normalizedR);
        float alpha = innerEdge * outerEdge;

        // Extra opacity variation for wispy look
        alpha *= mix(0.5, 1.0, turbulence);
        alpha = clamp(alpha, 0.0, 1.0);

        gl_FragColor = vec4(color, alpha);
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }))

  const accretionDisk = markRaw(new THREE.Mesh(diskGeometry, accretionDiskMaterial))
  // Tilt the disk so it's viewed at a shallow angle (like Interstellar's Gargantua)
  accretionDisk.rotation.x = Math.PI / 2.2
  blackHole.add(accretionDisk)

  blackHole.userData.disks = []
  blackHole.userData.diskSpeeds = []
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

function createNebulae() {
  const loader = new THREE.TextureLoader()

  // Real Hubble/ESA images + placement config
  // aspect: approximate w/h of the source image so the plane isn't stretched
  const nebulaConfigs = [
    {
      tex: '/images/nebula-orion.jpg',
      pos: new THREE.Vector3( 140,  32, -110),
      size: 90, aspect: 1.33,
      rx: 0.12, ry:  0.28, rz:  0.4,
      brightness: 0.7,
    },
    {
      tex: '/images/nebula-carina.jpg',
      pos: new THREE.Vector3(-120, -15, 130),
      size: 85, aspect: 1.78,
      rx: -0.18, ry: -0.92, rz: 1.2,
      brightness: 0.75,
    },
    {
      tex: '/images/nebula-pillars.jpg',
      pos: new THREE.Vector3( 25, -70, -150),
      size: 75, aspect: 0.72,
      rx:  0.28, ry:  0.08, rz: 2.6,
      brightness: 0.8,
    },
    {
      tex: '/images/nebula-horsehead.jpg',
      pos: new THREE.Vector3(-80, 80, -120),
      size: 70, aspect: 1.25,
      rx: -0.08, ry:  0.32, rz: 0.9,
      brightness: 0.65,
    },
    {
      tex: '/images/nebula-eagle.jpg',
      pos: new THREE.Vector3( 100, -90, -140),
      size: 80, aspect: 1.5,
      rx:  0.18, ry: -0.14, rz: 3.8,
      brightness: 0.72,
    },
  ]

  // Vertex shader — passes UVs through
  const nebulaVert = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  // Fragment shader — samples the Hubble texture, softens edges, adds shimmer
  const nebulaFrag = `
    uniform sampler2D nebulaMap;
    uniform float     time;
    uniform float     brightness;
    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 74.27);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.1 + vec2(1.7, 0.9); a *= 0.5; }
      return v;
    }

    void main() {
      vec2 uv = vUv;

      // Very subtle domain-warp shimmer so the nebula breathes slightly
      vec2 warp = vec2(
        fbm(uv * 3.0 + vec2(time * 0.004, 0.0)),
        fbm(uv * 3.0 + vec2(0.0, time * 0.003))
      ) * 0.006;
      vec2 sampledUv = clamp(uv + warp, 0.0, 1.0);

      vec3 col = texture2D(nebulaMap, sampledUv).rgb;

      // Boost gamma so dim regions pop — real nebula photos are often dark
      col = pow(col, vec3(0.72));

      // Saturate: push colours away from grey
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(lum), col, 1.55);

      // Overall brightness scalar set per-nebula
      col *= brightness;

      // Soft radial vignette — fades to transparent at edges so it blends into space
      vec2 centered = uv - 0.5;
      float r = length(centered);
      float vignette = 1.0 - smoothstep(0.32, 0.52, r);

      // Also use the image's own luminance as an alpha mask
      // (bright nebula regions = opaque; black space inside the photo = transparent)
      float lumAlpha = dot(texture2D(nebulaMap, sampledUv).rgb, vec3(0.299, 0.587, 0.114));
      // Lift a little so mid-grey ISM regions are still visible
      float alpha = vignette * clamp(lumAlpha * 1.6 + 0.0, 0.0, 1.0);

      gl_FragColor = vec4(col, alpha);
    }
  `

  nebulaConfigs.forEach((cfg) => {
    const tex = loader.load(cfg.tex)
    tex.colorSpace = THREE.SRGBColorSpace

    const mat = markRaw(new THREE.ShaderMaterial({
      uniforms: {
        nebulaMap:  { value: tex },
        time:       { value: 0 },
        brightness: { value: cfg.brightness },
      },
      vertexShader:   nebulaVert,
      fragmentShader: nebulaFrag,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      side: THREE.DoubleSide,
    }))

    // Use aspect ratio to avoid stretching (size = height, width = size * aspect)
    const geo  = new THREE.PlaneGeometry(cfg.size * cfg.aspect, cfg.size)
    const mesh = markRaw(new THREE.Mesh(geo, mat))
    mesh.position.copy(cfg.pos)
    mesh.rotation.set(cfg.rx, cfg.ry, cfg.rz)

    scene?.add(mesh)
    nebulaMeshes.push(mesh)
    nebulaMaterials.push(mat)
  })
}

function updateCamera() {
  if (!camera) return

  // Check for manual control keys
  const hasManualInput = keysPressed.value.has('ArrowLeft') ||
                        keysPressed.value.has('ArrowRight') ||
                        keysPressed.value.has('ArrowUp') ||
                        keysPressed.value.has('ArrowDown') ||
                        keysPressed.value.has('KeyA') ||
                        keysPressed.value.has('KeyD') ||
                        keysPressed.value.has('KeyW') ||
                        keysPressed.value.has('KeyS') ||
                        keysPressed.value.has('KeyQ') ||
                        keysPressed.value.has('KeyE')

  if (hasManualInput) {
    manualControl.value = true
  }

  if (manualControl.value && hasManualInput) {
    // Manual camera control with smooth movement
    const rotationSpeed = 0.02
    const verticalSpeed = 0.5
    const zoomSpeed = 1.0

    // Horizontal rotation (Left/Right arrows or A/D)
    if (keysPressed.value.has('ArrowLeft') || keysPressed.value.has('KeyA')) {
      cameraAngle += rotationSpeed
    }
    if (keysPressed.value.has('ArrowRight') || keysPressed.value.has('KeyD')) {
      cameraAngle -= rotationSpeed
    }

    // Vertical movement (Up/Down arrows or W/S)
    if (keysPressed.value.has('ArrowUp') || keysPressed.value.has('KeyW')) {
      cameraVertical = Math.min(cameraVertical + verticalSpeed, 80)
    }
    if (keysPressed.value.has('ArrowDown') || keysPressed.value.has('KeyS')) {
      cameraVertical = Math.max(cameraVertical - verticalSpeed, -20)
    }

    // Zoom in/out (Q = zoom in, E = zoom out)
    if (keysPressed.value.has('KeyQ')) {
      zoomVelocity -= 0.8
    }
    if (keysPressed.value.has('KeyE')) {
      zoomVelocity += 0.8
    }
  } else {
    // Auto-rotate camera (disabled when using manual control)
    cameraAngle += 0.0005 // Very slow rotation
  }

  // Apply zoom velocity with smooth damping
  cameraRadius = Math.max(20, Math.min(250, cameraRadius + zoomVelocity))
  zoomVelocity *= 0.88 // friction

  const x = Math.cos(cameraAngle) * cameraRadius
  const z = Math.sin(cameraAngle) * cameraRadius
  const y = cameraVertical

  camera.position.set(x, y, z)
  camera.lookAt(0, 0, 0)
}

function handleKeyDown(event: KeyboardEvent) {
  keysPressed.value.add(event.code)
}

function handleKeyUp(event: KeyboardEvent) {
  keysPressed.value.delete(event.code)
}

function handleWheel(event: WheelEvent) {
  manualControl.value = true
  // deltaY > 0 → scroll down → zoom out; < 0 → zoom in
  zoomVelocity += event.deltaY * 0.04
  // Clamp impulse so a fast scroll doesn't teleport the camera
  zoomVelocity = Math.max(-12, Math.min(12, zoomVelocity))
}

function updateBlackHole(time: number) {
  if (blackHole) {
    // Very slow y-axis drift for a subtle parallax feel
    blackHole.rotation.y += 0.0003

    // Drive the shader time so Keplerian rotation and turbulence animate
    if (accretionDiskMaterial) {
      accretionDiskMaterial.uniforms.time.value = time
    }
  }
}

function updateBlackHoleScreenPosition() {
  if (!camera || !lensingMaterial || !blackHole) return

  // Project black hole world position to screen space
  tempV.copy(blackHolePosition)
  tempV.project(camera)

  // Convert from NDC (-1 to 1) to UV (0 to 1)
  const screenX = (tempV.x + 1) / 2
  const screenY = (tempV.y + 1) / 2

  // Update shader uniform
  lensingMaterial.uniforms.bhPos.value.set(screenX, screenY)
}

function animate() {
  animationId = requestAnimationFrame(animate)

  const time = Date.now()

  // Animate binary stars (if they exist)
  celestialBodies.filter((body) => body.userData.isStar).forEach((star, index) => {
    star.userData.orbitAngle += (index === 0 ? 0.001 : -0.001) // Orbit in opposite directions
    const orbitRadius = star.userData.orbitRadius || 15

    // Star 1 orbits clockwise, Star 2 orbits counterclockwise
    const direction = star.userData.starIndex === 1 ? 1 : -1
    star.userData.orbitAngle += 0.0005 * direction

    star.position.x = Math.cos(star.userData.orbitAngle) * orbitRadius
    star.position.z = Math.sin(star.userData.orbitAngle) * orbitRadius
  })

  // Update celestial bodies (planets)
  celestialBodies.filter((body) => !body.userData.isStar).forEach((body) => {
    body.userData.angle += body.userData.speed * 0.001

    body.position.x = Math.cos(body.userData.angle) * body.userData.distance
    body.position.z = Math.sin(body.userData.angle) * body.userData.distance

    // Rotate the planet on its axis
    body.rotation.y += 0.01
  })

  // Update sun shader time
  if (sun && sun.material.uniforms) {
    sun.material.uniforms.time.value = time * 0.001
  }

  // Animate nebula shaders
  nebulaMaterials.forEach((mat) => {
    mat.uniforms.time.value = time * 0.001
  })

  // Update camera
  updateCamera()

  // Update black hole shader
  updateBlackHole(time)

  // Update black hole screen position for lensing
  updateBlackHoleScreenPosition()

  // Gravitational lensing post-processing
  if (renderer && scene && camera && lensingTarget && lensingQuad && lensingMaterial && orthoCamera) {
    // Remove lensing quad from scene
    scene.remove(lensingQuad)

    // Render scene to render target
    renderer.setRenderTarget(lensingTarget)
    renderer.render(scene, camera)

    // Set back to default framebuffer
    renderer.setRenderTarget(null)

    // Update lensing material
    lensingMaterial.uniforms.tDiffuse.value = lensingTarget.texture

    // Render lensing effect with orthographic camera
    scene.add(lensingQuad)
    renderer.render(scene, orthoCamera)
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
    sun.children.forEach((child) => {
      if (child instanceof THREE.Sprite) {
        child.material.dispose()
      }
    })
  }

  nebulaMeshes.forEach((m) => {
    m.geometry.dispose()
  })
  nebulaMaterials.forEach((m) => {
    if (m.uniforms.nebulaMap?.value) {
      m.uniforms.nebulaMap.value.dispose()
    }
    m.dispose()
  })
  nebulaMeshes = []
  nebulaMaterials = []

  if (accretionDiskMaterial) {
    accretionDiskMaterial.dispose()
    accretionDiskMaterial = null
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

  if (orthoCamera) {
    orthoCamera = null
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

.scene-selector {
  position: fixed;
  top: 100px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(100, 100, 150, 0.3);
  z-index: 10;
  font-size: 0.85rem;
  color: #a5b4fc;
}

.scene-selector .selector-title {
  color: #fff;
  font-weight: bold;
  margin-bottom: 10px;
}

.scene-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(100, 100, 150, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  color: #a5b4fc;
}

.scene-btn:hover {
  background: rgba(139, 92, 246, 0.4);
  border-color: rgba(165, 180, 252, 0.5);
}

.scene-btn.active {
  background: rgba(139, 92, 246, 0.6);
  border-color: #a5b4fc;
  box-shadow: 0 0 8px rgba(165, 180, 252, 0.3);
}

.scene-icon {
  font-size: 1.2rem;
}

.scene-name {
  font-weight: 500;
}

.controls-hint {
  position: fixed;
  top: 100px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(100, 100, 150, 0.3);
  z-index: 10;
  font-size: 0.85rem;
  color: #a5b4fc;
}

.controls-hint .title {
  color: #fff;
  font-weight: bold;
  margin-bottom: 10px;
}

.controls-hint .key {
  display: inline-block;
  background: rgba(139, 92, 246, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 4px;
  padding: 2px 6px;
  margin: 2px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #d946ef;
}

.controls-hint .action {
  margin: 5px 0;
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

  .controls-hint {
    top: 100px;
    left: 20px;
    right: auto;
    font-size: 0.75rem;
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
