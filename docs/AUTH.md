# Authentication & Authorization Guide

This document describes the authentication and authorization systems in seethbotsite.

## Overview

Seethbotsite implements **TWO** independent authentication systems:

1. **User Authentication** (Optional) - For end users to create accounts and sync data across devices
2. **API Key Authentication** - For admins and integrations to access protected endpoints

Both systems coexist and are optional. All features work without authentication, but creating an account provides benefits like:
- Cross-device data synchronization
- Persistent game progress
- Session management across devices
- Personalization (themes, favorites, etc.)

---

## User Authentication

### How It Works

User authentication uses **JWT (JSON Web Tokens)** with **session tracking** in the database:

1. **Registration**: Users provide email + password → bcrypt hashed password stored → JWT token generated
2. **Login**: Email + password verified → New session created → JWT token returned
3. **Session Management**: Each login creates a session record with device info → Multiple devices supported
4. **Token Validation**: JWT verified against database session → Session expiry checked automatically
5. **Logout**: Session invalidated in database → Token becomes invalid

### Password Security

- **Hashing Algorithm**: bcrypt with 10 salt rounds
- **Password Requirements**: Minimum 8 characters
- **Storage**: Only password_hash stored, never plaintext
- **Password Change**: Invalidates all sessions (force re-login on all devices)

### JWT Token Details

- **Secret Key**: Configurable via `SEETHBOT_JWT_SECRET` environment variable
- **Default Expiry**: 30 days (`SEETHBOT_JWT_EXPIRY`)
- **Payload**: `{ userId, ts }` (ts = timestamp for uniqueness)
- **Session Tracking**: Tokens stored in `Session` table with device metadata

### Session Management

Sessions are tracked per-user with device metadata:

| Field | Description |
|-------|-------------|
| `id` | Unique session ID |
| `user_id` | User ID (foreign key) |
| `device_name` | Optional device name (e.g., "iPhone 15") |
| `device_type` | Optional device type (e.g., "mobile", "desktop") |
| `token` | Unique JWT token |
| `expires_at` | Expiration date (default 30 days from creation) |
| `created_at` | Session creation timestamp |
| `last_used_at` | Last activity timestamp |

**Session Behavior:**
- Sessions auto-extend: If 5+ minutes have passed, `last_used_at` and `expires_at` are updated
- Rolling expiry: Each activity extends the session by 30 days from now
- Multiple sessions per user: Track all active devices
- Delete individual sessions: Logout from specific device
- Delete all sessions: Logout from all devices

### User Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register new user account |
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/auth/me` | Yes | Get current user info |
| POST | `/api/auth/logout` | Yes | Logout current session |
| GET | `/api/auth/sessions` | Yes | List all active sessions |
| DELETE | `/api/auth/sessions/:id` | Yes | Delete specific session |
| DELETE | `/api/auth/sessions/all` | Yes | Delete all sessions |
| PATCH | `/api/auth/profile` | Yes | Update display name |
| PATCH | `/api/auth/avatar` | Yes | Update avatar URL |
| PATCH | `/api/auth/banner` | Yes | Update banner URL |
| PATCH | `/api/auth/bio` | Yes | Update bio |
| PATCH | `/api/auth/status` | Yes | Update status message |
| PATCH | `/api/auth/privacy` | Yes | Update privacy settings |
| PATCH | `/api/auth/password` | Yes | Change password |
| DELETE | `/api/auth/account` | Yes | Delete account |
| GET | `/api/profile/:id` | No | View public user profile |
| GET | `/api/auth/theme` | Yes | Get theme preferences |
| PUT | `/api/auth/theme` | Yes | Update theme preferences |

### Example: Registration

```bash
curl -X POST http://localhost:3010/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "displayName": "Cool User",
    "deviceName": "Chrome on macOS",
    "deviceType": "desktop"
  }'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "Cool User",
    "created_at": "2026-02-12T00:00:00.000Z",
    "updated_at": "2026-02-12T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Example: Login

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "deviceName": "iPhone 15",
    "deviceType": "mobile"
  }'
```

### Example: Authenticated Request

```bash
curl -X GET http://localhost:3010/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example: Change Password

```bash
curl -X PATCH http://localhost:3010/api/auth/password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "securePassword123",
    "newPassword": "newSecurePassword456"
  }'
```

### Middleware

Use the following middleware to protect routes:

**`requireAuth`** - Requires valid JWT token:
```typescript
import { requireAuth } from '../middleware/auth';

router.get('/protected', requireAuth, (req, res) => {
  res.json({ user: req.user, session: req.session });
});
```

**`optionalAuth`** - Attaches user if token present, doesn't require it:
```typescript
router.get('/public-data', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ message: 'Hello authenticated user', user: req.user });
  } else {
    res.json({ message: 'Hello anonymous user' });
  }
});
```

