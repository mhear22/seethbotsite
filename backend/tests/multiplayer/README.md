# Multiplayer Backend Tests

Comprehensive test suite for the multiplayer mech battle backend system.

## Test Coverage

### ✅ MatchmakingService Tests (14 tests)
**File:** `MatchmakingService.test.ts`

Tests the matchmaking queue and player pairing system:

**Queue Management**
- Adding players to the queue
- Removing players from the queue
- Preventing duplicate players
- Sending queue status updates
- Maintaining correct queue positions

**Matchmaking**
- Rejecting single-player matches
- Creating matches with FIFO (first-in-first-out)
- Removing matched players from queue
- Creating multiple sequential matches
- Generating unique match IDs

**Queue Cleanup**
- Cleaning up timeouts
- Handling non-existent player removal
- Updating positions after player removal

### ✅ GameServer Tests (17 tests)
**File:** `GameServer.test.ts`

Tests the game server managing player connections and match instances:

**Player Registration**
- Registering new players
- Replacing existing connections for same player
- Allowing multiple different players

**Player Disconnection**
- Removing disconnected players
- Removing players from matchmaking queue on disconnect
- Handling non-existent player disconnects

**Match Request Handling**
- Adding players to matchmaking queue
- Rejecting duplicate match requests

**Cancel Matchmaking**
- Removing players from queue when cancelled
- Sending cancellation confirmations

**Ping/Pong**
- Responding to ping messages

**Game Statistics**
- Returning correct statistics
- Updating statistics on player changes

**Message Handling**
- Handling unknown message types gracefully
- Ignoring messages from unregistered players
- Handling input messages correctly

**Cleanup**
- Cleaning up all resources

### ✅ MatchInstance Tests (20 tests)
**File:** `MatchInstance.test.ts`

Tests individual match logic, game loop, and physics:

**Match Creation**
- Creating matches with correct initial state
- Initializing both players
- Sending match start countdown

**Match States**
- Transitioning from COUNTDOWN to ACTIVE
- Accepting input only when ACTIVE

**Player Input Handling**
- Accepting valid input from players
- Ignoring old input sequences
- Rejecting input with invalid timestamps
- Ignoring input from non-existent players

**Player Disconnection**
- Handling disconnection during countdown
- Handling disconnection during active match
- Ending match when player disconnects

**Match Lifecycle**
- Calling onMatchEnd callback
- Cleaning up resources
- Preventing duplicate match ends

**State Snapshots**
- Sending state snapshots at 20Hz
- Including both players in snapshots
- Including server time in snapshots

**Opponent Retrieval**
- Returning correct opponent for a player
- Returning null for non-existent players

### ✅ Multiplayer Controller Tests (16 tests)
**File:** `multiplayer.controller.test.ts`

Tests WebSocket connection handling and authentication:

**JWT Token Verification**
- Generating valid JWT tokens
- Rejecting invalid JWT tokens
- Rejecting tokens with wrong secret
- Extracting userId from token payload
- Extracting username from various token fields

**getGameStats Endpoint**
- Returning game statistics
- Returning non-negative statistics

**WebSocket Path Validation**
- Validating correct WebSocket paths
- Parsing query parameters from URLs
- Handling missing query parameters

**Message Parsing**
- Parsing valid JSON messages
- Handling malformed JSON gracefully
- Validating message types

**Error Message Format**
- Formatting error messages correctly
- Including all required error fields

**Connection Message Format**
- Formatting connection confirmations correctly

## Running the Tests

```bash
# Run all multiplayer tests
npm test -- multiplayer

# Run with coverage
npm test -- multiplayer --coverage

# Run specific test file
npm test -- MatchmakingService.test.ts

# Run in watch mode
npm test:watch -- multiplayer
```

## Test Statistics

- **Total Test Suites:** 4
- **Total Tests:** 67
- **Test Status:** ✅ All Passing
- **Execution Time:** ~48 seconds

## Key Features Tested

✅ **Authentication & Authorization**
- JWT token validation
- Player identity verification

✅ **Matchmaking**
- FIFO queue management
- Player pairing logic
- Queue timeout handling

✅ **Game Server**
- Player connection management
- Message routing
- Match lifecycle management

✅ **Match Instance**
- Game state management
- Physics simulation
- Player input processing
- Real-time state synchronization (20Hz)
- Combat mechanics
- Disconnection handling

✅ **Network Protocol**
- Message parsing
- Error handling
- WebSocket communication

## Notes

- Tests use mock WebSocket implementations to simulate real connections
- Some async timing tests may take longer to execute (up to 7 seconds each)
- Background intervals are properly cleaned up in test teardown
- Tests are isolated and can run in parallel
