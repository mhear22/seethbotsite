<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { LOCATIONS, LOCATION_BY_ID, SUPPLIER_BY_ID, SUPPLIERS } from './data/suppliers'
import { useDataCenterGame } from './composables/useDataCenterGame'
import { useDataCenterScene } from './composables/useDataCenterScene'
import type { DataCenterRunRecord, LocationId, RackOffer, SupplierId, SupplierOfferView } from './types/game'
import techHubBackground from './assets/backgrounds/tech-hub-bg.svg'
import suburbiaBackground from './assets/backgrounds/suburbia-bg.svg'
import countryBackground from './assets/backgrounds/country-bg.svg'

const game = useDataCenterGame()

const selectedLocation = ref<LocationId>('suburbia')
const runNameInput = ref('')
const sceneHost = ref<HTMLElement | null>(null)
const sceneReady = ref(false)
const draggedOfferId = ref<string | null>(null)
const isMobile = ref(false)

const LOCATION_THEMES: Record<
  LocationId,
  {
    image: string
    overlay: string
    vignette: string
    accent: string
    panelBg: string
    panelBorder: string
    shellTint: string
    buttonBg: string
    buttonBorder: string
    link: string
  }
> = {
  tech_hub: {
    image: techHubBackground,
    overlay: 'linear-gradient(155deg, rgba(7, 12, 33, 0.56) 0%, rgba(3, 8, 21, 0.78) 65%)',
    vignette: 'radial-gradient(circle at 22% 20%, rgba(14, 165, 233, 0.2), transparent 48%)',
    accent: '#67e8f9',
    panelBg: 'rgba(8, 20, 37, 0.74)',
    panelBorder: 'rgba(103, 232, 249, 0.28)',
    shellTint: 'rgba(34, 211, 238, 0.14)',
    buttonBg: 'rgba(8, 34, 47, 0.54)',
    buttonBorder: 'rgba(103, 232, 249, 0.42)',
    link: '#67e8f9'
  },
  suburbia: {
    image: suburbiaBackground,
    overlay: 'linear-gradient(155deg, rgba(9, 24, 34, 0.42) 0%, rgba(3, 12, 23, 0.73) 70%)',
    vignette: 'radial-gradient(circle at 18% 18%, rgba(125, 211, 252, 0.18), transparent 50%)',
    accent: '#93c5fd',
    panelBg: 'rgba(11, 28, 41, 0.74)',
    panelBorder: 'rgba(147, 197, 253, 0.26)',
    shellTint: 'rgba(96, 165, 250, 0.13)',
    buttonBg: 'rgba(17, 38, 58, 0.5)',
    buttonBorder: 'rgba(147, 197, 253, 0.4)',
    link: '#bfdbfe'
  },
  country: {
    image: countryBackground,
    overlay: 'linear-gradient(155deg, rgba(6, 25, 17, 0.4) 0%, rgba(3, 11, 8, 0.72) 72%)',
    vignette: 'radial-gradient(circle at 26% 14%, rgba(134, 239, 172, 0.2), transparent 52%)',
    accent: '#86efac',
    panelBg: 'rgba(7, 24, 16, 0.72)',
    panelBorder: 'rgba(134, 239, 172, 0.24)',
    shellTint: 'rgba(74, 222, 128, 0.14)',
    buttonBg: 'rgba(13, 41, 24, 0.52)',
    buttonBorder: 'rgba(134, 239, 172, 0.38)',
    link: '#bbf7d0'
  }
}

const numberFormatter = new Intl.NumberFormat('en-US')
const HEAT_BAR_MAX = 16
const CLIENT_UPSET_HEAT = 8
const PRESSURE_MAX = 120

const scene = useDataCenterScene({
  getDraggedOfferId: () => draggedOfferId.value,
  onTileClick: (x, y) => {
    if (game.movingRackId.value) {
      game.moveSelectedRackTo(x, y)
      return
    }

    const rack = game.rackAt(x, y)
    if (rack) {
      game.selectRackAt(rack.id)
    }
  },
  onOfferDrop: (offerId, x, y) => {
    game.placeRackOnTile(offerId, x, y)
    draggedOfferId.value = null
  },
  onRackSelect: (rackId) => {
    game.selectRackAt(rackId)
  }
})

