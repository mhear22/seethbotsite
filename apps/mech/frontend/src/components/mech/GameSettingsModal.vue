<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Game Settings</h2>
        <button @click="close" class="close-btn">&times;</button>
      </div>

      <div class="modal-tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'controls' }]"
          @click="activeTab = 'controls'"
        >Controls</button>
        <button
          :class="['tab-btn', { active: activeTab === 'graphics' }]"
          @click="activeTab = 'graphics'"
        >Graphics</button>
      </div>

      <div class="modal-body">
        <!-- ===== CONTROLS TAB ===== -->
        <template v-if="activeTab === 'controls'">

        <!-- AI Difficulty -->
        <div class="setting-group">
          <label class="setting-label">AI Difficulty</label>
          <select v-model="settings.aiDifficulty" class="difficulty-select">
            <option value="tutorial">Tutorial - Learn the basics</option>
            <option value="easy">Easy - For beginners</option>
            <option value="medium">Medium - Balanced challenge</option>
            <option value="hard">Hard - For experienced pilots</option>
            <option value="boss">Boss - Ultimate challenge</option>
          </select>
        </div>

        <!-- Mouse Sensitivity -->
        <div class="setting-group">
          <label class="setting-label">
            Mouse Sensitivity
            <span class="setting-value">{{ settings.mouseSensitivity.toFixed(1) }}x</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="10.0"
            step="0.5"
            v-model.number="settings.mouseSensitivity"
            class="slider"
          />
          <div class="slider-labels">
            <span>0.5x</span>
            <span>10x</span>
          </div>
        </div>

        <!-- Movement Speed -->
        <div class="setting-group">
          <label class="setting-label">
            Movement Speed
            <span class="setting-value">{{ settings.movementSpeed.toFixed(1) }}</span>
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="2.5"
            v-model.number="settings.movementSpeed"
            class="slider"
          />
          <div class="slider-labels">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        <!-- Mouse Invert Options -->
        <div class="setting-group">
          <label class="setting-label">Mouse Invert</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="settings.invertMouseX" />
              <span>Invert X-Axis (Horizontal)</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="settings.invertMouseY" />
              <span>Invert Y-Axis (Vertical)</span>
            </label>
          </div>
        </div>

        <!-- Key Bindings -->
        <div class="setting-group">
          <label class="setting-label">Key Bindings</label>
          <div class="keybind-grid">
            <div class="keybind-item">
              <span class="keybind-name">Forward</span>
              <input
                type="text"
                :value="getKeyDisplay(settings.keyBindings.forward)"
                @keydown="captureKey($event, 'forward')"
                readonly
                class="keybind-input"
                placeholder="Press key..."
              />
            </div>
            <div class="keybind-item">
              <span class="keybind-name">Backward</span>
              <input
                type="text"
                :value="getKeyDisplay(settings.keyBindings.backward)"
                @keydown="captureKey($event, 'backward')"
                readonly
                class="keybind-input"
                placeholder="Press key..."
              />
            </div>
            <div class="keybind-item">
              <span class="keybind-name">Left</span>
              <input
                type="text"
                :value="getKeyDisplay(settings.keyBindings.left)"
                @keydown="captureKey($event, 'left')"
                readonly
                class="keybind-input"
                placeholder="Press key..."
              />
            </div>
            <div class="keybind-item">
              <span class="keybind-name">Right</span>
              <input
                type="text"
                :value="getKeyDisplay(settings.keyBindings.right)"
                @keydown="captureKey($event, 'right')"
                readonly
                class="keybind-input"
                placeholder="Press key..."
              />
            </div>
            <div class="keybind-item">
              <span class="keybind-name">Jump</span>
              <input
                type="text"
                :value="getKeyDisplay(settings.keyBindings.jump)"
                @keydown="captureKey($event, 'jump')"
                readonly
                class="keybind-input"
                placeholder="Press key..."
              />
            </div>
            <div class="keybind-item">
              <span class="keybind-name">Dash</span>
              <input
                type="text"
                :value="getKeyDisplay(settings.keyBindings.dash)"
                @keydown="captureKey($event, 'dash')"
                readonly
                class="keybind-input"
                placeholder="Press key..."
              />
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="settings-info">
          <p>Adjust controls to your preference. Settings are saved automatically.</p>
        </div>

        </template>

        <!-- ===== GRAPHICS TAB ===== -->
        <template v-if="activeTab === 'graphics'">

        <!-- FPS Counter -->
        <div class="setting-group">
          <label class="setting-label">Performance</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="settings.graphics.showFPS" />
              <span>Show FPS Counter</span>
            </label>
          </div>
        </div>

        <!-- Shadow Quality -->
        <div class="setting-group">
          <label class="setting-label">Shadow Quality</label>
          <select v-model="settings.graphics.shadowQuality" class="difficulty-select">
            <option value="off">Off - Best performance</option>
            <option value="low">Low - 512px shadow map</option>
            <option value="medium">Medium - 1024px shadow map</option>
            <option value="high">High - 2048px shadow map</option>
          </select>
        </div>

        <!-- Render Scale -->
        <div class="setting-group">
          <label class="setting-label">
            Render Scale
            <span class="setting-value">{{ Math.round(settings.graphics.renderScale * 100) }}%</span>
          </label>
          <select v-model.number="settings.graphics.renderScale" class="difficulty-select">
            <option :value="0.5">50% - Best performance</option>
            <option :value="0.75">75% - Balanced</option>
            <option :value="1.0">100% - Native resolution</option>
          </select>
        </div>

        <!-- Antialiasing -->
        <div class="setting-group">
          <label class="setting-label">Antialiasing</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="settings.graphics.antialias" />
              <span>Enable Antialiasing (requires restart)</span>
            </label>
          </div>
        </div>

        <div class="settings-info">
          <p>Graphics settings apply when starting a new battle. Shadow quality and render scale affect performance significantly.</p>
        </div>

        </template>
      </div>

      <div class="modal-footer">
        <button @click="resetToDefaults" class="reset-btn">Reset to Defaults</button>
        <button @click="close" class="confirm-btn">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameSettings } from '../../composables/useGameSettings'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const gameSettings = useGameSettings()
