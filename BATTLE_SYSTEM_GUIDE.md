# Mech Battle System - User Guide

## Getting Started

### 1. Build Your Mech
Navigate to `/mech-builder` and complete all 6 steps:
- **Step 0**: Select Core (power source)
- **Step 1**: Select Legs (mobility type)
- **Step 2**: Select Arms (weapons)
- **Step 3**: Select Head (sensors/targeting)
- **Step 4**: Select Rack (special equipment)
- **Step 5**: Review (final stats and synergies)

### 2. Launch Into Battle
On the Review step, click the **⚔️ Sortie** button (orange button).

Requirements to unlock Sortie:
- Core, Legs, and Head must be equipped (minimum viable mech)
- No critical warnings

### 3. Pre-Battle Screen
Review your mech's combat stats:
- **Health**: Total hit points
- **Armor**: Damage reduction percentage
- **Firepower**: Base damage per shot
- **Speed**: Movement rate multiplier
- **Accuracy**: Weapon spread/precision
- **Energy**: Jump fuel capacity

Click **Launch Battle** when ready, or **Return to Builder** to make changes.

### 4. Combat Controls

**Movement**
- `W` - Move forward
- `S` - Move backward
- `A` - Strafe left
- `D` - Strafe right
- `Space` - Jump (requires Jump Jet Pack equipped in Rack slot)

**Combat**
- `Mouse` - Aim (move mouse to look around)
- `Left Click` - Shoot weapon
- `ESC` - Exit battle

**Camera**
- Mouse controls third-person camera rotation
- Camera automatically follows your mech
- Your mech faces the direction you're aiming

### 5. Battle HUD

**Top Left**: Your health bar (green)
**Top Right**: Enemy health bar (red)
**Center**: Crosshair (green dot with lines)
**Bottom Center**: Jump fuel gauge (if equipped)
**Bottom Left**: Control hints

### 6. Combat Tips

**Movement Strategy**
- Use WASD to strafe and dodge incoming projectiles
- Jump jets provide vertical mobility - use to escape or reposition
- Stay mobile - stationary mechs are easy targets

**Shooting**
- Accuracy stat affects spread - higher accuracy = tighter grouping
- Lead your shots against moving targets
- Firepower determines damage per hit

**Stats Matter**
- High armor reduces incoming damage significantly
- Speed affects both movement rate and AI pursuit
- Energy capacity determines jump duration

**Enemy AI Behavior**
- Enemy will chase you if you're too far away
- Enemy will back up if you get too close
- At optimal range (15 units), enemy will strafe and shoot
- Higher enemy accuracy = more frequent shots

### 7. Victory & Defeat

**Victory Conditions**
- Reduce enemy health to 0

**Defeat Conditions**
- Your health reaches 0
- Press ESC to forfeit

**Score Calculation** (Victory only)
- Time Bonus: Faster wins = more points
- Damage Bonus: Total damage dealt × 2
- Health Bonus: Remaining health percentage × 500

### 8. After Battle

Both victory and defeat screens show:
- Time elapsed
- Damage dealt

Click **Return to Builder** to modify your mech and try again.

## Build Strategies

### Tank Build (High Survivability)
- **Core**: FR-12 Fusion Reactor (high energy, health)
- **Legs**: T-90 Heavy Tracks (armor, stability)
- **Head**: Reinforced Command Pod (armor, health)
- **Arms**: Shield Generator + Heavy weapon
- **Rack**: Auto-Repair Drone Bay

**Pros**: Extremely durable, high damage reduction
**Cons**: Slow movement, vulnerable to mobile enemies

### Scout Build (High Mobility)
- **Core**: GT-440 Gas Turbine (speed boost)
- **Legs**: Graviton Hover System (max speed)
- **Head**: Scout Sensor Suite (range, accuracy)
- **Arms**: Dual Autocannons or Railguns
- **Rack**: Jump Jet Pack

**Pros**: Very fast, excellent evasion, jump mobility
**Cons**: Fragile, low armor

