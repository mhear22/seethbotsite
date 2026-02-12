import { ref, watch } from 'vue'
import { useAudio } from './useAudio'

export interface PanelState {
  rankings: boolean
  cat: boolean
  feed: boolean
  digitalGoose: boolean
  tachometer: boolean
  coolnessPanel: boolean
  mining: boolean
  activeUsers: boolean
  favorites: boolean
}

// Detect if on mobile device
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768
}

const DEFAULT_PANELS: PanelState = {
  rankings: true,  // Only rankings open by default to avoid overlap on mobile
  cat: false,      // Cat panel closed by default
  feed: false,
  digitalGoose: true,
  tachometer: true,
  coolnessPanel: true,
  mining: false,
  activeUsers: true, // Active Users panel open by default
  favorites: true // Favorites panel open by default
}

// Mobile-friendly defaults: hide feed, mold meter, and active users on mobile
const MOBILE_DEFAULT_PANELS: PanelState = {
  rankings: false,
  cat: false,
  feed: false,
  digitalGoose: false,
  tachometer: false,
  coolnessPanel: false,
  mining: false,
  activeUsers: false,
  favorites: false
}

// Mobile-exclusive panels that should not overlap
const MOBILE_BOTTOM_PANELS: (keyof PanelState)[] = ['rankings', 'cat']

// Load panel state from localStorage
const loadPanelsFromStorage = (): PanelState => {
  if (typeof window === 'undefined') return DEFAULT_PANELS

  try {
    const saved = localStorage.getItem('panels')
    if (saved) {
      // User has saved preferences, use those
      return { ...DEFAULT_PANELS, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('Failed to load panels from localStorage:', error)
  }

  // No saved preferences, use mobile or desktop defaults
  return isMobileDevice() ? MOBILE_DEFAULT_PANELS : DEFAULT_PANELS
}

// Save panel state to localStorage
const savePanelsToStorage = (panels: PanelState) => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('panels', JSON.stringify(panels))
  } catch (error) {
    console.error('Failed to save panels to localStorage:', error)
  }
}

export function usePanels(initialState?: Partial<PanelState>) {
  const panels = ref<PanelState>({ ...DEFAULT_PANELS, ...initialState })

  // Load saved panel state on mount
  const savedPanels = loadPanelsFromStorage()
  panels.value = { ...panels.value, ...savedPanels }

  // Watch for changes and save to localStorage
  watch(
    panels,
    (newPanels) => {
      savePanelsToStorage(newPanels)
    },
    { deep: true }
  )

  // Check if we're on mobile
  const isMobile = () => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
  }

  const { playPanelToggle } = useAudio()

  const togglePanel = (panelName: keyof PanelState) => {
    const isCurrentlyOpen = panels.value[panelName]

    // On mobile, close other bottom panels when opening one
    if (isMobile() && !isCurrentlyOpen && MOBILE_BOTTOM_PANELS.includes(panelName)) {
      MOBILE_BOTTOM_PANELS.forEach(otherPanel => {
        if (otherPanel !== panelName) {
          panels.value[otherPanel] = false
        }
      })
    }

    panels.value[panelName] = !isCurrentlyOpen

    // Play sound when panel is opened
    if (!isCurrentlyOpen) {
      playPanelToggle()
    }
  }

  const openPanel = (panelName: keyof PanelState) => {
    // On mobile, close other bottom panels when opening one
    if (isMobile() && MOBILE_BOTTOM_PANELS.includes(panelName)) {
      MOBILE_BOTTOM_PANELS.forEach(otherPanel => {
        if (otherPanel !== panelName) {
          panels.value[otherPanel] = false
        }
      })
    }

    panels.value[panelName] = true

    // Play sound when panel is opened
    playPanelToggle()
  }

  const closePanel = (panelName: keyof PanelState) => {
    panels.value[panelName] = false

    // Play sound when panel is closed
    playPanelToggle()
  }

  return {
    panels,
    togglePanel,
    openPanel,
    closePanel
  }
}