const warnings = computed(() => {
  const items: string[] = []

  if (game.averageHeat.value > 9) {
    items.push('Cooling load is elevated. Heat churn risk is increasing.')
  }

  if (game.maxHeat.value > 16) {
    items.push('A hotspot formed in the grid. Move racks or expand to vent heat.')
  }

  if (game.state.pressure > 62) {
    items.push('Community backlash is building. Expansion penalties now apply.')
  }

  if (game.state.expansionLockDays > 0) {
    items.push(`Expansion locked for ${game.state.expansionLockDays} more day(s).`)
  }

  if (game.state.legalStrikes >= 3) {
    items.push('Legal pressure is severe. Another strike can end the run.')
  }

  if (game.state.clients <= 2) {
    items.push('Interested client demand is low. Keep heat and pressure down to recover interest.')
  }

  return items
})

const runHeader = computed(() => {
  if (!game.location.value) return ''
  return `${game.state.runName} • ${game.location.value.label}`
})

const autosaveLabel = computed(() => {
  if (!game.isAuthenticated.value) return 'Guest mode (no persistence)'
  if (game.autosaveState.value === 'saving') return 'Saving...'
  if (game.autosaveState.value === 'error') return 'Autosave failed'
  return 'Autosave ready'
})

const runStatusLine = computed(() => {
  if (game.state.phase === 'setup') return 'Real-time rack hosting sim | 1 day = 60s'
  return `Day ${game.state.day} · ${game.state.paused ? 'Paused' : 'Running'} · ${autosaveLabel.value}`
})

const activeLocationId = computed<LocationId>(() => {
  if (game.state.phase === 'setup') return selectedLocation.value
  return game.location.value?.id ?? selectedLocation.value
})

const activeTheme = computed(() => LOCATION_THEMES[activeLocationId.value])

const averageHeatRatio = computed(() =>
  Math.min(1, Math.max(0, game.averageHeat.value / HEAT_BAR_MAX))
)

const clientUpsetThresholdRatio = computed(() =>
  Math.min(1, Math.max(0, CLIENT_UPSET_HEAT / HEAT_BAR_MAX))
)

const clientsUpset = computed(() => game.averageHeat.value >= CLIENT_UPSET_HEAT)

const communityAcceptance = computed(() =>
  Math.min(100, Math.max(0, ((PRESSURE_MAX - game.state.pressure) / PRESSURE_MAX) * 100))
)

const communityAcceptanceRatio = computed(() => communityAcceptance.value / 100)

const appShellStyle = computed<Record<string, string>>(() => ({
  '--location-image': `url("${activeTheme.value.image}")`,
  '--location-overlay': activeTheme.value.overlay,
  '--location-vignette': activeTheme.value.vignette,
  '--location-accent': activeTheme.value.accent,
  '--location-panel-bg': activeTheme.value.panelBg,
  '--location-panel-border': activeTheme.value.panelBorder,
  '--location-shell-tint': activeTheme.value.shellTint,
  '--location-button-bg': activeTheme.value.buttonBg,
  '--location-button-border': activeTheme.value.buttonBorder,
  '--location-link': activeTheme.value.link
}))

const setupHasSavedRuns = computed(() => game.isAuthenticated.value && game.runSlots.value.length > 0)
const visibleOffersBySupplier = computed<Record<SupplierId, SupplierOfferView[]>>(() =>
  SUPPLIERS.reduce(
    (groups, supplier) => {
      groups[supplier.id] = game.offersBySupplier.value[supplier.id].filter((entry) => !entry.locked)
      return groups
    },
    {} as Record<SupplierId, SupplierOfferView[]>
  )
)