**`requireUserIdMatch`** - Ensures user can only access their own data:
```typescript
router.get('/users/:id', requireAuth, requireUserIdMatch, (req, res) => {
  // User can only access their own data here
  res.json({ user: req.user });
});
```

---

## API Key Authentication

### How It Works

API key authentication uses simple string-based keys for admin/integration access:

1. **Key Storage**: Keys stored in `SEETHBOT_API_KEYS` environment variable (comma-separated)
2. **Key Format**: 32-character random strings (e.g., `sk_abc123xyz...`)
3. **Key Types**: READ_ONLY, READ_WRITE, ADMIN
4. **Validation**: Keys checked against registered keys on each request
5. **Authorization Header**: Provide key via `X-API-Key` or `Authorization: Bearer <key>`

### API Key Types

| Type | Permissions |
|------|-------------|
| `READ_ONLY` | Can read data, cannot modify |
| `READ_WRITE` | Can read and write data |
| `ADMIN` | Full access to all endpoints |

### Default API Key

A default admin key is generated on server startup for development. **IMPORTANT: Set `SEETHBOT_API_KEYS` in production!**

```bash
# Example environment variable
SEETHBOT_API_KEYS=sk_prod_abc123...,sk_prod_xyz789...
```

### Using API Keys

**Via X-API-Key header:**
```bash
curl -X GET http://localhost:3010/api/rankings \
  -H "X-API-Key: sk_prod_abc123..."
```

**Via Authorization header:**
```bash
curl -X GET http://localhost:3010/api/rankings \
  -H "Authorization: Bearer sk_prod_abc123..."
```

### Middleware

Use the following middleware for API key authentication:

```typescript
import { requireApiKey, optionalApiKey, ApiKeyType } from '../auth';

// Require API key (default: READ_WRITE)
router.post('/admin/data', requireApiKey(), handler);

// Require specific permission level
router.delete('/admin/users/:id', requireApiKey(ApiKeyType.ADMIN), handler);

// Optional API key (tracks auth but doesn't require it)
router.get('/api/data', optionalApiKey, handler);
```

---

## Public vs Protected Endpoints

### Public Endpoints (No Authentication Required)

All **GET** endpoints are public by default:

- `GET /api/health` - Health check
- `GET /api/rankings` - Coolness rankings
- `GET /api/cats` - Random cat images
- `GET /api/movies` - Movie suggestions and voting
- `GET /api/stocks` - Stock market data
- `GET /api/stats` - Game statistics
- `GET /api/achievements` - Achievement data
- `GET /api/challenges` - Daily challenges
- `GET /api/characters` - Character data
- `GET /api/profile/:id` - Public user profiles

### Protected Endpoints (Authentication Required)

