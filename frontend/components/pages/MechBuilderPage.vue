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
          available: index <= currentStep
        }"
        @click="index <= currentStep && goToStep(index)"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-label">{{ step.label }}</div>
        <MechIcons v-if="isStepCompleted(index)" icon="synergy-target" :size="16" class="step-check" />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="wizard-content">
      <!-- Step: Select Core -->
      <div v-if="currentStep === 0" class="step-content">
        <h2>
          <MechIcons icon="diesel-gen" :size="32" style="vertical-align: middle; margin-right: 8px" />
          Select Your Core
        </h2>
        <p class="step-description">The core is the heart of your mech, providing power and equipment slots.</p>

        <div class="parts-grid">
          <div
            v-for="core in CORE_PRESETS"
            :key="core.id"
            class="part-card"
            :class="{
              selected: loadout.core?.id === core.id,
              [`rarity-${core.rarity}`]: true
            }"
            @click="selectPart(core, 'core')"
          >
            <div class="part-header">
              <MechIcons :icon="core.icon" :size="48" />
              <div class="part-rarity">{{ core.rarity }}</div>
            </div>
            <div class="part-name">{{ core.name }}</div>
            <div class="part-manufacturer">{{ core.manufacturer }}</div>
            <div class="part-description">{{ core.description }}</div>
            <div class="part-stats">
              <div class="stat-row">
                <MechIcons icon="energy" :size="16" />
                <span>{{ core.powerOutput }} Power</span>
              </div>
              <div class="stat-row">
                <span>📦 {{ core.slots }} Slots</span>
              </div>
            </div>
            <div class="part-pros-cons">
              <div class="pros">
                <div v-for="pro in core.pros" :key="pro" class="pro-item">✓ {{ pro }}</div>
              </div>
              <div class="cons">
                <div v-for="con in core.cons" :key="con" class="con-item">✗ {{ con }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step: Select Legs -->
      <div v-if="currentStep === 1" class="step-content">
        <h2>
          <MechIcons icon="bipedal" :size="32" style="vertical-align: middle; margin-right: 8px" />
          Select Your Legs
        </h2>
        <p class="step-description">Legs determine mobility, stability, and terrain handling.</p>

        <div class="parts-grid">
          <div
            v-for="legs in LEGS_PRESETS"
            :key="legs.id"
            class="part-card"
            :class="{
              selected: loadout.legs?.id === legs.id,
              [`rarity-${legs.rarity}`]: true
            }"
            @click="selectPart(legs, 'legs')"
          >
            <div class="part-header">
              <MechIcons :icon="legs.icon" :size="48" />
              <div class="part-rarity">{{ legs.rarity }}</div>
            </div>
            <div class="part-name">{{ legs.name }}</div>
            <div class="part-manufacturer">{{ legs.manufacturer }}</div>
            <div class="part-description">{{ legs.description }}</div>
            <div class="part-stats">
              <div class="stat-row">
                <MechIcons icon="speed" :size="16" />
                <span>Speed {{ legs.stats.speed > 0 ? '+' : '' }}{{ legs.stats.speed }}</span>
              </div>
              <div class="stat-row">
                <MechIcons icon="armor" :size="16" />
                <span>Armor +{{ legs.stats.armor }}</span>
              </div>
            </div>
            <div class="part-pros-cons">
              <div class="pros">
                <div v-for="pro in legs.pros" :key="pro" class="pro-item">✓ {{ pro }}</div>
              </div>
              <div class="cons">
                <div v-for="con in legs.cons" :key="con" class="con-item">✗ {{ con }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step: Select Head -->
      <div v-if="currentStep === 2" class="step-content">
        <h2>
          <MechIcons icon="standard-optics" :size="32" style="vertical-align: middle; margin-right: 8px" />
          Select Your Head
        </h2>
        <p class="step-description">The head contains sensors and targeting systems for accuracy.</p>

        <div class="parts-grid">
          <div
            v-for="head in HEAD_PRESETS"
            :key="head.id"
            class="part-card"
            :class="{
              selected: loadout.head?.id === head.id,
              [`rarity-${head.rarity}`]: true
            }"
            @click="selectPart(head, 'head')"
          >
            <div class="part-header">
              <MechIcons :icon="head.icon" :size="48" />
              <div class="part-rarity">{{ head.rarity }}</div>
            </div>
            <div class="part-name">{{ head.name }}</div>
            <div class="part-manufacturer">{{ head.manufacturer }}</div>
            <div class="part-description">{{ head.description }}</div>
            <div class="part-stats">
              <div class="stat-row">
                <MechIcons icon="accuracy" :size="16" />
                <span>+{{ head.targetingBonus }} Targeting</span>
              </div>
              <div class="stat-row">
                <span>📡 {{ head.sensorRange }}m Range</span>
              </div>
            </div>
            <div class="part-pros-cons">
              <div class="pros">
                <div v-for="pro in head.pros" :key="pro" class="pro-item">✓ {{ pro }}</div>
              </div>
              <div class="cons">
                <div v-for="con in head.cons" :key="con" class="con-item">✗ {{ con }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step: Select Arms -->
      <div v-if="currentStep === 3" class="step-content">
        <h2>
          <MechIcons icon="autocannon" :size="32" style="vertical-align: middle; margin-right: 8px" />
          Select Your Weapons
        </h2>
        <p class="step-description">Choose weapons for left and right arms. Mix and match for asymmetric loadouts.</p>

        <div class="arm-selection-container">
          <div class="arm-slot">
            <h3>Left Arm</h3>
            <div v-if="loadout.leftArm" class="selected-arm">
              <MechIcons :icon="loadout.leftArm.icon" :size="32" />
              <div>{{ loadout.leftArm.name }}</div>
              <button @click.stop="removePart('leftArm')" class="remove-btn">Remove</button>
            </div>
            <div v-else class="empty-slot">Click a weapon below</div>
          </div>

          <div class="arm-slot">
            <h3>Right Arm</h3>
            <div v-if="loadout.rightArm" class="selected-arm">
              <MechIcons :icon="loadout.rightArm.icon" :size="32" />
              <div>{{ loadout.rightArm.name }}</div>
              <button @click.stop="removePart('rightArm')" class="remove-btn">Remove</button>
            </div>
            <div v-else class="empty-slot">Click a weapon below</div>
          </div>
        </div>

        <div class="parts-grid">
          <div
            v-for="arm in ARM_PRESETS"
            :key="arm.id"
            class="part-card"
            :class="{
              selected: loadout.leftArm?.id === arm.id || loadout.rightArm?.id === arm.id,
              [`rarity-${arm.rarity}`]: true,
              'in-synergy': isPartInSynergy(arm.id)
            }"
            @click="selectArmSlot(arm)"
          >
            <div class="part-header">
              <MechIcons :icon="arm.icon" :size="48" />
              <div class="part-rarity">{{ arm.rarity }}</div>
            </div>
            <div class="part-name">{{ arm.name }}</div>
            <div class="part-manufacturer">{{ arm.manufacturer }}</div>
            <div class="part-description">{{ arm.description }}</div>
            <div class="part-stats">
              <div class="stat-row">
                <MechIcons icon="firepower" :size="16" />
                <span>{{ arm.stats.firepower }} Firepower</span>
              </div>
              <div class="stat-row">
                <MechIcons icon="accuracy" :size="16" />
                <span>{{ arm.stats.accuracy }} Accuracy</span>
              </div>
            </div>
            <div class="part-pros-cons">
              <div class="pros">
                <div v-for="pro in arm.pros" :key="pro" class="pro-item">✓ {{ pro }}</div>
              </div>
              <div class="cons">
                <div v-for="con in arm.cons" :key="con" class="con-item">✗ {{ con }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step: Select Rack (Optional) -->
      <div v-if="currentStep === 4" class="step-content">
        <h2>
          <MechIcons icon="smoke-launcher" :size="32" style="vertical-align: middle; margin-right: 8px" />
          Select Equipment Rack (Optional)
        </h2>
        <p class="step-description">Add special equipment for tactical advantages.</p>

        <div class="parts-grid">
          <div
            class="part-card skip-card"
            :class="{ selected: !loadout.rack }"
            @click="removePart('rack')"
          >
            <div class="part-header">
              <div class="skip-icon">✕</div>
            </div>
            <div class="part-name">No Equipment</div>
            <div class="part-description">Skip this slot and proceed with no rack equipment.</div>
          </div>

          <div
            v-for="rack in RACK_PRESETS"
            :key="rack.id"
            class="part-card"
            :class="{
              selected: loadout.rack?.id === rack.id,
              [`rarity-${rack.rarity}`]: true
            }"
            @click="selectPart(rack, 'rack')"
          >
            <div class="part-header">
              <MechIcons :icon="rack.icon" :size="48" />
              <div class="part-rarity">{{ rack.rarity }}</div>
            </div>
            <div class="part-name">{{ rack.name }}</div>
            <div class="part-manufacturer">{{ rack.manufacturer }}</div>
            <div class="part-description">{{ rack.description }}</div>
            <div class="special-ability">
              <strong>Ability:</strong> {{ rack.specialAbility }}
            </div>
            <div class="part-pros-cons">
              <div class="pros">
                <div v-for="pro in rack.pros" :key="pro" class="pro-item">✓ {{ pro }}</div>
              </div>
              <div class="cons">
                <div v-for="con in rack.cons" :key="con" class="con-item">✗ {{ con }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step: Review Build -->
      <div v-if="currentStep === 5" class="step-content review-step">
        <h2>
          <MechIcons icon="synergy-target" :size="32" style="vertical-align: middle; margin-right: 8px" />
          Review Your Build
        </h2>

        <div class="review-layout">
          <div class="mech-visual">
            <div class="mech-diagram">
              <div class="mech-part mech-head">
                <MechIcons :icon="loadout.head?.icon || 'unknown'" :size="64" />
                <span class="part-label">{{ loadout.head?.name || 'No Head' }}</span>
              </div>
              <div class="mech-part mech-core">
                <MechIcons :icon="loadout.core?.icon || 'unknown'" :size="80" />
                <span class="part-label">{{ loadout.core?.name || 'No Core' }}</span>
              </div>
              <div class="mech-arms-row">
                <div class="mech-part mech-arm">
                  <MechIcons :icon="loadout.leftArm?.icon || 'unknown'" :size="64" />
                  <span class="part-label">{{ loadout.leftArm?.name || 'Empty' }}</span>
                </div>
                <div class="mech-part mech-arm">
                  <MechIcons :icon="loadout.rightArm?.icon || 'unknown'" :size="64" />
                  <span class="part-label">{{ loadout.rightArm?.name || 'Empty' }}</span>
                </div>
              </div>
              <div class="mech-part mech-legs">
                <MechIcons :icon="loadout.legs?.icon || 'unknown'" :size="64" />
                <span class="part-label">{{ loadout.legs?.name || 'No Legs' }}</span>
              </div>
              <div v-if="loadout.rack" class="mech-part mech-rack">
                <MechIcons :icon="loadout.rack.icon" :size="48" />
                <span class="part-label">{{ loadout.rack.name }}</span>
              </div>
            </div>
          </div>

          <div class="stats-summary">
            <h3>Total Stats</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <MechIcons icon="health" :size="24" />
                <span class="stat-label">Health</span>
                <span class="stat-value">{{ totalStats.health }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="armor" :size="24" />
                <span class="stat-label">Armor</span>
                <span class="stat-value">{{ totalStats.armor }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="speed" :size="24" />
                <span class="stat-label">Speed</span>
                <span class="stat-value">{{ totalStats.speed }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="energy" :size="24" />
                <span class="stat-label">Energy</span>
                <span class="stat-value" :class="{ negative: totalStats.energy < 0 }">{{ totalStats.energy }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="firepower" :size="24" />
                <span class="stat-label">Firepower</span>
                <span class="stat-value">{{ totalStats.firepower }}</span>
              </div>
              <div class="stat-item">
                <MechIcons icon="accuracy" :size="24" />
                <span class="stat-label">Accuracy</span>
                <span class="stat-value">{{ totalStats.accuracy }}</span>
              </div>
            </div>

            <div class="build-score">
              <span class="score-label">Build Score</span>
              <span class="score-value">{{ buildScore }}</span>
            </div>
          </div>

          <div class="synergies-section">
            <h3>
              <MechIcons icon="synergy-bolt" :size="24" style="vertical-align: middle; margin-right: 8px" />
              Active Synergies
            </h3>
            <div v-if="activeSynergies.length === 0" class="no-synergies">
              No synergies active
            </div>
            <div v-else class="synergy-list">
              <div v-for="synergy in activeSynergies" :key="synergy.id" class="synergy-card">
                <MechIcons :icon="synergy.icon" :size="32" />
                <div class="synergy-info">
                  <div class="synergy-name">{{ synergy.name }}</div>
                  <div class="synergy-description">{{ synergy.description }}</div>
                  <div v-if="synergy.specialEffect" class="synergy-effect">{{ synergy.specialEffect }}</div>
                  <div class="synergy-bonuses">
                    <span v-if="synergy.statBonus.health">Health +{{ synergy.statBonus.health }}</span>
                    <span v-if="synergy.statBonus.armor">Armor +{{ synergy.statBonus.armor }}</span>
                    <span v-if="synergy.statBonus.speed">Speed +{{ synergy.statBonus.speed }}</span>
                    <span v-if="synergy.statBonus.energy">Energy +{{ synergy.statBonus.energy }}</span>
                    <span v-if="synergy.statBonus.firepower">Firepower +{{ synergy.statBonus.firepower }}</span>
                    <span v-if="synergy.statBonus.accuracy">Accuracy +{{ synergy.statBonus.accuracy }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="warnings.length > 0" class="warnings-section">
            <h3>⚠️ Warnings</h3>
            <div class="warning-item" v-for="(warning, idx) in warnings" :key="idx">
              {{ warning }}
            </div>
          </div>
        </div>
      </div>

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
          @click="startSortie"
          :disabled="!canShare"
          class="nav-btn sortie-btn"
        >
          ⚔️ Sortie
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
import { useMechBuilder, type ArmPart, type MechPart } from '../../composables/useMechBuilder'
import MechIcons from '../mech/MechIcons.vue'

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
  return true // Arms and rack are optional
})

const canShare = computed(() => isComplete.value && warnings.value.length === 0)

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
  })
}

function startSortie() {
  if (!canShare.value) return

  // Navigate to battle page with current loadout
  const buildCode = exportBuild()
  router.push({
    name: 'mech-battle',
    query: { build: buildCode }
  })
}

onMounted(() => {
  loadFromBrowser()
  loadBuildsFromStorage()

  // Check for shared build in URL
  const params = new URLSearchParams(window.location.search)
  const buildCode = params.get('build')
  if (buildCode) {
    importBuild(buildCode)
    currentStep.value = 5 // Jump to review
  }
})
</script>

<style scoped>
.mech-builder-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #0a0e1a, #1a1f2e);
  color: #e0e0e0;
  padding: 1.5rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.threat-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.threat-label {
  font-weight: bold;
  min-width: 100px;
}

.threat-bar-container {
  flex: 1;
  height: 24px;
  background: rgba(100, 100, 120, 0.3);
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.threat-bar-fill {
  height: 100%;
  background: linear-gradient(to right, #10b981, #f59e0b, #ef4444);
  transition: width 0.5s ease;
}

.threat-value {
  font-size: 1.5rem;
  font-weight: bold;
  min-width: 50px;
  text-align: right;
}

.progress-steps {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: rgba(30, 30, 50, 0.5);
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.4;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.step.available {
  opacity: 0.7;
  cursor: pointer;
}

.step.available:hover {
  opacity: 1;
  background: rgba(40, 40, 60, 0.7);
}

.step.active {
  opacity: 1;
  background: rgba(96, 165, 250, 0.2);
  border-color: #60a5fa;
  transform: scale(1.05);
}

.step.completed {
  opacity: 1;
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.step.active .step-number {
  background: #60a5fa;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 0.85rem;
  text-align: center;
}

.step-check {
  position: absolute;
  top: 4px;
  right: 4px;
  color: #10b981;
}

.wizard-content {
  max-width: 1400px;
  margin: 0 auto;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-content h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #60a5fa;
}

.step-description {
  text-align: center;
  font-size: 1.1rem;
  color: #9ca3af;
  margin-bottom: 2rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.parts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.part-card {
  background: linear-gradient(135deg, rgba(30, 30, 50, 0.9), rgba(20, 20, 40, 0.9));
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.part-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: currentColor;
  opacity: 0.5;
}

.part-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
}

.part-card.selected {
  border-color: #60a5fa;
  box-shadow: 0 0 24px rgba(96, 165, 250, 0.4);
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(30, 30, 50, 0.9));
}

.part-card.in-synergy {
  animation: synergy-pulse 2s infinite;
}

@keyframes synergy-pulse {
  0%, 100% {
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
  }
  50% {
    box-shadow: 0 0 24px rgba(245, 158, 11, 0.6);
  }
}

.part-card.rarity-common {
  color: #9ca3af;
}

.part-card.rarity-uncommon {
  color: #10b981;
}

.part-card.rarity-rare {
  color: #60a5fa;
}

.part-card.rarity-legendary {
  color: #f59e0b;
}

.part-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.part-rarity {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.part-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: white;
}

.part-manufacturer {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
}

.part-description {
  font-size: 0.9rem;
  color: #d1d5db;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.part-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #d1d5db;
}

.part-pros-cons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.pros, .cons {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.pro-item {
  color: #10b981;
}

.con-item {
  color: #ef4444;
}

.skip-card {
  background: rgba(50, 50, 70, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.skip-icon {
  font-size: 4rem;
  color: #6b7280;
}

.special-ability {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid #f59e0b;
  border-radius: 4px;
  font-size: 0.9rem;
}

.arm-selection-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.arm-slot {
  text-align: center;
}

.arm-slot h3 {
  margin-bottom: 1rem;
  color: #60a5fa;
}

.selected-arm {
  padding: 2rem;
  background: rgba(96, 165, 250, 0.2);
  border: 2px solid #60a5fa;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-slot {
  padding: 3rem;
  background: rgba(30, 30, 50, 0.5);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #6b7280;
  font-style: italic;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #dc2626;
}

.review-step {
  max-width: none;
}

.review-layout {
  display: grid;
  gap: 2rem;
}

.mech-visual {
  background: linear-gradient(135deg, rgba(30, 30, 50, 0.9), rgba(20, 20, 40, 0.9));
  border: 2px solid rgba(96, 165, 250, 0.3);
  border-radius: 16px;
  padding: 2rem;
}

.mech-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.mech-part {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(50, 50, 70, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  min-width: 150px;
}

.mech-arms-row {
  display: flex;
  gap: 2rem;
}

.part-label {
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
}

.stats-summary {
  background: linear-gradient(135deg, rgba(30, 30, 50, 0.9), rgba(20, 20, 40, 0.9));
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  padding: 2rem;
}

.stats-summary h3 {
  margin: 0 0 1.5rem 0;
  color: #10b981;
  text-align: center;
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: #9ca3af;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #10b981;
}

.stat-value.negative {
  color: #ef4444;
}

.build-score {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05));
  border: 2px solid #f59e0b;
  border-radius: 12px;
}

.score-label {
  display: block;
  font-size: 1rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.score-value {
  font-size: 3rem;
  font-weight: bold;
  color: #f59e0b;
}

.synergies-section {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(30, 30, 50, 0.9));
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-radius: 16px;
  padding: 2rem;
}

.synergies-section h3 {
  margin: 0 0 1.5rem 0;
  color: #f59e0b;
  text-align: center;
  font-size: 1.5rem;
}

.no-synergies {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 2rem;
}

.synergy-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.synergy-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(245, 158, 11, 0.5);
  border-radius: 12px;
  animation: synergy-appear 0.5s ease;
}

@keyframes synergy-appear {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.synergy-info {
  flex: 1;
}

.synergy-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #f59e0b;
  margin-bottom: 0.5rem;
}

.synergy-description {
  font-size: 0.95rem;
  color: #d1d5db;
  margin-bottom: 0.5rem;
}

.synergy-effect {
  font-size: 0.85rem;
  color: #9ca3af;
  font-style: italic;
  margin-bottom: 0.75rem;
}

.synergy-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: bold;
  color: #10b981;
}

.warnings-section {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #ef4444;
  border-radius: 16px;
  padding: 2rem;
}

.warnings-section h3 {
  margin: 0 0 1rem 0;
  color: #ef4444;
  text-align: center;
}

.warning-item {
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  color: #fca5a5;
  margin-bottom: 0.5rem;
}

.wizard-navigation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.nav-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.prev-btn {
  background: #6b7280;
  color: white;
}

.prev-btn:hover:not(:disabled) {
  background: #4b5563;
}

.next-btn {
  background: #60a5fa;
  color: white;
}

.next-btn:hover:not(:disabled) {
  background: #3b82f6;
}

.reset-btn {
  background: #ef4444;
  color: white;
}

.reset-btn:hover {
  background: #dc2626;
}

.random-btn {
  background: #8b5cf6;
  color: white;
}

.random-btn:hover {
  background: #7c3aed;
}

.share-btn {
  background: #10b981;
  color: white;
}

.share-btn:hover:not(:disabled) {
  background: #059669;
}

.sortie-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
}

.sortie-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706, #b45309);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
  transform: translateY(-2px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: linear-gradient(135deg, #1e1e32, #0f0f1e);
  border: 3px solid #60a5fa;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #60a5fa;
  text-align: center;
  font-size: 1.5rem;
}

.modal-content p {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #d1d5db;
}

.arm-choice-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.choice-btn {
  padding: 1rem;
  background: #60a5fa;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.2s ease;
  text-align: left;
}

.choice-btn:hover {
  background: #3b82f6;
  transform: translateX(4px);
}

.current-weapon {
  display: block;
  font-size: 0.85rem;
  font-weight: normal;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.empty-slot-text {
  display: block;
  font-size: 0.85rem;
  font-weight: normal;
  opacity: 0.6;
  margin-top: 0.25rem;
}

.cancel-btn {
  width: 100%;
  padding: 0.75rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #4b5563;
}

.share-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  animation: slideIn 0.3s ease;
  z-index: 1000;
  font-weight: bold;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .parts-grid {
    grid-template-columns: 1fr;
  }

  .arm-selection-container {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .mech-arms-row {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