const formatMoney = (value: number): string => {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${numberFormatter.format(Math.abs(Math.round(value)))}`
}

const formatFloat = (value: number, digits = 1): string => value.toFixed(digits)

const getOfferEffectiveDailyCash = (offer: RackOffer): number => {
  const multiplier = SUPPLIER_BY_ID[offer.supplierId].incomeMultiplier ?? 1
  return offer.dailyCash * (multiplier > 0 ? multiplier : 1)
}

const getOfferEffectiveHeat = (offer: RackOffer): number => {
  const multiplier = SUPPLIER_BY_ID[offer.supplierId].heatMultiplier ?? 1
  const normalizedMultiplier = multiplier > 0 ? multiplier : 1
  if (offer.heat >= 0) {
    return offer.heat * normalizedMultiplier
  }
  return offer.heat / normalizedMultiplier
}

const formatOfferStats = (offer: RackOffer): string => {
  const effectiveDailyCash = getOfferEffectiveDailyCash(offer)
  const effectiveHeat = getOfferEffectiveHeat(offer)
  const incomeLabel = `${effectiveDailyCash > 0 ? '+' : ''}${formatMoney(effectiveDailyCash)}/day`
  const thermalLabel = effectiveHeat < 0
    ? `Cooling ${formatFloat(Math.abs(effectiveHeat))}`
    : `Heat ${formatFloat(effectiveHeat)}`
  const powerLabel = offer.dailyPowerCost > 0
    ? `Power ${formatMoney(offer.dailyPowerCost)}/day`
    : 'Power neutral'
  const utilityLabel =
    offer.utilityType === 'data_uplink'
      ? `Adj +${formatFloat((offer.adjacentIncomeBoost || 0) * 100, 0)}% income`
      : offer.utilityType === 'cooling_tower'
        ? 'Utility cooling'
        : null
  return [formatMoney(offer.cost), incomeLabel, thermalLabel, powerLabel, utilityLabel].filter(Boolean).join(' · ')
}

const getSlotMeta = (run: DataCenterRunRecord): string => {
  try {
    const parsed = JSON.parse(run.state_json)
    const day = typeof parsed.day === 'number' ? parsed.day : 1
    const racks = Array.isArray(parsed.placedRacks) ? parsed.placedRacks.length : 0
    return `Day ${day} • ${racks} racks`
  } catch {
    return 'Saved run'
  }
}

const getSlotLocation = (run: DataCenterRunRecord): string => {
  const location = LOCATION_BY_ID[run.location]
  return location?.label || run.location
}

const canAffordOffer = (offer: RackOffer) => game.state.cash >= offer.cost
const offerHint = (offer: RackOffer): string => {
  if (offer.utilityType === 'data_uplink') return 'Boosts adjacent rack income'
  if (offer.utilityType === 'cooling_tower') return 'Heavy utility cooling'
  if (offer.role === 'cooling') return 'Cooling rack: lowers heat, no revenue'
  return 'Drag to place'
}

const beginRun = async () => {
  await game.startNewRun(selectedLocation.value, runNameInput.value.trim())
}

const loadSlot = async (runId: number) => {
  try {
    await game.loadRunSlot(runId)
  } catch (error) {
    console.error(error)
  }
}

const removeSlot = async (runId: number) => {
  const confirmed = window.confirm('Delete this save slot permanently?')
  if (!confirmed) return

  try {
    await game.deleteRunSlot(runId)
  } catch (error) {
    console.error(error)
  }
}

const manualSave = async () => {
  await game.manualSave()
}

const removeSelectedRack = () => {
  if (!game.movingRackId.value) return

  const confirmed = window.confirm('Remove selected rack? This cannot be undone and gives no refund.')
  if (!confirmed) return

  game.removeSelectedRack()
}

const skipDay = async () => {
  await game.skipToNextDay()
}

const onOfferDragStart = (offerId: string, event: DragEvent) => {
  draggedOfferId.value = offerId

  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', offerId)
    event.dataTransfer.effectAllowed = 'copy'

    const sourceEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    if (sourceEl) {
      const dragPreview = sourceEl.cloneNode(true) as HTMLElement
      dragPreview.style.position = 'fixed'
      dragPreview.style.top = '-1000px'
      dragPreview.style.left = '-1000px'
      dragPreview.style.opacity = '0.9'
      dragPreview.style.width = `${sourceEl.offsetWidth}px`
      dragPreview.style.pointerEvents = 'none'
      document.body.appendChild(dragPreview)
      event.dataTransfer.setDragImage(dragPreview, 18, 18)
      window.setTimeout(() => dragPreview.remove(), 0)
    }
  }
}

const onOfferDragEnd = () => {
  draggedOfferId.value = null
}

const updateViewport = () => {
  isMobile.value = window.innerWidth < 980
}

const syncScene = () => {
  if (!sceneReady.value || game.state.phase === 'setup') return
  scene.sync({
    rows: game.state.rows,
    cols: game.state.cols,
    heatMap: game.state.heatMap,
    racks: game.state.placedRacks,
    movingRackId: game.movingRackId.value
  })
}

watch(
  () => ({ host: sceneHost.value, phase: game.state.phase }),
  ({ host, phase }) => {
    if (phase === 'setup' || !host) {
      if (sceneReady.value) {
        scene.unmount()
        sceneReady.value = false
      }
      return
    }

    if (!sceneReady.value) {
      scene.mount(host)
      sceneReady.value = true
    }

    syncScene()
  },
  { immediate: true }
)

watch(
  () => [
    game.state.phase,
    game.state.rows,
    game.state.cols,
    game.state.heatMap,
    game.state.placedRacks,
    game.movingRackId.value
  ],
  () => {
    syncScene()
  },
  { deep: true }
)

watch(
  () => draggedOfferId.value,
  () => {
    syncScene()
  }
)

onMounted(async () => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
  await game.bootstrap()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateViewport)
})
</script>

<template>
  <div class="app-shell" :style="appShellStyle">
    <div class="location-background" aria-hidden="true"></div>
    <header class="top-bar" :class="{ inrun: game.state.phase !== 'setup', paused: game.state.paused }">
      <a href="/" class="home-link">← Main Site</a>
      <div class="top-summary">
        <h1>Data Centre</h1>
        <p>{{ runStatusLine }}</p>
        <p v-if="game.state.phase !== 'setup'" class="run-line">{{ runHeader }}</p>
      </div>
      <div class="top-actions">
        <div class="auth-pill" :class="{ guest: !game.isAuthenticated.value }">
          {{ game.isAuthenticated.value ? 'Authenticated saves enabled' : 'Guest run (non-persistent)' }}
        </div>
        <div class="header-actions" v-if="game.state.phase === 'running'">
          <button class="secondary-btn" @click="game.togglePause">
            {{ game.state.paused ? 'Resume' : 'Pause' }}
          </button>
          <button class="secondary-btn" :disabled="!game.movingRackId.value" @click="removeSelectedRack">
            Remove Selected Rack
          </button>
          <button class="secondary-btn" @click="skipDay">Next Day</button>
          <button class="secondary-btn" v-if="game.isAuthenticated.value" @click="manualSave">
            Save Now
          </button>
          <button class="danger-btn" @click="game.archiveCurrentRun">End Run</button>
        </div>
      </div>
    </header>

    <section v-if="isMobile" class="desktop-only-warning">
      <p>
        This v1 build is desktop-only. You can still view the UI here, but gameplay is tuned for wider screens.
      </p>
    </section>

    <section v-if="game.state.phase === 'setup'" class="setup-layout">
      <article class="setup-card">
        <h2>Start New Run</h2>
        <p>Choose one location for this run. Location is locked once started.</p>

        <div class="location-grid">
          <button
            v-for="location in LOCATIONS"
            :key="location.id"
            class="location-card"
            :class="{ selected: selectedLocation === location.id }"
            @click="selectedLocation = location.id"
          >
            <h3>{{ location.label }}</h3>
            <p>{{ location.description }}</p>
            <small>Starting cash: {{ formatMoney(location.startingCash) }}</small>
          </button>
        </div>

        <label class="name-field">
          Run name
          <input
            v-model="runNameInput"
            type="text"
            placeholder="Optional"
            maxlength="80"
          />
        </label>

        <button class="primary-btn" @click="beginRun">Launch Run</button>
      </article>

      <article class="setup-card" v-if="setupHasSavedRuns">
        <h2>Saved Slots</h2>
        <div class="saved-run-list">
          <div v-for="run in game.runSlots.value" :key="run.id" class="saved-run-item">
            <div>
              <strong>{{ run.name }}</strong>
              <p>{{ getSlotLocation(run) }} · {{ getSlotMeta(run) }}</p>
              <small>Last played: {{ new Date(run.last_played_at).toLocaleString() }}</small>
            </div>
            <div class="saved-actions">
              <button class="secondary-btn" @click="loadSlot(run.id)">Load</button>
              <button class="danger-btn" @click="removeSlot(run.id)">Delete</button>
            </div>
          </div>
        </div>
      </article>

      <article class="setup-card" v-else>
        <h2>Save Behavior</h2>
        <ul>
          <li>Authenticated: unlimited save slots in DB + end-of-day autosave.</li>
          <li>Guest/offline: full gameplay, but no persistent saves.</li>
        </ul>
      </article>
    </section>

    <section v-else class="game-layout">
      <div class="workspace">
        <article class="scene-card">
          <div class="scene-host" ref="sceneHost"></div>
          <div class="scene-footnote">
            Drag onto highlighted tiles (green = valid, red = occupied). Click a rack to move or remove it.
          </div>

          <div class="meter-strip">
            <div>
              <label>Day Progress</label>
              <progress :value="game.dayProgress.value" max="1"></progress>
            </div>
            <div>
              <label>AGI Workload</label>
              <progress :value="game.workloadProgress.value" max="1"></progress>
              <span>{{ formatFloat(game.state.totalWorkload, 1) }} / 250</span>
            </div>
          </div>
        </article>

        <aside class="side-column">
          <article class="panel summary-panel">
            <h3>Operations</h3>
            <div class="metrics-grid">
              <div>
                <label>Cash</label>
                <strong>{{ formatMoney(game.state.cash) }}</strong>
              </div>
              <div>
                <label>Interested Clients</label>
                <strong>{{ game.state.clients }}</strong>
              </div>
              <div>
                <label>Racks</label>
                <strong>{{ game.occupiedTiles.value }}</strong>
              </div>
              <div>
                <label>Occupancy</label>
                <strong>{{ formatFloat(game.occupancyRatio.value * 100, 0) }}%</strong>
              </div>
              <div>
                <label>Avg Heat</label>
                <strong>{{ formatFloat(game.averageHeat.value) }}</strong>
              </div>
              <div>
                <label>Max Heat</label>
                <strong>{{ formatFloat(game.maxHeat.value) }}</strong>
              </div>
              <div>
                <label>Pressure</label>
                <strong>{{ formatFloat(game.state.pressure, 1) }}</strong>
              </div>
              <div>
                <label>Legal Strikes</label>
                <strong>{{ game.state.legalStrikes }}</strong>
              </div>
            </div>

            <div class="potential-income">
              <label>Potential Day Income</label>
              <strong>{{ formatMoney(game.potentialDayIncome.value) }}</strong>
            </div>

            <div class="status-bars">
              <div class="status-bar-group">
                <div class="status-bar-header">
                  <label>Average Heat</label>
                  <span>{{ formatFloat(game.averageHeat.value) }} / {{ HEAT_BAR_MAX }}</span>
                </div>
                <div class="status-bar">
                  <div class="status-fill heat-fill" :style="{ width: `${averageHeatRatio * 100}%` }"></div>
                  <div class="status-threshold" :style="{ left: `${clientUpsetThresholdRatio * 100}%` }"></div>
                </div>
                <p class="status-note" :class="{ alert: clientsUpset }">
                  <span class="indicator-dot" :class="{ alert: clientsUpset }"></span>
                  {{ clientsUpset ? 'Interest is dropping (8+ avg heat)' : 'Interest remains stable (<8 avg heat)' }}
                </p>
              </div>

              <div class="status-bar-group">
                <div class="status-bar-header">
                  <label>Community Acceptance</label>
                  <span>{{ formatFloat(communityAcceptance, 0) }}%</span>
                </div>
                <div class="status-bar">
                  <div
                    class="status-fill acceptance-fill"
                    :style="{ width: `${communityAcceptanceRatio * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <div class="day-summary" v-if="game.state.lastDaySummary">
              <h4>Last Day</h4>
              <p>Net: <strong :class="{ positive: game.state.lastDaySummary.net >= 0, negative: game.state.lastDaySummary.net < 0 }">
                {{ formatMoney(game.state.lastDaySummary.net) }}
              </strong></p>
              <p>
                Income {{ formatMoney(game.state.lastDaySummary.income) }} ·
                Power {{ formatMoney(game.state.lastDaySummary.powerCost) }} ·
                Cooling {{ formatMoney(game.state.lastDaySummary.coolingCost) }}
              </p>
              <p>
                Interest +{{ game.state.lastDaySummary.gainedClients }} ·
                Churn -{{ game.state.lastDaySummary.churnedClients }} ·
                Pulled servers {{ game.state.lastDaySummary.providerPulledServers }}
              </p>
            </div>
          </article>

          <article class="panel supplier-panel">
            <h3>Suppliers</h3>
            <p class="supplier-note">More server offers unlock as interested clients grow.</p>
            <div v-for="supplier in SUPPLIERS" :key="supplier.id" class="supplier-group">
              <header>
                <strong>{{ supplier.name }}</strong>
                <small class="supplier-benefit">{{ supplier.benefit }}</small>
              </header>

              <div class="offer-list">
                <button
                  v-for="entry in visibleOffersBySupplier[supplier.id]"
                  :key="entry.offer.id"
                  class="offer-card"
                  :class="{
                    unaffordable: !canAffordOffer(entry.offer),
                    dragging: draggedOfferId === entry.offer.id,
                    cooling: entry.offer.role === 'cooling',
                    utility: entry.offer.role === 'utility'
                  }"
                  :disabled="!canAffordOffer(entry.offer)"
                  :draggable="canAffordOffer(entry.offer)"
                  @dragstart="onOfferDragStart(entry.offer.id, $event)"
                  @dragend="onOfferDragEnd"
                >
                  <div class="offer-top">
                    <strong>{{ entry.offer.name }}</strong>
                    <small>Tier {{ entry.offer.tier }}</small>
                  </div>
                  <p>
                    {{ formatOfferStats(entry.offer) }}
                  </p>
                  <small v-if="!canAffordOffer(entry.offer)">
                    Need {{ formatMoney(entry.offer.cost - game.state.cash) }} more cash
                  </small>
                  <small v-else>{{ offerHint(entry.offer) }}</small>
                </button>
                <small v-if="visibleOffersBySupplier[supplier.id].length === 0" class="supplier-empty">
                  No offers currently available.
                </small>
              </div>
            </div>
          </article>

          <article class="panel">
            <h3>Expansion & Legal</h3>
            <div class="expand-actions">
              <button class="secondary-btn" :disabled="!game.canExpandRows.value" @click="game.expandRows">
                Add Row ({{ formatMoney(game.rowExpansionCost.value) }})
              </button>
              <button class="secondary-btn" :disabled="!game.canExpandCols.value" @click="game.expandCols">
                Add Column ({{ formatMoney(game.colExpansionCost.value) }})
              </button>
            </div>

            <p>Grid: {{ game.state.cols }} × {{ game.state.rows }} (max 10 × 10)</p>
            <p v-if="game.state.expansionLockDays > 0">Expansion locked {{ game.state.expansionLockDays }} more day(s).</p>

            <button class="secondary-btn" :disabled="!game.canMitigateBacklash.value" @click="game.mitigateBacklash">
              Community Outreach ({{ formatMoney(game.mitigationCost.value) }})
            </button>
          </article>

          <article class="panel warnings-panel" v-if="warnings.length">
            <h3>Warnings</h3>
            <ul>
              <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
            </ul>
          </article>

          <article class="panel result-panel" v-if="game.state.phase === 'won' || game.state.phase === 'lost'">
            <h3>{{ game.state.phase === 'won' ? 'Run Complete' : 'Run Failed' }}</h3>
            <p v-if="game.state.phase === 'won'">
              AGI workload target reached. You delivered {{ formatFloat(game.state.totalWorkload, 1) }} workload-days.
            </p>
            <p v-else>{{ game.state.lossReason }}</p>
            <button class="primary-btn" @click="game.resetStateForSetup">Back to Setup</button>
          </article>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.app-shell {
  --location-image: none;
  --location-overlay: linear-gradient(160deg, rgba(2, 6, 23, 0.65) 0%, rgba(15, 23, 42, 0.85) 100%);
  --location-vignette: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.18), transparent 42%);
  --location-accent: #7dd3fc;
  --location-panel-bg: rgba(15, 23, 42, 0.74);
  --location-panel-border: rgba(148, 163, 184, 0.24);
  --location-shell-tint: rgba(56, 189, 248, 0.11);
  --location-button-bg: rgba(148, 163, 184, 0.2);
  --location-button-border: rgba(148, 163, 184, 0.35);
  --location-link: #93c5fd;

  position: relative;
  isolation: isolate;
  height: 100vh;
  background: #020617;
  color: #e2e8f0;
  padding: 18px;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 10px;
}

