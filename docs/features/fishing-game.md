# Fishing Game

Skill-based timing game. Cast, wait for bite, reel at the right time, earn points based on fish rarity and timing precision.

## Mechanics

**Game flow:** Cast → wait 2-8s → fish bites (1-3s reaction window) → reel → points awarded

**Fish rarities:** Common (1-10pts), Uncommon (11-25), Rare (26-50), Epic (51-100), Legendary (101-200), Mythical (201-500)

**Rarity weights:** Common 50%, Uncommon 25%, Rare 15%, Epic 7%, Legendary 2%, Mythical 1%

**Timing multipliers:** Perfect=1.0x, Good=0.75x, Fair=0.5x, Miss=0x

**Combo bonuses:** 2x=1.25x, 3x=1.5x, 5x=2x, 10x=3x (resets on miss)

## API

```
POST /api/stats/record      # Record fish_caught, score, session_end
POST /api/stats/highscore   # Update high score
POST /api/stats/leaderboard # Get fishing leaderboard (gameType: "fishing")
POST /api/stats/user        # Get user stats (gameType: "fishing")
```

Stats tracked: `fish_caught`, `score`, `session_end`. High scores, achievement progress, and challenge progress all update automatically on stat record.

## Daily Challenges

Catch X fish, score X points, catch X rare fish, achieve X combo streak.

## Achievements

First Catch, Master Angler (100 fish), Legendary Catch, Combo Master (10x), High Roller (500+ pts).
