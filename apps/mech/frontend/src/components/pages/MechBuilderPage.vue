<template>
  <div class="mech-builder-page">
    <div class="flow-navigation" role="navigation" aria-label="Mech flow navigation">
      <button type="button" class="flow-pill action" @click="goHome">← Menu</button>
      <span class="flow-pill current">Builder</span>
      <button
        type="button"
        class="flow-pill action"
        :disabled="!canLaunchBattle"
        @click="goToBattle"
      >
        Battle →
      </button>
    </div>

    <!-- Header -->
    <div class="header">
      <h1>Mech Builder</h1>
      <div class="threat-indicator">
        <span class="threat-label">Threat Level:</span>
        <div class="threat-bar-container">
          <div class="threat-bar-fill" :style="{ width: threatLevel + '%' }"></div>
        </div>
        <span class="threat-value">{{ threatLevel }}</span>
      </div>
    </div>

    <!-- Progress Steps -->
    <div class="progress-steps">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="step"
        :class="{
          active: currentStep === index,
          completed: isStepCompleted(index),
          available: true
        }"
        @click="goToStep(index)"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-label">{{ step.label }}</div>
        <MechIcons v-if="isStepCompleted(index)" icon="synergy-target" :size="16" class="step-check" />
      </div>
    </div>

    <!-- Main Content Area: wizard steps + persistent mech preview -->
    <div class="builder-layout">
    <div class="wizard-content">
      <CoreSelectionStep
        v-if="currentStep === 0"
        :core-presets="CORE_PRESETS"
        :selected-core="loadout.core"
        :total-stats="totalStats"
        @select="(core) => selectPart(core, 'core')"
      />

      <LegsSelectionStep
        v-if="currentStep === 1"
        :legs-presets="LEGS_PRESETS"
        :selected-legs="loadout.legs"
        :total-stats="totalStats"
        @select="(legs) => selectPart(legs, 'legs')"
      />

      <HeadSelectionStep
        v-if="currentStep === 2"
        :head-presets="HEAD_PRESETS"
        :selected-head="loadout.head"
        :total-stats="totalStats"
        @select="(head) => selectPart(head, 'head')"
      />

      <ArmsSelectionStep
        v-if="currentStep === 3"
        :arm-presets="ARM_PRESETS"
        :left-arm="loadout.leftArm"
        :right-arm="loadout.rightArm"
        :preview-arm="selectedArmForPreview"
        :total-stats="totalStats"
        :is-part-in-synergy="isPartInSynergy"
        @select-arm="selectArmSlot"
        @remove="removePart"
      />

      <RackSelectionStep
        v-if="currentStep === 4"
        :rack-presets="RACK_PRESETS"
        :selected-rack="loadout.rack"
        :total-stats="totalStats"
        @select="(rack) => selectPart(rack, 'rack')"
        @skip="removePart('rack')"
      />

      <ReviewStep
        v-if="currentStep === 5"
        :loadout="loadout"
        :total-stats="totalStats"
        :active-synergies="activeSynergies"
        :build-score="buildScore"
        :warnings="warnings"
      />

      <!-- Navigation Buttons -->
      <div class="wizard-navigation">
        <button @click="previousStep" :disabled="currentStep === 0" class="nav-btn prev-btn">
          ← Previous
        </button>

        <button @click="showLoadModal = true" class="nav-btn load-btn">
          📂 Load
        </button>

        <button @click="resetBuild" class="nav-btn reset-btn">
          Reset Build
        </button>

        <button @click="randomizeBuild" class="nav-btn random-btn">
          🎲 Random
        </button>

        <button
          v-if="currentStep < 5"
          @click="nextStep"
          :disabled="!canProceed"
          class="nav-btn next-btn"
        >
          Next →
        </button>

        <button
          v-if="currentStep === 5"
          @click="shareBuild"
          :disabled="!canShare"
          class="nav-btn share-btn"
        >
          Share Build
        </button>

        <button
          v-if="currentStep === 5"
          @click="goToBattle"
          :disabled="!canLaunchBattle"
          class="nav-btn battle-btn"
        >
          ⚔️ Battle!
        </button>
      </div>
    </div>

    <aside class="preview-panel">
      <div class="preview-panel-header">
        <span>Preview</span>
        <span class="preview-build-score">Score: {{ buildScore }}</span>
      </div>
      <div class="preview-panel-canvas">
        <MechPreview3D :loadout="loadout" />
      </div>
    </aside>
    </div>

    <LoadBuildModal
      v-if="showLoadModal"
      :presets="STARTER_PRESETS"
      :saved-builds="savedBuilds"
      @close="showLoadModal = false"
      @load-preset="onLoadPreset"
      @load-build="onLoadBuild"
      @delete-build="deleteBuild"
      @save="saveCurrentBuild"
    />

    <!-- Arm Selection Modal -->
    <div v-if="showArmModal" class="modal-overlay" @click="showArmModal = false">
      <div class="modal-content" @click.stop>
        <h3>Select Arm Slot</h3>
        <p>Which arm should equip <strong>{{ pendingArm?.name }}</strong>?</p>
        <div class="arm-choice-buttons">
          <button @click="confirmArmSelection('leftArm')" class="choice-btn">
            Left Arm
            <span v-if="loadout.leftArm" class="current-weapon">(Currently: {{ loadout.leftArm.name }})</span>
            <span v-else class="empty-slot-text">(Empty)</span>
          </button>
          <button @click="confirmArmSelection('rightArm')" class="choice-btn">
            Right Arm
            <span v-if="loadout.rightArm" class="current-weapon">(Currently: {{ loadout.rightArm.name }})</span>
            <span v-else class="empty-slot-text">(Empty)</span>
          </button>
        </div>
        <button @click="showArmModal = false" class="cancel-btn">Cancel</button>
      </div>
    </div>

    <!-- Share Notification -->
    <div v-if="showShareNotification" class="share-notification">
      Build link copied to clipboard!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMechBuilder, type ArmPart } from '../../composables/useMechBuilder'
