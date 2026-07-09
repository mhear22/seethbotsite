<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="load-modal" role="dialog" aria-label="Load a build" @click.stop>
      <div class="load-modal-header">
        <h3>Load Build</h3>
        <button class="close-btn" aria-label="Close" @click="$emit('close')">✕</button>
      </div>

      <div class="load-modal-body">
        <section class="load-column">
          <h4>Presets</h4>
          <div class="build-list">
            <button
              v-for="preset in presets"
              :key="preset.id"
              class="build-item"
              :title="preset.description"
              @click="$emit('load-preset', preset.id)"
            >
              <img
                v-if="presetThumbnails[preset.id]"
                :src="presetThumbnails[preset.id]"
                class="build-thumb"
                alt=""
              />
              <MechIcons v-else :icon="preset.icon" :size="48" class="build-thumb-fallback" />
              <div class="build-info">
                <span class="build-name">{{ preset.name }}</span>
                <span class="build-detail">{{ preset.description }}</span>
              </div>
            </button>
          </div>
        </section>

        <section class="load-column">
          <h4>Saved</h4>
          <div class="save-row">
            <input
              v-model="newBuildName"
              class="build-name-input"
              type="text"
              placeholder="Name this build…"
              @keyup.enter="submitSave"
            />
            <button class="save-btn" @click="submitSave">Save</button>
          </div>

          <p v-if="savedBuilds.length === 0" class="no-builds">
            No saved builds yet. Save your current loadout to reuse it later.
          </p>
          <div v-else class="build-list">
            <div v-for="(build, idx) in savedBuilds" :key="build.timestamp" class="build-item saved">
              <img
                v-if="savedThumbnails[idx]"
                :src="savedThumbnails[idx]"
                class="build-thumb"
                alt=""
              />
              <div class="build-info">
                <span class="build-name">{{ build.name }}</span>
                <span class="build-detail">{{ new Date(build.timestamp).toLocaleDateString() }}</span>
              </div>
              <div class="build-actions">
                <button class="load-btn" @click="$emit('load-build', idx)">Load</button>
                <button class="delete-btn" @click="$emit('delete-build', idx)">Delete</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type {
  StarterPreset,
  SavedBuild,
  MechLoadout,
  ArmPart,
  CorePart,
  LegsPart,
  HeadPart,
  RackPart
} from '../../../composables/useMechBuilder'
import { findPartById } from '../../../shared/data/MechParts'
import { getMechThumbnail } from '../../../lib/battle/mechThumbnail'
import MechIcons from '../MechIcons.vue'

const props = defineProps<{
  presets: StarterPreset[]
  savedBuilds: SavedBuild[]
}>()

const emit = defineEmits<{
  close: []
  'load-preset': [presetId: string]
  'load-build': [index: number]
  'delete-build': [index: number]
  save: [name: string]
}>()

const newBuildName = ref('')

function submitSave() {
  emit('save', newBuildName.value.trim())
  newBuildName.value = ''
}

function presetToLoadout(preset: StarterPreset): MechLoadout {
  const ids = preset.parts
  return {
    leftArm: ids.leftArm ? (findPartById(ids.leftArm) as ArmPart) : null,
    rightArm: ids.rightArm ? (findPartById(ids.rightArm) as ArmPart) : null,
    core: ids.core ? (findPartById(ids.core) as CorePart) : null,
    legs: ids.legs ? (findPartById(ids.legs) as LegsPart) : null,
    head: ids.head ? (findPartById(ids.head) as HeadPart) : null,
    rack: ids.rack ? (findPartById(ids.rack) as RackPart) : null,
  }
}

const presetThumbnails = computed<Record<string, string>>(() => {
  const thumbs: Record<string, string> = {}
  for (const preset of props.presets) {
    const url = getMechThumbnail(presetToLoadout(preset))
    if (url) thumbs[preset.id] = url
  }
  return thumbs
})