const { settings, resetToDefaults } = gameSettings
const activeTab = ref<'controls' | 'graphics'>('controls')

function close() {
  emit('close')
}

// Convert key code to display name
function getKeyDisplay(keyCode: string): string {
  const keyMap: Record<string, string> = {
    'KeyW': 'W',
    'KeyA': 'A',
    'KeyS': 'S',
    'KeyD': 'D',
    'KeyE': 'E',
    'KeyQ': 'Q',
    'KeyR': 'R',
    'KeyF': 'F',
    'Space': 'Space',
    'ShiftLeft': 'Left Shift',
    'ShiftRight': 'Right Shift',
    'ControlLeft': 'Left Ctrl',
    'ControlRight': 'Right Ctrl',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
  }
  return keyMap[keyCode] || keyCode
}

// Capture key press for binding
function captureKey(event: KeyboardEvent, action: 'forward' | 'backward' | 'left' | 'right' | 'jump' | 'dash') {
  event.preventDefault()
  event.stopPropagation()

  // Don't allow binding Escape or Enter
  if (event.code === 'Escape' || event.code === 'Enter') {
    return
  }

  settings.value.keyBindings[action] = event.code
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--mech-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: var(--mech-blur);
  font-family: var(--mech-font);
}

.modal-content {
  background: var(--mech-surface);
  backdrop-filter: var(--mech-blur);
  border: 1px solid var(--mech-border-strong);
  border-radius: var(--mech-radius-lg);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--mech-shadow-lg);
  animation: modal-rise var(--mech-transition);
  /* Cap the panel to the viewport and let the body scroll inside it so tall
     content (keybind grid, sliders) never overflows the panel. */
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

@keyframes modal-rise {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--mech-space-5) var(--mech-space-6);
  border-bottom: 1px solid var(--mech-border);
  flex-shrink: 0;
}