import MechIcons from '../mech/MechIcons.vue'
import MechPreview3D from '../mech/MechPreview3D.vue'
import LoadBuildModal from '../mech/builder/LoadBuildModal.vue'
import CoreSelectionStep from '../mech/builder/steps/CoreSelectionStep.vue'
import LegsSelectionStep from '../mech/builder/steps/LegsSelectionStep.vue'
import HeadSelectionStep from '../mech/builder/steps/HeadSelectionStep.vue'
import ArmsSelectionStep from '../mech/builder/steps/ArmsSelectionStep.vue'
import RackSelectionStep from '../mech/builder/steps/RackSelectionStep.vue'
import ReviewStep from '../mech/builder/steps/ReviewStep.vue'

const router = useRouter()

const builder = useMechBuilder()
const {
  loadout,
  totalStats,
  savedBuilds,
  activeSynergies,
  threatLevel,
  warnings,
  buildScore,
  isComplete,
  selectPart,
  removePart,
  resetBuild,
  randomizeBuild,
  loadPresetBuild,
  saveBuild,
  loadBuild,
  deleteBuild,
  exportBuild,
  importBuild,
  loadFromBrowser,
  loadBuildsFromStorage,
  ARM_PRESETS,
  CORE_PRESETS,
  LEGS_PRESETS,
  HEAD_PRESETS,
  RACK_PRESETS,
  STARTER_PRESETS
} = builder

// Wizard state
const currentStep = ref(0)
const showArmModal = ref(false)
const pendingArm = ref<ArmPart | null>(null)
const showShareNotification = ref(false)

// Load modal state
const showLoadModal = ref(false)

function saveCurrentBuild(name: string) {
  saveBuild(name || `Build ${savedBuilds.value.length + 1}`)
}

