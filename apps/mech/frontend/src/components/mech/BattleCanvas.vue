<template>
  <div class="battle-canvas-wrapper">
    <canvas ref="canvasRef" class="battle-canvas"></canvas>
    <div v-if="showFPS" class="fps-counter">{{ fps }} FPS</div>
    <!-- On-screen controls (touch devices only; self-gates). -->
    <TouchControls :input="touchInput" context="battle" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, markRaw, watch } from 'vue'
import { BattleScene } from '../../lib/battle/BattleScene'
import type { MechEntity } from '../../lib/battle/MechEntity'
import type { InputManager } from '../../lib/battle/InputManager'
import { useGameSettings } from '../../composables/useGameSettings'
import { useBattleEffects } from '../../composables/useBattleEffects'
import TouchControls from './TouchControls.vue'

import type { AIDifficulty } from '../../composables/useGameSettings'

const props = defineProps<{
  playerMech: MechEntity
  enemyMech: MechEntity
  mapId?: string
  aiDifficulty?: AIDifficulty
}>()

const emit = defineEmits<{
  (e: 'battle-end', result: 'victory' | 'defeat'): void
  (e: 'damage-dealt', amount: number): void
  (e: 'time-update', time: number): void
  (e: 'hud-update', data: {
    dashCooldown: number
    dashMaxCooldown: number
    playerPower: number
    playerMaxPower: number
    abilityCooldown: number
    abilityMaxCooldown: number
    enemyRadarX: number
    enemyRadarY: number
    targeting: {
      isTargeted: boolean
      screenX: number
      screenY: number
      screenWidth: number
      screenHeight: number
    }
  }): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let battleScene: BattleScene | null = null
const touchInput = ref<InputManager | null>(null)
const gameSettings = useGameSettings()
const battleEffects = useBattleEffects()
const fps = ref(0)
const showFPS = computed(() => gameSettings.settings.value.graphics.showFPS)

onMounted(() => {
  if (!canvasRef.value) return

  battleScene = markRaw(new BattleScene({
    canvas: canvasRef.value,
    playerMech: props.playerMech,
    enemyMech: props.enemyMech,
    mapId: props.mapId,
    aiDifficulty: props.aiDifficulty ?? gameSettings.settings.value.aiDifficulty,
    onBattleEnd: (result) => {
      emit('battle-end', result)
    },
    onDamageDealt: (amount) => {
      emit('damage-dealt', amount)
    },
    onPlayerHitConfirm: ({ kill }) => {
      battleEffects.pushHitMarker(kill)
    },
    onPlayerDamageNumber: ({ amount, crit, screenX, screenY }) => {
      battleEffects.pushDamageNumber(amount, crit, screenX, screenY)
    },
    mouseSensitivity: gameSettings.settings.value.mouseSensitivity,
    movementSpeed: gameSettings.settings.value.movementSpeed,
    invertMouseX: gameSettings.settings.value.invertMouseX,
    invertMouseY: gameSettings.settings.value.invertMouseY,
    keyBindings: gameSettings.settings.value.keyBindings,
    graphics: gameSettings.settings.value.graphics,
  }))

  battleScene.start()
  touchInput.value = battleScene.getInputManager()

  // Survival waves swap in a fresh enemy without remounting (which would dispose
  // the persistent player mech). When the enemyMech prop identity changes, hand
  // the new enemy to the running scene.
  watch(() => props.enemyMech, (newEnemy, oldEnemy) => {
    if (battleScene && newEnemy && newEnemy !== oldEnemy) {
      battleScene.respawnEnemy(newEnemy, props.aiDifficulty ?? gameSettings.settings.value.aiDifficulty)
    }
  })

  // Emit time + HUD updates periodically
  const timeInterval = setInterval(() => {
    if (battleScene) {
      fps.value = battleScene.getFPS()
      emit('time-update', battleScene.getBattleTime())

      // Compute radar-relative enemy position rotated by player yaw
      const playerPos = battleScene.getPlayerPosition()
      const enemyPos = battleScene.getEnemyPosition()
      const yaw = battleScene.getPlayerYaw()

      const dx = enemyPos.x - playerPos.x
      const dz = enemyPos.z - playerPos.z
      // Normalize to arena scale (50 units -> -1..1)
      const nx = dx / 25
      const nz = dz / 25

      // Rotate by negative player yaw so "up" on radar = player forward
      const cosY = Math.cos(-yaw)
      const sinY = Math.sin(-yaw)
      const radarX = nx * cosY - nz * sinY
      const radarY = -(nx * sinY + nz * cosY) // Negate so forward = up in CSS

      emit('hud-update', {
        dashCooldown: battleScene.getPlayerDashCooldown(),
        dashMaxCooldown: battleScene.getPlayerDashMaxCooldown(),
        playerPower: battleScene.getPlayerPower(),
        playerMaxPower: battleScene.getPlayerMaxPower(),
        abilityCooldown: battleScene.getPlayerAbilityCooldown(),
        abilityMaxCooldown: battleScene.getPlayerAbilityMaxCooldown(),
        enemyRadarX: radarX,
        enemyRadarY: radarY,
        targeting: battleScene.getTargetingState()
      })
    }
  }, 50) // 20fps for HUD

  // Cleanup interval on unmount
  onUnmounted(() => {
    clearInterval(timeInterval)
  })
})

onUnmounted(() => {
  touchInput.value = null
  if (battleScene) {
    battleScene.cleanup()
    battleScene = null
  }
  // Drop any leftover hit markers / damage numbers so they don't bleed into a
  // subsequent battle.
  battleEffects.clear()
})

// ESC key to exit
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('battle-end', 'defeat')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.battle-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.battle-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.fps-counter {
  position: absolute;
  /* Below the enemy health bar block so the readout never overlaps it. */
  top: 72px;
  right: 12px;
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 6px rgba(0, 255, 136, 0.6);
  pointer-events: none;
  user-select: none;
  z-index: 10;
}
</style>
