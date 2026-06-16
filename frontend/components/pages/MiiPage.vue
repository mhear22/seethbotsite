<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useAppStore } from '../../stores/useAppStore'
import { encodeMiiStudio, type MiiData } from '../../lib/miiEncoder'

// Dynamic imports for FFL.js (WASM + Three.js integration)
import * as THREE from 'three'
import { FFL, CharModel, FFLCharModelDescDefault, FFLExpression, FFLModelFlag, makeExpressionFlag } from 'ffl.js'
import FFLShaderMaterial from 'ffl.js/materials/FFLShaderMaterial.js'

// Suppress esbuild pure removal for error/debug logging in this component
const logError = console.error
const logWarn = console.warn

const appStore = useAppStore()

// ---- Mii Config ----
interface MiiConfig {
  name: string
  gender: number
  favoriteColor: number
  height: number
  build: number
  skinColor: number
  faceType: number
  wrinklesType: number
  makeupType: number
  hairType: number
  hairColor: number
  flipHair: boolean
  eyeType: number
  eyeColor: number
  eyeScale: number
  eyeVerticalStretch: number
  eyeRotation: number
  eyeSpacing: number
  eyeYPosition: number
  eyebrowType: number
  eyebrowColor: number
  eyebrowScale: number
  eyebrowVerticalStretch: number
  eyebrowRotation: number
  eyebrowSpacing: number
  eyebrowYPosition: number
  noseType: number
  noseScale: number
  noseYPosition: number
  mouthType: number
  mouthColor: number
  mouthScale: number
  mouthHorizontalStretch: number
  mouthYPosition: number
  mustacheType: number
  beardType: number
  facialHairColor: number
  mustacheScale: number
  mustacheYPosition: number
  glassesType: number
  glassesColor: number
  glassesScale: number
  glassesYPosition: number
  moleEnabled: boolean
  moleScale: number
  moleXPosition: number
  moleYPosition: number
  creatorName: string
}

const config = reactive<MiiConfig>({
  name: 'MaWLd',
  gender: 0,
  favoriteColor: 10,
  height: 100,
  build: 30,
  skinColor: 0,
  faceType: 0,
  wrinklesType: 0,
  makeupType: 0,
  hairType: 4,
  hairColor: 6,
  flipHair: false,
  eyeType: 4,
  eyeColor: 0,
  eyeScale: 4,
  eyeVerticalStretch: 4,
  eyeRotation: 2,
  eyeSpacing: 4,
  eyeYPosition: 4,
  eyebrowType: 0,
  eyebrowColor: 6,
  eyebrowScale: 3,
  eyebrowVerticalStretch: 3,
  eyebrowRotation: 3,
  eyebrowSpacing: 4,
  eyebrowYPosition: 4,
  noseType: 1,
  noseScale: 4,
  noseYPosition: 4,
  mouthType: 23,
  mouthColor: 0,
  mouthScale: 4,
  mouthHorizontalStretch: 4,
  mouthYPosition: 4,
  mustacheType: 0,
  beardType: 0,
  facialHairColor: 0,
  mustacheScale: 0,
  mustacheYPosition: 0,
  glassesType: 0,
  glassesColor: 0,
  glassesScale: 0,
  glassesYPosition: 0,
  moleEnabled: false,
  moleScale: 4,
  moleXPosition: 0,
  moleYPosition: 0,
  creatorName: 'Oracle',
})

const miiDataB64 = ref('')
const copiedField = ref('')
const renderType = ref<'face' | 'body'>('face')
const clothesColor = ref('#9333ea')
const activeTab = ref<'body' | 'face' | 'hair' | 'extras'>('body')

const expression = ref('normal')

const expressionMap: Record<string, number> = {
  normal: FFLExpression.NORMAL,
  smile: FFLExpression.SMILE,
  angry: FFLExpression.ANGER,
  like_up: FFLExpression.LIKE_WINK_LEFT,
  surprise: FFLExpression.SURPRISE,
  sorrow: FFLExpression.SORROW,
  fun: FFLExpression.CHEEKY_33,
  blink: FFLExpression.BLINK,
}

const expressionOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Smile', value: 'smile' },
  { label: 'Angry', value: 'angry' },
  { label: 'Like', value: 'like_up' },
  { label: 'Surprised', value: 'surprise' },
  { label: 'Sorrow', value: 'sorrow' },
  { label: 'Fun', value: 'fun' },
  { label: 'Blink', value: 'blink' },
]

const genderOptions = ['Male', 'Female']
const colorOptions = [
  { label: 'Red', value: 0 },
  { label: 'Orange', value: 1 },
  { label: 'Yellow', value: 2 },
  { label: 'Light Green', value: 3 },
  { label: 'Green', value: 4 },
  { label: 'Light Blue', value: 5 },
  { label: 'Blue', value: 6 },
  { label: 'Dark Blue', value: 7 },
  { label: 'Purple', value: 8 },
  { label: 'Pink', value: 9 },
  { label: 'White', value: 10 },
  { label: 'Black', value: 11 },
]

const skinColorOptions = [
  { label: 'Lightest', value: 0 },
  { label: 'Light', value: 1 },
  { label: 'Medium Light', value: 2 },
  { label: 'Medium', value: 3 },
  { label: 'Medium Dark', value: 4 },
  { label: 'Dark', value: 5 },
]

const hairColorOptions = [
  { label: 'White', value: 0 },
  { label: 'Blonde', value: 1 },
  { label: 'Orange', value: 2 },
  { label: 'Brown', value: 3 },
  { label: 'Black', value: 4 },
  { label: 'Blue', value: 5 },
  { label: 'Purple', value: 6 },
  { label: 'Pink', value: 7 },
  { label: 'Auburn', value: 8 },
  { label: 'Grey', value: 9 },
]

const eyeColorOptions = [
  { label: 'Black', value: 0 },
  { label: 'Brown', value: 1 },
  { label: 'Orange', value: 2 },
  { label: 'Green', value: 3 },
  { label: 'Red', value: 4 },
  { label: 'Blue', value: 5 },
]

// ---- Three.js + FFL.js State ----
const canvasRef = ref<HTMLCanvasElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let fflInstance: any = null
let currentCharModel: any = null
let animFrameId: number = 0
let autoRotateAngle = 0
const isLoadingFFL = ref(true)
const fflError = ref('')