function onLoadPreset(presetId: string) {
  loadPresetBuild(presetId)
  showLoadModal.value = false
}

function onLoadBuild(index: number) {
  loadBuild(index)
  showLoadModal.value = false
}

const steps = [
  { id: 'core', label: 'Core', required: true },
  { id: 'legs', label: 'Legs', required: true },
  { id: 'head', label: 'Head', required: true },
  { id: 'arms', label: 'Weapons', required: false },
  { id: 'rack', label: 'Equipment', required: false },
  { id: 'review', label: 'Review', required: false }
]

// Computed
const canProceed = computed(() => {
  if (currentStep.value === 0) return loadout.value.core !== null
  if (currentStep.value === 1) return loadout.value.legs !== null
  if (currentStep.value === 2) return loadout.value.head !== null
  return true
})

const canShare = computed(() => {
  return isComplete.value && warnings.value.length === 0
})

const canLaunchBattle = computed(() => {
  return isComplete.value && warnings.value.length === 0
})

const selectedArmForPreview = computed(() => {
  return loadout.value.leftArm || loadout.value.rightArm || null
})

// Methods
function isStepCompleted(stepIndex: number): boolean {
  if (stepIndex === 0) return loadout.value.core !== null
  if (stepIndex === 1) return loadout.value.legs !== null
  if (stepIndex === 2) return loadout.value.head !== null
  if (stepIndex === 3) return loadout.value.leftArm !== null || loadout.value.rightArm !== null
  if (stepIndex === 4) return loadout.value.rack !== null
  return false
}

function goToStep(index: number) {
  currentStep.value = index
}

function nextStep() {
  if (canProceed.value && currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function isPartInSynergy(partId: string): boolean {
  return activeSynergies.value.some(synergy => synergy.requiredParts.includes(partId))
}

function selectArmSlot(arm: ArmPart) {
  if (!loadout.value.leftArm) {
    selectPart(arm, 'leftArm')
  } else if (!loadout.value.rightArm) {
    selectPart(arm, 'rightArm')
  } else {
    // Both arms occupied, show modal
    pendingArm.value = arm
    showArmModal.value = true
  }
}

function confirmArmSelection(slot: 'leftArm' | 'rightArm') {
  if (pendingArm.value) {
    selectPart(pendingArm.value, slot)
    pendingArm.value = null
    showArmModal.value = false
  }
}

function shareBuild() {
  if (!canShare.value) return

  const code = exportBuild()
  const url = window.location.origin + '/mech/builder?build=' + code

  navigator.clipboard.writeText(url).then(() => {
    showShareNotification.value = true
    setTimeout(() => {
      showShareNotification.value = false
    }, 3000)
  }).catch(err => {
    console.error('Failed to copy:', err)
    alert('Build code: ' + code)
  })
}

function goHome() {
  router.push({ name: 'mech-home' })
}

function goToBattle() {
  if (!canLaunchBattle.value) return

  // Export build code and pass via query parameter
  const buildCode = exportBuild()

  router.push({
    name: 'mech-battle',
    query: { build: buildCode }
  })
}

// Load build from URL on mount
onMounted(() => {
  loadFromBrowser()
  loadBuildsFromStorage()

  const urlParams = new URLSearchParams(window.location.search)
  const buildCode = urlParams.get('build')
  if (buildCode) {
    importBuild(buildCode)
  }
})
</script>

<style scoped>
.mech-builder-page {
  min-height: 100vh;
  background: var(--mech-page-gradient);
  padding: var(--mech-space-5);
  font-family: var(--mech-font);
}

.flow-navigation {
  max-width: 1200px;
  margin: 0 auto var(--mech-space-4);
  display: flex;
  justify-content: flex-end;
  gap: var(--mech-space-2);
}

.flow-pill {
  border-radius: var(--mech-radius-pill);
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: var(--mech-tracking-wide);
}

.flow-pill.current {
  background: var(--mech-accent-soft);
  color: var(--mech-accent);
  border: 1px solid var(--mech-border-accent);
}

.flow-pill.action {
  border: 1px solid var(--mech-border-strong);
  background: var(--mech-surface);
  color: var(--mech-text);
  cursor: pointer;
  transition: all var(--mech-transition);
}

.flow-pill.action:hover:not(:disabled) {
  background: var(--mech-surface-raised);
  border-color: var(--mech-border-accent);
  transform: translateY(-1px);
}

.flow-pill.action:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 2px;
}

.flow-pill.action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.header {
  max-width: 1200px;
  margin: 0 auto var(--mech-space-5);
  padding: var(--mech-space-5);
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-lg);
  box-shadow: var(--mech-shadow-md);
}

