# Ranking System

Dynamic leaderboard tracking user points across activities using ELO-style ratings.

## Point Sources

- Clicker game clicks (via `POST /api/clicks/add-points`)
- Fishing high scores
- Character Tinder ELO votes

## ELO Formula

```
Expected Score = 1 / (1 + 10^((Opponent Rating - Your Rating) / 400))
New Rating = Old Rating + K × (Actual Score - Expected Score)
```

K-factor = 32. Actual Score: 1 for win, 0 for loss.

## API

```
GET /api/rankings
```

Returns: `{ rankings: [{ avatar, name, score, isCurrentUser }], timestamp }`

## Integration

The `pointsManager` service handles adding points, calculating ELO changes, and retrieving leaderboard data. Points update automatically when games complete or votes are cast.
