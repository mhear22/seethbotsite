<template>
  <div class="battle-hud">
    <!-- Player Health Bar -->
    <div class="health-bar player">
      <div class="bar-label">Your Mech</div>
      <div class="bar-container">
        <div class="bar-fill player-fill" :style="{ width: playerHealthPercent + '%' }"></div>
        <div class="bar-text">{{ Math.round(playerHealth) }} / {{ Math.round(playerMaxHealth) }}</div>
      </div>
    </div>

    <!-- Survival wave + score banner -->
    <div v-if="battleMode === 'survival'" class="survival-banner">
      <div class="survival-wave">WAVE {{ wave }}</div>
      <div class="survival-score">SCORE {{ score }}</div>
      <div v-if="bestWave > 0" class="survival-best">BEST WAVE {{ bestWave }}</div>
    </div>

    <!-- Enemy Health Bar -->
    <div class="health-bar enemy">
      <div class="bar-label">{{ enemyName }}</div>
      <div class="bar-container">
        <div class="bar-fill enemy-fill" :style="{ width: enemyHealthPercent + '%' }"></div>
        <div class="bar-text">{{ Math.round(enemyHealth) }} / {{ Math.round(enemyMaxHealth) }}</div>
      </div>
    </div>

    <!-- Crosshair -->
    <div class="crosshair">
      <div class="crosshair-dot"></div>
      <div class="crosshair-line horizontal"></div>
      <div class="crosshair-line vertical"></div>
    </div>

    <!-- Hit markers (brief expanding crosshair on a confirmed player hit) -->
    <div
      v-for="marker in hitMarkers"
      :key="marker.id"
      class="hit-marker"
      :class="{ kill: marker.kill }"
    >
      <span class="hit-marker-line tl"></span>
      <span class="hit-marker-line tr"></span>
      <span class="hit-marker-line bl"></span>
      <span class="hit-marker-line br"></span>
    </div>

    <!-- Floating damage numbers -->
    <div
      v-for="dmg in damageNumbers"
      :key="dmg.id"
      class="damage-number"
      :class="{ crit: dmg.crit }"
      :style="damageNumberStyle(dmg)"
    >
      {{ Math.round(dmg.amount) }}{{ dmg.crit ? '!' : '' }}
    </div>

    <!-- Targeting Box -->
    <div v-if="targeting.isTargeted" class="targeting-box" :style="targetingStyle">
      <div class="targeting-corner tl"></div>
      <div class="targeting-corner tr"></div>
      <div class="targeting-corner bl"></div>
      <div class="targeting-corner br"></div>
      <div class="targeting-label">ENEMY LOCKED</div>
    </div>

    <!-- Dash Cooldown Indicator -->
    <div class="dash-indicator">
      <div class="dash-label" :class="{ ready: dashReady, 'ready-flash': dashReadyFlash }">
        {{ dashReady ? 'DASH READY' : 'DASH' }}
      </div>
      <div class="dash-bar-container">
        <div class="dash-fill" :class="{ 'ready-flash': dashReadyFlash }" :style="{ width: dashPercent + '%' }"></div>
      </div>
    </div>

    <!-- Power Bar -->
    <div class="power-bar">
      <div class="power-label" :class="{ low: playerPowerPercent < 30 }">POWER</div>
      <div class="power-bar-container">
        <div class="power-fill" :style="{ width: playerPowerPercent + '%' }"></div>
        <div class="power-text">{{ Math.floor(playerPower) }}/{{ playerMaxPower }}</div>
      </div>
    </div>

    <!-- Jump Fuel Indicator -->
    <div v-if="hasJumpJets" class="jump-fuel">
      <div class="fuel-label">JUMP FUEL</div>
      <div class="fuel-bar-container">
        <div class="fuel-fill" :style="{ width: jumpFuelPercent + '%' }"></div>
      </div>
    </div>

    <!-- Ability Cooldown Indicator -->
    <div v-if="hasRackAbility" class="ability-indicator">
      <div class="ability-label" :class="{ ready: abilityReady, 'ready-flash': abilityReadyFlash }">
        {{ abilityReady ? abilityName + ' READY' : abilityName }}
      </div>
      <div class="ability-bar-container">
        <div class="ability-fill" :class="{ 'ready-flash': abilityReadyFlash }" :style="{ width: abilityPercent + '%' }"></div>
      </div>
    </div>

    <!-- Minimap / Radar -->
    <div class="radar">
      <div class="radar-ring"></div>
      <div class="radar-ring radar-ring-inner"></div>
      <div class="radar-crosshair-h"></div>
      <div class="radar-crosshair-v"></div>
      <div class="radar-player"></div>
      <div class="radar-enemy" :style="radarEnemyStyle"></div>
    </div>

    <!-- Control Hints -->
    <div class="controls-hint">
      <div class="control-item">WASD - Move</div>
      <div class="control-item">Mouse - Aim</div>
      <div class="control-item">LMB - Right Arm</div>
      <div class="control-item">RMB - Left Arm</div>
      <div class="control-item">Shift - Dash</div>
      <div v-if="showSpaceJump" class="control-item">Space - Jump</div>
      <div v-if="hasRackAbility" class="control-item">E - Ability</div>
      <div class="control-item">ESC - Exit</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBattleEffects, type DamageNumberEvent } from '../../../composables/useBattleEffects'

