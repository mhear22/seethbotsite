# Ticket #154: Idle Page Point Transfer Fix - COMPLETE

## Summary

Fixed the idle page point transfer functionality that was not working when users clicked on the idle clicker.

## Problem

The idle clicker was tracking clicks locally and attempting to transfer points to selected users via the rankings dropdown, but the point transfers were failing silently. The issue was a mismatch between the user data structure used by the frontend and backend.

## Root Cause

1. The frontend was sending `name` (userName) to the backend's `/api/clicks/add-points` endpoint
2. The backend's `pointsManager.addBulkPoints()` method expected `userId` to look up users in the internal Map
3. The userPoints Map keys are userIds (e.g., 'cam', 'orlando'), but the frontend was sending names (e.g., 'Cam', 'Orlando')
4. When the userId wasn't found in the Map, it would fall back to the 'others' category, and points weren't being awarded correctly

## Changes Made

### Backend (`backend/src/services/points-manager.ts`)

Updated the `getAllUsers()` method to include `userId` in the rankings response:

```typescript
getAllUsers() {
  this.applyDecay();
  return Array.from(this.userPoints.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, 50)
    .map((user, index) => ({
      userId: user.userId,        // <-- ADDED
      avatar: user.avatar,
      name: user.userName,
      score: user.points,
      isCurrentUser: user.isCurrentUser
    }));
}
```

### Frontend (`frontend/components/pages/ClickerPage.vue`)

1. Updated the rankings type definition to include `userId`:

```typescript
const rankings = ref<Array<{ userId: string; avatar: string; name: string; score: number; isCurrentUser?: boolean }>>([])
```

2. Updated the dropdown template to use `userId` as the value:

```vue
<option v-for="user in rankings" :key="user.userId" :value="user.userId">
  {{ user.avatar }} {{ user.name }} ({{ formatNumber(user.score) }} pts)
</option>
```

3. Updated the `loadRankings()` function to set `userId` as the default target:

```typescript
const currentUser = rankings.value.find(r => r.isCurrentUser)
if (currentUser) {
  selectedTargetUser.value = currentUser.userId  // <-- Changed from currentUser.name
}
```

4. Updated the `syncClicksToPoints()` function to display the user name (not userId) in success messages:

```typescript
// Get user name for display message
const targetUser = rankings.value.find(r => r.userId === selectedTargetUser.value)
const userName = targetUser ? targetUser.name : selectedTargetUser.value
showTransferMessage(`✅ Transferred ${result.points || unsyncedClicks.value} points to ${userName}`)
```

## Testing

### Backend Testing

1. Verified the rankings endpoint now returns `userId`:
   ```bash
   curl http://localhost:8081/api/rankings
   ```
   Response now includes `userId` field for each user.

2. Tested point transfer with userId:
   ```bash
   curl -X POST http://localhost:8081/api/clicks/add-points \
     -H "Content-Type: application/json" \
     -d '{"userId":"cam","clicks":15}'
   ```
   Response: `{"success":true,"points":15,"message":"+15 points from 15 idle clicks"}`

3. Verified the user's score was updated (increased from 10000 to 10015).

### Frontend Testing

1. Frontend loads correctly at http://localhost:8081 (HTTP 200)
2. Idle clicker page is accessible
3. Rankings dropdown displays users correctly
4. Point transfers now work end-to-end when users click the mushroom

## Deployment

- Build #137 (2026-02-05T13:42:55.987Z)
- Deployed via Docker container restart
- Both frontend and backend rebuilt and deployed successfully

## Status

✅ **COMPLETED** - The idle page point transfer is now working correctly. Users can click the idle clicker, select a target user from the dropdown, and their points will be transferred to that user's ranking score.
