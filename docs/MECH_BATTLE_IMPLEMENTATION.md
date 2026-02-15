# Mech Battle System - Implementation Summary

Implemented 2026-02-08. Adds a 3D combat arena to the Mech Builder.

## Architecture

**Route:** `/mech-battle` (linked from Mech Builder Review step via "Sortie" button)

### Frontend Files (`/frontend/`)

```
lib/battle/
├── InputManager.ts          # WASD + mouse input, pointer lock
├── MechEntity.ts            # Mech 3D representation, stats, damage
├── ProjectileSystem.ts      # Bullet/missile physics, collision, cleanup
├── PhysicsSystem.ts         # Movement, jump jets, arena bounds, AI state machine
├── CameraController.ts      # Third-person follow camera with lerp
├── BattleScene.ts           # Three.js scene, lighting, animation loop
├── NetworkManager.ts        # WebSocket client (multiplayer)
├── ClientPrediction.ts      # Input buffer, server reconciliation
├── StateInterpolation.ts    # Opponent position smoothing (100ms buffer)
└── MultiplayerBattleScene.ts # Network-aware scene extension

composables/
└── useMechBattle.ts         # Battle phase state, enemy generation, scoring

components/mech/
├── BattleHUD.vue            # Health bars, crosshair, jump fuel, controls hint
├── BattleCanvas.vue         # Three.js renderer lifecycle wrapper
├── MatchmakingView.vue      # Queue status UI
├── MultiplayerHUD.vue       # Latency indicator, match timer, opponent name
└── MultiplayerResultsScreen.vue # Win/loss stats comparison

components/pages/
└── MechBattlePage.vue       # Mode selection, loading, ready, active, results screens
```

### Backend Files (`/backend/src/`)

```
controllers/multiplayer.controller.ts  # WebSocket handler, JWT auth
services/
├── MatchmakingService.ts    # FIFO queue, 2-min timeout
├── MatchInstance.ts         # Match state, 20Hz tick loop
└── GameServer.ts            # Multi-match orchestration
game/
├── MechEntity.ts            # Server-side mech (health, cooldowns)
└── ProjectileSystem.ts      # Server-side hit detection
```

### Shared Types (`/backend/src/shared/` and `/frontend/shared/`)

`NetworkMessages.ts`, `GameConstants.ts`, map definitions (must stay in sync - see `SHARED_FILES_SYNC.md`)

## Combat Stats

| Stat | Effect |
|------|--------|
| Health | HP pool |
| Armor | Damage reduction % (capped at 90%) |
| Firepower | Damage per projectile (`firepower / 10`) |
| Accuracy | Weapon spread (`(1 - accuracy/100) * 0.15`) |
| Speed | Movement rate (`8 * speed/100`) |
| Energy | Jump fuel capacity |

## Enemy Presets

| Name | HP | Armor | Speed | Firepower | Accuracy |
|------|----|-------|-------|-----------|----------|
| Tutorial Bot | 150 | 10% | 60 | 25 | 30% |
| Scout Mech | 200 | 15% | 80 | 30 | 40% |
| Assault Mech | 300 | 25% | 70 | 45 | 50% |
| Heavy Mech | 400 | 35% | 60 | 60 | 60% |
| TITAN Destroyer | 600 | 45% | 70 | 80 | 70% |

Only Tutorial Bot active in Phase 1.

## Multiplayer Networking

- WebSocket endpoint: `/ws/multiplayer` (JWT authenticated)
- Server tick: 20Hz (state snapshots)
- Client input rate: ~60Hz
- Bandwidth: ~13 KB/s per player
- Client prediction masks up to ~150ms latency
- State interpolation with 100ms buffer for opponent smoothing

```
NETWORK constants (GameConstants.ts):
SERVER_TICK_RATE: 20, SNAPSHOT_INTERVAL: 50ms,
INTERPOLATION_BUFFER: 100ms, MAX_QUEUE_TIME: 120000ms
```

## Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Space | Jump (requires Jump Jet Pack in Rack slot) |
| Mouse | Aim/camera |
| Left Click | Fire right weapon |
| Right Click | Fire left weapon (multiplayer) |
| E | Use ability |
| ESC | Exit battle |

## Known Limitations (Phase 1)

- Single enemy only (no waves yet)
- Box placeholder models (no detailed meshes)
- No sound effects or particle effects
- Desktop only (no touch controls)
