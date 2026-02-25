# Data Centre Minigame Plan

## Overview
Build a standalone minigame app inside seethbotsite at `/datacenter`, with main-site route handoff from the Games tab.

The game is a real-time 3D isometric data centre management sim where players choose one location and operate a rack hosting business.

## Confirmed Product Requirements

1. **App boundary**
- Keep as a separate app within repo (`apps/datacenter/frontend` pattern).
- Main site should link/handoff to the app.

2. **Locations**
- Player picks one location at run start: `Tech Hub`, `Suburbia`, `Country`.
- Location is locked for that run.

3. **Core loop**
- Start with `5x5` grid and small starter budget.
- Suppliers (`Zoogle`, `ASW`, `Macrohard`) always present.
- Drag racks from supplier panel to grid.
- Racks can be moved after placement to improve airflow.
- Real time pacing: `1 day = 60 seconds`.

4. **Heat model**
- Simplified heat simulation.
- Rack heat radiates to adjacent tiles (N/S/E/W adjacency baseline).
- DC cooling passively reduces heat over time.
- Overheating causes client dissatisfaction/churn.

5. **Expansion**
- Expand by adding rows/columns independently.
- Non-square growth allowed (`5x5 -> 6x5`, `5x6`, etc.).
- Hard max size is `10x10`.

6. **Community/legal pressure**
- Over-expansion/backlash can:
  - cost money to fix,
  - limit expansion,
  - reduce incoming/retained clients.
- Sensitivity is location-based (Tech Hub highest, Country lowest).

7. **Supplier/reputation economy**
- Each supplier has perpetual offer tracks.
- Installed racks grant daily cash + small daily supplier reputation.
- Higher supplier reputation unlocks better-paying rack offers.

8. **Save behavior**
- **Authenticated users:** unlimited DB save slots.
- **Guest/offline users:** playable run, but no persistent save (not stored in DB).
- Autosave for authenticated runs at end of each game day.

9. **Win/Loss conditions**
- **Win (AGI workload):**
  - Accumulate workload equivalent to **250 days of a full 5x5 grid**.
  - Baseline formula: `dailyWorkload = activeRacks / 25`.
  - Win when `totalWorkload >= 250` (while run still valid).
- **Loss conditions:**
  - Bankruptcy,
  - Legal trouble/shutdown,
  - No more clients due to temperature-related churn.

10. **Platform scope**
- Desktop-only for v1.
- No integration with existing global stats/challenges/leaderboards for now.

## Technical Architecture

### Frontend (new standalone app)
- Path: `apps/datacenter/frontend`
- Tech: Vue 3 + TS + Three.js (isometric scene)
- Base route: `/datacenter/`
- Core modules:
  - game state/composable (`useDataCenterGame`)
  - three scene/composable (`useDataCenterScene`)
  - UI panels (suppliers, upgrades, finances, heat/legal warnings)

### Main-site integration
- Add handoff routes in main frontend (same approach as mech/tickets).
- Add new Games nav item for Data Center.
- Add breadcrumb/voice-nav mapping as needed.

### Backend
- Add authenticated run save API (JWT `requireAuth`, user derived from `req.user.id`).
- Endpoints for run CRUD (list/create/load/save/delete) for authenticated users only.
- Guest mode should not call persistent save APIs.

### Database (Prisma)
- Add a `DataCenterRun` model (or similarly named) with:
  - `id`, `user_id`, `name`, `location`,
  - `state_json` (snapshot),
  - `status` (`active|won|lost|archived`),
  - `created_at`, `updated_at`, `last_played_at`.
- Relationship to `User` via foreign key.
- No save slot cap for authenticated users.

## Gameplay Systems (Implementation Notes)

1. **Day tick**
- 60s timer increments day.
- At day end:
  - apply income,
  - apply rep gains,
  - process churn/backlash/legal effects,
  - compute workload progress,
  - autosave (authenticated only).

2. **Thermal**
- Tile heat map with:
  - heat emitted by rack class,
  - adjacency spread,
  - passive cooling decay per tick.
- Client churn risk increases above threshold bands.

3. **Backlash/legal**
- Pressure score driven by rapid expansion + high utilization footprint.
- Pressure penalties: higher costs, client loss modifiers, expansion lockouts.
- Hard-fail legal condition at severe sustained pressure.

4. **Supplier progression**
- Company reputation meters.
- Offer tiers unlocked by reputation thresholds.
- Better tiers increase cash/day and/or efficiency.

## Delivery Phases

### Phase 1: App shell + integration
- Create standalone app scaffold and `/datacenter` serving/handoff.
- Desktop layout and core HUD skeleton.

### Phase 2: Playable MVP
- Grid placement/movement, day loop, income, heat, backlash, win/loss.
- Supplier and reputation tracks.

### Phase 3: Persistence
- Prisma model + migration.
- Authenticated save/load/delete endpoints.
- End-of-day autosave.
- Guest mode with non-persistent run behavior.

### Phase 4: Balancing/polish
- Tune economy/heat/legal curves.
- Improve clarity of warnings and progression pacing.
- QA for desktop gameplay flow.