### Balanced Build
- **Core**: D9 Diesel Generator (reliable)
- **Legs**: Standard Bipedal Frame (balanced)
- **Head**: Standard Optics Package (basic sensors)
- **Arms**: Autocannon + Missile Pod
- **Rack**: Extended Ammo Feed

**Pros**: No major weaknesses, versatile
**Cons**: No particular strengths

### Sniper Build (High Damage)
- **Core**: C-Series Capacitor Bank (energy, firepower)
- **Legs**: Quadrupedal Chassis (stability)
- **Head**: Advanced Targeting Array (max accuracy)
- **Arms**: Dual Railguns
- **Rack**: Extended Ammo Feed

**Pros**: Extreme damage, excellent accuracy
**Cons**: Energy intensive, slow fire rate

## Combat Stats Explained

### Health
- Base HP pool before defeat
- Synergies can add bonus health
- No regeneration during battle (except with Repair Drone)

### Armor
- Percentage damage reduction on incoming hits
- Formula: `damage_taken = damage * (1 - armor/100)`
- Capped at 90% reduction maximum
- Example: 50% armor reduces 100 damage to 50 damage

### Firepower
- Base damage per projectile
- Formula: `projectile_damage = firepower / 10`
- Affected by weapon type multipliers
- Higher firepower = faster enemy defeat

### Accuracy
- Affects weapon spread/deviation
- Formula: `spread = (1 - accuracy/100) * 0.15`
- 100% accuracy = pinpoint precision
- Lower accuracy = wider bullet spread

### Speed
- Movement rate multiplier
- Formula: `move_speed = 8 * (speed / 100)`
- Affects both ground movement and AI behavior
- Higher speed = better dodging ability

### Energy
- Maximum jump fuel capacity
- Consumed during jump jet use
- Recharges on ground (only with Jump Jet Pack)
- Higher energy = longer/more frequent jumps

## Enemy Difficulty (Phase 1)

Currently only **Tutorial Bot** is active:
- Health: 150
- Armor: 10%
- Firepower: 25
- Accuracy: 30%
- Speed: 60

**Expected difficulty**: Easy for most builds. Use this to learn controls and test your mech.

Future phases will unlock:
- Easy: Scout Mech
- Medium: Assault Mech
- Hard: Heavy Mech
- Boss: TITAN-Class Destroyer

## Troubleshooting

**Problem**: Sortie button is disabled
**Solution**: Ensure Core, Legs, and Head are equipped

**Problem**: Can't move/shoot
**Solution**: Click on canvas to request pointer lock

**Problem**: Camera feels jerky
**Solution**: Ensure pointer lock is active (cursor should disappear)

**Problem**: Jump jets don't work
**Solution**: Equip "Jump Jet Pack" in Rack slot

**Problem**: Can't see crosshair
**Solution**: Click canvas to enter battle mode

**Problem**: Battle won't start
**Solution**: Check browser console for errors, ensure Three.js loaded

## Performance Tips

For best performance:
- Close unnecessary browser tabs
- Reduce browser zoom to 100%
- Use Chrome/Firefox/Safari (WebGL 2.0 required)
- Update graphics drivers
- Target: 60 FPS at 1080p on mid-range hardware

## Keyboard Shortcuts Summary

| Key | Action |
|-----|--------|
| W | Forward |
| S | Backward |
| A | Left |
| D | Right |
| Space | Jump |
| LMB | Shoot |
| Mouse | Aim |
| ESC | Exit |

## What's Coming in Future Phases

**Phase 2: Wave System**
- 5 waves of increasing difficulty
- Multiple enemies per wave
- Boss battle with special abilities
- Score accumulation across waves
- Final total performance summary

**Phase 3: Testing & Analytics**
- Battle simulator (automated testing)
- Combat logs with replay system
- Analytics dashboard
- Debug tools
- Balance analysis

## Feedback & Bugs

If you encounter issues or have suggestions, note:
- Build used (export code)
- Enemy difficulty
- Browser and OS
- Console errors (F12 → Console tab)
