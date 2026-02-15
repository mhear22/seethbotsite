# Multiplayer Mech Battle

Full real-time 1v1 PvP multiplayer is implemented and ready for testing. See **[MECH_BATTLE_IMPLEMENTATION.md](MECH_BATTLE_IMPLEMENTATION.md)** for full architecture, file structure, and networking details.

## Status

All 4 phases complete:
1. Basic networking (WebSocket server, matchmaking, FIFO queue)
2. Client-side prediction + server reconciliation
3. Server-authoritative combat (hit detection, damage, victory conditions)
4. Polish (latency HUD, disconnect handling, results screen)

## Testing Multiplayer

1. Start backend and frontend dev servers
2. Open two browser windows, log in as different users
3. Navigate to Mech Builder → build a mech → Sortie → select "Multiplayer Match"
4. Both windows should match within ~5 seconds and enter a 3-second countdown

**Expected behavior:** Local player moves instantly (client prediction), opponent moves smoothly (state interpolation at 20Hz). Disconnect handled gracefully with forfeit.

## Production Deployment Checklist

- [ ] `SEETHBOT_JWT_SECRET` set (WebSocket auth reuses JWT)
- [ ] WebSocket proxy configured in Nginx for `/ws/multiplayer`
- [ ] Rate limiting configured for WebSocket connections
- [ ] Test with production-level latency (50-150ms)
- [ ] HTTPS/WSS enabled
