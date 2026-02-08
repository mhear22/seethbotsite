# Character Tinder

## Overview

Character Tinder is a competitive voting system where users compare two characters and vote for their favorite. Characters are ranked using an ELO rating system, creating a dynamic leaderboard based on community preferences.

## Core Mechanics

### Voting Process

1. **Pair Selection**: Two random characters are presented
2. **User Votes**: User selects their preferred character
3. **ELO Update**: Both characters' ratings are updated
4. **Leaderboard Update**: Rankings are recalculated

### ELO Rating System

Character Tinder uses the same ELO rating system as the ranking system:

#### Base Formula
```
Expected Score = 1 / (1 + 10^((Opponent Rating - Your Rating) / 400))
```

#### K-Factor
- **K = 32**: Standard for new ratings
- Higher K-factors create more volatile ratings
- Lower K-factors create more stable rankings

#### Rating Calculation

For a vote between Character A (winner) and Character B (loser):

```javascript
// Expected scores
expectedA = 1 / (1 + 10^((RatingB - RatingA) / 400))
expectedB = 1 / (1 + 10^((RatingA - RatingB) / 400))

// New ratings
newRatingA = RatingA + K × (1 - expectedA)
newRatingB = RatingB + K × (0 - expectedB)
```

### Rating Dynamics

- **Upsets**: When a lower-rated character wins, they gain more points
- **Favorites**: When a higher-rated character wins, they gain fewer points
- **Convergence**: Over time, ratings converge toward true preferences
- **Variance**: New characters have more volatile ratings initially

## Character Management

### Creating Characters

Characters can be created with:
- **Name**: Required, unique identifier
- **Image URL**: Optional, for visual representation
- **Initial ELO**: Starts at 1200
- **Stats**: Wins and losses tracked automatically

**Request:**
```json
POST /api/characters
{
  "name": "Character Name",
  "image_url": "https://example.com/image.png"
}
```

**Response:**
```json
{
  "character": {
    "id": 1,
    "name": "Character Name",
    "image_url": "https://example.com/image.png",
    "elo_rating": 1200,
    "wins": 0,
    "losses": 0,
    "created_at": "2024-02-08T12:00:00.000Z",
    "updated_at": "2024-02-08T12:00:00.000Z"
  }
}
```

### Soft Deletes

Characters are soft-deleted:
- `is_deleted` flag set to true
- Not shown in random pairs
- Not shown in leaderboards
- Historical data preserved

## API Endpoints

### Get All Characters
```
GET /api/characters
```

Returns all characters sorted by ELO rating (highest first).

**Response:**
```json
{
  "characters": [
    {
      "id": 1,
      "name": "Character A",
      "image_url": "https://example.com/a.png",
      "elo_rating": 1350,
      "wins": 25,
      "losses": 10,
      "created_at": "2024-02-01T12:00:00.000Z",
      "updated_at": "2024-02-08T12:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Character B",
      "image_url": "https://example.com/b.png",
      "elo_rating": 1250,
      "wins": 18,
      "losses": 15,
      "created_at": "2024-02-02T12:00:00.000Z",
      "updated_at": "2024-02-08T12:00:00.000Z"
    }
  ]
}
```

### Get Random Pair
```
GET /api/characters/random-pair
```

Returns two random distinct characters for voting.

**Response:**
```json
{
  "characters": [
    {
      "id": 1,
      "name": "Character A",
      "image_url": "https://example.com/a.png",
      "elo_rating": 1350,
      "wins": 25,
      "losses": 10
    },
    {
      "id": 5,
      "name": "Character E",
      "image_url": "https://example.com/e.png",
      "elo_rating": 1100,
      "wins": 8,
      "losses": 20
    }
  ]
}
```

### Submit Vote
```
POST /api/characters/vote
```

Submits a vote and updates ELO ratings.

**Request Body:**
```json
{
  "winner_id": 1,
  "loser_id": 5
}
```

**Response:**
```json
{
  "winner": {
    "id": 1,
    "name": "Character A",
    "image_url": "https://example.com/a.png",
    "elo_rating": 1362,
    "wins": 26,
    "losses": 10,
    "updated_at": "2024-02-08T12:01:00.000Z"
  },
  "loser": {
    "id": 5,
    "name": "Character E",
    "image_url": "https://example.com/e.png",
    "elo_rating": 1088,
    "wins": 8,
    "losses": 21,
    "updated_at": "2024-02-08T12:01:00.000Z"
  },
  "elo_change_winner": 12,
  "elo_change_loser": -12
}
```

### Delete Character
```
DELETE /api/characters/:id
```

Soft-deletes a character.

**Response:**
```json
{
  "message": "Character deleted successfully"
}
```

## Leaderboard

### Automatic Sorting

The leaderboard automatically sorts characters by:
1. **ELO Rating** (primary, descending)
2. **Win Rate** (secondary, for tie-breaking)
3. **Total Votes** (tertiary, for tie-breaking)

### Leaderboard Display

```json
GET /api/characters
// Returns characters sorted by ELO rating
```

## Statistics

### Character Stats

Each character tracks:
- **ELO Rating**: Current skill rating (starts at 1200)
- **Wins**: Number of votes won
- **Losses**: Number of votes lost
- **Win Rate**: Wins / (Wins + Losses)
- **Total Votes**: Wins + Losses

### Example Stats

```javascript
{
  elo_rating: 1350,
  wins: 25,
  losses: 10,
  win_rate: 0.714, // 71.4%
  total_votes: 35
}
```

## Voting Strategy

### Fair Pair Selection

To ensure fair comparisons:
- Random pair selection (not based on ELO)
- Avoids rating bias in pairings
- Allows characters to compete against varied opponents

### Rating Convergence

Over many votes:
- Characters settle into appropriate ratings
- Consistent favorites rise to top
- Consistent underdogs settle at bottom
- Mid-tier characters cluster around 1200

## Database Schema

### Characters Table

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

## Use Cases

1. **Community Voting**: Let the community rank characters
2. **Preference Discovery**: Discover which characters are most popular
3. **Competitive Rankings**: Create dynamic leaderboards
4. **Fun Engagement**: Simple, addictive voting game
5. **Data Collection**: Gather preference data for analytics

## Technical Details

### Transaction Safety

Votes are processed as transactions:
- Read current ratings
- Calculate new ratings
- Update both characters
- All operations atomic

### Random Pair Algorithm

```javascript
// Get all character IDs
const allIds = db.prepare('SELECT id FROM characters WHERE is_deleted = 0').all();

// Shuffle and pick two distinct IDs
const shuffled = allIds.sort(() => Math.random() - 0.5);
const pairIds = [shuffled[0].id, shuffled[1].id];
```

### ELO Calculation

```javascript
const K = 32;
const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo_rating - winner.elo_rating) / 400));
const expectedLoser = 1 / (1 + Math.pow(10, (winner.elo_rating - loser.elo_rating) / 400));

const newWinnerElo = Math.round(winner.elo_rating + K * (1 - expectedWinner));
const newLoserElo = Math.round(loser.elo_rating + K * (0 - expectedLoser));
```

## Related Features

- [Ranking System](./ranking-system.md) - Shared ELO mechanics
- [Stats System](./fishing-game.md#stats-integration) - Shared stats tracking
- [Ticket System](./ticket-system.md) - Vote history could be tracked as tickets

## Future Enhancements

Potential additions:
- **Category filtering**: Vote within specific character categories
- **Recent votes**: Show recent vote history
- **Trending**: Show characters with recent rating gains
- **Match history**: View head-to-head records
- **Voter profiles**: Track individual voting patterns