.location-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(160deg, var(--location-shell-tint) 0%, rgba(2, 6, 23, 0.62) 78%),
    var(--location-vignette),
    var(--location-overlay),
    var(--location-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: saturate(1.08) contrast(1.03);
  transform: scale(1.02);
  transition:
    background-image 240ms ease,
    filter 240ms ease;
}

.location-background::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.14;
  background-image:
    linear-gradient(rgba(226, 232, 240, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(226, 232, 240, 0.06) 1px, transparent 1px);
  background-size: 36px 36px;
}

.top-bar {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid var(--location-panel-border);
  border-radius: 14px;
  background: var(--location-panel-bg);
  backdrop-filter: blur(10px);
}

.top-bar.inrun {
  border-color: var(--location-accent);
}

.top-bar.paused {
  border-color: rgba(251, 191, 36, 0.55);
}

.top-summary h1 {
  margin: 0;
  font-size: 1.35rem;
  letter-spacing: 0.03em;
}

.top-summary p {
  margin: 2px 0 0;
  color: #94a3b8;
  font-size: 0.88rem;
}

.run-line {
  color: var(--location-accent);
  font-weight: 600;
}

.home-link {
  color: var(--location-link);
  text-decoration: none;
  font-weight: 600;
}

.home-link:hover {
  text-decoration: underline;
}

