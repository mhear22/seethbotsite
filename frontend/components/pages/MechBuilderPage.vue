<template>
  <div class="mech-builder-page">
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

    <!-- Main Content Area -->
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
          :disabled="!isComplete || warnings.length > 0"
          class="nav-btn battle-btn"
        >
          ⚔️ Battle!
        </button>
      </div>
    </div>

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
  activeSynergies,
  threatLevel,
  warnings,
  buildScore,
  isComplete,
  selectPart,
  removePart,
  resetBuild,
  randomizeBuild,
  exportBuild,
  importBuild,
  loadFromBrowser,
  loadBuildsFromStorage,
  ARM_PRESETS,
  CORE_PRESETS,
  LEGS_PRESETS,
  HEAD_PRESETS,
  RACK_PRESETS
} = builder

// Wizard state
const currentStep = ref(0)
const showArmModal = ref(false)
const pendingArm = ref<ArmPart | null>(null)
const showShareNotification = ref(false)

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
  const url = window.location.origin + '/mech-builder?build=' + code

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

function goToBattle() {
  if (!isComplete.value) return

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
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  padding: 20px;
}

.header {
  max-width: 1200px;
  margin: 0 auto 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 32px;
  font-weight: 700;
}

.threat-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.threat-label {
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}

.threat-bar-container {
  flex: 1;
  height: 20px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.threat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78 0%, #ed8936 50%, #e53e3e 100%);
  transition: width 0.3s;
}

.threat-value {
  font-weight: 700;
  font-size: 18px;
  color: #1e293b;
  min-width: 40px;
  text-align: right;
}

.progress-steps {
  max-width: 1200px;
  margin: 0 auto 24px;
  display: flex;
  justify-content: space-between;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.step:hover {
  background: #f1f5f9;
}

.step.active {
  background: #dbeafe;
}

.step.completed {
  background: #d1fae5;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #cbd5e0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.step.active .step-number {
  background: #3b82f6;
}

.step.completed .step-number {
  background: #10b981;
}

.step-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.step.active .step-label {
  color: #1e40af;
}

.step-check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #10b981;
}

.wizard-content {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.wizard-navigation {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.nav-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.prev-btn {
  background: #e2e8f0;
  color: #475569;
}

.prev-btn:hover:not(:disabled) {
  background: #cbd5e0;
}

.prev-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-btn {
  background: #fecaca;
  color: #991b1b;
}

.reset-btn:hover {
  background: #fca5a5;
}

.random-btn {
  background: #ddd6fe;
  color: #5b21b6;
}

.random-btn:hover {
  background: #c4b5fd;
}

.next-btn {
  background: #3b82f6;
  color: white;
  margin-left: auto;
}

.next-btn:hover:not(:disabled) {
  background: #2563eb;
}

.next-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.share-btn {
  background: #10b981;
  color: white;
  margin-left: auto;
}

.share-btn:hover:not(:disabled) {
  background: #059669;
}

.share-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.battle-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 16px;
}

.battle-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
}

.modal-content h3 {
  margin: 0 0 12px 0;
  color: #1e293b;
  font-size: 24px;
}

.modal-content p {
  margin: 0 0 24px 0;
  color: #64748b;
  font-size: 16px;
}

.arm-choice-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.choice-btn {
  padding: 16px;
  background: #f1f5f9;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.choice-btn:hover {
  background: #e2e8f0;
  border-color: #3b82f6;
}

.current-weapon {
  display: block;
  font-size: 13px;
  font-weight: 400;
  color: #64748b;
  margin-top: 4px;
}

.empty-slot-text {
  display: block;
  font-size: 13px;
  font-weight: 400;
  color: #94a3b8;
  margin-top: 4px;
}

.cancel-btn {
  width: 100%;
  padding: 12px;
  background: #e2e8f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

.share-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 16px 24px;
  background: #10b981;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  animation: slideUp 0.3s ease;
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

/* Dark mode */
.dark .header,
.dark .progress-steps,
.dark .wizard-content {
  background: #1e293b;
}

.dark .header h1 {
  color: #f1f5f9;
}

.dark .threat-label,
.dark .threat-value {
  color: #cbd5e0;
}

.dark .step:hover {
  background: #334155;
}

.dark .step.active {
  background: #1e40af;
}

.dark .step-label {
  color: #cbd5e0;
}

.dark .step.active .step-label {
  color: #dbeafe;
}

.dark .wizard-navigation {
  border-top-color: #334155;
}

.dark .modal-content {
  background: #1e293b;
}

.dark .modal-content h3 {
  color: #f1f5f9;
}

.dark .modal-content p {
  color: #cbd5e0;
}

.dark .choice-btn {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.dark .choice-btn:hover {
  background: #475569;
  border-color: #3b82f6;
}

.dark .current-weapon {
  color: #cbd5e0;
}

.dark .empty-slot-text {
  color: #94a3b8;
}

.dark .cancel-btn {
  background: #334155;
  color: #cbd5e0;
}

.dark .cancel-btn:hover {
  background: #475569;
}
</style>
