# Ranking System

## Overview

The ranking system is a dynamic leaderboard that tracks user points across various activities in the system. It uses ELO-style rating calculations and supports multiple point-earning activities.

## How It Works

### Point Categories

Users earn points through various activities tracked by the system:

- **Clicker Game**: Points earned from clicker activity
- **Other Activities**: Additional point-earning activities as configured

### ELO Rating Mechanics

The system uses an ELO-style rating system for competitive features:

#### Base Formula
```
Expected Score = 1 / (1 + 10^((Opponent Rating - Your Rating) / 400))
```

#### K-Factor
The K-factor determines how much ratings change:
- **K = 32**: Standard rating changes for new ratings
- Higher K = More volatile ratings
- Lower K = More stable ratings

#### Rating Update
```
New Rating = Old Rating + K × (Actual Score - Expected Score)
```

Where:
- **Actual Score** = 1 for win, 0 for loss
- **Expected Score** = Calculated from the formula above

### Voting Mechanics

In competitive voting features (like Character Tinder):

1. Two items are presented for comparison
2. User votes for the preferred item
3. Both items' ELO ratings are updated:
   - Winner gains points (more if they were underdog)
   - Loser loses points (more if they were favorite)
4. Ratings converge toward true skill/skill perception over time

## API Endpoints

### Get Leaderboard
```
GET /api/rankings
```

Returns the current leaderboard with:
- User avatars
- User names
- Current scores
- Whether the user is the current user
- Timestamp of the data

**Response Example:**
```json
{
  "rankings": [
    {
      "avatar": "🥔",
      "name": "Cam",
      "score": 10000,
      "isCurrentUser": false
    },
    {
      "avatar": "🎮",
      "name": "Player2",
      "score": 8500,
      "isCurrentUser": true
    }
  ],
  "timestamp": "2024-02-08T12:00:00.000Z"
}
```

## Integration with Games

The ranking system integrates with games like:

- **Clicker Game**: Points earned from clicking can be added to rankings
- **Fishing Game**: High scores contribute to ranking
- **Character Tinder**: ELO ratings determine character rankings

## Technical Implementation

### Points Manager

The `pointsManager` service handles:
- Adding points to users
- Calculating rating changes
- Retrieving leaderboard data
- Tracking point history

### Database

Points are stored and managed through the points management system, with automatic updates when:
- Users complete game sessions
- Users earn achievements
- Votes are cast in competitive features

## Use Cases

1. **Leaderboard Display**: Show top users by points
2. **Progress Tracking**: Track user improvement over time
3. **Competition**: Encourage friendly competition among users
4. **Achievement Unlocking**: Points can trigger achievements or rewards

## Related Features

- [Clicker Game](./clicker-game.md) - Earn points through clicking
- [Fishing Game](./fishing-game.md) - Earn points through fishing
- [Character Tinder](./character-tinder.md) - Competitive voting with ELO ratings