function getConfig(): MiiData {
  return {
    name: config.name,
    creatorName: config.creatorName,
    gender: config.gender,
    favoriteColor: config.favoriteColor,
    height: config.height,
    build: config.build,
    skinColor: config.skinColor,
    faceType: config.faceType,
    wrinklesType: config.wrinklesType,
    makeupType: config.makeupType,
    hairType: config.hairType,
    hairColor: config.hairColor,
    flipHair: config.flipHair,
    eyeType: config.eyeType,
    eyeColor: config.eyeColor,
    eyeScale: config.eyeScale,
    eyeVerticalStretch: config.eyeVerticalStretch,
    eyeRotation: config.eyeRotation,
    eyeSpacing: config.eyeSpacing,
    eyeYPosition: config.eyeYPosition,
    eyebrowType: config.eyebrowType,
    eyebrowColor: config.eyebrowColor,
    eyebrowScale: config.eyebrowScale,
    eyebrowVerticalStretch: config.eyebrowVerticalStretch,
    eyebrowRotation: config.eyebrowRotation,
    eyebrowSpacing: config.eyebrowSpacing,
    eyebrowYPosition: config.eyebrowYPosition,
    noseType: config.noseType,
    noseScale: config.noseScale,
    noseYPosition: config.noseYPosition,
    mouthType: config.mouthType,
    mouthColor: config.mouthColor,
    mouthScale: config.mouthScale,
    mouthHorizontalStretch: config.mouthHorizontalStretch,
    mouthYPosition: config.mouthYPosition,
    mustacheType: config.mustacheType,
    beardType: config.beardType,
    facialHairColor: config.facialHairColor,
    mustacheScale: config.mustacheScale,
    mustacheYPosition: config.mustacheYPosition,
    glassesType: config.glassesType,
    glassesColor: config.glassesColor,
    glassesScale: config.glassesScale,
    glassesYPosition: config.glassesYPosition,
    moleEnabled: config.moleEnabled,
    moleScale: config.moleScale,
    moleXPosition: config.moleXPosition,
    moleYPosition: config.moleYPosition,
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  const bin = atob(base64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}

async function initFFL() {
  try {
    const wasmBase = import.meta.env.BASE_URL || '/'

    // Import the emscripten module via our ESM wrapper in public/
    // This bypasses Vite's CJS-to-ESM interop which breaks the factory function.
    const mod = await import(/* @vite-ignore */ `${wasmBase}ffl-emscripten-esm.js`)
    const ModuleFFL: any = mod.default
    if (typeof ModuleFFL !== 'function') {
      throw new Error(`ModuleFFL is not a function: ${typeof ModuleFFL}`)
    }

    logError('[FFL] factory loaded, calling initWithResource...')
    fflInstance = await FFL.initWithResource(
      fetch(`${wasmBase}AFLResHigh_2_3.dat`),
      ModuleFFL({ locateFile: (f: string) => `${wasmBase}${f}` })
    )

    logError('[FFL] initWithResource OK')
    isLoadingFFL.value = false
    await nextTick()
    initRenderer()
    updateMiiModel()
  } catch (err: any) {
    logError('[FFL] init error:', err)
    fflError.value = `❌ ${err.message || 'Failed to initialize Mii renderer'}\n\n${err.stack || ''}`
    isLoadingFFL.value = false
  }
}

function initRenderer() {
  const canvas = canvasRef.value
  if (!canvas) return

  // Create WebGL renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace

  if (THREE.ColorManagement) {
    THREE.ColorManagement.enabled = false
  }

  // Set initial size
  const parent = canvas.parentElement
  if (parent) {
    const size = Math.min(parent.clientWidth, parent.clientHeight, 512)
    renderer.setSize(size, size)
  }

  // Scene
  scene = new THREE.Scene()
  const ambientLight = new THREE.AmbientLight(new THREE.Color(0.73, 0.73, 0.73), Math.PI)
  const directionalLight = new THREE.DirectionalLight(new THREE.Color(0.6, 0.6, 0.6), Math.PI)
  directionalLight.position.set(-0.455, 0.348, 0.5)
  scene.add(ambientLight, directionalLight)

  // Camera
  camera = new THREE.PerspectiveCamera(15, 1, 1, 5000)
  camera.position.set(0, 10, 500)
}

function updateMiiModel() {
  if (!fflInstance || !renderer || !scene || !camera) return

  try {
    const miiData = getConfig()
    const b64 = encodeMiiStudio(miiData)
    miiDataB64.value = b64
    const bytes = base64ToUint8Array(b64)

    // Build expression flag based on selected expression
    const exprValue = expressionMap[expression.value] ?? FFLExpression.NORMAL
    const exprFlag = makeExpressionFlag([exprValue, FFLExpression.BLINK, FFLExpression.LIKE_WINK_LEFT])

    // Determine model flags for face vs body
    const isFaceOnly = renderType.value === 'face'
    const modelFlag = isFaceOnly ? FFLModelFlag.NORMAL : FFLModelFlag.NORMAL

    // Create model desc
    const desc = {
      ...FFLCharModelDescDefault,
      allExpressionFlag: exprFlag,
      modelFlag,
      resolution: 512,
    }

    // Remove old model
    if (currentCharModel && scene) {
      scene.remove(currentCharModel.meshes)
    }

    // Create new CharModel
    currentCharModel = new CharModel(fflInstance, bytes, desc, FFLShaderMaterial, renderer)
    currentCharModel.initTextures(renderer, FFLShaderMaterial)

    if (currentCharModel.meshes) {
      scene.add(currentCharModel.meshes)
      // Auto-scale/position based on face vs body
      if (!isFaceOnly) {
        // Body view: adjust camera
        camera.position.set(0, 60, 300)
      } else {
        camera.position.set(0, 10, 500)
      }
      camera.lookAt(0, 10, 0)
    }

    // Start render loop if not already running
    if (!animFrameId) {
      animate()
    }
  } catch (err: any) {
    logError('[FFL] model update error:', err)
    fflError.value = `❌ ${err.message || 'Failed to render Mii'}\n\n${err.stack || ''}`
  }
}

function animate() {
  animFrameId = requestAnimationFrame(() => {
    animate()
  })

  if (!renderer || !scene || !camera || !currentCharModel) return

  // Auto-rotate slightly
  if (currentCharModel.meshes) {
    autoRotateAngle += 0.005
    currentCharModel.meshes.rotation.y = Math.sin(autoRotateAngle) * 0.15
  }

  renderer.render(scene, camera)
}

function copyToClipboard(text: string, field: string) {
  navigator.clipboard.writeText(text).then(() => {
    copiedField.value = field
    setTimeout(() => { copiedField.value = '' }, 2000)
  })
}

function randomize() {
  config.hairType = Math.floor(Math.random() * 132)
  config.eyeType = Math.floor(Math.random() * 48)
  config.eyebrowType = Math.floor(Math.random() * 24)
  config.mouthType = Math.floor(Math.random() * 36)
  config.noseType = Math.floor(Math.random() * 18)
  config.skinColor = Math.floor(Math.random() * 6)
  config.hairColor = Math.floor(Math.random() * 10)
  config.favoriteColor = Math.floor(Math.random() * 12)
  config.faceType = Math.floor(Math.random() * 12)
  config.height = 64 + Math.floor(Math.random() * 64)
  config.build = 32 + Math.floor(Math.random() * 64)
}

function handleResize() {
  if (!renderer || !canvasRef.value) return
  const parent = canvasRef.value.parentElement
  if (parent) {
    const size = Math.min(parent.clientWidth, parent.clientHeight, 512)
    renderer.setSize(size, size)
  }
}

onMounted(() => {
  initFFL()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (animFrameId) cancelAnimationFrame(animFrameId)
  if (renderer) renderer.dispose()
})

// Debounced update on config change
let updateTimer: ReturnType<typeof setTimeout> | null = null
watch(config, () => {
  if (updateTimer) clearTimeout(updateTimer)
  updateTimer = setTimeout(updateMiiModel, 200)
}, { deep: true })

watch([renderType, expression], () => {
  updateMiiModel()
})
</script>

<template>
  <div class="mii-page" :class="{ dark: appStore.darkMode }">
    <div class="mii-header">
      <h1>🔮 Mii Forge</h1>
      <p class="subtitle">Create &amp; customize your own Mii — rendered in-browser with FFL.js</p>
    </div>

    <div class="mii-layout">
      <!-- Preview Panel -->
      <div class="preview-panel">
        <div class="preview-card">
          <div class="mii-preview-wrapper">
            <canvas ref="canvasRef" class="mii-canvas" />
            <div v-if="isLoadingFFL" class="mii-loading">
              <div class="loading-spinner" />
              <span>Loading Mii Renderer...</span>
            </div>
            <div v-if="fflError && !isLoadingFFL" class="mii-error">
              ❌ <pre>{{ fflError }}</pre>
            </div>
          </div>

          <div class="name-display">{{ config.name }}</div>

          <!-- Quick expression buttons -->
          <div class="expression-bar">
            <button
              v-for="expr in expressionOptions"
              :key="expr.value"
              class="expr-btn"
              :class="{ active: expression === expr.value }"
              @click="expression = expr.value"
              :title="expr.label"
            >
              {{ expr.label }}
            </button>
          </div>
        </div>

        <!-- Data Output -->
        <div class="data-panel">
          <div class="data-block">
            <label>
              Encoded Mii Data (Base64)
              <button
                class="copy-btn"
                @click="copyToClipboard(miiDataB64, 'data')"
                :title="copiedField === 'data' ? 'Copied!' : 'Copy'"
              >
                {{ copiedField === 'data' ? '✅' : '📋' }}
              </button>
            </label>
            <code class="data-value">{{ miiDataB64 }}</code>
          </div>
        </div>
      </div>

      <!-- Controls Panel -->
      <div class="controls-panel">
        <div class="tabs">
          <button
            v-for="tab in (['body', 'face', 'hair', 'extras'] as const)"
            :key="tab"
            class="tab-btn"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
          <button class="tab-btn randomize-btn" @click="randomize" title="Randomize">🎲</button>
        </div>

        <div class="controls-content">
          <!-- Body Tab -->
          <template v-if="activeTab === 'body'">
            <div class="control-group">
              <label>Name</label>
              <input type="text" v-model="config.name" maxlength="10" class="text-input" />
            </div>
            <div class="control-row">
              <div class="control-group">
                <label>Gender</label>
                <select v-model.number="config.gender" class="select-input">
                  <option v-for="(opt, i) in genderOptions" :key="i" :value="i">{{ opt }}</option>
                </select>
              </div>
              <div class="control-group">
                <label>Favorite Color</label>
                <select v-model.number="config.favoriteColor" class="select-input">
                  <option v-for="c in colorOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
              </div>
            </div>
            <div class="control-group">
              <label>Height <span class="value-badge">{{ config.height }}</span></label>
              <input type="range" min="0" max="127" v-model.number="config.height" />
            </div>
            <div class="control-group">
              <label>Build <span class="value-badge">{{ config.build }}</span></label>
              <input type="range" min="0" max="127" v-model.number="config.build" />
            </div>
            <div class="control-group">
              <label>Skin Color</label>
              <div class="color-picker-row">
                <button
                  v-for="sc in skinColorOptions"
                  :key="sc.value"
                  class="skin-btn"
                  :class="{ active: config.skinColor === sc.value }"
                  :title="sc.label"
                  :style="{ background: `hsl(${30 + sc.value * 8}, ${60 - sc.value * 5}%, ${90 - sc.value * 12}%)` }"
                  @click="config.skinColor = sc.value"
                />
              </div>
            </div>
            <div class="control-group">
              <label>Render Type</label>
              <div class="toggle-group">
                <button
                  v-for="t in ['face', 'body']"
                  :key="t"
                  class="toggle-btn"
                  :class="{ active: renderType === t }"
                  @click="renderType = t"
                >
                  {{ t }}
                </button>
              </div>
            </div>
          </template>

          <!-- Face Tab -->
          <template v-if="activeTab === 'face'">
            <div class="control-group">
              <label>Face Type <span class="value-badge">{{ config.faceType }}</span></label>
              <input type="range" min="0" max="11" v-model.number="config.faceType" />
            </div>
            <div class="control-group">
              <label>Eye Type <span class="value-badge">{{ config.eyeType }}</span></label>
              <input type="range" min="0" max="47" v-model.number="config.eyeType" />
            </div>
            <div class="control-group">
              <label>Eye Color</label>
              <select v-model.number="config.eyeColor" class="select-input">
                <option v-for="ec in eyeColorOptions" :key="ec.value" :value="ec.value">{{ ec.label }}</option>
              </select>
            </div>
            <div class="control-row">
              <div class="control-group">
                <label>Eye Scale <span class="value-badge">{{ config.eyeScale }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.eyeScale" />
              </div>
              <div class="control-group">
                <label>Eye Stretch <span class="value-badge">{{ config.eyeVerticalStretch }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.eyeVerticalStretch" />
              </div>
            </div>
            <div class="control-row">
              <div class="control-group">
                <label>Eye Rotation <span class="value-badge">{{ config.eyeRotation }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.eyeRotation" />
              </div>
              <div class="control-group">
                <label>Eye Spacing <span class="value-badge">{{ config.eyeSpacing }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.eyeSpacing" />
              </div>
            </div>
            <div class="control-group">
              <label>Eye Y Position <span class="value-badge">{{ config.eyeYPosition }}</span></label>
              <input type="range" min="0" max="18" v-model.number="config.eyeYPosition" />
            </div>
            <div class="control-group">
              <label>Nose Type <span class="value-badge">{{ config.noseType }}</span></label>
              <input type="range" min="0" max="17" v-model.number="config.noseType" />
            </div>
            <div class="control-row">
              <div class="control-group">
                <label>Nose Scale <span class="value-badge">{{ config.noseScale }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.noseScale" />
              </div>
              <div class="control-group">
                <label>Nose Y Pos <span class="value-badge">{{ config.noseYPosition }}</span></label>
                <input type="range" min="0" max="18" v-model.number="config.noseYPosition" />
              </div>
            </div>
          </template>

          <!-- Hair Tab -->
          <template v-if="activeTab === 'hair'">
            <div class="control-group">
              <label>Hair Type <span class="value-badge">{{ config.hairType }}</span></label>
              <input type="range" min="0" max="131" v-model.number="config.hairType" />
            </div>
            <div class="control-group">
              <label>Hair Color</label>
              <select v-model.number="config.hairColor" class="select-input">
                <option v-for="hc in hairColorOptions" :key="hc.value" :value="hc.value">{{ hc.label }}</option>
              </select>
            </div>
            <div class="control-group">
              <label>
                <input type="checkbox" v-model="config.flipHair" />
                Flip Hair
              </label>
            </div>

            <div class="control-group" style="margin-top: 16px">
              <label>Eyebrow Type <span class="value-badge">{{ config.eyebrowType }}</span></label>
              <input type="range" min="0" max="23" v-model.number="config.eyebrowType" />
            </div>
            <div class="control-group">
              <label>Eyebrow Color</label>
              <select v-model.number="config.eyebrowColor" class="select-input">
                <option v-for="hc in hairColorOptions" :key="hc.value" :value="hc.value">{{ hc.label }}</option>
              </select>
            </div>
            <div class="control-row">
              <div class="control-group">
                <label>Brow Scale <span class="value-badge">{{ config.eyebrowScale }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.eyebrowScale" />
              </div>
              <div class="control-group">
                <label>Brow Stretch <span class="value-badge">{{ config.eyebrowVerticalStretch }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.eyebrowVerticalStretch" />
              </div>
            </div>
            <div class="control-row">
              <div class="control-group">
                <label>Brow Rotate <span class="value-badge">{{ config.eyebrowRotation }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.eyebrowRotation" />
              </div>
              <div class="control-group">
                <label>Brow Space <span class="value-badge">{{ config.eyebrowSpacing }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.eyebrowSpacing" />
              </div>
            </div>
            <div class="control-group">
              <label>Brow Y Pos <span class="value-badge">{{ config.eyebrowYPosition }}</span></label>
              <input type="range" min="0" max="18" v-model.number="config.eyebrowYPosition" />
            </div>

            <div class="control-group" style="margin-top: 16px">
              <label>Mouth Type <span class="value-badge">{{ config.mouthType }}</span></label>
              <input type="range" min="0" max="35" v-model.number="config.mouthType" />
            </div>
            <div class="control-group">
              <label>Mouth Color</label>
              <select v-model.number="config.mouthColor" class="select-input">
                <option v-for="ec in eyeColorOptions" :key="ec.value" :value="ec.value">{{ ec.label }}</option>
              </select>
            </div>
            <div class="control-row">
              <div class="control-group">
                <label>Mouth Scale <span class="value-badge">{{ config.mouthScale }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.mouthScale" />
              </div>
              <div class="control-group">
                <label>Mouth Stretch <span class="value-badge">{{ config.mouthHorizontalStretch }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.mouthHorizontalStretch" />
              </div>
            </div>
            <div class="control-group">
              <label>Mouth Y Pos <span class="value-badge">{{ config.mouthYPosition }}</span></label>
              <input type="range" min="0" max="18" v-model.number="config.mouthYPosition" />
            </div>
          </template>

          <!-- Extras Tab -->
          <template v-if="activeTab === 'extras'">
            <div class="control-group">
              <label>Glasses Type <span class="value-badge">{{ config.glassesType }}</span></label>
              <input type="range" min="0" max="19" v-model.number="config.glassesType" />
            </div>
            <div class="control-group">
              <label>Glasses Color</label>
              <select v-model.number="config.glassesColor" class="select-input">
                <option v-for="c in colorOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
            </div>
            <div class="control-row">
              <div class="control-group">
                <label>Glasses Scale <span class="value-badge">{{ config.glassesScale }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.glassesScale" />
              </div>
              <div class="control-group">
                <label>Glasses Y Pos <span class="value-badge">{{ config.glassesYPosition }}</span></label>
                <input type="range" min="0" max="18" v-model.number="config.glassesYPosition" />
              </div>
            </div>

            <div class="control-group" style="margin-top: 16px">
              <label>Mustache Type <span class="value-badge">{{ config.mustacheType }}</span></label>
              <input type="range" min="0" max="7" v-model.number="config.mustacheType" />
            </div>
            <div class="control-group">
              <label>Beard Type <span class="value-badge">{{ config.beardType }}</span></label>
              <input type="range" min="0" max="5" v-model.number="config.beardType" />
            </div>
            <div class="control-row">
              <div class="control-group">
                <label>Facial Hair Color</label>
                <select v-model.number="config.facialHairColor" class="select-input">
                  <option v-for="hc in hairColorOptions" :key="hc.value" :value="hc.value">{{ hc.label }}</option>
                </select>
              </div>
              <div class="control-group">
                <label>Mustache Scale <span class="value-badge">{{ config.mustacheScale }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.mustacheScale" />
              </div>
            </div>

            <div class="control-group" style="margin-top: 16px">
              <label>
                <input type="checkbox" v-model="config.moleEnabled" />
                Mole Enabled
              </label>
            </div>
            <template v-if="config.moleEnabled">
              <div class="control-group">
                <label>Mole Scale <span class="value-badge">{{ config.moleScale }}</span></label>
                <input type="range" min="0" max="7" v-model.number="config.moleScale" />
              </div>
              <div class="control-row">
                <div class="control-group">
                  <label>Mole X <span class="value-badge">{{ config.moleXPosition }}</span></label>
                  <input type="range" min="0" max="16" v-model.number="config.moleXPosition" />
                </div>
                <div class="control-group">
                  <label>Mole Y <span class="value-badge">{{ config.moleYPosition }}</span></label>
                  <input type="range" min="0" max="16" v-model.number="config.moleYPosition" />
                </div>
              </div>
            </template>

            <div class="control-group" style="margin-top: 16px">
              <label>Wrinkles <span class="value-badge">{{ config.wrinklesType }}</span></label>
              <input type="range" min="0" max="11" v-model.number="config.wrinklesType" />
            </div>
            <div class="control-group">
              <label>Makeup <span class="value-badge">{{ config.makeupType }}</span></label>
              <input type="range" min="0" max="11" v-model.number="config.makeupType" />
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="footer-note">
      <p>🎮 Powered by <a href="https://github.com/ariankordi/FFL.js" target="_blank">FFL.js</a> — Wii U Mii renderer running in-browser</p>
      <p>🔮 Tweak the sliders and watch the Mii update in real-time!</p>
    </div>
  </div>
</template>

<style scoped>
.mii-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #3b0764 100%);
  transition: background 0.5s ease;
}

.mii-page.dark {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
}

.mii-header {
  text-align: center;
  margin-bottom: 30px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.mii-header h1 {
  font-size: 2.5rem;
  color: #c084fc;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #c084fc, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.mii-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .mii-layout {
    grid-template-columns: 1fr;
  }
}

/* Preview Panel */
.preview-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-card {
  background: rgba(30, 27, 75, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 20px;
  text-align: center;
}

.mii-preview-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mii-canvas {
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
}

.mii-loading,
.mii-error {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  z-index: 2;
  max-width: 100%;
  overflow: auto;
}

.mii-error pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.75rem;
  text-align: left;
  max-height: 200px;
  overflow: auto;
  margin: 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top: 3px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.name-display {
  font-size: 1.4rem;
  font-weight: 700;
  color: #e9d5ff;
  margin-top: 12px;
  letter-spacing: 1px;
}

.expression-bar {
  display: flex;
  gap: 4px;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.expr-btn {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #c4b5fd;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expr-btn:hover {
  background: rgba(139, 92, 246, 0.3);
}

.expr-btn.active {
  background: rgba(139, 92, 246, 0.5);
  border-color: #8b5cf6;
  color: white;
}

/* Data Panel */
.data-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.data-block {
  background: rgba(30, 27, 75, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 12px;
}

.data-block label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #a78bfa;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.data-value {
  display: block;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 10px;
  border-radius: 8px;
  color: #e9d5ff;
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  word-break: break-all;
  line-height: 1.4;
  max-height: 60px;
  overflow-y: auto;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: rgba(139, 92, 246, 0.2);
}

/* Controls Panel */
.controls-panel {
  background: rgba(30, 27, 75, 0.6);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 20px;
  overflow: hidden;
}

.tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  background: none;
  border: none;
  color: #a78bfa;
  padding: 12px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.tab-btn:hover {
  background: rgba(139, 92, 246, 0.1);
  color: #c4b5fd;
}

.tab-btn.active {
  background: rgba(139, 92, 246, 0.15);
  border-bottom-color: #8b5cf6;
  color: #e9d5ff;
}

.randomize-btn {
  flex: 0 0 auto;
  font-size: 1.1rem;
  padding: 12px 16px;
}

.controls-content {
  padding: 16px 20px;
  max-height: 600px;
  overflow-y: auto;
}

.control-group {
  margin-bottom: 14px;
}

.control-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #c4b5fd;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.control-group label input[type="checkbox"] {
  accent-color: #8b5cf6;
  width: 16px;
  height: 16px;
}

.control-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.value-badge {
  background: rgba(139, 92, 246, 0.2);
  color: #e9d5ff;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-family: monospace;
}

/* Range Inputs */
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 3px;
  outline: none;
  margin-top: 4px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(139, 92, 246, 0.4);
  transition: transform 0.15s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 6px rgba(139, 92, 246, 0.4);
}

/* Select Inputs */
.select-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #e9d5ff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 2px;
}

.select-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

/* Text Input */
.text-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #e9d5ff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-top: 2px;
}

.text-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

/* Skin Color Buttons */
.color-picker-row {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.skin-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skin-btn:hover {
  transform: scale(1.15);
}

.skin-btn.active {
  border-color: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
}

/* Toggle Group */
.toggle-group {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.toggle-btn {
  flex: 1;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #a78bfa;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(139, 92, 246, 0.2);
}

.toggle-btn.active {
  background: rgba(139, 92, 246, 0.4);
  border-color: #8b5cf6;
  color: #e9d5ff;
}

/* Footer */
.footer-note {
  text-align: center;
  margin-top: 40px;
  padding: 16px;
  background: rgba(30, 27, 75, 0.5);
  border-radius: 12px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.footer-note p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin: 4px 0;
}

.footer-note a {
  color: #a78bfa;
  text-decoration: none;
  font-weight: 600;
}

.footer-note a:hover {
  text-decoration: underline;
}

/* Scrollbar */
.controls-content::-webkit-scrollbar,
.data-value::-webkit-scrollbar {
  width: 4px;
}

.controls-content::-webkit-scrollbar-track,
.data-value::-webkit-scrollbar-track {
  background: transparent;
}

.controls-content::-webkit-scrollbar-thumb,
.data-value::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 2px;
}

@media (max-width: 768px) {
  .mii-header h1 {
    font-size: 2rem;
  }

  .control-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .expression-bar {
    gap: 2px;
  }

  .expr-btn {
    padding: 3px 6px;
    font-size: 0.6rem;
  }
}
</style>
