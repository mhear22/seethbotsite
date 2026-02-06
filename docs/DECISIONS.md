# App Decisions Log

This document records all major architectural and design decisions made during the development of seethbotsite.

**Purpose:** Before working on any feature, read this document to understand the context and decisions that led to the current implementation.

---

## Table of Contents

1. [Architecture & Tech Stack](#architecture--tech-stack)
2. [Authentication & Authorization](#authentication--authorization)
3. [Database & Data Storage](#database--data-storage)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Features & Game Systems](#features--game-systems)
7. [Deployment & Infrastructure](#deployment--infrastructure)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Performance & Optimization](#performance--optimization)
10. [Security Decisions](#security-decisions)

---

## Architecture & Tech Stack

### Decision 1: Vue 3 + TypeScript + Vite (2026-01-30)
**Context:** Project originally built with vanilla JavaScript, then migrated to Vue 3 CDN-based, finally to Vite build system.

**Decision:** Use Vue 3 Composition API with TypeScript and Vite for the frontend build system.

**Reasoning:**
- TypeScript provides type safety and catches errors at compile time
- Vite offers fast HMR (Hot Module Replacement) and optimized production builds
- Vue 3 Composition API provides cleaner, more composable code than Options API
- Pinia for state management (simpler and more TypeScript-friendly than Vuex)

**Trade-offs:**
- Initial setup complexity vs. long-term maintainability
- Requires compilation step vs. CDN-based approach
- Larger dependency footprint

**Impact:** All frontend components now use `<script setup>` pattern with TypeScript types. State managed through Pinia Setup Stores.

### Decision 2: Express.js + TypeScript for Backend (2026-01-30)
**Context:** Needed a backend API for movie voting, stock market, and user data.

**Decision:** Use Express.js with TypeScript for the backend API server.

**Reasoning:**
- Express is battle-tested and widely used
- TypeScript provides type safety for API endpoints
- Easy to integrate with SQLite for data persistence
- Simple middleware system for auth, rate limiting, etc.

**Trade-offs:**
- More verbose than newer frameworks (Fastify, NestJS)
- Less built-in structure (but flexibility is valuable)

**Impact:** All backend code lives in `backend/src/` with TypeScript compilation to `backend/dist/`.

### Decision 3: SQLite for All Data Storage (2026-02-01)
**Context:** Needed persistent storage for users, movies, stocks, game stats, etc.

**Decision:** Use SQLite as the primary database for all data.

**Reasoning:**
- Zero configuration - file-based database
- No separate database server needed
- Easy to backup and migrate (single file)
- Sufficient performance for this application scale
- TypeScript bindings available via `better-sqlite3`

**Trade-offs:**
- Not suitable for high-concurrency write scenarios
- Limited to single-machine deployment
- No built-in replication

**Impact:** All data stored in `.db` files:
- `backend/data/users.db` - User accounts, sessions
- `backend/data/stocks.db` - Stock market data
- `backend/data/game_stats.db` - Game stats, achievements, daily challenges

### Decision 4: Multi-Stage Docker Build (2026-02-01)
**Context:** Need a standardized deployment process with both frontend and backend.

**Decision:** Use Docker multi-stage builds to package the application.

**Reasoning:**
- Clean separation between build and runtime environments
- Smaller final image (no build dependencies)
- Reproducible builds across environments
- Easy deployment with a single container

**Trade-offs:**
- Requires Docker knowledge for deployment
- Build time vs. deployment convenience

**Impact:** `Dockerfile` uses 3 stages:
1. Build frontend (Vite)
2. Build backend (TypeScript)
3. Production image (Nginx + Node.js)

---

## Authentication & Authorization

### Decision 5: Dual Authentication System (2026-02-04)
**Context:** Need both user authentication (for end users) and API key authentication (for admins/integrations).

**Decision:** Implement TWO optional authentication systems that coexist:
1. User Authentication: Username/password with JWT tokens
2. API Key Authentication: Simple API key for admins

**Reasoning:**
- Users should be able to use the site without logging in (auth is optional)
- User auth provides account management, cross-device sessions
- API key auth is simpler for admins and integrations
- Separation of concerns - users don't need API keys, admins don't need user accounts

**Trade-offs:**
- Increased complexity with two auth systems
- More endpoints to maintain

**Impact:**
- User endpoints: `/api/auth/*` (register, login, logout, sessions)
- API key endpoints: All protected endpoints accept `X-API-Key` or `Authorization: Bearer`
- Both auth systems are optional - GET endpoints remain public

### Decision 6: JWT with 30-Day Expiry (2026-02-04)
**Context:** User authentication needs to persist across sessions without constant re-login.

**Decision:** Use JWT (JSON Web Tokens) with a 30-day expiry for user sessions.

**Reasoning:**
- Stateless - no session storage required on server
- Easy to pass in Authorization header
- 30 days balances security vs. convenience
- Cross-device support via multiple tokens per user

**Trade-offs:**
- Tokens can't be easily revoked before expiry (without server-side tracking)
- Requires secure storage on client (localStorage vs. httpOnly cookies)

**Impact:**
- JWT secret configurable via `SEETHBOT_JWT_SECRET` environment variable
- Sessions table tracks device info for cross-device management
- Password change invalidates all sessions

### Decision 7: bcrypt with 10 Salt Rounds (2026-02-04)
**Context:** User passwords must be securely hashed.

**Decision:** Use bcrypt with 10 salt rounds for password hashing.

**Reasoning:**
- bcrypt is slow (by design) to prevent brute-force attacks
- 10 rounds provides good balance between security and performance
- Industry-standard for password hashing

**Trade-offs:**
- Slower than other algorithms (but that's intentional for security)

**Impact:** All user passwords hashed with bcrypt before storage in SQLite.

### Decision 8: Cross-Device Session Management (2026-02-04)
**Context:** Users may login from multiple devices (desktop, mobile, etc.).

**Decision:** Implement session management that tracks each device separately.

**Reasoning:**
- Users can see all active sessions
- Can logout from specific devices
- Device metadata helps identify sessions

**Trade-offs:**
- Requires additional database table and endpoints
- More complex logout flow

**Impact:**
- Sessions table: `user_id, device_name, device_type, created_at, last_used_at`
- Endpoints: GET `/api/auth/sessions`, DELETE `/api/auth/sessions/:id`, DELETE `/api/auth/sessions/all`

---

## Database & Data Storage

### Decision 9: Separate Database Files by Domain (2026-02-01)
**Context:** Multiple data domains (users, games, stocks) need persistent storage.

**Decision:** Use separate SQLite database files for each domain.

**Reasoning:**
- Clear separation of concerns
- Easier to backup/migrate specific data
- Smaller files are easier to manage
- Can optimize each database independently

**Trade-offs:**
- Cannot perform cross-database queries or transactions
- More connection management code

**Impact:**
- `backend/data/users.db` - Users, sessions
- `backend/data/stocks.db` - Stocks, portfolios, transactions
- `backend/data/game_stats.db` - Stats, achievements, daily challenges

### Decision 10: Auto-Increment Integer IDs (2026-02-01)
**Context:** Need unique identifiers for database records.

**Decision:** Use auto-incrementing integers for primary keys.

**Reasoning:**
- Simple and fast
- SQLite's default behavior
- Human-readable (easier for debugging)

**Trade-offs:**
- Not suitable for distributed systems (IDs can collide)
- Predictable (can expose record count)

**Impact:** All tables use `INTEGER PRIMARY KEY AUTOINCREMENT` for IDs.

### Decision 11: String User IDs for Stats (2026-02-01)
**Context:** Game stats need to track users by identifier.

**Decision:** Use string user IDs (e.g., 'cam', 'orlando', 'mika') instead of numeric IDs.

**Reasoning:**
- User-friendly names that match display names
- No need to join with users table
- Simpler for frontend to work with

**Trade-offs:**
- Less efficient than integer foreign keys
- No referential integrity enforcement

**Impact:** Game stats use `user_id TEXT` as foreign key (not enforced).

---

## Frontend Architecture

### Decision 12: Vue Router for Navigation (2026-01-30)
**Context:** Need multi-page navigation in SPA.

**Decision:** Use Vue Router for client-side routing.

**Reasoning:**
- Standard Vue.js routing solution
- Deep linking support
- Route guards for protected pages
- Easy to add new routes

**Trade-offs:**
- Initial setup complexity
- Requires route configuration

**Impact:** Routes defined in `frontend/router/index.ts`:
- `/`, `/girl`, `/gender`, `/about`, `/rankings`, `/cats`, `/stocks`, `/movies`, `/challenges`, `/stats`, `/clicker`, `/fishing`, `/idle`

### Decision 13: Pinia Setup Stores Pattern (2026-01-30)
**Context:** Need centralized state management.

**Decision:** Use Pinia with Setup Store pattern (not Options Store).

**Reasoning:**
- Similar to Vue Composition API (more intuitive)
- Better TypeScript support
- Cleaner syntax with `ref()` and `computed()`
- Composable and easier to test

**Trade-offs:**
- Slightly different from Vuex (migration learning curve)

**Impact:** All stores use `defineStore('name', () => { ... })` pattern in `frontend/stores/`.

### Decision 14: Composables Pattern for Reusable Logic (2026-01-30)
**Context:** Logic needed across multiple components (audio, cat images, rankings).

**Decision:** Extract reusable logic into composables.

**Reasoning:**
- DRY principle - avoid code duplication
- Easier to test isolated logic
- Composable and flexible

**Trade-offs:**
- Need to design good APIs for composables
- More files to manage

**Impact:** Composables in `frontend/composables/`:
- `useAudio.ts` - Audio playback logic
- `useCat.ts` - Cat API integration
- `useRankings.ts` - Rankings data fetching
- `usePanels.ts` - Panel state management

### Decision 15: Repository Pattern for API Calls (2026-02-04)
**Context:** Need consistent way to call backend APIs from frontend.

**Decision:** Use repository pattern with openapi-fetch for type-safe API calls.

**Reasoning:**
- Type-safe API calls (generated from OpenAPI schema)
- Centralized API logic
- Easier to mock for testing
- Consistent error handling

**Trade-offs:**
- Requires OpenAPI spec maintenance
- More boilerplate than direct fetch calls

**Impact:** Repositories in `frontend/repositories/`:
- `auth.repository.ts` - Auth API calls
- `achievements.repository.ts` - Achievements API calls
- `challenges.repository.ts` - Challenges API calls
- `stats.repository.ts` - Stats API calls

### Decision 16: Component-Based UI (2026-01-30)
**Context:** Build a modular, maintainable UI.

**Decision:** Use Single File Components (.vue) with scoped styles.

**Reasoning:**
- Scoped styles prevent conflicts
- Self-contained components (HTML, JS, CSS in one file)
- Hot Module Replacement support
- Easy to understand and modify

**Trade-offs:**
- More files than monolithic approach
- Vue-specific syntax (learning curve)

**Impact:** All UI components in `frontend/components/` organized by:
- `pages/` - Route-level components
- `shared/` - Reusable components

---

## Backend Architecture

### Decision 17: RESTful API Design (2026-02-01)
**Context:** Need to design a consistent API interface.

**Decision:** Use RESTful conventions for API endpoints.

**Reasoning:**
- Industry standard
- Predictable endpoint structure
- Easy to document with OpenAPI
- Works well with HTTP caching

**Trade-offs:**
- Not suitable for all use cases (e.g., real-time updates)
- May require multiple requests for complex queries

**Impact:** API follows REST conventions:
- GET for retrieving data
- POST for creating data
- PATCH for partial updates
- DELETE for deletion
- Resource-based URLs: `/api/movies`, `/api/stats/:userId`

### Decision 18: Middleware-Based Architecture (2026-02-01)
**Context:** Need to add cross-cutting concerns (auth, rate limiting, logging).

**Decision:** Use Express middleware for cross-cutting concerns.

**Reasoning:**
- Express's core pattern
- Easy to compose middleware chain
- Separation of concerns
- Reusable middleware

**Trade-offs:**
- Middleware order matters (can cause bugs)
- More complex to debug

**Impact:** Middleware stack in `backend/src/index.ts`:
1. JSON body parser
2. URL-encoded parser
3. Request logging
4. CORS
5. Rate limiting
6. API key authentication (optional)
7. Error handler

### Decision 19: Controller-Based Route Organization (2026-02-01)
**Context:** Need to organize API routes logically.

**Decision:** Use controllers to group related routes.

**Reasoning:**
- Logical grouping by feature/domain
- Easier to find and modify routes
- Testable (can test controllers in isolation)

**Trade-offs:**
- More files than monolithic approach
- Requires routing setup

**Impact:** Controllers in `backend/src/controllers/`:
- `auth.controller.ts` - Auth endpoints
- `movies.controller.ts` - Movie voting
- `stats.controller.ts` - Game stats
- `challenges.controller.ts` - Daily challenges
- `achievements.controller.ts` - Achievements

### Decision 20: In-Memory State for Real-Time Features (2026-02-01)
**Context:** Stock market prices need to fluctuate in real-time.

**Decision:** Use in-memory state for frequently changing data (stock prices).

**Reasoning:**
- Fast access (no database query overhead)
- Simple to implement
- Persists to database when needed (transactions)

**Trade-offs:**
- Lost on server restart
- Not scalable across multiple servers

**Impact:**
- Stock prices stored in `StockPriceManager` (in-memory)
- Transactions persisted to SQLite
- Stock prices reset on restart (acceptable for this use case)

---

## Features & Game Systems

### Decision 21: Optional User Accounts (2026-02-04)
**Context:** Should users be required to create accounts?

**Decision:** User authentication is completely optional - all features work without login.

**Reasoning:**
- Low barrier to entry for new users
- Can try the site without commitment
- Users can create accounts later if they want
- Simplest UX for casual visitors

**Trade-offs:**
- Anonymous users can't persist data across devices
- Limited personalization for anonymous users

**Impact:**
- All GET endpoints are public
- User-specific endpoints work with anonymous IDs (localStorage)
- Login is optional, not required

### Decision 22: Daily Challenges System (2026-02-05)
**Context:** Want to keep users engaged with rotating daily goals.

**Decision:** Implement daily challenges that reset each day.

**Reasoning:**
- Encourages daily engagement
- Adds gamification element
- Simple concept but effective

**Trade-offs:**
- Requires date-based logic
- Challenge generation complexity

**Impact:**
- Challenges generated per user per day (YYYY-MM-DD)
- 3 random challenges from templates
- Progress updates automatically when games played
- Database: `daily_challenges` table

### Decision 23: Achievement System (2026-02-05)
**Context:** Want to reward users for milestones.

**Decision:** Implement achievement system with automatic checking.

**Reasoning:**
- Gamification increases engagement
- Goals give users something to strive for
- Visual progress and rewards

**Trade-offs:**
- Need to define achievement templates
- Complexity in achievement checking logic

**Impact:**
- 13 achievement templates defined (clicker, fishing, score, special)
- Achievements checked automatically when stats recorded
- Database: `achievements` table
- UI shows unlocked vs. locked achievements

### Decision 24: Idle Game Mechanics (2026-02-05)
**Context:** Want passive progression in clicker game.

**Decision:** Implement idle clicker with point transfer to rankings.

**Reasoning:**
- Adds depth beyond just clicking
- Encourages users to return to collect points
- Integrates with rankings system

**Trade-offs:**
- Requires point transfer logic
- Backend complexity (sync idle clicks to rankings)

**Impact:**
- Idle clicker tracks clicks locally
- Points can be transferred to any user in rankings
- Backend endpoint: `POST /api/clicks/add-points`
- Integration with rankings system

### Decision 25: Movie Voting System (2026-01-30)
**Context:** Need a system for friends to vote on movies for movie night.

**Decision:** Implement preferential voting system (ranked choice).

**Reasoning:**
- Fairer than simple majority voting
- Handles multiple movies
- Clear results visualization

**Trade-offs:**
- More complex than simple voting
- Requires voting rounds management

**Impact:**
- Movies can be suggested and voted on
- Preferential voting (rank movies 1-3)
- Results calculated with Condorcet-like method
- Start/end voting rounds for control

### Decision 26: Stock Market Simulation (2026-01-30)
**Context:** Want a fun stock trading game.

**Decision:** Implement stock market simulation with fake money.

**Reasoning:**
- Educational and fun
- Simple database schema
- Price fluctuations create engagement

**Trade-offs:**
- Not real stock data (simulated)
- Limited educational value without real data

**Impact:**
- 6 stocks with fluctuating prices
- Users start with $10,000
- Buy/sell functionality
- Portfolio tracking
- Price updates every 30 seconds

---

## Deployment & Infrastructure

### Decision 27: Docker for Production Deployment (2026-02-01)
**Context:** Need a reliable, reproducible deployment process.

**Decision:** Use Docker containers for production deployment.

**Reasoning:**
- Reproducible builds
- Isolation from host system
- Easy rollback (can deploy previous image)
- Standard deployment process

**Trade-offs:**
- Requires Docker knowledge
- Larger image size vs. bare metal

**Impact:**
- Single container runs Nginx + Node.js
- Frontend served from `/app/frontend/dist/`
- Backend API proxied from `/api/*`
- Deploy script: `./deploy.sh`

### Decision 28: Nginx as Reverse Proxy (2026-02-01)
**Context:** Need to serve static files and proxy API requests.

**Decision:** Use Nginx as reverse proxy for the application.

**Reasoning:**
- Efficient static file serving
- Built-in reverse proxy
- Production-ready and battle-tested
- Simple configuration

**Trade-offs:**
- Another component to manage (vs. serving from Node.js)
- Limited Node.js customization

**Impact:**
- Nginx serves frontend static files
- Nginx proxies `/api/*` to Express backend on port 3010
- Single entry point on port 8081

### Decision 29: Automated Build Notifications (2026-02-05)
**Context:** Want visibility into deployment status.

**Decision:** Integrate Discord webhook for build notifications.

**Reasoning:**
- Immediate feedback on build status
- Team awareness of deployments
- Easy to monitor build failures

**Trade-offs:**
- Requires Discord webhook setup
- Additional integration point

**Impact:**
- Deploy script sends notifications for: build started, completed, failed
- Notifications include build number, branch, git hash
- Configured via `DISCORD_WEBHOOK_URL` environment variable

### Decision 30: Git-Based Deployment (2026-02-01)
**Context:** Need a simple way to deploy code changes.

**Decision:** Use `./push-and-deploy.sh` script that pushes to GitHub and deploys to Docker.

**Reasoning:**
- Single command deployment
- Git history tracks changes
- GitHub backup of code
- Simple workflow

**Trade-offs:**
- Requires GitHub access
- Two-step process (git push + Docker deploy)

**Impact:**
- Push to GitHub: `GIT_TERMINAL_PROMPT=0 git push origin main`
- Deploy to Docker: `./deploy.sh`
- Combined: `./push-and-deploy.sh`

---

## Testing & Quality Assurance

### Decision 31: JavaScript Test Scripts (2026-02-05)
**Context:** Need to test API endpoints and features.

**Decision:** Use standalone JavaScript test scripts for API testing.

**Reasoning:**
- Simple to write and run
- No test framework overhead
- Easy to debug (can run directly with Node.js)
- Sufficient for API testing

**Trade-offs:**
- No test runner or reporting
- Less structured than proper test framework
- No built-in assertions (use console.log)

**Impact:**
- Test scripts in project root (e.g., `test-daily-challenges.js`)
- Run with: `node test-daily-challenges.js`
- Manual test verification

### Decision 32: Manual Testing Checklists (2026-02-01)
**Context:** Need to ensure all features work before deployment.

**Decision:** Use manual testing checklists in AGENTS.md.

**Reasoning:**
- Simple and low-overhead
- Covers all user-facing features
- No test framework needed

**Trade-offs:**
- Manual effort each deployment
- No automated regression testing
- Human error possible

**Impact:**
- Testing checklist in AGENTS.md
- Items include: routes, audio, dark mode, games, etc.
- Must complete checklist before deployment

---

## Performance & Optimization

### Decision 33: CSS Animations Over JS (2026-01-29)
**Context:** Need smooth animations (floating hearts, spring bounce).

**Decision:** Use CSS animations instead of JavaScript for UI animations.

**Reasoning:**
- GPU accelerated (faster)
- Smoother performance
- Less CPU overhead
- Simpler code

**Trade-offs:**
- Less dynamic than JS animations
- Can't easily modify animation at runtime

**Impact:**
- Floating hearts: CSS keyframe animation
- Spring bounce: Multi-keyframe CSS animation
- Only DOM manipulation is creating/removing elements

### Decision 34: Code Splitting with Vite (2026-01-30)
**Context:** Need to optimize frontend bundle size.

**Decision:** Rely on Vite's built-in code splitting.

**Reasoning:**
- Automatic code splitting by route
- Lazy loading reduces initial bundle
- Tree-shaking removes unused code
- Zero-config optimization

**Trade-offs:**
- More HTTP requests (but smaller chunks)
- No manual control over split points

**Impact:**
- Vite automatically splits code by route
- Initial load only includes necessary code
- Subsequent routes load on-demand

### Decision 35: Rate Limiting (2026-02-04)
**Context:** Need to prevent API abuse and DDoS attacks.

**Decision:** Implement rate limiting: 100 requests per minute per IP.

**Reasoning:**
- Prevents abuse and spam
- Protects against simple DDoS
- Headers inform client of limits
- In-memory storage (sufficient for this scale)

**Trade-offs:**
- May inconvenience legitimate users
- In-memory storage lost on restart
- Doesn't prevent all attacks

**Impact:**
- All requests rate limited (100 req/min per IP)
- Rate limit headers included in responses
- 429 response with retry-after on limit exceeded

---

## Security Decisions

### Decision 36: Input Validation & Sanitization (2026-02-04)
**Context:** Need to prevent XSS and injection attacks.

**Decision:** Validate and sanitize all user inputs.

**Reasoning:**
- Prevents XSS attacks (HTML injection)
- Prevents SQL injection (parameterized queries)
- Length limits prevent DoS
- Character validation rejects malicious input

**Trade-offs:**
- More code for validation
- Can reject valid input if too strict

**Impact:**
- String sanitization: HTML tags stripped, special characters escaped
- Length limits: titles (200), names (100), etc.
- Type validation: numbers, arrays, etc.
- Validation error responses with details

### Decision 37: Security Headers (2026-02-04)
**Context:** Need to protect against common web vulnerabilities.

**Decision:** Add security headers to all responses.

**Reasoning:**
- X-Content-Type-Options: Prevents MIME sniffing
- X-Frame-Options: Prevents clickjacking
- X-XSS-Protection: Enables browser XSS filter

**Trade-offs:**
- May break some embedded use cases
- Requires careful configuration

**Impact:**
- Headers added via Express middleware
- Applied to all API responses

### Decision 38: API Keys for Admin Operations (2026-02-01)
**Context:** Need to protect destructive operations (add/delete movies, modify stocks).

**Decision:** Require API key authentication for write operations.

**Reasoning:**
- Simple authentication for admin tasks
- No need for user accounts for admins
- Easy to rotate keys
- Separate from user authentication

**Trade-offs:**
- Key management complexity
- No user attribution (all admins share keys)

**Impact:**
- Protected endpoints: POST / DELETE / PATCH (excluding user auth)
- API key via `X-API-Key` or `Authorization: Bearer` header
- Default key generated on startup (dev only)

### Decision 39: Public Read Endpoints (2026-02-04)
**Context:** Should read operations require authentication?

**Decision:** All GET endpoints are publicly accessible (no auth required).

**Reasoning:**
- Lower barrier to entry
- Simpler for anonymous users
- Read operations are safe (no data modification)
- Rankings, movies, stocks are public anyway

**Trade-offs:**
- Can't rate limit by user (only IP)
- Can't track anonymous usage
- No personalized read endpoints

**Impact:**
- All GET endpoints are public
- Rate limiting by IP address
- Anonymous users can access all data

### Decision 40: Environment Variables for Secrets (2026-02-04)
**Context:** Need to store sensitive configuration (JWT secret, API keys).

**Decision:** Use environment variables for secrets, never commit to git.

**Reasoning:**
- Secrets not in git (security best practice)
- Different values per environment (dev vs prod)
- Easy to rotate without code changes
- Standard practice for 12-factor apps

**Trade-offs:**
- Requires environment setup for deployment
- Can be tricky to debug if not set

**Impact:**
- `SEETHBOT_JWT_SECRET` - JWT token secret (REQUIRED in prod)
- `SEETHBOT_JWT_EXPIRY` - Token expiry (default: 30d)
- `SEETHBOT_API_KEYS` - Comma-separated admin keys
- `DISCORD_WEBHOOK_URL` - Discord webhook for notifications

---

## Summary

This document captures the major architectural and design decisions for seethbotsite. When working on a new feature or modification:

1. **READ THIS DOCUMENT FIRST** - Understand the context and decisions
2. Check if your change aligns with existing decisions
3. If a decision needs to change, document it here with reasoning
4. Update this document when new decisions are made

**Key Principles:**
- Keep it simple (avoid over-engineering)
- User experience first (optional auth, low barrier to entry)
- Type safety (TypeScript everywhere)
- Automated deployment (Docker, deploy scripts)
- Security best practices (input validation, rate limiting, secrets management)

---

*Last Updated: 2026-02-05*
*Version: 1.0*
