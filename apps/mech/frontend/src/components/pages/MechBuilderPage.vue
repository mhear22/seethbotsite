<template>
  <div class="mech-builder-page">
    <!-- Toolbar: navigation, step tabs, actions -->
    <div class="builder-toolbar" role="navigation" aria-label="Mech builder toolbar">
      <div class="toolbar-left">
        <button type="button" class="tb-btn" @click="goHome">← Menu</button>
        <span class="toolbar-title">Mech Builder</span>
      </div>

      <div class="toolbar-steps" aria-label="Builder steps">
        <button
          v-for="(step, index) in steps"
          :key="step.id"
          type="button"
          class="step-tab"
          :class="{
            active: currentStep === index,
            completed: isStepCompleted(index)
          }"
          :aria-current="currentStep === index ? 'step' : undefined"
          @click="goToStep(index)"
        >
          <span v-if="isStepCompleted(index)" class="step-tab-check">✓</span>{{ step.label }}
        </button>
        <span class="step-counter">{{ currentStep + 1 }}/6</span>
      </div>

      <div class="toolbar-actions">
        <button type="button" class="tb-btn" @click="showLoadModal = true">
          📂 Load
        </button>
        <button type="button" class="tb-btn tb-reset" @click="resetBuild">
          Reset
        </button>
        <button type="button" class="tb-btn tb-random" title="Random build" @click="randomizeBuild">
          🎲
        </button>
        <button
          v-if="currentStep < 5"
          type="button"
          class="tb-btn tb-next"
          :disabled="!canProceed"
          @click="nextStep"
        >
          Next →
        </button>
        <button
          v-if="currentStep === 5"
          type="button"
          class="tb-btn tb-share"
          :disabled="!canShare"
          @click="shareBuild"
        >
          Share
        </button>
        <button
          v-if="currentStep === 5"
          type="button"
          class="tb-btn tb-battle"
          :disabled="!canLaunchBattle"
          @click="goToBattle"
        >
          ⚔️ Battle
        </button>
      </div>
    </div>

    <!-- Main Content Area: wizard steps + dominant mech preview -->
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
  { id: 'rack', label: 'Equip', required: false },
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

/* Toolbar */
.builder-toolbar {
  max-width: 1400px;
  margin: 0 auto var(--mech-space-4);
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: var(--mech-space-4);
  padding: var(--mech-space-2) var(--mech-space-3);
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-lg);
  box-shadow: var(--mech-shadow-sm);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--mech-space-3);
  flex-shrink: 0;
}

.toolbar-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--mech-text);
  letter-spacing: var(--mech-tracking-wide);
  white-space: nowrap;
}

.toolbar-steps {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
}

.step-tab {
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: var(--mech-radius-sm);
  background: transparent;
  color: var(--mech-text-dim);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--mech-transition);
  white-space: nowrap;
}

.step-tab:hover {
  background: var(--mech-surface-2);
  color: var(--mech-text);
}

.step-tab:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 2px;
}

.step-tab.completed {
  color: var(--mech-success);
  background: rgba(16, 185, 129, 0.1);
}

.step-tab.active {
  background: var(--mech-accent-soft);
  color: var(--mech-accent);
  border-color: var(--mech-border-accent);
}

.step-tab-check {
  margin-right: 4px;
  font-size: 11px;
}

.step-counter {
  margin-left: var(--mech-space-2);
  font-size: 12px;
  font-weight: 600;
  color: var(--mech-text-muted);
  white-space: nowrap;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: var(--mech-space-2);
  flex-shrink: 0;
}

/* Toolbar buttons */
.tb-btn {
  padding: 8px 14px;
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-sm);
  background: var(--mech-surface-raised);
  color: var(--mech-text);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: var(--mech-tracking-wide);
  cursor: pointer;
  transition: all var(--mech-transition);
  white-space: nowrap;
}

.tb-btn:hover:not(:disabled) {
  border-color: var(--mech-border-accent);
}

.tb-btn:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 2px;
}

.tb-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.tb-reset {
  background: rgba(239, 68, 68, 0.12);
  color: var(--mech-danger);
  border-color: var(--mech-danger-glow);
}

.tb-reset:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.22);
  border-color: var(--mech-danger-glow);
}

.tb-random {
  background: rgba(124, 58, 237, 0.16);
  color: var(--mech-purple);
  border-color: var(--mech-purple);
}

.tb-random:hover:not(:disabled) {
  background: rgba(124, 58, 237, 0.28);
  border-color: var(--mech-purple);
}

.tb-next {
  background: var(--mech-accent-grad);
  color: #fff;
  border-color: transparent;
}

.tb-next:disabled {
  background: var(--mech-surface-raised);
  color: var(--mech-text-muted);
  border-color: var(--mech-border-strong);
}

.tb-share {
  background: var(--mech-success-grad);
  color: #fff;
  border-color: transparent;
}

.tb-share:disabled {
  background: var(--mech-surface-raised);
  color: var(--mech-text-muted);
  border-color: var(--mech-border-strong);
}

.tb-battle {
  background: var(--mech-danger-grad);
  color: #fff;
  border-color: transparent;
}

.tb-battle:disabled {
  background: var(--mech-surface-raised);
  color: var(--mech-text-muted);
  border-color: var(--mech-border-strong);
}

/* Layout: narrow wizard column, dominant preview */
.builder-layout {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(340px, 420px) minmax(0, 1fr);
  gap: var(--mech-space-4);
  align-items: start;
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

.preview-panel {
  min-width: 0;
  position: sticky;
  top: 68px;
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
  height: calc(100vh - 170px);
  min-height: 420px;
}

@media (max-width: 1024px) {
  .builder-toolbar {
    flex-wrap: wrap;
  }

  .toolbar-steps {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .builder-layout {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    position: static;
    order: -1;
  }

  .preview-panel-canvas {
    height: 320px;
    min-height: 0;
  }
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