.modal-header h2 {
  color: var(--mech-text);
  font-size: 1.8rem;
  margin: 0;
  letter-spacing: var(--mech-tracking-wide);
}

.close-btn {
  background: none;
  border: none;
  color: var(--mech-text-dim);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--mech-radius-sm);
  transition: all var(--mech-transition);
}

.close-btn:hover {
  color: var(--mech-text);
  background: var(--mech-surface-2);
}

.close-btn:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 2px;
}

.modal-tabs {
  display: flex;
  border-bottom: 1px solid var(--mech-border);
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: var(--mech-space-3) var(--mech-space-5);
  background: none;
  border: none;
  color: var(--mech-text-dim);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--mech-transition);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab-btn:hover {
  color: var(--mech-text);
}

.tab-btn.active {
  color: var(--mech-accent);
  border-bottom-color: var(--mech-accent);
}

.modal-body {
  padding: 28px;
  /* Scrollable region between the pinned header/tabs and footer. */
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.setting-group {
  margin-bottom: 32px;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--mech-text);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--mech-space-3);
}

.setting-value {
  color: var(--mech-accent);
  font-size: 1rem;
  font-weight: bold;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--mech-accent-soft);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--mech-accent);
  cursor: pointer;
  box-shadow: 0 0 10px var(--mech-accent-glow);
  transition: all var(--mech-transition);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--mech-accent);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px var(--mech-accent-glow);
  transition: all var(--mech-transition);
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.15);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--mech-space-2);
  font-size: 0.85rem;
  color: var(--mech-text-dim);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--mech-text);
  font-size: 1rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--mech-accent);
}

.difficulty-select {
  width: 100%;
  padding: 12px 16px;
  background: var(--mech-accent-soft);
  border: 1px solid var(--mech-border-accent);
  border-radius: var(--mech-radius-sm);
  color: var(--mech-text);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--mech-transition);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.difficulty-select:hover {
  border-color: var(--mech-accent);
}

.difficulty-select:focus {
  outline: none;
  border-color: var(--mech-accent);
  box-shadow: 0 0 0 3px var(--mech-accent-soft);
}

.difficulty-select option {
  background: var(--mech-bg-700);
  color: var(--mech-text);
  padding: 12px;
}

.keybind-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.keybind-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.keybind-name {
  color: var(--mech-text-dim);
  font-size: 0.9rem;
  font-weight: 600;
}

.keybind-input {
  background: var(--mech-accent-soft);
  border: 1px solid var(--mech-border-accent);
  border-radius: var(--mech-radius-sm);
  padding: 8px 12px;
  color: var(--mech-text);
  font-size: 0.95rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--mech-transition);
}

.keybind-input:focus {
  outline: none;
  border-color: var(--mech-accent);
  box-shadow: 0 0 0 3px var(--mech-accent-soft);
}

.keybind-input::placeholder {
  color: var(--mech-text-muted);
}

.settings-info {
  margin-top: var(--mech-space-5);
  padding: var(--mech-space-4);
  background: var(--mech-accent-soft);
  border-radius: var(--mech-radius-sm);
  border: 1px solid var(--mech-border);
}

.settings-info p {
  color: var(--mech-text-dim);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: var(--mech-space-3);
  padding: var(--mech-space-5) var(--mech-space-6);
  border-top: 1px solid var(--mech-border);
  flex-shrink: 0;
}

.reset-btn,
.confirm-btn {
  flex: 1;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: var(--mech-tracking-wide);
  border: none;
  border-radius: var(--mech-radius-md);
  cursor: pointer;
  transition: all var(--mech-transition);
}

.reset-btn:focus-visible,
.confirm-btn:focus-visible {
  outline: 2px solid var(--mech-accent);
  outline-offset: 3px;
}

.reset-btn {
  background: rgba(239, 68, 68, 0.12);
  color: var(--mech-danger);
  border: 1px solid var(--mech-danger-glow);
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--mech-danger-strong);
}

.confirm-btn {
  background: var(--mech-accent-grad);
  color: #fff;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px var(--mech-accent-glow);
}
</style>