.auth-pill {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  background: rgba(16, 185, 129, 0.18);
  color: #6ee7b7;
  border: 1px solid rgba(52, 211, 153, 0.35);
}

.auth-pill.guest {
  background: rgba(249, 115, 22, 0.15);
  border-color: rgba(251, 146, 60, 0.35);
  color: #fdba74;
}

.top-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.desktop-only-warning {
  position: relative;
  z-index: 1;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(251, 146, 60, 0.4);
  background: rgba(124, 45, 18, 0.28);
  color: #fdba74;
}

.setup-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 14px;
  overflow: auto;
  min-height: 0;
  padding-right: 4px;
}

.setup-card {
  border-radius: 14px;
  border: 1px solid var(--location-panel-border);
  background: var(--location-panel-bg);
  padding: 16px;
}

.setup-card h2 {
  margin-top: 0;
}

.location-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 14px 0;
}

.location-card {
  text-align: left;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.35);
  color: #e2e8f0;
  padding: 10px;
  cursor: pointer;
}

.location-card.selected {
  border-color: var(--location-accent);
  box-shadow: 0 0 0 1px var(--location-accent), 0 0 22px -10px var(--location-accent);
}

.location-card h3 {
  margin: 0 0 6px;
}

.location-card p {
  margin: 0 0 8px;
  font-size: 0.84rem;
  color: #cbd5e1;
  min-height: 40px;
}