.header h1 {
  margin: 0 0 var(--mech-space-4) 0;
  color: var(--mech-text);
  font-size: 32px;
  font-weight: 700;
  letter-spacing: var(--mech-tracking-wide);
}

.threat-indicator {
  display: flex;
  align-items: center;
  gap: var(--mech-space-3);
}

.threat-label {
  font-weight: 600;
  color: var(--mech-text-dim);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: var(--mech-tracking-wide);
}

.threat-bar-container {
  flex: 1;
  height: 20px;
  background: var(--mech-surface-2);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-pill);
  overflow: hidden;
}

.threat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mech-success-strong) 0%, var(--mech-warn-strong) 50%, var(--mech-danger-strong) 100%);
  transition: width 0.3s var(--mech-ease);
}

.threat-value {
  font-weight: 700;
  font-size: 18px;
  color: var(--mech-text);
  min-width: 40px;
  text-align: right;
}

.progress-steps {
  max-width: 1200px;
  margin: 0 auto var(--mech-space-5);
  display: flex;
  justify-content: space-between;
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-lg);
  padding: var(--mech-space-4);
  box-shadow: var(--mech-shadow-sm);
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mech-space-2);
  padding: var(--mech-space-3);
  border-radius: var(--mech-radius-sm);
  cursor: pointer;
  transition: all var(--mech-transition);
  position: relative;
}

.step:hover {
  background: var(--mech-surface-2);
}

.step.active {
  background: var(--mech-accent-soft);
}

.step.completed {
  background: rgba(16, 185, 129, 0.12);
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--mech-surface-raised);
  color: var(--mech-text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  transition: all var(--mech-transition);
}

.step.active .step-number {
  background: var(--mech-accent);
  color: var(--mech-text-on-accent);
  box-shadow: 0 0 12px var(--mech-accent-glow);
}

.step.completed .step-number {
  background: var(--mech-success-strong);
  color: #fff;
}

.step-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--mech-text-dim);
}

.step.active .step-label {
  color: var(--mech-accent);
}

.step-check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--mech-success);
}

.builder-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: var(--mech-space-4);
  align-items: start;
}

.preview-panel {
  position: sticky;
  top: var(--mech-space-4);
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-lg);
  box-shadow: var(--mech-shadow-md);
  overflow: hidden;
}

.preview-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--mech-space-3) var(--mech-space-4);
  border-bottom: 1px solid var(--mech-border);
  font-size: 13px;
  font-weight: 700;
  color: var(--mech-text-dim);
  text-transform: uppercase;
  letter-spacing: var(--mech-tracking-wide);
}

.preview-build-score {
  color: var(--mech-accent);
}

.preview-panel-canvas {
  height: 460px;
}

@media (max-width: 1024px) {
  .builder-layout {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    position: static;
    order: -1;
  }

  .preview-panel-canvas {
    height: 320px;
  }
}

.wizard-content {
  min-width: 0;
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-lg);
  box-shadow: var(--mech-shadow-md);
  overflow: hidden;
}

.wizard-navigation {
  display: flex;
  justify-content: space-between;
  gap: var(--mech-space-3);
  padding: var(--mech-space-5);
  border-top: 1px solid var(--mech-border);
}