const props = defineProps<{
  playerHealth: number
  playerMaxHealth: number
  enemyHealth: number
  enemyMaxHealth: number
  enemyName: string
  playerPower: number
  playerMaxPower: number
  jumpFuel: number
  hasJumpJets: boolean
  dashCooldown: number
  dashMaxCooldown: number
  abilityCooldown: number
  abilityMaxCooldown: number
  hasRackAbility: boolean
  abilityName: string
  /**
   * Leg locomotion type. When provided, Space-Jump is shown for every type
   * except 'tracked'. Optional so existing call sites keep working; falls back
   * to hasJumpJets when omitted.
   */
  legMobilityType?: 'bipedal' | 'quadrupedal' | 'hover' | 'tracked'
  enemyRadarX: number
  enemyRadarY: number
  targeting: {
    isTargeted: boolean
    screenX: number
    screenY: number
    screenWidth: number
    screenHeight: number
  }
  /** Battle mode — 'survival' surfaces the wave/score banner. */
  battleMode?: 'duel' | 'survival'
  /** Current survival wave (1-based). */
  wave?: number
  /** Running survival score. */
  score?: number
  /** Best survival wave reached (persisted). */
  bestWave?: number
}>()

const playerHealthPercent = computed(() => {
  return Math.max(0, Math.min(100, (props.playerHealth / props.playerMaxHealth) * 100))
})

const enemyHealthPercent = computed(() => {
  return Math.max(0, Math.min(100, (props.enemyHealth / props.enemyMaxHealth) * 100))
})

const jumpFuelPercent = computed(() => {
  if (!props.hasJumpJets) return 0
  const maxFuel = 100 // Normalized to 100
  return Math.max(0, Math.min(100, (props.jumpFuel / maxFuel) * 100))
})

const radarEnemyStyle = computed(() => {
  // enemyRadarX/Y are relative positions in -1..1 range, already rotated by player yaw
  const radarRadius = 50 // half of radar size in px
  const x = props.enemyRadarX * radarRadius
  const y = props.enemyRadarY * radarRadius
  // Clamp to circle
  const dist = Math.sqrt(x * x + y * y)
  const maxDist = radarRadius - 4
  const scale = dist > maxDist ? maxDist / dist : 1
  return {
    transform: `translate(${x * scale}px, ${y * scale}px)`,
  }
})

const targetingStyle = computed(() => {
  const padding = 10 // Extra space around mech
  return {
    left: `${props.targeting.screenX - props.targeting.screenWidth / 2 - padding}px`,
    top: `${props.targeting.screenY - props.targeting.screenHeight / 2 - padding}px`,
    width: `${props.targeting.screenWidth + padding * 2}px`,
    height: `${props.targeting.screenHeight + padding * 2}px`,
  }
})

const dashReady = computed(() => props.dashCooldown <= 0)

const dashPercent = computed(() => {
  if (props.dashCooldown <= 0) return 100
  return Math.max(0, Math.min(100, (1 - props.dashCooldown / props.dashMaxCooldown) * 100))
})

const playerPowerPercent = computed(() => {
  return Math.max(0, Math.min(100, (props.playerPower / props.playerMaxPower) * 100))
})

const abilityReady = computed(() => props.abilityCooldown <= 0)