.location-card small {
  color: #93c5fd;
}

.name-field {
  display: block;
  margin-bottom: 12px;
  font-size: 0.88rem;
}

.name-field input {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(2, 6, 23, 0.65);
  color: #e2e8f0;
}

.saved-run-list {
  display: grid;
  gap: 10px;
}

.saved-run-item {
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 10px;
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
}

.saved-run-item p,
.saved-run-item small {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.82rem;
}

.saved-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.primary-btn,
.secondary-btn,
.danger-btn {
  border: 0;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn {
  background: linear-gradient(120deg, #22c55e, #0ea5e9);
  color: #04111f;
}

.secondary-btn {
  background: var(--location-button-bg);
  color: #e2e8f0;
  border: 1px solid var(--location-button-border);
}

.secondary-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.danger-btn {
  background: rgba(239, 68, 68, 0.18);
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.5);
}

.game-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 410px;
  gap: 12px;
  min-height: 0;
  overflow: hidden;
}

.scene-card {
  border: 1px solid var(--location-panel-border);
  border-radius: 12px;
  background: var(--location-panel-bg);
  padding: 12px;
  min-height: 0;
  height: 100%;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto auto;
  gap: 10px;
}

.scene-host {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--location-panel-border);
}

.scene-host::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(180deg, rgba(2, 6, 23, 0.18) 0%, rgba(2, 6, 23, 0.6) 100%),
    var(--location-vignette),
    var(--location-image);
  background-size: cover;
  background-position: center;
  opacity: 0.9;
  transform: scale(1.04);
}

