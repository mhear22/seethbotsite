import { ref } from 'vue'

export interface PanelState {
  rankings: boolean
  cat: boolean
  feed: boolean
  digitalGoose: boolean
  tachometer: boolean
  coolnessPanel: boolean
}

const DEFAULT_PANELS: PanelState = {
  rankings: true,  // Only rankings open by default to avoid overlap on mobile
  cat: false,      // Cat panel closed by default
  feed: false,
  digitalGoose: true,
  tachometer: true,
  coolnessPanel: true
}

// Mobile-exclusive panels that should not overlap
const MOBILE_BOTTOM_PANELS: (keyof PanelState)[] = ['rankings', 'cat']

export function usePanels(initialState?: Partial<PanelState>) {
  const panels = ref<PanelState>({ ...DEFAULT_PANELS, ...initialState })

  // Check if we're on mobile
  const isMobile = () => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
  }

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
  }

  const closePanel = (panelName: keyof PanelState) => {
    panels.value[panelName] = false
  }

  return {
    panels,
    togglePanel,
    openPanel,
    closePanel
  }
}
