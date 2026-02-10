<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Font size options
const fontSizes = [
  { value: 'small', label: 'Small', description: '14px text size' },
  { value: 'medium', label: 'Medium', description: '16px text size (default)' },
  { value: 'large', label: 'Large', description: '18px text size' },
  { value: 'extraLarge', label: 'Extra Large', description: '20px text size' }
]

// Accessibility settings state
const fontSize = ref<'small' | 'medium' | 'large' | 'extraLarge'>('medium')
const highContrastMode = ref(false)
const reduceMotion = ref(false)
const screenReaderAnnouncements = ref(true)
const focusIndicators = ref(true)

// Troll state
const showTroll = ref(false)

// Load saved settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('accessibility-settings')
    if (saved) {
      const settings = JSON.parse(saved)
      fontSize.value = settings.fontSize || 'medium'
      highContrastMode.value = settings.highContrastMode || false
      reduceMotion.value = settings.reduceMotion || false
      screenReaderAnnouncements.value = settings.screenReaderAnnouncements !== false
      focusIndicators.value = settings.focusIndicators !== false
    }

    // Check for system preference for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reduceMotion.value = true
    }
  } catch (e) {
    console.warn('Failed to load accessibility settings:', e)
  }
}

// Save settings to localStorage
const saveSettings = () => {
  try {
    const settings = {
      fontSize: fontSize.value,
      highContrastMode: highContrastMode.value,
      reduceMotion: reduceMotion.value,
      screenReaderAnnouncements: screenReaderAnnouncements.value,
      focusIndicators: focusIndicators.value
    }
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
    applySettings()
  } catch (e) {
    console.warn('Failed to save accessibility settings:', e)
  }
}

// Apply settings to the DOM
const applySettings = () => {
  // Font size
  const fontSizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px',
    extraLarge: '20px'
  }
  document.documentElement.style.fontSize = fontSizeMap[fontSize.value]

  // High contrast mode
  if (highContrastMode.value) {
    document.body.classList.add('high-contrast')
  } else {
    document.body.classList.remove('high-contrast')
  }

  // Reduce motion
  if (reduceMotion.value) {
    document.documentElement.style.setProperty('--animation-duration', '0s')
    document.body.classList.add('reduce-motion')
  } else {
    document.documentElement.style.removeProperty('--animation-duration')
    document.body.classList.remove('reduce-motion')
  }

  // Focus indicators
  if (focusIndicators.value) {
    document.body.classList.remove('no-focus-indicators')
  } else {
    document.body.classList.add('no-focus-indicators')
  }
}

// Watch for changes and save
watch([fontSize, highContrastMode, reduceMotion, screenReaderAnnouncements, focusIndicators], () => {
  saveSettings()
}, { deep: true })

// Initialize settings
onMounted(() => {
  loadSettings()
  applySettings()
})

// Announce changes to screen readers
const announceChange = (message: string) => {
  if (!screenReaderAnnouncements.value) return

  // Create or update live region
  let liveRegion = document.getElementById('a11y-announcer')
  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = 'a11y-announcer'
    liveRegion.setAttribute('role', 'status')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    document.body.appendChild(liveRegion)
  }

  liveRegion.textContent = message
}
</script>