**User Auth Required:**
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/sessions` - List sessions
- `DELETE /api/auth/sessions/:id` - Delete session
- `DELETE /api/auth/sessions/all` - Delete all sessions
- `PATCH /api/auth/profile` - Update profile
- `PATCH /api/auth/password` - Change password
- `DELETE /api/auth/account` - Delete account
- `GET /api/auth/theme` - Get theme preferences
- `PUT /api/auth/theme` - Update theme preferences

**API Key Auth Required (Write Operations):**
- `POST /api/movies` - Add movie suggestion
- `DELETE /api/movies/:id` - Remove movie
- `PATCH /api/stocks` - Update stock data
- `POST /api/admin/*` - Admin operations

### Hybrid Endpoints (Optional Auth)

These endpoints work with or without authentication:

- `GET /api/stats` - Returns personal stats if authenticated, general stats if not
- `GET /api/achievements` - Returns user's achievements if authenticated, all achievements if not
- `GET /api/challenges` - Returns user's challenges if authenticated, general challenges if not

---

## Security Best Practices

### Environment Variables

**Required for Production:**

| Variable | Description | Default |
|----------|-------------|---------|
| `SEETHBOT_JWT_SECRET` | Secret key for JWT signing | `change-this-in-production-secret-key` |
| `SEETHBOT_API_KEYS` | Comma-separated admin API keys | (auto-generated in dev) |

**Optional:**

| Variable | Description | Default |
|----------|-------------|---------|
| `SEETHBOT_JWT_EXPIRY` | JWT token expiry time | `30d` |

### Password Security

- **bcrypt with 10 salt rounds** - Slow hashing prevents brute-force attacks
- **Minimum 8 characters** - Enforces password length
- **No plaintext storage** - Only password_hash stored
- **Password change invalidates sessions** - Prevents session hijacking after password change

### Session Security

- **Unique tokens per device** - Each login creates new token
- **Expiry checks** - Expired sessions automatically rejected
- **Auto-extension** - Active sessions extended automatically
- **Logout from all devices** - User can invalidate all sessions

### Rate Limiting

All API endpoints are rate-limited to prevent abuse:

- **Limit**: 10,000 requests per minute per IP
- **Headers**: Included in responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Note**: Rate limit is high to support real-time multiplayer game updates.

### Input Validation

All user inputs are validated and sanitized:

- **Email validation** - Must contain `@` symbol
- **Password validation** - Minimum 8 characters
- **String sanitization** - HTML tags stripped, special characters escaped
- **Length limits** - Prevents DoS attacks via large payloads
- **Type validation** - Numbers, arrays, etc. validated

### Security Headers

All API responses include security headers:

- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - Enables browser XSS filter

---

## Database Schema

### User Table

```prisma
model User {
  id               Int      @id @default(autoincrement())
  email            String   @unique
  password_hash    String
  display_name     String?
  avatar_url       String?
  banner_url       String?
  bio              String?
  status           String?
  show_email       Int      @default(1)
  show_joined_date Int      @default(1)
  is_deleted       Boolean  @default(false)
  discord_id       String?
  discord_username String?
  discord_discriminator String?
  discord_avatar   String?
  created_at       DateTime @default(now())
  updated_at       DateTime @default(now())

  sessions              Session[]
  messages              Message[]
  gameStats             GameStat[]
  highScores            HighScore[]
  dailyChallenges       DailyChallenge[]
  achievements           Achievement[]
  activities            Activity[]
  userPortfolios         UserPortfolio?
  userFartStats         UserFartStats?
  profile               Profile?
  favorites             Favorite[]
  reactions             Reaction[]
  theme                 Theme?
  characterMatches       CharacterMatch[]

  @@index([email])
}
```

### Session Table

```prisma
model Session {
  id          Int      @id @default(autoincrement())
  user_id     Int
  device_name String?
  device_type String?
  token       String   @unique
  expires_at  DateTime
  created_at  DateTime @default(now())
  last_used_at DateTime @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([user_id])
}
```

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `email` | String | User email (unique) |
| `password_hash` | String | bcrypt hashed password |
| `display_name` | String? | Optional display name |
| `show_email` | Int | Privacy flag (0 = hide, 1 = show) |
| `show_joined_date` | Int | Privacy flag (0 = hide, 1 = show) |
| `is_deleted` | Boolean | Soft delete flag |
| `token` | String | Unique JWT token |
| `device_name` | String? | Optional device name |
| `device_type` | String? | Optional device type |
| `expires_at` | DateTime | Session expiration date |
| `last_used_at` | DateTime | Last activity timestamp |

---

## Discord Integration

Users can link their Discord accounts for additional features:

- `POST /api/auth/discord/link` - Link Discord account
- `DELETE /api/auth/discord/unlink` - Unlink Discord account
- `GET /api/auth/discord` - Get linked Discord info

**Fields:**
- `discord_id` - Discord user ID
- `discord_username` - Discord username
- `discord_discriminator` - Discord discriminator (4-digit tag)
- `discord_avatar` - Discord avatar URL

---

## Testing Authentication

### Test Registration

```bash
curl -X POST http://localhost:3010/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

### Test Login

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

### Test Protected Endpoint

```bash
# First, login to get a token
TOKEN=$(curl -s -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}' \
  | jq -r '.token')

# Use the token to access protected endpoint
curl -X GET http://localhost:3010/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test API Key

```bash
# Get the default API key from server logs on startup
API_KEY="sk_..."

# Use API key to access protected endpoint
curl -X GET http://localhost:3010/api/rankings \
  -H "X-API-Key: $API_KEY"
```

---

## Common Issues

### "Authentication required" error

**Cause**: No JWT token provided in Authorization header.

**Fix**: Add `Authorization: Bearer <token>` header to request.

### "Invalid or expired token" error

**Cause**: Token is invalid, expired, or session was deleted.

**Fix**: Login again to get a new token.

### "Invalid API key" error

**Cause**: API key is not registered or invalid.

**Fix**: Check that API key is in `SEETHBOT_API_KEYS` environment variable.

### "Insufficient permissions" error

**Cause**: API key doesn't have required permission level.

**Fix**: Use API key with higher permission level (ADMIN instead of READ_ONLY).

### "Email already registered" error

**Cause**: User with this email already exists.

**Fix**: Use a different email or login with existing account.

---

## References

- **Architecture Decision**: docs/DECISIONS.md - Sections 5-8 (Authentication & Authorization)
- **Code**: backend/src/auth.ts - API key authentication
- **Code**: backend/src/users.ts - User authentication
- **Code**: backend/src/middleware/auth.ts - Authentication middleware
- **Code**: backend/src/controllers/auth.controller.ts - Auth endpoints
- **Schema**: backend/prisma/schema.prisma - Database schema
- **Testing**: backend/tests/auth.test.ts - Authentication tests

---

*Last Updated: 2026-02-12*
*Version: 1.0*