const savedThumbnails = computed<Record<number, string>>(() => {
  const thumbs: Record<number, string> = {}
  props.savedBuilds.forEach((build, idx) => {
    const url = getMechThumbnail(build.loadout)
    if (url) thumbs[idx] = url
  })
  return thumbs
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--mech-overlay);
  backdrop-filter: var(--mech-blur);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--mech-space-4);
}

.load-modal {
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-lg);
  box-shadow: var(--mech-shadow-lg);
  width: 100%;
  max-width: 860px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.load-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--mech-space-4) var(--mech-space-5);
  border-bottom: 1px solid var(--mech-border);
}

.load-modal-header h3 {
  margin: 0;
  color: var(--mech-text);
  font-size: 20px;
  letter-spacing: var(--mech-tracking-wide);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mech-surface-2);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-sm);
  color: var(--mech-text);
  font-size: 14px;
  cursor: pointer;
  transition: border-color var(--mech-transition);
}

.close-btn:hover {
  border-color: var(--mech-border-accent);
}

.load-modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  overflow-y: auto;
}

.load-column {
  padding: var(--mech-space-4) var(--mech-space-5);
  min-width: 0;
}

.load-column + .load-column {
  border-left: 1px solid var(--mech-border);
}

.load-column h4 {
  margin: 0 0 var(--mech-space-3) 0;
  color: var(--mech-text-dim);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--mech-tracking-wide);
}

.build-list {
  display: flex;
  flex-direction: column;
  gap: var(--mech-space-2);
}

.build-item {
  display: flex;
  align-items: center;
  gap: var(--mech-space-3);
  padding: var(--mech-space-2) var(--mech-space-3);
  background: var(--mech-surface-2);
  border: 1px solid var(--mech-border);
  border-radius: var(--mech-radius-sm);
  text-align: left;
  color: var(--mech-text);
  transition: border-color var(--mech-transition), background var(--mech-transition);
}

button.build-item {
  cursor: pointer;
}

button.build-item:hover {
  border-color: var(--mech-border-accent);
  background: var(--mech-accent-soft);
}

button.build-item:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 2px;
}

.build-thumb {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: var(--mech-radius-sm);
  background: var(--mech-surface-raised);
  object-fit: contain;
}

.build-thumb-fallback {
  width: 64px;
  flex-shrink: 0;
}

.build-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.build-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--mech-text);
}

.build-detail {
  font-size: 12px;
  color: var(--mech-text-muted);
}

.build-actions {
  display: flex;
  flex-direction: column;
  gap: var(--mech-space-2);
}

.load-btn {
  padding: 6px 14px;
  border: none;
  border-radius: var(--mech-radius-sm);
  background: var(--mech-accent-grad);
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: box-shadow var(--mech-transition);
}

.load-btn:hover {
  box-shadow: 0 4px 12px var(--mech-accent-glow);
}

.delete-btn {
  padding: 6px 14px;
  border: 1px solid var(--mech-danger-glow);
  border-radius: var(--mech-radius-sm);
  background: rgba(239, 68, 68, 0.12);
  color: var(--mech-danger);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background var(--mech-transition);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.22);
}

.save-row {
  display: flex;
  gap: var(--mech-space-2);
  margin-bottom: var(--mech-space-3);
}

.build-name-input {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-sm);
  background: var(--mech-surface-2);
  color: var(--mech-text);
  font-size: 14px;
}

.build-name-input::placeholder {
  color: var(--mech-text-muted);
}

.build-name-input:focus {
  outline: none;
  border-color: var(--mech-accent);
  box-shadow: 0 0 0 3px var(--mech-accent-soft);
}

.save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--mech-radius-sm);
  background: var(--mech-success-grad);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: box-shadow var(--mech-transition);
}

.save-btn:hover {
  box-shadow: 0 4px 12px var(--mech-success-glow);
}

.no-builds {
  margin: 0;
  color: var(--mech-text-muted);
  font-size: 14px;
  padding: var(--mech-space-3) 0;
}

@media (max-width: 700px) {
  .load-modal-body {
    grid-template-columns: 1fr;
  }

  .load-column + .load-column {
    border-left: none;
    border-top: 1px solid var(--mech-border);
  }
}
</style>
