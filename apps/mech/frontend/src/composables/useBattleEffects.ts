/**
 * useBattleEffects - lightweight shared channel for transient combat UI feedback
 * (hit markers + floating damage numbers).
 *
 * BattleCanvas pushes events here when the single-player BattleScene reports a
 * player hit; BattleHUD subscribes and renders the animated markers/numbers.
 * This avoids threading new props/emits through the (un-owned) parent page —
 * the two sibling components share one reactive module-level state.
 *
 * Multiplayer netcode is untouched: only the single-player BattleScene fire/hit
 * path feeds this channel.
 */
import { ref } from 'vue'

export interface HitMarkerEvent {
  id: number
  kill: boolean
  bornAt: number
}

export interface DamageNumberEvent {
  id: number
  amount: number
  crit: boolean
  screenX: number
  screenY: number
  bornAt: number
}

// Module-level shared reactive state (single channel per app instance).
const hitMarkers = ref<HitMarkerEvent[]>([])
const damageNumbers = ref<DamageNumberEvent[]>([])
let nextId = 0

export function useBattleEffects() {
  const pushHitMarker = (kill: boolean) => {
    const id = nextId++
    hitMarkers.value.push({ id, kill, bornAt: performance.now() })
    // Auto-expire after the CSS animation window.
    window.setTimeout(() => {
      hitMarkers.value = hitMarkers.value.filter((m) => m.id !== id)
    }, 450)
  }

  const pushDamageNumber = (amount: number, crit: boolean, screenX: number, screenY: number) => {
    const id = nextId++
    damageNumbers.value.push({ id, amount, crit, screenX, screenY, bornAt: performance.now() })
    window.setTimeout(() => {
      damageNumbers.value = damageNumbers.value.filter((d) => d.id !== id)
    }, 1000)
  }

  const clear = () => {
    hitMarkers.value = []
    damageNumbers.value = []
  }

  return {
    hitMarkers,
    damageNumbers,
    pushHitMarker,
    pushDamageNumber,
    clear,
  }
}
