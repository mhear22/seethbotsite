<template>
  <div class="multiplayer-battle-wrapper">
    <canvas ref="canvasRef" class="battle-canvas"></canvas>

    <!-- Multiplayer HUD -->
    <MultiplayerHUD
      :connection-status="connectionStatus"
      :latency="latency"
      :match-time="matchTime"
      :opponent-name="opponentName"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw } from 'vue'
import { MultiplayerBattleScene } from '../../lib/battle/MultiplayerBattleScene'
import type { MechEntity } from '../../lib/battle/MechEntity'
import { useGameSettings } from '../../composables/useGameSettings'
import MultiplayerHUD from './MultiplayerHUD.vue'
import type { MatchFoundMessage, MatchEndMessage } from '@shared/types/NetworkMessages'

const props = defineProps<{
  playerMech: MechEntity
  opponentMech: MechEntity
  matchData: MatchFoundMessage
  authToken: string
}>()

const emit = defineEmits<{
  (e: 'battle-end', data: MatchEndMessage): void
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
  (e: 'opponent-disconnected'): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let battleScene: MultiplayerBattleScene | null = null
const gameSettings = useGameSettings()

// Multiplayer state
const connectionStatus = ref<'connected' | 'connecting' | 'disconnected' | 'error'>('connecting')
const latency = ref(0)
const matchTime = ref(0)
const opponentName = ref(props.matchData.opponentName)

let hudUpdateInterval: NodeJS.Timeout | null = null

onMounted(() => {
  if (!canvasRef.value) return

  console.log('[MultiplayerBattleCanvas] Initializing multiplayer battle scene...')

  battleScene = markRaw(new MultiplayerBattleScene({
    canvas: canvasRef.value,
    playerMech: props.playerMech,
    opponentMech: props.opponentMech,
    onBattleEnd: (result) => {
      console.log('[MultiplayerBattleCanvas] Battle ended:', result)
      // This is handled by network events
    },
    onDamageDealt: (amount) => {
      emit('damage-dealt', amount)
    },
    mouseSensitivity: gameSettings.settings.value.mouseSensitivity,
    movementSpeed: gameSettings.settings.value.movementSpeed,
    invertMouseX: gameSettings.settings.value.invertMouseX,
    invertMouseY: gameSettings.settings.value.invertMouseY,
    keyBindings: gameSettings.settings.value.keyBindings,
    authToken: props.authToken,
    matchId: props.matchData.matchId,
    yourPlayerId: props.matchData.yourPlayerId,
    opponentId: props.matchData.opponentId,
    opponentLoadout: props.matchData.opponentLoadout
  } as ConstructorParameters<typeof MultiplayerBattleScene>[0]))

  // Setup network event listeners
  const networkManager = battleScene.getNetworkManager()
  if (networkManager) {
    networkManager.on('connected', () => {
      console.log('[MultiplayerBattleCanvas] Connected to server')
      connectionStatus.value = 'connected'
    })

    networkManager.on('disconnected', () => {
      console.log('[MultiplayerBattleCanvas] Disconnected from server')
      connectionStatus.value = 'disconnected'
    })

    networkManager.on('latency_update', (data: { rtt: number }) => {
      latency.value = data.rtt
    })

    networkManager.on('match_end', (data: MatchEndMessage) => {
      console.log('[MultiplayerBattleCanvas] Match end received:', data)
      emit('battle-end', data)
    })

    networkManager.on('opponent_disconnected', () => {
      console.log('[MultiplayerBattleCanvas] Opponent disconnected')
      emit('opponent-disconnected')
    })
  }

  battleScene.start()

  // Emit time + HUD updates periodically
  hudUpdateInterval = setInterval(() => {
    if (battleScene) {
      matchTime.value = battleScene.getBattleTime()
      emit('time-update', matchTime.value)

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
})

onUnmounted(() => {
  if (hudUpdateInterval) {
    clearInterval(hudUpdateInterval)
  }
  if (battleScene) {
    battleScene.cleanup()
    battleScene = null
  }
})
</script>

<style scoped>
.multiplayer-battle-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.battle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: none;
}
</style>