<template>
  <div class="accessibility-settings" role="group" aria-labelledby="a11y-heading">
    <h2 id="a11y-heading" class="settings-heading">Accessibility Settings</h2>

    <p class="settings-description">
      Customize your experience to make the app easier to use.
    </p>

    <!-- Font Size -->
    <section class="setting-group">
      <h3 class="setting-label" for="font-size-select">Font Size</h3>
      <div class="font-size-options" role="radiogroup" aria-labelledby="font-size-label">
        <span id="font-size-label" class="sr-only">Select font size</span>
        <button
          v-for="size in fontSizes"
          :key="size.value"
          class="font-size-btn"
          :class="{ active: fontSize === size.value }"
          :aria-pressed="fontSize === size.value"
          :aria-label="`${size.label} font size, ${size.description}`"
          @click="fontSize = size.value as any; announceChange(`Font size changed to ${size.label}`)"
        >
          <span class="size-preview" :class="size.value">A</span>
          <span class="size-label">{{ size.label }}</span>
        </button>
      </div>
    </section>

    <!-- High Contrast Mode -->
    <section class="setting-group">
      <label class="setting-toggle" for="high-contrast-toggle">
        <div class="toggle-content">
          <h3 class="setting-label">High Contrast Mode</h3>
          <p class="setting-description">
            Increase color contrast for better visibility
          </p>
        </div>
        <button
          id="high-contrast-toggle"
          class="toggle-switch"
          :aria-pressed="highContrastMode"
          @click="highContrastMode = !highContrastMode; announceChange(`High contrast mode ${highContrastMode ? 'enabled' : 'disabled'}`)"
          role="switch"
        >
          <span class="toggle-slider" :class="{ on: highContrastMode }">
            <span class="toggle-thumb" aria-hidden="true"></span>
          </span>
        </button>
      </label>
    </section>

    <!-- Reduce Motion -->
    <section class="setting-group">
      <label class="setting-toggle" for="reduce-motion-toggle">
        <div class="toggle-content">
          <h3 class="setting-label">Reduce Motion</h3>
          <p class="setting-description">
            Minimize animations and transitions
          </p>
        </div>
        <button
          id="reduce-motion-toggle"
          class="toggle-switch"
          :aria-pressed="reduceMotion"
          @click="reduceMotion = !reduceMotion; announceChange(`Reduce motion ${reduceMotion ? 'enabled' : 'disabled'}`)"
          role="switch"
        >
          <span class="toggle-slider" :class="{ on: reduceMotion }">
            <span class="toggle-thumb" aria-hidden="true"></span>
          </span>
        </button>
      </label>
    </section>

    <!-- Focus Indicators -->
    <section class="setting-group">
      <label class="setting-toggle" for="focus-toggle">
        <div class="toggle-content">
          <h3 class="setting-label">Focus Indicators</h3>
          <p class="setting-description">
            Show visible outline when navigating with keyboard
          </p>
        </div>
        <button
          id="focus-toggle"
          class="toggle-switch"
          :aria-pressed="focusIndicators"
          @click="focusIndicators = !focusIndicators; announceChange(`Focus indicators ${focusIndicators ? 'enabled' : 'disabled'}`)"
          role="switch"
        >
          <span class="toggle-slider" :class="{ on: focusIndicators }">
            <span class="toggle-thumb" aria-hidden="true"></span>
          </span>
        </button>
      </label>
    </section>

    <!-- Screen Reader Announcements -->
    <section class="setting-group">
      <label class="setting-toggle" for="announcements-toggle">
        <div class="toggle-content">
          <h3 class="setting-label">Screen Reader Announcements</h3>
          <p class="setting-description">
            Announce important changes via screen reader
          </p>
        </div>
        <button
          id="announcements-toggle"
          class="toggle-switch"
          :aria-pressed="screenReaderAnnouncements"
          @click="screenReaderAnnouncements = !screenReaderAnnouncements; announceChange(`Announcements ${screenReaderAnnouncements ? 'enabled' : 'disabled'}`)"
          role="switch"
        >
          <span class="toggle-slider" :class="{ on: screenReaderAnnouncements }">
            <span class="toggle-thumb" aria-hidden="true"></span>
          </span>
        </button>
      </label>
    </section>

    <!-- Reset Button -->
    <section class="setting-group">
      <button
        class="reset-btn"
        @click="showTroll = true"
        aria-label="Reset all accessibility settings to default values"
      >
        Reset to Defaults
      </button>
    </section>

    <!-- Troll Overlay -->
    <Transition name="troll">
      <div v-if="showTroll" class="troll-overlay" @click="showTroll = false">
        <div class="troll-message" @click.stop>
          <h1 class="troll-text">FUCK YOU</h1>
          <button class="troll-dismiss" @click="showTroll = false">Nice try 😈</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.accessibility-settings {
  padding: 24px;
  max-width: 600px;
}

.settings-heading {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #2d3748;
}

.settings-description {
  color: #718096;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.setting-group {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.setting-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.setting-label {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #2d3748;
}

.setting-description {
  font-size: 14px;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

/* Font Size Options */
.font-size-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.font-size-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.font-size-btn:hover {
  border-color: #ff6b9d;
  background: #fff5f7;
}

.font-size-btn.active {
  border-color: #ff6b9d;
  background: #fff5f7;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.2);
}

.font-size-btn:focus-visible {
  outline: 3px solid #ff6b9d;
  outline-offset: 2px;
}

.size-preview {
  font-weight: 700;
  color: #2d3748;
}

.size-preview.small {
  font-size: 14px;
}

.size-preview.medium {
  font-size: 16px;
}

.size-preview.large {
  font-size: 18px;
}

.size-preview.extraLarge {
  font-size: 20px;
}

.size-label {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
}

/* Toggle Switches */
.setting-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  margin-top: 12px;
}

.toggle-content {
  flex: 1;
}

.toggle-switch {
  width: 52px;
  height: 28px;
  background: #cbd5e0;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
  transition: background 0.2s ease;
}

