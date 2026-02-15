# Clicker Game

Shared click counter that persists across sessions. Clicks can be converted to ranking points.

## Mechanics

- Global counter incremented per click (all users share it)
- 1 click = 1 point (configurable)
- Manual reset returns counter to 0 (earned points remain in rankings)
- Supports daily challenges and achievements

## API

```
GET  /api/clicks              → { count, timestamp }
POST /api/clicks/increment    → { count, timestamp }
POST /api/clicks/reset        → { count: 0, timestamp }
POST /api/clicks/add-points   → { userId, clicks } → { success, points, message }
```

## Stats Integration

Stats recorded via `POST /api/stats/record` with `gameType: "clicker"` and `statType: "click"` / `"score"` / `"session_end"`.

High scores tracked per user. Achievements and daily challenges check automatically on stat record.
