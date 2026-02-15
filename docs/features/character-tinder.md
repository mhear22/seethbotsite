# Character Tinder

Competitive voting system where users compare two characters and vote for their favorite. Characters ranked by ELO rating.

## Mechanics

Two random characters presented → user votes → both ELO ratings updated → leaderboard recalculates.

**ELO:** K=32, starting rating 1200. Upsets gain more points; favorites gain less. Pair selection is random (not ELO-based) to avoid rating bias.

```javascript
const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400))
newWinnerElo = Math.round(winner.elo + 32 * (1 - expectedWinner))
newLoserElo  = Math.round(loser.elo  + 32 * (0 - expectedLoser))
```

## API

```
GET  /api/characters              # All characters, sorted by ELO desc
GET  /api/characters/random-pair  # Two random characters for voting
POST /api/characters/vote         # { winner_id, loser_id } → updated ratings + elo_change
POST /api/characters              # Create { name, image_url } (starts at ELO 1200)
DELETE /api/characters/:id        # Soft delete (is_deleted flag)
```

## Database Schema

```sql
CREATE TABLE characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  image_url TEXT,
  elo_rating INTEGER DEFAULT 1200,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT 0
)
```

Votes are atomic transactions (read → calculate → update both).