.toggle-switch:focus-visible {
  outline: 3px solid #ff6b9d;
  outline-offset: 2px;
}

.toggle-slider.on {
  background: #ff6b9d;
}

.toggle-thumb {
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-slider.on .toggle-thumb {
  transform: translateX(24px);
}

/* Reset Button */
.reset-btn {
  padding: 12px 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  width: 100%;
}

.reset-btn:hover {
  border-color: #ff6b9d;
  color: #ff6b9d;
  background: #fff5f7;
}

.reset-btn:focus-visible {
  outline: 3px solid #ff6b9d;
  outline-offset: 2px;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Dark Mode */
.dark .settings-heading {
  color: #e2e8f0;
}

.dark .settings-description {
  color: #a0aec0;
}

.dark .setting-label {
  color: #e2e8f0;
}

.dark .setting-description {
  color: #a0aec0;
}

.dark .setting-group {
  border-bottom-color: #4a5568;
}

.dark .font-size-btn {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark .font-size-btn:hover {
  border-color: #ff6b9d;
  background: #4a5568;
}

.dark .font-size-btn.active {
  border-color: #ff6b9d;
  background: #4a5568;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.2);
}

.dark .size-preview {
  color: #e2e8f0;
}

.dark .size-label {
  color: #a0aec0;
}

.dark .toggle-switch {
  background: #4a5568;
}

.dark .toggle-switch:focus-visible {
  outline-color: #ff8a80;
}

.dark .toggle-slider.on {
  background: #ff8a80;
}

.dark .reset-btn {
  background: #2d3748;
  border-color: #4a5568;
  color: #a0aec0;
}

.dark .reset-btn:hover {
  border-color: #ff8a80;
  color: #ff8a80;
  background: #4a5568;
}

/* Darker Mode */
.darker .settings-heading {
  color: #e2e8f0;
}

.darker .font-size-btn {
  background: #1a202c;
  border-color: #2d3748;
}

.darker .font-size-btn:hover {
  background: #2d3748;
}

.darker .font-size-btn.active {
  background: #2d3748;
}

.darker .toggle-switch {
  background: #2d3748;
}

.darker .reset-btn {
  background: #1a202c;
  border-color: #2d3748;
}

/* High Contrast Mode */
.high-contrast .settings-heading {
  color: #000;
}

.high-contrast .settings-description,
.high-contrast .setting-description {
  color: #000;
}

.high-contrast .setting-label {
  color: #000;
}

.high-contrast .font-size-btn {
  background: #fff;
  border: 2px solid #000;
}

.high-contrast .font-size-btn:hover,
.high-contrast .font-size-btn.active {
  background: #000;
  color: #fff;
  border-color: #fff;
}

.high-contrast .font-size-btn.active {
  box-shadow: 0 0 0 3px #fff, 0 0 0 5px #000;
}

.high-contrast .size-preview {
  color: #000;
}

.high-contrast .size-label {
  color: #000;
}

.high-contrast .font-size-btn.active .size-preview,
.high-contrast .font-size-btn.active .size-label {
  color: #fff;
}

.high-contrast .toggle-switch {
  background: #000;
  border: 2px solid #fff;
}

.high-contrast .toggle-slider.on {
  background: #000;
}

.high-contrast .toggle-thumb {
  background: #fff;
}

.high-contrast .reset-btn {
  background: #fff;
  color: #000;
  border: 2px solid #000;
}

.high-contrast .reset-btn:hover {
  background: #000;
  color: #fff;
}

/* Reduced Motion */
.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* No Focus Indicators */
.no-focus-indicators :focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

/* Troll Overlay */
.troll-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}

.troll-message {
  text-align: center;
  color: #ff0000;
  animation: troll-pulse 0.5s ease-in-out infinite alternate;
}

.troll-text {
  font-size: 120px;
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 10px;
  text-shadow: 4px 4px 0 #ffff00, -4px -4px 0 #ff00ff, 4px -4px 0 #00ffff, -4px 4px 0 #ff6b00;
  line-height: 1;
}

.troll-dismiss {
  margin-top: 40px;
  padding: 16px 32px;
  background: transparent;
  border: 3px solid #ff0000;
  color: #ff0000;
  font-size: 20px;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  text-transform: uppercase;
}

.troll-dismiss:hover {
  background: #ff0000;
  color: #000;
  transform: scale(1.1);
}

@keyframes troll-pulse {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.05);
  }
}

.troll-enter-active,
.troll-leave-active {
  transition: all 0.3s ease;
}

.troll-enter-from,
.troll-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.troll-enter-to,
.troll-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
