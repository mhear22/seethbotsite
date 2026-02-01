import { ref } from 'vue'

export interface PanelState {
  rankings: boolean
  cat: boolean
  feed: boolean
  digitalGoose: boolean
  coolnessPanel: boolean
}

const DEFAULT_PANELS: PanelState = {
  rankings: true,
  cat: true,
  feed: false,
  digitalGoose: true,
  coolnessPanel: true
}

export function usePanels(initialState?: Partial<PanelState>) {
  const panels = ref<PanelState>({ ...DEFAULT_PANELS, ...initialState })

  const togglePanel = (panelName: keyof PanelState) => {
    panels.value[panelName] = !panels.value[panelName]
  }

  const openPanel = (panelName: keyof PanelState) => {
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
