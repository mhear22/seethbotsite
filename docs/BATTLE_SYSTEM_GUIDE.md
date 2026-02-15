# Mech Battle System - User Guide

## Getting Started

1. Go to `/mech-builder` and complete all 6 steps (Core, Legs, Arms, Head, Rack, Review)
2. On Review, click **Sortie** (orange button) - requires Core, Legs, and Head equipped
3. Choose **Practice vs AI** or **Multiplayer Match**
4. Review your stats, click **Launch Battle**

## Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Space | Jump (requires Jump Jet Pack in Rack) |
| Mouse | Aim/camera |
| Left Click | Shoot |
| ESC | Exit |

Click the canvas first to activate pointer lock (cursor disappears).

## Combat Tips

- Stay mobile - stationary mechs are easy targets
- Jump jets provide vertical repositioning
- Higher Accuracy = tighter bullet spread
- Higher Armor = more damage reduction (cap: 90%)
- Enemy AI chases if too far, backs up if too close, strafes at ~15 units

## Score (Victory only)

Time Bonus + Damage Dealt × 2 + Remaining Health % × 500

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Sortie button disabled | Equip Core, Legs, and Head |
| Can't move/shoot | Click canvas to activate pointer lock |
| Jump jets don't work | Equip "Jump Jet Pack" in Rack slot |
| Battle won't start | Check browser console (F12); WebGL 2.0 required |

## Build Strategies

| Build | Core | Legs | Head | Rack | Style |
|-------|------|------|------|------|-------|
| Tank | FR-12 Fusion Reactor | T-90 Heavy Tracks | Reinforced Command Pod | Auto-Repair Drone | High durability, slow |
| Scout | GT-440 Gas Turbine | Graviton Hover System | Scout Sensor Suite | Jump Jet Pack | Fast, fragile |
| Sniper | C-Series Capacitor Bank | Quadrupedal Chassis | Advanced Targeting Array | Extended Ammo Feed | High damage, energy hungry |

For technical details (file structure, networking, stat formulas), see **[MECH_BATTLE_IMPLEMENTATION.md](MECH_BATTLE_IMPLEMENTATION.md)**.