const abilityPercent = computed(() => {
  if (!props.hasRackAbility || props.abilityCooldown <= 0) return 100
  return Math.max(0, Math.min(100, (1 - props.abilityCooldown / props.abilityMaxCooldown) * 100))
})

// Show Space-Jump for every leg type except tracked. When legMobilityType isn't
// provided by the parent, fall back to the legacy hasJumpJets behaviour.
const showSpaceJump = computed(() => {
  if (props.legMobilityType !== undefined) return props.legMobilityType !== 'tracked'
  return props.hasJumpJets
})

// Brief ready-flash pulse when dash / ability come off cooldown.
const dashReadyFlash = ref(false)
const abilityReadyFlash = ref(false)
let dashFlashTimer: number | undefined
let abilityFlashTimer: number | undefined

watch(dashReady, (now, was) => {
  if (now && !was) {
    dashReadyFlash.value = true
    window.clearTimeout(dashFlashTimer)
    dashFlashTimer = window.setTimeout(() => { dashReadyFlash.value = false }, 700)
  }
})

watch(abilityReady, (now, was) => {
  if (now && !was && props.hasRackAbility) {
    abilityReadyFlash.value = true
    window.clearTimeout(abilityFlashTimer)
    abilityFlashTimer = window.setTimeout(() => { abilityReadyFlash.value = false }, 700)
  }
})

// Transient combat feedback shared from BattleCanvas via the battle-effects channel.
const { hitMarkers, damageNumbers } = useBattleEffects()

const damageNumberStyle = (dmg: DamageNumberEvent) => {
  // Scale font by damage (clamped); crits handled via the .crit class.
  const fontSize = Math.min(42, 16 + dmg.amount * 0.8)
  return {
    left: `${dmg.screenX}px`,
    top: `${dmg.screenY}px`,
    fontSize: `${fontSize}px`,
  }
}
</script>

<style scoped>
.battle-hud {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
  font-family: 'Courier New', monospace;
}

/* Health Bars */
.health-bar {
  position: absolute;
  width: 400px;
  pointer-events: none;
}

.health-bar.player {
  top: 20px;
  left: 20px;
}

.health-bar.enemy {
  top: 20px;
  right: 20px;
}

.bar-label {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
}

.bar-container {
  position: relative;
  width: 100%;
  height: 30px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.bar-fill.player-fill {
  background: linear-gradient(90deg, #10b981, #34d399);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.bar-fill.enemy-fill {
  background: linear-gradient(90deg, #ef4444, #f87171);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.bar-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.9);
}

/* Survival Banner */
.survival-banner {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 22px;
  align-items: baseline;
  padding: 8px 22px;
  background: rgba(0, 0, 0, 0.55);
  border: 2px solid rgba(245, 158, 11, 0.5);
  border-radius: 8px;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
  pointer-events: none;
}

.survival-wave {
  color: #fbbf24;
  font-size: 22px;
  font-weight: bold;
  text-shadow: 0 0 12px rgba(245, 158, 11, 0.8);
  letter-spacing: 0.05em;
}

.survival-score {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.9);
}

.survival-best {
  color: #9ca3af;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.9);
}

/* Crosshair */
.crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
}

.crosshair-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: #00ff00;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff00;
}

.crosshair-line {
  position: absolute;
  background: #00ff00;
  box-shadow: 0 0 5px #00ff00;
}

.crosshair-line.horizontal {
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  transform: translateY(-50%);
}

.crosshair-line.vertical {
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  transform: translateX(-50%);
}

/* Targeting Box */
.targeting-box {
  position: absolute;
  pointer-events: none;
  transition: all 0.1s ease-out;
}

.targeting-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
}

.targeting-corner.tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.targeting-corner.tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.targeting-corner.bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.targeting-corner.br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.targeting-label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  color: #ef4444;
  font-size: 11px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.8);
  white-space: nowrap;
  animation: pulse 1s infinite;
}

/* Power Bar */
.power-bar {
  position: absolute;
  bottom: 160px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
}

.power-label {
  color: #60a5fa;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  text-align: center;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.8);
  transition: color 0.2s;
}

.power-label.low {
  color: #ff4444;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.8);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.power-bar-container {
  position: relative;
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(96, 165, 250, 0.5);
  border-radius: 4px;
  overflow: hidden;
}

