<template>
  <canvas ref="canvasRef" class="battle-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw } from 'vue'
import { BattleScene } from '../../lib/battle/BattleScene'
import type { MechEntity } from '../../lib/battle/MechEntity'
import { useGameSettings } from '../../composables/useGameSettings'

const props = defineProps<{
  playerMech: MechEntity
  enemyMech: MechEntity
}>()

const emit = defineEmits<{
  (e: 'battle-end', result: 'victory' | 'defeat'): void
  (e: 'damage-dealt', amount: number): void
  (e: 'time-update', time: number): void
  (e: 'hud-update', data: {
    dashCooldown: number
    dashMaxCooldown: number
    enemyRadarX: number
    enemyRadarY: number
  }): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let battleScene: BattleScene | null = null
const gameSettings = useGameSettings()

onMounted(() => {
  if (!canvasRef.value) return

  battleScene = markRaw(new BattleScene({
    canvas: canvasRef.value,
    playerMech: props.playerMech,
    enemyMech: props.enemyMech,
    onBattleEnd: (result) => {
      emit('battle-end', result)
    },
    onDamageDealt: (amount) => {
      emit('damage-dealt', amount)
    },
    mouseSensitivity: gameSettings.settings.value.mouseSensitivity,
    movementSpeed: gameSettings.settings.value.movementSpeed,
  }))

  battleScene.start()

  // Emit time + HUD updates periodically
  const timeInterval = setInterval(() => {
    if (battleScene) {
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
        enemyRadarX: radarX,
        enemyRadarY: radarY,
      })
    }
  }, 50) // 20fps for HUD

  // Cleanup interval on unmount
  onUnmounted(() => {
    clearInterval(timeInterval)
  })
})

onUnmounted(() => {
  if (battleScene) {
    battleScene.cleanup()
    battleScene = null
  }
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
.battle-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
</style>