.scene-host::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.06), transparent 35%, rgba(15, 23, 42, 0.2));
}

.scene-host :deep(canvas) {
  position: relative;
  z-index: 1;
  display: block;
  width: 100% !important;
  height: 100% !important;
  background: transparent !important;
}

.scene-footnote {
  color: var(--location-link);
  font-size: 0.82rem;
}

.meter-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.meter-strip label {
  display: block;
  font-size: 0.78rem;
  margin-bottom: 4px;
  color: #cbd5e1;
}

.meter-strip progress {
  width: 100%;
}

.meter-strip span {
  font-size: 0.8rem;
  color: #cbd5e1;
}

.side-column {
  display: grid;
  gap: 10px;
  align-content: start;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.panel {
  border: 1px solid var(--location-panel-border);
  border-radius: 12px;
  background: var(--location-panel-bg);
  padding: 12px;
}

.panel h3 {
  margin: 0 0 8px;
  font-size: 0.95rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.metrics-grid label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.metrics-grid strong {
  font-size: 0.95rem;
}

.potential-income {
  margin-top: 12px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(2, 6, 23, 0.4);
}

.potential-income label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.potential-income strong {
  font-size: 1.5rem;
  color: var(--location-accent);
  line-height: 1.1;
}

.status-bars {
  margin-top: 10px;
  display: grid;
  gap: 10px;
}

.status-bar-group {
  display: grid;
  gap: 6px;
}

.status-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.status-bar-header label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.status-bar-header span {
  font-size: 0.8rem;
  color: #cbd5e1;
}

.status-bar {
  position: relative;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.65);
}

.status-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 180ms ease;
}

