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

  // Emit time updates periodically
  const timeInterval = setInterval(() => {
    if (battleScene) {
      emit('time-update', battleScene.getBattleTime())
    }
  }, 100)

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