.power-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #60a5fa);
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
  transition: width 0.2s ease;
}

.power-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 11px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.9);
}

/* Jump Fuel */
.jump-fuel {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
}

.fuel-label {
  color: #00ff00;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  text-align: center;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
}

.fuel-bar-container {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(0, 255, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
}

.fuel-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  transition: width 0.2s ease;
}

/* Ability Indicator */
.ability-indicator {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
}

.ability-label {
  color: #888;
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 4px;
  text-align: center;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  transition: color 0.2s;
}

.ability-label.ready {
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
}

.ability-bar-container {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
  transition: width 0.1s linear;
}

/* Dash Indicator */
.dash-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
}

.dash-label {
  color: #888;
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 4px;
  text-align: center;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  transition: color 0.2s;
}

.dash-label.ready {
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
}

.dash-bar-container {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.dash-fill {
  height: 100%;
  background: linear-gradient(90deg, #0891b2, #00ffff);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
  transition: width 0.1s linear;
}

/* Radar / Minimap */
.radar {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(0, 10, 20, 0.7);
  border: 2px solid rgba(0, 255, 255, 0.4);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 1px solid rgba(0, 255, 255, 0.15);
}

.radar-ring-inner {
  width: 40px;
  height: 40px;
}

.radar-crosshair-h,
.radar-crosshair-v {
  position: absolute;
  background: rgba(0, 255, 255, 0.1);
}

.radar-crosshair-h {
  width: 100%;
  height: 1px;
  top: 50%;
}

.radar-crosshair-v {
  width: 1px;
  height: 100%;
  left: 50%;
}

.radar-player {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 6px #3b82f6;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.radar-enemy {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 6px #ef4444;
  top: 50%;
  left: 50%;
  /* transform is set dynamically */
}

/* Control Hints */
.controls-hint {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.6);
  padding: 15px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.control-item {
  color: #e5e7eb;
  font-size: 13px;
  margin: 5px 0;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
}

.control-item:first-child {
  margin-top: 0;
}

.control-item:last-child {
  margin-bottom: 0;
}

/* Hit Markers */
.hit-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: hit-marker-pop 0.4s ease-out forwards;
}

.hit-marker-line {
  position: absolute;
  width: 9px;
  height: 9px;
  border-color: #ffffff;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

.hit-marker.kill .hit-marker-line {
  border-color: #ff3b3b;
  box-shadow: 0 0 8px rgba(255, 59, 59, 0.9);
}

.hit-marker-line.tl { top: 0; left: 0; border-top: 2px solid; border-left: 2px solid; }
.hit-marker-line.tr { top: 0; right: 0; border-top: 2px solid; border-right: 2px solid; }
.hit-marker-line.bl { bottom: 0; left: 0; border-bottom: 2px solid; border-left: 2px solid; }
.hit-marker-line.br { bottom: 0; right: 0; border-bottom: 2px solid; border-right: 2px solid; }

@keyframes hit-marker-pop {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  60% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
}

/* Floating Damage Numbers */
.damage-number {
  position: absolute;
  transform: translate(-50%, -50%);
  color: #ffe08a;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 180, 0, 0.6);
  pointer-events: none;
  animation: damage-float 1s ease-out forwards;
}

.damage-number.crit {
  color: #ff5555;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.9), 0 0 14px rgba(255, 60, 60, 0.85);
}

@keyframes damage-float {
  0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
  15% { transform: translate(-50%, -60%) scale(1.1); opacity: 1; }
  100% { transform: translate(-50%, -160%) scale(1); opacity: 0; }
}

/* Ready-flash pulse for dash / ability coming off cooldown */
.ready-flash {
  animation: ready-flash-pulse 0.7s ease-out;
}

@keyframes ready-flash-pulse {
  0% { filter: brightness(2.5); box-shadow: 0 0 16px currentColor; }
  100% { filter: brightness(1); box-shadow: none; }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .health-bar {
    width: 250px;
  }

  .health-bar.player {
    top: 10px;
    left: 10px;
  }

  .health-bar.enemy {
    top: 10px;
    right: 10px;
  }

  .controls-hint {
    bottom: 10px;
    left: 10px;
    padding: 10px;
  }

  .control-item {
    font-size: 11px;
  }
}
</style>