.nav-btn {
  padding: 12px 24px;
  border: none;
  border-radius: var(--mech-radius-sm);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: var(--mech-tracking-wide);
  cursor: pointer;
  transition: all var(--mech-transition);
}

.nav-btn:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 3px;
}

.prev-btn {
  background: var(--mech-surface-raised);
  color: var(--mech-text);
  border: 1px solid var(--mech-border-strong);
}

.prev-btn:hover:not(:disabled) {
  border-color: var(--mech-border-accent);
}

.prev-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.load-btn {
  background: var(--mech-surface-raised);
  color: var(--mech-text);
  border: 1px solid var(--mech-border-strong);
}

.load-btn:hover {
  border-color: var(--mech-border-accent);
}

.reset-btn {
  background: rgba(239, 68, 68, 0.12);
  color: var(--mech-danger);
  border: 1px solid var(--mech-danger-glow);
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.22);
}

.random-btn {
  background: rgba(124, 58, 237, 0.16);
  color: var(--mech-purple);
  border: 1px solid var(--mech-purple);
}

.random-btn:hover {
  background: rgba(124, 58, 237, 0.28);
}

.next-btn {
  background: var(--mech-accent-grad);
  color: #fff;
  margin-left: auto;
}

.next-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--mech-accent-glow);
}

.next-btn:disabled {
  background: var(--mech-surface-raised);
  color: var(--mech-text-muted);
  cursor: not-allowed;
}

.share-btn {
  background: var(--mech-success-grad);
  color: #fff;
  margin-left: auto;
}

.share-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--mech-success-glow);
}

.share-btn:disabled {
  background: var(--mech-surface-raised);
  color: var(--mech-text-muted);
  cursor: not-allowed;
}

.battle-btn {
  background: var(--mech-danger-grad);
  color: #fff;
  font-size: 16px;
}

.battle-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 24px var(--mech-danger-glow);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--mech-overlay);
  backdrop-filter: var(--mech-blur);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  border: 1px solid var(--mech-border-strong);
  padding: var(--mech-space-6);
  border-radius: var(--mech-radius-lg);
  box-shadow: var(--mech-shadow-lg);
  max-width: 500px;
  width: 90%;
  animation: modal-rise var(--mech-transition);
}

@keyframes modal-rise {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-content h3 {
  margin: 0 0 var(--mech-space-3) 0;
  color: var(--mech-text);
  font-size: 24px;
  letter-spacing: var(--mech-tracking-wide);
}

.modal-content p {
  margin: 0 0 var(--mech-space-5) 0;
  color: var(--mech-text-dim);
  font-size: 16px;
}

.arm-choice-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--mech-space-3);
  margin-bottom: var(--mech-space-4);
}

.choice-btn {
  padding: var(--mech-space-4);
  background: var(--mech-surface-2);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-sm);
  cursor: pointer;
  transition: all var(--mech-transition);
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: var(--mech-text);
}

.choice-btn:hover {
  background: var(--mech-accent-soft);
  border-color: var(--mech-border-accent);
}

.current-weapon {
  display: block;
  font-size: 13px;
  font-weight: 400;
  color: var(--mech-text-dim);
  margin-top: 4px;
}

.empty-slot-text {
  display: block;
  font-size: 13px;
  font-weight: 400;
  color: var(--mech-text-muted);
  margin-top: 4px;
}

.cancel-btn {
  width: 100%;
  padding: var(--mech-space-3);
  background: var(--mech-surface-raised);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-sm);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--mech-text);
  transition: all var(--mech-transition);
}

.cancel-btn:hover {
  border-color: var(--mech-border-accent);
}

.share-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 16px 24px;
  background: var(--mech-success-grad);
  color: #fff;
  border-radius: var(--mech-radius-md);
  box-shadow: var(--mech-shadow-md);
  font-weight: 600;
  animation: slideUp 0.3s var(--mech-ease);
  z-index: 2000;
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

</style>
