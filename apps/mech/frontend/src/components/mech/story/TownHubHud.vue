<template>
  <div class="hub-hud">
    <!-- Header: where you are, and that you are OUT of the machine -->
    <div class="hub-header">
      <span class="hub-town">{{ townName }}</span>
      <span class="hub-onfoot">ON FOOT</span>
    </div>

    <!-- §4.2 keystone made legible: on foot, the town stops bleeding condition.
         The player must SEE that stepping out is the merciful state. -->
    <div v-if="decayHeld" class="hub-chip decay-held" title="Decay is paused while you are out of the cockpit (§4.2).">
      <span class="chip-dot"></span>DECAY HELD
    </div>

    <!-- Anchor E-prompt: whatever building/NPC the pilot is standing next to. -->
    <button
      v-if="anchor"
      type="button"
      class="hub-prompt anchor"
      @click="$emit('interact')"
    >
      <span class="key">{{ interactKey }}</span>
      <span class="prompt-text">{{ anchor.verb }} {{ anchor.label }}</span>
    </button>

    <!-- Remount prompt: near the parked Frame or the town edge. -->
    <button
      v-if="canRemount"
      type="button"
      class="hub-prompt remount"
      @click="$emit('remount')"
    >
      <span class="key">{{ remountKey }}</span>
      <span class="prompt-text">{{ remountLabel }}</span>
    </button>

    <!-- Human-scale ambient line: no weapon/power readouts on foot. -->
    <p v-if="!anchor && !canRemount" class="hub-idle">{{ idleHint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AnchorKind } from '../../../lib/story/dialogueTrees'

/** An anchor within interaction range — drives the E-prompt line. */
export interface HubAnchorPrompt {
  kind: AnchorKind
  /** E-prompt verb ("talk to", "enter", "open"). */
  verb: string
  /** Anchor label ("Rooker's garage", "the warden's office"). */
  label: string
}

const props = withDefaults(
  defineProps<{
    /** Current town (the settlement the pilot dismounted in). */
    townName: string
    /** The anchor within reach, or null when in the open street. */
    anchor?: HubAnchorPrompt | null
    /** True when close enough to the parked Frame / town edge to remount. */
    canRemount?: boolean
    /** Remount prompt label. */
    remountLabel?: string
    /**
     * §4.2 keystone: while on foot the town's decay is paused. Defaults true (the
     * on-foot HUD is only shown on foot); the host can force it off for edge cases.
     */
    decayHeld?: boolean
    /** Key chip shown for anchor interaction. */
    interactKey?: string
    /** Key chip shown for remounting. */
    remountKey?: string
    /** Idle line shown when no anchor/remount prompt is active. */
    idleHint?: string
  }>(),
  {
    anchor: null,
    canRemount: false,
    remountLabel: 'Mount up',
    decayHeld: true,
    interactKey: 'E',
    remountKey: 'F',
    idleHint: 'Walk the street. Nothing here weighs on the ground but you.',
  },
)

// Keep a stable reference so template can read props without lint noise.
const anchor = computed(() => props.anchor)
</script>

<style scoped>
.hub-hud {
  position: fixed;
  bottom: 70px;
  left: 20px;
  z-index: 2200;
  width: 300px;
  padding: 14px 16px;
  border-radius: 14px;
  /* Cool, quiet glass — deliberately unlike the hot red in-mech TownHud. */
  background: rgba(15, 23, 42, 0.62);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(148, 163, 184, 0.28);
  color: #e5e7eb;
  font-size: 0.9rem;
}

.hub-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}

.hub-town {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.hub-onfoot {
  font-family: 'SFMono-Regular', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 4px;
  padding: 2px 7px;
}

/* DECAY HELD chip — the merciful state, made visible. Calm green, not alarm-red. */
.hub-chip.decay-held {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: 'SFMono-Regular', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #6ee7b7;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 6px;
  padding: 5px 9px;
  margin-bottom: 12px;
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.8);
}

.hub-prompt {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
  padding: 9px 11px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(148, 163, 184, 0.06);
  color: inherit;
  font-size: 0.88rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.hub-prompt:hover {
  background: rgba(148, 163, 184, 0.14);
  border-color: rgba(148, 163, 184, 0.5);
}

.hub-prompt.remount {
  border-color: rgba(129, 140, 248, 0.4);
}

.hub-prompt.remount:hover {
  border-color: rgba(129, 140, 248, 0.75);
}

.key {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 5px;
  border-radius: 4px;
  background: rgba(226, 232, 240, 0.14);
  color: #f1f5f9;
  font-family: 'SFMono-Regular', ui-monospace, monospace;
  font-size: 0.74rem;
  font-weight: 800;
}

.prompt-text {
  flex: 1;
  line-height: 1.3;
}

.hub-idle {
  margin: 6px 0 0;
  font-size: 0.78rem;
  font-style: italic;
  color: #94a3b8;
  line-height: 1.4;
}
</style>
