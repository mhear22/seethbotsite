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

    <!-- Dash Cooldown Indicator -->
    <div class="dash-indicator">
      <div class="dash-label" :class="{ ready: dashReady }">
        {{ dashReady ? 'DASH READY' : 'DASH' }}
      </div>
      <div class="dash-bar-container">
        <div class="dash-fill" :style="{ width: dashPercent + '%' }"></div>
      </div>
    </div>

    <!-- Jump Fuel Indicator -->
    <div v-if="hasJumpJets" class="jump-fuel">
      <div class="fuel-label">JUMP FUEL</div>
      <div class="fuel-bar-container">
        <div class="fuel-fill" :style="{ width: jumpFuelPercent + '%' }"></div>
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
      <div class="control-item">LMB - Shoot</div>
      <div class="control-item">Shift - Dash</div>
      <div v-if="hasJumpJets" class="control-item">Space - Jump</div>
      <div class="control-item">ESC - Exit</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  playerHealth: number
  playerMaxHealth: number
  enemyHealth: number
  enemyMaxHealth: number
  enemyName: string
  jumpFuel: number
  hasJumpJets: boolean
  dashCooldown: number
  dashMaxCooldown: number
  enemyRadarX: number
  enemyRadarY: number
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

const dashReady = computed(() => props.dashCooldown <= 0)

const dashPercent = computed(() => {
  if (props.dashCooldown <= 0) return 100
  return Math.max(0, Math.min(100, (1 - props.dashCooldown / props.dashMaxCooldown) * 100))
})
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

/* Dash Indicator */
.dash-indicator {
  position: absolute;
  bottom: 120px;
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
