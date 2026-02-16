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
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.modal-header h2 {
  color: #fff;
  font-size: 1.8rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #fff;
}

.modal-tabs {
  display: flex;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab-btn:hover {
  color: #e5e7eb;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.modal-body {
  padding: 28px;
}

.setting-group {
  margin-bottom: 32px;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #e5e7eb;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.setting-value {
  color: #3b82f6;
  font-size: 1rem;
  font-weight: bold;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(59, 130, 246, 0.2);
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
  background: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  background: #60a5fa;
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.slider::-moz-range-thumb:hover {
  background: #60a5fa;
  transform: scale(1.1);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.85rem;
  color: #9ca3af;
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
  color: #e5e7eb;
  font-size: 1rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.difficulty-select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239ca3af' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.difficulty-select:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background-color: rgba(59, 130, 246, 0.15);
}

.difficulty-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.difficulty-select option {
  background: #1e293b;
  color: #fff;
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
  color: #9ca3af;
  font-size: 0.9rem;
  font-weight: 600;
}

.keybind-input {
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-size: 0.95rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.keybind-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.keybind-input::placeholder {
  color: #6b7280;
}

.settings-info {
  margin-top: 24px;
  padding: 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.settings-info p {
  color: #9ca3af;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
}

.reset-btn,
.confirm-btn {
  flex: 1;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.3);
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.confirm-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}
</style>