.heat-fill {
  background: linear-gradient(90deg, #22c55e 0%, #f59e0b 58%, #ef4444 100%);
}

.acceptance-fill {
  background: linear-gradient(90deg, #ef4444 0%, #f59e0b 45%, #22c55e 100%);
}

.status-threshold {
  position: absolute;
  top: -1px;
  bottom: -1px;
  width: 2px;
  background: rgba(248, 113, 113, 0.9);
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.65);
  transform: translateX(-1px);
}

.status-note {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  color: #86efac;
}

.status-note.alert {
  color: #fda4af;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
}

.indicator-dot.alert {
  background: #ef4444;
}

.day-summary {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.day-summary h4 {
  margin: 0 0 6px;
}

.day-summary p {
  margin: 0;
  font-size: 0.82rem;
  color: #cbd5e1;
}

.positive {
  color: #6ee7b7;
}

.negative {
  color: #fda4af;
}

.supplier-note {
  margin: 0 0 8px;
  font-size: 0.75rem;
  color: #93c5fd;
}

.supplier-group {
  margin-bottom: 8px;
}

.supplier-group header {
  display: grid;
  gap: 2px;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.supplier-benefit {
  font-size: 0.7rem;
  color: #93c5fd;
  font-weight: 500;
}

.offer-list {
  display: grid;
  gap: 6px;
}

.offer-card {
  text-align: left;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(2, 6, 23, 0.55);
  color: #e2e8f0;
  padding: 8px;
  cursor: grab;
}

.offer-card.unaffordable {
  opacity: 0.5;
  filter: grayscale(0.9);
  cursor: not-allowed;
}

.offer-card.dragging {
  opacity: 0.5;
  border-color: rgba(125, 211, 252, 0.85);
}

.offer-card.cooling:not(.unaffordable) {
  border-color: rgba(16, 185, 129, 0.55);
}

.offer-card.utility:not(.unaffordable) {
  border-color: rgba(251, 191, 36, 0.62);
}

.offer-card:active {
  cursor: grabbing;
}

.offer-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.offer-card p {
  margin: 0;
  font-size: 0.77rem;
  color: #cbd5e1;
}

.offer-card small {
  font-size: 0.72rem;
  color: #93c5fd;
}

.supplier-empty {
  display: block;
  font-size: 0.74rem;
  color: #94a3b8;
  padding: 2px 0 0 2px;
}

.expand-actions {
  display: grid;
  gap: 6px;
  margin-bottom: 8px;
}

.warnings-panel ul {
  margin: 0;
  padding-left: 18px;
  color: #fdba74;
}

.warnings-panel li {
  margin-bottom: 6px;
}

.result-panel {
  border-color: rgba(56, 189, 248, 0.5);
}

.result-panel p {
  color: #cbd5e1;
  font-size: 0.88rem;
}

@media (max-width: 1200px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .side-column {
    max-height: none;
  }
}

@media (max-width: 980px) {
  .setup-layout {
    grid-template-columns: 1fr;
  }

  .location-grid {
    grid-template-columns: 1fr;
  }

  .top-bar {
    grid-template-columns: 1fr;
  }

  .top-actions {
    justify-content: flex-start;
  }
}
</style>
